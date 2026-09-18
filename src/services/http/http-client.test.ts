import { describe, expect, it, vi } from 'vitest';
import { createHttpClient, HttpError, type BrowserProofPort } from './http-client';

function proofPort(overrides: Partial<BrowserProofPort> = {}): BrowserProofPort {
  return {
    proofHeader: 'x-browser-proof',
    ttlHeader: 'x-browser-proof-ttl',
    getCached: () => 'cached-proof',
    prime: vi.fn(),
    refresh: vi.fn(async () => 'fresh-proof'),
    capture: vi.fn(),
    invalidate: vi.fn(),
    ...overrides
  };
}

describe('typed HTTP middleware pipeline', () => {
  it('reports genuine 429 limits without a proof provider and retries proof warmup limits with one', async () => {
    const response = () => Response.json({ error: 'rate_limited' }, { status: 429, headers: { 'retry-after': '12' } });
    const onRateLimit = vi.fn();
    await expect(createHttpClient({ fetcher: vi.fn(async () => response()), onRateLimit }).request('/search/query')).rejects.toMatchObject({ status: 429 });
    expect(onRateLimit).toHaveBeenCalledWith({ retryAfterSeconds: 12, url: '/search/query' });
    onRateLimit.mockClear();
    const fetcher = vi.fn().mockResolvedValueOnce(response()).mockResolvedValueOnce(Response.json({ ok: true }));
    const port = proofPort({ getCached: () => undefined });
    expect(await createHttpClient({ fetcher, browserProof: port, onRateLimit }).request('/search/query')).toEqual({ ok: true });
    expect(port.refresh).toHaveBeenCalledOnce(); expect(onRateLimit).not.toHaveBeenCalled();
  });
  it('blocks late manifest follow-ups before pagehide but allows a cancelled navigation', async () => {
    let resolve!: (response: Response) => void;
    const fetcher = vi.fn(() => new Promise<Response>(finish => resolve = finish));
    vi.stubGlobal('fetch', fetcher);
    const { appHttp } = await import('./app-http');
    const remove = vi.spyOn(window, 'removeEventListener');
    try {
      for (const cancelled of [false, true]) {
        window.dispatchEvent(new PageTransitionEvent('pageshow'));
        const manifest = appHttp.request('/resources/planner/manifest.json');
        const navigation = new Event('beforeunload', { cancelable: true });
        Object.defineProperty(navigation, 'returnValue', { value: '' });
        const stay = (event: Event) => event.preventDefault();
        if (cancelled) window.addEventListener('beforeunload', stay, { once: true });
        window.dispatchEvent(navigation);
        resolve(new Response('{}')); await manifest;
        const followUp = appHttp.request('/resources/planner/rewards.json');
        if (cancelled) { resolve(new Response('{}')); await expect(followUp).resolves.toEqual({}); }
        else await expect(followUp).rejects.toMatchObject({ name: 'AbortError' });
      }
      expect(fetcher).toHaveBeenCalledTimes(3);
      expect(remove).toHaveBeenCalledWith('beforeunload', expect.any(Function));
      // No pending request means no listener that could disable the idle BFCache.
      window.dispatchEvent(new Event('beforeunload'));
      const idle = appHttp.request('/resources/after-idle.json');
      resolve(new Response('{}')); await expect(idle).resolves.toEqual({});
    } finally {
      window.dispatchEvent(new PageTransitionEvent('pageshow'));
      remove.mockRestore(); vi.unstubAllGlobals();
    }
  });

  it('stops follow-up requests on pagehide and resumes after a back/forward restore', async () => {
    const fetcher = vi.fn(async () => new Response('{"ok":true}'));
    vi.stubGlobal('fetch', fetcher);
    const { appHttp } = await import('./app-http');
    try {
      await expect(appHttp.request('/resources/first.json')).resolves.toEqual({ ok: true });
      window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
      await expect(appHttp.request('/resources/follow-up.json')).rejects.toMatchObject({ name: 'AbortError' });
      expect(fetcher).toHaveBeenCalledOnce();
      window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
      await expect(appHttp.request('/resources/follow-up.json')).resolves.toEqual({ ok: true });
      expect(fetcher).toHaveBeenCalledTimes(2);
    } finally {
      window.dispatchEvent(new PageTransitionEvent('pageshow'));
      vi.unstubAllGlobals();
    }
  });

  it('does not retry a transport cancelled by document navigation', async () => {
    const error = new DOMException('Page navigation cancelled the request.', 'AbortError');
    const fetcher = vi.fn().mockRejectedValue(error);
    const client = createHttpClient({ fetcher, retryCount: 3 });
    await expect(client.request('/resources/planner/manifest.json')).rejects.toBe(error);
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('combines cookieless defaults, auth, and browser proof for own API calls', async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    const client = createHttpClient({ baseUrl: 'https://api.uma.moe', fetcher: fetcher as typeof fetch, getAuthToken: () => 'token', browserProof: proofPort() });
    await expect(client.request('/api/me')).resolves.toEqual({ ok: true });
    const init = fetcher.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(init.credentials).toBe('omit');
    expect(headers.get('authorization')).toBe('Bearer token');
    expect(headers.get('x-browser-proof')).toBe('cached-proof');
  });

  it('refreshes proof once for a typed proof rejection', async () => {
    const port = proofPort();
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'browser_proof_required' }), { status: 403, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }));
    const client = createHttpClient({ fetcher: fetcher as typeof fetch, browserProof: port });
    await expect(client.request('/api/data')).resolves.toEqual({ ok: true });
    expect(port.invalidate).toHaveBeenCalledWith('cached-proof');
    expect(port.refresh).toHaveBeenCalledOnce();
    expect(new Headers(fetcher.mock.calls[1]?.[1]?.headers).get('x-browser-proof')).toBe('fresh-proof');
  });

  it('retries an idempotent transient response and reports terminal rate limits', async () => {
    const onRateLimit = vi.fn();
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'rate_limited' }), { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '12' } }));
    const client = createHttpClient({ fetcher: fetcher as typeof fetch, browserProof: proofPort(), onRateLimit, retryCount: 1 });
    await expect(client.request('/api/data')).rejects.toBeInstanceOf(HttpError);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(onRateLimit).toHaveBeenCalledWith({ retryAfterSeconds: 12, url: '/api/data' });
  });

  it('reports an unrecoverable warmup limit without a proof provider and clears auth only for auth endpoints', async () => {
    const onRateLimit = vi.fn();
    const onUnauthorized = vi.fn();
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'browser_proof_warmup_exhausted' }), { status: 429, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'unauthorized' }), { status: 401, headers: { 'content-type': 'application/json' } }));
    const client = createHttpClient({ fetcher: fetcher as typeof fetch, onRateLimit, onUnauthorized });
    await expect(client.request('/api/data')).rejects.toBeInstanceOf(HttpError);
    await expect(client.request('/api/auth/me')).rejects.toBeInstanceOf(HttpError);
    expect(onRateLimit).toHaveBeenCalledWith({ retryAfterSeconds: 60, url: '/api/data' });
    expect(onUnauthorized).toHaveBeenCalledWith('/api/auth/me');
  });

  it('supports explicit text and binary response contracts', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response('plain text'))
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3])));
    const client = createHttpClient({ fetcher: fetcher as typeof fetch });
    await expect(client.request('/notes.txt', { responseType: 'text' })).resolves.toBe('plain text');
    const result = await client.request<ArrayBuffer>('/resources/data', { responseType: 'arrayBuffer' });
    expect([...new Uint8Array(result)]).toEqual([1, 2, 3]);
  });

  it('protects public resource artifacts without attaching account authorization', async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => new Response(JSON.stringify({ ok: true })));
    const client = createHttpClient({ fetcher: fetcher as typeof fetch, getAuthToken: () => 'private-token', browserProof: proofPort() });
    await client.request('/resources/planner/manifest.json', { browserProof: true });
    const init = fetcher.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(init.credentials).toBe('omit');
    expect(headers.get('x-browser-proof')).toBe('cached-proof');
    expect(headers.has('authorization')).toBe(false);
  });
});

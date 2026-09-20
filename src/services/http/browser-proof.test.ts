import { afterEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
vi.mock('../runtime-config', () => ({ runtimeConfig: { providersEnabled: true, siteKey: 'test-site-key' } }));
afterEach(() => { delete window.turnstile; document.querySelectorAll('[id^="cf-turnstile"],dialog').forEach(node => node.remove()); vi.restoreAllMocks(); localStorage.clear(); vi.unstubAllGlobals(); vi.useRealTimers(); vi.resetModules(); });
it('uses configured beta verification, shares a challenge, exchanges and caches proof without cookies', async () => {
  let callback!: (token: string) => void;
  const dialog = document.createElement('dialog'); dialog.open = true; document.body.append(dialog);
  window.turnstile = { render: vi.fn((container, options) => { expect(container.parentElement).toBe(dialog); expect(container.hidden).toBe(false); expect(options.execution).toBe('execute'); expect(options.sitekey).toBe('test-site-key'); expect(options.retry).toBe('never'); expect(options['refresh-expired']).toBe('never'); expect(options).not.toHaveProperty('refresh-timeout'); callback = options.callback; return 'widget'; }), execute: vi.fn(() => queueMicrotask(() => callback('challenge'))), remove: vi.fn() };
  const fetcher = vi.fn(async () => new Response(null, { headers: { 'X-Browser-Proof': 'proof', 'X-Browser-Proof-TTL': '60' } })); vi.stubGlobal('fetch', fetcher);
  const { browserProofPort: port, browserVerification } = await import('./browser-proof');
  const first = port!.refresh(); expect(port!.refresh()).toBe(first); expect(port!.refresh(true)).toBe(first);
  await expect(first).resolves.toBe('proof');
  expect(fetcher).toHaveBeenCalledWith('/api/auth/browser-proof', expect.objectContaining({ credentials: 'omit', headers: expect.objectContaining({ 'X-Turnstile-Token': 'challenge' }) }));
  expect(port!.getCached()).toBe('proof'); expect(window.turnstile.remove).toHaveBeenCalledWith('widget');
  expect(get(browserVerification)).toEqual({ pending: false, error: '' });
  port!.prime(); await Promise.resolve(); expect(window.turnstile.render).toHaveBeenCalledOnce();
  port!.invalidate('old'); expect(port!.getCached()).toBe('proof'); port!.invalidate('proof'); expect(port!.getCached()).toBeUndefined();
});
it('times out a blocked script once and retries only when explicitly requested', async () => {
  vi.useFakeTimers();
  const { browserProofPort: port, browserVerification } = await import('./browser-proof');
  const task = port!.refresh();
  const failure = expect(task).rejects.toThrow('could not load');
  await vi.advanceTimersByTimeAsync(15_000); await failure;
  expect(document.getElementById('cf-turnstile-api')).toBeNull(); expect(get(browserVerification).error).toContain('could not load');
  for (let i = 0; i < 3; i++) { port!.prime(); expect(port!.refresh()).toBe(task); }
  expect(document.getElementById('cf-turnstile-api')).toBeNull();
  const retry = expect(port!.refresh(true)).rejects.toThrow('could not load');
  expect(document.getElementById('cf-turnstile-api')).not.toBeNull();
  document.getElementById('cf-turnstile-api')!.dispatchEvent(new Event('error')); await retry;
});

it('reuses server proof after reload, observes other tabs and respects expiry and rejection', async () => {
  vi.useFakeTimers();
  const { browserProofPort: first } = await import('./browser-proof');
  first!.capture('server-proof', 60);
  vi.resetModules();
  const { browserProofPort: reloaded } = await import('./browser-proof');
  expect(reloaded!.getCached()).toBe('server-proof');
  reloaded!.prime();
  expect(document.getElementById('cf-turnstile-api')).toBeNull();
  first!.capture('newer-proof', 60);
  reloaded!.invalidate('server-proof');
  expect(reloaded!.getCached()).toBe('newer-proof');
  await vi.advanceTimersByTimeAsync(55_000);
  expect(reloaded!.getCached()).toBeUndefined();
  first!.capture('replacement', 60);
  reloaded!.invalidate('replacement');
  expect(first!.getCached()).toBeUndefined();
});

it('rejects malformed stored proofs and supports browsers with storage disabled', async () => {
  const { browserProofPort: port } = await import('./browser-proof');
  localStorage.setItem('uma-browser-proof-v1', '{');
  expect(port!.getCached()).toBeUndefined();
  localStorage.setItem('uma-browser-proof-v1', JSON.stringify({ token: 42, expiresAt: 'tomorrow' }));
  expect(port!.getCached()).toBeUndefined();
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('blocked'); });
  port!.capture('memory-proof', 60);
  expect(port!.getCached()).toBe('memory-proof');
  port!.invalidate('memory-proof');
  expect(port!.getCached()).toBeUndefined();
});

it.each(['error-callback', 'expired-callback', 'timeout-callback', 'unsupported-callback'] as const)('cleans up %s and recovers through explicit verification', async callbackName => {
  let options!: Parameters<NonNullable<Window['turnstile']>['render']>[1];
  window.turnstile = {
    render: vi.fn((_container, value) => { options = value; return 'widget'; }),
    execute: vi.fn(() => queueMicrotask(() => {
      if (callbackName === 'error-callback') expect(options[callbackName]('600010')).toBe(true);
      else options[callbackName]();
    })),
    remove: vi.fn()
  };
  const fetcher = vi.fn(async () => new Response(null, { headers: { 'X-Browser-Proof': 'recovered', 'X-Browser-Proof-TTL': '60' } }));
  vi.stubGlobal('fetch', fetcher);
  const { browserProofPort: port, browserVerification } = await import('./browser-proof');
  const task = port!.refresh(); await expect(task).rejects.toThrow();
  if (callbackName === 'error-callback') expect(get(browserVerification).error).toContain('(600010). Retry verification.');
  expect(document.querySelector('[id^="cf-turnstile-api-proof-"]')).toBeNull();
  expect(window.turnstile.remove).toHaveBeenCalledOnce();
  expect(fetcher).not.toHaveBeenCalled();
  port!.prime(); expect(port!.refresh()).toBe(task);
  expect(window.turnstile.render).toHaveBeenCalledOnce();
  window.turnstile.execute = vi.fn(() => queueMicrotask(() => options.callback('challenge')));
  await expect(port!.refresh(true)).resolves.toBe('recovered');
  expect(port!.getCached()).toBe('recovered');
  expect(get(browserVerification)).toEqual({ pending: false, error: '' });
});

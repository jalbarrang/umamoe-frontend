import { createHttpClient, type HttpRequestOptions } from './http-client';
import { clearAuthToken, getAuthToken } from '../auth/auth-token';
import { browserProofPort } from './browser-proof';

// Safari rejects new fetches between beforeunload and pagehide, even if their
// rejections are caught. A late manifest must not start requests in that gap.
let pageActive = true;
let pendingRequests = 0;
function departing(event: BeforeUnloadEvent): void {
  pageActive = false;
  // Another handler may ask the user to stay. Do not freeze that document.
  queueMicrotask(() => { if (event.defaultPrevented || event.returnValue) pageActive = true; });
}
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => pageActive = false);
  window.addEventListener('pageshow', () => pageActive = true);
}

/** One HTTP entry point for product repositories. Auth and browser-proof ports can be
 * attached here without reintroducing feature-specific interceptors. */
const client = createHttpClient({
  baseUrl: '',
  fetcher: (url, init) => pageActive ? fetch(url, init) : Promise.reject(new DOMException('Page navigation cancelled the request.', 'AbortError')),
  getAuthToken,
  browserProof: browserProofPort,
  onUnauthorized: clearAuthToken,
  onRateLimit: (notice) => window.dispatchEvent(new CustomEvent('uma:rate-limit', { detail: notice }))
});

export const appHttp = {
  async request<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    // Listen only during requests: an idle page retains its back/forward cache
    // eligibility in browsers that disallow permanent beforeunload listeners.
    if (++pendingRequests === 1 && typeof window !== 'undefined') window.addEventListener('beforeunload', departing);
    try { return await client.request<T>(path, options); }
    finally {
      if (--pendingRequests === 0 && typeof window !== 'undefined') window.removeEventListener('beforeunload', departing);
    }
  }
};

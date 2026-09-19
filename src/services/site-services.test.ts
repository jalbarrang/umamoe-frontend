import { afterEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { availableVersion, serviceStatus, startSiteServices } from './site-services';

let stop: (() => void) | undefined;
afterEach(() => { stop?.(); document.head.innerHTML = ''; vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
it('polls status and builds only while visible, deduplicates focus checks, and cleans up', async () => {
  vi.useFakeTimers();
  document.head.innerHTML = '<meta name="app-build-version" content="2.0.371">';
  history.replaceState(null, '', '/database?mode=uql&__uma_version=old#filters');
  let hidden = false;
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  const fetcher = vi.fn(async (url: string) => Response.json(url.startsWith('/version') ? { version: '2.0.372' } : [{ name: 'API', group: 'Global', results: [{ success: false }, { success: true }] }, { name: 'Search', results: [{ success: false }] }]));
  vi.stubGlobal('fetch', fetcher);
  stop = startSiteServices(); await vi.advanceTimersByTimeAsync(1);
  expect(get(serviceStatus)).toMatchObject({ state: 'degraded', endpoints: [{ name: 'API', healthy: true }, { name: 'Search', healthy: false }] });
  expect(get(availableVersion)).toBe('2.0.372');
  expect(location.href).toContain('/database?mode=uql#filters');
  window.dispatchEvent(new Event('focus')); expect(fetcher).toHaveBeenCalledTimes(2);
  hidden = true; await vi.advanceTimersByTimeAsync(300_000); expect(fetcher).toHaveBeenCalledTimes(2);
  hidden = false; document.dispatchEvent(new Event('visibilitychange')); await vi.advanceTimersByTimeAsync(1);
  expect(fetcher).toHaveBeenCalledTimes(4);
  stop(); await vi.advanceTimersByTimeAsync(300_000); expect(fetcher).toHaveBeenCalledTimes(4);
});
it('keeps unreachable status neutral and skips local build checks', async () => {
  vi.useFakeTimers(); vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  stop = startSiteServices(); await vi.advanceTimersByTimeAsync(1);
  expect(get(serviceStatus)).toEqual({ state: 'loading', endpoints: [] });
  expect(fetch).toHaveBeenCalledTimes(1);
});

import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
const http = vi.hoisted(() => vi.fn());
vi.mock('../../services/http/app-http', () => ({ appHttp: { request: http } }));
vi.mock('../../lib/catalog/support-card-catalog', () => ({ loadSupportCardRarities: async () => new Map() }));
import { plannerResourceRepository as repository, plannerUsingCache } from './planner-resource-repository';
const saved = new Map<string, Response>();
beforeEach(() => { repository.invalidate(); http.mockReset(); saved.clear(); vi.stubGlobal('caches', { open: async (name: string) => { expect(name).toBe('umamoe-carat-planner-v2'); return { match: async (url: string) => saved.get(url)?.clone(), put: async (url: string, response: Response) => { saved.set(url, response); } }; } }); });
afterEach(() => { repository.invalidate(); vi.unstubAllGlobals(); vi.useRealTimers(); });
it('resolves relative protected artifacts, caches parsed successes, and recovers Angular offline data', async () => {
  http.mockImplementation(async url => Response.json(url.includes('manifest') ? { files: { 'planner_core.json': 'v2/planner_core.json' } } : { jewel_cost_per_pull: 150 }));
  expect(await repository.core()).toEqual({ jewel_cost_per_pull: 150 });
  expect(http).toHaveBeenCalledWith('/resources/planner/v2/planner_core.json', expect.objectContaining({ browserProof: true }));
  repository.invalidate(); http.mockRejectedValue(new Error('offline'));
  expect(await repository.core()).toEqual({ jewel_cost_per_pull: 150 }); expect(get(plannerUsingCache)).toBe(true);
  repository.invalidate(); http.mockImplementation(async url => Response.json(url.includes('manifest') ? { files: { 'planner_core.json': 'planner/v3/planner_core.json' } } : { jewel_cost_per_pull: 160 }));
  expect(await repository.core()).toEqual({ jewel_cost_per_pull: 160 }); expect(get(plannerUsingCache)).toBe(false);
});
it('refreshes rewards when their manifest hash changes without replacing saved choices', async () => {
  vi.useFakeTimers(); let version = 'one';
  http.mockImplementation(async url => Response.json(url.includes('manifest') ? { files: { 'planner_rewards.json': { path: 'planner_rewards.json', sha256: version } } } : { rewards: [{ id: version, amount: 100 }] }));
  await repository.rewards(); const listener = vi.fn(); const stop = repository.watchRewards(listener);
  try {
    version = 'two'; await vi.advanceTimersByTimeAsync(60_000);
    expect(listener).toHaveBeenCalledOnce(); expect(listener.mock.calls[0]![0].rewards[0].id).toBe('two');
    expect(http).toHaveBeenCalledWith('/resources/planner/planner_rewards.json?v=two', expect.anything());
    stop(); const count = http.mock.calls.length; await vi.advanceTimersByTimeAsync(60_000); expect(http).toHaveBeenCalledTimes(count);
  } finally { stop(); }
});

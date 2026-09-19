import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fuseAllowed, insertFuseScript, fuseScriptUrl } from './fuse-bootstrap';

vi.mock('@/services/runtime-config', () => ({ runtimeConfig: { providersEnabled: true } }));
beforeEach(() => { vi.resetModules(); vi.useFakeTimers(); history.replaceState(null, '', '/database'); });
afterEach(() => {
  vi.clearAllTimers(); vi.useRealTimers(); localStorage.clear();
  document.head.innerHTML = ''; document.body.innerHTML = ''; delete window.fusetag;
});

function zone(id: string) {
  const element = document.createElement('div'); element.id = id; document.body.append(element); return element;
}

it('runs the early head loader once while honoring provider mode and stored opt-outs', () => {
  expect(fuseAllowed(false)).toBe(false);
  localStorage.setItem('cookie-consent', JSON.stringify({ advertising: false }));
  expect(fuseAllowed(true)).toBe(false);
  localStorage.clear(); history.replaceState(null, '', '/database?ads_enabled=off');
  expect(fuseAllowed(true)).toBe(false);
  history.replaceState(null, '', '/database'); expect(fuseAllowed(true)).toBe(false);
  localStorage.clear(); expect(fuseAllowed(true)).toBe(true);
  // Vite emits these self-contained functions before the SPA module script.
  new Function(`if((${fuseAllowed.toString()})(true))(${insertFuseScript.toString()})(${JSON.stringify(fuseScriptUrl)});`)();
  const script = insertFuseScript(fuseScriptUrl);
  expect(document.querySelectorAll('#publift-fuse-js')).toHaveLength(1);
  expect(document.head.firstElementChild).toBe(script);
  expect(script.async).toBe(true);
  history.replaceState(null, '', '/ui'); expect(fuseAllowed(true)).toBe(false);
});

it('does not repeatedly retry blocked ad scripts', async () => {
  const { loadFuse } = await import('./fuse-ads');
  const task = loadFuse();
  const script = document.getElementById('publift-fuse-js')!;
  script.dispatchEvent(new Event('error'));
  expect(await task).toBe(false);
  expect(await loadFuse()).toBe(false);
  expect(document.querySelectorAll('#publift-fuse-js')).toHaveLength(1);
});

it('waits for a slow provider to drain its ready queue without a polling timeout', async () => {
  const { loadFuse } = await import('./fuse-ads');
  const task = loadFuse();
  expect(loadFuse()).toBe(task);
  await vi.advanceTimersByTimeAsync(5000);
  Object.assign(window.fusetag!, { pageInit: vi.fn(), registerZone: vi.fn() });
  window.fusetag!.que!.forEach(ready => ready());
  expect(await task).toBe(true);
});

it('initializes each route before registration, destroys removed zones, and never restarts auctions on resize', async () => {
  const calls: string[] = [];
  window.fusetag = { pageInit: () => calls.push('page'), registerZone: id => calls.push(`register:${id}`), destroyZone: id => calls.push(`destroy:${id}`) };
  const { registerFuseZone, syncFusePage } = await import('./fuse-ads');
  zone('inline-1'); zone('inline-2');
  const removeFirst = registerFuseZone('inline-1', 'slot-1');
  const removeSecond = registerFuseZone('inline-2', 'slot-2');
  await vi.advanceTimersByTimeAsync(40);
  expect(calls).toEqual(['page', 'register:inline-1', 'register:inline-2']);
  removeFirst(); removeSecond();
  const removeResized = registerFuseZone('inline-1', 'slot-1');
  await vi.advanceTimersByTimeAsync(40);
  expect(calls.filter(call => call === 'page')).toHaveLength(1);
  expect(calls).toContain('destroy:inline-1'); expect(calls).toContain('destroy:inline-2');
  removeResized(); document.body.innerHTML = '';
  history.replaceState(null, '', '/circles'); syncFusePage(); zone('club-1'); registerFuseZone('club-1', 'slot-1');
  await vi.advanceTimersByTimeAsync(40);
  expect(calls.slice(-2)).toEqual(['page', 'register:club-1']);
});

it('prevents two active zones sharing a publisher slot and skips unmounted pending zones', async () => {
  const registerZone = vi.fn();
  window.fusetag = { pageInit: vi.fn(), registerZone, destroyZone: vi.fn() };
  const { registerFuseZone } = await import('./fuse-ads');
  zone('first'); zone('duplicate'); zone('unmounted');
  const removeFirst = registerFuseZone('first', 'one-slot');
  registerFuseZone('duplicate', 'one-slot');
  registerFuseZone('unmounted', 'other-slot')();
  await vi.advanceTimersByTimeAsync(40);
  expect(registerZone.mock.calls).toEqual([['first']]);
  expect(document.getElementById('duplicate')!.dataset.fuse).toBeUndefined();
  removeFirst(); await vi.advanceTimersByTimeAsync(40);
  expect(document.getElementById('first')!.dataset.fuse).toBeUndefined();
  expect(registerZone.mock.calls).toEqual([['first'], ['duplicate']]);
});

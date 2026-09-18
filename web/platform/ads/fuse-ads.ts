import { runtimeConfig } from '../runtime-config';

interface FuseTag {
  que?: unknown[];
  registerZone?: (elementId: string) => void;
  pageInit?: (options?: { blockingFuseIds?: string[]; blockingTimeout?: number }) => void;
}

interface PrivacyRuntime extends Window {
  __tcfapi?: (command: string, version: number, callback: () => void) => void;
  __gpp?: (command: string) => void;
  __uspapi?: (command: string, version: number, callback: () => void) => void;
}

declare global {
  interface Window { fusetag?: FuseTag; }
}

const scriptId = 'publift-fuse-js';
const scriptUrl = 'https://cdn.fuseplatform.net/publift/tags/2/4302/fuse.js';
const pending = new Map<string, string>();
const registered = new Map<string, HTMLElement>();
let startTask: Promise<void> | undefined;
let pageInitTimer: number | undefined;

export function fuseEnabled(): boolean {
  if (typeof window === 'undefined' || !runtimeConfig.providersEnabled) return false;
  try {
    const params = new URLSearchParams(location.search);
    for (const key of ['fuse', 'fuse_enabled', 'ads_enabled']) {
      const value = params.get(key)?.toLowerCase();
      if (value && ['true', '1', 'on', 'false', '0', 'off'].includes(value)) localStorage.setItem('umamoe-fuse-enabled-v1', String(['true', '1', 'on'].includes(value)));
    }
    return localStorage.getItem('umamoe-fuse-enabled-v1') !== 'false' && JSON.parse(localStorage.getItem('cookie-consent') ?? 'null')?.advertising !== false;
  } catch { return true; }
}

function apiReady(): boolean {
  return typeof window.fusetag?.registerZone === 'function' && typeof window.fusetag?.pageInit === 'function';
}

function waitForApi(timeoutMs = 2400): Promise<void> {
  if (apiReady()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const timer = window.setInterval(() => {
      if (apiReady()) { window.clearInterval(timer); resolve(); }
      else if (performance.now() - started >= timeoutMs) { window.clearInterval(timer); reject(new Error('Publift Fuse API did not initialize.')); }
    }, 40);
  });
}

export function loadFuse(): Promise<void> {
  if (!fuseEnabled()) return Promise.resolve();
  if (startTask) return startTask;
  startTask = new Promise<void>((resolve, reject) => {
    window.fusetag ??= { que: [] };
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) { void waitForApi().then(resolve, reject); return; }
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = scriptUrl;
    script.onload = () => { void waitForApi().then(resolve, reject); };
    script.onerror = () => reject(new Error('Publift Fuse script failed to load.'));
    document.head.append(script);
  }).catch((error) => {
    startTask = undefined;
    console.warn(error);
  });
  return startTask;
}

function schedulePageInit(): void {
  if (!fuseEnabled()) return;
  if (pageInitTimer !== undefined) window.clearTimeout(pageInitTimer);
  pageInitTimer = window.setTimeout(() => {
    pageInitTimer = undefined;
    const blockingFuseIds = [...new Set(pending.values())];
    for (const [elementId, fuseId] of pending) {
      const element = document.getElementById(elementId);
      if (!element?.isConnected || registered.get(elementId) === element) continue;
      window.fusetag?.registerZone?.(elementId);
      registered.set(elementId, element);
      element.dataset.fuse = fuseId;
    }
    window.fusetag?.pageInit?.(blockingFuseIds.length ? { blockingFuseIds, blockingTimeout: 2000 } : undefined);
  }, 30);
}

export function registerFuseZone(elementId: string, fuseId: string): () => void {
  if (!fuseEnabled() || !elementId || !fuseId) return () => undefined;
  pending.set(elementId, fuseId);
  const begin = () => { void loadFuse().then(schedulePageInit); };
  const idle = (window as Window & { requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number }).requestIdleCallback;
  if (idle) idle.call(window, begin, { timeout: 1600 });
  else globalThis.setTimeout(begin, 1);
  return () => { pending.delete(elementId); registered.delete(elementId); };
}

export function openFusePrivacyControls(): boolean {
  if (typeof window === 'undefined') return false;
  const runtime = window as PrivacyRuntime;
  if (runtime.__tcfapi) { runtime.__tcfapi('displayConsentUi', 2, () => undefined); return true; }
  if (runtime.__gpp) { runtime.__gpp('showConsentManager'); return true; }
  if (runtime.__uspapi) { runtime.__uspapi('showConsentUi', 1, () => undefined); return true; }
  return false;
}

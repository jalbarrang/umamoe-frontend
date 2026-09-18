import { QueryCache } from '@/services/data/query-cache';
import { pageFetch, withPageRequest } from '@/services/http/page-request';
import { parseJsonResponse } from './json-asset';

type ManifestEntry = string | { name?: string; path?: string; current_path?: string; currentPath?: string; url?: string; href?: string; sha256?: string; current_sha256?: string; hash?: string };
interface ResourceManifest {
  version?: string;
  resource_version?: string;
  current_version?: string;
  master_version?: string;
  files?: Record<string, ManifestEntry> | ManifestEntry[];
  artifacts?: Record<string, ManifestEntry> | ManifestEntry[];
  resources?: Record<string, ManifestEntry> | ManifestEntry[];
  paths?: Record<string, ManifestEntry> | ManifestEntry[];
  entries?: Record<string, ManifestEntry> | ManifestEntry[];
}

const cache = new QueryCache();
const baseUrl = '/resources';
const cachePrefix = 'umamoe-resource-data-';
const metaPrefix = 'umamoe_resource_meta_v1:';
const requests = new Map<string, symbol>();
const writes = new Map<string, Promise<void>>();

async function cacheResponse(name: string, url: string, manifest: ResourceManifest, fingerprint: string | undefined, response: Response): Promise<void> {
  if (typeof caches === 'undefined') return;
  try {
    const version = manifest.version ?? manifest.resource_version ?? manifest.current_version ?? manifest.master_version ?? 'current';
    const cacheName = `${cachePrefix}${version}`;
    await (await caches.open(cacheName)).put(url, response);
    localStorage.setItem(`${metaPrefix}${name}`, JSON.stringify({ url, version, cacheName, cachedAt: Date.now(), fingerprint }));
  } catch { /* Cache quota/privacy failures must not discard a successful resource response. */ }
}

function entryPath(entry?: ManifestEntry): string | undefined {
  return typeof entry === 'string' ? entry : entry?.current_path ?? entry?.currentPath ?? entry?.url ?? entry?.href ?? entry?.path;
}
function entryFingerprint(entry?: ManifestEntry): string | undefined {
  return typeof entry === 'object' ? entry.current_sha256 ?? entry.sha256 ?? entry.hash : undefined;
}
function resolve(name: string, manifest: ResourceManifest, allowUnpublished = false): { url: string; fingerprint?: string } | undefined {
  const candidates = [name, `${name}.json`, `${name}.json.gz`];
  const containers = [manifest.files, manifest.artifacts, manifest.resources, manifest.paths, manifest.entries];
  for (const container of containers) {
    if (!container) continue;
    if (Array.isArray(container)) {
      for (const entry of container) {
        const path = entryPath(entry);
        const filename = path?.split(/[?#]/)[0]?.split('/').at(-1);
        if (path && ((typeof entry === 'object' && entry.name && candidates.includes(entry.name)) || (filename && candidates.includes(filename)))) return { url: absolute(path), fingerprint: entryFingerprint(entry) };
      }
    } else {
      for (const candidate of candidates) {
        const entry = container[candidate];
        const path = entryPath(entry);
        if (path) return { url: absolute(path), fingerprint: entryFingerprint(entry) };
      }
    }
  }
  if (allowUnpublished && containers.some(container => container && Object.keys(container).length > 0)) return undefined;
  const version = manifest.version ?? manifest.resource_version ?? manifest.current_version ?? manifest.master_version;
  if (!version && allowUnpublished) return undefined;
  if (!version) throw new Error(`Resource ${name} is absent from the manifest.`);
  return { url: `${baseUrl}/${version}/${name}.json.gz` };
}
function absolute(path: string): string {
  if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
  return `${baseUrl}/${path.replace(/^\/+/, '')}`;
}
export const resourceRepository = {
  async readCached<T>(name: string): Promise<T | undefined> {
    if (typeof caches === 'undefined') return undefined;
    try {
      await writes.get(name);
      const meta = JSON.parse(localStorage.getItem(`${metaPrefix}${name}`) ?? 'null');
      if (typeof meta?.url !== 'string' || typeof meta.cacheName !== 'string' || !meta.cacheName.startsWith(cachePrefix)) return undefined;
      const response = await (await caches.open(meta.cacheName)).match(meta.url);
      return response ? await parseJsonResponse<T>(response, meta.url) : undefined;
    } catch { return undefined; }
  },
  async load<T>(name: string, refresh = false, decode: (data: unknown) => T = data => data as T, unpublished?: () => T): Promise<T> {
    return cache.get(`resource:${name}`, 24 * 60 * 60 * 1000, () => withPageRequest(async () => {
      const request = Symbol(name);
      requests.set(name, request);
      const manifestResponse = await pageFetch(`${baseUrl}/manifest.json`, { cache: 'no-cache', credentials: 'omit' });
      if (!manifestResponse.ok) throw new Error(`Resource manifest returned ${manifestResponse.status}.`);
      const manifest = await manifestResponse.json() as ResourceManifest;
      const resource = resolve(name, manifest, Boolean(unpublished));
      if (!resource) return unpublished!();
      const url = resource.fingerprint ? `${resource.url}${resource.url.includes('?') ? '&' : '?'}v=${encodeURIComponent(resource.fingerprint)}` : resource.url;
      const response = await pageFetch(url, { credentials: 'omit', cache: refresh ? 'reload' : 'default' });
      const copy = response.clone();
      const data = decode(await parseJsonResponse<unknown>(response, url));
      // Serialize persistent writes too, so a slow older refresh cannot replace newer data.
      const write = (writes.get(name) ?? Promise.resolve()).then(async () => {
        if (requests.get(name) === request) await cacheResponse(name, url, manifest, resource.fingerprint, copy);
      });
      writes.set(name, write);
      // Persistence is best effort; rendering fresh data must not wait for disk I/O.
      void write.finally(() => { if (writes.get(name) === write) writes.delete(name); });
      return data;
    }), refresh);
  },
  invalidate(name?: string): void { cache.invalidate(name ? `resource:${name}` : 'resource:'); if (name) requests.delete(name); else requests.clear(); }
};

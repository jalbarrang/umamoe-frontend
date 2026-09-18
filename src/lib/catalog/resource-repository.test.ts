import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { resourceRepository } from './resource-repository';
import { loadLiveSupportCards, readCachedSupportCards } from './support-card-catalog';

const responses = new Map<string, Response>();
beforeEach(() => {
  vi.stubGlobal('Blob', NodeBlob);
  resourceRepository.invalidate(); responses.clear(); localStorage.clear();
  vi.stubGlobal('caches', {open: async (name: string) => ({
    match: async (url: string) => responses.get(`${name}:${url}`)?.clone(),
    put: async (url: string, response: Response) => { responses.set(`${name}:${url}`, response.clone()); },
  })});
});
afterEach(() => { resourceRepository.invalidate(); vi.unstubAllGlobals(); window.dispatchEvent(new Event('pageshow')); });

it('does not start catalog requests after navigation while a manifest was loading', async () => {
  let release!: (response: Response) => void;
  const fetch = vi.fn(() => new Promise<Response>(resolve => release = resolve));
  vi.stubGlobal('fetch', fetch);
  const loading = resourceRepository.load('skills');
  const departure = new Event('beforeunload');
  Object.defineProperty(departure, 'returnValue', { value: '' }); // BeforeUnloadEvent uses a string, unlike Event.
  window.dispatchEvent(departure);
  release(Response.json({ version: 'test' }));
  await expect(loading).rejects.toMatchObject({ name: 'AbortError' });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it('matches exact artifact names instead of confusing skills with simulator_skills', async () => {
  const fetch = vi.fn(async (url: string) => Response.json(url.endsWith('manifest.json') ? {
    artifacts: [
      { name: 'simulator_skills.json', path: '/resources/test/simulator_skills.json.gz' },
      { name: 'skills.json', path: '/resources/test/skills.json.gz' },
      '/resources/test/character_names.json?locale=en'
    ]
  } : [{ name: 'Correct resource' }]));
  vi.stubGlobal('fetch', fetch);
  await resourceRepository.load('skills');
  await resourceRepository.load('character_names');
  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    '/resources/manifest.json', '/resources/test/skills.json.gz',
    '/resources/manifest.json', '/resources/test/character_names.json?locale=en'
  ]);
});

it('reads the original Angular cache metadata without fetching or changing its keys', async () => {
  const url='/resources/legacy/example.json.gz';
  const compressed = new Blob([JSON.stringify({value:'cached'})]).stream().pipeThrough(new CompressionStream('gzip'));
  responses.set(`umamoe-resource-data-legacy:${url}`,new Response(compressed));
  localStorage.setItem('umamoe_resource_meta_v1:example',JSON.stringify({url,version:'legacy',cacheName:'umamoe-resource-data-legacy',cachedAt:1}));
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  expect(await resourceRepository.readCached('example')).toEqual({value:'cached'});
  expect(fetch).not.toHaveBeenCalled();
});

it('persists successful resources but retains the last good cache on failed refreshes', async () => {
  let failed=false;
  vi.stubGlobal('fetch',vi.fn(async (url:string)=>url.endsWith('manifest.json') ? Response.json({version:'test',files:{example:'/resources/test/example.json'}}) : failed ? new Response('Unavailable',{status:503}) : Response.json({value:'fresh'})));
  expect(await resourceRepository.load('example')).toEqual({value:'fresh'});
  failed=true;
  await expect(resourceRepository.load('example',true)).rejects.toThrow('503');
  expect(await resourceRepository.readCached('example')).toEqual({value:'fresh'});
});

it('a late old resource cannot overwrite the refreshed persistent or in-memory cache', async () => {
  let release!: (response:Response)=>void, started!:()=>void, manifests=0;
  const old=new Promise<Response>(resolve=>release=resolve), firstStarted=new Promise<void>(resolve=>started=resolve);
  vi.stubGlobal('fetch',vi.fn(async (url:string)=>{
    if(url.endsWith('manifest.json'))return Response.json({version:String(++manifests),files:{example:`/resources/${manifests}/example.json`}});
    if(url.includes('/1/')){started();return old;}
    return Response.json({value:'new'});
  }));
  const first=resourceRepository.load('example'); await firstStarted;
  expect(await resourceRepository.load('example',true)).toEqual({value:'new'});
  release(Response.json({value:'old'}));await first;
  expect(await resourceRepository.readCached('example')).toEqual({value:'new'});
  expect(await resourceRepository.load('example')).toEqual({value:'new'});
});

it('unavailable cache storage does not break a successful resource load', async () => {
  vi.stubGlobal('caches',{open:async()=>{throw new Error('Blocked');}});
  vi.stubGlobal('fetch',vi.fn(async (url:string)=>Response.json(url.endsWith('manifest.json') ? {version:'test'} : {value:1})));
  expect(await resourceRepository.load('example')).toEqual({value:1});
  expect(await resourceRepository.readCached('example')).toBeUndefined();
});

it('returns fresh data without waiting for the persistent cache write', async () => {
  let release!: () => void;
  const disk = new Promise<void>(resolve => release = resolve);
  vi.stubGlobal('caches', { open: async () => { await disk; return { put: async () => {} }; } });
  vi.stubGlobal('fetch', vi.fn(async (url: string) => Response.json(url.endsWith('manifest.json') ? { version: 'test' } : { value: 'ready' })));
  try { expect(await resourceRepository.load('example')).toEqual({ value: 'ready' }); }
  finally { release(); }
});

it('rejects malformed support records before they can overwrite a usable Angular cache', async () => {
  let payload:unknown=[{id:'30028',name:'Kitasan Black',rarity:3,type:'speed',isReleased_en:true}];
  vi.stubGlobal('fetch',vi.fn(async (url:string)=>Response.json(url.endsWith('manifest.json') ? {version:'test'} : payload)));
  const original=await loadLiveSupportCards();
  payload=[{name:'Missing required ID'}];
  await expect(loadLiveSupportCards(true)).rejects.toThrow('Invalid support-card record');
  expect(await readCachedSupportCards()).toEqual(original);
});

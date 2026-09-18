import { afterEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); localStorage.clear(); });

it('shares cache/live factors with pickers and UQL, rejecting a malformed refresh before persisting it', async () => {
  vi.resetModules(); vi.useFakeTimers();
  const catalog = await import('./factor-catalog');
  const { UqlCompiler } = await import('../domain/inheritance/uql-compiler');
  const { validateInheritanceUql } = await import('../domain/inheritance/uql');
  const { createDatabaseUqlLanguage } = await import('../features/database/database-uql-language');
  const bundled = catalog.factorOptions();
  expect(validateInheritanceUql('Main has Live Recovery').state).toBe('invalid');
  const cached = [...bundled, { id:'990001', text:'Cached Recovery', type:3 }];
  const fresh = [...bundled, { id:'990002', text:'Live Recovery', type:3 }];
  const cacheName = 'umamoe-resource-data-test', url = '/resources/test/factors.json.gz';
  let stored = new Response(JSON.stringify(cached));
  localStorage.setItem('umamoe_resource_meta_v1:factors', JSON.stringify({url,cacheName}));
  vi.stubGlobal('caches', {open: async () => ({match: async () => stored.clone(), put: async (_url:string,response:Response) => { stored=response.clone(); }})});
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release=resolve; });
  let body: unknown = {default:fresh};
  const fetch = vi.fn(async (path:string) => {
    if (path.includes('manifest')) return Response.json({version:'test'});
    await pending; return Response.json(body);
  });
  vi.stubGlobal('fetch', fetch);
  const stop = catalog.watchFactorCatalog(), stopSecond = catalog.watchFactorCatalog();
  const request = catalog.loadFactorCatalog();
  expect(catalog.loadFactorCatalog()).toBe(request);
  await vi.waitFor(() => expect(catalog.factorMetadata(990001)?.text).toBe('Cached Recovery'));
  expect(get(catalog.factorCatalogState)).toEqual({loading:true,cached:true,error:''});
  release(); await request;
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(catalog.factorMetadata(990001)).toBeUndefined();
  expect(catalog.decodeFactor(9900023)).toMatchObject({name:'Live Recovery',level:3,category:'skills-races'});
  expect(get(catalog.factorCatalogState)).toEqual({loading:false,cached:false,error:''});
  expect(new UqlCompiler().compile('Main has Live Recovery')).toBe('overlaps(main_white_factors, (9900021, 9900022, 9900023))');
  expect(validateInheritanceUql('Main has Live Recovery')).toMatchObject({state:'valid',compiled:'overlaps(main_white_factors, (9900021, 9900022, 9900023))'});
  expect(createDatabaseUqlLanguage([],[],[]).completeForEditor('has Live Rec',12)?.options.some(option=>option.label==='Live Recovery')).toBe(true);
  body = [...fresh,{id:'990003',text:'Invalid type',type:99}];
  await catalog.loadFactorCatalog(true);
  expect(catalog.factorMetadata(990002)?.text).toBe('Live Recovery');
  expect(catalog.factorMetadata(990003)).toBeUndefined();
  expect(await stored.clone().json()).toEqual({default:fresh});
  expect(get(catalog.factorCatalogState)).toEqual({loading:false,cached:true,error:''});
  body = fresh; await vi.advanceTimersByTimeAsync(1000);
  expect(get(catalog.factorCatalogState)).toEqual({loading:false,cached:false,error:''});
  stop(); stopSecond();
});

it('keeps bundled factors during a failed fetch, retries while mounted, and stops retrying after navigation', async () => {
  vi.resetModules(); vi.useFakeTimers();
  const catalog = await import('./factor-catalog');
  vi.stubGlobal('caches', undefined);
  const fetch = vi.fn(async () => new Response('',{status:503}));
  vi.stubGlobal('fetch',fetch);
  const stop = catalog.watchFactorCatalog();
  await catalog.loadFactorCatalog();
  expect(catalog.factorOptions().length).toBeGreaterThan(100);
  expect(get(catalog.factorCatalogState)).toEqual({loading:true,cached:false,error:'Resource manifest returned 503.'});
  await vi.advanceTimersByTimeAsync(1000);
  expect(fetch).toHaveBeenCalledTimes(2);
  stop(); await vi.advanceTimersByTimeAsync(60000);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('keeps the fallback without requests or retries when Angular manifests do not publish factors', async () => {
  vi.resetModules(); vi.useFakeTimers();
  const catalog = await import('./factor-catalog');
  const bundled = catalog.factorOptions();
  vi.stubGlobal('caches', undefined);
  const fetch = vi.fn(async () => Response.json({version:'test',files:{character:'/resources/test/character.json'}}));
  vi.stubGlobal('fetch',fetch);
  const stop = catalog.watchFactorCatalog();
  await catalog.loadFactorCatalog();
  expect(catalog.factorOptions()).toEqual(bundled);
  expect(get(catalog.factorCatalogState)).toEqual({loading:false,cached:false,error:''});
  await vi.advanceTimersByTimeAsync(60000);
  expect(fetch).toHaveBeenCalledTimes(1);
  stop();
});

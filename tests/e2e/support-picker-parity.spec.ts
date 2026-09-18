import { expect, test, type Page } from './fixtures/test';
import { mockResources, mockAdvertising, mockAffinity, mockDatabase, supportCards } from './fixtures/api';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function openPicker(page: Page) {
  await page.goto('/database');
  await page.getByRole('button', {name:/Filters/}).click();
  await page.getByRole('radio', {name:'Advanced',exact:true}).click();
  if (page.viewportSize()!.width <= 900) await page.locator('[data-filter-group="support"] .group-title').click();
  await page.getByRole('button', {name:'Borrow support card',exact:true}).focus(); await page.keyboard.press('Enter');
  return page.getByRole('dialog', {name:'Select Support Card',exact:true});
}

test('Live support cards preserve released choices, titles, search, sorting and backend IDs', async ({page}) => {
  await mockDatabase(page); await mockAffinity(page);
  const requests:string[]=[];
  page.on('request',request => requests.push(request.url()));
  await page.goto('/database');
  await expect(page.getByRole('heading',{name:'Results',exact:true})).toBeVisible();
  await expect.poll(() => requests.some(url => /\/resources\/.*support-cards-db\.json/.test(url))).toBe(true);
  const dialog=await openPicker(page);
  await expect(dialog.getByRole('radio')).toHaveCount(5);
  await expect(dialog.locator('.card-copy strong')).toHaveText(['[Fire at My Heels]','[Wave of Gratitude]','[Dreams Do Come True]','Daiwa Scarlet','Kitasan Black']);
  await expect(dialog).not.toContainText('Unreleased Support');
  const search=dialog.getByRole('searchbox',{name:'Search support cards'});
  await search.fill('BLACK, FIRE'); await expect(dialog.getByRole('radio')).toHaveCount(1);
  await expect(dialog.locator('.art img')).toHaveAttribute('src','/assets/images/support_card/half/support_card_s_30028.webp');
  await search.fill('30189'); await expect(dialog.getByRole('radio')).toHaveCount(1);
  await expect(dialog.getByRole('radio')).toContainText('Fine Motion');
  await dialog.getByRole('radio').click();
  await expect(dialog).not.toBeVisible();
  await expect.poll(() => requests.filter(url => url.includes('/search/query?')).map(url => new URL(url).searchParams.get('support_card_id')).at(-1)).toBe('30189');
  await expect(page.getByRole('button',{name:'Change support card [Wave of Gratitude]',exact:true})).toBeFocused();
});

test('Support failures stay in the dialog, retry preserves filters and cannot turn into an empty result', async ({page}) => {
  await mockDatabase(page); await mockAffinity(page);
  let failed=true, release!:()=>void;
  const pending=new Promise<void>(resolve=>release=resolve);
  await page.route('**/resources/*/support-cards-db.json*',async route=>{await pending;await route.fulfill(failed?{status:503,json:{error:'Offline'}}:{json:supportCards});});
  const dialog=await openPicker(page);
  await expect(dialog.getByText('Still fetching resources...', {exact:true})).toBeVisible();
  const search=dialog.getByRole('searchbox',{name:'Search support cards'}); await search.fill('Black Fire');
  release(); await expect(dialog.getByText('Resource fetch failed',{exact:true})).toBeVisible();
  await expect(dialog.getByRole('link',{name:'Report on Discord'})).toBeVisible();
  await expect(dialog.getByText('No support cards match these filters.',{exact:true})).not.toBeVisible();
  failed=false; await dialog.getByRole('button',{name:'Retry support data'}).click();
  await expect(dialog.getByRole('radio')).toHaveCount(1); await expect(search).toHaveValue('Black Fire');
  await expect(dialog.getByText('Resource fetch failed',{exact:true})).not.toBeVisible();
});

test('Angular resource cache survives refresh failure and is replaced only by a successful response', async ({playwright,browserName,baseURL}) => {
  // WebKit's ephemeral contexts discard CacheStorage entries across document navigations.
  // Use a real profile for the reload/persistence workflow in every browser.
  const {viewport,isMobile,hasTouch,userAgent}=test.info().project.use;
  // A short directory also avoids Windows CacheStorage's nested-path limit.
  const profile=await mkdtemp(join(tmpdir(),'moe-cache-'));
  const context=await playwright[browserName].launchPersistentContext(profile,{baseURL,viewport,isMobile,hasTouch,userAgent});
  await mockAdvertising(context);
  await mockResources(context);
  const page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
  await mockDatabase(page); await mockAffinity(page); await page.goto('/tools');
  await page.evaluate(async cards=>{
    const url=location.origin+'/resources/legacy/support-cards-db.json';
    await (await caches.open('umamoe-resource-data-legacy')).put(url,new Response(JSON.stringify(cards),{headers:{'Content-Type':'application/json'}}));
    localStorage.setItem('umamoe_resource_meta_v1:support-cards-db',JSON.stringify({url,version:'legacy',cacheName:'umamoe-resource-data-legacy',cachedAt:1}));
  },supportCards.slice(0,2));
  let release!:()=>void, failed=true;
  const pending=new Promise<void>(resolve=>release=resolve);
  await page.route('**/resources/*/support-cards-db.json*',async route=>{await pending;await route.fulfill(failed?{status:500,json:{error:'Offline'}}:{json:supportCards});});
  const dialog=await openPicker(page);
  await expect(dialog.getByRole('radio')).toHaveCount(2);
  await expect(dialog.getByText('Using cached resources; refreshing...',{exact:true})).toBeVisible();
  release(); await expect(dialog.getByText('Resource refresh failed',{exact:true})).toBeVisible();
  await expect(dialog.getByRole('radio')).toHaveCount(2);
  failed=false; await dialog.getByRole('button',{name:'Retry support data'}).click();
  await expect(dialog.getByRole('radio')).toHaveCount(5);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('umamoe_resource_meta_v1:support-cards-db')!).version)).toBe('test');
  expect(await page.evaluate(()=>Object.keys(localStorage).some(key=>key.startsWith('svelte-')))).toBe(false);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  expect(errors).toEqual([]);
  } finally { await context.close(); }
});

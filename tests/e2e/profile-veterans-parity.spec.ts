import { expect, test, setSliderValue } from './fixtures/test';
import { mockVeteranProfile as mockProfile, profile, veteran } from './fixtures/api';

test('standalone Veterans exposes search, removable spark chips and compact veteran details', async ({ page }, testInfo) => {
  await mockProfile(page);
  await page.goto('/veterans/123456789012');
  await expect(page.getByRole('searchbox', { name:'Search', exact:true })).toBeVisible();
  await expect(page.locator('.filters')).toHaveCount(0);
  await page.getByRole('searchbox', { name:'Search', exact:true }).fill('no matching veteran');
  await expect(page.getByText('No veterans match your filters.', { exact:true })).toBeVisible();
  await page.getByRole('searchbox', { name:'Search', exact:true }).fill(' Grass ');
  await expect(page.locator('.veteran-card')).toHaveCount(1);
  if(page.viewportSize()!.width < 1024) await page.getByRole('button', { name:'Filters', exact:true }).click();
  await page.getByRole('button', { name:'Blue stats', exact:true }).click();
  await page.getByRole('button',{name:'Add Speed spark',exact:true}).click();
  await page.getByRole('button', { name:'Stats & SP',exact:true }).click();
  await expect(page.locator('.active-filter-chips')).toContainText('Speed · Total 1★+ · Any generation');
  await page.getByRole('button', { name:'Remove Speed · Total 1★+ · Any generation', exact:true }).click();
  await expect(page.locator('.active-filter-chips')).toContainText('Name: Grass');
  if(page.viewportSize()!.width < 1024) await page.getByRole('button',{name:'Show 1 veteran',exact:true}).click();
  await page.screenshot({ path:testInfo.outputPath('veterans-search.png'), fullPage:true });
  await page.getByRole('button',{name:'View Grass Wonder details',exact:true}).click();
  await expect(page.getByRole('region',{name:'Training support cards',exact:true})).toContainText('No support cards recorded.');
  await expect(page.getByRole('region', { name:'Base stat preview', exact:true })).toHaveCount(0);
  await expect(page.getByRole('dialog').locator('.stats > div')).toHaveCount(5);
  await page.screenshot({ path:testInfo.outputPath('veterans-details.png'), fullPage:true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('account Veterans retains Angular roster modes and filter controls', async ({ page }) => {
  await mockProfile(page);
  await page.goto('/profile/123456789012/veterans');
  await expect(page.getByRole('heading', { name: 'Parity Trainer' })).toBeVisible();
  await page.getByRole('button',{name:'Display options',exact:true}).click();
  await expect(page.getByRole('combobox', { name: 'View', exact:true })).toBeVisible();
  await expect(page.getByRole('tablist',{name:'Veteran workbench'})).toHaveCount(0);
  await expect(page.getByText('Grass Wonder', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('searchbox', { name:'Search', exact:true })).toBeVisible();
  if(page.viewportSize()!.width < 1024) await page.getByRole('button',{name:'Filters',exact:true}).click();
  await page.getByRole('button', { name:'Stats & SP',exact:true }).click();
  if(page.viewportSize()!.width < 1024) await page.getByRole('button',{name:'Show 1 veteran',exact:true}).click();
  await page.getByRole('combobox', { name:'View', exact:true }).click();
  await page.getByRole('option', { name:'Family tree', exact:true }).click();
  await expect(page.getByRole('region', { name: 'Veteran lineage' }).or(page.locator('[aria-label="Veteran lineage"]'))).toBeVisible();
});

test('account Veterans is page-overflow safe at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockProfile(page);
  await page.goto('/profile/123456789012/veterans');
  await expect(page.getByText('Grass Wonder', { exact: true }).first()).toBeVisible();
  const geometry = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(geometry.document).toBeLessThanOrEqual(geometry.viewport);
});

test('Veteran comparison table keeps aptitudes readable, sorts stats and opens details',async({page},testInfo)=>{
  await mockProfile(page);
  await page.route('**/api/v4/user/profile/123456789012',route=>route.fulfill({json:{...profile,veterans:[veteran,{...veteran,id:2,trained_chara_id:2,card_id:101301,speed:1400}]}}));
  await page.goto('/veterans/123456789012');
  await page.getByRole('button',{name:'Display options',exact:true}).click();
  await page.getByRole('combobox',{name:'View',exact:true}).click();
  await page.getByRole('option',{name:'Table',exact:true}).click();
  const table=page.getByRole('region',{name:'Veteran comparison',exact:true});
  await expect(table.locator('tbody .table-character')).toHaveCount(2);
  await expect(table.locator('thead th')).toHaveCount(6);
  await expect(table.locator('.table-stats').first().getByRole('term')).toHaveText(['Speed','Stamina','Power','Guts','Wit']);
  await expect(table.locator('.table-aptitudes').first().getByRole('listitem')).toHaveCount(10);
  expect(await table.locator('.table-aptitudes').first().evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  await expect(table.locator('.table-factors').first()).toContainText('6');
  if(page.viewportSize()!.width<768){
    await page.getByRole('button',{name:'Sort veterans',exact:true}).click();
    await page.getByRole('button',{name:'Speed',exact:true}).click();
    await page.getByRole('button',{name:'Show 2 veterans',exact:true}).click();
  }else{
    await page.getByRole('combobox',{name:'Sort',exact:true}).click();
    await page.getByRole('option',{name:'Speed',exact:true}).click();
  }
  await expect(table.locator('.table-stats [data-stat="speed"] dd').first()).toHaveText('1,400');
  if(page.viewportSize()!.width<768){
    await page.getByRole('button',{name:'Sort veterans',exact:true}).click();
    await page.getByRole('combobox',{name:'Order',exact:true}).click();
    await page.getByRole('option',{name:'Lowest first',exact:true}).click();
    await page.getByRole('button',{name:'Show 2 veterans',exact:true}).click();
  }else await page.getByRole('button',{name:'Sort ascending',exact:true}).click();
  await expect(table.locator('.table-stats [data-stat="speed"] dd').first()).toHaveText('1,210');
  await expect(table.locator('.table-totals').first()).toContainText('5,020 Total Stats');
  await expect(table.locator('.table-totals').first()).toContainText('200 SP');
  if(page.viewportSize()!.width>=1400) expect(await table.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  await table.evaluate(el=>el.scrollLeft=0);
  await page.screenshot({path:testInfo.outputPath('veteran-table.png'),fullPage:true});
  await table.screenshot({path:testInfo.outputPath('table-region.png')});
  await table.getByRole('button',{name:'View Grass Wonder details',exact:true}).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog',{name:'Grass Wonder',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('Veterans race filters select and clear races instead of rendering a read-only calendar', async ({ page },testInfo) => {
  await mockProfile(page);
  await page.goto('/profile/123456789012/veterans');
  await expect(page.locator('.veteran-card')).toHaveCount(1);
  if(page.viewportSize()!.width < 1024) await page.getByRole('button',{name:'Filters',exact:true}).click();
  await page.getByRole('button',{name:'Race wins',exact:true}).click();
  await page.getByRole('combobox', { name:'Find a race win',exact:true }).fill('Arima');
  const arima=page.getByRole('option', { name:'Arima Kinen',exact:true });
  await expect(arima.locator('img')).toHaveAttribute('src','/game-assets/textures/race_banners/thum_race_rt_000_1023_00.webp');
  await expect.poll(()=>arima.locator('img').evaluate((image:HTMLImageElement)=>image.complete && image.naturalWidth>0)).toBe(true);
  await page.getByRole('listbox',{name:'Find a race win suggestions',exact:true}).screenshot({path:testInfo.outputPath('race-search-icons.png')});
  await arima.click();
  await expect(page.getByText('1 selected race', { exact: true })).toBeVisible();
  await expect(page.locator('.selected-races .race.inline')).toHaveAttribute('aria-label','Arima Kinen, G1');
  await expect(page.locator('.selected-races .race-name')).toHaveText('G1Arima Kinen');
  await page.locator('#facet-saddle').screenshot({path:testInfo.outputPath('compact-race-selection.png')});
  await page.screenshot({path:testInfo.outputPath('race-win-filter.png')});
  // This fixture has no matching ancestor wins; clearing must restore it.
  await expect(page.getByText('No veterans match your filters.')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Arima Kinen', exact: true }).first().click();
  await expect(page.locator('.veteran-card')).toHaveCount(1);
  await expect(page.getByText('0 selected races', { exact: true })).toBeVisible();
  await page.getByRole('button',{name:'Inheritance totals',exact:true}).click();
  await expect(page.getByRole('combobox',{name:'Training scenario',exact:true})).toBeVisible();
  const whites=page.getByRole('slider',{name:'Minimum unique white sparks',exact:true});
  await setSliderValue(whites,10);
  await expect(page.locator('.veteran-card')).toHaveCount(0);
  await setSliderValue(whites,0);
  await expect(page.locator('.veteran-card')).toHaveCount(1);
  await setSliderValue(page.getByRole('slider',{name:'Minimum affinity',exact:true}),100);
  await expect(page.locator('.veteran-card')).toHaveCount(0);
  await page.screenshot({path:testInfo.outputPath('inheritance-totals.png')});
  await page.getByRole('button',{name:'Clear Inheritance totals',exact:true}).click();
  await expect(page.locator('.veteran-card')).toHaveCount(1);
});

test('Veteran details retain support deck, stats, aptitudes, races, sparks, skills, and inspectable lineage', async ({ page },testInfo) => {
  await mockProfile(page);
  await page.route('**/api/v4/user/profile/123456789012', route => route.fulfill({json:{...profile,team_stadium:[],veterans:[{...veteran,support_cards:[30028,30016,30003,30009,20023,999999],support_card_list:[30028,30016,30003,30009,20023].map((support_card_id,index)=>({support_card_id,limit_break_count:4-index}))}]}}));
  await page.goto('/profile/123456789012/veterans');
  await page.getByRole('button',{name:'View Grass Wonder details',exact:true}).click();
  const dialog=page.getByRole('dialog').first();
  await expect(dialog).toBeVisible();
  for (const label of ['Stats', 'Aptitudes', 'Learned skills', 'Sparks', 'Race History']) {
    await expect(dialog.getByRole('heading', { name:new RegExp('^'+label+'( \\d+)?$') })).toBeVisible();
  }
  await expect(dialog.getByText('Base stat preview', {exact:true})).toHaveCount(0);
  const sparkBounds = (await dialog.locator('.spark-section').boundingBox())!;
  const skillBounds = (await dialog.locator('.skills-section').boundingBox())!;
  expect(skillBounds.y).toBeGreaterThanOrEqual(sparkBounds.y + sparkBounds.height);
  await expect(dialog.locator('[data-stat="total"]')).toHaveCount(0);
  await expect(dialog.locator('.stats > div')).toHaveCount(5);
  await expect(dialog.locator('.totals')).toContainText('SP total200');
  await expect(dialog.locator('.totals')).toContainText('Total Stats5,020');
  await expect(dialog.getByRole('listitem',{name:'Speed: 6 stars total. Main 3, P1 3, P2 0.',exact:true})).toBeVisible();
  const bounds=(await dialog.boundingBox())!;
  expect(Math.abs(bounds.y + bounds.height / 2 - page.viewportSize()!.height / 2)).toBeLessThan(2);
  expect(bounds.height).toBeLessThan(page.viewportSize()!.height);
  const identity=dialog.locator('.dialog-panel > header .veteran-identity');
  await expect(identity.locator('.scenario')).toHaveText('Grand Masters');
  await expect(identity.locator('.race-style')).toContainText('Long · Pace');
  await expect(identity.getByLabel('5 rarity stars')).toHaveText('★★★★★');
  for (const selector of ['.scenario','.rarity']) {
    const color=await page.locator('.veteran-card').first().locator(selector).evaluate(el=>getComputedStyle(el).color);
    await expect(identity.locator(selector)).toHaveCSS('color',color);
  }
  await expect(identity.locator('.portrait')).toHaveCSS('border-width','0px');
  const deck=dialog.getByRole('region',{name:'Training support cards',exact:true});
  await expect(deck.locator('li>span')).toHaveText(['Kitasan Black','Super Creek','Tokai Teio','Tamamo Cross','Sweep Tosho','Card 999999']);
  await expect(deck.locator('.support-lb')).toHaveCount(6);
  expect(await deck.locator('.support-lb').evaluateAll(items=>items.map(item=>item.querySelectorAll('svg.filled').length))).toEqual([4,3,2,1,0,0]);
  await expect(deck.locator('.support-lb svg')).toHaveCount(20);
  await expect(deck.locator('.support-rarity')).toHaveCount(5);
  expect(await deck.locator('.support-rarity').evaluateAll(images=>images.map(image=>image.getAttribute('alt')))).toEqual(['SSR','SSR','SSR','SSR','SR']);
  await expect(deck.locator('.support-rarity').first()).toHaveAttribute('src','/game-assets/support-rarity/ssr.png');
  await expect.poll(()=>deck.locator('.support-rarity').evaluateAll(images=>images.every(image=>image.complete && image.naturalWidth > 0))).toBe(true);
  await expect(deck.locator('li').first().locator('.support-type img')).toHaveAttribute('src','/assets/images/icon/stats/speed.webp');
  await expect(deck.locator('li').nth(1).locator('.support-type img')).toHaveAttribute('alt','Stamina support');
  await expect(deck.getByLabel('Limit break 0 of 4', {exact:true})).toBeVisible();
  await expect(deck.getByLabel('Limit break not recorded', {exact:true})).toBeVisible();
  await expect(deck.locator('li').first().getByRole('img',{name:'Kitasan Black',exact:true})).toHaveAttribute('src',/support_card_s_30028.webp$/);
  await expect(dialog.locator('.aptitude-item>span').first()).toHaveCSS('color','rgb(255, 255, 255)');
  if (page.viewportSize()!.width > 650) {
    const aptitude=(await dialog.locator('.aptitudes .aptitude-grid').boundingBox())!;
    const affinity=(await dialog.locator('.affinity-sources').boundingBox())!;
    expect(affinity.y).toBeCloseTo(aptitude.y,0);
    expect(affinity.height).toBeCloseTo(aptitude.height,0);
  }
  await page.screenshot({path:testInfo.outputPath('veteran-dialog.png')});
  await expect(dialog.getByRole('radio',{name:'Individual',exact:true})).toHaveCount(0);
  await dialog.getByRole('radio',{name:'Grass Wonder This veteran',exact:true}).check();
  const sources=dialog.getByRole('group',{name:'Show sparks from',exact:true});
  await expect(sources.getByRole('radio')).toHaveCount(8);
  expect((await dialog.locator('.spark-sources').boundingBox())!.height).toBeLessThan(page.viewportSize()!.width > 650 ? 70 : 120);
  await expect(dialog.getByRole('radio',{name:'Grass Wonder This veteran',exact:true})).toBeChecked();
  await expect(dialog.getByRole('heading',{name:'Sparks 4',exact:true})).toBeVisible();
  await expect(dialog.getByRole('listitem',{name:'Speed: 3 stars.',exact:true})).toBeVisible();
  await dialog.getByRole('radio',{name:'Satono Crown Parent 2',exact:true}).check();
  await expect(dialog.getByRole('listitem',{name:'Dirt: 3 stars.',exact:true})).toBeVisible();
  await dialog.getByRole('radio',{name:'Satono Diamond Parent 1',exact:true}).check();
  await dialog.getByRole('radio',{name:'Satono Diamond Parent 1',exact:true}).press('ArrowRight');
  await expect(dialog.getByRole('radio',{name:'Grass Wonder P1 · Grandparent 1',exact:true})).toBeChecked();
  await expect(dialog.locator('.source-name')).toHaveText('Grass Wonder · P1 · Grandparent 1');
  await dialog.locator('.spark-section').screenshot({path:testInfo.outputPath('compact-spark-selector.png')});
  await expect(dialog.getByRole('listitem',{name:'Speed: 2 stars.',exact:true})).toBeVisible();
  await expect(dialog.getByRole('heading',{name:'Lineage',exact:true})).toBeVisible();
  await expect(dialog.locator('.family-section .lineage-node')).toHaveCount(6);
  await expect(dialog.locator('.family-section .root')).toHaveCount(0);
  expect((await dialog.locator('.family-section').boundingBox())!.height).toBeLessThan(180);
  await dialog.locator('.family-section').screenshot({path:testInfo.outputPath('compact-lineage.png')});
  await dialog.getByRole('button',{name:'P1 legacy 1: Grass Wonder',exact:true}).click();
  await expect(dialog.getByRole('radio',{name:'Grass Wonder P1 · Grandparent 1',exact:true})).toBeChecked();
  await expect(dialog.getByRole('listitem',{name:'Speed: 2 stars.',exact:true})).toBeVisible();
  await dialog.getByRole('radio',{name:'Combined',exact:true}).click();
  await expect(dialog.getByRole('group',{name:'Show sparks from',exact:true})).toBeVisible();
  await expect(dialog.getByRole('listitem',{name:'Speed: 6 stars total. Main 3, P1 3, P2 0.',exact:true})).toBeVisible();
  expect(await dialog.evaluate(el=>el.scrollWidth-el.clientWidth)).toBeLessThanOrEqual(1);
  const skillIcons=dialog.locator('.skill-chip img');
  await expect(dialog.locator('.skill-chip').first()).toHaveClass(/rarity-unique-main/);
  await expect(dialog.locator('.skill-name').first()).toHaveText('Shooting Star');
  await expect(skillIcons).toHaveCount(2);
  await skillIcons.first().scrollIntoViewIfNeeded();
  await expect.poll(() => skillIcons.evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
  await page.getByRole('button', { name:'Full Schedule' }).click();
  await expect(page.getByRole('heading', { name:'Race History',exact:true })).toBeVisible();
  await expect(page.getByRole('dialog').last().getByLabel(/February Stakes, G1/).filter({ visible:true })).toBeVisible();
});

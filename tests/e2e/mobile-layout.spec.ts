import { test, expect, type Page } from './fixtures/test';
import { accountId, mockDatabase, mockTimeline, mockStatistics, mockCommunity, mockProfilePresentation, mockActivity, mockAffinity, mockVeteranProfile, mockOwnerProfile, mockResources, mockAdvertising, veteran } from './fixtures/api';
import skills from '../fixtures/resources/skills.json' with { type: 'json' };

const pages: Array<{ name: string; path: string; setup: (page: Page) => Promise<unknown>; ready: string }> = [
  { name: 'database', path: '/database', setup: async page => { await mockDatabase(page); await mockAffinity(page); }, ready: '.inheritance-card' },
  { name: 'timeline', path: '/timeline', setup: mockTimeline, ready: '.event-card' },
  { name: 'planner', path: '/timeline?tab=carat-planner', setup: mockTimeline, ready: '.planner' },
  { name: 'statistics', path: '/tools/statistics', setup: mockStatistics, ready: '[data-testid="selected-samples"]' },
  { name: 'clubs', path: '/circles', setup: mockCommunity, ready: '.club-list' },
  { name: 'club-details', path: '/circles/7?year=2026&month=8', setup: mockCommunity, ready: 'figure' },
  { name: 'rankings', path: '/rankings', setup: mockCommunity, ready: '.leaderboard' },
  { name: 'profile', path: `/profile/${accountId}`, setup: mockProfilePresentation, ready: '.inheritance-card' },
  { name: 'veterans', path: `/veterans/${accountId}`, setup: mockVeteranProfile, ready: 'main' },
  { name: 'activity', path: '/activity', setup: mockActivity, ready: 'main' },
  { name: 'lineage', path: '/tools/lineage-planner', setup: mockAffinity, ready: 'main' }
];

async function prepareMouse(page: Page) {
  await mockAdvertising(page.context()); await mockResources(page.context());
  await page.addInitScript(() => {
    localStorage.setItem('page-introduction-audience-v1', 'existing');
    localStorage.setItem('lastSeenUpdateVersion', '17');
  });
}

async function controlStyles(page: Page, rootSelector = '.route-view') {
  return page.locator(rootSelector).evaluate(root => {
    const selectors = ['.app-page', '.page-sections', '.page-heading', '.event-card', '.veteran-card', '.card-body', '.skill-filter', '.spark-filter', '.filter-shell', '.segments', '.segments button', '.ui-button', '.icon-button', '.select-control', '.tab', '.ranking-row', '.plan', '.filterbar', '.parent-search input', '.parent-row', '.picker-body', '.manual-tree', '.manual-node', '.spark-add'];
    const properties = ['height', 'width', 'padding', 'row-gap', 'column-gap', 'font-size', 'line-height', 'min-height', 'min-width', 'border-radius'];
    return Object.fromEntries(selectors.map(selector => [selector, [...root.querySelectorAll(selector)].filter(node => node.checkVisibility()).slice(0, 8).map(node => {
      const style = getComputedStyle(node);
      return Object.fromEntries(properties.map(property => [property, style.getPropertyValue(property)]));
    })]));
  });
}

for (const entry of pages) test(`mobile layout: ${entry.name}`, async ({ page, browser, baseURL, isMobile, userAgent, deviceScaleFactor }, info) => {
  await entry.setup(page);
  await page.goto(entry.path);
  await expect(page.locator(entry.ready).first()).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: info.outputPath(`${entry.name}.png`), fullPage: true, scale: 'css' });
  await page.screenshot({ path: info.outputPath(`${entry.name}-viewport.png`), scale: 'css' });
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    overflow: [...document.querySelectorAll('main *')].filter(node => {
      const box = node.getBoundingClientRect();
      return box.width && (box.left < -1 || box.right > innerWidth + 1);
    }).slice(0, 12).map(node => ({ tag: node.tagName, class: node.className }))
  }));
  expect(layout.width, JSON.stringify(layout)).toBeLessThanOrEqual(layout.viewport);
  // Match the browser, viewport, UA and mobile mode; change only the pointer type.
  const mouseContext = await browser.newContext({ baseURL, viewport: page.viewportSize(), isMobile, userAgent, deviceScaleFactor, hasTouch: false });
  try {
    const mousePage = await mouseContext.newPage();
    await prepareMouse(mousePage);
    await entry.setup(mousePage);
    await mousePage.goto(entry.path);
    await expect(mousePage.locator(entry.ready).first()).toBeVisible();
    await mousePage.evaluate(() => document.fonts.ready);
    // Render the same offscreen lazy content before comparing computed dimensions.
    await mousePage.screenshot({ path: info.outputPath(`${entry.name}-mouse-full.png`), fullPage: true, scale: 'css' });
    await expect.poll(() => controlStyles(page)).toEqual(await controlStyles(mousePage));
    await mousePage.screenshot({ path: info.outputPath(`${entry.name}-mouse.png`), scale: 'css' });
  } finally { await mouseContext.close(); }
});

test('mobile layout: dense veteran chips stay compact and resolve catalog names', async ({ page }, info) => {
  await mockVeteranProfile(page);
  await page.route(`**/api/v4/user/profile/${accountId}`, async route => {
    const item = { ...veteran, skills: skills.slice(0, 20).map(skill => skill.skill_id * 10 + 1) };
    await route.fulfill({ json: { trainer: { account_id: accountId, name: 'Dense roster' }, veterans: [item] } });
  });
  await page.goto(`/veterans/${accountId}`);
  const card = page.locator('.veteran-card');
  await expect(card.locator('.skill-filter')).toHaveCount(20);
  await expect(card.getByRole('button', { name: /Filter by Shooting Star:/ })).toBeVisible();
  await expect(card.getByRole('button', { name: /Filter by Right-Handed ○:/ })).toBeVisible();
  await expect(card).not.toContainText('Unknown Factor');
  const sizes = await card.locator('.spark-filter,.skill-filter').evaluateAll(nodes => nodes.map(node => ({
    button: node.getBoundingClientRect().height,
    chip: node.firstElementChild!.getBoundingClientRect().height
  })));
  for (const size of sizes) {
    expect(size.button).toBeGreaterThanOrEqual(24);
    expect(size.button - size.chip).toBeLessThanOrEqual(6);
  }
  await card.screenshot({ path: info.outputPath('dense-veteran.png'), scale: 'css' });
  await card.locator('.skill-filter').first().tap();
  await expect(card.locator('.skill-filter.matched')).toHaveCount(1);
});

async function openLegacyPicker(page: Page) {
  await mockDatabase(page); await mockAffinity(page);
  await mockOwnerProfile(page, []); await mockVeteranProfile(page);
  await page.goto('/database');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByRole('radio', { name: 'Advanced', exact: true }).click();
  await page.getByRole('button', { name: 'Pick your legacy', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Select Parent', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.parent-row')).toHaveCount(1);
  return dialog;
}

test('mobile layout: legacy picker', async ({ page, browser, baseURL, isMobile, userAgent, deviceScaleFactor }, info) => {
  const dialog = await openLegacyPicker(page);
  await page.screenshot({ path: info.outputPath('legacy-picker.png'), scale: 'css' });
  const mouseContext = await browser.newContext({ baseURL, viewport: page.viewportSize(), isMobile, userAgent, deviceScaleFactor, hasTouch: false });
  try {
    const mousePage = await mouseContext.newPage();
    await prepareMouse(mousePage);
    const mouseDialog = await openLegacyPicker(mousePage);
    for (const name of ['Veterans', 'Bookmarks', 'Partner', 'Manual']) {
      await dialog.getByRole('tab', { name: new RegExp(name) }).tap();
      await mouseDialog.getByRole('tab', { name: new RegExp(name) }).click();
      expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
      await expect.poll(() => controlStyles(page, 'dialog[open]')).toEqual(await controlStyles(mousePage, 'dialog[open]'));
      await page.screenshot({ path: info.outputPath(`legacy-${name}.png`), scale: 'css' });
    }
  } finally { await mouseContext.close(); }
});

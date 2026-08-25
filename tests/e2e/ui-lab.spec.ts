import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 720 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1366, height: 768 },
  { width: 1440, height: 1000 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 }
];

for (const viewport of viewports) {
  test(`UI lab fits ${viewport.width}px without page overflow`, async ({ page }) => {
    test.setTimeout(45_000);
    await page.setViewportSize(viewport);
    await page.goto('/ui-lab');
    await expect(page.getByRole('heading', { name: 'uma.moe UI system' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll<HTMLElement>('*')]
        .filter((element) => element.scrollWidth > element.clientWidth + 1 && getComputedStyle(element).overflowX === 'visible')
        .slice(0, 16)
        .map((element) => `${element.closest('section')?.id ?? 'page'} > ${element.tagName.toLowerCase()}.${element.className} [${element.getAttribute('aria-label') ?? ''}] "${element.textContent?.trim().slice(0, 60) ?? ''}": ${element.clientWidth}/${element.scrollWidth}`)
    }));
    expect(dimensions.scrollWidth, dimensions.overflow.join('\n')).toBeLessThanOrEqual(dimensions.width);
  });
}

test('theme, density, dialog, and virtual list remain functional', async ({ page }) => {
  await page.goto('/ui-lab');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: 'Light' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('radio', { name: 'Compact' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-density', 'compact');

  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Replace Local workspace?' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Replace Local workspace?' })).not.toBeVisible();

  const liveRows = await page.getByRole('list', { name: 'Veterans' }).getByRole('listitem').count();
  expect(liveRows).toBeLessThan(40);
});

test('custom select and autocomplete retain keyboard behavior', async ({ page }) => {
  await page.goto('/ui-lab');

  const region = page.getByRole('combobox', { name: 'Data region' });
  await region.click();
  await expect(page.getByRole('listbox', { name: 'Data region' })).toBeVisible();
  await page.getByRole('option', { name: 'Japan' }).click();
  await expect(region).toContainText('Japan');

  const character = page.getByRole('combobox', { name: 'Character' });
  await character.fill('Mejiro');
  await expect(page.getByRole('listbox', { name: 'Character suggestions' }).getByRole('option', { name: 'Mejiro McQueen' })).toBeVisible();
  await character.press('Enter');
  await expect(character).toHaveValue('Mejiro McQueen');
});

test('Veteran selector supports search, keyboard selection, and workspace context', async ({ page }) => {
  await page.goto('/ui-lab');

  const selector = page.getByRole('combobox', { name: 'Parent Veteran' });
  await selector.click();
  const listbox = page.getByRole('listbox', { name: 'Parent Veteran' });
  await expect(listbox).toBeVisible();
  await page.getByPlaceholder('Search Veterans…').fill('Oguri');
  await expect(listbox.getByRole('option')).toHaveCount(1);
  await page.getByPlaceholder('Search Veterans…').press('Enter');
  await expect(selector).toContainText('Oguri Cap');
  await expect(selector).toContainText('Local · Yesterday');
});

test('Veteran selector becomes a bounded sheet on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui-lab');
  await page.getByRole('combobox', { name: 'Parent Veteran' }).click();

  const listbox = page.getByRole('listbox', { name: 'Parent Veteran' });
  await expect(listbox).toBeVisible();
  const bounds = await listbox.boundingBox();
  expect(bounds).not.toBeNull();
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(390);
  expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(844);
  await page.getByRole('button', { name: 'Close Veteran selector' }).click();
  await expect(listbox).not.toBeVisible();
});

test('inheritance spark labels remain complete in the mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/ui-lab');

  const spark = page.getByLabel('2 star The View from the Lead Is Mine!').first();
  await expect(spark).toBeVisible();
  await expect(spark.locator('.name')).toHaveText('The View from the Lead Is Mine!');
  const clipping = await spark.locator('.name').evaluate((element) => ({
    overflow: getComputedStyle(element).overflow,
    textOverflow: getComputedStyle(element).textOverflow
  }));
  expect(clipping).toEqual({ overflow: 'visible', textOverflow: 'clip' });
});

test('Hakuraku ports load on demand and remain mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/ui-lab');

  const tab = page.getByRole('tab', { name: /Hakuraku/ });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Hakuraku component ports' })).toBeVisible();
  await expect(page.locator('[data-hakuraku-library]')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Race runners' })).toBeVisible();

  const play = page.getByRole('button', { name: 'Play replay' });
  await play.click();
  await expect(page.getByRole('button', { name: 'Pause replay' })).toBeVisible();
  await expect(page.locator('#haku-race-chart svg').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('main-parent and P2 sparks preserve the Angular source accents', async ({ page }) => {
  await page.goto('/ui-lab');

  const main = page.getByLabel(/3 star Speed.*Main parent/).first();
  const p2 = page.getByLabel(/2 star Swinging Maestro.*P2 legacy/).first();
  await expect(main).toHaveAttribute('data-source', 'main');
  await expect(p2).toHaveAttribute('data-source', 'p2');
  await expect(p2.locator('.p2-marker')).toBeVisible();

  const colors = await page.evaluate(() => {
    const resolvedToken = (token: string) => {
      const sample = document.createElement('span');
      sample.style.color = `var(${token})`;
      document.body.append(sample);
      const color = getComputedStyle(sample).color;
      sample.remove();
      return color;
    };
    return {
      main: getComputedStyle(document.querySelector<HTMLElement>('[data-source="main"] .level')!).color,
      p2: getComputedStyle(document.querySelector<HTMLElement>('[data-source="p2"] .p2-marker')!).color,
      warning: resolvedToken('--accent-warning'),
      purple: resolvedToken('--accent-purple')
    };
  });
  expect(colors.main).toBe(colors.warning);
  expect(colors.p2).toBe(colors.purple);

  const centers = await Promise.all(['.level', '.star', '.name', '.chance'].map(async (selector) => {
    const box = await main.locator(selector).boundingBox();
    return (box?.y ?? 0) + (box?.height ?? 0) / 2;
  }));
  expect(Math.max(...centers) - Math.min(...centers)).toBeLessThanOrEqual(1.5);
});

test('the UI lab itself uses the canonical responsive shell and page gutters', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/ui-lab');
  const shell = page.locator('[data-ui-lab-shell]');
  const rail = shell.locator('[data-shell-rail]');
  const bottom = page.locator('[data-shell-bottom]');
  const intro = shell.locator('.lab-intro');

  await expect(rail).toBeHidden();
  await expect(bottom).toBeVisible();
  const mobileIntro = await intro.boundingBox();
  expect(mobileIntro!.x).toBe(4);
  expect(320 - mobileIntro!.x - mobileIntro!.width).toBe(4);

  await page.setViewportSize({ width: 768, height: 900 });
  await expect(bottom).toBeHidden();
  await expect(rail).toBeVisible();
  const compactRail = await rail.boundingBox();
  const compactIntro = await intro.boundingBox();
  expect(compactRail!.width).toBe(64);
  expect(compactIntro!.x).toBe(64 + 24);
  expect(768 - compactIntro!.x - compactIntro!.width).toBe(24);

  await page.setViewportSize({ width: 1366, height: 900 });
  const largeCompactRail = await rail.boundingBox();
  expect(largeCompactRail!.width).toBe(64);
  await expect(rail.getByText('Foundation', { exact: true })).toBeHidden();

  await page.setViewportSize({ width: 1440, height: 900 });
  expect((await rail.boundingBox())!.width).toBe(64);
  await expect(rail.getByText('Foundation', { exact: true })).toBeHidden();

  await page.setViewportSize({ width: 1536, height: 864 });
  expect((await rail.boundingBox())!.width).toBe(64);
  await expect(rail.getByText('Foundation', { exact: true })).toBeHidden();

  await page.setViewportSize({ width: 1920, height: 1080 });
  const expandedRail = await rail.boundingBox();
  expect(expandedRail!.width).toBe(240);
  await expect(rail.getByText('Foundation', { exact: true })).toBeVisible();
});

test('section navigation exposes subsections in expanded, compact, and mobile shells', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/ui-lab');
  const rail = page.locator('[data-shell-rail]');

  await rail.getByRole('button', { name: 'Open Inputs subsections' }).click();
  const wideSubsections = rail.locator('#navigation-subsections-inputs');
  await expect(wideSubsections.getByRole('link', { name: 'Slider' })).toBeVisible();
  const expandedAlignment = await Promise.all([
    rail.locator('.navigation-item.open > .navigation-parent .navigation-link > span').boundingBox(),
    wideSubsections.getByRole('link', { name: 'Slider' }).locator('span').boundingBox()
  ]);
  expect(expandedAlignment[1]!.x).toBeLessThan(expandedAlignment[0]!.x);
  expect(expandedAlignment[0]!.x - expandedAlignment[1]!.x).toBeLessThanOrEqual(24);
  await wideSubsections.getByRole('link', { name: 'Slider' }).click();
  await expect(page).toHaveURL(/#slider$/);
  await expect(wideSubsections).not.toBeVisible();

  await page.setViewportSize({ width: 1536, height: 864 });
  await rail.getByRole('button', { name: 'Open Domain patterns subsections' }).click();
  const compactSubsections = rail.locator('#navigation-subsections-domain');
  await expect(compactSubsections.getByRole('link', { name: 'Veteran selector' })).toBeVisible();
  await rail.getByRole('button', { name: 'Open Actions subsections' }).click();
  await expect(compactSubsections).not.toBeVisible();
  const compactActions = rail.locator('#navigation-subsections-actions');
  await expect(compactActions).toBeVisible();
  const [railBounds, flyoutBounds] = await Promise.all([rail.boundingBox(), compactActions.boundingBox()]);
  expect(flyoutBounds!.x).toBe(railBounds!.x + railBounds!.width);
  await page.keyboard.press('Escape');
  await expect(compactActions).not.toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'More UI lab sections' }).click();
  const sheet = page.getByRole('dialog', { name: 'UI lab sections' });
  await sheet.getByRole('button', { name: 'Open Navigation subsections' }).click();
  await expect(sheet.getByRole('link', { name: 'Section navigation' })).toBeVisible();
  await sheet.getByRole('link', { name: 'Section navigation' }).click();
  await expect(sheet).not.toBeVisible();
  await expect(page).toHaveURL(/#subnavigation$/);
});

test('ported Angular UI contracts remain interactive and mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui-lab');

  await expect(page.getByLabel('Rank UE1').first()).toBeVisible();
  await expect(page.getByLabel('Long: S').first()).toBeVisible();
  await expect(page.getByLabel('Total affinity: 83').first()).toBeVisible();

  const filterMode = page.getByRole('radio', { name: 'UQL', exact: true }).last();
  await filterMode.click();
  await expect(filterMode).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Open mobile filter sheet' }).click();
  const filterSheet = page.getByRole('dialog', { name: 'Database filters' });
  await expect(filterSheet).toBeVisible();
  await filterSheet.getByRole('button', { name: 'Show 74 results' }).click();
  await expect(filterSheet).not.toBeVisible();

  const veteranRow = page.getByRole('button', { name: 'Select Mejiro McQueen' });
  await expect(veteranRow).toHaveAttribute('aria-pressed', 'false');
  await veteranRow.click();
  await expect(veteranRow).toHaveAttribute('aria-pressed', 'true');

  const lineageNode = page.getByRole('button', { name: 'P2: Kitasan Black' });
  await lineageNode.click();
  await expect(lineageNode).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: 'Open Satsuki Sho' }).click();
  await expect(page.getByText('Selected race: Satsuki Sho')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('Uma domain components adapt to their own container width', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/ui-lab');

  const rank = page.getByLabel('Rank UE1').first();
  await expect(rank.locator('img')).toHaveAttribute('src', /utx_txt_rank_39\.webp$/);

  const lineage = page.locator('#lineage .lineage-container');
  const lineageBranches = lineage.locator('.branch');
  const wideBranchBoxes = await Promise.all([lineageBranches.nth(0).boundingBox(), lineageBranches.nth(1).boundingBox()]);
  expect(Math.abs(wideBranchBoxes[0]!.y - wideBranchBoxes[1]!.y)).toBeLessThanOrEqual(2);
  await lineage.evaluate((element) => element.style.width = '360px');
  const narrowBranchBoxes = await Promise.all([lineageBranches.nth(0).boundingBox(), lineageBranches.nth(1).boundingBox()]);
  expect(narrowBranchBoxes[1]!.y).toBeGreaterThan(narrowBranchBoxes[0]!.y + narrowBranchBoxes[0]!.height);

  const veteran = page.locator('#veteran-summary .veteran-summary-container');
  const parent = veteran.locator('.parent-row').first();
  const wideParentParts = await Promise.all([parent.locator('.parent-id').boundingBox(), parent.locator('.parent-factors').boundingBox()]);
  expect(Math.abs(wideParentParts[0]!.y - wideParentParts[1]!.y)).toBeLessThanOrEqual(3);
  await veteran.evaluate((element) => element.style.width = '360px');
  const narrowParentParts = await Promise.all([parent.locator('.parent-id').boundingBox(), parent.locator('.parent-factors').boundingBox()]);
  expect(narrowParentParts[1]!.y).toBeGreaterThan(narrowParentParts[0]!.y);

  const schedule = page.locator('#race-schedule .race-schedule-container');
  const years = schedule.locator('.year');
  const wideYearBoxes = await Promise.all([years.nth(0).boundingBox(), years.nth(1).boundingBox()]);
  expect(Math.abs(wideYearBoxes[0]!.y - wideYearBoxes[1]!.y)).toBeLessThanOrEqual(2);
  await schedule.evaluate((element) => element.style.width = '360px');
  const narrowYearBoxes = await Promise.all([years.nth(0).boundingBox(), years.nth(1).boundingBox()]);
  expect(narrowYearBoxes[1]!.y).toBeGreaterThan(narrowYearBoxes[0]!.y + narrowYearBoxes[0]!.height);
});

test('Analytics viewport toggles resize the entire UI Lab website', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/ui-lab');
  const viewport = page.locator('.lab-viewport');
  const rail = viewport.locator('[data-shell-rail]');
  const bottom = viewport.locator('[data-shell-bottom]');
  const inlineAd = viewport.locator('[data-ad-kind="inline"]');

  await page.getByRole('button', { name: '360×800', exact: true }).click();
  await expect(viewport).toHaveAttribute('data-preview-width', '360');
  expect((await viewport.boundingBox())!.width).toBe(360);
  await expect(rail).toBeHidden();
  await expect(bottom).toBeVisible();
  await expect(inlineAd).toBeVisible();
  expect((await inlineAd.boundingBox())!.height).toBe(100);

  await page.getByRole('button', { name: '1366×768', exact: true }).click();
  expect((await viewport.boundingBox())!.width).toBe(1366);
  expect((await rail.boundingBox())!.width).toBe(64);
  await expect(bottom).toBeHidden();
  await expect(inlineAd).toBeHidden();
  await expect(viewport.locator('[data-ad-position="right-rail"]')).toBeVisible();

  await page.getByRole('button', { name: '1536×864', exact: true }).click();
  expect((await viewport.boundingBox())!.width).toBe(1536);
  expect((await rail.boundingBox())!.width).toBe(64);
  await expect(viewport.locator('[data-ad-position="right-rail"]')).toBeVisible();

  await page.getByRole('button', { name: 'Fluid', exact: true }).click();
  await expect(viewport).toHaveAttribute('data-preview-width', 'fluid');
  expect((await viewport.boundingBox())!.width).toBe(1920);
});

test('medium and wide page contracts change the live UI lab content maximum', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto('/ui-lab');
  const main = page.locator('.lab-main');
  const control = page.locator('article.demo').filter({ hasText: 'Live responsive shell and page width' });
  await expect(main).toHaveAttribute('data-page-width', 'wide');
  const wide = await main.boundingBox();
  await control.getByRole('radio', { name: 'Medium', exact: true }).click();
  await expect(main).toHaveAttribute('data-page-width', 'medium');
  const medium = await main.boundingBox();
  expect(wide!.width).toBe(1760);
  expect(medium!.width).toBe(1080);
  expect(medium!.x).toBeGreaterThan(wide!.x);
});

test('the live UI page uses a 1080p counter-rail and a large-screen ad pair', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui-lab');

  const livePage = page.locator('[data-live-page-layout]');
  const frame = livePage.locator('[data-page-frame]');

  const mobileGeometry = await frame.evaluate((element) => {
    const frameBox = element.getBoundingClientRect();
    const contentBox = element.querySelector<HTMLElement>('[data-page-content]')!.getBoundingClientRect();
    const inlineAdBox = element.querySelector<HTMLElement>('[data-ad-kind="inline"]')!.getBoundingClientRect();
    const visibleRails = [...element.querySelectorAll<HTMLElement>('[data-ad-kind="rail"]')]
      .filter((rail) => getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().width > 0);
    return {
      contentInset: contentBox.left - frameBox.left,
      inlineHeight: inlineAdBox.height,
      visibleRails: visibleRails.length
    };
  });
  expect(mobileGeometry).toEqual({ contentInset: 4, inlineHeight: 100, visibleRails: 0 });

  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(frame.locator('[data-ad-position="left-rail"]')).toBeHidden();
  await expect(frame.locator('[data-ad-position="right-rail"]')).toBeHidden();
  await expect(frame.locator('[data-ad-kind="inline"]')).toBeVisible();

  await page.setViewportSize({ width: 1536, height: 864 });
  const compactAdGeometry = await page.evaluate(() => {
    const navigation = document.querySelector<HTMLElement>('[data-shell-rail]')!.getBoundingClientRect();
    const pageFrame = document.querySelector<HTMLElement>('[data-page-frame]')!.getBoundingClientRect();
    const rightRail = document.querySelector<HTMLElement>('[data-ad-position="right-rail"]')!.getBoundingClientRect();
    const visibleRails = [...document.querySelectorAll<HTMLElement>('[data-ad-kind="rail"]')]
      .filter((rail) => rail.getBoundingClientRect().width > 0);
    return {
      navigationWidth: navigation.width,
      visibleRails: visibleRails.length,
      rightRailWidth: rightRail.width,
      rightInset: pageFrame.right - rightRail.right
    };
  });
  expect(compactAdGeometry).toEqual({ navigationWidth: 64, visibleRails: 1, rightRailWidth: 160, rightInset: 24 });
  await expect(frame.locator('[data-ad-kind="inline"]')).toBeHidden();

  await page.setViewportSize({ width: 1920, height: 1080 });
  const expandedGeometry = await frame.evaluate((element) => {
    const pageGrid = element.querySelector<HTMLElement>('[data-route-id="ui-lab"]')!;
    const frameBox = pageGrid.getBoundingClientRect();
    const content = element.querySelector<HTMLElement>('[data-page-content]')!;
    const utility = document.querySelector<HTMLElement>('[data-shell-utility]')!.getBoundingClientRect();
    const navigationRail = document.querySelector<HTMLElement>('[data-shell-rail]')!.getBoundingClientRect();
    const rightReserve = element.querySelector<HTMLElement>('[data-ad-position="right-rail"]')!;
    const rightReserveBox = rightReserve.getBoundingClientRect();
    const rails = [...element.querySelectorAll<HTMLElement>('[data-ad-kind="rail"]')]
      .filter((rail) => getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().width > 0)
      .map((rail) => rail.getBoundingClientRect());
    return {
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      railWidths: rails.map((rail) => rail.width),
      navigationReserveWidth: navigationRail.width,
      rightReserveWidth: rightReserveBox.width,
      contentLeftReserve: content.getBoundingClientRect().left,
      contentRightReserve: window.innerWidth - content.getBoundingClientRect().right,
      creativeLeftInset: rails[0]!.left - rightReserveBox.left,
      creativeRightInset: rightReserveBox.right - rails[0]!.right,
      railTopGap: rails[0]!.top - utility.bottom,
      railBottomGap: window.innerHeight - rails[0]!.bottom,
      contentComesFirst: Boolean(content.compareDocumentPosition(rightReserve) & Node.DOCUMENT_POSITION_FOLLOWING),
      frameLeft: frameBox.left
    };
  });
  expect(expandedGeometry.scrollWidth).toBe(expandedGeometry.clientWidth);
  expect(expandedGeometry.railWidths).toEqual([160]);
  expect(expandedGeometry.navigationReserveWidth).toBe(240);
  expect(expandedGeometry.rightReserveWidth).toBe(240);
  expect(expandedGeometry.contentLeftReserve).toBe(expandedGeometry.contentRightReserve);
  expect(expandedGeometry.creativeLeftInset).toBe(expandedGeometry.creativeRightInset);
  expect(expandedGeometry.railTopGap).toBe(expandedGeometry.railBottomGap);
  expect(expandedGeometry.contentComesFirst).toBe(true);
  expect(expandedGeometry.frameLeft).toBe(240);
  await expect(frame.locator('[data-route-id="ui-lab"]')).toHaveAttribute('data-feature-id', 'ui-system');
  await expect(frame.locator('[data-route-id="ui-lab"]')).toHaveAttribute('data-page-width', 'wide');
  await expect(frame.locator('[data-ad-kind="leaderboard"]')).toHaveCount(0);
  await expect(frame.locator('[data-ad-kind="inline"]')).toHaveAttribute('data-ad-sizes', '970x90,728x90,468x90,468x60,320x100,300x100,320x50,300x50');
  await expect(frame.locator('[data-ad-kind="inline"]')).toHaveAttribute('data-ad-behavior', 'rail-alternative');
  await expect(frame.locator('[data-ad-position="left-rail"] [data-ad-kind="rail"]')).toHaveAttribute('data-ad-sizes', '160x600,120x600');
  await expect(frame.locator('[data-ad-position="right-rail"] [data-ad-kind="rail"]')).toHaveAttribute('data-ad-sizes', '160x600,120x600');

  await page.setViewportSize({ width: 2560, height: 1440 });
  const largeScreenRails = await frame.locator('[data-ad-kind="rail"]').evaluateAll((rails) => rails
    .filter((rail) => rail.getBoundingClientRect().width > 0)
    .map((rail) => rail.getBoundingClientRect().width));
  expect(largeScreenRails).toEqual([160, 160]);
});

test('side navigation and ad rails stay sticky for the full simulated viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/ui-lab');

  const scrollport = page.locator('[data-preview-scrollport]');
  const navigation = page.locator('[data-shell-rail]');
  const rightRail = page.locator('[data-ad-position="right-rail"]');
  const before = {
    navigation: await navigation.boundingBox(),
    rail: await rightRail.boundingBox(),
    scrollport: await scrollport.boundingBox()
  };
  await scrollport.evaluate((element) => element.scrollTo({ top: 1200 }));
  await expect.poll(() => scrollport.evaluate((element) => element.scrollTop)).toBeGreaterThan(1000);
  const after = { navigation: await navigation.boundingBox(), rail: await rightRail.boundingBox() };

  expect(before.navigation!.height).toBe(before.scrollport!.height);
  expect(after.navigation!.y).toBe(before.navigation!.y);
  expect(after.navigation!.height).toBe(before.navigation!.height);
  expect(after.rail!.y).toBe(before.rail!.y);
});

test('database slider exposes independent range thumbs and threshold semantics', async ({ page }) => {
  await page.goto('/ui-lab');

  const inputs = page.getByRole('region', { name: 'Inputs' });
  const minimum = inputs.getByRole('slider', { name: 'Blue factor stars minimum' });
  const maximum = inputs.getByRole('slider', { name: 'Blue factor stars maximum' });
  await expect(minimum).toHaveValue('2');
  await expect(maximum).toHaveValue('7');
  await minimum.focus();
  await minimum.press('ArrowRight');
  await expect(minimum).toHaveValue('3');
  await maximum.focus();
  await maximum.press('ArrowLeft');
  await expect(maximum).toHaveValue('6');

  const sliderWrap = minimum.locator('..');
  await expect(sliderWrap.locator('.visual-thumb--start')).toHaveAttribute('style', /--thumb-position:\s*25%;/);
  await expect(sliderWrap.locator('.visual-thumb--end')).toHaveAttribute('style', /--thumb-position:\s*62\.5%;/);
  const transitionSeconds = await sliderWrap.locator('.visual-thumb--start').evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionSeconds).toBeGreaterThan(0);

  const track = inputs.getByRole('button', { name: 'Adjust Blue factor stars on track' });
  await track.scrollIntoViewIfNeeded();
  const trackBounds = await track.boundingBox();
  expect(trackBounds).not.toBeNull();
  await page.mouse.click((trackBounds?.x ?? 0) + (trackBounds?.width ?? 0) * 0.5, (trackBounds?.y ?? 0) + (trackBounds?.height ?? 0) * 0.5);
  await expect(maximum).toHaveValue('5');
  await page.mouse.move((trackBounds?.x ?? 0) + (trackBounds?.width ?? 0) * 0.5, (trackBounds?.y ?? 0) + (trackBounds?.height ?? 0) * 0.5);
  await page.mouse.down();
  await page.mouse.move((trackBounds?.x ?? 0) + (trackBounds?.width ?? 0) * 0.875, (trackBounds?.y ?? 0) + (trackBounds?.height ?? 0) * 0.5, { steps: 5 });
  await page.mouse.up();
  await expect(maximum).toHaveValue('8');

  const threshold = page.getByRole('slider', { name: 'Minimum main-parent stars' });
  await threshold.focus();
  await threshold.press('ArrowRight');
  await expect(threshold).toHaveValue('3');
});

test('extended Angular UI contracts remain functional and mobile-safe', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui-lab');
  const demo = (title: string) => page.locator('article.demo').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

  const characterPicker = demo('Character picker');
  const oguri = characterPicker.getByRole('button', { name: /Oguri Cap/ });
  await oguri.click();
  await expect(oguri).toHaveAttribute('aria-pressed', 'true');

  const supportPicker = demo('Support card picker');
  const staminaCard = supportPicker.getByRole('radio', { name: /A Long-Awaited Chance/ });
  await staminaCard.click();
  await expect(staminaCard).toHaveAttribute('aria-checked', 'true');

  const distanceSelector = demo('Distance selector');
  const mile = distanceSelector.locator('[data-distance="mile"]');
  await mile.click();
  await expect(mile).toHaveAttribute('aria-pressed', 'true');

  const sparkEditor = demo('Inheritance spark editor');
  const speedStars = sparkEditor.getByRole('group', { name: 'Stars for Speed' });
  await speedStars.getByRole('button').nth(1).click();
  await expect(speedStars.getByRole('button').nth(1)).toHaveAttribute('aria-pressed', 'true');

  const resultToolbar = demo('Database result toolbar');
  await resultToolbar.getByRole('button', { name: 'Grid view' }).click();
  await expect(resultToolbar.getByRole('button', { name: 'Grid view' })).toHaveAttribute('aria-pressed', 'true');

  await demo('UQL query editor').getByRole('button', { name: 'Run query' }).click();
  await demo('Inspect popover').getByRole('button', { name: 'Swinging Maestro' }).click();
  await expect(page.getByRole('dialog', { name: 'Swinging Maestro details' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Swinging Maestro details' })).not.toBeVisible();

  const timelineCard = demo('Timeline event, rewards, and pickups');
  await timelineCard.getByRole('button', { name: 'Plan' }).click();
  await expect(timelineCard.getByRole('button', { name: 'Added' })).toHaveAttribute('aria-pressed', 'true');
  await expect(demo('Statistics chart frame').getByText('94', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

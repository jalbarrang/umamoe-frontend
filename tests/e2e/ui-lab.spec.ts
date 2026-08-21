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

  const spark = page.getByLabel('2 star The View from the Lead Is Mine!');
  await expect(spark).toBeVisible();
  await expect(spark.locator('.name')).toHaveText('The View from the Lead Is Mine!');
  const clipping = await spark.locator('.name').evaluate((element) => ({
    overflow: getComputedStyle(element).overflow,
    textOverflow: getComputedStyle(element).textOverflow
  }));
  expect(clipping).toEqual({ overflow: 'visible', textOverflow: 'clip' });
});

test('main-parent and P2 sparks preserve the Angular source accents', async ({ page }) => {
  await page.goto('/ui-lab');

  const main = page.getByLabel(/3 star Speed.*Main parent/);
  const p2 = page.getByLabel(/2 star Swinging Maestro.*P2 legacy/);
  await expect(main).toHaveAttribute('data-source', 'main');
  await expect(p2).toHaveAttribute('data-source', 'p2');
  await expect(main.locator('.source-marker')).toBeVisible();
  await expect(p2.locator('.source-marker')).toBeVisible();

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
      p2: getComputedStyle(document.querySelector<HTMLElement>('[data-source="p2"] .level')!).color,
      warning: resolvedToken('--accent-warning'),
      purple: resolvedToken('--accent-purple')
    };
  });
  expect(colors.main).toBe(colors.warning);
  expect(colors.p2).toBe(colors.purple);
});

test('the UI lab itself uses the canonical responsive shell and page gutters', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/ui-lab');
  const shell = page.locator('[data-ui-lab-shell]');
  const rail = shell.locator('[data-shell-rail]');
  const bottom = shell.locator('[data-shell-bottom]');
  const intro = shell.locator('.lab-intro');

  await expect(rail).toBeHidden();
  await expect(bottom).toBeVisible();
  const mobileIntro = await intro.boundingBox();
  expect(mobileIntro!.x).toBe(16);
  expect(320 - mobileIntro!.x - mobileIntro!.width).toBe(16);

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
  const expandedRail = await rail.boundingBox();
  expect(expandedRail!.width).toBe(240);
  await expect(rail.getByText('Foundation', { exact: true })).toBeVisible();
});

test('Analytics viewport toggles resize the entire UI Lab website', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/ui-lab');
  const viewport = page.locator('.lab-viewport');
  const rail = viewport.locator('[data-shell-rail]');
  const bottom = viewport.locator('[data-shell-bottom]');
  const topAd = viewport.locator('[data-ad-kind="leaderboard"]');

  await page.getByRole('button', { name: '360×800', exact: true }).click();
  await expect(viewport).toHaveAttribute('data-preview-width', '360');
  expect((await viewport.boundingBox())!.width).toBe(360);
  await expect(rail).toBeHidden();
  await expect(bottom).toBeVisible();
  expect((await topAd.boundingBox())!.height).toBe(50);

  await page.getByRole('button', { name: '1366×768', exact: true }).click();
  expect((await viewport.boundingBox())!.width).toBe(1366);
  expect((await rail.boundingBox())!.width).toBe(64);
  await expect(bottom).toBeHidden();

  await page.getByRole('button', { name: '1536×864', exact: true }).click();
  expect((await viewport.boundingBox())!.width).toBe(1536);
  expect((await rail.boundingBox())!.width).toBe(240);
  expect((await topAd.boundingBox())!.height).toBe(90);

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

test('the live UI page displays Publift locations and keeps side rails balanced', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ui-lab');

  const livePage = page.locator('[data-live-page-layout]');
  const frame = livePage.locator('[data-page-frame]');

  const mobileGeometry = await frame.evaluate((element) => {
    const frameBox = element.getBoundingClientRect();
    const pageGridBox = element.querySelector<HTMLElement>('[data-route-id="ui-lab"]')!.getBoundingClientRect();
    const contentBox = element.querySelector<HTMLElement>('[data-page-content]')!.getBoundingClientRect();
    const topAdBox = element.querySelector<HTMLElement>('[data-ad-kind="leaderboard"]')!.getBoundingClientRect();
    const introBox = element.querySelector<HTMLElement>('.lab-intro')!.getBoundingClientRect();
    const inlineAdBox = element.querySelector<HTMLElement>('[data-ad-kind="inline"]')!.getBoundingClientRect();
    const visibleRails = [...element.querySelectorAll<HTMLElement>('[data-ad-kind="rail"]')]
      .filter((rail) => getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().width > 0);
    return {
      contentInset: contentBox.left - frameBox.left,
      topAdInset: topAdBox.left - frameBox.left,
      topAdRightInset: frameBox.right - topAdBox.right,
      topAdPadding: topAdBox.top - pageGridBox.top,
      topAdBottomPadding: introBox.top - topAdBox.bottom,
      inlineHeight: inlineAdBox.height,
      visibleRails: visibleRails.length
    };
  });
  expect(mobileGeometry).toEqual({ contentInset: 16, topAdInset: 2, topAdRightInset: 2, topAdPadding: 16, topAdBottomPadding: 16, inlineHeight: 100, visibleRails: 0 });

  await page.setViewportSize({ width: 1920, height: 1080 });
  const expandedGeometry = await frame.evaluate((element) => {
    const pageGrid = element.querySelector<HTMLElement>('[data-route-id="ui-lab"]')!;
    const frameBox = pageGrid.getBoundingClientRect();
    const content = element.querySelector<HTMLElement>('[data-page-content]')!;
    const utility = document.querySelector<HTMLElement>('[data-shell-utility]')!.getBoundingClientRect();
    const leftRail = element.querySelector<HTMLElement>('[data-ad-position="left-rail"]')!;
    const rails = [...element.querySelectorAll<HTMLElement>('[data-ad-kind="rail"]')]
      .filter((rail) => getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().width > 0)
      .map((rail) => rail.getBoundingClientRect());
    return {
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      railWidths: rails.map((rail) => rail.width),
      leftInset: rails[0]!.left - frameBox.left,
      rightInset: frameBox.right - rails[1]!.right,
      railTopGap: rails[0]!.top - utility.bottom,
      railBottomGap: window.innerHeight - rails[0]!.bottom,
      contentComesFirst: Boolean(content.compareDocumentPosition(leftRail) & Node.DOCUMENT_POSITION_FOLLOWING)
    };
  });
  expect(expandedGeometry.scrollWidth).toBe(expandedGeometry.clientWidth);
  expect(expandedGeometry.railWidths).toEqual([160, 160]);
  expect(expandedGeometry.leftInset).toBe(expandedGeometry.rightInset);
  expect(expandedGeometry.railTopGap).toBe(expandedGeometry.railBottomGap);
  expect(expandedGeometry.contentComesFirst).toBe(true);
  await expect(frame.locator('[data-route-id="ui-lab"]')).toHaveAttribute('data-feature-id', 'ui-system');
  await expect(frame.locator('[data-route-id="ui-lab"]')).toHaveAttribute('data-page-width', 'wide');
  await expect(frame.locator('[data-ad-kind="leaderboard"]')).toHaveAttribute('data-ad-sizes', '1200x90,970x90,728x90,468x90,320x50,300x50');
  await expect(frame.locator('[data-ad-kind="inline"]')).toHaveAttribute('data-ad-sizes', '970x90,728x90,468x90,468x60,320x100,300x100,320x50,300x50');
  await expect(frame.locator('[data-ad-position="left-rail"] [data-ad-kind="rail"]')).toHaveAttribute('data-ad-sizes', '160x600,120x600');
  await expect(frame.locator('[data-ad-position="right-rail"] [data-ad-kind="rail"]')).toHaveAttribute('data-ad-sizes', '160x600,120x600');
});

test('database slider exposes independent range thumbs and threshold semantics', async ({ page }) => {
  await page.goto('/ui-lab');

  const minimum = page.getByRole('slider', { name: 'Blue factor stars minimum' });
  const maximum = page.getByRole('slider', { name: 'Blue factor stars maximum' });
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

  const track = page.getByRole('button', { name: 'Adjust Blue factor stars on track' });
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

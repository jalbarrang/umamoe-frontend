import { expect, test } from '@playwright/test';

const viewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 }
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

test('shell and page fixtures switch at the canonical screen breakpoints', async ({ page }) => {
  await page.goto('/ui-lab');

  const shell = page.locator('article.demo').filter({ hasText: 'Responsive shell fixture' });
  const layouts = page.locator('article.demo').filter({ hasText: 'Responsive page layouts' });

  await shell.getByRole('button', { name: '320', exact: true }).click();
  await expect(shell.locator('[data-shell-mode]')).toHaveAttribute('data-shell-mode', 'mobile');
  await shell.getByRole('button', { name: '768', exact: true }).click();
  await expect(shell.locator('[data-shell-mode]')).toHaveAttribute('data-shell-mode', 'compact');
  await shell.getByRole('button', { name: '1440', exact: true }).click();
  await expect(shell.locator('[data-shell-mode]')).toHaveAttribute('data-shell-mode', 'expanded');

  await layouts.getByRole('button', { name: '320', exact: true }).click();
  const mobileAside = await layouts.locator('aside[aria-label="Filters"]').boundingBox();
  const mobileContent = await layouts.locator('section[aria-label="Results"]').boundingBox();
  expect(mobileContent!.y).toBeGreaterThan(mobileAside!.y);

  await layouts.getByRole('button', { name: '768', exact: true }).click();
  await expect(layouts.locator('[data-layout-mode]')).toHaveAttribute('data-layout-mode', 'compact');
  const compactAside = await layouts.locator('aside[aria-label="Filters"]').boundingBox();
  const compactContent = await layouts.locator('section[aria-label="Results"]').boundingBox();
  expect(compactContent!.x).toBeGreaterThan(compactAside!.x);
});

test('page frame keeps content gutters and Publift rails balanced', async ({ page }) => {
  await page.goto('/ui-lab');

  const demo = page.locator('article.demo').filter({ hasText: 'Page gutters and ad regions' });
  const frame = demo.locator('.frame');
  await demo.getByRole('button', { name: '320', exact: true }).click();

  const mobileGeometry = await frame.evaluate((element) => {
    const frameBox = element.getBoundingClientRect();
    const contentBox = element.querySelector<HTMLElement>('[data-page-content]')!.getBoundingClientRect();
    const topAdBox = element.querySelector<HTMLElement>('[data-ad-kind="leaderboard"]')!.getBoundingClientRect();
    const visibleRails = [...element.querySelectorAll<HTMLElement>('[data-ad-kind="rail"]')]
      .filter((rail) => getComputedStyle(rail).display !== 'none' && rail.getBoundingClientRect().width > 0);
    return {
      contentInset: contentBox.left - frameBox.left,
      topAdInset: topAdBox.left - frameBox.left,
      topAdRightInset: frameBox.right - topAdBox.right,
      visibleRails: visibleRails.length
    };
  });
  expect(mobileGeometry).toEqual({ contentInset: 16, topAdInset: 2, topAdRightInset: 2, visibleRails: 0 });

  await demo.getByRole('button', { name: '1440', exact: true }).click();
  const expandedGeometry = await frame.evaluate((element) => {
    const frameBox = element.getBoundingClientRect();
    const content = element.querySelector<HTMLElement>('[data-page-content]')!;
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
      contentComesFirst: Boolean(content.compareDocumentPosition(leftRail) & Node.DOCUMENT_POSITION_FOLLOWING)
    };
  });
  expect(expandedGeometry.scrollWidth).toBe(expandedGeometry.clientWidth);
  expect(expandedGeometry.railWidths).toEqual([160, 160]);
  expect(expandedGeometry.leftInset).toBe(expandedGeometry.rightInset);
  expect(expandedGeometry.contentComesFirst).toBe(true);
  await expect(frame.locator('[data-route-id="database"]')).toHaveAttribute('data-feature-id', 'catalog');
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

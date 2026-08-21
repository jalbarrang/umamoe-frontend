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

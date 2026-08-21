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
    await expect(page.getByRole('heading', { name: 'Fast, quiet, useful UI.' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width);
  });
}

test('theme, density, dialog, and virtual list remain functional', async ({ page }) => {
  await page.goto('/ui-lab');
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

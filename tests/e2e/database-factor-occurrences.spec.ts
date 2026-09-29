import { expect, test, setSliderValue, replaceQuery } from './fixtures/test';
import { mockDatabase, mockAffinity } from './fixtures/api';

test('factor toggles retain both ranges and main-parent AND/OR after reload', async ({ page }) => {
  await mockDatabase(page);
  await mockAffinity(page);
  const state = { fm: 'advanced', w: [[201600, 1, 9]], mb: [[10, 1, 3]] };
  await page.goto('/database?filters=' + encodeURIComponent(Buffer.from(JSON.stringify(state)).toString('base64')));
  const openFilters = async () => {
    await page.getByRole('button', { name: 'Filters', exact: true }).click();
    await page.getByRole('radio', { name: 'Advanced', exact: true }).click();
    for (const group of ['inheritance', 'main']) {
      const header = page.locator(`[data-filter-group="${group}"] .group-title`);
      if (await header.getAttribute('aria-expanded') === 'false') await header.click();
    }
  };
  await openFilters();
  const white = page.locator('#white-factors');
  await setSliderValue(white.locator('input[type="range"]').first(), 7);
  await white.getByRole('radio', { name: '×', exact: true }).click();
  await setSliderValue(white.locator('input[type="range"]').first(), 3);
  await white.getByRole('radio', { name: '★', exact: true }).click();
  await expect(white.locator('input[type="range"]').first()).toHaveValue('7');
  await white.getByRole('radio', { name: '×', exact: true }).click();
  await expect(white.locator('input[type="range"]').first()).toHaveValue('3');
  const main = page.locator('#main-blue');
  await main.getByRole('button', { name: 'Add Blue Factor (Stats)', exact: true }).click();
  await main.getByRole('radio', { name: 'OR', exact: true }).click();
  const first = main.locator('.requirement').first();
  await first.getByRole('radio', { name: '×', exact: true }).click();
  await expect(first.locator('input[type="range"]').last()).toHaveAttribute('max', '1');
  await setSliderValue(first.locator('input[type="range"]').first(), 1);
  await first.getByRole('radio', { name: '★', exact: true }).click();
  await setSliderValue(first.locator('input[type="range"]').first(), 2);
  await setSliderValue(first.locator('input[type="range"]').last(), 2);
  await expect(first.locator('small')).toHaveText('2–2★ · 1–1×');
  await expect.poll(() => page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('database-filter-state-v2')!);
    return JSON.parse(atob(saved.formState)).w[0].slice(1);
  })).toEqual([7, 9, null, 3, 3, 1]);
  await white.screenshot({ path: test.info().outputPath('factor-occurrences.png') });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
  // A shared URL intentionally takes precedence over saved preferences.
  await page.evaluate(() => history.replaceState(null, '', '/database'));
  await page.reload();
  await openFilters();
  await expect(white.getByRole('radio', { name: '×', exact: true })).toBeChecked();
  await expect(white.locator('input[type="range"]').first()).toHaveValue('3');
  await expect(main.getByRole('radio', { name: 'OR', exact: true })).toBeChecked();
  await expect(main.locator('.requirement').first().locator('small')).toHaveText('2–2★ · 1–1×');
  await page.getByRole('radio', { name: 'UQL', exact: true }).click();
  await replaceQuery(page.getByRole('textbox', { name: 'UQL query', exact: true }), 'Groundwork > 6 and Groundwork = 3x');
  await expect(page.locator('.uql-status')).toContainText('Valid');
});

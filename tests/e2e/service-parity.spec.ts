import { expect, test } from './fixtures/test';
import { mockDatabase } from './fixtures/angular-api';

test('rate limits reach the shared UI and can be dismissed before retrying', async ({ page }) => {
  await mockDatabase(page);
  await page.route('**/search/query*', route => route.fulfill({ status: 429, headers: { 'retry-after': '3' }, json: { error: 'rate_limited' } }));
  await page.goto('/database');
  const dialog = page.getByRole('dialog', { name: 'Too many requests' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('before trying again');
  await dialog.getByRole('button', { name: 'Dismiss', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
});

test('status details, build notification, and changelog work on desktop and mobile', async ({ page }) => {
  await page.route('**/tools', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('name="app-build-version" content="local"', 'name="app-build-version" content="beta-build.1.1"') });
  });
  await page.route('**/version.json*', route => route.fulfill({ json: { version: 'beta-build.2.1' } }));
  await page.goto('/tools');
  await expect(page.getByText('Update available', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Later', exact: true }).click();
  const status = page.getByRole('button', { name: 'Service status', exact: true });
  await status.scrollIntoViewIfNeeded(); await status.click();
  const details = page.getByRole('dialog', { name: 'Service status', exact: true });
  await expect(details).toContainText('All systems operational');
  await expect(details).toContainText('API');
  await details.getByRole('button', { name: 'Close Service status' }).click();
  await page.getByRole('button', { name: 'What’s new', exact: true }).click();
  const updates = page.getByRole('dialog', { name: 'What’s new', exact: true });
  await expect(updates).toContainText('Carat Planner Accuracy and Sync');
  await updates.getByRole('button', { name: 'Got it', exact: true }).click();
  await expect(page.getByText('Carat Planner Accuracy and Sync', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'What’s new', exact: true }).click();
  await expect(updates).toBeVisible();
  await updates.getByRole('button', { name: 'Got it', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('lastSeenUpdateVersion'))).toBe('16');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
});

test('route changes refresh canonical, social, and structured metadata without private query values', async ({ page }) => {
  await page.goto('/tools?tokenless=private');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://uma.moe/tools');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://uma.moe/tools');
  await page.getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://uma.moe/privacy-policy');
  await page.goto('/settings');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('#page-structured-data')).toHaveCount(0);
});

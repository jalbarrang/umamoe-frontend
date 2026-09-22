import { expect, test } from '@playwright/test';
import { mockAdvertising, mockResources } from './fixtures/api';

test.beforeEach(async ({ context }) => {
  await mockAdvertising(context);
  await mockResources(context);
  await context.addInitScript(() => {
    localStorage.setItem('page-introduction-audience-v1', 'existing');
    localStorage.setItem('lastSeenUpdateVersion', '17');
    localStorage.setItem('lineage-planner-saves-v1', '{"Keep me":[]}');
  });
});

test('a failed entry script offers recovery without losing the URL or saved plans', async ({ page }) => {
  let failing = true;
  await page.route(/\/(?:app\/index-[\w-]+\.js|src\/main\.ts)(?:\?.*)?$/, route => failing ? route.abort('failed') : route.continue());
  await page.goto('/tools?keep=1#section');
  const error = page.locator('#app-error');
  await expect(error).toBeVisible();
  await expect(error.getByRole('link', { name: 'Report on Discord' })).toBeVisible();
  await error.locator('summary').click();
  await expect(error.locator('pre')).toContainText('could not be downloaded');
  await expect(error.locator('pre')).toContainText('Browser:');
  await expect(error.locator('pre')).toContainText('Build:');
  failing = false;
  await error.getByRole('button', { name: 'Reload page' }).click();
  await expect(page.getByRole('heading', { name: 'Tools & Calculators', exact: true })).toBeVisible();
  await expect(error).toBeHidden();
  await expect(page).toHaveURL(/\/tools\?keep=1#section$/);
  expect(await page.evaluate(() => localStorage.getItem('lineage-planner-saves-v1'))).toBe('{"Keep me":[]}');
});

test('render failures show the independent fallback', async ({ page }) => {
  await page.route(/\/PrivacyPage(?:-[\w-]+\.js|\.svelte)(?:\?.*)?$/, route => route.fulfill({
    contentType: 'application/javascript',
    body: 'export default function () { throw new TypeError("A browser feature is unavailable"); }'
  }));
  await page.goto('/privacy-policy');
  const error = page.locator('#app-error');
  await expect(error).toBeVisible();
  await error.locator('summary').click();
  await expect(error.locator('pre')).toContainText('A browser feature is unavailable');
  expect(await page.evaluate(() => localStorage.getItem('lineage-planner-saves-v1'))).toBe('{"Keep me":[]}');
});

test('app runtime errors are visible while unrelated third-party errors are ignored', async ({ page }) => {
  await page.goto('/tools');
  await expect(page.getByRole('heading', { name: 'Tools & Calculators', exact: true })).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', {
    filename: 'https://third-party.invalid/ad.js', message: 'An ad failed'
  })));
  await expect(page.locator('#app-error')).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new ErrorEvent('error', {
    filename: location.origin + '/app/index-test.js',
    error: new TypeError('Failed: ' + location.origin + '/app/file.js?token=private#secret')
  })));
  const error = page.locator('#app-error');
  await expect(error).toBeVisible();
  await error.locator('summary').click();
  await expect(error.locator('pre')).toContainText('/app/file.js');
  await expect(error.locator('pre')).not.toContainText('private');
  await expect(error.locator('pre')).not.toContainText('secret');
});

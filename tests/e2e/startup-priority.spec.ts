import { expect, test } from './fixtures/test';
import { profile, veteran } from './fixtures/api';

test('initial Veterans data takes priority over background page warming', async ({ page }, info) => {
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'startup-fixture');
    localStorage.setItem('uma:active-workspace', 'account:123456789012');
    localStorage.setItem('uma-browser-proof-v1', JSON.stringify({ token: 'fixture-proof', expiresAt: Date.now() + 60_000 }));
  });
  const starts: Record<string, number[]> = {};
  const origin = Date.now();
  let profileFinished = 0;
  page.on('request', request => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/api/auth/') || path.startsWith('/api/v4/user/profile/') || /\/(?:LineagePlannerPage|VeteransBrowserPage)-.*\.js$/.test(path)) (starts[path] ??= []).push(Date.now() - origin);
  });
  await page.route('**/api/auth/me', async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({ json: { id: 'owner', display_name: 'Owner', created_at: '' } });
  });
  await page.route('**/api/auth/accounts', async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({ json: [{ id: 1, account_id: '123456789012', trainer_name: 'Owner', verification_status: 'verified' }] });
  });
  await page.route('**/api/v4/user/profile/123456789012', async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    profileFinished = Date.now() - origin;
    await route.fulfill({ json: { ...profile, veterans: Array.from({ length: 234 }, (_, id) => ({ ...veteran, id: id + 1, trained_chara_id: id + 1 })) } });
  });
  await page.goto('/veterans');
  await expect(page.locator('.veteran-card').first()).toBeVisible();
  const visible = Date.now() - origin;
  await expect.poll(() => Object.keys(starts).some(path => path.includes('/LineagePlannerPage-'))).toBe(true);
  const dataStart = starts['/api/v4/user/profile/123456789012']![0]!;
  const backgroundStart = Object.entries(starts).find(([path]) => path.includes('/LineagePlannerPage-'))![1][0]!;
  const measurements = { dataStart, profileFinished, visible, backgroundStart, starts };
  await info.attach('startup-timing', { body: JSON.stringify(measurements), contentType: 'application/json' });
  console.info('Startup priority:', JSON.stringify(measurements));
  expect.soft(Math.abs(starts['/api/auth/me']![0]! - starts['/api/auth/accounts']![0]!)).toBeLessThan(150);
  expect.soft(starts['/api/auth/accounts']).toHaveLength(1);
  expect.soft(backgroundStart).toBeGreaterThanOrEqual(profileFinished);
});

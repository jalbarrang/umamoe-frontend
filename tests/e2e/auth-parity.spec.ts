import { expect, test } from './fixtures/test';

test('OAuth redirects to any app page replace an old token and recover from temporary verification failures', async ({ page }) => {
  let unavailable = true;
  const tokens: string[] = [];
  await page.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('auth_token', 'old-session'); sessionStorage.setItem('seeded', 'true'); } });
  await page.route('**/api/auth/accounts', route => route.fulfill({ json: [] }));
  await page.route('**/api/auth/me', route => {
    tokens.push(route.request().headers().authorization ?? '');
    return unavailable ? route.fulfill({ status: 503, json: { message: 'Temporarily unavailable' } }) : route.fulfill({ json: { id: 'fixture-user', display_name: 'Parity User' } });
  });
  await page.goto('/?token=oauth-new-session');
  await expect(page.getByText('Sign-in failed', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/signin$/);
  expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBe('oauth-new-session');
  expect(tokens.every(token => token === 'Bearer oauth-new-session')).toBe(true);
  unavailable = false;
  await page.getByRole('button', { name: 'Retry sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/database?token=another-session');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBe('another-session');
});

test('Google and Discord keep their login endpoints and recover from provider errors', async ({ page }) => {
  const providers: string[] = [];
  await page.route('**/api/auth/login/*?*', (route) => {
    const url = new URL(route.request().url());
    providers.push(url.pathname.split('/').at(-1)!);
    expect(url.searchParams.get('origin')).toBe(new URL(page.url()).origin);
    return route.fulfill({ status: 503, json: { message: 'Sign-in temporarily unavailable' } });
  });
  await page.goto('/login');
  for (const provider of ['Google', 'Discord']) {
    const button = page.getByRole('button', { name: `Sign in with ${provider}`, exact: true });
    await button.click();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(button).toBeEnabled();
  }
  // The shared GET pipeline retries a 503 once before returning the error.
  expect(providers).toEqual(['google', 'google', 'discord', 'discord']);
});

test('sign-in callback preserves the token contract and clears rejected sessions', async ({ page }) => {
  let accepted = true;
  await page.route('**/api/auth/accounts', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/auth/me', (route) => accepted
    ? route.fulfill({ json: { id: 'fixture-user', display_name: 'Parity User', created_at: '2026-01-01T00:00:00Z' } })
    : route.fulfill({ status: 401, json: { message: 'Expired session' } }));
  await page.goto('/signin?token=parity-token');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('link', { name: 'Open settings', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBe('parity-token');
  await page.evaluate(() => sessionStorage.setItem('auth_return_to', 'https://example.com/'));
  await page.goto('/signin?token=parity-token');
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => sessionStorage.getItem('auth_return_to'))).toBeNull();
  accepted = false;
  await page.goto('/signin?token=expired-token');
  await expect(page.getByText('Sign-in failed', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('auth_token'))).toBeNull();
  await page.getByRole('link', { name: 'Return to sign in.' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

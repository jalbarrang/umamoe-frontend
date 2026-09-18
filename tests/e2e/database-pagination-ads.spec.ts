import { expect, test } from './fixtures/test';
import { mockDatabase, record } from './fixtures/api';

test.use({ locale: 'en-US' });

test('database pagination shows nearby pages, result ranges and direct page navigation', async ({ page, isMobile }) => {
  await mockDatabase(page);
  await page.route('**/search/query?*', route => {
    const current = Number(new URL(route.request().url()).searchParams.get('page'));
    const item = record(); item.trainer_name = `Page ${current + 1} Trainer`;
    return route.fulfill({ json: { items: [item], total: 10000, page: current, limit: 12, total_pages: 834 } });
  });
  await page.goto('/database?page=2');
  const pagination = page.getByRole('navigation', { name: 'Pagination', exact: true });
  await expect(pagination).toContainText('13–24 of 10,000 results');
  if (!isMobile) {
    await expect(pagination.getByRole('button', { name: 'Page 3', exact: true })).toBeVisible();
    await expect(pagination.getByRole('button', { name: 'Page 5', exact: true })).toBeVisible();
  }
  const jump = pagination.getByRole('spinbutton', { name: 'Go to page' });
  await jump.fill('417'); await jump.press('Enter');
  await expect(page.locator('.inheritance-card')).toContainText('Page 417 Trainer');
  await expect(pagination).toContainText('4,993–5,004 of 10,000 results');
  await pagination.getByRole('button', { name: 'Next page', exact: true }).click();
  await expect(page).toHaveURL(/page=418/);
  await pagination.getByRole('button', { name: 'Previous page', exact: true }).click();
  await expect(page).toHaveURL(/page=417/);
  await jump.fill('834'); await pagination.getByRole('button', { name: 'Go', exact: true }).click();
  await expect(pagination).toContainText('9,997–10,000 of 10,000 results');
  await expect(pagination.getByRole('button', { name: 'Next page', exact: true })).toBeDisabled();
  await jump.fill('835'); await jump.press('Enter');
  expect(await jump.evaluate(element => (element as HTMLInputElement).validity.rangeOverflow)).toBe(true);
  await expect(page).toHaveURL(/page=834/);
  await jump.fill('834');
  await pagination.screenshot({ path: test.info().outputPath('database-pagination.png') });
  await page.setViewportSize({ width: 320, height: 640 });
  await expect(jump).toBeVisible();
  expect(await pagination.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await pagination.screenshot({ path: test.info().outputPath('database-pagination-320.png') });
});

test('database uses configured in-content slots through 1300px and registers only visible placements', async ({ page }) => {
  await page.setViewportSize({ width: 1300, height: 900 });
  await mockDatabase(page);
  await page.route('**/search/query?*', route => route.fulfill({ json: {
    items: Array.from({ length: 12 }, (_, index) => { const item = record(String(123456789012 + index)); item.inheritance.inheritance_id = index + 1; return item; }),
    total: 12, page: 0, limit: 12, total_pages: 1
  } }));
  await page.route('https://cdn.fuseplatform.net/**/fuse.js', route => route.fulfill({ contentType: 'application/javascript', body: `
    window.adRegistrations = [];
    window.fusetag = { registerZone(id) {
      const element = document.getElementById(id);
      window.adRegistrations.push({ id, fuse: element.dataset.fuse, width: element.getBoundingClientRect().width });
      element.textContent = 'Test advertisement';
    }, pageInit() {} };
  ` }));
  await page.goto('/database');
  const inline = page.locator('[data-ad-kind="inline"]');
  const right = page.locator('[data-ad-position="right-rail"]');
  await expect(inline).toHaveCount(2);
  await expect(inline.first()).toBeVisible(); await expect(right).toBeHidden();
  await expect(page.locator('[data-ad-target="database_interscroller_1"]')).toHaveAttribute('data-fuse', 'database_incontent_1');
  await expect(page.locator('[data-ad-target="database_interscroller_2"]')).toHaveAttribute('data-fuse', 'database_incontent_2');
  await expect.poll(() => page.evaluate(() => (window as unknown as { adRegistrations: Array<{ id: string }> }).adRegistrations?.map(item => item.id))).toEqual(['ad-database_interscroller_1', 'ad-database_interscroller_2']);
  const middle = page.locator('.inheritance-list [data-ad-kind="inline"]');
  expect(await middle.evaluate(element => [...element.parentElement!.children].slice(0, [...element.parentElement!.children].indexOf(element)).filter(sibling => sibling.matches('.inheritance-card')).length)).toBe(6);
  for (const width of [1301, 1299, 1300, 390]) {
    await page.setViewportSize({ width, height: 900 });
    if (width > 1300) {
      await expect(right).toBeVisible(); await expect(inline.first()).toBeHidden();
      await expect.poll(() => page.evaluate(() => (window as unknown as { adRegistrations: Array<{ id: string }> }).adRegistrations.some(item => item.id === 'ad-database_sticky_vrec_right'))).toBe(true);
    } else { await expect(right).toBeHidden(); await expect(inline.first()).toBeVisible(); }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const registrations = await page.evaluate(() => (window as unknown as { adRegistrations: Array<{ width: number }> }).adRegistrations);
  expect(registrations.every(item => item.width > 0)).toBe(true);
});

import { test, expect } from './fixtures/test';
import { mockDatabase, mockVeteranProfile, profile, veteran, record, mockTimeline } from './fixtures/api';

test('database keeps 600 results searchable while bounding mounted cards on deep scrolling', async ({ page }) => {
  await mockDatabase(page);
  await page.route('**/search/query?*', route => route.fulfill({ json: {
    items: Array.from({ length: 600 }, (_, index) => {
      const item = record(String(123456789012 + index));
      item.inheritance.inheritance_id = index + 1;
      item.trainer_name = `Scroll Trainer ${index}`;
      return item;
    }), total: 600, page: 0, limit: 600, total_pages: 1,
  } }));
  await page.goto('/database?page=1');
  const list = page.locator('.inheritance-list').first();
  await expect(list.locator('.inheritance-card').first()).toContainText('Scroll Trainer 0');
  await expect.poll(() => list.locator('.inheritance-card').count()).toBeLessThan(25);
  await list.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY + 520 * 640, behavior: 'instant' }));
  await expect.poll(async () => Number(await list.locator('[data-virtual-index]').first().getAttribute('data-virtual-index'))).toBeGreaterThan(400);
  await expect.poll(() => list.locator('.inheritance-card').count()).toBeLessThan(25);
  await expect(list.getByText('Scroll Trainer 0', { exact: true })).toHaveCount(0);
  await list.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY, behavior: 'instant' }));
  await expect(list.locator('.inheritance-card').first()).toContainText('Scroll Trainer 0');
  await expect.poll(() => list.locator('.inheritance-card').count()).toBeLessThan(25);
});

test('Veterans evicts distant cards and table rows while preserving the complete filtered collection', async ({ page }) => {
  await mockVeteranProfile(page);
  await page.route('**/api/v4/user/profile/123456789012', route => route.fulfill({ json: { ...profile,
    veterans: Array.from({ length: 600 }, (_, index) => ({ ...veteran, id: index + 1, trained_chara_id: index + 1 })),
  } }));
  await page.goto('/veterans/123456789012');
  const grid = page.locator('.veteran-grid');
  await expect(grid.locator('.veteran-card').first()).toBeVisible();
  await grid.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY + node.scrollHeight * .8, behavior: 'instant' }));
  await expect.poll(async () => Number(await grid.locator('[data-virtual-index]').first().getAttribute('data-virtual-index'))).toBeGreaterThan(350);
  expect(await grid.locator('.veteran-card').count()).toBeLessThan(50);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.getByRole('button', { name: 'Display options', exact: true }).click();
  await page.getByRole('combobox', { name: 'View', exact: true }).click();
  await page.getByRole('option', { name: 'Table', exact: true }).click();
  const table = page.locator('.table-wrap tbody');
  await expect(table.locator('[data-virtual-index]').first()).toBeVisible();
  await table.evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY + node.scrollHeight * .8, behavior: 'instant' }));
  await expect.poll(async () => Number(await table.locator('[data-virtual-index]').first().getAttribute('data-virtual-index'))).toBeGreaterThan(350);
  expect(await table.locator('[data-virtual-index]').count()).toBeLessThan(60);
});


test('profile history tables keep distant records out of the DOM', async ({ page }) => {
  await mockVeteranProfile(page);
  await page.route('**/api/v4/user/profile/123456789012', route => route.fulfill({ json: { ...profile,
    circle_history: Array.from({ length: 600 }, (_, index) => ({ ...profile.circle_history[0], circle_id: index + 1, circle_name: 'History Club ' + index })),
  } }));
  await page.goto('/profile/123456789012');
  const table = page.getByRole('table', { name: 'Circle History', exact: true });
  await table.locator('tbody').evaluate(node => window.scrollTo({ top: node.getBoundingClientRect().top + scrollY + node.scrollHeight * .8, behavior: 'instant' }));
  await expect.poll(async () => Number(await table.locator('[data-virtual-index]').first().getAttribute('data-virtual-index'))).toBeGreaterThan(350);
  expect(await table.locator('[data-virtual-index]').count()).toBeLessThan(100);
  await expect(table.getByText('History Club 0', { exact: true })).toHaveCount(0);
});

test('horizontal Timeline evicts earlier events within a dense day', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile uses the independently virtualized date feed.');
  await mockTimeline(page);
  await page.route('**/resources/test/banner_timeline.json*', route => route.fulfill({ json: {
    events: Array.from({ length: 600 }, (_, index) => ({ id: 'dense-' + index, type: 'character_banner', title: 'Dense banner ' + index,
      global_release_date: '2026-09-01T00:00:00Z', is_confirmed: true })),
  } }));
  await page.goto('/timeline');
  const board = page.locator('.timeline-board.horizontal');
  await expect(board.locator('.event-card').first()).toBeVisible();
  expect(await board.locator('.event-card').count()).toBeLessThan(30);
  await board.evaluate(node => node.scrollTo({ top: node.scrollHeight * .8, behavior: 'instant' }));
  await expect.poll(async () => Number(await board.locator('.lane-events [data-virtual-index]').first().getAttribute('data-virtual-index'))).toBeGreaterThan(300);
  expect(await board.locator('.event-card').count()).toBeLessThan(30);
});

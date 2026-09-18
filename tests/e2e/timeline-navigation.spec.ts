import { test, expect, type Page } from './fixtures/test';
import { mockTimeline } from './fixtures/api';

async function sectionLink(page: Page, name: string) {
  const mobile = await page.getByRole('button', { name:'Open navigation', exact:true }).isVisible();
  if (mobile) await page.getByRole('button', { name:'Open navigation', exact:true }).click();
  const navigation = page.getByRole('navigation', { name:mobile ? 'Mobile navigation' : 'Main navigation', exact:true });
  const toggle = navigation.getByRole('button', { name:new RegExp(`^(Open|Collapse) ${name} subsections$`) });
  if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.click();
  return navigation.getByRole('link', { name, exact:true });
}

test('Navigation, Timeline data, planner code and planner data show spinners while pending', async ({ page }) => {
  await mockTimeline(page, false);
  const releases: (() => void)[] = [];
  async function hold(pattern: string | RegExp) {
    let release!: () => void;
    const pending = new Promise<void>(resolve => release = resolve);
    releases.push(release);
    await page.route(pattern, async route => { await pending; await route.fallback(); });
    return release;
  }
  const timelineCode = await hold(/\/TimelinePage(?:-[\w-]+\.js|\.svelte)(?:\?.*)?$/);
  const timelineData = await hold('**/resources/test/banner_timeline.json*');
  const rewardData = await hold('**/resources/test/planner_rewards.json*');
  const plannerCode = await hold(/\/CaratPlanner(?:-[\w-]+\.js|\.svelte)(?:\?.*)?$/);
  const plannerData = await hold('**/resources/test/planner_core.json*');
  const detailsCode = await hold(/\/TimelineEventDetails(?:-[\w-]+\.js|\.svelte)(?:\?.*)?$/);
  let plannerRequested = false, detailsRequested = false;
  page.on('request', request => {
    if (/\/CaratPlanner(?:-|\.svelte)/.test(request.url())) plannerRequested = true;
    if (/\/TimelineEventDetails(?:-|\.svelte)/.test(request.url())) detailsRequested = true;
  });
  try {
    await page.goto('/tools');
    await (await sectionLink(page, 'Timeline')).evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page.locator('.utility-actions .spinner')).toHaveText('Loading Timeline');
    await expect(page.locator('.route-view')).toHaveAttribute('aria-busy', 'true');
    timelineCode();
    await expect(page.locator('.spinner').filter({ hasText: 'Loading Timeline data' })).toBeVisible();
    await expect(page.locator('.utility-actions .spinner')).toHaveCount(0);
    timelineData();
    await expect(page.locator('.timeline-board')).toBeVisible();
    await expect(page.locator('.timeline-tabs .spinner')).toHaveText('Loading event rewards');
    rewardData();
    await expect(page.locator('.timeline-tabs .spinner')).toHaveCount(0);
    expect(plannerRequested).toBe(false);
    expect(detailsRequested).toBe(false);
    await page.getByRole('link', { name: /Carat Planner/ }).evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page.locator('.spinner').filter({ hasText: 'Loading Carat Planner' })).toBeVisible();
    plannerCode();
    await expect(page.locator('.planner .spinner').filter({ hasText: 'Loading planner data' })).toBeVisible();
    plannerData();
    await expect(page.locator('.planner .spinner').filter({ hasText: 'Loading planner data' })).toHaveCount(0);
    await page.getByRole('navigation', { name: 'Timeline tools' }).getByRole('link', { name: 'Timeline', exact: true }).click();
    await page.getByRole('button', { name: 'Open details for Mejiro McQueen Pickup', exact: true }).click();
    await expect(page.locator('.spinner').filter({ hasText: 'Loading event details' })).toBeVisible();
    detailsCode();
    await expect(page.getByRole('dialog', { name: 'Mejiro McQueen Pickup', exact: true })).toBeVisible();
  } finally { releases.forEach(release => release()); }
});

for (const eventCount of [5, 1000]) test(`Preloaded Timeline transitions paint within 100 ms with ${eventCount} events`, async ({ page, isMobile }, testInfo) => {
  test.skip(isMobile, 'Measured at the reported desktop resolution. Mobile loading is covered above.');
  await mockTimeline(page, false);
  if (eventCount > 5) {
    const events = Array.from({ length: eventCount }, (_, index) => ({
      id: `performance-${index}`, type: 'character_banner', title: `Release ${index}`,
      global_release_date: new Date(Date.UTC(2026, 2, 1 + index)).toISOString(), is_confirmed: true
    }));
    await page.route('**/resources/test/banner_timeline.json*', route => route.fulfill({ json: { events } }));
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/tools');
  const prepared = page.waitForResponse(response => response.url().includes('/banner_timeline.json'));
  await (await sectionLink(page, 'Timeline')).hover();
  await prepared;
  await expect(page.locator('.utility-actions .spinner')).toHaveCount(0);
  const durations: number[] = [];
  for (let visit = 0; visit < 5; visit++) {
    await sectionLink(page, 'Timeline');
    durations.push(await page.evaluate(() => new Promise<number>(resolve => {
      const start = performance.now();
      const frame = () => {
        const board = document.querySelector<HTMLElement>('.timeline-board');
        if (board?.clientWidth && board.querySelector('.event-card')) requestAnimationFrame(() => resolve(performance.now() - start));
        else requestAnimationFrame(frame);
      };
      document.querySelector<HTMLAnchorElement>('.subsection-parent[href="/timeline"]')!.click();
      requestAnimationFrame(frame);
    })));
    await (await sectionLink(page, 'Tools')).click();
    await expect(page.locator('[data-route-id="tools"]')).toBeVisible();
  }
  await testInfo.attach('click-to-painted-timeline-ms', { body: JSON.stringify(durations), contentType: 'application/json' });
  console.info('Click to painted Timeline (ms):', durations.map(duration => Math.round(duration)));
  expect(Math.max(...durations), `Click to painted Timeline: ${durations.join(', ')} ms`).toBeLessThan(100);
});

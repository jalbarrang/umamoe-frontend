import { test, expect, replaceQuery, type Page } from '../e2e/fixtures/test';
import { stressData, stressCatalogs } from './data';
import { writeFile } from 'node:fs/promises';

async function save(name: string, value: unknown) { await writeFile(test.info().outputPath(name), JSON.stringify(value)); }

test.setTimeout(300_000);
test.beforeEach(async ({ page, context }) => {
  page.setDefaultTimeout(30_000);
  await stressData(page);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.PERF_CPU ?? 8) });
  await page.addInitScript(() => {
    const metrics = (window as any).__stress = { label: '', paints: [] as any[], events: [] as any[], tasks: [] as any[] };
    new PerformanceObserver(list => metrics.events.push(...list.getEntries().map((e: any) => ({ label: metrics.label, duration: e.duration, name: e.name, interaction: e.interactionId })))).observe({ type: 'event', durationThreshold: 16, buffered: true });
    new PerformanceObserver(list => metrics.tasks.push(...list.getEntries().map(e => ({ label: metrics.label, duration: e.duration })))).observe({ type: 'longtask', buffered: true });
    for (const type of ['click', 'input']) document.addEventListener(type, () => {
      const start = performance.now(), label = metrics.label;
      requestAnimationFrame(() => setTimeout(() => metrics.paints.push({ label, ms: performance.now() - start }), 0));
    }, true);
  });
});

async function action(page: Page, label: string, run: () => Promise<unknown>) {
  console.log('Measuring', label);
  await page.evaluate(label => (window as any).__stress.label = label, label);
  await run();
  await page.waitForTimeout(700); // Allow EventTiming delivery and any debounced search to settle.
  await page.evaluate(() => (window as any).__stress.label = '');
}

test.afterEach(async ({ page }, info) => {
  const metrics = await page.evaluate(() => ({ ...(window as any).__stress, dom: document.querySelectorAll('*').length }));
  await info.attach('interaction-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
  await save('metrics.json', metrics);
  console.log(info.title, JSON.stringify(metrics.paints));
});

test('dense database: display modes, filters, picker, UQL and accumulated results', async ({ page, context }) => {
  await page.goto('/database');
  await expect(page.locator('.inheritance-card')).toHaveCount(12, { timeout: 60_000 });
  await expect.poll(() => page.locator('.inheritance-card').first().locator('.spark').count()).toBeGreaterThan(50);
  const cdp = await context.newCDPSession(page);
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
  const first = page.locator('.inheritance-card').first();
  await action(page, 'spark per run', () => first.getByRole('button', { name: 'Per Inh.', exact: true }).click());
  await action(page, 'spark occurrences', () => first.getByRole('button', { name: '★ Stars', exact: true }).click());
  await action(page, 'collapse whites', () => first.locator('summary').filter({ hasText: 'Normal whites' }).click());
  await action(page, 'display options', () => page.getByRole('button', { name: 'Display options', exact: true }).click());
  await action(page, 'focus main', () => page.getByRole('button', { name: 'Main Parent', exact: true }).click());
  await action(page, 'focus all', () => page.getByRole('button', { name: 'All', exact: true }).click());
  await action(page, 'filters', () => page.getByRole('button', { name: 'Filters', exact: true }).click());
  await action(page, 'advanced', () => page.getByRole('radio', { name: 'Advanced', exact: true }).click());
  await action(page, 'character picker', () => page.getByRole('button', { name: 'Pick target character', exact: true }).click());
  await page.keyboard.press('Escape');
  await action(page, 'UQL open', () => page.getByRole('radio', { name: 'UQL', exact: true }).click());
  const editor = page.locator('.cm-content'); await expect(editor).toBeVisible();
  await action(page, 'UQL typing', () => editor.pressSequentially('Main Speed >= 3', { delay: 80 }));
  await replaceQuery(editor, '');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  for (let i = 2; i <= 3; i++) { await page.locator('.infinite-sentinel').scrollIntoViewIfNeeded(); await expect(page.locator('.inheritance-card')).toHaveCount(i * 12); }
  await action(page, '36 cards per inheritance', () => first.getByRole('button', { name: 'Per Run', exact: true }).click());
  const last = page.locator('.inheritance-card').last();
  await last.scrollIntoViewIfNeeded();
  await expect(last.getByRole('button', { name: 'Per Inh.', exact: true })).toBeVisible();
  const { profile } = await cdp.send('Profiler.stop');
  await save('database.cpuprofile', profile);
  await test.info().attach('database.cpuprofile', { body: JSON.stringify(profile), contentType: 'application/json' });
});

test('4000 timeline events: filters, search, direction and planner interactions', async ({ page, context }) => {
  await page.goto('/timeline');
  await expect(page.locator('.event-card').first()).toBeVisible();
  const cdp = await context.newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
  await action(page, 'timeline filters', () => page.getByRole('button', { name: 'Search & filters', exact: true }).click());
  await action(page, 'timeline unselect', () => page.getByRole('button', { name: 'Unselect all', exact: true }).click());
  await action(page, 'timeline select', () => page.getByRole('button', { name: 'Select all', exact: true }).click());
  await page.getByRole('button', { name: 'Close filters', exact: true }).click();
  await action(page, 'planner tab', () => page.locator('.timeline-tabs a[href="/timeline?tab=carat-planner"]').click());
  const target = page.locator('[data-target-id="target-0"]');
  await expect(target).toBeVisible();
  await expect(page.locator('.target:not(.past)')).toHaveCount(30);
  await action(page, 'planner pulls', () => target.getByRole('spinbutton', { name: 'Planned pulls', exact: true }).fill('300'));
  await action(page, 'planner goals expand', () => target.locator('.pickup-summary').click());
  await action(page, 'planner desired copies', () => target.getByRole('button', { name: 'Increase desired copies of Kitasan Black', exact: true }).click());
  await action(page, 'planner rate-up picker', () => target.getByRole('button', { name: 'Choose rate-ups', exact: true }).click());
  await page.keyboard.press('Escape');
  await action(page, 'timeline tab return', () => page.locator('.timeline-tabs a[href="/timeline?tab=timeline"]').click());
  await page.setViewportSize({ width: 1536, height: 960 });
  await action(page, 'timeline vertical', () => page.getByRole('radio', { name: 'Vertical', exact: true }).click());
  expect(await page.locator('.timeline-board .event-card').count()).toBeLessThan(70);
  await expect(page.locator('.vertical-date.is-today')).toBeInViewport();
  await action(page, 'timeline horizontal', () => page.getByRole('radio', { name: 'Horizontal', exact: true }).click());
  const { profile } = await cdp.send('Profiler.stop');
  await save('timeline-planner.cpuprofile', profile);
  await test.info().attach('timeline-planner.cpuprofile', { body: JSON.stringify(profile), contentType: 'application/json' });
});

test('mobile navigation: cold and warm routes become populated', async ({ page, context }) => {
  await page.goto('/');
  const cdp = await context.newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
  const timings: { path: string; readyMs: number }[] = [];
  for (const path of ['/database', '/timeline', '/tools/statistics', '/database', '/timeline', '/tools/statistics']) {
    await page.getByRole('button', { name: 'Open navigation', exact: true }).tap();
    const nav = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    await expect(nav).toBeVisible();
    const section = path === '/timeline' ? 'Timeline' : path === '/tools/statistics' ? 'Tools' : undefined;
    if (section) {
      const toggle = nav.getByRole('button', { name: new RegExp(`^(Open|Collapse) ${section} subsections$`) });
      await expect(toggle).toBeVisible();
      if (await toggle.getAttribute('aria-expanded') !== 'true') await toggle.tap();
    }
    const link = nav.locator(`a[href="${path}"]`).first();
    await link.evaluate(element => element.addEventListener('click', () => (window as any).__routeStart = performance.now(), { once: true }));
    await link.tap();
    await expect(nav).toBeHidden();
    await expect(page).toHaveURL(new RegExp(path));
    if (path === '/database') { await expect(page.locator('.inheritance-card')).toHaveCount(12); await expect(page.locator('.inheritance-card .spark').first()).toBeVisible(); }
    else if (path === '/timeline') await expect(page.locator('.event-card').first()).toBeVisible();
    else await expect(page.getByTestId('selected-samples')).toHaveText('24M');
    timings.push({ path, readyMs: await page.evaluate(() => Math.round(performance.now() - (window as any).__routeStart)) });
  }
  await save('navigation.json', timings);
  await save('navigation.cpuprofile', (await cdp.send('Profiler.stop')).profile);
  console.log('Populated route timings', timings);
});

test('large catalogs: character and support pickers, AND/OR and UQL', async ({ page }) => {
  await stressCatalogs(page);
  await page.goto('/database');
  await expect(page.locator('.inheritance-card')).toHaveCount(12);
  await page.getByRole('button', { name: 'Filters', exact: true }).tap();
  await page.getByRole('radio', { name: 'Advanced', exact: true }).tap();
  await action(page, 'large character picker', () => page.getByRole('button', { name: 'Pick target character', exact: true }).tap());
  await expect(page.getByRole('dialog').getByRole('radio')).toHaveCount(36);
  await page.getByRole('dialog').locator('.lazy-more').scrollIntoViewIfNeeded();
  await expect(page.getByRole('dialog').getByRole('radio')).toHaveCount(72);
  await action(page, 'character search', () => page.getByRole('searchbox', { name: 'Search characters', exact: true }).fill('Stress Uma 199'));
  await expect(page.getByRole('radio', { name: /Stress Uma 199/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-filter-group="support"] .group-title').tap();
  await action(page, 'large support picker', () => page.getByRole('button', { name: 'Borrow support card', exact: true }).tap());
  await expect(page.getByRole('dialog').getByRole('radio')).toHaveCount(36);
  await page.getByRole('dialog').locator('.lazy-more').scrollIntoViewIfNeeded();
  await expect(page.getByRole('dialog').getByRole('radio')).toHaveCount(72);
  await action(page, 'support search', () => page.getByRole('searchbox', { name: 'Search support cards', exact: true }).fill('Stress Support 499'));
  await expect(page.getByRole('radio', { name: /Stress Support 499/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('radio', { name: 'Basic', exact: true }).tap();
  await page.getByRole('button', { name: 'Spark Filters', exact: true }).tap();
  const blue = page.getByRole('region', { name: 'Blue Factors (Stats)', exact: true });
  for (const [i, name] of ['Speed', 'Stamina'].entries()) {
    await blue.getByRole('button', { name: 'Add Blue Factor', exact: true }).tap();
    await page.locator(`#blue-factors-factor-${i}`).tap();
    await page.getByRole('option', { name, exact: true }).tap();
  }
  for (const name of ['OR', 'AND', 'OR']) await action(page, `factor ${name}`, () => blue.getByRole('radio', { name, exact: true }).tap());
  await action(page, 'large UQL open', () => page.getByRole('radio', { name: 'UQL', exact: true }).tap());
  const editor = page.locator('.cm-content');
  await expect(editor).toBeVisible();
  await replaceQuery(editor, '');
  await action(page, 'large UQL typing', () => editor.pressSequentially('Main Speed >= 3 and Followers < 1000', { delay: 80 }));
  await expect(page.locator('.uql-status')).toHaveText('Valid');
});

test('large statistics: tabs, distances and warm route navigation', async ({ page, context }) => {
  await page.goto('/tools/statistics');
  await expect(page.getByTestId('selected-samples')).not.toHaveText('0');
  await expect(page.getByRole('tab', { name: 'Supports', exact: true })).toBeVisible();
  const cdp = await context.newCDPSession(page); await cdp.send('Profiler.enable'); await cdp.send('Profiler.start');
  for (const name of ['Supports', 'Skills', 'Stats', 'Overview']) await action(page, `statistics ${name}`, () => page.getByRole('tab', { name, exact: true }).click());
  for (const name of ['Sprint', 'All distances']) await action(page, `statistics ${name}`, () => page.getByRole('radio', { name, exact: true }).click());
  await page.setViewportSize({ width: 1536, height: 960 });
  for (const [name, path] of [['Database', '/database'], ['Timeline', '/timeline'], ['Statistics', '/tools/statistics'], ['Database', '/database']]) {
    if (name === 'Timeline' || name === 'Statistics') await page.getByRole('button', { name: `Open ${name === 'Statistics' ? 'Tools' : 'Timeline'} subsections`, exact: true }).click();
    await action(page, `navigate ${name}`, async () => { await page.locator(`a[href="${path}"]`).filter({ visible: true }).first().click(); await expect(page).toHaveURL(new RegExp(path!)); });
  }
  const { profile } = await cdp.send('Profiler.stop');
  await save('statistics-navigation.cpuprofile', profile);
  await test.info().attach('statistics-navigation.cpuprofile', { body: JSON.stringify(profile), contentType: 'application/json' });
});

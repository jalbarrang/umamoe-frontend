import { expect, test } from './fixtures/test';
import { mockTimeline } from './fixtures/api';
import { plannerControlsPlan } from './fixtures/planner-controls';

test('Step-ups can be planned from the timeline, budget paid steps and survive reload', async ({ page }, info) => {
  await mockTimeline(page);
  const event = { id: 'paid-banner-50078', type: 'paid_banner', title: 'SSR Support Select Step-Up', gacha_id: 50078, gacha_type: 14, planner_data_available: true, global_release_date: '2026-09-10', estimated_end_date: '2026-09-30', is_confirmed: true };
  await page.route('**/resources/test/banner_timeline.json*', route => route.fulfill({ json: { events: [event] } }));
  await page.route('**/resources/test/planner_core.json*', route => route.fulfill({ json: { gacha_shard_by_event: { [event.id]: '2026' } } }));
  await page.route('**/resources/test/planner_gacha_2026.json*', route => route.fulfill({ json: { gachas: [{ event_id: event.id, gacha_id: 50078, gacha_type: 14, banner_kind: 'support', start_date: event.global_release_date, end_date: event.estimated_end_date, pickups: [], step_up: { rounds: 1, steps: [500, 700, 1000, 1300, 1500].map((cost, i) => ({ gacha_id: 50078 + i, pulls: 10, cost, guaranteed_rarity: i < 2 ? 2 : 3, selectable: i === 4 })) } }] } }));
  const plan = plannerControlsPlan(); plan.targets = []; plan.balances.paidJewels = 2199; plan.balances.freeJewels = 60000;
  await page.addInitScript(plan => { if (!localStorage.getItem('carat-planner-plans-v1')) localStorage.setItem('carat-planner-plans-v1', JSON.stringify({ version: 1, activePlanId: plan.id, plans: [plan] })); }, plan);
  await page.goto('/timeline');
  await page.getByRole('button', { name: `Add ${event.title} to Carat Planner`, exact: true }).click();
  await page.goto('/timeline?tab=carat-planner');
  const target = page.locator('article.target').filter({ hasText: event.title });
  await expect(target.getByRole('status')).toContainText('20 / 50 pulls funded');
  await expect(target.getByRole('status')).toContainText('2,801 paid Carats short');
  await expect(target.locator('.pickup-details')).toHaveCount(0);
  await target.getByRole('combobox', { name: 'Step-up progress' }).selectOption('20');
  await expect(target.getByRole('status')).toContainText('20 / 20 pulls funded');
  await page.reload();
  await expect(target.getByRole('combobox', { name: 'Step-up progress' })).toHaveValue('20');
  await expect(target.getByRole('status')).toContainText('20 / 20 pulls funded');
  await target.screenshot({ path: info.outputPath('step-up-planner.png') });
});

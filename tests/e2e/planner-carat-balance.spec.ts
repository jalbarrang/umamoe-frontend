import { test, expect } from './fixtures/test';
import { mockPlannerControls, plannerControlsPlan } from './fixtures/planner-controls';

test('Carats at pull shows actual spending after tickets and respects the paid Carat setting', async ({ page }) => {
  await mockPlannerControls(page);
  for (const resource of ['planner_income', 'planner_rewards']) await page.route(`**/resources/test/${resource}.json*`, route => route.fulfill({ json: { rules: [], rewards: [] } }));
  const plan = plannerControlsPlan();
  plan.targets = plan.targets.filter(target => target.id === 'first');
  plan.targets[0]!.plannedPulls = 15;
  plan.balances = { ...plan.balances, freeJewels: 1500, paidJewels: 300, umaTickets: 5 };
  await page.addInitScript(plan => localStorage.setItem('carat-planner-plans-v1', JSON.stringify({ version: 1, activePlanId: plan.id, plans: [plan] })), plan);
  await page.goto('/timeline?tab=carat-planner');
  const row = page.locator('[data-target-id="first"]');
  const balance = row.locator('.carat-balance');
  await expect(balance).toHaveText('1,800→ 300');
  await expect(balance).toHaveAttribute('title', /1,500 spent.*paid Carats are reserved/);
  await row.getByRole('spinbutton', { name: 'Planned pulls', exact: true }).fill('5');
  await expect(balance).toHaveText('1,800→ 1,800');
  await row.getByRole('spinbutton', { name: 'Planned pulls', exact: true }).fill('20');
  await row.getByRole('button', { name: 'Target options', exact: true }).click();
  await row.getByRole('checkbox', { name: 'Allow paid Carats', exact: true }).check();
  await expect(balance).toHaveText('1,800→ 0');
  await expect(balance).toHaveAttribute('title', /1,800 spent/);
});

import { expect, it } from 'vitest';
import { activePlan, createPlan, plannerTargetEvents, projectPlan, setTimelineEvent, type PlannerDataBundle } from './carat-planner';

it('budgets complete step-up draws in order using only paid Carats, with no spark or invented pickup odds', () => {
  const original = createPlan();
  original.projectionStartDate = '2026-01-01';
  original.balances = { ...original.balances, freeJewels: 90000, paidJewels: 2199, umaTickets: 100, supportTickets: 100 };
  const plan = activePlan(setTimelineEvent({ version: 1, activePlanId: original.id, plans: [original] }, {
    id: 'step-up', title: 'SSR Select Step-Up', eventType: 'paid_banner', gachaType: 14,
    gachaId: 50078, date: new Date('2026-09-01'), estimatedEndDate: new Date('2026-09-30'),
  }, true));
  expect(plan.targets[0]).toMatchObject({ bannerKind: 'paid', plannedPulls: 50, useTickets: false, allowPaidJewels: true });
  expect(plannerTargetEvents(plan, [])).toHaveLength(1);
  const bundle: PlannerDataBundle = {
    core: {}, income: { rules: [] }, rewards: { rewards: [] },
    gachas: [{ event_id: 'step-up', gacha_id: 50078, gacha_type: 14, banner_kind: 'support', start_date: '2026-09-01', end_date: '2026-09-30',
      step_up: { rounds: 2, steps: [500, 700, 1000, 1300, 1500].map((cost, i) => ({ gacha_id: 50078 + i, pulls: 10, cost, guaranteed_rarity: i < 2 ? 2 : 3, selectable: i === 4 })) } }],
  };
  // Imported or global settings must never let free resources fund a paid step-up.
  plan.targets[0]!.useTickets = true; plan.targets[0]!.allowPaidJewels = false;
  let result = projectPlan(plan, bundle);
  expect(result.targets[0]).toMatchObject({ fundedPulls: 20, paidJewelPulls: 20, paidJewelsAfter: 999, shortfallJewels: 2801, ticketPulls: 0, freeJewelPulls: 0, sparkCopies: 0, pickupProbability: undefined });
  expect(result.balances).toMatchObject({ freeJewels: 90000, umaTickets: 100, supportTickets: 100 });
  plan.balances.paidJewels = 10000; plan.targets[0]!.plannedPulls = 5000;
  result = projectPlan(plan, bundle);
  expect(result.targets[0]).toMatchObject({ plannedPulls: 100, fundedPulls: 100, paidJewelsAfter: 0, shortfallJewels: 0 });
  expect(projectPlan(plan).targets[0]).toMatchObject({ fundedPulls: 0, freeJewelPulls: 0, ticketPulls: 0, paidJewelPulls: 0 });
});

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

  const schedule = bundle.gachas![0]!.step_up!;
  schedule.selection_pool_size = 10; schedule.selection_pickup_rate = .003;
  plan.targets[0]!.plannedPulls = 50;
  expect(projectPlan(plan, bundle).targets[0]!.pickupProbability).toBeCloseTo(1, 12);
  plan.targets[0]!.desiredCopies = 2;
  // 47 ordinary draws, two random guaranteed SSRs and the final chosen copy.
  expect(projectPlan(plan, bundle).targets[0]!.pickupProbability).toBeCloseTo(1 - .997 ** 47 * .9 ** 2, 12);
  plan.balances.paidJewels = 1200; plan.targets[0]!.desiredCopies = 1;
  expect(projectPlan(plan, bundle).targets[0]!.pickupProbability).toBeCloseTo(1 - .997 ** 20, 12);
  plan.balances.paidJewels = 10000; plan.targets[0]!.plannedPulls = 100; plan.targets[0]!.desiredCopies = 2;
  expect(projectPlan(plan, bundle).targets[0]!.pickupProbability).toBeCloseTo(1, 12);
});

it('adds ordinary premium banners and funds complete paid draws without free currency or tickets', () => {
  const original = createPlan(); original.projectionStartDate = '2026-01-01';
  original.balances = { ...original.balances, freeJewels: 90000, paidJewels: 1499, supportTickets: 100 };
  const plan = activePlan(setTimelineEvent({ version: 1, activePlanId: original.id, plans: [original] }, {
    id: 'premium', title: 'SSR Guaranteed', eventType: 'paid_banner', gachaType: 5,
    gachaId: 50002, date: new Date('2026-09-01'), estimatedEndDate: new Date('2026-09-30'), pickupCardIds: [30001],
  }, true));
  expect(plan.targets[0]).toMatchObject({ bannerKind: 'paid', plannedPulls: 10, useTickets: false, allowPaidJewels: true });
  const bundle: PlannerDataBundle = { core: {}, income: { rules: [] }, rewards: { rewards: [] }, gachas: [{
    event_id: 'premium', gacha_id: 50002, gacha_type: 5, banner_kind: 'support', start_date: '2026-09-01', end_date: '2026-09-30',
    jewel_cost_per_pull: 150, free_pulls: 100, paid_draw: { limit: 1, guaranteed_rarity: 3, guaranteed_count: 1 },
    pickups: [{ pickup_id: 30001, rate: .015, exchangeable: false }, { pickup_id: 30002, rate: .015, exchangeable: false }], rarity_rates: [{ rarity: 3, rate: .03 }],
  }] };
  plan.targets[0]!.useTickets = true; plan.targets[0]!.allowPaidJewels = false;
  expect(projectPlan(plan, bundle).targets[0]).toMatchObject({ fundedPulls: 0, paidJewelsAfter: 1499, shortfallJewels: 1, freePullsUsed: 0, freeJewelPulls: 0, ticketPulls: 0 });
  plan.balances.paidJewels = 3000; plan.targets[0]!.plannedPulls = 5000;
  const result = projectPlan(plan, bundle);
  expect(result.targets[0]).toMatchObject({ plannedPulls: 10, fundedPulls: 10, paidJewelsAfter: 1500, shortfallJewels: 0, sparkCopies: 0 });
  expect(result.balances).toMatchObject({ freeJewels: 90000, supportTickets: 100 });
  expect(result.targets[0]!.pickupProbability).toBeCloseTo(1 - .985 ** 9 * .5, 12);
  plan.targets[0]!.pickupGoals = [{ pickupId: 30001, desiredCopies: 1 }, { pickupId: 30002, desiredCopies: 1 }];
  expect(projectPlan(plan, bundle).targets[0]!.pickupProbability).toBeCloseTo(1 - .985 ** 9, 12);
});

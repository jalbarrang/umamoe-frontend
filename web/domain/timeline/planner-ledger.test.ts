import { createHash } from 'node:crypto';
import { expect, it } from 'vitest';
import { plannerLedgerCases } from '../../../tests/e2e/fixtures/planner-ledger-data';
import angular from './planner-ledger.angular.json';
import { activePlan, buildPlannerLedger, createPlan, loadPlanCollection, projectPlan, sanitizePlan, savePlanCollection, type PlannerLedgerEntry } from './carat-planner';
import { compactPlannerCollectionForCloud, expandPlannerCollectionFromCloud } from './planner-cloud-codec';
import { decodeCompactPlannerShare, encodeCompactPlannerShare } from './planner-share-codec';

function ledgerSummary(ledger: PlannerLedgerEntry[]) {
  return { count: ledger.length, digest: createHash('sha256').update(JSON.stringify(ledger.map(item => [item.id, item.label, item.date, item.currency, item.amount, item.source]))).digest('hex'), first: ledger[0] ?? null, last: ledger.at(-1) ?? null };
}

it('matches the complete ordered ledger and each pull balance captured from Angular', () => {
  // Each digest includes every dated entry, not just its total. Capture: scripts/verify-planner-ledger.mjs.
  for (const item of plannerLedgerCases(createPlan())) {
    const projection = projectPlan(item.plan, item.data);
    expect({ ledger: ledgerSummary(buildPlannerLedger(item.plan, item.data, item.through)), projection: {
      balances: projection.balances, unallocated: ledgerSummary(projection.unallocatedIncome),
      targets: projection.targets.map(target => ({ id: target.targetId, date: target.pullDate, balanceBefore: target.balanceBefore, fundedPulls: target.fundedPulls, rewardCaratsGained: target.rewardCaratsGained, income: ledgerSummary(target.income) }))
    } }, item.name).toEqual(angular[item.name as keyof typeof angular]);
  }
});

it('validates custom income dates and preserves signed amounts through storage and both share codecs', async () => {
  const income = { id: 'income', label: ' Deduction ', currency: 'free_jewels', amount: -200.9, cadence: 'monthly', startDate: '2026-09-01' };
  const plan = sanitizePlan({ ...createPlan(), customIncome: [income, { ...income, id: 'interval', every: 400, endDate: '2026-02-31' }, { ...income, label: '' }, { ...income, startDate: '2026-02-31' }, { ...income, startDate: '' }, []] })!;
  expect(plan.customIncome).toEqual([
    { ...income, label: 'Deduction', amount: -200, every: 1, endDate: undefined },
    { ...income, id: 'interval', label: 'Deduction', amount: -200, every: 400, endDate: undefined }
  ]);
  expect(sanitizePlan({ ...plan, customIncome: [{ ...income, amount: Number.POSITIVE_INFINITY }] })!.customIncome[0]!.amount).toBe(0);
  const invalidDate = sanitizePlan({ ...plan, projectionStartDate: '2026-02-31' })!;
  expect(invalidDate.projectionStartDate).toBe(new Date().toISOString().slice(0, 10));
  const collection = { version: 1 as const, activePlanId: plan.id, plans: [plan] };
  let stored = '';
  savePlanCollection(collection, { setItem: (_, value) => stored = value });
  const restored = activePlan(loadPlanCollection({ getItem: () => stored }));
  expect(restored.customIncome).toEqual(plan.customIncome);
  const cloud = activePlan(expandPlannerCollectionFromCloud(compactPlannerCollectionForCloud(collection))!);
  const shared = sanitizePlan((await decodeCompactPlannerShare(await encodeCompactPlannerShare(plan))).plan)!;
  // Sparse share formats intentionally regenerate row IDs; amounts, dates and cadence must survive.
  const contents = (value: typeof plan) => value.customIncome.map(({ id, ...item }) => item);
  expect(contents(cloud)).toEqual(contents(plan));
  expect(contents(shared)).toEqual(contents(plan));
});

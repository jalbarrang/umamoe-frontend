// Run with the root Angular dev server on 4200. Outputs comparisons under .tmp, never rewrites the committed golden.
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { plannerLedgerCases } from '../tests/e2e/fixtures/planner-ledger-data.ts';
import { mockAdvertising, mockTimeline } from '../tests/e2e/fixtures/angular-api.ts';

const server = await createServer({ server: { middlewareMode: true }, configLoader: 'runner' });
const browser = await chromium.launch();
const ledgerSummary = ledger => ({ count: ledger.length, digest: createHash('sha256').update(JSON.stringify(ledger.map(item => [item.id,item.label,item.date,item.currency,item.amount,item.source]))).digest('hex'), first: ledger[0] ?? null, last: ledger.at(-1) ?? null });
const projectionSummary = projection => ({ balances: projection.finalBalances ?? projection.balances, unallocated: ledgerSummary(projection.unallocatedIncome), targets: projection.targets.map(item => ({id:item.targetId,date:item.pullDate,balanceBefore:item.balanceBefore,fundedPulls:item.fundedPulls,rewardCaratsGained:item.rewardCaratsGained,income:ledgerSummary(item.income)})) });
try {
  const page = await browser.newPage(); await mockAdvertising(page); await mockTimeline(page);
  await page.goto('http://127.0.0.1:4200/timeline?tab=carat-planner');
  await page.locator('app-carat-planner').waitFor();
  await page.waitForFunction(() => window.ng?.getComponent(document.querySelector('app-carat-planner'))?.plannerDataReady);
  const { createPlan, projectPlan, buildPlannerLedger } = await server.ssrLoadModule('/web/domain/timeline/carat-planner.ts');
  const expected = {}, failures = [];
  for (const item of plannerLedgerCases(createPlan())) {
    const angular = await page.evaluate(({plan,data,through}) => {
      const component = window.ng.getComponent(document.querySelector('app-carat-planner'));
      const events = (data.timelineEvents ?? []).map(event => ({ ...event,type:event.eventType,globalReleaseDate:event.date,imagePath:event.image }));
      return { ledger:component.calculations.buildLedger(plan,data,through,events), projection:component.calculations.project(plan,data,[],events) };
    },item);
    expected[item.name] = { ledger:ledgerSummary(angular.ledger),projection:projectionSummary(angular.projection) };
    const actual = {ledger:ledgerSummary(buildPlannerLedger(item.plan,item.data,item.through)),projection:projectionSummary(projectPlan(item.plan,item.data))};
    try { assert.deepEqual(actual,expected[item.name]); } catch(error) { failures.push({name:item.name,expected:expected[item.name],actual}); }
  }
  await mkdir('.tmp', { recursive: true });
  await writeFile('.tmp/planner-ledger-angular.json',JSON.stringify(expected,null,2));
  await writeFile('.tmp/planner-ledger-differences.json',JSON.stringify(failures,null,2));
  console.log(JSON.stringify({cases:Object.keys(expected).length,matching:Object.keys(expected).length-failures.length,failed:failures.map(item=>item.name)},null,2));
  if(failures.length) process.exitCode=1;
} finally {await browser.close();await server.close();}

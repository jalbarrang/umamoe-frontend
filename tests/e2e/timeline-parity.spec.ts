import { expect, test } from './fixtures/test';
import { mockTimeline } from './fixtures/angular-api';
import { detailRewards, detailTimeline, mockTimelineDetails } from './fixtures/timeline-details';
import { createPlan } from '../../web/domain/timeline/carat-planner';

test('Timeline retains exact event filters, date lanes, search navigation, and planner actions', async ({ page, isMobile }) => {
  await mockTimeline(page);
  await page.goto('/timeline');
  if (isMobile) await expect(page.getByRole('navigation', { name: 'Timeline tools' }).getByRole('link', { name: 'Timeline', exact: true })).toHaveAttribute('aria-current', 'page');
  else await expect(page.getByRole('heading', { name: 'Timeline' })).toBeVisible();
  await expect(page.locator('[data-lane-key]')).toHaveCount(isMobile ? 4 : 5);
  if (!isMobile) await expect(page.getByText('17d later')).toBeVisible();
  await expect(page.locator('[data-lane-key="2026-09-18"]')).toBeVisible();
  await page.getByRole('button', { name: isMobile ? 'Search & filters' : 'Filters', exact: true }).click();
  await expect(page.locator('.filter-popover header strong')).toHaveText(isMobile ? 'Search & filters' : 'Visible event types');
  await expect(page.getByText('Trainer Skills Test')).toBeVisible();
  await expect(page.getByText('Training scenarios')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Champions Meeting' }).uncheck();
  await expect(page.getByText('Mile Champions Meeting')).toHaveCount(0);
  if (!isMobile) await page.getByRole('button', { name: 'Close filters' }).click();
  await page.getByRole('searchbox', { name: 'Search timeline pickups' }).fill('McQueen');
  if (isMobile) await page.getByRole('button', { name: 'Close filters' }).click();
  else {
    await expect(page.getByText('0 of 1')).toBeVisible();
    await page.getByRole('button', { name: 'Next search result' }).click();
    await expect(page.getByText('1 of 1')).toBeVisible();
  }
  await page.getByRole('button', { name: /to Carat Planner$/ }).click();
  await expect(page.getByRole('button', { name: /from Carat Planner$/ })).toBeVisible();
  if (isMobile) expect((await page.getByRole('button', { name: /from Carat Planner$/ }).boundingBox())!.height).toBeGreaterThanOrEqual(32);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1') ?? 'null'));
  expect(saved.plans[0].targets[0].eventId).toBe('character-1');
  await page.getByRole('button', { name: /from Carat Planner$/ }).click();
  await expect(page.getByRole('button', { name: /to Carat Planner$/ })).toHaveAttribute('aria-pressed', 'false');
  const disabled = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0]);
  expect(disabled.targets).toEqual(saved.plans[0].targets);
  expect(disabled.disabledEventIds).toContain('character-1');
});

test('Timeline and Planner preserve configured pulls and goals through remove, reload and re-add', async ({ page }) => {
  await mockTimeline(page);
  await page.goto('/timeline?tab=carat-planner&banner=character-1');
  const target = page.locator('.target');
  await expect(target).toHaveCount(1);
  await target.locator('.stepper input').fill('330');
  await target.locator('.stepper input').blur();
  await target.getByRole('button', { name: 'Target options', exact: true }).click();
  await target.getByRole('checkbox', { name: 'Use tickets first' }).uncheck();
  await target.getByRole('checkbox', { name: 'Allow paid Carats' }).check();
  await target.getByRole('button', { name: 'Close Target options', exact: true }).click();
  await target.locator('summary').click();
  await target.getByRole('button', { name: 'Choose rate-ups', exact: true }).click();
  await page.getByRole('dialog', { name: 'Choose rate-ups', exact: true }).getByRole('button', { name: 'Select Oguri Cap', exact: true }).click();
  const configured = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0].targets[0]);
  expect(configured).toMatchObject({ plannedPulls: 330, useTickets: false, allowPaidJewels: true });
  expect(configured.pickupGoals).toHaveLength(2);
  // Leave the explicit add-banner URL before testing persisted disabled state.
  await page.goto('/timeline');
  const card = page.locator('#timeline-event-character-1');
  await card.getByRole('button', { name: /from Carat Planner$/ }).click();
  await page.reload();
  await expect(card.getByRole('button', { name: /to Carat Planner$/ })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('navigation', { name: 'Timeline tools' }).getByRole('link', { name: /Carat Planner/ }).click();
  await expect(target).toHaveCount(0);
  await expect(page.getByText('Your plan is ready for its first banner')).toBeVisible();
  await page.getByRole('combobox', { name: 'Search character or support banners' }).fill('McQueen');
  await page.getByRole('option', { name: /Mejiro McQueen Pickup/ }).click();
  await expect(target.locator('.stepper input')).toHaveValue('330');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0].targets)).toEqual([configured]);
  await target.getByRole('button', { name: 'Remove Mejiro McQueen Pickup' }).click();
  await expect(target).toHaveCount(0);
  await page.reload();
  await expect(target).toHaveCount(0);
  await page.getByRole('navigation', { name: 'Timeline tools' }).getByRole('link', { name: 'Timeline', exact: true }).click();
  await card.getByRole('button', { name: /to Carat Planner$/ }).click();
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0]);
  expect(restored.targets).toEqual([configured]);
  expect(restored.disabledEventIds).not.toContain('character-1');
});

test('Planner search re-enables rewards inferred from the shared resource and removal clears the event selection', async ({ page }) => {
  await mockTimelineDetails(page);
  await page.route('**/resources/test/banner_timeline.json*', route => route.fulfill({ json: { ...detailTimeline, events: [...detailTimeline.events, { ...detailTimeline.events[0], id: 'paid-only', type: 'paid_banner', title: 'Paid anniversary banner' }] } }));
  const initial = createPlan('Reward plan'); initial.disabledRewardIds = ['banner-gift']; initial.disabledEventIds = ['detail-banner'];
  await page.addInitScript(plan => localStorage.setItem('carat-planner-plans-v1', JSON.stringify({ version: 1, activePlanId: plan.id, plans: [plan] })), initial);
  await page.goto('/timeline?tab=carat-planner');
  await expect(page.getByText('Loading rates, rewards, and income data…')).toHaveCount(0);
  await page.getByRole('combobox', { name: 'Search character or support banners' }).fill('Paid anniversary');
  await expect(page.getByRole('option', { name: /Paid anniversary/ })).toHaveCount(0);
  await expect(page.getByText('No banners match this search and type.')).toBeVisible();
  await page.getByRole('combobox', { name: 'Search character or support banners' }).fill('McQueen');
  await page.getByRole('option', { name: /Mejiro McQueen/ }).click();
  const enabled = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0]);
  expect(enabled.disabledRewardIds).toEqual([]);
  expect(enabled.enabledRewardEventIds).toEqual(['detail-banner']);
  await page.getByRole('button', { name: 'Remove Mejiro McQueen Pickup' }).click();
  const disabled = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0]);
  expect(disabled.enabledRewardEventIds).toEqual([]);
  expect(disabled.disabledEventIds).toEqual(['detail-banner']);
  expect(disabled.targets).toEqual(enabled.targets);
});

for (const change of ['none', 'disable', 'switch plan'] as const) {
  test(`Timeline reconciles delayed rewards without overwriting a later ${change} action`, async ({ page }) => {
    await mockTimelineDetails(page);
    await page.route('**/resources/test/banner_timeline.json*', route => route.fulfill({ json: { ...detailTimeline, events: detailTimeline.events.map(event => ({ ...event, planner_reward_available: true })) } }));
    const initial = createPlan('Original');
    initial.disabledRewardIds = ['banner-gift'];
    await page.addInitScript(plan => localStorage.setItem('carat-planner-plans-v1', JSON.stringify({ version: 1, activePlanId: plan.id, plans: [plan] })), initial);
    let release!: () => void;
    const delayed = new Promise<void>(resolve => release = resolve);
    await page.route('**/resources/test/planner_rewards.json*', async route => { await delayed; await route.fulfill({ json: detailRewards }); });
    await page.goto('/timeline');
    const card = page.locator('#timeline-event-detail-banner');
    await card.getByRole('button', { name: /to Carat Planner$/ }).click();
    if (change === 'disable') await card.getByRole('button', { name: /from Carat Planner$/ }).click();
    await page.getByRole('navigation', { name: 'Timeline tools' }).getByRole('link', { name: /Carat Planner/ }).click();
    await expect(page.getByRole('region', { name: 'Planner controls and projection' })).toBeVisible();
    if (change === 'switch plan') { await page.getByRole('button', { name: 'Selected plan', exact: true }).click(); await page.getByRole('menuitem', { name: 'Add plan', exact: true }).click(); }
    release();
    await expect(page.getByText('Loading rates, rewards, and income data…')).toHaveCount(0);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1')!));
    expect(saved.plans[0].targets).toHaveLength(1);
    // Angular drops a redundant per-reward disable when its entire event is disabled.
    expect(saved.plans[0].disabledRewardIds).toEqual(change === 'switch plan' ? ['banner-gift'] : []);
    expect(saved.plans[0].disabledEventIds).toEqual(change === 'disable' ? ['detail-banner'] : []);
    if (change === 'switch plan') {
      expect(saved.activePlanId).not.toBe(initial.id);
      expect(saved.plans[1].targets).toEqual([]);
      // Selector events are resource defaults, not a late user action on the new plan.
      expect(saved.plans[1].enabledRewardEventIds).toEqual(['detail-banner']);
    }
  });
}

test('Carat Planner accepts the compatible banner query and remains contained on dense mobile', async ({ page }) => {
  await mockTimeline(page);
  await page.addInitScript(() => {
    const now = '2026-08-29T00:00:00.000Z';
    localStorage.setItem('carat-planner-plans-v1', JSON.stringify({ version: 1, activePlanId: 'mobile-plan', plans: [{ id: 'mobile-plan', name: 'Mobile plan', createdAt: now, updatedAt: now, projectionStartDate: '2026-08-29', balances: { freeJewels: 30000, paidJewels: 0, umaTickets: 0, supportTickets: 0, rainbowCrystals: 0, goldCrystals: 0, rainbowFullCrystals: 0, goldFullCrystals: 0 }, enabledIncomeRuleIds: [], enabledRewardIds: [], disabledRewardIds: [], enabledRewardEventIds: [], disabledEventIds: [], scenarioSelections: {}, variableRewardSelections: {}, freePullCampaignSelections: {}, resourceDefaultsApplied: false, customIncome: [], targets: [] }] }));
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/timeline?tab=carat-planner&banner=character-1');
  await expect(page.getByRole('navigation', { name: 'Timeline tools' }).getByRole('link', { name: /Carat Planner/ })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('region', { name: 'Planner controls and projection' })).toBeVisible();
  await expect(page.getByText('Mejiro McQueen Pickup')).toBeVisible();
  await expect(page.getByText('Pull plan')).toBeVisible();
  await expect(page.getByText('200 funded', { exact: true })).toBeVisible();
  await expect(page.locator('.target .funding')).toContainText('190 from resources · 10 free');
  await page.locator('.target .pickup-summary').click();
  await expect(page.getByText('Rate-up goals', { exact: true })).toBeVisible();
  await expect(page.getByText('Detailed odds')).toBeVisible();
  await page.locator('.advanced-odds>summary').click();
  await expect(page.getByText('Estimated 3★ pool', { exact: true })).toBeVisible();
  await expect(page.getByText('Avg selected copies')).toBeVisible();
  await page.getByRole('button', { name: 'Choose rate-ups', exact: true }).click();
  await page.getByRole('dialog', { name: 'Choose rate-ups', exact: true }).getByRole('button', { name: 'Select Oguri Cap', exact: true }).click();
  await page.getByRole('button', { name: 'Close Choose rate-ups', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('carat-planner-plans-v1') ?? 'null').plans[0].targets[0].pickupGoals.length)).toBe(2);
  await page.getByRole('button', { name: 'Plan assumptions' }).click();
  await expect(page.getByRole('group', { name: 'Carats', exact: true }).getByRole('spinbutton', { name: 'Free', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Income', exact: true }).click();
  await expect(page.getByText('Daily login')).toBeVisible();
  const account = page.getByRole('button', { name: /^Account & recurring/ });
  await expect(account).toHaveAttribute('aria-expanded', 'false');
  await account.click();
  await expect(page.getByRole('combobox', { name: 'Monthly shop tickets', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Rewards', exact: true }).click();
  await expect(page.getByText('Launch gift', { exact: true })).toBeVisible();
  await expect(page.getByText('10 free-pull campaign', { exact: true })).toBeVisible();
  await expect(page.locator('.rewards-panel [data-reward-id="event:character-1"]').getByRole('button', { name: /Mejiro McQueen Pickup rewards/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('Carat Planner keeps Angular account sync and short-share contracts', async ({ page }) => {
  await mockTimeline(page);
  await page.addInitScript(() => localStorage.setItem('auth_token','test-token'));
  await page.route('**/api/auth/me', (route) => route.fulfill({json:{id:'user-1',display_name:'Planner Tester',created_at:'2026-01-01T00:00:00.000Z'}}));
  await page.route('**/api/auth/accounts', (route) => route.fulfill({json:[]}));
  let revision=0;const saves:unknown[]=[];let shared:unknown;
  await page.route('**/api/carat-planner/state', async (route) => {
    if(route.request().method()==='GET')return route.fulfill({json:{revision,collection:null,updated_at:null}});
    const body=route.request().postDataJSON() as {base_revision:number;collection:unknown};saves.push(body);revision+=1;return route.fulfill({json:{revision,collection:body.collection,updated_at:'2026-08-29T00:00:00.000Z'}});
  });
  await page.route('**/api/carat-planner/shares', async (route) => {const body=route.request().postDataJSON() as {plan_id:string;plan_name:string};shared=body;return route.fulfill({json:{share_id:'ABCD1234',plan_id:body.plan_id,plan_name:body.plan_name,updated_at:'2026-08-29T00:00:00.000Z'}});});
  await page.goto('/timeline?tab=carat-planner');
  await expect(page.getByRole('status', { name:'Saved to your account', exact:true })).toBeVisible();
  expect((saves[0] as {base_revision:number;collection:{version:number}}).base_revision).toBe(0);
  expect((saves[0] as {collection:{version:number}}).collection.version).toBe(3);
  await page.getByLabel('Plan name').fill('Cloud plan');
  await page.getByLabel('Plan name').blur();
  await expect.poll(() => saves.length).toBeGreaterThan(1);
  await page.getByRole('button',{name:'More plan actions',exact:true}).click();
  await page.getByRole('menuitem',{name:'Share plan',exact:true}).click();
  await expect(page.getByText(/Share link copied|Share link ready/)).toBeVisible();
  const activeId=await page.evaluate(()=>JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).activePlanId);
  expect(shared).toEqual({plan_id:activeId,plan_name:'Cloud plan'});
});

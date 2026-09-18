// Compare populated Rewards data with the current Angular dev server; never changes the reference source.
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { mockPlannerRewards, normalizedRewardEvents, plannerRewardsPlan, plannerRewardsData } from '../tests/e2e/fixtures/planner-rewards.ts';
import { mockAdvertising } from '../tests/e2e/fixtures/angular-api.ts';
const server=await createServer({server:{middlewareMode:true},configLoader:'runner'}), browser=await chromium.launch();
const clean=value=>JSON.parse(JSON.stringify(value));
const optionView=({id,label,amountLabel,amounts})=>({id,label,amountLabel,amounts});
const groupView=g=>({id:g.id,title:g.title,availableAt:g.availableAt,availableUntil:g.availableUntil,isPast:g.isPast,sourceUrl:g.sourceUrl,sourceLabel:g.sourceLabel,searchText:g.searchText,benefits:g.benefits.map(b=>({kind:b.kind,text:b.text,amount:b.amount ?? null})),options:g.variableOptions.map(optionView),selected:optionView(g.selectedOption),breakdown:g.breakdownTooltip,active:g.active,selectable:g.selectable});
const campaignView=c=>({id:c.id,label:c.label,availableAt:c.availableAt,isPast:c.isPast,searchText:c.searchText,pullsPerDay:c.pullsPerDay,totalPulls:c.totalPulls,sourceUrl:c.sourceUrl,allocations:c.allocations.map(a=>({event_id:a.event_id,pulls:a.pulls,title:a.title})),stock:c.stockDestination?.event_id,state:c.state});
try {
 const page=await browser.newPage();await mockAdvertising(page);await mockPlannerRewards(page);
 await page.goto('http://127.0.0.1:4200/timeline?tab=carat-planner');await page.locator('app-carat-planner').waitFor();await page.waitForFunction(()=>window.ng?.getComponent(document.querySelector('app-carat-planner'))?.plannerDataReady);
 const domain=await server.ssrLoadModule('/web/domain/timeline/planner-reward-groups.ts'),campaigns=await server.ssrLoadModule('/web/domain/timeline/planner-campaigns.ts');
 const events=normalizedRewardEvents(),data=plannerRewardsData,expected={},failures=[];
 const base=plannerRewardsPlan(), plans=[['default',base],['past',{...base,projectionStartDate:'2026-10-01'}],['disabled',{...base,disabledEventIds:['story-event-301','second','champions-meeting-101']}]];
 const cm=domain.buildPlannerRewardGroups(data.rewards,data.event_benefits,data.competitive_variants,data.free_pull_campaigns,events,base.projectionStartDate,'2026-08-29',base).find(g=>g.eventId==='champions-meeting-101');
 for(const option of [cm.variableOptions[0],cm.variableOptions.at(-1),{id:'__not_counted__',label:'Result not counted',amounts:{}}]) plans.push([option.id,{...base,variableRewardSelections:{[cm.eventId]:{optionId:option.id,label:'Mile Champions Meeting: '+option.label,availableAt:'2026-09-09',amounts:option.amounts}}}]);
 for(const [name,plan] of plans) {
  const angular=await page.evaluate(({data,plan,events})=>{
   const c=window.ng.getComponent(document.querySelector('app-carat-planner'));c.plan=plan;c.data={...c.data,rewards:data};c.allEvents=events.map(e=>({...e,type:e.eventType,globalReleaseDate:e.date,estimatedEndDate:e.estimatedEndDate,imagePath:e.image}));c.rebuildEventIndexes();
   const groups=c.buildRewardGroups().map(g=>({...g,selectedOption:c.selectedVariableRewardOption(g),active:c.isRewardGroupActive(g),selectable:c.isRewardGroupSelectable(g)}));
   const campaigns=c.buildFreePullCampaignViews().map(g=>{const stock=c.isFreePullCampaignChoiceSelected(g,'stock');return {...g,state:{stock,ready:c.isFreePullCampaignReady(g),linked:c.isFreePullCampaignLinked(g),canSelect:c.canSelectFreePullCampaign(g,stock?'stock':'schedule'),canSwitch:c.canSelectFreePullCampaign(g,stock?'schedule':'stock')}};});c.rewardGroups=groups;c.freePullCampaignViews=campaigns;return {groups,campaigns,summary:{count:c.activeRewardCount,totalLabel:c.enabledRewardTotalLabel}};
  },{plan,data,events});
  const groups=domain.buildPlannerRewardGroups(data.rewards,data.event_benefits,data.competitive_variants,data.free_pull_campaigns,events,plan.projectionStartDate,'2026-08-29',plan).map(g=>({...g,active:domain.rewardGroupActive(plan,g),selectable:domain.rewardGroupSelectable(g)}));
  const cv=campaigns.buildPlannerCampaigns(data.free_pull_campaigns,events,plan.projectionStartDate,'2026-08-29').map(c=>({...c,state:campaigns.campaignState(plan,c)}));
  expected[name]=clean({groups:angular.groups.map(groupView),campaigns:angular.campaigns.map(campaignView),summary:angular.summary});
  const actual=clean({groups:groups.map(groupView),campaigns:cv.map(campaignView),summary:domain.plannerRewardSummary(plan,groups,cv)});
  try{assert.deepEqual(actual,expected[name]);}catch(error){failures.push({name,difference:error.message,expected:expected[name],actual});}
 }
 await writeFile('.tmp/planner-rewards-angular.json',JSON.stringify(expected,null,2));await writeFile('.tmp/planner-rewards-differences.json',JSON.stringify(failures,null,2));console.log(JSON.stringify({cases:plans.length,failures:failures.map(f=>({name:f.name,difference:f.difference.slice(0,3500)}))},null,2));if(failures.length)process.exitCode=1;
}finally{await browser.close();await server.close();}

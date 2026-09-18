import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { homeStats, mockAdvertising, mockCommunity, mockDatabase, mockAffinity, mockActivity, mockStatistics, mockTimeline, mockOwnerProfile, mockVeteranProfile } from '../tests/e2e/fixtures/angular-api.ts';
import { mockTimelineDetails } from '../tests/e2e/fixtures/timeline-details.ts';
import { mockPlannerControls } from '../tests/e2e/fixtures/planner-controls.ts';
import { mockPlannerGoals } from '../tests/e2e/fixtures/planner-goals.ts';
import { mockPlannerIncome } from '../tests/e2e/fixtures/planner-income.ts';
import { mockPlannerRewards } from '../tests/e2e/fixtures/planner-rewards.ts';

// Inspect both running implementations at the same sizes. Evidence is local;
// page bodies deliberately exclude the replacement navigation and ad rails.
const output = '.tmp/angular-comparison';
await mkdir(output, { recursive: true });
const uql = process.argv.includes('--uql');
const guide = process.argv.includes('--uql-guide');
const timelineDetails = process.argv.includes('--timeline-details');
const plannerControls = process.argv.includes('--planner-controls');
const plannerGoals = process.argv.includes('--planner-goals');
const plannerIncome = process.argv.includes('--planner-income');
const plannerBalance = process.argv.includes('--planner-balance');
const plannerRewards = process.argv.includes('--planner-rewards');
const plannerSetup = process.argv.includes('--planner-setup');
const plannerManager = process.argv.includes('--planner-manager');
const state = plannerManager ? 'planner-manager' : plannerSetup ? 'planner-setup-' + (plannerRewards ? 'rewards' : plannerBalance ? 'balance' : plannerIncome ? 'income' : 'closed') : plannerRewards ? 'planner-rewards' : plannerBalance ? 'planner-balance' : plannerIncome ? 'planner-income' : plannerGoals ? 'planner-goals' : plannerControls ? 'planner-controls' : timelineDetails ? 'timeline-details' : guide ? 'uql-guide' : uql ? 'uql-editor' : 'page';
const paths = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const routes = paths.length ? paths : ['/', '/database', '/circles', '/rankings', '/activity', '/activity/42', '/timeline', '/tierlist', '/tools', '/tools/statistics', '/tools/lineage-planner', '/login', '/privacy-policy', '/profile/123456789012', '/profile/123456789012/veterans', '/profile/123456789012/cm', '/settings', '/wip'];
const browser = await chromium.launch();
const report = JSON.parse(await readFile(`${output}/report.json`, 'utf8').catch(() => '[]')).filter((entry) => !routes.includes(entry.path) || (entry.state ?? 'page') !== state);
try {
  for (const width of [1536, 390]) for (const path of routes) {
    for (const [implementation, port] of [['angular', 4200], ['svelte', Number(process.env.SVELTE_PORT) || 4173]]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, locale: 'en-US' });
      const errors = [];
      const searches = [];
      page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.pathname.endsWith('/search/query')) searches.push([...url.searchParams]);
      });
      // RxJS debounceTime needs Date.now() to advance alongside its timers.
      await page.clock.install({ time: new Date('2026-08-29T12:00:00Z') });
      await mockAdvertising(page);
      await page.route('**/api/stats?*', (route) => route.fulfill({ json: homeStats }));
      await mockCommunity(page);
      await mockDatabase(page);
      await mockActivity(page);
      await mockStatistics(page);
      await mockTimeline(page, false);
      if (timelineDetails && path === '/timeline') await mockTimelineDetails(page);
      if ((plannerControls || plannerBalance || plannerManager) && path.split('?')[0] === '/timeline') await mockPlannerControls(page);
      if (plannerGoals && path.split('?')[0] === '/timeline') await mockPlannerGoals(page);
      if (plannerIncome && path.split('?')[0] === '/timeline') await mockPlannerIncome(page);
      if ((plannerRewards || plannerSetup && !plannerBalance && !plannerIncome) && path.split('?')[0] === '/timeline') await mockPlannerRewards(page);
      if (path.split('?')[0] === '/database') await mockAffinity(page);
      if (path.startsWith('/profile/')) await mockOwnerProfile(page, []);
      if (path.endsWith('/veterans')) await mockVeteranProfile(page);
      page.on('pageerror', (error) => errors.push(error.message));
      await page.addInitScript(() => {
        for (const key of ['privacy-notice-accepted', 'domain-migration-complete', 'domain_migration_popup_shown', 'milestone_1m_popup_shown', 'christmas_update_2025_seen']) localStorage.setItem(key, 'true');
        localStorage.setItem('umamoe-fuse-enabled-v1', 'false');
        localStorage.setItem('lastSeenUpdateVersion', '99999999');
      });
      try {
        await page.goto(`http://127.0.0.1:${port}${path}`, { waitUntil: 'networkidle', timeout: 25000 });
        await page.waitForTimeout(500);
        if (uql || guide) {
          if (implementation === 'angular') await page.locator('app-database-filter .filter-header h2').click();
          else await page.getByRole('button', { name: /Filters/ }).click();
          await page.getByRole(implementation === 'angular' ? 'button' : 'radio', { name: 'UQL', exact: true }).click();
          await Promise.all([
            page.waitForResponse(response => response.url().includes('/search/query?') && new URL(response.url()).searchParams.has('uql'), { timeout: 10000 }),
            page.locator('.cm-content').fill('Main Speed >= 3 and GP1 Long >= 2')
          ]);
          await page.locator('.cm-content').press('Escape');
          if (guide) await page.locator('.uql-wiki-panel > summary').click();
        }
        if (timelineDetails && path === '/timeline') {
          await page.getByRole('button', { name: 'Open details for Mejiro McQueen + 1 more', exact: true }).first().click();
          const dialog = page.getByRole('dialog');
          await expect(dialog.getByText('0.75% per pull')).toHaveCount(2);
          await expect(dialog.getByText('Alternative date fit')).toBeVisible();
          await expect.poll(() => dialog.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
          // Wait for Material's entrance animation before comparing its surface.
          await dialog.evaluate(async element => {
            const animations = document.getAnimations().filter(animation => {
              const target = animation.effect?.target;
              return target instanceof Element && (target.contains(element) || element.contains(target));
            });
            await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
          });
        }
        if (plannerControls) await expect(page.getByRole('group', { name: 'Apply settings to every planned banner' })).toBeVisible();
        if (plannerBalance) {
          await page.getByRole('button', { name: /Plan assumptions/ }).click();
          const balance = page.locator(implementation === 'angular' ? '.cp-setup-panel--resources' : '.balance-panel');
          await expect(balance.locator('legend')).toHaveText(['Carats', 'Tickets', 'Uncap Crystals', 'Crystal shards']);
          await expect.poll(() => balance.locator('img').evaluateAll(images => images.length === 4 && images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
        }
        if (plannerRewards) {
          await page.getByRole('button', { name: /Plan assumptions/ }).click();
          await page.getByRole('tab', { name: /^Rewards\b/ }).click();
          await expect(page.getByText('100 free-pull campaign', { exact: true })).toBeVisible();
        }
        if (plannerIncome) {
          await page.getByRole('button', { name: /Plan assumptions/ }).click();
          await page.getByRole('tab', { name: /^Income\b/ }).click();
          const disclosures = page.locator(implementation === 'angular' ? '.cp-scenario-section-disclosure' : '.income-section .disclosure');
          await expect(disclosures).toHaveCount(5);
          for (const button of await disclosures.all()) await button.click();
          await page.getByRole('button', { name: /Add income$/ }).click();
        }
        if (plannerGoals) {
          await page.locator(implementation === 'angular' ? '.cp-pickup-details>summary' : '.pickup-summary').click();
          if (width <= 768) await page.locator(implementation === 'angular' ? '.cp-advanced-odds>summary' : '.advanced-odds>summary').click();
          await expect(page.getByText('Selected pickup outcomes at 200 pulls', { exact: true })).toBeVisible();
        }
        const body = plannerManager ? page.getByRole('region', { name:'Planner controls and projection', exact:true }) : plannerSetup ? page.getByRole('region', { name:'Plan assumptions', exact:true }) : plannerRewards ? page.locator(implementation === 'angular' ? '.cp-setup-panel--rewards' : '.rewards-panel') : plannerBalance ? page.locator(implementation === 'angular' ? '.cp-setup-panel--resources' : '.balance-panel') : plannerIncome ? page.locator(implementation === 'angular' ? '.cp-setup-panel--income' : '.income-panel') : plannerGoals ? page.locator(implementation === 'angular' ? '.cp-target' : '.target') : plannerControls ? page.locator(implementation === 'angular' ? '.cp-targets' : '.targets') : timelineDetails && path === '/timeline' ? page.getByRole('dialog') : page.locator(implementation === 'angular' ? 'router-outlet + *' : '[data-page-body]').first();
        const target = await body.count() ? body : page.locator('body');
        const queryTag = path.includes('?') ? `-${createHash('sha256').update(path).digest('hex').slice(0, 12)}` : '';
        const name = `${implementation}-${path.split('?')[0].replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'}${queryTag}${state === 'page' ? '' : '-' + state}-${width}`;
        if (implementation === 'svelte') await page.addStyleTag({ content: '[data-shell-utility], [data-shell-bottom], [data-shell-rail] { visibility: hidden !important; }' });
        // Trigger lazy images/charts before a full-body capture; do not mistake
        // offscreen placeholders for missing sections.
        for (let y = 0; y < await page.evaluate(() => document.documentElement.scrollHeight); y += 650) {
          await page.evaluate((offset) => window.scrollTo(0, offset), y);
          await page.waitForTimeout(100);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(600);
        await target.screenshot({ path: `${output}/${name}.png`, timeout: 10000, animations: 'disabled' });
        if (plannerManager) {
          await (implementation === 'angular' ? page.locator('.cp-plan-picker>summary') : page.getByRole('button', { name:'Selected plan', exact:true })).click();
          await page.getByRole('menu', { name:'Select a plan', exact:true }).screenshot({ path:`${output}/${name}-picker.png`, animations:'disabled' });
          await page.keyboard.press('Escape');
          await (implementation === 'angular' ? page.locator('.cp-plan-more>summary') : page.getByRole('button', { name:'More plan actions', exact:true })).click();
          await page.locator(implementation === 'angular' ? '.cp-plan-menu' : '.menu-panel[aria-label="Plan actions"]').screenshot({ path:`${output}/${name}-actions.png`, animations:'disabled' });
          await page.keyboard.press('Escape');
        }
        if (plannerGoals) {
          await page.locator(implementation === 'angular' ? '.cp-goal-picker>summary' : 'button[aria-label="Choose rate-ups"]').click();
          await page.locator(implementation === 'angular' ? '.cp-goal-picker-popover' : '.popover[aria-label="Choose rate-ups"]').screenshot({ path: `${output}/${name}-picker.png`, animations: 'disabled' });
        }
        if (uql || guide) await page.locator('.uql-mode-panel').screenshot({ path: `${output}/${name}-detail.png`, timeout: 10000 });
        const text = await target.innerText();
        await writeFile(`${output}/${name}.txt`, text);
        report.push({ implementation, path, state, width, errors, searches, ...await page.evaluate(() => ({
          headings: [...document.querySelectorAll('h1,h2,h3')].map((node) => node.textContent.trim()),
          documentWidth: document.documentElement.scrollWidth,
          brokenImages: [...document.images].filter((img) => img.currentSrc && img.complete && !img.naturalWidth).map((img) => img.currentSrc)
        })) });
        console.log(name, errors.length ? errors : 'captured');
      } catch (error) { report.push({ implementation, path, state, width, error: error.message }); }
      await page.close();
    }
    await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  }
} finally { await browser.close(); }

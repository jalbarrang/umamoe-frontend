// Read the running Angular implementation; never rewrite the committed reference.
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { mockAdvertising, mockCommunity } from '../tests/e2e/fixtures/angular-api.ts';

const server = await createServer({ server: { middlewareMode: true }, configLoader: 'runner' });
const browser = await chromium.launch();
const cases = [], differences = [];
try {
  const { clubProgressionCases, clubProgressionFixture } = await server.ssrLoadModule('/tests/e2e/fixtures/club-progression.ts');
  const { buildMemberProgression, buildClubCalendar } = await server.ssrLoadModule('/web/domain/clubs/club-progression.ts');
  for (const name of clubProgressionCases) {
    const fixture = clubProgressionFixture(name);
    const page = await browser.newPage({ locale: 'en-US', timezoneId: 'UTC' });
    await page.clock.setFixedTime('2026-09-06T12:00:00Z'); await mockAdvertising(page); await mockCommunity(page);
    await page.route('**/api/v4/circles?*', route => route.fulfill({ json: fixture.response }));
    await page.addInitScript(() => { localStorage.setItem('privacy-notice-accepted', 'true'); localStorage.setItem('page-introduction-audience-v1', 'existing'); });
    await page.goto(`http://127.0.0.1:4200/circles/7?year=${fixture.year}&month=${fixture.month}`);
    await page.waitForFunction(() => { const element = document.querySelector('app-circle-details'), c = element && window.ng?.getComponent(element); return c && !c.loading && (c.memberChart || !c.rawMemberData.length); });
    for (const search of ['', 'Left trainer', '7001']) for (const includePrior of [true, false]) for (const mode of ['cumulative', 'delta']) {
      const expected = await page.evaluate(({ search, includePrior, mode }) => {
        const c = window.ng.getComponent(document.querySelector('app-circle-details'));
        c.memberFilter = search; c.config.includePriorClubData = includePrior; c.memberChartMode = mode;
        c.processMembersData(c.allMemberData); c.initMemberChart(); c.buildCalendarData();
        const datasets = c.memberChart?.data.datasets ?? [];
        return {
          progression: { labels: c.memberChart?.data.labels ?? [], members: datasets.map((set, index) => ({
            viewerId: c.filteredRawMemberData[index].viewer_id, name: set.label, color: set.borderColor, values: set.data,
            carriedForward: set.data.map((_, i) => set.segment.borderColor({ p1DataIndex: i }) === 'transparent'),
            priorClub: set.data.map((_, i) => set.segment.borderDash({ p0DataIndex: i, p1DataIndex: i }).length > 0)
          })) },
          calendar: c.calendarWeeks.map(week => week.map(day => ({ ...day, isOtherMonth: !!day.isOtherMonth })))
        };
      }, { search, includePrior, mode });
      const actual = { progression: buildMemberProgression(fixture.response.members, fixture.year, fixture.month, includePrior, mode, search), calendar: buildClubCalendar(fixture.response.members, fixture.year, fixture.month, search) };
      cases.push({ name, search, includePrior, mode, ...expected });
      try { assert.deepEqual(actual, expected); } catch { differences.push({ name, search, includePrior, mode, actual, expected }); }
    }
    await page.close();
  }
  await mkdir('.tmp', { recursive: true });
  const source = 'src/app/pages/circles/circle-details/circle-details.component.ts';
  const sha256 = createHash('sha256').update(await readFile(`../../${source}`)).digest('hex');
  await writeFile('.tmp/club-progression-angular.json', JSON.stringify({ source, sha256, cases }, null, 2));
  const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
  await writeFile('.tmp/club-progression-reference.json', JSON.stringify({ source, sha256, cases: cases.map(({ name, search, includePrior, mode, progression, calendar }) => ({ name, search, includePrior, mode, progression: digest(progression), calendar: digest(calendar) })) }, null, 2));
  await writeFile('.tmp/club-progression-differences.json', JSON.stringify(differences, null, 2));
  console.log(JSON.stringify({ cases: cases.length, matching: cases.length - differences.length, failures: differences.map(({ name, search, includePrior, mode }) => ({ name, search, includePrior, mode })) }));
  if (differences.length) process.exitCode = 1;
} finally { await browser.close(); await server.close(); }

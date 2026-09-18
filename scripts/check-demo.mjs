import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const base = process.env.DEMO_URL ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch();
try {
 const page = await browser.newPage();
 const errors = [];
 page.on('pageerror', error => errors.push(error.message));
 for (const [path, expected] of [
  ['/', '4.521'], ['/database', 'Parity Trainer'], ['/circles', 'Team Sirius'],
  ['/circles/7', 'Gold Ship'], ['/rankings', 'Parity Trainer'], ['/activity', 'Mejiro Analyst'],
  ['/activity/42', 'Mejiro Analyst'], ['/timeline', 'Mejiro McQueen Pickup'],
  ['/tools/statistics', 'Special Week'], ['/tierlist', 'Tierlist Information'],
  ['/profile/123456789012', 'Team Sirius'], ['/profile/123456789012/veterans', 'Grass Wonder']
 ]) {
  await page.goto(`${base}${path}`);
  await page.getByRole('status').filter({ hasText: 'Demo preview' }).waitFor();
  await page.getByText(expected, { exact: false }).first().waitFor({ timeout: 20000 });
  console.log(`PASS ${path}`);
 }
 const result = await fetch(`${base}/api/v4/rankings/monthly?page=0&limit=100`).then(response => response.json());
 assert.equal(result.total, result.rankings.length);
 const empty = await fetch(`${base}/api/v4/rankings/monthly?query=does-not-exist`).then(response => response.json());
 assert.equal(empty.total, 0);
 assert.equal((await fetch(`${base}/api/borrow/views`, { method: 'POST' })).status, 405);
 assert.deepEqual(errors, []);
} finally { await browser.close(); }

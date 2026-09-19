// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('advances only the build patch, preserves the manual major/minor, and rejects missing build numbers', () => {
  const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
  const series = version.split('.').slice(0, 2).join('.');
  for (const build of ['371', '372']) {
    const result = execFileSync(process.execPath, ['scripts/build-version.mjs'], { env: { ...process.env, GITHUB_RUN_NUMBER: build }, encoding: 'utf8' });
    expect(result.trim()).toBe(`${series}.${build}`);
  }
  expect(spawnSync(process.execPath, ['scripts/build-version.mjs'], { env: { ...process.env, GITHUB_RUN_NUMBER: '' } }).status).not.toBe(0);
});

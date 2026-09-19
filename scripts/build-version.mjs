import { readFileSync } from 'node:fs';

// Major/minor are changed manually in package.json; CI advances only the patch.
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const build = process.env.GITHUB_RUN_NUMBER;
if (!/^\d+\.\d+\.\d+$/.test(version) || !/^[1-9]\d*$/.test(build ?? '')) {
  throw new Error('Expected a major.minor.patch package version and a positive GITHUB_RUN_NUMBER.');
}
console.log(`${version.split('.').slice(0, 2).join('.')}.${build}`);

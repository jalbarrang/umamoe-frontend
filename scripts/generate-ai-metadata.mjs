import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'contracts', 'features.json'), 'utf8'));
const publicDir = path.join(root, 'public');
const metaDir = path.join(publicDir, 'meta');
await mkdir(metaDir, { recursive: true });

const publicFeatures = manifest.features.filter((feature) => feature.dataOwnership !== 'private');
const lines = [
  '# uma.moe',
  '',
  '> Mobile-first Umamusume database, Veteran workspace, race analysis, timeline, community data, and planning tools for the global version.',
  '',
  '## Public features',
  '',
  ...publicFeatures.map((feature) => `- [${feature.title}](https://uma.moe${feature.path}): ${feature.description}`),
  '',
  '## Data and privacy',
  '',
  'Public metadata never contains private account, Veteran, race, or standalone-client payloads. Authentication is required before account-owned data is requested.',
  ''
];

await writeFile(path.join(publicDir, 'llms.txt'), lines.join('\n'));
await writeFile(path.join(metaDir, 'features.json'), `${JSON.stringify({ ...manifest, features: publicFeatures }, null, 2)}\n`);
await writeFile(
  path.join(publicDir, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicFeatures.map((feature) => `  <url><loc>https://uma.moe${feature.path}</loc></url>`).join('\n')}\n</urlset>\n`
);

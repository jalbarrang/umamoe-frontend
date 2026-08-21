import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = path.join(process.cwd(), 'dist');
const limits = { js: 100 * 1024, css: 35 * 1024 };
const totals = { js: 0, css: 0 };

async function visit(directory) {
  for (const name of await readdir(directory)) {
    const file = path.join(directory, name);
    const info = await stat(file);
    if (info.isDirectory()) await visit(file);
    else if (name.endsWith('.js') || name.endsWith('.css')) {
      const kind = name.endsWith('.js') ? 'js' : 'css';
      totals[kind] += gzipSync(await readFile(file)).byteLength;
    }
  }
}

await visit(dist);
const failures = Object.entries(limits).filter(([kind, limit]) => totals[kind] > limit);
for (const [kind, bytes] of Object.entries(totals)) {
  console.log(`${kind.toUpperCase()} compressed: ${(bytes / 1024).toFixed(1)} KiB / ${(limits[kind] / 1024).toFixed(0)} KiB`);
}
if (failures.length) {
  throw new Error(`Performance budget exceeded: ${failures.map(([kind]) => kind).join(', ')}`);
}

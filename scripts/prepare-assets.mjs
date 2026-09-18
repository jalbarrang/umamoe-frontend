import { cp } from 'node:fs/promises';

// Vite serves public/ verbatim; preserve the legacy static artwork URLs.
await cp(new URL('../src/assets/', import.meta.url), new URL('../public/assets/', import.meta.url), { recursive: true });
await import('./precompute-tierlist.js');

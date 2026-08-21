import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

function excludeProductionUiLabFixtures() {
  const emittedFixture = /\/(?:oguri-cap|mejiro-mcqueen|kitasan-black(?:-support)?|skill-(?:speed|recovery)|item-carats)-[^/]+\.webp$/;
  return {
    name: 'exclude-production-ui-lab-fixtures',
    generateBundle(_options: unknown, bundle: Record<string, { type: string; originalFileNames?: string[] }>) {
      for (const [fileName, output] of Object.entries(bundle)) {
        const originatedInLab = output.originalFileNames?.some((path) => path.replaceAll('\\', '/').includes('web/features/ui-lab/fixtures/'));
        if (output.type === 'asset' && (originatedInLab || emittedFixture.test(`/${fileName.replaceAll('\\', '/')}`))) {
          delete bundle[fileName];
        }
      }
    }
  };
}

export default defineConfig(({ mode }) => ({
  root: rootDirectory,
  plugins: [svelte(), ...(mode === 'production' ? [excludeProductionUiLabFixtures()] : [])],
  optimizeDeps: {
    noDiscovery: true,
    include: [],
    exclude: ['svelte', 'svelte/store', 'sv-router']
  },
  define: {
    __APP_ENVIRONMENT__: JSON.stringify(mode),
    __UI_LAB_ENABLED__: JSON.stringify(mode !== 'production')
  },
  build: {
    assetsDir: 'assets/app',
    manifest: true,
    sourcemap: mode !== 'production',
    target: 'es2022'
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: {
      strict: true,
      allow: [rootDirectory]
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['web/**/*.test.ts']
  }
}));

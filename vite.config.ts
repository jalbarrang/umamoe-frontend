import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { demoData } from './scripts/demo-data';
import { environment as production } from './src/config/environment.prod';
import { environment as beta } from './src/config/environment.beta';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(async ({ mode }) => {
  // Keep the existing CI-injected public provider IDs during the framework migration.
  const environment = mode === 'production' ? production : beta;
  const variables = loadEnv(mode, rootDirectory, 'VITE_');
  return {
    root: rootDirectory,
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    plugins: [svelte(), ...(mode === 'demo' ? [await demoData()] : [])],
    optimizeDeps: {
      noDiscovery: true,
      include: ['exceljs'],
      exclude: ['svelte', 'svelte/store', 'sv-router']
    },
    define: {
      __APP_ENVIRONMENT__: JSON.stringify(mode),
      __APP_CONFIG__: JSON.stringify({
        siteKey: variables.VITE_TURNSTILE_SITE_KEY ?? environment.turnstile.siteKey,
        measurementId: variables.VITE_GOOGLE_ANALYTICS_ID ?? environment.googleAnalytics.measurementId,
        providersEnabled: mode === 'production' || mode === 'beta',
        statusApiUrl: environment.statusApiUrl
      }),
      __UI_LAB_ENABLED__: JSON.stringify(mode !== 'production')
    },
    build: {
      // Native imports remain lazy; Vite still loads split CSS before each page.
      // ponytail: skip JS preloading until WebKit's failed-preload cache is fixed:
      // https://bugs.webkit.org/show_bug.cgi?id=270357
      modulePreload: false,
      // Compiled code belongs to the shell artifact; /assets is deployed separately.
      assetsDir: 'app',
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
      },
      proxy: {
        '/api': 'http://127.0.0.1:3001',
        '/search': 'http://127.0.0.1:3002',
        '/ingest': 'http://127.0.0.1:3003',
        '/resources': 'http://127.0.0.1:3004',
        '/assets/data': { target: 'https://uma.moe', changeOrigin: true }
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./vitest.setup.ts'],
      include: ['src/**/*.test.ts', 'scripts/**/*.test.ts']
    }
  };
});

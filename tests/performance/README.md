# Local mobile interaction benchmark

Run from the Svelte workspace after installing its dependencies and Playwright Chromium:

```powershell
npm run benchmark:mobile -- --repeat-each 3
```

This builds the beta configuration for production and runs five scenarios serially in a fresh Chromium context per test. It uses a Pixel 5 touch viewport and **8× CPU slowdown**. Timeline direction switching and sidebar navigation also exercise a desktop viewport at the same CPU slowdown. Do not run other builds or browser suites concurrently with a measurement.

The fixtures reuse the functional-test catalogs and provide:

- 1,200 distinct database records, fetched in pages of 12, with 60 white sparks and overlapping parent contributions. The test accumulates 36 records and checks newly visible cards use the selected display mode.
- 4,000 timeline events and reward rows, plus 30 planner targets with two pickup goals each.
- An expanded picker catalog with 250 additional characters, 500 supports, 2,000 skills and 1,200 factors. Tests scroll to load further batches and search entries beyond the mounted batch.
- Statistics aggregates containing 200 characters, 500 supports and 2,000 skills across six distances, four classes and three scenarios. The displayed 24 million samples are aggregated counts, not 24 million rendered rows.
- Mobile menu navigation from Home to Database, Timeline and Statistics, followed by repeat visits in the same session.

The clock is fixed to 29 August 2026 by the timeline fixture. API responses, browser verification and advertising use test fixtures; no account or real backend writes are involved. This measures application CPU/rendering under load. It does **not** reproduce mobile hardware, slow network transfers, ad-provider CPU use, CMPs, or production API latency.

## Results

Each test writes `metrics.json` under `.tmp/stress-results/`, including approximate event-handler-to-next-paint timings, browser Event Timing entries, long tasks and final DOM count. Profiled scenarios also write `.cpuprofile` files that can be loaded in Chrome DevTools. Navigation writes `navigation.json` with click-to-populated-content times; these include Playwright readiness polling overhead.

`paints` uses a capture listener followed by `requestAnimationFrame` and a timer. It is a lab approximation, not an INP score. CodeMirror does not emit a native `input` event for every keystroke: inspect the `keydown` Event Timing entries for typing. Repeated action names and unlabeled events should not be averaged into other actions. Use medians across fresh runs and keep CPU rate, workload, host and build mode the same for comparisons.

Override the output directory or slowdown in PowerShell:

```powershell
$env:PERF_CPU = '8'
$env:PERF_OUT = '.tmp/my-mobile-benchmark'
npm run benchmark:mobile -- --repeat-each 3
```

To run one scenario against an already built `dist/`:

```powershell
npx playwright test --config playwright.performance.config.ts --grep 'mobile navigation' --repeat-each 3
```

The preview uses port 4184 and reuses an existing server there. Ensure it serves this workspace's current build. Assertions cover working interactions, lazy loading, bounded timeline rendering and populated routes; timing values are reported rather than enforced as machine-dependent pass/fail thresholds.

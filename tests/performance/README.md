# Local mobile interaction benchmark

For the reward and affinity hotspots found in the shared Firefox recordings, run `node tests/performance/profile-hotspots.mjs`. It reports medians for isolated calculations on synthetic data, without browser rendering or CPU throttling. See [the profile findings](../../reports/firefox-profiler-2026-09-20.md) for the recordings, changes and limits of these measurements.

## All existing interaction workflows: 300 ms budget

```powershell
npm run benchmark:interactions
```

Runs the entire functional browser suite serially on mobile and desktop Chromium at **8× CPU slowdown**. Every native click/tap/keyboard interaction on buttons, tabs, links, fields, options and disclosures is timed through Chrome's Event Timing API. The normal functional assertions still verify the resulting dialogs, state and navigation. Any measured interaction over **300 ms** fails its workflow; there is no percentile exemption. Related pointer/key events are grouped by the browser's interaction ID and the longest duration is retained.

`summary.json` in `.tmp/interaction-audit/` lists measured controls, routes, worst durations, failure counts and every workflow's status. Entries shorter than the browser's 16 ms reporting floor may be absent. This is coverage of the exercised workflows, not a claim that every possible control/data/state combination has been enumerated. Skipped workflows and workflows without samples remain visible in the report. Synthetic `dispatchEvent`/range helpers, hover-only responses, native browser dialogs and external pages are not covered by native Event Timing.

Each completed workflow is also saved immediately under `workflows/`, so interrupting a long run preserves its completed measurements. Set `PERF_PROFILE=1` for an isolated diagnostic workflow to attach `cpu.cpuprofile` (JavaScript stacks) and `browser-trace.json` (browser tasks, style/layout, paint and garbage collection). Import the trace into Chrome DevTools Performance and the CPU profile into its JavaScript Profiler. Click marks identify exercised controls. Inspect the blocked interval, separating application work from Playwright locator evaluation and asynchronous network/animation spans. Keep profiling off when checking the budget.

The large-data stress suite below additionally checks **completed content** for UQL, picker dialogs, race dialogs, planner goals and populated routes against the same 300 ms budget. These browser-clock measurements begin at input dispatch and end after the readiness condition plus two animation frames; they exclude Playwright locator lookup and readiness polling. They are reported separately from native input-to-next-paint timing, so a quick loading indicator cannot pass as completed route content.

Use `$env:PERF_ENFORCE = '0'` only for diagnostic runs that need to finish collecting all measurements despite budget failures. It does not change the threshold reported. Omit it for regression enforcement. `PERF_CPU` and `PERF_OUT` apply to both suites. Run just one project with `--project mobile-chromium` or `--project chromium`, and use Playwright's `--grep`/file filters to reproduce a failing workflow. APIs and advertising remain mocked as in the functional tests; deliberate failure/delay scenarios are identified by their workflow titles.

## Large synthetic datasets

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

Each test writes `metrics.json` under `.tmp/stress-results/`, including approximate event-handler-to-next-paint timings, browser Event Timing entries, long tasks and final DOM count. Set `$env:PERF_PROFILE = '1'` for a separate diagnostic run to collect `cpu.cpuprofile` files for Chrome DevTools; profiling adds overhead and is disabled for budget measurements. Navigation writes `navigation.json` with click-to-populated-content times; these include Playwright readiness polling overhead.

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

The preview uses port 4184 and reuses an existing server there. Ensure it serves this workspace's current build. Assertions cover working interactions, lazy loading, bounded timeline rendering and populated routes. Native interaction timing and the explicit content-readiness checks now enforce the 300 ms budget by default; the legacy `paints` approximation is diagnostic only.

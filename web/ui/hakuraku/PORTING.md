# Hakuraku UI ports

These Svelte contracts are clean framework ports of reusable Hakuraku interface patterns. They use a deliberate hybrid: Hakuraku supplies analytical composition, density, row rhythm, and chart language; uma.moe supplies the tokens, accessibility behavior, responsive rules, and primitive semantics. They do not load React or Bootstrap.

- UI source: https://github.com/ayaliz/hakuraku (MIT)
- Chart renderer: modular ECharts 6 with the SVG renderer (Apache-2.0)
- Base theme: uma.moe semantic tokens for surfaces, typography, colors, fields, focus, borders, radii, elevation, light mode, and dark mode
- Catalogue coverage: shared controls, RaceDataPresenter, RaceReplay, Multi-Race analysis, UmaLogs, Veterans, auxiliary pages, and overlay patterns
- Inventory: 86 named UI contracts distilled from the complete visual source inventory; four metadata/logic helpers are documented separately
- Data ownership: demo fixtures only; no user race data is included in UI Lab metadata

`hakuraku.css` now contains only source-derived feature layout and analytical composition. Generic controls are instantiated directly from `web/ui`: buttons, fields, selects, entity selectors, tabs, choices, sliders, file drops, pagination, banners, progress, metric bars, stat strips, plain tables, dialogs, race schedules, and Veteran summaries. `moe-skin.css` loads last only for genuinely Hakuraku-specific surfaces such as rich runner tables, replay composition, rankings, and charts. Domain components may expose explicit Hakuraku-density variants, but those variants must consume moe tokens and component contracts instead of recreating a parallel primitive layer.

The UI Lab examples are presentation contracts, not a second application. Route features should pass typed domain data into extracted Svelte components. They must not depend on Hakuraku page state or on ECharts directly; `EChartsSurface.svelte` remains the renderer boundary.

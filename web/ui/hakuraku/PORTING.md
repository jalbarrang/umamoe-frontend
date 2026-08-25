# Hakuraku UI ports

These Svelte contracts are clean framework ports of reusable Hakuraku interface patterns. They do not load React or Bootstrap.

- UI source: https://github.com/ayaliz/hakuraku (MIT)
- Chart renderer: modular ECharts 6 with the SVG renderer (Apache-2.0)
- Ported surfaces: upload, runner table, replay controls, course map, and race graph
- Data ownership: demo fixtures only; no user race data is included in UI Lab metadata

Route features should pass typed domain data into these components. They must not depend on Hakuraku page state or on ECharts directly; `EChartsSurface.svelte` is the renderer boundary.

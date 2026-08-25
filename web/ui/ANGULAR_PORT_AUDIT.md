# Angular UI pattern audit

This audit treats the Angular frontend as the visual and interaction reference, not as an implementation to translate. Svelte contracts should preserve the useful game vocabulary while replacing Material overlays, global overrides, change-detection workarounds, and duplicated feature CSS.

## Already represented in the Svelte UI system

- Original semantic colors, typography, spacing, density, themes, and responsive page geometry.
- Buttons, fields, selects, comboboxes, choice controls, sliders, dialogs, sheets, menus, feedback, tables, virtualization, artwork, skill chips, sparks, Veteran selection, character/support-card picking, workspace state, and ad regions.
- Adaptive shell navigation. `NavigationTree` now adds optional subsections through the same typed model in the expanded rail, compact rail flyout, and mobile More sheet.

## Implemented foundation contracts

These contracts are now implemented and exercised in the UI Lab. Product routes should compose them rather than recreate their presentation.

| Contract | Angular reference | Svelte responsibility |
| --- | --- | --- |
| `RankBadge` and rank parser | `rank-badge.component.ts` | Preserve G–SS+, UG–US9 mapping, split ultra-rank color treatment, real rank asset support, compact text fallback, and score-to-rank conversion as pure TypeScript. |
| `AptitudeGrade`, `AptitudeGrid`, `StatStrip` | `_shared-components.scss` | Reuse the dense character identity vocabulary across Database, Veterans, Race Lab, and statistics without rebuilding a card for each route. |
| `FilterShell`, `FilterSection`, `FilterPresetMenu` | `database-filter.component.html` | Basic/Advanced/UQL mode control, collapsible groups, active-filter count, presets, clear/reset actions, and stable mobile composition. Keep filter state and data outside the components. |
| `CountedOption`, `SelectionChip`, `FilterSheet` | `class-filter` and `white-factor-type-picker` | Support image/icon options, include/exclude semantics, result counts, search, keyboard selection, and a bounded mobile sheet. |
| `VeteranSummary`, `VeteranListItem` | `veteran-display.component.html` and `vpd-row.component.html` | Show identity, rank, scenario, affinity, main sparks, P1/P2 summaries, source/workspace, selection, and actions in one responsive row. Do not copy the Angular phone micro-font sizes. |
| `LineageTree`, `LineageNode`, `AffinityStat` | `lineage-display.component.html` and `inheritance-entry.component.html` | Preserve parent/grandparent relationships, connectors, role colors, focusable nodes, base/race affinity, rank/score, sparks, and route actions. Use semantic DOM first and decorative SVG only for connectors. |
| `RaceBadge`, `RaceSchedule`, `PlacementBadge` | `race-scheduler.component.html` | Preserve G1/G2/G3 semantics, early/late month slots, win/place state, optimal-affinity gain, search/add/remove, and a purpose-built mobile list instead of compressing the calendar. |
| `CharacterPicker`, `SupportCardPicker` | `character-select-dialog` and `support-card-select-dialog` | Reuse Angular's compact search/filter panels, real game art, selection state, affinity ordering, type/rarity filters, and target/include/exclude meaning without Material dialogs or route-owned grids. |
| `DistanceSelector`, `SparkEditor` | `distance-selector` and `spark-editor` | Keep distance colors and factor presentation consistent while exposing explicit pressed/radio state and component-width mobile compaction. Do not port Angular scroll listeners or manual change detection. |
| `ResultToolbar`, `LeaderboardRow` | inheritance results, rankings, and circles pages | Share count/filter context, live state, sort, view mode, rank/trend, identity, and comparison stats. Mobile changes the information layout rather than scaling desktop rows down. |
| `TimelineEventCard` | `timeline-event-card.component.html` | Retain event type, rerun/prediction state, date/context, real banner, reward items, pickups, race context, overflow count, and direct planner action in one container-responsive contract. |
| `ChartFrame`, `QueryEditor` | `statistics-chart` and Database UQL | Standardize renderer-independent chart metadata/status/export and the lazy parser/editor shell without including route datasets or parser code in the UI component. |
| `InspectPopover`, `GuidedTourCallout` | card hover menus, details previews, and `page-tour-intro-dialog` | Replace hover-only inspection and Material overlay coupling with click/keyboard/touch disclosure, explicit progress, and reduced-motion-safe local help. |

## Port when their owning routes begin

| Contract | Route | Notes |
| --- | --- | --- |
| `EventDetails` section patterns | Timeline | Reusable definition-list facts, source links, reward outcome summaries, and prediction/alternative fit displays. |
| `RaceResultEditor` details | Race Lab | Reuse approved race, placement, character, skill, and input contracts; add only the race-specific result correction workflow when the route is ported. |
| `CaratPlannerEventRow` | Carat Planner | Compose the approved timeline/reward vocabulary with planner-owned cost and schedule calculations once the route logic is migrated. |

## Semantic tokens to retain

- Rank tiers and stat identities.
- Aptitude grades.
- Sprint, Mile, Medium, Long, and Dirt distance colors.
- G1, G2, and G3 race grades plus placement state.
- Target, Veteran, parent, grandparent, and lineage roles.
- Blue, pink, green, and white factors plus main-parent and P2 source accents.
- Timeline event types, reward kinds, chart series, warnings, and verification states.

Each token needs a light/dark value, readable text pairing, and a non-color label or icon. Feature components consume semantic aliases rather than literal Angular variable names.

## Deliberately do not port

- Angular Material or its global theme/overlay override layer.
- Scroll listeners and manual change-detection calls used to force responsive layout.
- Hover-only action or preview behavior.
- Routine glow, pulse, blur, seasonal effects, animated counters, or card lift.
- Tiny mobile typography used to squeeze desktop composites onto phones.
- Feature-local copies of chips, factors, buttons, tables, and empty states already covered by UI contracts.

## Source landmarks

- Semantic race, tree, distance, timeline, and chart tokens: `src/styles.scss`.
- Shared identity, aptitude, stat, skill, tab, and filter rules: `src/styles/_shared-components.scss`.
- Shared sparks, data table, verification, toggle, distance, and empty-state mixins: `src/styles/_mixins.scss`.
- Dense filters and presets: `src/app/components/database-filter/database-filter.component.html`.
- Rank mapping: `src/app/components/rank-badge/rank-badge.component.ts`.
- Veteran summaries and list rows: `src/app/components/veteran-display/` and `src/app/components/veteran-picker-dialog/vpd-row/`.
- Lineage: `src/app/components/lineage-display/` and `src/app/components/inheritance-entry/`.
- Calendar: `src/app/components/race-scheduler/`.
- Timeline: `src/app/components/timeline-event-card/` and `src/app/components/timeline-event-details/`.
- Chart wrapper: `src/app/components/statistics-chart/`.

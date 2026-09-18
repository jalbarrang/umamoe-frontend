# Angular → Svelte review

## Status

The port is **not yet a complete, approved Angular replacement**. Existing route
tests were insufficient evidence for the previous blanket `behavior-parity`
labels. The ledger now uses provisional `structural-parity` status, and
productionReplacementReady remains false. Historical evidence labels in that
ledger are not approvals.

Angular source: `C:/Users/lars/Documents/git/umamoe-frontend/src/app`.
Svelte source: `C:/Users/lars/Documents/git/umamoe-frontend/.codex-worktrees/svelte-rewrite/web`.
Use the current Angular checkout, not the older snapshot inside this worktree.
The approved navbar, page widths and ad regions remain separate from page-body comparisons.

### Current pass — Database design review checkpoint

Updated picker height, the vertical affinity divider, empty numeric placeholders,
Min LB styling, shared filter/result toggles, dialog chrome and trainer submission.
Result affinity and portrait focus share the spark-owner colors. Spark display now
offers Combined, Split, and Split + portraits using the existing result component.

Current artifact SHA-256: `B6EE010D3282A087B24E5BC4C2E9DACD8C0ABDB63F81CFA76B7682B72C23245C`.
Build log: `.tmp/design-review-handoff-build.log`. The targeted design workflow
passes desktop Chromium, mobile Chromium and mobile WebKit (3/3); see
`.tmp/design-review-handoff-browser.log`. Manual visual approval remains pending.
Stop here for user review; this is not full migration approval.

### Previous pass — Veteran picker source-specific sorting and search

Restored Angular's tab-specific sort semantics: Partner and Veteran Total use
career stats; Bookmark and Manual affinity sorting retains source order. Empty
or whitespace-only spark searches no longer open suggestions. Reused the existing
combobox query threshold and kept sorting in the existing pure domain function.

Production build passes 238 logic tests, zero Svelte diagnostics and shell budgets.
Artifact SHA-256: `3C158CC5D0C0B238B8359006E73E0497551A4685AC2C6E473511F9AAA19D02B4`.
The full production workflow suite finished with 699 passed, 2 skipped and 1
failed: mobile WebKit club progression chart tooltip/dismissal at
`tests/e2e/club-progression.spec.ts:104`. Results are in
`.tmp/full-route-parent-sorting-production.log`. Build log: `.tmp/parent-sorting-build.log`.
These results cover the previous artifact, not the current design pass, and are not approval.

Source audit during the frozen build run identified remaining Rankings differences
to fix and verify next:
- Angular's tab icons and month/year/sort prefix icons are missing; existing
  `Tabs` and `SelectField` already support them.
- Angular sort labels are `Avg/Month`, `Total Fans`, `Total Gain`, `Avg/Day`,
  `Avg/Week`, and `3-Day Gain`/`7-Day Gain`/`30-Day Gain`, not the current paraphrases.
- Angular years are ascending from 2021; Svelte reverses their order.
- Svelte inserts an extra ranked-trainers count above the results, absent in Angular.
References: `src/app/pages/rankings/rankings.component.ts:67` and the corresponding
template's tab/filter/results sections; `web/features/community/RankingsPage.svelte:31`.
These were source-confirmed gaps despite previously green route workflows.
The Rankings source now corrects these items and restores the source tab colors,
weight and spacing using the shared controls. A rising-trend glyph extends the
existing icon registry. These changes are not built into the frozen test artifact.
Svelte checking passed before the final icon substitution; production build and
updated label/icon/year-order browser assertions remain pending after the full run.
Keep `tests/e2e/community-parity.spec.ts` unchanged until the active run terminates;
its old sort-label assertions need updating to Angular's labels for the next build.

Further unbuilt source fixes: replaced invalid combined `font: ... inherit`
declarations in LoginPage and the two database factor-priority inputs with valid
font longhands. Angular explicitly uses 0.9rem/500 for provider buttons and
13px/800 for the white-factor priority input. Add computed-font assertions to
the corresponding browser workflows after the active run; these fixes are not
covered by that frozen production artifact. The final Rankings icon registry
change passed Svelte checking (`.tmp/ranking-controls-final-check.log`).

### Previous pass — Tools viewport background and character picker breakpoint

The Tools hero now reserves the available viewport height independently of the
statistics strip; its background fills the route width while content retains the
normal frame. Character cards now use Angular's 600px viewport breakpoint instead
of an unrelated inner-container threshold, including the source 62px mobile portraits.
No new picker abstraction or dependency was added.

Validation: production build, 237 logic tests, zero Svelte errors/warnings, and
69 Home/Tools, picker-style and Veteran workflows across desktop Chromium, mobile
Chromium and mobile WebKit. Screenshots inspected at 1536px (Tools) and 600px
(character dialog). Logs: `.tmp/tools-selector-parity-build.log` and
`.tmp/tools-selector-parity-browser.log`. Artifact SHA-256:
`66FB4D7413BD2D059FAFB0B79E8153A227AC4C235634BDC3E34201ACE25EAD76`.
This is targeted regression evidence, not full visual or behavioral approval.

### Previous pass — Rankings failed-request isolation

Rankings clears the prior result when requesting another query/period, preventing
failed requests from showing another tab's rows as current data. Replaced the
screen-reader-only error with the shared danger banner in the results area,
including Retry and the existing Discord report link. This follows the requested
visible/retryable error treatment rather than copying Angular's silent failure.

Artifact `045494A0FA22DC819CF20876BE87E7FFAFA8EAA33A60AE58F8BD128C0B210AFB`:
237 logic tests, zero Svelte diagnostics, budgets passing and **33/33** community
workflows pass (`.tmp/rankings-error-build.log`,
`.tmp/rankings-error-production.log`). A new workflow fails Gains after Monthly
loads, verifies stale rows/total and false empty-state messages are absent, then
retries successfully without changing the selected tab. Full migration remains
unapproved; this is focused error-state evidence.

### Previous pass — Rankings search/history race

URL restoration now cancels an outstanding search debounce. A deterministic
browser-clock regression reproduced the previous behavior: Back restored page 2,
then the delayed callback reset it to page 1 and replaced the forward entry.
The check now verifies the original URL, page range, restored search and Forward.

Artifact `29C71525A563D657C8509CB938E8F1434EC1C169E70E4785A5578B6BA84BBEE9`:
237 logic tests, zero Svelte diagnostics, budgets passing and **30/30** community
workflows pass (`.tmp/rankings-history-build.log`,
`.tmp/rankings-history-production.log`). Before-fix failure evidence is in
`.tmp/rankings-history-before.log`. This resolves a navigation regression, not
the remaining migration-wide visual and behavioral acceptance requirements.

### Previous pass — Rankings search clearing

Restored Angular's conditional Clear action alongside desktop period controls
and below the stacked mobile controls. Clearing cancels a pending debounce,
removes the query, resets the page and retains period/sort/page size. Added the
missing search suffix icon through TextField and source clear-button theme tokens.

Artifact `055E683DFE9D86FE09B9F229A98637684162EF902EBE4135953315AD0225C379`:
237 logic tests, zero Svelte diagnostics, budgets passing and **27/27** community
workflows pass (`.tmp/rankings-clear-build.log`, `.tmp/rankings-clear-production.log`).
The new workflow clears a paginated search, verifies request/URL state, then
reloads. Remaining page controls/states still require source review; not approval.

### Previous pass — Rankings selected-column and gain colors

Separated positive gain state from selected metric emphasis. Selected columns
use Angular's warning value/label colors; positive monthly/total gains and the
Gains summary retain its explicit green. Missing numeric values use disabled
text. The Gains summary is an active column only on 30-day sort, as in Angular.

Artifact `3AAE0DF26E47DC954FEEB8234815222256D1EDC45E8719969332343561A2E312`:
237 logic tests, zero Svelte diagnostics, budgets passing, **24/24** community
workflows pass (`.tmp/rankings-metric-colors-build.log`,
`.tmp/rankings-metric-colors-production.log`). The numeric workflow checks both
themes and every all-time sort at 1536, 768 and 390px, plus the separate Gains
summary color and active state. This is focused evidence, not complete route
approval; the last full suite remains tied to its older artifact below.

### Previous pass — Rankings row typography and composition

Replaced the shared row's tiny monospace/grid cells with Angular's proportional
15px desktop / 14px mobile names, 15px desktop / 11px mobile values, flex row
spacing, right-aligned metrics and first/third-place treatments. Removed the
extra Viewer-ID line and unsupported trainer-to-Activity link from Rankings.
Club links remain available on desktop and hide on mobile as in Angular.

Artifact `BA4D4AF0010CD86F9FBA60B01946702B6839AF50EFC681192D5E13C1AABCEBC9`:
237 logic tests, zero Svelte diagnostics, budgets passing and **24/24** community
workflows pass (`.tmp/rankings-row-layout-build.log`,
`.tmp/rankings-row-layout-production.log`). Tests assert source font sizes,
mobile club visibility and desktop keyboard club navigation. Inspected the
updated 320px capture with no page overflow (`.tmp/rankings-fixed-320.png`).
Selected-column versus positive-gain colors and remaining page-body differences
still require review; this does not approve the route.

### Previous pass — Rankings mobile metric visibility

Restored Angular's 768px visibility rules: monthly hides Avg/Day and Active;
all-time retains Total Fans, Avg/Month and the selected metric; Gains hides its
extra selected-period summary except on 30-day sort. The shared row uses optional
mobileHidden metadata and sizes its mobile grid to visible metrics, retaining
every desktop value and unchanged defaults for other callers.

Artifact `758594ACB51F7A075BBDCC43152535BE891272DC1F0BC4C65062B5812C6496EB`:
237 logic tests, zero Svelte diagnostics, budgets passing, **24/24** community
workflows pass (`.tmp/rankings-mobile-metrics-build.log`,
`.tmp/rankings-mobile-metrics-production.log`). The numeric workflow checks all
sort modes at 1536, 768 and 390px in all three browser projects. A rendered 320px
capture also confirms only Fans/Monthly Gain and no page overflow
(`.tmp/rankings-fixed-320.png`). Row typography, composition and mobile club
visibility still differ; this is not route approval.

### Previous pass — Rankings club navigation

Restored Angular's club-details links in Rankings using an optional groupHref on
the existing LeaderboardRow. The page supplies `/circles/:id` only for a real club
ID and uses Angular's `Club` fallback for a missing name. UI Lab text-only groups
remain unchanged. The community workflow now activates the club link by keyboard
and verifies the route and populated club heading on every browser profile.

Artifact `D05D98918CA9E8AEB52C23965DD4AD8A8246228E9A8EF6BC8465613261139A2F`:
237 logic tests, zero Svelte diagnostics, budgets passing, **24/24** community
workflows passing (`.tmp/rankings-club-link-build.log`,
`.tmp/rankings-club-link-production.log`). The full run below belongs to the
previous artifact; this change does not establish complete route parity.

### Previous pass — full production-route regression run

The unchanged production artifact
`D2C0756461D9A90C5FAD0C31AC40ABD6269B330723D3B843485059B961BB6586`
completed all production-route specs (UI Lab excluded): **691 passed, 2 skipped,
0 failed in 18.1 minutes**, across desktop Chromium, mobile Chromium and mobile
WebKit. Evidence: `.tmp/full-route-current-production.log`; runner exited 0.
The only skips are the desktop modified/middle-click navigation test on the two
mobile profiles, explicitly excluded by `navigation-parity.spec.ts:25`.

This proves the covered workflows regress cleanly, not that every Angular
control/layout is ported. The concrete Rankings gaps below remain, along with
the route ledger's pending visual/behavioral audits. No route was promoted to
approved and productionReplacementReady remains false.

### Previous pass — Rankings desktop number formatting

Rankings now renders Angular's full localized numbers on desktop and compact
values at its 768px mobile breakpoint. Daily/weekly averages retain whole-number
formatting on both. Existing UI Lab rows without a mobile value remain unchanged.
The numeric workflow exercises both widths in every browser project, including
missing values, zero, gain prefixes and all three period summaries.

Artifact `D2C0756461D9A90C5FAD0C31AC40ABD6269B330723D3B843485059B961BB6586`:
237 logic tests, zero Svelte diagnostics, build budgets passing and **24/24**
community workflows passing (`.tmp/rankings-full-values-build.log`,
`.tmp/rankings-full-values-production.log`). Mobile metric visibility and row
composition still require source-parity work; this is not route approval.

Follow-up source audit performed during the full production suite:

- Angular Rankings renders club names as `/circles/:id` links. This missing
  navigation is now restored and verified in the latest pass above.
- Angular hides monthly Avg/Day and Active on mobile. All-time keeps Total Fans,
  Avg/Month and the selected metric; now restored in the latest pass above.
- Angular hides the selected Gains summary on mobile unless its `active-col`
  condition is met (30-day sort). This is now restored and covered above.
- Rankings row typography/spacing and podium treatments still differ; compare the
  effective Angular global cascade before changing source-local colors.

These gaps are not covered by the existing passing numeric checks. Add explicit
club navigation and per-tab mobile visibility checks when migrating them.

### Previous pass — nested picker geometry and mobile Veteran labels

Character search results now size and center the modal itself, not just its
inner panel. Explicit shared Dialog height defaults prevent a nested picker
from inheriting its parent's fixed height or mobile height limit. The regression
first reproduced a 768px modal around a 213px result panel. Veteran mobile tabs
now keep Angular's text labels instead of hiding them behind icons; their
84/92/96dvh sizing is consolidated without duplicate overrides.

Tools already fills the available shell width and viewport height in the current
build, while its content stays in the normal frame. Its dark/light geometry,
picker typography, selection and nested focus-return checks remain in the
focused browser workflows. No new color palette or font substitutions were made.

Artifact `348FEB0FBC86EADAF5754C1C2A8530CAC13706C97E152A3D27FF90D13369EC73`:
237 logic tests, zero Svelte diagnostics, build budgets passing, and **69/69**
Home/Tools, picker-style and parent-picker workflows pass across desktop Chromium,
mobile Chromium and mobile WebKit (`.tmp/dialog-nesting-build.log`,
`.tmp/dialog-nesting-production.log`). Preview is available on port 4173.
This remains a focused correction, not full visual/behavioral parity approval.

### Previous pass — selected Gains summary

Restored Angular's leading selected-period Gain metric alongside the three
comparison metrics. The summary follows 3d/7d/30d sorting and retains gain
formatting/emphasis. Extended the existing format workflow to switch all periods
and verify the rendered summary label/value and four-column record.

Artifact `BD3648CE0DC13AF9BFD177B223E3E8586B07585E5DEDD4B85B292ADCE0A5F82A`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **24/24**
community workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/rankings-summary-build.log`, `.tmp/rankings-summary-production.log`).
Desktop full-number rendering and mobile metric visibility still need work;
this is not route approval or full migration completion.

### Previous pass — Rankings compact-number compatibility

Replaced Rankings' generic Intl compact formatter with Angular's explicit
threshold/precision behavior: two decimals for billions, one for millions and
10K+, localized smaller values, and `-` for missing data. Restored gain prefixes
while retaining negative signs. An existing route workflow now checks all three
tabs with positive/negative/zero/missing values through the repository and UI.

Artifact `50CF799908298192B4CBA06A8E50D8920DAF42A99B7899D86F5D338D830D1DD4`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **24/24**
community workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/rankings-format-build.log`, `.tmp/rankings-format-production.log`).
Desktop full-number rendering, mobile metric visibility, and the Gains summary
column remain missing; compact formatting alone does not establish route parity.

### Previous pass — Rankings control layout

Restored the standard page-heading tone, stacked full-width period filters at
Angular's mobile breakpoint, and retained the paginator's page-size label above
its range/navigation row. Mobile previous/next targets are 44px. Added checks at
320/390/768px plus month selection, page-size changes and forward/back paging.
Inspected the rebuilt 320px screenshot (`.tmp/rankings-fixed-320.png`).

Artifact `AC66AE94F1252097E4EB2C17F5E27D653216CA5F0FD55C87671B12A7B8147581`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **21/21**
community workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/rankings-controls-build.log`, `.tmp/rankings-controls-verified.log`).
The first run was stopped after confirming port 4175 refused connections;
restarted the production preview from the same artifact before verification.
Rankings row density, mobile metric visibility and number formatting still need
Angular parity work; this is not full-route approval.

### Previous pass — missing Rankings weekly metric

Reviewed the populated Rankings mobile light screenshots against Angular.
Tracing the All-Time source revealed that Svelte exposed weekly sorting but
omitted the `Avg/week` metric entirely. Restored that metric and its selected
emphasis; shared leaderboard rows now use their actual metric count rather than
assuming four columns. Existing community workflow now verifies weekly value,
rank, selected emphasis, five columns and URL state.

Artifact `446EE99425BD249CE6941E085B4204D3688C89420B99192881B817CE4750AE5F`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **18/18**
community workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/rankings-week-build.log`, `.tmp/rankings-week-production.log`).
Observed Rankings visual differences remain: heading tone, mobile period-filter
stacking, row density/mobile metric visibility, number formatting, and paginator
composition. The route is not visually approved.

### Previous pass — Activity filter/paginator geometry

Fixed a desktop first-child width rule overriding the mobile full-width sort
select. Restored filter prefix icons and the source search label. Activity now
uses the shared paginator's arrows-only mode (numbered pages remain the default
for Database) and the Angular-style enclosing surface with right-aligned mobile
page-size/range rows. Retained all query handling, page-size choices and 44px
targets. Re-captured and inspected the mobile light Activity page.

Artifact `8E0F716D613DA4CC8C4C02F1E68BB91757C8FA69971F1AFB974F45FBD90D1A01`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **63/63**
Activity/Database workflows pass across desktop Chromium, mobile Chromium and
mobile WebKit (`.tmp/activity-controls-build.log`,
`.tmp/activity-controls-production.log`). New checks cover equal mobile widths,
icons and disabled single-page arrows. Remaining Activity evidence typography,
report visual composition and Rankings review are not approved.

### Previous pass — Activity score-band semantics

Replaced Svelte's three generic Activity tones with Angular's five bands, reusing
the existing score-band thresholds. List and detail callers now receive matching
critical/high/elevated/watch/low theme colors. Restored Angular's verdict labels
(`Rate anomaly` and fallback `Activity pattern`) and neutral score captions.
Extended existing logic checks for every boundary and verdict, plus browser
assertions for high/low score colors in both themes without recoloring metrics.

Artifact `A0C1B2881FF75180BE31B2DE19AF88D7D5209A057F89FE34FA30C5426A3528D3`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **12/12**
Activity workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/activity-bands-build.log`, `.tmp/activity-bands-production.log`).
Filter/pagination composition, evidence styling and full detail visual parity
remain unfinished; this does not approve the route or complete the migration.

### Previous pass — Activity row composition

Captured populated Activity/Rankings in both themes at 390px/1536px with current
Angular and production Svelte (`.tmp/compare-activity-rankings.mjs`). Inspected
the Activity mobile light pair and rebuilt Svelte capture. Restored neutral
metrics, value-before-label visual ordering, linked-name typography, mobile
rank omission, multiline evidence, right-facing report links and light card
surfaces. Removed the unapproved warning-tone Activity page heading.

Artifact `1FE8ABF7EBE1F5A8CF65D27BE5496B67F9F937896BE6B09049E676E5A1F74A41`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **12/12**
Activity workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/activity-layout-build.log`, `.tmp/activity-layout-production.log`).
Remaining observed differences include Activity score-band colors, verdict and
evidence typography, filter sizing and pagination composition. Rankings captures
exist but are not yet visually reviewed. Neither route is visually approved.

### Previous pass — Rankings request ordering

Tracing the community controls exposed overlapping Rankings loads without a
latest-request guard. A delayed monthly response replaced Gains results while
the Gains tab remained selected; the regression failed on the previous artifact
(`.tmp/rankings-race-before.log`). The route-local loader now guards result,
error and loading assignments with the existing request-counter pattern, covering
all callers (tabs, filters, search, pagination and history). Backend contracts,
cache keys and page composition are unchanged.

Artifact `58927CE1FC8DF3BCB3C5D3F5C8A3BB6FC5BC0B77591CF4676FDC31638F24A14F`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **18/18**
community workflows pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/rankings-race-build.log`, `.tmp/rankings-race-production.log`).
The planned Activity/Rankings visual surface comparison remains unfinished;
this pass fixed the reproduced interaction regression first.

### Previous pass — Club leaderboard light surfaces

Re-ran the populated Angular/Svelte Club comparison at 390px and 1536px in both
themes (`.tmp/compare-clubs-state.mjs`). Filter typography and active colors
match; mobile controls intentionally retain 44px targets. Visual inspection
found podium gradients remaining in Svelte light mode, unlike Angular's global
card-surface override (`src/styles.scss`). Restored the standard light surface,
border, shadow and hover styling for all Club cards without changing dark-mode
podium tints. Inspected the rebuilt mobile light capture.

Artifact `37C2C8931E659DF595521FBC6A8E72A213C53E7D3749598A71BDC94C8820C906`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **27/27**
Clubs-state/community workflows pass across desktop Chromium, mobile Chromium
and mobile WebKit. Includes a new all-three-podium theme-switch assertion
(`.tmp/clubs-surface-build.log`, `.tmp/clubs-surface-production.log`). Whole-route
visual approval remains incomplete; Angular icon-font rendering is still absent
in the local reference and is not treated as desired output.

### Previous pass — rendered landing-page comparison

Captured current Angular and production Svelte Home/Tools at 390px and 1536px
with shared statistics and dark theme (`.tmp/compare-landing-current.mjs`,
`.tmp/landing-current.json`, `.tmp/landing-current-*.png`). Inspected Home mobile
and Tools mobile/desktop captures. Angular's local Material icon font did not
load, so text-shaped icon artifacts are not accepted as the visual target.
Navigation and intentional page-width differences remain outside body parity.

Source comparison found shared feature badges missing Angular's 0.5px tracking,
no-wrap and inherited 1.5 line height. Restored these in `FeatureLink` for both
pages, added geometry-style assertions to the existing Home/Tools workflow,
and inspected the rebuilt mobile Tools capture.

Artifact `C29903E7B7AAA119C8B7DE353C1097835E711C5C1592FEA37CE40AA5950DE566`:
237 logic tests, zero Svelte errors/warnings, build budgets passing, **24/24**
Home/Tools and picker-style workflows pass across desktop Chromium, mobile
Chromium and mobile WebKit (`.tmp/landing-badge-build.log`,
`.tmp/landing-badge-production.log`). This does not approve full visual parity.

### Previous pass — shared selector production verification

Reviewed the current Angular character dialog's search, selection, existing-ID
highlighting and sort flow against the shared Svelte picker and its Database,
manual-parent and Lineage callers. Ran the existing picker-style, parent-picker,
support-picker and lineage-planner-parity suites against production artifact
`8BD9D529E25331865171769D3C5CC1D8EBED4CE9B0CEDE61AC46CDE065108129`.
**96/96 passed** across desktop Chromium, mobile Chromium and mobile WebKit
(`.tmp/selector-current-production.log`, 5.3 minutes).

Coverage includes nested dialog focus, both-theme typography/colors, Tools
background geometry, manual entry persistence, linked-account and partner
Veterans, support resource failure/cache recovery, and Lineage slot exclusions
and affinity. No source change was needed for this run. This is focused workflow
evidence, not approval of all page layouts or completion of the migration.

### Previous pass — Settings removal failures and retries

Account unlink, login disconnect/connect and API-key revocation now clear their
previous action error when retrying. The regression reproduced a successful
unlink leaving its old error banner visible (`.tmp/settings-removal-before.log`).
The expanded workflow checks failed actions preserve rows, successful retries
refresh authoritative server data, the last login stays protected, key revocation
and a mocked provider redirect. No real accounts or keys were changed.

Artifact `8BD9D529E25331865171769D3C5CC1D8EBED4CE9B0CEDE61AC46CDE065108129`:
237 logic tests, 0 Svelte errors/warnings, shell budgets passing, and **21/21**
Settings workflows passing across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/settings-actions-build.log`, `.tmp/settings-actions-production.log`).
This focused verification does not approve whole-frontend visual parity.

### Previous pass — independent Settings loading and mobile form sizing

Settings now follows Angular's independent account, identity and API-key loading
regions; image resources no longer gate the entire page. Forms remain available
while lists load. Each failed list uses the existing Banner and retry control
inside its own card rather than hiding unrelated controls. Mutation refreshes
reuse the three local loaders; request counters prevent older reads from
overwriting newer results, including newly created API keys. No API/storage
contracts or page section ordering changed.

A delayed-list regression failed on the previous build because already loaded
accounts were hidden (`.tmp/settings-loading-before.log`). The new workflow
also checks provider retry, one-time-key preservation, stale responses and draft
retention. Its initial failure fixture was corrected to remain unavailable
through automatic HTTP retries. Mobile screenshot review additionally exposed
column-flex inputs shrinking below their specified height; they now retain
44px touch height and have a geometry assertion.

Final artifact `9460C02C0F964CCE0B9FABE30C9A06587E149B383A0B94268F952739D115AB0D`:
237 logic tests, 0 Svelte errors/warnings, shell budgets passing, and **18/18**
Settings workflows passing across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/settings-final-build.log`, `.tmp/settings-final-production.log`).
The final Safari partial-load screenshot was inspected. This is not a full-route
rerun or visual approval of the complete migration.

### Previous pass — full production-route regression and failure triage

Follow-up build `355B39AF3138A4493D9063DC4085046700AF66A15DF24038B26BA032586C63C7`
passes 237 logic tests, Svelte diagnostics and shell budgets. It includes the
Settings fix and `InspectPopover` Escape using native `:popover-open` rather
than delayed reactive toggle state. Instrumented reproduction showed a hidden
neighbor retaining its old reactive open flag and consuming Escape while the
actual visible panel remained open. The new synchronous native-toggle regression
fails on the old build (`.tmp/popover-before.log`). The chart test now waits for
its actual axis label before reading coordinates, retaining tooltip assertions.
Affected Settings, club progression, planner goals and lineage odds workflows
passed **39/39** across desktop Chromium, mobile Chromium and mobile WebKit
against the follow-up build (`.tmp/regression-fixes-production.log`, 1.9 minutes).
This includes both previously failing club workflows and both new regressions.
The full-run results below apply only to the old build, not to this follow-up
artifact. Full route visual/behavioral approval remains outstanding.

The frozen artifact below completed all 666 production-route workflows
(UI Lab excluded by filename), one worker across desktop Chromium, mobile
Chromium and mobile WebKit: **662 passed, 2 failed, 2 skipped in 34.1 minutes**.
The skips are the desktop modified/middle-click test on the two mobile projects.
Log: `.tmp/full-route-production.log`; artifacts: `.tmp/full-route-production`.
The second failure was mobile WebKit chart pointer/touch testing reading a null
axis-label bounding box (`club-progression.spec.ts:95`); investigate chart
readiness before the coordinate read, retaining the tooltip assertions.
The first confirmed failure is desktop club contributor popover Escape
dismissal (`club-progression.spec.ts:70`), with the popup still visible.
Investigate `InspectPopover` hover re-entry and asynchronous toggle state;
the same control serves planner target options and lineage inspection.

`tests/e2e/settings-concurrency.spec.ts` now stages verification and API-key
creation concurrently and asserts that completing the latter cannot re-enable
verification. It was added after this run's explicit file list was selected;
it is not included in the 666-workflow result. A subsequent desktop run against
the same old build reproduced the pending Verify button becoming enabled as
soon as API-key creation begins (`.tmp/settings-overlap-before.log`, line 36
in the spec). This is a confirmed regression, not only a source-review concern.

Source review also identified a Settings concurrency gap: `SettingsPage`
uses one `busy` string for unrelated link/verify/key operations, unlike
Angular's separate `linking`, `verifying` and `creatingKey` state. An overlapping
operation can clear another operation's disabled/loading state. Source now uses
an action-keyed local reactive record and guards duplicate action submission;
unrelated actions retain their independent pending flags. The complete change,
including duplicate-submit guards, passed Svelte diagnostics (0 errors/warnings;
`.tmp/settings-concurrency-final-check.log`). The Settings source fix is
now built and browser-verified in the follow-up artifact reported above. The
popover failure is also fixed there. The preserved full-run failure artifacts
and old-build regression reproductions remain evidence of the original defects.

### Previous pass — container-aware mobile manual editing

Manual node headers keep their actions on the identity row when the actual
content width is at least 300px. Narrower nodes retain wrapping. The shared
manual/Lineage spark editor uses a single search/stars/close row when its
container is at least 320px, instead of forcing every touch viewport into two
rows. Desktop styles and 44px touch targets remain unchanged; no dependencies
or separate editor implementation were added.

`npm run build` passed (237 tests, 68 files, Svelte 0 errors/warnings and shell
budgets). Production artifact SHA256:
`0728FA0190082D906B9D8A79D996889B293084B71002F14B7F28D3F0C4D25225`.
Focused production workflows passed **18/18** across Chromium, mobile Chromium
and mobile WebKit, covering manual CRUD/persistence, shared Lineage spark
editing, Angular factor colors and Tools background geometry. The manual
workflow now checks 320/390/768px container-driven alignment and touch targets.
Logs: `.tmp/manual-density-build.log`, `.tmp/manual-density-production.log`.
Mobile screenshots at 390 and 768px were inspected. This is a targeted density
fix, not approval of all dialog layouts or full frontend parity.

### Previous pass — live factor catalog and picker resource states

Angular's `MasterDataService`/`FactorService` seed bundled factors, then use
`ResourceDataService` to publish persisted and live data. Svelte now follows that
flow through the existing `resourceRepository`, keeping the original
`umamoe_resource_meta_v1:factors` and `umamoe-resource-data-*` caches. Validation
runs before persistence, accepts Angular's wrapped/default arrays and unknown
type `-1`, and retains usable data when refresh fails. Unpublished factors in
an explicit manifest keep the fallback without a failing request. Network
failures retry at Angular's 1/3/7/15/30-second intervals while consumers exist.

The catalog is reactive rather than a frozen module-level map. Database factor
controls, white-category browsing, active labels, Veteran filters, manual parent
editing, profile filters and Lineage spark editing now see updated metadata.
UQL names, completion and compilation refresh together (including validation
without a page-supplied compiler); an existing UQL query
is resubmitted when its previously missing factor becomes available. Drafts,
star levels, selected IDs and storage payloads remain intact. Race artwork is
indexed by normalized race name so newly published race factors reuse it.

Shared `ResourceStatus` is presentation-only and uses the source's small
pending/cache/error rows; its dark code surface has an explicit fallback and
readable foreground in both themes. Feature lifetimes own catalog loading. No page shell,
navigation, routes, normal/wide widths or existing picker layout was redesigned.

Build `.tmp/factor-catalog-final-build.log`: **237 logic checks in 68 files**, zero
Svelte errors/warnings, 43.2 KiB JS / 10.5 KiB CSS compressed shell budgets.
Final `dist/index.html` SHA256:
`4B58A62C25E05383C96034E416B7BEB807CB7568F5510B8F1087464466006F72`.
The final focused production regression passes **72 workflows in 4.7 minutes**,
24 each on desktop Chromium, mobile Chromium and mobile WebKit, with zero
failures/skips/retries (`.tmp/factor-catalog-final-production.log`). The final
artifact hash is unchanged after testing. Final error-row screenshots were
visually inspected in desktop dark and mobile light themes; pending/cache rows
were also inspected. Page-overflow and runtime-error guards passed.

The broader affected-feature run recorded **211 passes and two WebKit failures**
in 12.2 minutes (`.tmp/factor-verified-regression-production.log`, artifact
`10E2DC212496172A257BEE324C624F07A47843D530BC9834CC7BD4E365C7AEE2`). Traces
showed cancelled fetches reported as access-control errors during test-triggered
reloads. The unlinked-account test now sets its account fixture before navigation
instead of first loading an unrelated linked-account page. The popup persistence
test finishes its factor response before reloading. Neither change suppresses
runtime errors. Both scenarios are included in the final three-browser rerun,
together with all parent-picker workflows, shared theme/Tools checks and the new
catalog loading/cache/error/recovery workflows. No whole-suite pass is claimed.

The earlier nine new workflows passed on desktop Chromium, mobile Chromium
and mobile WebKit in `.tmp/factor-live-final-production.log` against artifact
`54D19F96CCA78CA68041A18DFF518E79E7DBA1124F494AAB0C322F6C110AA938`, before
the unpublished-manifest correction. Pending and cached-refresh screenshots
were inspected at desktop/mobile widths. Cache persistence uses a real profile,
as in the existing support-card workflow: WebKit's ephemeral test contexts
discard CacheStorage across document navigation. Initial runs exposed two
test setup mistakes (Save Entry label and collapsed mobile Spark Filters) and
that ephemeral-cache issue; none are hidden with skipped tests or forced clicks.

The browser regression is fixture-backed. Separate read-only local checks found
search, resources, backend, embeds and Redis containers healthy; the development
proxy returned HTTP 200 for the real resource manifest, all 448 published factors
(no invalid records), and a one-record search (`total: "over 10000"`). These are
not authentication/browser-proof-provider acceptance. The older 640-workflow
whole-suite result does not apply to this
artifact. Full migration and production cutover remain unapproved; manual
mobile editor density and wider route/dialog visual acceptance still need work.

### Previous pass — connected manual tree and shared spark editing

The manual Veteran form now follows Angular's vertical parent/grandparent tree,
with connected indented branches, compact removable sparks, section dividers,
optional label/clear control and source-style save/cancel actions. Desktop filled
node heights match the running Angular reference; widths differ by at most 2px
because of the shared dialog border. Light-theme role
labels and affinity chips use the source colors; mobile keeps 44px actions rather
than reproducing Angular's smaller targets.

`SparkAddControl` consolidates the existing Lineage interaction and the manual
form using shared buttons, combobox and star segments. New sparks default to
three stars, allow duplicates, retain the selected add-level while mounted and
close/clear search after adding. Escape/close returns focus without closing the
Veteran dialog. The combobox's optional native-popover anchor keeps results out
of scrolling/clipping containers, spans the whole editor, flips above when
necessary and does not cover the mobile star controls. Other combobox callers
retain their existing popup behavior. Read-only SparkItem displays are unchanged;
manual chips use its optional removal action.

Character replacement preserves a node's sparks and race wins; removal clears
only that node. Affinity labels reuse the existing engine, including source
target-free pair totals. Editing a saved manual entry now retains its list
position instead of prepending it. The original `vpd_manual_entries` fields,
creation time, save-failure handling and all three nodes remain compatible.

Source comparison: `.tmp/compare-manual-tree.mjs` captures empty, populated and
searching forms at 390/1536px in both themes, asserts selected font/color samples,
vertical tree order, absence of page overflow/errors and nonoverlapping search
overlays. Early captures exposed the mobile overlay covering star controls and
a light-theme role-label color mismatch; both were corrected. The expanded
browser workflow also caught an ambiguous two-outfit test locator, now scoped
to the actual requested outfit.

The final source/production comparison passes all 24 captures and sampled
font-family, size, weight and color assertions for names, role labels, entry
labels, Add Spark, spark chips, search input and search-result labels/types.
Phone labels retain Angular's 11.52px size, and search text uses its full-opacity
theme color. No page overflow, overlapping editor/results or runtime errors were
captured. Dark desktop populated forms and light phone search states were
visually inspected against Angular. The reference's missing Material icon font
remains a capture caveat; Svelte uses the shared SVG icons. Touch targets enlarge
the phone editor, so these captures are not a blanket dense-mobile approval.

Build `.tmp/manual-tree-final-build.log`: **234 logic checks in 67 files**, zero
Svelte errors/warnings, 43.2 KiB JS / 10.5 KiB CSS compressed shell budgets.
Final `dist/index.html` SHA256:
`C121225A474D7201AC8BB3E549131D1546CFE11C05F63DA34356D41C8DE62152`.

The broader run passed **120 workflows in 6.6 minutes**, 40 each on desktop
Chromium, mobile Chromium and mobile WebKit, no failures/skips/retries
(`.tmp/manual-tree-final-production.log`). This used artifact
`5603244C58B4223EA4C5901C44FDE3E78DE4C2FFAF5465F8077B638C574557ED`, before
the final phone label/search font and color adjustments. Final captures are in
`.tmp/manual-tree-final`. The focused final-artifact rerun passes **27 workflows
in 1.6 minutes**, nine per browser, no failures/skips/retries
(`.tmp/manual-tree-font-final-production.log`). This includes manual CRUD,
node swaps/removal, duplicate/star defaults, storage errors, keyboard/focus,
Lineage spark editing, picker typography/themes and Tools geometry from
320–2560px. The final artifact hash is unchanged after both captures and tests.
The older 640-workflow full-suite
result still belongs to its earlier artifact, not this one.

These changes do not establish whole-route approval. The subsequent live-catalog
pass above addresses bundled-only spark metadata; wider dialog/page acceptance
and dense-mobile review remain. Full migration and production cutover stay unapproved.

### Previous pass — Partner lookup and inline manual Best Fits

The Partner tab now restores the source's attached ID/Fetch control, practice
and trainer-ID guidance, anonymous sign-in notice, lookup/history headings and
queued/processing/error/timeout states. Input and Fetch use Angular's Arial
typography and equal heights; grouped Fetch no longer lifts out of its input on
hover. Touch controls remain 44px rather than copying Angular's smaller targets.
The picker toolbar's Add Spark Filter is compact on desktop and full-width on
mobile, using the existing shared button.

Partner responses retain `will_persist` through the thin repository. Persisted
results reload canonical backend history; nonpersistent results remain separate
from filtered history even when signed in. Missing inheritance is an error,
not an empty successful lookup. Pending/error states hide previous rows, and
clearing the ID cancels the current request and returns to history. Existing
API paths, request fields, stream parser and anonymous-migration storage stay
compatible. Non-digits are stripped from the actual input event rather than the
previous bound value. The tab badge counts saved history only. A persisted lookup
that completes during an older history request queues one fresh read afterwards,
matching Angular and preventing the old response from replacing the new result.

Manual Best Fits now opens inline beneath the empty slot, displays ranked total
and individual affinity, closes without cancelling the parent dialog, and returns
keyboard focus on dismissal/selection. Candidates come from the affinity resource,
retain stable ties and occupied IDs, and are truncated to twenty before resolving
the first outfit in the supplied catalog. The live picker supplies Angular's
released-resource catalog, separately from historical records used for display;
unreleased/missing outfits do not get backfilled from bundled history. Race
bonuses do not enter this ranking. The existing
affinity engine/planner calculation is reused, with an explicit compatibility
mapping: Angular assigns the second manual grandparent to `gp2Left` on the empty
P2 branch, while displaying its P1 triple contribution. This quirk is preserved
only here; normal lineage and Veteran-row calculations are unchanged.

The running Angular `openManualBestFit` was compared with Svelte using nine
asymmetric cases, 23 affinity IDs, missing outfits, unreleased first outfits,
occupied IDs and all three slots. All match. Reproduction and captures live in
`.tmp/compare-partner-manual.mjs` and `.tmp/partner-manual-compare` (32 states,
390/1536px, dark/light, no captured page errors or page overflow). A focused golden
test retains the ordering/truncation/slot compatibility contract. Browser workflows
cover backend persistence, direct-result filtering, null inheritance, timeout
recovery, attached-control geometry, inline candidate scores and focus restoration.

At the end of that pass, source-confirmed manual-editor gaps included a two-column
desktop form instead of Angular's vertical connected tree, and always-visible
per-factor star editors instead of compact chips with an Add Spark search/level
control. `LineagePlannerNode.svelte` already implements the latter interaction
with shared controls; reuse that behavior when consolidating the manual editor.
Angular's spark editor defaults new sparks to three stars, permits repeated
factors, retains the chosen add-level while mounted, and closes/clears search
after adding. The current manual path defaults to one star and hides duplicates;
those behavioral differences need to be removed along with the composition gap.
These gaps prevent complete Veteran-dialog approval. Full migration status and
production cutover remain unchanged.

Final build: **234 logic checks in 67 files**, zero Svelte errors/warnings, and
43.2 KiB JS / 10.5 KiB CSS compressed shell budgets
(`.tmp/partner-manual-final-build.log`). The frozen `dist/index.html` SHA256 is
`EB284E24D6185A93CC766C6CA29164618B9B4AAD2CFD1070DFE11C698DE2BF53`.
The final focused production run passes **108 workflows in 5.4 minutes**, 36
each on desktop Chromium, mobile Chromium and mobile WebKit, with no retries,
skips or failures (`.tmp/partner-manual-final-production.log`). It covers
`parent-picker`, `picker-style-parity`, `lineage-planner-parity` and
`database-controls`; the earlier 640-workflow full run belongs to the previous
artifact, not this one. The initial delayed-history check's exact text locator
included the spinner's accessible label; its role-based assertion now verifies
the actual loading state and passes on all three browsers.

Final Angular/production captures and reports are in `.tmp/partner-manual-final`.
All nine asymmetric calculation comparisons and sampled heading/input/button/
candidate typography comparisons pass in both themes at 390/1536px (the input
font's additional sans-serif fallback is equivalent). The 32 captures report no
page overflow or runtime errors. Dark desktop Partner/Best Fits and light mobile
Partner results were visually inspected against Angular after the final build.
The missing Angular Material icon font remains a reference-capture caveat; Svelte
uses the shared SVG icons. Mobile controls intentionally retain 44px targets.
The artifact hash is unchanged after tests and captures. These are fixture-backed
frontend checks, not real-backend or provider acceptance.

### Previous pass — nested selectors and theme boundaries

The manual Veteran editor used a separate character dialog, inherited the
Veteran surface/font, and lost Angular's target-plus-main-parent affinity sort.
The shared fixed-height dialog CSS also reached nested panels, stretching the
character picker to the enclosing Veteran dialog's height. The height, sheet
and footer selectors now address only each dialog's own panel.

`CharacterSelectDialog` reuses the existing dialog, character grid, sort menu
and button across Database target/include/exclude, Lineage and manual entries.
It owns the Angular character-dialog presentation; callers retain their existing
selection, confirmation and route-local state. Manual choices now use the
existing affinity engine to score the source's distinct target/main-parent IDs.
Nested cancellation keeps the manual draft and returns focus to its trigger.

Missing `color-pink-rgb` and `accent-success-rgb` variables are restored from
Angular, fixing invalid light-theme factor surfaces in populated parent rows.
Home/Tools feature icons use the source pink/purple vocabulary, and Tools'
Lineage link uses success green in light mode. No routes or page section order
changed. Tools already paints its hero and statistics outside the normal frame;
the regression now checks both hero edges against the available shell width,
as well as the 1080px content limit and absence of page overflow.

The local comparison `.tmp/compare-picker-surfaces.mjs` captures both running
implementations at 390/1536px in dark/light. Before/after artifacts are in
`.tmp/picker-surfaces-{before,after}`. The inspected nested character captures
now agree on the 15px heading, Roboto card text and Arial search input; the
unwanted filled-height panel is gone. Angular's unavailable icon font remains
a reference-capture caveat, not a requirement for the Svelte SVG icons.
This scoped work does not approve the complete migration or every dialog.

The initial focused run passed 107/108 workflows. Its WebKit failure was an
artificial full-document navigation leaving Database before the restored search
completed. The trace records `/tools/lineage-planner` navigation at 326691ms and
the same-origin search rejection at 326727ms. The workflow now awaits that exact
restored response before leaving; all ten unchanged-behavior WebKit repeats pass
(`.tmp/picker-navigation-repeat`). The global uncaught-error assertion remains.

The final production build passes **233 logic checks in 67 files**, zero Svelte
errors/warnings, and the 43.2 KiB JS / 10.5 KiB CSS compressed shell budgets
(`.tmp/picker-consolidation-build.log`). Its frozen `dist/index.html` SHA256 is
`54258181B2F114E89FDC89533F58DD25CD209926BC9AFAEFB8192B702223F890`.
The complete non-UI-Lab production suite passes **640 workflows, two desktop-only
gesture skips on mobile, and zero failures** in 29.8 minutes, one worker and no
retries (`.tmp/picker-consolidation-production.log`). Desktop Chromium passes
214/214; mobile Chromium and mobile WebKit each pass 213 with one skip. The
artifact hash is unchanged after the run, and `.last-run.json` has no failed tests.
These are populated-fixture frontend checks, not real-backend/provider acceptance.

Final Angular/production captures are in `.tmp/picker-surfaces-final` (16 states,
390/1536px, both themes, no page overflow or captured runtime errors). The nested
character title and card names match source family, size, weight, letter spacing,
line height and color in all four comparisons. Search text retains Arial at
14px/400; the Svelte declaration also supplies a sans-serif fallback. Tools keeps
its source gradients and full-width statistics strip outside the normal frame.
The dark desktop selector and light mobile selector, plus light desktop/dark
mobile Tools, were visually inspected after the final build. No production code
changed after the full browser run.

At the end of that pass, source inspection found two Veteran-picker gaps:
the Partner tab omits Angular's lookup-card guidance and history/result headings;
manual Best Fits uses a separate modal instead of Angular's inline slot panel.
Its candidate calculation also needs comparison against
`AffinityService.rankCandidatesForSlot`, which ranks all affinity-resource IDs
before resolving the first 20 into character records. The current Svelte path
filters released/unoccupied choices first and includes parent race affinity.
Those gaps are addressed by the current pass above, not by the earlier full-suite
result. Do not count the old cancellation/storage test as calculation parity.

### Previous pass — Club chart/calendar calculations and interactions

The chart and calendar now use separate pure calculations instead of one
abbreviated member-series mapper. They share the existing period selection,
latest-snapshot and legacy-tally helpers. Chart colors follow backend member order,
independent of member-list sorting; only active members enter the chart. Calendar
days retain former members, ignore negative prior-club snapshots and do not carry
contributions into missing days. The chart retains its different cumulative/delta
gap handling, trailing tooltip values, dashed prior segments and tally precedence.

`node scripts/verify-club-progression.mjs` compares those outputs with the actual
running Angular component, not a second handwritten reference implementation.
All **96 cases match**, including source segment-callback metadata and every
calendar cell. Eight populated/empty/sparse/tally/period fixtures cover both modes,
prior toggles and name/ID searches. The compact, source-hashed reference is
`tests/e2e/fixtures/club-progression-reference.json`; the verifier writes only
temporary outputs, never silently replacing the committed golden. Two focused
logic checks retain those comparisons and signed compact formatting. One renderer
check covers dashed/solid runs, trailing carries and literal, non-HTML trainer names.

`ClubMemberProgression` owns the chart/calendar presentation. Mode and view remain
page-local across month changes. Native legend buttons restore hide/isolate/restore
and hover highlighting, with Shift+Enter as an accessible isolation equivalent.
The calendar restores weekday/month-edge cells, daily totals, four preview
contributors and the full ranked contributor popover. It reuses `InspectPopover`
instead of introducing a different day dialog. Hover previews support click-to-pin,
keyboard/Escape, outside dismissal and focus restoration. Existing popover callers
keep their default click-only behavior. The shared chart surface has an opt-in
two-second touch-tooltip dismissal used by both Club charts; other charts retain
their existing behavior.

Mobile uses proportional calendar density and a 366px contained minimum only where
44px targets require it, replacing the forced 640px calendar. Popovers stay unscaled
and viewport-clamped. Data rows stay compact; page-level scrolling is not introduced.
The first development browser run caught seven failures in preview clicks, narrow
targets and sticky mobile tooltips (`.tmp/club-progression-dev.log`). Fixes at the
shared components and calendar geometry pass all **45 focused workflows** across
desktop Chromium, mobile Chromium and mobile WebKit
(`.tmp/club-progression-dev-fixed.log`). A further populated workflow covers a full
30-member legend, scrolling through all contributors and both theme surfaces.

The production build passes **233 logic checks in 67 files**, zero Svelte
errors/warnings and 43.1 KiB JS / 10.5 KiB CSS compressed shell budgets
(`.tmp/club-progression-build.log`). Frozen `dist/index.html` SHA256:
`42A43B5A5F4809739F94CFF2429BA9E6CE27AB2D364889374880D32B5D5CA6E9`.
The full non-UI-Lab production run passes **634 workflows, two desktop-only
gesture skips on mobile and zero failures** across all three browser profiles
(`.tmp/club-progression-full-production.log`, 16.6 minutes). This covers every
existing production spec, including shared popover callers, Database controls,
selectors, Tools backgrounds/tours, authentication, Profile, Lineage, Statistics,
Tierlist and Timeline/Planner. The artifact stayed frozen throughout that run.

Final visual review caught one remaining typography mismatch: the calendar month
label had an unsupported mobile reduction to 11.2px. Removing that override restores
Angular's 13.6px label; the responsive workflow now asserts it at 390 and 320px.
The final rebuild again passes 233 logic checks, zero Svelte errors/warnings and
the shell budgets (`.tmp/club-progression-final-build.log`). Final artifact SHA256:
`8D9F031723F9345BCCF016C958BBAA1C37CE648DBE066CD54893912D8C15B700`.
All **48 affected community/chart/calendar/export/settings workflows pass** across
the three profiles (`.tmp/club-progression-final-tests.log`, 1.5 minutes). The
636-case full run belongs to the preceding artifact; only the month-label CSS
changed before this final, scoped verification.

All eight final Angular/Svelte captures at 390/1536px in dark/light have no uncaught
errors or page overflow (`.tmp/club-progression-final-comparison.log`, measured
styles in `.tmp/club-progression-comparison.json`). Heading fonts/sizes/colors,
day/gain colors and the 13.6px month label match. Desktop chart and calendar heights
match at 662.39px and 436.80px. Mobile intentionally adds 18px to the chart legend
and about 11.4px to the calendar for usable touch targets; popup content stays
readable instead of shrinking with the grid. Captures isolate these panels from
the approved frame-width change and the still-unapproved surrounding page layout.
Images are `.tmp/club-{progression,calendar,calendar-popover}-{angular,svelte}-{dark,light}-{390,1536}.png`.
The final artifact hash stayed unchanged through verification.

This does not approve the Club route. Source review still finds missing member
autocomplete suggestions (top ten name/ID matches), primary/prior contribution
presentation, card metric order, row-specific columns/short labels, inactive role
badges, copy feedback and header/member layout differences. ECharts interpolation
and tick spacing also require visual judgment; passing calculation goldens is not
pixel-level chart approval. These are deterministic fixtures, not proof that a
populated real backend or Docker is healthy. Production replacement stays disabled.

### Previous pass — Club calculations, complete exports and staged settings

The details repository now retains the original circle record instead of a lossy
summary copy. List summaries still use their existing adapter. JSON exports keep
all wire fields, prior-club contribution fields, member status and sparse dated
club history. CSV and Excel share the existing metric definitions, mandatory
Trainer ID, selected/visible columns and totals. Excel restores Angular's Summary
and Daily Data sheets, including frozen panes, widths, formats and prior/inactive
colors. Raw daily exports retain prior-club records regardless of the calculated
metric preference. Formula protection remains intact, and empty data does not
start a download; the legacy `exel` alias is accepted alongside `xls` and `excel`.

Shared member calculations now preserve signed corrections, role precedence,
inactive-member averages, first snapshots, current/completed-day distinctions,
prior contributions and embedded versus legacy month-end tally precedence.
Club history sums observed current-club gains rather than lifetime totals.
The active chart series is distinct from the calendar's historical member list.
This does not approve the remaining calendar/series calculations or presentation.

Five sets of actual Angular JSON/CSV/XLSX downloads are captured in
`.tmp/club-export-angular`; their source-hashed reference is
`tests/e2e/fixtures/club-exports-reference.json`. Cases cover current month,
excluded prior data, legacy tally, embedded leap-year tally and incomplete data.
Checks compare complete JSON and CSV plus every Excel cell, style, column width,
row height and worksheet view, excluding ZIP timestamps. The old frozen artifact
fails all five content comparisons (`.tmp/club-export-baseline.log`); all eighteen
development export workflows pass (`.tmp/club-export-dev.log`). Two additional
logic goldens compare shared calculations against these downloads and boundary
cases. These are deterministic fixtures, not claims of populated live backend data.

Member List Settings now uses the shared Dialog, SelectField, Checkbox and Button
with Angular's eight options/columns, staged edits, Apply and cancellation.
Existing preference keys and undisplayed config fields are preserved. Tests
exercise every option/checkbox, theme, four dismissal paths, keyboard focus,
reload persistence and resulting CSV columns. The fixture seeds preferences only
when absent; it no longer overwrites applied settings on reload. Keyboard focus
checks explicitly use keyboard activation, respecting Safari's native pointer
focus behavior. Its long all-controls workflow allows 60 seconds; action/assertion
timeouts are unchanged. All three development settings workflows pass
(`.tmp/club-settings-dev-final.log`), including mobile WebKit in 34.3 seconds.

Angular/Svelte dark/light captures at 390 and 1536px restore the dialog's theme
selector, section margins, text colors, fonts and line heights. Desktop heights
match at 495.59px dark / 497.59px light. Mobile intentionally adds 64px for 44px
close/select/checkbox/action targets; controls stay scrollable in the height limit.
The shared SVG icons remain instead of Angular's locally unavailable icon font.
This is scoped evidence, not an approval of other dialogs or the whole route.

The eleven-spec production run passes **178 workflows, two desktop-only gesture
skips and zero failures** across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/club-export-production.log`, 4.8 minutes). It includes Clubs/details,
all exports/settings, navigation, home, tours, parent/support selectors, Tools
background/theme geometry and 320px route containment. Its frozen
`dist/index.html` SHA256 is
`BEB2CB0C59EECEEC460390D3E316BF0CCC436D418754B462850FC0CC86452850`.

Subsequent source review found that the newly active-only chart series must not
also exclude former members from the historical calendar. The shared mapped
series now stays available to the calendar, with only the chart selecting active
members. The additional populated assertion fails against the previous artifact
because Left trainer's +60 contribution is missing
(`.tmp/club-calendar-scope-baseline.log`). Other calendar differences remain
explicitly pending: Angular independently ignores prior-club values, renders
month-edge dates and uses its own sparse forward-delta and mobile-zoom behavior.
Chart gap/tally metadata and legend hover/isolation restoration also need further
parity work; the current tests do not claim to cover those differences.

The final rebuild passes zero Svelte errors/warnings, **230 logic checks in 65
files**, and 43.1 KiB JS / 10.5 KiB CSS compressed shell budgets
(`.tmp/club-export-final-build.log`). Final frozen `dist/index.html` SHA256:
`3C3AEC0A2D9DCC3385CD3E8326FAB719A7E7E76A736426C797BC252ECF10EA77`.
Final artifact verification passes **51 community/export/settings workflows,
zero failures** across all three profiles (`.tmp/club-export-final-tests.log`,
1.8 minutes), including the former-member calendar regression. All eight final
Angular/Svelte dialog captures have zero uncaught errors and no page overflow
(`.tmp/club-settings-final-comparison.log`; measured styles in
`.tmp/club-settings-comparison.json`; images
`.tmp/club-settings-{angular,svelte}-{dark,light}-{390,1536}.png`). The final
artifact hash remained unchanged through tests and visual verification.
No production cutover or Angular removal is approved.

### Previous pass — Club Details information, cached navigation and refresh

The details repository retains `last_live_update` and both yesterday tier-gap
fields. The information card restores fresh Live Points, Data Updated, neighboring
tier artwork, zero/missing tier distinctions, signed gains/losses and linked
Discord comments. Existing club-domain helpers own the source's JST-midnight
freshness, selected-period timestamp precedence and elapsed-time formatting.
Three goldens cover those boundaries and Angular's independent 2000–2100 year /
1–12 month query bounds. Month buttons change local state and API requests without
rewriting the URL, as Angular does; the previous contrary workflow assertion was
corrected against `changeMonth()` in the source.

The countdown reads the shared cache's remaining expiry. Refreshes retain the
information and show Updating; errors retain the last good result and offer Retry
and Discord reporting. Failed automatic refreshes stop until retried. Historical
months do not auto-refresh, and initial/new-month failures do not display the
previous month's information. No second cache or timer store was added.

The first development run found a real shared-link bug: Button emitted
`target="_self"` even when callers requested no target, so sv-router skipped its
link handler and reloaded the entire app, discarding in-memory cache/state.
Button now leaves an omitted target absent. Explicit targets and native
modified/middle-click behavior remain available. The cached details → Clubs →
Back workflow fails before this fix and passes afterward on all three browser
profiles. All six new metadata/refresh workflows pass in development
(`.tmp/club-details-dev-recheck.log`); the earlier run's three failures are not
waived (`.tmp/club-details-dev.log`).

Populated Angular/Svelte captures cover 390, 1024 and 1536px in dark/light.
The source's 1050px stacked top-grid breakpoint, information-card padding, tier
layout, fonts and theme colors are restored. Sampled label/value/title/tier/
comment typography and colors match; 44px mobile link targets remain a deliberate
accessibility difference. A final alignment adjustment centers the comment's
plain text beside that larger inline touch target. New shell/ad column widths
remain excluded from page-body judgments. These comparisons do not approve the
entire details page or its charts, header and dialogs.

The ten-spec production regression run passes **154 workflows, two desktop-only
gesture skips, zero failures** across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/club-details-production.log`, 4.1 minutes). It includes all new
details cases, Clubs, existing community routes, navigation, static routes, tours,
character/Veteran/support selectors and 320px route containment. Frozen
`dist/index.html` SHA256 for that run:
`763CDF7108433E345DCE45FBB7914D1C426F1C4A204C6AF8BB21EF39438E26D3`.

The final rebuild adds only `vertical-align: middle` to the comment's inline
Discord link. It passes zero Svelte errors/warnings, 228 logic checks in 65 files,
and compressed base-shell budgets of 43.1 KiB JS / 10.5 KiB CSS
(`.tmp/club-details-final-build.log`). Its frozen `dist/index.html` SHA256 is
`C5153749052CDE901C06E5B22B3CF3DA3E658CB0CBAFE357F36C7E66A8809C01`.
Final artifact verification: **30 community workflows passed, zero failures**
across all three profiles (`.tmp/club-details-final-tests.log`, 49.5 seconds).
All twelve final Angular/Svelte dark/light captures have zero uncaught errors and
no page-level overflow (`.tmp/club-details-final-comparison.log`, styles in
`.tmp/club-details-comparison.json`, images
`.tmp/club-details-{angular,svelte}-{dark,light}-{390,1024,1536}.png`). The final
hash remained unchanged through captures and tests. The desktop comment line is
about 2px taller because of the shared inline-flex link; mobile intentionally
reserves its 44px touch target. Neither difference is an exact pixel approval.
The prior full 588-case run below belongs to an older artifact, not this one.
Neither the current focused evidence nor the historical route labels approve
the complete migration; the production replacement flag remains false.

The export follow-up identified in this pass is addressed by the complete-file
comparisons and shared calculation corrections documented above. Header, chart,
calendar and member layout parity still require further review.

### Previous pass — Clubs filters, cache freshness and refresh recovery

Clubs now routes every filter change through the existing page-reset/load path.
Local join-style, open-spots and playstyle filters therefore load first-page
records instead of leaving later-page rows beneath first-page pagination. The
public `name` alias remains a `name` API parameter until the user enters a new
search. Back/Forward restore the corresponding filters and records; a delayed
older request cannot overwrite a newer search or change its loading/error state.

The live countdown reads the existing request cache's actual remaining freshness
rather than resetting to five minutes on every cached visit. Manual/automatic
refreshes retain populated rows and show Updating; failures retain the last
successful rows with the shared error banner, Retry and Discord report link.
Initial failures no longer masquerade as an empty result. Failed automatic
refreshes stop until explicitly retried, preserving the shared HTTP GET retry.
No duplicate cache, repository or global route-state service was introduced.

Three distinct-page/delayed-response workflows fail against the preceding frozen
artifact (`.tmp/clubs-state-baseline.log`). All 24 focused community workflows
pass in development across desktop Chromium, mobile Chromium and mobile WebKit
(`.tmp/clubs-state-dev.log`). The shared cache has one additional freshness
golden, including expiry, cached reads and invalidation.

The production captures at 390/1536px in dark/light are
`.tmp/clubs-state-{angular,svelte}-{dark,light}-{390,1536}.png`, with sampled styles
in `.tmp/clubs-state-comparison.json`. The selected Open chip's font family,
13px size, 500 weight, foreground, background and border now match Angular in
both themes; desktop dimensions also match. Other join styles have their source
green/amber/red active backgrounds instead of a shared blue background. Search
and Playstyle restore their missing icons through optional props on the existing
UI controls. Mobile keeps the source's three join chips plus full-width Has Spots,
with Clear below them, while retaining 44px targets. The heading uses the brand
gradient. All eight captures have zero uncaught errors and no page overflow.
These checks are not a complete page-pixel approval: new shell geometry remains
separate, and Angular's local Material icon font is still unavailable.

Build: zero Svelte errors/warnings, 225 logic checks in 64 files, compressed shell
43.2 KiB JS / 10.5 KiB CSS (`.tmp/clubs-state-build.log`). Frozen `dist/index.html`
SHA256: `D46C316B7CB1FD8B4661D2B8A0A5585F5517462C1F9936757F87434E54C9D2AB`.

The first nine-spec production run recorded 147 passes, two desktop-only skips
and one WebKit failure (`.tmp/clubs-state-production.log`). The missing-outfit
Veteran workflow completed its assertions, but the trace recorded two fetch
access-control page errors during its artificial setup reload. Three unchanged
isolated reruns passed. The two profile-row fixtures now install their intended
profile before navigating/opening the picker, instead of replacing a live profile
and immediately reloading across Database's pending search debounce. Real
selection/persistence reloads and all uncaught-error assertions remain unchanged.
All 18 repetitions of those two workflows across the three browser profiles pass
(`.tmp/clubs-state-parent-fixture.log`). No runtime errors have been silenced or
network cancellation behavior changed to satisfy this fixture correction.

The subsequent 150-case run passed the Veteran regression, but caught wall-clock
drift in the new Clubs expiry test: navigating to details and back took the
correct countdown from 3:00 to 2:59. It recorded 147 passes, two desktop-only skips
and that one timing failure (`.tmp/clubs-state-production-final.log`). The clock
test now installs and pauses its clock before navigation, advancing expiry only
through explicit fast-forward calls; exact 3:00/5:00, request-count and no-retry-loop
assertions remain. All nine repetitions across three profiles pass
(`.tmp/clubs-state-clock.log`). These are test-harness corrections against the
same production artifact, not suppressed browser errors or relaxed assertions.
Do not report either earlier 150-case run as an entirely clean run.

Final focused production verification is clean: **24 passed, zero failures** in
42.5 seconds (`.tmp/clubs-state-verified.log`), including the corrected clock
workflow and all existing community workflows across the three profiles. The
artifact SHA256 remained unchanged through captures, broader runs and rechecks.
The earlier full 588-case run below belongs to the preceding artifact; it is not
a full-suite certificate for this build. Route approvals and the production
replacement flag remain unchanged.

A read-only live Clubs request through port 4175 returns HTTP 200 with zero
records/total. Populated Clubs evidence remains fixture-backed; this endpoint
check does not establish that the local backend has club data or that all Docker
containers are healthy.

### Previous pass — Inheritance summary and support-card presentation

The shared Database/Profile card now renders Angular's nonzero P1–P2 Race
summary between Affinity and G1 Wins, using the existing `crossRace` calculation
and source yellow value. No second affinity calculation was added. The support
card now uses Angular's 64px artwork, filled/outlined blue limit-break diamonds,
and unboxed mobile treatment. Missing limit-break data no longer implies LB0.
Affinity badges use the source's dark/light tokens; when there is no target,
they use the source amber breeding state instead of the target-affinity colors.

The new populated workflow fails against the previous frozen build on the
missing P1–P2 summary (`.tmp/inheritance-summary-baseline.log`). Nine focused
development checks pass across desktop Chromium, mobile Chromium and mobile
WebKit (`.tmp/inheritance-summary-dev.log`), covering nonzero/zero race overlap,
partial/unknown limit breaks, target/no-target theme colors, shared display
controls, and summary containment at 320/390/768/1536px.

The production artifact's Angular/Svelte dark/light comparisons are recorded in
`.tmp/inheritance-summary-{angular,svelte}-{dark,light}-{390,1536}.png` and
`.tmp/inheritance-summary-comparison.json`. Both implementations show 3 for the
same shared race fixture; sampled value/label fonts and colors match. All eight
captures have no uncaught page errors or page overflow. Angular still lacks its
Material icon font locally. Angular also applies 0.85 zoom to the Database body
below 430px; Svelte preserves 44px interactive targets and wraps the additional
summary into two rows on narrow cards. This remains a dense-mobile acceptance
difference, not evidence of one-to-one mobile pixel parity.

Build checks: 224 logic checks in 64 files, zero Svelte errors/warnings, shell
43.0 KiB JS / 10.5 KiB CSS (`.tmp/inheritance-summary-build.log`). Frozen
`dist/index.html` SHA256:
`20C2B51A04E7A02DD508C424FDA0992FB8B23CBDFF98521009EC97C4DB7FBE07`.
Full frozen production verification completed in 12.2 minutes: **586 passed,
two skipped, zero failures**, across 588 cases in 41 non-UI-Lab spec files and
three browser profiles (`.tmp/inheritance-summary-full.log`). The only skips
are the desktop-specific modified/middle-click workflow on the two mobile
projects. The artifact hash remained unchanged through the complete run.
UI Lab is disabled in production and its previously recorded development
failures are not waived. A read-only real-backend check through this preview
also returned HTTP 200, one requested inheritance record, and total “over
10000”; direct Docker health remains unverified. These checks do not establish
complete visual parity. Route statuses remain provisional and no production
switch has been made.

### Previous pass — Hide Sparks dialog and planner draft regressions

Hide Sparks now mounts the existing white-factor type browser directly, without
priority controls. Like Angular, its draft supports toggling browser results,
removing selected chips and Clear all; only Save changes result cards and the
original `db-hidden-spark-factors` key. Cancel, Escape, close and backdrop dismissal
discard the draft and restore focus. Search/category state resets on reopening.
The source headings, selected amber state, typography and dark/light dialog tokens
are retained, with 44px mobile targets and contained content at 320px.

The visual comparison also exposed generic skill icons being used for race and
scenario factors. The catalog now shares the existing demand-loaded race mapping
and scenario logos; it handles Angular's race aliases/fallbacks and updates the
factor browser, factor comboboxes, hidden chips and UQL suggestions together.
No second race dataset or per-component resource loader was introduced.

`.tmp/hidden-sparks-baseline.log` fails against the preceding frozen artifact on
the missing embedded type-browser search. `.tmp/hidden-sparks-planner-dev.log`
passes 48 dialog/planner cases across desktop Chromium, mobile Chromium and
mobile WebKit. These include all dismissal paths, storage normalization and
persistence, no search request for display-only hiding, and the existing priority
mode of the reused browser. The artwork mapping has one golden check, including
all currently catalogued race factors and the race aliases/scenario precedence.
Seven focused catalog/UQL checks pass in `.tmp/factor-artwork-logic.log`.

The full route run also exercised two distinct planner name-draft contracts:
ordinary delayed banner/resource enrichment must preserve typing, while a server
conflict must discard a draft based on the superseded collection. The draft is
now tied to its plan/saved name and clears on an explicit cloud reversion. Both
the delayed-resource regression and all account/share/persistence cases pass in
the 48-case development run above.

Angular/Svelte dark/light comparisons at 1536px and 390px are recorded in
`.tmp/hidden-sparks-verified-*.png` / `.tmp/hidden-sparks-verified.json`. Header,
result/chip fonts and selected colors match the sampled source styles; mobile
controls intentionally have larger targets. The Angular development reference
still has unavailable Material icon glyphs and a white dialog surface in its
dark-mode capture, so that capture is not a valid whole-image approval. Source
dark theme tokens, not the broken white surface, remain authoritative.

Final frozen build: 224 logic checks in 64 files, zero Svelte errors/warnings,
shell budgets 43.0 KiB JS / 10.5 KiB CSS (`.tmp/hidden-sparks-final-build.log`).
`dist/index.html` SHA256:
`DABB1551B2608499113374877AB3E0664C4C3E7911F6BFE775291F2A7771DC09`.
Full production verification (`.tmp/hidden-sparks-full-production.log`): 585
cases across 41 non-UI-Lab spec files and three browser profiles; **583 passed,
two skipped, zero failures** in 11.9 minutes. The two skips are the desktop-only
modified/middle-click workflow on the two mobile projects. The artifact hash remained unchanged
throughout the run. This covers the new artwork/staging/priority checks as well
as the full existing route, picker, persistence, account and failure workflows.
UI Lab remains outside the production run because it is disabled there; this
does not waive its previously recorded development-only failures. Passing the
current workflows does not establish complete visual or behavioral coverage.

Read-only real-data check: the production preview's inheritance search returned
HTTP 200, one requested record and a total of “over 10000”. Direct Docker health
inspection was denied by the sandbox; API availability does not establish every
container's health.

### Previous pass — Shared inheritance card and Profile actions

Profile no longer replaces the shared inheritance toolbar with a second set of
buttons or mounts a duplicate race-history dialog. Database and Profile use the
same action markup and dialog; Profile retains its Angular update label/icon,
confirmation and `from=profile` planner transfer, without a bookmark action.
Copy/share/update feedback uses the existing ToastRegion, including Discord
reporting on actionable failures. Profile now uses the existing snapshot-scoped
borrow-view queue and copy tracker, with optimistic counts, server reconciliation,
failure rollback and cooldown. The observer also handles record changes.

One domain normalizer now serves search responses and Profile. The Profile
adapter preserves Angular's distinct G1 saddle-group count (including aliases,
non-G1 exclusion, empty wins and the absent-array fallback). Missing white counts
are not replaced by star totals, missing ranks do not invent a G badge, and
missing support cards/timestamps do not create placeholder sections. Copy-count
overrides remain scoped to the loaded profile, not global account state.

The shared card now uses Angular's dark/light action and stats colors, font
sizes/weights, card surfaces and compact mobile typography. Factors start at the
top beside portraits instead of being vertically centered; mobile role labels
follow the affinity badge. White-section labels and star/occurrence toggles use
the source presentation. The earlier 1px mobile aptitude row-gap discrepancy is
also corrected. Existing 44px touch targets remain intentional.

Evidence: `.tmp/profile-inheritance-baseline.log` fails against the previous
production artifact on the missing canonical Races action. The corrected
development run passes 24 Profile cases across desktop Chromium, mobile Chromium
and mobile WebKit (`.tmp/profile-inheritance-verified-dev.log`); the preceding
combined Profile/Database-actions run passes all 30 cases. The additional sparse
record workflow covers absent fields versus known zeroes. Profile fixtures now
intercept borrow telemetry as well as profile/update endpoints.

Frozen production build: 223 logic checks in 63 files, zero Svelte errors or
warnings, shell budgets 43.0 KiB JS / 10.4 KiB CSS
(`.tmp/profile-inheritance-build.log`), SHA256
`B1F5E501DA86BA21A920E9F863AC9AA6940621C8C853FCE55479D62144BF97FB`.
The first full non-UI-Lab run (`.tmp/profile-inheritance-full-production.log`)
ran 573 cases: 566 passed, two skipped, five failed. Four exposed mobile affinity
badge alignment/summary-height regressions, corrected while adding an internal
320px summary-overflow assertion. The fifth exposed a name-draft race reproduced
with a controlled delayed gacha response, not dismissed as an intermittent failure.

The next build (`.tmp/profile-inheritance-verified-build.log`, 223 logic checks,
zero Svelte errors/warnings, 42.9 KiB JS / 10.4 KiB CSS) has SHA256
`C8320642C35F5E38DFC83A873CA832B2FF98468507C0C73517DD14CD0E635989`.
Its full run (`.tmp/profile-inheritance-final-production.log`) ran 576 cases:
571 passed, two skipped, three failed. The remaining failures were the same
cloud-conflict draft-reset case in all three browser projects, addressed above.

Actual Angular/Svelte dark/light captures at 1536px and 390px are in
`.tmp/profile-inheritance-verified-*.png` and `.tmp/profile-inheritance-verified.json`.
Sampled desktop trainer/actions/stats and mobile trainer/stats styles match;
mobile action labels use 9.6px text inside 44px targets, matching the source's
visible label size rather than its parent button's computed 11.52px. Neither
frontend overflows the viewport in these comparisons. Approved page widths differ.
Angular's unavailable Material icon font and unavailable fixture support art
remain reference limitations, not evidence of complete pixel parity.

Still not approved: the broader route ledger and remaining inheritance behavior
differences require further source comparison. The hidden-sparks dialog mismatch
identified here is addressed by the subsequent pass above. The missing P1–P2
Race summary is also addressed by the current pass using the existing
`inheritanceAffinity().crossRace` calculation, source color/order and narrow-width
verification. Direct spark-click hiding was investigated
but is not a live workflow:
repository search finds no Angular caller setting the retained hideSkillsMode
input or subscribing to hideSparkRequested. Do not revive that dormant code.
This pass does not certify every dialog or all route workflows.

### Previous pass — Profile presentation and shared skill metadata

Populated comparisons now use the same mixed positive/zero/negative fan-history
fixture in Angular and Svelte, in dark/light themes at 390px and 1536px.
Profile keeps its existing section order and approved 1080px frame/4px mobile
gutters. Stat cards reuse the existing StatTile with Angular's compact
presentation, including sans-serif numbers: Angular's `.mono` rule has its font
override commented out. Single remaining cards fill their row, all-time stats
retain the two separate three-column grids, tables use the source density, and
membership markers retain the source blue color. Team Stadium no longer has
an extra enclosing card. Its rarity stars, stat strip, aptitude rows and tags
use the shared UI components and the original semantic colors.

One profile display helper now owns compact number formatting and signed gain
colors for the header and body. The shared skill catalog now normalizes legacy
boolean strings and metadata-derived unique flags, and owns Angular's stable
unique/type/rarity ordering. Profile cards and Veteran details share that
ordering and rarity classification. Golden checks cover real bundled unique
metadata, inherited skills, stable ties and legacy false flags.

Actual image checks exposed stale Angular PNG URLs returning HTML from the
Svelte preview. Skill icons now use the shipped WebP files through one catalog
path helper, reused by Profile, Veterans, Lineage, factors and database catalog
entries. The browser regressions require decoded skill images, not only an
existing img element. Lineage's odds fixture now uses the real `Corner Recovery
○` name so that it exercises the icon lookup as well as the calculations.

Evidence: `.tmp/profile-overview-before.json`,
`.tmp/profile-overview-final.json`, and the corresponding
`.tmp/profile-overview-{before,final}-*.png` / `.tmp/profile-stadium-final-*.png`
captures. Every measured stat-tile font, size, weight, line-height, tracking,
color, background, border, padding, radius and height matches the Angular
reference. The sampled stadium styles also match except for a 1px tighter
mobile aptitude row gap. All eight stadium images load in every final capture;
there is no page-level overflow. Source icon-font failures remain visible in
Angular and are not treated as Svelte regressions. Touch-sized visibility
buttons and the approved frame widths remain intentional differences.

The development Profile/session run passed all 45 cases across the three
browser projects (`.tmp/profile-presentation-dev.log`). The additional shared
UI/Veterans run passed 40 of 43 (`.tmp/profile-shared-ui-dev.log`): all twelve
Veterans cases pass, while UI Lab reports three outstanding checks for spark
ellipsis, a Hakuraku button font size, and an obsolete race-button locator.
Those development-only failures have not been suppressed or marked passing.

The production build passes 222 logic checks in 63 files, zero Svelte
errors/warnings and shell budgets of 43.0 KiB JS / 10.3 KiB CSS
(`.tmp/profile-presentation-verified-build.log`). Frozen artifact SHA256:
`CD8184B4F4B30F6D3869F9DD382F7D1546FBC0868DA1415AE686A223921EC978`.
The affected 213-case production workflow run passed all 213 cases in 4.5 minutes
(`.tmp/profile-presentation-production.log`) across desktop Chromium, mobile
Chromium and mobile WebKit. It covers Profile/owner sessions/Veterans, Lineage
odds/saves/dialogs, parent pickers, Database filters/results, and shell/ad geometry.
The artifact hash was checked again after the run and is unchanged. Both
previously intermittent WebKit reload cases passed this run; no runtime-error
guard was changed, and one clean run does not establish that the issue is fixed.
All five local backend containers were also confirmed healthy.

This is not complete route approval. Profile inheritance/result-card parity,
remaining header details, broader route visuals, and the previously intermittent
WebKit reload error still need verification. Angular remains the production
rollback/source of truth; productionReplacementReady remains false.

### Previous pass — Populated picker rows and factor export compatibility

Tracing all Angular `VpdRowData` producers corrected the previous lineage
finding: `vpd-row` has an optional compact-tree branch, but none of the actual
Veteran, Bookmark, Partner or Manual producers supply `lineageVeteran`.
Deterministic browser captures confirm zero compact trees in both frontends.
Activating that unused branch would redesign the picker, not finish parity.
The active P1/P2 row layout is retained.

The populated Angular comparison did expose real defects: encoded IDs in
`factor_info_array` were decoded twice, inheritance-only factors disappeared,
same-color factors were not sorted by descending stars, and empty P2 rows were
shown. The new populated browser case failed against the previous production
artifact (`.tmp/parent-row-baseline.log`). The shared factor catalog now owns
export-entry decoding for profile display, Veteran normalization and Planner
transfer. Known older base-ID-plus-level imports remain supported. The existing
picker domain owns Angular's inheritance fallback and ordering, shared by row
display and scope filters. Planner transfers now skip empty alias arrays before
choosing populated factor entries, without changing race-win alias semantics.

Rows continue to reuse Artwork, SparkItem, Icon and IconButton. Their portrait
corners, scenario badge, factor line height/weight, light-theme colors and
150px row height now match Angular. Rarity stars use the existing SVG icon,
factor tooltips include the level, and empty ancestry rows are omitted.
Angular's missing Material font glyphs remain replaced by working SVG icons.
Four desktop/mobile dark/light source pairs match every measured row style
(fonts, size, weight, line height, tracking, color, background, borders, radius,
height) and all row heights. Evidence:
`.tmp/parent-row-comparison-after.json` and eight
`.tmp/parent-rows-after-*.png` captures. Widths affected by the unavailable
Angular icon font are not claimed as pixel matches.

All 24 picker browser workflows passed across the three browser projects
(`.tmp/parent-row-workflows.log`). The final production build passes 219 logic
checks in 62 files, zero Svelte errors/warnings and the shell budgets (42.9 KiB
JS, 10.3 KiB CSS). Build log: `.tmp/parent-row-production-final-build.log`.
Frozen artifact SHA256:
`3382B850CA3DF8DEC2FA56A50215977A944743E6BB6DB607C69DDA9B1E93C593`.
The full 555-case production browser run (all specs except development-only
UI Lab) completed: 547 passed, two desktop-only link gestures intentionally
skipped on mobile, and six failures (two Tools tour workflows in each browser).
Evidence: `.tmp/parent-row-full-production.log` (15.1 minutes).

That broad run caught a Tools tour regression: the full-width background wrapper
had dropped the `.tools-page` anchor used by all five tour steps. The wrapper
now retains both its tour anchor and full-width styling. A further source check
found missing-card Veteran rows lacked Angular's `trained_chara_id` fallback.
The existing picker domain now resolves the display identity for both rows and
name filtering/sorting without changing the saved record. Its targeted logic
checks and Svelte check pass. A new browser regression covers fallback name,
portrait, searching and selection with the original account/member reference.
The first follow-up run passed 129 cases (including every formerly failing
Tools tour) and failed that new case in all three browsers: Database's internal
normalizer still required an outfit ID. The Database now resolves the display
copy without mutating the saved Veteran, and Lineage selection applies the same
resolver, preferring current selectable catalog entries to the historical
fallback. The original account/member reference and null raw outfit ID survive
reload and Planner persistence.

The development regression additionally caught duplicate render keys in the
selected Veteran's ancestor factors. One shared factor-group mapper now assigns
occurrence-specific UI keys and preserves ancestor factor colors, replacing the
second mapping that incorrectly marked every ancestor factor white. The expanded
Database-to-Planner workflow passes on all three browsers
(`.tmp/parent-selection-complete-dev.log`). The final production build passes
220 logic checks, zero Svelte errors/warnings and unchanged shell budgets
(`.tmp/parent-selection-production-build.log`). Artifact SHA256:
`9BAAE0F2FD81F4C82E5F23946DAEBE6A6A87F66235DA1D2DC113B499362D39A4`.
The 180-case affected workflow run completed against that artifact: 178 passed,
two mobile-WebKit cases failed the uncaught-error guard after their UI assertions
passed (`.tmp/parent-selection-final-production.log`, 5.6 minutes). It covers
Database, UQL context, Lineage, parent pickers, shared picker styling, Home/Tools
and all page tours. Every prior Tools failure and the new complete missing-ID
selection workflow passes across all three projects. Desktop and mobile
selected-Veteran screenshots were inspected in that run's output folder.

The two remaining WebKit errors report same-origin `/search/query` access-control
failure during reload. The unlinked-account trace places the native error 28ms
after `page.reload()` starts. Both cases pass three consecutive repeats against
the identical artifact (`.tmp/parent-selection-webkit-recheck.log`: 6 passed).
This is an intermittent reload issue, not a clean 180/180 result; the runtime
error guard remains unchanged and the issue needs further investigation.
All five local backend containers were also confirmed healthy this pass.

This remains scoped progress, not full migration approval. Profile section
composition, wider HTTP/session semantics and route-level visual approval still
require comparison with active Angular code. A concrete next styling gap is
profile gain colors: Angular's header and overview distinguish positive, zero
and negative values, while the Svelte header/rolling cards always use positive
color and monthly rows omit negative/neutral colors.

### Previous verification — Profile sessions and visibility controls

The Angular comparison exposed six reproducible account-workflow failures in
the prior production artifact: incorrect Public/Hidden pills, late profile and
403 responses replacing a newer route, stale visibility reads/writes, unordered
saves with incorrect rollback, and a delayed file read uploading Veterans to
the subsequently opened account. All six failed before the fixes
(`.tmp/profile-session-baseline.log`) and passed afterward. A separate route
re-entry check confirmed that cached profile data could bypass the server's
new access decision (`.tmp/profile-reentry-confirmed.log`). Profile route entry
now requests fresh data, matching Angular's GET behavior.

The existing profile repository now scopes its cache to the sign-in session,
orders copied visibility payloads per account, and invalidates profile/Veteran
data after a successful upload. Route-local request guards prevent older
responses from updating a different account. Uploads capture the chosen account
before reading the file; a changed sign-in session cancels submission. No API
paths, request fields, or persisted preference keys changed.

All six visibility pills reuse one local Svelte snippet and display the saved
setting independently of the owner's permission to view the section. Failed
visibility reads offer Retry and disable mutation until settings are known;
failed writes restore the last confirmed settings rather than guessed defaults.
Screenshot inspection also caught the header SVG selector coloring nested
visibility icons blue. It now targets only the header's own icon, preserving
green/red state colors; the pill uses Angular's text tracking, line height and
padding, with the approved 44px mobile target.

Development checks passed 66 profile/picker workflows before the fresh-access
correction, followed by all 24 session cases across desktop Chromium, mobile
Chromium and mobile WebKit (`.tmp/profile-session-complete.log`). The final build
passes 217 logic checks in 62 files, zero Svelte errors/warnings and the shell
budgets (43.0 KiB JS, 10.3 KiB CSS). Build log:
`.tmp/profile-session-production-final-build.log`. Frozen artifact SHA256:
`0C7C8DF045095BA28788BD41F25272BC89EE1930E89647D911EFB9B5FD63CA0F`.
The frozen production browser run passed all 243 cases in 6.2 minutes across
desktop Chromium, mobile Chromium and mobile WebKit
(`.tmp/profile-session-production-final.log`), with the artifact hash unchanged
after the run. Coverage includes every canonical route/redirect, profile
sessions and account actions, shared pickers, Database controls/UQL, Tools/Home,
community/activity, Settings/auth, Statistics, Tierlist, Planner resource/income
flows and Timeline dialogs. This is regression coverage, not exhaustive route
approval. Desktop/mobile visibility screenshots were inspected; icon and label
colors match, and mobile controls retain 44px targets. Dev 4173 and production
preview 4175 both contain these changes.

This did not approve full Profile layout or Veteran dialog parity. The proposed
compact-lineage follow-up was subsequently disproven by the active Angular
callers (see current pass). Remaining route approvals, profile section
composition and the wider authentication/HTTP audit remain open.

### Previous verification — Live support catalog and Veteran empty states

The Database support picker now uses the shared live resource pipeline with
Angular's global-release flags, title/name/ID search and release-date/ID sorting.
The bundled full index remains demand-loaded for historical records; unreleased
cards are not silently offered in the picker. Shared UI still owns presentation,
while the route/catalog own loading, normalization and retry state.

Resource storage reads and writes Angular's existing CacheStorage and metadata
keys. Refresh errors retain cached choices and query filters; malformed support
records are rejected before cache replacement. Ordered writes prevent late old
responses from overwriting a newer refresh. Cache privacy/quota failures do not
discard successful network data. Errors and retry/Discord actions stay inside
the picker, without showing a false empty result.

The live Angular/Svelte comparison uses the actual healthy local backend, not
mocked support records: all 229 released cards have identical ordering/titles
at 390/1536px in dark/light themes. Desktop dialogs measure 700×768px; mobile
dialogs measure 382×928px at a 390×960 viewport. Svelte keeps centered 4px mobile
gutters and 44px interactive targets. Mobile height now follows Angular's
viewport-minus-32px cap; extra visible Type/Rarity labels are removed while
accessible names remain. Evidence: `.tmp/live-support-comparison.json` and the
corresponding eight screenshots. Computed fonts, font sizes, colors, letter
spacing and line heights for titles, names and badges also match in all four
pairs; the missing 0.5px text tracking and 24px badge line height are restored.
Missing Material icon-font glyphs in the
Angular environment remain replaced by shared SVGs.

The Veteran picker now distinguishes signed-out, unlinked, linked-but-empty and
filtered-empty states, with Angular copy, spacing and theme colors. Navigation
actions close the dialog; uploads link to `/profile/:accountId/veterans`, and
the original umadump link is restored. Anonymous Bookmarks retains its separate
navigation-bar sign-in instructions. Populated Veteran ancestry rows and the
account-session audit still need work; this is not full dialog/route approval.

The new production build passes 213 logic checks in 61 files and zero Svelte
errors/warnings; shell budgets remain 43.0 KiB JS and 10.3 KiB CSS. Frozen artifact
SHA256: `3DA3B7A1921B076FCAF0299733B021A3BB3F1AE26D5E3958EAB3F3025AED69B4`.
The final frozen production run passed all 162 checks in 4.4 minutes across
desktop Chromium, mobile Chromium and mobile WebKit
(`.tmp/support-veteran-production-final.log`). Coverage includes the shared
pickers, Database controls, Tools/Home, community routes, Planner resources and
income, account Veteran details, Statistics, Tierlist and Timeline dialogs.
This is scoped regression coverage, not approval of all routes. Rendered
Veteran sign-in/upload states were inspected on desktop and mobile. The build
log is `.tmp/support-veteran-final-build.log`; the artifact hash stayed unchanged
through the browser run. Dev 4173 and production preview 4175 both contain these
changes; all five local backend containers were healthy when checked.

Before the final typography correction, the first production run passed
161/162 checks (`.tmp/support-veteran-production.log`, artifact
`31D86E579291385E365AED3B697279DDE28E5F2DC3CE28A13BFE566BD678F255`).
Its remaining failure was a strict CSS-height equality: WebKit returned
811.999939px instead of 812px. The geometry assertion now uses hundredth-pixel
precision; no workflow assertion or timeout was weakened.

Development testing passed 67/69 cases; the two failures were CacheStorage
creation in overly long Windows test-profile paths. Using short generated
profile paths passed all nine support workflow cases on Chromium, mobile
Chromium and mobile WebKit (`.tmp/support-cache-final.log`). Persistent profiles
also avoid ephemeral WebKit cache entries disappearing across navigation.

### Previous verification — Tools background, picker typography and shared select focus

Tools keeps its normal content frame and ad rails, while the gradient and
statistics strip now span the available page width and fill the viewport.
The shared dialog header/footer use Angular's page font stack; Material-style
content retains Roboto, while the Veteran picker explicitly uses the page font.
Character search uses Angular's Arial input styling and dark/light colors.
Veteran mobile tabs remain icon-only, matching the final Angular CSS override.

The support picker now owns its responsive container inside the dialog rather
than inheriting the narrow launch button's width. It uses the source image grid,
separate search/filter rows, Wisdom label and rarity ordering. Reopening resets
search/type/rarity. It reuses Artwork and SelectField without new dependencies.
The Safari regression reproduced a shared select opening without focus; Escape
then dismissed its containing dialog. SelectField now focuses its combobox on
open, so its own keyboard handler receives Escape and navigation keys.

Shared pink/white spark, distance and race-grade colors use the current Angular
values. Race badges and UQL grade decorations share the same grade tokens.

The first 78-case expanded run passed 77 checks and exposed the Safari bug.
After its fix, all 15 picker/style checks passed across desktop Chromium, mobile
Chromium and mobile WebKit. The wider 75-case development run passed 74, with one
Planner reload timing out before its route body appeared; no assertion or
timeout was relaxed. The separate frozen production run passed all 102 checks
in 2.8 minutes, including that Planner reload, on desktop Chromium, mobile
Chromium and mobile WebKit (`.tmp/picker-production-verified.log`). Artifact
SHA256: `53DE29D3FAB6DC2FC21120C018E65C0BB5F44ADE1DA27B3400F0FDD602459132`.
The build passed zero Svelte errors/warnings and all 207 logic checks in 59 files;
shell budgets passed at 43.0 KiB JS and 10.3 KiB CSS. Vite still reports its
existing large lazy-chunk warning.

Eight Angular/Svelte captures at 390/1536px in both themes compare Tools and the
Character/Veteran pickers (`.tmp/picker-style-comparison.json`), plus four Svelte
support-grid captures. Header font stacks, sizes, weights and colors match the
reference. Angular's missing Material icon font is not reproduced; the port
keeps shared SVG icons. Mobile retains the approved 44px interactive targets.
The Tools geometry checks additionally cover 320, 768, 1920 and 2560px.

This was not approval of every dialog or the full migration. Support catalog
and Veteran empty-state gaps found here are addressed by the current pass above;
the compact ancestry layout and account-session audit remain open.

### Previous verification — Timeline routing and shared navigation controls

Timeline now derives its selected tab from the installed router's reactive
query state. The shared Tabs component supports native link navigation without
changing the button/tab semantics of existing in-page controls. Its links use
Angular's exact tab URLs and aria-current state; switching tabs replaces the
query/fragment as Angular's RouterLinks do, while arriving URLs remain intact.
Banner requests are handled by the mounted Planner through its existing add
action, once per requested banner. Same-route navigation, Back/Forward, native
fragment changes, legacy `?p=` compact shares and short-share precedence have
browser workflows. Manifest intent prefetch uses the existing request cache
without fetching income/core/gacha datasets early.

A document-level boundary preserves modified or cancelled internal link clicks
before sv-router's window handler. Desktop Ctrl/Shift/middle clicks were checked
using real newly opened pages. The native-link shortcut case is deliberately
desktop-only; touch navigation and history run on both mobile browser profiles.
No installed package was edited and no dependency was added.

The initial four desktop checks reproduced three failures. After implementation,
the compact fixture needed Angular's existing `(shared)` suffix. The broader
84-case run finished 80 passed, two failed and two desktop-only skips: the two
failures read persistence before the asynchronous tab navigation mounted the
Planner. A five-cycle probe (`.tmp/navigation-reward-probe.log`) confirmed the
old read occurred with `mounted:false`, followed by correct resource compaction.
The test now waits for the visible Planner region before releasing rewards;
its expected values are unchanged. The following navigation/Timeline run passed
37 checks with two intentional skips in 1.5 minutes.

Eight Angular/Svelte tab captures at 390/1536px in dark/light match link URLs,
selected state, Inter typography, 14px/500 labels, colors, borders and radii
(`.tmp/timeline-navigation-comparison.json`). Desktop tabs match 34px; mobile
retains the approved 44px targets. The screenshot comparison caught and fixed
an inherited equal-width rule wrapping the Planner label onto two lines.
There was no page overflow in those captures.

The footer's previously unbound Privacy Choices button now uses the same Fuse
privacy helper as the policy page. Both controls are covered for TCF/GPP/USP,
keyboard activation and unavailable regional controls. Footer touch targets
retain 44px. The final focused navigation/footer run passed 19 checks with two
desktop-only skips in 45.1 seconds (`.tmp/navigation-footer-verified.log`).

The production build passed with zero Svelte errors/warnings, 207 logic checks
in 59 files, and 43.1 KiB shell JS / 10.2 KiB shell CSS. Manifest SHA256:
`81E69E558F4C1A24940ADD9887C9AD41107974721EC47642BE9F3F8D68104D69`.
The 498-case frozen production run completed with 496 passed and two intentional
mobile skips of desktop shortcuts in 12.8 minutes
(`.tmp/navigation-production-acceptance.log`). This result belongs to that prior
artifact, not the subsequent picker changes; no route approval or production
switch is implied.
Search, resources, backend, embeds and Redis containers were all healthy when
checked during this run (nine hours uptime).

Next: delayed cross-account profile/ownership/visibility responses, vertical
Timeline card deferral, and remaining route-level visual/behavioral approvals.
The footer's build label is also still hardcoded to `local`; current Angular
uses its version service, so version/copy integration remains an explicit gap.
The account audit also found that visibility labels cannot currently show an
owner's hidden state (`sectionVisible` always returns true for owners; several
other pills hardcode Public). Keep owner access separate from the displayed
visibility state. `ProfileVeteransRoster.receiveFiles` reads the mutable account
prop after awaiting file contents and again after the upload; capture the
requested account before reading the file and guard late UI updates. Reproduce
delayed read/upload/navigation before approving those account workflows.

### Previous verification — shared Timeline event cards

The single shared card now uses Angular's event-type accents, metadata states,
70px media, fixed-height variants, two-line 13.75px titles, date typography,
portrait dimensions, and separate race/participant/reward rows. The broad
intermediate tone type/map was removed; production and UI Lab use the same
event identity. Card reward previews reuse the existing competitive summary.
The source's dark/light success token was restored for the Added state.

Race-card formatting and richer dialog facts share parsing primitives while
retaining their distinct displays. Plan controls retain the approved 44px
mobile minimum, even on a scout without portraits. The mobile toolbar observes
the existing footer, becomes hidden/inert there, and remains available while
its filter sheet is open.

Eight populated Angular/Svelte comparisons cover 24 card variants at
390/1536px, dark/light (`.tmp/timeline-card-comparison.json`). No uncaught
errors or page overflow occurred. Measured card fonts, colors and region
heights match except the no-portrait scout's larger accessible Plan area and
the no-portrait Legend footer. The explicit competitive fixture confirms
Angular clips that footer's rewards on mobile; the port displays the strip.
The capture script centers cards so the approved fixed navigation does not
obscure the component screenshots.

The first focused run finished 64/72. Six new cases needed correct reward
fixture data and state-dependent action/focus expectations; two existing
long-list cases tried to press Today while the newly restored footer observer
hid the action bar. They now scroll above the footer first, as a user must.
Corrected card/layout workflows passed 15/15 in 49.3 seconds across desktop
Chromium, mobile Chromium and mobile WebKit (`.tmp/timeline-card-fixed.log`).
The geometry, color, keyboard, persistence, overflow and 44px assertions remain.

`.tmp/timeline-card-verified-build.log`: zero Svelte errors/warnings, 207 logic
checks in 59 files, 42.9 KiB shell JS / 10.1 KiB shell CSS. Manifest SHA256:
`9160B6A923A5E7BA156EF5FCFBBB5A8D79DC062B0934FFFA754732B1ABA1923F`.
The frozen production bundle passed all 483 workflows in 12.8 minutes without
retries: 161 each on desktop Chromium, mobile Chromium and mobile WebKit
(`.tmp/timeline-card-acceptance-production.log`). The result file reports
`passed` with no failed tests, and the manifest hash remained unchanged after
the run. The previous 477-workflow acceptance below is for the previous bundle.
No route approval or production switch is implied.

Live, read-only preview requests also returned backend statistics (2,353,884
trainers, 28,188,793 tracked Umas) and one inheritance result from
`/search/query`. These demonstrate connectivity, not exhaustive real-data UI
acceptance. A stale ledger item for the old WebKit navigation failure was
removed: the existing `beforeunload` HTTP guard, the retained 50-cycle probe
with no logged page errors, and the subsequent 477/477 regression run already
provide the recorded fix evidence. The original failure remains in history.

The subsequent routing pass above resolved the tab/query and modified-link
findings recorded here. Vertical Timeline still mounts all cards; the source
uses viewport-deferred cards.
The same-route audit also found `ProfileShell.loadProfile`, `loadOwnership` and
`persistVisibility` applying responses without account/request identity checks.
The existing profile workflows do not exercise delayed responses while changing
accounts. Add that workflow and fix the shared shell boundary before approving
the account route family; do not assume a passing single-account test covers it.

### Previous verification — Timeline date lanes and mobile feed

Timeline now uses the active Angular date-lane and mobile-feed composition:
280px lanes, 296px steps, compact spacing by default, uncapped 14px calendar
gaps, empty-month spans, grouped vertical months, ordered releases, and the
three-card expansion control. Launch, resource-backed anniversaries, year and
Today markers are restored. Search arrows count matching dates rather than
individual releases. Mobile uses the source's <1150px feed and bottom Search &
filters sheet; both filter views now support Select all/Unselect all.

The existing event cards, details dialogs, planner state/repositories, Checkbox,
Button, Icon and AdRegion are reused. Date grouping/spacing/feed calculations
live in one pure domain module. No dependency or replacement storage key was
added. The original desktop direction/spacing preference key is retained,
including when resizing into and out of mobile. The shared checkbox now uses a
bounded SVG tick instead of an oversized font glyph.

Mobile rows are windowed with measured heights; horizontal lanes are windowed
with the source's three-lane overscan. Tests exercise 180-date schedules, jumping
to the far end and back, keyboard scrolling, expansion, nested-dialog Escape,
filter focus return and preference restoration at the 1149/1150px boundary.
Review also fixed page-scroll-dependent track growth and prevented the initial
Today alignment from overriding an intervening user scroll.

The frozen production candidate passed **477/477 workflows** in 11.7 minutes,
two workers and no retries (`.tmp/timeline-acceptance-production.log`): 159/159
each on desktop Chromium, mobile Chromium and mobile WebKit. The result file
reports `passed` with no failed tests. Manifest SHA256 was rechecked unchanged:
`6F92B963B66456967D651CFA08190A9BBE05986A4069D67C27F45F8C505EC10A`.
This is regression evidence for the implemented workflows, not blanket visual
approval or proof of every possible input/state. UI Lab remains excluded.

Build, focused checks and comparison history:

- `.tmp/timeline-verified-build.log`: zero Svelte errors/warnings, 206 logic
  checks in 59 files; shell budgets 42.9 KiB JS / 10.1 KiB CSS.
- `.tmp/timeline-layout-workflows.log`: 77/78. The old detail workflow attempted
  to open a fourth collapsed event; it now uses the actual Show more control.
- `.tmp/timeline-layout-stress.log`: 20/21; identified Safari filter focus return.
  The corrected layout cases passed 9/9 in `.tmp/timeline-layout-fixed.log`.
- `.tmp/timeline-final-layout.log`: 8/9; exposed the initial Today scroll racing
  an immediate user scroll, now guarded rather than delayed in the test.
- `.tmp/timeline-scroll-verified.log`: corrected layout workflows passed 27/27
  (three repeats on each of desktop Chromium, mobile Chromium and mobile
  WebKit). These repeat runs are separate from the full production run.
- `.tmp/timeline-compare.json`: eight populated Angular/Svelte captures at
  390/1536px in dark/light themes, no uncaught errors or page-level overflow.
  Desktop date-label dimensions/colors and Today label dimensions/colors match.
  Horizontal page offsets differ with the approved shell and ad frame.

Timeline is **not approved**. Remaining review includes complete card variants
(the shared card still differs in fixed height, title wrapping, metadata icons,
pickup/reward layout and event-specific colors), vertical viewport-deferred card
instantiation, mobile footer behavior, tab history/query navigation and remaining
reward/import/storage boundaries. The restored Today tour step is now exercised;
no invisible substitute rectangles were added.

Source audit for the next card pass (not implemented or approved):

- The active `components/timeline-event-card` renders 193px media cards, 123px
  cards without media, a 70px image region, 13.75px/14px two-line titles and
  11.25px schedule dates. The shared Svelte card still shrinks every 280px
  desktop lane's media to 60px through its container query and truncates titles
  to one line. Port the explicit mobile/empty/race variants, not that query.
- Metadata needs the existing SVG Icon component and separate gacha, rerun and
  predicted treatments. The current `b:first-of-type` incorrectly highlights
  whichever metadata happens to come first. Match the source's per-event
  accents; the current broad tone mapping omits several event families.
- `TimelinePage.cardView` already consumes the shared reward summary but maps
  only its fixed `items`. Competitive rewards need its existing `previewItems`
  and `previewLabel`; do not recalculate rewards in the UI. Legend Race needs
  the source's separate race, participant and reward rows. Preserve the
  approved 44px mobile Plan target while matching the surrounding density.
- `TimelinePage` only reads tab/query state on mount and uses `replaceState`.
  The Angular route subscribes to query/fragment changes and uses link tabs.
  Exercise Back/Forward, direct banner/share links and same-route navigation
  before claiming this boundary works equivalently.
- Angular's mobile timeline observes the footer to hide its bottom toolbar.
  Svelte has no equivalent yet; the existing `.site-footer` is the target.

The five local backend containers were rechecked during the frozen-candidate
run: search, resources, backend, embeds and Redis were all healthy. Populated
mocked browser workflows remain distinct from real-data acceptance.

### Previous verification — Guided tours and Activity route reuse

The previously dead Help control now lazily opens the page tour. The source's
nine page sequences, original copy and audience/seen storage keys are retained.
Database steps prepare and restore the existing filter panels; adding a Blue
Factor and moving the star/LB sliders advance only after real input. Native
pickers remain usable above the tour. Optional introductions wait for existing
dialogs, support Skip/Start and remain replayable. Escape and completion restore
Help focus, including touch Safari. Failed module downloads offer a real page
reload, not a cached-import retry promise. No new runtime dependency was added.

Activity's reused route component now reloads report/list state when its viewer
parameter changes and discards stale responses. The report-to-list tour exposed
the missing reload; a separate navigation workflow now checks it.

`.tmp/tour-verified-build.log`: zero Svelte errors/warnings, **204 logic checks**
in 58 files, and passing **42.6 KiB JS / 10.0 KiB CSS** shell budgets. Manifest
SHA256: `E046F0DB56F79C749E4C2290F0258360A43D3A2DAE03F357395AC083D234667B`.
The full production run passed **467/468** in 13.2 minutes, two workers and no
retries (`.tmp/tour-acceptance-production.log`). Chromium desktop/mobile each
passed 156/156; mobile WebKit passed 155/156. This is not a clean full run.

The single failure was the UQL test dereferencing a null suggestion-row bounding
box after a visibility assertion. Its trace shows CodeMirror replacing the
completion list while pending results become enabled; the installed library's
`showOptions` removes and recreates those rows. No page exception or resource
failure was reported. The unchanged test/artifact passed **10/10** isolated
Safari repeats (`.tmp/tour-uql-repeat.log`). The height assertion now re-queries
the live option until it meets the same 44px minimum; completion, editing and
query assertions are unchanged. Corrected repeats passed **9/9** (three each on
desktop Chromium, mobile Chromium and mobile WebKit) on the unchanged artifact
(`.tmp/tour-uql-verified.log`, `.last-run.json`: passed, no failed tests). The
manifest hash above was rechecked. These do not turn 467/468 into a clean full
run. All five local backend containers were healthy when checked in this pass.

The earlier `.tmp/tour-verified-production.log` run was cancelled after noticing
that an old Timeline test still clicked the removed desktop control on mobile.
It now checks that control's absence and runs the same late-response assertions
in the mobile feed. All three versions passed in the final full run above.

`.tmp/tour-visual-report.json` compares introductions and callouts against the
running Angular source at 390/1536px in dark/light themes. All eight pages have
no horizontal overflow or uncaught exceptions. The comparison caught and fixed
Roboto/Inter, body-color and spacing differences: final font/line-height/color
values match; mobile keeps 44px interactive targets and viewport-clamped callouts.
The source's unavailable Material icon font is not copied as broken text.

The focused run was **48/51**, with all three failed cases caused by the new
download-failure fixture missing the nested production asset directory. The
corrected fixture explicitly verifies interception; its unchanged-artifact
recovery run passed **3/3** (`.tmp/tour-recovery-verified.log`). Earlier failed
or cancelled candidates are not acceptance evidence.

At that checkpoint, Timeline's current-date marker and virtual/mobile layout
were still missing and the optional Today tour step was excluded. The latest
Timeline pass above addresses that composition and exercises the real marker.
All route statuses remain provisional until complete visual/workflow acceptance.

### Previous verification — Lineage composition and responsive alignment

The final full workflow run passed **422/423**, not a clean acceptance run
(`.tmp/lineage-composition-final-production.log`, 11.0 minutes, two workers,
no retries). Desktop Chromium and mobile WebKit each passed 141/141; mobile
Chromium passed 140/141. Its Database report workflow never reached the report
controls: `SelectField-DpulNMAC.css` failed to download with Chromium
`net::ERR_NO_BUFFER_SPACE`, producing the recoverable route-load page. The trace
records the failed stylesheet and route import; no report API failure caused it.
The local socket check afterward showed 802 TIME_WAIT and 98 established TCP
connections against a 16,384-port dynamic range, which does not establish the
cause of the earlier buffer failure. Do not label it fixed, ignore the error,
or change machine network/security settings to make the suite green.

The run used the unchanged production
manifest SHA256 `D57332DB0022E40A4598CE65B9FB03BB20CABF149964D582F7D14AD019C7A778`.
`.tmp/lineage-composition-final-build.log` reports zero Svelte errors/warnings,
57 logic files / 202 checks passing, and passing 41.7 KiB JS / 10.0 KiB CSS
base-shell budgets. No production cutover or route approval is implied.

The unchanged final artifact subsequently passed **27/27 focused repeats**
(`.tmp/lineage-composition-final-focused.log`, three repeats each of Database
reporting, Lineage odds/popover behavior and the populated resize sequence on
all three browser profiles). Its `.last-run.json` reports passed with no failed
tests. These repeats do not turn the preceding 422/423 run into a clean run.

Final production visual comparisons (`.tmp/lineage-composition-final-capture.log`,
`.tmp/lineage-composition-capture.json`) cover 390/1536px in both themes with
identical populated Angular/Svelte fixtures. All eight pages have no horizontal
overflow or uncaught exceptions. The source hover tooltip was dismissed before
the final popup screenshots; its unrelated icon-font failure remains visible.
The read-only real-data selector comparison also passed: **85/85** released,
non-conflicting variants match in names, IDs, affinity and ordering
(`.tmp/lineage-composition-final-real-picker.log`). All five backend containers
were healthy when rechecked. No live user data was changed by these isolated
browser checks.

The first composition candidate passed **422/423**, not a passing acceptance
run (`.tmp/lineage-composition-production.log`). WebKit raised
`ResizeObserver loop completed with undelivered notifications` while resizing
the populated tree through 320–2560px. Synchronous dimension bindings updated
the fit compensation during observer delivery. The page-local fit action now
measures and writes in the next animation frame, disconnecting and cancelling
pending work on teardown. All three final production resize checks passed.
No browser error is ignored. The corrected development
candidate passed **18/18 repeated resize/popup checks** across three browsers
(`.tmp/lineage-resize-fix-dev.log`). Final production evidence does not erase
that failed run. The original 42/42 focused composition run predated
the expanded resize sequence and did not catch this problem.

### Previous verified artifact — Lineage saves, odds and recoverable route loads

- `.tmp/lineage-final-production.log`: **423/423 passed** in one run
  (11.7 minutes), desktop Chromium, mobile Chromium and mobile WebKit, with no
  retries. `.tmp/lineage-final-production/.last-run.json` reports passed and no
  failed tests. UI Lab/Hakuraku checks are excluded from this production suite.
  The source and artifact remained unchanged during this run; the manifest hash
  below was rechecked afterward. All route statuses remain provisional; this
  does not certify unimplemented Angular interactions or full visual parity.

- `.tmp/lineage-final-production-build.log`: zero Svelte errors/warnings,
  **57 logic files / 202 checks passed**. Production build and compressed
  base-shell budgets pass at **41.7 KiB JS / 10.0 KiB CSS**. Existing large
  demand-loaded chunks retain Vite's advisory. Manifest SHA256:
  `0DFAFB3AEF10801C13CBF4C7E6D6E55116A89FD23D9BA97B5AC3B683E43CE916`.
- The earlier candidate passed
  **415/417** checks (`.tmp/lineage-saves-production.log`); this is not a passing
  acceptance run. Its Timeline failure was traced to Chromium's
  `net::ERR_NO_BUFFER_SPACE` while preloading `Checkbox-CLsT_bHu.css`, which
  caused the route import to fail. WebKit also failed the deliberate Privacy
  module failure/reload recovery once. Neither failure is waived by focused
  retries. `.tmp/route-errors.log` records the browser trace evidence.
- A subsequent unchanged-artifact repeat reproduced the WebKit Privacy failure
  **3/3**, with **42/45** total focused checks passing
  (`.tmp/lineage-odds-production-focused.log`). A separate probe reproduced it
  with aborted requests, HTTP 503, removed interception, direct navigation and
  native reload (`.tmp/probe-webkit-reload.log`). No second module request was
  made after reload. This matches the reported
  [WebKit failed-modulepreload cache bug](https://bugs.webkit.org/show_bug.cgi?id=270357).
  The final build disables JavaScript module preloading; native imports remain
  lazy and Vite's existing CSS-before-page loading remains enabled (verified in
  the installed Vite implementation). This is a build-level workaround, not a
  retry/timeout waiver or a new loader abstraction. The unchanged final artifact
  passed **45/45** focused repeats, including the same formerly failing WebKit
  reload cases (`.tmp/lineage-final-production-focused.log`), followed by the
  passing **423/423** production run above.
- Lazy route imports now resolve a recoverable error page instead of leaving
  sv-router's lazy-load promise pending and the page blank. It retains URL and
  storage, offers Reload and Discord reporting, and updates its title/width on
  navigation between failed routes. The shared browser harness now fails on
  unexpected route-load errors, not just uncaught exceptions; deliberate error
  tests opt in explicitly. The final development recovery run passed **9/9**
  (`.tmp/route-recovery-final-dev.log`).
- Named Lineage saves restore the source section order, confirmation and
  transfer workflows, preserve stored data on failures and reject malformed
  imports atomically. The same page now reuses Optimal Races and preserves
  Angular's legacy card-query positions. Detailed evidence is recorded below.
- The odds views now preserve source ordering, grouped independent rolls,
  expected procs and separate skill-creation chances, using existing probability
  helpers and a feature-local presentation component. Shared small buttons now
  retain 44px targets on narrow viewports as well as coarse pointers. The first
  focused development run passed **41/42**, identifying that target-size bug;
  the correction is covered by both final-source production runs above.
- `.tmp/odds-parity-capture.json` and `.tmp/odds-parity-*.png` compare populated
  Angular/Svelte odds at **390/1536**, both themes. Font family, 13.12px summary
  text, 19.68px line height, dark/light panel surfaces and blue row backgrounds
  match. All captured states have no page overflow. Angular's enclosing desktop
  scale-to-fit still changes rendered geometry; full tree composition is not
  approved by these captures.
- An unmocked final-artifact comparison matched all **85 released,
  non-conflicting character variants**, IDs, names, affinity values and ordering
  against Angular (`.tmp/lineage-final-real-picker.log`,
  `.tmp/real-lineage-picker.json`), with no uncaught browser errors.
- All five local backend containers were rechecked healthy. Preview is 4175,
  development is 4173, and Angular reference is 4200. No production cutover.

### Previous verified artifact — shared Lineage pickers and editing

- `.tmp/lineage-parity-production.log`: **392/393 passed** in one run
  (13.3 minutes), covering desktop Chromium, mobile Chromium and mobile WebKit.
  The remaining desktop shell workflow failed because the Database page did not
  mount: the browser reported a failed dynamic import of
  `DatabasePage-B5b3YNPm.js`. This is not a passing production acceptance run.
- The failed import's recorded JavaScript responses were HTTP 200, and the
  requested chunk exists in the frozen artifact. The exact navigation workflow
  subsequently passed **10/10** repeats (`.tmp/lineage-shell-repeat.log`) against
  that unchanged artifact. The intermittent failure's cause remains unresolved;
  isolated repeats do not erase the full-run failure or establish a fix.
- `.tmp/lineage-parity-production-build.log`: zero Svelte errors/warnings,
  **57 logic files / 200 checks passed**, successful production build and
  compressed base-shell budgets of 41.6 KiB JS and 9.0 KiB CSS. Existing large
  demand-loaded chunks retain Vite's advisory.
- The manifest SHA256 remained
  `8735921466D6D73F198BEE29F7073754797FABF1E0F8CA37191B778FD05205A1`
  throughout verification. Source/build files were not changed during the run.
  Preview remains on 4175, development on 4173 and Angular reference on 4200.
- `.tmp/lineage-reuse-workflows.log`: **60/60 focused checks passed**, covering
  Database controls, shared parent pickers and Lineage workflows on all three
  browser profiles. Coverage includes source slot exclusions, released outfits,
  resource retry, inline sparks, persistence, rejected conflicting Veterans,
  confirm/cancel race editing and read-only imported Veteran race history.
- An unmocked comparison matched all **85 allowed released variants** for the
  seeded Lineage parent slot, including IDs, names, affinity scores and ordering
  (`.tmp/real-lineage-picker.json`). All five local backend containers were healthy.
  Source/Svelte picker captures cover 390px and 1536px in both themes with loaded
  portraits; typography, colors and ordering match the inspected reference state.
  The mobile result panel is 4px taller to retain 44px interaction targets.
- Character dialogs now share intrinsic result-panel sizing and accessible
  names. Lineage uses the existing catalog and affinity engine; inline spark
  controls reuse the UI library. Manual-parent and Lineage race editing share
  `RaceWinPickerDialog`, and imported race history reuses `RaceResultsDialog`.

These are verified corrections, not complete page or route approvals. Remaining
Lineage composition/save-dialog differences are recorded below; every route is
still provisional and `productionReplacementReady` remains false.

### Previous verified artifact — fonts, Tools background and pickers

- `.tmp/production-picker-parity-final.log`: **381/381 passed** in one run
  (9.9 minutes), covering desktop Chromium, Android-sized Chromium and iPhone
  WebKit. `.last-run.json` reports passed with no failed tests. Runtime errors
  remain assertions; no retries or relaxed Timeline/ad-geometry checks were used.
- `.tmp/production-picker-final-build.log`: zero Svelte errors/warnings,
  **57 logic files / 198 checks passed**, base-shell budgets 41.6 KiB JS and
  9.0 KiB CSS compressed. Lazy chart/workbook/skill chunks retain Vite's advisory.
- The production manifest stayed
  `639c3ec0b3a7ed60403f1ea37d0f0f7e6a317b0a083a1d686a83e0b433e6690d`
  throughout the final run. Source/build files were not changed during it.
  The local preview is on 4175 and the development service is on 4173; no
  production cutover or removal of Angular was performed.
- All five local backend containers were healthy. A separate unmocked resource
  comparison matched all 93 released character variants, names and ordering.
  The corrected dialog's computed/platform typography also matched Angular.
  `.tmp/capture-final-tools.log` verifies full background width while retaining
  4px mobile content gutters and 1080px desktop content; the complete shell
  workflows verify both ad-rail breakpoints.
- Earlier `.tmp/production-pickers` passed 373/381 and exposed the Tools
  full-bleed frame removing ad rails and the picker gutter narrowing Timeline
  dialogs. Both were corrected without weakening those assertions. Intermediate
  runs were stopped for manual-picker ordering/full-card-ID exclusion corrections;
  they are not combined with the final result above.

These checks verify this artifact, not full Angular visual/behavioral parity.
Every route remains provisional and `productionReplacementReady` remains false.

## Corrected in this pass

- Tools now paints its full-bleed background outside the normal/ad-aware frame;
  the centered, ordered content grid and both ad-rail breakpoints stay unchanged. The heading can shrink at
  320px. Desktop/mobile geometry checks cover 320–2560px, including the hero's
  alignment with the approved shell. The font stack now matches Angular's
  `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  body text inherits the original 16px base without forcing different smoothing.
  Dialogs retain Angular Material's separate `Roboto, sans-serif` stack rather
  than incorrectly inheriting the page's Inter stack. Browser platform-font
  inspection demonstrated Arial versus Segoe UI Semibold on the same 12px/500
  character label before this correction. The final probe matches the font,
  size, weight, line height, color, smoothing and rendering settings exactly
  (`.tmp/real-picker-check-final.log`).
- Character dialogs preserve released outfit variants and full card IDs.
  A real-resource comparison against Angular returns the same 93 characters,
  names and default ordering (`.tmp/real-picker-check.json`). The selector uses
  the existing resource cache/decompression pipeline; historical record displays
  retain the full catalog. Catalog failures appear inside the dialog with Retry
  and Discord reporting. Include/exclude is additive, resets drafts/search/sort
  on reopen, and clears same-role conflicts by base character as Angular does.
  Target/main-parent conflicts clear without rewriting persisted card IDs.
- Character sort menus reuse the shared keyboard-accessible menu. Plain-text
  search avoids the native search input consuming Escape instead of closing the
  dialog. Shared header geometry, light-mode search surfaces, selected overlays,
  and affinity badge placement were compared with current Angular. Veteran
  picker tabs, account/search controls, selected factor controls and row layout
  now follow the source, including its 150px Veteran/bookmark rows. Read-only
  mobile content stays dense while interactive controls retain 44px targets.
  Manual character choices use the same released catalog; historical entries
  remain visible. No saved-entry/API schema was changed.
- Verification for these changes: 39 focused picker workflows passed on dev
  across desktop Chromium, mobile Chromium and mobile WebKit. The production
  build passes 57 logic files / 198 checks, zero Svelte errors or warnings, and
  the 41.6 KiB JS / 9.0 KiB CSS base-shell budgets. The broader production run
  is recorded separately below; focused passes are not route approvals.
  Shared mocked resource captures cover both themes at 390px and 1536px in
  `.tmp/picker-comparison.json`. Angular's unavailable Material icon font is
  excluded from visual judgments. This is not complete dialog parity: remaining
  Lineage and manual-editor composition/affinity states still need review.
- Home and Tools now share `FeatureLink`, preserving their separate ordered
  grids, source card surfaces, Updated/Coming Soon states and native links.
  Original light-mode card tokens and the Tools hero background are restored;
  shared wrench/battery/gauge icons replace distorted or unrelated placeholders.
  Theme loading now respects Angular's `uma-color-mode`, with an explicit
  fallback for preview-only `uma:theme` preferences. Angular wins if both exist;
  blocked theme storage keeps the page usable. This does not yet make all other
  startup storage access resilient.
- Native Dialog keeps its return target through the browser's close event and
  retries lost focus only when focus is still on the body/closed dialog. It does
  not steal focus from a newly opened dialog or another control. Safari's
  repeated Tierlist workflow failed 8/40 checks before this change and passed
  40/40 afterward; the workflow now exercises three keyboard reopen cycles.
  A subsequent whole-suite run still exposed an intermittent WebKit focus
  failure; a 240-cycle isolated probe did not reproduce it. Isolated results
  alone do not establish that this remaining focus race is resolved.
- Planner names retain a draft until blur and then use Angular's name sanitizer.
  Sharing sends `{plan_id, plan_name}` first, uses the old embedded-plan payload
  only for 400/422 responses, and decodes collection-shaped shares by plan ID.
  Cloud conflict/revert alerts, expired/malformed links and initial-load races
  are now covered. The existing sync controller and one shared collection/save
  owner survive both tab changes and route navigation. Timeline selections use
  that same owner; derived resource cleanup no longer clears a conflict alert
  or queues a false user edit.
- The live Planner had 456 active rewards while Angular had 423. Full resource
  timestamps had incorrectly gone through the strict user-input date parser,
  leaving expired groups active. Reward summaries and groups now share the
  existing timestamp-to-UTC-date semantics; user-entered calendar validation and
  ledger date-prefix semantics are unchanged. The real-data comparison now
  gives 423 on both implementations. Automatic rewards no longer inflate the
  Planner tab's banner count, and the empty target list uses Angular's compact
  horizontal icon/copy arrangement instead of a large generic empty panel.
- Coming Soon now uses Angular's centered 600px composition, original copy,
  progress badge, gradient strip and Back to Home action through shared Button,
  Icon and SourcePage. The page keeps the normal frame, mobile sizing and
  reduced-motion handling; it no longer substitutes a generic EmptyState.
- Privacy jump controls now scroll without adding a URL hash, with keyboard
  access and 44px mobile rows. Section text, subheading weight, list line-height,
  consent-card text size and read-only contact row spacing match the source.
  Existing Fuse privacy handling remains shared with the footer.
- Planner manager now restores Angular's combined header/search/projection
  workbench, selected-plan/create menu, More actions menu and standalone share
  notice with Open link/Copy link. Deleting a plan asks for confirmation and
  cancellation retains the full collection. Crystal totals reuse
  `availableCrystals`, include craftable shards and show both `n/20` remainders;
  mobile retains the source full-width status followed by two paired stat rows.
  The shared Menu supplies native popover dismissal, keyboard navigation,
  checked plans, disabled actions, viewport containment and 44px mobile rows.
  Club export remains a caller of that same control.
- Planner setup now uses the shared accessible Tabs component, with Angular's
  Balance/Income/Rewards descriptions and initialized aggregate summaries.
  Reward counts include active groups and ready campaigns, not saved override
  IDs; income totals reuse the existing cadence calculation. Search, period and
  loaded reward batches remain route-local across tab changes and collapsing.
  Arrow/Home/End navigation, linked tab panels and 44px mobile targets are covered.
- Planner Rewards replaces the abbreviated two-column cards and separate campaign
  dropdown with Angular's single chronological reward/campaign list. Search,
  clear, period counts, initial official-news coverage, batched scrolling,
  source links, breakdowns, expected-result steppers and read-only history use
  shared Svelte controls. Desktop title/date/benefit ordering follows the source;
  mobile retains the dense rows and 44px interactive targets.
- Campaign choices now activate their eligible banners through the existing
  Timeline activation helper. Daily split, later-banner allocation and exclusion
  preserve target IDs and configured pulls; unresolved campaigns cannot mutate
  the plan. Result selection stores Angular's option ID, amounts and event-end
  availability, and uses the existing competition/currency helpers. Reward
  grouping now uses source claim windows, conditional amounts, labels, source
  priorities and cumulative results rather than raw variant counts.
- Six live-Angular comparisons cover populated default, historical, disabled,
  champion, open-third and not-counted states. Nine focused browser workflows
  cover campaign/result persistence, source breakdown focus, clear/search,
  history, an 85-row reward batch and 320px containment across desktop Chromium,
  mobile Chromium and mobile WebKit. The subsequent setup pass restores the
  missing tab semantics/details and active reward/income summaries; it does not
  approve all remaining Planner workflows.
- Planner projections now consume one date/ID-ordered ledger and clamp balances
  after each entry, matching Angular for signed custom income and deductions
  between pulls. Recurrence uses the source monthly anchor, explicit end date,
  weekday handling and occurrence ceilings. Competition entries use event ends
  or the earliest published variant date; speculative income uses monthly,
  pull-date and final checkpoints. Category-total accumulation and duplicated
  calendar parsers are removed; the existing reward/currency/competition helpers
  remain the owners of their calculations.
- Custom-income imports keep signed integer amounts and the default interval of
  one, reject missing/invalid calendar dates and retain intervals above 365.
  Storage and both share codecs preserve these values. Resource dates retain
  Angular's separate UTC parsing semantics rather than using user-input rules.
- Planner Balance now preserves Angular's Carats, Tickets, Uncap Crystals and
  Crystal shards groups, ordering and original crystal artwork. It uses the
  shared TextField with native dates, numeric inputs and decorative prefixes;
  there is no extra form library or persistence implementation. Empty start-date
  edits do not replace the saved date. Mobile keeps paired amounts and 44px
  inputs without page overflow.
- The shared HTTP entry point stops follow-up downloads after `pagehide` and
  resumes on `pageshow`, including back/forward-cache restores. Cancelled
  transports are not retried. This fixes a Safari navigation race where a late
  manifest started another request from the departing document; no browser
  errors were suppressed and the sharing assertions remain unchanged.
- Planner Income now uses Angular's five collapsed sections, 26 populated
  scenario groups, four radio presets, binary controls, select-all/mixed states,
  remembered selections, cadence labels, amounts, methodology help and source
  links. The shared SelectField supports two-line options and rank artwork;
  Checkbox now exposes its native mixed state and independent accessible label.
  No additional UI library or API/resource loader was introduced.
- Resource-backed groups share existing competition calculations. Strongest
  Team and Legend amounts are resolved per event, instead of accumulating rows
  from different events into one misleading option. Optional groups stay visible
  even if the currently loaded reward subset does not contain matching entries.
  Monthly shop choices include Friend Points + Clovers as in Angular.
- Unedited presets reconcile against current resource options and Angular's
  current limited-login/mission defaults; edited presets keep user choices.
  Retired Training Pass income is excluded from both display and calculations.
  Income source counts include selected assumptions and positive custom sources.
  Custom names preserve Angular's 100-character boundary; date edits save on
  input, including Safari, and added rows retain the default recurrence interval.
- Account synchronization waits for loaded resource metadata. Publishing local,
  imported or remote plans compacts known resource state synchronously before
  saving/queueing cloud updates. A browser run exposed the earlier race where
  legacy selections could be uploaded before the reactive cleanup ran.
- Planner assumptions preserve Angular's explicit `none` value through save,
  export and reload. Legacy seasonal choices migrate to individual holidays
  without overwriting individual selections. Manual controls and income presets
  share one selection function, including clearing only the affected competition
  overrides; the importer retains Angular's string-record size limits.
- Duplicated plans now receive fresh created/updated timestamps and independent
  custom-income IDs as well as target IDs. The existing clone flow remains.
- Timeline and Planner share one demand-loaded collection/save owner. A failed browser save
  keeps edits usable, shows a shared error banner with Retry/Discord, and prevents
  a false saved status. Export still contains the unsaved edits, and the warning
  survives switching between Timeline and Planner until a save succeeds.
- Planner shared-link persistence now follows Angular: an existing imported copy
  is selected without replacing its edits; new copies receive fresh timestamps,
  collision-safe names and retained target identities. Both compact and server
  shares use the same domain importer. Fragment/query updates use the existing
  router, raw numeric share IDs retain leading zeroes, and late imports cannot
  write after the planner unmounts or a newer link replaces the pending request.
- Planner resource-state compaction now removes derived defaults across all
  plans only after complete resources are available. Manual income/reward
  exceptions, scenario selections, disabled known/imported-target events and
  timestamps survive; selector defaults are restored locally. The same
  normalization runs after imports and remote collection updates, through the
  existing persistence/cloud flow. Golden checks verify idempotence, unchanged
  non-zero reward projections and no mutation of the source collection.
- Explicit `banner=` links now add their target even when a selector reward
  already marks the event active, matching Angular's requested-event action.
  Event IDs reuse the shared normalized lookup, and refresh does not replay an
  already-handled request. Browser expectations now distinguish automatic
  selector defaults from user-added targets and whole-event disables from
  redundant per-reward disables; no fixture controls were removed.
- Home: live statistics API, matching counter labels and responsive arrangement.
- Database: factor encoding, main/parent contributions, occurrences, inherited
  spark odds, full 72-slot race calendar and race artwork paths.
- Database, Lineage and Profile: shared factor/odds calculations and unique G1
  race-group affinity; Profile now renders the same inheritance card as Database.
- Clubs: information/progression layout, member display configuration, chart
  and calendar modes, month navigation, refresh countdown, CSV/JSON/XLSX exports,
  rank artwork and fan-gain calculations.
- Timeline/Carat Planner: explicit reward expiry windows, event-window fallback
  and current global-gift estimation contract.
- Statistics: older uncompressed/ID-format resources and distance files,
  empty-scope filtering, deck-slot support totals, six class controls,
  image-backed support/skill lists, deck icons and doughnut totals.
- Profile: removed duplicate inheritance presentation and false-success error
  handling; compact aptitude rows retain four distance/style columns. Team
  Stadium and Veterans share Angular's six-cell icon stats, and the mobile fan
  history includes the Circle column without a horizontal scroll.
- Tierlist: numeric power axis, card overlays, limit-break badges and underlined
  type tabs, complete hover/tap limit-break detail, progression chart and stats.
  Shared tabs now support arrow/Home/End navigation and roving keyboard focus.
- Catalog: character/skill/factor loaders reuse existing catalog loaders.
  Scenario selectors and result cards share the original scenario assets.

## Expanded desktop and mobile audit

- Planner pickup goals now reuse the already-loaded Timeline catalog and the
  shared projection: rate-up artwork, a multi-select popover, copy steppers,
  remembered removed-goal counts, individual crystal-adjusted odds, joint chance,
  shared exchanges, full-pool bars and the compact mobile odds disclosure.
  The old abbreviated checkbox/number list and duplicate goal calculation are
  removed. The pool chart uses the top-rarity pool as its denominator, not all
  draws; source colors, inline metrics and flat section layout were restored.
- Projection no longer invents a 0.75% rate when protected rates are absent or
  substitutes the first goal's chance for an inexact multi-goal calculation.
  Missing goals remain editable, and tagged standard-rate inference remains in
  the existing resource resolver. Zero spark thresholds mean no exchanges.
  Per-goal Rainbow/Gold Crystal usage comes from the same balance calculation.
- Reward-Carat contributions are cumulative through each target's pull date,
  including explicit competitive rewards but excluding income rules, starting
  balances and tickets. Same-fixture Angular/Svelte goal captures agree on the
  2,160 reward Carats, 100.0%/77.8% individual chances and 70.4% joint chance.
- Pickup persistence retains Angular's first-20-entry bound, deduplication,
  first-goal legacy fields and explicit empty selections. Svelte's old 12-goal
  truncation is removed. Boundary, missing-rate, crystal, exactness and cumulative
  reward logic have regression checks in the existing domain test files.
- The first goal workflow exposed Safari's failure to return focus after native
  popover Escape dismissal. The shared popover now handles Escape with its
  existing close/focus path, while outside-click dismissal remains native.
  The initial focus-on-open attempt did not fix Safari and was replaced, not
  counted as a passing fix. Picker dimensions can use inherited CSS variables;
  other existing popovers retain their defaults.
- Planner now reconciles saved targets against current timeline/gacha resources,
  including normalized legacy event IDs and disabled targets. Resource metadata
  updates leave pulls, custom dates, pickup goals, ticket/payment choices and
  timestamps untouched. Shared storage/export serialization omits resource-owned
  start/end dates as Angular does; reload derives them again from resources.
- Imported/cloud targets absent from the visible timeline load protected shards
  by gacha ID, with saved pickup goals supplied to the existing rate resolver.
  Active-plan/resource request guards prevent late responses from replacing the
  current data; Retry refreshes the original pipeline. Resolved per-event rates
  no longer pollute its raw cache, and an event-ID cache hit cannot substitute a
  different explicitly requested gacha ID. The reused-ID regression was reproduced
  before the fix; all nine new resource/import browser checks pass afterward.
  New plans receive resource defaults even when created after the initial load.
- JSON import now reports invalid JSON, invalid shape, empty plans and oversized
  files without changing saved data. IDs survive unless they collide; names are
  disambiguated within 80 characters. Angular-shaped single-plan exports preserve
  user choices and round-trip through import/reload without resource dates.
- A repeated mobile controls run exposed fixed-navigation interception during
  animated page scrolling. Root scroll padding now reserves the actual shell
  clearance, global smooth scrolling is removed, and hover movement is limited
  to fine pointers. Native touch and keyboard actions keep their assertions.
  Instant scrolling then exposed a combobox mouseenter event resetting keyboard
  selection beneath a stationary pointer; only actual mouse movement now changes
  the active option. Eighteen repeated desktop/mobile control checks pass with
  these fixes; the final production run below is separate evidence.
- Planner banner search now uses the shared combobox with Angular's normalized
  multi-token matching, participant/type/rerun aliases, exact-match ranking and
  upcoming/past ordering. The list renders in batches of 40 without discarding
  later results; disabled Added rows, arrow/Enter navigation, retained Escape
  queries and Clear are covered in desktop Chrome and both mobile engines.
  Clear exposed a real shared-control bug: removing the clicked clear button
  made the window listener mistake the same event for an outside click. The
  listener now checks the event's original composed path.
- Planner restores global timing/paid controls, mixed values, disabled-target
  preservation, resolved-date ordering, anniversary separators and past-target
  notes. Invalid custom/end dates now fall back to banner start as Angular does,
  rather than silently moving the target to the projection start.
- Pull rows restore Angular's compact title/controls/funding hierarchy, desktop
  +100/+10/input/-10/-100 controls, a 44px mobile number input, Target options
  through the shared popover/select/checkbox components, and bounded Rainbow/
  Gold Uncap Crystal controls. Past rows no longer display misleading zero-funded
  odds summaries. Item artwork uses the existing catalog; at-pull balances are
  immutable snapshots from the calculation, not a second UI calculation. Row
  odds and ticket displays now share the calculation's event/gacha-ID lookup.
- The first rapid WebKit mouse-click run stopped at 19/20 crystal increments;
  its trace shows animated scrolling and fixed-navigation interception on the
  missed click. Mobile workflows now use actual touch taps and assert every
  resulting increment, without extra retries or arbitrary sleeps. Desktop
  controls, lower/upper limits, custom date, ticket limit, paid setting, reload,
  loaded artwork and 320px containment are checked in the same workflow.
- Same-fixture pull-plan captures now cover populated Angular/Svelte rows at
  1536px and 390px, including anniversaries, mixed timing and two past targets.
  Both implementations have zero broken images and no page-level overflow in
  these states. This is targeted evidence, not full Planner approval. Refreshed
  captures preceded the goal-workspace and reward-contribution port above.
  Angular's local icon font also remains unavailable, and
  its mobile sticky tabs overlap the top of the captured pull-plan region; do
  not treat those source capture artifacts as a Svelte design requirement.
- The first full production run for these controls passed 269/270 and exposed
  lost return focus after quickly reopening a Tierlist dialog with Enter and
  closing it with Escape in mobile WebKit. The shared native-dialog wrapper now
  records the active opener on each open and explicitly restores connected
  openers without scrolling on close; native modal focus trapping remains.
  Ten repeated WebKit Tierlist workflows pass after the fix. The focus assertion
  was not removed or relaxed, and the final full run is recorded below.
- Timeline and Planner now share Angular-compatible event activation. Turning a
  banner off (including Planner Remove) retains its target ID, configured pulls,
  pickup goals, ticket/paid settings and optional banner metadata. Disabled
  targets stay out of the pull plan and projection but can be re-added in search.
  Re-enabling clears applicable reward/automatic-variant overrides without
  changing unrelated events or placement choices. Reward inference uses the
  existing shared summaries; delayed resources are guarded by event operation
  and active plan, and use the existing cache rather than a second loader.
- The previous Timeline test incorrectly expected off to delete stored targets;
  its expectation now follows live Angular persistence. New browser workflows
  exercise configured remove/reload/re-add in both directions, inferred rewards,
  and late reward loading with subsequent removal or plan switching. Golden
  checks cover retained settings/metadata and scoped reward overrides.
- Planner search also excludes paid-only banners, matching Angular's supported
  target kinds. The populated resource-inference workflow verifies that excluded
  entries do not appear and that removing a reward-bearing target clears its
  enabled event selection without deleting the configured target.
- Source reachability review found no current Angular template callers for
  `openPredictionDetails` on desktop or mobile. Both templates open event details
  instead; the old `TimelinePredictionDialogComponent` is referenced only inside
  those unused methods. Do not add a second Svelte dialog solely to copy this
  old source. Keep Angular intact until final cutover and confirm any newly found
  reachable prediction-only flow before treating it as a migration requirement.
- Timeline event cards now open the actual detail workflow through the shared
  Svelte dialog: character/support pickups, published banner rates, fixed and
  variable reward summaries, race facts, article/source links, date prediction
  factors and alternative scores, and persistent Add/Remove planner actions.
  Resource failures retain the selected event and expose Retry/Discord. Banner
  shards remain demand-loaded; late responses cannot replace another open event.
- The live Angular prediction and reward calculations are extracted as pure
  functions. Four prediction-model outputs have recorded Angular golden values;
  race-description parsing, reward ranges and managed free-pull deduplication are
  covered too. Timeline and Carat Planner share fallback reward calculation and
  the existing protected-resource caches. Artwork uses the existing language
  manifests, character/support helpers and source item images, not copied fixtures.
- HTML descriptions use a shared allowlist sanitizer and safe URL normalization.
  Shared native dialogs close before their parent can unmount them, preserving
  focus restoration; event-card openers explicitly receive focus on Safari.
  Footer/close controls retain 44px touch targets, and native dialog max-width no
  longer overrides the requested mobile gutters. Prediction metrics retain the
  Angular inline label/value grouping instead of stacking every label. Timeline
  details use Angular's 82dvh desktop / 88dvh mobile height limits; other dialogs
  retain their existing limits.
- Populated 320px route checks exposed a shared ranking-row container-query bug:
  the row queried its own container, so its desktop grid minimums still widened
  the page to 484px. The container now wraps the row, retaining the intended
  responsive grid and all four statistics at 320px. The corrected rendering was
  inspected in `.tmp/rankings-fixed-320.png`; no page-level clipping was added.
- Route-only navigation checks now reuse the populated community, activity,
  database and Timeline fixtures, with explicit unavailable responses for other
  backend endpoints. They wait for their finite mocked requests before the next
  full-document navigation: WebKit otherwise surfaced unload-aborted fetches as
  access-control errors. The uncaught-error assertion was not filtered or removed.
  Geometry checks explicitly await populated rows, not just the page wrapper.
  All 12 settled route/redirect/320px checks pass across the three browser projects.
- UQL target/owned-legacy directives now resolve through the existing catalog,
  profile repository and shared parent picker. UUIDs remain strings; account/member
  references, full costume target IDs, last-directive precedence and legacy race context
  survive restoration without issuing an intermediate unfiltered request. Removing
  directives clears their applied affinity context. Failed lookups retain the query
  and offer Retry/Discord in the result body; stale responses cannot reapply a removed
  legacy. Multiple historical UUIDs for one account/member remain distinct.
- Cancelled legacy pickers reopen through the actual CodeMirror completion action,
  including an unchanged `[]` placeholder. Bracketed completions replace the entire
  value, including nested costume brackets. Identical validation updates avoid
  unnecessary editor redraws. UQL shows the
  Angular Active/Editing summary chip instead of inert structured filter chips.
  Parsing, requests, cancellation, retry, reload and clearing have desktop/mobile
  checks. Manual/bookmark/partner reload identity remains a separate acceptance gap;
  a bare character name is not sufficient evidence of a unique restored selection.
- Side-by-side restored-query requests exposed a base-ID/full-costume-ID mismatch;
  Svelte now sends Angular's full target ID while normalizing only local comparisons.
  The missing legacy portrait reused an obsolete asset path; it now uses the existing
  character-image catalog helper. Query editor tests use the browser platform's
  keyboard select-all rather than native contenteditable `fill()`, which can race
  CodeMirror's DOM observer. iPhone emulation uses Command, not the Windows host's
  Control key. Assertions still verify the full outgoing predicate and context.
- Timeline Safari click loss was traced to a moving viewport between pointer-down
  on Plan and pointer-up on the card backdrop. Search/Today jumps are immediate
  on coarse pointers and for reduced-motion users; desktop keeps smooth scrolling.
  The shared event card's Plan action has a 44px coarse-pointer target. The workflow
  checks immediate add/remove actions and the persisted target list without sleeps.
  All 15 repeated runs passed across the three browser projects; the rebuilt mobile
  Added state was visually checked in `.tmp/timeline-fixed-mobile.png`.
- The abbreviated UQL compiler is replaced by Angular's full expression-compilation
  chain, extracted without its component, HTTP or persistence dependencies.
  Thirty-two recorded live-Angular cases match exactly: mixed/scoped factor lists,
  absence/category comparisons, arithmetic, white-scoring parameters, character
  costumes, support-card names/limit breaks, scenarios and race saddle names.
  Validation and repository serialization reuse the same compiled result;
  invalid expressions cannot silently become unfiltered requests.
- Compiler/editor metadata now shares named/scoped factor aliases and quote
  handling. Character costumes and race aliases use the existing catalog pipeline;
  their extra name data is demand-loaded only when entering or restoring UQL.
  Restored queries wait for that data before searching. Failed name chunks show
  a result-body error with Reload/Discord actions; reload preserves the query.
  Native module failures remain cached in the browser, so in-place retry is not
  presented as recovery. Named-query, costume completion, scoring-guide insertion,
  persistence and failed-chunk recovery pass on all three browser projects.
- Two source defects are deliberately not copied: whitespace inside string
  literals remains data, and nested functions in literal-only value lists are
  rejected rather than sent to the backend. These exceptions were observed in
  the live Angular comparison, not hidden by changing its reference output.
  Angular also returns no character completion after `=`; list completion is
  covered, and comparison completion remains a known source/editor limitation.
- Database UQL now uses the live Angular CodeMirror editor contract, not the
  abbreviated insert-menu experiment. The reusable Svelte editor has a gutter,
  fixed `where` prefix, colored/atomic chips, cursor-aware completion, native
  undo/redo, clear/focus behavior and visible validation. The complete six-topic
  guide and its insertable recipes are ported. CodeMirror loads only after
  opening UQL; no Angular runtime or old textarea/overlay handlers are included.
  The extraction retains 103 of 212 Angular language-component members rather
  than carrying its obsolete event/UI implementations into Svelte.
- Compiler and completion share Angular's field aliases. Readable White count,
  Wins, Followers, category totals and scoped factor names resolve consistently.
  Validation rejects unknown bare identifiers, unfinished boolean/arithmetic
  operators, empty skill lists and nested functions in literal-only IN lists.
  The guide's examples are not evidence that every advanced expression compiles;
  remaining language work is listed below.
- The UQL guide was compared against the running Angular app at 390 and 1536px.
  Inline example chips no longer stack their images above names. Below 430px,
  the UQL body uses Angular's 85% density with compensated 44px touch targets;
  the approved page frame and new navigation remain unscaled. The line editor,
  completion popup, guide topics and clear action stay contained at 320/390px.
  Token decorations refresh on document/language changes, not on every binding
  notification; the redundant refresh interrupted replacement input on mobile.
  The corrected completion/editing/guide workflow passed 12 repeated runs across
  desktop Chromium, mobile Chromium and mobile WebKit before the final build.
- Database sharing: URLs and presets retain Angular's `p2c`, `p2w`, and `p2i`
  affinity context; silent preferences strip those fields while preserving the
  owned `vet` reference. Restored context is visible and removable. The request
  and bookmark filter both exclude the selected legacy's character, including
  other costumes. Null tree slots no longer produce a phantom character `0`.
- UQL simple factor comparisons now use Angular's encoded-level predicates,
  including Main/GP1/GP2/any-grandparent scopes, named factors and zero-star
  absence. They no longer incorrectly compile every comparison as `spark_sum`.
  Request-mode isolation prevents structured fields leaking into UQL searches,
  and the automatic Affinity sort applies when no explicit sort was selected.
  The current Angular app's emitted requests are captured alongside Svelte's;
  this remains narrower evidence than full UQL language/editor parity.
- Shared native dialogs now size to their content instead of stretching an
  invisible box to their maximum height. Visible panels are vertically centered;
  explicitly fixed-height pickers and bottom sheets keep their existing modes.
  The browser check measures the visible panel, not only the outer dialog.
- Safari regression: filter groups now reserve their full height when opened,
  so their interactive controls cannot overlap the following panel during a
  height transition. Shared combobox/select options retain input focus on
  mouse activation, including Safari's synthesized touch mouse events.
- Optimal Races: recommendations claim one available training turn at a time,
  matching Angular's priority order and next-year fallback. The dialog uses
  the 1320px desktop frame and centered dense mobile list with dates, artwork,
  P1/P2 labels and +3/+6 gains; empty years are omitted on mobile. Dialog titles
  are unique per result. Browser coverage includes all six result actions at
  320px, calendar collisions, closing, focus restoration and a second record.
- Shared selects and comboboxes retain keyboard focus after a choice, scroll the
  active option into view, and close on Tab without retaining an uncommitted
  search. Factor changes no longer destroy the focused input. AND/OR uses the
  shared, keyboard-accessible segmented control; mobile menus are not clipped.
- Collapsed Database filter bodies are inert. Database factor controls retain 44px touch targets,
  while the read-only inheritance summary stays in one aligned strip at 320/390px.
- Database ignores cancelled searches and merges overlapping infinite-scroll
  pages by record ID, avoiding duplicate-key crashes. Preset round-trips verify
  star ranges, factor groups, query encoding, and existing storage keys.
  Infinite loading now retains existing cards and their open dialogs; a failed
  next page shows retry/report actions below those cards instead of replacing
  them or skipping the failed page. Coverage uses a full 12-record first page.
- Veterans and Lineage now enable selection on the shared race calendar and
  reflect/clear selected races. Calendar dialog title IDs are instance-unique.
- Statistics character charts respond to scenario, distance and class filters;
  class legends, common support cards, 50-row deck lists and Angular's selected-
  scope mean calculation are restored. Older in-flight dataset responses cannot
  replace the selected dataset. Failed chart chunks show a reload/report action.
- The shared repository cache does not let older reads overwrite a refresh or
  repopulate invalidated entries. Pending refreshes remain deduplicated.
- Tools uses the same live site-statistics repository and presentation as Home,
  replacing placeholder counts. Both hero grids fit the tablet content column.
  Login uses the approved normal page frame without changing its provider card.
- Result cards restore inspectable main/legacy affinity breakdowns, explicit P2
  race bonuses, P2 grandparent-only contributions, and Basic/Advanced factor
  highlights. White-section collapse state and display controls stay synchronized
  across Database/bookmark results. Focused/split views hide inapplicable controls.
- Shared inspection popovers use native dismissal, stay within the viewport,
  and retain keyboard/touch support. Result actions, spark modes and white-section
  headers keep 44px touch targets without inflating read-only spark labels.
  Main/P2 contribution counts now live inside the shared spark chip, and mobile
  source badges align on one baseline.
- Database restores Angular's header arrangement, full-width mobile submission
  action, selected-tab treatment and compact verified/timestamp footer. Tabs
  reuse the shared keyboard implementation, including icons, rather than
  duplicating tab behavior. Wrapped sort controls start their own row, and focus
  buttons no longer overflow their enclosing segmented control. Desktop focus
  and toggle controls share the same bottom alignment.
- UQL preserves quoted literals during alias compilation and does not treat a
  quoted `followers` value as a request to include capped accounts. Common,
  scenario and race white-star aliases compile before the shorter white-star
  alias; quoted empty-list text is not rejected as an incomplete predicate.
  Regression cases cover compilation and the outgoing search request.
- Result cards and Tierlist share the framed support-card image path. Database
  and Profile prefer that Angular artwork but retain the existing full-card
  fallback when the thumbnail is missing. Artwork resets its error state when
  its source changes. The local catalogs still lack 55 framed thumbnails;
  46 have full-card artwork and 9 lack both. This is not complete asset parity.
- Dialog backdrop dismissal requires a press that began on the backdrop, so
  releasing an in-panel interaction outside does not accidentally close it.
  Race History uses instance-unique title IDs, touch-sized view controls and
  handled loading failures; stale closed-dialog loads cannot overwrite a reopen.
- Database/Profile surface affinity resource failures with retry/report actions;
  stored scores remain usable without pretending a local calculation succeeded.
- Database report keeps Angular's native confirmation and refreshes server-owned
  results after success instead of deleting a row locally. Cancellation and HTTP
  failure leave the results intact; failure no longer claims a report succeeded.
  Mobile record actions retain visible Plan/Share/Races/Report/Save labels, and
  the trainer ID uses the copy icon and Angular's three-digit grouping.
- Borrow copies retain Angular's optimistic update, backend reconciliation and
  snapshot-scoped 30-second session cooldown. Duplicate clicks, denied copies
  and failed requests no longer inflate counters. Golden and browser cases cover
  acceptance, rejection, failure, unchanged clipboard contents and share links.
- Clipboard writes now use one platform helper across Database, Profile, Clubs,
  Settings, both planners and the footer. Fallback copying cleans up its temporary
  field and restores keyboard focus. Settings handles both clipboard APIs failing
  without losing a newly created key; verification/API-key copy controls have
  44px touch targets. Error toasts reuse the Discord button and touch-sized dismiss.
- A call-site/template audit found no voting controls in the current Angular
  Database: only unused controller aliases remain. The uncalled Svelte vote
  adapter was removed; no new voting UI was introduced. Angular cleanup remains
  deferred until route approval.
- Browser coverage now includes desktop Chromium, Android-sized Chromium and
  iPhone-sized WebKit, uncaught-error checks, provider failure/retry and callback
  token handling, and shell/ad geometry at every agreed width.

These are regression checks, not proof that every Angular interaction has been
ported. Real OAuth providers are not contacted by the mocked authentication tests.

## Remaining acceptance work

The Lineage character picker now uses the released catalog and dedicated shared
600px dialog, without the custom editor tabs or 24-item cap. Slot exclusions are
derived from the existing tree topology and tested against all 15 Angular slots;
both character and Veteran selections validate them across outfits. Trial scores
reuse the tree affinity calculation with the old slot's wins cleared. Choosing a
character clears its old sparks, wins and Veteran/succession references while
preserving descendants and storage/share contracts. Inline node spark editing
restores Angular's default three stars, type/level ordering, removal, and per-run
toggle. Empty nodes open Veterans directly. Historical catalog entries remain
available for displaying imported trees.

Lineage and the manual parent editor now reuse `RaceWinPickerDialog.svelte`.
Race edits are drafts until Confirm; Escape cancels instead of saving. Imported
Veteran/succession wins use the existing read-only `RaceResultsDialog.svelte`.
The previous race workflow asserted the incorrect save-on-Escape behavior; its
replacement tests cancellation, confirmation, reload and removal explicitly.

`.tmp/lineage-picker-comparison.json` compares current Angular and Svelte at
390/1536 in both themes. Released variants, ordering, slot scores, label fonts,
platform fonts and colors match in these populated states. The comparison also
exposed Material content's inherited 0.5px label spacing and a short-list panel
stretched to 720px. Shared character controls now preserve that spacing and
shrink the visible panel within the original 80vh frame. Mobile source panels
are 231.6px versus Svelte's 235.6px with its required 44px touch controls; this
is not a claim of pixel-identical complete page layout.

The final production captures wait for every portrait to load before comparing
the panel (`.tmp/capture-lineage-production.log`). A separate unmocked resource
check against Angular on 4200 and Svelte on 4175 matched all 85 allowed variants,
names, scores and descending affinity order for the populated P1 slot, with no
runtime errors (`.tmp/real-lineage-picker.log`, `.tmp/real-lineage-picker.json`).

Remaining Lineage work includes whole-tree desktop/mobile visual approval and
the shared tour workflow. Node composition and odds are now implemented below;
passing their focused checks does not certify the whole route.
Source pointers: `lineage-planner.component.html:530`, `:550`, `:377`.
Do not mark this route approved based on picker/manager-specific checks.

The named-tree manager now follows `tree-saves-dialog.component.ts`: “Lineage
Trees”, three ordered sections, Enter-to-save, the 60-character input limit,
click-to-load rows, and four share/import actions. Overwrite/delete require
confirmation; Cancel/Escape return to the list. Successful deletion refreshes
the list. Failed storage reads or writes cannot replace existing saves or
report success; retry retains the entered name. Import failures preserve the
current tree. Invalid positions, duplicate positions or invalid character IDs
are rejected as a whole instead of silently importing an empty/partial tree.
Angular's bare-array and versioned-envelope transfers remain accepted.
`tests/e2e/lineage-saves.spec.ts` covers these real controls, reload, downloaded
JSON contents, clipboard denial, unreadable files, malformed JSON, and empty
trees on all three browser profiles. Save, folder and clipboard icons extend
the existing SVG icon set; no dependency or replacement storage key was added.

The missing Optimal Races header action now reuses the existing race catalog,
recommendations and `OptimalRacesDialog`. It responds to one or both parents'
wins and clears when neither has wins. The prior note about a missing overlap
button was incorrect: repository search finds no caller of Angular's
`openOverlapDialog` outside its declaration, and `getOverlappingSaddleIds` is
only called there. Do not invent a new button for that unreachable method.

Legacy `cards` URLs now follow Angular's five-slot minimum and retain invalid
entries' positions instead of shifting later IDs. Underspecified input leaves
the existing browser save untouched. Invalid `tree` URL state reports an error
before trying the compatible fallback. Browser workflows cover both cases.

The odds comparison exposed missing Type/Base/source columns and incorrect
grouping and creation calculations. `LineageSparkOdds` now restores those
columns and source ordering, groups Combined by spark name and sorts by expected
procs using `sparkMetrics`. Each source retains its own stars and affinity.
`plannerSkillSparks` counts only type-3 factors on parents/grandparents, grouping
by factor ID and calculating `20/25/40 * 1.1 ** count` rounded to two decimals.
The source's current desktop Base Odds CSS hides the separate color/header
rows: its visible header contains base chance, star level and grouped type
labels. Svelte now uses that compact header and the transposed mobile table,
and only exposes odds once an affinity result is loaded.

The target “Potential Inheritance” popover now reuses `plannerSkillSparks` and
the same feature-local skill creation table as the odds tab. It uses the shared
native `InspectPopover` for viewport placement, Escape, outside dismissal and
focus return. Skill icons stay demand-loaded when either view opens.
Node cards restore separate Change/Veteran/Clear actions, the target total
composition, and base/race spark-affinity breakdowns, including loaded zeroes.
`plannerAffinityBreakdown` also drives existing picker/spark calculations;
`plannerAffinityFlows` keeps the shared term counted once in the target sum.
The “Spark direct” connector previously displayed the whole branch total;
it now shows the target-parent pair plus the shared race term, as Angular does.

Desktop tree rows now use subgrid so unequal spark counts cannot shift sibling
nodes or their descendant connectors. Tree and odds scale together; mobile
switches to connected, collapsible branches at Angular's 768px breakpoint.
AppPage no longer adds a second mobile body gutter inside PageFrame's 4px
gutter. Compact spark chips wrap rather than becoming full-width rows. Mobile
Change/Veteran/Clear, race and spark actions retain 44px targets, so their
vertical density intentionally differs from Angular's tiny action controls.

`.tmp/lineage-composition-capture.json` compares populated Angular/Svelte nodes
at 390/1536px in both themes, including the target and inheritance popover.
Parent name fonts are 14px/21px desktop and 13.6px/20.4px mobile in both apps;
card backgrounds match in both themes. Both sets have no page overflow or
uncaught exceptions. Rendered desktop card sizes differ with the approved
ad-aware frame width and its fit scale; these are not pixel-diff approvals.
The source's icon-font failure and transient hover tooltip also affect its
reference popup capture. The popup now uses compact source columns, smaller
icons, colored tier headings and a capped scroll region; the full odds tab
retains its roomier rows through the same component. Remaining visual work
includes mobile branch badges and the extra enclosing tree border/surface
(Angular's planner scroll area is unframed). See source HTML:530, :550, :610 and
SCSS:624; do not treat those remaining differences as approved.

The earlier production artifact was compared with Angular using identical
populated node/spark fixtures (`.tmp/lineage-odds-gaps.json`). Two copies of
Corner Recovery produce **24.2% / 30.25% / 48.4%** Learned/Upgraded/Gold in
Angular's Skill Sparks view. The earlier Svelte artifact incorrectly repeated
two **6.24%** inheritance rows and a **3.12%** scenario row. The candidate now
has the correct creation row, Combined's **99.59% / 1.87x** Speed result, and
sorted Per Source columns. `tests/e2e/lineage-odds.spec.ts` exercises every tab,
per-run toggling, same-name/different-ID grouping, source removal and the empty
state on desktop and both mobile engines. The pure calculation has a golden
check for parent/grandparent eligibility, copy counts and separate factor IDs.

The manager's menus/share controls/crystal summary, deferred plan-name saving,
reference/legacy share contracts and cloud revert/expiry workflows are covered.
Remaining Planner checks include complete event/resource variants. The WebKit
navigation resource error was traced to starting a request between beforeunload
and pagehide; the shared HTTP client now guards that interval and a 50-navigation
probe had zero errors (previously seven). No complete
Planner approval is implied.

The shell Help control now loads the actual page-tour controller described in
the verification history above; the shared callout is presentation only. The
Timeline today-marker/virtual-anchor gap was subsequently resolved in the
date-lane/feed pass; see its populated tests above.
Source domain-migration prompts are explicitly disabled, the milestone expired
on 2026-04-14, and the Christmas theme has a hard false flag; do not recreate
those inactive prompts as always-visible Svelte features.

The static pass has replaced the `/wip` substitute and corrected Privacy's
in-page navigation and text/spacing. All eleven policy sections match normalized
source text. Source WIP has an undefined gradient token that hides its heading
locally; Svelte uses the existing brand gradient so Coming Soon remains visible.
Source Material icon fonts are unavailable locally, so their broken ligature
rendering is not a visual reference. Neither route has final visual approval.

| Area | Still required before approval |
| --- | --- |
| Database | Side-by-side populated Basic/Advanced/UQL, every picker and preset state; remaining P2 presentation, complete UQL editor/language/highlights beyond the covered scoped comparisons, character and support-card expressions, report/bookmark interactions and remaining borrow-view/refresh races. Finish result/control density comparisons with the approved frame widths and 44px touch targets. |
| Clubs | Full export workbook content/format comparison, incomplete and prior-club histories, chart gaps and membership transitions. |
| Timeline/Planner | Event details, target retention, scoped rewards, ranked/batched search, bulk/row controls, resource-driven schedules, guarded rate loading, JSON import/export and the detailed goal workspace are implemented. Resource-state compaction and shared-link reopening preserve manual choices; delayed imports are guarded. Disabled assumptions, seasonal migration, independent duplicated income rows and save-failure export/retry now have focused checks. Income now has the source section hierarchy, binary/select-all controls, presets and source/help labels. The ordered signed-income ledger and strict custom-income/date imports now match the source, and Balance restores resource groups/artwork. The reward list now restores campaign activation, results, source breakdowns and dense rows. Setup tabs now restore descriptions, aggregate reward/income summaries and retained reward view state. Remaining: other import boundaries and complete calculation review; complete lane/event variants, cloud conflicts, unavailable storage on initial load/global preference writes, and expiry workflows. The legacy standalone prediction dialog has no current template callers; avoid recreating unreachable UI. |
| Statistics | Side-by-side character-detail presentation, every dataset version and filter combination, and remaining missing-resource cases beyond the covered older/v4 fixtures and switching races. |
| Profile/Veterans | Roster grid/table/inheritance modes, import tutorial and dialog parity; remaining detail layouts; populated owner/non-owner/private states. |
| Activity/Rankings/Tierlist/Lineage | Remaining populated visual differences, popovers/dialogs, filters, edge calculations and mobile interactions. |
| Shell/Static/Auth/Settings | Remaining populated visual states beyond the covered normal/wide geometry, feature-specific keyboard/focus/touch targets, lazy-route import failure recovery, real provider callbacks, consent/ads and remaining error/persistence states. |
| Cleanup/Cutover | Prove obsolete callers unreachable, then remove Angular/experimental code and unused dependencies. Do not remove Angular or switch production before route approval. |

The abbreviated local-workspace picker has been replaced with a shared
`features/parent-picker/ParentPickerDialog.svelte` used by Database and Lineage.
It has linked-account Veterans (verified accounts only), bookmarks, streamed or
cached partner lookup, and manual parent entries. The implementation reuses
auth/profile/inheritance repositories, factor controls, character and race
pickers, and the existing planner affinity calculation. Only the partner domain
needed a new repository; streaming uses the existing HTTP middleware pipeline.
Manual entries retain `vpd_manual_entries`; failed saves leave the draft and
original storage intact. Scoped picker state stays in memory. Owned selections
restore via `vet: [accountId, memberId]`, with verified-account ownership checked
before loading. No new workspace IDs or `svelte-*` persistence keys were added.

Populated browser cases cover account switching, Own/P1/P2 factors, bookmarking
as a parent, Database-to-Lineage transfer and reload, Lineage picker session
restoration, anonymous partner failure/retry/cached lookup, manual CRUD,
best-fit candidates, race wins and quota failures. Golden tests cover encoded
factors, immediate-ancestor scope, manual star sorting, grouped race affinity,
stream framing/failure and unchanged authenticated HTTP behavior.

This is **not final picker approval**. Compare the row's compact lineage, manual
tree density/labels and every source/sort combination against current Angular.
Finish manual/bookmark/partner UQL reload identity, large-roster
virtualization, released-character eligibility, real partner streams and saved
history migration/deletion failure cases. In particular, matching a visible
scope selector is not enough: the shared picker now actually applies that scope
to manual/bookmark/partner sources too, where Angular's older handlers ignored it.
Manual-entry malformed storage is retained rather than overwritten as empty.
Lineage now saves an imported one-shot transfer immediately, and never adds an
inheritance summary's ancestor sparks to the selected node's own sparks.

UQL remains an explicit migration priority: remaining expression/validation edge cases, scoped result
highlighting, mode-state conversion, and complete editor/language acceptance are
not yet approved. Arithmetic/scoring and named character/support/race expression
compilation now use the Angular chain and recorded source cases above.
Production Database now uses the ported CodeMirror editor; the older
generic query editor remains only in the development UI Lab/Hakuraku examples.
Do not use the covered scoped-factor cases as evidence for those missing flows.
The current Angular editor is `database-filter/uql-filter/uql-filter.component`
with `uql-code-editor.component`, not the older textarea/overlay implementation
still present in that component's source. Its rendered UI includes the UQL/SQL
heading, validation status, six-topic guide with insertable recipes, line gutter,
fixed `where` prefix, clear action and cursor-aware CodeMirror completion.
The live editor UI, expression compiler and target/owned-legacy directive flow are
ported; remaining acceptance work is still necessary before route approval.
Continue with mode-state conversion, scoped result highlighting and source-specific
legacy restoration, then the other page-body/detail workflows listed above.
The expression extraction preserves Angular's array/scoring/arithmetic ordering
and replaces its eager globals with demand-loaded catalog inputs. Costume names
now use the existing `character_names.json` catalog. Directive resolution reuses
the shared parent picker and preserves UUID/account/member references; it does not
add a second picker or a new service layer.

Backend verification remains blocked locally: Docker Desktop's Linux engine did
not start. A fresh hidden startup on September 5 failed again while initializing
its Inference manager: the backend cannot remove/access the `dockerInference`
socket. The container-list check did not respond and was interrupted; Desktop's
own log reports startup failure. No containers, volumes, database data or Docker
configuration were reset. Do not repeat startup indefinitely or use factory
reset to make a frontend test pass. Mocked
workflows do not substitute for the requested real-data pass.
The post-Income-port unsandboxed `docker ps` check still reports a missing
`dockerDesktopLinuxEngine` pipe. Angular (4200), Svelte dev (4173), and the
rebuilt production preview (4175) all return HTTP 200.

## Latest verification

- Static-page build: **0 Svelte errors/0 warnings, 56 files/194 logic checks**
  (`.tmp/foundation-parity-build.log`), unchanged shell budgets of 39.1 KiB JS /
  8.4 KiB CSS gzip. Manifest SHA-256:
  `81beff72e4f22fd9c9bded07f95ec697919a1d342d033923ba5cebf1ef8069a2`.
  All 1,383 entries remain free of Angular/React/Bootstrap/Hakuraku/UI-Lab.
- WIP/Privacy workflow checks: **18/18 repeated development cases passed**
  (`.tmp/foundation-parity-dev-verified`), covering keyboard return home, all
  nine jump controls, unchanged URLs, section order, top/contact actions, all
  three regional privacy APIs and unavailable controls. An initial immediate
  resize assertion measured 328px at a 320px viewport; fresh loads and repeated
  resize probes stayed contained. Geometry assertions now await the same
  strict viewport-width invariant rather than sampling mid-resize.
- Source/Svelte static captures at 1536/390px show the restored WIP composition
  and matching Privacy contact spacing (`.tmp/static-parity-updated-capture.log`
  and `.tmp/angular-comparison`). Mobile jump controls deliberately retain 44px
  targets. All eleven normalized policy sections and nine destinations match.
- Rebuilt production regression: **21/21 passed**, no retries, 1.2 minutes
  (`.tmp/foundation-parity-production.log`). WIP, Privacy, Home/Tools, every
  retained route, redirects and 320px containment pass across all three browser
  profiles. The static build manifest remained unchanged throughout this run.
  All route statuses remain provisional; real-backend verification is still
  outstanding and production replacement remains disabled.

### Planner manager verification

- Manager build: **0 Svelte errors/0 warnings, 56 files/194 logic checks**
  (`.tmp/planner-manager-build.log`); shell 39.1 KiB JS / 8.4 KiB CSS gzip.
  Its 1,383-entry production manifest has SHA-256
  `eab5ea4d3627ee90555fdacb91a5afd76820243e1f5793a2f967406a07157a65`,
  with no Angular/React/Bootstrap/Hakuraku/UI-Lab entries.
- Eighteen focused manager, persistence and Club export workflows pass across
  all three browser profiles (`.tmp/planner-manager-final-focused`). Initial
  failures exposed delayed popover focus and CSS-specificity overriding mobile
  row heights; both were fixed in shared Menu. Sync assertions now target its
  accessible status because Angular hides the text on mobile; all persistence
  assertions remain. New checks also cover cancelled/confirmed deletion,
  clipboard denial/recovery, new-window sharing, crystal updates, and stat order.
- `capture-angular-parity.mjs --planner-manager` captures the populated
  workbench and both menus at 1536/390px. Inspected captures report no page
  overflow, broken images or uncaught errors (`.tmp/angular-comparison`).
  Source Material icon fonts remain unavailable locally; Svelte uses shared SVG
  icons. The updated menu now fills its trigger width and its touch rows are 44px.
- Full production manager regression: **339/339 passed**, 113 each on desktop
  Chromium, mobile Chromium and mobile WebKit, no retries, 8.4 minutes
  (`.tmp/production-planner-manager.log`). Its manifest remained unchanged
  throughout. This run predates the subsequent WIP/Privacy corrections. The
  previously observed WebKit unload/resource error remains unresolved: a clean
  run is not proof that its intermittent cause has been removed.

### Previous verification (before Planner manager parity)

- The setup build passes **0 Svelte errors/0 warnings and 56 files/194 logic
  checks** (`.tmp/planner-setup-build.log`). Shell budgets remain 39.1 KiB JS /
  8.4 KiB CSS gzip. Its 1,383-entry manifest has SHA-256
  `957e8983f84c9c8fbe7ef0388483f18273ad6a0f71abd4b195715e206d59b4ab`;
  no Angular, React, Bootstrap, Hakuraku or UI-Lab entry is included.
- Six live-source reward oracles now compare aggregate summaries as well.
  Separate initialized Angular/Svelte browser comparisons confirm default
  reward/campaign counts, excluded-event totals and monthly income defaults
  (`.tmp/planner-setup-live.log`). The first new browser expectations incorrectly
  omitted initialized fallback defaults; they were corrected only after that
  source comparison, without changing application calculations.
- All **18/18** focused setup/reward workflows pass in
  `.tmp/planner-setup-browser-fixed`, across desktop Chromium, mobile Chromium
  and mobile WebKit. They cover tab keyboard/focus/panel relationships, retained
  search/period/batch state, query reset, changing summaries, reload, campaign
  and result actions, and 320px containment.
- `capture-angular-parity.mjs --planner-setup` supports closed, Balance, Income
  and Rewards captures using the existing fixture switches. Sixteen captures
  at 1536/390px record no page overflow, broken images or uncaught errors.
  The rendered controls and hierarchy were inspected; source Material icon fonts
  are unavailable locally, and mobile inputs retain the approved 44px targets.
- The unchanged production artifact finishes **329/330** workflows in 7.9
  minutes (`.tmp/production-planner-setup`, two workers, zero retries). All 110
  desktop Chromium and 110 mobile Chromium cases pass; mobile WebKit passes 109
  and reports one uncaught resource request error in compact-share reopening.
  The manifest hash is unchanged and `.last-run.json` correctly remains failed.
  The failure occurs during navigation from `/timeline` back to the compact
  share: `planner_rewards.json` reports access-control checks from the departing
  document. The plan identity, edits, reload and invalid-link assertions pass.
- The unchanged failing workflow passes **10/10** repeated WebKit executions
  (`.tmp/planner-setup-navigation-repro`), without changes to tests or error
  handling. This does **not** establish a fix or convert the full run into a
  pass. Retain the original trace and investigate the intermittent navigation
  request failure. The shared HTTP layer currently blocks new requests after
  `pagehide`; the trace's error is logged immediately after navigation starts.
  The installed WebKit adapter converts JavaScript-source console errors into
  `pageerror`, splitting the message at its first colon. This explains the
  trace's unusual `Fetch API cannot load http` error name; it does not prove
  an unhandled application promise. Distinguish browser navigation logging from
  an uncaught rejection before changing shared HTTP behavior.
  No browser-error filtering, added waits or retry-to-green changes were made.
  No route approval or real-backend verification is claimed.

### Previous verification (before setup tab parity)

- The Rewards build passes **0 Svelte errors/0 warnings and 56 files/193 logic
  checks** (`.tmp/planner-rewards-final-build.log`). Shell budgets remain 39.1 KiB
  JS / 8.4 KiB CSS gzip. The 1,383-entry production manifest has SHA-256
  `99f3d6cfb3fd95686f9258fcb6f59d525d15bff03550a10f38e3229c14dade7a`;
  no Angular, React, Bootstrap, Hakuraku or UI-Lab entry is included.
- `node scripts/verify-planner-rewards.mjs` matches six populated states against
  the current Angular component. It compares grouping, dates/windows, source
  labels, searchable text, benefit amounts/labels, result options/selections,
  breakdowns, active/selectable states and campaign eligibility. Internal optional
  option metadata is excluded from the shared comparison, not displayed values.
- `--planner-rewards` captures at 1536px and 390px have no page overflow, broken
  images or uncaught errors in either implementation. The source's unavailable
  local icon font is not replicated: Svelte uses the existing SVG icon library.
  Mobile controls retain the approved 44px target, versus Angular's smaller
  source buttons. These captures do not approve all Planner states.
- The focused production run passes all nine new Rewards workflows. Three older
  Timeline assertions found both a visible reward title and its hidden breakdown;
  they now target the exact title. The previous campaign-section/selector-label
  assertions described the abbreviated Svelte UI, not Angular's combined list.
  They now verify the campaign row and the actual selector reward action.
- The unchanged production artifact passes **321/321** browser workflows in
  `.tmp/production-planner-rewards`: 107 desktop Chromium, 107 mobile Chromium
  and 107 mobile WebKit, with two workers and zero retries in 7.8 minutes.
  Process exit is 0; `.last-run.json` is `passed` with no failed tests; the manifest
  hash is unchanged before/after. The nine Rewards workflows include loaded
  banner artwork and mobile control-height assertions. This remains fixture-based
  regression evidence, not real-backend verification or full visual approval.
  All 23 routes remain provisional `structural-parity` and
  `productionReplacementReady` remains false.

### Previous verification (before the Rewards port)

- The ordered-ledger/Balance build passes **0 Svelte errors/0 warnings and 56
  files/191 logic checks** (`.tmp/planner-ledger-balance-build.log`). Shell budgets
  pass at 39.1 KiB JS / 8.4 KiB CSS gzip. The 1,383-entry production manifest has
  SHA-256 `9e90c381897d81d5365dafcfd379c9eb8039087b3394bf471c3209201a678667`;
  no Angular, React, Bootstrap, Hakuraku or UI-Lab entry is included.
- `node scripts/verify-planner-ledger.mjs` compares 26 cases against the running
  current Angular calculation service: all match. The committed golden checks
  every entry's identity, label, date, currency, amount and source through a
  digest, plus entry counts/endpoints, every target's income/balance/funded pulls
  and the unallocated ledger. This covers deductions, same-date ordering,
  recurrence boundaries, competition availability, speculative checkpoints and
  deductions between two funded targets. The script never rewrites its golden.
- Balance's three browser profiles pass in `.tmp/planner-balance-browser`;
  signed-income editing/reload/funding passes **3/3** in
  `.tmp/planner-deductions-browser`. Initial new-test failures were assertions
  against concatenated text and an incorrect shortfall expectation: Angular
  reports the cost of remaining whole pulls. Assertions now check the exact
  separate funding labels; no application errors or interactions were waived.
- Same-fixture `--planner-balance` captures at 1536px and 390px have no page
  overflow, broken images or uncaught errors in either implementation. Group
  ordering and paired fields match. Svelte's mobile inputs are deliberately
  44px instead of Angular's 34px, following the approved touch-target requirement.
  The original Angular icon font is unavailable locally; Svelte uses real SVGs.
- The unchanged production artifact passes **312/312** browser workflows in
  `.tmp/production-ledger-balance`: 104 desktop Chromium, 104 mobile Chromium,
  104 mobile WebKit; two workers, zero retries, 7.6 minutes. Process exit is 0,
  `.last-run.json` is `passed` with no failed tests, and the manifest hash is
  unchanged before/after. These are populated-fixture checks, not real-backend
  verification or approval of every route. All 23 routes remain provisional
  `structural-parity`, with `productionReplacementReady: false`.

### Previous verification (before the ordered-ledger and Balance port)

- The Income/navigation port builds with **0 errors/0 warnings and 55 files/189
  passing logic checks** (`.tmp/planner-income-navigation-build.log`). Shell
  budgets pass at 38.9 KiB JS / 8.4 KiB CSS gzip. The production manifest
  SHA-256 is `6a5143a9a5dd1e60e26de67c6b75640b34d8822daa5b047a0925d4f123057543`;
  no Angular, React, Bootstrap, Hakuraku or UI-Lab entry is included.
- `.tmp/compare-planner-income.mjs` compares the live current Angular component
  against Svelte's presentation functions using identical populated resources.
  All 26 groups, five sections, four preset mappings, labels, schedules, help,
  source links, option amounts and enabled-income summary agree.
- The final focused Income workflow passes **3/3** browser projects in
  `.tmp/income-ui-touch-fixed`: preset edits, section mixed/remembered states,
  rich-select keyboard selection, club artwork, help/Escape/focus, custom income,
  immediate date persistence, reload, and both dimensions of 44px mobile targets.
  Earlier runs exposed a shrinking-locator test mistake, undersized hit areas,
  and Safari's deferred change event; those were fixed, not waived.
- Same-resource captures now cover expanded income sections at 1536px and 390px
  using `--planner-income`. Both implementations have no page overflow, broken
  images or uncaught errors in these states. Angular's unavailable icon font and
  overlapping mobile sticky tabs remain reference-capture limitations.
- Full production verification passes **306/306** in
  `.tmp/production-income-navigation` (102 desktop Chromium, 102 mobile Chromium,
  102 mobile WebKit; two workers, no retries; 7.4 minutes). The final process
  exited 0, `.last-run.json` reports `passed` with no failed tests, and the
  manifest hash is unchanged before/after the run. These use populated fixtures,
  not the unavailable local backend, and do not approve the whole migration.
  The previous build's `.tmp/production-income-ui-final` completed with 304
  passes and two Safari navigation errors. Traces show a follow-up download
  starting during document navigation. The shared HTTP lifecycle fix passes
  ten repeated Safari share-reopening workflows without changing their tests
  (`.tmp/planner-navigation-dev`), plus transport-abort and pagehide/pageshow
  logic checks. The full passing run uses the rebuilt production artifact.
  An earlier run (`.tmp/production-income-ui-all`) was stopped after an older
  Timeline workflow expected shop controls before expanding their new Angular
  section. The corrected workflow asserts the collapsed state, opens it, and
  still verifies that the shop selector is visible.
- A previous live Angular calculation comparison recorded six concrete custom
  income/import differences in `.tmp/planner-ledger-reference.json`: signed
  deductions, same-date ID ordering, recurring deductions, invalid calendar
  dates and default recurrence intervals. These defects are addressed by the
  ordered-ledger work above; the original failing capture is historical evidence.
- The pre-Rewards setup comparison identified rich tab summaries that needed
  porting. Rewards interleaves campaigns with events; it includes campaign
  Add to plan/allocation controls, per-event expected-result cycling, banner
  actions, breakdown help, source labels and scroll-driven incremental loading.
  At that point the Svelte rewards panel omitted or substituted these workflows.
  Reuse the existing campaign/competition/domain helpers when porting them;
  do not treat the current simplified selectors as Angular parity.

### Previous verification (before the Income UI port)

- Previous build: `.tmp/planner-assumptions-production-build.log`; Svelte reports
  **0 errors/0 warnings**, and **54 files/185 logic tests pass**. Shell budgets
  pass at **38.8 KiB JS/8.4 KiB CSS gzip**. Production manifest SHA-256 is
  `6b2efd6aa5b076189c514eee6264ee8dda1b69c74a93ff160e4547be05bb9cd5`;
  its 1,383 entries contain no Angular/React/Bootstrap/Hakuraku/UI-Lab runtime.
- Focused persistence checks pass **18/18** across all three browser projects
  in `.tmp/planner-assumptions-storage-fixed` (development server). They cover
  quota failures, export/retry recovery, retained edits across tab switches,
  disabled assumptions after reload, seasonal migration and independent copies,
  plus the existing sharing/resource/cloud workflows. The first run was stopped
  after a test expected a tab label without its active-plan badge; the corrected
  locator retains all state/error assertions.
- Live Angular on port 4200 confirms retained edited shared copies, numeric
  share IDs, compacted manual exceptions, explicit disabled assumptions and
  independent duplicated targets via `.tmp/verify-angular-planner-persistence.mjs`.
- Full production verification passed **303/303 browser checks**, as three
  complete project runs against the same immutable build: desktop Chromium
  **101/101 (4.0 minutes)**, mobile Chromium **101/101 (4.2 minutes)** and mobile
  WebKit **101/101 (4.7 minutes)**. Each used one worker and no retries; every
  `.last-run.json` reports `passed` with no failed tests. Evidence is in
  `.tmp/production-assumptions-{chromium,mobile-chromium,mobile-webkit}` and their
  adjacent logs. No application or test edits occurred during these runs;
  the production manifest SHA-256 above was identical before and after.
- These are fixture-backed workflows, not full visual approvals or real-data
  acceptance. A fresh unsandboxed Docker check still cannot reach
  `dockerDesktopLinuxEngine`; no backend containers can be verified running.
  Both frontend servers were restarted: current Angular on 4200, Svelte dev on
  4173 and the tested production preview on 4175. No Docker data/configuration
  was reset. The route ledger remains 23 routes, 0 approved, replacement disabled.
- The previous 297-check run in `.tmp/production-planner-persistence-final`
  stopped after 104 checks without a final summary; its process is gone. It is
  **incomplete**, not an all-pass result. The earlier production-focused sharing
  run passed 12/12 against manifest `ddd24173392b9dba953ef4c3367cccec53990c5682c45436a4766e9638a63b369`.

## Earlier verification (older builds)

- The previous production-artifact run passed **285/285 browser checks** in
  **12.5 minutes** with one worker and no retries: 95 workflows across desktop
  Chromium, Android-sized Chromium and iPhone-sized WebKit. Evidence is
  `.tmp/production-planner-goals-serial` and its adjacent `.log`;
  `.last-run.json` reports `passed` with no failed tests. The final build log is
  `.tmp/planner-goals-final-build.log`. No application code, build or test changes
  occurred during this run. The manifest SHA-256 before and after was
  `9f22e566d25ba0936e78fb022d2211536828b53458c9ff0470ab895f9ed2abb6`.
  The manifest has no Angular/React/Bootstrap/Hakuraku/UI-Lab runtime entries.
- New browser workflows cover populated rate-up selection, five-copy support
  limits, removal/re-add copy memory, crystal-adjusted odds, missing-rate editing,
  normalized pool widths, loaded artwork, Escape return focus, explicit empty
  goals, reload persistence, mobile disclosure and 44px controls, including 320px
  containment. The existing resource workflow now expects Angular's first-goal
  legacy-field normalization and explicit inferred-rate labels.
- Final populated goal and picker captures at 1536px and 390px compare the same
  fixture against current Angular and the production Svelte preview. All four
  page states have zero page errors, broken images and horizontal overflow.
  Both editor and picker images were visually inspected. Frame width, 44px touch
  controls and SVG icons remain intentional differences; locally unavailable
  Angular icon fonts and sticky tabs crossing the cropped region are capture
  caveats, not Svelte requirements. This evidence does not approve the full route.
- The new two-worker production run in `.tmp/production-planner-goals-final`
  completed with **284/285 passing**. Tierlist's Chromium mobile-width check hit
  `net::ERR_NO_BUFFER_SPACE` on the shared Button JavaScript chunk; its own page
  module returned HTTP 200. The preserved network trace identifies the failed
  dependency, and both files were reachable afterward. All six new goal browser
  checks passed. This is not an all-pass run, and errors remain unsuppressed.
  The subsequent all-pass single-worker run above used the same production
  manifest and unchanged assertions to reduce browser/network pressure; its
  result is not combined with the 284/285 run.
- Svelte diagnostics: 0 errors and 0 warnings.
- Domain/regression tests: 53 files, 181 tests passing, including 32 recorded
  live-Angular compilation cases, context/identity parsing, bracket completions
  and invalid-payload/literal-preservation guards, plus Timeline prediction,
  reward/race/pickup parity, HTML trust-boundary checks, retained planner targets
  and scoped reward activation, banner-search ranking, resolved-date fallback,
  anniversary/past-target ordering, resource schedule precedence, import
  validation/collisions and resource-date-free persistence, pickup-goal storage
  boundaries, per-goal crystal odds, missing-rate/exactness gates and cumulative
  reward contributions.
- Production build and base-shell performance budgets pass (38.6 KiB JS,
  8.4 KiB CSS compressed). Lazy chart, workbook and skill chunks still trigger
  Vite's size advisory; they are not in the initial shell.
- The previous production-artifact run passed all 279 browser checks in one run
  (6.7 minutes): 93 workflows across desktop Chromium, Android-sized Chromium,
  and iPhone-sized WebKit. Results are in `.tmp/production-planner-resources-final`;
  the final build log is `.tmp/planner-resource-cache-final-build.log`.
  New workflows cover Angular import/export, error atomicity, ID/name collisions,
  schedule rehydration, preserved target choices, imported targets absent from
  the timeline, delayed plan switches, reused-event-ID cache isolation, Retry
  and new-plan defaults. Shared scroll/pointer fixes are included in this run.
  The production manifest SHA-256 stayed
  `32c048e7742a35a5cfab75fb67b6235027c3f6cf84e5ccc3858200e2aa208221`.
  This includes ranked/batched banner selection, global and individual target
  settings, stepper/crystal limits, real mobile taps, persistence and item-image
  loading, plus the shared dialog return-focus fix. It retains configured target
  remove/reload/re-add, inferred rewards, paid-only exclusion, delayed activation,
  Timeline details, populated routes and the ranking-row overflow regression.
  `.last-run.json` reports `passed` with no failed tests; no build or test edits
  occurred during the final run. An earlier run in
  `.tmp/production-planner-resources` was deliberately interrupted to fix the
  reproduced cache defect; it is not combined with this result. The previous
  complete 270-check run remains in `.tmp/production-planner-final`.
  The earlier 269/270 result is retained separately
  in `.tmp/production-planner-controls` rather than combined with focused reruns.
  An earlier full run passed 245/246 and exposed
  a WebKit navigation/network error in the unmocked redirect check. Populated
  route reruns then revealed the real ranking overflow above; that was fixed in
  the component, not hidden by weakening the geometry assertion. A separate
  Chromium rerun hit `ERR_NO_BUFFER_SPACE`; browser errors remain unsuppressed.
  This result does not combine an incomplete full run with isolated passes,
  and the final suite has no configured retries. Earlier Timeline click-loss
  diagnostics and its fix remain documented above.
  The first planner run passed 260/261: its iPhone invalid-UQL request-count test
  took a baseline before the valid empty-UQL mode search had dispatched. The
  trace shows that request at 298948ms, before invalid text insertion at 299055ms.
  The test now awaits the mode-change response instead of a fixed 450ms delay;
  the invalid-query request-count assertion and application guards are unchanged.
  The complete final run above includes that synchronization fix.
  Coverage includes shell/ad geometry at 320, 768, 1024, 1366, 1536, 1920 and
  2560px, filter/picker interactions, persistence, mocked auth, error states and
  uncaught browser errors. These checks are not exhaustive route acceptance.
- This full run includes the shared parent picker, manual race/best-fit editing,
  shared P2 URL/preset restoration, null tree slots and scoped UQL request isolation,
  failed-storage draft retention, partner failure recovery, and persisted Lineage
  transfers, as well as shared dialog sizing, Safari focus/disclosure fixes,
  report/copy workflows, Settings clipboard recovery and Optimal Races.
  It also includes UQL target/UUID/account/member restoration, multiple historical
  references, retry and stale-response handling, cancellation and unchanged-picker
  reopening through completion, portrait loading and affinity-context clearing.
  Timeline coverage includes published rates, reward-only stories, CM/Legend
  race facts, persistent selections, failure/retry, delayed responses, focus
  restoration, loaded asset bytes and touch-sized dialog controls.
  Before the final build, repeated select/disclosure checks passed all 27 runs.
  Optimal Races screenshots are retained in the Playwright result directories;
  desktop and both 320px mobile captures were visually inspected. Their populated
  race fixtures do not depend on live backend availability.
- The new parent-picker desktop and iPhone screenshots were visually inspected
  after the full run. Mobile filter scope/star controls have visible 44px targets;
  compact row/tree styling still needs the Angular comparison listed above.
- Angular and Svelte emitted identical complete request parameters for the
  scoped-factor UQL and shared-P2 reference states at both 390px and 1536px.
  All four pairs have no page errors, broken images or horizontal overflow.
  Those earlier captures used collapsed filters. New `uql-guide` captures open
  the real editors and guide on both implementations; screenshots were visually
  inspected and exposed/corrected the inline-chip and mobile-scale differences.
  Reference captures support the covered states, not whole-route approval.
  Open-editor captures also emit matching first-page query parameters on both
  implementations. The capture clock now advances with timers and opts out of
  the Timeline fixture's frozen date, so Angular's RxJS debounce can complete;
  each edited-query capture waits for the filtered response before recording.
- The restored target/UUID query is also compared against the live Angular app
  at 390 and 1536px. Both send `player_chara_id=100302`, the same P2/exclusion/race
  fields and the same compiled predicate. All four final captures have a loaded
  legacy portrait, no page error and no page overflow. Editor images are retained
  as `.tmp/angular-uql-context-{390,1536}.png` and the corresponding `svelte-`
  files. First-visit update/consent popups are dismissed via their existing storage
  keys in the isolated reference pages, not removed from either implementation.
  Read-only text/chip structure was inspected; touch-target spacing and the
  approved frame widths still differ from the Angular desktop shell.
- The workflow fixture now stubs the external Publift bootstrap at the browser
  context level. A live CMP interrupted the first rerun and blocked unrelated
  controls; it must not participate in deterministic route checks. Production
  ad/consent code was not disabled or changed. Real CMP/provider integration
  remains a separate acceptance requirement.
- Populated Timeline detail captures at 390px and 1536px use the same banner,
  catalog, rate, reward and prediction fixtures in the live Angular app and the
  final Svelte production preview. All four have six loaded dialog images, no
  broken page images, no page errors and no horizontal overflow. Both widths were
  visually reviewed; the metric grouping, native mobile width and height limits
  were corrected from that comparison. Footer typography and remaining event
  variants still require acceptance, so these captures do not approve the route.
  Evidence is `.tmp/angular-comparison/{angular,svelte}-timeline-timeline-details-{390,1536}.png`.
  The 12 dedicated checks also verify 44px touch targets and the mobile geometry.

## Reproduce the checks

From the Svelte worktree:

```powershell
npm run check
npm run test:run
npm run build
npx playwright test --workers=2 --grep-invert 'UI Lab|Hakuraku|ui-lab'
```

For a stable production-artifact run, start `npm run preview -- --host 127.0.0.1
--port 4175 --strictPort` after the build. In a second terminal:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:4175'
npx playwright test --workers=2 --grep-invert 'UI Lab|Hakuraku|ui-lab'
```

This bypasses the default beta/dev-server reuse; avoid rebuilding `dist` during
the run. The HTML report is written to `playwright-report/index.html`.

With Angular on port 4200 and Svelte on port 4173:

```powershell
node scripts/capture-angular-parity.mjs /database /timeline /tools/statistics
node scripts/capture-angular-parity.mjs /database --uql-guide
$env:SVELTE_PORT='4175' # Optional: compare the production preview instead of dev.
node scripts/capture-angular-parity.mjs /timeline --timeline-details
node scripts/capture-angular-parity.mjs '/timeline?tab=carat-planner' --planner-controls
node scripts/capture-angular-parity.mjs '/timeline?tab=carat-planner' --planner-goals
node scripts/capture-angular-parity.mjs '/timeline?tab=carat-planner' --planner-income
```

Shared API fixtures live in `tests/e2e/fixtures/angular-api.ts`. Captures at
1536px and 390px, body text, emitted search parameters, page errors and overflow/image checks are written
to `.tmp/angular-comparison`, outside Playwright's disposable output folder.
The script scrolls first to load deferred charts and images.
The Timeline detail state uses `tests/e2e/fixtures/timeline-details.ts` for both
implementations, waits for populated rates/images and completed dialog animations,
and captures the dialog independently from the shell. Capturing Angular before
its entrance animation finishes produces a misleading translucent reference.
The goal-workspace state uses `tests/e2e/fixtures/planner-goals.ts` for both
implementations, opens the populated goal editor and mobile odds disclosure,
then captures the rate-up picker separately. This checks the same source data,
not placeholder/empty screens, and does not approve the complete Planner route.
Query-state capture filenames use a short path hash to stay within Windows path
limits; their complete URLs and repeated request parameters remain in `report.json`.

Captures are inspection evidence, not automatic pixel-diff approval. Some
Angular icon-font/assets fail locally, and some reference fixture states still
need expansion. Database fixtures now use costume/card IDs, valid factors in
all six groups, and the same versioned affinity resource for both frameworks.
The latest Database captures have no broken images or page-level overflow, and
record/source affinity values agree; the Angular icon font still fails locally.
Check these reference failures before calling a source page populated
or a visual difference a Svelte defect.

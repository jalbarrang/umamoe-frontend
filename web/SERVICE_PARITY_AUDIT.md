# Angular → Svelte service audit

## Branch preparation follow-up

The requested hidden component gallery is now available at `/ui` in production as well as beta; `/ui-lab` remains an alias. This supersedes the production gallery-exclusion check recorded below. Both routes stay lazy, unlisted and `noindex`.

A clean snapshot of the staged files exposed deployment inputs that had only existed locally. Builds now copy the tracked legacy artwork into Vite's public directory and generate tierlist data using the existing calculation engine, updated for this package's ES modules. Required support-card/circle artwork and local preview scripts are included in the commit; local browser state, screenshots, logs and externally maintained statistics are excluded.

Verification on that clean snapshot: production build passed, all 275 unit tests passed, Svelte reported zero errors/warnings, and all six new `/ui` checks passed across desktop Chromium, mobile Chromium and mobile WebKit. The gallery stays outside the initial bundle; the shell remains 50.7 KiB JS / 11.3 KiB CSS gzip. Manifest files, generated tierlist scores, static artwork and research-note output were checked. Docker execution still requires CI. See the README's deployment section for existing secrets, triggers and beta/production gates.

Audited against the **current Angular checkout** in `C:/Users/lars/Documents/git/umamoe-frontend`, not just the older Angular snapshot retained in this worktree. Scope: the 48 Angular service files (362 public methods), their active callers, HTTP/storage contracts, and equivalent Svelte workflows. Framework-specific methods do not need identical names or classes.

## Findings fixed

- OAuth callbacks now accept a returned token on any app route, remove it from the address bar immediately, avoid racing a previous session, and retain retryable sessions after temporary backend failures.
- Browser verification uses the existing CI-injected public configuration in both beta and production. Script failures time out and retry, challenges can be interacted with, and failures have a recovery action.
- HTTP 429 responses reach the shared rate-limit UI. Browser-proof warmup limits still use the verification/retry path when a provider is configured.
- The footer exposes live service status and build information. Visible pages check for deployments; reload remains a user action. The existing changelog and `lastSeenUpdateVersion` contract are retained.
- GA initialization, page views, engagement, stored consent, and CMP consent updates are wired into Svelte. Query strings, fragments, and trainer IDs are excluded from analytics URLs. Fuse loads on beta as well as production and honors the stored disable/advertising choices.
- Planner resources retain Angular's persistent cache and recover during an outage; relative manifest paths resolve under `/resources/planner/`. Reward hashes are checked in the background, with refreshed rewards delivered to both Timeline and Carat Planner.
- Planner state is persisted before notifying subscribers, so a synchronous resource migration cannot be overwritten by the older outer save.
- Current-circle data can include the club endpoint's tier and previous standings, with graceful fallback if that endpoint is unavailable.
- Route changes update canonical links, social metadata, indexing rules and structured data.
- Docker receives the Svelte build's required source and test fixtures. Compiled files now live under `/app/`, outside the separately deployed `/assets/` directory. The shell build no longer deletes its own JavaScript. Build-version injection accepts Vite's self-closing meta tag.

## Service map

Paths below are relative to this worktree. “Workflow” refers to browser tests in `tests/e2e/`; domain calculations and middleware also have adjacent `*.test.ts` files.

| Angular service | Svelte implementation / active behavior | Verification |
| --- | --- | --- |
| affinity | `web/domain/veterans/affinity-engine.ts`, `web/domain/lineage/planner.ts`, `web/domain/inheritance/inheritance-factors.ts`, spark probability helpers | Affinity, lineage, parent-picker and spark unit/workflow cases |
| app-version | `web/platform/site-services.ts`, `ServiceNotices.svelte`, `MoeFooter.svelte` | Visible polling, version mismatch, dismissal and footer workflow |
| auth | `web/platform/auth/`, shared HTTP middleware | Provider endpoints, callbacks, stored sessions, identities, account verification and API-key workflows |
| bookmark | `web/features/database/inheritance-repository.ts` and Database/parent-picker state | Load, snapshot add, remove, bulk-delete, failures and session behavior |
| carat-planner-calculation | `web/domain/timeline/carat-planner.ts` and planner calculation helpers | Ledger reference cases, rewards, income, dates and odds |
| carat-planner-cloud | `planner-cloud-repository.ts`, `planner-cloud-sync.ts`, cloud codec/state | Account sync, conflicts, retry, reference shares and older-server fallback |
| carat-planner-persistence | `carat-planner.ts`, `planner-state.ts`, cloud/resource codecs | Legacy storage, import/export, save failures and nested-save regression |
| carat-planner-resource | `web/features/timeline/planner-resource-repository.ts` | Protected manifest paths, cache fallback, hash refresh and workflow recovery |
| carat-planner-timeline | `setTimelineEvent` in planner domain and shared planner collection | Timeline/Carat Planner selection and persistence workflows |
| carat-pull-probability | `web/domain/timeline/planner-pull-probability.ts` | Goals, exchanges, multi-pickup and probability reference cases |
| character | `web/catalog/character-catalog.ts` | Live/released catalogs, variants, selectors and failures |
| circle | `web/features/community/community-repository.ts` | Club list/detail contracts, refresh cache, history/member workflows |
| colors | Shared CSS tokens plus domain chart/display palettes | Theme/layout checks and chart/domain cases; no Angular singleton needed |
| cookie-consent | `web/platform/analytics.ts`, `web/platform/ads/fuse-ads.ts` | Existing `cookie-consent` choices, denied defaults, CMP updates and opt-out tests |
| domain-migration | No migration popup | Disabled in the current Angular app; not re-enabled |
| domain-storage | Native storage with guarded feature-level reads/writes | Original keys, session changes, malformed data and denied-storage cases |
| factor | `web/catalog/factor-catalog.ts`, veteran/inheritance factor helpers | Catalog ID encoding, names, colors and filtering |
| fuse-ads | `web/platform/ads/`, shared ad components and Privacy Choices | Provider API stub, reserved geometry and route workflows; real delivery is external |
| getting-started-tour | `web/platform/tours/` | Audience/seen keys, route tours, interactive steps and mobile navigation |
| google-analytics | `web/platform/analytics.ts` | Initialization, page views, engagement, consent and sensitive-data filtering; see limits below |
| inheritance-display-state | Database preferences and entry state | Original collapse/hidden-spark settings and round-trip workflows |
| inheritance | `web/features/database/inheritance-repository.ts`, search domain, borrow interactions | Search/UQL, submissions, reporting, borrow views/copies and bookmarks |
| master-data | `web/catalog/` loaders and resource repository | Character, support, factor, skill, race and scenario data; lazy rather than Angular-wide startup |
| milestone | No expired announcement | Angular's dated milestone has expired; not reintroduced |
| partner | `web/features/parent-picker/partner-repository.ts` | Lookup stream, persistence flags, history, cancellation and timeout recovery |
| planner-transfer | `web/domain/lineage/planner.ts` transfer parsing and planner routing | Database/veteran/parent-picker → planner transfer workflows |
| profile | `web/features/profile/profile-repository.ts`, `ProfileShell.svelte` | Session isolation, visibility writes, veteran ingest, circle enrichment and private sections |
| ranking | `web/features/community/community-repository.ts` | Monthly, all-time and gain routes, pagination and filter contracts |
| rate-limit | Shared HTTP middleware → `ServiceNotices.svelte` | 429 retry-after, warmup distinction, deduplication and dismissible UI |
| resource-data | `web/catalog/resource-repository.ts`, `QueryCache` | Manifest paths, gzip, legacy disk cache, write failures and stale-request protection |
| seo | `web/platform/seo.ts`, feature manifest and generated public metadata | SPA canonical/social/noindex updates and metadata unit/workflow cases |
| shame | `web/features/activity/activity-repository.ts` | Activity overview/detail contracts and old `/shame` redirects |
| shared-visibility-observer | Native `IntersectionObserver`, shared borrow-view batching | Visible-only reporting, cooldown and deduplication workflows |
| skill | `web/catalog/skill-catalog.ts` and shared skill displays | Catalog lookup, encoded levels/SP, search and populated display cases |
| statistics | `web/features/tools/statistics-repository.ts` | Dataset versions, lazy character/distance resources and chart workflows |
| stats | Home data loader and shared HTTP client | Public stats endpoint and populated/error Home workflows |
| status | `web/platform/site-services.ts`, footer status details | Live read-only endpoint check, visible polling and unavailable state |
| support-card-database | `web/catalog/support-card-catalog.ts`, tierlist/support selectors | Catalog, type/rarity/limit-break filtering and picker workflows |
| support-card | Shared catalog + database search repository | Current unified search contract, support filters and trainer interactions |
| theme | `web/platform/theme.ts`, shared theme tokens | Stored light/dark choice and UI theme checks; disabled Christmas theme remains disabled |
| tierlist-calculation | Tierlist repository/domain calculations | Precomputed results, type/limit-break scoring, sorting and metadata |
| tierlist-optimized | `web/features/tools/tierlist-repository.ts` | Cached precomputed resource loading and populated/filter/failure workflows |
| timeline-avatar | `web/domain/timeline/timeline-pickups.ts`, `web/catalog/timeline-artwork.ts` | Character variants, support artwork, search terms and fallbacks |
| timeline-prediction | `web/domain/timeline/timeline-prediction.ts` | Date/prediction reference cases and event details |
| timeline | `web/features/timeline/timeline-repository.ts`, timeline domain | Resources, dates, filters, cards, planner selection and details |
| turnstile | `web/platform/http/browser-proof.ts` and HTTP middleware | Configured beta verification, single-flight exchange, proof caching, expiry, timeout and retry |
| update-notification | `UpdateNotification.svelte`, `web/platform/update-log.ts` | Original changelog/version key, manual opening and dismissal |
| vote-protection | Current report/copy guards and borrow interactions | Reporting, duplicate actions, cooldown and rollback; obsolete voting is not restored |

## Retired and changed contracts

- Angular still contains old inheritance/support voting, per-record submission/detail methods, and profile CM/achievement upload methods with no active corresponding UI in the current application. Restoring unused endpoints would not establish parity with the current product. Current unified database search and trainer submission/reporting are the supported flows.
- Domain migration, expired milestones and disabled seasonal UI remain inactive.
- Angular dependency-injection classes, RxJS subjects, Material dialogs and shared observer services are replaced by Svelte stores/components, promises, `QueryCache` and native browser APIs.
- Analytics page/consent plumbing is restored. The historical fine-grained Angular action-event taxonomy is **not a one-for-one port**; this audit does not claim identical analytics dashboards.
- External advertising creative retention/debug controls and Turnstile support-simulation toggles are not proof of live provider delivery. The public workflows use the Svelte lifecycle and real provider APIs; deterministic tests use provider stubs.

## Live checks and boundaries

Read-only checks of production returned:

| Endpoint | Result |
| --- | --- |
| `https://uma.moe/api/stats?days=30` | HTTP 200, expected stats structure |
| `https://uma.moe/resources/manifest.json` | HTTP 200, resource manifest |
| `https://uma.moe/version.json` | HTTP 200, version/commit/environment/build time |
| `https://status.uma.moe/api/v1/endpoints/statuses` | HTTP 200, eight service entries |
| Club list, database search, `/api/auth/me` | HTTP 403, browser proof required |
| Protected planner manifest | HTTP 403, planner source required |

The 403 responses confirm that access protection is active; they do **not** establish that authenticated operations work. No production writes, real OAuth login, real CAPTCHA completion, account mutation, or deployment was performed. Those require an authorized browser session and the matching backend deployment. In particular, the new veteran append route and current planner share/sync contracts must be available on that backend.

Docker's daemon was unavailable locally. The Vite beta/production artifacts and shell/static-file separation are checked independently; a successful container build still needs CI.

## Validation results

- `npm run build:beta`: **275 unit tests passed in 77 files**, zero Svelte errors/warnings, build succeeded. Initial shell: **50.7 KiB JS / 11.3 KiB CSS gzip**, within the 100/35 KiB budgets.
- Service workflow sweep: **474 cases** across desktop Chromium, mobile Chromium and mobile WebKit. Initial run: 471 passed, three failures from hidden changelog text. After rendering the changelog only when opened, all **33 affected service/timeline cases** passed. Cumulative result: **474 passed, no unresolved failures**. This is a sweep plus targeted rechecks, not a second full clean sweep.
- Production Vite build succeeded with explicit public test provider IDs. Artifact validation checked **1,265 files**, compiled configuration, shell/static separation, version stamping and UI Lab exclusion. Production shell: **51,538 bytes JS / 11,613 bytes CSS gzip**.
- The preceding page audit covered the whole site; this additional run selected service-heavy workflows. An attempted additional all-page run was interrupted to reduce machine load and is not counted as a completed run.
- Live read-only responses and protected-endpoint limits are listed above. Real OAuth/CAPTCHA, production mutations, provider delivery and a Docker/CI build remain external validation steps.

Evidence directory: `C:/Users/lars/.codex/visualizations/2026/09/15/01a0a5cc-5a4f-7830-8ecc-7865e824818b/`

- `angular-service-inventory.json`: service/public-method and endpoint inventory.
- `angular-service-callers.json`: directly resolved constructor-injected call sites; dynamic `inject()` and template calls still require source inspection.
- `live-services.json`: read-only live response checks.
- `service-build-beta.log`: final check/unit/build output.
- `service-workflows-e2e.json` and `service-final-e2e.json`: sweep and recheck results.
- `service-production-build.log` and `deployment-check.json`: production build and artifact checks.

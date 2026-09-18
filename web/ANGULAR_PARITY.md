# Angular → Svelte parity contract

The current Angular checkout at `C:/Users/lars/Documents/git/umamoe-frontend/src/app` is the product specification for the Svelte migration in `web`. The Angular snapshot inside this Svelte worktree can be older; do not use it as the latest specification.
The migration is a framework and implementation change, not a product redesign.

## Allowed product changes

Only these cross-page presentation changes are in scope before parity:

1. The responsive Svelte navigation shell.
2. The `normal` (1080px content maximum) and `wide` (1760px content maximum) page frames.
3. The ad-aware page geometry: in-content placements below the side-rail threshold, one sticky right rail when it fits, and balanced sticky rails at the largest scale.

Everything else retains the Angular route, labels, defaults, query parameters, controls, ordering, validation, loading/error/empty states, persistence keys, API calls, and user-visible behavior.

## Product route table

| Angular URL | Svelte page | Notes |
| --- | --- | --- |
| `/` | Home | Brand link is the Home navigation affordance. |
| `/database` | Database | Preserve all filter modes, saved state, query behavior, result controls, and defaults. |
| `/circles` | Clubs | Preserve search, filters, sorting, live refresh, and pagination. |
| `/circles/:id` | Club details | Preserve month/year state and member analytics. |
| `/circles/:id/:exportFormat` | Club export/details | Preserve export URL behavior. |
| `/rankings` | Rankings | Preserve tabs, time controls, sorting, searching, and pagination. |
| `/activity` | Activity | Preserve report filters, thresholds, sorting, and pagination. |
| `/activity/:viewerId` | Activity detail | Preserve viewer report behavior. |
| `/timeline` | Timeline / Carat Planner | Preserve tab/query state and planner behavior. |
| `/tierlist` | Tierlist | Preserve selectors, chart semantics, tabs, and result ordering. |
| `/tools` | Tools | Statistics and Lineage Planner remain page destinations, not promoted global nav items. |
| `/tools/statistics` | Statistics | Preserve all views, filters, tables, charts, and calculations. |
| `/tools/lineage-planner` | Lineage Planner | Preserve storage, imports, filters, affinity calculations, and planner behavior. |
| `/profile/:accountId` | Profile | Preserve nested profile navigation and API-backed states. |
| `/profile/:accountId/veterans` | Veterans | Remains account-scoped; do not create a standalone `/veterans` product route. |
| `/profile/:accountId/cm` | CM | Remains account-scoped. |
| `/profile/:accountId/achievements` | Achievements | Preserve the existing placeholder/feature state. |
| `/profile/:accountId/titles` | Titles | Preserve the existing placeholder/feature state. |
| `/settings` | Settings | Preserve the Angular auth guard and settings behavior. |
| `/login` | Login | Preserve provider behavior. |
| `/signin` | Auth callback | Preserve callback/token behavior. |
| `/privacy-policy` | Privacy | Preserve copy and structure. |
| `/wip` | Work in progress | Preserve the generic WIP destination. |

The Angular redirects also remain exact: `/inheritance` → `/database`, `/support-cards` → `/database`, `/shame` → `/activity`, and `/shame/:viewerId` → `/activity/:viewerId`.

## Global navigation contract

The new shell exposes the same Angular destinations: Database, Clubs, Rankings, Activity, Tierlist, Tools, and Timeline. The logo links Home. Statistics and Lineage Planner stay discoverable from Tools. Experimental Hakuraku, standalone client, and standalone Veteran routes do not enter product navigation before the Angular port reaches parity.

## Safe service consolidation

A service or helper may be deleted or combined only after its callers have moved and parity tests cover its observable behavior.

- Keep API paths, query serialization, cancellation, retries, error normalization, cache lifetimes, and loading timing stable.
- Keep local/session storage keys and migration behavior stable until an explicit data migration is approved.
- Move calculations into small pure TypeScript functions first; add golden tests from Angular fixtures before swapping callers.
- Merge duplicate HTTP plumbing only when the resulting typed pipeline preserves interceptor order and behavior.
- Do not combine unrelated domain repositories merely to reduce file count.
- Remove an implementation only when repository search and the production manifest prove it unreachable.

## Migration order

Port and approve one route family at a time: shell → Home → Database → Clubs/Rankings/Activity → Timeline/Carat Planner → Tierlist/Tools/Statistics/Lineage → Profile and nested routes → Settings/Auth/Privacy. A route is complete only when desktop/mobile visual parity and behavior parity pass against the Angular application.

## Tracked status

The current inspection findings and remaining acceptance work are recorded in [PARITY_REVIEW.md](./PARITY_REVIEW.md). Route tests establish specific working flows, not full visual or behavioral parity. No route is approved for an atomic production replacement yet.

The machine-readable route state lives in [`parity/angular-route-ledger.json`](./parity/angular-route-ledger.json). `approved` is intentionally reserved for user-reviewed pages; automated checks can advance a route only through structural and behavior parity. The compatibility inventory in [`parity/angular-compatibility.json`](./parity/angular-compatibility.json) pins the Angular storage keys, API families, and allowed global state while services are consolidated.

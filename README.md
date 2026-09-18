# uma.moe

uma.moe is a companion website for **Umamusume: Pretty Derby**, focused on practical tools for players of the global version. It brings together database search, inheritance planning, release tracking, rankings, statistics, and account utilities in one place.

Visit the live site: [uma.moe](https://uma.moe)

![uma.moe](https://img.shields.io/badge/uma.moe-live-success)
![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What It Does

uma.moe is built around the workflows players repeat often: finding useful parents, planning inheritance, checking upcoming content, comparing performance, and understanding account or club progress.

### Inheritance Database

Search community and account-linked inheritance records with filters for characters, factors, races, support cards, affinity, trainer IDs, and other practical borrowing criteria. The database is designed for narrowing down useful parents quickly rather than browsing raw records one by one.

### Lineage Planner

Plan full inheritance trees across parents and grandparents. The planner supports manual entries, saved veterans, bookmarks, imports, exports, and transfer flows from the database so players can move from search to planning without rebuilding the same information.

### Timeline

Track expected global release timing for characters, support cards, banners, events, campaigns, and major updates. The timeline is built for planning ahead and comparing future content at a glance.

### Tierlists, Rankings, and Statistics

Explore precomputed rankings, trainer leaderboards, circle activity, and statistics pages that summarize game data into usable comparisons. These pages are meant to answer questions like what is popular, what is performing well, and how progress changes over time.

### Account Tools

Optional accounts let players link game data, manage saved veterans, bookmark database entries, view profiles, and keep useful planning state across sessions. Most browsing tools remain useful without an account.

### Cookie and Privacy Controls

The site includes a cookie consent flow for optional categories such as analytics and advertising. Google Analytics uses Consent Mode v2 with denied defaults, so analytics cookies and full reporting only run after analytics consent is granted.

## Design Goals

- Make daily Umamusume planning faster and less repetitive.
- Prefer searchable, filterable tools over static reference pages.
- Keep information dense enough for experienced players while staying usable on mobile.
- Support both anonymous browsing and account-backed workflows.

## Project Status

This branch contains the Svelte rewrite and its Angular parity checks. Deployment is a separate step from committing the branch. The legacy `src/` tree remains as a migration reference and supplies shared data, artwork, and CI-injected environment configuration; Vite compiles the `web/` application.

The codebase is still useful for understanding and contributing to the frontend, but the README intentionally describes the product rather than presenting this as a generic installable application.

## Tech Snapshot

- Svelte 5 client application with Vite and TypeScript
- No SvelteKit and no UI-component runtime
- `sv-router` behind an app-owned route module
- CSS custom-property tokens and scoped component styles
- Hidden, lazy-loaded `/ui` component gallery (`/ui-lab` remains an alias)
- Vitest, Playwright, accessibility-first native controls, and enforced bundle budgets

## UI foundation

Run `npm start`, then open `http://127.0.0.1:5173/ui`. The gallery is available in development, beta and production, but is omitted from navigation, the sitemap and public feature metadata, and marked `noindex`. Its examples load only when opened. This is an unlisted page, not an access-controlled admin endpoint.

## Deploying the Svelte rewrite

- `npm run build:beta` and `npm run build:prod` generate metadata, contracts and tierlist data, run type/unit checks, and emit the Vite application to `dist/`.
- Docker builds the same `shell` and `assets` targets used by the existing workflow. Compiled JS/CSS lives under `/app/`; `/assets/` remains the separately deployed static bundle. The existing rsync exclusion therefore preserves app code.
- Existing Turnstile and Google Analytics repository settings still work. Vite reads the environment files that CI injects; no new secrets are required.
- Pushes and PRs targeting `main`/`master` retain their existing workflow triggers. For this feature branch, manually dispatch the workflow to deploy beta. Production remains restricted to `main`/`master` and the production environment gate.
- Keep the server's SPA fallback (`try_files ... /index.html`) for direct routes such as `/ui`. Existing API/resource proxies and externally maintained statistics remain required.
- On a fresh local checkout, run `npm ci` and `npm run generate:assets` before starting development. This copies the existing artwork into Vite's public directory and generates tierlist data. Docker execution must be verified in CI when no local Docker daemon is available.

## Related Systems

- Backend API for accounts, profiles, rankings, circles, bookmarks, and database data
- Resource/data pipeline for extracted and generated game data
- Static asset generation for precomputed views and optimized media

## Disclaimer

uma.moe is an unofficial fan project and is not affiliated with Cygames or the official Umamusume: Pretty Derby publishers.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

Thanks to the Umamusume community for data, testing, feedback, and all the tiny edge cases that make planning tools worth building.

## Local Svelte demo

Run `npm run dev:demo` in this Svelte worktree, then open http://127.0.0.1:5173.
The visible demo banner identifies sample data. Database, clubs and club details,
rankings, activity reports, timeline/planner, statistics, and the linked demo
profile use the existing parity fixtures. Tierlists retain their bundled data.
Demo responses are read-only; login and account mutations still require a backend.
Fixtures are intentionally small and do not simulate every backend filter.
Run `npm run check:demo` with the demo server running to verify the populated routes,
search, pagination totals, and rejected writes. Use `npm run dev` for normal backend data.

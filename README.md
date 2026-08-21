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

This branch contains the mobile-first Svelte rewrite foundation. Production remains on the Angular artifact while the beta UI system, route parity, domain fixtures, and performance gates are reviewed. The legacy `src/` tree remains temporarily as an unbundled migration reference; Vite only compiles the new `web/` application.

The codebase is still useful for understanding and contributing to the frontend, but the README intentionally describes the product rather than presenting this as a generic installable application.

## Tech Snapshot

- Svelte 5 client application with Vite and TypeScript
- No SvelteKit and no UI-component runtime
- `sv-router` behind an app-owned route module
- CSS custom-property tokens and scoped component styles
- Beta/development-only, lazy-loaded `/ui-lab`
- Vitest, Playwright, accessibility-first native controls, and enforced bundle budgets

## UI foundation

Run `npm start`, then open `http://127.0.0.1:5173/ui-lab`. Product routes are intentionally paused until the UI gate is approved. `npm run build:beta` includes the lab, while `npm run build` removes the route and its examples from production output.

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

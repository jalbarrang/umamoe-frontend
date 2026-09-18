import { createRouter } from 'sv-router';
import { writable } from 'svelte/store';
import HomePage from '../../features/home/HomePage.svelte';
import RouteLoadErrorPage from './RouteLoadErrorPage.svelte';

// Angular accepts backend OAuth redirects on any page, including /?token=….
// Route those through the same callback before the router reads the initial URL.
if (typeof location !== 'undefined' && location.pathname !== '/signin') {
  const token = new URLSearchParams(location.search).get('token');
  if (token) history.replaceState(history.state, '', `/signin?${new URLSearchParams({ token })}`);
}

export const pendingRoute = writable<string | null>(null);

function preloadPageData({ pathname }: { pathname: string }): void {
  if (pathname === '/timeline') void import('../../features/timeline/timeline-repository').then(({ timelineRepository }) => timelineRepository.load()).catch(() => {});
}

// sv-router leaves its outer promise pending when a lazy import rejects.
// Resolve a recoverable page instead; reloading also clears failed module state.
function pageUnavailable(error: unknown) {
  console.error('Page module could not be loaded:', error);
  return { default: RouteLoadErrorPage };
}

// This is intentionally the Angular route table expressed in sv-router.
// New product work stays out of this table until the framework port reaches parity.
const angularRouteTable = {
  '/': HomePage,
  '/database': () => import('../../features/database/DatabasePage.svelte').catch(pageUnavailable),
  '/circles': () => import('../../features/community/ClubsPage.svelte').catch(pageUnavailable),
  '/circles/:id/:exportFormat': () => import('../../features/community/ClubDetailsPage.svelte').catch(pageUnavailable),
  '/circles/:id': () => import('../../features/community/ClubDetailsPage.svelte').catch(pageUnavailable),
  '/rankings': () => import('../../features/community/RankingsPage.svelte').catch(pageUnavailable),
  '/activity/:viewerId': () => import('../../features/activity/ActivityPage.svelte').catch(pageUnavailable),
  '/activity': () => import('../../features/activity/ActivityPage.svelte').catch(pageUnavailable),
  '/timeline': () => import('../../features/timeline/TimelinePage.svelte').catch(pageUnavailable),
  '/tierlist': () => import('../../features/tools/TierlistPage.svelte').catch(pageUnavailable),
  '/tools/statistics': () => import('../../features/tools/StatisticsPage.svelte').catch(pageUnavailable),
  '/tools/lineage-planner': () => import('../../features/tools/LineagePlannerPage.svelte').catch(pageUnavailable),
  '/tools': () => import('../../features/tools/ToolsPage.svelte').catch(pageUnavailable),
  '/privacy-policy': () => import('../../features/privacy/PrivacyPage.svelte').catch(pageUnavailable),
  '/login': () => import('../../features/auth/LoginPage.svelte').catch(pageUnavailable),
  '/signin': () => import('../../features/auth/AuthCallbackPage.svelte').catch(pageUnavailable),
  '/veterans': () => import('../../features/profile/VeteransBrowserPage.svelte').catch(pageUnavailable),
  '/veterans/:accountId': () => import('../../features/profile/ProfileVeteransPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/veterans': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/cm': () => import('../../features/cm-logs/CmLogsPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/achievements': () => import('../../features/profile/ProfilePlaceholderPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/titles': () => import('../../features/profile/ProfilePlaceholderPage.svelte').catch(pageUnavailable),
  '/profile/:accountId': () => import('../../features/profile/ProfilePage.svelte').catch(pageUnavailable),
  '/settings': () => import('../../features/settings/SettingsPage.svelte').catch(pageUnavailable),
  '/wip': () => import('../../features/foundation/WipPage.svelte').catch(pageUnavailable),
  '/inheritance': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/support-cards': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/shame/:viewerId': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/shame': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable)
} as const;

const productRoutes = {
  hooks: {
    beforeLoad: (context: { pathname: string }) => { pendingRoute.set(context.pathname); preloadPageData(context); },
    afterLoad: () => { pendingRoute.set(null); },
    onError: () => { pendingRoute.set(null); },
    onPreload: preloadPageData
  },
  ...angularRouteTable,
  '*': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable)
} as const;

// The gallery is available by direct URL only and stays out of the initial bundle.
export const router = createRouter({
  ...productRoutes,
  '/ui': () => import('../../features/ui-lab/UiLabPage.svelte').catch(pageUnavailable),
  '/ui-lab': () => import('../../features/ui-lab/UiLabPage.svelte').catch(pageUnavailable)
});

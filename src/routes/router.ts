import { createRouter } from 'sv-router';
import { writable } from 'svelte/store';
import HomePage from '@/pages/home/HomePage.svelte';
import RouteLoadErrorPage from './RouteLoadErrorPage.svelte';

// Angular accepts backend OAuth redirects on any page, including /?token=….
// Route those through the same callback before the router reads the initial URL.
if (typeof location !== 'undefined' && location.pathname !== '/signin') {
  const token = new URLSearchParams(location.search).get('token');
  if (token) history.replaceState(history.state, '', `/signin?${new URLSearchParams({ token })}`);
}

export const pendingRoute = writable<string | null>(null);

function preloadPageData({ pathname }: { pathname: string }): void {
  if (pathname === '/timeline') void import('@/pages/timeline/timeline-repository').then(({ timelineRepository }) => timelineRepository.load()).catch(() => {});
}

// sv-router leaves its outer promise pending when a lazy import rejects.
// Resolve a recoverable page instead; reloading also clears failed module state.
function pageUnavailable(error: unknown) {
  console.error('Page module could not be loaded:', error);
  return { default: RouteLoadErrorPage };
}

// Public URLs stay stable; each page owns its lazy-loaded implementation.
const pageRoutes = {
  '/': HomePage,
  '/database': () => import('@/pages/database/DatabasePage.svelte').catch(pageUnavailable),
  '/circles': () => import('@/pages/clubs/ClubsPage.svelte').catch(pageUnavailable),
  '/circles/:id/:exportFormat': () => import('@/pages/clubs/ClubDetailsPage.svelte').catch(pageUnavailable),
  '/circles/:id': () => import('@/pages/clubs/ClubDetailsPage.svelte').catch(pageUnavailable),
  '/rankings': () => import('@/pages/rankings/RankingsPage.svelte').catch(pageUnavailable),
  '/activity/:viewerId': () => import('@/pages/activity/ActivityPage.svelte').catch(pageUnavailable),
  '/activity': () => import('@/pages/activity/ActivityPage.svelte').catch(pageUnavailable),
  '/timeline': () => import('@/pages/timeline/TimelinePage.svelte').catch(pageUnavailable),
  '/tierlist': () => import('@/pages/tierlist/TierlistPage.svelte').catch(pageUnavailable),
  '/tools/statistics': () => import('@/pages/statistics/StatisticsPage.svelte').catch(pageUnavailable),
  '/tools/lineage-planner': () => import('@/pages/lineage-planner/LineagePlannerPage.svelte').catch(pageUnavailable),
  '/tools': () => import('@/pages/tools/ToolsPage.svelte').catch(pageUnavailable),
  '/privacy-policy': () => import('@/pages/privacy/PrivacyPage.svelte').catch(pageUnavailable),
  '/login': () => import('@/pages/auth/LoginPage.svelte').catch(pageUnavailable),
  '/signin': () => import('@/pages/auth/AuthCallbackPage.svelte').catch(pageUnavailable),
  '/veterans': () => import('@/pages/veterans/VeteransBrowserPage.svelte').catch(pageUnavailable),
  '/veterans/:accountId': () => import('@/pages/veterans/ProfileVeteransPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/veterans': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/cm': () => import('@/pages/cm-logs/CmLogsPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/achievements': () => import('@/pages/profile/ProfilePlaceholderPage.svelte').catch(pageUnavailable),
  '/profile/:accountId/titles': () => import('@/pages/profile/ProfilePlaceholderPage.svelte').catch(pageUnavailable),
  '/profile/:accountId': () => import('@/pages/profile/ProfilePage.svelte').catch(pageUnavailable),
  '/settings': () => import('@/pages/settings/SettingsPage.svelte').catch(pageUnavailable),
  '/wip': () => import('@/pages/errors/WipPage.svelte').catch(pageUnavailable),
  '/inheritance': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/support-cards': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/shame/:viewerId': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable),
  '/shame': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable)
} as const;

const productRoutes = {
  hooks: {
    beforeLoad: (context: { pathname: string }) => { pendingRoute.set(context.pathname); preloadPageData(context); },
    afterLoad: () => { pendingRoute.set(null); void import('@/lib/catalog/resource-repository').then(({ resourceRepository }) => resourceRepository.revalidate()).catch(() => {}); },
    onError: () => { pendingRoute.set(null); },
    onPreload: preloadPageData
  },
  ...pageRoutes,
  '*': () => import('./LegacyRedirectPage.svelte').catch(pageUnavailable)
} as const;

// The gallery is available by direct URL only and stays out of the initial bundle.
export const router = createRouter({
  ...productRoutes,
  '/ui': () => import('@/pages/ui/UiLabPage.svelte').catch(pageUnavailable),
  '/ui-lab': () => import('@/pages/ui/UiLabPage.svelte').catch(pageUnavailable)
});

import { createRouter } from 'sv-router';
import FoundationGatePage from '../../features/foundation/FoundationGatePage.svelte';
import NotFoundPage from '../../features/foundation/NotFoundPage.svelte';

const labRoutes = {
  '/': () => import('../../features/ui-lab/UiLabPage.svelte'),
  '/ui-lab': () => import('../../features/ui-lab/UiLabPage.svelte'),
  '*': NotFoundPage
} as const;

const productionRoutes = {
  '/': FoundationGatePage,
  '*': NotFoundPage
} as const;

export const router = createRouter(__UI_LAB_ENABLED__ ? labRoutes : productionRoutes);

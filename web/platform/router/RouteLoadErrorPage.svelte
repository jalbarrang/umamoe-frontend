<script lang="ts">
  import { routeDefinitionForPath } from './route-manifest';
  import { router } from './router';
  import AppPage from '../../ui/layout/AppPage.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  const route = $derived(routeDefinitionForPath(router.route.pathname));
</script>

<AppPage routeId={route?.id ?? 'page-error'} title={route?.title ?? 'Page unavailable'} width={route?.width ?? 'normal'}>
  <Banner tone="danger" title="This page could not be loaded">
    <p>The page files could not be downloaded. Reload to try again; your saved data has not been changed.</p>
    <Button variant="secondary" icon="refresh" onclick={() => location.reload()}>Reload page</Button>
  </Banner>
</AppPage>

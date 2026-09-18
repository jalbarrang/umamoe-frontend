<script lang="ts">
  import AdRegion from './AdRegion.svelte';
  import { adSurfaceForRoute, fuseIdForPlacement } from '@/services/ads/ad-slots';

  let { routeId, index = 1, railAlternative }: { routeId: string; index?: number; railAlternative?: boolean } = $props();
  const surface = $derived(adSurfaceForRoute(routeId));
</script>

{#if surface}
  <AdRegion placement={`${surface}_interscroller_${index}`} kind="inline" sizes={['728x90', '320x100', '320x50']} active railAlternative={railAlternative ?? Boolean(fuseIdForPlacement(`${surface}_sticky_vrec_right`))}/>
{/if}

<script lang="ts">
  import type { Snippet } from 'svelte';
  import AdRegion from './AdRegion.svelte';
  import PageFrame from './PageFrame.svelte';
  import PageHeading from './PageHeading.svelte';
  import type { PageWidth } from './breakpoints';

  interface Props {
    children: Snippet;
    routeId: string;
    title: string;
    description?: string;
    metadata?: string;
    eyebrow?: string;
    tone?: 'brand' | 'primary' | 'warning' | 'rainbow';
    width?: PageWidth;
    actions?: Snippet;
    flush?: boolean;
    fullBleed?: boolean;
    adsEnabled?: boolean;
    fill?: boolean;
    mobileHeading?: 'default' | 'actions-only';
  }

  let { children, routeId, title, description, metadata, eyebrow, tone = 'brand', width = 'normal', actions, flush = false, fullBleed = false, adsEnabled = !fullBleed, fill = false, mobileHeading = 'default' }: Props = $props();
</script>

<PageFrame {routeId} featureId={routeId} pageTitle={title} {width} {fullBleed} {fill} {adsEnabled} labelledby={`${routeId}-title`}>
  {#snippet leftAd()}<AdRegion placement={`${routeId}_sticky_vrec_left`} kind="rail" sizes={['160x600', '120x600']} active/>{/snippet}
  {#snippet rightAd()}<AdRegion placement={`${routeId}_sticky_vrec_right`} kind="rail" sizes={['160x600', '120x600']} active/>{/snippet}
  <main class="app-page" class:flush class:fill class:full-bleed={fullBleed} style:--heading-max={width === 'wide' ? 'var(--page-content-wide)' : 'var(--page-content-normal)'}>
    <PageHeading {title} id={`${routeId}-title`} {description} {metadata} {eyebrow} {tone} {actions} {flush} {mobileHeading}/>
    <div class="page-sections">{@render children()}</div>
  </main>
</PageFrame>

<style>
  .app-page { min-width: 0; padding-block: 0 var(--space-12); background: var(--bg-primary); }
  .full-bleed :global(.page-heading) { width:min(100%,var(--heading-max)); margin-inline:auto; }
  .page-sections { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-4); padding-inline: var(--page-gutter-current); }
  .flush .page-sections { gap: 0; padding-inline: 0; }
  .app-page.fill { display: flex; flex-direction: column; flex: 1 1 0px; min-height: 0; padding-bottom: 0; }
  .fill :global(.page-heading) { flex: none; }
  .fill .page-sections { display: flex; flex-direction: column; flex: 1 1 0px; min-height: 0; }
  @media (max-width: 767px) {
    .app-page { padding-block: 0 calc(var(--bottom-nav-height) + var(--space-4)); }
    .page-sections { padding-inline: 0; }
  }
</style>

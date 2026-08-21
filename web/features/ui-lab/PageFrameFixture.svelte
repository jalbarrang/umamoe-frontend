<script lang="ts">
  import AdRegion from '../../ui/layout/AdRegion.svelte';
  import PageFrame from '../../ui/layout/PageFrame.svelte';
  import { shellLayoutForWidth } from '../../ui/layout/breakpoints';

  interface Props { width: number; }
  let { width }: Props = $props();
  const mode = $derived(shellLayoutForWidth(width));
</script>

<div class="stage">
  <div class="frame" style:width="{width}px" data-page-frame-mode={mode}>
    <PageFrame routeId="database" featureId="catalog" pageTitle="Database" labelledby="fixture-page-title">
      {#snippet navigation()}<a href="#navigation">Home</a><span aria-hidden="true">/</span><a href="#data">Database</a>{/snippet}
      {#snippet header()}<p>Catalog</p><h3 id="fixture-page-title">Database</h3><small>Search characters, skills, factors, and Veterans.</small>{/snippet}
      {#snippet contentTopAd()}<AdRegion placement="database_content_top" kind="leaderboard" sizes={['1200x90', '970x90', '728x90', '320x50', '300x50']} active preview/>{/snippet}
      {#snippet leftAd()}<AdRegion placement="database_sticky_vrec_left" kind="rail" sizes={['160x600', '120x600']} active preview/>{/snippet}
      {#snippet rightAd()}<AdRegion placement="database_sticky_vrec_right" kind="rail" sizes={['160x600', '120x600']} active preview/>{/snippet}
      <section class="results" aria-labelledby="fixture-results-title" data-section-id="database-results">
        <h4 id="fixture-results-title">Results</h4>
        <div class="cards"><article></article><article></article><article></article></div>
      </section>
    </PageFrame>
  </div>
</div>

<style>
  .stage { max-width: 100%; overflow-x: auto; padding-bottom: var(--space-2); }
  .frame { min-width: 0; min-height: 390px; overflow: hidden; border-radius: var(--radius-md); background: var(--color-canvas); box-shadow: inset 0 0 0 1px var(--color-border-strong); }
  :global(.frame [data-page-navigation]) { display: flex; align-items: center; gap: 6px; padding-top: 12px; color: var(--color-text-subtle); font-size: 9px; }
  :global(.frame [data-page-navigation] a) { color: var(--color-text-muted); text-decoration: none; }
  :global(.frame [data-page-header] p) { margin: 0; color: var(--color-accent); font-size: 9px; font-weight: 800; text-transform: uppercase; }
  :global(.frame [data-page-header] h3) { margin: 2px 0; font-size: 20px; }
  :global(.frame [data-page-header] small) { color: var(--color-text-muted); font-size: 10px; }
  .results h4 { margin: 0 0 10px; font-size: 12px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); gap: 8px; }
  .cards article { height: 82px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); }
</style>

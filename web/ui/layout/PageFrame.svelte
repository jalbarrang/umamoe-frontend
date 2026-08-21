<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    routeId: string;
    featureId?: string;
    pageTitle: string;
    labelledby?: string;
    contentId?: string;
    navigation?: Snippet;
    header?: Snippet;
    contentTopAd?: Snippet;
    leftAd?: Snippet;
    rightAd?: Snippet;
  }

  let {
    children,
    routeId,
    featureId = routeId,
    pageTitle,
    labelledby,
    contentId,
    navigation,
    header,
    contentTopAd,
    leftAd,
    rightAd
  }: Props = $props();

  const resolvedContentId = $derived(contentId ?? `${routeId}-content`);
  const hasBalancedRails = $derived(Boolean(leftAd && rightAd));
</script>

<div class="page-boundary" data-page-frame>
  <article
    class="page-grid"
    class:has-balanced-rails={hasBalancedRails}
    aria-labelledby={labelledby}
    data-route-id={routeId}
    data-feature-id={featureId}
    data-page-layout="ad-aware"
  >
    <section class="page-content" id={resolvedContentId} data-page-content>
      {#if navigation}<nav aria-label="{pageTitle} navigation" data-page-navigation>{@render navigation()}</nav>{/if}
      {#if header}<header data-page-header>{@render header()}</header>{/if}
      {#if contentTopAd}<div class="content-top-ad" data-ad-position="content-top">{@render contentTopAd()}</div>{/if}
      <div class="page-body" data-page-body>{@render children()}</div>
    </section>
    {#if hasBalancedRails && leftAd && rightAd}
      <div class="ad-rail ad-rail--left" data-ad-position="left-rail">{@render leftAd()}</div>
      <div class="ad-rail ad-rail--right" data-ad-position="right-rail">{@render rightAd()}</div>
    {/if}
  </article>
</div>

<style>
  .page-boundary { width: 100%; min-width: 0; container: page-frame / inline-size; }
  .page-grid {
    --page-gutter-current: var(--page-gutter-mobile);
    width: min(100%, var(--page-frame-max));
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'content';
    gap: var(--ad-rail-gap);
    margin-inline: auto;
    padding-inline: var(--page-gutter-current);
  }
  .page-content { width: min(100%, var(--page-content-max)); min-width: 0; grid-area: content; justify-self: center; }
  .page-content > nav { margin-bottom: var(--space-3); }
  .page-content > header { margin-bottom: var(--space-5); }
  .content-top-ad { margin: 0 0 var(--space-5); }
  .page-body { min-width: 0; }
  .ad-rail { display: none; align-self: start; position: sticky; top: calc(var(--utility-height) + var(--space-4)); }
  .ad-rail--left { grid-area: left-ad; }
  .ad-rail--right { grid-area: right-ad; }

  @container page-frame (min-width: 768px) {
    .page-grid { --page-gutter-current: var(--page-gutter-compact); }
  }

  @container page-frame (min-width: 1280px) {
    .page-grid { --page-gutter-current: var(--page-gutter-expanded); }
  }

  /* Publift rails are atomic and balanced: two 160px reserves (also accepting 120px creatives), or none. */
  @container page-frame (min-width: 1384px) {
    .page-grid.has-balanced-rails { grid-template-columns: var(--ad-rail-width) minmax(960px, 1fr) var(--ad-rail-width); grid-template-areas: 'left-ad content right-ad'; }
    .page-grid.has-balanced-rails .ad-rail--left,
    .page-grid.has-balanced-rails .ad-rail--right { display: block; }
  }
</style>

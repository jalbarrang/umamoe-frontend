<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageWidth } from './breakpoints';

  interface Props {
    children: Snippet;
    routeId: string;
    featureId?: string;
    pageTitle: string;
    width?: PageWidth;
    labelledby?: string;
    contentId?: string;
    navigation?: Snippet;
    header?: Snippet;
    leftAd?: Snippet;
    rightAd?: Snippet;
  }

  let {
    children,
    routeId,
    featureId = routeId,
    pageTitle,
    width = 'medium',
    labelledby,
    contentId,
    navigation,
    header,
    leftAd,
    rightAd
  }: Props = $props();

  const resolvedContentId = $derived(contentId ?? `${routeId}-content`);
  const hasAdRails = $derived(Boolean(leftAd && rightAd));
</script>

<div class="page-boundary" data-page-frame>
  <article
    class="page-grid"
    class:has-ad-rails={hasAdRails}
    aria-labelledby={labelledby}
    data-route-id={routeId}
    data-feature-id={featureId}
    data-page-layout="ad-aware"
    data-page-width={width}
    class:page-grid--wide={width === 'wide'}
  >
    <section class="page-content" id={resolvedContentId} data-page-content>
      {#if navigation}<nav aria-label="{pageTitle} navigation" data-page-navigation>{@render navigation()}</nav>{/if}
      {#if header}<header data-page-header>{@render header()}</header>{/if}
      <div class="page-body" data-page-body>{@render children()}</div>
    </section>
    {#if hasAdRails && leftAd && rightAd}
      <div class="ad-rail ad-rail--left" data-ad-position="left-rail">{@render leftAd()}</div>
      <div class="ad-rail ad-rail--right" data-ad-position="right-rail">{@render rightAd()}</div>
    {/if}
  </article>
</div>

<style>
  .page-boundary { width: 100%; min-width: 0; container: page-frame / inline-size; }
  .page-grid {
    --page-gutter-current: var(--page-gutter-mobile);
    --page-content-current: var(--page-content-medium);
    --page-frame-current: var(--page-frame-medium);
    width: min(100%, var(--page-frame-current));
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'content';
    gap: var(--ad-rail-gap);
    margin-inline: auto;
    padding-inline: var(--page-gutter-current);
  }
  .page-grid--wide { --page-content-current: var(--page-content-wide); --page-frame-current: var(--page-frame-wide); }
  .page-content { width: min(100%, var(--page-content-current)); min-width: 0; grid-area: content; justify-self: center; }
  .page-content > nav { margin-bottom: var(--space-3); }
  .page-content > header { margin-bottom: var(--space-5); }
  .page-body { min-width: 0; }
  .ad-rail {
    display: none;
    align-self: start;
    position: sticky;
    top: max(
      calc(var(--page-viewport-top, 0px) + var(--utility-height) + var(--space-4)),
      calc(var(--page-viewport-top, 0px) + var(--utility-height) + (var(--page-viewport-height, 100dvh) - var(--utility-height) - var(--ad-rail-height)) / 2)
    );
  }
  .ad-rail--left { grid-area: left-ad; }
  .ad-rail--right { grid-area: right-ad; }

  @container app-viewport (min-width: 768px) {
    .page-grid { --page-gutter-current: var(--page-gutter-compact); }
  }

  @container app-viewport (min-width: 1800px) {
    .page-grid { --page-gutter-current: var(--page-gutter-expanded); }
  }

  /* Preserve one far-right Publift rail by keeping the site navigation compact. */
  @container app-viewport (min-width: 1280px) and (max-width: 1799px) {
    .page-grid.has-ad-rails { grid-template-columns: minmax(0, 1fr) var(--ad-rail-width); grid-template-areas: 'content right-ad'; }
    .page-grid.has-ad-rails .ad-rail--right { display: block; }
  }

  /* At the 1080p scale, one 240px counter-rail balances the 240px navigation rail. */
  @container app-viewport (min-width: 1800px) and (max-width: 2199px) {
    .page-grid.has-ad-rails { grid-template-columns: minmax(0, 1fr) var(--rail-expanded); grid-template-areas: 'content right-ad'; gap: 0; }
    .page-grid.has-ad-rails .ad-rail--right { display: block; }
  }

  /* The larger 2560-class scale has room for a balanced pair of Publift rails. */
  @container app-viewport (min-width: 2200px) {
    .page-grid.has-ad-rails { grid-template-columns: var(--ad-rail-width) minmax(960px, 1fr) var(--ad-rail-width); grid-template-areas: 'left-ad content right-ad'; }
    .page-grid.has-ad-rails .ad-rail--left,
    .page-grid.has-ad-rails .ad-rail--right { display: block; }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';
  import { fuseIdForPlacement } from '../../platform/ads/ad-slots';
  import { registerFuseZone } from '../../platform/ads/fuse-ads';

  export type AdRegionKind = 'leaderboard' | 'inline' | 'rail';

  interface Props {
    placement: string;
    kind: AdRegionKind;
    sizes: string[];
    active?: boolean;
    preview?: boolean;
    railAlternative?: boolean;
    children?: Snippet;
  }

  let { placement, kind, sizes, active = false, preview = false, railAlternative = false, children }: Props = $props();
  const elementId = $derived(`ad-${placement.replaceAll(/[^a-zA-Z0-9_-]/g, '-')}`);
  const fuseId = $derived(fuseIdForPlacement(placement));
  onMount(() => active && !preview ? registerFuseZone(elementId, fuseId) : undefined);
</script>

{#if active}
  <aside
    id={`${elementId}-region`}
    class="ad-region ad-region--{kind}"
    class:preview
    class:rail-alternative={railAlternative}
    aria-label="Sponsored content"
    data-ad-kind={kind}
    data-ad-placement={placement}
    data-ad-sizes={sizes.join(',')}
    data-ad-behavior={railAlternative ? 'rail-alternative' : 'persistent'}
  >
    <div class="ad-target" id={elementId} data-fuse={fuseId} data-ad-target={placement}>
      {#if children}{@render children()}{:else if preview}<span><strong>Sponsored</strong><small>{placement} · {sizes.join(' / ')}</small></span>{/if}
    </div>
  </aside>
{/if}

<style>
  .ad-region { min-width: 0; display: grid; place-items: center; margin-inline: auto; overflow: hidden; contain: layout; }
  .ad-target { width: 100%; height: 100%; display: grid; place-items: center; }
  .ad-region--leaderboard,
  .ad-region--inline { width: calc(100% + var(--page-gutter-current, 16px) + var(--page-gutter-current, 16px) - 4px); max-width: 1200px; min-height: var(--ad-mobile-height); margin-inline: calc(0px - var(--page-gutter-current, 16px) + 2px); }
  .ad-region--inline { min-height: var(--ad-inline-mobile-height); }
  .ad-region--rail { width: var(--ad-rail-width); height: var(--ad-rail-height); }
  .preview { border: 1px dashed var(--color-border-strong); background: var(--color-surface-1); color: var(--color-text-subtle); }
  .preview span { display: grid; place-items: center; gap: 2px; padding: var(--space-2); text-align: center; }
  .preview strong { color: var(--color-text-muted); font-size: 9px; text-transform: uppercase; letter-spacing: .08em; }
  .preview small { max-width: 100%; overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }

  @container app-viewport (min-width: 768px) {
    .ad-region--leaderboard,
    .ad-region--inline { width: 100%; min-height: var(--ad-leaderboard-height); margin-inline: auto; }
  }

  @container app-viewport (min-width: 1280px) {
    .rail-alternative { display: none; }
  }
</style>

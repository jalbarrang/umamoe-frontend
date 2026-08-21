<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  interface Props { items: T[]; rowHeight: number; height?: number; overscan?: number; label: string; row: Snippet<[T, number]>; }
  let { items, rowHeight, height = 360, overscan = 5, label, row }: Props = $props();
  let scrollTop = $state(0);
  const start = $derived(Math.max(0, Math.floor(scrollTop / rowHeight) - overscan));
  const count = $derived(Math.ceil(height / rowHeight) + overscan * 2);
  const end = $derived(Math.min(items.length, start + count));
  const visible = $derived(items.slice(start, end));
</script>

<div class="viewport" style:height="{height}px" role="list" aria-label={label} onscroll={(event) => scrollTop = event.currentTarget.scrollTop}>
  <div class="spacer" style:height="{items.length * rowHeight}px">
    <div class="window" style:transform="translateY({start * rowHeight}px)">
      {#each visible as item, index}<div role="listitem" style:height="{rowHeight}px">{@render row(item, start + index)}</div>{/each}
    </div>
  </div>
</div>

<style>
  .viewport { overflow: auto; contain: strict; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); }
  .spacer { position: relative; }
  .window { position: absolute; inset: 0 0 auto; will-change: transform; }
</style>

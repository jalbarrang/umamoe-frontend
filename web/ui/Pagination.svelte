<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { page?: number; pages: number; label?: string; showPageNumbers?: boolean; onchange?: (page: number) => void; }
  let { page = $bindable(1), pages, label = 'Pagination', showPageNumbers = true, onchange }: Props = $props();
  const visiblePages = $derived(pages <= 5 ? Array.from({ length: pages }, (_, index) => index + 1) : Array.from(new Set([1, page, pages])).filter(value => value >= 1 && value <= pages).sort((a, b) => a - b));
  function select(next: number) { page = Math.max(1, Math.min(pages, next)); onchange?.(page); }
</script>

<nav aria-label={label}>
  <button type="button" aria-label="Previous page" disabled={page === 1} onclick={() => select(page - 1)}><Icon name="chevron" size={17}/></button>
  {#each showPageNumbers ? visiblePages : [] as current, index}
    {#if index > 0 && current - (visiblePages[index - 1] ?? 0) > 1}<span>…</span>{/if}
    <button type="button" class:active={current === page} aria-current={current === page ? 'page' : undefined} onclick={() => select(current)}>{current}</button>
  {/each}
  <button class="next" type="button" aria-label="Next page" disabled={page >= pages} onclick={() => select(page + 1)}><Icon name="chevron" size={17}/></button>
</nav>

<style>
  nav { max-width: 100%; display: flex; align-items: center; gap: 4px; }
  button { min-width: var(--touch-target); height: var(--touch-target); display: grid; place-items: center; padding: 0 var(--space-2); border: 1px solid transparent; border-radius: var(--radius-md); background: transparent; color: var(--color-text-muted); cursor: pointer; font-weight: 700; }
  button:hover:not(:disabled) { background: var(--color-surface-2); color: var(--color-text); }
  button.active { border-color: var(--color-border); background: var(--color-accent-soft); color: var(--color-accent); }
  button:disabled { opacity: .35; cursor: not-allowed; }
  button:first-child :global(svg) { transform: rotate(90deg); } .next :global(svg) { transform: rotate(-90deg); }
  span { color: var(--color-text-subtle); }
</style>

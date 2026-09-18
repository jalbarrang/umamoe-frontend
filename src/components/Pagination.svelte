<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { page?: number; pages: number; label?: string; showPageNumbers?: boolean; total?: number; pageSize?: number; jump?: boolean; onchange?: (page: number) => void; }
  let { page = $bindable(1), pages, label = 'Pagination', showPageNumbers = true, total, pageSize, jump = false, onchange }: Props = $props();
  const inputId = $props.id();
  let destination = $state<number | undefined>(page);
  $effect(() => { destination = page; });
  const visiblePages = $derived.by(() => {
    const start = Math.max(1, Math.min(page - 2, pages - 4));
    return [...new Set([1, ...Array.from({ length: Math.min(5, pages) }, (_, index) => start + index), pages])].filter(value => value > 0).sort((a, b) => a - b);
  });
  function select(next: number) {
    if (!Number.isFinite(next)) return;
    const selected = Math.max(1, Math.min(pages, Math.trunc(next)));
    destination = selected;
    if (selected !== page) { page = selected; onchange?.(page); }
  }
</script>

<nav aria-label={label} class:with-summary={total !== undefined} class:with-jump={jump}>
  {#if total !== undefined && pageSize}<span class="summary" aria-live="polite"><strong>{Math.min(total, (page - 1) * pageSize + 1).toLocaleString()}–{Math.min(total, page * pageSize).toLocaleString()}</strong> of {total.toLocaleString()} results</span>{/if}
  <div class="controls">
    <button class="previous" type="button" aria-label="Previous page" disabled={page <= 1} onclick={() => select(page - 1)}><Icon name="chevron" size={17}/>{#if jump}<span>Previous</span>{/if}</button>
    {#if showPageNumbers}<div class="page-numbers">{#each visiblePages as current, index}
      {#if index > 0 && current - (visiblePages[index - 1] ?? 0) > 1}<span class="gap" aria-hidden="true">…</span>{/if}
      <button type="button" class:active={current === page} aria-label={`Page ${current}`} aria-current={current === page ? 'page' : undefined} onclick={() => select(current)}>{current}</button>
    {/each}</div>{/if}
    {#if jump}<form onsubmit={(event) => { event.preventDefault(); if (destination !== undefined) select(destination); }}>
      <label for={inputId}>Page</label><input id={inputId} type="number" inputmode="numeric" min="1" max={pages} step="1" required bind:value={destination} aria-label="Go to page"/><span>of {pages.toLocaleString()}</span><button type="submit">Go</button>
    </form>{/if}
    <button class="next" type="button" aria-label="Next page" disabled={page >= pages} onclick={() => select(page + 1)}>{#if jump}<span>Next</span>{/if}<Icon name="chevron" size={17}/></button>
  </div>
</nav>

<style>
  nav { max-width:100%; display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:12px 20px; font-size:var(--font-sm); font-variant-numeric:tabular-nums; }
  nav.with-summary { justify-content:space-between; padding-block:16px; border-top:1px solid var(--color-border); }
  .summary { color:var(--color-text-muted); font-size:var(--font-xs); }.summary strong { color:var(--color-text); font-weight:600; }
  .controls,.page-numbers,form { display:flex; align-items:center; gap:4px; }.controls { flex-wrap:wrap; justify-content:center; }
  button { min-width:36px; min-height:36px; display:flex; align-items:center; justify-content:center; gap:6px; padding:0 10px; border:1px solid transparent; border-radius:var(--radius-sm); background:transparent; color:var(--color-text-muted); cursor:pointer; font:inherit; font-weight:600; }
  button:hover:not(:disabled) { background: var(--color-surface-2); color: var(--color-text); }
  button.active { border-color:var(--color-accent); background:var(--color-accent-soft); color:var(--color-accent); }
  .with-jump .previous,.with-jump .next { border-color:var(--color-border); color:var(--color-text); }
  button:disabled { opacity: .35; cursor: not-allowed; }
  .previous :global(svg) { transform:rotate(90deg); }.next :global(svg) { transform:rotate(-90deg); }
  .gap { padding-inline:3px; color:var(--color-text-subtle); }
  form { margin-inline:8px; color:var(--color-text-muted); font-size:var(--font-xs); white-space:nowrap; }form input { width:58px; min-height:36px; padding:5px; border:1px solid var(--color-border); border-radius:var(--radius-sm); background:var(--factor-field-bg); color:var(--color-text); font:inherit; text-align:center; appearance:textfield; }input::-webkit-inner-spin-button,input::-webkit-outer-spin-button { appearance:none; }form button { color:var(--color-accent); }
  button:focus-visible,input:focus-visible { outline:2px solid var(--color-accent); outline-offset:2px; }
  @media(max-width:767px) { nav.with-summary { justify-content:center; gap:8px; }.summary { flex-basis:100%; text-align:center; }.with-jump .page-numbers { display:none; }.with-jump .previous>span,.with-jump .next>span { display:none; }button,form input { min-height:44px; }button { min-width:44px; }.controls { gap:4px; }form { margin-inline:0; gap:5px; } }
</style>

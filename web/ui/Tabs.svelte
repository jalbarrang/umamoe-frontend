<script lang="ts">
  export interface TabItem { id: string; label: string; badge?: string; }
  interface Props { items: TabItem[]; value?: string; label?: string; onchange?: (value: string) => void; }
  let { items, value = $bindable(''), label = 'Sections', onchange }: Props = $props();
  function select(id: string) { value = id; onchange?.(id); }
</script>
<div class="tabs" role="tablist" aria-label={label}>{#each items as item}<button role="tab" aria-selected={value === item.id} class:active={value === item.id} onclick={() => select(item.id)}>{item.label}{#if item.badge}<small>{item.badge}</small>{/if}</button>{/each}</div>
<style>
  .tabs { display: flex; gap: 2px; max-width: 100%; padding: 3px; overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-2); scrollbar-width: none; }
  button { min-height: 38px; padding: 0 var(--space-3); flex: 0 0 auto; border: 0; border-radius: calc(var(--radius-md) - 3px); background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: var(--font-sm); font-weight: 700; }
  button:hover { color: var(--color-text); } button.active { background: var(--color-surface-1); color: var(--color-accent); box-shadow: var(--shadow-sm); }
  small { margin-left: 6px; color: var(--color-text-subtle); }
</style>

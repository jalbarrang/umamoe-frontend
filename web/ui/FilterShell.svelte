<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import SegmentedControl from './SegmentedControl.svelte';
  interface Props { title?: string; activeCount?: number; modes?: string[]; mode?: string; expanded?: boolean; tools?: Snippet; children: Snippet; onclear?: () => void; }
  let { title = 'Filters', activeCount = 0, modes = ['Basic', 'Advanced'], mode = $bindable('Basic'), expanded = $bindable(true), tools, children, onclear }: Props = $props();
  const options = $derived(modes.map((item) => ({ value: item.toLowerCase(), label: item })));
</script>

<section class="filter-shell" class:open={expanded}>
  <header>
    <button class="filter-heading" type="button" aria-expanded={expanded} onclick={() => expanded = !expanded}><span class="chevron"><Icon name="chevron" size={16}/></span><strong>{title}</strong>{#if activeCount}<small>{activeCount} active</small>{/if}</button>
    <div class="filter-tools">{#if tools}{@render tools()}{/if}{#if activeCount && onclear}<button type="button" class="clear" onclick={onclear}>Clear</button>{/if}<SegmentedControl label="Filter mode" {options} value={mode.toLowerCase()} onchange={(value) => mode = value}/></div>
  </header>
  {#if expanded}<div class="filter-content">{@render children()}</div>{/if}
</section>

<style>
  .filter-shell { min-width: 0; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  header { min-height: 52px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 6px var(--space-3); }
  .filter-heading { min-height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 5px; border: 0; background: transparent; cursor: pointer; }
  .filter-heading strong { font-size: var(--font-md); } .filter-heading small { padding: 2px 6px; border-radius: var(--radius-pill); background: var(--color-accent-soft); color: var(--color-accent); font-size: 9px; }
  .chevron { color: var(--color-text-subtle); transform: rotate(-90deg); transition: transform var(--duration-fast); } .open .chevron { transform: rotate(0); }
  .filter-tools { display: flex; align-items: center; justify-content: flex-end; gap: 6px; }
  .clear { min-height: 36px; padding: 0 9px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-danger); cursor: pointer; font-size: var(--font-xs); font-weight: 700; }
  .filter-content { padding: 0 var(--space-3) var(--space-3); border-top: 1px solid var(--border-subtle); }
  @media (max-width: 640px) { header { align-items: stretch; flex-direction: column; } .filter-heading { width: 100%; } .filter-tools { display: grid; grid-template-columns: minmax(0, 1fr) auto; justify-content: stretch; } .filter-tools :global(.segments) { width: 100%; grid-column: 1 / -1; } .filter-tools :global(.segments button) { min-width: 0; flex: 1 1 0; padding-inline: 8px; } }
</style>

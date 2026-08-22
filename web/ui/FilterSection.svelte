<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  interface Props { title: string; description?: string; count?: number; open?: boolean; children: Snippet; }
  let { title, description, count, open = $bindable(true), children }: Props = $props();
</script>

<details bind:open>
  <summary><span class="chevron"><Icon name="chevron" size={14}/></span><span><strong>{title}</strong>{#if description}<small>{description}</small>{/if}</span>{#if count !== undefined}<b>{count}</b>{/if}</summary>
  <div class="section-content">{@render children()}</div>
</details>

<style>
  details { border-bottom: 1px solid var(--border-subtle); }
  summary { min-height: 42px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 4px 3px; cursor: pointer; list-style: none; } summary::-webkit-details-marker { display: none; }
  summary > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; } strong { font-size: var(--font-sm); } small { color: var(--color-text-subtle); font-size: 9px; } summary b { color: var(--color-text-subtle); font-size: 10px; }
  .chevron { color: var(--color-text-subtle); transform: rotate(-90deg); } details[open] .chevron { transform: rotate(0); }
  .section-content { padding: 2px 3px var(--space-3) 24px; }
  @media (max-width: 520px) { .section-content { padding-left: 3px; } }
</style>

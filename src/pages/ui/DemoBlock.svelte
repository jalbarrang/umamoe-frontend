<script lang="ts">import type { Snippet } from 'svelte'; interface Props { id?: string; title: string; note?: string; children: Snippet; } let { id, title, note, children }: Props = $props();</script>
<article {id} class="demo"><header><h3>{title}</h3>{#if note}<span>{note}</span>{/if}</header><div class="canvas">{@render children()}</div></article>
<style>
  .demo { min-width: 0; overflow: visible; scroll-margin-top: calc(var(--utility-height) + var(--space-3)); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-2); }
  header { min-height: 45px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: 0 var(--space-4); border-bottom: 1px solid var(--border-subtle); background: var(--surface-1); border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
  h3 { margin: 0; font-size: var(--font-sm); }
  header span { color: var(--color-text-subtle); font-size: var(--font-xs); }
  .canvas { min-width: 0; padding: var(--space-4); }
  :global(.demo-grid) { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr)); gap: var(--space-4); }
  :global(.state-row) { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
  :global(.state-stack) { display: grid; gap: var(--space-3); }
</style>

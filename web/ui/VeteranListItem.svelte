<script lang="ts">
  import type { Snippet } from 'svelte';
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import AptitudeGrid from './AptitudeGrid.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkRow from './SparkRow.svelte';
  import type { VeteranUiRecord } from './veteran-ui-types';
  interface Props { veteran: VeteranUiRecord; selected?: boolean; actions?: Snippet; onclick?: () => void; }
  let { veteran, selected = false, actions, onclick }: Props = $props();
</script>

<article class:selected>
  <button type="button" class="veteran-select" aria-pressed={selected} aria-label={`Select ${veteran.name}`} {onclick}>
    <Artwork src={veteran.image} alt={veteran.name} size="md" rarity="★5"/>
    <div class="record">
      <header><strong>{veteran.name}</strong>{#if veteran.scenario}<small class="scenario">{veteran.scenario}</small>{/if}<RankBadge label={veteran.rank} size="sm"/><AffinityStat value={veteran.affinity} compact/></header>
      <span>{veteran.detail}{#if veteran.workspace} · {veteran.workspace}{/if}{#if veteran.updated} · {veteran.updated}{/if}</span>
      <div class="sparks">{#each veteran.sparks.slice(0, 2) as group}<SparkRow tone={group.tone} items={group.items.slice(0, 3)} showType={false}/>{/each}</div>
      {#if veteran.aptitudes?.length}<AptitudeGrid items={veteran.aptitudes.slice(0, 4)} label={`${veteran.name} key aptitudes`}/>{/if}
    </div>
  </button>
  {#if actions}<div class="actions">{@render actions()}</div>{/if}
</article>

<style>
  article { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; overflow: hidden; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); } article.selected { border-color: var(--color-accent); background: var(--color-accent-soft); }
  .veteran-select { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: start; gap: 9px; padding: 8px; border: 0; background: transparent; color: var(--color-text); cursor: pointer; text-align: left; } .veteran-select:hover { background: var(--surface-2); }
  .record { min-width: 0; display: grid; gap: 4px; } header { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; } header > strong { max-width: min(240px, 100%); overflow: hidden; font-size: var(--font-sm); text-overflow: ellipsis; white-space: nowrap; } .scenario { padding: 1px 5px; border-radius: var(--radius-sm); background: var(--color-secondary-soft); color: var(--color-secondary); font-size: 8px; font-weight: 700; } .record > span { color: var(--color-text-subtle); font-size: 9px; }
  .sparks { min-width: 0; display: grid; gap: 3px; } .sparks :global(.spark-row) { grid-template-columns: 1fr; }
  .actions { display: flex; align-items: center; gap: 2px; padding: 5px; border-left: 1px solid var(--border-subtle); }
  @media (max-width: 520px) { article { grid-template-columns: 1fr; } .actions { justify-content: flex-end; border-top: 1px solid var(--border-subtle); border-left: 0; } .veteran-select { padding: 6px; } }
</style>

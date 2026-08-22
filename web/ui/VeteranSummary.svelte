<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkRow from './SparkRow.svelte';
  import StatStrip from './StatStrip.svelte';
  import type { VeteranUiRecord } from './veteran-ui-types';
  interface Props { veteran: VeteranUiRecord; compact?: boolean; }
  let { veteran, compact = false }: Props = $props();
</script>

<article class="veteran-summary" class:compact aria-label={`${veteran.name} Veteran summary`}>
  <header><Artwork src={veteran.image} alt={veteran.name} size={compact ? 'sm' : 'md'} rarity="★5"/><div class="identity"><div><h3>{veteran.name}</h3>{#if veteran.scenario}<small>{veteran.scenario}</small>{/if}</div><span>{veteran.detail}</span><div class="identity-stats"><RankBadge label={veteran.rank} size="sm"/><AffinityStat value={veteran.affinity} kind="total" compact/>{#if veteran.raceAffinity !== undefined}<AffinityStat value={veteran.raceAffinity} kind="race" compact/>{/if}</div></div></header>
  {#if veteran.stats?.length}<StatStrip items={veteran.stats} compact/>{/if}
  <div class="sparks">{#each veteran.sparks as group}<SparkRow tone={group.tone} items={group.items}/>{/each}</div>
  {#if veteran.parents?.length}<div class="parents">{#each veteran.parents as parent (parent.id)}<section><div class="parent-id"><b>{parent.position}</b><Artwork src={parent.image} alt={parent.name} size="sm"/><span><strong>{parent.name}</strong><AffinityStat value={parent.affinity} compact/></span></div><div class="parent-sparks">{#each parent.sparks as group}<SparkRow tone={group.tone} items={group.items} showType={false}/>{/each}</div></section>{/each}</div>{/if}
</article>

<style>
  .veteran-summary { min-width: 0; display: grid; gap: 9px; padding: 10px; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  header { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 9px; } .identity { min-width: 0; display: grid; gap: 3px; } .identity > div:first-child { display: flex; align-items: baseline; gap: 7px; } h3 { min-width: 0; margin: 0; overflow: hidden; font-size: var(--font-md); text-overflow: ellipsis; white-space: nowrap; } .identity small, .identity > span { color: var(--color-text-subtle); font-size: 9px; } .identity-stats { display: flex; flex-wrap: wrap; gap: 4px; }
  .sparks { min-width: 0; display: grid; gap: 4px; }
  .parents { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; padding-top: 7px; border-top: 1px solid var(--border-subtle); } .parents section { min-width: 0; display: grid; gap: 5px; padding: 6px; background: var(--surface-1); } .parent-id { min-width: 0; display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: center; gap: 5px; } .parent-id > b { color: var(--lineage-parent); font-size: 9px; } .parent-id > span { min-width: 0; display: flex; align-items: flex-start; flex-direction: column; gap: 3px; } .parent-id strong { max-width: 100%; overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; } .parent-sparks { min-width: 0; display: grid; gap: 3px; }
  .compact { gap: 6px; padding: 7px; } .compact :global(.spark-row) { grid-template-columns: 1fr; }
  @media (max-width: 560px) { .parents { grid-template-columns: 1fr; } .veteran-summary { padding: 7px; } }
</style>

<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkItem from './SparkItem.svelte';
  import type { LineageNodeData } from './lineage-types';

  interface Props { node: LineageNodeData; selected?: boolean; onclick?: () => void; }
  let { node, selected = false, onclick }: Props = $props();
  const artworkSize = $derived(node.role === 'main' ? 'md' as const : node.role === 'parent' ? 'sm' as const : 'xs' as const);
</script>

<button type="button" class="lineage-node lineage-node--{node.role}" class:selected aria-pressed={selected} aria-label={`${node.roleLabel}: ${node.name}`} {onclick}>
  <span class="node-head">
    <Artwork src={node.image} alt={node.name} size={artworkSize}/>
    <span class="node-meta">
      <span class="name-row"><strong>{node.name}</strong><span class="role role--{node.role}">{node.roleLabel}</span></span>
      <span class="rank-row">{#if node.rank}<RankBadge label={node.rank} size="sm"/>{/if}</span>
    </span>
  </span>

  {#if node.affinity !== undefined || node.raceAffinity !== undefined}
    <span class="node-toolbar">
      {#if node.affinity !== undefined}<AffinityStat value={node.affinity} compact/>{/if}
      {#if node.raceAffinity !== undefined}<AffinityStat value={node.raceAffinity} kind="race" compact/>{/if}
    </span>
  {/if}

  {#if node.sparks?.length}
    <span class="node-sparks">
      {#each node.sparks as group}{#each group.items.slice(0, 3) as item (item.id)}<SparkItem {...item} tone={group.tone} compact/>{/each}{/each}
    </span>
  {/if}
</button>

<style>
  .lineage-node { min-width: 0; width: 100%; display: grid; gap: 6px; padding: 8px 10px; overflow: hidden; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-2); color: var(--color-text); cursor: pointer; text-align: left; transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast); }
  .lineage-node:hover { border-color: color-mix(in srgb, var(--accent-primary) 35%, var(--border-primary)); background: var(--surface-3); }
  .lineage-node.selected { border-color: color-mix(in srgb, var(--accent-primary) 55%, var(--border-primary)); background: color-mix(in srgb, var(--accent-primary) 7%, var(--surface-2)); box-shadow: 0 2px 10px rgb(0 0 0 / .18); }
  .node-head { min-width: 0; display: flex; align-items: flex-start; gap: 8px; }
  .node-meta { min-width: 0; display: grid; flex: 1; gap: 4px; }
  .name-row { min-width: 0; display: flex; align-items: center; gap: 6px; }
  .name-row strong { min-width: 0; overflow: hidden; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
  .role { flex: 0 0 auto; min-height: 19px; display: inline-flex; align-items: center; padding: 1px 6px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); font-size: 8px; font-weight: 800; white-space: nowrap; }
  .role--main { border-color: rgb(100 181 246 / .24); background: rgb(100 181 246 / .12); color: #90caf9; }
  .role--parent { border-color: rgb(186 104 200 / .24); background: rgb(186 104 200 / .12); color: #ce93d8; }
  .role--grandparent { background: rgb(176 190 197 / .1); color: #b0bec5; }
  .rank-row { min-height: 28px; display: flex; align-items: center; }
  .node-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding-top: 5px; border-top: 1px solid var(--border-subtle); }
  .node-sparks { min-width: 0; display: flex; flex-wrap: wrap; gap: 3px; }
  .lineage-node--main { box-shadow: 0 2px 12px rgb(0 0 0 / .2); }
  .lineage-node--parent { padding: 7px 9px; border-radius: var(--radius-md); }
  .lineage-node--parent .name-row strong { font-size: 12px; }
  .lineage-node--grandparent { gap: 4px; padding: 5px 7px; border-radius: var(--radius-sm); background: color-mix(in srgb, var(--color-text) 3%, var(--surface-1)); }
  .lineage-node--grandparent .name-row strong { font-size: 10px; }
  .lineage-node--grandparent .node-toolbar { padding-top: 3px; }

  @container lineage (max-width: 520px) {
    .lineage-node { gap: 4px; padding: 6px 7px; border-radius: var(--radius-md); }
    .node-head { align-items: center; gap: 6px; }
    .name-row { gap: 4px; }
    .name-row strong { font-size: 11px; }
    .rank-row { min-height: 22px; }
    .role { min-height: 17px; padding-inline: 4px; font-size: 7px; }
    .node-toolbar { padding-top: 3px; }
    .node-sparks :global(.spark:nth-child(n + 3)) { display: none; }
    .lineage-node--grandparent .node-toolbar { border-top: 0; padding-top: 0; }
  }
</style>

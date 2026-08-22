<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkItem from './SparkItem.svelte';
  import type { LineageNodeData } from './lineage-types';

  interface Props { node: LineageNodeData; selected?: boolean; onclick?: () => void; }
  let { node, selected = false, onclick }: Props = $props();
  const artworkSize = $derived(node.role === 'main' ? 'md' as const : node.role === 'parent' ? 'sm' as const : 'xs' as const);
  const roleLabel = $derived(node.role === 'grandparent' ? node.roleLabel.replace(/^.*legacy\s*/i, 'L') : node.roleLabel);
</script>

<button type="button" class="lineage-node lineage-node--{node.role}" class:selected aria-pressed={selected} aria-label={`${node.roleLabel}: ${node.name}`} {onclick}>
  <span class="portrait">
    <Artwork src={node.image} alt={node.name} size={artworkSize} shape="circle"/>
    <span class="role role--{node.role}">{roleLabel}</span>
  </span>
  <span class="node-copy">
    <span class="name-row"><strong>{node.name}</strong>{#if node.rank}<RankBadge label={node.rank} size="sm"/>{/if}</span>
    {#if node.affinity !== undefined || node.raceAffinity !== undefined}
      <span class="affinity-row">
        {#if node.affinity !== undefined}<AffinityStat value={node.affinity} compact/>{/if}
        {#if node.raceAffinity !== undefined}<AffinityStat value={node.raceAffinity} kind="race" compact/>{/if}
      </span>
    {/if}
  </span>
  {#if node.sparks?.length}
    <span class="node-sparks">
      {#each node.sparks as group}{#each group.items.slice(0, 3) as item (item.id)}<SparkItem {...item} tone={group.tone} compact/>{/each}{/each}
    </span>
  {/if}
</button>

<style>
  .lineage-node { min-width: 0; width: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 8px; padding: 7px 9px; overflow: visible; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--surface-2); color: var(--color-text); cursor: pointer; text-align: left; transition: border-color var(--duration-fast), background var(--duration-fast), box-shadow var(--duration-fast); }
  .lineage-node:hover { border-color: rgb(var(--accent-primary-rgb) / .36); background: color-mix(in srgb, var(--accent-primary) 4%, var(--surface-2)); }
  .lineage-node.selected { border-color: rgb(var(--accent-primary-rgb) / .58); background: color-mix(in srgb, var(--accent-primary) 7%, var(--surface-2)); box-shadow: 0 2px 10px rgb(0 0 0 / .18); }
  .portrait { position: relative; display: inline-flex; }
  .role { position: absolute; right: -4px; bottom: -3px; min-height: 17px; display: inline-flex; align-items: center; justify-content: center; padding: 1px 5px; border: 1px solid var(--border-subtle); border-radius: var(--radius-xs); background: var(--surface-overlay, var(--surface-3)); font-size: 7px; font-weight: 850; line-height: 1; white-space: nowrap; }
  .role--main { border-color: rgb(100 181 246 / .32); color: #90caf9; }
  .role--parent { border-color: rgb(186 104 200 / .32); color: #ce93d8; }
  .role--grandparent { color: #b0bec5; }
  .node-copy { min-width: 0; display: grid; gap: 3px; }
  .name-row { min-width: 0; display: flex; align-items: center; gap: 5px; }
  .name-row strong { min-width: 0; overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  .name-row :global(.rank--sm) { width: 24px; height: 24px; }
  .affinity-row { min-width: 0; display: flex; flex-wrap: wrap; gap: 3px; }
  .node-sparks { grid-column: 1 / -1; min-width: 0; display: flex; flex-wrap: wrap; gap: 3px; padding-top: 4px; border-top: 1px solid var(--border-subtle); }
  .lineage-node--main { min-width: 280px; }
  .lineage-node--main .name-row strong { font-size: 13px; }
  .lineage-node--parent { max-width: 240px; }
  .lineage-node--grandparent { max-width: 170px; padding: 5px 7px; border-radius: var(--radius-sm); background: color-mix(in srgb, var(--color-text) 3%, var(--surface-1)); }
  .lineage-node--grandparent .name-row strong { font-size: 10px; }
  .lineage-node--grandparent .name-row :global(.rank--sm) { width: 20px; height: 20px; }
  .lineage-node--grandparent :global(.affinity) { min-height: 18px; font-size: 9px; }

  @container lineage (max-width: 700px) {
    .lineage-node, .lineage-node--main, .lineage-node--parent, .lineage-node--grandparent { width: 100%; max-width: none; min-width: 0; }
    .lineage-node { min-height: 50px; padding: 5px 7px; }
    .lineage-node--main { min-height: 58px; }
    .name-row strong, .lineage-node--main .name-row strong { font-size: 11px; }
    .lineage-node--grandparent .name-row strong { font-size: 10px; }
    .node-sparks :global(.spark:nth-child(n + 3)) { display: none; }
  }
</style>

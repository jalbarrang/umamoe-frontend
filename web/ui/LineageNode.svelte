<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkRow from './SparkRow.svelte';
  import type { LineageNodeData } from './lineage-types';
  interface Props { node: LineageNodeData; selected?: boolean; onclick?: () => void; }
  let { node, selected = false, onclick }: Props = $props();
</script>

<button type="button" class="lineage-node lineage-node--{node.role}" class:selected aria-pressed={selected} aria-label={`${node.roleLabel}: ${node.name}`} {onclick}>
  <span class="role">{node.roleLabel}</span><Artwork src={node.image} alt={node.name} size="sm"/><span class="identity"><strong>{node.name}</strong><span>{#if node.rank}<RankBadge label={node.rank} size="sm"/>{/if}{#if node.affinity !== undefined}<AffinityStat value={node.affinity} compact/>{/if}{#if node.raceAffinity !== undefined}<AffinityStat value={node.raceAffinity} kind="race" compact/>{/if}</span></span>
  {#if node.sparks?.length}<span class="node-sparks">{#each node.sparks.slice(0, 1) as group}<SparkRow tone={group.tone} items={group.items.slice(0, 2)} showType={false}/>{/each}</span>{/if}
</button>

<style>
  .lineage-node { --role-color: var(--lineage-parent); min-width: 0; width: 100%; display: grid; grid-template-columns: auto auto minmax(0, 1fr); align-items: center; gap: 5px; padding: 6px; border: 1px solid color-mix(in srgb, var(--role-color) 30%, var(--border-primary)); border-left: 3px solid var(--role-color); border-radius: var(--radius-md); background: var(--surface-1); color: var(--color-text); cursor: pointer; text-align: left; } .lineage-node:hover { background: var(--surface-2); } .lineage-node.selected { background: color-mix(in srgb, var(--role-color) 10%, transparent); }
  .lineage-node--main { --role-color: var(--lineage-main); } .lineage-node--grandparent { --role-color: var(--lineage-grandparent); }
  .role { grid-column: 1 / -1; color: var(--role-color); font-size: 8px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
  .identity { min-width: 0; display: grid; gap: 3px; } .identity > strong { overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; } .identity > span { display: flex; flex-wrap: wrap; gap: 3px; }
  .node-sparks { grid-column: 1 / -1; min-width: 0; } .node-sparks :global(.spark-row) { grid-template-columns: 1fr; }
</style>

<script lang="ts">
  import LineageNode from './LineageNode.svelte';
  import type { LineageBranch, LineageNodeData } from './lineage-types';
  interface Props { root: LineageNodeData; branches: LineageBranch[]; selectedId?: string; onselect?: (node: LineageNodeData) => void; }
  let { root, branches, selectedId, onselect }: Props = $props();
</script>

<section class="lineage-tree" aria-label="Veteran lineage">
  <div class="root"><LineageNode node={root} selected={selectedId === root.id} onclick={() => onselect?.(root)}/></div><span class="trunk" aria-hidden="true"></span>
  <div class="branches">{#each branches as branch (branch.id)}<div class="branch"><div class="parent"><LineageNode node={branch.parent} selected={selectedId === branch.parent.id} onclick={() => onselect?.(branch.parent)}/></div><span class="branch-line" aria-hidden="true"></span><div class="grandparents">{#each branch.grandparents as node (node.id)}<LineageNode {node} selected={selectedId === node.id} onclick={() => onselect?.(node)}/>{/each}</div></div>{/each}</div>
</section>

<style>
  .lineage-tree { min-width: 0; display: grid; grid-template-columns: minmax(128px, .75fr) 18px minmax(280px, 2fr); align-items: center; gap: 0; padding: 8px; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  .trunk, .branch-line { height: 1px; background: var(--border-secondary); }
  .branches { min-width: 0; display: grid; gap: 7px; } .branch { min-width: 0; display: grid; grid-template-columns: minmax(120px, .8fr) 14px minmax(130px, 1fr); align-items: center; } .grandparents { min-width: 0; display: grid; gap: 4px; }
  @media (max-width: 700px) { .lineage-tree { grid-template-columns: 1fr; gap: 6px; padding: 6px; } .trunk, .branch-line { width: 1px; height: 10px; margin-inline: 20px; } .branches { gap: 8px; } .branch { grid-template-columns: 1fr; } .grandparents { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 5px; } }
  @media (max-width: 390px) { .grandparents { grid-template-columns: 1fr; } }
</style>

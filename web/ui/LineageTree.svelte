<script lang="ts">
  import LineageNode from './LineageNode.svelte';
  import type { LineageBranch, LineageNodeData } from './lineage-types';

  interface Props { root: LineageNodeData; branches: LineageBranch[]; selectedId?: string; onselect?: (node: LineageNodeData) => void; }
  let { root, branches, selectedId, onselect }: Props = $props();
</script>

<div class="lineage-container">
  <section class="lineage-tree" aria-label="Veteran lineage">
    <div class="root"><LineageNode node={root} selected={selectedId === root.id} onclick={() => onselect?.(root)}/></div>
    {#if branches.length}
      <div class="root-fork tree-fork" aria-hidden="true"><i class="stem"></i><i class="bar"></i><span class="drops"><i></i><i></i></span></div>
    {/if}
    <div class="branches">
      {#each branches as branch (branch.id)}
        <section class="branch">
          <div class="parent"><LineageNode node={branch.parent} selected={selectedId === branch.parent.id} onclick={() => onselect?.(branch.parent)}/></div>
          {#if branch.grandparents.length}
            <div class="branch-fork tree-fork" aria-hidden="true"><i class="stem"></i><i class="bar"></i><span class="drops"><i></i><i></i></span></div>
          {/if}
          <div class="grandparents">
            {#each branch.grandparents as node (node.id)}<div class="legacy"><LineageNode {node} selected={selectedId === node.id} onclick={() => onselect?.(node)}/></div>{/each}
          </div>
        </section>
      {/each}
    </div>
  </section>
</div>

<style>
  .lineage-container { min-width: 0; container: lineage / inline-size; }
  .lineage-tree { --lineage-line: #5a6470; min-width: 0; display: flex; flex-direction: column; isolation: isolate; padding-top: 13px; }
  .root, .parent, .legacy { position: relative; min-width: 0; width: 100%; }
  .tree-fork { height: 36px; display: flex; flex-direction: column; align-items: center; color: var(--lineage-line); }
  .tree-fork i { display: block; background: currentColor; border-radius: 1px; }
  .tree-fork .stem { width: 2px; height: 14px; }
  .tree-fork .bar { width: 72%; min-width: 220px; max-width: 520px; height: 2px; }
  .tree-fork .drops { width: 72%; min-width: 220px; max-width: 520px; height: 20px; display: flex; justify-content: space-between; }
  .tree-fork .drops i { width: 2px; height: 100%; }
  .branches { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 10px; }
  .branch { position: relative; min-width: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto auto; align-items: stretch; }
  .parent { height: 100%; }
  .parent :global(.lineage-node) { height: 100%; }
  .branch-fork { height: 30px; }
  .branch-fork .stem { height: 10px; }
  .branch-fork .bar, .branch-fork .drops { width: 100%; min-width: 0; max-width: none; padding-inline: 28px; }
  .branch-fork .drops { height: 18px; }
  .grandparents { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: stretch; gap: 6px; }
  .legacy { height: 100%; }
  .legacy :global(.lineage-node) { height: 100%; }

  @container lineage (max-width: 700px) {
    .lineage-tree { padding: 5px 0 0; overflow: hidden; }
    .tree-fork { display: none; }
    .branches { position: relative; display: flex; flex-direction: column; gap: 14px; margin-top: 8px; padding-left: 16px; }
    .branch { display: flex; flex-direction: column; height: auto; isolation: isolate; }
    .branch::before { position: absolute; z-index: 0; top: -8px; bottom: -8px; left: -8px; width: 2px; border-radius: 1px; background: var(--lineage-line); content: ''; }
    .branch::after { position: absolute; z-index: 0; top: 28px; left: -8px; width: 10px; height: 2px; border-radius: 1px; background: var(--lineage-line); content: ''; }
    .branch:last-child::before { bottom: auto; height: 38px; }
    .grandparents { position: relative; display: flex; flex-direction: column; gap: 6px; margin-top: 6px; padding-left: 12px; }
    .legacy { height: auto; isolation: isolate; }
    .legacy::before { position: absolute; z-index: 0; top: -4px; bottom: -4px; left: -6px; width: 2px; border-radius: 1px; background: var(--lineage-line); content: ''; }
    .legacy::after { position: absolute; z-index: 0; top: 22px; left: -6px; width: 8px; height: 2px; border-radius: 1px; background: var(--lineage-line); content: ''; }
    .legacy:last-child::before { bottom: auto; height: 28px; }
    .parent, .legacy { height: auto; }
  }
</style>

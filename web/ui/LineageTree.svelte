<script lang="ts">
  import LineageNode from './LineageNode.svelte';
  import type { LineageBranch, LineageNodeData } from './lineage-types';

  interface Props { root: LineageNodeData; branches: LineageBranch[]; selectedId?: string; onselect?: (node: LineageNodeData) => void; }
  let { root, branches, selectedId, onselect }: Props = $props();
</script>

<div class="lineage-container">
  <section class="lineage-tree" aria-label="Veteran lineage">
    <div class="root"><LineageNode node={root} selected={selectedId === root.id} onclick={() => onselect?.(root)}/></div>
    {#if branches.length}<span class="root-fork" aria-hidden="true"></span>{/if}
    <div class="branches">
      {#each branches as branch (branch.id)}
        <section class="branch">
          <div class="parent"><LineageNode node={branch.parent} selected={selectedId === branch.parent.id} onclick={() => onselect?.(branch.parent)}/></div>
          {#if branch.grandparents.length}<span class="branch-fork" aria-hidden="true"></span>{/if}
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
  .lineage-tree { --lineage-line: #5a6470; min-width: 0; display: flex; flex-direction: column; padding: 14px 10px 10px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-text) 1.5%, var(--surface-1)); }
  .root { width: min(100%, 340px); align-self: center; }
  .root-fork { position: relative; width: 100%; height: 28px; display: block; }
  .root-fork::before { position: absolute; top: 0; left: 50%; width: 2px; height: 15px; background: var(--lineage-line); content: ''; transform: translateX(-50%); }
  .root-fork::after { position: absolute; right: 25%; bottom: 0; left: 25%; height: 2px; background: var(--lineage-line); content: ''; }
  .branches { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .branch { position: relative; min-width: 0; display: flex; flex-direction: column; align-items: stretch; }
  .branch::before { position: absolute; top: -13px; left: 50%; width: 2px; height: 13px; background: var(--lineage-line); content: ''; transform: translateX(-50%); }
  .parent { width: min(100%, 240px); align-self: center; }
  .branch-fork { position: relative; height: 22px; display: block; }
  .branch-fork::before { position: absolute; top: 0; left: 50%; width: 2px; height: 12px; background: var(--lineage-line); content: ''; transform: translateX(-50%); }
  .branch-fork::after { position: absolute; right: 25%; bottom: 0; left: 25%; height: 2px; background: var(--lineage-line); content: ''; }
  .grandparents { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 170px)); justify-content: center; gap: 8px; }
  .legacy { position: relative; min-width: 0; }
  .legacy::before { position: absolute; z-index: 1; top: -10px; left: 50%; width: 2px; height: 10px; background: var(--lineage-line); content: ''; transform: translateX(-50%); }

  @container lineage (max-width: 700px) {
    .lineage-tree { padding: 5px 3px 5px 5px; border-inline: 0; border-radius: 0; }
    .root { width: 100%; }
    .root-fork { height: 10px; }
    .root-fork::before { left: 14px; height: 10px; transform: none; }
    .root-fork::after { display: none; }
    .branches { position: relative; grid-template-columns: 1fr; gap: 8px; margin-left: 13px; padding-left: 10px; border-left: 2px solid var(--lineage-line); }
    .branch::before { top: 24px; left: -10px; width: 10px; height: 2px; transform: none; }
    .branch:last-child::after { position: absolute; top: 26px; bottom: 0; left: -12px; width: 4px; background: var(--surface-1); content: ''; }
    .parent { width: 100%; }
    .branch-fork { height: 7px; }
    .branch-fork::before { left: 13px; height: 7px; transform: none; }
    .branch-fork::after { display: none; }
    .grandparents { grid-template-columns: 1fr; gap: 4px; margin-left: 12px; padding-left: 9px; border-left: 2px solid var(--lineage-line); }
    .legacy::before { top: 20px; left: -9px; width: 9px; height: 2px; transform: none; }
    .legacy:last-child::after { position: absolute; top: 22px; bottom: 0; left: -11px; width: 4px; background: var(--surface-1); content: ''; }
  }
</style>

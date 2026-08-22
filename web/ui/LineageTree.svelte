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
      <svg class="root-fork" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 0V15M25 28V15H75V28" vector-effect="non-scaling-stroke"></path>
      </svg>
    {/if}
    <div class="branches">
      {#each branches as branch (branch.id)}
        <section class="branch">
          <div class="parent"><LineageNode node={branch.parent} selected={selectedId === branch.parent.id} onclick={() => onselect?.(branch.parent)}/></div>
          {#if branch.grandparents.length}
            <svg class="branch-fork" viewBox="0 0 100 22" preserveAspectRatio="none" aria-hidden="true">
              <path d="M50 0V12M25 22V12H75V22" vector-effect="non-scaling-stroke"></path>
            </svg>
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
  .lineage-tree { --lineage-line: #71808f; min-width: 0; display: flex; flex-direction: column; padding: 14px 10px 10px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-text) 1.5%, var(--surface-1)); }
  .root { width: min(100%, 340px); align-self: center; }
  .root-fork, .branch-fork { width: 100%; display: block; overflow: visible; color: var(--lineage-line); }
  .root-fork { height: 28px; }
  .root-fork path, .branch-fork path { fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .branches { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .branch { position: relative; min-width: 0; display: flex; flex-direction: column; align-items: stretch; }
  .parent { width: min(100%, 240px); align-self: center; }
  .branch-fork { height: 22px; }
  .grandparents { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 170px)); justify-content: center; gap: 8px; }
  .legacy { position: relative; min-width: 0; }

  @container lineage (max-width: 700px) {
    .lineage-tree { padding: 5px 3px 5px 5px; border-inline: 0; border-radius: 0; }
    .root { width: 100%; }
    .root-fork { display: none; }
    .branches { position: relative; grid-template-columns: 1fr; gap: 8px; margin-top: 10px; margin-left: 13px; padding-left: 10px; border-left: 2px solid var(--lineage-line); }
    .branches::before { position: absolute; top: -10px; left: -2px; width: 2px; height: 10px; background: var(--lineage-line); content: ''; }
    .branch::before { top: 24px; left: -10px; width: 10px; height: 2px; transform: none; }
    .branch:last-child::after { position: absolute; top: 26px; bottom: 0; left: -12px; width: 4px; background: var(--surface-1); content: ''; }
    .parent { width: 100%; }
    .branch-fork { display: none; }
    .grandparents { position: relative; grid-template-columns: 1fr; gap: 4px; margin-top: 7px; margin-left: 12px; padding-left: 9px; border-left: 2px solid var(--lineage-line); }
    .grandparents::before { position: absolute; top: -7px; left: -2px; width: 2px; height: 7px; background: var(--lineage-line); content: ''; }
    .legacy::before { top: 20px; left: -9px; width: 9px; height: 2px; transform: none; }
    .legacy:last-child::after { position: absolute; top: 22px; bottom: 0; left: -11px; width: 4px; background: var(--surface-1); content: ''; }
  }
</style>

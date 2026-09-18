<script lang="ts">
  import { activeWorkspaceId, selectWorkspace, workspaces } from '@/lib/workspaces/workspace-state';
  import Icon from './Icon.svelte';
  interface Props { compact?: boolean; }
  let { compact = false }: Props = $props();
</script>
<label class="workspace" class:workspace--compact={compact}>
  <span class="sr-only">Active Veteran workspace</span>
  <Icon name="veterans" size={17}/>
  <select value={$activeWorkspaceId} onchange={(event) => selectWorkspace(event.currentTarget.value)} aria-label="Active Veteran workspace">
    {#each $workspaces as workspace}<option value={workspace.id}>{workspace.label}</option>{/each}
  </select>
</label>
<style>
  .workspace { display: flex; align-items: center; gap: 8px; min-width: 0; min-height: var(--touch-target); padding: 0 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text-muted); }
  select { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--color-text); font-size: var(--font-sm); font-weight: 650; text-overflow: ellipsis; }
  .workspace--compact { border-color: transparent; background: transparent; }
  @media (max-width: 767px) { .workspace { max-width: 150px; min-height: 38px; } }
</style>

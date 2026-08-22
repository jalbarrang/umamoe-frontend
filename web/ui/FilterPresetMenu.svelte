<script lang="ts">
  import Icon from './Icon.svelte';
  export interface FilterPreset { id: string; name: string; activeCount: number; mode?: string; }
  interface Props { presets: FilterPreset[]; draft?: string; message?: string; onsave?: (name: string) => void; onload?: (preset: FilterPreset) => void; ondelete?: (preset: FilterPreset) => void; }
  let { presets, draft = $bindable(''), message, onsave, onload, ondelete }: Props = $props();
  function save() { const name = draft.trim(); if (name) onsave?.(name); }
</script>

<details class="presets">
  <summary><Icon name="star" size={15}/><span>Presets</span>{#if presets.length}<small>{presets.length}</small>{/if}</summary>
  <div class="panel">
    <header><strong>Filter presets</strong><small>{presets.length}</small></header>
    <div class="save-row"><label><span class="sr-only">Preset name</span><input bind:value={draft} maxlength="60" placeholder="Preset name" onkeydown={(event) => { if (event.key === 'Enter') save(); }}/></label><button type="button" aria-label="Save current filters" disabled={!draft.trim()} onclick={save}><Icon name="add" size={16}/></button></div>
    {#if message}<p>{message}</p>{/if}
    <div class="list">
      {#each presets as preset (preset.id)}
        <div><button type="button" class="load" onclick={() => onload?.(preset)}><span>{preset.name}</span><small>{preset.activeCount} filter{preset.activeCount === 1 ? '' : 's'}{preset.mode ? ` · ${preset.mode}` : ''}</small></button>{#if ondelete}<button type="button" class="delete" aria-label={`Delete ${preset.name}`} onclick={() => ondelete(preset)}><Icon name="trash" size={14}/></button>{/if}</div>
      {:else}<span class="empty">No presets yet</span>{/each}
    </div>
  </div>
</details>

<style>
  .presets { position: relative; }
  summary { min-height: 36px; display: flex; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--surface-2); color: var(--color-text-muted); cursor: pointer; list-style: none; font-size: var(--font-xs); font-weight: 700; } summary::-webkit-details-marker { display: none; } summary small { min-width: 17px; padding: 1px 4px; border-radius: var(--radius-pill); background: var(--color-accent-soft); color: var(--color-accent); text-align: center; }
  .panel { position: absolute; z-index: var(--z-overlay); top: calc(100% + 5px); right: 0; width: min(290px, calc(100vw - 16px)); padding: 7px; border: 1px solid var(--factor-panel-border); border-radius: var(--radius-md); background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown); }
  header { display: flex; justify-content: space-between; padding: 5px 6px 8px; border-bottom: 1px solid var(--border-subtle); font-size: var(--font-xs); } header small { color: var(--color-text-subtle); }
  .save-row { display: grid; grid-template-columns: minmax(0, 1fr) 36px; gap: 5px; padding: 7px 0; } label { min-width: 0; } input { width: 100%; height: 36px; padding: 0 9px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--factor-field-bg); color: var(--factor-field-text); } .save-row button { display: grid; place-items: center; border: 1px solid var(--border-primary); border-radius: var(--radius-sm); background: var(--surface-2); cursor: pointer; } .save-row button:disabled { opacity: .4; }
  p { margin: 0 3px 6px; color: var(--color-text-muted); font-size: 10px; }
  .list { display: grid; gap: 2px; } .list > div { display: grid; grid-template-columns: minmax(0, 1fr) 34px; align-items: center; } .load { min-width: 0; min-height: 40px; display: flex; align-items: flex-start; flex-direction: column; justify-content: center; padding: 4px 7px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text); cursor: pointer; text-align: left; } .load:hover { background: var(--factor-option-hover); } .load span { max-width: 100%; overflow: hidden; font-size: var(--font-xs); font-weight: 700; text-overflow: ellipsis; white-space: nowrap; } .load small { color: var(--color-text-subtle); font-size: 9px; } .delete { width: 34px; height: 34px; display: grid; place-items: center; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-danger); cursor: pointer; } .delete:hover { background: var(--color-danger-soft); } .empty { padding: 12px; color: var(--color-text-subtle); font-size: var(--font-xs); text-align: center; }
</style>

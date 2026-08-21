<script lang="ts">
  import Artwork from './Artwork.svelte';
  export interface VeteranOption { id: string; name: string; rank: string; detail: string; }
  interface Props { id: string; label: string; options: VeteranOption[]; value?: string; disabled?: boolean; }
  let { id, label, options, value = $bindable(''), disabled = false }: Props = $props();
  const selected = $derived(options.find(option => option.id === value));
</script>

<label class="selector" for={id}>
  <span class="label">{label}</span>
  <span class="control"><Artwork alt={selected?.name ?? 'No Veteran selected'} size="sm"/><span class="copy"><strong>{selected?.name ?? 'Select a Veteran'}</strong><small>{selected ? `${selected.rank} · ${selected.detail}` : 'Local workspace'}</small></span><select {id} bind:value {disabled} aria-label={label}>{#each options as option}<option value={option.id}>{option.name} — {option.rank}</option>{/each}</select></span>
</label>

<style>
  .selector { display: grid; gap: 6px; }
  .label { font-size: var(--font-sm); font-weight: 700; }
  .control { position: relative; min-height: 58px; display: flex; align-items: center; gap: var(--space-3); padding: 8px 42px 8px 8px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); }
  .control::after { position: absolute; right: 14px; content: '⌄'; color: var(--color-text-muted); }
  .copy { min-width: 0; display: flex; flex-direction: column; }
  strong, small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } strong { font-size: var(--font-sm); } small { color: var(--color-text-muted); font-size: var(--font-xs); }
  select { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; }
  .control:focus-within { border-color: var(--color-accent); box-shadow: var(--focus-ring); }
</style>

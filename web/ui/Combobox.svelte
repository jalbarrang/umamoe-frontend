<script lang="ts">
  export interface ComboboxOption { value: string; label: string; keywords?: string; }
  interface Props { id: string; label: string; options: ComboboxOption[]; value?: string; placeholder?: string; help?: string; disabled?: boolean; }
  let { id, label, options, value = $bindable(''), placeholder = 'Search…', help, disabled = false }: Props = $props();
</script>

<label class="field" for={id}>
  <span>{label}</span>
  <input {id} list="{id}-options" {placeholder} {disabled} bind:value autocomplete="off" />
  <datalist id="{id}-options">{#each options as option}<option value={option.value}>{option.label}</option>{/each}</datalist>
  {#if help}<small>{help}</small>{/if}
</label>

<style>
  .field { display: flex; flex-direction: column; gap: 6px; }
  span { font-size: var(--font-sm); font-weight: 700; }
  input { width: 100%; min-height: var(--touch-target); padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text); }
  input:hover:not(:disabled) { border-color: var(--color-border-strong); }
  input:focus { border-color: var(--color-accent); outline: 0; box-shadow: var(--focus-ring); }
  input:disabled { cursor: not-allowed; opacity: .55; }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
</style>

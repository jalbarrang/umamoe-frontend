<script lang="ts">
  export interface SelectOption { value: string; label: string; }
  interface Props { id: string; label: string; options: SelectOption[]; value?: string; help?: string; disabled?: boolean; onchange?: (event: Event) => void; }
  let { id, label, options, value = $bindable(''), help, disabled = false, onchange }: Props = $props();
</script>
<label class="field" for={id}><span>{label}</span><select {id} {disabled} bind:value {onchange}>{#each options as option}<option value={option.value}>{option.label}</option>{/each}</select>{#if help}<small>{help}</small>{/if}</label>
<style>
  .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  span { font-size: var(--font-sm); font-weight: 700; }
  select { width: 100%; min-height: var(--touch-target); padding: 0 38px 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text); }
  select:focus { border-color: var(--color-accent); outline: 0; box-shadow: var(--focus-ring); }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
</style>

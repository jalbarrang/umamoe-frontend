<script lang="ts">
  interface Props { id: string; label: string; value?: string; type?: 'text' | 'search' | 'email' | 'password'; placeholder?: string; help?: string; error?: string; disabled?: boolean; oninput?: (event: Event) => void; }
  let { id, label, value = $bindable(''), type = 'text', placeholder = '', help, error, disabled = false, oninput }: Props = $props();
  const describedBy = $derived(error ? `${id}-error` : help ? `${id}-help` : undefined);
</script>
<label class="field" for={id}>
  <span class="field-label">{label}</span>
  <input {id} {type} {placeholder} {disabled} bind:value aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy} {oninput} />
  {#if error}<span id="{id}-error" class="field-message field-error">{error}</span>{:else if help}<span id="{id}-help" class="field-message">{help}</span>{/if}
</label>
<style>
  .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .field-label { color: var(--color-text); font-size: var(--font-sm); font-weight: 700; }
  input { width: 100%; min-height: var(--touch-target); padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text); transition: border-color var(--duration-fast), background var(--duration-fast); }
  input:hover:not(:disabled) { border-color: var(--color-border-strong); }
  input:focus { border-color: var(--color-accent); outline: 0; box-shadow: var(--focus-ring); }
  input:disabled { opacity: .55; cursor: not-allowed; }
  input[aria-invalid='true'] { border-color: var(--color-danger); }
  .field-message { min-height: 1rem; color: var(--color-text-subtle); font-size: var(--font-xs); }
  .field-error { color: var(--color-danger); }
</style>

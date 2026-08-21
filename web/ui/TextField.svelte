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
  .field-label { color: var(--color-text); font-size: var(--font-sm); font-weight: 600; }
  input { width: 100%; height: var(--control-height); padding: 0 10px; border: 1px solid var(--factor-field-border); border-radius: 8px; background: var(--factor-field-bg); color: var(--factor-field-text); font-size: var(--font-md); transition: border-color var(--duration-fast), background-color var(--duration-fast); }
  input::placeholder { color: var(--factor-field-placeholder); }
  input:hover:not(:disabled) { border-color: var(--border-secondary); }
  input:focus { border-color: var(--factor-field-focus-border); outline: 0; background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  input:disabled { opacity: .55; cursor: not-allowed; }
  input[aria-invalid='true'] { border-color: var(--color-danger); background: var(--color-danger-soft); }
  .field-message { min-height: 1rem; color: var(--color-text-subtle); font-size: var(--font-xs); }
  .field-error { color: var(--color-danger); }
</style>

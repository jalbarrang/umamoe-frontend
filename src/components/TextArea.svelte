<script lang="ts">
  interface Props { id: string; label: string; value?: string; placeholder?: string; help?: string; error?: string; rows?: number; disabled?: boolean; }
  let { id, label, value = $bindable(''), placeholder = '', help, error, rows = 4, disabled = false }: Props = $props();
  const describedBy = $derived(error ? `${id}-error` : help ? `${id}-help` : undefined);
</script>

<label class="field" for={id}>
  <span>{label}</span>
  <textarea {id} {placeholder} {rows} {disabled} bind:value aria-invalid={error ? 'true' : undefined} aria-describedby={describedBy}></textarea>
  {#if error}<small id="{id}-error" class="error">{error}</small>{:else if help}<small id="{id}-help">{help}</small>{/if}
</label>

<style>
  .field { display: flex; flex-direction: column; gap: 6px; }
  span { font-size: var(--font-sm); font-weight: 600; }
  textarea { width: 100%; min-height: 104px; resize: vertical; padding: 9px 10px; border: 1px solid var(--factor-field-border); border-radius: 8px; background: var(--factor-field-bg); color: var(--factor-field-text); font-size: var(--font-md); line-height: 1.5; transition: border-color var(--duration-fast), background-color var(--duration-fast); }
  textarea::placeholder { color: var(--factor-field-placeholder); }
  textarea:hover:not(:disabled) { border-color: var(--border-secondary); }
  textarea:focus { border-color: var(--factor-field-focus-border); outline: 0; background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  textarea[aria-invalid='true'] { border-color: var(--color-danger); background: var(--color-danger-soft); }
  textarea:disabled { cursor: not-allowed; opacity: .55; }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  small.error { color: var(--color-danger); }
</style>

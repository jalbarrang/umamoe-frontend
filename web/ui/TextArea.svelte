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
  span { font-size: var(--font-sm); font-weight: 700; }
  textarea { width: 100%; min-height: 104px; resize: vertical; padding: var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text); line-height: 1.5; }
  textarea:hover:not(:disabled) { border-color: var(--color-border-strong); }
  textarea:focus { border-color: var(--color-accent); outline: 0; box-shadow: var(--focus-ring); }
  textarea[aria-invalid='true'] { border-color: var(--color-danger); }
  textarea:disabled { cursor: not-allowed; opacity: .55; }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  small.error { color: var(--color-danger); }
</style>

<script lang="ts">
  interface Props { id: string; label: string; description?: string; checked?: boolean; indeterminate?: boolean; disabled?: boolean; }
  let { id, label, description, checked = $bindable(false), indeterminate = false, disabled = false }: Props = $props();
</script>

<label class="checkbox" for={id}>
  <input {id} type="checkbox" bind:checked {disabled} aria-describedby={description ? `${id}-description` : undefined} />
  <span class="box" class:indeterminate aria-hidden="true">{#if checked || indeterminate}<span>{indeterminate ? '−' : '✓'}</span>{/if}</span>
  <span class="copy"><strong>{label}</strong>{#if description}<small id="{id}-description">{description}</small>{/if}</span>
</label>

<style>
  .checkbox { min-height: var(--touch-target); display: grid; grid-template-columns: 22px minmax(0, 1fr); align-items: center; gap: var(--space-3); cursor: pointer; }
  input { position: absolute; opacity: 0; pointer-events: none; }
  .box { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--color-border-strong); border-radius: var(--radius-xs); background: var(--color-surface-1); color: #07121d; font-size: 14px; font-weight: 900; transition: background var(--duration-fast), border-color var(--duration-fast); }
  input:checked + .box, .box.indeterminate { border-color: var(--color-accent); background: var(--color-accent); }
  input:focus-visible + .box { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  input:disabled + .box, input:disabled ~ .copy { opacity: .45; }
  .copy { display: flex; flex-direction: column; }
  strong { font-size: var(--font-sm); }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
</style>

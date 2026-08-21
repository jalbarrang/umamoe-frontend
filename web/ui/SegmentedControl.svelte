<script lang="ts">
  export interface Segment { value: string; label: string; disabled?: boolean; }
  interface Props { label: string; options: Segment[]; value?: string; onchange?: (value: string) => void; }
  let { label, options, value = $bindable(''), onchange }: Props = $props();
  function select(next: string) { value = next; onchange?.(next); }
</script>

<div class="segments" role="radiogroup" aria-label={label}>
  {#each options as option}
    <button
      type="button"
      role="radio"
      aria-checked={value === option.value}
      class:selected={value === option.value}
      disabled={option.disabled}
      onclick={() => select(option.value)}
    >{option.label}</button>
  {/each}
</div>

<style>
  .segments { width: fit-content; max-width: 100%; display: flex; gap: 2px; padding: 3px; overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-2); scrollbar-width: none; }
  button { min-height: 36px; padding: 0 var(--space-3); flex: 0 0 auto; border: 0; border-radius: calc(var(--radius-md) - 3px); background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: var(--font-sm); font-weight: 700; }
  button:hover:not(:disabled) { color: var(--color-text); }
  button.selected { background: var(--color-surface-1); color: var(--color-accent); box-shadow: var(--shadow-sm); }
  button:disabled { opacity: .42; cursor: not-allowed; }
</style>

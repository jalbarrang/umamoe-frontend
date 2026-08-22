<script lang="ts">
  interface Props { label: string; count?: number; image?: string; selected?: boolean; excluded?: boolean; disabled?: boolean; onclick?: () => void; }
  let { label, count, image, selected = false, excluded = false, disabled = false, onclick }: Props = $props();
</script>

<button type="button" class:selected class:excluded aria-pressed={selected || excluded} {disabled} {onclick}>
  {#if image}<img src={image} alt="" loading="lazy" decoding="async"/>{/if}<span>{label}</span>{#if count !== undefined}<small>{count}</small>{/if}
</button>

<style>
  button { min-height: 38px; min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 3px 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--factor-option-text); cursor: pointer; text-align: left; }
  button:hover:not(:disabled) { border-color: var(--border-secondary); background: var(--factor-option-hover); } button.selected { border-color: color-mix(in srgb, var(--color-accent) 58%, transparent); background: var(--color-accent-soft); color: var(--color-accent); } button.excluded { border-color: color-mix(in srgb, var(--color-danger) 55%, transparent); background: var(--color-danger-soft); color: var(--color-danger); } button:disabled { opacity: .45; cursor: not-allowed; }
  img { width: 28px; height: 28px; object-fit: cover; object-position: top; } span { overflow: hidden; font-size: var(--font-xs); font-weight: 650; text-overflow: ellipsis; white-space: nowrap; } small { color: inherit; font-size: 9px; opacity: .72; }
</style>

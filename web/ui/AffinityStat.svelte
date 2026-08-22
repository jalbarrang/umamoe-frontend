<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { value: number; label?: string; kind?: 'base' | 'race' | 'total'; compact?: boolean; }
  let { value, label, kind = 'base', compact = false }: Props = $props();
  const displayLabel = $derived(label ?? (kind === 'race' ? 'Race affinity' : kind === 'total' ? 'Total affinity' : 'Affinity'));
</script>

<span class="affinity affinity--{kind}" class:compact aria-label={`${displayLabel}: ${value}`} title={displayLabel}><Icon name={kind === 'race' ? 'trophy' : 'heart'} size={compact ? 12 : 14}/><b>{value}</b>{#if !compact}<small>{displayLabel}</small>{/if}</span>

<style>
  .affinity { width: fit-content; min-height: 27px; display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border: 1px solid color-mix(in srgb, var(--affinity-color, var(--accent-pink)) 38%, transparent); border-radius: var(--radius-md); background: color-mix(in srgb, var(--affinity-color, var(--accent-pink)) 9%, transparent); color: var(--affinity-color, var(--accent-pink)); }
  .affinity--race { --affinity-color: var(--accent-warning); } .affinity--total { --affinity-color: var(--accent-pink); }
  b { font-family: var(--font-mono); font-size: 11px; } small { color: var(--color-text-muted); font-size: 9px; }
  .compact { min-height: 21px; padding: 1px 4px; }
</style>

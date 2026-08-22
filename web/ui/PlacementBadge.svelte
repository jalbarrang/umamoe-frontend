<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { placement: number; compact?: boolean; }
  let { placement, compact = false }: Props = $props();
  const suffix = $derived(placement % 100 >= 11 && placement % 100 <= 13 ? 'th' : placement % 10 === 1 ? 'st' : placement % 10 === 2 ? 'nd' : placement % 10 === 3 ? 'rd' : 'th');
</script>

<span class="placement" class:winner={placement === 1} class:compact aria-label={`${placement}${suffix} place`}><Icon name="trophy" size={compact ? 11 : 13}/><b>{placement}{suffix}</b></span>

<style>
  .placement { width: fit-content; min-height: 24px; display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: var(--radius-md); background: var(--surface-3); color: var(--color-text-muted); font-size: 9px; } .winner { background: var(--color-warning-soft); color: var(--color-warning); } .compact { min-height: 19px; padding: 1px 4px; font-size: 8px; }
</style>

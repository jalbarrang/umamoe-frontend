<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { placement: number; compact?: boolean; }
  let { placement, compact = false }: Props = $props();
  const suffix = $derived(placement % 100 >= 11 && placement % 100 <= 13 ? 'th' : placement % 10 === 1 ? 'st' : placement % 10 === 2 ? 'nd' : placement % 10 === 3 ? 'rd' : 'th');
</script>

<span class="placement placement--{Math.min(placement, 4)}" class:compact aria-label={`${placement}${suffix} place`}><Icon name="trophy" size={compact ? 11 : 13}/><b>{placement}{suffix}</b></span>

<style>
  .placement { width: fit-content; min-height: 24px; display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: var(--radius-md); background: rgb(12 16 20 / .86); color: var(--color-text-muted); font-size: 9px; box-shadow: 0 1px 3px rgb(0 0 0 / .4); }
  .placement--1 { color: #ffd700; } .placement--2 { color: #c0c0c0; } .placement--3 { color: #cd7f32; }
  .compact { min-height: 19px; padding: 1px 4px; font-size: 8px; }
</style>

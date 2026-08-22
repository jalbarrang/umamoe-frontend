<script lang="ts">
  import AptitudeGrade, { type AptitudeGradeValue } from './AptitudeGrade.svelte';
  export interface AptitudeItem { id: string; label: string; grade: AptitudeGradeValue; group?: string; }
  interface Props { items: AptitudeItem[]; label?: string; }
  let { items, label = 'Aptitudes' }: Props = $props();
</script>

<div class="aptitude-grid" role="list" aria-label={label}>
  {#each items as item (item.id)}<div role="listitem"><span><small>{item.group}</small>{item.label}</span><AptitudeGrade grade={item.grade} label={item.label} size="sm"/></div>{/each}
</div>

<style>
  .aptitude-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 5px; }
  .aptitude-grid > div { min-width: 0; min-height: 32px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 5px; padding: 4px 6px; border-bottom: 1px solid var(--border-subtle); }
  .aptitude-grid > div > span { overflow: hidden; color: var(--color-text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  small { display: block; color: var(--color-text-subtle); font-size: 8px; line-height: 1; text-transform: uppercase; }
</style>

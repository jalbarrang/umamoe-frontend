<script lang="ts">
  import AptitudeGrade, { type AptitudeGradeValue } from './AptitudeGrade.svelte';
  export interface AptitudeItem { id: string; label: string; grade: AptitudeGradeValue; group?: string; }
  interface Props { items: AptitudeItem[]; label?: string; compact?: boolean; }
  let { items, label = 'Aptitudes', compact = false }: Props = $props();
  const groups = $derived.by(() => {
    const grouped = new Map<string, AptitudeItem[]>();
    for (const item of items) {
      const key = item.group ?? 'General';
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return [...grouped.entries()].map(([groupLabel, groupItems]) => ({ label: groupLabel, items: groupItems }));
  });
</script>

<div class="aptitude-container">
<div class="aptitude-grid" class:compact aria-label={label}>
  {#each groups as group (group.label)}
    <section class="aptitude-group" data-group={group.label.toLowerCase()} aria-label={group.label}>
      <h4>{group.label}</h4>
      <div class="aptitude-items" role="list">
        {#each group.items as item (item.id)}<div class="aptitude-item" role="listitem"><span>{item.label}</span><AptitudeGrade grade={item.grade} label={item.label} size="sm"/></div>{/each}
      </div>
    </section>
  {/each}
</div>
</div>

<style>
  .aptitude-container { min-width: 0; container-type: inline-size; }
  .aptitude-grid { width: fit-content; max-width: 100%; min-width: 0; display: grid; gap: 4px; padding: 7px 10px; border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-text) 4%, var(--surface-1)); }
  .aptitude-group { min-width: 0; display: grid; grid-template-columns: 62px minmax(0, 1fr); align-items: center; gap: 6px; }
  h4 { margin: 0; color: var(--color-text-subtle); font-size: 8px; font-weight: 750; letter-spacing: .08em; text-transform: uppercase; }
  .aptitude-items { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
  .aptitude-item { min-width: 60px; display: inline-flex; align-items: center; justify-content: flex-end; gap: 4px; }
  .aptitude-item > span { order: -1; overflow: hidden; color: var(--color-text-subtle); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .compact { padding: 5px 7px; gap: 3px; }
  .compact .aptitude-group { grid-template-columns: 46px minmax(0, 1fr); gap: 4px; }
  .compact .aptitude-items { gap: 3px 7px; }
  .compact .aptitude-item { min-width: 52px; }
  @container (max-width: 430px) {
    .aptitude-grid { width: 100%; padding: 5px 4px; }
    .aptitude-group { grid-template-columns: 48px minmax(0, 1fr); gap: 2px; }
    .aptitude-items { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px 5px; }
    .aptitude-item { min-width: 0; justify-content: space-between; }
    .aptitude-item > span { font-size: 8px; }
  }
</style>

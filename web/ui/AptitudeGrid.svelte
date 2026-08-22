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
  .aptitude-grid { min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; }
  .aptitude-group { min-width: 0; display: grid; gap: 5px; }
  h4 { margin: 0; color: var(--color-text-subtle); font-size: 9px; font-weight: 750; letter-spacing: .05em; text-transform: uppercase; }
  [data-group='surface'] h4 { color: #c49a6c; }
  [data-group='distance'] h4 { color: var(--accent-primary); }
  [data-group='style'] h4 { color: var(--accent-secondary); }
  .aptitude-items { min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(74px, 1fr)); gap: 3px 8px; }
  .aptitude-item { min-width: 0; min-height: 28px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 5px; padding-bottom: 3px; border-bottom: 1px solid var(--border-subtle); }
  .aptitude-item > span { overflow: hidden; color: var(--color-text-muted); font-size: 10px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .compact { display: flex; flex-wrap: wrap; gap: 4px 12px; }
  .compact .aptitude-group { display: flex; align-items: center; gap: 5px; }
  .compact h4 { font-size: 8px; }
  .compact .aptitude-items { display: flex; gap: 5px; }
  .compact .aptitude-item { min-height: 24px; gap: 3px; padding: 0; border: 0; }
  .compact .aptitude-item > span { font-size: 9px; }
  @container (max-width: 520px) {
    .aptitude-grid:not(.compact) { grid-template-columns: 1fr; gap: 7px; }
    .aptitude-grid:not(.compact) .aptitude-group { grid-template-columns: 58px minmax(0, 1fr); align-items: start; }
    .aptitude-grid:not(.compact) h4 { padding-top: 6px; }
    .aptitude-grid:not(.compact) .aptitude-items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .compact h4 { display: none; }
  }
</style>

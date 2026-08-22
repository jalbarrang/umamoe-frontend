<script lang="ts">
  import RaceBadge from './RaceBadge.svelte';
  import type { RaceBadgeData, RaceScheduleYear } from './race-types';
  interface Props { years: RaceScheduleYear[]; label?: string; onselect?: (race: RaceBadgeData) => void; }
  let { years, label = 'Race schedule', onselect }: Props = $props();
</script>

<section class="race-schedule" aria-label={label}>
  {#each years as year (year.id)}<section class="year"><h4>{year.label}</h4><div class="slots">{#each year.slots as slot (slot.id)}<div class="slot"><time>{slot.label}</time><div>{#each slot.races as race (race.id)}<button type="button" onclick={() => onselect?.(race)} aria-label={`Open ${race.name}`}><RaceBadge {race} compact/></button>{:else}<span class="empty">—</span>{/each}</div></div>{/each}</div></section>{/each}
</section>

<style>
  .race-schedule { min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); overflow: hidden; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  .year { min-width: 0; padding: 7px; } .year + .year { border-left: 1px solid var(--border-primary); } h4 { margin: 0 0 5px; padding: 4px 6px; border-left: 3px solid var(--color-accent); background: var(--surface-2); font-size: var(--font-xs); }
  .slots { display: grid; gap: 3px; } .slot { min-width: 0; display: grid; grid-template-columns: 56px minmax(0, 1fr); align-items: start; gap: 5px; padding: 3px 0; border-bottom: 1px solid var(--border-subtle); } time { padding-top: 5px; color: var(--color-text-subtle); font-size: 9px; } .slot > div { min-width: 0; display: grid; gap: 3px; } .slot button { min-width: 0; padding: 0; border: 0; background: transparent; cursor: pointer; text-align: left; } .empty { padding: 4px; color: var(--color-text-subtle); }
  @media (max-width: 700px) { .race-schedule { grid-template-columns: 1fr; } .year + .year { border-top: 1px solid var(--border-primary); border-left: 0; } .slot { grid-template-columns: 64px minmax(0, 1fr); } }
</style>

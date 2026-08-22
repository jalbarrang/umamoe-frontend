<script lang="ts">
  import RaceBadge from './RaceBadge.svelte';
  import type { RaceBadgeData, RaceScheduleYear } from './race-types';

  interface Props { years: RaceScheduleYear[]; label?: string; onselect?: (race: RaceBadgeData) => void; }
  let { years, label = 'Race schedule', onselect }: Props = $props();
</script>

<div class="race-schedule-container">
  <section class="race-schedule" aria-label={label}>
    {#each years as year (year.id)}
      <section class="year year--{year.id}">
        <h4>{year.label}</h4>
        <div class="slots">
          {#each year.slots as slot (slot.id)}
            <section class="slot">
              <time>{slot.label}</time>
              <div class="race-list">
                {#each slot.races as race (race.id)}
                  <button type="button" class="race-entry" onclick={() => onselect?.(race)} aria-label={`Open ${race.name}`}>
                    <span class="race-art"><RaceBadge {race} compact/></span>
                    <span class="entry-copy"><strong>{race.name}</strong><small>{slot.label} · {race.grade}</small></span>
                    {#if race.affinityGain !== undefined}<span class="entry-affinity"><b>+{race.affinityGain}</b><small>affinity</small></span>{/if}
                  </button>
                {:else}<span class="empty">—</span>{/each}
              </div>
            </section>
          {/each}
        </div>
      </section>
    {/each}
  </section>
</div>

<style>
  .race-schedule-container { min-width: 0; container: race-schedule / inline-size; }
  .race-schedule { min-width: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .year { min-width: 0; padding: 7px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--surface-1); }
  h4 { margin: 0 0 7px; padding: 5px 7px; border-radius: 5px; font-size: 10px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
  .year--junior h4 { background: rgb(33 150 243 / .14); color: #90caf9; }
  .year--classic h4 { background: rgb(245 200 58 / .12); color: #f5c83a; }
  .year--senior h4 { background: rgb(102 187 106 / .12); color: var(--accent-secondary); }
  .slots { display: grid; gap: 5px; }
  .slot { min-width: 0; display: grid; gap: 3px; padding-bottom: 5px; border-bottom: 1px solid var(--border-subtle); }
  .slot:last-child { padding-bottom: 0; border-bottom: 0; }
  time { color: var(--color-text-subtle); font-size: 8px; font-weight: 650; }
  .race-list { min-width: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 158px)); gap: 4px; }
  .race-entry { min-width: 0; display: block; padding: 0; border: 0; background: transparent; color: var(--color-text); cursor: pointer; text-align: left; }
  .race-art { min-width: 0; display: block; }
  .entry-copy, .entry-affinity { display: none; }
  .empty { color: var(--color-text-subtle); }

  @container race-schedule (max-width: 680px) {
    .race-schedule { grid-template-columns: 1fr; gap: 6px; }
    .year { padding: 6px; }
    h4 { margin-bottom: 5px; }
    .slot { gap: 2px; }
    .slot > time { display: none; }
    .race-list { grid-template-columns: 1fr; gap: 3px; }
    .race-entry { min-height: 48px; display: grid; grid-template-columns: 88px minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 3px 5px; border: 1px solid var(--border-subtle); border-radius: 5px; background: var(--surface-1); }
    .race-art { width: 88px; }
    .entry-copy { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .entry-copy strong { overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
    .entry-copy small { color: var(--color-text-subtle); font-size: 8px; }
    .entry-affinity { display: flex; align-items: center; flex-direction: column; gap: 1px; }
    .entry-affinity b { color: var(--accent-secondary); font-family: var(--font-mono); font-size: 12px; }
    .entry-affinity small { color: var(--color-text-subtle); font-size: 7px; }
    .race-entry :global(.race-name) { display: none; }
  }

  @container race-schedule (max-width: 360px) {
    .race-entry { grid-template-columns: 76px minmax(0, 1fr) auto; gap: 5px; padding-inline: 3px; }
    .race-art { width: 76px; }
  }
</style>

<script lang="ts">
  import Icon from './Icon.svelte';
  import PlacementBadge from './PlacementBadge.svelte';
  import type { RaceBadgeData } from './race-types';
  interface Props { race: RaceBadgeData; compact?: boolean; removable?: boolean; onremove?: () => void; }
  let { race, compact = false, removable = false, onremove }: Props = $props();
</script>

<span class="race race--{race.grade.toLowerCase().replace('-', '')}" class:compact class:selected={race.selected} title={`${race.name} (${race.grade})`}>
  {#if race.image}<img src={race.image} alt="" loading="lazy" decoding="async"/>{/if}<span class="race-name"><small>{race.grade}</small><strong>{race.shortName ?? race.name}</strong></span>{#if race.affinityGain !== undefined}<b class="gain">+{race.affinityGain}</b>{/if}{#if race.placement !== undefined}<PlacementBadge placement={race.placement} compact/>{/if}{#if removable}<button type="button" aria-label={`Remove ${race.name}`} onclick={onremove}><Icon name="close" size={12}/></button>{/if}
</span>

<style>
  .race { --race-color: var(--color-text-subtle); min-width: 0; min-height: 34px; display: inline-grid; grid-template-columns: auto minmax(0, 1fr) auto auto auto; align-items: center; gap: 5px; padding: 3px 5px 3px 3px; border: 1px solid color-mix(in srgb, var(--race-color) 40%, var(--border-primary)); border-left: 3px solid var(--race-color); border-radius: var(--radius-md); background: color-mix(in srgb, var(--race-color) 7%, var(--surface-1)); color: var(--color-text); }
  .race--g1 { --race-color: var(--race-g1); } .race--g2 { --race-color: var(--race-g2); } .race--g3 { --race-color: var(--race-g3); } .selected { background: color-mix(in srgb, var(--race-color) 15%, var(--surface-1)); }
  img { width: 54px; height: 26px; object-fit: cover; } .race-name { min-width: 0; display: flex; flex-direction: column; } .race-name small { color: var(--race-color); font-size: 8px; font-weight: 800; line-height: 1; } .race-name strong { overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; } .gain { color: var(--color-secondary); font-family: var(--font-mono); font-size: 10px; }
  button { width: 26px; height: 26px; display: grid; place-items: center; padding: 0; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; } button:hover { background: var(--surface-3); color: var(--color-danger); }
  .compact { min-height: 27px; } .compact img { width: 42px; height: 20px; }
</style>

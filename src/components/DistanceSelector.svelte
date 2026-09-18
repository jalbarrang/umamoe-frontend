<script lang="ts">
  export type Distance = 'sprint' | 'mile' | 'medium' | 'long' | 'dirt';
  interface Props { label?: string; distances?: Distance[]; value?: Distance; compact?: boolean; onchange?: (value: Distance) => void; }
  let { label = 'Race distance', distances = ['sprint', 'mile', 'medium', 'long', 'dirt'], value = $bindable('medium'), compact = false, onchange }: Props = $props();
  const names: Record<Distance, string> = { sprint: 'Sprint', mile: 'Mile', medium: 'Medium', long: 'Long', dirt: 'Dirt' };
  const marks: Record<Distance, string> = { sprint: 'S', mile: 'M', medium: 'M', long: 'L', dirt: 'D' };
  function select(distance: Distance) { value = distance; onchange?.(distance); }
</script>

<fieldset class:compact>
  <legend>{label}</legend>
  <div class="distance-options">
    {#each distances as distance}
      <button type="button" data-distance={distance} class:active={value === distance} aria-label={names[distance]} aria-pressed={value === distance} onclick={() => select(distance)}>
        <span class="mark" aria-hidden="true">{marks[distance]}</span><span class="label">{names[distance]}</span>
      </button>
    {/each}
  </div>
</fieldset>

<style>
  fieldset { min-width: 0; margin: 0; padding: 0; border: 0; container: distance-selector / inline-size; }
  legend { margin-bottom: 6px; color: var(--color-text-muted); font-size: var(--font-xs); font-weight: 700; }
  .distance-options { min-width: 0; display: flex; gap: 4px; }
  button { --distance-tone: var(--color-accent); min-width: 0; min-height: 38px; flex: 1 1 0; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 0 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--color-text-muted); cursor: pointer; font: inherit; font-size: var(--font-xs); }
  button[data-distance='sprint'] { --distance-tone: var(--distance-sprint); } button[data-distance='mile'] { --distance-tone: var(--distance-mile); } button[data-distance='medium'] { --distance-tone: var(--distance-medium); } button[data-distance='long'] { --distance-tone: var(--distance-long); } button[data-distance='dirt'] { --distance-tone: var(--distance-dirt); }
  button:hover { border-color: color-mix(in srgb, var(--distance-tone) 48%, transparent); color: var(--color-text); }
  button.active { border-color: color-mix(in srgb, var(--distance-tone) 60%, transparent); background: color-mix(in srgb, var(--distance-tone) 13%, transparent); color: var(--distance-tone); }
  .mark { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 3px; background: color-mix(in srgb, var(--distance-tone) 16%, transparent); color: var(--distance-tone); font-size: 9px; font-weight: 850; }
  @container distance-selector (max-width: 430px) { .label { display: none; } button { min-height: 44px; padding: 0 4px; } .mark { width: 24px; height: 24px; } }
  .compact .label { display: none; } .compact button { padding-inline: 4px; }
</style>

<script lang="ts">
  export type StatTone = 'speed' | 'stamina' | 'power' | 'guts' | 'wit' | 'neutral';
  export interface StatStripItem { id: string; label: string; value: string | number; tone?: StatTone; unit?: string; icon?: string; }
  interface Props { items: StatStripItem[]; label?: string; compact?: boolean; }
  let { items, label = 'Stats', compact = false }: Props = $props();
</script>

<div class="stats-container">
<dl class="stats" class:compact aria-label={label}>
  {#each items as item (item.id)}<div data-tone={item.tone ?? 'neutral'}>{#if item.icon}<img src={item.icon} alt="" decoding="async"/>{/if}<dd>{item.value}{#if item.unit}<small>{item.unit}</small>{/if}</dd><dt>{item.label}</dt></div>{/each}
</dl>
</div>

<style>
  .stats-container { min-width: 0; container-type: inline-size; }
  .stats { display: grid; grid-template-columns: repeat(var(--stat-count, 5), minmax(0, 1fr)); gap: 0; margin: 0; overflow: hidden; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-text) 4%, var(--surface-1)); }
  .stats > div { --stat-color: var(--color-text-muted); min-width: 0; min-height: 54px; display: grid; grid-template-columns: auto auto; grid-template-rows: auto auto; align-content: center; justify-content: center; gap: 1px 5px; padding: 6px 4px; text-align: center; }
  .stats > div + div { border-left: 1px solid var(--border-subtle); }
  .stats > div[data-tone='speed'] { --stat-color: var(--stat-speed); } .stats > div[data-tone='stamina'] { --stat-color: var(--stat-stamina); } .stats > div[data-tone='power'] { --stat-color: var(--stat-power); } .stats > div[data-tone='guts'] { --stat-color: var(--stat-guts); } .stats > div[data-tone='wit'] { --stat-color: var(--stat-wit); }
  img { width: 18px; height: 18px; grid-row: 1 / 3; align-self: center; object-fit: contain; }
  dt { grid-column: 2; overflow: hidden; color: var(--color-text-subtle); font-size: 8px; font-weight: 650; line-height: 1; letter-spacing: .04em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
  dd { grid-column: 2; margin: 0; color: var(--stat-color); font-size: 15px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
  dd small { margin-left: 2px; font-family: var(--font-sans); font-size: 8px; font-weight: 600; }
  .compact > div { min-height: 44px; padding-block: 4px; }
  .compact img { width: 15px; height: 15px; }
  .compact dd { font-size: 13px; }
  @container (max-width: 430px) {
    .stats > div { min-height: 45px; display: flex; flex-direction: column; gap: 2px; padding: 4px 1px; }
    .stats > div + div { border-left: 1px solid var(--border-subtle); }
    img { width: 14px; height: 14px; }
    dd { font-size: 12px; }
    dt { font-size: 7px; }
  }
</style>

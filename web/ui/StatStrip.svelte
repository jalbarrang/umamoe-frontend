<script lang="ts">
  export type StatTone = 'speed' | 'stamina' | 'power' | 'guts' | 'wit' | 'neutral';
  export interface StatStripItem { id: string; label: string; value: string | number; tone?: StatTone; unit?: string; }
  interface Props { items: StatStripItem[]; label?: string; compact?: boolean; }
  let { items, label = 'Stats', compact = false }: Props = $props();
</script>

<div class="stats-container">
<dl class="stats" class:compact aria-label={label}>
  {#each items as item (item.id)}<div data-tone={item.tone ?? 'neutral'}><dd>{item.value}{#if item.unit}<small>{item.unit}</small>{/if}</dd><dt>{item.label}</dt></div>{/each}
</dl>
</div>

<style>
  .stats-container { min-width: 0; container-type: inline-size; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 8px 20px; margin: 0; padding: 9px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: color-mix(in srgb, var(--color-text) 4%, var(--surface-1)); }
  .stats > div { --stat-color: var(--color-text-muted); min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .stats > div[data-tone='speed'] { --stat-color: var(--stat-speed); } .stats > div[data-tone='stamina'] { --stat-color: var(--stat-stamina); } .stats > div[data-tone='power'] { --stat-color: var(--stat-power); } .stats > div[data-tone='guts'] { --stat-color: var(--stat-guts); } .stats > div[data-tone='wit'] { --stat-color: var(--stat-wit); }
  dt { order: 2; overflow: hidden; color: var(--color-text-subtle); font-size: 9px; font-weight: 650; line-height: 1; letter-spacing: .04em; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
  dd { order: 1; margin: 0; color: var(--stat-color); font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
  dd small { margin-left: 2px; font-family: var(--font-sans); font-size: 8px; font-weight: 600; }
  .compact { gap: 6px 12px; padding: 7px 9px; }
  .compact dd { font-size: 14px; }
  @container (max-width: 430px) {
    .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; padding: 7px 8px; }
    .stats > div:nth-child(n + 4) { padding-top: 2px; }
    dd { font-size: 15px; }
  }
</style>

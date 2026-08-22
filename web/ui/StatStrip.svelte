<script lang="ts">
  export type StatTone = 'speed' | 'stamina' | 'power' | 'guts' | 'wit' | 'neutral';
  export interface StatStripItem { id: string; label: string; value: string | number; tone?: StatTone; unit?: string; }
  interface Props { items: StatStripItem[]; label?: string; compact?: boolean; }
  let { items, label = 'Stats', compact = false }: Props = $props();
</script>

<dl class="stats" class:compact aria-label={label}>
  {#each items as item (item.id)}<div data-tone={item.tone ?? 'neutral'}><dt>{item.label}</dt><dd>{item.value}{#if item.unit}<small>{item.unit}</small>{/if}</dd></div>{/each}
</dl>

<style>
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)); gap: 1px; margin: 0; overflow: hidden; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--border-subtle); }
  .stats > div { --stat-color: var(--color-text-muted); min-width: 0; display: grid; gap: 1px; padding: 8px 9px; border-top: 2px solid var(--stat-color); background: var(--bg-secondary); }
  .stats > div[data-tone='speed'] { --stat-color: var(--stat-speed); } .stats > div[data-tone='stamina'] { --stat-color: var(--stat-stamina); } .stats > div[data-tone='power'] { --stat-color: var(--stat-power); } .stats > div[data-tone='guts'] { --stat-color: var(--stat-guts); } .stats > div[data-tone='wit'] { --stat-color: var(--stat-wit); }
  dt { overflow: hidden; color: var(--color-text-subtle); font-size: 9px; line-height: 1.1; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; }
  dd { margin: 0; color: var(--stat-color); font-family: var(--font-mono); font-size: 14px; font-weight: 800; }
  dd small { margin-left: 2px; font-family: var(--font-sans); font-size: 8px; font-weight: 600; }
  .compact > div { padding: 5px 7px; } .compact dd { font-size: 12px; }
</style>

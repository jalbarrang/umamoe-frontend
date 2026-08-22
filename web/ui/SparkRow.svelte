<script lang="ts">
  import SparkItem, { type SparkSource, type SparkTone } from './SparkItem.svelte';
  export interface SparkRecord { id: string; name: string; level: number; chance?: string; source?: SparkSource; }
  interface Props { tone: SparkTone; items: SparkRecord[]; label?: string; typeLabel?: string; showType?: boolean; }
  let { tone, items, label, typeLabel, showType = true }: Props = $props();
  const defaultTypeLabel = $derived(tone === 'blue' ? 'Stats' : tone === 'pink' ? 'Aptitude' : tone === 'green' ? 'Unique' : 'Skills / races');
  const displayLabel = $derived(typeLabel ?? defaultTypeLabel);
  const accessibleLabel = $derived(label ?? `${displayLabel} sparks`);
</script>

<div class="spark-row" class:no-kind={!showType} aria-label={accessibleLabel}>
  {#if showType}<span class="kind"><span class="type type--{tone}" aria-hidden="true"></span><span>{displayLabel}</span></span>{/if}
  <div class="list">{#each items as item (item.id)}<SparkItem {...item} {tone}/>{/each}</div>
</div>

<style>
  .spark-row { min-width: 0; display: grid; grid-template-columns: 88px minmax(0, 1fr); align-items: start; gap: 6px; }
  .no-kind { grid-template-columns: minmax(0, 1fr); }
  .kind { min-height: 26px; display: flex; align-items: center; gap: 6px; color: var(--color-text-subtle); font-size: 9px; font-weight: 700; letter-spacing: .025em; text-transform: uppercase; white-space: nowrap; }
  .type { width: 3px; height: 14px; flex: 0 0 auto; border-radius: 2px; background: #9e9e9e; }
  .type--blue { background: #2196f3; } .type--pink { background: #e91e63; } .type--green { background: #4caf50; }
  .list { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  @media (max-width: 420px) { .spark-row { grid-template-columns: 1fr; gap: 2px; } .kind { min-height: 16px; } }
</style>

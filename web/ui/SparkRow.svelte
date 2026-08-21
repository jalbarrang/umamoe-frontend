<script lang="ts">
  import SparkItem, { type SparkTone } from './SparkItem.svelte';
  export interface SparkRecord { id: string; name: string; level: number; chance?: string; source?: 'main' | 'parent' | 'legacy'; }
  interface Props { tone: SparkTone; items: SparkRecord[]; label?: string; typeLabel?: string; }
  let { tone, items, label, typeLabel }: Props = $props();
  const defaultTypeLabel = $derived(tone === 'blue' ? 'Stats' : tone === 'pink' ? 'Aptitude' : tone === 'green' ? 'Unique' : 'Skills / races');
  const displayLabel = $derived(typeLabel ?? defaultTypeLabel);
  const accessibleLabel = $derived(label ?? `${displayLabel} sparks`);
</script>

<div class="spark-row" aria-label={accessibleLabel}>
  <span class="kind"><span class="type type--{tone}" aria-hidden="true"></span><span>{displayLabel}</span></span>
  <div class="list">{#each items as item (item.id)}<SparkItem {...item} {tone}/>{/each}</div>
</div>

<style>
  .spark-row { min-width: 0; display: grid; grid-template-columns: 78px minmax(0, 1fr); align-items: start; gap: var(--space-2); }
  .kind { min-height: 28px; display: flex; align-items: center; gap: 7px; color: var(--color-text-subtle); font-size: 10px; font-weight: 700; letter-spacing: .035em; text-transform: uppercase; }
  .type { width: 3px; height: 16px; flex: 0 0 auto; border-radius: 2px; background: #9e9e9e; }
  .type--blue { background: #2196f3; } .type--pink { background: #e91e63; } .type--green { background: #4caf50; }
  .list { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
  @media (max-width: 420px) { .spark-row { grid-template-columns: 1fr; gap: 4px; } .kind { min-height: 18px; } }
</style>

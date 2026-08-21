<script lang="ts">
  import SparkItem, { type SparkTone } from './SparkItem.svelte';
  export interface SparkRecord { id: string; name: string; level: number; chance?: string; source?: 'main' | 'parent' | 'legacy'; }
  interface Props { tone: SparkTone; items: SparkRecord[]; label?: string; }
  let { tone, items, label = `${tone} sparks` }: Props = $props();
</script>

<div class="spark-row" aria-label={label}>
  <span class="type type--{tone}" aria-hidden="true"></span>
  <div class="list">{#each items as item (item.id)}<SparkItem {...item} {tone}/>{/each}</div>
</div>

<style>
  .spark-row { min-width: 0; display: flex; align-items: stretch; gap: var(--space-3); }
  .type { width: 4px; min-height: 27px; flex: 0 0 auto; align-self: stretch; border-radius: 2px; background: #9e9e9e; }
  .type--blue { background: #2196f3; } .type--pink { background: #e91e63; } .type--green { background: #4caf50; }
  .list { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); padding-block: 2px; }
</style>

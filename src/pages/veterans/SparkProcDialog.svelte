<script lang="ts">
  import Dialog from '@/components/Dialog.svelte';
  import EmptyState from '@/components/EmptyState.svelte';
  import SegmentedControl from '@/components/SegmentedControl.svelte';
  import SparkItem, { type SparkTone } from '@/components/SparkItem.svelte';
  import { calculateSparkProcs } from '@/lib/veterans/spark-proc';
  import type { VeteranRecord } from '@/lib/veterans/generated/veteran-record';
  import type { VeteranRelationBreakdown } from '@/lib/veterans/affinity-engine';

  interface Props { open?: boolean; parentOne?: VeteranRecord; parentTwo?: VeteranRecord; relation?: VeteranRelationBreakdown; onclose?: () => void; }
  let { open = $bindable(false), parentOne, parentTwo, relation, onclose }: Props = $props();
  let mode = $state('full');
  const results = $derived(parentOne && parentTwo && relation ? calculateSparkProcs(parentOne, parentTwo, {
    self: relation.targetParentOne,
    grandparentOne: relation.targetParentOneGrandparentOne,
    grandparentTwo: relation.targetParentOneGrandparentTwo
  }, {
    self: relation.targetParentTwo,
    grandparentOne: relation.targetParentTwoGrandparentOne,
    grandparentTwo: relation.targetParentTwoGrandparentTwo
  }, mode === 'full') : []);
  const tone = (type: number): SparkTone => type === 1 ? 'pink' : type === 5 ? 'green' : 'white';
</script>

<Dialog id="spark-proc" bind:open title="Expected spark proc odds" description="Independent factor chances combined across both lineage branches." mobileSheet {onclose}>
  <div class="spark-proc-body">
    <SegmentedControl label="Inheritance attempts" options={[{ value: 'full', label: 'Full run' }, { value: 'first', label: 'First inheritance' }]} bind:value={mode}/>
    {#if results.length}
      <div class="parent-summary"><span><b>P1</b>{parentOne?.name ?? parentOne?.recordId}</span><span><b>P2</b>{parentTwo?.name ?? parentTwo?.recordId}</span></div>
      <div class="proc-grid">{#each results as result}<article><SparkItem name={result.name} level={result.copies} tone={tone(result.type)} compact/><dl><div><dt>≥1 proc</dt><dd>{result.atLeastOne.toFixed(2)}%</dd></div>{#if result.atLeastTwo >= .005}<div><dt>≥2 procs</dt><dd>{result.atLeastTwo.toFixed(2)}%</dd></div>{/if}</dl></article>{/each}</div>
      <p class="note">Each displayed copy uses its own star level and branch affinity. A full run models both inheritance events.</p>
    {:else}<EmptyState icon="lineage" title="Choose two complete parents" description="Spark odds require both Veterans, their factors, and a loaded affinity relation." compact/>{/if}
  </div>
</Dialog>

<style>
  :global(dialog[aria-labelledby='spark-proc-title']) { width: min(calc(100% - 2rem), 820px); }
  .spark-proc-body { display: grid; gap: var(--space-3); }
  .parent-summary { display: flex; flex-wrap: wrap; gap: 5px; }.parent-summary span { min-height: 30px; display: inline-flex; align-items: center; gap: 7px; padding: 3px 8px; background: var(--surface-2); color: var(--color-text-muted); font-size: 10px; }.parent-summary b { color: var(--color-accent); }
  .proc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(225px, 1fr)); gap: 6px; }.proc-grid article { min-width: 0; display: grid; gap: 8px; padding: 9px; border: 1px solid var(--border-subtle); background: var(--surface-1); }.proc-grid dl { display: flex; gap: 12px; margin: 0; }.proc-grid dl div { display: grid; gap: 2px; }.proc-grid dt { color: var(--color-text-subtle); font-size: 8px; font-weight: 800; text-transform: uppercase; }.proc-grid dd { margin: 0; color: var(--accent-secondary); font: 800 13px/1 var(--font-mono); }.note { margin: 0; color: var(--color-text-subtle); font-size: 9px; }
  @media (max-width: 520px) { .proc-grid { grid-template-columns: 1fr; } }
</style>

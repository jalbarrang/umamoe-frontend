<script lang="ts">
  import { onMount } from 'svelte';
  import factorsData from '../../../src/data/factors.json';
  import AppPage from '../../ui/layout/AppPage.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  import DataTable from '../../ui/DataTable.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import SelectField from '../../ui/SelectField.svelte';
  import Spinner from '../../ui/Spinner.svelte';
  import StatStrip from '../../ui/StatStrip.svelte';
  import { hakurakuResearchRepository, type InheritanceResearchSummary } from './hakuraku-research-repository';

  interface FactorMetadata { id: string; text: string; }
  const factorNames = new Map((factorsData as FactorMetadata[]).map((factor) => [Number(factor.id), factor.text]));
  let data = $state<InheritanceResearchSummary>();
  let sourceIndex = $state('0');
  let loading = $state(true);
  let error = $state('');
  const source = $derived(data?.sources[Number(sourceIndex)]);
  const sourceOptions = $derived((data?.sources ?? []).map((entry, index) => ({ value: String(index), label: `${entry.label} · ${entry.samples.toLocaleString()} samples` })));
  const rows = $derived((source?.topFactors ?? []).map((factor) => ({
    factor: factorNames.get(factor.factorId) ?? `Factor ${factor.factorId}`,
    stars: `${factor.stars}★`,
    copies: factor.copies.toLocaleString(),
    appearance: `${factor.appearanceRate.toFixed(1)}%`,
    average: factor.avgCopies.toFixed(2)
  })));
  const columns = [{ key: 'factor', label: 'Factor', priority: 'primary' as const }, { key: 'stars', label: 'Stars' }, { key: 'copies', label: 'Copies', numeric: true }, { key: 'appearance', label: 'Appearance', numeric: true }, { key: 'average', label: 'Avg copies', numeric: true, priority: 'secondary' as const }];
  const maxDistribution = $derived(Math.max(1, ...(source?.distributions.totalFactors ?? []).map((entry) => entry.samples)));
  async function load(refresh = false): Promise<void> { loading = true; error = ''; try { data = await hakurakuResearchRepository.inheritanceFactors(refresh); sourceIndex = '0'; } catch (reason) { error = reason instanceof Error ? reason.message : 'Inheritance research could not be loaded.'; } finally { loading = false; } }
  onMount(() => { void load(); });
</script>

<svelte:head><title>Inheritance Factor Research · uma.moe</title><meta name="description" content="Hakuraku inheritance factor distribution and three-star research integrated into uma.moe."/></svelte:head>
<AppPage routeId="inheritance-research" title="Inheritance Factor Research" description="Observed factor distributions remain a research view; your usable Veterans and lineage plans stay in their dedicated moe routes." eyebrow="Research" width="wide">
  {#snippet actions()}<Button href="/tools/lineage-planner" variant="secondary" icon="lineage">Open planner</Button><Button variant="secondary" icon="refresh" loading={loading} onclick={() => load(true)}>Refresh</Button>{/snippet}
  {#if error}<Banner title="Inheritance research unavailable" tone="danger"><p>{error}</p></Banner>{/if}
  {#if loading && !data}<div class="loading"><Spinner size={28}/><span>Loading inheritance samples…</span></div>
  {:else if data}
    <StatStrip label="Inheritance research coverage" items={[{ id: 'samples', label: 'Samples', value: data.totals.samples.toLocaleString() }, { id: 'contributors', label: 'Contributors', value: data.totals.contributors.toLocaleString() }, { id: 'sources', label: 'Source groups', value: data.sources.length }]}/>
    <section class="source-control"><SelectField id="inheritance-source" label="Inheritance source" options={sourceOptions} bind:value={sourceIndex}/></section>
    {#if source}
      <StatStrip label={`${source.label} averages`} items={[{ id: 'factors', label: 'Expected factors', value: source.averages.totalFactors.toFixed(2) }, { id: 'three', label: 'Expected 3-stars', value: source.averages.totalThreeStars.toFixed(2) }, { id: 'blue', label: 'Blue 3-stars', value: source.averages.blueThreeStars.toFixed(2) }, { id: 'parent', label: 'Parent factors', value: source.averages.parentFactors.toFixed(2) }, { id: 'grandparent', label: 'Grandparent factors', value: source.averages.grandparentFactors.toFixed(2) }]}/>
      <section class="distribution" aria-label="Total factor distribution"><header><strong>Total factors per event</strong><span>{source.samples.toLocaleString()} samples</span></header><div class="bars">{#each source.distributions.totalFactors as entry}<div title={`${entry.count} factors: ${entry.samples.toLocaleString()} samples`}><i style={`--height:${entry.samples / maxDistribution}`}></i><strong>{entry.count}</strong><small>{(entry.samples / source.samples * 100).toFixed(1)}%</small></div>{/each}</div></section>
      <DataTable caption="Most frequent inheritance factors" {columns} {rows} emptyMessage="No top-factor observations are available for this source."/>
    {:else}<EmptyState icon="lineage" title="No inheritance source selected" description="Choose another research source."/>{/if}
  {/if}
</AppPage>

<style>
  .loading { min-height: 220px; display: flex; align-items: center; justify-content: center; gap: var(--space-3); }.source-control { max-width: 520px; padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }.distribution { min-width: 0; padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }.distribution header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-2); }.distribution header span { color: var(--color-text-subtle); font-size: var(--font-xs); }.bars { height: 180px; display: flex; align-items: end; gap: clamp(4px, 1vw, 12px); padding-top: var(--space-4); overflow-x: auto; }.bars > div { min-width: 34px; height: 100%; display: grid; grid-template-rows: 1fr auto auto; align-items: end; justify-items: center; gap: 3px; }.bars i { width: min(28px, 80%); height: calc(var(--height) * 100%); min-height: 2px; border-radius: 3px 3px 0 0; background: var(--color-accent); }.bars strong { font-size: var(--font-xs); }.bars small { color: var(--color-text-subtle); font-size: 8px; }
  @media (max-width: 600px) { .source-control, .distribution { padding-inline: 5px; } }
</style>

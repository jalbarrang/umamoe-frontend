<script lang="ts">
  import { onMount } from 'svelte';
  import AppPage from '../../ui/layout/AppPage.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  import DataTable from '../../ui/DataTable.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import MetricBar from '../../ui/MetricBar.svelte';
  import SelectField from '../../ui/SelectField.svelte';
  import Spinner from '../../ui/Spinner.svelte';
  import StatStrip from '../../ui/StatStrip.svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import { hakurakuResearchRepository, type ShopSummary } from './hakuraku-research-repository';

  type Mode = 'scheduled' | 'race';
  let data = $state<ShopSummary>();
  let mode = $state<Mode>('scheduled');
  let groupId = $state('');
  let loading = $state(true);
  let error = $state('');
  const groups = $derived(mode === 'scheduled' ? data?.scheduledShops ?? [] : data?.raceGrades ?? []);
  const options = $derived(groups.map((group, index) => ({ value: String(index), label: groupLabel(group.groupId, group.event, group.raceGrade) })));
  const selected = $derived(groups[Number(groupId)]);
  const rows = $derived((selected?.items ?? []).slice().sort((a, b) => b.appearanceRate - a.appearanceRate).map((item) => ({ item: `Item ${item.itemId}`, appearance: `${item.appearanceRate.toFixed(1)}%`, copies: item.avgCopies.toFixed(2), expected: (item.appearanceRate / 100 * item.avgCopies).toFixed(3), price: Math.round(item.avgPrice).toLocaleString(), maximum: item.maxCopies })));
  const columns = [{ key: 'item', label: 'Item', priority: 'primary' as const }, { key: 'appearance', label: 'Appearance', numeric: true }, { key: 'copies', label: 'Copies when shown', numeric: true }, { key: 'expected', label: 'Expected / refresh', numeric: true }, { key: 'price', label: 'Avg price', numeric: true, priority: 'secondary' as const }, { key: 'maximum', label: 'Max copies', numeric: true, priority: 'secondary' as const }];
  function groupLabel(id: number | string, event: string | null, raceGrade: number | null): string { return event ?? (raceGrade ? `Race grade ${raceGrade}` : mode === 'scheduled' ? `Turn ${Number(id) * 6 + 6}` : `Grade ${id}`); }
  async function load(refresh = false): Promise<void> { loading = true; error = ''; try { data = await hakurakuResearchRepository.shopRefresh(refresh); groupId = '0'; } catch (reason) { error = reason instanceof Error ? reason.message : 'Shop research could not be loaded.'; } finally { loading = false; } }
  function switchMode(value: string): void { mode = value as Mode; groupId = '0'; }
  onMount(() => { void load(); });
</script>

<svelte:head><title>Shop Refresh Research · uma.moe</title><meta name="description" content="Hakuraku shop refresh appearance, copies, and price research in uma.moe."/></svelte:head>
<AppPage routeId="shop-refresh" title="Shop Refresh Research" description="Hakuraku’s aggregated shop probabilities using the shared moe data and UI layer." eyebrow="Research" width="wide">
  {#snippet actions()}<Button variant="secondary" icon="refresh" loading={loading} onclick={() => load(true)}>Refresh</Button>{/snippet}
  {#if error}<Banner title="Shop research unavailable" tone="danger"><p>{error}</p></Banner>{/if}
  {#if loading && !data}<div class="loading"><Spinner size={28}/><span>Loading shop samples…</span></div>
  {:else if data}
    <StatStrip label="Shop sample coverage" items={[{ id: 'scheduled', label: 'Scheduled samples', value: data.totals.scheduledSamples.toLocaleString() }, { id: 'race', label: 'Race samples', value: data.totals.raceSamples.toLocaleString() }, { id: 'groups', label: 'Research groups', value: data.scheduledShops.length + data.raceGrades.length }]}/>
    <section class="controls"><Tabs label="Shop source" items={[{ id: 'scheduled', label: 'Scheduled shops' }, { id: 'race', label: 'Race rewards' }]} value={mode} onchange={switchMode}/><SelectField id="shop-group" label="Refresh group" options={options} bind:value={groupId}/></section>
    {#if selected}
      <section class="summary"><MetricBar label="Average item slots" value={selected.avgItems} max={Math.max(selected.avgItems, 6)} unit=""/><MetricBar label="Samples" value={selected.samples} max={Math.max(selected.samples, 1)} unit="" tone="success"/></section>
      <DataTable caption="Shop item probability research" {columns} {rows} emptyMessage="No item observations are available for this group."/>
    {:else}<EmptyState icon="database" title="No research group selected" description="Choose another shop source or refresh group."/>{/if}
  {/if}
</AppPage>

<style>
  .loading { min-height: 220px; display: flex; align-items: center; justify-content: center; gap: var(--space-3); }.controls { display: grid; grid-template-columns: minmax(0, 1fr) minmax(240px, .35fr); align-items: end; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }.summary { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  @media (max-width: 680px) { .controls, .summary { grid-template-columns: 1fr; padding-inline: 5px; } }
</style>

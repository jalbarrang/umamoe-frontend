<script lang="ts">
  import type { Snippet } from 'svelte';
  import AptitudeGrid from './AptitudeGrid.svelte';
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkItem from './SparkItem.svelte';
  import SparkRow from './SparkRow.svelte';
  import StatStrip from './StatStrip.svelte';
  import type { VeteranUiRecord } from './veteran-ui-types';

  interface Props { veteran: VeteranUiRecord; compact?: boolean; showStats?: boolean; combined?: boolean; children?: Snippet; }
  let { veteran, compact = false, showStats = true, combined = false, children }: Props = $props();
  const displayedSparks = $derived(combined ? veteran.combinedSparks ?? veteran.sparks : veteran.sparks);
</script>

<div class="veteran-summary-container">
  <article class="veteran-summary" class:compact class:combined-layout={combined && !showStats} aria-label={`${veteran.name} Veteran summary`}>
    <header class="summary-head" class:affinity-first={!showStats && Number.isFinite(veteran.affinity)}>
      {#if !showStats && Number.isFinite(veteran.affinity)}<div class="leading-affinity"><AffinityStat value={veteran.affinity} kind="total" compact/>{#if veteran.raceAffinity !== undefined}<AffinityStat value={veteran.raceAffinity} kind="race" compact/>{/if}</div>{/if}
      <Artwork src={veteran.image} alt={veteran.name} size={compact ? 'sm' : 'md'} shape="circle"/>
      <div class="identity">
        <div class="name-row"><h3>{veteran.name}</h3>{#if veteran.scenario}<span class="scenario">{veteran.scenario}</span>{/if}</div>
        {#if veteran.detail}<span class="detail">{veteran.detail}</span>{/if}
      </div>
      <div class="rank-score">{#if veteran.rank}<RankBadge label={veteran.rank} size="sm"/>{/if}{#if veteran.score !== undefined}<span>{veteran.score.toLocaleString()}</span>{/if}</div>
    </header>

    {#if showStats && veteran.stats?.length}<StatStrip items={veteran.stats} compact={compact} presentation="icons"/>{/if}
    {#if showStats && veteran.aptitudes?.length}<AptitudeGrid items={veteran.aptitudes} {compact} stretch/>{/if}

    {#if displayedSparks.length || (showStats && Number.isFinite(veteran.affinity))}
      <section class="factor-section" class:with-summary={showStats} aria-label={combined ? 'Combined veteran sparks' : 'Veteran sparks'}>
        {#if showStats}<header class="factor-heading"><span>Inheritance</span><div class="summary-affinity">{#if Number.isFinite(veteran.affinity)}<AffinityStat value={veteran.affinity} kind="total"/>{/if}{#if veteran.raceAffinity !== undefined}<AffinityStat value={veteran.raceAffinity} kind="race"/>{/if}</div></header>{/if}
        <div class="factor-list" class:grouped={combined}>
          {#each displayedSparks as group}
            {#if combined}
              {#if group.items.length}<SparkRow tone={group.tone} items={group.items} {compact}/>{/if}
            {:else}
              {#each group.items as item (item.id)}<SparkItem {...item} tone={group.tone} compact={compact}/>{/each}
            {/if}
          {/each}
        </div>
      </section>
    {/if}

    {#if veteran.parents?.length}
      <div class="parent-rows" aria-label="Veteran parents">
        {#each veteran.parents as parent (parent.id)}
          <section class="parent-row">
            <div class="parent-id" class:affinity-first={!showStats}>
              <span class="parent-position parent-position--{parent.position.toLowerCase()}">{parent.position}</span>
              <Artwork src={parent.image} alt={parent.name} size="xs" shape="circle"/>
              <strong>{parent.name}</strong>
              {#if Number.isFinite(parent.affinity)}<AffinityStat value={parent.affinity} compact/>{/if}
            </div>
            {#if !combined}<div class="parent-factors">
              {#each parent.sparks as group}{#each group.items as item (item.id)}<SparkItem {...item} tone={group.tone} compact/>{/each}{/each}
            </div>{/if}
          </section>
        {/each}
      </div>
    {/if}
    {#if children}<div class="summary-extra">{@render children()}</div>{/if}
  </article>
</div>

<style>
  .veteran-summary-container { min-width: 0; container-type: inline-size; }
  .veteran-summary { min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid var(--card-surface-border); border-radius: var(--radius-md); background: var(--card-surface-bg); }
  .summary-head { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 9px; }
  .identity { min-width: 0; display: grid; gap: 4px; }
  .name-row { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  h3 { min-width: 0; margin: 0; overflow: hidden; color: var(--color-text); font-size: var(--font-md); text-overflow: ellipsis; white-space: nowrap; }
  .scenario { padding: 2px 6px; border: 0; border-radius: var(--radius-xs); background: rgb(129 199 132 / .1); color: var(--accent-secondary); font-size: 8px; font-weight: 650; line-height: 1; }
  .detail { color: var(--color-text-subtle); font-size: 10px; }
  .rank-score { display: grid; justify-items: center; gap: 2px; }
  .rank-score > span { color: var(--color-text-muted); font-family: var(--font-mono); font-size: 9px; font-variant-numeric: tabular-nums; line-height: 1; }
  .factor-section { min-width: 0; display: flex; align-items: center; gap: 6px; padding-top: 7px; border-top: 1px solid var(--border-subtle); }
  .factor-list, .parent-factors { min-width: 0; display: flex; flex-wrap: wrap; gap: 3px; }
  .factor-list { flex: 1; }
  .factor-list.grouped { display:flex; width:100%; gap:4px 8px; align-content:flex-start; align-items:flex-start; }
  .factor-list.grouped :global(.spark-row){width:100%;max-width:100%}
  .factor-section.with-summary { flex-direction: column; align-items: stretch; }
  .factor-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-2); }
  .factor-heading > span { color: var(--color-text-muted); font-size: var(--font-xs); font-weight: 600; }
  .summary-affinity { display: flex; align-items: center; gap: var(--space-4); }
  .parent-rows { min-width: 0; display: flex; flex-direction: column; border-top: 1px solid var(--border-subtle); }
  .parent-row { min-width: 0; display: grid; grid-template-columns: minmax(176px, auto) minmax(0, 1fr); align-items: center; gap: 7px; padding: 5px 0; }
  .parent-row + .parent-row { border-top: 1px solid var(--border-subtle); }
  .parent-id { min-width: 0; display: flex; align-items: center; gap: 5px; }
  .parent-id strong { max-width: 100px; overflow: hidden; color: var(--color-text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .parent-position { flex: 0 0 auto; padding: 2px 5px; border-radius: var(--radius-xs); font-size: 9px; font-weight: 800; }
  .parent-position--p1 { background: rgb(100 181 246 / .12); color: #90caf9; }
  .parent-position--p2 { background: rgb(186 104 200 / .12); color: #ce93d8; }
  .compact { gap: 7px; padding: 7px; }
  .summary-extra { min-width:0; display:grid; gap:var(--space-2); padding-top:var(--space-2); border-top:1px solid var(--border-subtle); }

  @container (max-width: 760px) {
    .veteran-summary { gap: 7px; padding: 7px; }
    .summary-head { gap: 7px; }
    .factor-section { align-items: flex-start; flex-direction: column; gap: 5px; }
    .parent-row { grid-template-columns: minmax(158px, auto) minmax(0, 1fr); gap: 5px; }
    .parent-id strong { max-width: min(140px, 42vw); }
  }
  @container (max-width: 430px) {
    .veteran-summary { padding: 4px; border-inline: 0; border-radius: 0; }
    .parent-row { grid-template-columns: 1fr; }
    .factor-section { gap: 3px; }
    .rank-score > span { display: none; }
  }
  .summary-head.affinity-first{grid-template-columns:auto auto minmax(0,1fr) auto}
  .leading-affinity{display:flex;flex-wrap:wrap;gap:4px}
  .parent-id.affinity-first :global(.affinity){order:-1}
  .combined-layout{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;gap:5px 12px}
  .combined-layout .summary-head{flex:0 1 auto;max-width:100%;gap:6px}
  .combined-layout .parent-rows{display:contents}
  .combined-layout .parent-row{flex:0 1 auto;grid-template-columns:minmax(0,1fr);padding:0 0 0 10px;border-top:0;border-left:1px solid var(--border-subtle)}
  .combined-layout .factor-section{order:1;flex:1 0 100%;align-items:flex-start;padding:5px 0 0;border-left:0;border-top:1px solid var(--border-subtle)}
</style>

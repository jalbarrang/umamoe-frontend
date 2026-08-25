<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkItem from './SparkItem.svelte';
  import StatStrip from './StatStrip.svelte';
  import type { VeteranUiRecord } from './veteran-ui-types';

  interface Props { veteran: VeteranUiRecord; compact?: boolean; }
  let { veteran, compact = false }: Props = $props();
</script>

<div class="veteran-summary-container">
  <article class="veteran-summary" class:compact aria-label={`${veteran.name} Veteran summary`}>
    <header class="summary-head">
      <Artwork src={veteran.image} alt={veteran.name} size={compact ? 'sm' : 'md'} shape="circle"/>
      <div class="identity">
        <div class="name-row"><h3>{veteran.name}</h3>{#if veteran.scenario}<span class="scenario">{veteran.scenario}</span>{/if}</div>
        {#if veteran.detail}<span class="detail">{veteran.detail}</span>{/if}
      </div>
      <div class="rank-score"><RankBadge label={veteran.rank} size="sm"/>{#if veteran.score !== undefined}<span>{veteran.score.toLocaleString()}</span>{/if}</div>
    </header>

    {#if veteran.stats?.length}<StatStrip items={veteran.stats} compact={compact}/>{/if}

    {#if veteran.sparks.length}
      <section class="factor-section" aria-label="Veteran sparks">
        <div class="factor-list">
          {#each veteran.sparks as group}{#each group.items as item (item.id)}<SparkItem {...item} tone={group.tone} compact={compact}/>{/each}{/each}
        </div>
        <div class="summary-affinity"><AffinityStat value={veteran.affinity} kind="total" compact/>{#if veteran.raceAffinity !== undefined}<AffinityStat value={veteran.raceAffinity} kind="race" compact/>{/if}</div>
      </section>
    {/if}

    {#if veteran.parents?.length}
      <div class="parent-rows" aria-label="Veteran parents">
        {#each veteran.parents as parent (parent.id)}
          <section class="parent-row">
            <div class="parent-id">
              <span class="parent-position parent-position--{parent.position.toLowerCase()}">{parent.position}</span>
              <Artwork src={parent.image} alt={parent.name} size="xs" shape="circle"/>
              <strong>{parent.name}</strong>
              <AffinityStat value={parent.affinity} compact/>
            </div>
            <div class="parent-factors">
              {#each parent.sparks as group}{#each group.items as item (item.id)}<SparkItem {...item} tone={group.tone} compact/>{/each}{/each}
            </div>
          </section>
        {/each}
      </div>
    {/if}
  </article>
</div>

<style>
  .veteran-summary-container { min-width: 0; container-type: inline-size; }
  .veteran-summary { min-width: 0; display: flex; flex-direction: column; gap: 8px; padding: 10px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--surface-1); }
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
  .summary-affinity { display: flex; flex: 0 0 auto; align-items: center; gap: 4px; margin-left: auto; }
  .parent-rows { min-width: 0; display: flex; flex-direction: column; border-top: 1px solid var(--border-subtle); }
  .parent-row { min-width: 0; display: grid; grid-template-columns: minmax(176px, auto) minmax(0, 1fr); align-items: center; gap: 7px; padding: 5px 0; }
  .parent-row + .parent-row { border-top: 1px solid var(--border-subtle); }
  .parent-id { min-width: 0; display: flex; align-items: center; gap: 5px; }
  .parent-id strong { max-width: 100px; overflow: hidden; color: var(--color-text-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .parent-position { flex: 0 0 auto; padding: 2px 5px; border-radius: var(--radius-xs); font-size: 9px; font-weight: 800; }
  .parent-position--p1 { background: rgb(100 181 246 / .12); color: #90caf9; }
  .parent-position--p2 { background: rgb(186 104 200 / .12); color: #ce93d8; }
  .compact { gap: 7px; padding: 7px; }

  @container (max-width: 760px) {
    .veteran-summary { gap: 7px; padding: 7px; }
    .summary-head { gap: 7px; }
    .factor-section { align-items: flex-start; flex-direction: column; gap: 5px; }
    .summary-affinity { order: -1; margin-left: 0; }
    .parent-row { grid-template-columns: minmax(158px, auto) minmax(0, 1fr); gap: 5px; }
    .parent-id strong { max-width: min(140px, 42vw); }
  }
  @container (max-width: 430px) {
    .veteran-summary { padding: 4px; border-inline: 0; border-radius: 0; }
    .parent-row { grid-template-columns: 1fr; }
    .factor-section { gap: 3px; }
    .rank-score > span { display: none; }
  }
</style>

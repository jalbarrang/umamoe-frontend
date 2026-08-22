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
      <Artwork src={veteran.image} alt={veteran.name} size={compact ? 'sm' : 'md'} rarity="★5"/>
      <div class="identity">
        <div class="name-row"><h3>{veteran.name}</h3>{#if veteran.scenario}<span class="scenario">{veteran.scenario}</span>{/if}</div>
        {#if veteran.detail}<span class="detail">{veteran.detail}</span>{/if}
        <div class="identity-meta">
          <RankBadge label={veteran.rank} size="sm"/>
          <AffinityStat value={veteran.affinity} kind="total" compact/>
          {#if veteran.raceAffinity !== undefined}<AffinityStat value={veteran.raceAffinity} kind="race" compact/>{/if}
          {#if veteran.score !== undefined}<span class="score"><b>{veteran.score.toLocaleString()}</b><small>score</small></span>{/if}
        </div>
      </div>
    </header>

    {#if veteran.stats?.length}<StatStrip items={veteran.stats} compact={compact}/>{/if}

    {#if veteran.sparks.length}
      <section class="factor-section" aria-label="Veteran sparks">
        <span class="section-label">Sparks</span>
        <div class="factor-list">
          {#each veteran.sparks as group}{#each group.items as item (item.id)}<SparkItem {...item} tone={group.tone} compact={compact}/>{/each}{/each}
        </div>
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
  .veteran-summary { min-width: 0; display: grid; gap: 10px; padding: 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--surface-1); }
  .summary-head { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px; }
  .identity { min-width: 0; display: grid; gap: 4px; }
  .name-row { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  h3 { min-width: 0; margin: 0; overflow: hidden; color: var(--color-text); font-size: var(--font-md); text-overflow: ellipsis; white-space: nowrap; }
  .scenario { padding: 2px 6px; border: 1px solid var(--border-subtle); border-radius: var(--radius-pill); background: var(--surface-2); color: var(--color-text-muted); font-size: 9px; font-weight: 650; }
  .detail { color: var(--color-text-subtle); font-size: 10px; }
  .identity-meta { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  .score { min-height: 24px; display: inline-flex; align-items: baseline; gap: 4px; padding: 2px 6px; border-left: 1px solid var(--border-subtle); color: var(--accent-primary); }
  .score b { font-size: 12px; font-variant-numeric: tabular-nums; }
  .score small { color: var(--color-text-subtle); font-size: 8px; text-transform: uppercase; }
  .factor-section { min-width: 0; display: grid; grid-template-columns: 58px minmax(0, 1fr); align-items: start; gap: 8px; padding-top: 2px; }
  .section-label { padding-top: 6px; color: var(--color-text-subtle); font-size: 9px; font-weight: 750; letter-spacing: .05em; text-transform: uppercase; }
  .factor-list, .parent-factors { min-width: 0; display: flex; flex-wrap: wrap; gap: 4px; }
  .parent-rows { min-width: 0; display: grid; border-top: 1px solid var(--border-subtle); }
  .parent-row { min-width: 0; display: grid; grid-template-columns: minmax(190px, auto) minmax(0, 1fr); align-items: center; gap: 8px; padding: 7px 0; }
  .parent-row + .parent-row { border-top: 1px solid var(--border-subtle); }
  .parent-id { min-width: 0; display: flex; align-items: center; gap: 5px; }
  .parent-id strong { max-width: 110px; overflow: hidden; color: var(--color-text-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .parent-position { flex: 0 0 auto; padding: 2px 5px; border-radius: var(--radius-xs); font-size: 9px; font-weight: 800; }
  .parent-position--p1 { background: rgb(100 181 246 / .12); color: #90caf9; }
  .parent-position--p2 { background: rgb(186 104 200 / .12); color: #ce93d8; }
  .compact { gap: 7px; padding: 8px; }
  .compact .factor-section { grid-template-columns: 1fr; gap: 3px; }
  .compact .section-label { padding: 0; }

  @container (max-width: 620px) {
    .veteran-summary { gap: 8px; padding: 7px; border-radius: var(--radius-md); }
    .summary-head { gap: 7px; }
    .identity-meta { gap: 3px; }
    .score { display: none; }
    .factor-section { grid-template-columns: 1fr; gap: 3px; }
    .section-label { padding: 0; }
    .parent-row { grid-template-columns: 1fr; gap: 5px; }
    .parent-id strong { max-width: min(140px, 42vw); }
  }
</style>

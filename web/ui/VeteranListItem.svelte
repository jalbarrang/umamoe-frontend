<script lang="ts">
  import type { Snippet } from 'svelte';
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import RankBadge from './RankBadge.svelte';
  import SparkItem from './SparkItem.svelte';
  import type { VeteranUiRecord } from './veteran-ui-types';

  interface Props { veteran: VeteranUiRecord; selected?: boolean; actions?: Snippet; onclick?: () => void; }
  let { veteran, selected = false, actions, onclick }: Props = $props();
</script>

<div class="veteran-row-container">
  <article class:selected>
    <button type="button" class="veteran-select" aria-pressed={selected} aria-label={`Select ${veteran.name}`} {onclick}>
      <Artwork src={veteran.image} alt={veteran.name} size="md" shape="portrait"/>
      <div class="record">
        <header>
          <strong>{veteran.name}</strong>
          {#if veteran.scenario}<span class="scenario">{veteran.scenario}</span>{/if}
          <RankBadge label={veteran.rank} size="sm"/>
          <AffinityStat value={veteran.affinity} compact/>
        </header>
        <span class="detail">{veteran.detail}{#if veteran.workspace} · {veteran.workspace}{/if}{#if veteran.updated} · {veteran.updated}{/if}</span>
        <div class="sparks" aria-label={`${veteran.name} sparks`}>
          {#each veteran.sparks as group}{#each group.items.slice(0, 4) as item (item.id)}<SparkItem {...item} tone={group.tone} compact/>{/each}{/each}
        </div>
        {#if veteran.parents?.length}
          <div class="parent-preview">
            {#each veteran.parents as parent (parent.id)}
              <span><b class="parent-label parent-label--{parent.position.toLowerCase()}">{parent.position}</b><strong>{parent.name}</strong>{#each parent.sparks.slice(0, 1) as group}{#each group.items.slice(0, 1) as item (item.id)}<SparkItem {...item} tone={group.tone} compact/>{/each}{/each}</span>
            {/each}
          </div>
        {/if}
      </div>
    </button>
    {#if actions}<div class="actions">{@render actions()}</div>{/if}
  </article>
</div>

<style>
  .veteran-row-container { min-width: 0; container-type: inline-size; }
  article { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; overflow: hidden; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--surface-1); transition: background var(--duration-fast), border-color var(--duration-fast), transform var(--duration-fast); }
  article:hover { border-color: color-mix(in srgb, var(--accent-primary) 34%, var(--border-subtle)); background: color-mix(in srgb, var(--accent-primary) 4%, var(--surface-1)); transform: translateX(2px); }
  article.selected { border-color: color-mix(in srgb, var(--accent-primary) 55%, var(--border-primary)); background: color-mix(in srgb, var(--accent-primary) 8%, var(--surface-1)); }
  .veteran-select { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 10px; padding: 8px 10px; border: 0; background: transparent; color: var(--color-text); cursor: pointer; text-align: left; }
  .record { min-width: 0; display: grid; gap: 5px; }
  header { min-width: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
  header > strong { max-width: 220px; overflow: hidden; font-size: var(--font-sm); text-overflow: ellipsis; white-space: nowrap; }
  .scenario { padding: 1px 6px; border: 1px solid var(--border-subtle); border-radius: var(--radius-pill); background: var(--surface-2); color: var(--color-text-subtle); font-size: 8px; }
  .detail { color: var(--color-text-subtle); font-size: 9px; }
  .sparks { min-width: 0; display: flex; flex-wrap: wrap; gap: 3px; }
  .parent-preview { min-width: 0; display: grid; gap: 2px; padding-top: 4px; border-top: 1px solid var(--border-subtle); }
  .parent-preview > span { min-width: 0; display: flex; align-items: center; gap: 4px; }
  .parent-preview > span > strong { max-width: 90px; overflow: hidden; color: var(--color-text-subtle); font-size: 9px; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
  .parent-label { padding: 1px 4px; border-radius: var(--radius-xs); font-size: 8px; }
  .parent-label--p1 { background: rgb(100 181 246 / .12); color: #90caf9; }
  .parent-label--p2 { background: rgb(186 104 200 / .12); color: #ce93d8; }
  .actions { display: flex; align-items: center; flex-direction: column; justify-content: center; gap: 2px; padding: 5px; border-left: 1px solid var(--border-subtle); }

  @container (max-width: 520px) {
    article:hover { transform: none; }
    .veteran-select { gap: 6px; padding: 5px 6px; }
    .veteran-select :global(.art--portrait.art--md) { width: 36px; height: 50px; }
    .record { gap: 3px; }
    header { gap: 3px; }
    header > strong { max-width: 116px; font-size: 11px; }
    .scenario { display: none; }
    .detail { font-size: 8px; }
    .sparks { gap: 2px; }
    .sparks :global(.spark:nth-child(n + 7)) { display: none; }
    .parent-preview > span > strong { max-width: 62px; }
    .parent-preview :global(.spark .name) { max-width: 58px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .actions { padding-inline: 2px; }
  }
</style>

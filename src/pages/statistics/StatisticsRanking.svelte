<script lang="ts">
  import type { ChartDatum } from '@/lib/statistics/statistics';
  import ChartFrame from '@/components/ChartFrame.svelte';
  import MetricBar from '@/components/MetricBar.svelte';
  import TextField from '@/components/TextField.svelte';
  import Button from '@/components/Button.svelte';
  import Icon from '@/components/Icon.svelte';
  import Tooltip from '@/components/Tooltip.svelte';
  import { loadWhenVisible } from '@/lib/load-when-visible';
  interface Props { id: string; title: string; description: string; items: Array<ChartDatum & { detail?: string }>; searchable?: boolean; query?: string; searchLabel?: string; limit?: number; onselect?: (id: string) => void; onmore?: () => void; moreLabel?: string; }
  let { id, title, description, items, searchable = false, query = $bindable(''), searchLabel = 'Search by name or ID', limit = 20, onselect, onmore, moreLabel = 'Explore all' }: Props = $props();
  let sort = $state('usage');
  let shown = $state(20);
  const matching = $derived(items.map((item, index) => ({ ...item, rank: index + 1 }))
    .filter((item) => [item.name, item.id, item.detail].join(' ').toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : a.rank - b.rank));
  $effect(() => { items; query; sort; shown = limit; });
  const largestShare = $derived(Math.max(1, ...items.map((item) => item.percentage ?? 0)));
  const help = $derived(description + ' Bar lengths are relative to the leading result.');
  const statIcon = (type: string) => ['wiz', 'wisdom', 'intelligence'].includes(type) ? 'wit' : type;
</script>

<div class="ranking" class:selectable={Boolean(onselect)}>
  <ChartFrame {id} {title}>
    {#snippet titleActions()}<Tooltip text={help} position="bottom"><button type="button" class="ranking-info" aria-label={'About ' + title + '. ' + help}><Icon name="info" size={13}/></button></Tooltip>{/snippet}
    {#snippet actions()}{#if onmore}<Button variant="secondary" size="sm" onclick={onmore}><span class="panel-action">{moreLabel}<Icon name="arrow-right" size={13}/></span></Button>{/if}{/snippet}
    {#if searchable}
      <div class="ranking-tools">
        <TextField id={id + '-search'} type="search" label={searchLabel} hideLabel placeholder={searchLabel} prefixIcon="search" bind:value={query}/>
        <label class="sort"><span class="sr-only">Sort {title}</span><select bind:value={sort}><option value="usage">Most used</option><option value="name">Name A–Z</option></select></label>
      </div>
    {/if}
    {#if matching.length}
      <div class="column-labels" aria-hidden="true"><span>{items[0]?.composition ? 'Deck composition' : 'Name'}</span><span class="numeric-labels"><span>Uses</span><span>Share</span></span></div>
      <ol aria-label={title}>
        {#each matching.slice(0, shown) as item (item.id)}
          <li>
            {#snippet row()}
              <span class="rank">{item.rank.toString().padStart(2, '0')}</span>
              {#if item.image}<img class="portrait" src={item.image} alt="" width="44" height="44" loading="lazy"/>{/if}
              <span class="identity">
                {#if item.composition}
                  <span class="deck" aria-label={item.name}>
                    {#each Object.entries(item.composition) as [type, count]}{#each Array(Math.min(6, Math.max(0, Math.floor(count)))) as _}
                      {#if type === 'friend' || type === 'group'}<span class="support-symbol" class:group={type === 'group'} role="img" aria-label={type}><Icon name={type === 'friend' ? 'user' : 'community'} size={18}/></span>
                      {:else}<img src={'/assets/images/icon/stats/' + statIcon(type) + '.webp'} alt={type} width="24" height="24" loading="lazy"/>{/if}
                    {/each}{/each}
                  </span>
                  <small title={item.name}>{item.name}</small>
                {:else}<strong>{item.name}</strong>{#if item.detail}<small title={item.detail}>{item.detail}</small>{/if}{/if}
              </span>
              <span class="usage"><span class="count">{item.value.toLocaleString()}</span><MetricBar value={Number((item.percentage ?? 0).toFixed(1))} max={largestShare} compact/></span>
              {#if onselect}<span class="arrow"><Icon name="arrow-right" size={16}/></span>{/if}
            {/snippet}
            {#if onselect}<button class="ranking-row" aria-label={'Analyze ' + item.name} onclick={() => onselect?.(item.id)}>{@render row()}</button>
            {:else}<div class="ranking-row">{@render row()}</div>{/if}
          </li>
        {/each}
      </ol>
      {#if searchable}{#key shown}<div class="ranking-footer" use:loadWhenVisible={() => { if (shown < matching.length) shown += limit; }}><span>{Math.min(shown, matching.length)} of {matching.length} results</span></div>{/key}{/if}
    {:else}
      <div class="ranking-empty"><Icon name={query ? 'search' : 'chart'} size={26}/><strong>{query ? 'No matches found' : 'No data available'}</strong><p>{query ? 'Try a different name or ID.' : 'Try a broader selection or a different dataset.'}</p>{#if query}<Button variant="ghost" size="sm" onclick={() => query = ''}>Clear search</Button>{/if}</div>
    {/if}
  </ChartFrame>
</div>

<style>
  .ranking{min-width:0}.ranking :global(.chart-frame){padding:12px;gap:0;border-radius:var(--radius-md)}.ranking :global(.plot){min-height:0;overflow:visible}.ranking :global(figcaption){align-items:center;gap:6px;padding-bottom:9px;margin-bottom:8px;border-bottom:1px solid var(--border-primary)}.ranking :global(figcaption h3){font-size:13px;line-height:1.4}.ranking :global(.chart-heading){flex:1}.ranking :global(.chart-tools){flex:none}.ranking :global(.chart-actions>button){font-size:11px;min-height:32px;padding:0 9px;font-weight:600}.panel-action{display:flex;align-items:center;gap:6px;white-space:nowrap}.ranking-info{display:inline-flex;align-items:center;justify-content:center;width:22px;height:24px;border:0;background:transparent;color:var(--text-muted);padding:0;cursor:help}
  .ranking-tools{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;margin:0 0 8px}.sort{display:flex;align-items:stretch}.sort select{max-width:130px;min-height:34px;padding:0 8px;border:1px solid var(--factor-field-border);border-radius:var(--radius-md);background:var(--factor-field-bg);color:var(--text-primary);font:inherit;font-size:12px}
  .column-labels{display:flex;justify-content:space-between;gap:8px;padding:6px 5px;background:var(--surface-2);border-radius:3px;color:var(--text-muted);font-size:9px;letter-spacing:.04em;text-transform:uppercase}.numeric-labels{width:clamp(112px,32cqi,240px);display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:8px;text-align:right}.column-labels>span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  ol{margin:0;padding:0;list-style:none}li+li{border-top:1px solid var(--border-subtle)}li:nth-child(even){background:color-mix(in srgb,var(--surface-2) 35%,transparent)}.ranking-row{width:100%;min-width:0;min-height:46px;display:flex;align-items:center;gap:8px;padding:6px 4px;border:0;background:transparent;color:var(--text-primary);font:inherit;text-align:left;border-radius:var(--radius-sm)}button.ranking-row{cursor:pointer}button.ranking-row:hover{background:var(--color-accent-soft)}button.ranking-row:hover .arrow{color:var(--accent-primary)}
  .rank{flex:0 0 17px;color:var(--text-muted);font-size:10px;font-variant-numeric:tabular-nums}.portrait{width:30px;height:30px;flex:none;object-fit:cover;border-radius:3px;background:var(--surface-2)}.identity{flex:1;min-width:0;display:grid;gap:2px}.identity strong{font-size:12px;font-weight:600;line-height:1.3;overflow-wrap:anywhere}.identity small{color:var(--text-muted);font-size:9px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usage{width:clamp(112px,32cqi,240px);flex:none;display:grid;grid-template-columns:minmax(0,1fr) 42px;gap:5px 8px;text-align:right;font-variant-numeric:tabular-nums}.count{grid-row:1;grid-column:1;font-size:12px;font-weight:600;line-height:1.2;color:var(--text-primary)}.usage :global(.metric){display:contents}.usage :global(output){grid-row:1;grid-column:2;min-width:0;color:var(--accent-primary);font-size:11px;font-weight:750;line-height:1.2}.usage :global(.track){grid-row:2;grid-column:1/-1;height:6px;border-radius:3px;background:var(--surface-3)}
  .arrow{color:var(--text-muted);display:flex;flex:none}.deck{display:flex;flex-wrap:wrap;gap:3px}.deck img{width:20px;height:20px;object-fit:contain}.support-symbol{width:20px;height:20px;display:grid;place-items:center;border-radius:4px;background:#ffb441;color:#241600}.support-symbol.group{background:#21ce3e;color:#06250b}
  .ranking-empty{min-height:180px;display:grid;place-content:center;justify-items:center;gap:8px;text-align:center;color:var(--text-muted);font-size:12px}.ranking-empty strong{color:var(--text-primary);font-size:14px}.ranking-empty p{margin:0}.ranking-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle);color:var(--text-muted);font-size:11px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  .selectable .numeric-labels{margin-right:24px}
  @container chart-frame (min-width:450px){.identity strong{font-size:13px}.rank{flex-basis:20px}}
  @container chart-frame (max-width:449px){.selectable .numeric-labels{margin-right:0}.arrow{display:none}}
  @media(max-width:600px){.ranking :global(.chart-frame){padding:10px}.ranking-row{gap:6px}.rank{flex-basis:16px}.ranking-tools{gap:6px}.sort select{max-width:110px;font-size:11px}.deck{gap:2px}}
  @media(pointer: coarse) and (max-width: 1300px){.sort select,.ranking-row{min-height:var(--touch-target)}.ranking-info{min-width:32px;min-height:32px}.ranking :global(.chart-actions>button){min-height:var(--touch-target)}}
</style>

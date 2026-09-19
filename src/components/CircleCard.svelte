<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import DiscordText from './DiscordText.svelte';
  import { clubRankIcon, clubPolicyLabels as policyLabels } from '@/lib/clubs/club-display';
  export interface CircleCardData {
    circleId: number; name: string; rank?: number; yesterdayRank?: number; clubRank?: number;
    members?: number; leaderName?: string; joinStyle?: 1 | 2 | 3; policy?: number; comment?: string;
    monthlyFans?: number; yesterdayFans?: number; liveFans?: number; liveRank?: number;
  }
  let { circle: club, children, layout = 'row' }: { circle: CircleCardData; children?: Snippet; layout?: 'row' | 'summary' } = $props();
  const rankIcon = $derived(clubRankIcon(club.clubRank));
  const gain = $derived(club.liveFans == null || club.monthlyFans == null || club.liveFans < club.monthlyFans ? undefined : club.liveFans - club.monthlyFans);
  function format(value: number, signed = false): string { return value.toLocaleString('en', { signDisplay: signed ? 'exceptZero' : 'auto' }); }
  function compact(value: number, signed = false): string { return new Intl.NumberFormat('en', { notation:'compact', maximumFractionDigits:1, signDisplay:signed ? 'exceptZero' : 'auto' }).format(value); }
  function joinLabel(style: number): string { return style === 2 ? 'Approval' : style === 3 ? 'Closed' : 'Open'; }
  function trend(club: CircleCardData): number { return club.yesterdayRank && club.rank != null ? club.yesterdayRank - club.rank : 0; }
  function fans(club: CircleCardData): number { return Math.max(club.monthlyFans ?? 0, club.liveFans ?? 0); }
</script>

{#snippet count(value: number, signed = false)}<span class="full-value">{format(value, signed)}</span><span class="compact-value" title={format(value, signed)}>{compact(value, signed)}</span>{/snippet}
<article class="circle-card" class:summary={layout === 'summary'} class:row={layout === 'row'} class:rank-1={club.rank === 1} class:rank-2={club.rank === 2} class:rank-3={club.rank === 3} data-circle-id={club.circleId}>
          <div class="card-header">
            {#if layout === 'row' && club.rank != null}<div class="rank-section">
              <div class="rank-main"><strong class="rank-number">#{format(club.rank)}</strong>{#if trend(club)}<span class="rank-diff" class:positive={trend(club) > 0} class:negative={trend(club) < 0} aria-label={`${Math.abs(trend(club))} ranks ${trend(club) > 0 ? 'up' : 'down'}`}><Icon name="chevron" size={20}/>{Math.abs(trend(club))}</span>{/if}</div>
              {#if club.yesterdayRank}<small class="yesterday-rank">Yesterday: #{club.yesterdayRank}</small>{/if}
              {#if club.liveRank != null}<small class="live-rank">Live #{format(club.liveRank)}</small>{/if}
            </div>{/if}
            {#if rankIcon}<div class="club-rank-icon"><img src={rankIcon} alt="Club Rank" width="48" height="48" loading="lazy"/></div>{:else if layout === 'summary'}<div class="circle-emblem"><Icon name="community" size={28}/></div>{/if}
            <div class="circle-info">
              <a class="circle-name" title={club.name} href={`/circles/${club.circleId}`}>{club.name}</a>
              <div class="club-meta-line">{#if club.joinStyle || club.policy}<div class="circle-tags">{#if club.joinStyle}<span class="join-style" class:open={club.joinStyle === 1} class:approval={club.joinStyle === 2} class:closed={club.joinStyle === 3}>{joinLabel(club.joinStyle)}</span>{/if}{#if club.policy}<span class="policy-badge">{policyLabels[club.policy] ?? 'Unknown'}</span>{/if}</div>{/if}
              <div class="circle-meta">{#if club.leaderName}<span><span class="label">Leader:</span> {club.leaderName}</span>{/if}{#if club.members != null}<span><span class="label">Members:</span> {club.members}/30</span>{/if}</div></div>
              {#if layout === 'row' && club.comment}<p class="comment" title={club.comment}><DiscordText text={club.comment}/></p>{/if}
            </div>
            {#if layout === 'row' && (club.monthlyFans != null || club.liveFans != null)}<div class="fans-section">
              <strong class="fans-count" title={club.monthlyFans == null ? undefined : `Monthly fans: ${format(club.monthlyFans)}`}>{@render count(fans(club))}<small> Fans</small></strong>
              {#if club.yesterdayFans || gain !== undefined}<div class="gains-row">
                {#if club.yesterdayFans}<span class="gain-item"><span class="label">Daily</span><strong class="positive">{@render count((club.monthlyFans ?? 0) - club.yesterdayFans, true)}</strong></span>{/if}
                {#if club.yesterdayFans && gain !== undefined}<span class="gains-sep">·</span>{/if}
                {#if gain !== undefined}<span class="gain-item"><span class="label">Today</span><strong class:positive={gain > 0}>{@render count(gain, true)}</strong></span>{/if}
              </div>{/if}
            </div>{/if}
            <a class="actions" href={`/circles/${club.circleId}`} aria-label="Open club details"><Icon name="chevron" size={24}/></a>
          </div>
          {#if layout === 'summary'}
            <dl class="circle-metrics">
              {#if club.monthlyFans != null || club.rank != null}<div>
                {#if club.monthlyFans != null}<dt>Monthly fans</dt><dd class="fan-value">{format(club.monthlyFans)}</dd>{/if}
                {#if club.rank != null}<dt class="rank-label">Monthly rank</dt><dd class="rank-value">#{format(club.rank)}</dd>{/if}
              </div>{/if}
              {#if club.liveFans != null || club.liveRank != null}<div>
                {#if club.liveFans != null}<dt><span class="live-dot"></span>Live fans</dt><dd class="fan-value">{format(club.liveFans)}{#if gain !== undefined}<small class:positive={gain > 0}>{format(gain, true)} today</small>{/if}</dd>{/if}
                {#if club.liveRank != null}<dt class="rank-label">Live rank</dt><dd class="rank-value">#{format(club.liveRank)}</dd>{/if}
              </div>{/if}
            </dl>
          {/if}
          {#if layout === 'summary' && club.comment || children}<div class="card-body">{#if layout === 'summary' && club.comment}<p class="comment"><DiscordText text={club.comment}/></p>{/if}{@render children?.()}</div>{/if}
        </article>
<style>
  .circle-card { position:relative; min-width:0; padding:.5rem .875rem; border:1px solid var(--card-surface-border); border-radius:var(--radius-md); background:var(--card-surface-bg); transition:background .2s,border-color .2s; }
  .circle-card:hover { background:var(--card-surface-bg); border-color:var(--border-primary); }
  .circle-card.rank-1 { border-color:rgb(255 215 0/.3); }
  .circle-card.rank-2 { border-color:rgb(192 192 192/.25); }
  .circle-card.rank-3 { border-color:rgb(205 127 50/.25); }
  :global([data-theme='light']) .circle-card { background:var(--card-surface-bg); border-color:var(--card-surface-border); box-shadow:var(--card-surface-shadow); }
  :global([data-theme='light']) .circle-card:hover { background:var(--card-surface-hover-bg); border-color:var(--card-surface-hover-border); box-shadow:var(--card-surface-hover-shadow); }
  :global([data-theme='light']) .rank-1 .rank-number { color:#946100; }:global([data-theme='light']) .rank-2 .rank-number { color:#53616b; }:global([data-theme='light']) .rank-3 .rank-number { color:#9b521b; }
  .rank-1 .rank-number { color:#ffd700; font-size:1.5rem; }.rank-2 .rank-number { color:#c0c0c0; font-size:1.35rem; }.rank-3 .rank-number { color:#cd7f32; font-size:1.25rem; }
  .card-header { display:flex; flex-wrap:wrap; align-items:center; gap:.75rem; }
  .rank-section { display:flex; flex-direction:column; align-items:center; min-width:80px; }.rank-main { display:flex; align-items:center; gap:.25rem; }.rank-number { color:var(--text-primary); font-size:1.25rem; font-weight:700; line-height:1; }
  .rank-diff { display:flex; align-items:center; font-size:.875rem; font-weight:600; }.positive { color:var(--accent-green-strong); }.negative { color:var(--accent-error); }.rank-diff.positive :global(svg) { transform:rotate(180deg); }.yesterday-rank { margin-top:4px; color:var(--text-muted); font-size:.625rem; }
  .live-rank { margin-top:4px; color:var(--text-muted); font-size:10px; white-space:nowrap; }
  .club-rank-icon { display:flex; align-items:center; flex:none; }.club-rank-icon img { width:48px; height:48px; object-fit:contain; }
  .circle-info { display:flex; flex:1; flex-wrap:wrap; align-items:center; min-width:200px; column-gap:.75rem; row-gap:.18rem; }
  .circle-name { display:block; flex:0 0 100%; margin-bottom:.05rem; color:var(--accent-primary); font-size:1.125rem; font-weight:600; text-decoration:none; overflow-wrap:anywhere; }
  .circle-name::after { position:absolute; inset:0; border-radius:var(--radius-md); content:''; }.circle-name:focus-visible::after { outline:2px solid var(--accent-primary); outline-offset:2px; }.circle-name:hover { text-decoration:underline; }
  .circle-tags { display:flex; flex-wrap:wrap; gap:.3rem; }.join-style,.policy-badge { padding:2px 8px; border-radius:var(--radius-xs); font-size:.75rem; font-weight:500; }
  .join-style.open { background:rgb(76 175 80/.2); color:var(--accent-secondary); }.join-style.approval { background:rgb(255 152 0/.2); color:var(--accent-warning); }.join-style.closed { background:rgb(244 67 54/.2); color:var(--accent-error); }.policy-badge { background:rgb(156 39 176/.15); color:var(--accent-purple); }
  .circle-meta { display:flex; gap:.75rem; color:var(--text-secondary); font-size:.8125rem; }.label { color:var(--text-muted); }
  .fans-section { display:flex; flex-direction:column; align-items:flex-end; min-width:120px; }.fans-count { color:var(--text-primary); font-size:1.125rem; font-weight:600; }.gains-row { display:flex; align-items:center; flex-wrap:wrap; gap:6px; margin-top:5px; color:var(--text-secondary); font-size:.8125rem; }.gain-item { display:flex; align-items:center; gap:4px; }.gains-row strong { font-weight:600; }.gains-sep { color:var(--text-disabled); }
  .actions { position:relative; display:grid; flex:none; place-items:center; width:44px; height:44px; border-radius:var(--radius-xs); color:var(--text-secondary); }.actions :global(svg) { transform:rotate(-90deg); }.actions:hover { background:var(--surface-3); color:var(--text-primary); }
  .card-body { margin-top:.5rem; padding-top:.5rem; border-top:1px solid var(--border-primary); }.comment { margin:0; color:var(--text-primary); font-size:.875rem; line-height:1.4; overflow-wrap:anywhere; }
  .club-meta-line{display:flex;flex-wrap:wrap;align-items:center;gap:5px 12px;min-width:0}
  .compact-value{display:none}.fans-count small{margin-left:4px;font-size:10px;font-weight:400;color:var(--text-muted)}
  .row{padding:8px 14px}.row .card-header{display:grid;grid-template-columns:minmax(54px,max-content) 44px minmax(0,1fr) auto 20px;gap:12px;align-items:center}
  .row .rank-section{grid-column:1;grid-row:1;min-width:0}.row .club-rank-icon{grid-column:2;grid-row:1}.row .circle-info{grid-column:3;grid-row:1}.row .fans-section{grid-column:4;grid-row:1}.row .actions{grid-column:5;grid-row:1}.row .card-header:not(:has(.club-rank-icon)){grid-template-columns:auto 0 minmax(0,1fr) auto 16px}.row .rank-main{flex-direction:column;gap:4px}.row .rank-number{white-space:nowrap;font-size:20px}.row .rank-diff{font-size:11px}.row .live-rank{white-space:nowrap}.row .rank-diff :global(svg){width:14px;height:14px}.row .yesterday-rank{display:none}
  .row .club-rank-icon img{width:44px;height:44px}.row .circle-info{display:grid;min-width:0;gap:3px}.row .circle-name{min-width:0;margin:0;font-size:16px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .row .circle-tags{gap:4px}.row .join-style,.row .policy-badge{padding:1px 5px;font-size:10px;line-height:1.4}.row .circle-meta{min-width:0;flex-wrap:wrap;gap:6px;font-size:11px}.row .circle-meta>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.row .circle-meta>span+span{padding-left:6px;border-left:1px solid var(--border-primary)}.row .circle-meta .label{display:none}
  .row .fans-section{min-width:0;gap:4px;padding-left:16px;border-left:1px solid var(--border-subtle);font-variant-numeric:tabular-nums}.row .fans-count{font-size:17px;line-height:1.3;white-space:nowrap}.row .gains-row{display:grid;grid-template-columns:auto auto;gap:2px 12px;margin:0;font-size:11px}.row .gains-sep{display:none}.row .gain-item{gap:4px}
  .row .actions{width:20px;height:36px;color:var(--text-muted)}.row .actions :global(svg){width:18px;height:18px}
  .row .card-body{margin-top:8px;padding-top:0;border:0}.row .comment{min-width:0;height:15px;color:var(--text-muted);font-size:11px;line-height:15px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.row .comment :global(.discord-link){display:inline;min-height:0;padding:0;margin:0;border:0;background:transparent;line-height:inherit}
  @media(max-width:1100px){.row .card-header{grid-template-columns:minmax(42px,max-content) 36px minmax(0,1fr) auto 16px;gap:10px}.row .club-rank-icon img{width:36px;height:36px}.row .fans-count{font-size:15px}}
  @media(max-width:520px){
    .row{padding:8px 10px}.row .card-header{grid-template-columns:minmax(40px,max-content) 30px minmax(0,1fr) auto 12px;gap:6px}.row .rank-number{font-size:16px}.row .club-rank-icon img{width:30px;height:30px}.row .circle-name{font-size:13px}.row .club-meta-line{gap:4px}.row .circle-meta{font-size:10px}.row .join-style,.row .policy-badge{font-size:9px;padding-inline:4px}
    .row .fans-section{padding-left:8px;gap:4px}.row .fans-count{font-size:15px}.row .gains-row{grid-template-columns:1fr;justify-items:end;font-size:10px}.row .actions{width:12px}.row .full-value{display:none}.row .compact-value{display:inline}.row .comment{font-size:10px}.row .card-body{margin-top:6px}
    .row .club-meta-line{display:grid;grid-template-rows:14px 14px;gap:2px}.row .circle-tags{grid-row:1;flex-wrap:nowrap;min-width:0;overflow:hidden}.row .circle-tags>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.row .join-style{flex-shrink:0}.row .circle-meta{grid-row:2;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px;overflow:hidden}
    .row .club-meta-line:not(:has(.circle-tags)){grid-template-rows:auto}.row .club-meta-line:not(:has(.circle-tags)) .circle-meta{grid-row:1}
  }
  .summary { display:grid; grid-template-columns:minmax(220px,1fr) minmax(0,2fr); align-items:center; gap:16px; padding:12px 16px; }
  .summary .card-header { display:flex; flex-wrap:nowrap; gap:var(--space-3); }
  .circle-emblem { display:grid; place-items:center; flex:none; width:40px; height:40px; color:var(--color-accent); }
  .summary .circle-info { min-width:0; overflow:visible; gap:var(--space-1); }
  .summary .circle-name { width:auto; white-space:normal; font-size:16px; }
  .summary .circle-meta { font-size:11px; }
  .summary .circle-meta .label { display:inline; }
  .summary .actions { margin-left:auto; border:0; background:transparent; }
  .circle-metrics { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:12px 20px; margin:0; }
  .circle-metrics > div { min-width:0;display:grid;grid-template-columns:max-content minmax(0,1fr);gap:4px 8px;align-items:baseline; }.circle-metrics > div:nth-child(even){padding-left:16px;border-left:1px solid var(--border-subtle)}
  .circle-metrics dt { grid-column:1/-1;display:flex;align-items:center;gap:4px;color:var(--text-secondary);font-size:11px; }
  .circle-metrics dd { margin:0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere; }
  .fan-value { grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;font-size:22px;font-weight:650;line-height:1.3; }
  .fan-value small { font-size:10px;font-weight:400; }
  .circle-metrics .rank-label { grid-column:1;margin-top:4px; }.rank-value { grid-column:2;color:var(--text-primary);font-size:13px;font-weight:600; }
  .live-dot { width:5px; height:5px; border-radius:50%; background:var(--color-success); }
  .summary .card-body { grid-column:1/-1; margin:0; }
  @media(max-width:1100px) { .summary { grid-template-columns:minmax(0,1fr); gap:12px; padding:12px; }.circle-metrics { padding-top:12px; border-top:1px solid var(--border-subtle); } }
  @media(max-width:600px) { .circle-metrics{column-gap:12px}.circle-metrics>div:nth-child(even){padding-left:12px}.circle-metrics .fan-value{font-size:20px}.circle-metrics .rank-label{font-size:10px} }
</style>

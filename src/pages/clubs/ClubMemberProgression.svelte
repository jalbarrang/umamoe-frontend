<script lang="ts">
  import { buildClubCalendar, buildMemberProgression, formatClubGain, type ClubCalendarDay, type ClubChartMode } from '@/lib/clubs/club-progression';
  import type { ClubMemberSnapshot } from '@/lib/clubs/member-metrics';
  import IconButton from '@/components/IconButton.svelte';
  import Icon from '@/components/Icon.svelte';
  import InspectPopover from '@/components/InspectPopover.svelte';
  import LazyEChartsSurface from '@/components/charts/LazyEChartsSurface.svelte';
  import { memberProgressionOption } from './club-chart';
  import { theme } from '@/stores/theme';
  const legendHelpId = $props.id();

  let { snapshots, year, month, includePrior, search, mode = $bindable<ClubChartMode>('cumulative'), view = $bindable<'chart' | 'calendar'>('chart') }: { snapshots: ClubMemberSnapshot[]; year: number; month: number; includePrior: boolean; search: string; mode?: ClubChartMode; view?: 'chart' | 'calendar' } = $props();
  let hidden = $state<number[]>([]), savedHidden = $state<number[] | null>(null);
  let isolated = $state<number>(), highlighted = $state<number>();
  let chartHeight = $state(400), calendarWidth = $state(800);
  const progression = $derived(buildMemberProgression(snapshots, year, month, includePrior, mode, search));
  const weeks = $derived(buildClubCalendar(snapshots, year, month, search));
  const scale = $derived(Math.min(1, Math.max(.5, calendarWidth / 800)));
  const option = $derived(memberProgressionOption(progression.labels, progression.members.filter(member => !hidden.includes(member.viewerId)), mode, highlighted, $theme));
  $effect(() => { progression; hidden = []; savedHidden = null; isolated = undefined; highlighted = undefined; });

  function toggle(id: number) { hidden = hidden.includes(id) ? hidden.filter(value => value !== id) : [...hidden, id]; }
  function isolate(id: number) {
    if (isolated === id && savedHidden !== null) { hidden = savedHidden; savedHidden = null; isolated = undefined; }
    else { savedHidden ??= [...hidden]; isolated = id; hidden = progression.members.filter(member => member.viewerId !== id).map(member => member.viewerId); }
  }
  function switchView() {
    view = view === 'chart' ? 'calendar' : 'chart';
    if (view === 'chart') { hidden = []; highlighted = undefined; savedHidden = null; isolated = undefined; }
  }
</script>

{#snippet cell(day: ClubCalendarDay)}
  <span class="day-top"><span class="day-number">{day.day}</span>
    {#if day.hasData}<span class="day-delta-badge mono" class:positive={day.dailyDelta > 0} class:negative={day.dailyDelta < 0} class:neutral={!day.dailyDelta}>{day.dailyDelta ? formatClubGain(day.dailyDelta) : '-'}</span>{/if}
  </span>
  {#if day.hasData && day.memberDeltas.length}<span class="day-contributors">{#each day.memberDeltas.slice(0, 4) as member, index}<span class="contrib-row"><span class="rank-dot" class:gold={index === 0} class:silver={index === 1} class:bronze={index === 2}></span><span class="contrib-name">{member.name}</span><span class="contrib-delta mono">{formatClubGain(member.delta)}</span></span>{/each}</span>{/if}
{/snippet}

<section class="member-progression" aria-label="Member Progression">
  <header><h2>Member Progression</h2>{#if view === 'calendar'}<span class="card-header-date">{year} / {String(month).padStart(2, '0')}</span>{/if}<div class="view-toggles">
    {#if view === 'chart'}<IconButton icon={mode === 'cumulative' ? 'chart' : 'rankings'} label={mode === 'cumulative' ? 'Show daily gains' : 'Show cumulative gains'} selected={mode === 'delta'} onclick={() => mode = mode === 'cumulative' ? 'delta' : 'cumulative'}/>{/if}
    <IconButton icon={view === 'chart' ? 'calendar' : 'chart'} label={view === 'chart' ? 'Show member calendar' : 'Show member chart'} onclick={switchView}/>
  </div></header>
  {#if view === 'chart'}
    <div class="chart-wrapper"><div class="chart-area" bind:clientHeight={chartHeight}><LazyEChartsSurface {option} label={`Member progression · ${mode}`} height={chartHeight} dismissTouchTooltip/></div>
      <p class="sr-only" id={legendHelpId}>Select members to show or hide. Double-click or Shift+Enter to isolate and restore.</p>
      <div class="chart-legend" aria-label="Member visibility">{#each progression.members as member}<button type="button" title={(hidden.includes(member.viewerId) ? 'Show ' : 'Hide ') + member.name} class:hidden={hidden.includes(member.viewerId)} aria-pressed={!hidden.includes(member.viewerId)} aria-describedby={legendHelpId} onclick={() => toggle(member.viewerId)} ondblclick={() => isolate(member.viewerId)} onkeydown={event => { if (event.key === 'Enter' && event.shiftKey) { event.preventDefault(); isolate(member.viewerId); } }} onmouseenter={() => highlighted = member.viewerId} onmouseleave={() => highlighted = undefined} onfocus={() => highlighted = member.viewerId} onblur={() => highlighted = undefined}><i style:--member-color={member.color}>{#if !hidden.includes(member.viewerId)}<Icon name="check" size={11}/>{/if}</i><span>{member.name}</span></button>{/each}</div>
    </div>
  {:else}
    <div class="calendar-shell" bind:clientWidth={calendarWidth} style:--calendar-scale={scale}>
      <div class="calendar-view"><div class="calendar-header">{#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as label}<span>{label}</span>{/each}</div>
        <div class="calendar-body">{#each weeks as week}<div class="calendar-week">{#each week as day, column}
          <div class="calendar-day" class:other-month={day.isOtherMonth} class:has-data={day.hasData} class:no-data={!day.isOtherMonth && !day.hasData} data-day={day.isOtherMonth ? undefined : day.day}>
            {#if day.hasData && day.memberDeltas.length}<InspectPopover label={`Day ${day.day} contributors`} openOnHover placement="over" align={column >= 5 ? 'end' : 'start'}>
              {#snippet trigger()}{@render cell(day)}{/snippet}
              <div class="popover-header"><span>Day {day.day}</span><strong class="mono" class:positive={day.dailyDelta > 0} class:negative={day.dailyDelta < 0}>{day.dailyDelta > 0 ? '+' : ''}{day.dailyDelta.toLocaleString()}</strong></div>
              <ol class="popover-list">{#each day.memberDeltas as member, index}<li><span class="rank-dot" class:gold={index === 0} class:silver={index === 1} class:bronze={index === 2}></span><span class="popover-rank mono">{index + 1}</span><span class="popover-name">{member.name}</span><span class="popover-value mono" class:negative={member.delta < 0}>{member.delta >= 0 ? '+' : ''}{member.delta.toLocaleString()}</span></li>{/each}</ol>
            </InspectPopover>{:else}{@render cell(day)}{/if}
          </div>
        {/each}</div>{/each}</div>
      </div>
    </div>
  {/if}
</section>

<style>
  .member-progression { min-width:0; border:1px solid var(--border-subtle); border-radius:8px; background:var(--surface-1); overflow:hidden; }
  header { display:flex; align-items:center; justify-content:space-between; min-height:44px; gap:12px; padding:6px 16px; }h2 { margin:0; color:var(--text-primary); font-size:14px; font-weight:600; line-height:1.2; }.card-header-date { color:var(--text-muted); font-size:.85rem; font-weight:600; letter-spacing:.05em; }.view-toggles { display:flex; gap:4px; }
  .chart-wrapper { display:flex; flex-direction:column; gap:8px; padding:0 16px 10px; }.chart-area { flex:none; height:360px; position:relative; }.chart-area :global(.lazy-surface) { position:absolute; inset:0; min-height:0; }
  .chart-legend { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:.5rem; }.chart-legend button { display:flex; align-items:center; gap:.5rem; min-height:32px; padding:5px 8px; border:1px solid var(--factor-field-border); border-radius:var(--radius-sm); cursor:pointer; background:var(--factor-field-bg); text-align:left; font:inherit; color:var(--factor-field-text); min-width:0; }.chart-legend button:hover { border-color:var(--accent-primary); }.chart-legend button.hidden { color:var(--text-muted); text-decoration:line-through; }.chart-legend i { display:grid;place-items:center;flex:none; width:14px; height:14px; border:1px solid var(--member-color);border-radius:3px;background:var(--member-color);color:#0a0a0a }.chart-legend button.hidden i{background:transparent}.chart-legend button>span { font-size:.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .calendar-shell { overflow-x:auto; }.calendar-view { min-width:320px; padding:0 calc(8px * var(--calendar-scale)) calc(12px * var(--calendar-scale)); }.calendar-header,.calendar-week { display:grid; grid-template-columns:repeat(7,minmax(0,1fr)); gap:calc(4px * var(--calendar-scale)); }.calendar-header { margin-bottom:calc(2px * var(--calendar-scale)); }.calendar-header>span { padding:calc(4px * var(--calendar-scale)) 0; text-align:center; color:var(--text-disabled); font-size:calc(.7rem * var(--calendar-scale)); font-weight:700; text-transform:uppercase; letter-spacing:.08em; }.calendar-body { display:flex; flex-direction:column; gap:calc(4px * var(--calendar-scale)); }
  .calendar-day { display:flex; flex-direction:column; min-width:0; min-height:calc(100px * var(--calendar-scale)); gap:calc(3px * var(--calendar-scale)); padding:calc(5px * var(--calendar-scale)) calc(6px * var(--calendar-scale)); border:1px solid var(--border-subtle); border-radius:calc(var(--radius-sm) * var(--calendar-scale)); background:var(--surface-1); }.calendar-day.other-month { min-height:calc(50px * var(--calendar-scale)); background:rgb(var(--on-surface-rgb)/.01); opacity:.35; }.calendar-day.no-data { min-height:calc(50px * var(--calendar-scale)); background:rgb(var(--on-surface-rgb)/.015); }.calendar-day.has-data { background:linear-gradient(160deg,rgb(129 199 132/.04),rgb(var(--on-surface-rgb)/.02)); border-color:rgb(129 199 132/.1); }.calendar-day.has-data:hover { background:linear-gradient(160deg,rgb(129 199 132/.08),rgb(var(--on-surface-rgb)/.04)); border-color:rgb(129 199 132/.2); }
  .day-top { display:flex; justify-content:space-between; align-items:center; min-width:0; overflow:hidden; margin-bottom:calc(1px * var(--calendar-scale)); }.day-number { font-size:calc(.8rem * var(--calendar-scale)); font-weight:700; color:var(--text-muted); line-height:1; }.no-data .day-number,.other-month .day-number { color:var(--text-disabled); }.day-delta-badge { padding:calc(2px * var(--calendar-scale)) calc(7px * var(--calendar-scale)); border-radius:calc(var(--radius-xs) * var(--calendar-scale)); font-size:calc(.7rem * var(--calendar-scale)); font-weight:700; line-height:1; }.day-delta-badge.positive { background:rgb(129 199 132/.12); }.day-delta-badge.negative { background:rgb(229 115 115/.12); }.day-delta-badge.neutral { color:var(--text-disabled); background:var(--surface-2); }
  .day-contributors { display:flex; flex-direction:column; gap:calc(2px * var(--calendar-scale)); flex:1; overflow:hidden; }.contrib-row { display:flex; align-items:center; gap:calc(3px * var(--calendar-scale)); font-size:calc(.7rem * var(--calendar-scale)); line-height:1.2; min-height:calc(14px * var(--calendar-scale)); overflow:hidden; }.contrib-name { flex:1; min-width:0; color:var(--text-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }.contrib-delta { flex:none; color:rgb(129 199 132/.7); font-weight:600; text-align:right; }.rank-dot { width:5px; height:5px; border-radius:50%; flex:none; background:var(--surface-4); }.contrib-row .rank-dot { width:calc(5px * var(--calendar-scale)); height:calc(5px * var(--calendar-scale)); }.rank-dot.gold { background:#ffd700; box-shadow:0 0 4px rgb(255 215 0/.3); }.rank-dot.silver { background:#90a4ae; }.rank-dot.bronze { background:#cd7f32; }.mono { font-variant-numeric:tabular-nums; }.positive { color:var(--accent-secondary); }.negative { color:var(--accent-error); }
  .calendar-day :global(.inspect) { display:flex; flex:1; width:100%; --inspect-popover-padding:0; --inspect-popover-width:260px; }.calendar-day :global(.trigger) { display:flex; flex-direction:column; flex:1; gap:calc(3px * var(--calendar-scale)); width:100%; min-width:0; min-height:0; text-align:left; }
  .calendar-day :global(.popover) { background:var(--surface-overlay); border-color:var(--border-subtle); box-shadow:0 8px 24px rgb(0 0 0/.5); }.popover-header { display:flex; align-items:center; justify-content:space-between; gap:6px; padding:10px 40px 10px 10px; border-bottom:1px solid var(--border-subtle); color:var(--text-muted); font-size:.75rem; font-weight:600; }.popover-header strong { font-size:.7rem; }.popover-list { margin:0; padding:3px 0; list-style:none; max-height:220px; overflow:auto; }.popover-list li { display:flex; align-items:center; gap:6px; padding:4px 10px; line-height:1.3; }.popover-list li:hover { background:var(--surface-1); }.popover-rank { color:var(--text-disabled); min-width:14px; font-size:.65rem; font-weight:600; }.popover-name { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:.7rem; color:var(--text-secondary); }.popover-value { flex:none; font-size:.7rem; font-weight:600; color:rgb(129 199 132/.7); }.popover-value.negative { color:var(--accent-error); }
  @media(max-width:768px) { .chart-legend { grid-template-columns:repeat(auto-fill,minmax(110px,1fr)); gap:.25rem; }.chart-legend button { padding:3px 6px; }.chart-legend button>span { font-size:.75rem; }.chart-legend i { width:10px; height:10px; }.calendar-view { min-width:366px; padding-inline:calc(4px * var(--calendar-scale)); }.calendar-day { min-height:calc(64px * var(--calendar-scale)); padding:calc(4px * var(--calendar-scale)); }.calendar-day.no-data { min-height:calc(36px * var(--calendar-scale)); } }
  @media (max-width:767px) { .chart-legend button { min-height:var(--touch-target); }.calendar-day :global(.trigger) { min-height:var(--touch-target); min-width:var(--touch-target); }.popover-header { min-height:var(--touch-target); padding-right:48px; } }
  @media(max-width:767px) {
    header { padding:6px 12px; min-height:42px; gap:6px; }h2 { font-size:14px; }.view-toggles { --touch-target:30px; }
    .chart-wrapper { padding:0 6px 8px; }.chart-area { height:280px; }.chart-legend { grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); }.chart-legend button { min-height:28px; }.chart-legend button>span { font-size:11px; }
    .calendar-shell { --touch-target:44px; }
  }
</style>

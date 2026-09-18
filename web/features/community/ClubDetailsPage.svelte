<script lang="ts">
  import { copyText } from '../../platform/clipboard';
  import { onMount, untrack } from 'svelte';
  import { router } from '../../platform/router/router';
  import { theme } from '../../platform/theme';
  import { calculateMemberMetrics, clubProgression, type ClubMemberMetric } from '../../domain/clubs/member-metrics';
  import { clubPolicyLabels, clubMetrics, clubMetric, memberMetric, readClubConfig, clubRankIcon as rankIcon, clubInitialPeriod, clubDataStatus, formatClubTimeAgo } from '../../domain/clubs/club-display';
  import SourcePage from '../../ui/layout/SourcePage.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  import DiscordText from '../../ui/DiscordText.svelte';
  import Icon from '../../ui/Icon.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import Menu from '../../ui/Menu.svelte';
  import Spinner from '../../ui/Spinner.svelte';
  import TextField from '../../ui/TextField.svelte';
  import ToggleButton from '../../ui/ToggleButton.svelte';
  import LazyEChartsSurface from '../../ui/charts/LazyEChartsSurface.svelte';
  import { communityRepository } from './community-repository';
  import { exportClub } from './club-export';
  import ClubSettingsDialog from './ClubSettingsDialog.svelte';
  import ClubMemberProgression from './ClubMemberProgression.svelte';
  import { clubProgressionOption } from './club-chart';
  import type { ClubDetails } from './community-types';

  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000); jst.setUTCDate(jst.getUTCDate() - 1);
  const initialPeriod = clubInitialPeriod(router.route.search, { year: jst.getUTCFullYear(), month: jst.getUTCMonth() + 1 });
  let year = $state(initialPeriod.year);
  let month = $state(initialPeriod.month);
  let now = $state(Date.now());
  let details = $state<ClubDetails>();
  let loading = $state(true);
  let refreshing = $state(false);
  let error = $state('');
  let search = $state('');
  let settingsOpen = $state(false);
  let config = $state(readClubConfig(localStorage.getItem('circle_details_config')));
  let memberChartMode = $state<'cumulative' | 'delta'>('cumulative');
  let memberView = $state<'chart' | 'calendar'>('chart');
  let listMode = $state<'grid' | 'row'>('grid');
  let expandedMembers = $state<number[]>([]);
  let clubChartHeight = $state(280);
  let exportBusy = $state(false);
  let exported = false;
  let requestId = 0;
  let secondsUntilRefresh = $state(300);
  const clubId = $derived(Number(router.route.params.id || 0));
  const isCurrentMonth = $derived(year === jst.getUTCFullYear() && month === jst.getUTCMonth() + 1);
  const isLastMonth = $derived(new Date(year, month).getTime() === new Date(jst.getUTCFullYear(), jst.getUTCMonth()).getTime());
  const isLive = $derived(isCurrentMonth && Boolean(details) && (details?.circle.monthly_rank ?? 999) <= 100);
  const dataStatus = $derived(details ? clubDataStatus({ liveFans: details.circle.live_points, lastUpdated: details.circle.last_updated, lastLiveUpdate: details.circle.last_live_update }, details.members, { year, month, currentMonth: isCurrentMonth }, now) : undefined);
  const allMembers = $derived(details ? calculateMemberMetrics(details.members, { year, month, currentMonth: isCurrentMonth, includePrior: config.includePriorClubData, leaderViewerId: details.circle.leader_viewer_id }).sort((a, b) => Number(b.active) - Number(a.active) || (a.active ? memberMetric(b, config) - memberMetric(a, config) : b.fanCount - a.fanCount)) : []);
  const members = $derived(allMembers.filter((member) => !search.trim() || `${member.name} ${member.viewerId}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())));
  const history = $derived(details ? clubProgression(details.members, year, month) : []);
  const computedMonthlyFans = $derived(allMembers.reduce((sum, member) => sum + (member.active ? member.monthlyGain : 0), 0));
  const monthlyFans = $derived(isCurrentMonth ? details?.circle.monthly_point ?? computedMonthlyFans : isLastMonth ? details?.circle.last_month_point ?? computedMonthlyFans : computedMonthlyFans);
  const displayedRank = $derived(isCurrentMonth ? details?.circle.monthly_rank : isLastMonth ? details?.circle.last_month_rank || undefined : undefined);
  const primary = $derived(clubMetric(config));
  const extraMetrics = $derived(clubMetrics.filter((metric) => config[metric.flag] && metric.value !== primary.value));
  const clubChart = $derived(clubProgressionOption(history, $theme));
  function number(value: number): string { return Math.round(value).toLocaleString(); }
  function signed(value: number): string { return `${value > 0 ? '+' : ''}${number(value)}`; }
  function joinLabel(value: number): string { return value === 1 ? 'Open' : value === 2 ? 'Approval' : 'Closed'; }
  function updated(value: string): string { return formatClubTimeAgo(value, now); }
  async function copyTrainer(member: ClubMemberMetric): Promise<void> { if (!await copyText(String(member.viewerId))) error = 'Trainer ID could not be copied.'; }
  async function load(refresh = false): Promise<void> {
    const id = ++requestId, requestedClub = clubId, requestedYear = year, requestedMonth = month;
    refreshing = refresh && Boolean(details); loading = !refreshing; error = '';
    if (loading) details = undefined;
    try {
      const value = await communityRepository.clubDetails(requestedClub, requestedYear, requestedMonth, refresh);
      if (id !== requestId) return;
      details = value; now = Date.now();
      secondsUntilRefresh = communityRepository.clubDetailsRefreshSeconds(requestedClub, requestedYear, requestedMonth);
    }
    catch (reason) { if (id === requestId) error = reason instanceof Error ? reason.message : 'Club details could not be loaded.'; }
    finally { if (id === requestId) { loading = false; refreshing = false; void maybeExport(); } }
  }
  function changeMonth(offset: number): void {
    const next = new Date(year, month - 1 + offset, 1); year = next.getFullYear(); month = next.getMonth() + 1; details = undefined;
    void load();
  }
  async function download(format: string): Promise<void> {
    if (!details || !allMembers.length || exportBusy || !['csv', 'json', 'xlsx'].includes(format)) return;
    exportBusy = true;
    try { await exportClub(details, allMembers, config, year, month, format as 'csv' | 'json' | 'xlsx'); }
    catch (reason) { error = reason instanceof Error ? reason.message : 'Export could not be created.'; }
    finally { exportBusy = false; }
  }
  async function maybeExport(): Promise<void> {
    const raw = router.route.params.exportFormat?.toLowerCase();
    const format = raw === 'excel' || raw === 'xls' || raw === 'exel' ? 'xlsx' : raw;
    if (!loading && !error && !exported && format && ['csv', 'json', 'xlsx'].includes(format)) { exported = true; await download(format); }
  }
  $effect(() => { clubId; untrack(() => { exported = false; void load(); }); });
  $effect(() => { try { localStorage.setItem('circle_details_config', JSON.stringify(config)); } catch { /* Continue without persistence when browser storage is unavailable. */ } });
  onMount(() => { const timer = setInterval(() => { now = Date.now(); if (!isLive || document.hidden || loading || refreshing || error) return; secondsUntilRefresh = communityRepository.clubDetailsRefreshSeconds(clubId, year, month); if (secondsUntilRefresh <= 0) void load(true); }, 1000); return () => { clearInterval(timer); requestId++; }; });
</script>

<svelte:head><title>{details?.circle.name ?? 'Club details'} · uma.moe</title></svelte:head>
<SourcePage routeId="clubs" title={details?.circle.name ?? 'Club details'} width="wide">
  <div class="club-page">
    <header class="club-heading">
      <div class="club-identity">
        <Button href="/circles" variant="ghost" icon="arrow-left" ariaLabel="Back to clubs"/>
        <div class="club-title"><h1>{details?.circle.name ?? 'Club details'}</h1>
          <div class="heading-meta">
            <span class="membership-meta"><Icon name="users" size={14}/>{details?.circle.member_count ?? 0}/30 <span>members</span></span>
            <span class="join-meta" class:open={details?.circle.join_style === 1} class:approval={details?.circle.join_style === 2}>{joinLabel(details?.circle.join_style ?? 3)}</span>
            {#if isLive}<span class="live-status"><span class="live-dot"></span><span class="live-label">Live</span><span class="countdown">{refreshing ? 'Updating…' : `${Math.floor(secondsUntilRefresh / 60)}:${String(secondsUntilRefresh % 60).padStart(2, '0')}`}</span></span>{/if}
          </div>
        </div>
      </div>
      <div class="header-actions"><div class="month-nav" role="group" aria-label="Club month"><IconButton icon="arrow-left" label="Previous month" onclick={() => changeMonth(-1)}/><strong aria-live="polite">{year} / {String(month).padStart(2, '0')}</strong><IconButton icon="arrow-right" label="Next month" onclick={() => changeMonth(1)}/></div>{#if isLive}<div class="live-refresh-bar" class:refreshing><IconButton icon="refresh" label="Update now" disabled={refreshing} onclick={() => load(true)}/></div>{/if}<Menu label={exportBusy ? 'Exporting…' : 'Export'} items={[{ id: 'xlsx', label: 'Excel (XLSX)', disabled: exportBusy }, { id: 'csv', label: 'CSV', disabled: exportBusy }, { id: 'json', label: 'JSON', disabled: exportBusy }]} onselect={download}/></div>
    </header>
    <div class="content">
      {#if error}<Banner tone="danger" title="Club details unavailable"><p>{error}</p><Button variant="secondary" onclick={() => load(true)}>Retry</Button></Banner>{/if}
      {#if loading}<div class="loading"><Spinner size={30}/>Loading club…</div>
      {:else if details}
        <div class="overview-grid">
          <section class="info-card details-card" aria-label="Club Information">
            <header><h2>Club Information</h2>{#if dataStatus?.updatedAt}<div class="updated-row"><span class="label">Updated</span><span class="value" title={new Date(dataStatus.updatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })}>{updated(dataStatus.updatedAt)}</span></div>{/if}</header>
            <div class="info-body">
            <div class="club-overview">
            <dl class="club-fans">
              <div class="info-row fan-metric"><dt class="label">Monthly Fans</dt><dd class="value">{number(monthlyFans)}</dd></div>
              {#if dataStatus?.liveFresh}<div class="info-row fan-metric live-row"><dt class="label"><span class="live-dot"></span>Live Points</dt><dd class="value">{number(details.circle.live_points!)}</dd></div>{/if}
            </dl>
            {#if details.clubRank}
              <div class="club-rank-row" class:max-rank={!details.fansToNextTier}>
                {#if details.fansToLowerTier != null}<div class="tier-side lower">
                  {#if rankIcon(details.clubRank - 1)}<img class="tier-icon" src={rankIcon(details.clubRank - 1)} alt="Lower Tier"/>{/if}
                  <div class="tier-info"><span class="tier-gap-label"><span class="tier-direction"><Icon name="arrow-right" size={16}/></span>Tier buffer</span><strong class="tier-gap-value safe">{number(details.fansToLowerTier)}</strong>
                    {#if details.yesterdayFansToLowerTier != null}{@const delta = details.fansToLowerTier - details.yesterdayFansToLowerTier}<span class="tier-delta" class:positive={delta > 0} class:negative={delta < 0}>{signed(delta)}</span>{/if}
                  </div>
                </div>{/if}
                <div class="rank-center">{#if rankIcon(details.clubRank)}<img class="club-rank-icon" src={rankIcon(details.clubRank)} alt="Club Rank"/>{/if}{#if displayedRank !== undefined}<span class="rank-label">Rank #{number(displayedRank)}</span>{/if}</div>
                {#if details.fansToNextTier}<div class="tier-side upper">
                  <div class="tier-info"><span class="tier-gap-label"><span class="tier-direction"><Icon name="arrow-right" size={16}/></span>Next tier</span><strong class="tier-gap-value needed">{number(details.fansToNextTier)}</strong>
                    {#if details.yesterdayFansToNextTier != null}{@const delta = details.fansToNextTier - details.yesterdayFansToNextTier}<span class="tier-delta" class:positive={delta < 0} class:negative={delta > 0}>{signed(delta)}</span>{/if}
                  </div>
                  {#if rankIcon(details.clubRank + 1)}<img class="tier-icon" src={rankIcon(details.clubRank + 1)} alt="Next Tier"/>{/if}
                </div>{/if}
              </div>
            {/if}
            </div>
            <div class="club-details">
              <dl class="club-metadata"><div class="info-row leader-row"><dt class="label">Leader</dt><dd class="value">{details.circle.leader_name || details.circle.leader_viewer_id || 'Unknown'}</dd></div>{#if details.circle.policy && clubPolicyLabels[details.circle.policy]}<div class="info-row"><dt class="label">Playstyle</dt><dd class="value">{clubPolicyLabels[details.circle.policy]}</dd></div>{/if}</dl>
              {#if details.circle.comment}<p class="description"><DiscordText text={details.circle.comment}/></p>{/if}
            </div>
            </div>
          </section>
          <section class="details-card progression-card" aria-label="Club Progression"><header><h2>Club Progression</h2></header><div class="card-body"><div class="club-chart" bind:clientHeight={clubChartHeight}><LazyEChartsSurface option={clubChart} label="Club progression by observed day" height={clubChartHeight} dismissTouchTooltip/></div></div></section>
        </div>
        <ClubMemberProgression snapshots={details.members} {year} {month} includePrior={config.includePriorClubData} {search} bind:mode={memberChartMode} bind:view={memberView}/>
        <div class="club-toolbar">
          <h2>Members <span class="member-count">{members.length}</span></h2>
          <div class="member-search"><TextField id="club-member-search" label="Filter by name or ID" hideLabel type="search" placeholder="Search members by name or ID" suffixIcon="search" bind:value={search}/></div>
          <div class="member-controls">
            <ToggleButton icon="users" label="Prior club data" ariaLabel="Include Prior Club Data" pressed={config.includePriorClubData} onclick={() => config.includePriorClubData = !config.includePriorClubData}/>
            <IconButton icon={listMode === 'grid' ? 'menu' : 'grid'} label={listMode === 'grid' ? 'Show member rows' : 'Show member cards'} onclick={() => listMode = listMode === 'grid' ? 'row' : 'grid'}/><IconButton icon="filter" label="Display Settings" onclick={() => settingsOpen = true}/>
          </div>
        </div>
        <section class="members-section" aria-label="Club members">
          {#if listMode === 'grid'}<div class="members-grid">{#each members as member, index}<article class="member-card" class:inactive={!member.active} style:--placement-color={member.active ? ['#ffd700', '#90a4ae', '#cd7f32'][index] : undefined}>
            <header><span class="member-rank">#{index + 1}</span><div class="name-block"><a href={`/profile/${member.viewerId}`} target="_blank" rel="noopener noreferrer">{member.name}<Icon name="external" size={12}/></a><button type="button" class="member-id" onclick={() => copyTrainer(member)}>ID {member.viewerId}<Icon name="copy" size={12}/></button></div>{#if !member.active}<span>Left</span>{:else}<small class="role-badge" data-role={member.role}>{member.role}</small>{/if}</header>
            {#if config.showTotalFans && primary.key !== 'fanCount'}<div class="total-fans"><span>Total Fans</span><strong>{number(member.fanCount)}</strong></div>{/if}
            <div class="primary-metric"><span>{primary.label}</span><strong class:positive={primary.key !== 'fanCount' && memberMetric(member, config) > 0} class:negative={memberMetric(member, config) < 0}>{primary.key === 'fanCount' ? number(memberMetric(member, config)) : signed(memberMetric(member, config))}{#if config.includePriorClubData && member.hasPriorClubData}<sup title={`Includes ${number(member.priorClubGain)} from prior club`}>*</sup>{/if}</strong></div>
            <dl class="member-stats">{#each extraMetrics.filter((metric) => metric.key !== 'fanCount') as metric}<div><dt>{metric.label}</dt><dd class:positive={member[metric.key] > 0} class:negative={member[metric.key] < 0}>{signed(member[metric.key])}</dd></div>{/each}{#if config.showLastUpdated}<div><dt>Last Updated</dt><dd title={member.lastUpdated}>{updated(member.lastUpdated)}</dd></div>{/if}</dl>
          </article>{/each}</div>
          {:else}<div class="member-table-scroll"><table>
            <thead><tr><th class="table-rank">#</th><th>Trainer</th>{#if config.showRole}<th class="desktop-cell">Role</th>{/if}<th class="member-primary">{primary.label}</th>{#each extraMetrics as metric, metricIndex}<th class="member-extra" class:mobile-summary={metricIndex === 0}>{metric.label}</th>{/each}{#if config.showLastUpdated}<th class="desktop-cell">Updated</th>{/if}</tr></thead>
            <tbody>{#each members as member, index}
              <tr class:inactive={!member.active}>
                <td class="table-rank">{index + 1}</td>
                <td class="member-identity"><div class="member-name-row"><a href={'/profile/' + member.viewerId} title={member.name} target="_blank" rel="noopener noreferrer">{member.name}</a><button class="member-expand" type="button" aria-label={(expandedMembers.includes(member.viewerId) ? 'Hide' : 'Show') + ' stats for ' + member.name} aria-expanded={expandedMembers.includes(member.viewerId)} aria-controls={'club-member-details-' + member.viewerId} onclick={() => expandedMembers = expandedMembers.includes(member.viewerId) ? expandedMembers.filter(id => id !== member.viewerId) : [...expandedMembers, member.viewerId]}><Icon name="chevron" size={14}/></button></div><div class="identity-tools"><button class="member-id" onclick={() => copyTrainer(member)}>ID {member.viewerId}</button>{#if !member.active}<small>Left</small>{/if}</div></td>
                {#if config.showRole}<td class="desktop-cell">{member.role}</td>{/if}
                <td class="member-primary" class:positive={primary.key !== 'fanCount' && memberMetric(member, config) > 0} class:negative={memberMetric(member, config) < 0}>{number(memberMetric(member, config))}</td>
                {#each extraMetrics as metric, metricIndex}<td class="member-extra" class:mobile-summary={metricIndex === 0} class:positive={metric.key !== 'fanCount' && member[metric.key] > 0} class:negative={member[metric.key] < 0}>{number(member[metric.key])}</td>{/each}
                {#if config.showLastUpdated}<td class="desktop-cell">{updated(member.lastUpdated)}</td>{/if}
              </tr>
              {#if expandedMembers.includes(member.viewerId)}<tr class="member-details" id={'club-member-details-' + member.viewerId}><td colspan={3 + Number(extraMetrics.length > 0)}><div class="member-detail-heading"><strong>{member.name}</strong><button class="member-id" onclick={() => copyTrainer(member)}>ID {member.viewerId}<Icon name="copy" size={12}/></button>{#if !member.active}<small>Left club</small>{/if}</div><dl class="member-stats">{#if config.showRole}<div><dt>Role</dt><dd>{member.role}</dd></div>{/if}{#each extraMetrics.slice(1) as metric}<div><dt>{metric.label}</dt><dd class:positive={metric.key !== 'fanCount' && member[metric.key] > 0} class:negative={member[metric.key] < 0}>{number(member[metric.key])}</dd></div>{/each}{#if config.showLastUpdated}<div><dt>Updated</dt><dd>{updated(member.lastUpdated)}</dd></div>{/if}</dl></td></tr>{/if}
            {/each}</tbody>
          </table></div>{/if}
          {#if !members.length}<p class="no-members">No members match your search.</p>{/if}
        </section>
      {/if}
    </div>
  </div>
</SourcePage>

<ClubSettingsDialog bind:open={settingsOpen} {config} onsave={value => config = value}/>


<style>
  .club-page { min-width:0; max-width:1440px; margin-inline:auto; min-height:80vh; background:var(--bg-primary); --control-height:32px; --touch-target:32px; }
  .club-heading { display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;margin:16px 24px;padding:0 0 14px;border-bottom:1px solid var(--border-subtle); }
  .club-identity{min-width:0;display:flex;align-items:center;gap:10px;flex:1}.club-identity>:global(.ui-button){flex:none;width:32px;min-width:32px;padding:0}.club-title{min-width:0;display:grid;gap:5px}.club-title h1{margin:0;font-size:28px;font-weight:600;line-height:1.2;overflow-wrap:anywhere}
  .heading-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px 10px;font-size:12px;color:var(--text-secondary)}.membership-meta{display:flex;align-items:center;gap:4px}.join-meta{padding:2px 7px;border-radius:4px;background:var(--factor-field-bg);font-size:11px}.join-meta.open{color:var(--accent-secondary)}.join-meta.approval{color:var(--accent-warning)}
  .content { display:grid; gap:16px; min-width:0; padding:0 24px 24px; }
  .header-actions,.month-nav,.member-controls { display:flex; align-items:center; gap:8px; min-width:0; }
  .header-actions { flex-wrap:wrap; --control-height:36px; --touch-target:36px; }.month-nav { background:var(--factor-field-bg); gap:0; border:1px solid var(--factor-field-border); border-radius:6px; white-space:nowrap; font-size:12px; }.month-nav strong { padding:0 10px; font-variant-numeric:tabular-nums; line-height:1; }
  .month-nav :global(.icon-button) { width:var(--control-height);height:calc(var(--control-height) - 2px);border-radius:0;color:var(--factor-field-text); }.month-nav :global(.icon-button:first-child){border-right-color:var(--factor-field-border);border-radius:5px 0 0 5px}.month-nav :global(.icon-button:last-child){border-left-color:var(--factor-field-border);border-radius:0 5px 5px 0}.month-nav :global(svg){width:16px;height:16px}
  .header-actions :global(.trigger) { font-size:12px; }
  .month-nav,.header-actions :global(.menu) { flex-shrink:0; }
  .live-status { display:inline-flex; align-items:center; gap:4px; font-size:10px; white-space:nowrap; }.live-refresh-bar { display:flex; align-items:center; }
  .live-dot { width:5px; height:5px; flex:none; border-radius:50%; background:var(--accent-secondary); }
  .live-label { color:var(--accent-secondary); font-size:10px; font-weight:600; text-transform:uppercase; }.countdown { min-width:30px; font-variant-numeric:tabular-nums; }
  .live-refresh-bar :global(.icon-button) { width:var(--control-height); height:var(--control-height); background:var(--factor-field-bg); border-color:var(--factor-field-border); color:var(--factor-field-text); }.live-refresh-bar :global(svg) { width:16px; height:16px; }.live-refresh-bar.refreshing :global(svg) { animation:spin 1s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }@media(prefers-reduced-motion:reduce) { .live-refresh-bar.refreshing :global(svg) { animation:none; } }
  .overview-grid { display:grid; grid-template-columns:minmax(0,360px) minmax(0,1fr); gap:16px; align-items:stretch; }
  .info-body { display:grid; gap:14px; padding:0 16px 16px; }
  .club-overview { display:grid; gap:14px; }
  dl { margin:0; }dd { margin:0; font-variant-numeric:tabular-nums; }h2 { margin:0; font-size:14px; font-weight:600; }
  .club-fans { display:flex; align-items:stretch; gap:24px; min-width:0; }.fan-metric { display:flex; flex:1; flex-direction:column; gap:4px; min-width:0; }
  .label { color:var(--text-muted); font-size:11px; }.value { color:var(--text-primary); overflow-wrap:anywhere; }
  .fan-metric .value { font-size:24px; font-weight:700; line-height:1.3; }.live-row .label { display:flex; align-items:center; gap:5px; }.live-row .value { color:var(--accent-secondary); }
  .club-rank-row { display:grid; grid-template-columns:84px minmax(0,1fr); align-items:center; gap:8px 14px; min-width:0; padding:12px 0; border-block:1px solid var(--border-subtle); }
  .rank-center { grid-column:1; grid-row:1/3; display:grid; justify-items:center; gap:3px; }.club-rank-icon { width:76px; height:76px; object-fit:contain; }.rank-label { color:var(--text-primary); font-size:15px; font-weight:700; overflow-wrap:anywhere; }
  .tier-side { display:flex; align-items:center; gap:8px; min-width:0; }.lower { grid-column:2; grid-row:2; }.upper { grid-column:2; grid-row:1; }.upper .tier-icon{order:-1}
  .tier-icon { width:24px; height:24px; object-fit:contain; opacity:.7; flex:none; }.tier-info { display:grid; flex:1; grid-template-columns:minmax(0,.85fr) minmax(0,1fr); align-items:center; gap:2px 6px; min-width:0; }.tier-gap-value,.tier-delta{justify-self:end;text-align:right}.tier-delta{grid-column:2}
  .tier-gap-label { display:flex;align-items:center;gap:3px;color:var(--text-primary); font-size:14px; font-weight:600; }.tier-direction{display:flex;flex:none;transform:rotate(90deg);color:var(--text-muted)}.upper .tier-direction{transform:rotate(-90deg);color:var(--accent-secondary)}.tier-gap-value { font-size:14px; font-weight:700; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; max-width:100%; }.tier-delta { font-size:10px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; max-width:100%; color:var(--text-muted); }
  .safe,.positive { color:var(--accent-secondary); }.needed { color:var(--accent-warning); }.negative { color:var(--accent-error); }
  .club-details { display:grid; gap:12px; }
  .club-metadata { min-width:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }.club-metadata .info-row { display:grid; gap:4px; min-width:0; font-size:12px; }.club-metadata .value { min-width:0; }.info-card>header{justify-content:space-between;gap:8px}.updated-row{display:flex;align-items:baseline;justify-content:flex-end;gap:4px;white-space:nowrap}.updated-row .label,.updated-row .value { color:var(--text-muted);font-size:10px;line-height:1.2; }
  .description { margin:0; color:var(--text-secondary); font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
  .description :global(.discord-link) { padding:0; margin:0; border:0; background:transparent; color:var(--accent-primary); line-height:inherit; }
  .club-toolbar { display:grid; grid-template-columns:auto minmax(160px,1fr) auto; align-items:center; gap:10px 16px; padding-bottom:10px; border-bottom:1px solid var(--border-subtle); }
  .club-toolbar h2 { display:flex; align-items:center; gap:8px; }.member-count { padding:1px 6px; border:1px solid var(--border-subtle); border-radius:10px; color:var(--text-muted); background:var(--surface-2); font-size:11px; font-weight:500; }
  .member-controls { flex-wrap:wrap; }.member-search { width:100%; min-width:0; }.member-search :global(input) { font-size:12px; }
  .members-section { min-width:0; }
  .members-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr)); gap:12px; }
  .member-card { min-width:0; padding:10px; border:1px solid var(--border-subtle); border-radius:8px; background:var(--surface-1); }
  .member-card>header { display:flex; align-items:center; gap:8px; }.member-rank { flex:none; font-size:16px; color:var(--placement-color,var(--accent-primary)); font-weight:700; }.name-block { display:grid; gap:2px; min-width:0; flex:1; }
  a { color:var(--text-primary); text-decoration:none; }a:hover { color:var(--accent-primary); }.name-block a { display:flex; align-items:center; gap:5px; font-size:13px; font-weight:600; line-height:1.25; overflow-wrap:anywhere; }.name-block a :global(svg) { flex:none; }
  .member-id { display:flex; align-items:center; gap:5px; width:fit-content; max-width:100%; min-height:24px; padding:2px 5px; border:1px solid var(--border-subtle); border-radius:4px; background:var(--surface-2); color:var(--text-muted); font-size:10px; cursor:pointer; overflow-wrap:anywhere; }.member-id:hover { color:var(--accent-primary); border-color:var(--accent-primary); }
  .name-block .member-id { min-height:18px; padding:1px 4px; line-height:1.2; }
  .role-badge { flex:none; padding:2px 5px; border-radius:3px; font-size:9px; text-transform:uppercase; color:var(--text-muted); background:var(--surface-2); }.role-badge[data-role="leader"] { color:var(--accent-warning); background:rgb(255 167 38/.1); }.role-badge[data-role="officer"] { color:var(--accent-secondary); }
  .total-fans,.primary-metric { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:4px 10px; }
  .total-fans { padding-top:6px; margin-top:6px; border-top:1px solid var(--border-subtle); line-height:1.35; }.total-fans>span,.primary-metric>span { color:var(--text-muted); font-size:11px; }.total-fans strong { font-size:12px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; max-width:100%; }
  .primary-metric { padding:3px 0; line-height:1.35; }.primary-metric>span { color:var(--accent-primary); }.primary-metric strong { font-size:16px; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; max-width:100%; }
  .member-stats { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:6px 16px; padding-top:6px; border-top:1px solid var(--border-subtle); }.member-stats>div { display:flex; flex-wrap:wrap; align-items:baseline; justify-content:space-between; gap:2px 6px; min-width:0; }.member-stats dt { color:var(--text-muted); font-size:10px; }.member-stats dd { font-size:11px; font-weight:600; max-width:100%; overflow-wrap:anywhere; }
  .member-expand,.member-details { display:none; }.member-name-row { min-width:0; display:flex; align-items:center; gap:4px; }.identity-tools { display:flex;align-items:center;gap:4px; }.inactive { opacity:.55; }.member-table-scroll { background:var(--card-surface-bg); max-width:100%; overflow:auto; border:1px solid var(--border-subtle); border-radius:8px; }table { border-collapse:collapse; width:100%; font-size:12px; }th,td { padding:9px 12px; text-align:right; border-bottom:1px solid var(--border-subtle); white-space:nowrap; }th { color:var(--text-muted); background:var(--surface-2); }th:first-child,td:first-child,th:nth-child(2),td:nth-child(2) { text-align:left; }
  .details-card { min-width:0; overflow:hidden; border:1px solid var(--border-subtle); border-radius:8px; background:var(--surface-1); }.details-card>header { display:flex; align-items:center; min-height:52px; padding:12px 16px; }.progression-card { display:flex; flex-direction:column; }.card-body { display:flex; flex:1; padding:0 16px 16px; }.club-chart { flex:1; position:relative; min-height:240px; }.club-chart :global(.lazy-surface) { position:absolute; inset:0; min-height:0; }
  .loading { min-height:220px; display:flex; align-items:center; justify-content:center; gap:10px; color:var(--text-muted); }.no-members { padding:24px 0; color:var(--text-muted); text-align:center; font-size:12px; }
  @media(max-width:900px) { .overview-grid { grid-template-columns:minmax(0,1fr); } }
  @media(max-width:767px) {
    .club-page { --control-height:30px; --touch-target:30px; }.club-heading { margin:8px 4px 10px;padding:0 0 10px;gap:8px; }.club-identity{gap:9px;width:100%}.club-title h1{font-size:24px}.heading-meta{font-size:11px;gap:5px 8px}.membership-meta>span{display:none}
    .header-actions { width:100%; flex-wrap:nowrap; gap:6px; }.month-nav { flex:1; justify-content:space-between; }.month-nav strong { padding:0 7px; }.header-actions :global(.trigger) { font-size:11px; padding:0 7px; gap:4px; }
    .content { padding:0 4px 12px; gap:12px; }.info-body { padding:0 12px 12px; gap:10px; }.club-overview { gap:10px; }.club-fans { gap:12px; }.fan-metric .value { font-size:20px; }
    .tier-icon { width:24px; height:24px; }.club-rank-icon { width:68px; height:68px; }.tier-side { gap:5px; }.club-details { gap:6px; }.club-metadata .info-row,.description { font-size:11px; }
    .club-toolbar { grid-template-columns:1fr auto; gap:8px; padding-bottom:8px; }.member-search { grid-row:2; grid-column:1/-1; }
    .member-controls { grid-column:2; grid-row:1; flex-wrap:nowrap; gap:4px; }.member-search { width:auto; flex:1; }.member-search :global(input) { font-size:11px; padding-left:8px; padding-right:26px; }.member-search :global(.suffix-icon) { right:7px; width:14px; }.member-search :global(svg) { width:14px; }
    .member-controls :global(.ui-toggle) { padding-inline:5px; gap:4px; font-size:10px; }.member-controls :global(.ui-toggle>svg) { display:none; }
    .members-grid { gap:8px; }.member-card { padding:10px; }.name-block a { font-size:12px; }.member-stats { column-gap:12px; }.primary-metric strong { font-size:14px; }
    .member-table-scroll { overflow:hidden; }
    table{table-layout:fixed}.desktop-cell,.member-extra:not(.mobile-summary){display:none}
    th,td{padding:8px 6px;white-space:normal;overflow-wrap:anywhere;font-size:11px;vertical-align:middle}th{font-size:10px;line-height:1.3;font-weight:600;background:var(--factor-field-bg)}
    .table-rank{width:24px;color:var(--text-secondary);padding-right:0}.member-primary{width:26%;font-weight:650}td.member-primary{font-size:13px;font-variant-numeric:tabular-nums}.mobile-summary{width:21%}
    .member-name-row>a{display:block;min-width:0;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:12px;font-weight:600;line-height:1.4}.identity-tools{display:none}.member-id{min-height:20px;padding:1px 4px;font-size:9px}.identity-tools small{font-size:9px;color:var(--text-muted)}
    .member-expand{display:grid;place-items:center;flex:none;width:28px;height:28px;padding:0;border:0;border-radius:4px;background:transparent;color:var(--text-muted);cursor:pointer}.member-expand[aria-expanded="true"] :global(svg){transform:rotate(180deg)}.member-expand:hover{color:var(--accent-primary);background:var(--factor-field-bg)}
    .member-details{display:table-row;background:var(--factor-field-bg)}.member-details>td{text-align:left;padding:10px 12px;white-space:normal}.member-detail-heading{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-bottom:10px}.member-detail-heading>strong{flex-basis:100%;font-size:12px}.member-detail-heading small{color:var(--text-secondary)}.member-details .member-stats{border:0;padding:0;gap:8px 16px}
    .overview-grid { gap:12px; }.details-card>header { min-height:44px; padding:10px 12px; }.card-body { padding:0 6px 12px; }.club-chart { min-height:200px; }
  }
  @media(max-width:360px) {
    
    .club-rank-row { grid-template-columns:64px minmax(0,1fr); column-gap:8px; }.club-rank-icon { width:60px; height:60px; }.rank-label { font-size:14px; }.tier-icon { width:20px; height:20px; }.tier-side { gap:4px; }.tier-info { grid-template-columns:repeat(2,minmax(0,1fr)); }
  }
</style>

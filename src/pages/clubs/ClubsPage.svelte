<script lang="ts">
  import ContentAd from '@/layouts/ContentAd.svelte';
  import { onMount } from 'svelte';
  import AppPage from '@/layouts/AppPage.svelte';
  import Button from '@/components/Button.svelte';
  import Banner from '@/components/Banner.svelte';
  import Icon from '@/components/Icon.svelte';
  import SelectField from '@/components/SelectField.svelte';
  import Spinner from '@/components/Spinner.svelte';
  import TextField from '@/components/TextField.svelte';
  import CircleCard from '@/components/CircleCard.svelte';
  import { virtualScroll, type VirtualRange } from '@/lib/virtual-scroll';
  import { clubPolicyLabels as policyLabels } from '@/lib/clubs/club-display';
  import { communityRepository } from './community-repository';
  import type { ClubQuery, ClubSummary, PagedResult } from './community-types';

  let result = $state<PagedResult<ClubSummary>>();
  let loading = $state(true);
  let refreshing = $state(false);
  let requestId = 0;
  let error = $state('');
  let search = $state('');
  let committedSearch = $state('');
  let searchKey = $state<'query' | 'name'>('query');
  let sortBy = $state('rank');
  let sortOrder = $state<'asc' | 'desc'>('asc');
  let joinStyle = $state('all');
  let openSpots = $state(false);
  let policy = $state('all');
  let page = $state(1);
  let pageSize = $state('100');
  let secondsUntilRefresh = $state(300);
  let searchTimer: ReturnType<typeof setTimeout> | undefined;
  let refreshTimer: ReturnType<typeof setInterval> | undefined;

  const sortOptions = [{ value: 'rank', label: 'Rank' }, { value: 'fans', label: 'Total fans' }, { value: 'daily', label: 'Daily gain' }, { value: 'name', label: 'Name' }, { value: 'members', label: 'Members' }];
  const policyOptions = [{ value: 'all', label: 'All Playstyles' }, ...Object.entries(policyLabels).map(([value, label]) => ({ value, label }))];
  const pageSizeOptions = [20, 50, 100].map((value) => ({ value: String(value), label: String(value) }));
  const isTop100View = $derived(!committedSearch && page === 1 && pageSize === '100' && sortBy === 'rank');
  const remoteQuery = $derived<ClubQuery>({ page: page - 1, pageSize: Number(pageSize), query: searchKey === 'query' ? committedSearch || undefined : undefined, name: searchKey === 'name' ? committedSearch || undefined : undefined, sortBy, sortOrder });
  const visibleClubs = $derived((result?.items ?? []).filter((club) => {
    if (joinStyle !== 'all' && club.joinStyle !== ({ open: 1, approval: 2, closed: 3 } as const)[joinStyle as 'open' | 'approval' | 'closed']) return false;
    if (openSpots && club.members >= 30) return false;
    return policy === 'all' || club.policy === Number(policy);
  }));
  let virtualRange = $state<VirtualRange>({ start: 0, end: 0 });


  async function load(refresh = false): Promise<void> {
    const id = ++requestId;
    const query = remoteQuery;
    refreshing = refresh && Boolean(result);
    loading = !refreshing;
    if (loading) result = undefined;
    error = '';
    try {
      const value = await communityRepository.clubs(query, refresh);
      if (id !== requestId) return;
      result = value;
      secondsUntilRefresh = communityRepository.clubsRefreshSeconds(query);
    } catch (reason) {
      if (id === requestId) error = reason instanceof Error ? reason.message : 'The club database could not be loaded.';
    } finally { if (id === requestId) { loading = false; refreshing = false; } }
  }

  function readQuery(): void {
    const query = new URLSearchParams(location.search);
    const requestedPage = Number(query.get('page') ?? 0);
    page = Number.isSafeInteger(requestedPage) && requestedPage >= 0 ? requestedPage + 1 : 1;
    pageSize = pageSizeOptions.some((option) => option.value === query.get('pageSize')) ? query.get('pageSize')! : '100';
    search = query.get('query') || query.get('name') || ''; committedSearch = search;
    searchKey = !query.get('query') && query.get('name') ? 'name' : 'query';
    const requestedSort = query.get('sortBy'); sortBy = requestedSort && sortOptions.some((option) => option.value === requestedSort) ? requestedSort : 'rank';
    sortOrder = query.get('sortOrder') === 'desc' ? 'desc' : 'asc';
    const requestedJoin = query.get('joinStyle'); joinStyle = requestedJoin && ['open', 'approval', 'closed'].includes(requestedJoin) ? requestedJoin : 'all';
    openSpots = query.get('hasSpots') === 'true'; policy = /^\d+$/.test(query.get('policy') ?? '') ? query.get('policy')! : 'all';
  }
  function writeQuery(push = true): void {
    const url = new URL(location.href); const set = (key: string, value: string, defaultValue: string) => value === defaultValue ? url.searchParams.delete(key) : url.searchParams.set(key, value);
    set('name', searchKey === 'name' ? committedSearch : '', ''); set('page', String(page - 1), '0'); set('pageSize', pageSize, '100'); set('query', searchKey === 'query' ? committedSearch : '', ''); set('sortBy', sortBy, 'rank'); set('sortOrder', sortOrder, 'asc'); set('joinStyle', joinStyle, 'all'); set('hasSpots', String(openSpots), 'false'); set('policy', policy, 'all');
    const target = `${url.pathname}${url.search}`; if (push) history.pushState(history.state, '', target); else history.replaceState(history.state, '', target);
  }
  function changeSearch(): void {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { committedSearch = search.trim(); searchKey = 'query'; changeRemoteFilter(); }, 300);
  }
  function changeRemoteFilter(): void { page = 1; writeQuery(); void load(); }
  function clearFilters(): void { if (searchTimer) clearTimeout(searchTimer); search = ''; committedSearch = ''; searchKey = 'query'; sortBy = 'rank'; sortOrder = 'asc'; joinStyle = 'all'; openSpots = false; policy = 'all'; pageSize = '100'; changeRemoteFilter(); }
  function formatCountdown(value: number): string { return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`; }
  function tickRefresh(): void { if (!isTop100View || loading || refreshing || error) return; secondsUntilRefresh = communityRepository.clubsRefreshSeconds(remoteQuery); if (secondsUntilRefresh <= 0) void load(true); }
  function onHistory(): void { if (searchTimer) clearTimeout(searchTimer); readQuery(); void load(); }

  onMount(() => { readQuery(); void load(); refreshTimer = setInterval(tickRefresh, 1000); addEventListener('popstate', onHistory); return () => { requestId++; if (searchTimer) clearTimeout(searchTimer); if (refreshTimer) clearInterval(refreshTimer); removeEventListener('popstate', onHistory); }; });
</script>

<svelte:head><title>Clubs · uma.moe</title><meta name="description" content="Search Uma Musume clubs, ranks, fan progression, and recruitment status."/></svelte:head>
<AppPage routeId="clubs" title="Club Leaderboard" description="Find and compare Umamusume clubs." tone="brand" width="wide">
  <section class="filters-container" aria-label="Club filters">
    <div class="search-row">
      <TextField id="club-search" label="Search clubs" hideLabel type="search" suffixIcon="search" placeholder="Search clubs" bind:value={search} oninput={changeSearch}/>
      <div class="filter-dropdown"><SelectField id="club-policy" label="Playstyle" hideLabel prefixIcon="gamepad" options={policyOptions} bind:value={policy} onchange={changeRemoteFilter}/></div>
    </div>
    <div class="filter-bar">
      <div class="filter-chips" aria-label="Join style">
        <button class="filter-chip chip-open" class:active={joinStyle === 'open'} aria-pressed={joinStyle === 'open'} type="button" onclick={() => { joinStyle = joinStyle === 'open' ? 'all' : 'open'; changeRemoteFilter(); }}><Icon name="lock-open" size={15}/>Open</button>
        <button class="filter-chip chip-approval" class:active={joinStyle === 'approval'} aria-pressed={joinStyle === 'approval'} type="button" onclick={() => { joinStyle = joinStyle === 'approval' ? 'all' : 'approval'; changeRemoteFilter(); }}><Icon name="hourglass" size={15}/>Approval</button>
        <button class="filter-chip chip-closed" class:active={joinStyle === 'closed'} aria-pressed={joinStyle === 'closed'} type="button" onclick={() => { joinStyle = joinStyle === 'closed' ? 'all' : 'closed'; changeRemoteFilter(); }}><Icon name="lock" size={15}/>Closed</button>
        <button class="filter-chip toggle-chip" class:active={openSpots} aria-pressed={openSpots} type="button" onclick={() => { openSpots = !openSpots; changeRemoteFilter(); }}><Icon name="users-add" size={15}/>Has Spots</button>
      </div>
    </div>
  </section>

  <div class="results-toolbar">
    <span class="results-heading">{loading ? 'Finding clubs…' : `${visibleClubs.length} clubs${joinStyle !== 'all' || openSpots || policy !== 'all' ? ` · ${result?.items.length ?? 0} on this page` : ''}`}</span>
    {#if search || joinStyle !== 'all' || openSpots || policy !== 'all' || sortBy !== 'rank' || sortOrder !== 'asc'}<Button variant="ghost" size="sm" icon="close" onclick={clearFilters}>Clear</Button>{/if}
    {#if isTop100View}<div class="live-refresh-bar"><span class="live-dot"></span><strong>Live</strong><span class:refreshing>{refreshing ? 'Updating…' : `Next update in ${formatCountdown(secondsUntilRefresh)}`}</span><button class:refreshing type="button" title="Update now" aria-label="Update now" onclick={() => void load(true)} disabled={loading || refreshing}><Icon name="refresh" size={16}/></button></div>{/if}
  </div>
  {#if error}<Banner title="Club data unavailable" tone="danger"><p>{error}</p>{#if result}<p>Showing the last successful update.</p>{/if}<Button variant="secondary" size="sm" onclick={() => void load(true)}>Retry</Button></Banner>{/if}
  {#if loading}<div class="loading"><Spinner size={28}/><span>Loading clubs…</span></div>
  {:else if !error && visibleClubs.length === 0}<div class="no-results"><Icon name="search" size={42}/><p>No clubs match your filters.</p><Button variant="secondary" size="sm" onclick={clearFilters}>Clear all filters</Button></div>
  {:else if visibleClubs.length}
    <ContentAd routeId="clubs" top/>
    <section use:virtualScroll={{ items: visibleClubs, searchText: club => [club.name, club.circleId, club.leaderName, club.comment, club.monthlyFans, club.monthlyFans.toLocaleString()].join(' '), key: club => club.circleId, estimate: 120, onrange: range => virtualRange = range }} class="club-list" aria-label="Club results">
      {#each visibleClubs.slice(virtualRange.start, virtualRange.end) as club, localIndex (club.circleId)}{@const index = virtualRange.start + localIndex}<div data-virtual-index={index}>
        <CircleCard circle={club}/>
        {#if index % 20 === 19 && index < visibleClubs.length - 1 && index < 60}<ContentAd routeId="clubs" index={2 + Math.floor(index / 20)}/>{/if}</div>{/each}

    </section>
  {/if}
  <div class="mat-paginator"><span>Items per page:</span><SelectField id="club-page-size" label="Items per page" hideLabel options={pageSizeOptions} bind:value={pageSize} onchange={changeRemoteFilter}/><strong>{result?.total ? `${(page - 1) * Number(pageSize) + 1}–${Math.min(page * Number(pageSize), result.total)} of ${result.total}` : '0 of 0'}</strong><button type="button" aria-label="Previous page" disabled={page <= 1} onclick={() => { page -= 1; writeQuery(); void load(); }}><Icon name="chevron" size={17}/></button><button class="next" type="button" aria-label="Next page" disabled={page >= (result?.totalPages ?? 1)} onclick={() => { page += 1; writeQuery(); void load(); }}><Icon name="chevron" size={17}/></button></div>
</AppPage>

<style>
  .filters-container { display:grid; gap:8px; --control-height:34px; }.search-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,280px); align-items:center; gap:8px; }.filter-chips { min-width:0; display:flex; flex-wrap:wrap; gap:6px; }
  .filter-chip { display:flex; align-items:center; gap:5px; padding:5px 12px; border:1px solid var(--border-primary); border-radius:6px; background:var(--surface-1); color:var(--text-muted); cursor:pointer; font-family:inherit; font-size:.8125rem; font-weight:500; line-height:normal; white-space:nowrap; }
  .filter-chip:hover { background:var(--surface-2); border-color:var(--border-secondary); color:var(--text-secondary); }
  .chip-open.active { background:rgb(76 175 80/.12); border-color:rgb(76 175 80/.35); color:var(--accent-secondary); }
  .chip-approval.active { background:rgb(255 152 0/.12); border-color:rgb(255 152 0/.35); color:var(--accent-warning); }
  .chip-closed.active { background:rgb(244 67 54/.12); border-color:rgb(244 67 54/.35); color:var(--accent-error); }
  .toggle-chip.active { background:rgb(100 181 246/.12); border-color:rgb(100 181 246/.35); color:var(--accent-primary); }
  .filter-dropdown { min-width:0; }.filter-dropdown :global(.select-control) { font-size:.8125rem; font-weight:500; border-radius:6px; }
  .results-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:4px 10px; min-width:0; }
  .results-toolbar :global(.ui-button) { min-height:28px; padding:3px 6px; font-size:11px; }
  .live-refresh-bar { display:flex; align-items:center; gap:6px; margin-left:auto; color:var(--text-muted); font-size:11px; font-variant-numeric:tabular-nums; }
  .live-refresh-bar strong { color:var(--accent-secondary); font-size:10px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }.live-refresh-bar span.refreshing { color:var(--text-muted); font-style:italic; }
  .live-dot { width:5px; height:5px; flex:none; border-radius:50%; background:var(--accent-secondary); animation:pulse-dot 2s ease-in-out infinite; }
  .live-refresh-bar button { width:28px; height:28px; display:grid; place-items:center; padding:2px; border:0; border-radius:var(--radius-xs); background:transparent; color:var(--text-muted); cursor:pointer; }.live-refresh-bar button:hover:not(:disabled) { color:var(--text-primary); background:var(--surface-3); }.live-refresh-bar button:disabled { opacity:.35; cursor:default; }.live-refresh-bar button.refreshing :global(svg) { animation:spin 1s linear infinite; }
  @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:.4; } } @keyframes spin { to { transform:rotate(360deg); } }
  @media (prefers-reduced-motion:reduce) { .live-dot,.live-refresh-bar button.refreshing :global(svg) { animation:none; } }
  .loading { min-height: 220px; display: flex; align-items: center; justify-content: center; gap: var(--space-3); color: var(--color-text-muted); }.no-results { min-height: 230px; display: grid; place-items: center; align-content: center; gap: 5px; text-align: center; }.no-results :global(svg) { color: var(--text-disabled); }.no-results p { margin: 0 0 8px; color: var(--text-secondary); }
  .results-heading { color:var(--text-muted); font-size:11px; }
  .club-list { display:grid; gap:6px; }
  .mat-paginator { display:flex; align-items:center; justify-content:flex-end; gap:10px; padding-top:8px; border-top:1px solid var(--border-subtle); color:var(--text-muted); font-size:12px; --control-height:30px; }.mat-paginator :global(.field) { width:72px; }.mat-paginator strong { min-width:82px; font-weight:500; text-align:center; font-variant-numeric:tabular-nums; }.mat-paginator>button { width:30px; height:30px; display:grid; place-items:center; border:0; border-radius:6px; background:transparent; color:var(--text-secondary); cursor:pointer; }.mat-paginator>button:hover:not(:disabled) { background:var(--surface-2); }.mat-paginator>button:first-of-type :global(svg) { transform:rotate(90deg); }.mat-paginator>button.next :global(svg) { transform:rotate(-90deg); }.mat-paginator>button:disabled { opacity:.28; }
  @media (max-width:768px) {
    .search-row { grid-template-columns:minmax(0,1fr) 140px; gap:6px; }
    .filter-dropdown :global(.selected-copy > svg) { display:none; }
    .search-row :global(input),.filter-dropdown :global(.select-control) { font-size:12px; }
    .filter-chips { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:4px; }
    .filter-chip { min-width:0; min-height:30px; justify-content:center; gap:4px; padding:4px; font-size:11px; }
    .filter-chip :global(svg) { width:14px; height:14px; flex:none; }
    .mat-paginator { gap:6px; font-size:11px; }.mat-paginator :global(.field) { margin-right:auto; }
    .mat-paginator>span { white-space:nowrap; }
  }
  @media (max-width:360px) { .filter-chip { font-size:10px; gap:3px; }.results-toolbar { column-gap:6px; }.live-refresh-bar { gap:4px; font-size:10px; } }
</style>

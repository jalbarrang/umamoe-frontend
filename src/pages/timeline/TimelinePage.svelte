<script lang="ts">
  import { itemIconPath } from '@/lib/catalog/item-icons';
  import { onMount, tick } from 'svelte';
  import { searchParams } from 'sv-router';
  import { get } from 'svelte/store';
  import { activePlan, enabledPlannerTargets, setTimelineEvent, TIMELINE_PREFERENCES_KEY } from '@/lib/timeline/carat-planner';
  import { plannerCollection, plannerSaveError, savePlannerCollection } from '@/pages/carat-planner/planner-state';
  import TimelineBoard from './TimelineBoard.svelte';
  import Icon from '@/components/Icon.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import { buildTimelineLanes, timelineEndDate, type TimelineAnniversary } from '@/lib/timeline/timeline-layout';
  import AppPage from '@/layouts/AppPage.svelte';
  import Button from '@/components/Button.svelte';
  import Banner from '@/components/Banner.svelte';
  import Checkbox from '@/components/Checkbox.svelte';
  import EmptyState from '@/components/EmptyState.svelte';
  import ToggleButton from '@/components/ToggleButton.svelte';
  import SegmentedControl from '@/components/SegmentedControl.svelte';
  import Spinner from '@/components/Spinner.svelte';
  import Tabs from '@/components/Tabs.svelte';
  import TextField from '@/components/TextField.svelte';
  import TimelineEventCard from '@/components/TimelineEventCard.svelte';
  import type { TimelineEventData } from '@/components/timeline-types';
  import { timelineRepository, type TimelineRecord } from './timeline-repository';
  import Dialog from '@/components/Dialog.svelte';
  import { plannerResourceRepository } from '@/pages/carat-planner/planner-resource-repository';
  import type { PlannerGachaEntry, PlannerRewardResource } from '@/lib/timeline/carat-planner';
  import type { TimelineCalculation } from '@/lib/timeline/timeline-prediction-types';
  import { timelineDisplayTitle, type TimelinePickupCatalog } from '@/lib/timeline/timeline-pickups';
  import { buildTimelineRewardSummaries } from '@/lib/timeline/timeline-reward-summary';
  import { timelineCardContext, timelineCardRaceLines } from '@/lib/timeline/timeline-race-facts';

  const filterOptions = [
    { type: 'character_banner', label: 'Characters' },
    { type: 'support_card_banner', label: 'Support cards' },
    { type: 'paid_banner', label: 'Paid banners' },
    { type: 'story_event', label: 'Story events' },
    { type: 'campaign', label: 'Campaigns' },
    { type: 'champions_meeting', label: 'Champions Meeting' },
    { type: 'legend_race', label: 'Legend Races' },
    { type: 'league_of_heroes', label: 'League of Heroes' },
    { type: 'masters_challenge', label: 'Masters Challenge' },
    { type: 'trainer_skills_test', label: 'Trainer Skills Test' },
    { type: 'factor_research', label: 'Factor Research' },
    { type: 'strongest_team', label: 'Strongest Team' },
    { type: 'racing_carnival', label: 'Racing Carnival' },
    { type: 'scenario_release', label: 'Training scenarios' }
  ] as const;
  const filterIcons = ['user', 'cards', 'paid', 'book', 'gift', 'trophy', 'race', 'users', 'star', 'book', 'tune', 'users', 'race', 'home'] as const;
  type FilterType = typeof filterOptions[number]['type'];


  // Resource snapshots are replaced wholesale; deep proxies slow large planner scans.
  let events = $state.raw<TimelineRecord[]>([]);
  let loading = $state(true);
  let error = $state('');
  const tab = $derived(searchParams.toURLSearchParams().get('tab') === 'carat-planner' ? 'carat-planner' : 'timeline');
  let plannerVisited = $state(false), timelineVisited = $state(false);
  let view = $state<'horizontal' | 'vertical'>('horizontal');
  let compactGaps = $state(true);
  let mobile = $state(false);
  let now = $state(new Date());
  let anniversaries = $state.raw<TimelineAnniversary[]>([]);
  let timelineBoard = $state<TimelineBoard>();
  let filterPanel = $state<HTMLElement>();
  let filterTrigger: HTMLElement | undefined;
  let filtersOpen = $state(false);
  let footerVisible = $state(false);
  let search = $state('');
  let currentSearchIndex = $state(-1);
  let visibleTypes = $state<FilterType[]>(filterOptions.map((option) => option.type));
  let collection = $state(get(plannerCollection));
  let initialized = $state(false);
  let calculation = $state<TimelineCalculation | null>(null);
  let catalog = $state<TimelinePickupCatalog>({ characters: {}, supports: new Map() });
  let rewardResource = $state.raw<PlannerRewardResource>({ rewards: [] });
  let rewardsLoading = $state(false);
  let rewardsError = $state('');
  let rewardsReady = false;
  const pendingRewardEvents = new Map<string, symbol>();
  let detailEvent = $state<TimelineRecord>();
  let detailGacha = $state<PlannerGachaEntry>();
  let ratesLoading = $state(false);
  let ratesError = $state('');
  let detailRequest = 0;
  const rewardSummaries = $derived(buildTimelineRewardSummaries(rewardResource, events));

  const plannedIds = $derived([...new Set([...activePlan(collection).targets.map((target) => target.eventId), ...activePlan(collection).enabledRewardEventIds])].filter(id => !activePlan(collection).disabledEventIds.includes(id)));
  const plannerEventCount = $derived(enabledPlannerTargets(activePlan(collection)).length);
  const filtered = $derived(events.filter((event) => {
    const knownType = filterOptions.some((option) => option.type === event.eventType);
    if (knownType && !visibleTypes.includes(event.eventType as FilterType)) return false;
    const term = search.trim().toLowerCase();
    return !term || `${event.title} ${event.context ?? ''} ${event.typeLabel} ${event.pickups?.map(p => p.name + ' ' + p.subLabel).join(' ') ?? ''}`.toLowerCase().includes(term);
  }));
  const activeFilterCount = $derived(filterOptions.length - visibleTypes.length);
  const endDate = $derived(timelineEndDate(events, mobile));
  const dateLanes = $derived(buildTimelineLanes(filtered, anniversaries, endDate, compactGaps, Boolean(search.trim())));
  const searchPosition = $derived(search.trim() && filtered.length ? `${currentSearchIndex + 1} of ${dateLanes.length}` : search.trim() ? 'No results' : '');

  function setFilters(open: boolean) {
    if (open) filterTrigger = document.querySelector<HTMLElement>('[data-timeline-control="filters"] button') ?? undefined;
    filtersOpen = open;
    if (!open) {
      filterPanel?.hidePopover();
      requestAnimationFrame(() => { if (!filtersOpen && filterTrigger?.isConnected && !document.querySelector('dialog[open]')) filterTrigger.focus({ preventScroll: true }); });
    }
  }
  function changeView(value: string) { const next = value as typeof view; void timelineBoard?.changeView(next); view = next; filtersOpen = false; }
  async function changeSpacing() { const anchor = timelineBoard?.anchorDate(); compactGaps = !compactGaps; await tick(); if (anchor) await timelineBoard?.restoreAnchor(anchor); }

  function toggleType(type: FilterType): void {
    visibleTypes = visibleTypes.includes(type) ? visibleTypes.filter((item) => item !== type) : [...visibleTypes, type];
    currentSearchIndex = -1;
  }
  function savePlanner(next = collection): void { savePlannerCollection(next); }
  function plan(event: TimelineEventData, planned: boolean): void {
    const record = events.find((item) => item.id === event.id);
    if (!record) return;
    const summary = rewardSummaries.get(record.id);
    const plannerEvent = { ...record, plannerRewardAvailable: record.plannerRewardAvailable || Boolean(summary && summary.mode !== 'placement') };
    const planId = collection.activePlanId;
    const key = `${planId}:${record.id}`;
    const operation = Symbol();
    pendingRewardEvents.set(key, operation);
    collection = setTimelineEvent(collection, plannerEvent, planned, rewardsReady ? rewardResource : undefined);
    savePlanner();
    if (!planned || !plannerEvent.plannerRewardAvailable || rewardsReady) { pendingRewardEvents.delete(key); return; }
    void loadRewards().then(resource => {
      if (!resource || pendingRewardEvents.get(key) !== operation || collection.activePlanId !== planId || activePlan(collection).disabledEventIds.includes(record.id)) return;
      collection = setTimelineEvent(collection, plannerEvent, true, resource);
      savePlanner();
    }).catch(reason => { rewardsError = reason instanceof Error ? reason.message : 'The planner reward selection could not be saved.'; })
      .finally(() => { if (pendingRewardEvents.get(key) === operation) pendingRewardEvents.delete(key); });
  }
  async function loadRewards(refresh = false): Promise<PlannerRewardResource | undefined> {
    rewardsLoading = true;
    rewardsError = '';
    try { rewardResource = await plannerResourceRepository.rewards(refresh); rewardsReady = true; return rewardResource; }
    catch (reason) { rewardsError = reason instanceof Error ? reason.message : 'Event rewards could not be loaded.'; return undefined; }
    finally { rewardsLoading = false; }
  }
  async function loadRates(refresh = false): Promise<void> {
    const event = detailEvent;
    const request = ++detailRequest;
    ratesError = '';
    detailGacha = undefined;
    ratesLoading = Boolean(event?.canPlan);
    if (!event?.canPlan) return;
    try {
      const core = await plannerResourceRepository.core(refresh);
      const [gacha] = await plannerResourceRepository.gachasFor([event], core, refresh);
      if (request === detailRequest) detailGacha = gacha;
    } catch (reason) {
      if (request === detailRequest) ratesError = reason instanceof Error ? reason.message : 'Banner rates could not be loaded.';
    } finally { if (request === detailRequest) ratesLoading = false; }
  }
  function openDetails(event: TimelineEventData): void {
    detailEvent = events.find(item => item.id === event.id);
    void loadRates();
  }
  function closeDetails(): void { detailRequest++; detailEvent = undefined; }
  function cardView(event: TimelineRecord): TimelineEventData {
    const summary = rewardSummaries.get(event.id);
    const pickups = event.pickups ?? [];
    const visible = event.eventType === 'legend_race' ? pickups : pickups.slice(0, 2);
    const title = timelineDisplayTitle(event);
    return {
      ...event, title: event.eventType === 'champions_meeting' && !/^champions meeting\b/i.test(title) ? `Champions Meeting: ${title}` : title,
      context: timelineCardContext(event), pickups: visible, overflowPickups: pickups.length - visible.length,
      raceLines: event.eventType === 'legend_race' || !pickups.length ? timelineCardRaceLines(event) : [],
      rewardLabel: summary?.label, rewardContext: summary?.variable ? summary.previewLabel : undefined,
      rewards: summary?.variable
        ? summary.previewItems.map(item => ({ id: item.key, label: `${item.countLabel} ${item.label}`, amount: item.countLabel, icon: item.iconPath, fallbackIcon: item.icon === 'person' ? 'user' : 'gift' }))
        : summary?.items.map(item => ({ id: item.key, label: item.label, amount: item.kind === 'free_pulls' ? `${item.amount}×` : item.countLabel, freePulls: item.kind === 'free_pulls', icon: item.kind === 'free_pulls' && event.eventType === 'support_card_banner' ? itemIconPath(111) : item.iconPath }))
    };
  }
  function jumpSearch(offset: number): void {
    if (!dateLanes.length) return;
    currentSearchIndex = offset < 0 && currentSearchIndex <= 0 ? dateLanes.length - 1 : (currentSearchIndex + offset) % dateLanes.length;
    timelineBoard?.scrollToLane(dateLanes[currentSearchIndex]!.key);
  }
  function scrollToToday(): void { void timelineBoard?.scrollToToday(); }
  function preloadPlanner(): void {
    void import('@/pages/carat-planner/CaratPlanner.svelte').catch(() => {});
    void plannerResourceRepository.prefetchManifest();
  }

  async function load(refresh = false): Promise<void> {
    loading = true;
    error = '';
    try {
      const loaded = await timelineRepository.load(refresh);
      events = loaded.events;
      anniversaries = loaded.anniversaries;
      calculation = loaded.calculation;
      catalog = loaded.catalog;
      void loadRewards(refresh);
    } catch (reason) {
      error = reason instanceof Error ? reason.message : 'Timeline resources could not be loaded.';
    } finally {
      loading = false;
    }
  }
  onMount(() => {
    const responsive = matchMedia('(max-width: 1149px)');
    const resize = () => { mobile = responsive.matches; filtersOpen = false; };
    resize(); responsive.addEventListener('change', resize);
    const footerObserver = new IntersectionObserver(entries => { footerVisible = entries.some(entry => entry.isIntersecting); });
    const footer = document.querySelector('.site-footer');
    if (footer) footerObserver.observe(footer);
    const todayTimer = setInterval(() => { if (!document.hidden) now = new Date(); }, 300_000);
    const prepareTour = () => { filtersOpen = true; scrollToToday(); };
    addEventListener('umamoe:prepare-timeline-tour', prepareTour);
    const unsubscribe = plannerCollection.subscribe(next => collection = next);
    const stopRewards = plannerResourceRepository.watchRewards(rewards => { rewardResource = rewards; rewardsReady = true; });
    try {
      const stored = JSON.parse(localStorage.getItem(TIMELINE_PREFERENCES_KEY) ?? '{}') as { direction?: string; spacing?: string };
      if (stored.direction === 'horizontal' || stored.direction === 'vertical') view = stored.direction;
      if (stored.spacing === 'calendar' || stored.spacing === 'compact') compactGaps = stored.spacing === 'compact';
    } catch {}
    initialized = true;
    void load();
    return () => { stopRewards(); responsive.removeEventListener('change', resize); footerObserver.disconnect(); clearInterval(todayTimer); unsubscribe(); pendingRewardEvents.clear(); removeEventListener('umamoe:prepare-timeline-tour', prepareTour); };
  });
  $effect(() => {
    if (!initialized) return;
    try { localStorage.setItem(TIMELINE_PREFERENCES_KEY, JSON.stringify({ direction: view, spacing: compactGaps ? 'compact' : 'calendar' })); } catch {}
  });
  $effect(() => {
    if (tab === 'carat-planner') plannerVisited = true; else timelineVisited = true;
    filtersOpen = false;
    window.dispatchEvent(new CustomEvent('umamoe:tour-page-changed'));
  });
  $effect(() => {
    if (!filterPanel) return;
    if (filtersOpen && !filterPanel.matches(':popover-open')) filterPanel.showPopover();
    if (filtersOpen && !mobile) {
      const trigger = document.querySelector('[data-timeline-control="filters"]')?.getBoundingClientRect();
      if (trigger) { filterPanel.style.top = Math.min(trigger.bottom + 4, innerHeight - 100) + 'px'; filterPanel.style.right = Math.max(8, innerWidth - trigger.right) + 'px'; }
    } else { filterPanel.style.removeProperty('top'); filterPanel.style.removeProperty('right'); }
    if (!filtersOpen && filterPanel.matches(':popover-open')) filterPanel.hidePopover();
  });
</script>

<svelte:window onkeydown={(event) => { if (event.key === 'Escape' && filtersOpen && !document.querySelector('dialog[open]')) { event.preventDefault(); setFilters(false); } }}/>
<svelte:head><title>Timeline · uma.moe</title><meta name="description" content="Current and predicted Uma Musume content releases, banners, races, and events."/></svelte:head>
<AppPage routeId="timeline" title={tab === 'carat-planner' ? 'Carat Planner' : 'Timeline'} description={tab === 'carat-planner' ? 'Plan Carats, tickets, sparks, and banner targets.' : 'Global content releases, pickups, and events.'} metadata={tab === 'timeline' ? `${filtered.length} / ${events.length} events` : undefined} tone="brand" width="wide" flush fullBleed={tab === 'timeline'} adsEnabled={tab !== 'timeline'} fill={!mobile && tab === 'timeline'} mobileHeading="actions-only">
  {#snippet actions()}<div class="timeline-tabs">{#if tab === 'timeline' && rewardsLoading && !loading}<Spinner label="Loading event rewards" size={18}/>{/if}<Tabs label="Timeline tools" items={[{ id: 'timeline', label: 'Timeline', href: '/timeline?tab=timeline', scrollToTop: false }, { id: 'carat-planner', label: 'Carat Planner', href: '/timeline?tab=carat-planner', scrollToTop: false, onintent: preloadPlanner, badge: plannerEventCount ? String(plannerEventCount) : undefined }]} value={tab}/></div>{/snippet}
  {#if $plannerSaveError}
    <Banner title="Plan changes are not saved on this device" tone="danger">
      <p>{$plannerSaveError}</p>
      <Button size="sm" variant="secondary" onclick={() => savePlanner()}>Retry saving</Button>
    </Banner>
  {/if}
  {#if plannerVisited || tab === 'carat-planner'}
    <div hidden={tab !== 'carat-planner'}>
      {#await import('@/pages/carat-planner/CaratPlanner.svelte')}
        <div class="loading"><Spinner label="Loading Carat Planner" size={30}/><span>Loading Carat Planner…</span></div>
      {:then module}
        <module.default active={tab === 'carat-planner'} {events} {catalog} bind:collection onchange={savePlanner} saveError={$plannerSaveError}/>
      {:catch}
        <Banner title="Carat Planner could not be loaded" tone="danger"><Button variant="secondary" onclick={() => location.reload()}>Reload page</Button></Banner>
      {/await}
    </div>
  {/if}
  {#if timelineVisited || tab === 'timeline'}
    <section class="timeline-content" class:mobile hidden={tab !== 'timeline'}>
    {#if !mobile}
      <div class="toolbar-shell"><section class="toolbar">
        <div class="search" data-timeline-control="search"><TextField id="timeline-search" label="Search timeline pickups" hideLabel prefixIcon="search" type="search" placeholder="Search pickups…" bind:value={search} oninput={() => currentSearchIndex = -1}/>{#if search.trim()}<span>{searchPosition}</span>{/if}</div>
        {#if search.trim()}<div class="search-navigation"><IconButton icon="arrow-left" label="Previous search result" disabled={!filtered.length} onclick={() => jumpSearch(-1)}/><IconButton icon="arrow-right" label="Next search result" disabled={!filtered.length} onclick={() => jumpSearch(1)}/></div>{/if}
        <span class="timeline-count">{filtered.length} / {events.length}</span>
        <div class="view">
          <SegmentedControl label="Timeline direction" options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]} value={view} onchange={changeView}/>
          <div data-timeline-control="spacing"><ToggleButton icon="timeline" label="Compact gaps" pressed={compactGaps} disabled={view === 'vertical'} onclick={changeSpacing}/></div>
          <div data-timeline-control="today"><Button variant="secondary" icon="calendar" onclick={scrollToToday}>Today</Button></div>
          <div data-timeline-control="filters"><Button variant="secondary" icon="filter" ariaExpanded={filtersOpen} onclick={() => setFilters(!filtersOpen)}>Filters{#if activeFilterCount} ({activeFilterCount}){/if}</Button></div>
        </div>
      </section></div>
    {:else}
      <nav class="mobile-bottom-toolbar" class:is-footer-visible={footerVisible && !filtersOpen && !search.trim() && !activeFilterCount} inert={footerVisible && !filtersOpen && !search.trim() && !activeFilterCount} aria-label="Timeline actions">
        <div data-timeline-control="today"><Button variant="secondary" icon="calendar" onclick={scrollToToday}>Today</Button></div>
        <div data-timeline-control="filters"><Button variant="secondary" icon="search" ariaExpanded={filtersOpen} onclick={() => setFilters(!filtersOpen)}>Search &amp; filters{#if activeFilterCount} ({activeFilterCount}){/if}</Button></div>
      </nav>
    {/if}
    {#if mobile && filtersOpen}<button type="button" class="filter-backdrop" aria-label="Close timeline filters" onclick={() => setFilters(false)}></button>{/if}
    <aside bind:this={filterPanel} popover="manual" class="filter-popover" class:mobile-filter-sheet={mobile} aria-label={mobile ? 'Search & filters' : 'Visible event types'}>
      <header><strong>{mobile ? 'Search & filters' : 'Visible event types'}</strong><div><Button variant="secondary" size="sm" onclick={() => { visibleTypes = visibleTypes.length ? [] : filterOptions.map(option => option.type); currentSearchIndex = -1; }}>{visibleTypes.length ? 'Unselect all' : 'Select all'}</Button><IconButton icon="close" label="Close filters" onclick={() => setFilters(false)}/></div></header>
      {#if mobile}<div class="search" data-timeline-control="search"><TextField id="timeline-mobile-search" label="Search timeline pickups" hideLabel prefixIcon="search" type="search" placeholder="Search pickups…" bind:value={search} oninput={() => currentSearchIndex = -1}/></div>{/if}
      <div class="filter-options">{#each filterOptions as option, index}<div class="filter-option"><Checkbox id={`timeline-filter-${option.type}`} label={option.label} icon={mobile ? undefined : filterIcons[index]} checked={visibleTypes.includes(option.type)} onchange={() => toggleType(option.type)}/></div>{/each}</div>
    </aside>
    {#if error}<div class="timeline-error"><Banner title="Timeline could not be loaded" tone="danger"><p>{error}</p><Button variant="secondary" size="sm" icon="refresh" onclick={() => void load(true)}>Try again</Button></Banner></div>{/if}
    {#if loading}<div class="timeline-loading" aria-busy="true">
      <div class="loading-caption"><Spinner label="Loading Timeline data" size={22}/><span>Loading timeline…</span></div>
      <div class="loading-preview" aria-hidden="true">{#each [0, 1, 2] as lane}<div class="loading-lane"><div class="skeleton-date"></div><div class="skeleton-card"><div class="skeleton-media"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>{/each}</div>
    </div>
    {:else if !filtered.length && !error && search.trim()}<EmptyState icon="timeline" title="No events match" description="Enable another event type or clear the search."/>
    {:else if !error}
      <TimelineBoard bind:this={timelineBoard} active={tab === 'timeline'} lanes={dateLanes} events={filtered} {anniversaries} end={endDate} {now} {mobile} {view} compact={compactGaps}>
        {#snippet card(event: TimelineRecord, loadImages: boolean)}<div id={`timeline-event-${event.id}`}><TimelineEventCard event={cardView(event)} {mobile} {loadImages} planned={plannedIds.includes(event.id)} onplan={plan} onopen={openDetails}/></div>{/snippet}
      </TimelineBoard>
    {/if}
    </section>
  {/if}
</AppPage>
{#if detailEvent}
  {#key detailEvent.id}
    {#await import('./TimelineEventDetails.svelte')}
      <Dialog open title="Loading event details" onclose={closeDetails}><Spinner label="Loading event details"/></Dialog>
    {:then module}
      <module.default event={detailEvent} {catalog} {calculation} rewardSummary={rewardSummaries.get(detailEvent.id)} {rewardsLoading} {rewardsError} gacha={detailGacha} {ratesLoading} {ratesError} planned={plannedIds.includes(detailEvent.id)} onplan={plan} onclose={closeDetails} onretryrates={() => void loadRates(true)} onretryrewards={() => void loadRewards(true)}/>
    {:catch}
      <Dialog open title="Event details could not be loaded" onclose={closeDetails}><Button variant="secondary" onclick={() => location.reload()}>Reload page</Button></Dialog>
    {/await}
  {/key}
{/if}

<style>
  .timeline-tabs{display:flex;align-items:center;gap:8px;justify-content:flex-end}.timeline-tabs :global(.tabs){min-width:226px}.timeline-content{position:relative;min-width:0}.timeline-content:not(.mobile){display:flex;flex-direction:column;flex:1 1 0px;min-height:0}.timeline-content[hidden]{display:none}
  @media(max-width:1280px){.timeline-tabs :global(.tab){min-width:82px;padding-inline:9px}}
  .toolbar-shell{border-block:1px solid var(--border-primary)}.toolbar{--control-height:44px;display:flex;align-items:center;gap:12px;min-width:0;width:min(100%,var(--page-content-wide));margin-inline:auto;padding:10px var(--page-gutter-current)}
  .search{min-width:0;display:flex;flex:1;align-items:center;gap:6px;position:relative}.search :global(.field){flex:1}.search>span{position:absolute;right:9px;color:var(--text-muted);font-size:11px;white-space:nowrap;pointer-events:none}.search:has(>span) :global(input){padding-right:85px}.search-navigation{display:flex;gap:4px}.timeline-count{margin-right:auto;color:var(--text-muted);font-size:11px;white-space:nowrap}
  .view{display:flex;align-items:center;gap:10px;flex:none}.view [data-timeline-control="spacing"]{padding-inline:4px}.view :global(.ui-button){white-space:nowrap}
  .filter-popover{position:fixed;z-index:100;inset:210px 16px auto auto;margin:0;width:min(460px,calc(100vw - 24px));padding:10px;border:1px solid var(--border-primary);border-radius:var(--radius-md);background:var(--surface-overlay);color:var(--text-primary);box-shadow:0 10px 28px rgb(0 0 0/.22);max-height:calc(100dvh - 230px);overflow:auto}.filter-popover header{display:flex;align-items:center;justify-content:space-between;gap:4px;min-height:38px;color:var(--text-secondary);font-size:12px}.filter-popover header>div{display:flex;align-items:center;gap:4px}.filter-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:2px 12px}.filter-option{min-width:0}
  .mobile{padding-bottom:62px}.mobile-bottom-toolbar{position:fixed;z-index:75;inset:auto 0 calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));height:58px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:6px 8px;background:var(--surface-overlay);border-top:1px solid var(--border-primary)}.mobile-bottom-toolbar :global(.ui-button){width:100%;min-height:44px}.filter-backdrop{position:fixed;z-index:78;inset:0;border:0;background:rgb(0 0 0/.42)}.mobile-filter-sheet{inset:auto 0 calc(58px + var(--bottom-nav-height) + env(safe-area-inset-bottom));width:100%;max-height:min(66dvh,560px);border-radius:0;border-inline:0;padding:10px 12px 14px}.mobile-filter-sheet .search{margin:6px 0 10px}.mobile-filter-sheet .search :global(input){height:44px;font-size:12px}.mobile-filter-sheet .filter-options{gap:3px 10px}.mobile-filter-sheet .filter-options :global(.checkbox){min-height:44px}
  .timeline-error{padding:20px var(--page-gutter-current)}.timeline-loading{min-height:320px;padding:24px var(--page-gutter-current);overflow:hidden}.loading-caption{display:flex;align-items:center;gap:10px;margin-bottom:24px;color:var(--text-secondary);font-size:13px}.loading-preview{display:grid;grid-template-columns:repeat(3,minmax(240px,320px));gap:16px}.loading-lane{display:grid;gap:18px}.skeleton-date,.skeleton-line{background:var(--border-primary)}.skeleton-media{background:var(--surface-2)}.skeleton-date{height:16px;width:45%;margin:auto;border-radius:4px}.skeleton-card{height:167px;border:1px solid var(--border-primary);border-radius:var(--radius-md);overflow:hidden;background:var(--surface-1)}.skeleton-media{height:56px;border-bottom:1px solid var(--border-subtle)}.skeleton-line{height:12px;width:75%;margin:16px 10px;border-radius:3px}.skeleton-line.short{width:48%}.mobile .loading-preview{grid-template-columns:minmax(0,1fr)}.mobile .loading-lane{gap:10px}.mobile .skeleton-date{margin-left:0}.loading{min-height:320px;display:flex;align-items:center;justify-content:center;gap:12px;color:var(--text-secondary)}
  @media(min-width:768px){.mobile-bottom-toolbar{bottom:0}.mobile-filter-sheet{bottom:58px}}@media(max-width:1280px){.timeline-count{display:none}.toolbar{flex-wrap:wrap;gap:8px}.view{margin-left:auto;gap:8px}.search{flex-basis:240px}}
  .mobile-bottom-toolbar{transition:transform 140ms,visibility 140ms}.mobile-bottom-toolbar.is-footer-visible{visibility:hidden;pointer-events:none;transform:translateY(100%)}
  @media(prefers-reduced-motion:reduce){.mobile-bottom-toolbar{transition:none}}
  @media(max-width:768px){.timeline-tabs{width:100%;justify-content:stretch}.timeline-tabs :global(.tabs){width:100%}.timeline-tabs :global(.tab){min-width:0;flex:1}}@media(pointer: coarse) and (max-width: 1300px){.view :global(.segments button){min-height:var(--touch-target)}.view :global(.segments){height:52px}.filter-options :global(.checkbox){min-height:var(--touch-target)}}
</style>

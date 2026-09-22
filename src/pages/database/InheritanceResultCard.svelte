<script module lang="ts">
  const chanceFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const updatedDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const updatedTimeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
</script>

<script lang="ts">
  import type { IconName } from '@/components/icon-types';
  import Artwork from '@/components/Artwork.svelte';
  import Icon from '@/components/Icon.svelte';
  import InspectPopover from '@/components/InspectPopover.svelte';
  import LimitBreak from '@/components/LimitBreak.svelte';
  import RankBadge from '@/components/RankBadge.svelte';
  import SparkItem, { type SparkTone } from '@/components/SparkItem.svelte';
  import { inheritanceAffinity, inheritanceFactors, inheritanceFactorMatched, type InheritanceFactor, type SparkOrder } from '@/lib/inheritance/inheritance-factors';
  import { sparkMetrics } from '@/lib/inheritance/spark-probability';
  import type { UqlSparkHighlight } from '@/lib/inheritance/uql-spark-highlight';
  import { scenarios } from '@/lib/catalog/scenario-catalog';
  import { supportCardImagePath } from '@/lib/catalog/support-card-catalog';
  import type { VeteranAffinityEngine } from '@/lib/veterans/affinity-engine';
  import type { VeteranRecord } from '@/lib/veterans/generated/veteran-record';
  import type { InheritanceRecord, InheritanceSearchFilters } from '@/lib/inheritance/inheritance-search';
  import type { CatalogEntry } from './catalog-repository';
  import { loadOptimalRaceRecommendations, type OptimalRaceRecommendation } from '@/lib/catalog/race-catalog';
  import OptimalRacesDialog from './OptimalRacesDialog.svelte';
  import RaceResultsDialog from './RaceResultsDialog.svelte';

  interface Props {
    record: InheritanceRecord;
    activeFilters?: InheritanceSearchFilters;
    uqlHighlight?: UqlSparkHighlight;
    reportText?: string;
    reportIcon?: IconName;
    reportTooltip?: string;
    targetId?: number;
    affinityEngine?: VeteranAffinityEngine;
    raceGroups?: ReadonlyMap<number, number>;
    partner?: VeteranRecord;
    sparkPerRun?: boolean;
    showOccurrences?: boolean;
    showP2Sparks?: boolean;
    collapsedWhiteSections?: number[];
    characters: CatalogEntry[];
    supports: CatalogEntry[];
    defaultFocus?: 'all' | 'main' | 'left' | 'right';
    splitSparks?: boolean;
    sparkPortraits?: boolean;
    sparkOrder?: SparkOrder;
    hiddenSparkFactorIds?: number[];
    bookmarked?: boolean;
    actionBusy?: boolean;
    partnerWinSaddles?: number[];
    oncopy?: (record: InheritanceRecord) => void | Promise<void>;
    onbookmark?: (record: InheritanceRecord) => void | Promise<void>;
    onreport?: (record: InheritanceRecord) => void | Promise<void>;
    onshare?: (record: InheritanceRecord) => void | Promise<void>;
    onplanner?: (record: InheritanceRecord) => void;
    onvisible?: (record: InheritanceRecord) => void;
  }
  let { record, activeFilters, uqlHighlight, reportText = 'Outdated', reportIcon = 'warning', reportTooltip = 'Report this trainer as unavailable', targetId, affinityEngine, raceGroups = new Map(), partner, sparkPerRun = $bindable(false), showOccurrences = $bindable(false), showP2Sparks = $bindable(false), collapsedWhiteSections = $bindable([]), characters, supports, defaultFocus = 'all', splitSparks = false, sparkPortraits = false, sparkOrder = 'main', hiddenSparkFactorIds = [], bookmarked = false, actionBusy = false, partnerWinSaddles = [], oncopy, onbookmark, onreport, onshare, onplanner, onvisible }: Props = $props();
  let cardElement: HTMLElement;
  let factorsVisible = $state(false);
  let raceResultsOpen = $state(false);
  let optimalRacesOpen = $state(false);
  let optimalRecommendations = $state.raw<OptimalRaceRecommendation[]>([]);
  let optimalError = $state('');
  let optimalRetry = $state(0);
  let selectedParent = $state<'all' | 'main' | 'left' | 'right' | undefined>();

  function character(id: number): CatalogEntry | undefined {
    const exact = characters.find((entry) => Number(entry.id) === id);
    if (exact) return exact;
    return characters.find((entry) => Math.floor(Number(entry.id) / 100) === id || Math.floor(Number(entry.id) / 100) === Math.floor(id / 100));
  }
  const main = $derived(character(record.mainParentId));
  const left = $derived(character(record.leftParentId));
  const right = $derived(character(record.rightParentId));
  const support = $derived(supports.find((entry) => Number(entry.id) === record.supportCardId));
  $effect(() => {
    void optimalRetry;
    optimalError = '';
    const p1 = record.mainWinSaddles.join(','); const p2 = partnerWinSaddles.join(',');
    if (!p1 || !p2) { optimalRecommendations = []; return; }
    optimalRecommendations = [];
    let current = true; void loadOptimalRaceRecommendations(record.mainWinSaddles, partnerWinSaddles)
      .then((value) => { if (current) optimalRecommendations = value; })
      .catch((error: unknown) => { if (current) optimalError = error instanceof Error ? error.message : 'Optimal races could not be loaded.'; });
    return () => { current = false; };
  });

  const affinity = $derived(inheritanceAffinity(record, targetId, partner, affinityEngine, raceGroups, partnerWinSaddles));
  const hasP2Sparks = $derived(Boolean(partner?.factors.length || partner?.parents.some((parent) => (parent.positionId === 10 || parent.positionId === 20) && parent.factors.length)));
  const scenario = $derived(scenarios.find((scenario) => scenario.id === record.scenarioId));
  const updatedDate = $derived(new Date(record.lastUpdated ?? ''));
  const updatedLabel = $derived(Number.isNaN(updatedDate.getTime()) ? '' : `${updatedDateFormat.format(updatedDate)} at ${updatedTimeFormat.format(updatedDate)}`);
  function chance(factor: InheritanceFactor): string | undefined {
    if (!factor.sources.length || (targetId && !affinityEngine?.ready)) return undefined;
    const metrics = sparkMetrics(factor.sources.map((source) => ({ spark: { type: factor.type, level: source.level }, affinity: affinity.source(source) })), sparkPerRun);
    return `${chanceFormat.format(metrics.guaranteed ? metrics.expected : metrics.chance)}${metrics.guaranteed ? 'x' : '%'}`;
  }
  let expandedHidden = $state<number[]>([]);
  const activeFocus = $derived(selectedParent === 'all' ? undefined : selectedParent ?? (defaultFocus === 'all' ? undefined : defaultFocus));
  const displayFactors = $derived(inheritanceFactors(record, splitSparks, activeFocus, showP2Sparks ? partner : undefined, sparkOrder));
  const groups = [
    { type: 0, tone: 'blue', label: '' }, { type: 1, tone: 'pink', label: '' }, { type: 5, tone: 'green', label: '' },
    { type: 4, tone: 'white', label: 'Scenario whites' }, { type: 3, tone: 'white', label: 'Normal whites' }, { type: 2, tone: 'white', label: 'Race whites' }
  ] as const;
  function groupFactors(type: number): InheritanceFactor[] { return displayFactors.filter((factor) => factor.group === type); }
  function selectParent(parent: 'main' | 'left' | 'right'): void { selectedParent = activeFocus === parent ? 'all' : parent; }
  async function copyTrainer(): Promise<void> {
    await oncopy?.(record);
  }
  $effect(() => {
    if (!cardElement) return;
    if (typeof IntersectionObserver === 'undefined') { factorsVisible = true; return; }
    const visibleRecord = record;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      factorsVisible = true;
      onvisible?.(visibleRecord); observer.disconnect();
    }, { rootMargin: '160px 0px', threshold: .2 });
    observer.observe(cardElement);
    return () => observer.disconnect();
  });
</script>

<article class="inheritance-card" bind:this={cardElement} class:modified={record.isStale}>
  <header class="record-header">
    <div class="record-toolbar">
      <button class="trainer-copy" type="button" onclick={copyTrainer} title={`Copy trainer ID ${record.accountId}`}><strong>{record.trainerName || 'Unknown Trainer'}</strong><span><Icon name="copy" size={13}/>{record.accountId.replace(/(\d{3})(?=\d)/g, '$1 ') || 'N/A'}</span></button>
      {#if record.followerCount === 1000}<span class="record-alert"><Icon name="warning" size={13}/>Max</span>{/if}
      {#if record.isStale}<span class="record-alert modified-label"><Icon name="refresh" size={13}/>Modified</span>{/if}
      <div class="record-actions" aria-label="Record actions">
        <button class="plan-action" type="button" aria-label="Plan" onclick={() => onplanner?.(record)} title="Open in Lineage Planner"><Icon name="lineage" size={15}/><span>Plan</span></button>
        <button class="share-action" type="button" aria-label="Share" onclick={() => onshare?.(record)} disabled={!record.accountId} title="Copy share link"><Icon name="external" size={15}/><span>Share</span></button>
        {#if record.raceResults.length}<button class="race-action" type="button" aria-label="Races" onclick={() => raceResultsOpen = true} title="View race results for main parent"><Icon name="trophy" size={15}/><span>Races</span></button>{/if}
        {#if optimalRecommendations.length}<button class="race-action" type="button" aria-label="Optimal Races" onclick={() => optimalRacesOpen = true} title="G1 races that overlap P1/P2 and maximize future affinity"><Icon name="calendar" size={15}/><span class="action-desktop">Optimal Races</span><span class="action-mobile">Best</span></button>{/if}
        {#if optimalError}<button class="race-action" type="button" onclick={() => optimalRetry++} title={optimalError} aria-label="Retry optimal races"><Icon name="refresh" size={15}/><span>Retry optimal races</span></button>{/if}
        <button class="report-action" type="button" aria-label="Report trainer" onclick={() => onreport?.(record)} disabled={actionBusy || !record.accountId} title={reportTooltip}><Icon name={reportIcon} size={15}/><span class="action-desktop">{reportText}</span><span class="action-mobile">Report</span></button>
        {#if onbookmark}<button class="save-action" type="button" aria-label={bookmarked ? 'Saved' : 'Save'} class:active={bookmarked} onclick={() => onbookmark?.(record)} disabled={actionBusy} title={bookmarked ? 'Remove bookmark' : 'Bookmark this record'}><Icon name="star" size={15}/><span>{bookmarked ? 'Saved' : 'Save'}</span></button>{/if}
      </div>
    </div>
    <div class="record-stats" aria-label="Inheritance summary">
      <div class="summary-metrics">
      {#if affinity.total !== null}<InspectPopover label="Total affinity breakdown">
        {#snippet trigger()}<span class="stat affinity"><strong>{affinity.total?.toLocaleString()}</strong><span>Affinity</span></span>{/snippet}
        <div class="affinity-breakdown"><strong>Total affinity: {affinity.total}</strong>{#if affinity.base !== null}<span>Base: {affinity.base} + Race: {affinity.race}</span>{:else}<span>Stored record score; local affinity data is not available yet.</span>{/if}{#if affinity.crossRace}<span>Includes P1–P2 races: {affinity.crossRace}</span>{/if}</div>
      </InspectPopover>{/if}
      {#if affinity.crossRace}<div class="stat cross-race" title="Race affinity from G1 wins shared by P1 and P2; counted once in the total"><strong>{affinity.crossRace.toLocaleString()}</strong><span>P1–P2 Race</span></div>{/if}
      {#if record.winCount !== undefined}<div class="stat wins"><strong>{record.winCount.toLocaleString()}</strong><span>G1 Wins</span></div>{/if}
      {#if record.whiteCount !== undefined}<div class="stat whites"><strong>{record.whiteCount.toLocaleString()}</strong><span>White Skills</span></div>{/if}
      </div>
      {#if scenario || record.rarity || record.rankScore}<div class="summary-meta">
      {#if scenario}<div class="scenario-mark"><svg viewBox={scenario.viewBox} role="img" aria-label={scenario.label}><title>{scenario.label}</title><image href={scenario.image} width={scenario.width} height={scenario.height}/></svg></div>{/if}
      {#if record.rarity || record.rankScore}<div class="rank-score">{#if record.rarity}<RankBadge rarity={record.rarity} size="md"/>{/if}{#if record.rankScore}<div class="stat score"><strong>{record.rankScore.toLocaleString()}</strong><span>Score</span></div>{/if}</div>{/if}
      </div>{/if}
    </div>
  </header>

  <div class="inheritance-body">
    <div class="character-panel">
      <div class="lineage-frame" aria-label="Veteran lineage">
        <div class="lineage-person lineage-main" data-owner="main"><button class="lineage-node" class:selected={activeFocus === 'main'} type="button" aria-pressed={activeFocus === 'main'} onclick={() => selectParent('main')} title="Focus primary parent sparks; click again to clear">
          <Artwork src={main?.image} alt={main?.title ?? `Character ${record.mainParentId}`} shape="circle" size="lg"/>
        </button>{@render affinityBadge('main', 'Main parent')}<span class="lineage-role">Main</span></div>
        <svg class="lineage-bracket" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0 L50 9 M15 9 L85 9 M15 9 L15 24 M85 9 L85 24" vector-effect="non-scaling-stroke"/></svg>
        <div class="grandparents">
          <div class="lineage-person lineage-grandparent" data-owner="left"><button class="lineage-node" class:selected={activeFocus === 'left'} type="button" aria-pressed={activeFocus === 'left'} onclick={() => selectParent('left')} title="Focus Legacy 1 sparks; click again to clear">
            <Artwork src={left?.image} alt={left?.title ?? `Character ${record.leftParentId}`} shape="circle" size="md"/>
          </button>{@render affinityBadge('left', 'Legacy 1')}<span class="lineage-role">Legacy 1</span></div>
          <div class="lineage-person lineage-grandparent" data-owner="right"><button class="lineage-node" class:selected={activeFocus === 'right'} type="button" aria-pressed={activeFocus === 'right'} onclick={() => selectParent('right')} title="Focus Legacy 2 sparks; click again to clear">
            <Artwork src={right?.image} alt={right?.title ?? `Character ${record.rightParentId}`} shape="circle" size="md"/>
          </button>{@render affinityBadge('right', 'Legacy 2')}<span class="lineage-role">Legacy 2</span></div>
        </div>
      </div>
      {#if record.supportCardId}<div class="support-card-section">
        <Artwork src={supportCardImagePath(String(record.supportCardId))} fallbackSrc={support?.image} alt={support?.title ?? `Support card ${record.supportCardId}`} kind="card" size="md"/>
        {#if record.supportLimitBreak !== undefined}<span class="limit-break"><LimitBreak value={record.supportLimitBreak}/></span>{/if}
        <span class="support-role">Support</span>
      </div>{/if}
    </div>

    <section class="spark-arrays" aria-label="Main Veteran factors">
      {#if factorsVisible}
      {#if affinity.total !== null}<div class="spark-modes"><button type="button" class="count-mode" aria-pressed={sparkPerRun} title={sparkPerRun ? 'Two inheritance rolls per run' : 'One inheritance roll'} onclick={() => sparkPerRun = !sparkPerRun}>{sparkPerRun ? 'Per Run' : 'Per Inh.'}</button>{#if !splitSparks && !activeFocus}<button type="button" class="count-mode" aria-pressed={showOccurrences} onclick={() => showOccurrences = !showOccurrences}>{showOccurrences ? '× Occurrences' : '★ Stars'}</button>{#if hasP2Sparks}<button type="button" class="count-mode" aria-pressed={showP2Sparks} onclick={() => showP2Sparks = !showP2Sparks}>P2 Sparks {showP2Sparks ? 'ON' : 'OFF'}</button>{/if}{/if}</div>{/if}
      {#each groups as group}
        {@const values = groupFactors(group.type)}
        {@const hiddenCount = values.filter((factor) => hiddenSparkFactorIds.includes(factor.id)).length}
        {#if values.length}
          <div class="spark-row"><span class="spark-type-indicator {group.tone}" aria-hidden="true"></span><div class="spark-section">
            {#if group.label}<details open={!collapsedWhiteSections.includes(group.type)} class="white-section"><summary onclick={(event) => { event.preventDefault(); collapsedWhiteSections = collapsedWhiteSections.includes(group.type) ? collapsedWhiteSections.filter((type) => type !== group.type) : [...collapsedWhiteSections, group.type]; }}>{group.label}</summary><div class="spark-list">
              {#each values.filter((factor) => !hiddenSparkFactorIds.includes(factor.id) || expandedHidden.includes(group.type)) as factor, index (`${factor.id}:${index}`)}{@render factorChip(factor, group.tone)}{/each}
              {#if hiddenCount}<button class="hidden-summary" type="button" aria-expanded={expandedHidden.includes(group.type)} onclick={() => expandedHidden = expandedHidden.includes(group.type) ? expandedHidden.filter((type) => type !== group.type) : [...expandedHidden, group.type]}>{expandedHidden.includes(group.type) ? '−' : '+'} {hiddenCount} hidden</button>{/if}
            </div></details>
            {:else}<div class="spark-list">{#each values.filter((factor) => !hiddenSparkFactorIds.includes(factor.id)) as factor, index (`${factor.id}:${index}`)}{@render factorChip(factor, group.tone)}{/each}</div>{/if}
          </div></div>
        {/if}
      {/each}
      {:else}<div class="spark-placeholder" aria-hidden="true"></div>{/if}
    </section>
  </div>

  <footer class="record-footer">
    <div class="borrow-stats"><span title="Borrow views" aria-label={`${record.borrowViews.toLocaleString()} borrow views`}><Icon name="eye" size={13}/><b>{record.borrowViews.toLocaleString()}</b></span><span class="copy-stat" title="Trainer ID copies" aria-label={`${record.borrowCopies.toLocaleString()} Trainer ID copies`}><Icon name="copy" size={13}/><b>{record.borrowCopies.toLocaleString()}</b></span></div>
    <div class="footer-meta"><span class="verified" title="Verified record"><Icon name="check" size={13}/>Verified</span>{#if updatedLabel}<span aria-hidden="true">·</span><time datetime={record.lastUpdated}>{updatedLabel}</time>{/if}</div>
  </footer>
</article>


{#snippet factorChip(factor: InheritanceFactor, groupTone: SparkTone)}
  {@const source = factor.sources[0]}
  {@const matched = inheritanceFactorMatched(factor, activeFilters, uqlHighlight)}
  {@const portrait = source?.side === 'p2' ? character(source.owner === 'main' ? partner?.cardId ?? 0 : partner?.parents.find(parent=>parent.positionId===(source.owner==='left'?10:20))?.cardId ?? 0) : factor.owner === 'main' ? main : factor.owner === 'left' ? left : right}
  {@const p2Stars = factor.sources.filter((source) => source.side === 'p2').reduce((total, source) => total + source.level, 0)}
  <span class="factor-source" title={splitSparks ? `${portrait?.title ?? (factor.owner === 'main' ? 'Main parent' : factor.owner === 'left' ? 'Legacy 1' : 'Legacy 2')}${source?.side === 'p2' ? ' (your legacy)' : ''}` : undefined} data-owner={factor.owner} data-side={factor.sources.length && factor.sources.every((source) => source.side === 'p2') ? 'p2' : 'p1'} class:matched-filter={matched} class:hidden-factor={hiddenSparkFactorIds.includes(factor.id)}>
    <SparkItem {matched} highlightMain={splitSparks} portrait={splitSparks && sparkPortraits && portrait?.image ? { image:portrait.image, title:portrait.title } : undefined} name={factor.name} level={showOccurrences && !splitSparks && !activeFocus && factor.copies ? factor.copies : factor.level} countMode={showOccurrences && !splitSparks && !activeFocus && factor.copies > 0 ? 'occurrences' : 'stars'} tone={groupTone} chance={chance(factor)} mainStars={!splitSparks && !activeFocus ? factor.mainStars : 0} p2Stars={!splitSparks && !activeFocus ? p2Stars : 0} source={factor.sources.length && factor.sources.every((source) => source.side === 'p2') ? 'p2' : factor.owner === 'main' || factor.mainStars > 0 ? 'main' : undefined}/>
  </span>
{/snippet}

{#snippet affinityBadge(owner: 'main' | 'left' | 'right', label: string)}
  {@const detail = affinity.detail(owner)}
  {#if detail}<InspectPopover label="{label} affinity breakdown">
    {#snippet trigger()}<span class="source-affinity" class:breeding={!targetId} data-owner={owner}><Icon name="heart" size={12}/>{detail.total}</span>{/snippet}
    <div class="affinity-breakdown"><strong>{label}: {detail.total}</strong><span>Base: {detail.base}{detail.cross ? ` + P1–P2: ${detail.cross}` : ''} + Race: {detail.race}</span></div>
  </InspectPopover>{/if}
{/snippet}

<RaceResultsDialog bind:open={raceResultsOpen} charId={record.mainParentId} charName={main?.title ?? `Character ${record.mainParentId}`} charImage={main?.image} winSaddleIds={record.mainWinSaddles} runRaceIds={record.raceResults}/>
<OptimalRacesDialog bind:open={optimalRacesOpen} recommendations={optimalRecommendations}/>

<style>
  .inheritance-card {
    content-visibility: auto;
    contain-intrinsic-block-size: auto 650px;
    min-width: 0;
    padding: clamp(.75rem, 1.5vw, 1.5rem);
    border: 1px solid var(--entry-card-border);
    border-radius: var(--radius-lg);
    background: var(--entry-card-bg);
    container: inheritance-card / inline-size;
  }
  .inheritance-card.modified { border-color: rgb(255 183 77 / .45); }
  .spark-placeholder { min-height: 220px; }
  :global([data-theme='light']) .inheritance-card { border-color: var(--card-surface-border); }
  .record-header { display: grid; gap: 8px; }
  .record-toolbar { min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 7px; }
  .trainer-copy { min-width: 0; display: inline-flex; align-items: center; gap: 6px; padding: 3px 4px 3px 9px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--factor-field-bg); color: var(--text-primary); cursor: pointer; }
  .trainer-copy:hover { border-color: rgb(var(--accent-primary-rgb) / .35); background: rgb(var(--on-surface-rgb) / .07); }
  .trainer-copy strong { max-width: clamp(80px, 22cqw, 220px); overflow: hidden; font-size: .85rem; font-weight: 600; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; }
  .trainer-copy span { height: 24px; display: inline-flex; align-items: center; gap: 4px; padding-inline: 6px; border-radius: var(--radius-xs); background: transparent; color: var(--text-secondary); font-size: .72rem; letter-spacing: .02em; line-height: 1; }
  .record-alert { min-height: 22px; display: inline-flex; align-items: center; gap: 4px; padding-inline: 7px; border: 1px solid rgb(255 152 0 / .35); border-radius: var(--radius-xs); background: rgb(255 152 0 / .12); color: var(--accent-warning); font-size: .61rem; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
  .modified-label { border-color: rgb(255 167 38 / .4); color: #ffb74d; }
  .record-actions { min-width: 0; display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 4px; margin-left: auto; }
  .record-actions button { min-height: 28px; display: inline-flex; align-items: center; justify-content: center; gap: .3rem; padding: 0 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--factor-field-bg); color: var(--text-secondary); cursor: pointer; font-size: .72rem; font-weight: 600; letter-spacing: .02em; line-height: 1.5; }
  .record-actions button:hover { transform: translateY(-1px); }
  .record-actions button > span { color:var(--factor-field-text); }
  .record-actions .plan-action { color: var(--entry-plan-color); }
  .record-actions .share-action { color: var(--entry-share-color); }
  .record-actions .race-action { color: var(--entry-race-color); }
  .record-actions .report-action { color: var(--accent-warning); }
  .record-actions .save-action { color:var(--color-gold); }
  .record-actions .save-action.active { border-color: rgb(255 193 7 / .4); background: rgb(255 193 7 / .12); color: var(--color-gold); }
  .record-actions button:disabled { cursor: wait; opacity: .45; }
  .record-actions .action-mobile { display: none; }
  .record-stats { min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: .6rem 1.25rem; padding: .55rem .8rem; border: 1px solid var(--entry-stats-border); border-radius: var(--radius-md); background: var(--entry-stats-bg); }
  .summary-metrics, .summary-meta { display:contents; }
  .stat { min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: .15rem; line-height: 1; }
  .stat strong { font-size: clamp(1.05rem, 2.4cqw, 1.4rem); font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -.01em; line-height: 1; }
  .stat span { color: var(--text-muted); font-size: .65rem; font-weight: 600; letter-spacing: .04em; line-height: 1; text-transform: uppercase; }
  .stat.affinity strong { color: var(--color-pink); }.stat.cross-race strong { color: #ffca28; }.stat.wins strong { color: var(--color-green); }.stat.whites strong { color: var(--accent-warning); }.stat.score strong { color: var(--accent-primary); }
  .scenario-mark{flex:none;padding-left:16px;border-left:1px solid var(--border-subtle)}.scenario-mark svg{display:block;width:80px;height:44px}.spark-modes{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px}.spark-modes .count-mode{min-height:28px;padding:5px 10px;font-size:11px;font-weight:600;color:var(--factor-field-text);border-color:var(--factor-field-border);background:var(--factor-field-bg)}.spark-modes .count-mode[aria-pressed="true"]{color:var(--color-accent);border-color:var(--color-accent);background:var(--color-accent-soft)}
  .rank-score { display: flex; align-items: center; gap: 12px; margin-left: auto; padding-left: 18px; border-left: 1px solid var(--border-subtle); }
  .inheritance-body { min-width: 0; display: flex; align-items: stretch; gap: 16px; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border-primary); }
  .character-panel { width: 190px; display: flex; flex: 0 0 auto; flex-direction: column; align-items: stretch; gap: 8px; }
  .lineage-frame { display: flex; flex-direction: column; align-items: center; }
  .lineage-person { display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 0; }
  [data-owner='main'] { --source-color:var(--spark-source-main); }
  [data-owner='left'] { --source-color:var(--accent-primary); }
  [data-owner='right'] { --source-color:var(--spark-source-right); }
  .source-affinity { display:inline-flex; align-items:center; gap:4px; padding:3px 6px; border:0; border-radius:5px; color:var(--source-color); background:color-mix(in srgb,var(--source-color) 8%,transparent); font-size:12px; font-weight:650; font-variant-numeric:tabular-nums; }
  .affinity-breakdown { display: grid; gap: 6px; font-size: 12px; line-height: 1.4; }.affinity-breakdown strong { color: var(--accent-pink); }
  .lineage-node { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 2px; border: 2px solid transparent; border-radius: 50%; background: transparent; color: var(--text-disabled); cursor: pointer; }
  .lineage-node:hover { color: var(--text-secondary); }.lineage-node.selected { border-color: var(--source-color); box-shadow: 0 0 0 3px color-mix(in srgb,var(--source-color) 18%,transparent); }
  .lineage-role { display:none; color: var(--text-disabled); font-size: .55rem; font-weight: 700; letter-spacing: .08em; line-height: 1; text-transform: uppercase; }
  .lineage-main .lineage-role { color: var(--accent-primary); opacity: .9; }
  .lineage-main :global(.art) { width: 80px; height: 80px; border-width: 3px; border-color: var(--border-strong); }
  .lineage-grandparent :global(.art) { width: 60px; height: 60px; border-color: var(--border-secondary); }
  .lineage-bracket { width: min(160px, 92%); height: 22px; display: block; margin: 4px 0; overflow: visible; pointer-events: none; }
  .lineage-bracket path { fill: none; stroke: #5a6470; stroke-linecap: square; stroke-width: 2; }
  .grandparents { width: 100%; display: flex; align-items: flex-start; justify-content: space-around; gap: 14px; }
  .support-card-section { display: flex; align-items: center; justify-content: center; gap: .75rem; margin-top: auto; padding: .55rem .75rem; border: 1px solid rgb(var(--on-surface-rgb) / .06); border-radius: var(--radius-md); background: rgb(var(--on-surface-rgb) / .025); }
  .support-card-section :global(.art) { width: 64px; height: 64px; border: 0; border-radius: var(--radius-xs); box-shadow: 0 2px 6px rgb(0 0 0 / .35); }
  .support-role { display:none; }
  .limit-break { display: flex; align-items: center; flex-wrap: wrap; gap: .15rem; font-size: 20px; }
  .spark-arrays { min-width: 0; display: flex; flex: 1 1 0; flex-direction: column; justify-content: flex-start; gap: 7px; }
  .spark-row { min-width: 0; display: flex; align-items: stretch; gap: 7px; }
  .spark-type-indicator { width: 3px; min-height: 24px; flex: 0 0 auto; border-radius: 2px; background: #9e9e9e; }.spark-type-indicator.blue { background: #2196f3; }.spark-type-indicator.pink { background: #e91e63; }.spark-type-indicator.green { background: #4caf50; }
  .spark-list { min-width: 0; display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
  .spark-section{min-width:0;flex:1}.white-section summary{display:flex;align-items:center;gap:.28rem;width:fit-content;cursor:pointer;font-size:.5rem;font-weight:750;line-height:1;letter-spacing:.085em;text-transform:uppercase;color:var(--text-muted);margin-bottom:.2rem;list-style:none}.white-section summary::-webkit-details-marker{display:none}.white-section summary::after{content:"";width:6px;height:6px;border-right:1.5px solid;border-bottom:1.5px solid;transform:rotate(-45deg)}.white-section[open] summary::after{transform:rotate(45deg)}.factor-source{display:inline-flex;align-items:center;gap:3px;max-width:100%;border-radius:4px}.factor-source{--spark-main-color:var(--source-color)}.hidden-factor{opacity:.4}.count-mode,.hidden-summary{width:fit-content;min-height:28px;padding:3px 7px;border:1px solid var(--factor-field-border);border-radius:4px;background:var(--factor-field-bg);color:var(--factor-field-text);font-size:10px;cursor:pointer}

  .record-footer { min-width:0; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.4rem; margin-top:.5rem; padding-top:.4rem; margin-bottom:-.25rem; border-top:1px solid rgb(var(--on-surface-rgb)/.04); }
  .borrow-stats { min-width:0; display:inline-flex; align-items:center; gap:.45rem; margin-right:auto; color:var(--text-muted); font-size:.68rem; line-height:1; }
  .borrow-stats span { display:inline-flex; align-items:center; gap:.25rem; }.borrow-stats :global(svg) { color:var(--accent-primary); }.borrow-stats .copy-stat,.copy-stat :global(svg) { color:var(--accent-warning); }
  .footer-meta { min-width:0; display:inline-flex; align-items:center; flex-wrap:wrap; gap:.35rem; color:var(--text-muted); font-size:.65rem; font-weight:500; letter-spacing:.02em; }.footer-meta time { font-variant-numeric:tabular-nums; }.verified { display:inline-flex; align-items:center; gap:.35rem; color:var(--accent-secondary); font-size:.6rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; }
  @media(max-width:768px) { .inheritance-card { padding: .875rem; border-radius: var(--radius-md); } }
  @media(max-width:480px) {
    .inheritance-card { padding: .625rem; }
    .trainer-copy strong { font-size: .78rem; }
    .trainer-copy span { font-size: .7rem; }
    .spark-modes .count-mode { font-size: 9px; padding: 3px 7px; }
    .borrow-stats { margin-right:0; }.footer-meta { font-size:.6rem; }.verified { font-size:.55rem; }
  }
  @container inheritance-card (max-width: 800px) {
    .record-actions { width: 100%; margin-left: 0; justify-content: flex-start; }.record-actions button { min-height: 36px; flex: 1; }
    .inheritance-body { flex-direction: column; gap: 10px; }.character-panel { width:100%; flex-direction:row; align-items:stretch; padding:.5rem .6rem; border:1px solid rgb(var(--on-surface-rgb)/.055); border-radius:var(--radius-md); background:rgb(var(--on-surface-rgb)/.018); }.lineage-frame { min-width: 0; flex: 1; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); position: relative; padding-top: 14px; }.lineage-frame::before { content: ''; position: absolute; top: 4px; right: calc(100% / 6); left: calc(100% / 6); height: 2px; background: #5a6470; }.lineage-person { position: relative; grid-row: 1; align-self: stretch; display: grid; grid-template-rows: 1fr auto auto; justify-items: center; }.lineage-node { align-self: start; }.lineage-role { display:block; grid-row: 3; }.lineage-person::before { content: ''; position: absolute; top: -12px; left: 50%; width: 2px; height: 12px; background: #5a6470; transform: translateX(-50%); }.lineage-main { grid-column: 1; }.grandparents { display: contents; }.lineage-grandparent:first-child { grid-column: 2; }.lineage-grandparent:last-child { grid-column: 3; }.lineage-bracket { display: none; }
    .support-card-section { width: auto; flex: 0 0 auto; flex-direction: column; gap: .35rem; margin: 0 0 0 .5rem; padding: 0 .5rem 0 .75rem; border-width: 0 0 0 1px; border-radius: 0; background: transparent; }
    .limit-break { justify-content: center; font-size: 18px; }
  }
  @container inheritance-card (max-width: 480px) {
    .record-header { gap:6px; }
    .record-stats { display:flex; flex-direction:column; align-items:stretch; gap:5px; padding:7px; }
    .summary-metrics { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(0,1fr); align-items:center; gap:6px; }
    .summary-meta { display:flex; align-items:center; justify-content:space-between; gap:8px; padding-top:4px; border-top:1px solid var(--border-subtle); }
    .record-stats :global(.trigger) { min-height:24px; min-width:24px; }
    .stat strong { font-size:14px; }.stat span { font-size:8px; white-space:nowrap; }
    .scenario-mark { padding:0; border:0; }.scenario-mark svg { width:64px; height:32px; }
    .rank-score { margin-left:auto; padding:0; gap:4px; border:0; }.rank-score :global(.rank) { width:26px; height:26px; }
    .inheritance-body { margin-top: 8px; padding-top: 8px; }.lineage-main :global(.art) { width: 58px; height: 58px; }.lineage-grandparent :global(.art) { width: 44px; height: 44px; }.spark-arrays { gap: 5px; }.spark-row { gap: 4px; }.record-footer { justify-content: center; }.footer-meta { justify-content: center; }
    .support-card-section { gap: .2rem; margin-left: .4rem; padding: 0 0 0 .45rem; }
    .limit-break { font-size: 12px; }
  }
  @media (max-width:767px) {
    .inheritance-card { padding:8px; }
    .record-toolbar { display:grid; grid-template-columns:minmax(0,1fr) auto; align-items:center; gap:4px; }
    .trainer-copy { width:fit-content; max-width:100%; min-height:30px; flex-direction:row; align-items:center; gap:6px; padding:3px 6px; }
    .trainer-copy strong { flex:0 1 auto; min-width:0; max-width:100%; font-size:11px; }
    .trainer-copy > span { flex:none; height:auto; margin:0; padding:0; font-size:9px; white-space:nowrap; }
    .trainer-copy > span :global(svg) { width:10px; height:10px; }
    .record-alert { grid-column:1/-1; justify-self:start; }
    .record-actions { grid-column:2; grid-row:1; width:auto; flex-wrap:nowrap; gap:0; margin:0; border:1px solid var(--factor-field-border); border-radius:6px; background:var(--factor-field-bg); }
    .record-toolbar .record-actions button { flex:0 0 28px; width:28px; min-width:28px; height:28px; min-height:28px; padding:0; border:0; border-radius:4px; background:transparent; }
    .record-toolbar .record-actions button:hover { background:rgb(var(--on-surface-rgb) / .08); transform:none; }
    .record-toolbar .record-actions button span { display:none; }
    .record-actions button :global(svg) { width:18px; height:18px; }
    .inheritance-body { gap:6px; margin-top:8px; padding-top:8px; }
    .character-panel { display:grid; grid-template-columns:minmax(0,1fr); padding:6px; gap:0; border:1px solid var(--border-subtle); border-radius:6px; background:rgb(var(--on-surface-rgb) / .035); }
    .character-panel:has(.support-card-section) { grid-template-columns:minmax(0,3fr) minmax(0,1fr); }
    .lineage-frame { padding-top:10px; }
    .lineage-frame::before { top:2px; height:1px; }
    .lineage-person { grid-template-rows:60px 24px auto; gap:2px; }
    .lineage-person::before { top:-8px; height:16px; width:1px; }
    .lineage-node { align-self:center; padding:1px; border-width:1px; }
    .lineage-main :global(.art) { width:40px; height:40px; border-width:2px; }
    .lineage-grandparent :global(.art) { width:40px; height:40px; }
    .lineage-person :global(.trigger) { min-width:24px; min-height:24px; }
    .source-affinity { gap:2px; padding:2px 4px; font-size:10px; }
    .source-affinity :global(svg) { width:10px; height:10px; }
    .lineage-role, .support-role { font-size:8px; font-weight:700; letter-spacing:.02em; line-height:1; text-transform:uppercase; }
    .support-role { display:block; grid-row:3; color:var(--text-disabled); }
    .support-card-section { display:grid; grid-template-rows:60px 24px auto; justify-items:center; align-items:center; margin:0; padding:10px 0 0; gap:2px; }
    .support-card-section :global(.art) { grid-row:1; width:56px; height:56px; }
    .limit-break { grid-row:2; font-size:10px; gap:1px; }
    .spark-arrays { gap:4px; }
    .spark-row { gap:4px; }
    .spark-type-indicator { min-height:20px; width:2px; }
    .spark-list { gap:3px; }
    .spark-modes { gap:4px; }
    .spark-modes .count-mode, .hidden-summary { min-height:24px; min-width:24px; padding:2px 5px; font-size:10px; }
    .white-section summary { min-height:24px; font-size:8px; margin:0; }
    .record-footer { margin-top:6px; padding-top:5px; gap:4px; }
  }
</style>

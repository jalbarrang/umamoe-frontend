<script lang="ts">
  import SourcePage from '../../ui/layout/SourcePage.svelte';
  import Artwork from '../../ui/Artwork.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  import DataTable from '../../ui/DataTable.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import HakuUploadZone from '../../ui/hakuraku/HakuUploadZone.svelte';
  import HakuReplayControls from '../../ui/hakuraku/HakuReplayControls.svelte';
  import LazyHakuRaceChart from '../../ui/hakuraku/LazyHakuRaceChart.svelte';
  import PlacementBadge from '../../ui/PlacementBadge.svelte';
  import SelectField from '../../ui/SelectField.svelte';
  import StatStrip, { type StatStripItem } from '../../ui/StatStrip.svelte';
  import { router } from '../../platform/router/router';
  import { readRaceCaptureFile, type ParsedRaceCapture } from '../../domain/race/race-capture-parser';
  import { formatRaceTime, runningStyleName } from '../../domain/race/race-display';
  import { runnerImage, runnerName } from './race-character-display';
  import { raceReplayRepository } from './race-replay-repository';

  type Section = 'overview' | 'replay' | 'compare' | 'setup';
  let section = $state<Section>('overview');
  let capture = $state<ParsedRaceCapture>();
  let runnerIndex = $state('0');
  let loading = $state(false);
  let error = $state('');
  let loadedRouteKey = $state('');
  let skillRows = $state.raw<{ frame: string; skill: string; phase: string; effect: string }[]>([]);
  let skillLoadToken = 0;
  const raceUid = $derived((router.route.params as Record<string, string | undefined>).raceUid || '');
  const tabs = [{ id: 'overview', label: 'Overview' }, { id: 'replay', label: 'Timeline' }, { id: 'compare', label: 'Compare' }, { id: 'setup', label: 'Capture' }];
  const runner = $derived(capture?.runners[Number(runnerIndex)]);
  const runnerOptions = $derived((capture?.runners ?? []).map((entry) => ({ value: String(entry.index), label: `${runnerName(entry)} · ${placement(entry.result?.finishOrder)}` })));
  const replayRunners = $derived((capture?.runners ?? []).map((entry, index) => ({
    id: String(entry.index),
    index: entry.index,
    name: runnerName(entry),
    image: runnerImage(entry),
    color: ['#65b9f3', '#f49b9b', '#ffc45d', '#d684e8', '#79cc8b', '#ff78ae', '#6cd3cd', '#c9a8ff'][index % 8]!
  })));
  const courseLabel = $derived(capture ? `${capture.courseId ? `Course ${capture.courseId}` : 'Captured course'} · ${capture.track.condition ?? 'condition unknown'}` : 'Captured race');
  const stats = $derived<StatStripItem[]>(runner ? [
    { id: 'speed', label: 'Speed', value: runner.stats.speed ?? '-', tone: 'speed', icon: '/assets/images/icon/stats/speed.webp' },
    { id: 'stamina', label: 'Stamina', value: runner.stats.stamina ?? '-', tone: 'stamina', icon: '/assets/images/icon/stats/stamina.webp' },
    { id: 'power', label: 'Power', value: runner.stats.power ?? '-', tone: 'power', icon: '/assets/images/icon/stats/power.webp' },
    { id: 'guts', label: 'Guts', value: runner.stats.guts ?? '-', tone: 'guts', icon: '/assets/images/icon/stats/guts.webp' },
    { id: 'wit', label: 'Wit', value: runner.stats.wit ?? '-', tone: 'wit', icon: '/assets/images/icon/stats/wit.webp' }
  ] : []);
  const comparisonRows = $derived((capture?.runners ?? []).slice().sort((a, b) => (a.result?.finishOrder ?? 999) - (b.result?.finishOrder ?? 999)).map((entry) => ({
    placement: placement(entry.result?.finishOrder),
    runner: runnerName(entry),
    trainer: entry.trainerName ?? '-',
    finish: formatRaceTime(entry.result?.finishTime),
    style: runningStyleName(entry.result?.runningStyle),
    skills: entry.skillIds.length
  })));
  const skillColumns = [{ key: 'frame', label: 'Time', numeric: true }, { key: 'skill', label: 'Skill', priority: 'primary' as const }, { key: 'phase', label: 'Distance' }, { key: 'effect', label: 'Effect', priority: 'secondary' as const }];
  const comparisonColumns = [{ key: 'placement', label: 'Place', priority: 'primary' as const }, { key: 'runner', label: 'Runner' }, { key: 'trainer', label: 'Trainer', priority: 'secondary' as const }, { key: 'finish', label: 'Finish', numeric: true }, { key: 'style', label: 'Style' }, { key: 'skills', label: 'Skills', numeric: true, priority: 'secondary' as const }];

  function placement(value?: number): string { return value ? `#${value}` : 'Unplaced'; }
  function aptitude(value?: number): string { return value && value >= 1 && value <= 8 ? ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'][value - 1] ?? '-' : '-'; }
  async function receive(files: FileList): Promise<void> {
    const file = files[0];
    if (!file) return;
    loading = true;
    error = '';
    try {
      capture = await readRaceCaptureFile(file);
      runnerIndex = String(capture.runners.find((entry) => entry.isPlayer)?.index ?? 0);
      section = 'overview';
    } catch (reason) {
      capture = undefined;
      error = reason instanceof Error ? reason.message : 'The race capture could not be parsed.';
    } finally {
      loading = false;
    }
  }
  async function loadLinkedCapture(): Promise<void> {
    const shareKey = raceUid ? '' : new URLSearchParams(window.location.search).get('kv') ?? '';
    const routeKey = raceUid ? `replay:${raceUid}` : shareKey ? `share:${shareKey}` : '';
    if (!routeKey || routeKey === loadedRouteKey) return;
    loadedRouteKey = routeKey; loading = true; error = '';
    try {
      capture = raceUid ? await raceReplayRepository.replay(raceUid) : await raceReplayRepository.shared(shareKey);
      runnerIndex = String(capture.runners.find((entry) => entry.isPlayer)?.index ?? 0);
      section = 'overview';
    } catch (reason) {
      capture = undefined;
      error = reason instanceof Error ? reason.message : 'The linked race could not be loaded.';
    } finally { loading = false; }
  }
  function clear(): void { capture = undefined; runnerIndex = '0'; error = ''; if (raceUid || window.location.search.includes('kv=')) { window.history.replaceState(null, '', '/race-analysis'); window.dispatchEvent(new PopStateEvent('popstate')); } }
  $effect(() => { raceUid; void loadLinkedCapture(); });
  $effect(() => {
    const current = capture; const index = runner?.index; const token = ++skillLoadToken;
    if (!current || index === undefined) { skillRows = []; return; }
    void import('./race-skill-display').then(({ activatedSkills }) => { if (token === skillLoadToken) skillRows = activatedSkills(current, index); });
  });
</script>

<svelte:head><title>Race Analysis · uma.moe</title><meta name="description" content="Analyze Uma Musume race captures, runner timelines, skill activations, speed, and stamina locally."/></svelte:head>
<SourcePage routeId="race-analysis" title="Race Analysis" width="wide" source="hakuraku">
  {#if error}<Banner title="Capture could not be loaded" tone="danger"><p>{error}</p></Banner>{/if}

  {#if !capture}
    <section class="rdp-root">
      <HakuUploadZone id="race-analysis-upload" onfiles={receive}/>
      {#if loading}<p class="loading">{loadedRouteKey ? 'Loading replay…' : 'Decoding race timeline…'}</p>{/if}
      <div class="setup-note">Visit the <a href="/connect">horseACT setup guide</a> if you don't know how to get your race data.</div>
    </section>
  {:else}
    <div class="action-bar"><Button variant="secondary" size="sm" onclick={clear}>Clear</Button></div>
    <section class="analysis-toolbar">
      <SelectField id="analysis-runner" label="Runner" options={runnerOptions} bind:value={runnerIndex}/>
      <div class="capture-summary"><span>{capture.source === 'horseact' ? 'HorseACT' : 'Game API'}</span><strong>{capture.fileName}</strong><small>{capture.frames.length.toLocaleString()} frames · {capture.runners.length} runners · {capture.events.length.toLocaleString()} events</small></div>
    </section>

    {#if runner}
        <section class="runner-heading">
          <Artwork src={runnerImage(runner)} alt={runnerName(runner)} shape="circle"/>
          <div><span>{runner.isPlayer ? 'Your runner' : 'Race runner'}</span><h2>{runnerName(runner)}</h2><p>{runner.trainerName ?? 'Trainer unavailable'} · {runningStyleName(runner.result?.runningStyle)}</p></div>
          {#if runner.result?.finishOrder}<PlacementBadge placement={runner.result.finishOrder}/>{/if}
          <strong class="finish">{formatRaceTime(runner.result?.finishTime)}</strong>
        </section>
        <StatStrip items={stats} label={`${runnerName(runner)} stats`}/>
        <section class="replay-stack"><HakuReplayControls frames={capture.frames} runners={replayRunners} selectedRunnerId={runnerIndex} distanceMax={capture.laneDistanceMax} {courseLabel}/><LazyHakuRaceChart frames={capture.frames} runnerIndex={runner.index}/></section>
        <section class="detail-grid">
          <article><header><span>APTITUDES</span><h2>Race setup</h2></header><dl><div><dt>Surface</dt><dd>{aptitude(runner.aptitudes.surface)}</dd></div><div><dt>Distance</dt><dd>{aptitude(runner.aptitudes.distance)}</dd></div><div><dt>Style</dt><dd>{aptitude(runner.aptitudes.style)}</dd></div><div><dt>Learned skills</dt><dd>{runner.skillIds.length}</dd></div></dl></article>
          <article><header><span>SKILL TIMELINE</span><h2>{skillRows.length} activations</h2></header><DataTable caption="Skill activations" columns={skillColumns} rows={skillRows} emptyMessage="No skill activation events were decoded for this runner."/></article>
        </section>
        <DataTable caption="Race placement comparison" columns={comparisonColumns} rows={comparisonRows}/>
        <section class="capture-details"><dl><div><dt>Format</dt><dd>{capture.source}</dd></div><div><dt>Course ID</dt><dd>{capture.courseId ?? 'Unknown'}</dd></div><div><dt>Distance</dt><dd>{capture.laneDistanceMax ? `${Math.round(capture.laneDistanceMax)}m` : 'Unknown'}</dd></div><div><dt>Race type</dt><dd>{capture.raceType ?? 'Unknown'}</dd></div></dl></section>
    {:else}<EmptyState icon="race" title="Runner unavailable" description="Choose another runner from this capture."/>{/if}
  {/if}
</SourcePage>

<style>
  .rdp-root{padding-top:0}.loading{color:var(--haku-text-secondary);text-align:center}.setup-note{margin-top:12px;padding:12px 16px;border:1px solid var(--haku-border-accent);border-radius:var(--haku-radius);background:rgb(102 126 234/.08);color:var(--haku-text-secondary);font-size:.9rem}.setup-note a{color:#a8e6b8}.action-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.runner-heading span,article header>span{color:#a8e6b8;font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
  .analysis-toolbar { min-width: 0; display: grid; grid-template-columns: minmax(260px, .4fr) minmax(0, 1fr); align-items: end; gap: var(--space-3); }.capture-summary { min-height: var(--control-height); min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-content: center; gap: 0 8px; padding: 5px 10px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--surface-1); }.capture-summary span { grid-row: 1 / 3; align-self: center; padding: 3px 6px; border-radius: var(--radius-sm); background: var(--color-accent-soft); color: var(--color-accent); font-size: 9px; font-weight: 800; }.capture-summary strong, .capture-summary small { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.capture-summary strong { font-size: var(--font-xs); }.capture-summary small { color: var(--color-text-subtle); font-size: 9px; }
  .runner-heading { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }.runner-heading h2, .runner-heading p { margin: 0; }.runner-heading h2 { font-size: var(--font-lg); }.runner-heading p { color: var(--color-text-muted); font-size: var(--font-xs); }.finish { color: var(--color-accent); font-variant-numeric: tabular-nums; }
  .detail-grid { min-width: 0; display: grid; grid-template-columns: minmax(250px, .4fr) minmax(0, 1fr); gap: var(--space-3); } article, .capture-details { min-width: 0; padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); } h2 { margin: 2px 0 var(--space-3); font-size: var(--font-lg); }
  .replay-stack { min-width: 0; display: grid; gap: var(--space-3); }
  dl { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; margin: 0; overflow: hidden; background: var(--border-subtle); } dl div { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 38px; padding: 8px; background: var(--surface-2); } dt { color: var(--color-text-subtle); font-size: 9px; text-transform: uppercase; } dd { margin: 0; font-size: var(--font-xs); font-weight: 800; }
  .capture-details dl { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 760px) { .analysis-toolbar, .detail-grid { grid-template-columns: 1fr; }.runner-heading { grid-template-columns: auto minmax(0, 1fr) auto; padding-inline: 5px; }.finish { grid-column: 2 / -1; }.capture-details dl { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 430px) { dl, .capture-details dl { grid-template-columns: 1fr; } }
</style>

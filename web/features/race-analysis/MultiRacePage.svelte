<script lang="ts">
  import type { EChartsCoreOption } from 'echarts/core';
  import AppPage from '../../ui/layout/AppPage.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  import DataTable from '../../ui/DataTable.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import HakuUploadZone from '../../ui/hakuraku/HakuUploadZone.svelte';
  import MetricBar from '../../ui/MetricBar.svelte';
  import StatStrip from '../../ui/StatStrip.svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import LazyEChartsSurface from '../../ui/charts/LazyEChartsSurface.svelte';
  import { hakuBarChartOption } from '../../ui/charts/haku-chart-options';
  import { readRaceCaptureFile, type ParsedRaceCapture } from '../../domain/race/race-capture-parser';
  import { analyzeMultiRace, groupMultiRaceCaptures } from '../../domain/race/multi-race-analysis';
  import { formatPercentage, runningStyleName } from '../../domain/race/race-display';
  import { skillName } from './race-skill-display';

  type AnalysisSection = 'overview' | 'hp' | 'characters' | 'skills' | 'teams';
  let captures = $state<ParsedRaceCapture[]>([]);
  let loading = $state(false);
  let error = $state('');
  let rejected = $state<string[]>([]);
  let activeGroup = $state('');
  let section = $state<AnalysisSection>('overview');

  const groups = $derived(groupMultiRaceCaptures(captures));
  const selectedGroup = $derived(groups.find((group) => group.key === activeGroup) ?? groups[0]);
  const selectedCaptures = $derived(selectedGroup?.captures ?? []);
  const analysis = $derived(analyzeMultiRace(selectedCaptures));
  const totalEntries = $derived(analysis.entries.length);
  const groupTabs = $derived(groups.map((group) => {
    const capture = group.captures[0]!;
    return { id: group.key, label: `${capture.courseId ? `Course ${capture.courseId}` : 'Unknown course'} · ${capture.track.condition ?? 'Unknown'} (${group.captures.length})` };
  }));
  const analysisTabs = [
    { id: 'overview', label: 'Overview' }, { id: 'hp', label: 'HP & Spurt' }, { id: 'characters', label: 'Characters' }, { id: 'skills', label: 'Skills' }, { id: 'teams', label: 'Teams' }
  ];

  const characterRows = $derived(analysis.characters.map((entry) => ({
    runner: entry.name, races: entry.races, wins: entry.wins, winRate: formatPercentage(entry.wins, entry.races), top3: formatPercentage(entry.top3, entry.races), finish: average(entry.finishTotal, entry.races), own: entry.playerRaces
  })));
  const strategyRows = $derived(analysis.strategies.map((entry) => ({
    strategy: runningStyleName(entry.strategy), entries: entry.races, wins: entry.wins, winRate: formatPercentage(entry.wins, entry.races), top3: formatPercentage(entry.top3, entry.races), finish: average(entry.finishTotal, entry.races), saturation: entry.saturation.map((bucket) => `${bucket.count}× ${formatPercentage(bucket.wins, bucket.races)}`).join(' · ')
  })));
  const hpRows = $derived(analysis.hp.map((entry) => ({
    runner: entry.name, races: entry.races, wins: entry.wins, winRate: formatPercentage(entry.wins, entry.races), survival: formatPercentage(entry.survived, entry.races), remaining: entry.startHpTotal ? `${(entry.finishHpTotal / entry.startHpTotal * 100).toFixed(1)}%` : '-', spurt: formatPercentage(entry.lastSpurtRaces, entry.races), start: entry.lastSpurtRaces ? `${Math.round(entry.lastSpurtDistanceTotal / entry.lastSpurtRaces).toLocaleString()}m` : '-'
  })));
  const skillRows = $derived(analysis.skills.map((entry) => ({
    skill: skillName(entry.skillId), learned: entry.learned, activations: entry.activations, procRate: formatPercentage(entry.activatedRunners, entry.learned), wins: formatPercentage(entry.wins, entry.learned), finish: average(entry.finishTotal, entry.learned), double: entry.doubleProcRaces, distance: entry.activationDistances.length ? `${Math.round(entry.activationDistances.reduce((sum, value) => sum + value, 0) / entry.activationDistances.length).toLocaleString()}m` : '-'
  })));
  const teamRows = $derived(analysis.teams.map((entry) => ({ team: entry.members.map((member) => `${member.name} (${runningStyleName(member.strategy, true)})`).join(' · '), samples: entry.appearances, wins: entry.wins, winRate: formatPercentage(entry.wins, entry.appearances), impact: entry.appearances ? (entry.wins / entry.appearances * 3).toFixed(2) : '-' })));

  const characterColumns = [{ key: 'runner', label: 'Runner', priority: 'primary' as const }, { key: 'races', label: 'Races', numeric: true }, { key: 'wins', label: 'Wins', numeric: true }, { key: 'winRate', label: 'Win rate', numeric: true }, { key: 'top3', label: 'Top 3', numeric: true }, { key: 'finish', label: 'Avg finish', numeric: true }, { key: 'own', label: 'Own entries', numeric: true, priority: 'secondary' as const }];
  const strategyColumns = [{ key: 'strategy', label: 'Strategy', priority: 'primary' as const }, { key: 'entries', label: 'Entries', numeric: true }, { key: 'wins', label: 'Wins', numeric: true }, { key: 'winRate', label: 'Win rate', numeric: true }, { key: 'top3', label: 'Top 3', numeric: true }, { key: 'finish', label: 'Avg finish', numeric: true }, { key: 'saturation', label: 'Room saturation', priority: 'secondary' as const }];
  const hpColumns = [{ key: 'runner', label: 'Your runner', priority: 'primary' as const }, { key: 'races', label: 'Races', numeric: true }, { key: 'wins', label: 'Wins', numeric: true }, { key: 'winRate', label: 'Win rate', numeric: true }, { key: 'survival', label: 'HP survived', numeric: true }, { key: 'remaining', label: 'HP remaining', numeric: true }, { key: 'spurt', label: 'Last spurt', numeric: true }, { key: 'start', label: 'Avg spurt start', numeric: true, priority: 'secondary' as const }];
  const skillColumns = [{ key: 'skill', label: 'Skill', priority: 'primary' as const }, { key: 'learned', label: 'Learned', numeric: true }, { key: 'activations', label: 'Procs', numeric: true }, { key: 'procRate', label: 'Proc rate', numeric: true }, { key: 'wins', label: 'Win rate', numeric: true }, { key: 'finish', label: 'Avg finish', numeric: true }, { key: 'double', label: 'Double procs', numeric: true }, { key: 'distance', label: 'Mean distance', numeric: true, priority: 'secondary' as const }];
  const teamColumns = [{ key: 'team', label: 'Team composition', priority: 'primary' as const }, { key: 'samples', label: 'Samples', numeric: true }, { key: 'wins', label: 'Wins', numeric: true }, { key: 'winRate', label: 'Win rate', numeric: true }, { key: 'impact', label: 'Win impact', numeric: true }];

  const strategyChart = $derived<EChartsCoreOption>(hakuBarChartOption('Win rate by running style', analysis.strategies.map((entry) => runningStyleName(entry.strategy)), analysis.strategies.map((entry) => entry.races ? entry.wins / entry.races * 100 : 0), '#64b5f6'));
  const characterChart = $derived<EChartsCoreOption>(hakuBarChartOption('Character win rate', analysis.characters.slice(0, 12).map((entry) => entry.name), analysis.characters.slice(0, 12).map((entry) => entry.races ? entry.wins / entry.races * 100 : 0), '#81c784'));
  const hpChart = $derived<EChartsCoreOption>(hakuBarChartOption('HP remaining at finish', analysis.hp.map((entry) => entry.name), analysis.hp.map((entry) => entry.startHpTotal ? entry.finishHpTotal / entry.startHpTotal * 100 : 0), '#ffb74d'));

  function average(value: number, total: number): string { return total ? (value / total).toFixed(2) : '-'; }

  async function receive(files: FileList): Promise<void> {
    loading = true; error = ''; rejected = [];
    const accepted: ParsedRaceCapture[] = [];
    for (const file of Array.from(files)) {
      try { accepted.push(await readRaceCaptureFile(file)); }
      catch (reason) { rejected = [...rejected, `${file.name}: ${reason instanceof Error ? reason.message : 'Could not parse'}`]; }
    }
    captures = [...captures, ...accepted];
    if (!accepted.length && rejected.length) error = 'None of the selected captures could be decoded.';
    loading = false;
  }
  function removeCapture(index: number): void { captures = captures.filter((_, captureIndex) => captureIndex !== index); }
  function clear(): void { captures = []; rejected = []; error = ''; activeGroup = ''; section = 'overview'; }
  $effect(() => { if (groups.length && !groups.some((group) => group.key === activeGroup)) activeGroup = groups[0]!.key; });
</script>

<svelte:head><title>Multi-Race · uma.moe</title><meta name="description" content="Compare locally decoded Uma Musume race captures across HP, spurt, character, team, strategy, and skill performance."/></svelte:head>
<AppPage routeId="multi-race" title="Multi-Race" description="Hakuraku batch analysis rebuilt on the same local decoder and moe component contracts as Race Analysis." eyebrow="Race Lab" width="wide">
  {#if captures.length}{#snippet actions()}<Button variant="danger" icon="trash" onclick={clear}>Clear {captures.length} captures</Button>{/snippet}{/if}
  {#if error}<Banner title="Captures could not be loaded" tone="danger"><p>{error}</p></Banner>{/if}
  {#if rejected.length}<Banner title={`${rejected.length} file${rejected.length === 1 ? '' : 's'} skipped`} tone="warning"><ul>{#each rejected as message}<li>{message}</li>{/each}</ul></Banner>{/if}

  <section class="upload"><div><span>BATCH ANALYSIS</span><h2>Add race captures</h2><p>Files are decoded locally and grouped by course, distance, and condition. Adding files extends this comparison without persisting raw telemetry.</p></div><HakuUploadZone id="multi-race-upload" onfiles={receive}/>{#if loading}<p class="loading">Decoding selected captures…</p>{/if}</section>

  {#if captures.length}
    <section class="race-list" aria-label="Loaded race captures"><header><div><span>LOADED CAPTURES</span><strong>{captures.length} race{captures.length === 1 ? '' : 's'}</strong></div><small>{groups.length} compatible track group{groups.length === 1 ? '' : 's'}</small></header><div>{#each captures as capture, index}<article><div><strong>{capture.fileName}</strong><small>{capture.courseId ? `Course ${capture.courseId}` : 'Unknown course'} · {capture.laneDistanceMax ? `${Math.round(capture.laneDistanceMax)}m` : 'distance unknown'} · {capture.runners.length} runners</small></div><button aria-label={`Remove ${capture.fileName}`} onclick={() => removeCapture(index)}>Remove</button></article>{/each}</div></section>
    {#if groupTabs.length > 1}<Tabs items={groupTabs} value={activeGroup} onchange={(value) => activeGroup = value} label="Track groups"/>{/if}
    <Tabs items={analysisTabs} value={section} onchange={(value) => section = value as AnalysisSection} label="Multi-race analysis sections"/>

    <StatStrip label="Multi-race summary" items={[{ id: 'races', label: 'Races', value: analysis.races }, { id: 'entries', label: 'Entries', value: totalEntries }, { id: 'runners', label: 'Characters', value: analysis.characters.length }, { id: 'skills', label: 'Skills observed', value: analysis.skills.length }]}/>

    {#if section === 'overview'}
      <section class="leaders" aria-label="Leading win rates">{#each analysis.characters.slice(0, 4) as entry}<MetricBar label={entry.name} value={entry.wins / entry.races * 100}/>{/each}</section>
      <section class="analysis-grid"><article><header><span>STRATEGY CONVERSION</span><h2>Win rate by running style</h2></header><LazyEChartsSurface option={strategyChart} label="Win rate by running style" height={280}/></article><article><header><span>STYLE & SATURATION</span><h2>Room strategy performance</h2></header><DataTable caption="Strategy performance" columns={strategyColumns} rows={strategyRows}/></article></section>
    {:else if section === 'hp'}
      {#if analysis.hp.length}<section class="analysis-grid"><article><header><span>PERSONAL SURVIVAL</span><h2>HP remaining at finish</h2></header><LazyEChartsSurface option={hpChart} label="HP remaining at finish" height={280}/></article><article><header><span>HP & LAST SPURT</span><h2>Your runners</h2></header><DataTable caption="HP and last-spurt analysis" columns={hpColumns} rows={hpRows}/></article></section>{:else}<EmptyState icon="race" title="No player runners detected" description="These captures do not identify a local player team, so personal HP and spurt analysis is unavailable." compact/>{/if}
    {:else if section === 'characters'}
      <section class="analysis-grid"><article><header><span>WIN DISTRIBUTION</span><h2>Character conversion</h2></header><LazyEChartsSurface option={characterChart} label="Character win rates" height={300}/></article><article><header><span>CHARACTER BREAKDOWN</span><h2>Placement performance</h2></header><DataTable caption="Character performance" columns={characterColumns} rows={characterRows}/></article></section>
    {:else if section === 'skills'}
      <DataTable caption="Skill activation and placement analysis" columns={skillColumns} rows={skillRows} emptyMessage="No learned skills were decoded from these captures."/>
    {:else}
      {#if teamRows.length}<DataTable caption="Repeated team composition performance" columns={teamColumns} rows={teamRows}/>{:else}<EmptyState icon="community" title="No team assignments decoded" description="Team composition analysis appears when captures include team IDs for the participating runners." compact/>{/if}
    {/if}
  {:else if !loading}<EmptyState icon="race" title="No races in this comparison" description="Choose two or more compatible captures to compare HP, skill, character, and team performance." compact/>{/if}
</AppPage>

<style>
  .upload { min-width: 0; display: grid; grid-template-columns: minmax(260px, .65fr) minmax(320px, 1fr); align-items: center; gap: var(--space-5); padding: var(--space-4); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  .upload span, .analysis-grid header span, .race-list header span { color: var(--color-accent); font-size: 9px; font-weight: 800; letter-spacing: .05em; }
  .upload h2 { margin: 4px 0; }.upload p { margin: 0; }.loading { grid-column: 1 / -1; color: var(--color-accent); text-align: center; }
  .race-list { min-width: 0; border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  .race-list > header { min-height: 48px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 7px var(--space-3); border-bottom: 1px solid var(--border-subtle); }
  .race-list > header div { display: grid; gap: 1px; }.race-list > header small { color: var(--color-text-subtle); }
  .race-list > div { max-height: 190px; overflow-y: auto; }.race-list article { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 44px; padding: 6px var(--space-3); border-bottom: 1px solid var(--border-subtle); }.race-list article:last-child { border-bottom: 0; }.race-list article div { min-width: 0; display: grid; gap: 1px; }.race-list article strong, .race-list article small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.race-list article small { color: var(--color-text-subtle); font-size: 9px; }.race-list article button { min-height: 32px; padding-inline: 10px; border: 0; background: transparent; color: var(--accent-error); cursor: pointer; font-size: 10px; }
  .leaders { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  .analysis-grid { display: grid; grid-template-columns: minmax(320px, .72fr) minmax(0, 1fr); gap: var(--space-3); }.analysis-grid article { min-width: 0; padding: var(--space-3); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }.analysis-grid h2 { margin: 2px 0 var(--space-3); font-size: var(--font-md); }
  @media (max-width: 900px) { .analysis-grid { grid-template-columns: 1fr; } }
  @media (max-width: 760px) { .upload { grid-template-columns: 1fr; padding-inline: 5px; }.leaders { grid-template-columns: 1fr 1fr; padding-inline: 5px; }.analysis-grid article, .race-list article, .race-list > header { padding-inline: 5px; } }
  @media (max-width: 430px) { .leaders { grid-template-columns: 1fr; }.race-list > header small { display: none; } }
</style>

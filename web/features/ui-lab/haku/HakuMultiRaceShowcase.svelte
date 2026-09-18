<script lang="ts">
  import HakuContract from '../../../ui/hakuraku/HakuContract.svelte';
  import HakuUploadZone from '../../../ui/hakuraku/HakuUploadZone.svelte';
  import Badge from '../../../ui/Badge.svelte';
  import Button from '../../../ui/Button.svelte';
  import DataTable from '../../../ui/DataTable.svelte';
  import DialogPanel from '../../../ui/DialogPanel.svelte';
  import EntitySelect, { type EntitySelectOption } from '../../../ui/EntitySelect.svelte';
  import MetricBar from '../../../ui/MetricBar.svelte';
  import PlacementBadge from '../../../ui/PlacementBadge.svelte';
  import SelectField from '../../../ui/SelectField.svelte';
  import StatStrip from '../../../ui/StatStrip.svelte';
  import TextField from '../../../ui/TextField.svelte';
  import mcqueen from '../fixtures/mejiro-mcqueen.webp';
  import oguri from '../fixtures/oguri-cap.webp';
  import kitasan from '../fixtures/kitasan-black.webp';
  import supportSpeed from '../fixtures/support-card-speed.webp';
  import supportStamina from '../fixtures/support-card-stamina.webp';

  let portrait = $state('mcqueen');
  let team = $state('sample-a');
  let entityType = $state('character');
  let comparison = $state('oguri');
  let skillSearch = $state('corner');
  let skillStrategy = $state('all');
  const entityTypeOptions = [{ value: 'character', label: 'Character' }, { value: 'support', label: 'Support card' }];
  const comparisonOptions = [{ value: 'oguri', label: 'Oguri Cap' }, { value: 'kitasan', label: 'Kitasan Black' }];
  const strategyOptions = [{ value: 'all', label: 'All strategies' }, { value: 'leader', label: 'Leader' }, { value: 'runner', label: 'Runner' }];
  const summaryStats = [
    { id: 'races', label: 'Races', value: 24 },
    { id: 'runners', label: 'Runners', value: 432 },
    { id: 'characters', label: 'Characters', value: 18 },
    { id: 'leader-wins', label: 'Leader wins', value: '33.3%' }
  ];
  const hpColumns = [{ key: 'style', label: 'Style' }, { key: 'survive', label: 'Survive', numeric: true }, { key: 'spurt', label: 'Full spurt', numeric: true }];
  const hpRows = [{ style: 'Leader', survive: '92%', spurt: '85%' }, { style: 'Runner', survive: '81%', spurt: '73%' }, { style: 'Chaser', survive: '76%', spurt: '68%' }];
  const skillColumns = [{ key: 'skill', label: 'Skill' }, { key: 'leader', label: 'Leader', numeric: true }, { key: 'runner', label: 'Runner', numeric: true }, { key: 'all', label: 'All', numeric: true }];
  const skillRows = [{ skill: 'Corner Adept ○', leader: '31%', runner: '22%', all: '27%' }, { skill: 'Long-Distance Corner ○', leader: '38%', runner: '-', all: '34%' }];
  const serializedColumns = [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value', numeric: true }];
  const serializedRows = [{ metric: 'Used only', value: '28.2%' }, { metric: 'Used + won', value: '9.4%' }, { metric: 'Appearance', value: 164 }];
  const procRows = [{ metric: 'One proc', value: '67.1%' }, { metric: 'Two procs', value: '24.8%' }, { metric: 'No proc', value: '8.1%' }];
  const portraitOptions: EntitySelectOption[] = [
    { value: 'mcqueen', label: 'Mejiro McQueen', subtitle: 'Leader · UE1', meta: '38.2% win', images: [mcqueen] },
    { value: 'oguri', label: 'Oguri Cap', subtitle: 'Betweener · UF9', meta: '27.4% win', images: [oguri] },
    { value: 'kitasan', label: 'Kitasan Black', subtitle: 'Runner · UF8', meta: '24.1% win', images: [kitasan] }
  ];
  const teamOptions: EntitySelectOption[] = [
    { value: 'sample-a', label: 'Sample A', subtitle: '2 Leader · 1 Runner', meta: '126 races · 42.8%', images: [mcqueen, oguri, kitasan] },
    { value: 'sample-b', label: 'Sample B', subtitle: '1 Leader · 2 Betweener', meta: '94 races · 36.1%', images: [oguri, mcqueen, kitasan] }
  ];
</script>

<section id="haku-multi-race" class="haku-group">
  <header><span>MultiRacePage source family</span><h2>Multi-Race analysis</h2><p>Every visual component under MultiRacePage is surfaced here, including its selectors, compact breakdown tables, charts, drilldowns, and mobile expansion dialog.</p></header>
  <div class="haku-contract-grid">
    <HakuContract id="haku-multi-upload" title="RaceUploadZone" source="MultiRacePage/components/RaceUploadZone.tsx"><HakuUploadZone id="haku-multi-file"/></HakuContract>
    <HakuContract id="haku-race-list" title="RaceListPanel" source="MultiRacePage/components/RaceListPanel.tsx"><div class="haku-race-list"><div class="haku-race-list-head"><strong>Loaded Races <Badge tone="accent">3</Badge></strong><Button variant="danger" size="sm">Clear</Button></div>{#each ['tokyo_2400_final.json','kyoto_3200_room7.json','nakayama_2500_cup.json'] as race}<div class="haku-race-item"><strong>{race}</strong><small>2400m · 18 horses</small><button aria-label={`Remove ${race}`}>×</button></div>{/each}</div></HakuContract>
    <div class="wide"><HakuContract id="haku-multi-stats" title="Summary statistics" source="MultiRacePage/index.tsx" origin="uma"><StatStrip items={summaryStats} compact label="Multi-race summary"/></HakuContract></div>
    <HakuContract id="haku-portrait-select" title="PortraitSelect" source="MultiRacePage/components/PortraitSelect.tsx"><EntitySelect id="haku-character-select" label="Character" options={portraitOptions} bind:value={portrait}/></HakuContract>
    <HakuContract id="haku-team-sample-select" title="TeamSampleSelect" source="WinDistributionCharts/TeamSampleSelect.tsx"><EntitySelect id="haku-team-select" label="Team sample" options={teamOptions} bind:value={team}/></HakuContract>
    <HakuContract id="haku-synergy-select" title="SynergyEntitySelect" source="WinDistributionCharts/SynergyEntitySelect.tsx" origin="uma"><div class="haku-fields"><SelectField id="haku-entity-type" label="Entity type" options={entityTypeOptions} bind:value={entityType}/><SelectField id="haku-compare-with" label="Compare with" options={comparisonOptions} bind:value={comparison}/></div></HakuContract>
    <div class="wide"><HakuContract id="haku-analysis-table" title="Analysis table" source="MultiRacePage/MultiRacePage.css"><div class="haku-table-wrap"><table class="haku-table"><thead><tr><th>Character</th><th>Strategy</th><th>Wins ↕</th><th>Win rate</th><th>Placement</th></tr></thead><tbody><tr><td><span class="haku-runner"><img class="haku-portrait" src={mcqueen} alt=""/><strong>Mejiro McQueen</strong></span></td><td>Leader</td><td>42</td><td><MetricBar value={38.2} compact/></td><td><PlacementBadge placement={1}/></td></tr><tr><td><span class="haku-runner"><img class="haku-portrait" src={oguri} alt=""/><strong>Oguri Cap</strong></span></td><td>Betweener</td><td>31</td><td><MetricBar value={27.4} compact/></td><td><PlacementBadge placement={2}/></td></tr></tbody></table></div></HakuContract></div>
    <div class="wide"><HakuContract id="haku-hp-spurt" title="HpSpurtAnalysis" source="MultiRacePage/components/HpSpurtAnalysis/index.tsx"><div class="haku-split"><section id="haku-hp-spurt-detail" class="haku-analysis-panel"><h5>HpSpurtAnalysisDetail</h5><div class="haku-runner"><img class="haku-portrait" src={mcqueen} alt=""/><span><strong>Mejiro McQueen</strong><small>Survived 92 of 108 races</small></span></div><div class="haku-stack" style="margin-top:8px"><MetricBar label="Full spurt" value={85.2}/><MetricBar label="Median HP at spurt" value={14.6} tone="warning"/></div></section><section id="haku-hp-spurt-table" class="haku-analysis-panel"><h5>HpSpurtTable</h5><DataTable caption="HP and spurt by style" columns={hpColumns} rows={hpRows}/></section></div></HakuContract></div>
    <HakuContract id="haku-hp-distribution-modal" title="HpDistributionModal" source="HpSpurtAnalysis/HpDistributionModal.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="HP distribution"><div class="haku-histogram">{#each [18,34,52,78,92,70,48,27,12] as height}<i style={`--height:${height}%`}></i>{/each}</div></DialogPanel></div></HakuContract>
    <div class="wide"><HakuContract id="haku-skill-analysis" title="SkillAnalysis" source="MultiRacePage/components/SkillAnalysis/index.tsx"><div class="haku-stack"><div class="haku-filter-toolbar"><TextField id="haku-skill-search" label="Skill search" type="search" bind:value={skillSearch}/><SelectField id="haku-skill-strategy" label="Strategy" options={strategyOptions} bind:value={skillStrategy}/><Button variant="secondary" size="sm">Minimum 10 uses</Button></div><div class="haku-split"><section id="haku-win-breakdown" class="haku-analysis-panel"><h5>WinBreakdownTable</h5><DataTable caption="Skill win breakdown" columns={skillColumns} rows={skillRows}/></section><section id="haku-serialized-breakdown" class="haku-analysis-panel"><h5>SerializedWinBreakdownTable</h5><DataTable caption="Serialized skill breakdown" columns={serializedColumns} rows={serializedRows}/></section><section id="haku-double-proc" class="haku-analysis-panel"><h5>DoubleProcTable</h5><DataTable caption="Skill proc counts" columns={serializedColumns} rows={procRows}/></section></div></div></HakuContract></div>
    <div class="wide"><HakuContract id="haku-win-distributions" title="WinDistributionCharts" source="MultiRacePage/components/WinDistributionCharts/index.tsx"><div class="haku-panel-grid"><section id="haku-character-analysis" class="haku-analysis-panel"><h5>CharacterAnalysis</h5><div class="haku-mini-bars">{#each [62,91,44,73,38,55] as h}<span style={`--height:${h}%`}></span>{/each}</div></section><section id="haku-strategy-analysis" class="haku-analysis-panel"><h5>StrategyAnalysis</h5><div class="haku-mini-bars">{#each [82,54,68,31] as h}<span style={`--height:${h}%`}></span>{/each}</div></section><section id="haku-bubble-plot" class="haku-analysis-panel"><h5>BubblePlotPanel</h5><div class="haku-bubble-plot"><i class="haku-bubble" style="--x:14%;--y:22%;--size:24px"></i><i class="haku-bubble" style="--x:51%;--y:58%;--size:34px"></i><i class="haku-bubble" style="--x:78%;--y:36%;--size:19px"></i></div></section><section id="haku-character-breakdown" class="haku-analysis-panel"><h5>CharacterBreakdownPanel</h5><div class="haku-stack"><span>Mejiro McQueen <b style="float:right">38%</b></span><span class="haku-bar"><span style="--value:68%"></span></span><span>Oguri Cap <b style="float:right">27%</b></span><span class="haku-bar"><span style="--value:49%"></span></span></div></section><section id="haku-saturation" class="haku-analysis-panel"><h5>SaturationPanel</h5><p class="haku-muted">Popularity rises faster than win conversion.</p><div class="haku-heatmap"></div></section><section id="haku-style-breakdown" class="haku-analysis-panel"><h5>StyleBreakdownPanel</h5><div class="haku-row"><Badge tone="success">Leader 38%</Badge><Badge>Runner 25%</Badge><Badge tone="accent">Chaser 21%</Badge></div></section><section id="haku-style-reps" class="haku-analysis-panel"><h5>StyleRepsPanel</h5><div class="haku-row"><span class="haku-runner"><img class="haku-portrait" src={mcqueen} alt=""/><strong>McQueen</strong></span><span class="haku-runner"><img class="haku-portrait" src={kitasan} alt=""/><strong>Kitasan</strong></span></div></section><section id="haku-style-team-composition" class="haku-analysis-panel"><h5>StyleTeamCompositionPanel</h5><div class="haku-team-faces"><img src={mcqueen} alt=""/><img src={oguri} alt=""/><img src={kitasan} alt=""/></div><p class="haku-muted">2 Leader + 1 Runner · 126 samples</p></section><section id="haku-support-card-panel" class="haku-analysis-panel"><h5>SupportCardPanel</h5><div class="haku-row"><img src={supportSpeed} alt="Speed support" style="width:44px;height:58px;object-fit:cover"/><img src={supportStamina} alt="Stamina support" style="width:44px;height:58px;object-fit:cover"/><span><b>82% usage</b><br/><small class="haku-muted">+4.8pp win delta</small></span></div></section><section id="haku-team-member-card" class="haku-analysis-panel"><h5>TeamMemberCard</h5><div class="haku-member-card winner"><img class="haku-portrait" src={mcqueen} alt=""/><span><strong>Mejiro McQueen</strong><small class="haku-muted">Leader · Winner</small></span></div></section><section id="haku-composition-section" class="haku-analysis-panel"><h5>CompositionSection</h5><div class="haku-row"><Badge>2 Leader</Badge><Badge>1 Runner</Badge><span class="haku-muted">126 teams</span></div></section><section id="haku-representative-drilldown" class="haku-analysis-panel"><h5>RepresentativeDrilldown</h5><p class="haku-muted">Sample #48 · Tokyo 2400m · Room A</p><Button variant="secondary" size="sm">Inspect race</Button></section></div></HakuContract></div>
    <HakuContract id="haku-info-tooltip" title="InfoTooltip" source="WinDistributionCharts/InfoTooltip.tsx"><div class="haku-row"><Button variant="ghost" size="sm" ariaLabel="About saturation">?</Button><div class="haku-tooltip-box"><strong>Saturation</strong><span class="haku-muted">Compares appearance share with actual win share.</span></div></div></HakuContract>
    <HakuContract id="haku-mobile-panel-dialog" title="MobilePanelExpandDialog" source="WinDistributionCharts/MobilePanelExpandDialog.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="Character breakdown" description="Dense panels expand into a scrollable mobile dialog."><div class="haku-heatmap"></div></DialogPanel></div></HakuContract>
  </div>
</section>

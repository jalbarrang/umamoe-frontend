<script lang="ts">
  import HakuContract from '../../../ui/hakuraku/HakuContract.svelte';
  import Button from '../../../ui/Button.svelte';
  import Checkbox from '../../../ui/Checkbox.svelte';
  import DialogPanel from '../../../ui/DialogPanel.svelte';
  import FilterChip from '../../../ui/FilterChip.svelte';
  import RaceSchedule from '../../../ui/RaceSchedule.svelte';
  import SelectField from '../../../ui/SelectField.svelte';
  import StatStrip from '../../../ui/StatStrip.svelte';
  import TextField from '../../../ui/TextField.svelte';
  import VeteranSummary from '../../../ui/VeteranSummary.svelte';
  import type { VeteranUiRecord } from '../../../ui/veteran-ui-types';
  import type { RaceScheduleYear } from '../../../ui/race-types';
  import mcqueen from '../fixtures/mejiro-mcqueen.webp';
  import oguri from '../fixtures/oguri-cap.webp';
  import kitasan from '../fixtures/kitasan-black.webp';
  import raceImageG1 from '../../../../src/assets/images/race-thumbnails/thum_race_rt_000_1001_00.webp';
  import raceImageG2 from '../../../../src/assets/images/race-thumbnails/thum_race_rt_000_2001_00.webp';
  import raceImageG3 from '../../../../src/assets/images/race-thumbnails/thum_race_rt_000_3001_00.webp';

  let veteranSearch = $state('McQueen');
  let veteranSort = $state('affinity');
  let inlineFilter = $state('long-a');
  let optimizerCharacter = $state('mcqueen');
  let optimizerDistance = $state('long');
  let optimizeSpeed = $state(true);
  let optimizeLong = $state(true);
  let optimizeRaces = $state(false);
  const sortOptions = [{ value: 'affinity', label: 'Total affinity' }, { value: 'rank', label: 'Rank' }, { value: 'date', label: 'Date trained' }];
  const filterOptions = [{ value: 'long-a', label: 'Long aptitude ≥ A' }, { value: 'long-s', label: 'Long aptitude ≥ S' }, { value: 'long-3', label: 'Long factor 3★' }];
  const characterOptions = [{ value: 'mcqueen', label: 'Mejiro McQueen' }, { value: 'oguri', label: 'Oguri Cap' }];
  const distanceOptions = [{ value: 'long', label: 'Long' }, { value: 'medium', label: 'Medium' }];
  const optimizerStats = [{ id: 'affinity', label: 'Affinity', value: 126 }, { id: 'blue', label: 'Blue', value: '9★' }, { id: 'long', label: 'Long', value: '6★' }, { id: 'shared', label: 'Shared races', value: 14 }];
  const affinityStats = [{ id: 'character', label: 'Character', value: 83 }, { id: 'race', label: 'Race', value: 18 }, { id: 'grandparent', label: 'Grandparent', value: 24 }, { id: 'total', label: 'Total', value: 125 }];
  const veteranRecord: VeteranUiRecord = {
    id: 'mcqueen-ue1', name: 'Mejiro McQueen', image: mcqueen, rank: 'UE1', score: 29412, scenario: 'Grand Masters', detail: 'Long · Leader', workspace: 'Local', updated: '4 min ago', affinity: 83, raceAffinity: 18,
    stats: [
      { id: 'speed', label: 'Speed', value: 1542, tone: 'speed' }, { id: 'stamina', label: 'Stamina', value: 1312, tone: 'stamina' }, { id: 'power', label: 'Power', value: 1184, tone: 'power' }, { id: 'guts', label: 'Guts', value: 702, tone: 'guts' }, { id: 'wit', label: 'Wit', value: 1138, tone: 'wit' }
    ],
    sparks: [
      { tone: 'blue', items: [{ id: 'speed', name: 'Speed', level: 3, chance: '10%' }, { id: 'stamina', name: 'Stamina', level: 2, chance: '5%' }] },
      { tone: 'pink', items: [{ id: 'long', name: 'Long', level: 3, chance: '10%' }] },
      { tone: 'green', items: [{ id: 'unique', name: 'The View from the Lead Is Mine!', level: 2 }] },
      { tone: 'white', items: [{ id: 'maestro', name: 'Swinging Maestro', level: 2, chance: '5%' }] }
    ],
    parents: [
      { id: 'oguri', position: 'P1', name: 'Oguri Cap', image: oguri, affinity: 42, sparks: [{ tone: 'blue', items: [{ id: 'p1-speed', name: 'Speed', level: 3, chance: '10%' }] }] },
      { id: 'kitasan', position: 'P2', name: 'Kitasan Black', image: kitasan, affinity: 38, sparks: [{ tone: 'pink', items: [{ id: 'p2-long', name: 'Long', level: 3, chance: '10%' }] }] }
    ]
  };

  const raceYears: RaceScheduleYear[] = [
    { id: 'junior', label: 'Junior Year', slots: [
      { id: 'junior-dec-late', label: 'Late Dec', races: [{ id: 'hopeful', name: 'Hopeful Stakes', shortName: 'Hopeful S.', grade: 'G1', image: raceImageG1, placement: 1, selected: true }] },
      { id: 'junior-nov-late', label: 'Late Nov', races: [{ id: 'kyoto-junior', name: 'Kyoto Junior Stakes', shortName: 'Kyoto Junior', grade: 'G3', image: raceImageG3, placement: 2 }] }
    ] },
    { id: 'classic', label: 'Classic Year', slots: [
      { id: 'classic-apr-early', label: 'Early Apr', races: [{ id: 'satsuki', name: 'Satsuki Sho', shortName: 'Satsuki Sho', grade: 'G1', image: raceImageG1, affinityGain: 3 }] },
      { id: 'classic-sep-late', label: 'Late Sep', races: [{ id: 'kobe', name: 'Kobe Shimbun Hai', shortName: 'Kobe Shimbun', grade: 'G2', image: raceImageG2, affinityGain: 2 }] }
    ] },
    { id: 'senior', label: 'Senior Year', slots: [
      { id: 'senior-apr-late', label: 'Late Apr', races: [{ id: 'tenno-spring', name: 'Tenno Sho Spring', shortName: 'Tenno Sho', grade: 'G1', image: raceImageG1, placement: 1 }] },
      { id: 'senior-dec-late', label: 'Late Dec', races: [{ id: 'arima', name: 'Arima Kinen', shortName: 'Arima Kinen', grade: 'G1', image: raceImageG1, selected: true }] }
    ] }
  ];
</script>

<section id="haku-veterans" class="haku-group">
  <header><span>VeteransPage source family</span><h2>Veterans</h2><p>Hakuraku’s filtering, cards, factor groups, optimizer, affinity tree, race plan, and spark probability views.</p></header>
  <div class="haku-contract-grid">
    <div class="wide"><HakuContract id="haku-veterans-page" title="VeteransPage" source="pages/VeteransPage.tsx"><div class="haku-page-header"><div><h4>Veterans</h4><p>Import, filter, and optimize trained characters.</p></div><div class="haku-action-bar"><Button variant="secondary">Import JSON</Button><Button variant="secondary">Share filters</Button><Button>Optimizer</Button></div></div></HakuContract></div>
    <HakuContract id="haku-filter-toolbar" title="FilterToolbar" source="VeteransPage/FilterToolbar.tsx" origin="uma"><div class="haku-filter-toolbar"><TextField id="haku-veteran-search" label="Search Veterans" type="search" bind:value={veteranSearch}/><Button variant="secondary" size="sm">Blue factors</Button><Button variant="secondary" size="sm">Aptitudes</Button><Button variant="secondary" size="sm">Skills</Button><Button variant="secondary" size="sm">Races</Button></div></HakuContract>
    <HakuContract id="haku-active-filters" title="ActiveFiltersList" source="VeteransPage/ActiveFiltersList.tsx" origin="uma"><div class="haku-stack"><div class="haku-row"><strong>Active filters</strong><Button variant="danger" size="sm">Clear all</Button></div><div class="haku-filter-chips"><FilterChip label="Speed 3★" selected removable/><FilterChip label="Long ≥ A" selected removable/><FilterChip label="Unique skill" selected removable/><FilterChip label="Swinging Maestro" selected removable/></div></div></HakuContract>
    <HakuContract id="haku-veterans-sorter" title="VeteransSorter" source="VeteransPage/VeteransSorter.tsx" origin="uma"><div class="haku-row"><div style="flex:1"><SelectField id="haku-veteran-sort" label="Sort by" options={sortOptions} bind:value={veteranSort}/></div><Button variant="secondary" ariaLabel="Descending">Descending</Button></div></HakuContract>
    <HakuContract id="haku-inline-filter" title="InlineFilterSelector" source="VeteransPage/InlineFilterSelector.tsx" origin="uma"><SelectField id="haku-inline-filter-select" label="Add a filter" options={filterOptions} bind:value={inlineFilter}/></HakuContract>
    <div class="wide"><HakuContract id="haku-veteran-card" title="VeteranCard" source="VeteransPage/VeteranCard.tsx" origin="uma" note="Canonical moe VeteranSummary"><VeteranSummary veteran={veteranRecord}/></HakuContract></div>
    <div class="wide"><HakuContract id="haku-optimizer" title="OptimizerPanel" source="VeteransPage/OptimizerPanel.tsx" origin="uma"><div class="haku-split"><section class="haku-analysis-panel"><h5>Optimization target</h5><div class="haku-fields"><SelectField id="haku-optimizer-character" label="Character" options={characterOptions} bind:value={optimizerCharacter}/><SelectField id="haku-optimizer-distance" label="Distance" options={distanceOptions} bind:value={optimizerDistance}/></div><div class="haku-stack" style="margin-top:8px"><Checkbox id="haku-optimize-speed" label="Speed factors" bind:checked={optimizeSpeed}/><Checkbox id="haku-optimize-long" label="Long aptitude" bind:checked={optimizeLong}/><Checkbox id="haku-optimize-races" label="Race affinity" bind:checked={optimizeRaces}/><Button>Find parent pairs</Button></div></section><section class="haku-analysis-panel"><h5>Best pair</h5><div class="haku-row"><span class="haku-runner"><img class="haku-portrait" src={oguri} alt=""/><strong>Oguri Cap</strong></span><b>+</b><span class="haku-runner"><img class="haku-portrait" src={kitasan} alt=""/><strong>Kitasan Black</strong></span></div><div style="margin-top:8px"><StatStrip items={optimizerStats} compact label="Optimizer result"/></div></section></div></HakuContract></div>
    <div class="wide"><HakuContract id="haku-affinity-calculator" title="AffinityCalculatorPanel" source="VeteransPage/AffinityCalculatorPanel.tsx"><div class="haku-stack"><div class="haku-aff-tree"><button class="haku-aff-slot active"><img src={mcqueen} alt=""/><b>Main</b><small class="haku-muted">Mejiro McQueen</small></button><button class="haku-aff-slot"><img src={oguri} alt=""/><b>Parent 1</b><small class="haku-muted">Oguri Cap · 42</small></button><button class="haku-aff-slot"><img src={kitasan} alt=""/><b>Parent 2</b><small class="haku-muted">Kitasan Black · 38</small></button></div><StatStrip items={affinityStats} compact label="Affinity calculation"/></div></HakuContract></div>
    <div class="wide"><HakuContract id="haku-race-planner" title="Race schedule" source="web/ui/RaceSchedule.svelte" origin="uma" note="Canonical uma.moe race planner"><RaceSchedule years={raceYears}/></HakuContract></div>
    <HakuContract id="haku-spark-proc" title="SparkProcModal" source="VeteransPage/SparkProcModal.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="Spark proc chances"><div class="haku-row"><Button size="sm">Base</Button><Button variant="secondary" size="sm">Boosted</Button></div><div class="haku-spark-grid" style="margin-top:8px"><article class="haku-spark-card"><span>3★ Speed</span><strong>18.4%</strong><small class="haku-muted">Parent 1</small></article><article class="haku-spark-card"><span>3★ Long</span><strong>14.2%</strong><small class="haku-muted">Parent 2</small></article><article class="haku-spark-card"><span>Unique skill</span><strong>9.8%</strong><small class="haku-muted">Either parent</small></article></div></DialogPanel></div></HakuContract>
  </div>
</section>

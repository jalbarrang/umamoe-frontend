<script lang="ts">
  import HakuRaceChart from '../../ui/hakuraku/HakuRaceChart.svelte';
  import HakuReplayControls from '../../ui/hakuraku/HakuReplayControls.svelte';
  import HakuRunnerTable from '../../ui/hakuraku/HakuRunnerTable.svelte';
  import HakuUploadZone from '../../ui/hakuraku/HakuUploadZone.svelte';
  import HakuCourseMap from '../../ui/hakuraku/HakuCourseMap.svelte';
  import DemoBlock from './DemoBlock.svelte';
  import LabSection from './LabSection.svelte';
  import mejiroMcQueenImage from './fixtures/mejiro-mcqueen.webp';
  import oguriCapImage from './fixtures/oguri-cap.webp';
  import kitasanBlackImage from './fixtures/kitasan-black.webp';

  const runners = [
    { id: 'mcqueen', gate: 1, name: 'Mejiro McQueen', image: mejiroMcQueenImage, strategy: 'Leader', speed: 1542, hp: 68, position: 1, delta: '+0.4', color: '#7d91ff' },
    { id: 'oguri', gate: 6, name: 'Oguri Cap', image: oguriCapImage, strategy: 'Betweener', speed: 1508, hp: 74, position: 2, delta: '+0.8', color: '#ff8fab' },
    { id: 'kitasan', gate: 3, name: 'Kitasan Black', image: kitasanBlackImage, strategy: 'Runner', speed: 1496, hp: 61, position: 3, delta: '+1.2', color: '#65d283' }
  ];
  let uploadMessage = $state('No capture loaded');
</script>

<div class="haku-lab" data-hakuraku-library>
  <LabSection id="haku-foundation" title="Hakuraku foundation" description="Reusable Hakuraku controls are ported into Svelte and scoped to the uma.moe UI system—no React or Bootstrap runtime crosses the boundary.">
    <DemoBlock id="haku-tokens" title="Scoped visual roles" note="Ported from Hakuraku dark-mode tokens">
      <div class="token-row"><span class="bg0">Canvas</span><span class="bg1">Panel</span><span class="bg2">Raised</span><span class="accent">Analysis</span><span class="brand">Live / valid</span></div>
    </DemoBlock>
    <DemoBlock id="haku-upload" title="Race capture upload" note={uploadMessage}><HakuUploadZone onfiles={(files) => uploadMessage = `${files.length} capture${files.length === 1 ? '' : 's'} ready`}/></DemoBlock>
  </LabSection>

  <LabSection id="haku-race-data" title="Race data" description="Runner identity and course position stay dense on desktop, then collapse into readable mobile result rows.">
    <DemoBlock id="haku-runner-table" title="Runner data table" note="Identity · strategy · speed · HP · position"><HakuRunnerTable {runners}/></DemoBlock>
    <DemoBlock id="haku-course-map" title="Course minimap" note="Lightweight semantic SVG"><HakuCourseMap progress={72}/></DemoBlock>
  </LabSection>

  <LabSection id="haku-replay" title="Race replay" description="Playback and visibility controls remain local UI state so the future worker or client stream can supply frames independently.">
    <DemoBlock id="haku-replay-controls" title="Replay controller" note="Visibility · timeline · speed · reset"><HakuReplayControls {runners}/></DemoBlock>
    <DemoBlock id="haku-phase-state" title="Race phase vocabulary"><div class="phase-row"><span>Start</span><span>Position keep</span><span>Final corner</span><span class="active">Last spurt</span><span>Finish</span></div></DemoBlock>
  </LabSection>

  <LabSection id="haku-analysis" title="Analysis and charts" description="Hakuraku’s modular ECharts 6 approach becomes a renderer boundary that feature code can consume without importing the chart library itself.">
    <DemoBlock id="haku-race-chart" title="Speed and stamina graph" note="ECharts 6 · modular imports · SVG renderer"><HakuRaceChart/></DemoBlock>
    <DemoBlock id="haku-chart-port" title="Chart renderer contract" note="Feature → typed model → ECharts surface">
      <div class="chart-contract"><code>ChartRenderModel</code><span>label + description + option</span><b>ECHARTS / SVG</b></div>
    </DemoBlock>
  </LabSection>
</div>

<style>
  .haku-lab { --haku-bg-0: #1a1d21; --haku-bg-1: #212529; --haku-bg-2: #2a2f36; --haku-bg-3: #343a40; --haku-border: rgb(117 127 142 / .28); --haku-border-strong: rgb(117 127 142 / .48); --haku-muted: #9aa3ae; --haku-accent: #667eea; --haku-green: #65d283; --haku-green-soft: #a8e6b8; --haku-radius-sm: 6px; --haku-radius-md: 8px; --haku-radius-lg: 12px; min-width: 0; display: grid; gap: var(--space-10); container: haku-lab / inline-size; }
  .token-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 6px; }
  .token-row span { min-height: 54px; display: flex; align-items: end; padding: 9px; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-md); color: white; font-size: 10px; font-weight: 700; }
  .bg0 { background: var(--haku-bg-0); } .bg1 { background: var(--haku-bg-1); } .bg2 { background: var(--haku-bg-2); } .accent { background: var(--haku-accent); } .brand { background: #397c4c; }
  .phase-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 3px; padding: 3px; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-md); background: var(--haku-bg-0); }
  .phase-row span { min-height: 32px; display: grid; place-items: center; padding: 4px; border-radius: 5px; color: var(--haku-muted); font-size: 9px; text-align: center; }
  .phase-row .active { background: rgb(101 210 131 / .15); color: var(--haku-green-soft); }
  .chart-contract { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 12px; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-md); background: var(--haku-bg-1); }
  .chart-contract code { color: #b4c0ff; } .chart-contract span { color: var(--haku-muted); font-size: 10px; } .chart-contract b { color: var(--haku-green-soft); font: 800 9px/1 var(--font-mono); }
  @container haku-lab (max-width: 520px) { .phase-row { grid-template-columns: 1fr; } .phase-row span { min-height: 27px; justify-items: start; padding-inline: 9px; } .chart-contract { grid-template-columns: 1fr; } }
</style>

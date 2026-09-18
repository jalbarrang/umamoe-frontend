<script lang="ts">
  import HakuContract from '@/components/hakuraku/HakuContract.svelte';
  import LazyHakuRaceChart from '@/components/hakuraku/LazyHakuRaceChart.svelte';
  import AptitudeGrid, { type AptitudeItem } from '@/components/AptitudeGrid.svelte';
  import Artwork from '@/components/Artwork.svelte';
  import Badge from '@/components/Badge.svelte';
  import Button from '@/components/Button.svelte';
  import DataTable from '@/components/DataTable.svelte';
  import DialogPanel from '@/components/DialogPanel.svelte';
  import PlacementBadge from '@/components/PlacementBadge.svelte';
  import RankBadge from '@/components/RankBadge.svelte';
  import SkillChip from '@/components/SkillChip.svelte';
  import SparkItem from '@/components/SparkItem.svelte';
  import StatStrip from '@/components/StatStrip.svelte';
  import mcqueen from '@/pages/ui/fixtures/mejiro-mcqueen.webp';
  import oguri from '@/pages/ui/fixtures/oguri-cap.webp';
  import kitasan from '@/pages/ui/fixtures/kitasan-black.webp';
  import skillSpeed from '@/pages/ui/fixtures/skill-speed.webp';
  import skillRecovery from '@/pages/ui/fixtures/skill-recovery.webp';
  import supportSpeed from '@/pages/ui/fixtures/support-card-speed.webp';
  import supportStamina from '@/pages/ui/fixtures/support-card-stamina.webp';
  import supportPower from '@/pages/ui/fixtures/support-card-power.webp';

  const dashboardStats = [
    { id: 'speed', label: 'Speed', value: 1542, tone: 'speed' as const },
    { id: 'stamina', label: 'Stamina', value: 1312, tone: 'stamina' as const },
    { id: 'power', label: 'Power', value: 1184, tone: 'power' as const },
    { id: 'guts', label: 'Guts', value: 702, tone: 'guts' as const },
    { id: 'wit', label: 'Wit', value: 1138, tone: 'wit' as const }
  ];
  const presenterStats = [
    { id: 'runners', label: 'Runners', value: 18 },
    { id: 'winning-time', label: 'Winning time', value: '1:58.4' },
    { id: 'skill-procs', label: 'Skill procs', value: 12 },
    { id: 'frames', label: 'Frames/sec', value: 42 }
  ];
  const breakdownColumns = [{ key: 'skill', label: 'Skill' }, { key: 'frame', label: 'Frame', numeric: true }, { key: 'phase', label: 'Phase' }, { key: 'effect', label: 'Effect' }];
  const breakdownRows = [{ skill: 'Swinging Maestro', frame: '5,841', phase: 'Corner', effect: 'HP +5.5%' }, { skill: 'Unique skill', frame: '8,920', phase: 'Last spurt', effect: 'Speed +0.35' }];

  const dashboardAptitudes: AptitudeItem[] = [
    { id: 'turf', label: 'Turf', grade: 'A', group: 'Surface' },
    { id: 'dirt', label: 'Dirt', grade: 'G', group: 'Surface' },
    { id: 'medium', label: 'Medium', grade: 'A', group: 'Distance' },
    { id: 'long', label: 'Long', grade: 'S', group: 'Distance' },
    { id: 'leader', label: 'Leader', grade: 'A', group: 'Style' },
    { id: 'runner', label: 'Runner', grade: 'B', group: 'Style' }
  ];

  const properAptitudes: AptitudeItem[] = [
    { id: 'proper-turf', label: 'Turf', grade: 'A', group: 'Surface' },
    { id: 'proper-dirt', label: 'Dirt', grade: 'G', group: 'Surface' },
    { id: 'proper-sprint', label: 'Sprint', grade: 'F', group: 'Distance' },
    { id: 'proper-mile', label: 'Mile', grade: 'C', group: 'Distance' },
    { id: 'proper-medium', label: 'Medium', grade: 'A', group: 'Distance' },
    { id: 'proper-long', label: 'Long', grade: 'S', group: 'Distance' },
    { id: 'proper-front', label: 'Front', grade: 'D', group: 'Style' },
    { id: 'proper-leader', label: 'Leader', grade: 'A', group: 'Style' },
    { id: 'proper-betweener', label: 'Betweener', grade: 'C', group: 'Style' },
    { id: 'proper-chaser', label: 'Chaser', grade: 'G', group: 'Style' }
  ];
</script>

<section id="haku-race-presenter" class="haku-group">
  <header><span>RaceDataPresenter source family</span><h2>Race data presenter</h2><p>The compact sortable runner table expands into transparent skill, aptitude, support, and inheritance panels.</p></header>
  <div class="haku-contract-grid">
    <div class="wide"><HakuContract id="haku-race-presenter-shell" title="RaceDataPresenter" source="components/RaceDataPresenter/index.tsx">
      <div class="haku-stack"><div class="haku-page-header"><div><h4>Tokyo Turf 2400m</h4><p>18 runners · Firm · Left-handed</p></div><div class="haku-action-bar"><Button variant="secondary">Export JSON</Button><Button>Open replay</Button></div></div><StatStrip items={presenterStats} compact label="Race summary"/></div>
    </HakuContract></div>
    <div class="wide"><HakuContract id="haku-chara-list" title="CharaList" source="components/RaceDataPresenter/components/CharaList/index.tsx">
      <div class="haku-table-wrap"><table class="haku-table"><thead><tr><th>Rank</th><th>Character</th><th>Strategy</th><th class="num">Speed</th><th class="num">Stamina</th><th class="num">Finish</th></tr></thead><tbody><tr><td><span class="haku-rank gold">1</span></td><td><span class="haku-runner"><img class="haku-portrait" src={mcqueen} alt=""/><span><strong>Mejiro McQueen</strong><small>UE1 · Viewer</small></span></span></td><td>Leader</td><td class="num">1542</td><td class="num">1312</td><td class="num">1:58.4</td></tr><tr><td><span class="haku-rank">2</span></td><td><span class="haku-runner"><img class="haku-portrait" src={oguri} alt=""/><span><strong>Oguri Cap</strong><small>UF9 · Viewer</small></span></span></td><td>Betweener</td><td class="num">1508</td><td class="num">1280</td><td class="num">+0.4</td></tr><tr><td><span class="haku-rank">3</span></td><td><span class="haku-runner"><img class="haku-portrait" src={kitasan} alt=""/><span><strong>Kitasan Black</strong><small>UF8 · Viewer</small></span></span></td><td>Runner</td><td class="num">1496</td><td class="num">1244</td><td class="num">+0.8</td></tr></tbody></table></div>
    </HakuContract></div>
    <div class="wide"><HakuContract id="haku-chara-card" title="CharaCard expanded dashboard" source="components/RaceDataPresenter/components/CharaList/CharaCard.tsx">
      <article class="haku-character-result">
        <header class="haku-character-summary">
          <Artwork src={mcqueen} alt="Mejiro McQueen" shape="portrait" size="md" loading="eager"/>
          <div class="haku-character-copy"><div class="haku-character-title"><h4>Mejiro McQueen</h4><RankBadge label="UE1" size="sm"/></div><p>Leader · Tokyo Turf 2400m · Firm</p><span>Viewer capture · 18 runners</span></div>
          <div class="haku-finish-summary"><PlacementBadge placement={1}/><strong>1:58.4</strong><span>Finish time</span></div>
        </header>
        <div class="haku-dashboard-stats"><StatStrip items={dashboardStats} compact label="Mejiro McQueen stats"/></div>
        <div class="haku-chara-dashboard">
          <section class="haku-dashboard-panel">
            <h5>Skill outcome <span>3 learned</span></h5>
            <div class="haku-moe-skill-list">
              <div class="haku-moe-skill"><SkillChip name="Swinging Maestro" icon={skillSpeed} level="Lv.1" rarity="gold" variant="row"/><Badge tone="success">Activated</Badge></div>
              <div class="haku-moe-skill"><SkillChip name="Long-Distance Corner ○" icon={skillRecovery} level="Lv.3" rarity="special" variant="row"/><Badge>Late</Badge></div>
              <div class="haku-moe-skill"><SkillChip name="The View from the Lead Is Mine!" icon={skillSpeed} level="Lv.2" rarity="unique-main" variant="row"/><Badge tone="accent">Unique</Badge></div>
            </div>
          </section>
          <section class="haku-dashboard-panel"><h5>Course aptitudes <span>Tokyo 2400m</span></h5><AptitudeGrid items={dashboardAptitudes} compact stretch/></section>
          <section class="haku-dashboard-panel">
            <h5>Inheritance <span>3 factors</span></h5>
            <div class="haku-row"><SparkItem name="Speed" level={3} tone="blue" compact/><SparkItem name="Long" level={2} tone="pink" compact/><SparkItem name="Swinging Maestro" level={2} compact/></div>
            <div class="haku-deck-heading"><span>Support deck</span><small>3 of 6 shown</small></div>
            <div class="haku-support-deck"><img src={supportSpeed} alt="Speed support"/><img src={supportStamina} alt="Stamina support"/><img src={supportPower} alt="Power support"/></div>
          </section>
        </div>
      </article>
    </HakuContract></div>
    <HakuContract id="haku-proper-labels" title="CharaProperLabels" source="components/CharaProperLabels.tsx"><AptitudeGrid items={properAptitudes} compact stretch layout="columns"/></HakuContract>
    <HakuContract id="haku-skill-breakdown" title="SkillBreakdownModal" source="components/.../SkillBreakdownModal.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="Skill breakdown - Mejiro McQueen"><DataTable caption="Skill breakdown" columns={breakdownColumns} rows={breakdownRows}/></DialogPanel></div></HakuContract>
    <div class="wide"><HakuContract id="haku-race-graph" title="RaceGraph" source="components/RaceDataPresenter/components/RaceGraph.tsx" note="Intersection-loaded modular ECharts SVG port"><LazyHakuRaceChart/></HakuContract></div>
  </div>
</section>

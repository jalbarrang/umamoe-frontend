<script lang="ts">
  import HakuContract from '../../../ui/hakuraku/HakuContract.svelte';
  import Badge from '../../../ui/Badge.svelte';
  import Button from '../../../ui/Button.svelte';
  import DataTable from '../../../ui/DataTable.svelte';
  import DialogPanel from '../../../ui/DialogPanel.svelte';
  import MetricBar from '../../../ui/MetricBar.svelte';
  import QueryEditor from '../../../ui/QueryEditor.svelte';
  import SelectField from '../../../ui/SelectField.svelte';
  import Tabs from '../../../ui/Tabs.svelte';
  import TextField from '../../../ui/TextField.svelte';
  import mcqueen from '../fixtures/mejiro-mcqueen.webp';
  import oguri from '../fixtures/oguri-cap.webp';
  import kitasan from '../fixtures/kitasan-black.webp';
  import supportSpeed from '../fixtures/support-card-speed.webp';
  let meeting = $state('tokyo-long');
  let section = $state('overview');
  let character = $state('mcqueen');
  let support = $state('all');
  let strategy = $state('leader');
  let appearances = $state('50');
  let replayRace = $state('tokyo-2400');
  let replayWinner = $state('any');
  let replaySort = $state('newest');
  let query = $state('SELECT character, win_rate, appearances\nWHERE distance = "long"\nAND strategy = "leader"\nORDER BY win_rate DESC');
  let skillStrategy = $state('leader');
  const meetingOptions = [{ value: 'tokyo-long', label: 'Long - Tokyo 2400m' }];
  const sections = [{ id: 'overview', label: 'Overview' }, { id: 'explorer', label: 'Explorer' }, { id: 'queries', label: 'Queries' }, { id: 'replays', label: 'Replays' }];
  const characterOptions = [{ value: 'mcqueen', label: 'Mejiro McQueen' }, { value: 'oguri', label: 'Oguri Cap' }];
  const supportOptions = [{ value: 'all', label: 'All cards' }, { value: 'kitasan', label: 'Kitasan Black SSR' }];
  const strategyOptions = [{ value: 'leader', label: 'Leader' }, { value: 'runner', label: 'Runner' }, { value: 'betweener', label: 'Betweener' }];
  const raceOptions = [{ value: 'tokyo-2400', label: 'Tokyo 2400m' }];
  const winnerOptions = [{ value: 'any', label: 'Any character' }, ...characterOptions];
  const sortOptions = [{ value: 'newest', label: 'Newest' }, { value: 'fastest', label: 'Fastest' }];
  const skillTabs = [{ id: 'leader', label: 'Leader' }, { id: 'runner', label: 'Runner' }, { id: 'chaser', label: 'Chaser' }];
  const usageColumns = [{ key: 'card', label: 'Support card' }, { key: 'usage', label: 'Usage', numeric: true }];
  const usageRows = [{ card: 'Kitasan Black SSR', usage: '81.6%' }, { card: 'Fine Motion SSR', usage: '64.2%' }];
  const deckColumns = [{ key: 'deck', label: 'Deck core' }, { key: 'appearances', label: 'Appearances', numeric: true }, { key: 'winRate', label: 'Win rate', numeric: true }];
  const deckRows = [{ deck: '3 Speed · 2 Stamina · 1 Friend', appearances: 892, winRate: '34.1%' }, { deck: '2 Speed · 2 Stamina · 2 Power', appearances: 516, winRate: '28.7%' }];
</script>

<section id="haku-uma-logs" class="haku-group">
  <header><span>UmaLogsPage source family</span><h2>UmaLogs</h2><p>The overview, explorer, UQL, and replay tabs are all represented as separate reusable contracts.</p></header>
  <div class="haku-contract-grid">
    <div class="wide"><HakuContract id="haku-umalogs-page" title="UmaLogsPage" source="pages/UmaLogsPage/index.tsx" origin="uma"><div class="haku-stack"><div class="haku-page-header"><div><h4>UmaLogs</h4><p>Community race analytics and replay search.</p></div><SelectField id="haku-meeting" label="Champions Meeting" options={meetingOptions} bind:value={meeting}/></div><Tabs items={sections} bind:value={section} label="UmaLogs sections"/></div></HakuContract></div>
    <HakuContract id="haku-histogram" title="Histogram" source="UmaLogsPage/Histogram.tsx"><div class="haku-stack"><div class="haku-row"><strong>Winning time</strong><Badge tone="accent">Count</Badge><Badge>Percent</Badge></div><div class="haku-histogram">{#each [8,14,25,41,64,88,100,83,57,32,18,7] as height}<i style={`--height:${height}%`}></i>{/each}</div><small class="haku-muted">1:56 · 1:58 · 2:00 · 2:02</small></div></HakuContract>
    <HakuContract id="haku-fastest-uma" title="FastestUmaPanel" source="UmaLogsPage/FastestUmaPanel.tsx"><div class="haku-stack"><div class="haku-runner"><img class="haku-portrait" src={mcqueen} alt=""/><span><strong>Mejiro McQueen</strong><small>Leader · UE1</small></span><b style="margin-left:auto">1:56.82</b></div><div class="haku-runner"><img class="haku-portrait" src={oguri} alt=""/><span><strong>Oguri Cap</strong><small>Betweener · UF9</small></span><b style="margin-left:auto">1:57.04</b></div><div class="haku-runner"><img class="haku-portrait" src={kitasan} alt=""/><span><strong>Kitasan Black</strong><small>Runner · UF8</small></span><b style="margin-left:auto">1:57.21</b></div></div></HakuContract>
    <div class="wide"><HakuContract id="haku-true-skill" title="TrueSkillTeamPanel" source="UmaLogsPage/TrueSkillTeamPanel.tsx"><div class="haku-ranking"><div class="haku-ranking-row"><b class="haku-rank gold">1</b><span class="haku-team-faces"><img src={mcqueen} alt=""/><img src={oguri} alt=""/><img src={kitasan} alt=""/></span><strong>McQueen · Oguri · Kitasan</strong><span class="score">31.42 ± 2.16</span></div><div class="haku-ranking-row"><b class="haku-rank">2</b><span class="haku-team-faces"><img src={oguri} alt=""/><img src={mcqueen} alt=""/><img src={kitasan} alt=""/></span><strong>Oguri · McQueen · Kitasan</strong><span class="score">29.88 ± 2.74</span></div></div></HakuContract></div>
    <HakuContract id="haku-explorer-selects" title="ExplorerSelects" source="UmaLogsPage/ExplorerSelects.tsx" origin="uma"><div class="haku-fields"><SelectField id="haku-explorer-character" label="Character" options={characterOptions} bind:value={character}/><SelectField id="haku-explorer-support" label="Support card" options={supportOptions} bind:value={support}/><SelectField id="haku-explorer-strategy" label="Strategy" options={strategyOptions} bind:value={strategy}/><TextField id="haku-explorer-appearances" label="Min appearances" type="number" min={1} bind:value={appearances}/></div></HakuContract>
    <HakuContract id="haku-explorer-tab" title="ExplorerTab" source="UmaLogsPage/ExplorerTab.tsx"><div class="haku-table-wrap"><table class="haku-table"><thead><tr><th>Support card</th><th>Appearances</th><th>Win rate</th><th>Delta</th></tr></thead><tbody><tr><td><span class="haku-runner"><img class="haku-portrait square" src={supportSpeed} alt=""/><strong>Kitasan Black SSR</strong></span></td><td>1,284</td><td>31.8%</td><td style="color:var(--accent-secondary)">+4.2pp</td></tr><tr><td>No selection</td><td>802</td><td>24.1%</td><td>baseline</td></tr></tbody></table></div></HakuContract>
    <div class="wide"><HakuContract id="haku-query-tab" title="QueriesTab" source="UmaLogsPage/QueriesTab.tsx" origin="uma"><QueryEditor id="haku-uql-query" label="UQL query" bind:value={query} suggestions={[{ label: 'Long distance', insert: 'distance = long' }, { label: 'Leader strategy', insert: 'strategy = leader' }]} examples={['distance = long AND strategy = leader']}/></HakuContract></div>
    <div class="wide"><HakuContract id="haku-query-results" title="Query results" source="UmaLogsPage/QueriesTab.tsx"><div class="haku-table-wrap"><table class="haku-table"><thead><tr><th>Character</th><th>Strategy</th><th>Appearances</th><th>Win rate</th></tr></thead><tbody><tr><td><span class="haku-runner"><img class="haku-portrait" src={mcqueen} alt=""/><strong>Mejiro McQueen</strong></span></td><td><Badge tone="success">Leader</Badge></td><td>1,489</td><td><MetricBar value={38.2} compact/></td></tr><tr><td><span class="haku-runner"><img class="haku-portrait" src={kitasan} alt=""/><strong>Kitasan Black</strong></span></td><td><Badge>Runner</Badge></td><td>1,208</td><td><MetricBar value={28.7} compact/></td></tr></tbody></table></div></HakuContract></div>
    <HakuContract id="haku-replay-selects" title="ReplaySelects" source="UmaLogsPage/ReplaySelects.tsx" origin="uma"><div class="haku-stack"><div class="haku-fields"><SelectField id="haku-replay-race" label="Race" options={raceOptions} bind:value={replayRace}/><SelectField id="haku-replay-winner" label="Winner" options={winnerOptions} bind:value={replayWinner}/></div><div class="haku-row"><Button variant="secondary" size="sm">Team filter</Button><Button variant="secondary" size="sm">Room A</Button><Button variant="secondary" size="sm">No debuffer</Button></div></div></HakuContract>
    <HakuContract id="haku-replays-tab" title="ReplaysTab" source="UmaLogsPage/ReplaysTab.tsx"><div class="haku-stack"><div class="haku-row"><strong>128 matching replays</strong><div style="min-width:140px;margin-left:auto"><SelectField id="haku-replay-sort" label="Sort" options={sortOptions} bind:value={replaySort}/></div></div><div class="haku-alert">Filters remain in the left panel on desktop and stack above results on mobile.</div></div></HakuContract>
    <div class="wide"><HakuContract id="haku-replay-result" title="ReplayResultDisplay" source="UmaLogsPage/ReplayResultDisplay.tsx"><div class="haku-replay-result"><div class="haku-stack"><div><strong>Tokyo 2400m · Room A</strong><small class="haku-muted" style="margin-left:8px">2 hours ago · 1:58.42</small></div><div class="haku-lineup"><span class="haku-lineup-team"><img src={mcqueen} alt="Mejiro McQueen"/><img src={oguri} alt="Oguri Cap"/><img src={kitasan} alt="Kitasan Black"/></span><span class="haku-muted">vs</span><span class="haku-lineup-team"><img src={oguri} alt="Oguri Cap"/><img src={kitasan} alt="Kitasan Black"/><img src={mcqueen} alt="Mejiro McQueen"/></span></div></div><Button>Open replay</Button></div></HakuContract></div>
    <HakuContract id="haku-card-usage-modal" title="CardUsageModal" source="UmaLogsPage/CardUsageModal.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="Support-card usage"><DataTable caption="Support-card usage" columns={usageColumns} rows={usageRows}/></DialogPanel></div></HakuContract>
    <HakuContract id="haku-skills-strategy-modal" title="SkillsByStrategyModal" source="UmaLogsPage/SkillsByStrategyModal.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="Skills by strategy"><Tabs items={skillTabs} bind:value={skillStrategy} label="Strategy"/><MetricBar label="Corner Adept ○" value={72.4}/></DialogPanel></div></HakuContract>
    <div class="wide"><HakuContract id="haku-style-decks-modal" title="StyleDecksModal" source="UmaLogsPage/StyleDecksModal.tsx" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="Leader deck compositions"><DataTable caption="Leader deck compositions" columns={deckColumns} rows={deckRows}/></DialogPanel></div></HakuContract></div>
  </div>
</section>

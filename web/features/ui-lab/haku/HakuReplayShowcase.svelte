<script lang="ts">
  import HakuContract from '../../../ui/hakuraku/HakuContract.svelte';
  import Button from '../../../ui/Button.svelte';
  import SelectField from '../../../ui/SelectField.svelte';
  import Slider from '../../../ui/Slider.svelte';
  import Switch from '../../../ui/Switch.svelte';
  import TextField from '../../../ui/TextField.svelte';
  let playing = $state(false);
  let progress = $state(58);
  let track = $state('tokyo-2400');
  let viewWindow = $state('500');
  let playbackSpeed = $state('1');
  let speedVisible = $state(true);
  let hpVisible = $state(true);
  let skillsVisible = $state(true);
  let lanesVisible = $state(false);
  let hidden = $state<string[]>(['Oguri Cap']);
  const runners = [{name:'Mejiro McQueen',color:'var(--accent-primary)'},{name:'Oguri Cap',color:'var(--accent-pink)'},{name:'Kitasan Black',color:'var(--accent-secondary)'},{name:'Special Week',color:'var(--accent-warning)'}];
  const trackOptions = [{ value: 'tokyo-2400', label: 'Tokyo 2400m Turf' }];
  const speedOptions = [{ value: '1', label: '1×' }, { value: '.5', label: '0.5×' }];
</script>

<section id="haku-replay" class="haku-group">
  <header><span>RaceReplay source family</span><h2>Race replay</h2><p>The source’s small colored-dot visibility pills, toolbar, 500px chart model, overlay minimap, timeline, help, and clip controls.</p></header>
  <div class="haku-contract-grid">
    <div class="wide"><HakuContract id="haku-race-replay" title="RaceReplay composition" source="components/RaceReplay/index.tsx">
      <div class="haku-replay-shell">
        <div id="haku-runner-visibility" class="haku-visibility" aria-label="Runner visibility">{#each runners as runner}<button class:off={hidden.includes(runner.name)} aria-pressed={!hidden.includes(runner.name)} onclick={() => hidden = hidden.includes(runner.name) ? hidden.filter(name => name !== runner.name) : [...hidden,runner.name]}><i style={`--dot:${runner.color}`}></i>{runner.name}</button>{/each}</div>
        <div id="haku-replay-toolbar" class="haku-replay-toolbar"><SelectField id="haku-replay-track" label="Track" options={trackOptions} bind:value={track}/><TextField id="haku-view-window" label="View window" type="number" min={100} bind:value={viewWindow}/><div class="haku-action-bar"><Button variant="secondary" size="sm">Previous frame</Button><Button variant="secondary" size="sm">Next frame</Button><Button variant="ghost" size="sm">Reset view</Button></div></div>
        <div id="haku-toggle-defs" class="haku-toggle-grid"><Switch id="haku-speed-visible" label="Speed line" bind:checked={speedVisible}/><Switch id="haku-hp-visible" label="HP remaining" bind:checked={hpVisible}/><Switch id="haku-skills-visible" label="Skill markers" bind:checked={skillsVisible}/><Switch id="haku-lanes-visible" label="Lane changes" bind:checked={lanesVisible}/></div>
        <div id="haku-legend-item" class="haku-legend"><span><i style="--legend:var(--accent-primary)"></i> Speed</span><span><i style="--legend:var(--accent-secondary)"></i> HP</span><span><i style="--legend:var(--accent-warning)"></i> Skill proc</span><span><i style="--legend:var(--accent-pink)"></i> Last spurt</span></div>
        <div class="haku-replay-chart" role="img" aria-label="Replay chart preview"><div id="haku-course-minimap" class="haku-minimap"><div class="haku-track"><span></span><span></span><span></span><b></b></div><small class="haku-muted">Straight · Corner · Final straight</small></div><svg class="haku-chart-lines" viewBox="0 0 600 210" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,165 55,158 115,144 170,151 230,119 286,128 345,85 402,98 465,56 525,61 600,24" fill="none" stroke="var(--accent-primary)" stroke-width="2"/><polyline points="0,18 55,25 115,33 170,47 230,62 286,83 345,106 402,124 465,151 525,175 600,194" fill="none" stroke="var(--accent-secondary)" stroke-width="2"/><line x1="460" y1="0" x2="460" y2="210" stroke="var(--accent-warning)" stroke-dasharray="4 4"/></svg></div>
        <div id="haku-replay-timeline" class="haku-stack"><Slider id="haku-replay-frame" label="Replay frame" min={0} max={100} bind:value={progress} unit="%"/><div class="haku-row"><Button onclick={() => playing = !playing}>{playing ? 'Pause' : 'Play'}</Button><span class="haku-muted">Frame {Math.round(progress * 142)} / 14,200 · {progress > 82 ? 'Last spurt' : 'Mid race'}</span></div></div>
      </div>
    </HakuContract></div>
    <HakuContract id="haku-horse-tooltip" title="HorseTooltip" source="components/RaceReplay/components/HorseTooltip.tsx"><div class="haku-tooltip-box"><strong>Mejiro McQueen · #1</strong><dl><dt>Position</dt><dd>1st</dd><dt>Speed</dt><dd>21.3 m/s</dd><dt>HP</dt><dd>31.8%</dd><dt>Lane</dt><dd>2.4</dd><dt>Phase</dt><dd>Last spurt</dd></dl></div></HakuContract>
    <HakuContract id="haku-info-hover" title="InfoHover" source="components/RaceReplay/components/InfoHover.tsx"><div class="haku-row"><Button variant="ghost" size="sm" ariaLabel="About displayed speed">i</Button><div class="haku-tooltip-box"><strong>Displayed speed</strong><span class="haku-muted">The current target speed after slope, skill, and phase modifiers.</span></div></div></HakuContract>
    <div class="wide"><HakuContract id="haku-clip-maker" title="ClipMaker" source="components/RaceReplay/components/ClipMaker.tsx" origin="uma"><div class="haku-clip-maker"><TextField id="haku-clip-start" label="Start frame" type="number" value="8200"/><TextField id="haku-clip-end" label="End frame" type="number" value="9400"/><SelectField id="haku-playback-speed" label="Playback speed" options={speedOptions} bind:value={playbackSpeed}/><Button>Create clip</Button></div></HakuContract></div>
  </div>
</section>

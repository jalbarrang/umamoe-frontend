<script lang="ts">
  import Artwork from '../Artwork.svelte';
  import Icon from '../Icon.svelte';
  import type { RaceFrame } from '../../domain/race/race-capture-parser';
  import { raceFrameAtTime, raceReplayBounds, replayProgress } from '../../domain/race/race-replay';
  import HakuCourseMap, { type CourseRunnerPoint } from './HakuCourseMap.svelte';

  export interface ReplayRunner {
    id: string;
    index: number;
    name: string;
    image?: string;
    color: string;
  }

  interface Props {
    frames: RaceFrame[];
    runners: ReplayRunner[];
    selectedRunnerId?: string;
    distanceMax?: number;
    courseLabel?: string;
  }

  let { frames, runners, selectedRunnerId = '', distanceMax, courseLabel = 'Captured race' }: Props = $props();
  let playing = $state(false);
  let currentTime = $state(0);
  let playbackRate = $state(1);
  let hidden = $state<string[]>([]);
  let animationFrame = 0;
  let previousTimestamp: number | undefined;

  const bounds = $derived(raceReplayBounds(frames, distanceMax));
  const frame = $derived(raceFrameAtTime(frames, currentTime));
  const progress = $derived(replayProgress(currentTime, bounds) * 100);
  const points = $derived<CourseRunnerPoint[]>(runners.map((runner) => {
    const horse = frame?.horses[runner.index];
    return {
      ...runner,
      distance: horse?.distance ?? 0,
      lanePosition: horse?.lanePosition ?? 0,
      hidden: hidden.includes(runner.id),
      selected: runner.id === selectedRunnerId
    };
  }));
  const selectedRunner = $derived(runners.find((runner) => runner.id === selectedRunnerId) ?? runners[0]);
  const selectedHorse = $derived(selectedRunner ? frame?.horses[selectedRunner.index] : undefined);

  function toggleRunner(id: string): void {
    hidden = hidden.includes(id) ? hidden.filter((item) => item !== id) : [...hidden, id];
  }

  function reset(): void {
    playing = false;
    currentTime = bounds.startTime;
  }

  function formatTime(seconds: number): string {
    const safe = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    const minutes = Math.floor(safe / 60);
    return `${minutes}:${(safe - minutes * 60).toFixed(2).padStart(5, '0')}`;
  }

  function tick(timestamp: number): void {
    if (!playing) return;
    if (previousTimestamp === undefined) previousTimestamp = timestamp;
    const delta = Math.min(.1, (timestamp - previousTimestamp) / 1_000) * playbackRate;
    previousTimestamp = timestamp;
    const next = currentTime + delta;
    if (next >= bounds.endTime) {
      currentTime = bounds.endTime;
      playing = false;
      return;
    }
    currentTime = next;
    animationFrame = requestAnimationFrame(tick);
  }

  function togglePlayback(): void {
    if (!playing && currentTime >= bounds.endTime) currentTime = bounds.startTime;
    playing = !playing;
  }

  $effect(() => {
    const start = bounds.startTime;
    const end = bounds.endTime;
    if (currentTime < start || currentTime > end || (currentTime === 0 && start !== 0)) currentTime = start;
  });

  $effect(() => {
    if (!playing || !frames.length || bounds.duration <= 0) return;
    previousTimestamp = undefined;
    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  });
</script>

<section class="replay" aria-label="Race replay controls">
  <header class="replay-head">
    <div><span>SPATIAL REPLAY</span><strong>{courseLabel}</strong><small>{bounds.distanceMax.toLocaleString()}m · {frames.length.toLocaleString()} frames</small></div>
    <output aria-live="off">FRAME {(frame?.sourceIndex ?? 0) + 1} / {frames.length.toLocaleString()}</output>
  </header>

  <div class="visibility" aria-label="Runner visibility">
    {#each runners as runner}
      <button class:hidden={hidden.includes(runner.id)} class:selected={runner.id === selectedRunnerId} aria-pressed={!hidden.includes(runner.id)} onclick={() => toggleRunner(runner.id)} style:--runner-color={runner.color} title={`Toggle ${runner.name}`}>
        {#if runner.image}<Artwork src={runner.image} alt="" size="xs" shape="circle"/>{/if}<span>{runner.name}</span>
      </button>
    {/each}
  </div>

  <HakuCourseMap {progress} runners={points} distanceMax={bounds.distanceMax} laneMax={bounds.laneMax}/>

  <div class="timeline">
    <span>{formatTime(currentTime)}</span>
    <input aria-label="Replay position" type="range" min={bounds.startTime} max={bounds.endTime} step="0.01" value={currentTime} oninput={(event) => { playing = false; currentTime = Number(event.currentTarget.value); }}/>
    <span>{formatTime(bounds.endTime)}</span>
  </div>

  <div class="control-row">
    <button class="play" aria-label={playing ? 'Pause replay' : 'Play replay'} onclick={togglePlayback}><Icon name={playing ? 'status' : 'activity'} size={17}/><span>{playing ? 'Pause' : 'Play'}</span></button>
    <div class="speed" role="group" aria-label="Playback speed">
      {#each [.5, 1, 2, 4] as option}<button class:active={playbackRate === option} aria-pressed={playbackRate === option} onclick={() => playbackRate = option}>{option}×</button>{/each}
    </div>
    <button class="utility" onclick={reset}><Icon name="refresh" size={15}/><span>Reset</span></button>
  </div>

  {#if selectedRunner && selectedHorse}
    <dl class="live-stats">
      <div><dt>Runner</dt><dd>{selectedRunner.name}</dd></div>
      <div><dt>Distance</dt><dd>{selectedHorse.distance.toFixed(1)}m</dd></div>
      <div><dt>Speed</dt><dd>{(selectedHorse.speed / 100).toFixed(2)}m/s</dd></div>
      <div><dt>HP</dt><dd>{Math.max(0, Math.round(selectedHorse.hp)).toLocaleString()}</dd></div>
      <div><dt>Lane</dt><dd>{Math.round(selectedHorse.lanePosition).toLocaleString()}</dd></div>
    </dl>
  {/if}
</section>

<style>
  .replay { min-width: 0; display: grid; gap: 10px; padding: var(--space-3); border: 1px solid var(--haku-border); border-radius: var(--haku-radius-lg); background: var(--haku-bg-1); }
  .replay-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .replay-head > div { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: baseline; gap: 2px 8px; }
  .replay-head span { grid-column: 1 / -1; color: var(--color-accent); font-size: 8px; font-weight: 800; letter-spacing: .06em; }
  .replay-head strong { min-width: 0; overflow: hidden; font-size: var(--font-sm); text-overflow: ellipsis; white-space: nowrap; }
  .replay-head small { color: var(--haku-muted); font-size: 9px; }
  .replay-head output { flex: 0 0 auto; color: var(--haku-muted); font: 700 9px/1 var(--font-mono); }
  .visibility { min-width: 0; display: flex; gap: 5px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
  .visibility button { min-width: 0; flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 3px 9px 3px 3px; border: 1px solid color-mix(in srgb, var(--runner-color) 55%, var(--haku-border)); border-radius: 999px; background: color-mix(in srgb, var(--runner-color) 7%, var(--haku-bg-2)); color: var(--color-text); cursor: pointer; }
  .visibility button.selected { box-shadow: inset 0 0 0 1px var(--runner-color); }
  .visibility button.hidden { opacity: .4; filter: grayscale(.8); }
  .visibility button span { max-width: 112px; overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .visibility :global(.art) { border-color: transparent; }
  .timeline { display: grid; grid-template-columns: 48px minmax(0, 1fr) 48px; align-items: center; gap: 8px; color: var(--haku-muted); font: 9px/1 var(--font-mono); }
  .timeline span:last-child { text-align: right; }
  .timeline input { width: 100%; accent-color: var(--haku-green); cursor: pointer; }
  .control-row { display: flex; align-items: center; gap: 7px; }
  .control-row button { min-height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 0 11px; border: 1px solid var(--haku-border-strong); border-radius: var(--haku-radius-sm); background: var(--haku-bg-2); color: var(--color-text); cursor: pointer; font-size: 10px; }
  .control-row .play { border-color: var(--accent-secondary); background: var(--color-secondary-soft); color: var(--haku-green-soft); }
  .speed { display: flex; align-items: center; gap: 2px; padding: 2px; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-sm); }
  .speed button { min-width: 34px; min-height: 28px; padding: 0 6px; border: 0; background: transparent; color: var(--haku-muted); }
  .speed button.active { background: var(--haku-accent); color: white; }
  .utility { margin-left: auto; }
  .live-stats { display: grid; grid-template-columns: minmax(150px, 1.5fr) repeat(4, minmax(80px, 1fr)); gap: 1px; margin: 0; overflow: hidden; background: var(--border-subtle); }
  .live-stats div { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px; min-height: 38px; padding: 6px 9px; background: var(--surface-2); }
  .live-stats dt { color: var(--color-text-subtle); font-size: 8px; font-weight: 800; text-transform: uppercase; }
  .live-stats dd { min-width: 0; margin: 0; overflow: hidden; font: 800 10px/1 var(--font-mono); text-overflow: ellipsis; white-space: nowrap; }
  @media (max-width: 620px) { .replay { padding-inline: 5px; }.replay-head output, .utility span { display: none; }.control-row { flex-wrap: wrap; }.utility { margin-left: 0; padding-inline: 8px !important; }.live-stats { grid-template-columns: 1fr 1fr; }.live-stats div:first-child { grid-column: 1 / -1; } }
</style>

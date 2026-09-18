<script lang="ts">
  export interface CourseRunnerPoint {
    id: string;
    name: string;
    image?: string;
    color: string;
    distance: number;
    lanePosition: number;
    hidden?: boolean;
    selected?: boolean;
  }

  interface Props {
    progress?: number;
    compact?: boolean;
    runners?: CourseRunnerPoint[];
    distanceMax?: number;
    laneMax?: number;
  }

  let { progress = 0, compact = false, runners = [], distanceMax = 1, laneMax = 1 }: Props = $props();
  const visibleRunners = $derived(runners.filter((runner) => !runner.hidden));
  const cursorX = $derived(30 + Math.max(0, Math.min(progress, 100)) / 100 * 460);
  const runnerX = (distance: number) => 30 + Math.max(0, Math.min(distance / Math.max(1, distanceMax), 1)) * 460;
  const runnerY = (lane: number) => 24 + Math.max(0, Math.min(lane / Math.max(1, laneMax), 1)) * 48;
  const distanceLabel = (fraction: number) => `${Math.round(distanceMax * fraction).toLocaleString()}m`;
</script>

<div class="course-map" class:compact role="img" aria-label={`Race positions at ${Math.round(progress)}% of playback`}>
  <svg viewBox="0 0 520 108" preserveAspectRatio="none" aria-hidden="true">
    <rect class="track" x="22" y="16" width="476" height="64" rx="3"/>
    <rect class="final-corner" x="355" y="16" width="71" height="64"/>
    <rect class="last-spurt" x="426" y="16" width="72" height="64"/>
    {#each [0, .25, .5, .75, 1] as fraction}
      <line class="distance-line" x1={30 + fraction * 460} y1="16" x2={30 + fraction * 460} y2="80"/>
      <text class="distance-label" x={30 + fraction * 460} y="98" text-anchor={fraction === 0 ? 'start' : fraction === 1 ? 'end' : 'middle'}>{distanceLabel(fraction)}</text>
    {/each}
    <line class="rail" x1="30" y1="24" x2="490" y2="24"/>
    <line class="rail" x1="30" y1="72" x2="490" y2="72"/>
    <line class="playhead" x1={cursorX} y1="14" x2={cursorX} y2="82"/>
    {#each visibleRunners as runner, index}
      <g class:selected={runner.selected} transform={`translate(${runnerX(runner.distance)} ${runnerY(runner.lanePosition)})`}>
        <circle class="runner-halo" r={runner.selected ? 10 : 8} style:stroke={runner.color}/>
        {#if runner.image}
          <defs><clipPath id={`course-runner-${index}`}><circle r="7"/></clipPath></defs>
          <image href={runner.image} x="-7" y="-7" width="14" height="14" preserveAspectRatio="xMidYMid slice" clip-path={`url(#course-runner-${index})`}/>
        {:else}
          <circle class="runner-dot" r="6" style:fill={runner.color}/>
        {/if}
      </g>
    {/each}
  </svg>
  <div class="phase-labels" aria-hidden="true"><span>OPENING</span><span>RACE BODY</span><span>FINAL CORNER</span><span>LAST SPURT</span></div>
</div>

<style>
  .course-map { position: relative; min-width: 0; height: 154px; overflow: hidden; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-md); background: var(--haku-bg-0); }
  svg { width: 100%; height: calc(100% - 24px); overflow: visible; }
  .track { fill: var(--surface-2); stroke: var(--border-strong); stroke-width: 1; }
  .final-corner { fill: color-mix(in srgb, var(--accent-warning) 6%, transparent); }
  .last-spurt { fill: color-mix(in srgb, var(--accent-secondary) 8%, transparent); }
  .distance-line { stroke: var(--border-subtle); stroke-width: 1; stroke-dasharray: 2 3; }
  .rail { stroke: var(--border-strong); stroke-width: 1; }
  .playhead { stroke: var(--color-accent); stroke-width: 1.5; opacity: .86; }
  .distance-label { fill: var(--color-text-subtle); font: 700 7px/1 var(--font-mono); }
  .runner-halo { fill: var(--surface-1); stroke-width: 2; transition: r var(--motion-fast), opacity var(--motion-fast); }
  g.selected .runner-halo { fill: var(--surface-3); stroke-width: 3; }
  .runner-dot { stroke: var(--surface-1); stroke-width: 1; }
  .phase-labels { position: absolute; inset: auto 20px 6px; display: grid; grid-template-columns: .24fr .46fr .15fr .15fr; color: var(--color-text-subtle); font: 800 7px/1 var(--font-mono); letter-spacing: .04em; }
  .phase-labels span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .phase-labels span:not(:first-child) { text-align: center; }
  .compact { height: 112px; }
  @media (prefers-reduced-motion: reduce) { .runner-halo { transition: none; } }
</style>

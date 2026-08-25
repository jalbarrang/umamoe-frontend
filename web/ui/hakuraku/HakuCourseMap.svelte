<script lang="ts">
  interface Props { progress?: number; compact?: boolean; }
  let { progress = 58, compact = false }: Props = $props();
  const cursorX = $derived(24 + (Math.max(0, Math.min(progress, 100)) / 100) * 472);
</script>

<div class="course-map" class:compact role="img" aria-label={`Race course, playback at ${progress}%`}>
  <svg viewBox="0 0 520 90" preserveAspectRatio="none" aria-hidden="true">
    <path class="track-shadow" d="M24 58 C86 17 150 17 207 46 S329 76 387 42 S466 21 496 43"/>
    <path class="track" d="M24 58 C86 17 150 17 207 46 S329 76 387 42 S466 21 496 43"/>
    <path class="progress" pathLength="100" stroke-dasharray={`${progress} ${100 - progress}`} d="M24 58 C86 17 150 17 207 46 S329 76 387 42 S466 21 496 43"/>
    <line x1="470" y1="17" x2="470" y2="67" class="finish"/>
    <circle cx={cursorX} cy="43" r="7" class="runner"/>
  </svg>
  <span class="start">START</span><span class="finish-label">GOAL</span>
</div>

<style>
  .course-map { position: relative; min-width: 0; height: 112px; overflow: hidden; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-md); background: linear-gradient(180deg, rgb(101 210 131 / .08), transparent 58%), var(--haku-bg-0); }
  svg { width: 100%; height: 100%; }
  path { fill: none; stroke-linecap: round; stroke-linejoin: round; }
  .track-shadow { stroke: rgb(0 0 0 / .42); stroke-width: 18; }
  .track { stroke: #59616b; stroke-width: 12; }
  .progress { stroke: var(--haku-green); stroke-width: 6; }
  .finish { stroke: #f2f3f5; stroke-width: 3; stroke-dasharray: 4 4; }
  .runner { fill: #ffd166; stroke: var(--haku-bg-0); stroke-width: 3; }
  span { position: absolute; bottom: 7px; color: var(--haku-muted); font: 800 8px/1 var(--font-mono); letter-spacing: .08em; }
  .start { left: 12px; } .finish-label { right: 12px; }
  .compact { height: 80px; }
</style>

<script lang="ts">
  import Artwork from '../Artwork.svelte';
  import Icon from '../Icon.svelte';
  import HakuCourseMap from './HakuCourseMap.svelte';
  interface Runner { id: string; name: string; image: string; color: string; }
  interface Props { runners: Runner[]; }
  let { runners }: Props = $props();
  let playing = $state(false);
  let progress = $state(58);
  let speed = $state('1×');
  let hidden = $state<string[]>([]);
  function toggleRunner(id: string) { hidden = hidden.includes(id) ? hidden.filter((item) => item !== id) : [...hidden, id]; }
</script>

<section class="replay" aria-label="Race replay controls">
  <div class="replay-head"><div><strong>Race replay</strong><span>Tokyo · 2,400m · Turf · Firm</span></div><span class="live">FRAME 8,412</span></div>
  <div class="visibility" aria-label="Runner visibility">
    {#each runners as runner}
      <button class:hidden={hidden.includes(runner.id)} aria-pressed={!hidden.includes(runner.id)} onclick={() => toggleRunner(runner.id)} style:--runner-color={runner.color}><Artwork src={runner.image} alt="" size="xs" shape="circle"/><span>{runner.name}</span></button>
    {/each}
  </div>
  <HakuCourseMap {progress}/>
  <div class="timeline"><span>0:00</span><input aria-label="Replay position" type="range" min="0" max="100" bind:value={progress}/><span>1:58</span></div>
  <div class="controls">
    <button class="play" aria-label={playing ? 'Pause replay' : 'Play replay'} onclick={() => playing = !playing}><Icon name={playing ? 'status' : 'activity'} size={17}/><span>{playing ? 'Pause' : 'Play'}</span></button>
    <div class="speed" role="group" aria-label="Playback speed">{#each ['0.5×','1×','2×','4×'] as option}<button class:active={speed === option} aria-pressed={speed === option} onclick={() => speed = option}>{option}</button>{/each}</div>
    <button class="utility"><Icon name="refresh" size={15}/><span>Reset</span></button>
  </div>
</section>

<style>
  .replay { min-width: 0; display: grid; gap: 11px; padding: 13px; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-lg); background: var(--haku-bg-1); }
  .replay-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .replay-head > div { min-width: 0; display: grid; gap: 2px; }
  .replay-head strong { font-size: 13px; } .replay-head span { color: var(--haku-muted); font-size: 9px; }
  .live { flex: 0 0 auto; font-family: var(--font-mono); }
  .visibility { min-width: 0; display: flex; gap: 5px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: thin; }
  .visibility button { min-width: 0; flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 3px 9px 3px 3px; border: 1px solid color-mix(in srgb, var(--runner-color) 60%, var(--haku-border)); border-radius: 999px; background: color-mix(in srgb, var(--runner-color) 9%, var(--haku-bg-2)); color: var(--color-text); cursor: pointer; }
  .visibility button.hidden { opacity: .42; filter: grayscale(.8); }
  .visibility button span { max-width: 110px; overflow: hidden; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .visibility :global(.art) { border-color: transparent; }
  .timeline { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 8px; color: var(--haku-muted); font: 9px/1 var(--font-mono); }
  .timeline input { width: 100%; accent-color: var(--haku-green); }
  .controls { display: flex; align-items: center; gap: 7px; }
  .controls button { min-height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 0 11px; border: 1px solid var(--haku-border-strong); border-radius: var(--haku-radius-sm); background: var(--haku-bg-2); color: var(--color-text); cursor: pointer; font-size: 10px; }
  .controls .play { border-color: rgb(101 210 131 / .45); background: rgb(101 210 131 / .11); color: var(--haku-green-soft); }
  .speed { display: flex; align-items: center; gap: 2px; padding: 2px; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-sm); }
  .speed button { min-width: 34px; min-height: 28px; padding: 0 6px; border: 0; background: transparent; color: var(--haku-muted); }
  .speed button.active { background: var(--haku-accent); color: white; }
  .utility { margin-left: auto; }
  @container haku-lab (max-width: 520px) { .replay { padding: 9px; } .replay-head .live, .utility span { display: none; } .controls { flex-wrap: wrap; } .utility { margin-left: 0; padding-inline: 8px !important; } }
</style>

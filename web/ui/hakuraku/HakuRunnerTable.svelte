<script lang="ts">
  import Artwork from '../Artwork.svelte';
  interface Runner { id: string; gate: number; name: string; image: string; strategy: string; speed: number; hp: number; position: number; delta: string; color: string; }
  interface Props { runners: Runner[]; }
  let { runners }: Props = $props();
</script>

<div class="runner-table" role="table" aria-label="Race runners">
  <div class="table-head" role="row"><span>Runner</span><span>Strategy</span><span>Speed</span><span>HP</span><span>Position</span></div>
  {#each runners as runner}
    <button role="row" style:--runner-color={runner.color} aria-label={`${runner.name}, position ${runner.position}`}>
      <span class="runner" role="cell"><b class="gate">{runner.gate}</b><Artwork src={runner.image} alt="" size="xs" shape="circle"/><strong>{runner.name}</strong></span>
      <span role="cell">{runner.strategy}</span><b role="cell">{runner.speed.toLocaleString()}</b><span role="cell">{runner.hp}%</span><span class="place" role="cell"><b>{runner.position}</b><small>{runner.delta}</small></span>
    </button>
  {/each}
</div>

<style>
  .runner-table { min-width: 0; overflow: hidden; border: 1px solid var(--haku-border); border-radius: var(--haku-radius-md); background: var(--haku-bg-1); }
  .table-head, button { min-width: 0; display: grid; grid-template-columns: minmax(180px, 1.5fr) minmax(80px, .65fr) minmax(62px, .45fr) minmax(54px, .4fr) minmax(72px, .5fr); align-items: center; gap: 8px; }
  .table-head { min-height: 32px; padding: 0 11px; border-bottom: 1px solid var(--haku-border); background: var(--haku-bg-0); color: var(--haku-muted); font-size: 8px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase; }
  button { width: 100%; min-height: 48px; padding: 4px 11px 4px 7px; border: 0; border-bottom: 1px solid var(--haku-border); border-left: 3px solid var(--runner-color); background: transparent; color: var(--color-text); cursor: pointer; text-align: left; }
  button:last-child { border-bottom: 0; } button:hover { background: var(--haku-bg-2); }
  .runner { min-width: 0; display: grid; grid-template-columns: 20px auto minmax(0, 1fr); align-items: center; gap: 7px; }
  .runner strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
  .gate { width: 19px; height: 19px; display: grid; place-items: center; border-radius: 3px; background: var(--haku-bg-3); font: 800 9px/1 var(--font-mono); }
  button > span, button > b { font-size: 10px; font-variant-numeric: tabular-nums; }
  .place { display: flex; align-items: baseline; gap: 5px; } .place b { font-size: 14px; } .place small { color: var(--haku-green); font-size: 8px; }
  @container haku-lab (max-width: 620px) { .table-head { display: none; } button { grid-template-columns: minmax(0, 1fr) auto auto; gap: 7px; } button > :nth-child(2), button > :nth-child(4) { display: none; } .runner { grid-column: 1; } button > :nth-child(3) { grid-column: 2; } .place { grid-column: 3; } }
</style>

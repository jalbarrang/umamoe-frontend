<script lang="ts">
  import RankBadge from '@/components/RankBadge.svelte';
  import type { VeteranUiRecord } from '@/components/veteran-ui-types';

  let { summary, rarity, score, heading = 'h3', titleId, descriptionId }: {
    summary: VeteranUiRecord; rarity?: number | null; score?: number | null;
    heading?: 'h2' | 'h3'; titleId?: string; descriptionId?: string;
  } = $props();
</script>

<div class="veteran-identity">
  <div class="portrait">{#if summary.image}<img src={summary.image} alt="" loading="lazy"/>{/if}</div>
  <div class="identity">
    <svelte:element this={heading} id={titleId}>{summary.name}</svelte:element>
    <div class="identity-details" id={descriptionId}>
      <span class="scenario">{summary.scenario ?? 'Trained veteran'}</span>
      <span class="race-style">{summary.detail}{#if rarity}<span class="rarity" aria-label={`${rarity} rarity stars`}>{'★'.repeat(Math.max(0,Math.min(5,rarity)))}</span>{/if}</span>
    </div>
  </div>
  {#if score != null}<div class="rank"><RankBadge {score} size="sm"/><strong>{score.toLocaleString()}</strong></div>{/if}
</div>

<style>
  .veteran-identity { display:grid; grid-template-columns:60px minmax(0,1fr) auto; align-items:center; gap:10px; width:100%; min-width:0; text-align:left; color:var(--color-text); }
  .portrait { height:68px; overflow:hidden; }
  .portrait img { width:100%; height:100%; object-fit:contain; object-position:center bottom; }
  .identity,.identity-details { min-width:0; display:grid; gap:3px; }
  .identity :is(h2,h3) { margin:0; font-size:16px; font-weight:650; line-height:1.2; letter-spacing:-.02em; overflow-wrap:anywhere; }
  .scenario { color:var(--accent-secondary); font-size:10px; line-height:1.3; }
  .race-style { display:flex; flex-wrap:wrap; gap:3px 8px; align-items:center; color:var(--color-text-muted); font-size:10px; }
  .rarity { color:var(--accent-warning); font-size:9px; letter-spacing:1px; }
  .rank { display:grid; justify-items:center; gap:2px; }.rank strong { font-size:10px; font-weight:500; font-variant-numeric:tabular-nums; }
  @container(max-width:330px) { .veteran-identity { grid-template-columns:48px minmax(0,1fr) auto; gap:8px; }.portrait { height:60px; }.identity :is(h2,h3) { font-size:15px; } }
</style>

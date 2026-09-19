<script lang="ts">
  import { onMount } from 'svelte';
  import Artwork from '@/components/Artwork.svelte';
  import Dialog from '@/components/Dialog.svelte';
  import Icon from '@/components/Icon.svelte';
  import Banner from '@/components/Banner.svelte';
  import Button from '@/components/Button.svelte';
  import RaceBadge from '@/components/RaceBadge.svelte';
  import RaceSchedule from '@/components/RaceSchedule.svelte';
  import { loadRaceHistory, raceHistorySchedule, type RaceHistoryEntry } from '@/lib/catalog/race-catalog';

  interface Props { open?: boolean; charId: number; charName: string; charImage?: string; winSaddleIds: number[]; runRaceIds: number[]; }
  let { open = $bindable(false), charId, charName, charImage, winSaddleIds, runRaceIds }: Props = $props();
  let viewMode = $state<'grid' | 'list'>('grid');
  let entries = $state<RaceHistoryEntry[]>([]);
  let loading = $state(false);
  let error = $state('');
  let retry = $state(0);
  const schedule = $derived(raceHistorySchedule(entries));

  onMount(() => { if (matchMedia('(max-width: 768px)').matches) viewMode = 'list'; });
  $effect(() => {
    void retry;
    if (!open) return;
    let current = true;
    loading = true; error = '';
    void loadRaceHistory(winSaddleIds, runRaceIds)
      .then((value) => { if (current) entries = value; })
      .catch(() => { if (current) error = 'Race data could not be loaded. Your Veteran has not been changed.'; })
      .finally(() => { if (current) loading = false; });
    return () => { current = false; };
  });
  function exportHistory(): void {
    const payload = entries.map((entry) => ({ raceName: entry.name, grade: entry.grade, year: entry.yearLabel, turn: `${String(entry.month).padStart(2, '0')}_${String(entry.half).padStart(2, '0')}`, position: entry.position }));
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `race-history-${charName.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
  }
</script>

<Dialog bind:open title="Race History" description={charName} maxWidth="1180px" mobileSheet>
  <div class="race-toolbar">
    <div class="character"><Artwork src={charImage} alt={charName || `Character ${charId}`} shape="circle" size="sm"/><span><strong>{charName}</strong><small>{entries.length} recorded race{entries.length === 1 ? '' : 's'}</small></span></div>
    <div class="view-toggle" aria-label="Race history view"><button type="button" class:active={viewMode === 'grid'} onclick={() => viewMode = 'grid'} title="Schedule view"><Icon name="calendar" size={15}/></button><button type="button" class:active={viewMode === 'list'} onclick={() => viewMode = 'list'} title="List view"><Icon name="menu" size={15}/></button></div>
    <button class="export" type="button" onclick={exportHistory} disabled={!entries.length}><Icon name="download" size={14}/><span>Export</span></button>
  </div>
  {#if loading}<p class="state">Loading race history…</p>
  {:else if error}<Banner title="Race history unavailable" tone="danger"><p>{error}</p><Button variant="secondary" size="sm" onclick={() => retry++}>Retry race history</Button></Banner>
  {:else if !entries.length}<p class="state">No race history is available for this Veteran.</p>
  {:else if viewMode === 'grid'}<div class="calendar"><RaceSchedule years={schedule} label={`${charName} race history`}/></div>
  {:else}<div class="race-list">{#each entries as entry (`${entry.year}:${entry.month}:${entry.half}:${entry.raceInstanceId}`)}<article><time>{entry.yearLabel}<small>{entry.turnLabel}</small></time><span class:won={entry.won} class:second={entry.position === 2} class:third={entry.position === 3} class="position"><Icon name="trophy" size={14}/>{entry.position}{entry.position === 1 ? 'st' : entry.position === 2 ? 'nd' : entry.position === 3 ? 'rd' : 'th'}</span><RaceBadge race={entry} compact/><strong>{entry.name}</strong></article>{/each}</div>{/if}
</Dialog>

<style>
  .race-toolbar{min-height:44px;display:flex;align-items:center;gap:8px;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--border-subtle)}.character{min-width:0;display:flex;align-items:center;gap:7px;margin-right:auto}.character>span{min-width:0;display:grid}.character strong{font-size:11px}.character small{color:var(--text-secondary);font-size:9px}.view-toggle{display:flex;border:1px solid var(--border-primary);background:var(--surface-2)}.view-toggle button,.export{min-width:34px;min-height:34px;display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:0 8px;border:0;background:transparent;color:var(--text-secondary);cursor:pointer}.view-toggle button+button{border-left:1px solid var(--border-subtle)}.view-toggle button.active{background:rgb(var(--accent-primary-rgb)/.14);color:var(--accent-primary)}.export{border:1px solid var(--border-primary);font-size:9px;font-weight:700}.export:disabled{opacity:.4}.calendar{max-height:65dvh;overflow:auto}.race-list{display:grid}.race-list article{min-width:0;min-height:42px;display:grid;grid-template-columns:106px 45px 100px minmax(0,1fr);align-items:center;gap:7px;padding:5px;border-bottom:1px solid var(--border-subtle)}.race-list time{display:grid;color:var(--text-secondary);font-size:9px}.race-list time small{font-size:8px}.position{display:flex;align-items:center;gap:3px;color:var(--text-secondary);font-size:9px;font-weight:800}.position.won{color:#ffd54f}.position.second{color:#c7d0d9}.position.third{color:#cd8b62}.race-list strong{overflow:hidden;font-size:10px;text-overflow:ellipsis;white-space:nowrap}.state{padding:20px;color:var(--text-secondary);text-align:center}
  @media(max-width:600px){.race-toolbar{gap:4px}.export span{display:none}.race-list article{grid-template-columns:78px 39px 82px minmax(0,1fr);gap:4px;padding-inline:2px}.race-list strong{font-size:9px}}
  @media(pointer: coarse) and (max-width: 1300px){.view-toggle button,.export{min-width:var(--touch-target);min-height:var(--touch-target)}}
</style>

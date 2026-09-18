<script lang="ts">
  import { onMount } from 'svelte';
  import { loadRaceSaddleIndex, loadRaceSchedule } from '../../catalog/race-catalog';
  import Banner from '../../ui/Banner.svelte';
  import Button from '../../ui/Button.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import RaceSchedule from '../../ui/RaceSchedule.svelte';
  import TextField from '../../ui/TextField.svelte';
  import type { RaceScheduleYear } from '../../ui/race-types';
  interface Props { open?: boolean; charName?: string; winSaddleIds: number[]; onconfirm: (wins: number[]) => void; }
  let { open = $bindable(false), charName, winSaddleIds, onconfirm }: Props = $props();
  const id = $props.id();
  let draft = $state<number[]>([]);
  let query = $state('');
  let races = $state<RaceScheduleYear[]>([]);
  let saddles = $state(new Map<number, number[]>());
  let loading = $state(false);
  let error = $state('');
  const choices = $derived(races.map(year => ({...year,slots:year.slots.map(slot => ({...slot,races:slot.races.filter(race => race.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))}))})));
  const selected = $derived([...saddles].filter(([,ids]) => ids.length && ids.every(saddle => draft.includes(saddle))).map(([race]) => String(race)));
  async function load(): Promise<void> {
    if (loading) return;
    loading = true; error = '';
    try { [races,saddles] = await Promise.all([loadRaceSchedule(),loadRaceSaddleIndex()]); }
    catch { error = 'Race data could not be loaded. Your selection has not been changed.'; }
    finally { loading = false; }
  }
  onMount(() => { draft = [...winSaddleIds]; void load(); });
</script>

<Dialog bind:open title="Select Race Wins" description={charName} maxWidth="1100px" maxHeight="85dvh" mobileInset="16px">
  <TextField id={`${id}-search`} label="Search races" bind:value={query} type="search"/>
  {#if loading}<p>Loading races…</p>{:else if error}<Banner tone="danger" title="Race data unavailable"><p>{error}</p><Button onclick={load}>Retry</Button></Banner>{:else}
    <div class="race-calendar"><RaceSchedule years={choices} selectable selectedIds={selected} onselect={(race) => {
      const ids = saddles.get(Number(race.id)) ?? [];
      draft = ids.every(saddle => draft.includes(saddle)) ? draft.filter(saddle => !ids.includes(saddle)) : [...new Set([...draft,...ids])];
    }}/></div>
  {/if}
  {#snippet actions()}<span>{selected.length} race{selected.length === 1 ? '' : 's'} selected</span><Button disabled={loading || !!error} icon="check" onclick={() => { onconfirm([...draft]); open = false; }}>Confirm</Button>{/snippet}
</Dialog>

<style>
  .race-calendar{min-width:0;margin-top:10px}p{color:var(--text-muted)}
</style>

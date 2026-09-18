<script lang="ts">
  import type { ProfileVeteran } from './profile-repository';
  import type { VeteranUiRecord } from '@/components/veteran-ui-types';
  import type { LineageBranch, LineageNodeData } from '@/components/lineage-types';
  import type { SkillCatalogEntry } from '@/lib/catalog/skill-catalog';
  import { loadRaceHistory, type RaceHistoryEntry } from '@/lib/catalog/race-catalog';
  import Dialog from '@/components/Dialog.svelte';
  import ProfileVeteranIdentity from './ProfileVeteranIdentity.svelte';
  import ProfileVeteranDetails from './ProfileVeteranDetails.svelte';
  import RaceResultsDialog from '@/pages/database/RaceResultsDialog.svelte';

  let { veteran, summary, skillCatalog, family, open = $bindable(false) }: {
    veteran: ProfileVeteran; summary: VeteranUiRecord; skillCatalog: Map<number, SkillCatalogEntry>;
    family?: { root: LineageNodeData; branches: LineageBranch[] }; open?: boolean;
  } = $props();
  const id = $props.id();
  const lineage = $derived(family ?? { root: { id: summary.id, name: summary.name, image: summary.image, role: 'main' as const, roleLabel: 'Main', sparks: summary.sparks }, branches: [] });
  let races = $state<RaceHistoryEntry[]>([]), raceLoading = $state(false), raceError = $state(''), scheduleOpen = $state(false);
  $effect(() => {
    if (!open) { scheduleOpen = false; return; }
    let active = true;
    races = []; raceError = ''; raceLoading = true;
    void loadRaceHistory(veteran.win_saddle_id_array ?? [], veteran.race_results ?? [])
      .then(entries => { if (active) races = entries; })
      .catch(() => { if (active) raceError = 'Race history could not be loaded.'; })
      .finally(() => { if (active) raceLoading = false; });
    return () => { active = false; };
  });
  function openPlanner() {
    try { localStorage.setItem('planner_transfer', JSON.stringify({ veteran, veteranPosition: 'p1', targetCharaId:summary.affinityTarget?.id })); } catch { /* Legacy transfer is best effort. */ }
    window.open('/tools/lineage-planner?from=profile', '_blank', 'noopener');
  }
</script>

<Dialog {id} bind:open title={summary.name} description={[summary.scenario, summary.detail, veteran.rarity ? '★'.repeat(Math.max(0, Math.min(5, veteran.rarity))) : ''].filter(Boolean).join(' · ')} maxWidth="800px" maxHeight="min(90dvh, 850px)" mobileMaxHeight="calc(100dvh - 32px)" mobileInset="16px" contentPadding="16px" mobileContentPadding="12px">
  {#snippet headerIdentity(titleId,descriptionId)}<ProfileVeteranIdentity {summary} rarity={veteran.rarity} score={veteran.rank_score} heading="h2" {titleId} {descriptionId}/>{/snippet}
  {#if open}{#key veteran}
    <ProfileVeteranDetails {veteran} {summary} {skillCatalog} family={lineage} {races} {raceLoading} {raceError} onplanner={openPlanner} onschedule={() => scheduleOpen = true}/>
  {/key}{/if}
</Dialog>
<RaceResultsDialog bind:open={scheduleOpen} charId={veteran.card_id ?? 0} charName={summary.name} charImage={summary.image} winSaddleIds={veteran.win_saddle_id_array ?? []} runRaceIds={veteran.race_results ?? []}/>

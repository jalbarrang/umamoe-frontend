<script lang="ts">
  import { onMount } from 'svelte';
  import { loadSupportCardCatalog, supportCardImagePath, type SupportCardCatalogEntry } from '@/lib/catalog/support-card-catalog';
  import { supportTypeName } from '@/lib/supports/support-card';
  import { veteranSupportCards } from '@/lib/veterans/veteran-profile';
  import LimitBreak from '@/components/LimitBreak.svelte';
  import Icon from '@/components/Icon.svelte';
  import Artwork from '@/components/Artwork.svelte';
  import type { ProfileVeteran } from './profile-repository';
  import type { VeteranUiRecord } from '@/components/veteran-ui-types';
  import type { LineageBranch, LineageNodeData } from '@/components/lineage-types';
  import type { RaceHistoryEntry } from '@/lib/catalog/race-catalog';
  import { encodedSkills, resolveVeteranFactors, veteranFactorTotals } from '@/lib/profile/profile-veterans';
  import { resolveEncodedSkill, skillImage, skillRarity, skillPointTotal, sortEncodedSkills, type SkillCatalogEntry } from '@/lib/catalog/skill-catalog';
  import ProfileVeteranAffinity from './ProfileVeteranAffinity.svelte';
  import StatStrip from '@/components/StatStrip.svelte';
  import AptitudeGrid from '@/components/AptitudeGrid.svelte';
  import SkillChip from '@/components/SkillChip.svelte';
  import SparkItem from '@/components/SparkItem.svelte';
  import RadioGroup from '@/components/RadioGroup.svelte';
  import { totalStats } from '@/lib/profile/profile-display';
  import Button from '@/components/Button.svelte';
  import Banner from '@/components/Banner.svelte';
  import LineageTree from '@/components/LineageTree.svelte';

  let { veteran, summary, skillCatalog, family, races, raceLoading, raceError, onplanner, onschedule }: {
    veteran: ProfileVeteran; summary: VeteranUiRecord; skillCatalog: Map<number,SkillCatalogEntry>;
    family: {root:LineageNodeData;branches:LineageBranch[]}; races: RaceHistoryEntry[];
    raceLoading: boolean; raceError: string; onplanner: () => void; onschedule: () => void;
  } = $props();
  let sparkSource=$state('family');
  let supportCatalog=$state<readonly SupportCardCatalogEntry[]>([]);
  let supportError=$state('');
  const supportDeck=$derived(veteranSupportCards(veteran));
  onMount(() => {
    let active=true;
    if (supportDeck.length) void loadSupportCardCatalog().then(cards => { if(active) supportCatalog=cards; }).catch(() => { if(active) supportError='Support names are unavailable; recorded card IDs are shown.'; });
    return () => { active=false; };
  });
  let sparkSection: HTMLElement;
  const lineageId=$props.id();
  const selectedFamilyId=$derived(sparkSource === 'family' ? undefined : sparkSource === 'main' ? family.root.id : family.branches.flatMap(branch => [branch.parent,...branch.grandparents]).find(node => node.id.split(':').pop() === sparkSource)?.id);
  const stats=$derived((summary.stats ?? []).filter(stat => stat.id !== 'total'));
  const skills=$derived(sortEncodedSkills(skillCatalog,encodedSkills(veteran)).map(id => ({id,...resolveEncodedSkill(skillCatalog,id)})));
  const spTotal=$derived(skillPointTotal(skillCatalog,encodedSkills(veteran)));
  const ownSources=$derived([
    {value:'family',label:'Combined',description:'Own + P1 + P2'},
    {value:'main',label:summary.name,shortLabel:'Own',description:'This veteran',image:summary.image}
  ]);
  const branchSources=$derived(family.branches.map(({parent,grandparents})=>({
    id:parent.id,
    label:'Parent '+parent.roleLabel.slice(1),
    options:[
      {value:parent.id.split(':').pop()!,label:parent.name,shortLabel:parent.roleLabel,description:'Parent '+parent.roleLabel.slice(1),image:parent.image},
      ...grandparents.map(node=>({value:node.id.split(':').pop()!,label:node.name,shortLabel:'GP'+node.roleLabel.split(' ').pop()!,description:node.roleLabel.replace(' legacy ',' · Grandparent '),image:node.image}))
    ]
  })));
  const selectedSparkSource=$derived([...ownSources,...branchSources.flatMap(branch=>branch.options)].find(source=>source.value===sparkSource));
  const sourceNode=$derived(sparkSource === 'main' ? veteran : veteran.succession_chara_array?.find(node => String(node.position_id) === sparkSource));
  const sparks=$derived(sparkSource === 'family' ? veteranFactorTotals(veteran) : sourceNode ? resolveVeteranFactors(sourceNode) : []);
  const sortedSparks=$derived(sparks.toSorted((a,b) => ['blue','pink','green','white'].indexOf(a.tone)-['blue','pink','green','white'].indexOf(b.tone) || a.name.localeCompare(b.name)));
  const contributions=$derived([veteran,...[10,20].map(position => veteran.succession_chara_array?.find(node => node.position_id === position))].map(node => {
    const levels=new Map<number,number>();
    for(const factor of node ? resolveVeteranFactors(node) : []) levels.set(factor.id,(levels.get(factor.id) ?? 0)+factor.level);
    return levels;
  }));
  const created=$derived(veteran.creation_time && Number.isFinite(Date.parse(veteran.creation_time)) ? new Date(veteran.creation_time).toLocaleDateString() : '');
  function inspectFamily(node:LineageNodeData) {
    sparkSource=node.role === 'main' ? 'main' : node.id.split(':').pop()!;
    sparkSection?.scrollIntoView({block:'start'}); sparkSection?.focus({preventScroll:true});
  }
</script>

<div class="veteran-details">
  <section class="stat-overview" aria-label="Stats and totals">
    <header><h3>Stats</h3><dl class="totals"><div><dt>Total Stats</dt><dd>{totalStats(veteran).toLocaleString()}</dd></div><div title="Base cost of learned skills including prerequisites, before hint discounts"><dt>SP total</dt><dd>{spTotal?.toLocaleString() ?? '—'}</dd></div></dl></header>
    <StatStrip items={stats} label="Displayed stats" presentation="inline" framed/>
  </section>
  <div class="compact-overview">
    <section class="aptitudes" aria-label="Aptitudes"><h3>Aptitudes</h3><AptitudeGrid items={summary.aptitudes ?? []} compact stretch gradeFirst/></section>
    <section class="affinity-overview" aria-label="Veteran affinity"><h3>Affinity{#if summary.affinityTarget}<small>For {summary.affinityTarget.name}</small>{/if}</h3><ProfileVeteranAffinity {summary}/></section>
  </div>
  <section class="support-section" aria-label="Training support cards">
    <header><h3>Support deck <span>{supportDeck.length}</span></h3></header>
    {#if supportDeck.length}
      <ul class="support-deck">{#each supportDeck as support}
        {@const id=support.support_card_id}
        {@const card=supportCatalog.find(card => Number(card.id) === id)}
        {@const type=card ? card.type === 'group' ? 'Group' : supportTypeName(card.type) : undefined}
        <li title={card ? `${card.name} · ${supportTypeName(card.type)}` : `Support card ${id}`}>
          <Artwork src={supportCardImagePath(id)} fallbackSrc="/assets/images/placeholder-card.webp" alt={card?.name ?? `Support card ${id}`} kind="card" size="sm"/>
          <span class="support-name">{#if type}<span class="support-type" title={type+' support'}>{#if type === 'Friend' || type === 'Group'}<span role="img" aria-label={type+' support'}><Icon name={type === 'Group' ? 'community' : 'user'} size={16}/></span>{:else}<img src={'/assets/images/icon/stats/'+type.toLowerCase()+'.webp'} alt={type+' support'} width="16" height="16"/>{/if}</span>{/if}{card?.name ?? 'Card '+id}</span>
          <div class="support-meta">
            {#if card && [1,2,3].includes(card.rarity)}{@const rarity=card.rarity === 3 ? 'SSR' : card.rarity === 2 ? 'SR' : 'R'}<img class="support-rarity" src={'/game-assets/support-rarity/'+rarity.toLowerCase()+'.png'} alt={rarity} width="18" height="18"/>{/if}
            <span class="support-lb"><LimitBreak value={support.limit_break_count}/></span>
          </div>
        </li>
      {/each}</ul>
      {#if supportError}<p role="status">{supportError}</p>{/if}
    {:else}<p>No support cards recorded.</p>{/if}
  </section>
  <section class="spark-section" aria-label="Inheritance sparks" tabindex="-1" bind:this={sparkSection}>
    <header class="spark-header">
      <h3>Sparks <span>{sparks.length}</span></h3>
      <p class="source-name" title={sparkSource==='family' ? 'Combined stars from this veteran and both parents.' : selectedSparkSource?.label+' · '+selectedSparkSource?.description}>{#if sparkSource==='family'}Own + P1 + P2{:else}{selectedSparkSource?.label}<span>{' · '+selectedSparkSource?.description}</span>{/if}</p>
    </header>
    <div class="spark-sources" role="group" aria-label="Show sparks from">
      <div class="own-sources"><RadioGroup id={lineageId+'-spark-runner'} legend="Veteran" options={ownSources} bind:value={sparkSource} cards compact/></div>
      {#each branchSources as branch (branch.id)}<div class="branch-sources"><RadioGroup id={lineageId+'-spark-runner'} legend={branch.label} options={branch.options} bind:value={sparkSource} cards compact/></div>{/each}
    </div>
    <div class="spark-list" role="region" aria-label="All inheritance sparks">
      {#each ['blue','pink','green','white'] as tone}
        {@const group=sortedSparks.filter(factor=>factor.tone === tone)}
        {#if group.length}<div class="spark-group" data-tone={tone} role="list" aria-label={tone+' sparks'}>{#each group as factor}
          {@const contribution=sparkSource === 'family' ? factor.name+': '+factor.level+' stars total. Main '+(contributions[0]?.get(factor.id) ?? 0)+', P1 '+(contributions[1]?.get(factor.id) ?? 0)+', P2 '+(contributions[2]?.get(factor.id) ?? 0)+'.' : factor.name+': '+factor.level+' stars.'}
          <span class="spark-token" role="listitem" aria-label={contribution} title={contribution}><SparkItem name={factor.name} level={factor.level} tone={factor.tone} title={contribution} mainStars={sparkSource === 'family' ? contributions[0]?.get(factor.id) ?? 0 : 0} compact/></span>
        {/each}</div>{/if}
      {/each}
      {#if !sparks.length}<p>No sparks recorded for this source.</p>{/if}
    </div>
  </section>
  <section class="skills-section" aria-label="Learned skills">
    <header><h3>Learned skills <span>{skills.length}</span></h3></header>
    <div class="skill-list" role="region" aria-label="Learned skill list">{#each skills as resolved}<span class="learned-skill" title={resolved.skill?.effect || resolved.skill?.description}><SkillChip name={resolved.skill?.name ?? 'Skill '+resolved.id} icon={skillImage(resolved.skill?.icon)} level={'Lv.'+resolved.level} rarity={skillRarity(resolved.skill,resolved.inherited)} compact/></span>{/each}{#if !skills.length}<p>No learned skills recorded.</p>{/if}</div>
  </section>
  <section class="race-section" aria-label="Race history">
    <header><h3>Race History <span>{races.length || ''}</span></h3><Button variant="secondary" size="sm" icon="calendar" disabled={raceLoading} onclick={onschedule}>Full Schedule</Button></header>
    {#if raceError}<Banner title={raceError} tone="danger"/>{:else if raceLoading}<p>Resolving race history…</p>{:else if races.length}
      <div class="race-list" role="region" aria-label="Recorded races">{#each races as race}<span class="race grade-{race.grade.toLowerCase()}"><b>{race.grade}</b><span>{race.shortName ?? race.name}</span></span>{/each}</div>
    {:else}<p>No races recorded.</p>{/if}
  </section>
  {#if family.branches.length}<section class="family-section" aria-label="Family lineage">
    <header><h3><Icon name="lineage" size={16}/>Lineage</h3><Button variant="secondary" size="sm" icon="external" onclick={onplanner}>Open Planner</Button></header>
    <LineageTree compact root={family.root} branches={family.branches} selectedId={selectedFamilyId} onselect={inspectFamily}/>
  </section>{/if}
  {#if veteran.fans != null || created || veteran.team_rating != null}<footer>{#if veteran.fans != null}<span>{veteran.fans.toLocaleString()} fans</span>{/if}{#if veteran.team_rating != null}<span>Team rating {veteran.team_rating.toLocaleString()}</span>{/if}{#if created}<span>Trained {created}</span>{/if}</footer>{/if}
</div>
<style>
  .veteran-details { min-width:0; display:grid; gap:10px; }
  h3 { display:flex; align-items:center; gap:5px; margin:0; font-size:13px; font-weight:600; color:var(--color-text); }h3>span { color:var(--text-secondary); font-size:11px; font-weight:400; }
  p { margin:0; color:var(--color-text-muted); font-size:11px; line-height:1.5; }header { display:flex; align-items:center; justify-content:space-between; gap:8px; min-width:0; }
  .stat-overview { display:grid; gap:8px; min-width:0; }
  .totals { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:4px 14px; margin:0; font-size:11px; }.totals>div { display:flex; white-space:nowrap; gap:5px; align-items:baseline; }dt { color:var(--text-secondary); }dd { margin:0; color:var(--text-primary); font-size:12px; font-weight:600; font-variant-numeric:tabular-nums; }
  .compact-overview { display:grid; grid-template-columns:minmax(0,1.3fr) minmax(0,1fr); gap:12px; min-width:0; }.aptitudes,.affinity-overview { min-width:0; display:grid; grid-template-rows:auto minmax(0,1fr); gap:8px; }
  .affinity-overview :global(.affinity-sources) { height:100%; }
  .affinity-overview h3 { display:flex; flex-wrap:wrap; justify-content:space-between; gap:4px; }.affinity-overview h3 small { font-size:10px; font-weight:400; color:var(--color-text-muted); }
  .support-section { min-width:0; display:grid; gap:8px; }
  .support-deck { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:6px; margin:0; padding:0; list-style:none; }
  .support-deck li { min-width:0; display:grid; grid-template-columns:44px minmax(0,1fr); align-content:center; align-items:center; gap:3px 8px; padding:7px; border:1px solid var(--card-surface-border); border-radius:var(--radius-md); background:var(--card-surface-bg); }
  .support-deck :global(.art) { grid-column:1; grid-row:1/3; width:44px; height:44px; border:0; }
  .support-deck li>span { grid-column:2; color:var(--text-primary); font-size:12px; font-weight:500; line-height:1.25; overflow-wrap:anywhere; }
  .support-name { display:flex; align-items:center; gap:5px; }.support-type { flex:none; display:inline-flex; color:var(--accent-primary); }.support-type img { display:block; object-fit:contain; }
  .support-meta { grid-column:2; display:flex; align-items:center; flex-wrap:wrap; gap:3px 5px; }.support-rarity { display:block; width:18px; height:18px; object-fit:contain; flex:none; }
  .support-lb { display:flex; align-items:center; gap:0; font-size:14px; line-height:1; }
  .spark-section,.skills-section,.race-section { display:grid; min-width:0; align-content:start; gap:8px; }
  .spark-section,.skills-section { padding-top:10px; border-top:1px solid var(--border-subtle); }
  .spark-section { container:spark-details / inline-size; gap:4px; padding-top:8px; }
  .spark-header h3 { flex:none; }
  .spark-sources { display:grid; grid-template-columns:minmax(94px,2fr) repeat(2,minmax(96px,3fr)); align-items:end; gap:6px 8px; min-width:0; padding-bottom:4px; }.spark-sources :global(legend) { margin-bottom:2px; font-size:10px; }.own-sources :global(.options) { display:flex; }.own-sources :global(label:first-child) { min-width:56px; flex:1; }.own-sources :global(label:last-child) { min-width:32px; flex:1; }
  @container spark-details (max-width:310px) { .spark-sources { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); }.own-sources { grid-column:1/-1; } }
  .source-name { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:right; }.source-name span { color:var(--color-text-subtle); }
  .race-section { padding-top:10px; border-top:1px solid var(--border-subtle); }
  .spark-list { display:flex; flex-wrap:wrap; align-content:start; gap:5px; padding:1px; }.spark-group { min-width:0; display:flex; flex-wrap:wrap; gap:5px; }.spark-group[data-tone='blue'],.spark-group[data-tone='pink'],.spark-group[data-tone='green'] { display:contents; }.spark-group[data-tone='white'] { flex-basis:100%; }.spark-token { min-width:0; max-width:100%; display:flex; }.spark-token :global(.spark) { min-height:24px; padding:4px 6px; border-radius:4px; border-color:rgb(var(--spark-rgb)/.3); font-size:12px; }.spark-token :global(.name) { white-space:normal; overflow:visible; overflow-wrap:anywhere; line-height:1.25; }
  .skill-list { min-width:0; display:flex; align-content:start; flex-wrap:wrap; gap:5px; padding:1px; }.learned-skill { display:flex; min-width:0; max-width:100%; }.learned-skill :global(.skill-chip) { min-height:25px; font-size:11px; }.learned-skill :global(.skill-chip img) { width:25px; height:25px; }.learned-skill :global(.skill-body) { min-height:25px; }.learned-skill :global(.skill-name) { white-space:normal; overflow:visible; overflow-wrap:anywhere; }.learned-skill :global(.skill-level) { font-size:10px; }
  .race-list { display:flex; flex-wrap:wrap; gap:5px; }.race { display:inline-flex; align-items:center; gap:5px; padding:4px 6px; border:1px solid var(--border-subtle); border-radius:4px; font-size:11px; }.race b { font-size:9px; color:var(--color-text-muted); }.grade-g1 b { color:var(--race-g1); }.grade-g2 b { color:var(--race-g2); }.grade-g3 b { color:var(--race-g3); }
  .family-section { min-width:0; display:grid; gap:6px; border-top:1px solid var(--border-subtle); padding-top:8px; }.family-section h3 :global(svg) { color:var(--color-accent); }
  footer { display:flex; flex-wrap:wrap; gap:6px 12px; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--color-text-muted); font-size:10px; }
  :focus-visible { outline:2px solid var(--color-accent); outline-offset:2px; }

  @media(max-width:650px) {
    .compact-overview { grid-template-columns:1fr; gap:12px; }
    .support-deck { grid-template-columns:repeat(2,minmax(0,1fr)); }.support-deck li { grid-template-columns:36px minmax(0,1fr); gap:3px 6px; padding:6px; }.support-deck :global(.art) { width:36px; height:36px; }.support-deck li>span { font-size:11px; }
    .support-rarity { width:16px; height:16px; }.support-lb { font-size:12px; }
    .spark-token :global(.spark) { font-size:11px; }
  }
</style>

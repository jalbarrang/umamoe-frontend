<script lang="ts">
  import { totalStats } from '@/lib/profile/profile-display';
  import type { ProfileVeteran } from './profile-repository';
  import type { VeteranUiRecord } from '@/components/veteran-ui-types';
  import { encodedSkills, veteranBaseStat, veteranFactorTotals, type VeteranFactorFilter, type ResolvedVeteranFactor } from '@/lib/profile/profile-veterans';
  import { resolveEncodedSkill, skillPointTotal, skillImage, skillRarity, sortEncodedSkills, type SkillCatalogEntry } from '@/lib/catalog/skill-catalog';
  import Icon from '@/components/Icon.svelte';
  import ProfileVeteranAffinity from './ProfileVeteranAffinity.svelte';
  import Badge from '@/components/Badge.svelte';
  import ProfileVeteranIdentity from './ProfileVeteranIdentity.svelte';
  import StatStrip from '@/components/StatStrip.svelte';
  import AptitudeGrid from '@/components/AptitudeGrid.svelte';
  import InspectPopover from '@/components/InspectPopover.svelte';
  import TextField from '@/components/TextField.svelte';
  import SparkItem from '@/components/SparkItem.svelte';
  import SkillChip from '@/components/SkillChip.svelte';
  import ProfileVeteranQueryMatches from './ProfileVeteranQueryMatches.svelte';
  import type { VeteranQueryMatch } from '@/lib/profile/profile-veteran-query';

  let { veteran, summary, skillCatalog, baseStats = false, mood = 0, selectedFactors = [], selectedSkills = [], queryMatches = [], statsOnly = false, onfactor, onskill, ondetails }: {
    veteran: ProfileVeteran; summary: VeteranUiRecord; skillCatalog: Map<number,SkillCatalogEntry>;
    baseStats?: boolean; mood?: number; selectedFactors?: VeteranFactorFilter[]; selectedSkills?: number[]; statsOnly?: boolean;
    queryMatches?: VeteranQueryMatch[];
    onfactor?: (filter: VeteranFactorFilter) => void; onskill?: (id:number) => void; ondetails?: () => void;
  } = $props();
  type CardSpark = ResolvedVeteranFactor & { ownStars?: number };
  const id = $props.id();
  let sparkSearch = $state('');
  const skills = $derived(sortEncodedSkills(skillCatalog,encodedSkills(veteran)));
  const sparks = $derived(veteranFactorTotals(veteran));
  const stats = $derived((summary.stats ?? []).filter(stat => stat.id !== 'total').map(stat => {
    if (!baseStats) return stat;
    const value = veteranBaseStat(veteran[stat.id as 'speed'|'stamina'|'power'|'guts'|'wiz'],mood);
    return {...stat,value:value?.toLocaleString(undefined,{maximumFractionDigits:1}) ?? '—'};
  }));
  const statTotal = $derived(baseStats ? (['speed','stamina','power','guts','wiz'] as const).reduce((sum,key) => sum + (veteranBaseStat(veteran[key],mood) ?? 0),0) : totalStats(veteran));
  const spTotal = $derived(skillPointTotal(skillCatalog,encodedSkills(veteran)));
  const created = $derived(veteran.creation_time && Number.isFinite(Date.parse(veteran.creation_time)) ? new Date(veteran.creation_time).toLocaleDateString() : '');
  function openDetails(event: MouseEvent) {
    (event.currentTarget as HTMLButtonElement).focus({preventScroll:true});
    ondetails?.();
  }
</script>

{#snippet identity()}
  <ProfileVeteranIdentity {summary} rarity={veteran.rarity} score={veteran.rank_score}/>
{/snippet}

<article class="veteran-card" class:stats-only={statsOnly} aria-label={`${summary.name} ${statsOnly ? 'stadium runner' : 'veteran'}`}>
  <div class="card-heading">
  {#if ondetails}<button class="card-open" aria-label={`View ${summary.name} details`} onclick={openDetails}>{@render identity()}</button>{:else}<div class="card-open">{@render identity()}</div>{/if}
  {#if summary.labels?.length || summary.stickers?.length}<div class="card-annotations" aria-label="Card labels and stickers">
    {#each summary.labels ?? [] as label}<Badge>{label}</Badge>{/each}
    {#each summary.stickers ?? [] as sticker}<img class="sticker" src={sticker.image} alt={sticker.name} title={sticker.name} loading="lazy"/>{/each}
  </div>{/if}
  </div>

  <div class="card-body">
    <div class="card-stats"><StatStrip items={stats} label={baseStats ? 'Base stats' : 'Displayed stats'} presentation="inline"/></div>
    {#if summary.aptitudes?.length}<div class="card-aptitudes"><AptitudeGrid items={summary.aptitudes} compact stretch gradeFirst/></div>{/if}

    {#if !statsOnly}<section class="card-affinity" aria-label="Veteran affinity">
      <header title={summary.affinityNote}><h4>Affinity</h4>{#if summary.affinityTarget}<small>For {summary.affinityTarget.name}</small>{/if}</header>
      <ProfileVeteranAffinity {summary}/>
    </section>

    <section class="sparks" aria-label="Family spark totals">
      <header><h4>Combined sparks</h4><span>Own + P1 + P2</span></header>
      {@render sparkList(sparks)}
      {#if !sparks.length}<small>No sparks recorded.</small>{/if}
    </section>

    {/if}
    {#if skills.length}<section class="learned-skills">
      <header><h4>Learned skills <span class="count">{skills.length}</span></h4></header>
      <div class="skill-list">{#each skills as skillId}
        {@const resolved = resolveEncodedSkill(skillCatalog,skillId)}
        {@const id = resolved.skill?.skill_id ?? Math.floor(skillId / 10)}
        {#snippet chip()}<SkillChip name={resolved.skill?.name ?? `Skill ${id}`} icon={skillImage(resolved.skill?.icon)} level={`Lv.${resolved.level}`} rarity={skillRarity(resolved.skill,resolved.inherited)} compact/>{/snippet}
        {#if onskill}<button class="skill-filter" class:matched={selectedSkills.includes(id)} aria-label={`Filter by learned skill ${resolved.skill?.name ?? id}`} onclick={() => onskill?.(id)}>{@render chip()}</button>{:else}<span class="skill-filter">{@render chip()}</span>{/if}
      {/each}</div>
    </section>{/if}
    <ProfileVeteranQueryMatches matches={queryMatches}/>
  </div>
  <footer><span class="stat-total">{statTotal.toLocaleString(undefined,{maximumFractionDigits:1})} Total Stats</span><span class="sp-total" title="Base cost of learned skills including prerequisites, before hint discounts">{spTotal?.toLocaleString() ?? '—'} SP total</span>{#if veteran.fans != null}<span>{veteran.fans.toLocaleString()} fans</span>{:else if created}<span>{created}</span>{/if}{#if ondetails}<button class="text-action" onclick={openDetails}>Details <Icon name="arrow-right" size={12}/></button>{/if}</footer>
</article>


{#snippet sparkButton(factor:CardSpark)}
  {@const matched=selectedFactors.some(filter => filter.factorId === factor.id) || queryMatches.some(match=>match.factor?.id===factor.id && match.factor.level>0)}
  {#snippet spark()}<SparkItem {matched} name={factor.name} level={factor.level} tone={factor.tone} mainStars={factor.ownStars ?? 0} compact/>{/snippet}
  {#if onfactor}<button class="spark-filter" class:matched aria-label={`Filter by ${factor.name}: ${factor.level} stars (family total)`} onclick={() => onfactor?.({factorId:factor.id,minLevel:factor.level,scope:'family',mode:'total'})}>{@render spark()}</button>{:else}<span class="spark-filter">{@render spark()}</span>{/if}
{/snippet}

{#snippet sparkList(items:CardSpark[])}
  {@const white = items.filter(factor => factor.tone === 'white')}
  <div class="spark-groups">
    {#each ['blue','pink','green','white'] as tone}
      {@const group = items.filter(factor => factor.tone === tone && (tone !== 'white' || white.length <= 3 || selectedFactors.some(filter => filter.factorId === factor.id) || queryMatches.some(match=>match.factor?.id===factor.id && match.factor.level>0)))}
      {#if group.length}<div class="spark-group" data-tone={tone}>{#each group as factor}{@render sparkButton(factor)}{/each}</div>{/if}
    {/each}
    {#if white.length > 3}<div class="spark-summary">
      <InspectPopover label="View family white sparks" onopenchange={open => {if(open) sparkSearch='';}}>
        {#snippet trigger()}<span class="white-count"><span>★</span><strong>{white.length}</strong> white <Icon name="chevron" size={12}/></span>{/snippet}
          {@const results = white.filter(factor => factor.name.toLocaleLowerCase().includes(sparkSearch.trim().toLocaleLowerCase()))}
        <div class="white-browser">
          <header><h4>Own + P1 + P2</h4><span>{white.length} white sparks</span></header>
          <TextField id={id + '-white'} label="Search white sparks" hideLabel prefixIcon="search" type="search" placeholder="Find a skill or race…" bind:value={sparkSearch}/>
          <div class="white-list">{#each results as factor}{@render sparkButton(factor)}{/each}{#if !results.length}<p>No matching sparks.</p>{/if}</div>
          <small>{results.length} of {white.length} · Click a spark to filter</small>
        </div>
      </InspectPopover>
    </div>{/if}
  </div>
{/snippet}

<style>
  .veteran-card { min-width:0; display:flex; flex-direction:column; overflow:hidden; border:1px solid var(--border-primary); border-radius:10px; background:var(--card-surface-bg); container-type:inline-size; }
  .veteran-card:hover { border-color:var(--border-secondary); }
  .card-heading { border-bottom:1px solid var(--border-subtle); background:var(--surface-1); }
  .card-annotations { display:flex; flex-wrap:wrap; align-items:center; gap:4px; padding:0 12px 8px; }
  .card-annotations :global(.badge) { max-width:100%; min-height:20px; padding:3px 6px; font-size:10px; font-weight:500; line-height:1.2; overflow-wrap:anywhere; }
  .sticker { width:24px; height:24px; object-fit:contain; }
  .card-open { display:block; width:100%; padding:10px 12px; border:0; background:transparent; color:var(--color-text); text-align:left; cursor:pointer; }
  .card-open:not(button),.spark-filter:not(button),.skill-filter:not(button){cursor:default}
  .card-body { min-width:0; display:grid; gap:8px; padding:10px 12px; }
  .sparks,.learned-skills { min-width:0; display:grid; gap:5px; }
  header { display:flex; justify-content:space-between; align-items:center; gap:8px; }
  h4 { margin:0; color:var(--text-primary); font-size:10px; font-weight:600; }
  header>span,.count { color:var(--color-text-muted); font-size:10px; font-weight:400; }.count { margin-left:3px; }
  .spark-groups,.spark-group,.skill-list { min-width:0; display:flex; flex-wrap:wrap; gap:4px; }
  .spark-group[data-tone='white'] { flex-basis:100%; }
  .spark-filter,.skill-filter { max-width:100%; display:flex; align-items:center; min-height:24px; padding:0; border:0; border-radius:4px; background:transparent; color:inherit; text-align:left; cursor:pointer; }
  .spark-filter :global(.spark) { min-height:22px; padding:3px 5px; border-radius:4px; border-color:var(--spark-border-color,rgb(var(--spark-rgb)/.3)); font-size:11px; }
  .spark-filter :global(.name) { white-space:normal; overflow:visible; overflow-wrap:anywhere; line-height:1.2; }
  .spark-filter:hover :global(.spark) { border-color:var(--spark-border-color,currentColor); }
  .skill-filter.matched { outline:2px solid var(--color-accent); outline-offset:1px; }
  .spark-summary { --inspect-popover-width:350px; --inspect-popover-padding:12px; max-width:100%; }
  .spark-summary :global(.trigger) { min-width:0; min-height:24px; }
  .white-count { display:inline-flex; align-items:center; gap:4px; min-height:22px; padding:3px 6px; border:1px solid var(--border-secondary); border-radius:4px; color:var(--color-text-muted); background:var(--surface-2); font-size:11px; }
  .white-count strong { color:var(--color-text); font-weight:600; }
  .white-browser { display:grid; gap:10px; min-width:0; }.white-browser header { padding-right:28px; }.white-browser h4 { color:var(--color-text); font-size:12px; }
  .white-list { min-width:0; display:grid; gap:5px; max-height:min(300px,45dvh); overflow-y:auto; overscroll-behavior:contain; padding:2px; }
  .white-list .spark-filter { width:100%; min-height:28px; }.white-list :global(.spark) { width:100%; min-height:28px; padding:5px 7px; font-size:12px; }.white-list p { margin:8px; color:var(--color-text-muted); font-size:12px; }
  .card-affinity { display:grid; gap:6px; padding-bottom:8px; }
  .card-affinity header { display:flex; flex-wrap:wrap; justify-content:space-between; gap:4px; }.card-affinity header small { font-size:10px; color:var(--color-text-muted); }
  .skill-list { gap:4px; }.skill-filter:hover { filter:brightness(1.15); }
  .skill-filter :global(.skill-chip) { min-height:22px; font-size:10px; }
  .skill-filter :global(.skill-chip img) { width:22px; height:22px; }
  .skill-filter :global(.skill-body) { min-height:22px; }.skill-filter :global(.skill-name) { white-space:normal; overflow:visible; line-height:1.25; }
  footer { display:flex; align-items:center; flex-wrap:wrap; gap:8px; min-height:30px; margin-top:auto; padding:4px 12px; border-top:1px solid var(--border-subtle); color:var(--color-text-muted); font-size:10px; }
  .text-action { display:inline-flex; align-items:center; gap:5px; min-height:24px; margin-left:auto; padding:0; border:0; background:transparent; color:var(--color-accent); font-size:10px; cursor:pointer; }
  small { color:var(--color-text-muted); font-size:10px; }button:focus-visible { outline:2px solid var(--color-accent); outline-offset:1px; }.card-open:focus-visible { outline-offset:-2px; }
  @container(max-width:330px) { .card-open { padding:8px; }.card-body { padding:8px; }}
  @media(pointer: coarse) and (max-width: 1300px) { .spark-summary :global(.trigger) { min-height:32px; }.white-browser header { min-height:28px; padding-right:34px; }.spark-filter,.skill-filter,.text-action { min-height:32px; }.spark-groups,.spark-group,.skill-list { gap:5px; } }
</style>

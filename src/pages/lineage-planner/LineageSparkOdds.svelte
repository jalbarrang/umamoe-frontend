<script lang="ts">
  import { plannerNodeAffinity, plannerSkillSparks, plannerSparkChance, type PlannerAffinity, type PlannerNode, type PlannerPosition, type PlannerSpark } from '@/lib/lineage/planner';
  import { sparkMetrics } from '@/lib/inheritance/spark-probability';
  import Icon from '@/components/Icon.svelte';
  import Button from '@/components/Button.svelte';
  import Tabs from '@/components/Tabs.svelte';
  import LineageSkillCreation from './LineageSkillCreation.svelte';

  let { nodes, affinity, perRun = $bindable(false), tab = $bindable('base'), skillIcons = new Map<string, string>() }: {
    nodes: Record<PlannerPosition, PlannerNode>; affinity: PlannerAffinity | null; perRun?: boolean; tab?: string; skillIcons?: Map<string, string>;
  } = $props();
  const tabs = [{ id: 'base', label: 'Base Odds' }, { id: 'sources', label: 'Per Source' }, { id: 'combined', label: 'Combined' }, { id: 'skills', label: 'Skill Sparks' }];
  const groups = [
    { label: 'Stats', tone: 'blue', type: 0 }, { label: 'Aptitude', tone: 'pink', type: 1 },
    { label: 'Unique', tone: 'green', type: 5 }, { label: 'Race', tone: 'white', type: 2 },
    { label: 'Skill', tone: 'white', type: 3 }, { label: 'Scenario', tone: 'white', type: 4 }
  ];
  const positions: PlannerPosition[] = ['p1', 'p2', 'p1-1', 'p1-2', 'p2-1', 'p2-2'];
  const sources = $derived(affinity ? positions.filter(position => nodes[position].characterId != null).map(position => ({
    node: nodes[position], label: nodes[position].layer === 1 ? position.toUpperCase() : `GP${position.slice(1)}`, affinity: plannerNodeAffinity(affinity, position)
  })) : []);
  const summary = $derived(sources.flatMap(source => source.node.sparks.map(spark => ({ ...source, spark, chance: plannerSparkChance(spark, source.affinity, perRun) }))).sort((a, b) => b.chance - a.chance));
  const combined = $derived.by(() => {
    const byName = new Map<string, typeof summary>();
    for (const entry of summary) {
      const entries = byName.get(entry.spark.name) ?? [];
      entries.push(entry); byName.set(entry.spark.name, entries);
    }
    return [...byName.values()].map(entries => ({ spark: entries[0]!.spark, sources: entries, metrics: sparkMetrics(entries, perRun) })).sort((a, b) => b.metrics.expected - a.metrics.expected);
  });
  const skills = $derived(plannerSkillSparks(nodes));
  function groupFor(type: number) { return groups.find(group => group.type === type) ?? groups[4]!; }
  function base(spark: PlannerSpark) { return plannerSparkChance(spark, 0, false); }
  function chance(type: number, level: number, affinity: number, run = perRun) { return plannerSparkChance({ type, level, factorId: 0, name: '' }, affinity, run); }
</script>

<section class="odds-panel" aria-labelledby="spark-odds-title">
  <header><Icon name="star" size={17}/><h2 id="spark-odds-title">Spark Proc Odds</h2>{#if sources.length}<span class="mode" title={perRun ? 'Showing per-run chance (2 rolls)' : 'Showing per-inheritance chance'}><Button variant="secondary" size="sm" ariaPressed={perRun} onclick={() => perRun = !perRun}>{perRun ? 'Per Run' : 'Per Inh.'}</Button></span>{/if}</header>
  {#if !sources.length}<p class="empty">Add at least one parent to see spark inheritance odds</p>{:else}
    <Tabs items={tabs} bind:value={tab} variant="underline" label="Spark odds views"/>
    {#if tab === 'base'}
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable tables need keyboard focus for horizontal navigation.) -->
      <div class="odds-scroll desktop-base" role="region" aria-label="Base odds table" tabindex="0"><table class="odds-table" aria-label="Base spark inheritance odds"><thead>
        <tr class="group-row"><th rowspan="2" scope="col">Source / Base odds</th>{#each groups as group}<th colspan="3" scope="colgroup" data-tone={group.tone}>{group.label}</th>{/each}</tr>
        <tr class="base-row">{#each groups as group}{#each [1,2,3] as level}<th class:group-start={level === 1} data-tone={group.tone} scope="col" aria-label={`${group.label} ${level} star base chance`}>{chance(group.type, level, 0, false)}% <span>{level}★</span></th>{/each}{/each}</tr>
      </thead><tbody>{#each sources as source}<tr><th><span class="odds-source">{#if source.node.image}<img src={source.node.image} alt=""/>{/if}<span><b>{source.node.name}</b><small>♥ {source.affinity}</small></span></span></th>{#each groups as group}{#each [1,2,3] as level}<td data-tone={group.tone}>{chance(group.type, level, source.affinity).toFixed(2)}%</td>{/each}{/each}</tr>{/each}</tbody></table></div>
      <!-- svelte-ignore a11y_no_noninteractive_tabindex (Scrollable tables need keyboard focus for horizontal navigation.) -->
      <div class="odds-scroll mobile-base" role="region" aria-label="Base odds by character" tabindex="0"><table aria-label="Base spark inheritance odds by character"><thead><tr><th scope="col">Spark</th>{#each sources as source}<th scope="col" title={`${source.node.name} (${source.label}) ♥ ${source.affinity}`}>{#if source.node.image}<img src={source.node.image} alt={`${source.node.name} ♥ ${source.affinity}`}/>{/if}<span>{source.label}</span></th>{/each}</tr></thead><tbody>{#each groups as group}{#each [1,2,3] as level}<tr data-tone={group.tone} class:group-end={level === 3}><th scope="row">{#if level === 1}<small>{group.label}</small>{/if}{level}★</th>{#each sources as source}<td>{chance(group.type, level, source.affinity).toFixed(2)}%</td>{/each}</tr>{/each}{/each}</tbody></table></div>
    {:else if tab === 'sources'}
      <div class="summary-list">
        {#if summary.length}<div class="summary-row summary-header"><span class="sum-rank">#</span><span class="sum-spark">Spark</span><span class="sum-type">Type</span><span class="sum-base">Base</span><span class="sum-src">Source</span><span class="sum-chance-col">{perRun ? 'Per Run' : 'Per Inh.'}</span></div>{/if}
        {#each summary as item, index}<article class="summary-row" data-tone={groupFor(item.spark.type).tone}>
          <span class="sum-rank">{index + 1}</span><span class="sum-spark"><b class="sum-star">{item.spark.level}★</b><span class="sum-name">{item.spark.name}</span></span><span class="sum-type">{groupFor(item.spark.type).label}</span><span class="sum-base">{base(item.spark)}%</span>
          <span class="sum-src" title={`${item.node.name} (${item.label}) ♥ ${item.affinity}`}>{#if item.node.image}<img src={item.node.image} alt=""/>{/if}<span class="sum-src-name">{item.node.name}</span><span class="sum-src-chip">{item.label} ♥ {item.affinity}</span></span>
          <span class="sum-chance-col"><span class="meter"><i style:width={`${item.chance}%`}></i></span><strong class="sum-pct">{item.chance.toFixed(2)}%</strong></span>
        </article>{:else}<p class="empty">No sparks available. Add characters with factors to see spark summary.</p>{/each}
      </div>
    {:else if tab === 'combined'}
      <div class="summary-list">
        {#if combined.length}<div class="summary-row combined-row summary-header"><span class="sum-spark">Spark</span><span class="sum-type">Type</span><span class="sum-base">Base</span><span class="sum-sources">Sources</span><span class="sum-chance-col">Proc Chance</span><span class="sum-expected">Exp. Procs</span></div>{/if}
        {#each combined as item}<article class="summary-row combined-row" data-tone={groupFor(item.spark.type).tone}>
          <span class="sum-spark"><span class="sum-name">{item.spark.name}</span><small>×{item.sources.length}</small></span><span class="sum-type">{groupFor(item.spark.type).label}</span><span class="sum-base">{base(item.spark)}%</span>
          <span class="sum-sources">{#each item.sources as source}<span class="comb-source" title={`${source.node.name} (${source.label}) ${source.spark.level}★ ${source.chance}%`}>{#if source.node.image}<img src={source.node.image} alt={`${source.node.name} (${source.label})`}/>{/if}<b>{source.spark.level}★</b></span>{/each}</span>
          <span class="sum-chance-col"><span class="meter"><i style:width={`${item.metrics.chance}%`}></i></span><strong class="sum-pct">{item.metrics.chance.toFixed(2)}%</strong></span><strong class="sum-expected">{item.metrics.expected.toFixed(2)}x</strong>
        </article>{:else}<p class="empty">No sparks available.</p>{/each}
      </div>
    {:else}
      {#if skills.length}<p class="skill-note">Chance of developing spark when skill is learned during training</p><LineageSkillCreation {skills} {skillIcons}/>{:else}<p class="empty">No white sparks in lineage.</p>{/if}
    {/if}
  {/if}
</section>

<style>
  @media(pointer: coarse) and (max-width: 1300px),(max-width:767px){.mode :global(.ui-button){min-height:44px}}
  .odds-panel{container:spark-odds / inline-size;min-width:0;overflow:hidden;border:1px solid var(--card-surface-border);border-radius:var(--radius-lg);background:var(--card-surface-bg);box-shadow:var(--card-surface-shadow);margin-top:12px}
  header{display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border-primary)}header :global(svg){color:var(--accent-primary)}.mode{margin-left:auto}h2{margin:0;font-size:var(--font-md);font-weight:600;color:var(--text-secondary)}.empty{padding:32px 16px;margin:0;text-align:center;font-size:var(--font-sm);color:var(--text-disabled)}
  [data-tone='blue']{--spark-color:var(--accent-primary)}[data-tone='pink']{--spark-color:#f06292}[data-tone='green']{--spark-color:var(--accent-secondary)}[data-tone='white']{--spark-color:var(--text-muted)}
  .odds-scroll{overflow:auto;max-width:100%}.odds-scroll:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}.odds-table{width:100%;border-spacing:0;font-size:.75rem;font-variant-numeric:tabular-nums}.odds-table th,.odds-table td{text-align:center;padding:6px 8px;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);white-space:nowrap}.odds-table tbody td,.odds-table .base-row th{min-width:72px}.odds-table .group-row th:first-child,.odds-table tbody th{position:sticky;left:0;z-index:1;width:168px;min-width:168px;background:var(--bg-secondary);border-right:1px solid var(--border-primary)}.odds-table thead{background:var(--surface-2)}.odds-table [data-tone]{color:var(--spark-color);background:color-mix(in srgb,var(--spark-color) 5%,transparent)}.odds-table tbody td{font-weight:700}.odds-source{display:flex;align-items:center;gap:8px;padding:6px 8px;text-align:left}.odds-source img{width:28px;height:28px;flex:none;border-radius:50%;object-fit:cover}.odds-source span{min-width:0;display:grid;gap:2px}.odds-source b{max-width:132px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:var(--font-sm)}.odds-source small{color:#e91e63;font-size:var(--font-xs)}.mobile-base{display:none}
  .summary-list{overflow:auto}.summary-row{display:grid;grid-template-columns:24px minmax(130px,1.5fr) 68px 52px minmax(180px,1.2fr) minmax(180px,1fr);grid-template-areas:'rank spark type base src pct';column-gap:12px;align-items:center;padding:5px 16px;border-bottom:1px solid var(--border-subtle);font-size:.82rem;min-width:760px}.summary-row:last-child{border-bottom:0}.summary-row:hover{background:var(--surface-hover)}.summary-header{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;padding-block:8px 5px;color:var(--text-disabled)}.summary-header:hover{background:none}
  .group-row th{font-size:11px;font-weight:600}.odds-table .base-row th{font-size:12px;font-weight:700;line-height:1.2;color:var(--text-primary);background:var(--surface-1)}.base-row span{margin-left:4px;font-size:10px;color:var(--text-muted)}.base-row .group-start,.odds-table tbody td:nth-child(3n+2){border-left:2px solid var(--spark-color)}.odds-table tbody td{height:40px}.odds-table tbody th{padding:0}.summary-row[data-tone='blue']{background:rgb(33 150 243/.06)}.summary-row[data-tone='pink']{background:rgb(240 98 146/.05)}.summary-row[data-tone='green']{background:rgb(129 199 132/.05)}
  .sum-rank{grid-area:rank;text-align:center;font-size:.7rem;color:var(--text-disabled);font-weight:700}.sum-spark{grid-area:spark;display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden}.sum-name{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-weight:600;color:var(--spark-color)}.sum-star{font-size:.72rem;white-space:nowrap;color:var(--spark-color)}.sum-spark small{font-size:.7rem;color:var(--text-disabled);flex-shrink:0}.sum-type{grid-area:type;text-align:center;font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:var(--spark-color,var(--text-muted))}.sum-base{grid-area:base;text-align:center;color:var(--text-disabled);font-size:.78rem;font-weight:600;font-variant-numeric:tabular-nums}
  .sum-src{grid-area:src;display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden}.sum-src img{width:22px;height:22px;border-radius:50%;object-fit:cover;flex-shrink:0}.sum-src-name{min-width:0;flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:.8rem;font-weight:600}.sum-src-chip{padding:1px 6px;border:1px solid rgb(233 30 99/.2);border-radius:999px;background:rgb(233 30 99/.1);color:#f48fb1;font-size:.65rem;font-weight:700;white-space:nowrap}
  .sum-chance-col{grid-area:pct;display:flex;align-items:center;justify-content:flex-end;gap:10px}.sum-pct,.sum-expected{min-width:56px;text-align:right;white-space:nowrap;font-size:.86rem;font-variant-numeric:tabular-nums;color:var(--spark-color,var(--text-muted))}.meter{flex:1;min-width:40px;height:6px;overflow:hidden;border-radius:3px;background:var(--surface-4)}.meter i{display:block;height:100%;border-radius:3px;background:var(--spark-color)}.summary-row[data-tone='white'] .sum-pct,.summary-row[data-tone='white'] .sum-star,.summary-row[data-tone='white'] .sum-expected,.summary-row[data-tone='white'] .comb-source{color:#f4b942}.summary-row[data-tone='white'] .meter i{background:#f4b942}
  .combined-row{grid-template-columns:minmax(150px,1.5fr) 68px 52px minmax(110px,1.1fr) minmax(200px,1.2fr) 80px;grid-template-areas:'spark type base sources pct expected';min-width:760px}.sum-sources{grid-area:sources;display:flex;align-items:center;gap:6px;overflow:hidden}.comb-source{display:flex;align-items:center;gap:3px;color:var(--spark-color)}.comb-source img{width:24px;height:24px;border-radius:50%;object-fit:cover}.comb-source b{font-size:.68rem;white-space:nowrap}.sum-expected{grid-area:expected;font-size:.84rem}.summary-header .sum-expected{font-size:inherit;font-weight:inherit;color:inherit}.skill-note{padding:8px 12px 4px;margin:0;font-size:.6rem;font-style:italic;color:var(--text-disabled)}
  @container spark-odds (max-width:1000px){
    .desktop-base{display:none}.mobile-base{display:block}.mobile-base table{width:100%;border-spacing:0;font-size:12px;font-variant-numeric:tabular-nums}.mobile-base th,.mobile-base td{min-width:72px;height:32px;padding:5px 8px;white-space:nowrap;text-align:center;border-right:1px solid var(--border-subtle);border-bottom:1px solid var(--border-subtle);color:var(--spark-color,var(--text-muted));font-weight:600}.mobile-base th:first-child{position:sticky;left:0;background:var(--bg-secondary);z-index:1;border-left:2px solid var(--spark-color,transparent);width:80px;min-width:80px}.mobile-base th small{display:block;font-size:10px}.mobile-base thead{background:var(--surface-2)}.mobile-base thead span{font-size:10px}.mobile-base img{display:block;margin:0 auto 2px;width:28px;height:28px;object-fit:cover;border-radius:50%}.mobile-base .group-end>*{border-bottom:2px solid var(--border-primary)}.mobile-base tbody tr{background:color-mix(in srgb,var(--spark-color) 5%,transparent)}
  }
  @container spark-odds (max-width:760px){
    .summary-list{padding:6px;display:flex;flex-direction:column;gap:4px}.summary-header{display:none!important}.summary-row{min-width:0;grid-template-columns:minmax(0,1fr) auto auto;grid-template-rows:auto 3px;grid-template-areas:'spark src pct' 'bar bar bar';gap:5px 8px;padding:7px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);background:var(--surface-2)}.summary-row:last-child{border:1px solid var(--border-subtle)}.summary-row[data-tone]{background:var(--surface-2)}.sum-rank,.sum-type,.sum-base,.sum-src-name{display:none}.sum-spark{gap:6px}.sum-star{font-size:.68rem;padding:2px 5px;border-radius:4px;background:color-mix(in srgb,var(--spark-color) 12%,transparent)}.sum-name{font-size:.8rem}.sum-src{gap:3px}.sum-src img{width:20px;height:20px}.sum-src-chip{font-size:.55rem;padding:1px 3px}.sum-chance-col{display:contents}.sum-pct{grid-area:pct;font-size:.82rem;min-width:var(--touch-target)}.meter{grid-area:bar;width:100%;height:3px}
    .combined-row{grid-template-columns:minmax(0,1fr) auto auto;grid-template-rows:auto auto 4px;grid-template-areas:'spark type pct' 'sources sources expected' 'bar bar bar';gap:6px 8px;padding:10px 12px}.combined-row .sum-type{display:block;font-size:.62rem;padding:2px 6px;border-radius:999px;background:var(--surface-4)}.combined-row .sum-name{font-size:.84rem;font-weight:700}.sum-sources{flex-wrap:wrap}.sum-expected{font-size:.72rem}.sum-expected::before{content:'Exp. ';font-size:.62rem;font-weight:500;color:var(--text-disabled)}.combined-row .sum-pct{font-size:.9rem;min-width:52px}.combined-row .meter{height:4px}.comb-source img{width:18px;height:18px}
  }
</style>

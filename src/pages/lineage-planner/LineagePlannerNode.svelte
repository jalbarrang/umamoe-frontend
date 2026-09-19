<script lang="ts">
  import type { Snippet } from 'svelte';
  import { decodeFactor, factorOptions, factorCatalogState } from '@/lib/catalog/factor-catalog';
  import { plannerSparkChance, type plannerAffinityBreakdown, type plannerAffinityFlows, type PlannerNode, type PlannerSpark } from '@/lib/lineage/planner';
  import Button from '@/components/Button.svelte';
  import Icon from '@/components/Icon.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import SparkAddControl from '@/components/SparkAddControl.svelte';
  import SparkItem from '@/components/SparkItem.svelte';

  interface Props { node: PlannerNode; breakdown?: ReturnType<typeof plannerAffinityBreakdown>; flows?: ReturnType<typeof plannerAffinityFlows>; active?: boolean; perRun?: boolean; children?: Snippet; onmodechange?: () => void; onsparkschange?: (sparks: PlannerSpark[]) => void; onclick?: () => void; onclear?: () => void; onveteran?: () => void; onraces?: () => void; }
  let { node, breakdown = null, flows = null, active = false, perRun = false, children, onmodechange, onsparkschange, onclick, onclear, onveteran, onraces }: Props = $props();
  const affinity = $derived(breakdown?.total ?? 0);
  const factors = $derived(factorOptions().map((factor) => ({ value: factor.id, label: factor.text, type: factor.type })));
  const filled = $derived(Boolean(node.characterId));
  const sortedSparks = $derived(node.sparks.map((spark,index) => ({spark,index})).sort((a,b) => {
    const order = (type: number) => type === 0 ? 0 : type === 1 ? 1 : type === 5 ? 2 : 3;
    return order(a.spark.type) - order(b.spark.type) || b.spark.level - a.spark.level;
  }));
  function tone(type: number): 'blue'|'pink'|'green'|'white' { return type === 0 ? 'blue' : type === 1 ? 'pink' : type === 5 ? 'green' : 'white'; }
  function addSpark(value: string, level: number): void {
    const factor = factors.find((factor) => factor.value === value);
    if (!factor) return;
    onsparkschange?.([...node.sparks, { factorId: Number(value), name: factor.label, type: factor.type, level }]);
  }
</script>

<article class="node layer-{node.layer}" class:filled class:active aria-label={node.label} data-position={node.position}>
  {#if filled}
    <div class="node-heading">
    <div class="node-main">
      {#if node.image}<img src={node.image} alt="" loading="lazy"/>{:else}<span class="avatar"><Icon name="user" size={node.layer === 3 ? 16 : 22}/></span>{/if}
      <div class="copy"><small>{node.label}</small><div class="name-row"><strong title={node.name}>{node.name ?? `Character ${node.characterId}`}</strong>{#if node.layer === 0 && breakdown}<span class="total" title={`Total affinity ${affinity}: ${breakdown.base} base + ${breakdown.race} race`}><Icon name="heart" size={14}/>{affinity}</span>{/if}</div><small class="source">{node.veteran ? 'Recorded veteran' : node.succession ? 'From selected lineage' : 'Planned Uma'}</small></div>
    </div>
    <div class="node-actions">
      <Button variant="secondary" size="sm" icon="edit" ariaLabel={`Change ${node.label}: ${node.name}`} onclick={onclick}><span class="action-label">Change</span></Button>
      {#if node.layer < 3}<Button variant="secondary" size="sm" icon="veterans" ariaLabel={`Pick Veteran for ${node.label}`} onclick={onveteran}><span class="action-label">Pick veteran</span></Button>{/if}
      <IconButton icon="trash" size="sm" label={`Clear ${node.label}`} onclick={onclear}/>
    </div>
    </div>
    {#if node.layer === 0 && flows && breakdown}<div class="composition" aria-label="Total affinity composition"><span class="composition-label">Total composition</span><span class="term">P1 {flows.p1}</span><span>+</span><span class="term shared">Shared {flows.shared}</span><span>+</span><span class="term">P2 {flows.p2}</span><span>=</span><strong>{affinity}</strong></div>{/if}
    {#if children}{@render children()}{/if}
    {#if node.layer > 0 && node.layer < 3}
      <section class="sparks" aria-label={`Sparks for ${node.label}`}>
        <header class="node-toolbar">
          {#if breakdown}<dl class="affinity-breakdown" aria-label="Spark affinity breakdown" title={`Spark affinity ${affinity}: ${breakdown.base} base + ${breakdown.race} race`}><div class="spark-affinity"><dt><Icon name="star" size={12}/>Affinity</dt><dd>{affinity}</dd></div><div class="base"><dt>Base</dt><dd>{breakdown.base}</dd></div><div class="race"><dt>Race</dt><dd>{breakdown.race}</dd></div></dl>{/if}
          <span class="race-action"><Button variant="secondary" size="sm" icon="trophy" ariaLabel={`Edit race wins for ${node.label}`} onclick={onraces}><span class="race-label">Race wins · </span>{node.winSaddleIds.length}</Button><Button variant="secondary" size="sm" onclick={onmodechange}>{perRun ? 'Per Run' : 'Per Inh.'}</Button></span>
        </header>
        {#each sortedSparks as {spark,index}}<SparkItem name={spark.name || decodeFactor(spark.factorId * 10 + spark.level).name} level={spark.level} tone={tone(spark.type)} chance={`${plannerSparkChance(spark, affinity, perRun).toFixed(2)}%`} compact removeLabel={`Remove ${spark.name} from ${node.label}`} onremove={() => onsparkschange?.(node.sparks.filter((_, current) => current !== index))}/>{:else}<small>No sparks on this character</small>{/each}
        <SparkAddControl id={`spark-add-${node.position}`} label={node.label} options={factors} {...$factorCatalogState} onadd={addSpark}/>
      </section>
    {/if}
  {:else}
    <div class="node-heading">
    <div class="empty-identity"><Icon name={node.layer===0 ? 'user' : 'lineage'} size={22}/><div><strong>{node.label}</strong><small>{node.layer===0 ? 'Who are you training?' : node.layer===1 ? 'Import a lineage or plan your own' : 'Choose an ancestor'}</small></div></div>
    <div class="empty-actions">
      {#if node.layer>0 && node.layer<3}<Button size="sm" variant="secondary" icon="veterans" ariaLabel={`Pick Veteran for ${node.label}`} onclick={onveteran}>Pick veteran</Button>{/if}
      <Button size="sm" variant={node.layer===0 ? 'primary' : 'secondary'} icon="add" ariaLabel={`Choose ${node.label}`} onclick={onclick}>Choose Uma</Button>
      {#if node.layer===0}<Button size="sm" variant="ghost" icon="veterans" ariaLabel={`Pick Veteran for ${node.label}`} onclick={onveteran}>Use veteran</Button>{/if}
    </div>
    </div>
  {/if}
</article>

<style>
  .node-heading{display:flex;align-items:center;flex-wrap:wrap;gap:10px}.node-heading:has(.node-main){flex-wrap:nowrap}.node-main{flex:1;min-width:0}.empty-identity{flex:1 1 160px}.node-actions,.empty-actions{margin-left:auto}.node{container:lineage-node / inline-size}
  .node{min-width:0;width:100%;display:flex;flex-direction:column;gap:10px;align-self:stretch;padding:12px;border:1px solid var(--border-primary);border-radius:var(--radius-md);background:var(--surface-1);box-sizing:border-box}.node.layer-0{border-color:rgb(var(--accent-primary-rgb)/.35)}.node.active,.node:focus-within{position:relative;z-index:2;border-color:var(--color-accent)}
  .node-main{display:flex;align-items:center;gap:10px;min-width:0}.node-main img,.avatar{display:grid;place-items:center;width:44px;height:52px;flex:none;object-fit:contain}.layer-0 .node-main img{width:52px;height:60px}.copy{display:grid;gap:3px;min-width:0;flex:1}.copy small{font-size:10px;color:var(--color-accent)}.copy .source{color:var(--text-muted);font-size:10px}.name-row{display:flex;align-items:center;gap:8px;min-width:0}.name-row>strong{font-size:14px;line-height:1.3;overflow:hidden;text-overflow:ellipsis}.layer-2 .name-row>strong,.layer-3 .name-row>strong{font-size:12px}.total{display:flex;align-items:center;gap:5px;margin-left:auto;color:var(--accent-pink);font-size:20px;font-weight:700;font-variant-numeric:tabular-nums}
  .node-actions,.empty-actions{display:flex;align-items:center;flex-wrap:wrap;gap:6px}.node-actions :global(.ui-button),.empty-actions :global(.ui-button){min-height:30px;padding:4px 8px;font-size:11px}.node-actions :global(.icon-button){width:30px;height:30px;margin-left:auto}.node-actions :global(svg){width:14px;height:14px}.empty-actions :global(.ui-button:first-child){border-color:rgb(var(--accent-primary-rgb)/.35);color:var(--color-accent)}.layer-0 .empty-actions :global(.ui-button:first-child){color:var(--button-primary-text)}
  .empty-identity{display:flex;align-items:center;gap:10px;min-height:40px}.empty-identity>div{display:grid;gap:4px;min-width:0}.empty-identity :global(svg){color:var(--color-accent)}.empty-identity strong{font-size:12px}.empty-identity small{font-size:11px;color:var(--text-muted)}.layer-3 .empty-identity small{display:none}.layer-3 .empty-identity{min-height:26px}
  .composition{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding-top:10px;border-top:1px solid var(--border-subtle);font-size:11px;color:var(--text-muted)}.composition-label{flex-basis:100%;font-size:10px}.term{padding:3px 5px;border-radius:4px;background:var(--color-accent-soft);color:var(--color-accent)}.term.shared{background:rgb(129 199 132/.1);color:var(--accent-success)}.composition>strong{color:var(--accent-pink)}
   .node-toolbar{width:100%;display:flex;align-items:center;flex-wrap:wrap;gap:5px 8px;padding-top:8px;border-top:1px solid var(--border-subtle)}
   .affinity-breakdown{display:grid;grid-template-columns:auto auto;gap:2px 5px;flex:none;margin:0}.affinity-breakdown>div{display:flex;align-items:center;gap:3px}.affinity-breakdown dt{display:flex;align-items:center;gap:4px;color:var(--text-muted);font-size:10px;white-space:nowrap}.affinity-breakdown dd{order:-1;margin:0;font-size:11px;font-weight:650;font-variant-numeric:tabular-nums}.affinity-breakdown .spark-affinity{grid-column:1/-1;gap:6px;color:var(--accent-purple)}.spark-affinity dd{font-size:16px;line-height:1.1}.spark-affinity :global(svg){color:var(--accent-purple)}.base{color:var(--accent-pink)}.race{color:var(--accent-warning)}.race:before{content:'+';color:var(--text-muted);font-size:10px}.race-action{margin-left:auto;display:flex;align-items:center;gap:6px;white-space:nowrap}.race-action :global(.ui-button){min-height:32px;padding:3px 7px;font-size:11px}
   .sparks{display:flex;flex-wrap:wrap;gap:4px;align-content:start;min-width:0}.sparks>:global(.spark){font-size:11px;min-width:0}.sparks>small{color:var(--text-muted);font-size:11px}
  @media(pointer: coarse) and (max-width: 1300px),(max-width:767px){.node-actions :global(.ui-button),.empty-actions :global(.ui-button),.sparks header :global(.ui-button),.race-action :global(.ui-button){min-height:44px}.node-actions :global(.icon-button){min-width:44px;min-height:44px}}
  @container lineage-node (max-width:480px){
    .node-heading:has(.node-main){gap:6px}.node-actions{flex:none;flex-wrap:nowrap;gap:4px}.node-actions .action-label{display:none}.node-actions :global(.ui-button){width:36px;min-width:36px;min-height:36px;height:36px;padding:0;gap:0}.node-actions :global(.icon-button){width:36px;min-width:36px;min-height:36px;height:36px}.node-main{gap:6px}.node-main img,.layer-0 .node-main img,.avatar{width:32px;height:40px}.name-row>strong{font-size:12px;white-space:nowrap}.copy .source{font-size:9px}.total{font-size:14px;gap:2px}.node-toolbar{flex-wrap:nowrap;gap:6px}.race-action{gap:4px}.race-action :global(.ui-button){min-height:36px;padding:3px 6px;font-size:10px}.race-label{display:none}
  }
</style>

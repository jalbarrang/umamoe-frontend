<script lang="ts">
  import { tick } from 'svelte';
  import { characterImagePath, type CharacterCatalogEntry } from '@/lib/catalog/character-catalog';
  import { decodeFactor, factorOptions, factorCatalogState } from '@/lib/catalog/factor-catalog';
  import { manualBestFits, type ManualParent } from '@/lib/veterans/parent-picker';
  import type { VeteranAffinityEngine } from '@/lib/veterans/affinity-engine';
  import Artwork from '@/components/Artwork.svelte';
  import Button from '@/components/Button.svelte';
  import CharacterSelectDialog from '@/components/CharacterSelectDialog.svelte';
  import type { CharacterPickerSort } from '@/components/CharacterPicker.svelte';
  import Icon from '@/components/Icon.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import RaceWinPickerDialog from './RaceWinPickerDialog.svelte';
  import SparkAddControl from '@/components/SparkAddControl.svelte';
  import SparkItem from '@/components/SparkItem.svelte';
  import TextField from '@/components/TextField.svelte';
  interface Props { entry?: ManualParent; characters: Map<number, CharacterCatalogEntry>; selectableCharacters: CharacterCatalogEntry[]; targetId?: number; engine?: VeteranAffinityEngine; onsave: (entry: ManualParent) => void; oncancel: () => void; }
  let { entry, characters, selectableCharacters, targetId, engine, onsave, oncancel }: Props = $props();
  const id = $props.id();
  let label = $state('');
  let nodes = $state<Array<{cardId: number | null; factors: number[]; wins: number[]}>>([]);
  let characterSlot = $state(0); let characterOpen = $state(false);
  let bestSlot = $state<number | null>(null); let bestTrigger: HTMLElement | undefined;
  let bestPanel = $state<HTMLElement>();
  let characterSort = $state<CharacterPickerSort>('default');
  let raceSlot = $state(0); let raceOpen = $state(false);
  const labels = ['Parent 1', 'Grandparent 1', 'Grandparent 2'];
  const factors = $derived(factorOptions().map((factor) => ({ value: factor.id, label: factor.text, type: factor.type })));
  $effect(() => {
    label = entry?.label ?? '';
    nodes = [
      {cardId:entry?.mainCardId??null, factors:[...(entry?.ownSparkIds??[])], wins:[...(entry?.mainWinSaddleIds??[])]},
      {cardId:entry?.p1CardId??null, factors:[...(entry?.p1SparkIds??[])], wins:[...(entry?.p1WinSaddleIds??[])]},
      {cardId:entry?.p2CardId??null, factors:[...(entry?.p2SparkIds??[])], wins:[...(entry?.p2WinSaddleIds??[])]}
    ];
  });
  function payload(): ManualParent { return { id:entry?.id??crypto.randomUUID(), label:label.trim(), mainCardId:nodes[0]?.cardId??0, ownSparkIds:nodes[0]?.factors??[], p1CardId:nodes[1]?.cardId??null,p1SparkIds:nodes[1]?.factors??[],p2CardId:nodes[2]?.cardId??null,p2SparkIds:nodes[2]?.factors??[],mainWinSaddleIds:nodes[0]?.wins??[],p1WinSaddleIds:nodes[1]?.wins??[],p2WinSaddleIds:nodes[2]?.wins??[],createdAt:entry?.createdAt??new Date().toISOString() }; }
  const choices = $derived(selectableCharacters.map(character => ({id:String(character.id),name:character.name,image:characterImagePath(Number(character.id))})));
  const pickerCharacters = $derived(new Map(selectableCharacters.map(character=>[Number(character.id),character])));
  const affinityTargets = $derived([...new Set([targetId, characterSlot ? nodes[0]?.cardId : undefined].filter((value): value is number => Boolean(value)).map(value => value >= 100000 ? Math.floor(value / 100) : value))]);
  const characterChoices = $derived(choices.map(choice => ({ ...choice, affinity: engine && affinityTargets.length ? affinityTargets.reduce((sum, target) => sum + engine.pair(Math.floor(Number(choice.id) / 100), target), 0) : undefined })));
  const bestChoices = $derived(bestSlot === null ? [] : manualBestFits(nodes.map(node => node.cardId), bestSlot, targetId, engine, pickerCharacters));
  const affinities = $derived.by(() => {
    if (!engine?.ready || !nodes[0]?.cardId) return [0,0,0];
    const main = Math.floor(nodes[0].cardId / 100), target = targetId && (targetId >= 10000 ? Math.floor(targetId / 100) : targetId);
    const grandparents = nodes.slice(1).map(node => !node.cardId ? 0 : target ? engine.triple(target,main,Math.floor(node.cardId/100)) : engine.pair(main,Math.floor(node.cardId/100)));
    return [(target ? engine.pair(target,main) : 0) + grandparents.reduce((sum,value) => sum+value,0), ...grandparents];
  });
  function choose(slot: number): void { bestSlot=null;characterSlot=slot;characterSort=targetId || slot && nodes[0]?.cardId ? 'affinity' : 'default';characterOpen=true; }
  function openBestFits(slot: number, event: MouseEvent): void { bestTrigger=event.currentTarget as HTMLElement;bestSlot=bestSlot===slot?null:slot; }
  function closeBestFits(): void { bestSlot=null;bestTrigger?.focus({preventScroll:true}); }
  $effect(() => {
    if(!bestPanel)return;
    const panel=bestPanel;
    const onkey=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeBestFits();}};
    panel.addEventListener('keydown',onkey);panel.scrollIntoView({block:'nearest'});panel.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
    return()=>panel.removeEventListener('keydown',onkey);
  });
  async function selectBestFit(slot: number, cardId: number, event: MouseEvent): Promise<void> {
    const owner=(event.currentTarget as HTMLElement).closest('.manual-node');
    nodes[slot]!.cardId=cardId;bestSlot=null;await tick();
    owner?.querySelector<HTMLButtonElement>(`button[aria-label="Change ${labels[slot]}"]`)?.focus({preventScroll:true});
  }
  function openWins(slot: number): void { raceSlot=slot;raceOpen=true; }
</script>

<section class="manual-editor" aria-label={entry?'Edit manual parent':'New manual parent'}>
  <div class="editor-heading"><strong>{entry ? 'Edit manual parent' : 'New manual parent'}</strong><div class="entry-label"><TextField id={`${id}-name`} label="Entry name (optional)" hideLabel prefixIcon="tag" bind:value={label} placeholder="Label (optional)"/>{#if label}<IconButton icon="close" size="sm" label="Clear entry name" onclick={()=>{label='';document.getElementById(`${id}-name`)?.focus();}}/>{/if}</div></div>
  <div class="manual-tree">{#each nodes as node,index}
    <div class="tree-branch" class:grandparent={index>0}>
    <section class:main={index===0} class:filled={Boolean(node.cardId)} class="manual-node" aria-label={labels[index]}>
      {#if node.cardId}
        <header class="identity"><Artwork src={characterImagePath(node.cardId)} alt="" size="sm"/>
          <div class="identity-copy"><strong>{characters.get(node.cardId)?.name??`Character ${node.cardId}`}</strong><div class="tagline"><small>{index===0?'Parent':labels[index]}</small>{#if affinities[index]}<span class="affinity" aria-label={`Affinity ${affinities[index]}`}><Icon name="heart" size={10}/>{affinities[index]}</span>{/if}</div></div>
          <div class="node-actions"><IconButton icon="trophy" size="sm" label={`Race wins for ${labels[index]}`} title={`${node.wins.length} race wins`} onclick={()=>openWins(index)}/><IconButton icon="swap" size="sm" label={`Change ${labels[index]}`} onclick={()=>choose(index)}/><IconButton icon="close" size="sm" label={`Remove ${labels[index]}`} onclick={()=>nodes[index]={cardId:null,factors:[],wins:[]}}/></div>
        </header>
        <div class="sparks-editor"><div class="node-sparks">{#each node.factors as encoded, factorIndex}{@const factor=decodeFactor(encoded)}<SparkItem name={factor.name} tone={factor.type===0?'blue':factor.type===1?'pink':factor.type===5?'green':'white'} level={factor.level} compact removeLabel={`Remove ${factor.name} from ${labels[index]}`} onremove={()=>node.factors=node.factors.filter((_,i)=>i!==factorIndex)}/>{/each}</div>
        <SparkAddControl id={`${id}-factor-${index}`} label={labels[index]!} options={factors} {...$factorCatalogState} onadd={(value,level)=>node.factors=[...node.factors,Number(value)*10+level]}/>
        </div>
      {:else}<div class="empty-actions"><button type="button" class="empty-node" aria-label={`Choose ${labels[index]}`} onclick={()=>choose(index)}><span><Icon name="users-add" size={20}/></span><div><strong>{labels[index]}</strong><small>Choose a character</small></div></button>{#if engine?.ready&&targetId&&(index===0||nodes[0]?.cardId)}<IconButton icon="search" size="sm" label="Best Fits" title="Best affinity fit" ariaExpanded={bestSlot===index} onclick={(event)=>openBestFits(index,event)}/>{/if}</div>{/if}
      {#if bestSlot===index}
        <section class="best-fits" aria-label={`Best Fits for ${labels[index]}`} bind:this={bestPanel}>
          <header><strong>Best Fits</strong><IconButton icon="close" label="Close best fits" onclick={closeBestFits}/></header>
          <div class="best-list">{#each bestChoices as choice,rank}<button type="button" aria-label={`Choose ${choice.character.name}: affinity ${choice.totalAffinity}, contribution ${choice.individualAffinity}`} onclick={(event)=>selectBestFit(index,Number(choice.character.id),event)}><span class="best-rank">{rank+1}</span><Artwork src={characterImagePath(Number(choice.character.id))} alt="" size="sm"/><span class="best-name">{choice.character.name}</span><span class="best-score" title="Total affinity">{choice.totalAffinity}</span><span class="best-delta" title="Individual affinity">+{choice.individualAffinity}</span></button>{:else}<p>No matching characters available.</p>{/each}</div>
        </section>
      {/if}
    </section>
    </div>
  {/each}</div>
  <footer><Button variant="secondary" onclick={oncancel}>Cancel</Button><Button icon="save" disabled={!nodes[0]?.cardId} onclick={()=>onsave(payload())}>{entry?'Save Changes':'Save Entry'}</Button></footer>
</section>
<CharacterSelectDialog bind:open={characterOpen} label={`Character for ${labels[characterSlot]}`} options={characterChoices} selected={nodes[characterSlot]?.cardId?[String(nodes[characterSlot]!.cardId)]:[]} bind:sort={characterSort} onselect={(selected)=>{nodes[characterSlot]!.cardId=Number(selected[0]);characterOpen=false;}}/>
{#if raceOpen}<RaceWinPickerDialog bind:open={raceOpen} charName={characters.get(nodes[raceSlot]?.cardId??0)?.name} winSaddleIds={nodes[raceSlot]?.wins??[]} onconfirm={(wins)=>nodes[raceSlot]!.wins=wins}/>{/if}
<style>
  .manual-editor{min-width:0;margin:8px 4px;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-1)}
  .editor-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid var(--border-subtle)}.editor-heading>strong{font-size:13px;font-weight:600}.entry-label{position:relative;flex:1;max-width:360px}.entry-label :global(input){height:30px;padding-right:34px;font-size:12px;color:var(--text-primary);border-radius:var(--radius-sm)}.entry-label>:global(.icon-button){position:absolute;right:2px;top:0;width:30px;height:30px;border:0;background:transparent}
  .manual-tree{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;padding:14px}.tree-branch{position:relative;display:flex;min-width:0}.tree-branch>.manual-node{flex:1}
  .manual-node{position:relative;display:flex;flex-direction:column;min-width:0;border:1px solid var(--border-primary);border-radius:8px;background:var(--surface-1);transition:background var(--duration-fast),border-color var(--duration-fast)}.manual-node.main{border-color:rgb(var(--accent-primary-rgb)/.4);background:var(--component-bg)}.manual-node.filled{gap:8px;padding:12px}.manual-node:has(.empty-node:hover){background:rgb(var(--accent-primary-rgb)/.07);border-color:rgb(var(--accent-primary-rgb)/.6)}.manual-node:focus-within{z-index:2}
  .identity{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap}.identity :global(.art){flex:none;width:42px;height:42px;border:0;border-radius:var(--radius-md)}.identity-copy{flex:1;min-width:90px;display:flex;flex-direction:column;gap:2px}.identity-copy>strong{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tagline{display:flex;align-items:center;gap:6px}.tagline small{font-size:.65rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em;font-weight:500}.affinity{display:inline-flex;align-items:center;gap:3px;padding:1px 5px;border:1px solid rgb(233 30 99/.2);border-radius:var(--radius-xs);color:#e91e63;background:rgb(233 30 99/.1);font-size:.65rem;font-weight:600}
  .node-actions{display:flex;flex-wrap:wrap;gap:4px;margin-left:auto;flex-shrink:0}.node-actions :global(.icon-button),.empty-actions>:global(.icon-button){width:24px;height:24px;padding:4px;border:0;background:transparent;color:var(--text-muted)}.node-actions :global(svg){width:16px;height:16px}
  .sparks-editor{margin-top:4px;padding-top:8px;border-top:1px solid var(--border-subtle)}.node-sparks{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}.node-sparks:empty{display:none}.node-sparks :global(.name){max-width:100px}.tagline small{line-height:1.5}
  .empty-actions{display:flex;align-items:center;padding-right:8px}.empty-node{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:10px;flex:1;min-width:0;min-height:160px;padding:16px;border:0;background:transparent;color:var(--text-primary);font:500 13px var(--font-sans);text-align:center;cursor:pointer}.empty-node>span{display:grid;place-items:center;flex:none;width:38px;height:38px;border:1px solid rgb(var(--accent-primary-rgb)/.2);border-radius:10px;background:rgb(var(--accent-primary-rgb)/.06);color:var(--accent-primary)}.empty-node>div{display:grid;gap:4px}.empty-node strong{font-weight:600}.empty-node small{font-size:11px;color:var(--text-muted)}.empty-node:hover{color:var(--accent-primary)}.empty-node:hover>span{border-color:var(--accent-primary)}.empty-node:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px;border-radius:8px}
  footer{display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;border-top:1px solid var(--border-subtle)}footer :global(.ui-button){min-height:27px;padding:5px 14px;border-radius:var(--radius-sm);font:500 .78rem Arial,sans-serif;box-shadow:none}footer :global(.ui-button:hover){transform:none}footer :global(.ui-button:last-child){gap:5px;font-weight:600}footer :global(.ui-button svg){width:14px;height:14px}
  :global([data-theme='light']) .manual-editor,:global([data-theme='light']) .manual-node{background:#fff;box-shadow:var(--shadow-sm);border-color:var(--border-primary)}:global([data-theme='light']) footer{background:#f8fafc}
  :global([data-theme='light']) .tagline small{color:var(--text-muted)}:global([data-theme='light']) .affinity{color:var(--color-pink);background:rgb(var(--color-pink-rgb)/.08);border-color:rgb(var(--color-pink-rgb)/.2)}
  .best-fits{position:absolute;top:calc(100% + 4px);left:0;right:0;z-index:100;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-secondary);border-radius:var(--radius-md);background:var(--surface-overlay);box-shadow:0 8px 32px rgb(0 0 0/.6)}
  .best-fits header{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:var(--bg-tertiary);border-bottom:1px solid var(--border-subtle)}.best-fits header>strong{font-size:var(--font-sm);font-weight:600}.best-fits header :global(.icon-button){width:24px;height:24px;border:0;background:transparent}
  .best-list{max-height:240px;overflow:auto;overscroll-behavior:contain}.best-list button{display:flex;align-items:center;gap:8px;width:100%;min-height:36px;padding:6px 12px;border:0;border-bottom:1px solid var(--border-subtle);background:transparent;color:var(--text-primary);text-align:left;font:inherit;cursor:pointer}.best-list button:last-child{border-bottom:0}.best-list button:hover{background:var(--surface-hover)}.best-list button:focus-visible{outline:2px solid var(--accent-primary);outline-offset:-2px}.best-list :global(.art){width:28px;height:28px;border:0;border-radius:var(--radius-xs)}.best-list p{margin:12px;font-size:var(--font-sm)}
  .best-rank{flex:none;width:16px;text-align:center;font-size:.65rem;font-weight:700;color:var(--text-disabled)}.best-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--font-sm)}.best-score{color:var(--color-pink);font-size:var(--font-sm);font-weight:700}.best-delta{flex:none;width:36px;text-align:right;color:var(--accent-success);font-size:.65rem}
  :global([data-theme='light']) .best-fits{background:white;border-color:var(--border-primary);box-shadow:var(--shadow-dropdown)}:global([data-theme='light']) .best-score{background:rgb(var(--color-pink-rgb)/.08)}
  @media(max-width:767px),(pointer: coarse) and (max-width: 1300px){.best-list button{min-height:var(--touch-target)}.best-fits header :global(.icon-button){width:var(--touch-target);height:var(--touch-target)}.best-fits header{padding-block:0}}
  @media(max-width:767px),(pointer: coarse) and (max-width: 1300px){.node-actions :global(.icon-button),.empty-actions>:global(.icon-button),.entry-label>:global(.icon-button),footer :global(.ui-button){min-width:var(--touch-target);min-height:var(--touch-target)}.entry-label :global(input){height:var(--touch-target)}.manual-tree{padding:10px}.manual-node.filled{padding:10px}.identity-copy{min-width:100px}.empty-node{padding:10px;gap:8px}}
  @media(max-width:999px){.manual-tree{grid-template-columns:minmax(0,1fr)}.empty-node{min-height:76px;flex-direction:row;justify-content:flex-start;text-align:left}}
  @media(max-width:600px){.editor-heading{align-items:stretch;flex-direction:column;padding:10px;gap:8px}.entry-label{max-width:none}.identity-copy>strong,.main .identity-copy>strong{font-size:13px}}
  @media(max-width:767px),(pointer: coarse) and (max-width: 1300px){
    .manual-node.filled{container-type:inline-size}
    @container(min-width:300px){
      .identity{flex-wrap:nowrap}
      .identity-copy{min-width:0}
      .tagline{flex-wrap:wrap}
    }
  }
  @media(max-width:400px){.entry-label :global(input){font-size:.72rem}}
</style>

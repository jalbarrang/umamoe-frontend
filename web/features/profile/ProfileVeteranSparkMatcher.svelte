<script lang="ts">
  import { tick } from 'svelte';
  import { factorOptions, type FactorMetadata } from '../../catalog/factor-catalog';
  import { characterImagePath, type CharacterCatalogEntry } from '../../catalog/character-catalog';
  import type { FactorScope, VeteranFactorFilter } from '../../domain/profile/profile-veterans';
  import WhiteFactorTypePicker from '../database/WhiteFactorTypePicker.svelte';
  import SegmentedControl from '../../ui/SegmentedControl.svelte';
  import Icon from '../../ui/Icon.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import InspectPopover from '../../ui/InspectPopover.svelte';
  import Slider from '../../ui/Slider.svelte';
  import TextField from '../../ui/TextField.svelte';
  import SelectFieldSlim from '../../ui/SelectFieldSlim.svelte';

  let { filters=$bindable([]), category=$bindable('all'), characters, scopeLabels }: {
    filters?: VeteranFactorFilter[]; category?: string;
    characters: Map<number,CharacterCatalogEntry>; scopeLabels: Record<FactorScope,string>;
  } = $props();
  let uniqueSearch=$state('');
  const factors=$derived(factorOptions());
  // Unique factor IDs contain the outfit card ID followed by a zero.
  const uniqueSparks=$derived(factors.filter(factor=>factor.type===5).map(factor=>({factor,character:characters.get(Number(factor.id)/10)})).sort((a,b)=>(a.character?.name??a.factor.text).localeCompare(b.character?.name??b.factor.text)));
  const visibleUniques=$derived(uniqueSparks.filter(({factor,character})=>((character?.name??'')+' '+factor.text).toLocaleLowerCase().includes(uniqueSearch.trim().toLocaleLowerCase())));
  const scopes:Record<FactorScope,string>={parent:'Main',grandparent:'Parents',greatgrandparent:'Grandparents',family:'Main + parents',any:'Any generation',p1:'P1',p2:'P2'};
  function starCap(scope:FactorScope,mode:VeteranFactorFilter['mode']) { return mode!=='total' ? 3 : {any:9,family:9,greatgrandparent:12,grandparent:6,parent:3,p1:3,p2:3}[scope]; }
  function update(index:number,patch:Partial<VeteranFactorFilter>) { filters=filters.map((filter,i)=>i===index ? {...filter,...patch} : filter); }
  function selectedIndex(id:number) { return filters.findIndex(filter=>filter.factorId===id); }
  async function choose(factorId:number) {
    let index=selectedIndex(factorId);
    if(index<0){index=filters.length;filters=[...filters,{factorId,minLevel:1,scope:'any',mode:'total',operator:'and'}];}
    category='all';await tick();document.getElementById('factor-stars-'+index+'-start')?.focus({preventScroll:true});
  }
  async function remove(index:number) {
    filters=filters.filter((_,i)=>i!==index);
    await tick();document.getElementById('factor-stars-'+Math.min(index,filters.length-1)+'-start')?.focus({preventScroll:true});
  }
  async function duplicate(index:number) {
    filters=[...filters,{...filters[index]!,operator:'and'}];category='all';
    await tick();document.getElementById('factor-stars-'+(filters.length-1)+'-start')?.focus({preventScroll:true});
  }
  function closeOptions(event:MouseEvent) { (event.currentTarget as HTMLElement).closest<HTMLElement>('[popover]')?.hidePopover(); }
  function sumStars(index:number,combined:boolean) {
    const filter=filters[index]!,mode=combined ? 'total' : 'minimum';
    update(index,{mode,minLevel:Math.min(starCap(filter.scope,mode),filter.minLevel),maxLevel:undefined});
  }
  function setRange(index:number,minLevel:number,maxLevel:number) {
    const filter=filters[index]!,mode=filter.mode==='total' ? 'total' : minLevel===maxLevel ? 'exact' : 'minimum';
    update(index,{mode,minLevel,maxLevel:maxLevel===starCap(filter.scope,mode) ? undefined : maxLevel});
  }
</script>

{#snippet choice(factor:FactorMetadata,stat=false)}
  {@const selected=selectedIndex(Number(factor.id))>=0}
  <button type="button" class="spark-choice" class:selected aria-pressed={selected} aria-label={'Add '+factor.text+' spark'} onclick={()=>void choose(Number(factor.id))}>
    {#if stat}<img src={'/assets/images/icon/stats/'+factor.text.toLowerCase()+'.webp'} alt=""/>{/if}<span>{factor.text}</span>{#if selected}<Icon name="check" size={12}/>{/if}
  </button>
{/snippet}

<div class="spark-matcher">
  {#if category!=='all'}
    <div class="spark-browser">
      <header><span>{filters.length ? 'Add another spark' : 'Choose a spark'}</span><IconButton icon="close" label="Close spark choices" onclick={()=>category='all'}/></header>
      {#if category==='0'}
        <div class="quick-stats" role="group" aria-label="Add a blue stat spark">{#each factors.filter(factor=>factor.type===0) as factor}{@render choice(factor,true)}{/each}</div>
      {:else if category==='1'}
        <div class="quick-aptitudes" role="group" aria-label="Add an aptitude spark">{#each [{label:'Track',ids:[110,120]},{label:'Distance',ids:[310,320,330,340]},{label:'Running style',ids:[210,220,230,240]}] as group}<fieldset><legend>{group.label}</legend><div>{#each factors.filter(factor=>group.ids.includes(Number(factor.id))) as factor}{@render choice(factor)}{/each}</div></fieldset>{/each}</div>
      {:else if category==='5'}
        <div class="unique-sparks" role="group" aria-label="Add a unique spark">
          <TextField id="unique-spark-search" label="Search unique sparks" hideLabel type="search" prefixIcon="search" placeholder="Character or skill name…" bind:value={uniqueSearch}/>
          <div class="unique-options">{#each visibleUniques as {factor,character}}
            {@const selected=selectedIndex(Number(factor.id))>=0}
            <button type="button" class:selected aria-pressed={selected} aria-label={'Add '+factor.text+' spark'} onclick={()=>void choose(Number(factor.id))}>{#if character}<img src={characterImagePath(Number(character.id))} alt="" loading="lazy"/>{:else}<Icon name="star" size={28}/>{/if}<span>{#if character}<strong>{character.name}</strong>{/if}<small>{factor.text}</small></span><Icon name={selected ? 'check' : 'add'} size={14}/></button>
          {:else}<p class="no-unique-matches">No characters or unique skills match.</p>{/each}</div>
        </div>
      {:else if category==='white'}
        <WhiteFactorTypePicker id="veteran-spark-browser" mode="browse" selectedFactorIds={filters.map(filter=>filter.factorId)} onadd={ids=>void choose(ids[0]!)}/>
      {/if}
    </div>
  {/if}
  {#if filters.length}
    <div class="requirements" aria-label="Selected spark rules">
      {#each filters as filter,index}
        {@const factor=factors.find(factor=>Number(factor.id)===filter.factorId)}
        {@const type=factor?.type}
        {@const cap=Math.max(starCap(filter.scope,filter.mode),filter.minLevel)}
        {#if index}<span class="rule-join">{filter.operator==='or' ? 'or' : 'and'}</span>{/if}
        <div class="requirement">
          <div class="rule-heading">
            <div class="rule-menu">
              <InspectPopover label={'Spark options for rule '+(index+1)} align="end">
                {#snippet trigger()}<span class="spark-star" class:blue={type===0} class:pink={type===1} class:green={type===5} aria-hidden="true">★</span><strong class="rule-name" title="Change spark and matching options">{factor?.text??'Unknown spark'}</strong>{/snippet}
                <div class="advanced-spark">
                  <h4>Spark options</h4>
                  <div class="option-field"><SelectFieldSlim id={'factor-name-'+index} label="Spark" value={String(filter.factorId)} options={factors.filter(item=>item.type===type).sort((a,b)=>a.text.localeCompare(b.text)).map(item=>({value:String(item.id),label:item.text}))} onchange={value=>update(index,{factorId:Number(value)})}/></div>
                  <label class="combine-stars"><input type="checkbox" aria-label="Sum stars across family" checked={filter.mode==='total'} onchange={event=>sumStars(index,event.currentTarget.checked)}/><span>Combine stars across family</span></label>
                  {#if index}<div class="match-operator"><span>With the previous rule</span><SegmentedControl label={'Rule '+(index+1)+' operator'} options={[{value:'and',label:'AND'},{value:'or',label:'OR'}]} value={filter.operator??'and'} onchange={value=>update(index,{operator:value as 'and'|'or'})}/></div>{/if}
                  <div class="option-actions"><button type="button" aria-label={'Duplicate rule '+(index+1)} onclick={event=>{closeOptions(event);void duplicate(index);}}><Icon name="copy" size={13}/>Duplicate</button></div>
                </div>
              </InspectPopover>
            </div>
            <div class="rule-scope"><SelectFieldSlim id={'factor-scope-'+index} label="Where to match" hideLabel value={filter.scope} options={Object.keys(scopeLabels).map(scope=>({value:scope,label:scopes[scope as FactorScope]}))} onchange={value=>{const scope=value as FactorScope,cap=starCap(scope,filter.mode);update(index,{scope,maxLevel:filter.maxLevel==null ? undefined : Math.min(cap,filter.maxLevel),minLevel:Math.min(cap,filter.minLevel)});}}/></div>
            <span class="rule-remove"><IconButton icon="trash" size="sm" label={'Remove rule '+(index+1)} title={'Remove '+(factor?.text??'spark')+' filter'} onclick={()=>void remove(index)}/></span>
          </div>
          <div class="factor-range"><Slider id={'factor-stars-'+index} label="Stars" hideLabel showOutput={cap>9} unit="★" min={1} max={cap} step={1} range value={filter.minLevel} endValue={filter.mode==='exact' ? filter.minLevel : filter.maxLevel??cap} tone={type===0 ? 'blue' : type===1 ? 'pink' : type===5 ? 'green' : 'white'} showTicks={cap<=9} showTickLabels={cap<=9} tickLabels={Array.from({length:cap},(_,i)=>(i+1)+'★'+(filter.scope==='any' && filter.mode==='total' && i+1===cap ? '+' : ''))} onchange={(min,max)=>setRange(index,min,max??cap)}/></div>
        </div>
      {/each}
    </div>
  {/if}

</div>

<style>
  .spark-matcher,.requirements { min-width:0; display:grid; gap:4px; }.spark-matcher { gap:12px; }
  .requirement { min-width:0; display:grid; gap:2px; padding:8px 10px 10px; border:1px solid var(--border-primary); border-radius:8px; background:var(--bg-secondary); }
  .rule-heading { min-width:0; display:grid; grid-template-columns:minmax(0,1fr) 118px 26px; align-items:center; gap:4px; }.rule-name { min-width:0; color:var(--color-text); font-size:12px; font-weight:600; line-height:1.4; overflow-wrap:anywhere; }.spark-star { flex:none; color:var(--spark-white-text); font-size:13px; }.spark-star.blue { color:var(--accent-primary); }.spark-star.pink { color:var(--color-pink); }.spark-star.green { color:var(--accent-secondary); }
  .rule-menu { --inspect-popover-width:280px; --inspect-popover-padding:12px; min-width:0; }.rule-menu :global(.inspect) { width:100%; min-width:0; }.rule-menu :global(.trigger) { display:flex; align-items:center; gap:6px; width:fit-content; max-width:100%; min-height:28px; border-radius:4px; text-align:left; }.rule-menu :global(.trigger:hover) { text-decoration:underline; text-underline-offset:3px; }.rule-scope { --control-height:28px; min-width:0; }.rule-scope :global(.select-control) { padding:0 8px; gap:4px; font-size:11px; }.rule-scope :global(.select-panel) { left:auto; right:0; width:max(100%,170px); }.rule-scope :global(.select-panel button) { font-size:12px; }
  .rule-join { justify-self:center; color:var(--color-text-muted); font-size:9px; line-height:1.2; }
  .advanced-spark { display:grid; gap:10px; }.advanced-spark h4 { margin:0 32px 4px 0; font-size:12px; font-weight:600; line-height:24px; }.option-field { --control-height:34px; min-width:0; }.option-field :global(.select-control) { font-size:12px; }.option-field :global(label),.match-operator>span { color:var(--color-text-muted); font-size:11px; }.combine-stars { display:flex; align-items:center; gap:7px; min-height:32px; color:var(--color-text); font-size:11px; cursor:pointer; }.combine-stars input { width:15px; height:15px; margin:0; accent-color:var(--accent-primary); }.match-operator { display:flex; align-items:center; justify-content:space-between; gap:8px; }.match-operator :global(.segments) { padding:2px; border-radius:4px; }.match-operator :global(.segments button) { min-height:28px; padding:2px 8px; font-size:10px; }.option-actions { display:flex; justify-content:space-between; gap:6px; padding-top:6px; border-top:1px solid var(--border-subtle); }.option-actions button { display:flex; align-items:center; justify-content:center; gap:6px; min-height:30px; padding:4px 6px; border:0; border-radius:4px; background:transparent; color:var(--color-text-muted); font:inherit; font-size:11px; cursor:pointer; }.option-actions button:hover { background:var(--surface-3); color:var(--color-text); }.rule-remove :global(.icon-button) { width:26px; height:28px; }.rule-remove :global(svg) { width:14px; height:14px; }.rule-remove :global(.icon-button:hover) { color:var(--accent-error); }
  .factor-range { min-width:0; padding:0 7px 0 5px; }.factor-range :global(.slider-wrap),.factor-range :global(.thumb) { height:28px; }.factor-range :global(.visual-knob) { width:12px; height:12px; box-shadow:none; }.factor-range :global(.track) { height:3px; }.factor-range :global(.labels) { font-size:10px; }.factor-range :global(.labels span.active) { font-weight:500; }.spark-browser>header :global(.icon-button) { width:26px; height:28px; min-height:28px; padding:4px; border:0; background:transparent; color:var(--color-text-muted); }
  .spark-browser { min-width:0; display:grid; gap:8px; }.spark-browser>header { display:flex; align-items:center; justify-content:space-between; min-height:28px; color:var(--color-text-muted); font-size:10px; }
  .spark-choice { display:flex; align-items:center; justify-content:center; gap:5px; min-height:32px; padding:5px 9px; border:1px solid var(--border-secondary); border-radius:5px; background:var(--factor-field-bg); color:var(--color-text); font:inherit; font-size:11px; cursor:pointer; }.spark-choice:hover,.unique-options button:hover { background:var(--surface-3); border-color:var(--accent-primary); }.spark-choice.selected,.unique-options button.selected { border-color:var(--accent-primary); background:var(--factor-option-selected-bg); color:var(--factor-option-selected-text); }
  .quick-stats { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:4px; }.quick-stats .spark-choice { position:relative; display:grid; justify-items:center; align-content:center; min-height:54px; padding:5px 1px; font-size:10px; }.quick-stats img { width:18px; height:18px; }.quick-stats :global(svg) { position:absolute; top:2px; right:2px; }
  .quick-aptitudes,.unique-sparks { display:grid; gap:10px; }.quick-aptitudes fieldset { min-width:0; padding:0; margin:0; border:0; }.quick-aptitudes legend { padding:0; margin-bottom:6px; color:var(--color-text-muted); font-size:10px; }.quick-aptitudes fieldset>div { display:flex; flex-wrap:wrap; gap:4px; }
  .unique-sparks :global(input) { height:34px; font-size:11px; }.no-unique-matches { margin:8px 0; color:var(--color-text-muted); font-size:11px; }.unique-options { display:grid; gap:4px; max-height:300px; overflow-y:auto; overscroll-behavior:contain; scrollbar-width:thin; }.unique-options button { display:grid; grid-template-columns:32px minmax(0,1fr) 14px; align-items:center; gap:8px; min-height:48px; padding:5px 8px; border:1px solid var(--border-primary); border-radius:5px; background:var(--factor-field-bg); color:var(--color-text); text-align:left; font:inherit; cursor:pointer; }.unique-options img { width:32px; height:38px; object-fit:contain; }.unique-options button>span { display:grid; gap:2px; min-width:0; }.unique-options strong { font-size:11px; font-weight:600; }.unique-options small { color:var(--color-text-muted); font-size:10px; line-height:1.3; }
  button:focus-visible { outline:2px solid var(--accent-primary); outline-offset:-2px; }
  @media(pointer:coarse),(max-width:767px) { .rule-heading { grid-template-columns:minmax(0,1fr) 132px 32px; }.rule-remove :global(.icon-button) { width:32px; height:var(--touch-target); } .unique-sparks :global(input),.spark-choice,.rule-menu :global(.trigger),.rule-scope :global(.select-control),.option-field :global(.select-control),.combine-stars,.match-operator :global(.segments button),.option-actions button { min-height:var(--touch-target); }.spark-browser>header :global(.icon-button) { width:var(--touch-target); height:var(--touch-target); }.advanced-spark h4 { margin-right:36px; min-height:24px; }.factor-range :global(.slider-wrap),.factor-range :global(.thumb) { height:var(--touch-target); }.factor-range :global(.visual-knob) { width:18px; height:18px; } }
</style>

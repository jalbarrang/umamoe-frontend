<script lang="ts">
  import Button from '@/components/Button.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import ToggleButton from '@/components/ToggleButton.svelte';
  import SegmentedControl from '@/components/SegmentedControl.svelte';
  import TextField from '@/components/TextField.svelte';
  import SelectField from '@/components/SelectField.svelte';
  import SelectFieldSlim from '@/components/SelectFieldSlim.svelte';
  import Combobox from '@/components/Combobox.svelte';
  import Checkbox from '@/components/Checkbox.svelte';
  import RadioGroup from '@/components/RadioGroup.svelte';
  import Slider from '@/components/Slider.svelte';
  import FileDrop from '@/components/FileDrop.svelte';
  import Tabs from '@/components/Tabs.svelte';
  import DataTable from '@/components/DataTable.svelte';
  import Pagination from '@/components/Pagination.svelte';
  import Menu from '@/components/Menu.svelte';
  import Tooltip from '@/components/Tooltip.svelte';
  import Banner from '@/components/Banner.svelte';
  import EmptyState from '@/components/EmptyState.svelte';
  import Spinner from '@/components/Spinner.svelte';
  import ToastRegion, { type Toast } from '@/components/ToastRegion.svelte';
  import Dialog from '@/components/Dialog.svelte';
  import Disclosure from '@/components/Disclosure.svelte';
  import InspectPopover from '@/components/InspectPopover.svelte';
  import AffinityPicker from '@/components/AffinityPicker.svelte';
  import CharacterSelectDialog from '@/components/CharacterSelectDialog.svelte';
  import IncludeExcludePicker from '@/components/IncludeExcludePicker.svelte';
  import SupportCardPicker from '@/components/SupportCardPicker.svelte';
  import SkillChip from '@/components/SkillChip.svelte';
  import SparkRow from '@/components/SparkRow.svelte';
  import StatStrip from '@/components/StatStrip.svelte';
  import RankBadge from '@/components/RankBadge.svelte';
  import AptitudeGrid from '@/components/AptitudeGrid.svelte';
  import LineageTree from '@/components/LineageTree.svelte';
  import RaceBadge from '@/components/RaceBadge.svelte';
  import RaceSchedule from '@/components/RaceSchedule.svelte';
  import TimelineEventCard from '@/components/TimelineEventCard.svelte';
  import CircleCard from '@/components/CircleCard.svelte';
  import DemoBlock from './DemoBlock.svelte';
  import { characterPickerOptions, supportCardOptions, veteranFixture, statFixtures, aptitudeFixtures, blueSparks, pinkSparks, greenSparks, whiteSparks, skillSpeedIcon, skillRecoveryIcon, lineageRoot, lineageBranches, raceYears, raceImageG1, timelineEvent } from './fixtures';
  let { ids }: { ids: string[] } = $props();
  let textValue = $state('Mejiro McQueen'), searchValue = $state(''), numberValue = $state('');
  let region = $state('global'), character = $state(''), storage = $state('local'), segment = $state('cards');
  let checked = $state(true), compact = $state(true), minimum = $state(2), maximum = $state(7);
  let tab = $state('database'), page = $state(1), dialogOpen = $state(false);
  let toasts = $state<Toast[]>([]);
  function notify(message = 'Preview saved') { toasts = [{ id: String(Date.now()), title: message, tone: 'success' }]; }
  let target = $state('mcqueen'), targetOpen = $state(false), legacy = $state(true);
  let include = $state(['oguri']), exclude = $state<string[]>([]), pickerOpen = $state(false), pickerMode = $state<'include' | 'exclude'>('include');
  const items = (values: string[]) => characterPickerOptions.filter(item => values.includes(item.id)).map(item => ({ id:item.id, label:item.name, image:item.image }));
  let support = $state('support-speed'), lineage = $state('lineage-main'), selectedRace = $state(''), planned = $state(false);
</script>

{#if ids.includes('button')}<DemoBlock id="button"><div class="preview-stack">
  <div class="preview-row"><Button onclick={() => notify()}>Save</Button><Button variant="secondary" icon="download" onclick={() => notify('Export preview')}>Export</Button><Button variant="ghost">Cancel</Button><Button variant="danger" icon="trash">Delete</Button><Button loading>Saving</Button><Button disabled>Unavailable</Button><IconButton icon="filter" label="Filters" selected/></div>
  <div class="preview-row"><ToggleButton label="Compact gaps" icon="refresh" pressed={compact} onclick={() => compact = !compact}/><SegmentedControl label="Display" options={[{value:'cards',label:'Cards'},{value:'table',label:'Table'}]} bind:value={segment}/></div>
</div></DemoBlock>{/if}
{#if ids.includes('text-field')}<DemoBlock id="text-field"><div class="preview-grid"><div class="preview-stack"><TextField id="name" label="Veteran name" bind:value={textValue}/><TextField id="search" type="search" label="Search database" bind:value={searchValue} placeholder="Character, skill, factor…"/><TextField id="invalid" label="Share code" value="ABC" error="The share code must contain 12 characters."/></div><div class="preview-stack"><TextField id="number-field" label="Number" type="number" min={0} max={2} step={0.25} bind:value={numberValue} help="Steps of 0.25, between 0 and 2."/><TextField id="readonly-number" label="Read only number" type="number" value="1" readonly/><TextField id="disabled-number" label="Disabled number" type="number" value="1" disabled/></div></div></DemoBlock>{/if}
{#if ids.includes('select')}<DemoBlock id="select"><div class="preview-grid"><SelectField id="region" label="Data region" options={[{value:'global',label:'Global'},{value:'jp',label:'Japan'}]} bind:value={region}/><SelectFieldSlim id="region-slim" label="Data region (slim)" options={[{value:'global',label:'Global'},{value:'jp',label:'Japan'}]} bind:value={region}/><Combobox id="character" label="Character" bind:value={character} placeholder="Start typing a name" options={characterPickerOptions.map(item => ({value:item.name,label:item.name,image:item.image}))}/></div></DemoBlock>{/if}
{#if ids.includes('choice')}<DemoBlock id="choice"><div class="preview-grid"><div class="preview-stack"><Checkbox id="include-inheritance" label="Include inheritance factors" bind:checked/><Checkbox id="partial-choice" label="Select visible results" indeterminate/><Checkbox id="disabled-choice" label="Unavailable option" disabled/><RadioGroup id="storage" legend="Default storage" bind:value={storage} options={[{value:'local',label:'Local device'},{value:'account',label:'Linked account'}]}/></div><Slider id="factor-range" label="Blue factor stars" range min={1} max={9} step={1} tone="blue" showTicks showTickLabels tickLabels={['1★','2★','3★','4★','5★','6★','7★','8★','9★']} bind:value={minimum} bind:endValue={maximum}/></div></DemoBlock>{/if}
{#if ids.includes('file')}<DemoBlock id="file"><div class="preview-narrow"><FileDrop id="veteran-import" accept=".json,application/json" onfiles={files => notify(`${files.length} file(s) selected — preview only`)}/></div></DemoBlock>{/if}
{#if ids.includes('navigation')}<DemoBlock id="navigation"><div class="preview-stack"><div class="preview-narrow"><Tabs label="Database source" items={[{id:'database',label:'Database'},{id:'bookmarks',label:'Bookmarks',badge:'6'}]} bind:value={tab}/></div><Pagination pages={834} total={10000} pageSize={12} jump bind:page/></div></DemoBlock>{/if}
{#if ids.includes('table')}<DemoBlock id="table"><DataTable caption="Veteran comparison" columns={[{key:'name',label:'Veteran',priority:'primary'},{key:'rank',label:'Rank'},{key:'speed',label:'Speed',numeric:true},{key:'distance',label:'Distance',priority:'secondary'}]} rows={[{name:'Mejiro McQueen',rank:'UE1',speed:1542,distance:'Long'},{name:'Oguri Cap',rank:'UF4',speed:1430,distance:'Mile'}]}/></DemoBlock>{/if}
{#if ids.includes('menu')}<DemoBlock id="menu"><div class="preview-row"><Menu label="Trainer" icon="user" menuLabel="Account" items={[{id:'profile',label:'My profile',icon:'user'},{id:'settings',label:'Settings',icon:'tune',href:'/settings'},{id:'signout',label:'Sign out',icon:'arrow-right',separator:true}]} onselect={() => notify('Account action preview')}/><Tooltip text="Open filters"><IconButton icon="filter" label="Filter tooltip"/></Tooltip></div></DemoBlock>{/if}
{#if ids.includes('feedback')}<DemoBlock id="feedback"><div class="preview-stack"><Banner title="Dataset updated" tone="success"><p>Your collection is up to date.</p></Banner><Banner title="Offline changes pending" tone="warning"><p>Changes will sync when the connection returns.</p></Banner><Banner title="Import failed" tone="danger"><p>Check the file and try again.</p></Banner><EmptyState compact icon="veterans" title="No Veterans yet" description="Import a compatible JSON file to start your collection.">{#snippet actions()}<Button size="sm" icon="upload" onclick={() => notify('Import preview')}>Import</Button>{/snippet}</EmptyState><div class="preview-row"><Spinner/><span>Loading…</span><Button variant="secondary" onclick={() => notify()}>Show toast</Button></div></div></DemoBlock>{/if}
{#if ids.includes('dialog')}<DemoBlock id="dialog"><div class="preview-stack"><div class="preview-row"><Button onclick={() => dialogOpen = true}>Open dialog</Button><InspectPopover label="Swinging Maestro details">{#snippet trigger()}<SkillChip icon={skillRecoveryIcon} name="Swinging Maestro" rarity="gold"/>{/snippet}<p>Recover endurance on a corner with good positioning.</p></InspectPopover></div><Disclosure id="lab-history" title="Fan history" description="Monthly totals and ranks" icon="timeline"><p>Optional details expand beneath the section heading.</p></Disclosure></div></DemoBlock>{/if}
{#if ids.includes('affinity-picker')}<DemoBlock id="affinity-picker"><div class="preview-narrow"><AffinityPicker target={characterPickerOptions.find(item => item.id === target)} veteran={legacy ? veteranFixture : undefined} ontargetpick={() => targetOpen = true} ontargetclear={() => target = ''} onlegacypick={() => legacy = true} onlegacyclear={() => legacy = false}/></div><CharacterSelectDialog bind:open={targetOpen} options={characterPickerOptions} selected={target ? [target] : []} onselect={values => {target = values[0] ?? ''; targetOpen = false;}}/></DemoBlock>{/if}
{#if ids.includes('character-picker')}<DemoBlock id="character-picker"><div class="preview-narrow"><IncludeExcludePicker label="This veteran" compact included={items(include)} excluded={items(exclude)} onadd={mode => {pickerMode = mode; pickerOpen = true;}} onremove={(mode,id) => {if(mode === 'include') include = include.filter(value => value !== id); else exclude = exclude.filter(value => value !== id);}}/></div><CharacterSelectDialog bind:open={pickerOpen} options={characterPickerOptions} mode={pickerMode} multiple selected={pickerMode === 'include' ? include : exclude} onselect={values => {if(pickerMode === 'include') include = values; else exclude = values;}}/></DemoBlock>{/if}
{#if ids.includes('support-picker')}<DemoBlock id="support-picker"><div class="preview-narrow"><SupportCardPicker options={supportCardOptions} bind:value={support}/></div></DemoBlock>{/if}
{#if ids.includes('identity')}<DemoBlock id="identity"><div class="preview-stack"><div class="preview-row"><SkillChip icon={skillRecoveryIcon} name="Swinging Maestro" level="Lv.1" rarity="gold"/><SkillChip icon={skillSpeedIcon} name="Long-Distance Corner ○" level="Lv.3"/><SkillChip icon={skillSpeedIcon} name="Shooting Star" level="Lv.2" rarity="unique-main"/><RankBadge label="UE1"/></div><StatStrip items={statFixtures}/><AptitudeGrid items={aptitudeFixtures}/><SparkRow tone="blue" items={blueSparks}/><SparkRow tone="pink" items={pinkSparks}/><SparkRow tone="green" items={greenSparks}/><SparkRow tone="white" items={whiteSparks}/></div></DemoBlock>{/if}
{#if ids.includes('lineage')}<DemoBlock id="lineage"><LineageTree root={lineageRoot} branches={lineageBranches} selectedId={lineage} onselect={node => lineage = node.id}/></DemoBlock>{/if}
{#if ids.includes('race-schedule')}<DemoBlock id="race-schedule"><div class="preview-stack"><div class="preview-row"><RaceBadge race={{id:'g1-demo',name:'Arima Kinen',grade:'G1',image:raceImageG1,placement:1}}/><RaceBadge compact race={{id:'g1-compact',name:'Arima Kinen',grade:'G1',image:raceImageG1}}/></div><RaceSchedule years={raceYears} onselect={race => selectedRace = race.name}/>{#if selectedRace}<span>Selected race: {selectedRace}</span>{/if}</div></DemoBlock>{/if}
{#if ids.includes('timeline-card')}<DemoBlock id="timeline-card"><div style="max-width:360px"><TimelineEventCard event={timelineEvent} bind:planned onopen={() => notify('Event details preview')}/></div></DemoBlock>{/if}
{#if ids.includes('circle-card')}<DemoBlock id="circle-card"><div class="preview-stack"><CircleCard circle={{circleId:1,name:'Team Sirius',rank:12,members:29,monthlyFans:1200000000,liveFans:1310000000,clubRank:9,joinStyle:2,leaderName:'Trainer'}}/><CircleCard layout="summary" circle={{circleId:1,name:'Team Sirius',rank:12,liveRank:9,members:29,monthlyFans:1200000000,liveFans:1310000000,clubRank:9}}/></div></DemoBlock>{/if}
<Dialog id="preview-dialog" title="Preview dialog" description="The same dialog used throughout the site." mobileSheet bind:open={dialogOpen}><p>Tab stays inside the dialog. Press Escape to close.</p>{#snippet actions()}<Button variant="ghost" onclick={() => dialogOpen = false}>Cancel</Button><Button onclick={() => {dialogOpen = false; notify();}}>Save</Button>{/snippet}</Dialog>
<ToastRegion {toasts} ondismiss={id => toasts = toasts.filter(item => item.id !== id)}/>

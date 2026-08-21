<script lang="ts">
  import { theme, setTheme, toggleTheme, type Theme } from '../../platform/theme';
  import { setMockClientState } from '../../platform/client/client-state';
  import Artwork from '../../ui/Artwork.svelte';
  import Badge from '../../ui/Badge.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Breadcrumbs from '../../ui/Breadcrumbs.svelte';
  import Button from '../../ui/Button.svelte';
  import Card from '../../ui/Card.svelte';
  import Checkbox from '../../ui/Checkbox.svelte';
  import ClientIndicator from '../../ui/ClientIndicator.svelte';
  import Combobox from '../../ui/Combobox.svelte';
  import DataTable from '../../ui/DataTable.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import FileDrop from '../../ui/FileDrop.svelte';
  import FilterChip from '../../ui/FilterChip.svelte';
  import GameIcon from '../../ui/GameIcon.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import LogoMark from '../../ui/LogoMark.svelte';
  import Menu from '../../ui/Menu.svelte';
  import Pagination from '../../ui/Pagination.svelte';
  import Progress from '../../ui/Progress.svelte';
  import RadioGroup from '../../ui/RadioGroup.svelte';
  import RangeField from '../../ui/RangeField.svelte';
  import SkillChip from '../../ui/SkillChip.svelte';
  import Slider from '../../ui/Slider.svelte';
  import SparkRow from '../../ui/SparkRow.svelte';
  import SegmentedControl from '../../ui/SegmentedControl.svelte';
  import SelectField from '../../ui/SelectField.svelte';
  import Skeleton from '../../ui/Skeleton.svelte';
  import Spinner from '../../ui/Spinner.svelte';
  import StatTile from '../../ui/StatTile.svelte';
  import StatusPill from '../../ui/StatusPill.svelte';
  import Switch from '../../ui/Switch.svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import TextArea from '../../ui/TextArea.svelte';
  import TextField from '../../ui/TextField.svelte';
  import ToastRegion, { type Toast } from '../../ui/ToastRegion.svelte';
  import Tooltip from '../../ui/Tooltip.svelte';
  import VeteranSelector from '../../ui/VeteranSelector.svelte';
  import VirtualList from '../../ui/VirtualList.svelte';
  import WorkspaceSwitcher from '../../ui/WorkspaceSwitcher.svelte';
  import { formatScreenRange, REVIEW_VIEWPORTS, SCREEN_LAYOUTS } from '../../ui/layout/breakpoints';
  import { componentCount, uiRegistry } from '../../ui/registry';
  import DemoBlock from './DemoBlock.svelte';
  import LabSection from './LabSection.svelte';
  import LayoutFixture from './LayoutFixture.svelte';
  import PageFrameFixture from './PageFrameFixture.svelte';
  import ShellFixture from './ShellFixture.svelte';
  import oguriCapImage from './fixtures/oguri-cap.webp';
  import mejiroMcQueenImage from './fixtures/mejiro-mcqueen.webp';
  import kitasanBlackImage from './fixtures/kitasan-black.webp';
  import kitasanBlackSupportImage from './fixtures/kitasan-black-support.webp';
  import skillSpeedIcon from './fixtures/skill-speed.webp';
  import skillRecoveryIcon from './fixtures/skill-recovery.webp';
  import caratIcon from './fixtures/item-carats.webp';

  let density = $state('comfortable');
  let reducedMotion = $state(false);
  let segment = $state('overview');
  let textValue = $state('Mejiro McQueen');
  let searchValue = $state('');
  let selectValue = $state('global');
  let comboboxValue = $state('');
  let textareaValue = $state('');
  let checkboxValue = $state(true);
  let switchValue = $state(true);
  let radioValue = $state('local');
  let rangeValue = $state(72);
  let factorMinimum = $state(2);
  let factorMaximum = $state(7);
  let parentFactorMinimum = $state(2);
  let selectedFilter = $state(true);
  let selectedTab = $state('overview');
  let dialogOpen = $state(false);
  let sheetOpen = $state(false);
  let page = $state(3);
  let viewport = $state(390);
  let veteran = $state('v-1');
  let toasts = $state<Toast[]>([]);

  const viewports = REVIEW_VIEWPORTS;
  const colors = [
    ['Page', 'var(--bg-primary)'], ['Navbar', 'var(--bg-secondary)'], ['Panel', 'var(--bg-tertiary)'],
    ['Border', 'var(--border-primary)'], ['Text', 'var(--text-primary)'], ['Muted', 'var(--text-secondary)'],
    ['Blue', 'var(--accent-primary)'], ['Green', 'var(--accent-secondary)'], ['Orange', 'var(--accent-warning)'],
    ['Red', 'var(--accent-error)'], ['Purple', 'var(--accent-purple)'], ['Pink', 'var(--accent-pink)']
  ];
  const tableRows = [
    { name: 'Oguri Cap', rank: 'UF4', speed: 1542, stamina: 1088, distance: 'Mile / Medium' },
    { name: 'Mejiro McQueen', rank: 'UE1', speed: 1470, stamina: 1312, distance: 'Long' },
    { name: 'Kitasan Black', rank: 'UF8', speed: 1588, stamina: 1194, distance: 'Medium / Long' }
  ];
  const characterFixtures = [
    { name: 'Oguri Cap', image: oguriCapImage },
    { name: 'Mejiro McQueen', image: mejiroMcQueenImage },
    { name: 'Kitasan Black', image: kitasanBlackImage }
  ];
  const virtualItems = Array.from({ length: 2500 }, (_, index) => {
    const character = characterFixtures[index % characterFixtures.length]!;
    return { id: index + 1, name: `${character.name} · ${String(index + 1).padStart(4, '0')}`, image: character.image, rank: ['UG', 'UF', 'UE'][index % 3] };
  });
  const veteranOptions = [
    { id: 'v-1', name: 'Mejiro McQueen', rank: 'UE1', detail: 'Long · Leader', workspace: 'Local', updated: '4 min ago', image: mejiroMcQueenImage },
    { id: 'v-2', name: 'Oguri Cap', rank: 'UF4', detail: 'Mile · Betweener', workspace: 'Local', updated: 'Yesterday', image: oguriCapImage },
    { id: 'v-3', name: 'Kitasan Black', rank: 'UF8', detail: 'Medium · Runner', workspace: 'Linked account', updated: '2 days ago', image: kitasanBlackImage }
  ];
  const blueSparks = [
    { id: 'speed', name: 'Speed', level: 3, chance: '10%', source: 'main' as const },
    { id: 'stamina', name: 'Stamina', level: 2, chance: '5%', source: 'parent' as const }
  ];
  const pinkSparks = [{ id: 'long', name: 'Long', level: 3, chance: '10%', source: 'main' as const }];
  const greenSparks = [{ id: 'unique', name: 'The View from the Lead Is Mine!', level: 2, source: 'parent' as const }];
  const whiteSparks = [{ id: 'maestro', name: 'Swinging Maestro', level: 2, chance: '5%', source: 'p2' as const }];

  $effect(() => {
    document.documentElement.dataset.density = density;
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'system';
  });

  function showToast(tone: Toast['tone'] = 'success') {
    const id = crypto.randomUUID();
    toasts = [...toasts, { id, title: 'Veteran saved', message: 'Stored in the Local workspace.', tone }];
  }

  function previewClientState(value: string) { setMockClientState(value as Parameters<typeof setMockClientState>[0]); }
</script>

<svelte:head><title>UI Lab · uma.moe beta</title><meta name="robots" content="noindex,nofollow" /></svelte:head>

<div class="lab-shell">
  <header class="lab-bar">
    <a class="lab-brand" href="/ui-lab"><LogoMark size={30}/><span><strong>uma.moe</strong><small>UI lab</small></span></a>
    <div class="lab-controls">
      <SegmentedControl label="Theme" options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} value={$theme} onchange={(value) => setTheme(value as Theme)}/>
      <SegmentedControl label="Density" options={[{ value: 'comfortable', label: 'Touch' }, { value: 'compact', label: 'Compact' }]} bind:value={density}/>
      <Switch id="reduced-motion" label="Reduce motion" bind:checked={reducedMotion}/>
    </div>
    <div class="mobile-controls">
      <IconButton icon={$theme === 'dark' ? 'sun' : 'moon'} label="Toggle theme" onclick={toggleTheme}/>
      <IconButton icon="menu" label="Toggle density" selected={density === 'compact'} onclick={() => density = density === 'compact' ? 'comfortable' : 'compact'}/>
      <IconButton icon="activity" label="Toggle reduced motion" selected={reducedMotion} onclick={() => reducedMotion = !reducedMotion}/>
    </div>
  </header>

  <aside class="lab-index">
    <div class="index-head"><strong>{componentCount} contracts</strong><span>v0 · review</span></div>
    <nav aria-label="UI lab sections">
      {#each uiRegistry as section}<a href="#{section.id}"><span>{section.title}</span><small>{section.entries.length}</small></a>{/each}
    </nav>
    <p>Beta/dev only. This module is removed from production builds.</p>
  </aside>

  <main class="lab-main">
    <section class="lab-intro">
      <div><Badge tone="accent">Svelte port · review</Badge><h1>uma.moe UI system</h1><p>The existing uma.moe visual language rebuilt as lightweight Svelte components: familiar colors, compact data controls, and touch-friendly behavior.</p></div>
      <dl><div><dt>Target</dt><dd>≤25 KB CSS</dd></div><div><dt>Touch</dt><dd>44×44 min</dd></div><div><dt>DOM</dt><dd>&lt;1,500 nodes</dd></div></dl>
    </section>

    <LabSection id="tokens" title="Foundation" description="The original Angular palette, type rhythm, radii, and elevations are the source of truth. Svelte components consume stable semantic aliases.">
      <DemoBlock title="Original color roles" note="Ported from src/styles.scss"><div class="swatches">{#each colors as color}<div><span style:background={color[1]}></span><strong>{color[0]}</strong><code>{color[1]}</code></div>{/each}</div></DemoBlock>
      <div class="demo-grid">
        <DemoBlock title="Type scale"><div class="type-scale"><span style="font-size:var(--font-display)">Display</span><span style="font-size:var(--font-xl)">Page title</span><span style="font-size:var(--font-lg)">Section title</span><span>Body text stays readable</span><small>Supporting information</small><code>structured_data: true</code></div></DemoBlock>
        <DemoBlock title="Spacing, radius, elevation"><div class="token-shapes"><span class="space-s">4</span><span class="space-m">12</span><span class="space-l">24</span><div class="radius-s">Small</div><div class="radius-l">Large</div><div class="elevation">One practical elevation</div></div></DemoBlock>
      </div>
      <DemoBlock title="Screen breakpoint contract" note="Screen width changes the shell; components use their own container width">
        <div class="breakpoint-contract">{#each SCREEN_LAYOUTS as layout}<article data-mode={layout.id}><strong>{layout.label}</strong><span>{formatScreenRange(layout)}</span><small>{layout.navigation}</small></article>{/each}</div>
        <p class="review-widths">Release fixtures: {viewports.join(' · ')}px</p>
      </DemoBlock>
    </LabSection>

    <LabSection id="actions" title="Actions" description="One visual primary per decision area. Secondary and ghost actions stay discoverable without competing for attention.">
      <DemoBlock title="Buttons" note="Default · hover · focus · active · loading · disabled">
        <div class="state-row"><Button>Save Veteran</Button><Button variant="secondary" icon="download">Export</Button><Button variant="ghost">Cancel</Button><Button variant="danger" icon="trash">Delete</Button><Button loading>Saving</Button><Button disabled>Unavailable</Button></div>
      </DemoBlock>
      <div class="demo-grid">
        <DemoBlock title="Icon actions"><div class="state-row"><IconButton icon="search" label="Search"/><IconButton icon="filter" label="Filter" selected/><IconButton icon="refresh" label="Refresh"/><IconButton icon="trash" label="Delete" disabled/><Tooltip text="Opens the route and action launcher"><IconButton icon="menu" label="Open launcher"/></Tooltip></div></DemoBlock>
        <DemoBlock title="Segmented control"><SegmentedControl label="Race Lab view" options={[{ value: 'overview', label: 'Overview' }, { value: 'analysis', label: 'Analysis' }, { value: 'setup', label: 'Setup', disabled: true }]} bind:value={segment}/></DemoBlock>
      </div>
    </LabSection>

    <LabSection id="inputs" title="Inputs" description="The Angular factor fields, selects, autocomplete panels, focus treatment, spacing, and option states are carried over without Material.">
      <div class="demo-grid">
        <DemoBlock title="Text and search"><div class="state-stack"><TextField id="name" label="Veteran name" bind:value={textValue} help="A private label stored in this workspace."/><TextField id="search" type="search" label="Search database" bind:value={searchValue} placeholder="Character, skill, factor…"/><TextField id="invalid" label="Share code" value="ABC" error="The share code must contain 12 characters."/><TextField id="disabled-field" label="Account ID" value="Not connected" disabled/></div></DemoBlock>
        <DemoBlock title="Select and combobox"><div class="state-stack"><SelectField id="region" label="Data region" options={[{ value: 'global', label: 'Global' }, { value: 'jp', label: 'Japan' }]} bind:value={selectValue}/><Combobox id="character" label="Character" bind:value={comboboxValue} placeholder="Start typing a name" options={[{ value: 'Oguri Cap', label: 'Oguri Cap', image: oguriCapImage }, { value: 'Mejiro McQueen', label: 'Mejiro McQueen', image: mejiroMcQueenImage }, { value: 'Kitasan Black', label: 'Kitasan Black', image: kitasanBlackImage }]}/><TextArea id="notes" label="Notes" bind:value={textareaValue} placeholder="Optional private notes…" help="Never included in public metadata."/></div></DemoBlock>
      </div>
      <div class="demo-grid">
        <DemoBlock title="Choice controls"><div class="state-stack"><Checkbox id="include-inheritance" label="Include inheritance factors" description="Adds parent and grandparent factors." bind:checked={checkboxValue}/><Checkbox id="partial-choice" label="Select visible results" indeterminate/><Checkbox id="disabled-choice" label="Unavailable option" disabled/><RadioGroup id="storage" legend="Default storage" bind:value={radioValue} options={[{ value: 'local', label: 'Local device', description: 'No login required.' }, { value: 'account', label: 'Linked account', description: 'Sync between devices.' }]}/><Switch id="auto-save" label="Automatic Veteran saves" description="Completed imports are persisted automatically." bind:checked={switchValue}/></div></DemoBlock>
        <DemoBlock title="Range and file input"><div class="state-stack"><RangeField id="replay-speed" label="Replay speed" min={25} max={200} step={25} unit="%" bind:value={rangeValue}/><FileDrop id="veteran-import" accept=".json,application/json" onfiles={() => showToast('success')}/></div></DemoBlock>
      </div>
      <DemoBlock title="Database filter sliders" note="Single threshold and two-thumb interval · tick marks · keyboard and touch input">
        <div class="slider-examples">
          <Slider id="factor-range" label="Blue factor stars" range min={1} max={9} step={1} tone="blue" showTicks showTickLabels tickLabels={['1★','2★','3★','4★','5★','6★','7★','8★','9★']} bind:value={factorMinimum} bind:endValue={factorMaximum}/>
          <Slider id="factor-minimum" label="Minimum main-parent stars" min={1} max={3} step={1} tone="green" selection="after" showTicks showTickLabels tickLabels={['1★','2★','3★']} bind:value={parentFactorMinimum}/>
        </div>
      </DemoBlock>
    </LabSection>

    <LabSection id="navigation" title="Navigation" description="The same information architecture changes presentation at shell breakpoints; feature navigation stays inside the feature.">
      <DemoBlock title="Responsive shell fixture" note="Actual container-query transition">
        <div class="fixture-controls"><span>Viewport</span>{#each viewports as width}<button class:active={viewport === width} onclick={() => viewport = width}>{width}</button>{/each}</div>
        <ShellFixture width={viewport}/>
      </DemoBlock>
      <DemoBlock title="Responsive page layouts" note="Stack, filter sidebar, and fluid results grid use the same reviewed widths">
        <div class="fixture-controls"><span>Viewport</span>{#each viewports as width}<button class:active={viewport === width} onclick={() => viewport = width}>{width}</button>{/each}</div>
        <LayoutFixture width={viewport}/>
      </DemoBlock>
      <DemoBlock title="Page gutters and ad regions" note="Primary content stays first; Publift side rails render as a balanced pair or not at all">
        <div class="fixture-controls"><span>Viewport</span>{#each viewports as width}<button class:active={viewport === width} onclick={() => viewport = width}>{width}</button>{/each}</div>
        <PageFrameFixture width={viewport}/>
      </DemoBlock>
      <div class="demo-grid">
        <DemoBlock title="Local navigation"><div class="state-stack"><Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Race Lab', href: '/race-lab' }, { label: 'Analysis' }]}/><Tabs label="Race Lab" items={[{ id: 'overview', label: 'Overview' }, { id: 'logs', label: 'UmaLogs', badge: '12' }, { id: 'analysis', label: 'Analysis' }, { id: 'setup', label: 'Setup' }]} bind:value={selectedTab}/></div></DemoBlock>
        <DemoBlock title="Pagination"><Pagination pages={12} bind:page/></DemoBlock>
      </div>
    </LabSection>

    <LabSection id="feedback" title="Feedback" description="Feedback is direct and descriptive. Connection and sync states always include text and never pulse.">
      <DemoBlock title="Banners"><div class="state-stack"><Banner title="Dataset updated" tone="success"><p>Global data is current as of 18:42 UTC.</p></Banner><Banner title="Offline changes pending" tone="warning" dismissible><p>Three Veterans will sync when the connection returns.</p></Banner><Banner title="Import failed" tone="danger"><p>Nothing was changed. Fix the invalid records and try again.</p></Banner></div></DemoBlock>
      <div class="demo-grid">
        <DemoBlock title="Progress and loading"><div class="state-stack"><Progress label="Importing Veterans" value={67}/><Progress label="Preparing race replay" indeterminate/><div class="state-row"><Spinner/><span class="muted">Connecting…</span></div><Skeleton height="18px" width="72%"/><Skeleton height="64px"/></div></DemoBlock>
        <DemoBlock title="Empty states"><EmptyState compact icon="veterans" title="No Veterans yet" description="Import a compatible JSON file or connect the desktop client.">{#snippet actions()}<Button size="sm" icon="upload">Import</Button>{/snippet}</EmptyState></DemoBlock>
      </div>
      <DemoBlock title="Status and notifications"><div class="state-row"><StatusPill label="Connected" tone="success"/><StatusPill label="Sync pending" tone="warning"/><StatusPill label="Version incompatible" tone="danger"/><StatusPill label="Cloud fallback" tone="info"/><Button variant="secondary" onclick={() => showToast()}>Show toast</Button></div></DemoBlock>
    </LabSection>

    <LabSection id="overlays" title="Overlays" description="Native dialog behavior supplies the focus trap and Escape handling; menu and tooltip use disclosure and CSS instead of an overlay runtime.">
      <DemoBlock title="Dialog, sheet, menu, tooltip"><div class="state-row"><Button onclick={() => dialogOpen = true}>Open dialog</Button><Button variant="secondary" onclick={() => sheetOpen = true}>Open mobile sheet</Button><Menu label="Actions" items={[{ id: 'edit', label: 'Edit Veteran', icon: 'user' }, { id: 'export', label: 'Export JSON', icon: 'download' }, { id: 'delete', label: 'Delete', icon: 'trash', danger: true }]}/><Tooltip text="Uses native browser focus behavior"><Button variant="ghost" icon="info">Why?</Button></Tooltip></div></DemoBlock>
      <Dialog id="confirm-demo" title="Replace Local workspace?" description="A recovery snapshot is created before replacement." bind:open={dialogOpen}>
        <Banner title="This affects 43 Veterans" tone="warning"><p>You can recover the current device state from Settings for 30 days.</p></Banner>
        {#snippet actions()}<Button variant="ghost" onclick={() => dialogOpen = false}>Cancel</Button><Button variant="danger" onclick={() => { dialogOpen = false; showToast('warning'); }}>Replace device</Button>{/snippet}
      </Dialog>
      <Dialog id="sheet-demo" title="More" description="Secondary destinations stay one tap away." mobileSheet bind:open={sheetOpen}>
        <div class="sheet-links"><a href="#navigation">Timeline</a><a href="#navigation">Community</a><a href="#navigation">Tools</a><a href="#navigation">Settings</a></div>
      </Dialog>
    </LabSection>

    <LabSection id="data" title="Data patterns" description="Small sets use semantic tables and cards; large sets use a fixed-row virtual window so DOM size stays constant.">
      <DemoBlock title="Stat tiles"><div class="stats"><StatTile label="Veterans" value="2,481" detail="+18 this week" trend="up" tone="accent"/><StatTile label="Synced" value="98.7%" detail="32 pending" tone="success"/><StatTile label="Race logs" value="14,209" detail="Last 30 days"/><StatTile label="Conflicts" value="2" detail="Needs review" tone="warning"/></div></DemoBlock>
      <DemoBlock title="Filters and sort"><div class="state-row"><FilterChip label="All" count={2481} selected/><FilterChip label="Long" count={412} bind:selected={selectedFilter}/><FilterChip label="Runner" count={188}/><FilterChip label="UE+" count={74}/><FilterChip label="Imported today" removable/><Button variant="ghost" size="sm" icon="sort">Evaluation</Button></div></DemoBlock>
      <DemoBlock title="Responsive table" note="Secondary columns hide below 520px"><DataTable caption="Veteran comparison" columns={[{ key: 'name', label: 'Veteran', priority: 'primary' }, { key: 'rank', label: 'Rank' }, { key: 'speed', label: 'Speed', numeric: true }, { key: 'stamina', label: 'Stamina', numeric: true, priority: 'secondary' }, { key: 'distance', label: 'Distance', priority: 'secondary' }]} rows={tableRows}/></DemoBlock>
      <DemoBlock title="Virtual list" note="2,500 records · roughly 20 live rows">
        <VirtualList items={virtualItems} rowHeight={54} height={320} label="Veterans">
          {#snippet row(item, index)}<div class="virtual-row"><Artwork src={item.image} alt={item.name} size="sm"/><span><strong>{item.name}</strong><small>Local · record {index + 1}</small></span><Badge tone="accent">{item.rank}</Badge></div>{/snippet}
        </VirtualList>
      </DemoBlock>
    </LabSection>

    <LabSection id="domain" title="Domain patterns" description="These shared patterns keep game vocabulary consistent while allowing every feature to own its data and behavior.">
      <div class="demo-grid">
        <DemoBlock title="Real game artwork and icons"><div class="state-row"><Artwork src={mejiroMcQueenImage} alt="Mejiro McQueen" size="lg" rarity="★5"/><Artwork src={kitasanBlackSupportImage} alt="Kitasan Black support card" kind="card" size="lg" rarity="SSR"/><span class="item-example"><GameIcon src={caratIcon} alt="Carats" size={36}/><span><strong>Carats</strong><small>Item icon</small></span></span></div></DemoBlock>
        <DemoBlock title="Skills"><div class="skill-examples"><SkillChip icon={skillRecoveryIcon} name="Swinging Maestro" level="Lv.1" rarity="gold"/><SkillChip icon={skillSpeedIcon} name="Long-Distance Corner ○" level="Lv.3"/><SkillChip icon={skillSpeedIcon} name="The View from the Lead Is Mine!" level="Lv.2" rarity="unique-main"/></div></DemoBlock>
      </div>
      <div class="demo-grid">
        <DemoBlock title="Inheritance sparks"><div class="spark-examples"><SparkRow tone="blue" items={blueSparks}/><SparkRow tone="pink" items={pinkSparks}/><SparkRow tone="green" items={greenSparks}/><SparkRow tone="white" items={whiteSparks}/></div></DemoBlock>
        <DemoBlock title="Veteran selector" note="Searchable active-workspace listbox"><VeteranSelector id="veteran-select" label="Parent Veteran" options={veteranOptions} bind:value={veteran}/></DemoBlock>
      </div>
      <DemoBlock title="Workspace and live-client state"><div class="state-row"><WorkspaceSwitcher/><ClientIndicator/><SelectField id="client-state" label="Preview connection" value="not-installed" options={[{ value: 'not-installed', label: 'Not installed' }, { value: 'detected', label: 'Detected' }, { value: 'pairing', label: 'Pairing' }, { value: 'connected', label: 'Connected' }, { value: 'reconnecting', label: 'Reconnecting' }, { value: 'permission-blocked', label: 'Permission blocked' }, { value: 'version-incompatible', label: 'Version incompatible' }, { value: 'cloud-fallback', label: 'Cloud fallback' }]} onchange={previewClientState}/></div></DemoBlock>
    </LabSection>

    <footer class="lab-footer"><strong>UI contract v0</strong><span>Approve foundation, components, overlays, data patterns, navigation, themes, and responsive behavior before product-route work.</span></footer>
  </main>
</div>

<ToastRegion {toasts} ondismiss={(id) => toasts = toasts.filter(toast => toast.id !== id)}/>

<style>
  :global(html[data-motion='reduced']) { --duration-fast: 0ms; --duration-normal: 0ms; }
  :global(html[data-density='compact']) { --touch-target: 36px; }
  .lab-shell { min-height: 100dvh; }
  .lab-bar { position: sticky; top: 0; z-index: var(--z-header); min-height: 60px; display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); padding: 8px var(--space-4); border-bottom: 1px solid var(--border-primary); background: var(--navbar-bg); }
  .lab-brand { display: flex; align-items: center; gap: 9px; color: var(--color-text); text-decoration: none; }
  .lab-brand > span { display: flex; flex-direction: column; line-height: 1.1; } .lab-brand strong { background: var(--gradient-brand); background-clip: text; color: transparent; font-size: var(--font-lg); } .lab-brand small { color: var(--color-text-subtle); font-size: 10px; text-transform: uppercase; }
  .lab-controls { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-3); }
  .mobile-controls { display: flex; margin-left: auto; }
  .lab-controls :global(.switch) { grid-template-columns: auto auto; } .lab-controls :global(.copy small) { display: none; }
  .lab-index { display: none; }
  .lab-main { width: min(100%, 1240px); display: grid; gap: var(--space-10); margin: 0 auto; padding: var(--space-6) var(--space-4) var(--space-12); }
  .lab-intro { display: grid; gap: var(--space-6); padding: var(--space-5); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: radial-gradient(circle at 12% 0%, rgb(100 181 246 / .08), transparent 38%), radial-gradient(circle at 95% 100%, rgb(129 199 132 / .07), transparent 34%), var(--surface-2); }
  .lab-intro h1 { max-width: 800px; margin: var(--space-3) 0 var(--space-2); background: var(--gradient-brand); background-clip: text; color: transparent; font-size: var(--font-display); font-weight: 700; line-height: 1.05; letter-spacing: -.025em; }
  .lab-intro p { max-width: 68ch; margin: 0; }
  dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-border); }
  dl div { min-width: 0; padding: var(--space-3); background: var(--bg-tertiary); } dt { color: var(--color-text-subtle); font-size: 10px; font-weight: 700; text-transform: uppercase; } dd { margin: 3px 0 0; font-size: var(--font-sm); font-weight: 700; }
  .swatches { display: grid; grid-template-columns: repeat(auto-fit, minmax(126px, 1fr)); gap: var(--space-3); }
  .swatches > div { min-width: 0; display: grid; grid-template-columns: 34px minmax(0, 1fr); align-items: center; gap: 0 var(--space-2); }
  .swatches div > span { width: 34px; height: 34px; grid-row: span 2; border: 1px solid var(--color-border-strong); border-radius: var(--radius-sm); }
  .swatches strong { font-size: var(--font-xs); } .swatches code { overflow: hidden; color: var(--color-text-subtle); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  .type-scale { display: flex; flex-direction: column; gap: var(--space-2); } .type-scale span { line-height: 1.1; } .type-scale small { color: var(--color-text-muted); } code { font-family: var(--font-mono); }
  .token-shapes { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); }
  .token-shapes > span { display: inline-grid; place-items: center; background: var(--color-accent-soft); color: var(--color-accent); font-size: 10px; } .space-s { width: 16px; height: 16px; } .space-m { width: 32px; height: 32px; } .space-l { width: 52px; height: 52px; }
  .token-shapes > div { padding: var(--space-3); border: 1px solid var(--color-border); background: var(--color-surface-2); font-size: var(--font-xs); } .radius-s { border-radius: var(--radius-sm); } .radius-l { border-radius: var(--radius-lg); } .elevation { box-shadow: var(--shadow-md); }
  .breakpoint-contract { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr)); gap: var(--space-3); }
  .breakpoint-contract article { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 3px var(--space-3); padding: var(--space-3); border-left: 3px solid var(--color-accent); background: var(--color-surface-1); }
  .breakpoint-contract article[data-mode='compact'] { border-left-color: var(--accent-warning); }
  .breakpoint-contract article[data-mode='expanded'] { border-left-color: var(--accent-secondary); }
  .breakpoint-contract span { color: var(--color-text-muted); font-size: var(--font-xs); font-variant-numeric: tabular-nums; }
  .breakpoint-contract small { grid-column: 1 / -1; color: var(--color-text-subtle); }
  .review-widths { margin: var(--space-3) 0 0; color: var(--color-text-subtle); font-size: var(--font-xs); font-variant-numeric: tabular-nums; }
  .fixture-controls { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; margin-bottom: var(--space-3); }
  .fixture-controls span { margin-right: var(--space-2); color: var(--color-text-muted); font-size: var(--font-xs); font-weight: 700; }
  .fixture-controls button { min-height: 34px; padding: 0 10px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-2); color: var(--color-text-muted); cursor: pointer; font-size: var(--font-xs); }
  .fixture-controls button.active { border-color: var(--color-accent); background: var(--color-accent-soft); color: var(--color-accent); }
  .sheet-links { display: grid; gap: 4px; } .sheet-links a { min-height: var(--touch-target); display: flex; align-items: center; padding: 0 var(--space-3); border-radius: var(--radius-md); color: var(--color-text); text-decoration: none; } .sheet-links a:hover { background: var(--color-surface-2); }
  .stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); container-type: inline-size; }
  .virtual-row { height: 100%; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-3); padding: 7px var(--space-3); border-bottom: 1px solid var(--color-border); }
  .virtual-row > span { min-width: 0; display: flex; flex-direction: column; } .virtual-row strong, .virtual-row small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .virtual-row strong { font-size: var(--font-sm); } .virtual-row small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  .item-example { display: inline-flex; align-items: center; gap: 8px; padding: 4px 9px 4px 4px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--surface-2); } .item-example > span { display: flex; flex-direction: column; } .item-example strong { font-size: var(--font-sm); } .item-example small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  .slider-examples { display: grid; gap: var(--space-6); }
  .skill-examples { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-3); }
  .spark-examples { width: 100%; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
  .lab-footer { display: grid; gap: var(--space-1); padding-top: var(--space-6); border-top: 1px solid var(--color-border); } .lab-footer span { color: var(--color-text-muted); font-size: var(--font-sm); }
  @media (max-width: 820px) { .lab-controls { display: none; } }
  @media (min-width: 680px) { .lab-intro { grid-template-columns: minmax(0, 1fr) minmax(290px, .45fr); align-items: end; padding: var(--space-8); } .stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
  @media (min-width: 1024px) {
    .lab-shell { display: grid; grid-template-columns: 210px minmax(0, 1fr); grid-template-rows: auto 1fr; }
    .lab-bar { grid-column: 1 / -1; }
    .lab-index { position: sticky; top: 61px; height: calc(100dvh - 61px); display: flex; flex-direction: column; padding: var(--space-4) var(--space-3); border-right: 1px solid var(--border-primary); background: var(--bg-secondary); }
    .index-head { display: flex; justify-content: space-between; gap: var(--space-2); padding: 0 var(--space-2) var(--space-3); font-size: var(--font-xs); } .index-head span { color: var(--color-text-subtle); }
    .lab-index nav { display: grid; gap: 2px; } .lab-index nav a { min-height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-2); border-radius: var(--radius-sm); color: var(--color-text-muted); font-size: var(--font-sm); text-decoration: none; } .lab-index nav a:hover { background: var(--surface-2); color: var(--color-text); } .lab-index nav small { color: var(--color-text-subtle); }
    .lab-index > p { margin: auto 0 0; padding: var(--space-3) var(--space-2); border-top: 1px solid var(--color-border); font-size: 10px; }
    .lab-main { padding: var(--space-8); }
  }
  @media (min-width: 821px) { .mobile-controls { display: none; } }
</style>

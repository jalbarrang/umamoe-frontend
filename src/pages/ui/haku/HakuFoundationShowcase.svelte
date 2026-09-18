<script lang="ts">
  import Banner from '@/components/Banner.svelte';
  import Button from '@/components/Button.svelte';
  import Checkbox from '@/components/Checkbox.svelte';
  import FileDrop from '@/components/FileDrop.svelte';
  import Pagination from '@/components/Pagination.svelte';
  import Progress from '@/components/Progress.svelte';
  import SelectField from '@/components/SelectField.svelte';
  import Switch from '@/components/Switch.svelte';
  import Tabs from '@/components/Tabs.svelte';
  import TextField from '@/components/TextField.svelte';
  import HakuContract from '@/components/hakuraku/HakuContract.svelte';

  let copied = $state(false);
  let navigationOpen = $state(false);
  let search = $state('Mejiro McQueen');
  let strategy = $state('all');
  let minimumRaces = $state('10');
  let includePractice = $state(true);
  let colorblind = $state(true);
  let activeTab = $state('overview');
  let page = $state(2);
  const strategyOptions = [{ value: 'all', label: 'All strategies' }, { value: 'leader', label: 'Leader' }];
  const tabItems = [{ id: 'overview', label: 'Overview' }, { id: 'explorer', label: 'Explorer' }, { id: 'queries', label: 'Queries' }, { id: 'replays', label: 'Replays' }];
</script>

<section id="haku-foundation" class="haku-group">
  <header><span>Shared source contracts</span><h2>Foundation and shared controls</h2><p>Hakuraku feature structure using the same controls as the rest of uma.moe.</p></header>
  <div class="haku-contract-grid">
    <div class="wide">
      <HakuContract id="haku-site-nav" title="Site navigation" source="src/dark-mode.css">
        <nav class="haku-nav" aria-label="Hakuraku source navigation">
          <strong>Race Lab</strong>
          <span class="haku-nav-menu"><Button variant="ghost" size="sm" ariaLabel="Toggle Race Lab sections" onclick={() => navigationOpen = !navigationOpen}>Menu</Button></span>
          <div class:open={navigationOpen} class="haku-nav-links">
            <a class="active" href="#haku-foundation">Race Data</a><a href="#haku-multi-race">Multi-Race</a><a href="#haku-uma-logs">UmaLogs</a><a href="#haku-veterans">Veterans</a>
          </div>
        </nav>
      </HakuContract>
    </div>

    <HakuContract id="haku-page-header" title="Page header and action bar" source="src/dark-mode.css" origin="uma" note="Canonical moe actions">
      <div class="haku-page-header"><div><h4>Race Data</h4><p>Upload and inspect a race capture.</p></div><div class="moe-actions"><Button variant="secondary">Share</Button><Button>Load replay</Button></div></div>
    </HakuContract>

    <HakuContract id="haku-form-controls" title="Form controls" source="src/dark-mode.css" origin="uma" note="Canonical moe fields and choices">
      <div class="moe-fields"><TextField id="haku-search" label="Search" type="search" bind:value={search}/><SelectField id="haku-strategy" label="Strategy" options={strategyOptions} bind:value={strategy}/><TextField id="haku-minimum-races" label="Minimum races" type="number" min={1} bind:value={minimumRaces}/></div>
      <div class="moe-choices"><Checkbox id="haku-practice-races" label="Include practice races" bind:checked={includePractice}/><Switch id="haku-colorblind" label="Colorblind palette" bind:checked={colorblind}/></div>
    </HakuContract>

    <div class="wide"><HakuContract id="haku-tabs" title="Tab navigation" source="src/dark-mode.css" origin="uma" note="Canonical moe tabs"><Tabs items={tabItems} bind:value={activeTab} label="Race Lab sections"/></HakuContract></div>

    <HakuContract id="haku-upload" title="RaceUploadZone" source="pages/MultiRacePage/components/RaceUploadZone.tsx" origin="uma" note="Canonical moe file drop"><FileDrop id="haku-upload-file" label="Drop race captures here or choose files" accept=".json,.gz,.log" multiple/></HakuContract>

    <HakuContract id="haku-share-link" title="ShareLinkBox" source="components/ShareLinkBox.tsx" origin="uma" note="Canonical moe field and action">
      <div class="haku-stack"><div class="moe-inline-field"><TextField id="haku-share-url" label="Share this analysis" type="url" value="https://uma.moe/share/4KM72" readonly/><Button onclick={() => copied = true}>{copied ? 'Copied' : 'Copy'}</Button></div><small class="haku-muted">Anyone with this link can view the result.</small></div>
    </HakuContract>

    <HakuContract id="haku-pagination" title="PaginationControls" source="components/PaginationControls.tsx" origin="uma" note="Canonical moe pagination"><Pagination pages={4} bind:page label="Analysis pages"/></HakuContract>

    <HakuContract id="haku-feedback" title="Feedback states" source="src/dark-mode.css" origin="uma" note="Canonical moe banners and progress">
      <div class="haku-stack"><Banner title="3 races loaded" tone="success"><p>Analysis is ready.</p></Banner><Banner title="Two duplicate files were skipped" tone="warning"/><Progress label="Processing captures" value={62}/><Banner title="Capture version is not supported" tone="danger"/></div>
    </HakuContract>
  </div>
</section>

<style>
  .moe-actions { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }
  .moe-fields { min-width: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .moe-choices { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 6px; }
  .moe-inline-field { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: end; gap: 6px; }
  .moe-inline-field :global(.ui-button) { height: var(--control-height); min-height: var(--control-height); }
  @media (max-width: 620px) {
    .moe-fields, .moe-choices { grid-template-columns: 1fr; }
  }
</style>

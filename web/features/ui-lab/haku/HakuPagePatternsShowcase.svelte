<script lang="ts">
  import HakuContract from '../../../ui/hakuraku/HakuContract.svelte';
  import Banner from '../../../ui/Banner.svelte';
  import Button from '../../../ui/Button.svelte';
  import DataTable from '../../../ui/DataTable.svelte';
  import DialogPanel from '../../../ui/DialogPanel.svelte';
  import SparkItem from '../../../ui/SparkItem.svelte';
  import StatStrip from '../../../ui/StatStrip.svelte';
  import Tabs from '../../../ui/Tabs.svelte';
  import TextArea from '../../../ui/TextArea.svelte';
  import TextField from '../../../ui/TextField.svelte';
  import { hakurakuNonVisualContracts } from '../hakuraku-registry';
  let masterTab = $state('characters');
  let masterSearch = $state('Search master data…');
  let factorSearch = $state('Search factors…');
  let refreshes = $state('12');
  let itemRate = $state('2.5');
  let note = $state('Need 3★ Long on P2 and at least 12 shared races.');
  let email = $state('trainer@example.com');
  let password = $state('password');
  const masterTabs = [{ id: 'characters', label: 'Characters' }, { id: 'skills', label: 'Skills' }, { id: 'races', label: 'Races' }];
  const masterColumns = [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Name', priority: 'primary' as const }, { key: 'type', label: 'Type', priority: 'secondary' as const }];
  const masterRows = [{ id: '100101', name: 'Mejiro McQueen', type: 'Character' }, { id: '200341', name: 'Swinging Maestro', type: 'Skill' }];
  const factorColumns = [{ key: 'name', label: 'Factor' }, { key: 'effect', label: 'Effect' }, { key: 'type', label: 'Type', priority: 'secondary' as const }];
  const factorRows = [{ name: 'Speed', effect: '+21', type: 'Blue' }, { name: 'Long', effect: 'Aptitude up', type: 'Pink' }];
  const shopStats = [{ id: 'chance', label: 'At least once', value: '26.2%' }, { id: 'cost', label: 'Expected cost', value: 47 }];
</script>

<section id="haku-page-patterns" class="haku-group">
  <header><span>Remaining page contracts</span><h2>Page patterns and overlays</h2><p>The rest of the repository’s visual vocabulary, followed by the source files that are intentionally non-visual.</p></header>
  <div class="haku-contract-grid">
    <div class="wide"><HakuContract id="haku-master-data" title="MasterDataPage" source="pages/MasterDataPage.tsx" origin="uma"><div class="haku-split"><div class="haku-stack"><Tabs items={masterTabs} bind:value={masterTab} label="Master data sections"/><TextField id="haku-master-search" label="Search master data" type="search" bind:value={masterSearch}/><DataTable caption="Master data" columns={masterColumns} rows={masterRows}/></div><pre class="haku-code">{`{ "id": 100101, "name": "Mejiro McQueen", "rarity": 3 }`}</pre></div></HakuContract></div>
    <HakuContract id="haku-inheritance-factors" title="InheritanceFactorsPage" source="pages/InheritanceFactorsPage/index.tsx" origin="uma"><div class="haku-stack"><TextField id="haku-factor-search" label="Search factors" type="search" bind:value={factorSearch}/><div class="haku-row"><SparkItem name="Speed" level={3} tone="blue" compact/><SparkItem name="Long" level={3} tone="pink" compact/><SparkItem name="Swinging Maestro" level={2} compact/></div><DataTable caption="Inheritance factor effects" columns={factorColumns} rows={factorRows}/></div></HakuContract>
    <HakuContract id="haku-shop-refresh" title="ShopRefreshPage" source="pages/ShopRefreshPage/index.tsx" origin="uma"><div class="haku-stack"><div class="haku-fields"><TextField id="haku-refreshes" label="Refreshes" type="number" min={0} bind:value={refreshes}/><TextField id="haku-item-rate" label="Desired item rate" type="number" min={0} step={0.1} bind:value={itemRate}/></div><Button>Calculate</Button><StatStrip items={shopStats} compact label="Shop refresh result"/></div></HakuContract>
    <HakuContract id="haku-notes" title="NotesPage" source="pages/NotesPage.tsx" origin="uma"><div class="haku-split"><div class="haku-stack"><Button>New note</Button><Button variant="secondary">Long CM setup</Button><Button variant="secondary">McQueen parents</Button></div><TextArea id="haku-note" label="Note" bind:value={note}/></div></HakuContract>
    <HakuContract id="haku-auth" title="AuthPage" source="pages/AuthPage.tsx" origin="uma"><form class="haku-stack"><TextField id="haku-auth-email" label="Email" type="email" bind:value={email}/><TextField id="haku-auth-password" label="Password" type="password" bind:value={password}/><Button>Sign in</Button><small class="haku-muted">Continue using local data without an account.</small></form></HakuContract>
    <HakuContract id="haku-account" title="AccountPage" source="pages/AccountPage.tsx" origin="uma"><div class="haku-stack"><div><strong>trainer@example.com</strong><div class="haku-muted">Account connected · sync enabled</div></div><Banner title="Veterans synced" tone="success"><p>Last synchronized 4 minutes ago.</p></Banner><div class="haku-action-bar"><Button variant="secondary">Change password</Button><Button variant="danger">Sign out</Button></div></div></HakuContract>
    <HakuContract id="haku-setup-guide" title="SetupGuidePage" source="pages/SetupGuidePage.tsx"><ol class="haku-source-note"><li><strong>Export a race capture</strong><br/>Choose JSON from the client export menu.</li><li><strong>Upload it to Hakuraku</strong><br/>Drop one or more files into Race Data.</li><li><strong>Inspect or share</strong><br/>Open replay or create a share link.</li></ol></HakuContract>
    <HakuContract id="haku-overlay-system" title="Modal and tooltip system" source="MultiRace + UmaLogs + Veterans" origin="uma"><div class="moe-dialog-preview"><DialogPanel title="moe dialog content" description="Sticky header · bounded body"><p>Dialogs use the same fields and actions as their parent feature.</p><div class="haku-action-bar"><Button variant="secondary">Cancel</Button><Button>Apply</Button></div></DialogPanel></div></HakuContract>
    <div class="wide"><HakuContract id="haku-nonvisual-contracts" title="Non-visual source contracts" source="Documented, not rendered as fake widgets" note="4 source helpers"><ul class="haku-source-note">{#each hakurakuNonVisualContracts as contract}<li>{contract}</li>{/each}</ul></HakuContract></div>
  </div>
</section>

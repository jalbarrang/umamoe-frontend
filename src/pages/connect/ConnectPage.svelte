<script lang="ts">
  import { clientConnection, setMockClientState } from '@/services/client/client-state';
  import { clientBridge } from '@/services/client/client-bridge';
  import AppPage from '@/layouts/AppPage.svelte';
  import Banner from '@/components/Banner.svelte';
  import Button from '@/components/Button.svelte';
  import SegmentedControl from '@/components/SegmentedControl.svelte';
  import StatusPill from '@/components/StatusPill.svelte';
  import TextField from '@/components/TextField.svelte';
  const states = ['not-installed', 'detected', 'pairing', 'connected', 'reconnecting', 'permission-blocked', 'version-incompatible', 'cloud-fallback'] as const;
  const options = states.map((state) => ({ value: state, label: state.replaceAll('-', ' ') }));
  let endpoint = $state('ws://127.0.0.1:32123/connect');
  let pairingCode = $state('');
  let error = $state('');
  let pairing = $state(false);

  async function connect(): Promise<void> {
    pairing = true;
    error = '';
    try { await clientBridge.connect({ endpoint, token: pairingCode, expiresAt: new Date(Date.now() + 2 * 60_000).toISOString() }); }
    catch (reason) { error = reason instanceof Error ? reason.message : 'The local client could not be paired.'; }
    finally { pairing = false; }
  }
</script>

<svelte:head><title>Connect Client · uma.moe</title><meta name="robots" content="noindex"/></svelte:head>
<AppPage routeId="connect" title="Connect Client" description="Pair the standalone client without coupling website components to its transport." eyebrow="Local bridge" width="normal">
  <Banner title="Pairing-ready foundation" tone="info"><p>The website remains fully usable without the desktop client. Local telemetry is ephemeral unless you explicitly save it.</p></Banner>
  {#if error}<Banner title="Client connection failed" tone="danger"><p>{error}</p></Banner>{/if}
  <section class="connect-panel"><div class="connect-copy"><StatusPill label={$clientConnection.replaceAll('-', ' ')} tone={$clientConnection === 'connected' ? 'success' : $clientConnection.includes('blocked') || $clientConnection.includes('incompatible') ? 'danger' : 'info'}/><h2>Authenticated loopback connection</h2><p>Enter the short-lived code shown by the desktop client. Components receive typed state and events through ClientBridge and never depend directly on WebSockets.</p></div><div class="pairing-fields"><TextField id="client-endpoint" label="Local endpoint" bind:value={endpoint}/><TextField id="client-pairing-code" label="Pairing code" type="password" placeholder="Short-lived code" bind:value={pairingCode}/></div><div class="connect-actions"><Button loading={pairing} disabled={!pairingCode.trim()} onclick={connect}>Pair client</Button><Button variant="secondary" onclick={() => clientBridge.useCloudFallback()}>Use cloud state</Button>{#if $clientConnection === 'connected'}<Button variant="ghost" onclick={() => clientBridge.disconnect()}>Disconnect</Button>{/if}</div></section>
  <section class="legacy-setup"><div><span>EXISTING HAKURAKU CAPTURE</span><h2>Set up horseACT</h2><p>The merged app keeps the existing Hakuraku capture workflow available while the standalone client is completed.</p></div><Button href="https://github.com/ayaliz/horseACT#installation" target="_blank" variant="secondary" icon="github">Open installation guide</Button></section>
  {#if __UI_LAB_ENABLED__}<section class="mock-states"><h2>Beta connection-state fixture</h2><SegmentedControl label="Connection state" {options} value={$clientConnection} onchange={(value) => setMockClientState(value as typeof states[number])}/></section>{/if}
</AppPage>
<style>
  .connect-panel, .mock-states, .legacy-setup { display: grid; gap: var(--space-4); padding: var(--space-4); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); }
  .connect-panel { grid-template-columns: minmax(250px, .8fr) minmax(280px, 1fr); align-items: end; }
  .connect-copy { align-self: center; }.pairing-fields { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
  h2 { margin: var(--space-2) 0 3px; font-size: var(--font-lg); } p { margin: 0; font-size: var(--font-sm); }
  .connect-actions { grid-column: 1 / -1; display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); }
  .legacy-setup { grid-template-columns: minmax(0, 1fr) auto; align-items: center; }.legacy-setup span { color: var(--color-accent); font-size: 9px; font-weight: 800; letter-spacing: .05em; }
  .mock-states h2 { margin: 0; }
  @media (max-width: 760px) { .connect-panel, .legacy-setup, .pairing-fields { grid-template-columns: 1fr; }.connect-panel, .legacy-setup { padding-inline: 5px; }.connect-actions { justify-content: stretch; }.connect-actions :global(.ui-button), .legacy-setup :global(.ui-button) { width: 100%; } }
</style>

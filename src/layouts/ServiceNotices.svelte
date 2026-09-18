<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '@/components/Button.svelte';
  import Banner from '@/components/Banner.svelte';
  import Dialog from '@/components/Dialog.svelte';
  import { availableVersion, reloadUpdatedVersion, startSiteServices, CURRENT_UPDATE_VERSION } from '@/services/site-services';
  import { browserProofPort, browserVerification } from '@/services/http/browser-proof';
  import type { RateLimitNotice } from '@/services/http/http-client';
  let rateLimited = $state(false);
  let retryAt = $state(0);
  let now = $state(Date.now());
  let lastShown = -Infinity;
  let dismissedVersion = $state('');
  let verified = $state(false);
  let UpdateNotification = $state<typeof import('./UpdateNotification.svelte').default>();
  let updateRequest = $state(0);
  const remaining = $derived(Math.max(0, Math.ceil((retryAt - now) / 1000)));
  function rateLimit(event: Event) {
    const notice = (event as CustomEvent<RateLimitNotice>).detail;
    if (rateLimited || Date.now() - lastShown < 10_000) return;
    lastShown = Date.now(); now = lastShown;
    retryAt = now + Math.max(0, notice.retryAfterSeconds || 0) * 1000;
    rateLimited = true;
  }
  async function verify() {
    verified = false;
    try { await browserProofPort?.refresh(); verified = true; }
    catch { /* The verification store supplies the error and retry action. */ }
  }
  onMount(() => {
    let active = true;
    const loadUpdates = () => {
      if (!UpdateNotification) void import('./UpdateNotification.svelte').then(module => { if (active) UpdateNotification = module.default; }).catch(() => {});
    };
    const showUpdates = () => { updateRequest++; loadUpdates(); };
    try { if (Number(localStorage.getItem('lastSeenUpdateVersion') ?? 0) < CURRENT_UPDATE_VERSION) loadUpdates(); } catch {}
    window.addEventListener('uma:show-updates', showUpdates);
    const stop = startSiteServices();
    window.addEventListener('uma:rate-limit', rateLimit);
    const timer = setInterval(() => { if (rateLimited) now = Date.now(); }, 1000);
    return () => { active = false; stop(); clearInterval(timer); window.removeEventListener('uma:rate-limit', rateLimit); window.removeEventListener('uma:show-updates', showUpdates); };
  });
</script>

{#if UpdateNotification}<UpdateNotification request={updateRequest}/>{/if}
{#if $availableVersion && dismissedVersion !== $availableVersion || $browserVerification.error || verified}
  <aside class="service-notices" aria-label="Service notifications">
    {#if $availableVersion && dismissedVersion !== $availableVersion}
      <Banner title="Update available"><p>A new version of uma.moe is ready. Reload when you’ve saved your work.</p><div class="actions"><Button size="sm" onclick={() => reloadUpdatedVersion($availableVersion)}>Reload</Button><Button size="sm" variant="ghost" onclick={() => dismissedVersion = $availableVersion}>Later</Button></div></Banner>
    {/if}
    {#if $browserVerification.error}
      <Banner title="Browser verification" tone="warning"><p>{$browserVerification.error}</p><Button size="sm" disabled={$browserVerification.pending} onclick={verify}>Retry verification</Button></Banner>
    {:else if verified}
      <Banner title="Browser verified" tone="success"><p>You can retry your request.</p><Button size="sm" variant="ghost" onclick={() => verified = false}>Dismiss</Button></Banner>
    {/if}
  </aside>
{/if}
<Dialog open={rateLimited} title="Too many requests" icon="warning" onclose={() => rateLimited = false}>
  <p>{remaining ? `Please wait ${remaining} seconds before trying again.` : 'You can try your request again now.'}</p>
  {#snippet actions()}<Button size="sm" variant="secondary" onclick={() => rateLimited = false}>Dismiss</Button>{/snippet}
</Dialog>
<style>
  .service-notices { position:fixed; bottom:16px; right:16px; z-index:var(--z-overlay); width:min(440px,calc(100vw - 32px)); display:grid; gap:var(--space-2); }
  p { margin:0 0 var(--space-3); } .actions { display:flex; gap:var(--space-2); }
</style>

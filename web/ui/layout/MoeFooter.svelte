<script lang="ts">
  import { openFusePrivacyControls } from '../../platform/ads/fuse-ads';
  import Icon from '../Icon.svelte';
  import { DISCORD_SUPPORT_URL } from '../../platform/site-links';
  import { buildVersion, serviceStatus, versionLabel } from '../../platform/site-services';
  import { copyText } from '../../platform/clipboard';
  import InspectPopover from '../InspectPopover.svelte';
  let privacyUnavailable = $state(false);
  let copied = $state(false);
  const version = buildVersion();
  const year = new Date().getFullYear();
</script>

<footer class="site-footer">
  <div class="footer-inner">
    <a class="footer-brand" href="/" aria-label="uma.moe home"><img src="/logo.webp" alt="" width="22" height="22"/><strong>uma.moe</strong></a>
    <nav aria-label="Community and site links">
      <a class="discord-link" href={DISCORD_SUPPORT_URL} target="_blank" rel="noopener noreferrer"><Icon name="discord" size={16}/><span>Discord</span></a>
      <a class="kofi-link" href="https://ko-fi.com/umamoe" target="_blank" rel="noopener noreferrer"><Icon name="ko-fi" size={16}/><span>Support us</span></a>
      <InspectPopover label="Service status" openOnHover>
        {#snippet trigger()}<span class="status-trigger"><span class="status-dot" data-status={$serviceStatus.state}></span>Status</span>{/snippet}
        <strong>{$serviceStatus.state === 'operational' ? 'All systems operational' : $serviceStatus.state === 'degraded' ? 'Some services are degraded' : $serviceStatus.state === 'down' ? 'Services unavailable' : 'Status unavailable'}</strong>
        {#each $serviceStatus.endpoints as endpoint}<div class="endpoint"><span>{endpoint.name}</span><span>{endpoint.healthy ? 'Operational' : 'Unavailable'}</span></div>{/each}
        <a href="https://status.uma.moe/" target="_blank" rel="noopener noreferrer">Open status page ↗</a>
      </InspectPopover>
      <a href="/privacy-policy">Privacy</a>
      <button type="button" onclick={() => window.dispatchEvent(new Event('uma:show-updates'))}>What’s new</button>
      <button type="button" onclick={() => privacyUnavailable = !openFusePrivacyControls()}>Privacy Choices</button>
    </nav>
    <span class="footer-meta">© {year} uma.moe{#if version !== 'local'}<button class="build-version" title="Copy build version" onclick={async () => { copied = await copyText(`build=${version}`); }}>{copied ? 'Copied' : versionLabel(version)}</button>{/if}</span>
  </div>
  {#if privacyUnavailable}<p class="privacy-notice" role="status">Regional privacy controls are not currently available in this browser or region.</p>{/if}
</footer>

<style>
  .site-footer { flex:none; border-top:1px solid var(--border-primary); background:var(--navbar-bg); }
  .status-trigger { min-height:32px; display:inline-flex; align-items:center; gap:6px; color:var(--text-muted); font-size:12px; }.status-dot { width:6px; height:6px; border-radius:50%; background:var(--text-muted); }.status-dot[data-status='operational'] { background:var(--color-success); }.status-dot[data-status='degraded'] { background:var(--color-warning); }.status-dot[data-status='down'] { background:var(--color-danger); }
  .endpoint { display:flex; justify-content:space-between; gap:16px; margin-top:8px; font-size:11px; }.build-version { display:block; margin-top:4px; padding:0; border:0; background:transparent; color:inherit; font:inherit; cursor:pointer; }
  .footer-inner { width:100%; max-width:1200px; min-height:64px; display:grid; grid-template-columns:auto minmax(0,1fr) auto; grid-template-areas:'brand links meta'; align-items:center; gap:12px 32px; margin:auto; padding:12px 24px; }
  .footer-brand { grid-area:brand; display:flex; align-items:center; gap:8px; color:var(--text-secondary); text-decoration:none; }.footer-brand img { flex:none; object-fit:contain; }.footer-brand strong { font-size:13px;font-weight:650; }
  nav { grid-area:links; display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:0 20px; }
  nav a,nav button { min-height:32px; display:inline-flex; align-items:center; gap:6px; padding:0; border:0; background:transparent; color:var(--text-muted); font:inherit; font-size:12px; text-decoration:none; white-space:nowrap; cursor:pointer; }
  nav a:hover,nav button:hover,.footer-brand:hover { color:var(--text-primary); }nav a:hover,nav button:hover { text-decoration:underline; text-underline-offset:4px; }
  nav .discord-link:hover { color:var(--accent-primary); }nav .kofi-link:hover { color:var(--color-pink); }
  .footer-meta { grid-area:meta; color:var(--text-muted); font-size:11px; white-space:nowrap; }
  .privacy-notice { margin:0; padding:0 16px 12px; color:var(--text-muted); font-size:12px; text-align:center; }
  @media(max-width:900px) { .footer-inner { grid-template-columns:1fr auto; grid-template-areas:'brand meta' 'links links'; gap:4px 16px; padding:14px 20px; }nav { gap:0 18px; } }
  @media(max-width:767px) { .site-footer { margin-bottom:calc(var(--bottom-nav-height) + env(safe-area-inset-bottom)); } }
  @media(pointer:coarse) { nav a,nav button,.footer-brand { min-height:var(--touch-target); } }
</style>

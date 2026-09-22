<script lang="ts">
  import { virtualScrolling, setVirtualScrolling } from '@/stores/virtual-scrolling';
  import Checkbox from '@/components/Checkbox.svelte';
  import PageHeading from '@/layouts/PageHeading.svelte';
  import { copyText } from '@/lib/clipboard';
  import { onDestroy } from 'svelte';
  import { loadCharacterImageCatalog } from '@/lib/catalog/character-catalog';
  import { authRepository } from '@/services/auth/auth-repository';
  import { authReady, authUser } from '@/services/auth/auth-state';
  import { setAccountWorkspaces } from '@/lib/workspaces/workspace-state';
  import type { ApiKey, AuthIdentity, LinkedAccount } from '@/services/auth/auth-types';
  import { router } from '@/routes/router';
  import Banner from '@/components/Banner.svelte';
  import Button from '@/components/Button.svelte';
  import Icon from '@/components/Icon.svelte';
  import Spinner from '@/components/Spinner.svelte';
  import SourcePage from '@/layouts/SourcePage.svelte';
  import ContentAd from '@/layouts/ContentAd.svelte';

  let accounts = $state<LinkedAccount[]>([]);
  let identities = $state<AuthIdentity[]>([]);
  let apiKeys = $state<ApiKey[]>([]);
  let images = $state<Map<number, string>>(new Map());
  const loading = $state({ accounts: true, identities: true, keys: true });
  const loadErrors = $state({ accounts: '', identities: '', keys: '' });
  let accountsRequest = 0, identitiesRequest = 0, keysRequest = 0;
  let initialized = $state(false);
  let loadError = $state('');
  let linkError = $state('');
  let linkSuccess = $state('');
  let apiKeyError = $state('');
  let newAccountId = $state('');
  let newKeyName = $state('');
  let newlyCreatedKey = $state<string | null>(null);
  let copiedToken = $state('');
  let copiedApiKey = $state(false);
  const busy = $state<Record<string, boolean>>({});
  let verifyError = $state<Record<string, string>>({});
  let verifyCooldown = $state<Record<string, number>>({});
  const cooldownTimers = new Set<ReturnType<typeof setInterval>>();

  function message(reason: unknown): string { return reason instanceof Error ? reason.message : 'The request could not be completed.'; }
  function providerLabel(provider: string): string { return provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Provider'; }
  function formatDate(value: string): string { return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value)); }
  function accountImage(id?: number): string | undefined { return id ? images.get(id) : undefined; }
  function normalizeAccountId(): void { newAccountId = newAccountId.replace(/\D/g, '').slice(0, 12); }

  async function loadAccounts(): Promise<void> {
    const request = ++accountsRequest; loading.accounts = true; loadErrors.accounts = '';
    try {
      const result = await authRepository.linkedAccounts(true);
      if (request === accountsRequest) {
        accounts = result;
        setAccountWorkspaces(result.filter(account => account.verification_status === 'verified').map(account => ({ accountId: account.account_id, label: account.trainer_name || account.account_id })));
      }
    }
    catch (reason) { if (request === accountsRequest) loadErrors.accounts = message(reason); }
    finally { if (request === accountsRequest) loading.accounts = false; }
  }
  async function loadIdentities(): Promise<void> {
    const request = ++identitiesRequest; loading.identities = true; loadErrors.identities = '';
    try { const result = await authRepository.identities(); if (request === identitiesRequest) identities = result; }
    catch (reason) { if (request === identitiesRequest) loadErrors.identities = message(reason); }
    finally { if (request === identitiesRequest) loading.identities = false; }
  }
  async function loadApiKeys(): Promise<void> {
    const request = ++keysRequest; loading.keys = true; loadErrors.keys = '';
    try { const result = await authRepository.apiKeys(); if (request === keysRequest) apiKeys = result; }
    catch (reason) { if (request === keysRequest) loadErrors.keys = message(reason); }
    finally { if (request === keysRequest) loading.keys = false; }
  }

  $effect(() => {
    if ($authReady && !$authUser) { void router.navigate('/login'); return; }
    if ($authReady && $authUser && !initialized) {
      initialized = true; void loadAccounts(); void loadIdentities(); void loadApiKeys();
      void loadCharacterImageCatalog().then(result => images = result, () => {});
    }
  });

  async function linkAccount(): Promise<void> {
    if (busy['link']) return;
    normalizeAccountId(); linkError = ''; linkSuccess = '';
    if (!/^\d{12}$/.test(newAccountId)) { linkError = 'Account ID must be exactly 12 digits.'; return; }
    const accountId = newAccountId;
    busy['link'] = true;
    try {
      const account = await authRepository.linkAccount(accountId);
      newAccountId = '';
      linkSuccess = `Account ${account.account_id || accountId} linked! Follow the verification steps below.`;
      await loadAccounts();
    } catch (reason) { linkError = message(reason); }
    finally { delete busy['link']; }
  }

  function startCooldown(accountId: string): void {
    verifyCooldown = { ...verifyCooldown, [accountId]: 30 };
    const timer = setInterval(() => {
      const next = (verifyCooldown[accountId] ?? 0) - 1;
      if (next <= 0) {
        const { [accountId]: _removed, ...rest } = verifyCooldown;
        verifyCooldown = rest;
        clearInterval(timer);
        cooldownTimers.delete(timer);
      } else verifyCooldown = { ...verifyCooldown, [accountId]: next };
    }, 1000);
    cooldownTimers.add(timer);
  }

  async function verifyAccount(account: LinkedAccount): Promise<void> {
    const accountId = account.account_id;
    if (busy[`verify:${accountId}`] || verifyCooldown[accountId]) return;
    verifyError = { ...verifyError, [accountId]: '' };
    busy[`verify:${accountId}`] = true;
    try {
      const response = await authRepository.verifyAccount(accountId);
      startCooldown(accountId);
      if ('status' in response && response.status !== 'verified') {
        verifyError = { ...verifyError, [accountId]: response.message || (response.status === 'timeout' ? 'Verification timed out. Make sure the token is in your profile comment and try again.' : 'Verification was not successful. Please try again.') };
      } else {
        await loadAccounts();
      }
    } catch (reason) { verifyError = { ...verifyError, [accountId]: message(reason) }; startCooldown(accountId); }
    finally { delete busy[`verify:${accountId}`]; }
  }

  async function unlinkAccount(account: LinkedAccount): Promise<void> {
    if (busy[`unlink:${account.account_id}`]) return;
    loadError = '';
    busy[`unlink:${account.account_id}`] = true;
    try { await authRepository.unlinkAccount(account.account_id); await loadAccounts(); }
    catch (reason) { loadError = message(reason); }
    finally { delete busy[`unlink:${account.account_id}`]; }
  }

  async function connect(provider: 'google' | 'discord'): Promise<void> {
    if (busy[`connect:${provider}`]) return;
    loadError = '';
    busy[`connect:${provider}`] = true;
    try { window.location.assign((await authRepository.connectProvider(provider)).url); }
    catch (reason) { loadError = message(reason); delete busy[`connect:${provider}`]; }
  }

  async function disconnectIdentity(identity: AuthIdentity): Promise<void> {
    if (identities.length <= 1 || busy[`disconnect:${identity.provider}`]) return;
    loadError = '';
    busy[`disconnect:${identity.provider}`] = true;
    try { await authRepository.disconnectProvider(identity.provider); await loadIdentities(); }
    catch (reason) { loadError = message(reason); }
    finally { delete busy[`disconnect:${identity.provider}`]; }
  }

  async function createApiKey(): Promise<void> {
    if (busy['create-key']) return;
    const name = newKeyName.trim();
    if (!name) return;
    apiKeyError = ''; newlyCreatedKey = null; busy['create-key'] = true;
    try { const key = await authRepository.createApiKey(name); newlyCreatedKey = key.key ?? null; newKeyName = ''; await loadApiKeys(); }
    catch (reason) { apiKeyError = message(reason); }
    finally { delete busy['create-key']; }
  }

  async function revokeApiKey(key: ApiKey): Promise<void> {
    if (busy[`revoke:${key.id}`]) return;
    apiKeyError = '';
    busy[`revoke:${key.id}`] = true;
    try { await authRepository.revokeApiKey(key.id); await loadApiKeys(); }
    catch (reason) { apiKeyError = message(reason); }
    finally { delete busy[`revoke:${key.id}`]; }
  }

  async function copyToken(account: LinkedAccount): Promise<void> {
    const token = account.verification_token ?? '';
    if (!await copyText(token)) { copiedToken = ''; verifyError = { ...verifyError, [account.account_id]: 'Could not copy the code. Select and copy it manually.' }; return; }
    verifyError = { ...verifyError, [account.account_id]: '' }; copiedToken = token;
    window.setTimeout(() => { if (copiedToken === token) copiedToken = ''; }, 2000);
  }
  async function copyKey(key: string): Promise<void> {
    if (!await copyText(key)) { copiedApiKey = false; apiKeyError = 'Could not copy the API key. Select and copy it manually before leaving this page.'; return; }
    apiKeyError = ''; copiedApiKey = true;
    window.setTimeout(() => copiedApiKey = false, 2000);
  }

  onDestroy(() => cooldownTimers.forEach(clearInterval));
</script>

<svelte:head><title>Account Settings · uma.moe</title><meta name="robots" content="noindex"/></svelte:head>

<SourcePage routeId="settings" title="Account Settings" width="wide">
  <div class="settings-page">
    <PageHeading title="Account Settings" description="Manage your linked game accounts and connected logins."/>
    {#if !$authReady}
      <div class="loading-row page-loading"><Spinner size={28}/> Loading…</div>
    {:else if $authUser}
      <div class="content-container">
        {#if loadError}<Banner title={loadError} tone="danger" dismissible/>{/if}

        <section class="settings-card">
          <header class="card-header"><Icon name="tune" size={20}/><h2>Browsing Preferences</h2></header>
          <div class="card-body"><Checkbox id="settings-virtual-scrolling" label="Virtual scrolling" ariaLabel="Virtual scrolling" checked={$virtualScrolling} onchange={setVirtualScrolling} description="Keep long lists fast by rendering nearby items. Turn off to keep all loaded items on the page. Applies across this site on this device."/></div>
        </section>

        <section class="settings-card">
          <header class="card-header"><Icon name="veterans" size={20}/><h2>Linked Game Accounts</h2></header>
          <div class="card-body">
            {#if loading.accounts}<div class="loading-row" role="status">Loading…</div>
            {:else if loadErrors.accounts}<Banner title="Linked accounts unavailable" tone="danger">{loadErrors.accounts}<Button variant="secondary" onclick={loadAccounts}>Retry linked accounts</Button></Banner>
            {:else if accounts.length === 0}<div class="empty-state"><Icon name="close" size={30}/><p>No game accounts linked yet.</p></div>{/if}
            {#if !loading.accounts && !loadErrors.accounts && accounts.length > 0}<div class="account-list">
              {#each accounts as account (account.account_id)}
                <article class="account-row">
                  <div class="account-header"><div class="account-info">
                    {#if accountImage(account.representative_uma_id)}<img class="uma-avatar" src={accountImage(account.representative_uma_id)} alt=""/>{:else}<span class="uma-avatar-placeholder"><Icon name="user" size={22}/></span>{/if}
                    {#if account.trainer_name}<span class="trainer-name">{account.trainer_name}</span><span class="info-divider"></span>{/if}<code class="account-id">{account.account_id}</code>
                    <span class:verified={account.verification_status === 'verified'} class:pending={account.verification_status !== 'verified'} class="account-badge"><Icon name={account.verification_status === 'verified' ? 'check' : 'warning'} size={14}/>{account.verification_status === 'verified' ? 'Verified' : 'Pending Verification'}</span>
                  </div><div class="account-actions">{#if account.verification_status === 'verified'}<Button href={`/profile/${account.account_id}`} variant="secondary" size="sm" icon="user">View Profile</Button>{/if}<Button variant="danger" size="sm" icon="close" loading={busy[`unlink:${account.account_id}`]} onclick={() => unlinkAccount(account)}>Unlink</Button></div></div>
                  {#if account.verification_status !== 'verified'}<div class="verify-section">
                    <p class="verify-heading">Verify ownership of this account</p>
                    <div class="verify-steps"><div class="step"><span>1</span><p>Open Uma Musume and go to your <strong>Profile</strong></p></div><div class="step"><span>2</span><p>Set your <strong>profile comment</strong> to this code:</p></div></div>
                    {#if account.verification_token}<div class="token-display"><code>{account.verification_token}</code><button aria-label="Copy code" onclick={() => copyToken(account)}><Icon name={copiedToken === account.verification_token ? 'check' : 'copy'} size={16}/></button></div><p class="token-note">This code changes on each page load, copy it before switching to the game.</p>{/if}
                    <div class="step"><span>3</span><p>Click <strong>Verify</strong> below, we'll check your profile comment matches the code</p></div>
                    <div class="verify-actions"><Button variant="secondary" icon="check" loading={busy[`verify:${account.account_id}`]} disabled={Boolean(verifyCooldown[account.account_id])} onclick={() => verifyAccount(account)}>{verifyCooldown[account.account_id] ? `Retry in ${verifyCooldown[account.account_id]}s` : 'Verify'}</Button></div>
                    {#if verifyError[account.account_id]}<p class="error-msg">{verifyError[account.account_id]}</p>{/if}
                  </div>{/if}
                </article>
              {/each}
            </div>{/if}
            <form class="link-form" onsubmit={(event) => { event.preventDefault(); void linkAccount(); }}><h3>Link a new account</h3><div class="form-row"><input aria-label="12-digit Account / Viewer ID" inputmode="numeric" autocomplete="off" maxlength="12" pattern={'[0-9]{12}'} placeholder="12-digit Account / Viewer ID" bind:value={newAccountId} oninput={normalizeAccountId}/><Button type="submit" icon="add" loading={busy['link']} disabled={newAccountId.length !== 12}>Link Account</Button></div>{#if linkError}<p class="error-msg">{linkError}</p>{/if}{#if linkSuccess}<p class="success-msg">{linkSuccess}</p>{/if}</form>
          </div>
        </section>

        <ContentAd routeId="settings"/>

        <section class="settings-card"><header class="card-header"><Icon name="connect" size={20}/><h2>Connected Logins</h2></header><div class="card-body">{#if loading.identities}<div class="loading-row" role="status">Loading…</div>{:else if loadErrors.identities}<Banner title="Connected logins unavailable" tone="danger">{loadErrors.identities}<Button variant="secondary" onclick={loadIdentities}>Retry connected logins</Button></Banner>{:else}<div class="identity-list">{#each identities as identity (`${identity.provider}:${identity.provider_id}`)}<div class="identity-row"><div class="identity-info"><Icon name={identity.provider === 'google' ? 'google' : 'discord'} size={18}/><strong>{providerLabel(identity.provider)}</strong>{#if identity.display_name}<span>{identity.display_name}</span>{/if}</div><Button variant="danger" size="sm" ariaLabel="Disconnect" disabled={identities.length <= 1} loading={busy[`disconnect:${identity.provider}`]} onclick={() => disconnectIdentity(identity)}><Icon name="close" size={14}/></Button></div>{/each}<div class="connect-buttons">{#if !identities.some((item) => item.provider === 'google')}<Button icon="google" variant="secondary" loading={busy['connect:google']} onclick={() => connect('google')}>Connect Google</Button>{/if}{#if !identities.some((item) => item.provider === 'discord')}<Button icon="discord" variant="secondary" loading={busy['connect:discord']} onclick={() => connect('discord')}>Connect Discord</Button>{/if}</div></div>{/if}</div></section>

        <section class="settings-card"><header class="card-header"><Icon name="tools" size={20}/><h2>API Keys</h2></header><div class="card-body">
          <div class="api-key-intro"><div class="api-key-intro-main"><span class="intro-icon"><Icon name="tools" size={18}/></span><div><p>API keys authenticate scripts, tools, and external apps that call the uma.moe API. They are not needed for normal website use.</p><div class="guidance"><span><Icon name="status" size={13}/>Keep keys private</span><span><Icon name="user" size={13}/>Revoke unused keys anytime</span></div></div></div><a class="api-docs-link" href="/api/docs" target="_blank" rel="noopener noreferrer"><Icon name="info" size={16}/>API Docs<Icon name="external" size={14}/></a></div>
          {#if loading.keys}<div class="loading-row" role="status">Loading…</div>{:else if loadErrors.keys}<Banner title="API keys unavailable" tone="danger">{loadErrors.keys}<Button variant="secondary" onclick={loadApiKeys}>Retry API keys</Button></Banner>{:else if apiKeys.length > 0}<div class="api-keys-list">{#each apiKeys as key (key.id)}<div class:revoked={key.revoked} class="api-key-row"><span class="key-icon"><Icon name={key.revoked ? 'close' : 'tools'} size={18}/></span><div class="api-key-info"><div><strong>{key.name}</strong><code>{key.key_prefix}…</code>{#if key.revoked}<span class="account-badge revoked-badge">Revoked</span>{/if}</div><small>Created {formatDate(key.created_at)}{#if key.last_used} · Last used {formatDate(key.last_used)}{/if}{#if key.total_requests} · {key.total_requests.toLocaleString()} requests{/if}</small></div>{#if !key.revoked}<Button variant="danger" size="sm" icon="trash" loading={busy[`revoke:${key.id}`]} onclick={() => revokeApiKey(key)}>Revoke</Button>{/if}</div>{/each}</div>{:else if !newlyCreatedKey}<div class="empty-state"><Icon name="tools" size={30}/><p>No API keys yet.</p></div>{/if}
          {#if newlyCreatedKey}<div class="new-key-display"><strong><Icon name="check" size={18}/>API key created! Copy it now - you won't see it again.</strong><div class="token-display"><code>{newlyCreatedKey}</code><button aria-label="Copy API key" onclick={() => copyKey(newlyCreatedKey ?? '')}><Icon name={copiedApiKey ? 'check' : 'copy'} size={16}/></button></div></div>{/if}
          <form class="link-form" onsubmit={(event) => { event.preventDefault(); void createApiKey(); }}><h3>Create a new key</h3><div class="form-row"><input aria-label="Key name" placeholder="Key name (e.g. My App)" bind:value={newKeyName}/><Button type="submit" icon="add" loading={busy['create-key']} disabled={!newKeyName.trim()}>Create Key</Button></div>{#if apiKeyError}<p class="error-msg">{apiKeyError}</p>{/if}</form>
          <div class="usage-hint"><strong>Usage</strong><p>Include your key in requests via the <code>X-API-Key</code> header:</p><pre><code>curl -H "X-API-Key: uma_k_…" https://uma.moe/api/…</code></pre><p>Endpoint details and examples are available in the <a href="/api/docs" target="_blank" rel="noopener noreferrer">API documentation</a>.</p></div>
        </div></section>
      </div>
    {/if}
  </div>
</SourcePage>

<style>
  .settings-page { min-height: 100%; }
  .content-container { min-width: 0; display: grid; gap: 1.5rem; padding: 0 var(--page-gutter-current) 3rem; }
  .settings-card { overflow: hidden; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-secondary); }
  .card-header { min-height: 48px; display: flex; align-items: center; gap: .65rem; padding: .75rem 1.25rem; border-bottom: 1px solid var(--border-subtle); }.card-header :global(svg) { color: var(--accent-primary); }.card-header h2 { margin: 0; font-size: 1rem; line-height: 1.2; }
  .card-body { padding: 1.25rem 1.5rem; }.loading-row { display: flex; align-items: center; gap: .5rem; color: var(--text-muted); font-size: .85rem; }.page-loading { min-height: 240px; justify-content: center; }
  .empty-state { min-height: 88px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; color: var(--text-disabled); }.empty-state p { margin: 0; font-size: .85rem; }
  .account-list { margin-bottom: 1.5rem; }.account-row + .account-row { border-top: 1px solid var(--border-subtle); }.account-header { min-height: 80px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0; }
  .account-info,.account-actions,.identity-info,.connect-buttons,.form-row { display: flex; align-items: center; gap: .75rem; }.account-info { min-width: 0; flex-wrap: wrap; }
  .uma-avatar,.uma-avatar-placeholder { width: 48px; height: 48px; flex: 0 0 48px; border: 2px solid var(--border-primary); border-radius: 50%; }.uma-avatar { object-fit: cover; object-position: center 15%; }.uma-avatar-placeholder { display: grid; place-items: center; background: var(--surface-2); color: var(--text-disabled); }
  .trainer-name { color: var(--text-primary); font-size: 1.05rem; font-weight: 600; }.info-divider { width: 1px; height: 20px; background: var(--surface-4); }.account-id { color: var(--text-muted); font-size: .95rem; }
  .account-badge { min-height: 24px; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: var(--radius-sm); font-size: .75rem; font-weight: 600; line-height: 1; }.account-badge.verified { color: var(--accent-secondary); background: rgb(129 199 132 / .15); }.account-badge.pending { color: var(--accent-warning); background: rgb(255 183 77 / .15); }
  .account-actions { flex-shrink: 0; gap: .5rem; }.verify-section { margin: 0 0 .75rem; padding: .75rem 1rem; border-radius: var(--radius-md); background: rgb(255 183 77 / .04); }.verify-heading { margin: 0 0 .75rem; font-size: .85rem; font-weight: 600; }
  .verify-steps { display: grid; gap: .5rem; margin-bottom: .75rem; }.step { display: flex; align-items: center; gap: .6rem; color: var(--text-secondary); font-size: .8rem; }.step > span { width: 20px; height: 20px; flex: 0 0 20px; display: grid; place-items: center; border-radius: 50%; color: var(--accent-warning); background: rgb(255 183 77 / .15); font-size: .7rem; font-weight: 700; }.step p { margin: 0; line-height: 1.45; }
  .token-display { max-width: 100%; width: fit-content; display: flex; align-items: center; gap: .5rem; margin: .5rem 0 .75rem 2rem; padding: .5rem .75rem; border: 1px solid var(--border-primary); border-radius: var(--radius-sm); background: var(--bg-tertiary); }.token-display code { overflow: hidden; color: var(--accent-warning); font-size: 1rem; font-weight: 700; letter-spacing: 2px; text-overflow: ellipsis; user-select: all; }.token-display button { width: 32px; height: 32px; display: grid; flex: 0 0 32px; place-items: center; border: 0; background: transparent; color: var(--text-muted); cursor: pointer; }.token-note { margin: -.25rem 0 .75rem 2rem; color: var(--text-disabled); font-size: .7rem; font-style: italic; }.verify-actions { margin-top: .75rem; }
  .link-form { padding-top: 1.25rem; border-top: 1px solid var(--border-subtle); }.link-form h3 { margin: 0 0 .75rem; color: var(--text-secondary); font-size: .85rem; }.form-row input { min-width: 0; height: 38px; flex: 1; padding: 0 12px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); outline: none; background: var(--surface-2); color: var(--text-primary); font: 500 .85rem var(--font-mono); }.form-row input:focus { border-color: var(--accent-primary); background: var(--surface-3); box-shadow: var(--focus-ring); }
  .error-msg,.success-msg { margin: .5rem 0 0; font-size: .8rem; }.error-msg { color: var(--accent-error); }.success-msg { color: var(--accent-secondary); }
  .identity-list { display: grid; gap: .5rem; }.identity-row { min-height: 50px; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .6rem .75rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--surface-1); }.identity-info { gap: .6rem; }.identity-info strong { font-size: .85rem; }.identity-info span { color: var(--text-muted); font-size: .8rem; }.connect-buttons { margin-top: .25rem; gap: .5rem; }
  .api-key-intro { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem; margin-bottom: 1.1rem; border: 1px solid rgb(100 181 246 / .14); border-radius: var(--radius-md); background: linear-gradient(135deg,rgb(100 181 246 / .08),rgb(129 199 132 / .04)); }.api-key-intro-main { min-width: 0; display: flex; align-items: flex-start; gap: .85rem; }.api-key-intro p { margin: 0; color: var(--text-muted); font-size: .8rem; line-height: 1.5; }
  .intro-icon,.key-icon { width: 36px; height: 36px; display: grid; flex: 0 0 36px; place-items: center; border-radius: var(--radius-md); background: rgb(100 181 246 / .1); color: var(--accent-primary); }.guidance { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .65rem; }.guidance span { min-height: 22px; display: inline-flex; align-items: center; gap: .35rem; padding: 3px 8px; border-radius: var(--radius-pill); background: var(--surface-2); color: var(--text-secondary); font-size: .72rem; font-weight: 600; }
  .api-docs-link { min-height: 36px; display: inline-flex; align-items: center; gap: .45rem; padding: 7px 12px; border: 1px solid rgb(100 181 246 / .22); border-radius: var(--radius-md); background: rgb(100 181 246 / .1); color: var(--accent-primary); font-size: .8rem; font-weight: 700; text-decoration: none; white-space: nowrap; }.api-keys-list { display: grid; gap: .5rem; margin-bottom: 1rem; }
  .api-key-row { min-height: 60px; display: flex; align-items: center; gap: .75rem; padding: .75rem 1rem; border-radius: var(--radius-md); background: var(--surface-1); }.api-key-row.revoked { opacity: .45; }.api-key-info { min-width: 0; flex: 1; display: grid; gap: .2rem; }.api-key-info > div { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; }.api-key-info strong { font-size: .9rem; }.api-key-info code { color: var(--text-muted); font-size: .8rem; }.api-key-info small { color: var(--text-disabled); font-size: .75rem; }.revoked-badge { color: var(--accent-error); background: rgb(239 83 80 / .15); }
  .new-key-display { padding: .75rem 1rem; margin-bottom: 1rem; border-radius: var(--radius-md); background: rgb(129 199 132 / .06); }.new-key-display > strong { display: flex; align-items: center; gap: .5rem; color: var(--accent-secondary); font-size: .85rem; }.new-key-display .token-display { margin-left: 0; }
  .usage-hint { margin-top: 1rem; padding: 1rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: var(--surface-1); }.usage-hint > strong { color: var(--text-disabled); font-size: .7rem; letter-spacing: .05em; text-transform: uppercase; }.usage-hint p { margin: .5rem 0; color: var(--text-muted); font-size: .8rem; }.usage-hint a { color: var(--accent-primary); }.usage-hint pre { overflow-x: auto; margin: 0; padding: .6rem .85rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); background: var(--bg-tertiary); }.usage-hint pre code { color: #a5d6a7; font-size: .8rem; }
  @media (max-width: 640px) {
    .content-container { gap: 1rem; padding-bottom: calc(1rem + var(--bottom-nav-height)); }.card-header { padding-inline: 12px; }.card-body { padding: 12px; }
    .account-header { align-items: flex-start; flex-direction: column; }.account-actions { width: 100%; flex-wrap: wrap; }.account-actions :global(.ui-button) { flex: 1; }.form-row,.connect-buttons { align-items: stretch; flex-direction: column; }.form-row :global(.ui-button),.connect-buttons :global(.ui-button) { width: 100%; }.api-key-intro { align-items: stretch; flex-direction: column; }.api-docs-link { justify-content: center; }.api-key-row { padding-inline: 5px; }:global(.api-key-row > .ui-button > span:not(.button-spinner)) { position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap; }.token-display,.token-note { margin-left: 0; }
  }
  @media (max-width: 640px) { .form-row input { flex:none;min-height:var(--touch-target); } }
</style>

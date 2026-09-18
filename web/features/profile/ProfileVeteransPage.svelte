<script lang="ts">
  import { router } from '../../platform/router/router';
  import ProfileShell from './ProfileShell.svelte';
  import ProfileVeteransRoster from './ProfileVeteransRoster.svelte';
  const accountId = $derived(router.route.params.accountId || '');
</script>

<svelte:head><title>Veterans · Trainer {accountId} · uma.moe</title><meta name="description" content={`Veteran roster for trainer ${accountId}.`}/></svelte:head>

<ProfileShell {accountId} current="veterans">
  {#snippet children(context)}
    <ProfileVeteransRoster {accountId} profile={context.profile} characters={context.characters} isOwner={context.isOwner}/>
  {/snippet}
</ProfileShell>

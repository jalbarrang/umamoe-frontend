<script lang="ts">
  import { router } from '../../platform/router/router';
  import ProfileWip from '../profile/ProfileWip.svelte';
  const accountId = $derived(router.route.params.accountId || '');
</script>
<svelte:head><title>Champions Meeting · Trainer {accountId} · uma.moe</title><meta name="robots" content="noindex"/></svelte:head>
<ProfileWip {accountId} current="cm" description="Champions Meeting data display is currently under development."/>

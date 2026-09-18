<script lang="ts">
  import { Router } from 'sv-router';
  import { on } from 'svelte/events';
  import AppShell from './platform/shell/AppShell.svelte';
  import { router } from './platform/router/router';
  const isDirectUiLabRoute = /^\/ui(?:-lab)?\/?$/.test(globalThis.location?.pathname ?? '');
  // sv-router's window handler consumes modified/cancelled internal clicks.
  // Run after component handlers, without cancelling the browser's link action.
  $effect(() => on(document, 'click', event => {
    if (!event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (anchor instanceof HTMLAnchorElement && anchor.origin === location.origin) event.stopPropagation();
  }));
</script>

{#if import.meta.env.MODE === 'demo'}<aside style="padding:8px 16px;background:#664600;color:white;text-align:center" role="status">Demo preview · Sample data · <a style="color:inherit" href="/profile/123456789012">Demo profile</a></aside>{/if}

{#if isDirectUiLabRoute}
  <Router/>
{:else}
  <AppShell><Router/></AppShell>
{/if}


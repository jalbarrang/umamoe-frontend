<script lang="ts">
  import { onMount } from 'svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Button from '../../ui/Button.svelte';
  import { UPDATE_LOG } from '../update-log';
  import { CURRENT_UPDATE_VERSION } from '../site-services';
  let { request = 0 }: { request?: number } = $props();
  let open = $state(false);
  $effect(() => { if (request) open = true; });
  function close() {
    open = false;
    try { localStorage.setItem('lastSeenUpdateVersion', String(CURRENT_UPDATE_VERSION)); } catch { /* Reading remains available without storage. */ }
  }
  onMount(() => {
    const timer = setInterval(() => {
      try {
        if (Number(localStorage.getItem('lastSeenUpdateVersion') ?? 0) >= CURRENT_UPDATE_VERSION) { clearInterval(timer); return; }
      } catch { clearInterval(timer); return; }
      if (document.hidden || document.querySelector('dialog[open], [data-tour-overlay]')) return;
      open = true; clearInterval(timer);
    }, 1500);
    return () => clearInterval(timer);
  });
</script>
{#if open}<Dialog {open} title="What’s new" maxWidth="720px" onclose={close}>
  {#each UPDATE_LOG as update, index}
    <details open={index === 0}>
      <summary><strong>{update.title}</strong>{#if update.date}<span>{update.date}</span>{/if}</summary>
      {#each update.categories.filter(category => !category.betaOnly || __APP_ENVIRONMENT__ !== 'production') as category}
        <h3>{category.label}</h3><ul>{#each category.items as item}<li>{#if item.link}<a href={item.link} onclick={close}>{item.text}</a>{:else}{item.text}{/if}</li>{/each}</ul>
      {/each}
    </details>
  {/each}
  {#snippet actions()}<Button size="sm" onclick={close}>Got it</Button>{/snippet}
</Dialog>{/if}
<style>
  details + details { border-top:1px solid var(--color-border); margin-top:var(--space-4); padding-top:var(--space-3); }
  summary { cursor:pointer; } summary span { display:block; margin-top:4px; color:var(--color-text-muted); font-size:var(--font-xs); }
  h3 { margin:var(--space-4) 0 var(--space-2); font-size:var(--font-sm); } ul { padding-left:20px; font-size:var(--font-sm); line-height:1.6; } li + li { margin-top:var(--space-2); }
</style>

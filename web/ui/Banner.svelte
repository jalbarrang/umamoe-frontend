<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  interface Props { title: string; tone?: 'info' | 'success' | 'warning' | 'danger'; children?: Snippet; dismissible?: boolean; }
  let { title, tone = 'info', children, dismissible = false }: Props = $props();
  let visible = $state(true);
</script>

{#if visible}
  <aside class="banner banner--{tone}" aria-live={tone === 'danger' ? 'assertive' : 'polite'}>
    <Icon name={tone === 'success' ? 'check' : tone === 'warning' || tone === 'danger' ? 'warning' : 'info'} size={19} />
    <div><strong>{title}</strong>{#if children}<div>{@render children()}</div>{/if}</div>
    {#if dismissible}<button type="button" aria-label="Dismiss" onclick={() => visible = false}><Icon name="close" size={17}/></button>{/if}
  </aside>
{/if}

<style>
  .banner { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); border: 1px solid color-mix(in srgb, currentColor 30%, transparent); border-radius: var(--radius-md); background: var(--color-accent-soft); color: var(--color-accent); }
  .banner--success { background: var(--color-secondary-soft); color: var(--color-secondary); }
  .banner--warning { background: var(--color-warning-soft); color: var(--color-warning); }
  .banner--danger { background: var(--color-danger-soft); color: var(--color-danger); }
  strong { display: block; font-size: var(--font-sm); }
  div :global(p) { margin: var(--space-1) 0 0; color: inherit; font-size: var(--font-sm); }
  button { width: 32px; height: 32px; display: grid; place-items: center; margin: -5px; padding: 0; border: 0; border-radius: var(--radius-sm); background: transparent; color: currentColor; cursor: pointer; }
  button:hover { background: color-mix(in srgb, currentColor 12%, transparent); }
</style>

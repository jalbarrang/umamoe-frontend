<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { src?: string; alt: string; kind?: 'character' | 'card'; rarity?: string; size?: 'sm' | 'md' | 'lg'; }
  let { src, alt, kind = 'character', rarity, size = 'md' }: Props = $props();
  let failed = $state(false);
</script>

<figure class="art art--{kind} art--{size}">
  {#if src && !failed}<img {src} {alt} loading="lazy" decoding="async" onerror={() => failed = true}/>{:else}<span role="img" aria-label={alt}><Icon name={kind === 'character' ? 'user' : 'database'} size={size === 'lg' ? 32 : 24}/></span>{/if}
  {#if rarity}<figcaption>{rarity}</figcaption>{/if}
</figure>

<style>
  .art { position: relative; width: 56px; height: 56px; flex: 0 0 auto; margin: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--surface-2); }
  .art--sm { width: 40px; height: 40px; border-radius: var(--radius-sm); } .art--lg { width: 84px; height: 84px; }
  .art--card { aspect-ratio: 1; height: auto; }
  img { width: 100%; height: 100%; object-fit: cover; object-position: top center; }
  .art > span { width: 100%; height: 100%; display: grid; place-items: center; color: var(--color-text-subtle); }
  figcaption { position: absolute; right: 3px; bottom: 3px; padding: 1px 4px; border-radius: var(--radius-xs); background: rgb(0 0 0 / .76); color: white; font-size: 9px; font-weight: 800; }
</style>

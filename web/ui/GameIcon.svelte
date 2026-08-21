<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { src?: string; alt: string; size?: number; rounded?: boolean; }
  let { src, alt, size = 24, rounded = true }: Props = $props();
  let failed = $state(false);
</script>

<span class="game-icon" class:rounded style:width="{size}px" style:height="{size}px">
  {#if src && !failed}
    <img {src} {alt} width={size} height={size} loading="lazy" decoding="async" onerror={() => failed = true}/>
  {:else}
    <span role="img" aria-label={alt}><Icon name="database" size={Math.max(14, size - 8)}/></span>
  {/if}
</span>

<style>
  .game-icon { display: inline-grid; flex: 0 0 auto; place-items: center; overflow: hidden; border: 1px solid var(--border-primary); background: var(--bg-tertiary); }
  .game-icon.rounded { border-radius: var(--radius-sm); }
  img { width: 100%; height: 100%; object-fit: cover; }
  .game-icon > span { color: var(--color-text-subtle); }
</style>

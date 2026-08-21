<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props { id: string; title: string; description: string; children: Snippet; }
  let { id, title, description, children }: Props = $props();
</script>

<section {id} class="lab-section" aria-labelledby="{id}-title">
  <header><span>Component group</span><h2 id="{id}-title">{title}</h2><p>{description}</p></header>
  <div class="content">{@render children()}</div>
</section>

<style>
  .lab-section { scroll-margin-top: 84px; }
  header { margin-bottom: var(--space-4); }
  header > span { color: var(--color-accent); font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
  h2 { margin: 3px 0 var(--space-1); font-size: var(--font-xl); line-height: 1.2; }
  p { max-width: 70ch; margin: 0; font-size: var(--font-sm); }
  .content { display: grid; gap: var(--space-4); }
</style>

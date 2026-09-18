<script lang="ts">
  import type { Snippet } from 'svelte';
  interface Props { id: string; title: string; source: string; note?: string; origin?: 'hakuraku' | 'uma'; children: Snippet; }
  let { id, title, source, note, origin = 'hakuraku', children }: Props = $props();
</script>

<article {id} class="haku-contract" data-source={source} data-origin={origin}>
  <header class="haku-contract-head">
    <div><h3>{title}</h3>{#if note}<span>{note}</span>{/if}</div>
    <span class="haku-source" class:moe-origin={origin === 'uma'} title={source} aria-label={`${origin === 'uma' ? 'uma.moe component' : 'Hakuraku source'}: ${source}`}>{origin === 'uma' ? 'uma.moe component' : 'Hakuraku source'}</span>
  </header>
  <div class="haku-contract-body">{@render children()}</div>
</article>

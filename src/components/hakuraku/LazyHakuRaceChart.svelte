<script lang="ts">
  import { onMount, type Component } from 'svelte';
  import type { RaceFrame } from '@/lib/race/race-capture-parser';
  interface Props { frames?: RaceFrame[]; runnerIndex?: number; }
  let { frames = [], runnerIndex = 0 }: Props = $props();
  let host: HTMLDivElement;
  let Chart = $state<Component | null>(null);
  let loading = $state(false);

  async function loadChart() {
    if (loading || Chart) return;
    loading = true;
    Chart = (await import('./HakuRaceChart.svelte')).default;
  }

  onMount(() => {
    if (!('IntersectionObserver' in window)) { void loadChart(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) { void loadChart(); observer.disconnect(); }
    }, { rootMargin: '240px' });
    observer.observe(host);
    return () => observer.disconnect();
  });
</script>

<div bind:this={host} class="lazy-chart">
  {#if Chart}<Chart {frames} {runnerIndex}/>{:else}<div class="chart-placeholder" role="status">{loading ? 'Loading chart renderer…' : 'Chart renderer loads when the race timeline approaches the viewport.'}</div>{/if}
</div>

<style>
  .lazy-chart { min-height: 300px; }
  .chart-placeholder { min-height: 300px; display: grid; place-items: center; border: 1px solid var(--haku-border); background: repeating-linear-gradient(0deg, transparent 0 49px, var(--border-subtle) 50px), var(--haku-bg-0); color: var(--haku-text-2); font-size: 10px; }
</style>

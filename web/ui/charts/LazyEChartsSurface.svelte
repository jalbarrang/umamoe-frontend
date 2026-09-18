<script lang="ts">
  import { onMount, type Component } from 'svelte';
  import type { EChartsCoreOption } from 'echarts/core';
  import Banner from '../Banner.svelte';
  import Button from '../Button.svelte';
  interface Props { option: EChartsCoreOption; label: string; description?: string; height?: number; dismissTouchTooltip?: boolean; zoomable?: boolean; }
  let { option, label, description, height = 280, dismissTouchTooltip = false, zoomable = false }: Props = $props();
  let host: HTMLDivElement;
  let Surface = $state<Component<Props> | null>(null);
  let loading = $state(false);
  let failed = $state(false);
  async function load(): Promise<void> {
    if (loading || Surface) return;
    loading = true;
    try { Surface = (await import('./EChartsSurface.svelte')).default as Component<Props>; }
    catch { failed = true; }
    finally { loading = false; }
  }
  onMount(() => { if (!('IntersectionObserver' in window)) { void load(); return; } const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { void load(); observer.disconnect(); } }, { rootMargin: '240px' }); observer.observe(host); return () => observer.disconnect(); });
</script>
<div bind:this={host} class="lazy-surface" style:--lazy-height={`${height}px`}>{#if Surface}<Surface {option} {label} {description} {height} {dismissTouchTooltip} {zoomable}/>{:else if failed}<Banner title="Chart renderer could not be loaded" tone="danger"><p>Reload the page to try again.</p><Button variant="secondary" size="sm" onclick={() => location.reload()}>Reload page</Button></Banner>{:else}<div class="placeholder" role="status">{loading ? 'Loading chart renderer…' : 'Chart renderer loads near the viewport.'}</div>{/if}</div>
<style>.lazy-surface, .placeholder { min-height: var(--lazy-height); }.placeholder { display: grid; place-items: center; background: repeating-linear-gradient(0deg, transparent 0 49px, var(--border-subtle) 50px), var(--surface-1); color: var(--color-text-subtle); font-size: 10px; }</style>

<script lang="ts">
  import { onMount } from 'svelte';
  import * as echarts from 'echarts/core';
  import { BarChart, LineChart } from 'echarts/charts';
  import { AriaComponent, DataZoomComponent, GridComponent, LegendComponent, MarkAreaComponent, MarkLineComponent, TooltipComponent } from 'echarts/components';
  import { SVGRenderer } from 'echarts/renderers';
  import type { EChartsCoreOption, EChartsType } from 'echarts/core';

  interface Props { option: EChartsCoreOption; label: string; description?: string; height?: number; }
  let { option, label, description, height = 280 }: Props = $props();
  let host: HTMLDivElement;
  let chart: EChartsType | undefined;

  echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent, MarkLineComponent, MarkAreaComponent, AriaComponent, SVGRenderer]);

  onMount(() => {
    chart = echarts.init(host, undefined, { renderer: 'svg' });
    chart.setOption(option);
    const observer = new ResizeObserver(() => chart?.resize());
    observer.observe(host);
    return () => { observer.disconnect(); chart?.dispose(); chart = undefined; };
  });

  $effect(() => { if (chart) chart.setOption(option, { notMerge: true }); });
</script>

<figure aria-label={label} style:--chart-height={`${height}px`}>
  <div bind:this={host} class="chart-host" aria-hidden="true"></div>
  {#if description}<figcaption>{description}</figcaption>{/if}
</figure>

<style>
  figure { min-width: 0; margin: 0; }
  .chart-host { width: 100%; height: var(--chart-height); min-height: 180px; }
  figcaption { margin-top: 5px; color: var(--color-text-muted); font-size: 10px; line-height: 1.4; }
</style>

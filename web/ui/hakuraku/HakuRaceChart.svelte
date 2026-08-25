<script lang="ts">
  import type { EChartsCoreOption } from 'echarts/core';
  import EChartsSurface from '../charts/EChartsSurface.svelte';
  const frames = Array.from({ length: 61 }, (_, index) => index * 2);
  const speed = frames.map((frame) => Math.round(14 + Math.sin(frame / 11) * 2.4 + frame / 35 + (frame > 74 ? 2.3 : 0)));
  const stamina = frames.map((frame) => Math.max(8, Math.round(100 - frame * .68 - (frame > 88 ? (frame - 88) * .55 : 0))));
  const option: EChartsCoreOption = {
    animationDuration: 180,
    aria: { enabled: true, decal: { show: false } },
    grid: { left: 42, right: 34, top: 30, bottom: 48 },
    tooltip: { trigger: 'axis', backgroundColor: '#212529', borderColor: 'rgba(117,127,142,.45)', textStyle: { color: '#f4f5f7', fontSize: 10 } },
    legend: { top: 0, right: 0, itemWidth: 14, itemHeight: 3, textStyle: { color: '#aab1bb', fontSize: 9 } },
    xAxis: { type: 'category', boundaryGap: false, data: frames, name: 'seconds', axisLabel: { color: '#818a96', fontSize: 8 }, axisLine: { lineStyle: { color: '#404750' } }, nameTextStyle: { color: '#818a96', fontSize: 8 } },
    yAxis: [
      { type: 'value', name: 'm/s', min: 8, axisLabel: { color: '#818a96', fontSize: 8 }, splitLine: { lineStyle: { color: 'rgba(117,127,142,.16)' } }, nameTextStyle: { color: '#818a96', fontSize: 8 } },
      { type: 'value', name: 'HP %', min: 0, max: 100, axisLabel: { color: '#818a96', fontSize: 8 }, splitLine: { show: false }, nameTextStyle: { color: '#818a96', fontSize: 8 } }
    ],
    dataZoom: [{ type: 'slider', bottom: 2, height: 18, borderColor: 'rgba(117,127,142,.25)', backgroundColor: '#1a1d21', fillerColor: 'rgba(102,126,234,.18)', textStyle: { color: '#818a96', fontSize: 8 }, handleSize: 12 }],
    series: [
      { name: 'Speed', type: 'line', data: speed, symbol: 'none', smooth: .18, lineStyle: { width: 2, color: '#7d91ff' }, markLine: { symbol: 'none', label: { color: '#aab1bb', fontSize: 8 }, lineStyle: { color: '#ffd166', type: 'dashed' }, data: [{ xAxis: 74, name: 'Final corner' }] }, markArea: { itemStyle: { color: 'rgba(101,210,131,.07)' }, data: [[{ xAxis: 88, name: 'Last spurt' }, { xAxis: 120 }]] } },
      { name: 'HP', type: 'line', yAxisIndex: 1, data: stamina, symbol: 'none', smooth: .16, lineStyle: { width: 2, color: '#65d283' }, areaStyle: { color: 'rgba(101,210,131,.09)' } }
    ]
  };
</script>

<EChartsSurface {option} label="Race speed and stamina chart" description="Speed and HP over race time. Final-corner and last-spurt phases remain explicitly named." height={300}/>

<script lang="ts">
  import type { EChartsCoreOption } from 'echarts/core';
  import type { RaceFrame } from '@/lib/race/race-capture-parser';
  import EChartsSurface from '@/components/charts/EChartsSurface.svelte';
  interface Props { frames?: RaceFrame[]; runnerIndex?: number; }
  let { frames: raceFrames = [], runnerIndex = 0 }: Props = $props();
  const fallbackTimes = Array.from({ length: 61 }, (_, index) => index * 2);
  const fallbackSpeed = fallbackTimes.map((frame) => Number((14 + Math.sin(frame / 11) * 2.4 + frame / 35 + (frame > 74 ? 2.3 : 0)).toFixed(2)));
  const fallbackHp = fallbackTimes.map((frame) => Number(Math.max(8, 100 - frame * .68 - (frame > 88 ? (frame - 88) * .55 : 0)).toFixed(2)));
  const times = $derived(raceFrames.length ? raceFrames.map((frame) => frame.time) : fallbackTimes);
  const speed = $derived(raceFrames.length ? raceFrames.map((frame) => Number(((frame.horses[runnerIndex]?.speed ?? 0) / 100).toFixed(2))) : fallbackSpeed);
  const initialHp = $derived(raceFrames[0]?.horses[runnerIndex]?.hp ?? 100);
  const hp = $derived(raceFrames.length ? raceFrames.map((frame) => Number((initialHp > 0 ? (frame.horses[runnerIndex]?.hp ?? 0) / initialHp * 100 : 0).toFixed(2))) : fallbackHp);
  const maxTime = $derived(Math.max(1, times.at(-1) ?? 120));
  const delta = (values: number[]) => values.map((value, index) => [times[index] ?? 0, index === 0 ? 0 : Number((value - (values[index - 1] ?? value)).toFixed(2))]);
  const option: EChartsCoreOption = $derived({
    color: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76'],
    animationDuration: 220,
    aria: { enabled: true, decal: { show: false } },
    grid: [
      { left: 46, right: 42, top: 34, height: '48%' },
      { left: 46, right: 42, top: '66%', height: '18%' }
    ],
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    tooltip: { trigger: 'axis', backgroundColor: 'var(--surface-overlay)', borderColor: 'var(--border-secondary)', textStyle: { color: 'var(--text-primary)', fontSize: 10 } },
    legend: { top: 0, right: 0, itemWidth: 14, itemHeight: 3, textStyle: { color: 'var(--text-secondary)', fontSize: 9 } },
    xAxis: [
      { type: 'value', min: 0, max: maxTime, name: 'Time', nameLocation: 'middle', nameGap: 24, axisLabel: { color: 'var(--text-muted)', fontSize: 8 }, axisLine: { lineStyle: { color: 'var(--border-secondary)' } }, splitLine: { show: false }, nameTextStyle: { color: 'var(--text-muted)', fontSize: 8 } },
      { type: 'value', min: 0, max: maxTime, gridIndex: 1, position: 'top', axisLabel: { color: 'var(--text-muted)', fontSize: 8 }, axisLine: { lineStyle: { color: 'var(--border-secondary)' } }, splitLine: { show: false } }
    ],
    yAxis: [
      { type: 'value', name: 'Speed / HP', axisLabel: { color: 'var(--text-muted)', fontSize: 8 }, splitLine: { lineStyle: { color: 'var(--border-subtle)' } }, nameTextStyle: { color: 'var(--text-muted)', fontSize: 8 } },
      { type: 'value', gridIndex: 1, name: 'Δ / frame', axisLabel: { color: 'var(--text-muted)', fontSize: 8 }, splitLine: { lineStyle: { color: 'var(--border-subtle)' } }, nameTextStyle: { color: 'var(--text-muted)', fontSize: 8 } }
    ],
    dataZoom: [{ type: 'slider', xAxisIndex: [0, 1], bottom: 2, height: 20, showDetail: false, brushSelect: false, moveHandleSize: 8, handleSize: '110%', borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-primary)', fillerColor: 'rgb(73 146 255 / .18)', dataBackground: { lineStyle: { color: '#4992ff' }, areaStyle: { color: 'rgb(73 146 255 / .12)' } }, selectedDataBackground: { lineStyle: { color: '#4992ff' }, areaStyle: { color: 'rgb(73 146 255 / .22)' } }, handleStyle: { color: '#4992ff', borderColor: '#8abbff' }, moveHandleStyle: { color: '#8abbff' } }],
    series: [
      { name: 'Speed', type: 'line', data: times.map((frame, index) => [frame, speed[index]]), symbol: 'none', smooth: true, lineStyle: { width: 2 } },
      { name: 'HP', type: 'line', data: times.map((frame, index) => [frame, hp[index]]), symbol: 'none', smooth: true, lineStyle: { width: 2 } },
      { name: 'ΔSpeed', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: delta(speed), symbol: 'none', smooth: true, lineStyle: { width: 1.5 } },
      { name: 'ΔHP', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: delta(hp), symbol: 'none', smooth: true, lineStyle: { width: 1.5 } }
    ]
  });
</script>

<EChartsSurface {option} label="Race speed, HP, and frame delta chart" description={raceFrames.length ? 'Decoded capture data. Speed and normalized HP above; per-frame changes below.' : 'UI Lab sample data. Speed and HP above; per-frame changes below.'} height={480}/>

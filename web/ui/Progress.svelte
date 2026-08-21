<script lang="ts">
  interface Props { value?: number; max?: number; label: string; showValue?: boolean; indeterminate?: boolean; }
  let { value = 0, max = 100, label, showValue = true, indeterminate = false }: Props = $props();
  const percent = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
</script>

<div class="progress-wrap">
  <span class="label"><strong>{label}</strong>{#if showValue && !indeterminate}<span>{Math.round(percent)}%</span>{/if}</span>
  <div class="track" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax={max} aria-valuenow={indeterminate ? undefined : value}>
    <span class:indeterminate style:width={indeterminate ? '35%' : `${percent}%`}></span>
  </div>
</div>

<style>
  .progress-wrap { display: grid; gap: var(--space-2); }
  .label { display: flex; justify-content: space-between; gap: var(--space-3); color: var(--color-text-muted); font-size: var(--font-xs); font-variant-numeric: tabular-nums; }
  .label strong { color: var(--color-text); }
  .track { height: 8px; overflow: hidden; border-radius: var(--radius-pill); background: var(--color-surface-3); }
  .track > span { height: 100%; display: block; border-radius: inherit; background: var(--color-accent); transition: width var(--duration-normal) var(--easing-standard); }
  .track > span.indeterminate { animation: slide 1s ease-in-out infinite alternate; }
  @keyframes slide { from { transform: translateX(-100%); } to { transform: translateX(285%); } }
</style>

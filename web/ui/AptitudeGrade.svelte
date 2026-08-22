<script lang="ts">
  export type AptitudeGradeValue = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  interface Props { grade: AptitudeGradeValue; label?: string; size?: 'sm' | 'md'; }
  let { grade, label, size = 'md' }: Props = $props();
</script>

<span class="aptitude aptitude--{size}" style:--grade-color={`var(--aptitude-${grade.toLowerCase()})`} aria-label={label ? `${label}: ${grade}` : `Aptitude ${grade}`}>
  <b>{grade}</b>{#if label}<span>{label}</span>{/if}
</span>

<style>
  .aptitude { width: fit-content; min-width: 38px; height: 28px; display: inline-flex; align-items: center; gap: 6px; padding: 0 7px; border: 1px solid color-mix(in srgb, var(--grade-color) 44%, transparent); border-radius: var(--radius-sm); background: color-mix(in srgb, var(--grade-color) 10%, transparent); }
  b { min-width: 13px; color: var(--grade-color); font-size: 14px; font-weight: 900; text-align: center; }
  span span { color: var(--color-text-muted); font-size: 10px; white-space: nowrap; }
  .aptitude--sm { min-width: 28px; height: 22px; padding-inline: 5px; } .aptitude--sm b { font-size: 11px; }
</style>

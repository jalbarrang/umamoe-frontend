<script lang="ts">
  export type AptitudeGradeValue = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  interface Props { grade: AptitudeGradeValue; label?: string; size?: 'sm' | 'md'; }
  let { grade, label, size = 'md' }: Props = $props();
</script>

<span class="aptitude aptitude--{size}" style:--grade-color={`var(--aptitude-${grade.toLowerCase()})`} aria-label={label ? `${label}: ${grade}` : `Aptitude ${grade}`} title={label ? `${label}: ${grade}` : `Aptitude ${grade}`}><b>{grade}</b></span>

<style>
  .aptitude { width: 30px; height: 28px; display: inline-grid; flex: 0 0 auto; place-items: center; border: 1px solid color-mix(in srgb, var(--grade-color) 58%, var(--border-primary)); border-radius: 5px; background: color-mix(in srgb, var(--grade-color) 14%, var(--surface-1)); box-shadow: inset 0 -2px color-mix(in srgb, var(--grade-color) 25%, transparent); }
  b { color: var(--grade-color); font-size: 14px; font-weight: 900; line-height: 1; text-align: center; }
  .aptitude--sm { width: 24px; height: 22px; border-radius: 4px; }
  .aptitude--sm b { font-size: 11px; }
</style>

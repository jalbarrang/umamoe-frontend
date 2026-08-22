<script lang="ts">
  export type AptitudeGradeValue = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  interface Props { grade: AptitudeGradeValue; label?: string; size?: 'sm' | 'md'; }
  let { grade, label, size = 'md' }: Props = $props();
</script>

<span class="aptitude aptitude--{size}" style:--grade-color={`var(--aptitude-${grade.toLowerCase()})`} aria-label={label ? `${label}: ${grade}` : `Aptitude ${grade}`} title={label ? `${label}: ${grade}` : `Aptitude ${grade}`}><b>{grade}</b></span>

<style>
  .aptitude { width: 26px; height: 26px; display: inline-grid; flex: 0 0 auto; place-items: center; border: 0; border-radius: 4px; background: color-mix(in srgb, var(--grade-color) 16%, transparent); }
  b { color: var(--grade-color); font-size: 13px; font-weight: 850; line-height: 1; text-align: center; }
  .aptitude--sm { width: 22px; height: 22px; }
  .aptitude--sm b { font-size: 12px; }
</style>

<script lang="ts">interface Props { label: string; value?: string | number; tone?: 'skill' | 'factor' | 'status'; selected?: boolean; } let { label, value, tone = 'skill', selected = false }: Props = $props();</script>
<span class="chip chip--{tone}" class:selected><strong>{label}</strong>{#if value !== undefined}<small>{value}</small>{/if}</span>
<style>
  .chip { min-height: 30px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface-2); color: var(--color-text-muted); font-size: var(--font-xs); }
  .chip strong { color: var(--color-text); font-weight: 700; }
  .chip small { color: inherit; font-size: 10px; font-variant-numeric: tabular-nums; }
  .chip--factor { border-left: 3px solid var(--color-secondary); } .chip--status { border-radius: var(--radius-pill); }
  .chip.selected { border-color: var(--color-accent); background: var(--color-accent-soft); color: var(--color-accent); }
</style>

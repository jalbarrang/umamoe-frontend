<script lang="ts">interface Props { label: string; value: string | number; detail?: string; trend?: 'up' | 'down' | 'flat'; tone?: 'neutral' | 'accent' | 'success' | 'warning'; } let { label, value, detail, trend = 'flat', tone = 'neutral' }: Props = $props();</script>
<article class="stat stat--{tone}"><span>{label}</span><strong>{value}</strong>{#if detail}<small class="trend--{trend}">{detail}</small>{/if}</article>
<style>
  .stat { min-width: 0; padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); }
  span { display: block; overflow: hidden; color: var(--color-text-muted); font-size: var(--font-xs); font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
  strong { display: block; margin-top: var(--space-1); font-size: clamp(1.3rem, 5cqi, 1.8rem); font-variant-numeric: tabular-nums; line-height: 1.2; }
  small { display: block; margin-top: var(--space-1); color: var(--color-text-subtle); font-size: var(--font-xs); }
  .stat--accent strong { color: var(--color-accent); } .stat--success strong { color: var(--color-success); } .stat--warning strong { color: var(--color-warning); }
  .trend--up { color: var(--color-success); } .trend--down { color: var(--color-danger); }
</style>

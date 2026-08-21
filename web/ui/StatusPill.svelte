<script lang="ts">import Icon from './Icon.svelte'; interface Props { label: string; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; } let { label, tone = 'neutral' }: Props = $props();</script>
<span class="status status--{tone}"><Icon name={tone === 'warning' || tone === 'danger' ? 'warning' : tone === 'success' ? 'check' : 'info'} size={15}/>{label}</span>
<style>
  .status { display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 4px 10px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); background: var(--color-surface-2); color: var(--color-text-muted); font-size: var(--font-xs); font-weight: 700; }
  .status--success { color: var(--color-secondary); background: var(--color-secondary-soft); border-color: color-mix(in srgb, var(--color-secondary) 35%, transparent); }
  .status--warning { color: var(--color-warning); background: var(--color-warning-soft); border-color: color-mix(in srgb, var(--color-warning) 35%, transparent); }
  .status--danger { color: var(--color-danger); background: var(--color-danger-soft); border-color: color-mix(in srgb, var(--color-danger) 35%, transparent); }
  .status--info { color: var(--color-accent); background: var(--color-accent-soft); border-color: color-mix(in srgb, var(--color-accent) 35%, transparent); }
</style>

<script lang="ts">
  import Icon from './Icon.svelte';
  export type SparkTone = 'blue' | 'pink' | 'green' | 'white';
  export type SparkSource = 'main' | 'parent' | 'p2';
  interface Props { name: string; level: number; tone?: SparkTone; chance?: string; source?: SparkSource; compact?: boolean; }
  let { name, level, tone = 'white', chance, source, compact = false }: Props = $props();
  const sourceLabel = $derived(source === 'main' ? 'Main parent' : source === 'parent' ? 'Parent' : source === 'p2' ? 'P2 legacy' : undefined);
</script>

<span class="spark spark--{tone}" class:compact title={sourceLabel ? `${name} · ${sourceLabel}` : name} data-source={source} aria-label={`${level} star ${name}${chance ? `, ${chance}` : ''}${sourceLabel ? `, ${sourceLabel}` : ''}`}>
  <span class="level">{level}</span><span class="star" aria-hidden="true">★</span><span class="name">{name}</span>
  {#if chance}<span class="chance">{chance}</span>{/if}
  {#if source === 'p2'}<span class="p2-marker" aria-hidden="true"><Icon name="user" size={16}/></span>{/if}
</span>

<style>
  .spark { --spark-rgb: 158 158 158; --spark-color: var(--color-text-muted); max-width: 100%; display: inline-flex; align-items: center; gap: .25rem; padding: .25rem .5rem; border: 1px solid rgb(var(--spark-rgb) / .5); border-radius: var(--radius-md); background: rgb(var(--spark-rgb) / .15); color: var(--spark-color); font-size: .875rem; font-weight: 500; line-height: var(--line-height-none); white-space: nowrap; }
  .spark--blue { --spark-rgb: 33 150 243; --spark-color: var(--accent-primary); }
  .spark--pink { --spark-rgb: 233 30 99; --spark-color: var(--accent-pink); }
  .spark--green { --spark-rgb: 76 175 80; --spark-color: var(--accent-secondary); }
  .level { flex: 0 0 auto; color: var(--spark-color); font-size: inherit; font-weight: 600; font-variant-numeric: tabular-nums; line-height: var(--line-height-none); }
  .star { flex: 0 0 auto; color: var(--spark-color); font-size: 14px; line-height: var(--line-height-none); }
  .name { min-width: 0; max-width: none; overflow: visible; color: inherit; font-size: inherit; line-height: var(--line-height-none); text-overflow: clip; white-space: nowrap; }
  .chance { flex: 0 0 auto; margin-left: auto; padding: 2px 5px; border: 1px solid rgb(255 255 255 / .12); border-radius: 4px; background: rgb(255 255 255 / .08); color: var(--color-text-muted); font-size: .85em; font-weight: 700; font-variant-numeric: tabular-nums; line-height: var(--line-height-none); }
  .spark[data-source='main'] .level { color: var(--accent-warning); text-shadow: 0 0 8px rgb(255 183 77 / .3); }
  .p2-marker { width: 16px; height: 16px; display: inline-grid; flex: 0 0 auto; place-items: center; color: var(--accent-purple); line-height: var(--line-height-none); }
  .compact { padding: .15rem .5rem; border-radius: var(--radius-sm); font-size: .72rem; }
  .compact .star { font-size: 11px; }
  .compact .p2-marker { width: 12px; height: 12px; }
  .compact .p2-marker :global(svg) { width: 12px; height: 12px; }
  :global([data-theme='light']) .chance { border-color: rgb(17 24 39 / .14); background: rgb(17 24 39 / .06); }

  @media (max-width: 480px) {
    .spark:not(.compact) { gap: .18rem; padding: .16rem .36rem; border-radius: var(--radius-sm); font-size: .68rem; }
    .spark:not(.compact) .star { font-size: 9px; }
    .spark:not(.compact) .chance { padding: 1px 4px; font-size: .64rem; }
    .spark:not(.compact) .p2-marker { width: 11px; height: 11px; }
    .spark:not(.compact) .p2-marker :global(svg) { width: 11px; height: 11px; }
  }
</style>

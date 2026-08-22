<script lang="ts">
  export type SparkTone = 'blue' | 'pink' | 'green' | 'white';
  export type SparkSource = 'main' | 'parent' | 'p2';
  interface Props { name: string; level: number; tone?: SparkTone; chance?: string; source?: SparkSource; compact?: boolean; }
  let { name, level, tone = 'white', chance, source, compact = false }: Props = $props();
  const sourceLabel = $derived(source === 'main' ? 'Main parent' : source === 'parent' ? 'Parent' : source === 'p2' ? 'P2 legacy' : undefined);
</script>

<span class="spark spark--{tone}" class:compact title={sourceLabel ? `${name} · ${sourceLabel}` : name} data-source={source} aria-label={`${level} star ${name}${chance ? `, ${chance}` : ''}${sourceLabel ? `, ${sourceLabel}` : ''}`}>
  <span class="level"><strong>{level}</strong><span class="star" aria-hidden="true">★</span></span><span class="name">{name}</span>
  {#if chance}<span class="chance">{chance}</span>{/if}
  {#if source === 'main' || source === 'p2'}<span class="source-marker" aria-hidden="true"></span>{/if}
</span>

<style>
  .spark { --spark-rgb: 158 158 158; --spark-color: var(--color-text-muted); min-height: 24px; max-width: 100%; display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border: 1px solid rgb(var(--spark-rgb) / .32); border-radius: var(--radius-sm); background: rgb(var(--spark-rgb) / .08); color: var(--color-text); font-size: .68rem; font-weight: 550; line-height: 1.2; }
  .spark--blue { --spark-rgb: 33 150 243; --spark-color: var(--accent-primary); }
  .spark--pink { --spark-rgb: 233 30 99; --spark-color: var(--accent-pink); }
  .spark--green { --spark-rgb: 76 175 80; --spark-color: var(--accent-secondary); }
  .level { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 2px; color: var(--spark-color); }
  strong { font-size: inherit; font-weight: 800; font-variant-numeric: tabular-nums; }
  .star { color: var(--spark-color); font-size: 10px; line-height: 1; }
  .name { min-width: 0; max-width: none; overflow: visible; color: var(--color-text); text-overflow: clip; white-space: nowrap; }
  .chance { flex: 0 0 auto; margin-left: 3px; padding: 1px 4px; border-radius: 3px; background: rgb(0 0 0 / .22); color: var(--color-text-muted); font-size: .56rem; font-weight: 750; font-variant-numeric: tabular-nums; }
  .source-marker { width: 4px; height: 4px; flex: 0 0 auto; margin-left: 2px; border-radius: 50%; background: currentColor; box-shadow: 0 0 5px currentColor; opacity: .9; }
  .spark[data-source='main'] .level { color: var(--accent-warning); text-shadow: 0 0 8px rgb(255 183 77 / .3); }
  .spark[data-source='p2'] .level { color: var(--accent-purple); text-shadow: 0 0 8px rgb(206 147 216 / .3); }
  .spark[data-source='main'] .source-marker { color: var(--accent-warning); }
  .spark[data-source='p2'] .source-marker { color: var(--accent-purple); }
  .compact { min-height: 21px; padding: 1px 5px; border-radius: var(--radius-xs); font-size: .62rem; }
  .compact .chance { padding: 0 3px; font-size: .52rem; }
  :global([data-theme='light']) .spark { background: rgb(var(--spark-rgb) / .055); box-shadow: inset 0 1px 0 rgb(255 255 255 / .7); }
</style>

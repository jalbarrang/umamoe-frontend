<script lang="ts">
  import Icon from './Icon.svelte';

  export type SparkTone = 'blue' | 'pink' | 'green' | 'white';
  export type SparkSource = 'main' | 'parent' | 'p2';
  interface Props { name: string; level: number; tone?: SparkTone; chance?: string; source?: SparkSource; compact?: boolean; }
  let { name, level, tone = 'white', chance, source, compact = false }: Props = $props();
  const sourceLabel = $derived(source === 'main' ? 'Main parent' : source === 'parent' ? 'Parent' : source === 'p2' ? 'P2 legacy' : undefined);
</script>

<span class="spark spark--{tone}" class:compact title={sourceLabel ? `${name} · ${sourceLabel}` : name} data-source={source} aria-label={`${level} star ${name}${chance ? `, ${chance}` : ''}${sourceLabel ? `, ${sourceLabel}` : ''}`}>
  <span class="level"><strong>{level}</strong><span class="star" aria-hidden="true">★</span></span><span class="name">{name}</span>
  {#if chance}<span class="chance">{chance}</span>{/if}
  {#if source === 'main' || source === 'p2'}<span class="source-marker" aria-hidden="true"><Icon name="user" size={12}/></span>{/if}
</span>

<style>
  .spark { --spark-rgb: 158 158 158; --spark-color: var(--color-text-muted); min-height: 26px; max-width: 100%; display: inline-flex; align-items: center; gap: 5px; padding: 3px 7px; border: 1px solid rgb(var(--spark-rgb) / .30); border-radius: var(--radius-sm); background: rgb(var(--spark-rgb) / .075); color: var(--color-text); font-size: .75rem; font-weight: 500; line-height: 1.2; box-shadow: inset 0 1px 0 rgb(255 255 255 / .025); }
  .spark--blue { --spark-rgb: 33 150 243; --spark-color: var(--accent-primary); }
  .spark--pink { --spark-rgb: 233 30 99; --spark-color: var(--accent-pink); }
  .spark--green { --spark-rgb: 76 175 80; --spark-color: var(--accent-secondary); }
  .level { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 2px; color: var(--spark-color); }
  strong { font-size: inherit; font-weight: 800; font-variant-numeric: tabular-nums; }
  .star { color: var(--spark-color); font-size: 12px; line-height: 1; }
  .name { min-width: 0; color: var(--color-text); overflow-wrap: anywhere; }
  .chance { flex: 0 0 auto; margin-left: 1px; padding-left: 5px; border-left: 1px solid rgb(var(--spark-rgb) / .28); color: var(--color-text-muted); font-size: .63rem; font-weight: 700; font-variant-numeric: tabular-nums; }
  .source-marker { display: inline-flex; flex: 0 0 auto; margin-left: 1px; }
  .spark[data-source='main'] .level,
  .spark[data-source='main'] .source-marker { color: var(--accent-warning); filter: drop-shadow(0 0 4px rgb(255 183 77 / .35)); }
  .spark[data-source='p2'] .level,
  .spark[data-source='p2'] .source-marker { color: var(--accent-purple); filter: drop-shadow(0 0 4px rgb(206 147 216 / .35)); }
  .compact { min-height: 23px; gap: 4px; padding: 2px 6px; border-radius: var(--radius-xs); font-size: .68rem; }
  :global([data-theme='light']) .spark { background: rgb(var(--spark-rgb) / .055); box-shadow: inset 0 1px 0 rgb(255 255 255 / .7); }
</style>

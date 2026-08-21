<script lang="ts">
  export type SparkTone = 'blue' | 'pink' | 'green' | 'white';
  interface Props { name: string; level: number; tone?: SparkTone; chance?: string; source?: 'main' | 'parent' | 'legacy'; compact?: boolean; }
  let { name, level, tone = 'white', chance, source, compact = false }: Props = $props();
</script>

<span class="spark spark--{tone}" class:compact>
  <strong>{level}</strong><span class="star" aria-hidden="true">★</span><span class="name">{name}</span>
  {#if chance}<span class="chance">{chance}</span>{/if}
  {#if source}<span class="source source--{source}">{source === 'main' ? 'P1' : source === 'parent' ? 'P' : 'P2'}</span>{/if}
</span>

<style>
  .spark { --spark-rgb: 158 158 158; --spark-text: var(--color-text-muted); min-height: 27px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border: 1px solid rgb(var(--spark-rgb) / .50); border-radius: var(--radius-md); background: rgb(var(--spark-rgb) / .15); color: var(--spark-text); font-size: .75rem; font-weight: 500; line-height: 1; white-space: nowrap; }
  .spark--blue { --spark-rgb: 33 150 243; --spark-text: var(--accent-primary); }
  .spark--pink { --spark-rgb: 233 30 99; --spark-text: var(--accent-pink); }
  .spark--green { --spark-rgb: 76 175 80; --spark-text: var(--accent-secondary); }
  strong { font-size: inherit; font-weight: 700; }
  .star { color: rgb(var(--spark-rgb)); font-size: 13px; line-height: 1; }
  .name { overflow: hidden; text-overflow: ellipsis; }
  .chance { margin-left: 2px; padding: 2px 5px; border: 1px solid rgb(255 255 255 / .12); border-radius: 4px; background: rgb(255 255 255 / .08); color: var(--color-text-muted); font-size: .64rem; font-weight: 700; font-variant-numeric: tabular-nums; }
  .source { padding-left: 4px; border-left: 1px solid rgb(var(--spark-rgb) / .38); color: var(--color-text-muted); font-size: .58rem; font-weight: 800; }
  .source--main { color: var(--accent-warning); }
  .compact { min-height: 23px; padding: 2px 6px; border-radius: var(--radius-sm); font-size: .68rem; }
  :global([data-theme='light']) .chance { border-color: rgb(17 24 39 / .15); background: white; }
</style>

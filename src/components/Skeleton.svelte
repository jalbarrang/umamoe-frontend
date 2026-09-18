<script lang="ts">interface Props { width?: string; height?: string; radius?: string; } let { width = '100%', height = '1rem', radius = 'var(--radius-sm)' }: Props = $props();</script>
<span class="skeleton" style:width style:height style:border-radius={radius} aria-hidden="true"></span>
<style>.skeleton { display: block; background: linear-gradient(90deg, var(--color-surface-2), var(--color-surface-3), var(--color-surface-2)); background-size: 200% 100%; animation: shimmer 1.4s ease-in-out infinite; } @keyframes shimmer { to { background-position: -200% 0; } }</style>

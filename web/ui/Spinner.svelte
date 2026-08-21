<script lang="ts">interface Props { label?: string; size?: number; } let { label = 'Loading', size = 24 }: Props = $props();</script>
<span class="spinner" style:width="{size}px" style:height="{size}px" role="status"><span class="sr-only">{label}</span></span>
<style>.spinner { display: inline-block; flex: 0 0 auto; border: 2px solid var(--color-border-strong); border-right-color: var(--color-accent); border-radius: 50%; animation: spin .7s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }</style>

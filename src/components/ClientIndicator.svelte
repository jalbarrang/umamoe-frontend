<script lang="ts">
  import { clientConnection } from '@/services/client/client-state';
  import Icon from './Icon.svelte';
  const labels = { 'not-installed': 'Client offline', detected: 'Client detected', pairing: 'Pairing client', connected: 'Live client', reconnecting: 'Reconnecting', 'permission-blocked': 'Local access blocked', 'version-incompatible': 'Update client', 'cloud-fallback': 'Cloud state' } as const;
  const tones = { connected: 'success', reconnecting: 'warning', pairing: 'info', detected: 'info', 'permission-blocked': 'danger', 'version-incompatible': 'danger', 'cloud-fallback': 'neutral', 'not-installed': 'neutral' } as const;
</script>
<a href="/connect" class="indicator indicator--{tones[$clientConnection]}" aria-label="Standalone client: {labels[$clientConnection]}"><Icon name="connect" size={17}/><span>{labels[$clientConnection]}</span></a>
<style>
  .indicator { min-height: 38px; display: inline-flex; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid var(--color-border); border-radius: var(--radius-pill); color: var(--color-text-muted); text-decoration: none; font-size: var(--font-xs); font-weight: 700; }
  .indicator--success { color: var(--color-secondary); border-color: color-mix(in srgb, var(--color-secondary) 35%, transparent); background: var(--color-secondary-soft); }
  .indicator--warning { color: var(--color-warning); background: var(--color-warning-soft); }
  .indicator--danger { color: var(--color-danger); background: var(--color-danger-soft); }
  .indicator--info { color: var(--color-accent); background: var(--color-accent-soft); }
  @media (max-width: 560px) { .indicator span { display: none; } .indicator { width: 38px; padding: 0; justify-content: center; } }
</style>

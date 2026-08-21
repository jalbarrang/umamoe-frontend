<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  import type { IconName } from './icon-types';
  interface Props {
    children?: Snippet;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md';
    type?: 'button' | 'submit' | 'reset';
    icon?: IconName;
    disabled?: boolean;
    loading?: boolean;
    ariaLabel?: string;
    onclick?: (event: MouseEvent) => void;
  }
  let { children, variant = 'primary', size = 'md', type = 'button', icon, disabled = false, loading = false, ariaLabel, onclick }: Props = $props();
</script>

<button class="ui-button ui-button--{variant} ui-button--{size}" {type} disabled={disabled || loading} aria-busy={loading} aria-label={ariaLabel} {onclick}>
  {#if loading}<span class="button-spinner" aria-hidden="true"></span>{:else if icon}<Icon name={icon} size={18} />{/if}
  {#if children}<span>{@render children()}</span>{/if}
</button>

<style>
  .ui-button { min-height: var(--touch-target); padding: 0 var(--space-4); display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); border: 1px solid transparent; border-radius: var(--radius-md); cursor: pointer; font-weight: 700; transition: transform var(--duration-fast) var(--easing-standard), background var(--duration-fast), border-color var(--duration-fast); }
  .ui-button:hover:not(:disabled) { transform: translateY(-1px); }
  .ui-button:active:not(:disabled) { transform: translateY(0); }
  .ui-button:disabled { cursor: not-allowed; opacity: .5; }
  .ui-button--primary { color: #07121d; background: var(--color-accent); }
  .ui-button--primary:hover:not(:disabled) { background: color-mix(in srgb, var(--color-accent) 88%, white); }
  .ui-button--secondary { color: var(--color-text); background: var(--color-surface-2); border-color: var(--color-border); }
  .ui-button--secondary:hover:not(:disabled), .ui-button--ghost:hover:not(:disabled) { background: var(--color-surface-3); border-color: var(--color-border-strong); }
  .ui-button--ghost { color: var(--color-text-muted); background: transparent; }
  .ui-button--danger { color: var(--color-danger); background: var(--color-danger-soft); border-color: color-mix(in srgb, var(--color-danger) 38%, transparent); }
  .ui-button--sm { min-height: 36px; padding-inline: var(--space-3); font-size: var(--font-sm); }
  .button-spinner { width: 16px; height: 16px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>

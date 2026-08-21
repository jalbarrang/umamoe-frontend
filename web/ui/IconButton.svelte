<script lang="ts">
  import Icon from './Icon.svelte';
  import type { IconName } from './icon-types';

  interface Props {
    icon: IconName;
    label: string;
    selected?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'md';
    onclick?: (event: MouseEvent) => void;
  }

  let { icon, label, selected = false, disabled = false, size = 'md', onclick }: Props = $props();
</script>

<button
  class="icon-button icon-button--{size}"
  class:selected
  type="button"
  aria-label={label}
  aria-pressed={selected}
  {disabled}
  {onclick}
>
  <Icon name={icon} size={size === 'sm' ? 17 : 20} />
</button>

<style>
  .icon-button {
    width: var(--touch-target);
    height: var(--touch-target);
    display: inline-grid;
    flex: 0 0 auto;
    place-items: center;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: background var(--duration-fast), color var(--duration-fast), transform var(--duration-fast);
  }
  .icon-button:hover:not(:disabled) { background: var(--color-surface-2); color: var(--color-text); }
  .icon-button:active:not(:disabled) { transform: scale(.96); }
  .icon-button.selected { border-color: var(--color-border); background: var(--color-accent-soft); color: var(--color-accent); }
  .icon-button:disabled { cursor: not-allowed; opacity: .45; }
  .icon-button--sm { width: 36px; height: 36px; border-radius: var(--radius-sm); }
</style>

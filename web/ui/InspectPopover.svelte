<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';
  interface Props { label: string; trigger: Snippet; children: Snippet; align?: 'start' | 'end'; }
  let { label, trigger, children, align = 'start' }: Props = $props();
  let open = $state(false);
  function handleKeydown(event: KeyboardEvent) { if (open && event.key === 'Escape') open = false; }
</script>

<svelte:window onkeydown={handleKeydown}/>
<div class="inspect" class:open class:align-end={align === 'end'}>
  <button type="button" class="trigger" aria-expanded={open} aria-haspopup="dialog" onclick={() => open = !open}>{@render trigger()}</button>
  {#if open}<div class="popover" role="dialog" aria-label={label}><button type="button" class="close" aria-label={`Close ${label}`} onclick={() => open = false}><Icon name="close" size={14}/></button>{@render children()}</div>{/if}
</div>

<style>
  .inspect { position: relative; display: inline-flex; }.trigger { min-width: 0; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; text-align: inherit; }.trigger:focus-visible { border-radius: var(--radius-sm); outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .popover { position: absolute; z-index: var(--z-overlay); top: calc(100% + 7px); left: 0; width: min(310px, calc(100vw - 16px)); padding: 10px; border: 1px solid var(--factor-panel-border); border-radius: var(--radius-md); background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown); }.align-end .popover { right: 0; left: auto; }.popover::before { position: absolute; top: -5px; left: 14px; width: 8px; height: 8px; border-top: 1px solid var(--factor-panel-border); border-left: 1px solid var(--factor-panel-border); background: var(--factor-panel-bg); content: ''; transform: rotate(45deg); }.align-end .popover::before { right: 14px; left: auto; }
  .close { position: absolute; top: 5px; right: 5px; width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-subtle); cursor: pointer; }.close:hover { background: var(--factor-option-hover); color: var(--color-text); }
</style>

<script lang="ts">
  import Icon from './Icon.svelte';
  export interface MenuItem { id: string; label: string; icon?: import('./icon-types').IconName; danger?: boolean; disabled?: boolean; }
  interface Props { label: string; items: MenuItem[]; onselect?: (id: string) => void; }
  let { label, items, onselect }: Props = $props();
  let details: HTMLDetailsElement;
  function select(id: string) { onselect?.(id); details.open = false; }
</script>

<details class="menu" bind:this={details}>
  <summary>{label}<Icon name="chevron" size={15}/></summary>
  <div role="menu">
    {#each items as item}
      <button type="button" role="menuitem" class:danger={item.danger} disabled={item.disabled} onclick={() => select(item.id)}>
        {#if item.icon}<Icon name={item.icon} size={17}/>{/if}<span>{item.label}</span>
      </button>
    {/each}
  </div>
</details>

<style>
  .menu { position: relative; width: fit-content; }
  summary { height: var(--control-height); display: inline-flex; align-items: center; gap: var(--space-2); padding: 0 10px; border: 1px solid var(--factor-field-border); border-radius: 8px; background: var(--factor-field-bg); color: var(--factor-field-text); cursor: pointer; font-size: var(--font-sm); font-weight: 600; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  details[open] summary :global(svg) { transform: rotate(180deg); }
  div { position: absolute; top: calc(100% + 6px); left: 0; z-index: var(--z-overlay); width: max-content; min-width: 200px; display: grid; gap: 2px; padding: 4px; border: 1px solid var(--factor-panel-border); border-radius: 10px; background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown); }
  button { min-height: 36px; display: flex; align-items: center; gap: var(--space-2); padding: 0 12px; border: 0; border-radius: 7px; background: transparent; color: var(--factor-option-text); cursor: pointer; font-size: var(--font-sm); text-align: left; }
  button:hover:not(:disabled) { background: var(--factor-option-hover); }
  button.danger { color: var(--color-danger); }
  button:disabled { opacity: .4; cursor: not-allowed; }
  @media (max-width: 767px) { button { min-height: var(--touch-target); } }
</style>

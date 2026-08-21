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
  summary { min-height: var(--touch-target); display: inline-flex; align-items: center; gap: var(--space-2); padding: 0 var(--space-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); color: var(--color-text); cursor: pointer; font-size: var(--font-sm); font-weight: 700; list-style: none; }
  summary::-webkit-details-marker { display: none; }
  details[open] summary :global(svg) { transform: rotate(180deg); }
  div { position: absolute; top: calc(100% + 6px); left: 0; z-index: var(--z-overlay); width: max-content; min-width: 200px; display: grid; gap: 2px; padding: 5px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-overlay); box-shadow: var(--shadow-md); }
  button { min-height: 40px; display: flex; align-items: center; gap: var(--space-2); padding: 0 var(--space-3); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text); cursor: pointer; text-align: left; }
  button:hover:not(:disabled) { background: var(--color-surface-2); }
  button.danger { color: var(--color-danger); }
  button:disabled { opacity: .4; cursor: not-allowed; }
</style>

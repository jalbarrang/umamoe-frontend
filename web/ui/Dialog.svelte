<script lang="ts">
  import type { Snippet } from 'svelte';
  import Button from './Button.svelte';
  import Icon from './Icon.svelte';
  interface Props { id?: string; open?: boolean; title: string; description?: string; children: Snippet; actions?: Snippet; mobileSheet?: boolean; onclose?: () => void; }
  let { id = 'ui-dialog', open = $bindable(false), title, description, children, actions, mobileSheet = false, onclose }: Props = $props();
  let element: HTMLDialogElement;
  function close() { open = false; onclose?.(); }
  $effect(() => {
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  });
</script>

<dialog
  bind:this={element}
  class:dialog--sheet={mobileSheet}
  aria-labelledby="{id}-title"
  aria-describedby={description ? `${id}-description` : undefined}
  oncancel={(event) => { event.preventDefault(); close(); }}
  onclick={(event) => { if (event.target === event.currentTarget) close(); }}
>
  <section class="dialog-panel">
    <header><div><h2 id="{id}-title">{title}</h2>{#if description}<p id="{id}-description">{description}</p>{/if}</div><Button variant="ghost" icon="close" ariaLabel="Close dialog" onclick={close}/></header>
    <div class="content">{@render children()}</div>
    {#if actions}<footer>{@render actions()}</footer>{/if}
  </section>
</dialog>
<style>
  dialog { width: min(calc(100% - 2rem), 540px); max-height: min(84dvh, 720px); margin: auto; padding: 0; overflow: hidden; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-overlay); color: var(--color-text); box-shadow: var(--shadow-md); }
  dialog::backdrop { background: rgb(0 0 0 / .58); }
  .dialog-panel { max-height: min(84dvh, 720px); overflow: auto; }
  header { position: sticky; top: 0; display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3); padding: var(--space-5); border-bottom: 1px solid var(--color-border); background: inherit; }
  h2 { margin: 0; font-size: var(--font-lg); } p { margin: var(--space-1) 0 0; font-size: var(--font-sm); }
  .content { padding: var(--space-5); }
  footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-4) var(--space-5); border-top: 1px solid var(--color-border); }
  @media (max-width: 767px) {
    dialog.dialog--sheet { width: 100%; max-width: none; max-height: 88dvh; margin: auto 0 0; border-right: 0; border-bottom: 0; border-left: 0; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
    .dialog--sheet .dialog-panel { max-height: 88dvh; padding-bottom: env(safe-area-inset-bottom); }
  }
</style>

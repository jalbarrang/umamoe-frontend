<script lang="ts">
  import Icon from './Icon.svelte';
  export interface Toast { id: string; title: string; message?: string; tone?: 'info' | 'success' | 'warning' | 'danger'; }
  interface Props { toasts?: Toast[]; ondismiss?: (id: string) => void; }
  let { toasts = [], ondismiss }: Props = $props();
</script>

<div class="region" aria-live="polite" aria-label="Notifications">
  {#each toasts as toast (toast.id)}
    <article class="toast toast--{toast.tone ?? 'info'}">
      <Icon name={toast.tone === 'success' ? 'check' : toast.tone === 'warning' || toast.tone === 'danger' ? 'warning' : 'info'} size={18}/>
      <div><strong>{toast.title}</strong>{#if toast.message}<p>{toast.message}</p>{/if}</div>
      <button type="button" aria-label="Dismiss notification" onclick={() => ondismiss?.(toast.id)}><Icon name="close" size={16}/></button>
    </article>
  {/each}
</div>

<style>
  .region { position: fixed; right: var(--space-4); bottom: calc(var(--bottom-nav-height) + var(--space-4)); z-index: calc(var(--z-overlay) + 10); width: min(380px, calc(100vw - 2rem)); display: grid; gap: var(--space-2); pointer-events: none; }
  .toast { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--color-border); border-left: 3px solid var(--color-accent); border-radius: var(--radius-md); background: var(--color-overlay); box-shadow: var(--shadow-md); pointer-events: auto; }
  .toast--success { border-left-color: var(--color-success); } .toast--warning { border-left-color: var(--color-warning); } .toast--danger { border-left-color: var(--color-danger); }
  strong { display: block; font-size: var(--font-sm); } p { margin: 2px 0 0; font-size: var(--font-xs); }
  button { width: 30px; height: 30px; display: grid; place-items: center; margin: -5px; padding: 0; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; }
  @media (min-width: 768px) { .region { bottom: var(--space-4); } }
</style>

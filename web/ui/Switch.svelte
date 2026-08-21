<script lang="ts">interface Props { id: string; label: string; description?: string; checked?: boolean; disabled?: boolean; onchange?: (event: Event) => void; } let { id, label, description, checked = $bindable(false), disabled = false, onchange }: Props = $props();</script>
<label class="switch" for={id}><span class="copy"><strong>{label}</strong>{#if description}<small>{description}</small>{/if}</span><input {id} type="checkbox" role="switch" bind:checked {disabled} {onchange}/><span class="track" aria-hidden="true"><span></span></span></label>
<style>
  .switch { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: var(--space-4); min-height: var(--touch-target); cursor: pointer; }
  .copy { display: flex; flex-direction: column; } strong { font-size: var(--font-sm); } small { color: var(--color-text-subtle); }
  input { position: absolute; opacity: 0; pointer-events: none; }
  .track { width: 46px; height: 26px; padding: 3px; border: 1px solid var(--color-border-strong); border-radius: var(--radius-pill); background: var(--color-surface-2); transition: background var(--duration-fast); }
  .track span { display: block; width: 18px; height: 18px; border-radius: 50%; background: var(--color-text-muted); transition: transform var(--duration-fast) var(--easing-standard), background var(--duration-fast); }
  input:checked + .track { border-color: var(--color-accent); background: var(--color-accent-soft); }
  input:checked + .track span { transform: translateX(20px); background: var(--color-accent); }
  input:focus-visible + .track { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  input:disabled + .track { opacity: .5; }
</style>

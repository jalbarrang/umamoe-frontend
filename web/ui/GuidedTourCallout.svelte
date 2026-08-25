<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { title: string; description: string; step: number; total: number; open?: boolean; onback?: () => void; onnext?: () => void; ondismiss?: () => void; }
  let { title, description, step, total, open = true, onback, onnext, ondismiss }: Props = $props();
</script>

{#if open}<aside class="tour" aria-label={`Tour step ${step} of ${total}`}>
  <button type="button" class="dismiss" aria-label="Dismiss tour" onclick={ondismiss}><Icon name="close" size={14}/></button>
  <span class="step">{step} / {total}</span><strong>{title}</strong><p>{description}</p>
  <div class="progress" role="progressbar" aria-label="Tour progress" aria-valuemin="1" aria-valuemax={total} aria-valuenow={step}><span style={`--progress:${step / total * 100}%`}></span></div>
  <div class="actions"><button type="button" disabled={step <= 1} onclick={onback}>Back</button><button type="button" class="primary" onclick={onnext}>{step >= total ? 'Done' : 'Next'}</button></div>
</aside>{/if}

<style>
  .tour { position: relative; width: min(330px, 100%); display: grid; gap: 5px; padding: 11px; border: 1px solid rgb(var(--accent-primary-rgb) / .36); border-radius: var(--radius-md); background: var(--factor-panel-bg); box-shadow: var(--shadow-md); }.tour::before { position: absolute; top: -5px; left: 24px; width: 8px; height: 8px; border-top: 1px solid rgb(var(--accent-primary-rgb) / .36); border-left: 1px solid rgb(var(--accent-primary-rgb) / .36); background: inherit; content: ''; transform: rotate(45deg); }
  .step { color: var(--color-accent); font-size: 9px; font-weight: 750; letter-spacing: .05em; text-transform: uppercase; }.tour > strong { padding-right: 24px; font-size: var(--font-sm); }.tour p { margin: 0; color: var(--color-text-muted); font-size: 10px; line-height: 1.4; }.dismiss { position: absolute; top: 5px; right: 5px; width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-subtle); cursor: pointer; }
  .progress { height: 3px; margin-top: 3px; overflow: hidden; border-radius: var(--radius-pill); background: var(--surface-4); }.progress span { width: var(--progress); height: 100%; display: block; background: var(--color-accent); transition: width var(--duration-normal); }
  .actions { display: flex; justify-content: flex-end; gap: 5px; margin-top: 3px; }.actions button { min-width: 60px; min-height: 32px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; font: inherit; font-size: 10px; }.actions button:disabled { opacity: .35; }.actions .primary { border-color: rgb(var(--accent-primary-rgb) / .46); background: var(--color-accent-soft); color: var(--color-accent); }
  @media (max-width: 767px) { .actions button { min-height: 40px; } }
</style>

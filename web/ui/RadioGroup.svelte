<script lang="ts">
  export interface RadioOption { value: string; label: string; description?: string; disabled?: boolean; }
  interface Props { id: string; legend: string; options: RadioOption[]; value?: string; }
  let { id, legend, options, value = $bindable('') }: Props = $props();
</script>

<fieldset>
  <legend>{legend}</legend>
  <div class="options">
    {#each options as option}
      <label>
        <input type="radio" name={id} value={option.value} bind:group={value} disabled={option.disabled} />
        <span class="radio" aria-hidden="true"></span>
        <span class="copy"><strong>{option.label}</strong>{#if option.description}<small>{option.description}</small>{/if}</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
  legend { margin-bottom: var(--space-2); font-size: var(--font-sm); font-weight: 700; }
  .options { display: grid; gap: var(--space-1); }
  label { min-height: var(--touch-target); display: grid; grid-template-columns: 22px minmax(0, 1fr); align-items: center; gap: var(--space-3); cursor: pointer; }
  input { position: absolute; opacity: 0; }
  .radio { width: 22px; height: 22px; display: grid; place-items: center; border: 1px solid var(--color-border-strong); border-radius: 50%; background: var(--color-surface-1); }
  input:checked + .radio::after { width: 12px; height: 12px; border-radius: 50%; background: var(--color-accent); content: ''; }
  input:focus-visible + .radio { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  input:disabled ~ * { opacity: .45; }
  .copy { display: flex; flex-direction: column; }
  strong { font-size: var(--font-sm); }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
</style>

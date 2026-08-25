<script lang="ts">
  import IconButton from './IconButton.svelte';
  import SparkItem from './SparkItem.svelte';
  export type SparkTone = 'blue' | 'pink' | 'green' | 'white';
  interface Props { id: string; name: string; tone: SparkTone; level?: number; chance?: string; source?: 'main' | 'parent' | 'p2'; disabled?: boolean; onremove?: () => void; onchange?: (level: number) => void; }
  let { id, name, tone, level = $bindable(1), chance, source, disabled = false, onremove, onchange }: Props = $props();
  function select(next: number) { level = next; onchange?.(next); }
</script>

<div class="spark-editor" data-tone={tone} data-spark-id={id}>
  <div class="preview"><SparkItem {name} {level} {chance} {source} tone={tone}/></div>
  <fieldset disabled={disabled}><legend>Stars for {name}</legend>{#each [1, 2, 3] as star}<button type="button" aria-pressed={level === star} class:active={level === star} onclick={() => select(star)}>{star}<span aria-hidden="true">★</span></button>{/each}</fieldset>
  {#if onremove}<span class="remove"><IconButton icon="trash" label={`Remove ${name}`} size="sm" onclick={onremove}/></span>{/if}
</div>

<style>
  .spark-editor { min-width: 0; display: grid; grid-template-columns: minmax(120px, 1fr) auto auto; align-items: center; gap: 6px; padding: 5px 0; border-bottom: 1px solid var(--border-subtle); container: spark-editor / inline-size; }
  .preview { min-width: 0; overflow: hidden; }
  fieldset { display: inline-flex; margin: 0; padding: 2px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); } legend { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); }
  fieldset button { min-width: 34px; min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 2px; padding: 0 5px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-subtle); cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; }
  fieldset button:hover { color: var(--color-text); background: var(--factor-option-hover); } fieldset button.active { background: var(--color-accent-soft); color: var(--color-accent); }
  [data-tone='pink'] fieldset button.active { background: rgb(240 98 146 / .14); color: var(--accent-pink); } [data-tone='green'] fieldset button.active { background: rgb(129 199 132 / .14); color: var(--accent-secondary); } [data-tone='white'] fieldset button.active { background: var(--surface-4); color: var(--color-text); }
  .remove :global(.icon-button) { color: var(--accent-error); }
  @container spark-editor (max-width: 420px) { .spark-editor { grid-template-columns: minmax(0, 1fr) auto; }.preview { grid-column: 1 / -1; } fieldset button { min-width: 44px; min-height: 40px; } }
</style>

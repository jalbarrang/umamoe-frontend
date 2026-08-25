<script lang="ts">
  import Icon from './Icon.svelte';
  interface Suggestion { label: string; insert: string; description?: string; }
  interface Props { id: string; label?: string; value?: string; error?: string; suggestions?: Suggestion[]; examples?: string[]; onrun?: (value: string) => void; }
  let { id, label = 'UQL query', value = $bindable(''), error, suggestions = [], examples = [], onrun }: Props = $props();
  let suggestionsOpen = $state(false);
  function insert(text: string) { value = `${value}${value && !value.endsWith(' ') ? ' ' : ''}${text}`; suggestionsOpen = false; }
</script>

<section class:error class="query-editor" aria-label={label}>
  <header><div><strong>{label}</strong><span>Runs against the loaded route index</span></div><button type="button" aria-expanded={suggestionsOpen} onclick={() => suggestionsOpen = !suggestionsOpen}><Icon name="add" size={14}/>Insert</button></header>
  <div class="editor-wrap"><span class="prompt" aria-hidden="true">›</span><textarea {id} bind:value spellcheck="false" aria-label={label} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : `${id}-hint`} placeholder="distance = long AND blue.speed >= 3"></textarea><button class="run" type="button" onclick={() => onrun?.(value)}>Run query</button></div>
  {#if error}<p id={`${id}-error`} role="alert"><Icon name="warning" size={13}/>{error}</p>{:else}<p id={`${id}-hint`} class="hint"><Icon name="info" size={13}/>Fields and operators are validated before a request is sent.</p>{/if}
  {#if suggestionsOpen && suggestions.length}<div class="suggestions" role="listbox" aria-label="Query suggestions">{#each suggestions as suggestion}<button type="button" role="option" aria-selected="false" onclick={() => insert(suggestion.insert)}><strong>{suggestion.label}</strong>{#if suggestion.description}<small>{suggestion.description}</small>{/if}<code>{suggestion.insert}</code></button>{/each}</div>{/if}
  {#if examples.length}<div class="examples"><span>Examples</span>{#each examples as example}<button type="button" onclick={() => value = example}><code>{example}</code></button>{/each}</div>{/if}
</section>

<style>
  .query-editor { position: relative; min-width: 0; display: grid; gap: 6px; container: query-editor / inline-size; }
  header { min-width: 0; display: flex; align-items: end; justify-content: space-between; gap: 8px; } header > div { min-width: 0; display: grid; gap: 2px; } header strong { font-size: var(--font-xs); } header span { color: var(--color-text-subtle); font-size: 9px; }
  header button, .run { min-height: 32px; display: inline-flex; align-items: center; gap: 4px; padding: 0 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--factor-field-bg); color: var(--color-text-muted); cursor: pointer; font: inherit; font-size: 10px; }
  .editor-wrap { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: stretch; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: #0d1117; overflow: hidden; }.editor-wrap:focus-within { border-color: var(--factor-field-focus-border); box-shadow: var(--focus-ring); }.prompt { padding: 10px 0 0 9px; color: var(--accent-secondary); font-family: var(--font-mono); }
  textarea { min-width: 0; min-height: 78px; resize: vertical; padding: 10px 8px; border: 0; outline: 0; background: transparent; color: #d4e8ff; font-family: var(--font-mono); font-size: 11px; line-height: 1.5; }.run { align-self: end; margin: 6px; border-color: rgb(var(--accent-primary-rgb) / .4); background: var(--color-accent-soft); color: var(--color-accent); }
  p { min-width: 0; display: flex; align-items: center; gap: 4px; margin: 0; color: var(--accent-error); font-size: 9px; }.hint { color: var(--color-text-subtle); }
  .suggestions { position: absolute; z-index: 4; top: 39px; right: 0; width: min(360px, 100%); max-height: 230px; display: grid; overflow-y: auto; border: 1px solid var(--factor-panel-border); border-radius: var(--radius-md); background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown); }.suggestions button { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 8px; padding: 8px; border: 0; border-bottom: 1px solid var(--factor-option-separator); background: transparent; color: var(--factor-option-text); cursor: pointer; text-align: left; }.suggestions button:hover { background: var(--factor-option-hover); }.suggestions strong { font-size: var(--font-xs); }.suggestions small { grid-column: 1; color: var(--color-text-subtle); font-size: 9px; }.suggestions code { grid-column: 2; grid-row: 1 / span 2; align-self: center; color: var(--color-accent); font-size: 9px; }
  .examples { min-width: 0; display: flex; align-items: center; gap: 4px; overflow-x: auto; }.examples > span { color: var(--color-text-subtle); font-size: 9px; }.examples button { flex: 0 0 auto; padding: 4px 6px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--surface-1); color: var(--color-text-muted); cursor: pointer; }.examples code { font-size: 9px; }
  :global([data-theme='light']) .editor-wrap { background: #f6f8fa; } :global([data-theme='light']) textarea { color: #1f2937; }
  @container query-editor (max-width: 430px) { .editor-wrap { grid-template-columns: auto minmax(0, 1fr); }.run { grid-column: 1 / -1; min-height: 40px; margin-top: 0; }.suggestions { left: 0; right: auto; } }
</style>

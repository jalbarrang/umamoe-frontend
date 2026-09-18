<script lang="ts">
  import Icon from './Icon.svelte';
  interface Option { value: string; label: string; }
  interface Props { title?: string; count: number; noun?: string; filtered?: boolean; sortOptions: Option[]; sort?: string; view?: 'list' | 'grid'; live?: boolean; onrefresh?: () => void; onchange?: (state: { sort: string; view: 'list' | 'grid' }) => void; }
  let { title = 'Results', count, noun = 'records', filtered = false, sortOptions, sort = $bindable(''), view = $bindable('list'), live = false, onrefresh, onchange }: Props = $props();
  function updateView(next: 'list' | 'grid') { view = next; onchange?.({ sort, view }); }
  function updateSort(event: Event) { sort = (event.currentTarget as HTMLSelectElement).value; onchange?.({ sort, view }); }
</script>

<header class="result-toolbar">
  <div class="result-copy"><h3>{title}</h3><p>{count.toLocaleString()} {noun}{#if filtered}<span> · filtered</span>{/if}</p></div>
  {#if live}<div class="live"><span></span>Live</div>{/if}
  {#if onrefresh}<button class="refresh" type="button" aria-label="Refresh results" onclick={onrefresh}><Icon name="refresh" size={15}/><span>Refresh</span></button>{/if}
  <label class="sort"><span>Sort by</span><select value={sort} onchange={updateSort}>{#each sortOptions as option}<option value={option.value}>{option.label}</option>{/each}</select></label>
  <div class="view" role="group" aria-label="Result layout"><button type="button" aria-label="List view" aria-pressed={view === 'list'} class:active={view === 'list'} onclick={() => updateView('list')}><Icon name="menu" size={16}/><span>List</span></button><button type="button" aria-label="Grid view" aria-pressed={view === 'grid'} class:active={view === 'grid'} onclick={() => updateView('grid')}><Icon name="database" size={16}/><span>Grid</span></button></div>
</header>

<style>
  .result-toolbar { min-width: 0; display: flex; flex-wrap: wrap; align-items: end; gap: 7px; padding-bottom: 8px; border-bottom: 1px solid var(--border-subtle); container: result-toolbar / inline-size; }
  .result-copy { min-width: 120px; margin-right: auto; } h3, p { margin: 0; } h3 { font-size: var(--font-md); } p { margin-top: 2px; color: var(--color-text-muted); font-size: 10px; } p span { color: var(--color-accent); }
  .sort { min-width: 130px; display: grid; gap: 3px; color: var(--color-text-subtle); font-size: 9px; } select { min-height: 36px; padding: 0 27px 0 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--factor-field-text); font: inherit; font-size: var(--font-xs); cursor: pointer; }
  .view { display: flex; padding: 2px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); }.view button, .refresh { min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 4px; padding: 0 7px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-muted); cursor: pointer; font: inherit; font-size: 10px; }.view button.active { background: var(--factor-option-selected-bg); color: var(--color-accent); }.refresh { min-height: 36px; border: 1px solid var(--factor-field-border); }.refresh:hover { color: var(--color-accent); }
  .live { align-self: center; display: inline-flex; align-items: center; gap: 4px; color: var(--accent-secondary); font-size: 9px; font-weight: 750; text-transform: uppercase; }.live > span { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  @container result-toolbar (max-width: 560px) { .result-copy { flex: 1 1 100%; }.sort { flex: 1 1 150px; }.sort select { width: 100%; }.view button, .refresh { min-height: 40px; }.view button span, .refresh span { display: none; } }
</style>

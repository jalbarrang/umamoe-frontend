<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Artwork from './Artwork.svelte';
  import Icon from './Icon.svelte';
  import type { CharacterPickerOption } from './picker-types';

  type Mode = 'target' | 'include' | 'exclude';
  type Sort = 'default' | 'name' | 'affinity';
  interface Props {
    label?: string;
    options: CharacterPickerOption[];
    selected?: string[];
    mode?: Mode;
    multiple?: boolean;
    maxVisible?: number;
    onselect?: (selected: string[]) => void;
  }

  let { label = 'Select character', options, selected = $bindable([]), mode = 'target', multiple = false, maxVisible = 12, onselect }: Props = $props();
  let query = $state('');
  let sort = $state<Sort>('affinity');
  const filtered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase();
    const matches = options.filter((option) => !needle || `${option.name} ${option.subtitle ?? ''} ${option.id}`.toLocaleLowerCase().includes(needle));
    if (sort === 'name') return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'affinity') return [...matches].sort((a, b) => (b.affinity ?? -1) - (a.affinity ?? -1));
    return matches;
  });
  const visible = $derived(filtered.slice(0, maxVisible));

  function toggle(id: string) {
    if (multiple) selected = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
    else selected = [id];
    onselect?.(selected);
  }
</script>

<section class="picker picker--{mode}" aria-label={label}>
  <div class="picker-tools">
    <label class="search"><Icon name="search" size={16}/><span class="sr-only">Search characters</span><input type="search" bind:value={query} placeholder="Search characters"/></label>
    <label class="sort"><span class="sr-only">Picker order</span><Icon name="sort" size={15}/><select bind:value={sort}><option value="default">Default</option><option value="name">Name</option>{#if options.some((option) => option.affinity !== undefined)}<option value="affinity">Affinity</option>{/if}</select></label>
    {#if multiple}<span class="selection-count">{selected.length} selected</span>{/if}
  </div>
  <div class="character-grid" role={multiple ? 'group' : 'radiogroup'} aria-label={label}>
    {#each visible as option (option.id)}
      <button type="button" class:selected={selected.includes(option.id)} aria-pressed={multiple ? selected.includes(option.id) : undefined} role={multiple ? undefined : 'radio'} aria-checked={multiple ? undefined : selected.includes(option.id)} disabled={option.disabled} onclick={() => toggle(option.id)}>
        <span class="avatar"><Artwork src={option.image} alt={option.name} size="sm" shape="circle"/></span>
        <span class="copy"><strong>{option.name}</strong>{#if option.subtitle}<small>{option.subtitle}</small>{/if}</span>
        {#if option.affinity !== undefined}<AffinityStat value={option.affinity} compact/>{/if}
        {#if selected.includes(option.id)}<span class="selected-mark" aria-hidden="true"><Icon name="check" size={13}/></span>{/if}
      </button>
    {:else}
      <p class="empty">No characters match “{query}”.</p>
    {/each}
  </div>
  {#if filtered.length > maxVisible}<small class="remaining">{filtered.length - maxVisible} more results load on scroll</small>{/if}
</section>

<style>
  .picker { min-width: 0; display: grid; gap: 8px; container: character-picker / inline-size; }
  .picker-tools { min-width: 0; display: grid; grid-template-columns: minmax(150px, 1fr) auto auto; align-items: center; gap: 6px; }
  .search, .sort { min-width: 0; min-height: 36px; display: flex; align-items: center; gap: 6px; padding: 0 9px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--factor-field-arrow); }
  .search:focus-within, .sort:focus-within { border-color: var(--factor-field-focus-border); background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  input, select { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: var(--factor-field-text); font: inherit; font-size: var(--font-xs); }
  select { width: auto; cursor: pointer; } option { background: var(--factor-panel-bg); color: var(--factor-option-text); }
  .selection-count, .remaining { color: var(--color-text-subtle); font-size: 9px; white-space: nowrap; }
  .character-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(174px, 1fr)); gap: 5px; }
  .character-grid button { position: relative; min-width: 0; min-height: 52px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 5px 7px; overflow: hidden; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--surface-1); color: var(--color-text); cursor: pointer; text-align: left; }
  .character-grid button:hover:not(:disabled) { border-color: var(--border-secondary); background: var(--factor-option-hover); }
  .character-grid button.selected { border-color: rgb(var(--accent-primary-rgb) / .58); background: var(--factor-option-selected-bg); }
  .picker--include .character-grid button.selected { border-color: rgb(129 199 132 / .58); background: rgb(129 199 132 / .10); }
  .picker--exclude .character-grid button.selected { border-color: rgb(229 115 115 / .58); background: rgb(229 115 115 / .10); }
  .character-grid button:disabled { opacity: .42; cursor: not-allowed; }
  .avatar { align-self: end; }
  .copy { min-width: 0; display: grid; gap: 2px; }
  .copy strong, .copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .copy strong { font-size: var(--font-xs); } .copy small { color: var(--color-text-subtle); font-size: 9px; }
  .selected-mark { position: absolute; right: 3px; top: 3px; width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: var(--accent-primary); color: #071018; }
  .picker--include .selected-mark { background: var(--accent-secondary); } .picker--exclude .selected-mark { background: var(--accent-error); }
  .empty { grid-column: 1 / -1; margin: 0; padding: 20px 8px; color: var(--color-text-muted); text-align: center; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
  @container character-picker (max-width: 520px) {
    .picker-tools { grid-template-columns: minmax(0, 1fr) auto; }
    .selection-count { grid-column: 1 / -1; }
    .character-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; }
    .character-grid button { min-height: 58px; grid-template-columns: auto minmax(0, 1fr); padding-inline: 4px; }
    .character-grid button :global(.affinity) { display: none; }
  }
  @container character-picker (max-width: 340px) { .character-grid { grid-template-columns: 1fr; } }
</style>

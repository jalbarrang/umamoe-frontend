<script lang="ts">
  import AffinityStat from './AffinityStat.svelte';
  import Banner from './Banner.svelte';
  import Button from './Button.svelte';
  import Spinner from './Spinner.svelte';
  import Artwork from './Artwork.svelte';
  import CharacterSortMenu from './CharacterSortMenu.svelte';
  import Icon from './Icon.svelte';
  import type { CharacterPickerOption } from './picker-types';

  type Mode = 'target' | 'include' | 'exclude';
  export type CharacterPickerSort = 'default' | 'name' | 'affinity';
  interface Props {
    label?: string;
    options: CharacterPickerOption[];
    loading?: boolean;
    error?: string;
    onretry?: () => void;
    selected?: string[];
    existing?: string[];
    mode?: Mode;
    multiple?: boolean;
    maxVisible?: number;
    sort?: CharacterPickerSort;
    showSort?: boolean;
    showSelectionCount?: boolean;
    searchPlaceholder?: string;
    onselect?: (selected: string[]) => void;
  }

  let { label = 'Select character', options, loading = false, error = '', onretry, selected = $bindable([]), existing = [], mode = 'target', multiple = false, maxVisible = Number.POSITIVE_INFINITY, sort = $bindable<CharacterPickerSort>('default'), showSort = true, showSelectionCount = true, searchPlaceholder = 'Search by name...', onselect }: Props = $props();
  let query = $state('');
  const id = $props.id();
  let visibleLimit = $state(0);
  const filtered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase();
    const matches = options.filter((option) => !needle || `${option.name} ${option.subtitle ?? ''} ${option.id}`.toLocaleLowerCase().includes(needle));
    if (sort === 'name') return [...matches].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'affinity') return [...matches].sort((a, b) => (b.affinity ?? -1) - (a.affinity ?? -1));
    return matches;
  });
  const effectiveLimit = $derived(visibleLimit || maxVisible);
  const visible = $derived(filtered.slice(0, effectiveLimit));

  function toggle(id: string) {
    if (multiple) selected = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
    else selected = [id];
    onselect?.(selected);
  }
</script>

<section class="picker picker--{mode}" aria-label={label}>
  <div class="picker-tools">
    <div class="search"><Icon name="search" size={18}/><input type="text" role="searchbox" aria-label="Search characters" bind:value={query} placeholder={searchPlaceholder} oninput={() => visibleLimit = 0}/>{#if query}<button type="button" class="clear-search" aria-label="Clear character search" onclick={() => { query = ''; visibleLimit = 0; }}><Icon name="close" size={16}/></button>{/if}</div>
    {#if showSort}<CharacterSortMenu bind:value={sort} hasAffinity={options.some((option) => option.affinity !== undefined)}/>{/if}
    {#if multiple && showSelectionCount && selected.length}<span class="selection-count">{selected.length} selected</span>{/if}
  </div>
  {#if error}<Banner title="Character data unavailable" tone="danger"><p>{error}</p>{#if onretry}<Button variant="secondary" onclick={onretry}>Retry character data</Button>{/if}</Banner>{/if}
  {#if loading}<Spinner label="Loading characters…"/>{/if}
  <div class="character-grid" role={multiple ? 'group' : 'radiogroup'} aria-label={label}>
    {#each visible as option, index (option.id)}
      {@const isSelected = selected.includes(option.id) || existing.includes(option.id)}
      <button type="button" class:selected={isSelected} aria-label={option.name} aria-describedby={`${id}-${option.id}-description`} aria-pressed={multiple ? isSelected : undefined} role={multiple ? undefined : 'radio'} aria-checked={multiple ? undefined : isSelected} disabled={option.disabled} onclick={() => toggle(option.id)}>
        <span class="sr-only" id={`${id}-${option.id}-description`}>Outfit {option.id}{option.affinity !== undefined ? ` · Affinity ${option.affinity}` : ''}</span>
        <span class="avatar"><Artwork src={option.image} alt={option.name} size="sm" shape="circle" loading={index < 35 ? 'eager' : 'lazy'}/>{#if multiple && isSelected}<span class="selected-mark" aria-hidden="true"><Icon name={mode === 'exclude' ? 'close' : 'check'} size={24}/></span>{/if}{#if option.affinity !== undefined}<span class="affinity-badge" class:zero={option.affinity === 0}><AffinityStat value={option.affinity} compact/></span>{/if}</span>
        <span class="copy"><strong>{option.name}</strong>{#if option.subtitle}<small>{option.subtitle}</small>{/if}</span>
      </button>
    {:else}
      {#if !loading && !error}<p class="empty">{query ? `No characters match “${query}”.` : 'No characters available.'}</p>{/if}
    {/each}
  </div>
  {#if filtered.length > effectiveLimit}<button class="load-more" type="button" onclick={() => visibleLimit = effectiveLimit + maxVisible}>Show {Math.min(maxVisible, filtered.length - effectiveLimit)} more <small>{filtered.length - effectiveLimit} remaining</small></button>{/if}
</section>

<style>
  .picker { --picker-accent-rgb:var(--accent-primary-rgb); min-width: 0; display: grid; gap: 16px; container: character-picker / inline-size; }
  .picker--include { --picker-accent-rgb:var(--accent-success-rgb); --picker-overlay-rgb:76 175 80; }.picker--exclude { --picker-accent-rgb:239 83 80; --picker-overlay-rgb:244 67 54; }
  .picker-tools { min-width: 0; display: flex; align-items: center; gap: 8px; }
  .picker-tools .search { flex:1 1 auto; }
  .search { min-width: 0; min-height: var(--control-height); display: flex; align-items: center; gap: 8px; padding: 4px 10px; border: 1px solid var(--factor-field-border); border-radius: 8px; background: var(--dialog-search-bg); color: var(--dialog-icon-muted); }
  .search:focus-within { border-color: var(--factor-field-focus-border); background: var(--dialog-search-focus-bg); box-shadow: var(--focus-ring); }
  input { min-width: 0; width: 100%; padding:4px 0; border: 0; outline: 0; background: transparent; color: var(--dialog-input-text); font-family:inherit; font-size:14px; }
  input::placeholder { color:var(--dialog-placeholder); opacity:1; }
  .selection-count, .remaining { color: var(--color-text-subtle); font-size: 9px; white-space: nowrap; }
  .load-more { min-height: 38px; border: 1px solid var(--dialog-border); border-radius: var(--radius-md); background: var(--dialog-muted-bg); color: var(--color-accent); cursor: pointer; font-size: var(--font-xs); font-weight: 700; }.load-more small { margin-left:4px; color:var(--color-text-subtle); font-size:9px; font-weight:500; }
  .character-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 4px; }
  .character-grid button { position: relative; min-width: 0; min-height: 104px; display: flex; align-items: center; flex-direction: column; gap: 5px; padding: 8px 4px 6px; overflow: hidden; border: 1px solid var(--border-subtle); border-radius: 12px; background: var(--surface-1); color: var(--color-text); cursor: pointer; text-align: center; transition:background-color var(--duration-fast),border-color var(--duration-fast),transform var(--duration-fast); }
  .character-grid button:hover:not(:disabled) { border-color: rgb(var(--picker-accent-rgb)/.3); background: var(--dialog-card-hover-bg,var(--dialog-muted-bg)); }
  .character-grid button.selected { border-color: rgb(var(--picker-accent-rgb)/.4); background: rgb(var(--picker-accent-rgb)/.08); }
  .character-grid button.selected .avatar :global(.art) { border-color:rgb(var(--picker-accent-rgb)/.6); }
  .character-grid button.selected strong { color:var(--text-primary); }
  .character-grid button:disabled { opacity: .42; cursor: not-allowed; }
  .avatar { position:relative; width:66px; height:66px; display:grid; flex:0 0 66px; place-items:center; }
  .avatar :global(.art) { width:66px; height:66px; border:2px solid var(--dialog-avatar-border,var(--dialog-border)); background:var(--dialog-avatar-bg,rgb(0 0 0/.3)); }
  .character-grid button:hover .avatar :global(img) { transform:scale(1.15); }
  .character-grid button:active:not(:disabled) { transform:scale(.97); }
  .avatar :global(img) { transition:transform var(--duration-normal); }
  .copy { min-width: 0; width:100%; display: grid; gap: 2px; }
  .copy strong { letter-spacing:0; max-width:100%; color:var(--text-secondary); font-size:12px; font-weight:500; line-height:1.3; overflow-wrap:break-word; word-break:break-word; }
  .copy small { display:none; }
  .clear-search { width:28px; height:28px; display:grid; flex:0 0 28px; place-items:center; padding:0; border:0; border-radius:50%; background:transparent; color:var(--factor-field-arrow); cursor:pointer; }
  .clear-search:hover { background:var(--dialog-card-hover-bg); color:var(--factor-field-text); }
  .selected-mark { position:absolute; inset:2px; display:grid; place-items:center; border-radius:50%; background:rgb(var(--picker-overlay-rgb,var(--picker-accent-rgb))/.5); color:white; }
  .affinity-badge { position:absolute; right:-4px; bottom:-4px; }
  .affinity-badge :global(.affinity) { --affinity-color:#ff5c8a; min-height:0; padding:2px 6px; gap:3px; border-radius:10px; border-color:rgb(233 30 99/.55); background:var(--dialog-header-bg); box-shadow:0 2px 4px rgb(0 0 0/.5),0 0 0 2px var(--dialog-surface-bg); }
  .affinity-badge :global(b) { font-family:inherit; font-size:11px; line-height:1; }.affinity-badge :global(svg){width:11px;height:11px}
  .affinity-badge.zero :global(.affinity){border-color:var(--dialog-border);color:var(--text-muted)}
  :global([data-theme='light']) .affinity-badge:not(.zero) :global(.affinity){--affinity-color:var(--color-pink);border-color:rgb(var(--color-pink-rgb)/.45);background:#fff1f6}
  :global([data-theme='light']) .picker--exclude { --picker-accent-rgb:var(--accent-error-rgb); }
  :global([data-theme='light']) .selected-mark { background:rgb(var(--picker-accent-rgb)/.62); }
  :global([data-theme='light']) .search { box-shadow:inset 0 1px 0 rgb(255 255 255/.8); }
  .empty { grid-column: 1 / -1; margin: 0; padding: 20px 8px; color: var(--color-text-muted); text-align: center; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
  @media (max-width: 600px) {
    .picker-tools { display:flex; }
    .selection-count { flex:0 0 auto; }
    .character-grid { grid-template-columns: repeat(auto-fill,minmax(80px,1fr)); gap: 2px; }
    .character-grid button { min-height: 92px; padding:6px 2px 5px; }
    .avatar,.avatar :global(.art) { width:62px; height:62px; flex-basis:62px; }
    .copy strong { font-size:11px; }
  }
  @media(max-width:600px),(pointer:coarse){.search{min-height:var(--touch-target);padding-block:0;padding-right:0}.clear-search{width:var(--touch-target);height:var(--touch-target);flex-basis:44px}}
  @media(max-width:600px){.picker{gap:10px}}
</style>

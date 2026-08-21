<script lang="ts">
  import { tick } from 'svelte';
  import Artwork from './Artwork.svelte';
  import Icon from './Icon.svelte';

  export interface VeteranOption {
    id: string;
    name: string;
    rank: string;
    detail: string;
    image?: string;
    workspace?: string;
    updated?: string;
    disabled?: boolean;
  }

  interface Props {
    id: string;
    label: string;
    options: VeteranOption[];
    value?: string;
    disabled?: boolean;
    placeholder?: string;
    onchange?: (value: string) => void;
  }

  let { id, label, options, value = $bindable(''), disabled = false, placeholder = 'Select a Veteran', onchange }: Props = $props();
  let root: HTMLDivElement;
  let control: HTMLButtonElement;
  let search = $state<HTMLInputElement>();
  let open = $state(false);
  let query = $state('');
  let activeIndex = $state(0);
  const selected = $derived(options.find((option) => option.id === value));
  const filtered = $derived.by(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return options;
    return options.filter((option) => `${option.name} ${option.rank} ${option.detail} ${option.workspace ?? ''}`.toLocaleLowerCase().includes(normalized));
  });

  function available(index: number) { const option = filtered[index]; return Boolean(option && !option.disabled); }
  function nextIndex(start: number, direction: 1 | -1) {
    if (!filtered.length) return -1;
    let index = start;
    for (let count = 0; count < filtered.length; count += 1) {
      index = (index + direction + filtered.length) % filtered.length;
      if (available(index)) return index;
    }
    return start;
  }
  async function show(focusSearch = true) {
    if (disabled) return;
    query = '';
    activeIndex = Math.max(0, options.findIndex((option) => option.id === value));
    open = true;
    if (focusSearch) { await tick(); search?.focus(); }
  }
  function close(focusControl = false) {
    open = false;
    query = '';
    if (focusControl) control?.focus();
  }
  function choose(index: number) {
    const option = filtered[index];
    if (!option || option.disabled) return;
    value = option.id;
    onchange?.(value);
    close(true);
  }
  function controlKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      void show();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) close(); else void show();
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      close();
    }
  }
  function searchKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = nextIndex(activeIndex, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home') {
      event.preventDefault(); activeIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault(); activeIndex = Math.max(0, filtered.length - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault(); choose(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault(); close(true);
    }
  }
  function outsideClick(event: MouseEvent) {
    if (open && event.target instanceof Node && !root.contains(event.target)) close();
  }
</script>

<svelte:window onclick={outsideClick}/>
<div class="selector" bind:this={root}>
  <span class="label" id="{id}-label">{label}</span>
  <button
    bind:this={control}
    type="button"
    {id}
    class="control"
    class:open
    {disabled}
    role="combobox"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-labelledby="{id}-label"
    aria-controls="{id}-options"
    onclick={() => open ? close() : void show()}
    onkeydown={controlKeydown}
  >
    <Artwork src={selected?.image} alt={selected?.name ?? 'No Veteran selected'} size="sm"/>
    <span class="selected-copy">
      <span class="selected-line"><strong>{selected?.name ?? placeholder}</strong>{#if selected}<span class="rank">{selected.rank}</span>{/if}</span>
      <small>{selected?.detail ?? 'Choose from the active workspace'}</small>
      {#if selected}<span class="provenance">{selected.workspace ?? 'Local'}{#if selected.updated}{' · '}{selected.updated}{/if}</span>{/if}
    </span>
    <span class="arrow"><Icon name="chevron" size={18}/></span>
  </button>

  {#if open}
    <button class="backdrop" type="button" aria-label="Close Veteran selector" onclick={() => close()}></button>
    <div class="panel">
      <div class="panel-head">
        <label class="search-wrap" for="{id}-search"><Icon name="search" size={17}/><input bind:this={search} id="{id}-search" type="search" bind:value={query} placeholder="Search Veterans…" autocomplete="off" oninput={() => activeIndex = 0} onkeydown={searchKeydown}/></label>
        <span>{options.length} in active workspace</span>
      </div>
      <div id="{id}-options" class="options" role="listbox" aria-label={label}>
        {#each filtered as option, index (option.id)}
          <button
            id="{id}-option-{option.id}"
            type="button"
            role="option"
            aria-selected={option.id === value}
            class:active={index === activeIndex}
            class:selected={option.id === value}
            disabled={option.disabled}
            onmouseenter={() => activeIndex = index}
            onclick={() => choose(index)}
          >
            <Artwork src={option.image} alt="" size="sm"/>
            <span class="option-copy"><strong>{option.name}</strong><small>{option.detail}</small><span>{option.workspace ?? 'Local'}{#if option.updated}{' · '}{option.updated}{/if}</span></span>
            <span class="option-rank">{option.rank}</span>
            <span class="selected-check" aria-hidden="true"><Icon name="check" size={17}/></span>
          </button>
        {:else}
          <div class="empty"><strong>No matching Veterans</strong><span>Try a character name, rank, distance, or strategy.</span></div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .selector { position: relative; min-width: 0; display: grid; gap: 6px; }
  .label { color: var(--color-text); font-size: var(--font-sm); font-weight: 600; }
  .control { width: 100%; min-height: 66px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: var(--space-3); padding: 8px 10px 8px 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--factor-field-text); cursor: pointer; text-align: left; transition: border-color var(--duration-fast), background-color var(--duration-fast); }
  .control:hover:not(:disabled) { border-color: var(--border-secondary); }
  .control:focus, .control.open { border-color: var(--factor-field-focus-border); outline: 0; background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  .control:disabled { cursor: not-allowed; opacity: .55; }
  .selected-copy, .option-copy { min-width: 0; display: flex; flex-direction: column; }
  .selected-line { min-width: 0; display: flex; align-items: center; gap: var(--space-2); }
  strong, small, .provenance, .option-copy > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  strong { font-size: var(--font-sm); }
  small { color: var(--color-text-muted); font-size: var(--font-xs); }
  .provenance, .option-copy > span { margin-top: 2px; color: var(--color-text-subtle); font-size: 10px; }
  .rank, .option-rank { flex: 0 0 auto; padding: 2px 5px; border: 1px solid rgb(var(--accent-primary-rgb) / .28); border-radius: var(--radius-xs); background: var(--color-accent-soft); color: var(--color-accent); font-size: 10px; font-weight: 800; line-height: 1; }
  .arrow { width: 32px; height: 32px; display: grid; place-items: center; color: var(--factor-field-arrow); }
  .arrow :global(svg) { transition: transform var(--duration-fast); }
  .control.open .arrow :global(svg) { transform: rotate(180deg); }
  .backdrop { display: none; }
  .panel { position: absolute; top: calc(100% + 6px); left: 0; z-index: var(--z-overlay); width: 100%; min-width: 300px; overflow: hidden; border: 1px solid var(--factor-panel-border); border-radius: var(--radius-md); background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown); }
  .panel-head { display: grid; gap: 5px; padding: 8px; border-bottom: 1px solid var(--factor-option-separator); }
  .panel-head > span { padding-inline: 3px; color: var(--color-text-subtle); font-size: 10px; }
  .search-wrap { min-height: 38px; display: flex; align-items: center; gap: var(--space-2); padding: 0 9px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--factor-field-bg); color: var(--factor-field-arrow); }
  .search-wrap:focus-within { border-color: var(--factor-field-focus-border); box-shadow: var(--focus-ring); }
  .search-wrap input { min-width: 0; width: 100%; border: 0; outline: 0; background: transparent; color: var(--factor-field-text); font-size: var(--font-sm); }
  .options { max-height: 286px; overflow-y: auto; overscroll-behavior: contain; }
  .options > button { width: 100%; min-height: 60px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto 22px; align-items: center; gap: var(--space-2); padding: 7px 10px 7px 8px; border: 0; border-bottom: 1px solid var(--factor-option-separator); border-radius: 0; background: transparent; color: var(--factor-option-text); cursor: pointer; text-align: left; }
  .options > button:last-child { border-bottom: 0; }
  .options > button:hover:not(:disabled), .options > button.active { background: var(--factor-option-hover); }
  .options > button.selected { background: var(--factor-option-selected-bg); color: var(--factor-option-selected-text); }
  .options > button:disabled { cursor: not-allowed; opacity: .42; }
  .option-rank { justify-self: end; }
  .selected-check { visibility: hidden; color: var(--color-accent); }
  button.selected .selected-check { visibility: visible; }
  .empty { min-height: 92px; display: flex; flex-direction: column; justify-content: center; gap: 3px; padding: var(--space-4); color: var(--color-text); text-align: center; }
  .empty span { color: var(--color-text-muted); font-size: var(--font-xs); }
  @media (max-width: 767px) {
    .backdrop { position: fixed; inset: 0; z-index: var(--z-overlay); display: block; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 0; background: rgb(0 0 0 / .56); }
    .panel { position: fixed; inset: auto 12px 12px; z-index: calc(var(--z-overlay) + 1); width: auto; min-width: 0; max-height: calc(100dvh - 24px); border-radius: var(--radius-lg); }
    .panel-head { padding: 10px; }
    .search-wrap { min-height: var(--touch-target); }
    .options { max-height: min(56dvh, 420px); }
    .options > button { min-height: 68px; }
  }
</style>

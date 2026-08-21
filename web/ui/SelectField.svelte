<script lang="ts">
  import Icon from './Icon.svelte';

  export interface SelectOption { value: string; label: string; disabled?: boolean; }
  interface Props {
    id: string;
    label: string;
    options: SelectOption[];
    value?: string;
    name?: string;
    help?: string;
    disabled?: boolean;
    onchange?: (value: string) => void;
  }

  let { id, label, options, value = $bindable(''), name, help, disabled = false, onchange }: Props = $props();
  let root: HTMLDivElement;
  let control: HTMLButtonElement;
  let open = $state(false);
  let activeIndex = $state(0);
  const selected = $derived(options.find((option) => option.value === value));

  function available(index: number) { const option = options[index]; return Boolean(option && !option.disabled); }
  function nextIndex(start: number, direction: 1 | -1) {
    if (!options.length) return -1;
    let index = start;
    for (let count = 0; count < options.length; count += 1) {
      index = (index + direction + options.length) % options.length;
      if (available(index)) return index;
    }
    return start;
  }
  function show() {
    if (disabled) return;
    activeIndex = options.findIndex((option) => option.value === value);
    if (!available(activeIndex)) activeIndex = options.findIndex((_, index) => available(index));
    open = true;
  }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    value = option.value;
    onchange?.(value);
    open = false;
    control.focus();
  }
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) show();
      else activeIndex = nextIndex(activeIndex, event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Home' && open) {
      event.preventDefault();
      activeIndex = options.findIndex((_, index) => available(index));
    } else if (event.key === 'End' && open) {
      event.preventDefault();
      activeIndex = options.findLastIndex((_, index) => available(index));
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      open = false;
    }
  }
  function handleWindowClick(event: MouseEvent) {
    if (open && event.target instanceof Node && !root.contains(event.target)) open = false;
  }
</script>

<svelte:window onclick={handleWindowClick}/>
<div class="field" bind:this={root}>
  <label for={id}>{label}</label>
  <div class="control-wrap">
    <button
      bind:this={control}
      type="button"
      {id}
      class="select-control"
      class:open
      {disabled}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls="{id}-options"
      aria-activedescendant={open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
      onclick={() => open ? open = false : show()}
      onkeydown={handleKeydown}
    >
      <span>{selected?.label ?? 'Select an option'}</span><Icon name="chevron" size={16}/>
    </button>
    {#if open}
      <div id="{id}-options" class="select-panel" role="listbox" aria-label={label}>
        {#each options as option, index}
          <button
            id="{id}-option-{index}"
            type="button"
            role="option"
            aria-selected={option.value === value}
            class:active={index === activeIndex}
            class:selected={option.value === value}
            disabled={option.disabled}
            onmouseenter={() => activeIndex = index}
            onclick={() => choose(index)}
          >{option.label}</button>
        {:else}
          <div class="empty">No options available</div>
        {/each}
      </div>
    {/if}
  </div>
  {#if name}<input type="hidden" {name} {value}/>{/if}
  {#if help}<small>{help}</small>{/if}
</div>

<style>
  .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .control-wrap { position: relative; min-width: 0; }
  label { color: var(--color-text); font-size: var(--font-sm); font-weight: 600; }
  .select-control {
    width: 100%; height: var(--control-height); display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
    padding: 0 10px; border: 1px solid var(--factor-field-border); border-radius: 8px; background: var(--factor-field-bg);
    color: var(--factor-field-text); cursor: pointer; font-size: var(--font-md); text-align: left;
    transition: border-color var(--duration-fast), background-color var(--duration-fast);
  }
  .select-control:hover:not(:disabled) { border-color: var(--border-secondary); }
  .select-control:focus, .select-control.open { border-color: var(--factor-field-focus-border); outline: 0; background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  .select-control :global(svg) { flex: 0 0 auto; color: var(--factor-field-arrow); transition: transform var(--duration-fast); }
  .select-control.open :global(svg) { transform: rotate(180deg); }
  .select-control:disabled { cursor: not-allowed; opacity: .55; }
  .select-panel {
    position: absolute; top: calc(100% + 6px); left: 0; z-index: var(--z-overlay); width: 100%; max-height: 220px; overflow-y: auto;
    padding: 0; border: 1px solid var(--factor-panel-border); border-radius: 8px; background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown);
  }
  .select-panel button {
    width: 100%; min-height: 36px; display: flex; align-items: center; padding: 0 12px; border: 0; border-bottom: 1px solid var(--factor-option-separator);
    border-radius: 0; background: transparent; color: var(--factor-option-text); cursor: pointer; font-size: var(--font-sm); text-align: left;
  }
  .select-panel button:last-child { border-bottom: 0; }
  .select-panel button:hover:not(:disabled), .select-panel button.active { background: var(--factor-option-hover); }
  .select-panel button.selected { background: var(--factor-option-selected-bg); color: var(--factor-option-selected-text); }
  .select-panel button:disabled { cursor: not-allowed; opacity: .4; }
  .empty { min-height: 36px; display: flex; align-items: center; padding: 0 12px; color: var(--color-text-subtle); font-size: var(--font-sm); }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  @media (max-width: 767px) { .select-panel button, .empty { min-height: var(--touch-target); } }
</style>

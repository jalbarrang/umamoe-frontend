<script lang="ts">
  import Icon from './Icon.svelte';

  export interface EntitySelectOption {
    value: string;
    label: string;
    subtitle?: string;
    meta?: string;
    images?: string[];
    disabled?: boolean;
  }

  interface Props {
    id: string;
    label: string;
    options: EntitySelectOption[];
    value?: string;
    placeholder?: string;
    onchange?: (value: string) => void;
  }

  let { id, label, options, value = $bindable(''), placeholder = 'Select an option', onchange }: Props = $props();
  let root: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let open = $state(false);
  let activeIndex = $state(0);
  const selected = $derived(options.find((option) => option.value === value));

  function available(index: number) { return Boolean(options[index] && !options[index]?.disabled); }
  function move(direction: 1 | -1) {
    let next = activeIndex;
    for (let count = 0; count < options.length; count += 1) {
      next = (next + direction + options.length) % options.length;
      if (available(next)) break;
    }
    activeIndex = next;
  }
  function show() {
    activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
    open = true;
  }
  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    value = option.value;
    onchange?.(value);
    open = false;
    trigger.focus();
  }
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) show(); else move(event.key === 'ArrowDown' ? 1 : -1);
    } else if ((event.key === 'Enter' || event.key === ' ') && open) {
      event.preventDefault(); choose(activeIndex);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault(); open = false;
    }
  }
  function handleWindowClick(event: MouseEvent) {
    if (open && event.target instanceof Node && !root.contains(event.target)) open = false;
  }
</script>

<svelte:window onclick={handleWindowClick}/>
<div class="entity-field" bind:this={root}>
  <label for={id}>{label}</label>
  <div class="select-anchor">
    <button
      bind:this={trigger}
      type="button"
      {id}
      class="entity-trigger"
      class:open
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={`${id}-options`}
      aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
      onclick={() => open ? open = false : show()}
      onkeydown={handleKeydown}
    >
      {#if selected?.images?.length}<span class="entity-images" data-count={selected.images.length}>{#each selected.images as image}<img src={image} alt="" loading="lazy"/>{/each}</span>{/if}
      <span class="entity-copy"><strong>{selected?.label ?? placeholder}</strong>{#if selected?.subtitle}<small>{selected.subtitle}</small>{/if}</span>
      {#if selected?.meta}<span class="entity-meta">{selected.meta}</span>{/if}
      <Icon name="chevron" size={16}/>
    </button>
    {#if open}
      <div id={`${id}-options`} class="entity-panel" role="listbox" aria-label={label}>
        {#each options as option, index (option.value)}
          <button
            id={`${id}-option-${index}`}
            type="button"
            role="option"
            aria-selected={option.value === value}
            class:active={index === activeIndex}
            class:selected={option.value === value}
            disabled={option.disabled}
            onmouseenter={() => activeIndex = index}
            onclick={() => choose(index)}
          >
            {#if option.images?.length}<span class="entity-images" data-count={option.images.length}>{#each option.images as image}<img src={image} alt="" loading="lazy"/>{/each}</span>{/if}
            <span class="entity-copy"><strong>{option.label}</strong>{#if option.subtitle}<small>{option.subtitle}</small>{/if}</span>
            {#if option.meta}<span class="entity-meta">{option.meta}</span>{/if}
            <span class="selection-mark" aria-hidden="true">{#if option.value === value}<Icon name="check" size={14}/>{/if}</span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .entity-field { min-width: 0; display: grid; gap: 6px; }
  label { color: var(--color-text); font-size: var(--font-sm); font-weight: 650; }
  .select-anchor { position: relative; min-width: 0; }
  .entity-trigger,
  .entity-panel > button { width: 100%; min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 9px; color: var(--factor-option-text); text-align: left; }
  .entity-trigger { min-height: var(--touch-target); padding: 5px 10px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); cursor: pointer; transition: border-color var(--duration-fast), background-color var(--duration-fast); }
  .entity-trigger:hover { border-color: var(--border-secondary); }
  .entity-trigger:focus,
  .entity-trigger.open { border-color: var(--factor-field-focus-border); outline: 0; background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  .entity-trigger :global(svg) { color: var(--factor-field-arrow); transition: transform var(--duration-fast); }
  .entity-trigger.open > :global(svg) { transform: rotate(180deg); }
  .entity-copy { min-width: 0; display: grid; gap: 2px; }
  .entity-copy strong,
  .entity-copy small { overflow: hidden; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
  .entity-copy strong { color: var(--color-text); font-size: var(--font-sm); }
  .entity-copy small { color: var(--color-text-subtle); font-size: 9px; }
  .entity-meta { color: var(--color-text-muted); font-size: 9px; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .entity-images { min-width: 30px; display: flex; align-items: center; }
  .entity-images img { width: 30px; height: 30px; display: block; flex: 0 0 auto; object-fit: cover; object-position: top center; }
  .entity-images[data-count]:not([data-count='1']) img { width: 25px; height: 25px; margin-left: -5px; border: 2px solid var(--factor-field-bg); border-radius: 50%; }
  .entity-images[data-count]:not([data-count='1']) img:first-child { margin-left: 0; }
  .entity-panel { position: absolute; z-index: var(--z-overlay); top: calc(100% + 6px); left: 0; width: 100%; max-height: 260px; overflow-y: auto; border: 1px solid var(--factor-panel-border); border-radius: var(--radius-md); background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown); }
  .entity-panel > button { min-height: 48px; padding: 5px 10px; border: 0; border-bottom: 1px solid var(--factor-option-separator); background: transparent; cursor: pointer; }
  .entity-panel > button:last-child { border-bottom: 0; }
  .entity-panel > button:hover:not(:disabled),
  .entity-panel > button.active { background: var(--factor-option-hover); }
  .entity-panel > button.selected { background: var(--factor-option-selected-bg); }
  .entity-panel > button:disabled { cursor: not-allowed; opacity: .45; }
  .selection-mark { width: 18px; height: 18px; display: grid; place-items: center; color: var(--color-accent); }
  @media (max-width: 480px) {
    .entity-trigger,
    .entity-panel > button { grid-template-columns: auto minmax(0, 1fr) auto; }
    .entity-meta { display: none; }
    .selection-mark { grid-column: 3; }
    .entity-trigger > :global(svg) { grid-column: 3; }
  }
</style>

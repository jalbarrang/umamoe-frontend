<script lang="ts">
  export interface ComboboxOption { value: string; label: string; keywords?: string; image?: string; disabled?: boolean; }
  interface Props { id: string; label: string; options: ComboboxOption[]; value?: string; placeholder?: string; help?: string; disabled?: boolean; }
  let { id, label, options, value = $bindable(''), placeholder = 'Search…', help, disabled = false }: Props = $props();

  let root: HTMLDivElement;
  let input: HTMLInputElement;
  let open = $state(false);
  let activeIndex = $state(0);
  const filtered = $derived.by(() => {
    const query = value.trim().toLocaleLowerCase();
    if (!query) return options;
    return options.filter((option) => `${option.label} ${option.keywords ?? ''}`.toLocaleLowerCase().includes(query));
  });

  function choose(option: ComboboxOption) {
    if (option.disabled) return;
    value = option.value;
    open = false;
    input.focus();
  }
  function move(direction: 1 | -1) {
    if (!filtered.length) return;
    let next = activeIndex;
    for (let count = 0; count < filtered.length; count += 1) {
      next = (next + direction + filtered.length) % filtered.length;
      const candidate = filtered[next];
      if (candidate && !candidate.disabled) break;
    }
    activeIndex = next;
  }
  function handleInput() { activeIndex = 0; open = true; }
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) open = true;
      else move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && open) {
      const option = filtered[activeIndex];
      if (option) { event.preventDefault(); choose(option); }
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
    <input
      bind:this={input}
      {id}
      {placeholder}
      {disabled}
      bind:value
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={open}
      aria-controls="{id}-options"
      aria-activedescendant={open && filtered.length ? `${id}-option-${activeIndex}` : undefined}
      autocomplete="off"
      oninput={handleInput}
      onfocus={() => { activeIndex = 0; open = true; }}
      onkeydown={handleKeydown}
    />
    {#if open}
      <div id="{id}-options" class="combo-panel" role="listbox" aria-label="{label} suggestions">
        {#each filtered as option, index}
          <button
            id="{id}-option-{index}"
            type="button"
            role="option"
            aria-selected={option.value === value}
            class:active={index === activeIndex}
            class:selected={option.value === value}
            disabled={option.disabled}
            onmouseenter={() => activeIndex = index}
            onclick={() => choose(option)}
          >{#if option.image}<img src={option.image} alt="" width="28" height="28" loading="lazy"/>{/if}<span>{option.label}</span></button>
        {:else}
          <div class="empty">No matching options</div>
        {/each}
      </div>
    {/if}
  </div>
  {#if help}<small>{help}</small>{/if}
</div>

<style>
  .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .control-wrap { position: relative; min-width: 0; }
  label { color: var(--color-text); font-size: var(--font-sm); font-weight: 600; }
  input {
    width: 100%; height: var(--control-height); padding: 0 10px; border: 1px solid var(--factor-field-border); border-radius: 8px;
    background: var(--factor-field-bg); color: var(--factor-field-text); font-size: var(--font-md);
    transition: border-color var(--duration-fast), background-color var(--duration-fast);
  }
  input::placeholder { color: var(--factor-field-placeholder); }
  input:hover:not(:disabled) { border-color: var(--border-secondary); }
  input:focus { border-color: var(--factor-field-focus-border); outline: 0; background: var(--factor-field-focus-bg); box-shadow: var(--focus-ring); }
  input:disabled { cursor: not-allowed; opacity: .55; }
  .combo-panel {
    position: absolute; top: calc(100% + 6px); left: 0; z-index: var(--z-overlay); width: 100%; max-height: 220px; overflow-y: auto;
    padding: 0; border: 1px solid var(--factor-panel-border); border-radius: 8px; background: var(--factor-panel-bg); box-shadow: var(--shadow-dropdown);
  }
  .combo-panel button {
    width: 100%; min-height: 36px; display: flex; align-items: center; padding: 0 12px; border: 0; border-bottom: 1px solid var(--factor-option-separator);
    border-radius: 0; background: transparent; color: var(--factor-option-text); cursor: pointer; font-size: var(--font-sm); text-align: left;
  }
  .combo-panel button:last-of-type { border-bottom: 0; }
  .combo-panel img { width: 28px; height: 28px; flex: 0 0 auto; margin-right: 8px; border-radius: 5px; object-fit: cover; object-position: top center; }
  .combo-panel button:hover:not(:disabled), .combo-panel button.active { background: var(--factor-option-hover); }
  .combo-panel button.selected { background: var(--factor-option-selected-bg); color: var(--factor-option-selected-text); }
  .empty { min-height: 36px; display: flex; align-items: center; padding: 0 12px; color: var(--color-text-subtle); font-size: var(--font-sm); }
  small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  @media (max-width: 767px) { .combo-panel button, .empty { min-height: var(--touch-target); } }
</style>

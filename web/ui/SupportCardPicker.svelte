<script lang="ts">
  import Icon from './Icon.svelte';
  import type { SupportCardPickerOption } from './picker-types';
  interface Props { label?: string; options: SupportCardPickerOption[]; value?: string; maxVisible?: number; onselect?: (id: string) => void; }
  let { label = 'Select support card', options, value = $bindable(''), maxVisible = 8, onselect }: Props = $props();
  let query = $state('');
  let type = $state('All');
  let rarity = $state('All');
  const filtered = $derived(options.filter((option) => {
    const needle = query.trim().toLocaleLowerCase();
    return (!needle || `${option.title} ${option.character ?? ''}`.toLocaleLowerCase().includes(needle)) && (type === 'All' || option.type === type) && (rarity === 'All' || option.rarity === rarity);
  }));
  function select(id: string) { value = id; onselect?.(id); }
</script>

<section class="support-picker" aria-label={label}>
  <div class="tools">
    <label class="search"><Icon name="search" size={16}/><span class="sr-only">Search support cards</span><input type="search" bind:value={query} placeholder="Character or card name"/></label>
    <label><span>Type</span><select bind:value={type}><option>All</option><option>Speed</option><option>Stamina</option><option>Power</option><option>Guts</option><option>Wit</option><option>Friend</option></select></label>
    <label><span>Rarity</span><select bind:value={rarity}><option>All</option><option>SSR</option><option>SR</option><option>R</option></select></label>
  </div>
  <div class="cards" role="radiogroup" aria-label={label}>
    {#each filtered.slice(0, maxVisible) as option (option.id)}
      <button type="button" role="radio" aria-checked={value === option.id} class:selected={value === option.id} disabled={option.disabled} onclick={() => select(option.id)}>
        <span class="thumb">{#if option.image}<img src={option.image} alt="" loading="lazy" decoding="async"/>{/if}{#if value === option.id}<span class="check"><Icon name="check" size={13}/></span>{/if}</span>
        <span class="card-copy"><strong>{option.title}</strong>{#if option.character}<small>{option.character}</small>{/if}<span class="meta"><b data-type={option.type.toLocaleLowerCase()}>{option.type}</b><b>{option.rarity}</b></span></span>
      </button>
    {:else}<p class="empty">No support cards match these filters.</p>{/each}
  </div>
</section>

<style>
  .support-picker { min-width: 0; display: grid; gap: 8px; container: support-picker / inline-size; }
  .tools { min-width: 0; display: grid; grid-template-columns: minmax(170px, 1fr) auto auto; gap: 6px; }
  .tools label { min-width: 0; min-height: 36px; display: flex; align-items: center; gap: 6px; padding: 0 8px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--color-text-subtle); font-size: 9px; }
  .tools label:focus-within { border-color: var(--factor-field-focus-border); box-shadow: var(--focus-ring); }
  .search input { width: 100%; } input, select { min-width: 0; border: 0; outline: 0; background: transparent; color: var(--factor-field-text); font: inherit; font-size: var(--font-xs); } select { cursor: pointer; } option { background: var(--factor-panel-bg); }
  .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 5px; }
  .cards button { min-width: 0; display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 7px; padding: 5px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-md); background: var(--surface-1); color: var(--color-text); cursor: pointer; text-align: left; }
  .cards button:hover:not(:disabled) { border-color: var(--border-secondary); background: var(--factor-option-hover); } .cards button.selected { border-color: rgb(var(--accent-primary-rgb) / .58); background: var(--factor-option-selected-bg); } .cards button:disabled { opacity: .42; }
  .thumb { position: relative; width: 56px; height: 56px; overflow: hidden; border: 1px solid var(--border-primary); border-radius: var(--radius-sm); background: var(--surface-2); } .thumb img { width: 100%; height: 100%; object-fit: cover; }
  .check { position: absolute; right: 2px; top: 2px; width: 18px; height: 18px; display: grid; place-items: center; border-radius: 50%; background: var(--accent-primary); color: #071018; }
  .card-copy { min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .card-copy strong, .card-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .card-copy strong { font-size: var(--font-xs); } .card-copy small { color: var(--color-text-subtle); font-size: 9px; }
  .meta { display: flex; flex-wrap: wrap; gap: 3px; margin-top: auto; }.meta b { padding: 2px 4px; border-radius: 3px; background: var(--surface-3); color: var(--color-text-muted); font-size: 8px; }.meta b[data-type='speed'] { color: var(--stat-speed); }.meta b[data-type='stamina'] { color: var(--stat-stamina); }.meta b[data-type='power'] { color: var(--stat-power); }.meta b[data-type='guts'] { color: var(--stat-guts); }.meta b[data-type='wit'] { color: var(--stat-wit); }
  .empty { grid-column: 1 / -1; margin: 0; padding: 20px 8px; color: var(--color-text-muted); text-align: center; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; }
  @container support-picker (max-width: 540px) { .tools { grid-template-columns: 1fr 1fr; }.search { grid-column: 1 / -1; }.cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }.cards button { grid-template-columns: 48px minmax(0, 1fr); padding: 4px; }.thumb { width: 48px; height: 48px; } }
  @container support-picker (max-width: 340px) { .cards { grid-template-columns: 1fr; } }
</style>

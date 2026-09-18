<script lang="ts">

  import Icon from './Icon.svelte';
  import Dialog from './Dialog.svelte';
  import Artwork from './Artwork.svelte';
  import SelectField from './SelectField.svelte';
  import Banner from './Banner.svelte';
  import Button from './Button.svelte';
  import Spinner from './Spinner.svelte';
  import { matchesSupportSearch } from '@/lib/supports/support-card';
  import type { SupportCardPickerOption } from './picker-types';
  interface Props { id?: string; label?: string; options: SupportCardPickerOption[]; selectedOption?: SupportCardPickerOption; value?: string; maxVisible?: number; compact?: boolean; loading?: boolean; error?: string; cached?: boolean; onclear?: () => void; onopen?: () => void; onretry?: () => void; onselect?: (id: string) => void; }
  let { id = 'support-card-picker', label = 'Select support card', options, selectedOption, value = $bindable(''), maxVisible = 8, compact = false, loading = false, error = '', cached = false, onclear, onopen, onretry, onselect }: Props = $props();
  let query = $state('');
  let type = $state('All');
  let rarity = $state('All');
  let visibleLimit = $state(0);
  let open = $state(false);
  const effectiveLimit = $derived(compact ? Number.POSITIVE_INFINITY : visibleLimit || maxVisible);
  const types = ['All','Speed','Stamina','Power','Guts','Wit','Friend'].map(value => ({ value, label:value === 'Wit' ? 'Wisdom' : value }));
  const rarities = ['All','R','SR','SSR'].map(value => ({ value, label:value }));
  const filtered = $derived(options.filter((option) => {
    return matchesSupportSearch(option.searchText ?? `${option.id} ${option.title} ${option.character ?? ''}`, query) && (type === 'All' || option.type === type) && (rarity === 'All' || option.rarity === rarity);
  }));
  const selected = $derived(options.find((option) => option.id === value) ?? (selectedOption?.id === value ? selectedOption : undefined));
  function select(id: string) { value = id; onselect?.(id); if (compact) open = false; }
  function show() { query = ''; type = 'All'; rarity = 'All'; visibleLimit = 0; open = true; onopen?.(); }
</script>

{#snippet browser()}
  <div class="tools">
    <div class="search"><Icon name="search" size={18}/><input type="text" role="searchbox" aria-label="Search support cards" bind:value={query} placeholder="Search by character or card name..." oninput={() => visibleLimit = 0}/>{#if query}<button type="button" aria-label="Clear support search" onclick={() => query = ''}><Icon name="close" size={16}/></button>{/if}</div>
    {#if loading}<div class="resource-status" role="status"><Spinner size={16}/><span>{cached ? 'Using cached resources; refreshing...' : 'Still fetching resources...'}</span></div>{/if}
    {#if error}<Banner tone="danger" title={cached ? 'Resource refresh failed' : 'Resource fetch failed'}><p class="resource-error">{error}</p>{#if onretry}<Button variant="secondary" onclick={onretry}>Retry support data</Button>{/if}</Banner>{/if}
    <div class="quick-filters"><SelectField id={`${id}-type`} label="Type" hideLabel options={types} bind:value={type}/><SelectField id={`${id}-rarity`} label="Rarity" hideLabel options={rarities} bind:value={rarity}/></div>
  </div>
  <div class="cards" role="radiogroup" aria-label={label}>
    {#each filtered.slice(0, effectiveLimit) as option (option.id)}
      <button type="button" role="radio" aria-checked={value === option.id} class:selected={value === option.id} disabled={option.disabled} onclick={() => select(option.id)}>
        <Artwork src={option.image} fallbackSrc="/assets/images/placeholder-card.webp" alt="" kind="card"/>
        <span class="card-copy"><strong>{option.title}</strong>{#if option.character && option.character.trim().toLowerCase() !== option.title.trim().toLowerCase()}<small>{option.character}</small>{/if}<span class="meta"><b>{option.type === 'Wit' ? 'Wisdom' : option.type}</b><b>{option.rarity}</b></span></span>
      </button>
    {:else}{#if !loading && !error}<p class="empty">No support cards match these filters.</p>{/if}{/each}
  </div>
  {#if filtered.length > effectiveLimit}<button class="load-more" type="button" onclick={() => visibleLimit = effectiveLimit + maxVisible}>Show {Math.min(maxVisible, filtered.length - effectiveLimit)} more <small>{filtered.length - effectiveLimit} remaining</small></button>{/if}
{/snippet}

<section class="support-picker" class:compact class:has-selection={Boolean(selected)} aria-label={label}>
  {#if compact}
    <button class="compact-trigger" class:selected={Boolean(selected)} type="button" aria-label={selected ? `Change support card ${selected.title}` : label} onclick={show}>
      <span class="compact-visual">{#if selected?.image}<img src={selected.image} alt=""/>{:else}<Icon name="search" size={22}/>{/if}</span>
      {#if !selected}<span class="compact-copy"><strong>Select card</strong><small>Borrow support</small></span>{/if}
    </button>
    {#if selected}<div class="card-actions"><Button variant="secondary" size="sm" ariaLabel="Change support card" onclick={show}>Change</Button>{#if onclear}<Button variant="secondary" icon="trash" ariaLabel="Clear support" size="sm" onclick={onclear}/>{/if}</div>{/if}
    <Dialog id={`${id}-dialog`} title="Select Support Card" icon="cards" bind:open maxWidth="700px" mobileMaxHeight="calc(100dvh - 32px)" contentPadding="12px" mobileContentPadding="8px">
      {#if open}<div class="dialog-browser">{@render browser()}</div>{/if}
    </Dialog>
  {:else}
    {@render browser()}
  {/if}
</section>

<style>
  .support-picker { min-width: 0; display: grid; gap: 8px; }
  .support-picker.compact { position:relative; width:128px; height:128px; min-width:128px; align-self:center; }
  .compact-trigger { position:absolute; inset:0; width:100%; height:100%; min-height:0; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px; padding:8px; border:1px solid rgb(var(--accent-primary-rgb)/.34); border-radius:var(--radius-lg); background:var(--factor-field-bg); color:var(--text-primary); cursor:pointer; font:inherit; text-align:center; transition:border-color var(--duration-fast),background-color var(--duration-fast),box-shadow var(--duration-fast); }.compact-trigger:hover{border-color:rgb(var(--accent-primary-rgb)/.62);background:rgb(var(--accent-primary-rgb)/.08)}.compact-trigger:focus-visible{outline:0;box-shadow:var(--focus-ring)}.compact-trigger.selected{border-color:rgb(var(--accent-primary-rgb)/.6)}
  .compact-visual{width:44px;height:44px;display:grid;place-items:center;overflow:hidden;border:1px solid rgb(var(--accent-primary-rgb)/.48);border-radius:50%;color:var(--accent-primary)}.compact-visual img{width:100%;height:100%;display:block;border-radius:50%;object-fit:cover}.compact-copy{min-width:0;width:100%;display:grid;gap:1px;line-height:1.1}.compact-copy strong,.compact-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.compact-copy strong{font-size:10px;font-weight:700}.compact-copy small{color:var(--text-muted);font-size:8px}
  .support-picker.compact.has-selection { width:96px; height:auto; min-width:96px; display:flex; flex-direction:column; gap:6px; } .has-selection .compact-trigger { position:relative; inset:auto; width:100%; height:auto; aspect-ratio:1; align-self:stretch; flex:none; } .card-actions{display:flex;align-items:center;gap:4px}.card-actions :global(.ui-button){flex:1;padding-inline:4px}.card-actions :global(.ui-button[aria-label="Clear support"]){flex:none;width:36px;padding:0} .compact-trigger.selected { padding:6px; }
  @media(pointer:coarse){.support-picker.compact.has-selection{width:104px;min-width:104px}}
  .selected .compact-visual { width:100%; height:100%; border:0; border-radius:6px; }
  .selected .compact-visual img { border-radius:0; object-fit:contain; }
  .dialog-browser { min-width:0; display:grid; gap:12px; container:support-cards / inline-size; }
  .tools { min-width:0; display:grid; gap:10px; }
  .resource-status { display:flex; align-items:center; gap:8px; padding:8px 10px; border:1px solid rgb(var(--accent-primary-rgb)/.2); border-radius:var(--radius-md); background:rgb(var(--accent-primary-rgb)/.08); color:var(--text-secondary); font-size:12px; font-weight:600; }.resource-error { overflow-wrap:anywhere; }
  .search { min-width:0; min-height:42px; display:flex; align-items:center; gap:8px; padding:8px 12px; border:1px solid var(--border-subtle); border-radius:10px; background:var(--factor-field-bg); color:var(--text-disabled); }
  .search:focus-within { border-color:rgb(var(--accent-primary-rgb)/.4); box-shadow:var(--focus-ring); }
  .search input { min-width:0; width:100%; padding:4px 0; border:0; outline:0; background:transparent; color:var(--dialog-input-text); font:14px Arial,sans-serif; }
  .search input::placeholder { color:var(--dialog-placeholder); opacity:1; }
  .search button { flex:none; width:28px; height:28px; display:grid; place-items:center; padding:0; border:0; border-radius:50%; background:transparent; color:var(--dialog-icon-muted); cursor:pointer; }
  .quick-filters { --control-height:36px; min-width:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .quick-filters :global(.field) { min-width:0; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:4px; }
  .cards button { min-width:0; display:flex; flex-direction:column; align-items:center; gap:4px; padding:8px 4px 6px; border:1px solid transparent; border-radius:10px; background:transparent; color:var(--text-primary); cursor:pointer; text-align:center; }
  .cards button:hover:not(:disabled) { background:var(--surface-2); border-color:rgb(var(--accent-primary-rgb)/.3); }
  .cards button.selected { background:rgb(var(--accent-primary-rgb)/.08); border-color:rgb(var(--accent-primary-rgb)/.4); }
  .cards button:disabled { opacity:.42; cursor:not-allowed; }
  .cards :global(.art) { width:80px; height:80px; border:2px solid var(--border-primary); }
  .cards button.selected :global(.art) { border-color:rgb(var(--accent-primary-rgb)/.6); }
  .card-copy { min-width:0; max-width:100%; display:flex; align-items:center; flex-direction:column; gap:4px; letter-spacing:.5px; }
  .card-copy strong { max-width:100%; color:var(--text-muted); font-size:9px; font-weight:400; line-height:1.25; overflow-wrap:anywhere; }
  .card-copy small { color:var(--text-secondary); font-size:12px; font-weight:500; line-height:1.3; }
  .meta { display:flex; flex-wrap:wrap; justify-content:center; gap:4px; }.meta b { padding:1px 5px; border-radius:var(--radius-xs); background:rgb(33 150 243/.12); color:rgb(100 181 246/.8); font-size:10px; font-weight:600; letter-spacing:.3px; line-height:24px; text-transform:uppercase; }.meta b:last-child { background:rgb(255 193 7/.12); color:rgb(255 202 40/.8); }
  .empty { grid-column: 1 / -1; margin: 0; padding: 20px 8px; color: var(--color-text-muted); text-align: center; }
  .load-more { min-height:38px; border:1px solid var(--factor-field-border); border-radius:var(--radius-md); background:var(--factor-field-bg); color:var(--color-accent); cursor:pointer; font-size:var(--font-xs); font-weight:700; }.load-more small { margin-left:4px; color:var(--color-text-subtle); font-size:9px; font-weight:500; }

  :global([data-theme='light']) .meta b { background:rgb(var(--accent-primary-rgb)/.12); color:var(--accent-primary); }
  :global([data-theme='light']) .meta b:last-child { background:rgb(var(--accent-warning-rgb)/.14); color:var(--accent-warning); }
  @container support-cards (max-width:540px) { .cards { grid-template-columns:repeat(auto-fill,minmax(90px,1fr)); }.cards button{padding:6px 3px 5px}.cards :global(.art){width:64px;height:64px}.card-copy strong{font-size:8px}.card-copy small{font-size:11px} }
  @media(max-width:600px){.compact-trigger{width:100%}.quick-filters{gap:6px}}
  @media(max-width:600px),(pointer:coarse){.quick-filters{--control-height:var(--touch-target)}.search{min-height:var(--touch-target);padding-block:0;padding-right:0}.search button{width:var(--touch-target);height:var(--touch-target)}.load-more{min-height:var(--touch-target)}}
</style>

<script lang="ts">
  import { onDestroy, tick, untrack } from 'svelte';
  import Icon from '@/components/Icon.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import { router } from '@/routes/router';
  import { availableFindSources, findLoaded, findRequested, findSources, type FindMatch } from '@/lib/find-loaded';

  let open = $state(false), query = $state(''), selected = $state(0);
  let matches = $state.raw<FindMatch[]>([]);
  let input = $state<HTMLInputElement>();
  let returnFocus: HTMLElement | undefined, highlighted: HTMLElement | undefined;
  let generation = 0;
  let lastQuery = '';
  function clearHighlight() { highlighted?.removeAttribute('data-find-current'); highlighted = undefined; }
  function close() {
    open = false; matches = []; selected = 0; generation++; clearHighlight();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll:true });
  }
  async function show() {
    if (!open) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : undefined;
    open = true; await tick(); input?.focus(); input?.select();
  }
  async function reveal(index: number) {
    const current = ++generation;
    clearHighlight(); selected = index;
    const match = matches[index];
    if (!match) return;
    const node = await match.source.reveal(match.index);
    if (current !== generation || !open || !node?.isConnected) return;
    highlighted = node; node.setAttribute('data-find-current', '');
  }
  function next(direction: number) {
    if (matches.length) void reveal((selected + direction + matches.length) % matches.length);
  }
  function keydown(event: KeyboardEvent) {
    if (event.defaultPrevented || event.isComposing || document.querySelector('dialog[open]')) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'f') {
      if (!open && !availableFindSources($findSources).length) return;
      event.preventDefault(); void show();
    } else if (open && event.key === 'Escape') { event.preventDefault(); close(); }
    else if (open && (event.key === 'F3' || event.key === 'Enter' && event.target === input)) {
      event.preventDefault(); next(event.shiftKey ? -1 : 1);
    }
  }
  $effect(() => {
    if (!open) return;
    const sources = $findSources, value = query;
    // Searching data is debounced; scrolling itself does not rebuild this index.
    const timer = setTimeout(() => {
      const previous = value === lastQuery ? matches[selected] : undefined;
      matches = findLoaded(sources, value);
      const retained = previous ? matches.findIndex(match => match.source === previous.source && match.index === previous.index) : -1;
      if (retained >= 0) selected = retained;
      else void reveal(0);
      lastQuery = value;
    }, 120);
    return () => clearTimeout(timer);
  });
  $effect(() => { router.route.pathname; untrack(close); });
  $effect(() => { if ($findRequested) untrack(() => void show()); });
  onDestroy(() => { generation++; clearHighlight(); });
</script>

<svelte:window onkeydown={keydown}/>
{#if open}
  <section class="find-bar" role="search" aria-label="Find loaded results">
    <div class="find-controls">
      <Icon name="search" size={16}/>
      <input bind:this={input} bind:value={query} type="search" aria-label="Find in loaded results" placeholder="Find in loaded results…" autocomplete="off"/>
      <span class="count" role="status" aria-live="polite">{query.trim() ? matches.length ? `${selected + 1} / ${matches.length}` : 'No matches' : ''}</span>
      <IconButton icon="arrow-left" label="Previous match" disabled={!matches.length} onclick={() => next(-1)}/>
      <IconButton icon="arrow-right" label="Next match" disabled={!matches.length} onclick={() => next(1)}/>
      <IconButton icon="close" label="Close find" onclick={close}/>
    </div>
    <small>Searches loaded results · Enter next · Shift+Enter previous</small>
  </section>
{/if}

<style>
  .find-bar { position:fixed; z-index:calc(var(--z-header) + 1); top:calc(var(--utility-height) + 8px); right:12px; width:min(520px,calc(100vw - 24px)); padding:8px; border:1px solid var(--border-primary); border-radius:8px; background:var(--surface-1); color:var(--text-primary); box-shadow:var(--shadow-dropdown); }
  .find-controls { display:flex; align-items:center; gap:4px; }
  input { min-width:0; flex:1; min-height:36px; padding:6px; border:1px solid var(--border-primary); border-radius:4px; background:var(--factor-field-bg); color:var(--text-primary); font:inherit; font-size:13px; }
  .count { flex:none; font-size:11px; white-space:nowrap; }
  small { display:block; margin:4px 2px 0; color:var(--text-secondary); font-size:11px; }
  :global([data-find-current]) { outline:2px solid var(--accent-primary); outline-offset:2px; }
  @media(max-width:767px) { .find-bar { right:4px; width:calc(100vw - 8px); } .find-controls > :global(svg) { display:none; } input { min-height:var(--touch-target); font-size:16px; } }
</style>

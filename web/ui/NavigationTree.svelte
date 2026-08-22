<script lang="ts">
  import Icon from './Icon.svelte';
  import type { NavigationItem, NavigationVariant } from './navigation-types';

  interface Props {
    items: NavigationItem[];
    label?: string;
    variant?: NavigationVariant;
    onnavigate?: () => void;
  }

  let { items, label = 'Primary navigation', variant = 'rail', onnavigate }: Props = $props();
  let navigationElement: HTMLElement;
  let openItems = $state<Record<string, boolean>>({});
  let initialized = false;

  $effect(() => {
    if (initialized) return;
    openItems = Object.fromEntries(items.filter((item) => item.expanded || item.current).map((item) => [item.id, true]));
    initialized = true;
  });

  function toggle(item: NavigationItem) {
    openItems = openItems[item.id] ? {} : { [item.id]: true };
  }

  function handleNavigate() {
    openItems = {};
    onnavigate?.();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !Object.values(openItems).some(Boolean)) return;
    openItems = {};
    (event.target as HTMLElement).blur();
  }

  function handleOutsidePointer(event: PointerEvent) {
    if (variant !== 'rail' || !Object.values(openItems).some(Boolean)) return;
    if (!event.composedPath().includes(navigationElement)) openItems = {};
  }
</script>

<svelte:window onpointerdown={handleOutsidePointer}/>

<nav bind:this={navigationElement} class="navigation-tree" class:sheet={variant === 'sheet'} aria-label={label}>
  {#each items as item (item.id)}
    <div class="navigation-item" class:open={openItems[item.id]} class:current={item.current}>
      <div class="navigation-parent">
        <a class="navigation-link" href={item.href} aria-current={item.current ? 'page' : undefined} onclick={handleNavigate} onkeydown={handleKeydown}>
          <Icon name={item.icon} size={19}/>
          <span>{item.label}</span>
          {#if item.meta}<small>{item.meta}</small>{/if}
        </a>
        {#if item.children?.length}
          <button
            class="navigation-disclosure"
            type="button"
            aria-label={`${openItems[item.id] ? 'Collapse' : 'Open'} ${item.label} subsections`}
            aria-expanded={openItems[item.id] ?? false}
            aria-controls={`navigation-subsections-${item.id}`}
            title={`${item.label} subsections`}
            onkeydown={handleKeydown}
            onclick={() => toggle(item)}>
            <span class="compact-icon"><Icon name={item.icon} size={19}/></span>
            <span class="disclosure-chevron"><Icon name="chevron" size={15}/></span>
          </button>
        {/if}
      </div>

      {#if item.children?.length && openItems[item.id]}
        <div class="navigation-subsections" id={`navigation-subsections-${item.id}`}>
          <a class="subsection-parent" href={item.href} onclick={handleNavigate} onkeydown={handleKeydown}><span>{item.label}</span><small>Open section</small></a>
          {#each item.children as child (child.id)}
            <a href={child.href} aria-current={child.current ? 'page' : undefined} onclick={handleNavigate} onkeydown={handleKeydown}>
              <span>{child.label}</span>
              {#if child.badge}<small>{child.badge}</small>{/if}
            </a>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
</nav>

<style>
  .navigation-tree { display: grid; gap: 3px; }
  .navigation-item { position: relative; min-width: 0; }
  .navigation-parent { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; }
  .navigation-link, .navigation-disclosure, .navigation-subsections a { color: var(--color-text-subtle); text-decoration: none; }
  .navigation-link { min-width: 0; min-height: var(--touch-target); display: grid; grid-template-columns: 24px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 0 var(--space-2); border-radius: var(--radius-sm); font-size: var(--font-sm); }
  .navigation-link span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .navigation-link small { color: var(--color-text-subtle); font-size: var(--font-xs); }
  .navigation-link:hover, .navigation-link:focus-visible, .navigation-disclosure:hover, .navigation-disclosure:focus-visible { background: var(--surface-2); color: var(--color-text); }
  .navigation-link[aria-current='page'], .current > .navigation-parent .navigation-link { color: var(--accent-primary); }
  .open > .navigation-parent { border-radius: var(--radius-sm) var(--radius-sm) 0 0; background: var(--surface-2); }
  .open > .navigation-parent .navigation-link { color: var(--color-text); }
  .navigation-disclosure { width: var(--touch-target); height: var(--touch-target); display: grid; place-items: center; padding: 0; border: 0; border-radius: var(--radius-sm); background: transparent; cursor: pointer; }
  .compact-icon { display: none; }
  .disclosure-chevron { display: grid; transition: transform 140ms ease; transform: rotate(-90deg); }
  .open > .navigation-parent .disclosure-chevron { transform: rotate(0); }
  .navigation-subsections { display: grid; gap: 1px; margin: 0 0 6px; padding: 4px 3px 5px 7px; border-top: 1px solid var(--border-subtle); border-radius: 0 0 var(--radius-sm) var(--radius-sm); background: var(--surface-1); }
  .navigation-subsections a { min-height: 29px; display: grid; grid-template-columns: 5px minmax(0, 1fr) auto; align-items: center; gap: 6px; padding: 3px 6px; border-radius: var(--radius-sm); font-size: 10.5px; line-height: 1.15; }
  .navigation-subsections a::before { width: 3px; height: 3px; border-radius: 50%; background: var(--color-text-subtle); content: ''; }
  .navigation-subsections a:hover, .navigation-subsections a:focus-visible { background: var(--surface-2); color: var(--color-text); }
  .navigation-subsections a[aria-current='page'] { color: var(--accent-primary); }
  .navigation-subsections small { color: var(--color-text-subtle); }
  .subsection-parent { display: none !important; font-weight: 700; }

  @container app-viewport (min-width: 768px) and (max-width: 1799px) {
    .navigation-tree:not(.sheet) .navigation-parent { display: block; }
    .navigation-tree:not(.sheet) .navigation-link { display: none; }
    .navigation-tree:not(.sheet) .navigation-disclosure { position: relative; width: 100%; grid-template-columns: 1fr 12px; padding: 0 4px 0 10px; }
    .navigation-tree:not(.sheet) .compact-icon { display: grid; }
    .navigation-tree:not(.sheet) .disclosure-chevron { transform: rotate(-90deg); }
    .navigation-tree:not(.sheet) .open > .navigation-parent .disclosure-chevron { transform: rotate(-90deg); }
    .navigation-tree:not(.sheet) .open > .navigation-parent { border-radius: var(--radius-sm); }
    .navigation-tree:not(.sheet) .navigation-subsections { position: absolute; z-index: var(--z-overlay); top: -1px; left: calc(100% + 9px); width: 204px; margin: 0; padding: 4px 6px 6px; border: 1px solid var(--border-primary); border-left-color: var(--border-subtle); border-radius: 0 var(--radius-md) var(--radius-md) 0; background: var(--bg-secondary); box-shadow: var(--shadow-md); }
    .navigation-tree:not(.sheet) .navigation-subsections a { min-height: 34px; grid-template-columns: minmax(0, 1fr) auto; padding-inline: 10px; font-size: var(--font-xs); }
    .navigation-tree:not(.sheet) .navigation-subsections a::before { display: none; }
    .navigation-tree:not(.sheet) .subsection-parent { display: grid !important; min-height: 38px; border-bottom: 1px solid var(--border-subtle); border-radius: 0; color: var(--color-text); font-weight: 750; }
    .navigation-tree:not(.sheet) .subsection-parent small { font-size: 9px; font-weight: 500; }
  }

  .sheet { gap: 5px; }
  .sheet .navigation-item { border-bottom: 1px solid var(--border-subtle); }
  .sheet .navigation-parent { grid-template-columns: minmax(0, 1fr) var(--touch-target); }
  .sheet .navigation-subsections { margin: 0 0 var(--space-2); padding: 4px 3px 5px 9px; }
  .sheet .navigation-subsections a { min-height: 34px; font-size: var(--font-xs); }

  :global(html[data-motion='reduced']) .disclosure-chevron { transition: none; }
  @media (prefers-reduced-motion: reduce) { .disclosure-chevron { transition: none; } }
</style>

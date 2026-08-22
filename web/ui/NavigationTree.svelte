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
</script>

<nav class="navigation-tree" class:sheet={variant === 'sheet'} aria-label={label}>
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
          <a class="subsection-parent" href={item.href} onclick={handleNavigate} onkeydown={handleKeydown}>All {item.label}</a>
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
  .navigation-disclosure { width: var(--touch-target); height: var(--touch-target); display: grid; place-items: center; padding: 0; border: 0; border-radius: var(--radius-sm); background: transparent; cursor: pointer; }
  .compact-icon { display: none; }
  .disclosure-chevron { display: grid; transition: transform 140ms ease; transform: rotate(-90deg); }
  .open > .navigation-parent .disclosure-chevron { transform: rotate(0); }
  .navigation-subsections { display: grid; gap: 2px; margin: 2px 0 var(--space-2) 31px; padding-left: var(--space-2); border-left: 1px solid var(--border-primary); }
  .navigation-subsections a { min-height: 34px; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: var(--space-2); padding: 5px var(--space-2); border-radius: var(--radius-sm); font-size: var(--font-xs); line-height: 1.2; }
  .navigation-subsections a:hover, .navigation-subsections a:focus-visible { background: var(--surface-2); color: var(--color-text); }
  .navigation-subsections a[aria-current='page'] { color: var(--accent-primary); }
  .navigation-subsections small { color: var(--color-text-subtle); }
  .subsection-parent { display: none !important; font-weight: 700; }

  @container app-viewport (min-width: 768px) and (max-width: 1799px) {
    .navigation-tree:not(.sheet) .navigation-parent { display: block; }
    .navigation-tree:not(.sheet) .navigation-link { display: none; }
    .navigation-tree:not(.sheet) .navigation-disclosure { position: relative; width: 100%; }
    .navigation-tree:not(.sheet) .compact-icon { display: grid; }
    .navigation-tree:not(.sheet) .disclosure-chevron { position: absolute; right: 2px; bottom: 2px; padding: 1px; border-radius: 50%; background: var(--bg-secondary); }
    .navigation-tree:not(.sheet) .navigation-subsections { position: absolute; z-index: var(--z-overlay); top: 0; left: calc(100% + 9px); width: 224px; margin: 0; padding: var(--space-2); border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--bg-secondary); box-shadow: var(--shadow-md); }
    .navigation-tree:not(.sheet) .subsection-parent { display: grid !important; border-bottom: 1px solid var(--border-subtle); border-radius: 0; color: var(--color-text); }
  }

  .sheet { gap: 5px; }
  .sheet .navigation-item { border-bottom: 1px solid var(--border-subtle); }
  .sheet .navigation-parent { grid-template-columns: minmax(0, 1fr) var(--touch-target); }
  .sheet .navigation-subsections { margin-left: 32px; margin-bottom: var(--space-3); }

  :global(html[data-motion='reduced']) .disclosure-chevron { transition: none; }
  @media (prefers-reduced-motion: reduce) { .disclosure-chevron { transition: none; } }
</style>

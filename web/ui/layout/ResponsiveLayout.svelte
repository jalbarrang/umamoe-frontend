<script lang="ts">
  import type { Snippet } from 'svelte';

  export type ResponsiveLayoutVariant = 'stack' | 'grid' | 'sidebar' | 'split';

  interface Props {
    children: Snippet;
    variant?: ResponsiveLayoutVariant;
    label?: string;
    minItemWidth?: string;
    dense?: boolean;
  }

  let { children, variant = 'stack', label, minItemWidth = '240px', dense = false }: Props = $props();
</script>

<div class="layout-boundary" style={`--layout-min-item:${minItemWidth}`}>
  <div class="layout layout--{variant}" class:dense role={label ? 'group' : undefined} aria-label={label}>
    {@render children()}
  </div>
</div>

<style>
  .layout-boundary { width: 100%; min-width: 0; container: ui-layout / inline-size; }
  .layout { min-width: 0; display: grid; gap: var(--space-4); }
  .layout.dense { gap: var(--space-3); }
  .layout--grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--layout-min-item)), 1fr)); }
  .layout--stack,
  .layout--sidebar,
  .layout--split { grid-template-columns: minmax(0, 1fr); }
  .layout > :global(*) { min-width: 0; }

  /* Mirrors SCREEN_BREAKPOINTS.compact; guarded by breakpoints.test.ts. */
  @container ui-layout (min-width: 768px) {
    .layout--sidebar { grid-template-columns: minmax(200px, 240px) minmax(0, 1fr); }
    .layout--split { grid-template-columns: minmax(0, 1.35fr) minmax(280px, .65fr); }
  }

  /* Mirrors SCREEN_BREAKPOINTS.expanded; guarded by breakpoints.test.ts. */
  @container ui-layout (min-width: 1440px) {
    .layout--sidebar { grid-template-columns: 280px minmax(0, 1fr); }
    .layout--split { grid-template-columns: minmax(0, 1.5fr) minmax(340px, .5fr); }
  }
</style>

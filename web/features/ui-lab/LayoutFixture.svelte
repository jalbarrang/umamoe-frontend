<script lang="ts">
  import ResponsiveLayout from '../../ui/layout/ResponsiveLayout.svelte';
  import { shellLayoutForWidth } from '../../ui/layout/breakpoints';

  interface Props { width: number; }
  let { width }: Props = $props();
  const mode = $derived(shellLayoutForWidth(width));
</script>

<div class="stage">
  <div class="frame" style:width="{width}px" data-layout-mode={mode}>
    <header><strong>{width}px</strong><span>{mode} layout</span></header>
    <ResponsiveLayout variant="sidebar" label="Filter and results layout" dense>
      <aside aria-label="Filters"><span></span><span></span><span></span></aside>
      <section class="content" aria-label="Results">
        <div class="title"></div>
        <ResponsiveLayout variant="grid" label="Results grid" minItemWidth="150px" dense>
          <article></article><article></article><article></article>
        </ResponsiveLayout>
      </section>
    </ResponsiveLayout>
  </div>
</div>

<style>
  .stage { max-width: 100%; overflow-x: auto; padding-bottom: var(--space-2); }
  .frame { min-width: 0; overflow: hidden; border-radius: var(--radius-md); background: var(--color-canvas); box-shadow: inset 0 0 0 1px var(--color-border-strong); }
  header { height: 38px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; border-bottom: 1px solid var(--color-border); background: var(--color-surface-1); font-size: 10px; text-transform: capitalize; }
  header span { color: var(--color-text-subtle); }
  aside { min-height: 210px; display: grid; align-content: start; gap: 8px; padding: 12px; border-right: 1px solid var(--color-border); background: var(--color-surface-1); }
  aside span { height: 28px; border: 1px solid var(--factor-field-border); border-radius: var(--radius-sm); background: var(--factor-field-bg); }
  .content { min-height: 210px; padding: 12px; }
  .title { width: min(210px, 70%); height: 14px; margin-bottom: 12px; border-radius: 2px; background: var(--color-surface-3); }
  article { height: 86px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-1); }
  @container ui-layout (max-width: 767px) { aside { min-height: auto; grid-template-columns: repeat(3, minmax(0, 1fr)); border-right: 0; border-bottom: 1px solid var(--color-border); } }
</style>

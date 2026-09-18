<script lang="ts">export interface Crumb { label: string; href?: string; } interface Props { items: Crumb[]; } let { items }: Props = $props();</script>
<nav aria-label="Breadcrumb"><ol>{#each items as item, index}<li>{#if item.href && index < items.length - 1}<a href={item.href}>{item.label}</a>{:else}<span aria-current={index === items.length - 1 ? 'page' : undefined}>{item.label}</span>{/if}</li>{/each}</ol></nav>
<style>
  ol { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); margin: 0; padding: 0; list-style: none; font-size: var(--font-sm); }
  li { display: flex; align-items: center; gap: var(--space-2); color: var(--color-text-muted); }
  li:not(:last-child)::after { color: var(--color-text-subtle); content: '/'; }
  a { color: var(--color-text-muted); text-decoration: none; } a:hover { color: var(--color-accent); }
  [aria-current='page'] { color: var(--color-text); font-weight: 700; }
</style>

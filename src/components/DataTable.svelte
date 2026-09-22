<script lang="ts">
  import type { Snippet } from 'svelte';
  import { loadWhenVisible } from '@/lib/load-when-visible';
  export interface TableColumn { key: string; label: string; numeric?: boolean; priority?: 'primary' | 'secondary'; }
  interface Props { caption: string; columns: TableColumn[]; rows: Record<string, string | number>[]; emptyMessage?: string; cell?: Snippet<[Record<string, string | number>, TableColumn]>; }
  let { caption, columns, rows, emptyMessage = 'No results', cell }: Props = $props();
  let visibleLimit = $state(30);
  $effect(() => { void rows; visibleLimit = 30; });
</script>

<div class="table-wrap">
  <table>
    <caption class="sr-only">{caption}</caption>
    <thead><tr>{#each columns as column}<th class:secondary={column.priority === 'secondary'} class:numeric={column.numeric} scope="col">{column.label}</th>{/each}</tr></thead>
    <tbody>
      {#each rows.slice(0, visibleLimit) as row}
        <tr>{#each columns as column}<td class:secondary={column.priority === 'secondary'} class:numeric={column.numeric} data-label={column.label}>{#if cell}{@render cell(row, column)}{:else}{row[column.key]}{/if}</td>{/each}</tr>
      {:else}
        <tr><td colspan={columns.length} class="empty">{emptyMessage}</td></tr>
      {/each}
      {#if visibleLimit < rows.length}{#key visibleLimit}<tr aria-hidden="true" use:loadWhenVisible={() => visibleLimit += 30}><td class="lazy-more" colspan={columns.length}></td></tr>{/key}{/if}
    </tbody>
  </table>
</div>

<style>
  .table-wrap { max-width: 100%; overflow-x: auto; border: 1px solid var(--color-border); border-radius: var(--radius-md); }
  table { width: 100%; border-collapse: collapse; background: var(--color-surface-1); font-size: var(--font-sm); }
  th, td { min-height: 44px; padding: 10px var(--space-3); border-bottom: 1px solid var(--color-border); text-align: left; white-space: nowrap; }
  th { position: sticky; top: 0; background: var(--color-surface-2); color: var(--color-text-muted); font-size: var(--font-xs); letter-spacing: .025em; text-transform: uppercase; }
  tbody tr:last-child td { border-bottom: 0; }
  tbody tr:hover { background: color-mix(in srgb, var(--color-surface-2) 60%, transparent); }
  .numeric { text-align: right; font-variant-numeric: tabular-nums; }
  td.empty { padding: var(--space-8); color: var(--color-text-muted); text-align: center; }
  td.lazy-more { height:1px; min-height:0; padding:0; border:0; }
  @media (max-width: 520px) { .secondary { display: none; } }
</style>

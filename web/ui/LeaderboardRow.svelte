<script lang="ts">
  import Icon from './Icon.svelte';
  interface Stat { label: string; value: string; emphasized?: boolean; }
  interface Props { rank: number; name: string; group?: string; meta?: string; trend?: number; stats: Stat[]; href?: string; onclick?: () => void; }
  let { rank, name, group, meta, trend = 0, stats, href, onclick }: Props = $props();
</script>

<article class="leader-row" class:podium={rank <= 3}>
  <div class="rank"><strong>#{rank}</strong>{#if trend !== 0}<span class:positive={trend > 0} class:negative={trend < 0}><Icon name="chevron" size={12}/>{Math.abs(trend)}</span>{/if}</div>
  <div class="identity">{#if href}<a {href}>{name}</a>{:else}<strong>{name}</strong>{/if}{#if group}<span><Icon name="community" size={12}/>{group}</span>{/if}{#if meta}<small>{meta}</small>{/if}</div>
  <dl>{#each stats as stat}<div class:emphasized={stat.emphasized}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>{/each}</dl>
  {#if onclick}<button type="button" aria-label={`Open ${name}`} onclick={onclick}><Icon name="chevron" size={17}/></button>{/if}
</article>

<style>
  .leader-row { min-width: 0; min-height: 62px; display: grid; grid-template-columns: 56px minmax(120px, .7fr) minmax(260px, 1.5fr) auto; align-items: center; gap: 8px; padding: 7px 9px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--surface-1); container: leader-row / inline-size; }.leader-row:hover { border-color: var(--border-secondary); background: var(--surface-2); }.leader-row.podium { border-left: 3px solid var(--accent-warning); }
  .rank { display: grid; justify-items: start; }.rank > strong { font-family: var(--font-mono); font-size: var(--font-md); }.rank span { display: inline-flex; align-items: center; color: var(--color-text-subtle); font-size: 9px; }.rank span.positive { color: var(--accent-secondary); }.rank span.positive :global(svg) { transform: rotate(-90deg); }.rank span.negative { color: var(--accent-error); }.rank span.negative :global(svg) { transform: rotate(90deg); }
  .identity { min-width: 0; display: grid; gap: 2px; }.identity > strong, .identity > a { overflow: hidden; color: var(--color-text); font-size: var(--font-xs); font-weight: 700; text-decoration: none; text-overflow: ellipsis; white-space: nowrap; }.identity span { display: flex; align-items: center; gap: 3px; color: var(--color-accent); font-size: 9px; }.identity small { overflow: hidden; color: var(--color-text-subtle); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
  dl { min-width: 0; display: grid; grid-template-columns: repeat(var(--stat-count, 4), minmax(64px, 1fr)); gap: 2px; margin: 0; }.leader-row dl { --stat-count: 4; } dl div { min-width: 0; display: grid; gap: 2px; padding: 4px 6px; border-left: 1px solid var(--border-subtle); } dt { color: var(--color-text-subtle); font-size: 8px; text-transform: uppercase; } dd { margin: 0; overflow: hidden; font-family: var(--font-mono); font-size: 10px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }.emphasized dd { color: var(--accent-secondary); }
  article > button { width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--color-text-subtle); cursor: pointer; }
  @container leader-row (max-width: 620px) { .leader-row { grid-template-columns: 46px minmax(0, 1fr) auto; }.leader-row dl { grid-column: 1 / -1; grid-row: 2; grid-template-columns: repeat(auto-fit, minmax(62px, 1fr)); }.leader-row dl div:first-child { border-left: 0; }.identity small { display: none; } article > button { min-width: 44px; min-height: 44px; } }
</style>

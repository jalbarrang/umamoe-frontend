<script lang="ts">
  import Icon from '../../ui/Icon.svelte';
  import LogoMark from '../../ui/LogoMark.svelte';
  import { shellLayoutForWidth } from '../../ui/layout/breakpoints';
  interface Props { width: number; }
  let { width }: Props = $props();
  const mode = $derived(shellLayoutForWidth(width));
  const destinations = [
    { label: 'Home', icon: 'home' as const }, { label: 'Database', icon: 'database' as const },
    { label: 'Veterans', icon: 'veterans' as const }, { label: 'Race Lab', icon: 'race' as const },
    { label: 'Timeline', icon: 'timeline' as const }
  ];
</script>

<div class="stage"><div class="frame" style:width="{width}px" data-shell-mode={mode}>
  <div class="shell">
    <header class="mobile-head"><LogoMark size={28}/><strong>uma.moe</strong><button aria-label="Open launcher"><Icon name="search" size={18}/></button></header>
    <aside class="rail">
      <div class="brand"><LogoMark size={30}/><strong>uma.moe</strong></div>
      <nav aria-label="Preview navigation">{#each destinations as item}<a href="#navigation" class:active={item.label === 'Veterans'}><Icon name={item.icon}/><span>{item.label}</span></a>{/each}</nav>
    </aside>
    <div class="utility"><span>Local workspace</span><div><span class="dot"></span>Client offline</div></div>
    <main><span class="eyebrow">Workspace</span><h3>Veterans</h3><p>Your reusable roster is available across every planning tool.</p><div class="cards"><span></span><span></span><span></span></div></main>
    <nav class="bottom" aria-label="Preview mobile navigation">{#each destinations.slice(0, 4) as item}<a href="#navigation" class:active={item.label === 'Veterans'}><Icon name={item.icon} size={18}/><span>{item.label}</span></a>{/each}<a href="#navigation"><Icon name="more" size={18}/><span>More</span></a></nav>
  </div>
</div></div>

<style>
  .stage { max-width: 100%; overflow-x: auto; padding-bottom: var(--space-2); }
  .frame { height: 390px; overflow: hidden; border-radius: var(--radius-md); background: var(--color-canvas); box-shadow: inset 0 0 0 1px var(--color-border-strong); container-type: inline-size; }
  .shell { position: relative; min-width: 100%; height: 100%; padding: 48px 0 58px; }
  .mobile-head { position: absolute; inset: 0 0 auto; height: 48px; display: flex; align-items: center; gap: 8px; padding: 0 12px; border-bottom: 1px solid var(--color-border); background: var(--color-surface-1); }
  .mobile-head strong { font-size: 13px; } .mobile-head button { width: 36px; height: 36px; display: grid; place-items: center; margin-left: auto; padding: 0; border: 0; border-radius: var(--radius-sm); background: var(--color-surface-2); color: var(--color-text-muted); }
  .rail, .utility { display: none; }
  main { height: 100%; overflow: hidden; padding: 18px 14px; }
  .eyebrow { color: var(--color-accent); font-size: 9px; font-weight: 800; text-transform: uppercase; }
  h3 { margin: 2px 0 4px; font-size: 20px; } p { max-width: 420px; margin: 0; font-size: 11px; }
  .cards { display: grid; grid-template-columns: repeat(3, minmax(86px, 1fr)); gap: 8px; margin-top: 16px; }
  .cards span { height: 92px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface-1); }
  .bottom { position: absolute; inset: auto 0 0; height: 58px; display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--color-border); background: var(--color-surface-1); }
  .bottom a { min-width: 0; display: grid; place-items: center; align-content: center; gap: 2px; color: var(--color-text-subtle); font-size: 8px; text-decoration: none; }
  .bottom a.active { color: var(--color-accent); }
  @container (min-width: 768px) {
    .shell { padding: 46px 0 0 64px; }
    .mobile-head, .bottom { display: none; }
    .rail { position: absolute; inset: 0 auto 0 0; width: 64px; display: block; border-right: 1px solid var(--color-border); background: var(--color-surface-1); }
    .brand { height: 46px; display: grid; place-items: center; border-bottom: 1px solid var(--color-border); } .brand strong { display: none; }
    .rail nav { display: grid; gap: 3px; padding: 8px; }
    .rail a { height: 42px; display: grid; place-items: center; border-radius: 7px; color: var(--color-text-subtle); text-decoration: none; } .rail a span { display: none; } .rail a.active { background: var(--color-accent-soft); color: var(--color-accent); }
    .utility { position: absolute; inset: 0 0 auto 64px; height: 46px; display: flex; align-items: center; justify-content: space-between; padding: 0 14px; border-bottom: 1px solid var(--color-border); background: var(--color-surface-1); color: var(--color-text-muted); font-size: 10px; }
    .utility div { display: flex; align-items: center; gap: 5px; } .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-subtle); }
    main { padding: 24px; }
  }
  @container (min-width: 1280px) {
    .shell { padding-left: 240px; }
    .rail { width: 240px; }
    .brand { display: flex; justify-content: flex-start; gap: 9px; padding: 0 14px; } .brand strong { display: inline; font-size: 13px; }
    .rail a { grid-template-columns: 24px 1fr; justify-items: start; gap: 10px; padding: 0 11px; font-size: 11px; } .rail a span { display: inline; }
    .utility { left: 240px; }
    main { padding: 28px 34px; }
  }
</style>

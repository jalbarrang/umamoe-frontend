<script lang="ts">import Button from '../../ui/Button.svelte'; import LogoMark from '../../ui/LogoMark.svelte';</script>
<svelte:head><title>Svelte rewrite foundation · uma.moe</title></svelte:head>
<main class="gate"><LogoMark size={52}/><div><span>Rewrite foundation</span><h1>Product routes are intentionally paused.</h1><p>The reusable UI system must pass mobile, theme, accessibility, and performance review before the landing page or feature routes are implemented.</p></div>{#if __UI_LAB_ENABLED__}<a href="/ui-lab"><Button>Open UI lab</Button></a>{/if}</main>
<style>
  .gate { min-height: 100dvh; width: min(100%, 720px); display: grid; place-items: start; align-content: center; gap: var(--space-5); margin: auto; padding: var(--space-6); }
  .gate > div > span { color: var(--color-accent); font-size: var(--font-xs); font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  h1 { margin: var(--space-2) 0; font-size: var(--font-display); line-height: 1; letter-spacing: -.04em; }
  p { max-width: 62ch; margin: 0; }
  a { width: fit-content; text-decoration: none; }
</style>

<script lang="ts">import Button from '../../ui/Button.svelte';</script>
<svelte:head><title>Page not found · uma.moe</title></svelte:head>
<main class="not-found"><span>404</span><h1>This route is not in the UI foundation build.</h1><p>Only the review lab is enabled until its component contracts are approved.</p><a href="/"><Button variant="secondary">Back to foundation</Button></a></main>
<style>.not-found { min-height: 100dvh; width: min(100%, 680px); display: grid; place-items: start; align-content: center; gap: var(--space-3); margin: auto; padding: var(--space-6); } .not-found > span { color: var(--color-accent); font-weight: 900; } h1 { margin: 0; font-size: var(--font-xl); } p { margin: 0 0 var(--space-2); } a { text-decoration: none; }</style>

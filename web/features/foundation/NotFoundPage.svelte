<script lang="ts">import Button from '../../ui/Button.svelte'; import AppPage from '../../ui/layout/AppPage.svelte';</script>
<svelte:head><title>Page not found · uma.moe</title></svelte:head>
<AppPage routeId="not-found" title="Page not found" description="This destination is not part of the merged uma.moe route manifest." eyebrow="404"><div class="not-found"><p>Use the main navigation to return to an available feature.</p><Button href="/" variant="secondary">Back home</Button></div></AppPage>
<style>.not-found { min-height: 240px; display: grid; place-items: start; align-content: center; gap: var(--space-3); padding: var(--space-5); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--surface-1); } .not-found p { margin: 0; }</style>

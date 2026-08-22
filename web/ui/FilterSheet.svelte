<script lang="ts">
  import type { Snippet } from 'svelte';
  import Dialog from './Dialog.svelte';
  interface Props { id: string; title: string; description?: string; open?: boolean; children: Snippet; actions?: Snippet; }
  let { id, title, description, open = $bindable(false), children, actions }: Props = $props();
</script>

<Dialog {id} {title} {description} mobileSheet bind:open {actions}>{@render children()}</Dialog>

<script lang="ts">
  interface Props { size?: number; label?: string; }
  let { size = 36, label = 'uma.moe' }: Props = $props();
</script>

<img class="mark" src="/logo.webp" alt={label} width={size} height={size} style:width="{size}px" style:height="{size}px"/>

<style>
  .mark { display: block; flex: 0 0 auto; object-fit: contain; }
</style>

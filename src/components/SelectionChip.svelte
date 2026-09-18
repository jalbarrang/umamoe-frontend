<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { label: string; image?: string; tone?: 'include' | 'exclude' | 'neutral'; removable?: boolean; onremove?: () => void; }
  let { label, image, tone = 'neutral', removable = false, onremove }: Props = $props();
</script>

<span class="chip chip--{tone}">{#if image}<img src={image} alt=""/>{/if}<span>{label}</span>{#if removable}<button type="button" aria-label={`Remove ${label}`} onclick={onremove}><Icon name="close" size={12}/></button>{/if}</span>

<style>
  .chip { width: fit-content; min-height: 28px; display: inline-flex; align-items: center; gap: 5px; padding: 2px 6px; border: 1px solid var(--border-primary); border-radius: var(--radius-md); background: var(--factor-field-bg); color: var(--color-text-muted); font-size: var(--font-xs); }
  .chip--include { border-color: color-mix(in srgb, var(--color-secondary) 45%, transparent); color: var(--color-secondary); } .chip--exclude { border-color: color-mix(in srgb, var(--color-danger) 45%, transparent); color: var(--color-danger); }
  img { width: 22px; height: 22px; object-fit: cover; object-position: top; } button { width: 24px; height: 24px; display: grid; place-items: center; margin: -2px -5px -2px 0; padding: 0; border: 0; border-radius: var(--radius-sm); background: transparent; color: currentColor; cursor: pointer; } button:hover { background: var(--surface-3); }
</style>

<script lang="ts">
  import Icon from './Icon.svelte';
  import type { IconName } from './icon-types';

  interface Props {
    label: string;
    detail?: string;
    image?: string;
    icon?: IconName;
    tone?: 'primary' | 'warning' | 'purple' | 'neutral';
    selected?: boolean;
    showAction?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    onclick?: (event: MouseEvent) => void;
  }

  let { label, detail, image, icon = 'search', tone = 'primary', selected = false, showAction = true, disabled = false, ariaLabel, onclick }: Props = $props();
</script>

<button class="picker-button tone-{tone}" class:selected class:no-action={!showAction} type="button" {disabled} aria-label={ariaLabel ?? label} {onclick}>
  <span class="picker-visual">{#if image}<img src={image} alt=""/>{:else}<Icon name={icon} size={17}/>{/if}</span>
  <span class="picker-copy"><strong>{label}</strong>{#if detail}<small>{detail}</small>{/if}</span>
  {#if showAction}<span class="picker-action" aria-hidden="true"><Icon name="chevron" size={14}/></span>{/if}
</button>

<style>
  .picker-button { --picker-tone:var(--accent-primary); width:100%; min-width:0; min-height:44px; display:grid; grid-template-columns:28px minmax(0,1fr) auto; align-items:center; gap:8px; padding:4px 9px; border:1px solid var(--border-primary); border-radius:8px; background:var(--factor-field-bg); color:var(--text-primary); cursor:pointer; font:inherit; text-align:left; transition:border-color var(--duration-fast),background-color var(--duration-fast),box-shadow var(--duration-fast); }
  .picker-button.no-action { grid-template-columns:28px minmax(0,1fr); }
  .picker-button:hover:not(:disabled) { border-color:var(--border-secondary); background:var(--factor-field-bg); }
  .picker-button:focus-visible { outline:0; box-shadow:var(--focus-ring); }
  .picker-button.selected { border-color:color-mix(in srgb,var(--picker-tone) 42%,var(--border-primary)); }
  .picker-button:disabled { cursor:not-allowed; opacity:.5; }
  .tone-warning { --picker-tone:var(--accent-warning); }.tone-purple { --picker-tone:var(--accent-purple); }.tone-neutral { --picker-tone:var(--text-muted); }
  .picker-visual { width:28px; height:32px; display:grid; place-items:center; overflow:hidden; border-radius:4px; color:var(--picker-tone); }
  .picker-visual img { width:100%; height:100%; display:block; object-fit:cover; object-position:top center; }
  .picker-copy { min-width:0; display:grid; gap:1px; line-height:1.15; }
  .picker-copy strong,.picker-copy small { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .picker-copy strong { font-size:11px; font-weight:700; }.picker-copy small { color:var(--text-muted); font-size:8px; font-weight:500; }
  .picker-action { width:16px; height:16px; display:grid; place-items:center; color:var(--text-muted); }
  .picker-action :global(svg) { transform:rotate(-90deg); }
  @media(max-width:480px){.picker-action{display:none}.picker-button{grid-template-columns:28px minmax(0,1fr)}}
</style>

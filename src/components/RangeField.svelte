<script lang="ts">
  import Slider from './Slider.svelte';
  interface Props { id: string; label: string; value?: number; min?: number; max?: number; step?: number; unit?: string; disabled?: boolean; }
  let { id, label, value = $bindable(50), min = 0, max = 100, step = 1, unit = '', disabled = false }: Props = $props();
</script>

<Slider {id} {label} bind:value {min} {max} {step} {unit} {disabled}/>

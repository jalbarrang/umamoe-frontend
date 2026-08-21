<script lang="ts">
  interface Props { id: string; label: string; value?: number; min?: number; max?: number; step?: number; unit?: string; disabled?: boolean; }
  let { id, label, value = $bindable(50), min = 0, max = 100, step = 1, unit = '', disabled = false }: Props = $props();
  const percent = $derived(((value - min) / (max - min)) * 100);
</script>

<label class="range" for={id}>
  <span class="header"><strong>{label}</strong><output for={id}>{value}{unit}</output></span>
  <input {id} type="range" {min} {max} {step} {disabled} bind:value style={`--value: ${percent}%`} />
</label>

<style>
  .range { display: flex; flex-direction: column; gap: var(--space-2); }
  .header { display: flex; justify-content: space-between; gap: var(--space-4); font-size: var(--font-sm); }
  output { color: var(--color-text-muted); font-variant-numeric: tabular-nums; }
  input { width: 100%; height: var(--touch-target); margin: 0; accent-color: var(--color-accent); cursor: pointer; }
  input:disabled { cursor: not-allowed; opacity: .45; }
</style>

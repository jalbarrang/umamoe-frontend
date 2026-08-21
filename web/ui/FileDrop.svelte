<script lang="ts">
  import Icon from './Icon.svelte';
  interface Props { id: string; label?: string; accept?: string; disabled?: boolean; onfiles?: (files: FileList) => void; }
  let { id, label = 'Drop a file here or choose one', accept = '.json', disabled = false, onfiles }: Props = $props();
  let dragging = $state(false);
  function receive(files: FileList | null) { if (files?.length) onfiles?.(files); }
</script>

<label
  class="drop"
  class:dragging
  class:disabled
  for={id}
  ondragover={(event) => { event.preventDefault(); dragging = true; }}
  ondragleave={() => dragging = false}
  ondrop={(event) => { event.preventDefault(); dragging = false; receive(event.dataTransfer?.files ?? null); }}
>
  <Icon name="upload" size={26} />
  <strong>{label}</strong>
  <small>Accepted: {accept}</small>
  <input {id} type="file" {accept} {disabled} onchange={(event) => receive(event.currentTarget.files)} />
</label>

<style>
  .drop { min-height: 132px; display: grid; place-items: center; align-content: center; gap: var(--space-2); padding: var(--space-5); border: 1px dashed var(--color-border-strong); border-radius: var(--radius-lg); background: var(--color-surface-2); color: var(--color-text-muted); text-align: center; cursor: pointer; transition: background var(--duration-fast), border-color var(--duration-fast); }
  .drop:hover, .drop.dragging { border-color: var(--color-accent); background: var(--color-accent-soft); color: var(--color-accent); }
  .drop.disabled { cursor: not-allowed; opacity: .45; }
  strong { color: var(--color-text); font-size: var(--font-sm); }
  small { font-size: var(--font-xs); }
  input { position: absolute; width: 1px; height: 1px; overflow: hidden; opacity: 0; }
</style>

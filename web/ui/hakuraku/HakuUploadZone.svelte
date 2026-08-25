<script lang="ts">
  import Icon from '../Icon.svelte';
  interface Props { id?: string; accept?: string; onfiles?: (files: FileList) => void; }
  let { id = 'haku-upload', accept = '.json,.gz,.log', onfiles }: Props = $props();
  let dragging = $state(false);
  function submit(files: FileList | null) { if (files?.length) onfiles?.(files); }
</script>

<label class:dragging for={id} ondragenter={() => dragging = true} ondragleave={() => dragging = false} ondragover={(event) => event.preventDefault()} ondrop={(event) => { event.preventDefault(); dragging = false; submit(event.dataTransfer?.files ?? null); }}>
  <input {id} type="file" {accept} multiple onchange={(event) => submit(event.currentTarget.files)}/>
  <span class="icon"><Icon name="upload" size={24}/></span>
  <span><strong>Drop race data here</strong><small>or choose UmaLogs, JSON, or compressed captures</small></span>
  <b>Browse</b>
</label>

<style>
  label { min-height: 118px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px; padding: 18px; border: 1px dashed var(--haku-border-strong); border-radius: var(--haku-radius-lg); background: var(--haku-bg-1); cursor: pointer; transition: border-color var(--duration-fast), background var(--duration-fast); }
  label:hover, label.dragging { border-color: var(--haku-accent); background: color-mix(in srgb, var(--haku-accent) 6%, var(--haku-bg-1)); }
  input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  .icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: var(--haku-radius-md); background: rgb(102 126 234 / .14); color: #91a3ff; }
  label > span:nth-child(3) { min-width: 0; display: grid; gap: 4px; }
  strong { font-size: 13px; line-height: 18px; }
  small { color: var(--haku-muted); font-size: 10px; line-height: 14px; }
  b { min-height: 34px; display: inline-flex; align-items: center; padding: 0 13px; border: 1px solid rgb(102 126 234 / .48); border-radius: var(--haku-radius-sm); color: #b4c0ff; font-size: 11px; }
  @container haku-lab (max-width: 540px) { label { grid-template-columns: auto minmax(0, 1fr); min-height: 92px; padding: 12px; } b { display: none; } }
</style>

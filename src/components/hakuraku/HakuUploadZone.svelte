<script lang="ts">
  interface Props { id?:string; accept?:string; onfiles?:(files:FileList)=>void; multiple?:boolean; }
  let { id='haku-upload', accept='.json,.gz,.log', onfiles, multiple=true }:Props=$props();
  let dragOver=$state(false);
  function receive(files:FileList|null){if(files?.length)onfiles?.(files)}
</script>
<label class="upload-zone" class:drag-over={dragOver} for={id} ondragover={(event)=>{event.preventDefault();dragOver=true}} ondragleave={()=>dragOver=false} ondrop={(event)=>{event.preventDefault();dragOver=false;receive(event.dataTransfer?.files??null)}}>
  <span class="upload-icon" aria-hidden="true">📂</span><span class="upload-label">Drop a .json race file here, or click to browse</span>
  <input {id} type="file" {accept} {multiple} onchange={(event)=>receive(event.currentTarget.files)}/>
</label>
<style>
  .upload-zone{display:block;margin-bottom:16px;padding:40px 24px;border:2px dashed var(--haku-border-accent,rgb(99 102 241/.45));border-radius:var(--haku-radius-lg,12px);background:var(--haku-bg-2,#2a2f36);text-align:center;cursor:pointer;transition:border-color .18s ease,background .18s ease}.upload-zone:hover,.drag-over{border-color:var(--haku-accent,#667eea);background:rgb(102 126 234/.07)}.upload-icon{display:block;margin-bottom:8px;font-size:2rem;line-height:1;opacity:.6}.upload-label{display:block;color:var(--haku-text-secondary,#9ba3b0);font-size:.95rem}input{position:absolute;width:1px;height:1px;overflow:hidden;opacity:0}@media(max-width:600px){.upload-zone{padding:30px 8px}}
</style>

<script lang="ts">
  type SliderTone = 'accent' | 'blue' | 'coral' | 'orange' | 'pink' | 'green' | 'teal' | 'white';
  type SelectionMode = 'before' | 'after' | 'between';

  interface Props {
    id: string;
    label: string;
    value?: number;
    endValue?: number;
    range?: boolean;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    tone?: SliderTone;
    selection?: SelectionMode;
    showTicks?: boolean;
    showTickLabels?: boolean;
    tickLabels?: string[];
    tickValues?: number[];
    showValueLabels?: boolean;
    showOutput?: boolean;
    hideLabel?: boolean;
    disabled?: boolean;
    onchange?: (value: number, endValue?: number) => void;
  }

  let {
    id,
    label,
    value = $bindable(0),
    endValue = $bindable<number | undefined>(undefined),
    range = false,
    min = 0,
    max = 100,
    step = 1,
    unit = '',
    tone = 'accent',
    selection,
    showTicks = false,
    showTickLabels = false,
    tickLabels = [],
    tickValues,
    showValueLabels = false,
    showOutput = true,
    hideLabel = false,
    disabled = false,
    onchange
  }: Props = $props();

  let activeThumb = $state<'start' | 'end'>('start');
  let dragging = $state(false);
  let trackDragThumb = $state<'start' | 'end' | null>(null);
  const isRange = $derived(range || endValue !== undefined);
  const actualEnd = $derived(isRange ? (endValue ?? max) : value);
  const mode = $derived(selection ?? (isRange ? 'between' : 'before'));
  const startPercent = $derived(toPercent(value));
  const endPercent = $derived(toPercent(actualEnd));
  const fillStart = $derived(mode === 'before' ? 0 : startPercent);
  const fillEnd = $derived(mode === 'after' ? 100 : endPercent);
  const fillScale = $derived(Math.max(0, (fillEnd - fillStart) / 100));
  const stepCount = $derived(Math.max(0, Math.round((max - min) / step)));
  const ticks = $derived(!showTicks ? [] : tickValues?.filter(tick=>tick>=min&&tick<=max) ?? (stepCount <= 24 ? Array.from({ length: stepCount + 1 }, (_, index) => min + index * step) : []));

  function toPercent(input: number) { return max === min ? 0 : Math.max(0, Math.min(100, ((input - min) / (max - min)) * 100)); }
  function tickActive(tick: number) {
    if (isRange || mode === 'between') return tick >= value && tick <= actualEnd;
    return mode === 'after' ? tick >= value : tick <= value;
  }
  function formatted(input: number) { return `${input}${unit}`; }
  function clamp(input: number) { return Math.max(min, Math.min(max, input)); }
  function snap(input: number) {
    const precision = Math.max(0, (String(step).split('.')[1] ?? '').length);
    return Number((min + Math.round((clamp(input) - min) / step) * step).toFixed(precision));
  }
  function updateThumb(thumb: 'start' | 'end', input: number) {
    const next = snap(input);
    if (thumb === 'start') value = isRange ? Math.min(next, actualEnd) : next;
    else endValue = Math.max(next, value);
    onchange?.(value, isRange ? actualEnd : undefined);
  }
  function changeStart(event: Event) {
    updateThumb('start', Number((event.currentTarget as HTMLInputElement).value));
  }
  function changeEnd(event: Event) {
    updateThumb('end', Number((event.currentTarget as HTMLInputElement).value));
  }
  function pointerValue(event: PointerEvent, element: HTMLElement) {
    const bounds = element.getBoundingClientRect();
    return snap(min + ((event.clientX - bounds.left) / bounds.width) * (max - min));
  }
  function beginTrackDrag(event: PointerEvent) {
    if (disabled || event.button !== 0) return;
    const target = event.currentTarget as HTMLButtonElement;
    const next = pointerValue(event, target);
    activeThumb = !isRange || Math.abs(next - value) <= Math.abs(next - actualEnd) ? 'start' : 'end';
    trackDragThumb = activeThumb;
    dragging = true;
    target.setPointerCapture(event.pointerId);
    updateThumb(activeThumb, next);
  }
  function moveTrackDrag(event: PointerEvent) {
    if (!trackDragThumb) return;
    updateThumb(trackDragThumb, pointerValue(event, event.currentTarget as HTMLButtonElement));
  }
  function endTrackDrag(event: PointerEvent) {
    const target = event.currentTarget as HTMLButtonElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
    trackDragThumb = null;
    dragging = false;
  }
</script>

<div class="field field--{tone}" class:disabled class:with-value-labels={showValueLabels} role="group" aria-labelledby="{id}-label">
  <div class="header" class:visually-hidden={hideLabel && !showOutput}>
    <span id="{id}-label">{label}</span>
    {#if showOutput}<output for={isRange ? `${id}-start ${id}-end` : `${id}-start`}>{formatted(value)}{#if isRange}<span aria-hidden="true">–</span>{formatted(actualEnd)}{/if}</output>{/if}
  </div>
  <div class="slider-wrap" class:dragging style={`--fill-start:${fillStart}%;--fill-scale:${fillScale};`}>
    <div class="track" aria-hidden="true">
      <span class="fill"></span>
      {#each ticks as tick}
        <i class:active={tickActive(tick)} style={`left:${toPercent(tick)}%`}></i>
      {/each}
    </div>
    <button
      class="track-hit"
      type="button"
      tabindex="-1"
      aria-label={`Adjust ${label} on track`}
      {disabled}
      onpointerdown={beginTrackDrag}
      onpointermove={moveTrackDrag}
      onpointerup={endTrackDrag}
      onpointercancel={endTrackDrag}
    ></button>
    <span class="visual-thumb visual-thumb--start" style={`--thumb-position:${startPercent}%`} aria-hidden="true"><span class="visual-knob"></span></span>
    {#if isRange}<span class="visual-thumb visual-thumb--end" style={`--thumb-position:${endPercent}%`} aria-hidden="true"><span class="visual-knob"></span></span>{/if}
    <input
      id="{id}-start"
      class="thumb thumb--start"
      class:on-top={activeThumb === 'start'}
      type="range"
      {min}
      {max}
      {step}
      {disabled}
      value={value}
      aria-label={isRange ? `${label} minimum` : label}
      aria-valuemax={isRange ? actualEnd : max}
      aria-valuetext={formatted(value)}
      onfocus={() => activeThumb = 'start'}
      onpointerdown={() => { activeThumb = 'start'; dragging = true; }}
      onpointerup={() => dragging = false}
      onpointercancel={() => dragging = false}
      oninput={changeStart}
    />
    {#if isRange}
      <input
        id="{id}-end"
        class="thumb thumb--end"
        class:on-top={activeThumb === 'end'}
        type="range"
        {min}
        {max}
        {step}
        {disabled}
        value={actualEnd}
        aria-label={`${label} maximum`}
        aria-valuemin={value}
        aria-valuetext={formatted(actualEnd)}
        onfocus={() => activeThumb = 'end'}
        onpointerdown={() => { activeThumb = 'end'; dragging = true; }}
        onpointerup={() => dragging = false}
        onpointercancel={() => dragging = false}
        oninput={changeEnd}
      />
    {/if}
  </div>
  {#if showValueLabels}
    <div class="value-labels" aria-hidden="true">
      {#if isRange && endPercent-startPercent<32}
        <span class="combined" style:left={((startPercent+endPercent)/2)+'%'}>{formatted(value)}{#if value!==actualEnd}–{formatted(actualEnd)}{/if}</span>
      {:else}
        <span style:left={startPercent+'%'}>{formatted(value)}</span>
        {#if isRange}<span style:left={endPercent+'%'}>{formatted(actualEnd)}</span>{/if}
      {/if}
    </div>
  {/if}
  {#if showTickLabels && ticks.length}
    <div class="labels" aria-hidden="true">
      {#each ticks as tick, index}<span class:active={tickActive(tick)}>{tickLabels[index] ?? formatted(tick)}</span>{/each}
    </div>
  {/if}
</div>

<style>
  .field { --slider-color: var(--color-accent); min-width: 0; display: flex; flex-direction: column; gap: var(--slider-label-gap, 5px); }
  .field--blue { --slider-color: #42bcf7; } .field--pink { --slider-color: #ff78b2; } .field--green { --slider-color: #97d434; } .field--white { --slider-color: #c7cbd0; }
  .field--coral { --slider-color:#ff7967; }.field--orange { --slider-color:#ffad22; }.field--teal { --slider-color:#00cda3; }
  .with-value-labels .slider-wrap,.with-value-labels .value-labels { margin-inline:24px; }
  .with-value-labels .visual-thumb,.with-value-labels .fill { transition:none; }
  .header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-4); color: var(--color-text); font-size: var(--font-sm); font-weight: 600; }
  .visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); white-space:nowrap; }
  output { display: inline-flex; gap: 4px; color: var(--color-text-muted); font-weight: 500; font-variant-numeric: tabular-nums; }
  .slider-wrap { position: relative; height: 34px; margin-inline: 9px; overflow: clip; overflow-clip-margin: 12px; }
  .track { position: absolute; inset: 50% 0 auto; height: 4px; transform: translateY(-50%); border-radius: 2px; background: var(--surface-4); }
  .fill { position: absolute; inset: 0; border-radius: inherit; background: var(--slider-color); transform: translateX(var(--fill-start)) scaleX(var(--fill-scale)); transform-origin: left center; transition: transform 180ms cubic-bezier(.2, .8, .2, 1); }
  i { position: absolute; top: 50%; width: 3px; height: 3px; transform: translate(-50%, -50%); border-radius: 50%; background: var(--text-disabled); }
  i.active { background: color-mix(in srgb, var(--slider-color) 45%, white); }
  .track-hit { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; padding: 0; border: 0; border-radius: 0; background: transparent; cursor: pointer; touch-action: none; }
  .visual-thumb { position: absolute; z-index: 2; top: 50%; left: 0; width: 100%; height: 0; transform: translateX(var(--thumb-position)); pointer-events: none; transition: transform 180ms cubic-bezier(.2, .8, .2, 1); }
  .visual-knob { position: absolute; top: 0; left: 0; width: 18px; height: 18px; transform: translate(-50%, -50%); border: 2px solid var(--slider-color); border-radius: 50%; background: var(--slider-color); box-shadow: 0 1px 3px rgb(0 0 0 / .40); transition: transform 120ms ease, box-shadow 120ms ease; }
  .dragging .fill, .dragging .visual-thumb { transition-duration: 55ms; }
  .dragging .visual-thumb--start .visual-knob { transform: translate(-50%, -50%) scale(1.08); }
  .dragging:has(.thumb--end.on-top) .visual-thumb--start .visual-knob { transform: translate(-50%, -50%); }
  .dragging:has(.thumb--end.on-top) .visual-thumb--end .visual-knob { transform: translate(-50%, -50%) scale(1.08); }
  .thumb { position: absolute; z-index: 3; top: 0; left: -12px; width: calc(100% + 24px); height: 34px; margin: 0; padding: 0; appearance: none; -webkit-appearance: none; border: 0; outline: 0; background: transparent; pointer-events: none; }
  .thumb.on-top { z-index: 4; }
  .thumb::-webkit-slider-runnable-track { height: 4px; background: transparent; }
  .thumb::-webkit-slider-thumb { width: 24px; height: 24px; margin-top: -10px; appearance: none; -webkit-appearance: none; border: 0; border-radius: 50%; background: transparent; box-shadow: none; cursor: grab; pointer-events: auto; }
  .thumb::-moz-range-track { height: 4px; border: 0; background: transparent; }
  .thumb::-moz-range-progress { background: transparent; }
  .thumb::-moz-range-thumb { width: 24px; height: 24px; border: 0; border-radius: 50%; background: transparent; box-shadow: none; cursor: grab; pointer-events: auto; }
  .thumb:focus-visible { box-shadow: none; }
  .slider-wrap:has(.thumb--start:focus-visible) .visual-thumb--start .visual-knob, .slider-wrap:has(.thumb--end:focus-visible) .visual-thumb--end .visual-knob { box-shadow: 0 0 0 5px color-mix(in srgb, var(--slider-color) 24%, transparent), 0 1px 3px rgb(0 0 0 / .40); }
  .thumb:active::-webkit-slider-thumb { cursor: grabbing; }
  .thumb:active::-moz-range-thumb { cursor: grabbing; }
  .labels { display: flex; justify-content: space-between; gap: 0; padding-inline: 2px; color: var(--color-text-subtle); font-size: 10px; font-weight: 500; line-height: 1; user-select: none; }
  .labels span { min-width: 14px; text-align: center; }
  .labels span.active { color: var(--slider-color); font-weight: 700; }
  .value-labels { position:relative; height:14px; margin-inline:9px; color:var(--color-text-muted); font-size:11px; line-height:14px; font-variant-numeric:tabular-nums; }.value-labels span { position:absolute; transform:translateX(-50%); white-space:nowrap; }
  .disabled { opacity: .45; }
  .disabled .thumb::-webkit-slider-thumb { cursor: not-allowed; }
  .disabled .thumb::-moz-range-thumb { cursor: not-allowed; }
  @media (max-width: 767px) { .slider-wrap { height: var(--touch-target); } .thumb { height: var(--touch-target); } }
</style>

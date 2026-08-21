<script lang="ts">
  type SliderTone = 'accent' | 'blue' | 'pink' | 'green';
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
    showOutput?: boolean;
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
    showOutput = true,
    disabled = false,
    onchange
  }: Props = $props();

  let activeThumb = $state<'start' | 'end'>('start');
  const isRange = $derived(range || endValue !== undefined);
  const actualEnd = $derived(isRange ? (endValue ?? max) : value);
  const mode = $derived(selection ?? (isRange ? 'between' : 'before'));
  const startPercent = $derived(toPercent(value));
  const endPercent = $derived(toPercent(actualEnd));
  const fillStart = $derived(mode === 'before' ? 0 : startPercent);
  const fillEnd = $derived(mode === 'after' ? 100 : endPercent);
  const stepCount = $derived(Math.max(0, Math.round((max - min) / step)));
  const ticks = $derived(showTicks && stepCount <= 24 ? Array.from({ length: stepCount + 1 }, (_, index) => min + index * step) : []);

  function toPercent(input: number) { return max === min ? 0 : Math.max(0, Math.min(100, ((input - min) / (max - min)) * 100)); }
  function tickActive(tick: number) {
    if (isRange || mode === 'between') return tick >= value && tick <= actualEnd;
    return mode === 'after' ? tick >= value : tick <= value;
  }
  function formatted(input: number) { return `${input}${unit}`; }
  function changeStart(event: Event) {
    const next = Number((event.currentTarget as HTMLInputElement).value);
    value = isRange ? Math.min(next, actualEnd) : next;
    onchange?.(value, isRange ? actualEnd : undefined);
  }
  function changeEnd(event: Event) {
    const next = Number((event.currentTarget as HTMLInputElement).value);
    endValue = Math.max(next, value);
    onchange?.(value, endValue);
  }
</script>

<div class="field field--{tone}" class:disabled role="group" aria-labelledby="{id}-label">
  <div class="header">
    <span id="{id}-label">{label}</span>
    {#if showOutput}<output for={isRange ? `${id}-start ${id}-end` : `${id}-start`}>{formatted(value)}{#if isRange}<span aria-hidden="true">–</span>{formatted(actualEnd)}{/if}</output>{/if}
  </div>
  <div class="slider-wrap" style={`--fill-start:${fillStart}%;--fill-end:${fillEnd}%;`}>
    <div class="track" aria-hidden="true">
      <span class="fill"></span>
      {#each ticks as tick}
        <i class:active={tickActive(tick)} style={`left:${toPercent(tick)}%`}></i>
      {/each}
    </div>
    <input
      id="{id}-start"
      class="thumb thumb--start"
      class:on-top={activeThumb === 'start'}
      type="range"
      {min}
      max={isRange ? actualEnd : max}
      {step}
      {disabled}
      value={value}
      aria-label={isRange ? `${label} minimum` : label}
      aria-valuetext={formatted(value)}
      onfocus={() => activeThumb = 'start'}
      oninput={changeStart}
    />
    {#if isRange}
      <input
        id="{id}-end"
        class="thumb thumb--end"
        class:on-top={activeThumb === 'end'}
        type="range"
        min={value}
        {max}
        {step}
        {disabled}
        value={actualEnd}
        aria-label={`${label} maximum`}
        aria-valuetext={formatted(actualEnd)}
        onfocus={() => activeThumb = 'end'}
        oninput={changeEnd}
      />
    {/if}
  </div>
  {#if showTickLabels && ticks.length}
    <div class="labels" aria-hidden="true">
      {#each ticks as tick, index}<span class:active={tickActive(tick)}>{tickLabels[index] ?? formatted(tick)}</span>{/each}
    </div>
  {/if}
</div>

<style>
  .field { --slider-color: var(--color-accent); min-width: 0; display: flex; flex-direction: column; gap: 5px; }
  .field--blue { --slider-color: #42bcf7; } .field--pink { --slider-color: #ff78b2; } .field--green { --slider-color: #97d434; }
  .header { display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-4); color: var(--color-text); font-size: var(--font-sm); font-weight: 600; }
  output { display: inline-flex; gap: 4px; color: var(--color-text-muted); font-weight: 500; font-variant-numeric: tabular-nums; }
  .slider-wrap { position: relative; height: 34px; margin-inline: 9px; }
  .track { position: absolute; inset: 50% 0 auto; height: 4px; transform: translateY(-50%); border-radius: 2px; background: var(--surface-4); }
  .fill { position: absolute; top: 0; bottom: 0; left: var(--fill-start); right: calc(100% - var(--fill-end)); border-radius: inherit; background: var(--slider-color); }
  i { position: absolute; top: 50%; width: 3px; height: 3px; transform: translate(-50%, -50%); border-radius: 50%; background: var(--text-disabled); }
  i.active { background: color-mix(in srgb, var(--slider-color) 45%, white); }
  .thumb { position: absolute; z-index: 1; top: 0; left: -9px; width: calc(100% + 18px); height: 34px; margin: 0; padding: 0; appearance: none; -webkit-appearance: none; border: 0; outline: 0; background: transparent; pointer-events: none; }
  .thumb.on-top { z-index: 2; }
  .thumb::-webkit-slider-runnable-track { height: 4px; background: transparent; }
  .thumb::-webkit-slider-thumb { width: 18px; height: 18px; margin-top: -7px; appearance: none; -webkit-appearance: none; border: 2px solid var(--slider-color); border-radius: 50%; background: var(--slider-color); box-shadow: 0 1px 3px rgb(0 0 0 / .40); cursor: grab; pointer-events: auto; }
  .thumb::-moz-range-track { height: 4px; border: 0; background: transparent; }
  .thumb::-moz-range-progress { background: transparent; }
  .thumb::-moz-range-thumb { width: 14px; height: 14px; border: 2px solid var(--slider-color); border-radius: 50%; background: var(--slider-color); box-shadow: 0 1px 3px rgb(0 0 0 / .40); cursor: grab; pointer-events: auto; }
  .thumb:focus-visible { box-shadow: none; }
  .thumb:focus-visible::-webkit-slider-thumb { box-shadow: 0 0 0 5px color-mix(in srgb, var(--slider-color) 24%, transparent), 0 1px 3px rgb(0 0 0 / .40); }
  .thumb:focus-visible::-moz-range-thumb { box-shadow: 0 0 0 5px color-mix(in srgb, var(--slider-color) 24%, transparent), 0 1px 3px rgb(0 0 0 / .40); }
  .thumb:active::-webkit-slider-thumb { cursor: grabbing; }
  .thumb:active::-moz-range-thumb { cursor: grabbing; }
  .labels { display: flex; justify-content: space-between; gap: 0; padding-inline: 2px; color: var(--color-text-subtle); font-size: 10px; font-weight: 500; line-height: 1; user-select: none; }
  .labels span { min-width: 14px; text-align: center; }
  .labels span.active { color: var(--slider-color); font-weight: 700; }
  .disabled { opacity: .45; }
  .disabled .thumb::-webkit-slider-thumb { cursor: not-allowed; }
  .disabled .thumb::-moz-range-thumb { cursor: not-allowed; }
  @media (max-width: 767px) { .slider-wrap { height: var(--touch-target); } .thumb { height: var(--touch-target); } }
</style>

<script lang="ts">
  import Icon from './Icon.svelte';
  import type { TimelineEventData } from './timeline-types';
  interface Props { event: TimelineEventData; planned?: boolean; onopen?: (event: TimelineEventData) => void; onplan?: (event: TimelineEventData, planned: boolean) => void; }
  let { event, planned = $bindable(false), onopen, onplan }: Props = $props();
  function togglePlan(clickEvent: MouseEvent) { clickEvent.stopPropagation(); planned = !planned; onplan?.(event, planned); }
</script>

<article class="event-card tone-{event.tone ?? 'default'}" class:has-media={Boolean(event.image)}>
  <button type="button" class="open-action" aria-label={`Open details for ${event.title}`} onclick={() => onopen?.(event)}></button>
  {#if event.image}<div class="event-media"><img src={event.image} alt={event.title} loading="lazy" decoding="async"/></div>{/if}
  <div class="event-body">
    <div class="metadata"><span>{event.typeLabel}</span>{#if event.rerun}<b>Rerun</b>{/if}{#if event.predicted}<b>Predicted</b>{/if}</div>
    <h3>{event.title}</h3>
    <div class="schedule"><Icon name="calendar" size={13}/><time>{event.dateLabel}</time>{#if event.context}<span>{event.context}</span>{/if}<i>Info <Icon name="chevron" size={12}/></i></div>
    <div class="event-footer">
      {#if event.raceLines?.length}<div class="race-lines">{#each event.raceLines as line}<span>{line}</span>{/each}</div>{/if}
      {#if event.pickups?.length}<div class="pickups" aria-label="Featured pickups">{#each event.pickups as pickup}<span class:character={pickup.kind === 'character'} title={pickup.name}><img src={pickup.image} alt={pickup.name} loading="lazy" decoding="async"/></span>{/each}{#if event.overflowPickups}<b>+{event.overflowPickups}</b>{/if}</div>{/if}
      {#if event.rewards?.length}<div class="rewards" aria-label="Rewards">{#each event.rewards as reward}<span title={reward.label}>{#if reward.icon}<img src={reward.icon} alt="" loading="lazy" decoding="async"/>{/if}<b>{reward.amount}</b></span>{/each}</div>{/if}
      {#if event.canPlan}<button type="button" class:planned class="plan" aria-pressed={planned} onclick={togglePlan}><Icon name={planned ? 'check' : 'add'} size={13}/>{planned ? 'Added' : 'Plan'}</button>{/if}
    </div>
  </div>
</article>

<style>
  .event-card { --event-accent: var(--accent-primary); position: relative; min-width: 0; overflow: hidden; isolation: isolate; border: 1px solid var(--border-primary); border-radius: 0 0 var(--radius-sm) var(--radius-sm); background: var(--surface-1); box-shadow: 0 1px 3px rgb(0 0 0 / .18); color: var(--color-text); container: timeline-card / inline-size; }
  .tone-support { --event-accent: var(--accent-purple); }.tone-story { --event-accent: var(--accent-warning); }.tone-legend { --event-accent: var(--accent-pink); }.tone-campaign { --event-accent: #4db6ac; }.tone-scenario { --event-accent: var(--accent-secondary); }
  .event-card:hover { border-color: color-mix(in srgb, var(--event-accent) 58%, transparent); background: var(--surface-2); }.event-card:focus-within { border-color: var(--event-accent); }
  .open-action { position: absolute; z-index: 1; inset: 0; width: 100%; padding: 0; border: 0; background: transparent; cursor: pointer; }.open-action:focus-visible { outline: 2px solid var(--event-accent); outline-offset: -2px; }
  .event-media, .event-body { position: relative; z-index: 2; pointer-events: none; }.event-media { height: 70px; overflow: hidden; border-bottom: 1px solid var(--border-subtle); }.event-media img { width: 100%; height: 100%; object-fit: contain; }
  .event-body { min-width: 0; display: grid; gap: 3px; padding: 6px 9px; background: linear-gradient(180deg, color-mix(in srgb, var(--event-accent) 7%, transparent), transparent 25px); }
  .metadata { min-width: 0; display: flex; align-items: center; gap: 0; overflow: hidden; color: var(--event-accent); font-size: 10px; font-weight: 700; white-space: nowrap; }.metadata b { color: var(--color-text-muted); font-size: 9px; }.metadata b::before { margin: 0 5px; color: var(--color-text-subtle); content: '·'; }.metadata b:first-of-type { color: var(--accent-warning); }
  h3 { min-width: 0; margin: 0; overflow: hidden; font-size: 13px; line-height: 1.25; text-overflow: ellipsis; white-space: nowrap; }
  .schedule { min-width: 0; display: flex; align-items: center; gap: 4px; overflow: hidden; color: var(--event-accent); }.schedule time { flex: 0 0 auto; color: var(--color-text); font-size: 10px; font-weight: 700; }.schedule > span { min-width: 0; overflow: hidden; color: var(--color-text-subtle); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.schedule > span::before { margin-right: 4px; color: var(--event-accent); content: '·'; }.schedule i { margin-left: auto; display: inline-flex; align-items: center; color: var(--color-text-muted); font-size: 9px; font-style: normal; }
  .event-footer { min-width: 0; min-height: 44px; display: flex; align-items: end; gap: 6px; padding-top: 4px; }
  .pickups { min-width: 0; display: flex; align-items: end; gap: 4px; overflow: hidden; }.pickups > span { width: 40px; height: 40px; flex: 0 0 40px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--event-accent) 38%, transparent); border-radius: 3px; }.pickups > span.character { width: 42px; height: 44px; flex-basis: 42px; overflow: visible; border: 0; }.pickups img { width: 100%; height: 100%; object-fit: cover; }.pickups .character img { object-fit: contain; }.pickups > b { align-self: center; color: var(--color-text-subtle); font-size: 10px; }
  .rewards { min-width: 0; display: flex; align-items: center; gap: 5px; overflow: hidden; }.rewards > span { display: inline-flex; align-items: center; gap: 2px; color: var(--color-text-muted); font-size: 9px; }.rewards img { width: 22px; height: 22px; object-fit: contain; }.rewards b { font-weight: 700; }
  .race-lines { min-width: 0; flex: 1; display: grid; }.race-lines span { overflow: hidden; color: var(--color-text-muted); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.race-lines span:first-child { color: var(--color-text); font-size: 10px; font-weight: 700; }
  .plan { min-width: 64px; min-height: 28px; margin-left: auto; pointer-events: auto; display: inline-flex; align-items: center; justify-content: center; gap: 3px; border: 1px solid color-mix(in srgb, var(--event-accent) 40%, transparent); border-radius: var(--radius-xs); background: color-mix(in srgb, var(--event-accent) 9%, transparent); color: var(--event-accent); cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; }.plan:hover { background: color-mix(in srgb, var(--event-accent) 17%, transparent); }.plan.planned { border-color: color-mix(in srgb, var(--accent-secondary) 44%, transparent); background: rgb(129 199 132 / .09); color: var(--accent-secondary); }
  @container timeline-card (max-width: 340px) { .event-media { height: 60px; }.schedule i { display: none; }.event-footer { flex-wrap: wrap; }.rewards { order: 3; flex: 1 1 100%; padding-top: 3px; border-top: 1px solid var(--border-subtle); }.plan { min-height: 36px; } }
</style>

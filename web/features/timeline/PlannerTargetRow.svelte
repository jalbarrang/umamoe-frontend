<script lang="ts">
  import { itemIconPath } from '../../catalog/item-icons';
  import type { TimelineRecord } from './timeline-repository';
  import { availableCrystals, findGacha, type PlannerDataBundle, type PlannerTarget, type TargetProjection } from '../../domain/timeline/carat-planner';
  import type { TimelinePickupCatalog } from '../../domain/timeline/timeline-pickups';
  import PlannerTargetGoals from './PlannerTargetGoals.svelte';
  import Button from '../../ui/Button.svelte';
  import Checkbox from '../../ui/Checkbox.svelte';
  import Icon from '../../ui/Icon.svelte';
  import SelectField from '../../ui/SelectField.svelte';
  import TextField from '../../ui/TextField.svelte';
  import InspectPopover from '../../ui/InspectPopover.svelte';

  interface Props {
    target: PlannerTarget;
    past?: boolean;
    projection?: TargetProjection;
    resources: PlannerDataBundle;
    events: TimelineRecord[];
    catalog: TimelinePickupCatalog;
    pickupCopyMemory: Map<string, number>;
    onupdate: (mutator: (target: PlannerTarget) => void) => void;
    onremove: () => void;
  }
  let { target, past = false, projection, resources, events, catalog, pickupCopyMemory, onupdate, onremove }: Props = $props();

  const ticketKind = $derived((findGacha(target, resources)?.ticket_currency ?? (target.bannerKind === 'support' ? 'support_ticket' : 'uma_ticket')) === 'support_ticket' ? 'support' : 'uma');
  const ticketCount = $derived(projection?.balanceBefore[ticketKind === 'support' ? 'supportTickets' : 'umaTickets'] ?? 0);
  const ticketLabel = $derived(`${ticketCount} ${ticketKind === 'support' ? 'support' : 'Trainee'} tickets available at pull; ${projection?.ticketPulls ? `${projection.ticketPulls} used and ${ticketCount - projection.ticketPulls} remaining` : 'none used'}`);
  const dateFormatter = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  function dateLabel(value?: string): string { const date = new Date(`${value}T00:00:00Z`); return Number.isFinite(date.getTime()) ? dateFormatter.format(date) : 'Unknown'; }
  function setPulls(pulls: number): void { onupdate(value => value.plannedPulls = Math.max(0, Math.min(5000, Math.trunc(pulls) || 0))); }

</script>

<article class="target" class:past data-target-id={target.id}>
  <div class="target-title">
    {#if target.imagePath}<img src={target.imagePath} alt=""/>{/if}
    <div><strong>{target.title}</strong><small class="date"><Icon name="calendar" size={13}/>{dateLabel(target.bannerStart)} – {dateLabel(target.bannerEnd ?? target.bannerStart)}</small>
      {#if projection}<div class="at-pull" aria-label={`At pull date: ${ticketLabel}`}><small>At pull</small><span title={ticketLabel}><img src={itemIconPath(ticketKind === 'support' ? 111 : 41)} width="18" height="18" alt=""/><b>{ticketCount}</b>{#if projection.ticketPulls}<em>→ {ticketCount - projection.ticketPulls}</em>{/if}</span>{#if target.bannerKind === 'support'}{#each ['rainbow', 'gold'] as kind}<span title={`${kind === 'rainbow' ? 'Rainbow' : 'Gold'} Uncap Crystals available at pull`}><img src={itemIconPath(kind === 'rainbow' ? 144 : 145)} width="18" height="18" alt=""/><b>{kind === 'rainbow' ? availableCrystals(projection.balanceBefore.rainbowFullCrystals, projection.balanceBefore.rainbowCrystals) : availableCrystals(projection.balanceBefore.goldFullCrystals, projection.balanceBefore.goldCrystals)}</b></span>{/each}{/if}</div>{/if}
    </div>
  </div>
  <div class="target-controls">
    <div class="pull-count"><span>Pulls</span><div class="stepper" role="group" aria-label="Planned pulls"><Button variant="secondary" size="sm" ariaLabel="Add 100 pulls" disabled={target.plannedPulls >= 5000} onclick={() => setPulls(target.plannedPulls + 100)}>+100</Button><Button variant="secondary" size="sm" ariaLabel="Add 10 pulls" disabled={target.plannedPulls >= 5000} onclick={() => setPulls(target.plannedPulls + 10)}>+10</Button><TextField id={`pulls-${target.id}`} label="Planned pulls" hideLabel type="number" min={0} max={5000} step={10} value={String(target.plannedPulls)} oninput={event => setPulls(Number((event.currentTarget as HTMLInputElement).value))}/><Button variant="secondary" size="sm" ariaLabel="Remove 10 pulls" disabled={target.plannedPulls <= 0} onclick={() => setPulls(target.plannedPulls - 10)}>−10</Button><Button variant="secondary" size="sm" ariaLabel="Remove 100 pulls" disabled={target.plannedPulls <= 0} onclick={() => setPulls(target.plannedPulls - 100)}>−100</Button></div></div>
    {#if target.bannerKind === 'support'}<div class="crystal-plan" role="group" aria-label="Uncap Crystals to use on this banner"><span><strong>Uncap crystals</strong><small>Replace extra copies after the first</small></span><div class="crystal-controls">{#each ['rainbow', 'gold'] as kind}{@const name = kind === 'rainbow' ? 'Rainbow' : 'Gold'}{@const key = kind === 'rainbow' ? 'rainbowCrystalsPlanned' : 'goldCrystalsPlanned'}<div class="crystal-control"><span><img src={itemIconPath(kind === 'rainbow' ? 144 : 145)} width="24" height="24" alt=""/><span><strong>{name}</strong><small>{kind === 'rainbow' ? 'SSR' : 'SR'} cards</small></span></span><div class="crystal-stepper" role="group" aria-label={`${name} Uncap Crystals to use on this banner`}><Button variant="ghost" size="sm" icon="minus" ariaLabel={`Use one fewer ${name} Uncap Crystal`} disabled={!target[key]} onclick={() => onupdate(value => value[key] = Math.max(0, (value[key] ?? 0) - 1))}/><output aria-label={`${name} Uncap Crystals planned`}>{target[key] ?? 0}</output><Button variant="ghost" size="sm" icon="add" ariaLabel={`Use one more ${name} Uncap Crystal`} disabled={(target[key] ?? 0) >= 20} onclick={() => onupdate(value => value[key] = Math.min(20, (value[key] ?? 0) + 1))}/></div></div>{/each}</div></div>{/if}
    <InspectPopover label="Target options" align="end">{#snippet trigger()}<span class="options-trigger"><Icon name="tune" size={16}/></span>{/snippet}<div class="target-options"><strong>Target options</strong><small>The recommended defaults use tickets first and pull at banner end.</small><SelectField id={`timing-${target.id}`} label="Pull on" options={[{value:'start',label:'Banner start'},{value:'end',label:'Banner end'},{value:'custom',label:'Custom date'}]} value={target.pullTiming} onchange={(value)=>onupdate((item)=>item.pullTiming=value as PlannerTarget['pullTiming'])}/>{#if target.pullTiming === 'custom'}<TextField id={`pull-date-${target.id}`} label="Pull date" type="date" value={target.customPullDate ?? ''} oninput={event => onupdate(value => value.customPullDate = (event.currentTarget as HTMLInputElement).value)}/>{/if}<Checkbox id={`tickets-${target.id}`} label="Use tickets first" checked={target.useTickets} onchange={(checked)=>onupdate((value)=>value.useTickets=checked)}/><Checkbox id={`paid-${target.id}`} label="Allow paid Carats" checked={target.allowPaidJewels} onchange={(checked)=>onupdate((value)=>value.allowPaidJewels=checked)}/>{#if target.useTickets}<TextField id={`ticket-limit-${target.id}`} label="Ticket limit" type="number" min={0} placeholder="No limit" value={String(target.ticketLimit??'')} oninput={(event)=>onupdate((value)=>value.ticketLimit=(event.currentTarget as HTMLInputElement).value===''?undefined:Math.max(0,Number((event.currentTarget as HTMLInputElement).value)||0))}/>{/if}</div></InspectPopover>
    <Button variant="secondary" size="sm" icon="trash" ariaLabel={`Remove ${target.title}`} onclick={onremove}/>
  </div>
  {#if past}<div class="past-note" role="note"><Icon name="timeline" size={16}/><span><strong>Before plan start</strong><small>Kept for editing, but excluded from this projection.</small></span></div>{/if}
  {#if !past && projection}<PlannerTargetGoals {target} {projection} {resources} {events} {catalog} {pickupCopyMemory} {onupdate}/>{/if}
</article>

<style>
  .target{display:grid;grid-template-columns:minmax(0,1fr) auto;border-bottom:1px solid var(--border-subtle);background:var(--surface-1)}
  .target.past{color:var(--text-secondary)}
  .target-title{min-width:0;display:flex;align-items:center;gap:10px;padding:10px}
  .target-title>img{width:112px;height:48px;object-fit:cover}
  .target-title>div{min-width:0;display:grid;gap:4px}
  .target-title strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .date{display:flex;align-items:center;gap:5px;color:var(--text-secondary);font-size:10px}
  .date :global(svg){color:var(--accent-primary);flex:none}
  .at-pull{display:flex;align-items:center;gap:5px;font-size:10px}
  .at-pull>small{text-transform:uppercase;color:var(--text-secondary);font-weight:700;font-size:9px}
  .at-pull>span{display:inline-flex;align-items:center;gap:3px;padding:1px 3px;border-radius:var(--radius-sm);background:var(--surface-2)}
  .at-pull img{object-fit:contain}.at-pull em{font-style:normal;color:var(--text-secondary)}
  .target-controls{display:flex;align-items:end;gap:8px;padding:8px 10px;border-left:1px solid var(--border-subtle);background:color-mix(in srgb,var(--surface-2) 58%,transparent)}
  .pull-count{min-width:0;display:grid;gap:4px}
  .pull-count>span,.target-options>small{color:var(--text-secondary);font-size:10px}
  .stepper{display:grid;grid-template-columns:48px 42px minmax(80px,92px) 42px 48px;gap:3px;align-items:stretch}
  .stepper :global(.ui-button){min-width:0;min-height:var(--control-height);padding-inline:4px}

  .target-controls>:global(.ui-button){width:36px;padding:0}
  .options-trigger{width:36px;height:36px;display:grid;place-items:center;border:1px solid var(--factor-field-border);border-radius:var(--radius-sm);color:var(--text-secondary);background:var(--factor-field-bg)}
  .target-options{display:grid;gap:8px}
  .crystal-plan{display:grid;gap:5px}.crystal-plan>span{display:grid;font-size:10px}
  .crystal-plan small{color:var(--text-secondary);font-size:9px}
  .crystal-controls{display:flex;gap:8px}.crystal-control{display:flex;align-items:center;gap:6px}
  .crystal-control>span{display:flex;align-items:center;gap:4px}.crystal-control>span>span{display:grid;font-size:10px}
  .crystal-control img{object-fit:contain}
  .crystal-stepper{display:flex;align-items:center;border:1px solid var(--factor-field-border);border-radius:var(--radius-sm)}
  .crystal-stepper :global(.ui-button){width:28px;min-height:34px;padding:0}.crystal-stepper output{min-width:20px;text-align:center;font-weight:700}
  .past-note{grid-column:1/-1;display:flex;align-items:center;gap:8px;padding:8px 10px;border-top:1px solid var(--border-subtle);color:var(--text-secondary)}
  .past-note span{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.past-note small{font-size:10px}
  @media(max-width:1250px){.target-controls:has(.crystal-plan){flex-wrap:wrap;max-width:400px}.crystal-plan{order:1;width:100%}.crystal-controls{justify-content:space-between}}
  @media(max-width:767px){
    .target{grid-template-columns:minmax(0,1fr);margin-bottom:8px;border:1px solid var(--border-primary);border-radius:var(--radius-md)}
    .target-title{padding:8px 6px}.target-title>img{width:84px;height:40px}.target-title strong{white-space:normal}
    .target-controls,.target-controls:has(.crystal-plan){max-width:none;border-left:0;padding:6px;gap:6px}
    .pull-count{flex:1}.stepper{display:block}.stepper :global(.ui-button){display:none}.stepper :global(.field){--control-height:var(--touch-target)}

    .options-trigger,.target-controls>:global(.ui-button){width:var(--touch-target);height:var(--touch-target)}
    .crystal-stepper :global(.ui-button){min-width:var(--touch-target);min-height:var(--touch-target)}
    .crystal-controls{flex-wrap:wrap}.crystal-control{flex:1;justify-content:space-between}
    .past-note{padding:8px 6px}.past-note span{display:grid;gap:3px}
  }
</style>

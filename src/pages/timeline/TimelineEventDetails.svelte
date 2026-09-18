<script lang="ts">
  import { itemIconPath } from '@/lib/catalog/item-icons';
  import Dialog from '@/components/Dialog.svelte';
  import Button from '@/components/Button.svelte';
  import Banner from '@/components/Banner.svelte';
  import Icon from '@/components/Icon.svelte';
  import Spinner from '@/components/Spinner.svelte';
  import type { IconName } from '@/components/icon-types';
  import { contentUrl, sanitizeContentHtml } from '@/lib/content-html';
  import { buildTimelinePrediction } from '@/lib/timeline/timeline-prediction';
  import type { TimelineCalculation } from '@/lib/timeline/timeline-prediction-types';
  import { timelineRaceEventFacts } from '@/lib/timeline/timeline-race-facts';
  import { timelineDisplayTitle, timelinePickup, type TimelinePickupCatalog } from '@/lib/timeline/timeline-pickups';
  import type { PlannerGachaEntry } from '@/lib/timeline/carat-planner';
  import type { TimelineRewardItem, TimelineRewardSummary } from '@/lib/timeline/timeline-reward-summary';
  import type { TimelineRecord } from './timeline-repository';

  interface Props {
    event: TimelineRecord; catalog: TimelinePickupCatalog; calculation: TimelineCalculation | null;
    rewardSummary?: TimelineRewardSummary; rewardsLoading: boolean; rewardsError: string;
    gacha?: PlannerGachaEntry; ratesLoading: boolean; ratesError: string;
    planned: boolean; onplan: (event: TimelineRecord, planned: boolean) => void; onclose: () => void;
    onretryrates: () => void; onretryrewards: () => void;
  }
  let { event, catalog, calculation, rewardSummary, rewardsLoading, rewardsError, gacha, ratesLoading, ratesError, planned, onplan, onclose, onretryrates, onretryrewards }: Props = $props();
  const title = $derived(timelineDisplayTitle(event));
  const facts = $derived(timelineRaceEventFacts(event));
  const html = $derived(sanitizeContentHtml(event.description ?? ''));
  const prediction = $derived(buildTimelinePrediction(event, calculation));
  const banner = $derived(['character_banner', 'support_card_banner'].includes(event.eventType) && Boolean(event.canPlan));
  const canPlan = $derived(Boolean(event.canPlan || event.plannerRewardAvailable || (rewardSummary && rewardSummary.mode !== 'placement')));
  const highlight = $derived(['champions_meeting', 'league_of_heroes', 'legend_race', 'masters_challenge', 'trainer_skills_test'].includes(event.eventType));
  const dateLabel = $derived(event.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }));
  const endLabel = $derived(event.estimatedEndDate && event.estimatedEndDate > event.date ? event.estimatedEndDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '');
  const freePullSource = $derived(contentUrl(gacha?.free_pulls_source_url));
  const formatRate = (rate: number) => new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(rate);
  const rarityRate = $derived([...(gacha?.rarity_rates ?? [])].sort((a, b) => b.rarity - a.rarity)[0]?.rate);
  const rateSummary = $derived([Number.isFinite(rarityRate) ? `${event.eventType === 'support_card_banner' ? 'SSR pool' : '3★ pool'} ${formatRate(rarityRate!)}` : '', gacha?.rates_confidence === 'inferred_standard' ? 'Standard rates (estimated)' : 'Published banner rates'].filter(Boolean).join(' · '));
  const pickups = $derived.by(() => {
    const kind = event.eventType === 'support_card_banner' ? 'support' : 'character';
    const rates = gacha?.featured_pickups?.length ? gacha.featured_pickups : gacha?.pickups ?? [];
    const ordered = kind === 'support' ? [...rates].sort((a, b) => b.pickup_id - a.pickup_id) : rates;
    if (ordered.length) return ordered.map(rate => ({ pickup: event.pickups?.find(p => p.id === String(rate.pickup_id)) ?? timelinePickup(rate.pickup_id, catalog, rate.label, kind), rate: Number.isFinite(rate.rate) ? formatRate(rate.rate) + ' per pull' : '' }));
    return (event.pickups ?? []).filter(p => p.kind === kind).map(pickup => ({ pickup, rate: '' }));
  });
  const rewards = $derived.by(() => {
    const items: TimelineRewardItem[] = [...(rewardSummary?.items ?? [])];
    const free = Math.max(0, Number(gacha?.free_pulls) || 0);
    if (free > 0 && !items.some(item => item.kind === 'free_pulls')) items.push({ key: 'gacha-free-pulls', kind: 'free_pulls', amount: free, label: `${free} free pulls`, countLabel: String(free), iconPath: itemIconPath(41) });
    return items;
  });
  const groups = $derived([
    { label: 'Model', icon: 'lineage' as IconName, metrics: prediction?.metrics.filter(m => m.label === 'Source') ?? [] },
    { label: 'Schedule', icon: 'timeline' as IconName, metrics: prediction?.metrics.filter(m => ['Schedule shift', 'Catch-up rate', 'Global anchor', 'JP anchor'].includes(m.label)) ?? [] },
    { label: 'Calendar fit', icon: 'calendar' as IconName, metrics: prediction?.metrics.filter(m => !['Source', 'Schedule shift', 'Catch-up rate', 'Global anchor', 'JP anchor'].includes(m.label)) ?? [] }
  ].filter(group => group.metrics.length));
  function hideImage(event: Event) { (event.currentTarget as HTMLImageElement).hidden = true; }
</script>

<Dialog open {title} description={dateLabel + (endLabel ? ' – ' + endLabel : '')} maxWidth="560px" maxHeight="82dvh" mobileMaxHeight="88dvh" contentPadding="9px 12px 10px" mobileContentPadding="10px 12px 12px" {onclose}>
  {#snippet eyebrow()}<div class="metadata"><Icon name={event.eventType === 'character_banner' ? 'user' : event.eventType === 'support_card_banner' ? 'grid' : 'calendar'} size={15}/>{event.typeLabel}{event.gachaLabel ? ' · ' + event.gachaLabel : ''}{event.rerun ? ' · Rerun' : ''}{event.predicted ? ' · Predicted' : ''}{#if prediction?.fitLabel}<span>{prediction.fitLabel} date fit</span>{/if}</div>{/snippet}
  <div class="event-details" data-event-type={event.eventType}>
    {#if event.image}<img class="banner" src={event.image} alt={title} width="512" height="125" decoding="async" onerror={hideImage}/>{/if}
    {#if banner}
      <section class="detail-section">
        <div class="section-heading"><h3><Icon name="chart" size={16}/>Rate-up rates</h3><span class="rates-status">{#if ratesLoading}<Spinner label="Loading banner rates" size={14}/><span>Loading rates…</span>{:else if gacha}{rateSummary}{/if}</span></div>
        <div class="pickups rates">{#each pickups as { pickup, rate } (pickup.id)}<a href={event.newsUrl} target="_blank" rel="noopener noreferrer"><img src={pickup.image} alt={pickup.name} width="36" height="36" onerror={hideImage}/><span><strong>{pickup.name}</strong><small>{pickup.subLabel}</small><em>{rate || (ratesLoading ? 'Loading rate…' : 'Rate unavailable')}</em></span></a>{/each}</div>
        {#if ratesError}<Banner title="Banner rates could not be loaded" tone="danger"><Button variant="secondary" size="sm" icon="refresh" onclick={onretryrates}>Retry rates</Button></Banner>{:else if !ratesLoading && (!gacha || !pickups.some(pickup => pickup.rate))}<p class="resource-status">Published rates are not available for this banner yet.</p>{/if}
      </section>
    {/if}
    {#if rewardsLoading}<p class="resource-status"><Spinner label="Loading event rewards" size={14}/> Loading event rewards…</p>{:else if rewardsError}<Banner title="Event rewards could not be loaded" tone="danger"><Button variant="secondary" size="sm" icon="refresh" onclick={onretryrewards}>Retry rewards</Button></Banner>{/if}
    {#if rewards.length || rewardSummary?.variable}
      <section class="detail-section">
        <div class="section-heading"><h3><Icon name="star" size={16}/>Event rewards</h3><span>Available with this event</span></div>
        {#if rewardSummary?.previewItems.length}
          <div class="reward-outcomes"><header><strong>{rewardSummary.outcomeHeading}</strong><small>{rewardSummary.previewLabel}</small></header><p>{rewardSummary.outcomeDescription}</p><div class="reward-preview" aria-label={rewardSummary.previewLabel}>{#each rewardSummary.previewItems as item}<span title={item.label}>{#if item.iconPath}<img src={item.iconPath} alt="" width="22" height="22" onerror={hideImage}/>{:else}<Icon name="user" size={14}/>{/if}<b>{item.countLabel}</b>{#if ['rainbow-crystal', 'gold-crystal'].includes(item.key)} shards{/if}</span>{/each}</div></div>
        {:else if rewardSummary?.variable}<p class="resource-status">Reward tiers exist for this event, but a total or range is not available in the loaded resource.</p>{/if}
        <div class="reward-list">{#each rewards as reward (reward.key)}<div title={reward.label} aria-label={reward.label}><img src={reward.kind === 'free_pulls' && event.eventType === 'support_card_banner' ? itemIconPath(111) : reward.iconPath} alt="" width="30" height="30" onerror={hideImage}/><strong>{reward.kind === 'free_pulls' ? reward.amount + '×' : reward.countLabel}</strong>{#if ['rainbow_crystal', 'gold_crystal'].includes(reward.kind)} shards{/if}</div>{/each}</div>
      </section>
    {/if}
    {#if facts.length}<section class="detail-section"><div class="section-heading"><h3><Icon name="race" size={16}/>Race details</h3></div><dl class="facts">{#each facts as fact}<div><Icon name={fact.label === 'Course' ? 'race' : fact.label === 'Conditions' ? 'sun' : 'timeline'} size={16}/><dt>{fact.label}</dt><dd><strong>{fact.primary}</strong>{#if fact.secondary}<span>{fact.secondary}</span>{/if}</dd></div>{/each}</dl></section>{/if}
    {#if html}<section class="detail-section description" class:highlight><div class="section-heading">{#if highlight}<h3><Icon name="info" size={16}/>Event information</h3>{/if}</div><div class="description-scroll">{@html html}</div>{#if /(?:\.\.\.|…)\s*(?:<[^>]+>\s*)*$/.test(event.description ?? '') && event.newsUrl}<a class="full-article" href={event.newsUrl} target="_blank" rel="noopener noreferrer">Full article <Icon name="external" size={12}/></a>{/if}</section>{/if}
    {#if !banner}{#each ['character', 'support'] as kind}{@const items = event.pickups?.filter(p => p.kind === kind) ?? []}{#if items.length}<section class="detail-section"><div class="section-heading"><h3><Icon name={kind === 'character' ? 'user' : 'grid'} size={16}/>{kind === 'character' ? 'Characters' : 'Support cards'}</h3></div><div class="pickups">{#each items as item (item.id)}<a href={event.newsUrl} target="_blank" rel="noopener noreferrer"><img src={item.image} alt={item.name} width="48" height="50" onerror={hideImage}/><span><strong>{item.name}</strong><small>{item.subLabel}</small></span></a>{/each}</div></section>{/if}{/each}{/if}
    {#if prediction}
      <section class="detail-section prediction"><div class="section-heading"><h3><Icon name="calendar" size={16}/>{event.predicted ? 'Date prediction' : 'Date source'}</h3></div><p>{prediction.subtitle}</p>
        <div class="current-prediction"><span><small>Current estimate</small><strong>{dateLabel}</strong></span><b>{prediction.fitLabel || 'Estimated'}</b></div>
        <div class="prediction-factors">{#each groups as group}<div><span class="factor-label"><Icon name={group.icon} size={14}/>{group.label}</span><dl>{#each group.metrics as metric}<div><dt>{metric.label}</dt><dd>{metric.value}</dd></div>{/each}</dl></div>{/each}</div>
        {#if prediction.alternatives.length}<div class="alternatives"><h4>Alternative date fit</h4>{#each prediction.alternatives as alternative}<div><strong>{alternative.label}</strong><small>{alternative.reason}</small><span class="fit-track" aria-hidden="true"><i style:width={alternative.fitScore * 100 + '%'}></i></span><b>{alternative.probabilityLabel}</b></div>{/each}</div>{/if}
      </section>
    {/if}
  </div>
  {#snippet actions()}
    <div class="actions">
      <nav aria-label="Event sources">{#if event.newsUrl}<a href={event.newsUrl} target="_blank" rel="noopener noreferrer">News post <Icon name="external" size={13}/></a>{/if}{#if freePullSource && freePullSource !== event.newsUrl}<a href={freePullSource} target="_blank" rel="noopener noreferrer">Free-pull source <Icon name="external" size={13}/></a>{/if}{#if event.gametoraUrl}<a href={event.gametoraUrl} target="_blank" rel="noopener noreferrer">GameTora <Icon name="external" size={13}/></a>{/if}</nav>
      {#if canPlan}<div class:planned><Button size="sm" variant={planned ? 'secondary' : 'primary'} icon={planned ? 'minus' : 'add'} ariaPressed={planned} onclick={() => onplan({ ...event, plannerRewardAvailable: event.plannerRewardAvailable || Boolean(rewardSummary && rewardSummary.mode !== 'placement') }, !planned)}>{planned ? 'Remove from planner' : 'Add to planner'}</Button></div>{/if}
    </div>
  {/snippet}
</Dialog>

<style>
  .rates-status{display:flex;align-items:center;gap:6px}
  .metadata{display:flex;align-items:center;flex-wrap:wrap;gap:5px;color:var(--text-muted);font-size:10px;font-weight:700;text-transform:uppercase}.metadata>span{padding-left:6px;border-left:1px solid var(--border-subtle);color:var(--accent-secondary)}.metadata :global(svg){color:var(--accent-primary)}
  .event-details{min-width:0;font-size:12px}.banner{display:block;width:100%;height:auto;aspect-ratio:512/125;object-fit:contain;border:1px solid var(--border-subtle);border-radius:4px;margin-bottom:8px;background:var(--surface-0)}
  .detail-section+.detail-section{margin-top:8px;padding-top:8px;border-top:1px solid var(--border-subtle)}.section-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 10px;margin-bottom:5px}.section-heading:empty{display:none}h3{display:flex;align-items:center;gap:6px;min-height:18px;margin:0;font-size:12px;font-weight:680}h3 :global(svg){color:var(--accent-primary)}.section-heading>span{color:var(--text-muted);font-size:10px}
  .pickups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px}.pickups a{display:flex;align-items:center;gap:8px;min-width:0;min-height:52px;padding:3px 6px 3px 3px;color:inherit;text-decoration:none;border:1px solid var(--border-subtle);border-radius:5px;background:var(--surface-1)}.pickups img{flex-shrink:0;object-fit:contain}.pickups a>span{min-width:0;display:grid;gap:1px}.pickups strong{font-size:12px;line-height:14px;overflow-wrap:anywhere}.pickups small{color:var(--text-muted);font-size:9px;line-height:12px}.pickups em{font-size:11px;line-height:12px;font-style:normal;color:var(--accent-primary);font-weight:700}.pickups.rates{grid-template-columns:repeat(auto-fill,minmax(164px,180px));max-height:224px;overflow:auto}.rates a{min-height:46px;padding:2px 5px 2px 2px;gap:6px}
  .reward-list,.reward-preview{display:flex;flex-wrap:wrap;gap:3px 14px}.reward-list>div,.reward-preview>span{display:flex;align-items:center;gap:3px;font-size:10px;min-height:30px}.reward-list img,.reward-preview img{object-fit:contain}.reward-outcomes{border-block:1px solid var(--border-subtle);margin:3px 0 5px}.reward-outcomes header{display:flex;justify-content:space-between;align-items:center;min-height:20px;font-size:10px}.reward-outcomes small,.reward-outcomes p{font-size:9px;color:var(--text-muted);margin:3px 0}.resource-status{font-size:10px;color:var(--text-muted)}
  .facts{margin:0}.facts>div{display:grid;grid-template-columns:17px 68px minmax(0,1fr);align-items:center;gap:7px;min-height:30px;padding:5px 1px;border-bottom:1px solid var(--border-subtle)}.facts dt{font-size:10px;color:var(--text-muted)}.facts dd{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 7px;margin:0;font-size:11px}.facts dd span{font-size:10px;color:var(--text-muted)}
  .description{line-height:1.5}.description.highlight{padding:9px 10px;border:1px solid var(--border-subtle);border-radius:5px;background:var(--surface-1)}.description-scroll{max-height:132px;overflow:auto;overflow-wrap:anywhere}.description-scroll :global(p){margin:0 0 7px}.description-scroll :global(h2),.description-scroll :global(h3){font-size:12px}.description-scroll :global(img){max-width:100%;height:auto}.description-scroll :global(table){border-collapse:collapse;max-width:100%}.description-scroll :global(th),.description-scroll :global(td){padding:4px;border:1px solid var(--border-subtle)}.description-scroll :global(a),.full-article{color:var(--accent-primary)}.full-article{display:inline-flex;align-items:center;gap:4px;font-size:9px;min-height:24px}
  .prediction>p{font-size:11px;line-height:1.4;margin:4px 0}.current-prediction{min-height:37px;display:flex;align-items:center;justify-content:space-between;padding:5px 0 6px;border-bottom:1px solid var(--border-subtle)}.current-prediction>span{display:grid;gap:2px}.current-prediction small,.factor-label{font-size:8px;color:var(--text-muted);text-transform:uppercase}.current-prediction strong{font-size:11px}.current-prediction>b{font-size:12px;color:var(--accent-secondary)}.prediction-factors>div{display:grid;grid-template-columns:86px minmax(0,1fr);gap:9px;min-height:31px;padding:5px 0;border-bottom:1px solid var(--border-subtle)}.factor-label{display:flex;align-items:center;gap:4px}.prediction-factors dl{display:flex;flex-wrap:wrap;gap:2px 14px;margin:0}.prediction-factors dl>div{display:inline-flex;min-width:0;align-items:baseline;gap:3px}.factor-label :global(svg){color:var(--accent-primary)}.prediction-factors dt{font-size:8px;color:var(--text-muted)}.prediction-factors dd{font-size:9px;font-weight:650;margin:0}.alternatives h4{font-size:9px;margin:8px 0 4px}.alternatives>div{display:grid;grid-template-columns:52px minmax(0,1fr) 76px 30px;align-items:center;gap:8px;min-height:30px;padding:4px 0}.alternatives strong,.alternatives b{font-size:10px}.alternatives b{color:var(--accent-secondary);text-align:right}.alternatives>div+div{border-top:1px solid var(--border-subtle)}.alternatives small{font-size:8px;color:var(--text-muted)}.fit-track{height:3px;background:var(--surface-3)}.fit-track i{height:100%;display:block;background:var(--accent-secondary)}
  .actions{width:100%;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 10px}.actions>div{margin-left:auto}.actions nav{display:flex;align-items:center;flex-wrap:wrap;gap:5px 12px}.actions a{display:inline-flex;align-items:center;gap:4px;min-height:30px;font-size:11px;color:var(--accent-primary)}.planned :global(.ui-button){color:var(--accent-secondary);border-color:color-mix(in srgb,var(--accent-secondary) 40%,transparent);background:color-mix(in srgb,var(--accent-secondary) 9%,transparent)}
  @media(max-width:620px){.pickups,.pickups.rates{grid-template-columns:1fr}.alternatives>div{grid-template-columns:48px minmax(0,1fr) 52px 28px}.actions a,.full-article{min-height:var(--touch-target)}}
</style>

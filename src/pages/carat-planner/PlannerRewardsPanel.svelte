<script lang="ts">
  import type { CaratPlan, PlannerRewardResource } from '@/lib/timeline/carat-planner';
  import { cycleRewardOption, rewardBannerPlanned, rewardGroupActive, rewardGroupSelectable, updateRewardGroup, type PlannerRewardGroup } from '@/lib/timeline/planner-reward-groups';
  import { activateRewardEvents, campaignState, selectPlannerCampaign, type PlannerCampaign } from '@/lib/timeline/planner-campaigns';
  import { itemIconPath } from '@/lib/catalog/item-icons';
  import { timelineImage } from '@/lib/catalog/timeline-artwork';
  import Button from '@/components/Button.svelte';
  import Icon from '@/components/Icon.svelte';
  import InspectPopover from '@/components/InspectPopover.svelte';
  import TextField from '@/components/TextField.svelte';
  import { loadWhenVisible } from '@/lib/load-when-visible';

  interface Props {
    plan: CaratPlan; resources: PlannerRewardResource; groups: PlannerRewardGroup[]; campaignViews: PlannerCampaign[];
    search: string; showPast: boolean; renderLimit: number;
    oncommit: (mutator: (plan: CaratPlan) => void) => void;
  }
  let { plan, resources, groups, campaignViews, search = $bindable(), showPast = $bindable(), renderLimit = $bindable(), oncommit }: Props = $props();
  const items = $derived([
    ...groups.map(group => ({ id: 'group:' + group.id, availableAt: group.availableAt, isPast: group.isPast, searchText: group.searchText, group, campaign: undefined })),
    ...campaignViews.map(campaign => ({ id: 'campaign:' + campaign.id, availableAt: campaign.availableAt, isPast: campaign.isPast, searchText: campaign.searchText, campaign, group: undefined }))
  ].filter(item => item.searchText.includes(search.trim().toLowerCase())));
  const upcomingCount = $derived(items.filter(item => !item.isPast).length), pastCount = $derived(items.length - upcomingCount);
  const matching = $derived(items.filter(item => item.isPast === showPast).sort((a, b) => a.availableAt && b.availableAt ? (showPast ? -1 : 1) * a.availableAt.localeCompare(b.availableAt) || a.id.localeCompare(b.id) : a.availableAt ? -1 : b.availableAt ? 1 : a.id.localeCompare(b.id)));
  const limit = $derived(renderLimit || Math.max(40, matching.findLastIndex(item => item.group?.rewards.some(reward => reward.provenance === 'global_news')) + 1));
  const visible = $derived(matching.slice(0, limit));
  function loadMore() { renderLimit = Math.min(matching.length, limit + 40); }
  const date = (value: string, year = true) => value ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', ...(year ? { year: 'numeric' as const } : {}), timeZone: 'UTC' }).format(new Date(value + 'T00:00:00Z')) : '';
  function dateLabel(group: PlannerRewardGroup): string {
    return group.availableUntil && group.availableUntil !== group.availableAt ? date(group.availableAt, false) + ' – ' + date(group.availableUntil) : date(group.availableAt);
  }
  function artwork(group: PlannerRewardGroup): string | undefined {
    const variant = group.competitiveVariants[0];
    return group.imagePath ?? (variant?.master_event_id ? timelineImage(undefined, variant.competition, String(variant.master_event_id)) : undefined);
  }
  function bannerAvailable(group: PlannerRewardGroup): boolean {
    return Boolean(group.eventBenefits.some(item => item.kind === 'free_pulls') && group.event && ['character_banner', 'support_card_banner'].includes(group.event.eventType));
  }
  function toggleBanner(group: PlannerRewardGroup) {
    if (group.event) oncommit(value => activateRewardEvents(value, [group.event!], !rewardBannerPlanned(plan, group), resources));
  }
  function selectCampaign(campaign: PlannerCampaign, stock: boolean) { oncommit(value => selectPlannerCampaign(value, campaign, stock, resources)); }
  function campaignLabel(campaign: PlannerCampaign, stock: boolean) {
    return stock && campaign.stockDestination ? campaign.totalPulls.toLocaleString('en-US') + ' pulls on ' + campaign.stockDestination.title : campaign.allocations.map(item => item.pulls.toLocaleString('en-US') + ' pulls on ' + item.title).join(' · ');
  }
</script>

<div class="rewards-panel">
  <header class="toolbar">
    <div class="query"><TextField id="planner-reward-search" label="Find a reward" hideLabel type="search" prefixIcon="search" placeholder="Find an event or reward" bind:value={search}/>{#if search}<Button variant="ghost" size="sm" icon="close" ariaLabel="Clear reward search" onclick={() => search = ''}/>{/if}</div>
    <span class="hint"><Icon name="check" size={15}/><span><strong>Upcoming rewards are counted</strong><small>Uncheck only what you will not collect.</small></span></span>
    <div class="period" role="group" aria-label="Reward period">
      <Button variant={!showPast ? 'secondary' : 'ghost'} size="sm" ariaPressed={!showPast} onclick={() => showPast = false}>Upcoming <span>{upcomingCount}</span></Button>
      <Button variant={showPast ? 'secondary' : 'ghost'} size="sm" ariaPressed={showPast} onclick={() => showPast = true}>Past <span>{pastCount}</span></Button>
    </div>
  </header>
  <div class="reward-viewport" aria-label={showPast ? 'Past event rewards, newest first' : 'Current and upcoming event rewards, earliest first'} onfocusin={event => { if (event.currentTarget.querySelector('article:last-of-type')?.contains(event.target as Node)) loadMore(); }}>
    {#each visible as item (item.id)}
      {#if item.campaign}
        {@const campaign = item.campaign}
        {@const state = campaignState(plan, campaign)}
        <article class="campaign" class:has-image={campaign.allocations.some(allocation => allocation.imagePath)} class:past={showPast} data-campaign-id={campaign.id}>
          <div class="art" aria-hidden="true">
            {#each campaign.allocations.filter(allocation => allocation.imagePath).slice(0, 2) as allocation}<img src={allocation.imagePath} alt="" loading="lazy"/>{:else}<Icon name="gift" size={22}/>{/each}
          </div>
          <div class="copy"><strong>{campaign.label}</strong>{#if campaign.availableAt}<time>{date(campaign.availableAt)}</time>{/if}</div>
          <div class="benefits"><span>{campaign.totalPulls.toLocaleString('en-US')} banner-limited pulls total{#if campaign.pullsPerDay} · {campaign.pullsPerDay} per day{/if} · one shared campaign</span></div>
          <div class="actions">
            {#if campaign.sourceUrl}<a href={campaign.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={'Open news post for ' + campaign.label + ' in a new tab'}><Icon name="external" size={13}/></a>{/if}
            {#if showPast}<span class="history">Past</span>{:else}
              {#if campaign.stockDestination}<span title={campaignLabel(campaign, state.stock)}><Button variant="ghost" size="sm" icon="swap" disabled={!state.canSwitch} ariaLabel={'Switch free-pull allocation for ' + campaign.label} onclick={() => selectCampaign(campaign, !state.stock)}>{state.stock ? 'Later banner' : 'Daily split'}</Button></span>{/if}
              <Button variant={state.ready ? 'secondary' : 'ghost'} size="sm" icon={state.ready ? 'check' : 'add'} disabled={!state.canSelect} ariaPressed={state.ready} ariaLabel={(state.ready ? 'Remove' : 'Add') + ' ' + campaign.label + (state.ready ? ' from plan' : ' to plan')} onclick={() => selectCampaign(campaign, state.stock)}>{state.ready ? 'Added' : 'Add to plan'}</Button>
            {/if}
          </div>
        </article>
      {:else if item.group}
        {@const group = item.group}
        {@const art = artwork(group)}
        {@const active = rewardGroupActive(plan, group)}
        <article class:has-image={Boolean(art)} class:has-result={group.variableOptions.length > 0} class:past={showPast} class:excluded={!active && rewardGroupSelectable(group) && !showPast} data-reward-id={group.id}>
          <div class="art" aria-hidden="true">{#if art}<img src={art} alt="" loading="lazy"/>{:else}<Icon name="gift" size={22}/>{/if}</div>
          <div class="copy"><strong>{group.title}</strong>{#if group.availableAt}<time>{dateLabel(group)}</time>{/if}</div>
          <div class="benefits">
            {#each group.benefits as benefit}<span data-kind={benefit.kind}>{#if benefit.itemId}<img src={itemIconPath(benefit.itemId)} alt=""/>{/if}{benefit.text}</span>{/each}
            {#if group.breakdownTooltip}<InspectPopover label={'Show reward breakdown for ' + group.title}>{#snippet trigger()}<Icon name="info" size={15}/>{/snippet}<div class="breakdown">{group.breakdownTooltip}</div></InspectPopover>{/if}
          </div>
          <div class="actions">
            {#if group.sourceUrl}<a href={group.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={group.sourceLabel ?? 'Source'} title={group.sourceLabel + ' for ' + group.title}><span>{group.sourceLabel ?? 'Source'}</span><Icon name="external" size={13}/></a>{:else if group.sourceLabel}<span class="source" title={group.sourceLabel + ' is the source for this reward'}><span>{group.sourceLabel}</span><Icon name="database" size={13}/></span>{/if}
            {#if showPast}<span class="history">Past</span>{:else}
              {#if group.variableOptions.length}
                <div class="result" role="group" aria-label={'Expected result for ' + group.title}>
                  <Button variant="ghost" size="sm" icon="arrow-left" ariaLabel={'Previous result for ' + group.title} onclick={() => oncommit(value => cycleRewardOption(value, group, -1))}/>
                  <button type="button" class="current-result" aria-label={'Lower expected result for ' + group.title} onclick={() => oncommit(value => cycleRewardOption(value, group, -1))}><strong>{group.selectedOption.label}</strong><small>{group.selectedOption.amountLabel}</small></button>
                  <Button variant="ghost" size="sm" icon="arrow-right" ariaLabel={'Next result for ' + group.title} onclick={() => oncommit(value => cycleRewardOption(value, group, 1))}/>
                </div>
              {/if}
              {#if bannerAvailable(group)}<Button variant="ghost" size="sm" icon={rewardBannerPlanned(plan, group) ? 'check' : 'add'} ariaPressed={rewardBannerPlanned(plan, group)} ariaLabel={(rewardBannerPlanned(plan, group) ? 'Remove ' : 'Add ') + group.title + ' banner'} onclick={() => toggleBanner(group)}>{rewardBannerPlanned(plan, group) ? 'Added' : 'Plan'}</Button>{/if}
              {#if rewardGroupSelectable(group) && !group.variableOptions.length}<Button variant={active ? 'secondary' : 'ghost'} size="sm" icon={active ? 'check' : 'add'} ariaPressed={active} ariaLabel={(active ? 'Exclude ' : 'Include ') + group.title + ' rewards'} onclick={() => oncommit(value => updateRewardGroup(value, group, !active))}/>{/if}
            {/if}
          </div>
        </article>
      {/if}
    {:else}<p class="empty">{#if search.trim()}No {showPast ? 'past' : 'upcoming'} rewards match this search.{:else}{showPast ? 'No historical rewards are available.' : 'No usable rewards are scheduled from the plan start date.'}{/if}</p>{/each}
    {#if visible.length < matching.length}{#key limit}<div class="more" use:loadWhenVisible={loadMore}><small>{visible.length} of {matching.length}</small></div>{/key}{/if}
  </div>
</div>

<style>
  .rewards-panel{grid-column:1/-1;min-width:0}
  .toolbar{display:flex;align-items:center;gap:10px;padding:7px;border-bottom:1px solid var(--border-subtle)}
  .query{position:relative;flex:0 1 360px;min-width:0}
  .query>:global(.ui-button){position:absolute;right:1px;top:1px;height:calc(100% - 2px)}
  .query:has(>:global(.ui-button)) :global(input){padding-right:44px}
  .hint{display:flex;align-items:center;gap:5px;color:var(--accent-secondary)}
  .hint>span{display:flex;align-items:baseline;gap:4px}.hint strong{font-size:10px}.hint small{color:var(--text-secondary);font-size:9px}
  .period{display:flex;margin-left:auto;white-space:nowrap}.period :global([aria-pressed=true]){color:var(--accent-primary)}.period span{margin-left:4px;font-family:var(--font-mono)}
  .reward-viewport{max-height:520px;overflow:auto;overscroll-behavior:contain}
  article{min-height:49px;display:grid;grid-template-columns:156px minmax(0,1fr) auto;grid-template-rows:minmax(18px,auto) minmax(20px,auto);align-items:center;gap:0 10px;padding:5px 7px;border-bottom:1px solid var(--border-subtle)}
  article:hover{background:var(--surface-2)}article.excluded{background:rgb(var(--accent-primary-rgb)/.02)}article.excluded .copy,article.excluded .benefits{opacity:.65}
  .art{grid-column:1;grid-row:1/3;min-width:0;display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--text-secondary)}
  .art img{min-width:0;width:100%;max-height:64px;object-fit:contain}.campaign .art img{width:50%}.campaign .art img:only-child{width:100%}
  .copy{grid-column:2;grid-row:1;min-width:0;display:flex;align-items:baseline;gap:8px}
  .copy strong{font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .copy time{color:var(--text-secondary);font-size:9px;white-space:nowrap;flex-shrink:0}
  .benefits{grid-column:2;grid-row:2;display:flex;align-items:center;flex-wrap:wrap;gap:4px 9px;font-size:10px}
  .benefits>span{display:inline-flex;align-items:center;gap:4px}.benefits img{width:20px;height:20px;object-fit:contain}
  .benefits [data-kind=free_pulls]{color:var(--accent-primary)}.campaign .benefits{font-size:9px;min-width:0}
  .campaign .benefits>span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .actions{grid-column:3;grid-row:1/3;display:flex;align-items:center;justify-content:flex-end;gap:5px;min-width:0}
  .actions a,.source,.history{display:inline-flex;align-items:center;justify-content:center;gap:4px;color:var(--text-secondary);font-size:9px;text-decoration:none}
  .actions a{min-height:36px}.actions a:hover{color:var(--accent-primary)}
  .actions :global(.ui-button){padding-inline:7px;font-size:10px}
  .actions>:global([aria-pressed=true]){color:var(--accent-secondary);background:rgb(var(--accent-secondary-rgb)/.07)}
  .result{order:-1;display:flex;align-items:stretch;border:1px solid var(--border-primary);border-radius:var(--radius-sm);min-width:0}
  .result :global(.ui-button){padding:0 5px;flex-shrink:0}
  .current-result{min-width:100px;max-width:260px;display:grid;align-content:center;gap:2px;padding:3px 7px;border:0;background:transparent;color:var(--text-primary);font:inherit;text-align:center;cursor:pointer}
  .current-result strong{font-size:10px;line-height:1.3}.current-result small{color:var(--text-secondary);font-size:9px;line-height:1.3}
  .breakdown{white-space:pre-line;font-size:11px;line-height:1.6}
  .more{display:grid;justify-items:center;gap:5px;padding:10px}.more small,.empty{color:var(--text-secondary);font-size:10px}.empty{margin:0;padding:20px;text-align:center}
  @media(max-width:900px){.query{flex:1}.hint>span{display:grid}.actions{flex-wrap:wrap;max-width:390px}.current-result{max-width:220px}}
  @media(max-width:760px){
    .toolbar{flex-wrap:wrap;gap:6px}.query{flex-basis:100%}.hint{width:100%}.hint>span{gap:2px}
    .period{width:100%;margin-left:0}.period :global(.ui-button){flex:1}
    .copy{flex-direction:column;align-items:flex-start;gap:1px}
  }
  @media(max-width:600px){
    .reward-viewport{max-height:min(520px,62vh)}.toolbar{padding-inline:4px}
    article{min-height:54px;grid-template-columns:28px minmax(0,1fr) auto;gap:3px 6px;padding:6px 4px}
    .has-image{grid-template-columns:84px minmax(0,1fr) auto}.copy strong{white-space:normal;font-size:10px}
    .benefits{font-size:9px}.art img{max-height:56px}
    .actions{flex-direction:column;flex-wrap:nowrap;max-width:none;align-self:center;gap:2px}
    .actions a{min-height:var(--touch-target);min-width:var(--touch-target)}.actions a>span,.source>span{display:none}
    .actions :global(.ui-button){min-height:var(--touch-target);min-width:var(--touch-target)}.source{min-width:var(--touch-target);height:20px}
    .has-result{grid-template-columns:28px minmax(0,1fr)}.has-result.has-image{grid-template-columns:84px minmax(0,1fr)}
    .has-result .benefits{display:none}.has-result .art{grid-row:1}
    .has-result .actions{grid-column:1/-1;grid-row:2;flex-direction:row;justify-content:flex-end;width:100%}
    .has-result .result{flex:1}.current-result{min-width:0;max-width:none;min-height:var(--touch-target);flex:1}
    .campaign,.campaign.has-image{grid-template-columns:84px minmax(0,1fr) 44px}
    .campaign .art{grid-row:1/3}.campaign .actions{display:contents}.campaign .actions>a{grid-column:3;grid-row:1/3}
    .campaign .actions>span:not(.history){grid-column:2;grid-row:3;justify-self:start}
    .campaign .actions>:global(.ui-button){grid-column:2/4;grid-row:3;justify-self:end}
    .campaign .history{grid-column:2/4;grid-row:3}.campaign .copy{flex-direction:row;flex-wrap:wrap;gap:3px 6px}
    .campaign .benefits{grid-column:2/4}
    .campaign .actions>span:not(.history) :global(.ui-button)>:global(span){display:none}
  }
</style>

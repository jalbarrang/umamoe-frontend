<script lang="ts">
  import PageHeading from '../../ui/layout/PageHeading.svelte';
  import SourcePage from '../../ui/layout/SourcePage.svelte';
  import Banner from '../../ui/Banner.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import TierCardDetails from './TierCardDetails.svelte';
  import EmptyState from '../../ui/EmptyState.svelte';
  import SelectField from '../../ui/SelectField.svelte';
  import Spinner from '../../ui/Spinner.svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { supportCardImagePath } from '../../catalog/support-card-catalog';
  import { cardsForType, chartAxisBounds, groupTierCards, limitBreakLabel, TIER_DEFINITIONS, tierForPercentile, type TierCard, type TierlistData } from '../../domain/tierlist/tierlist';
  import { tierlistRepository } from './tierlist-repository';

  const types = ['Speed', 'Stamina', 'Power', 'Guts', 'Intelligence'];
  let data = $state<TierlistData>();
  let loading = $state(true);
  let error = $state('');
  let type = $state('0');
  let limitBreak = $state('4');
  let selected = $state<TierCard>();
  let detailOpen = $state(false);
  let hovered = $state<TierCard>();
  let hoverX = $state(0);
  let hoverY = $state(0);
  let viewportWidth = $state(1536);
  let chartWidth = $state(1000);
  const mobile = $derived(viewportWidth <= 768);
  function preview(card: TierCard, event: MouseEvent | FocusEvent) {
    if (mobile || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    hoverX = Math.max(4, Math.min(window.innerWidth - 364, rect.right + 16));
    hoverY = Math.max(4, Math.min(window.innerHeight - 560, rect.top - 150));
    hovered = card;
  }
  function inspect(card: TierCard) { hovered = undefined; selected = card; detailOpen = true; }
  function dismissPreview(event: KeyboardEvent) { if (event.key === 'Escape') hovered = undefined; }
  const cards = $derived(cardsForType(data, Number(type), Number(limitBreak)));
  const grouped = $derived(groupTierCards(cards));
  const axis = $derived(chartAxisBounds(cards.map((card) => card.scores[Number(limitBreak)] ?? 0)));
  const ticks = $derived(Array.from({ length: (axis.maximum - axis.minimum) / 500 + 1 }, (_, index) => axis.minimum + index * 500));
  const chartPoints = $derived.by(() => {
    const { minimum, maximum } = axis; const buckets: Array<{ score: number; count: number }> = [];
    return cards.map((card) => {
      const score = card.scores[Number(limitBreak)] ?? 0;
      let bucket = buckets.find((item) => Math.abs(item.score - score) <= (mobile ? Math.max(60, chartWidth * .08) : 150));
      if (!bucket) { bucket = { score, count: 0 }; buckets.push(bucket); }
      const stack = bucket.count++;
      const rank = cards.findIndex((item) => item.id === card.id);
      return { card, x: 4 + ((score - minimum) / Math.max(1, maximum - minimum)) * 92, stack, color: TIER_DEFINITIONS.find((item) => item.name === (card.tiers?.[Number(limitBreak)] ?? tierFor(rank, cards.length)))?.color ?? '#64b5f6' };
    });
  });
  const chartHeight = $derived(Math.max(mobile ? 220 : 680, 70 + (Math.max(0, ...chartPoints.map((point) => point.stack)) + 1) * (mobile ? 44 : 69)));
  function tierFor(index: number, total: number): string { return tierForPercentile(total ? (total - index) / total * 100 : 0).name; }
  async function load(refresh = false): Promise<void> { loading = true; error = ''; try { data = await tierlistRepository.load(refresh); } catch (reason) { error = reason instanceof Error ? reason.message : 'Tierlist data could not be loaded.'; } finally { loading = false; } }
  $effect(() => { void load(); });
</script>

<svelte:window bind:innerWidth={viewportWidth} onkeydown={dismissPreview}/>
<svelte:head><title>Support Card Tierlist · uma.moe</title><meta name="description" content="Legacy percentile-based Uma Musume support card tierlist by limit-break level."/></svelte:head>
<SourcePage routeId="tierlist" title="Support Card Tierlist" width="wide">
  <div class="tierlist-page">
  <PageHeading title="Support Card Tierlist" description="Legacy tierlist" flush>{#snippet actions()}<div class="lb-control"><SelectField id="tierlist-lb" label="Limit Break Level" options={[0, 1, 2, 3, 4].map((value) => ({ value: String(value), label: limitBreakLabel(value) }))} bind:value={limitBreak}/></div>{/snippet}</PageHeading>
  <div class="legacy-banner"><Icon name="info" size={18}/><span>This tierlist is no longer maintained and may be outdated. It remains available for reference.</span></div>
  <main class="tier-content">
  {#if error}<Banner title="Tierlist data unavailable" tone="danger"><p>{error}</p></Banner>{/if}
  {#if loading}<div class="loading"><Spinner size={30}/><span>Calculating tierlist…</span></div>
  {:else if !cards.length}<EmptyState icon="tierlist" title="No cards available" description={`No LB${limitBreak} ${types[Number(type)]} cards were found.`}/>
  {:else}
    <section class="chart"><div class="card-chart" bind:clientWidth={chartWidth} style:height={`${chartHeight}px`} aria-label={`${types[Number(type)]} support card power scores`}>{#each ticks as tick}<i class="grid-line" style={`left:${4 + (tick - axis.minimum) / (axis.maximum - axis.minimum) * 92}%`}><span>{tick.toLocaleString()}</span></i>{/each}{#each chartPoints as point (point.card.id)}<button class="chart-card" style={`--x:${point.x}%;--stack:${point.stack};--tier:${point.color}`} title={`${point.card.name} · ${(point.card.scores[Number(limitBreak)] ?? 0).toLocaleString()}`} aria-haspopup="dialog" onmouseenter={(event) => preview(point.card, event)} onmouseleave={() => hovered = undefined} onfocus={(event) => preview(point.card, event)} onblur={() => hovered = undefined} onclick={() => inspect(point.card)}><img src={supportCardImagePath(point.card.id)} alt={point.card.name}/></button>{/each}<span class="chart-axis">Power Score</span></div></section>
    <div class="type-tabs"><Tabs variant="underline" label="Support card type" items={types.map((label, index) => ({ id: String(index), label }))} bind:value={type}/></div>
    <section class="tierlist">{#each grouped as tier}<article><header style={`--tier:${tier.color}`}><strong>{tier.name}</strong><span>({tier.cards.length})</span><small>{tier.label}</small></header><div>{#each tier.cards as card (card.id)}<button type="button" class:selected={selected?.id === card.id} title={`${card.name} · ${card.scores[Number(limitBreak)] ?? 0}`} aria-haspopup="dialog" onmouseenter={(event) => preview(card, event)} onmouseleave={() => hovered = undefined} onfocus={(event) => preview(card, event)} onblur={() => hovered = undefined} onclick={() => inspect(card)}><img src={supportCardImagePath(card.id)} alt={card.name} loading="lazy"/><b class="card-lb">LB{limitBreak}</b><span><strong>{card.name}</strong><small>{(card.scores[Number(limitBreak)] ?? 0).toLocaleString()}</small></span></button>{/each}</div></article>{/each}</section>
    {#if hovered}<div class="card-preview" role="tooltip" style:left={`${hoverX}px`} style:top={`${hoverY}px`}><TierCardDetails card={hovered} limitBreak={Number(limitBreak)}/></div>{/if}
    {#if selected}<Dialog id="tier-card-details" title="Support Card Details" bind:open={detailOpen} maxWidth="380px"><TierCardDetails card={selected} limitBreak={Number(limitBreak)}/></Dialog>{/if}
    <section class="tier-info"><h2>Tierlist Information</h2><p>This tierlist shows support cards at the selected Limit Break level using percentile-based ranking.</p><p>Scores are calculated based on the URA scenario optimal meta calculations.</p><h3>Percentile-Based Rankings:</h3><div>{#each TIER_DEFINITIONS as tier}<span style={`--tier:${tier.color}`}><i></i>{tier.name}-Tier <small>({tier.label} percentile)</small></span>{/each}</div></section>
  {/if}
  </main></div>
</SourcePage>

<style>
  .tierlist-page{min-height:100%;background:radial-gradient(circle at 20% 50%,rgb(100 181 246/.1),transparent 50%),radial-gradient(circle at 80% 20%,rgb(129 199 132/.1),transparent 50%),radial-gradient(circle at 40% 80%,rgb(255 183 77/.1),transparent 50%),var(--bg-primary)}.lb-control{width:210px}.legacy-banner{min-height:42px;display:flex;align-items:center;justify-content:center;gap:10px;padding:8px 20px;border-bottom:1px solid rgb(255 152 0/.15);background:rgb(255 152 0/.08);color:var(--text-secondary);font-size:13px}.legacy-banner :global(svg){color:var(--accent-warning)}.tier-content{display:grid;gap:14px;padding:24px clamp(4px,3vw,32px)}.type-tabs :global(.tabs){width:100%;border-radius:var(--radius-md) var(--radius-md) 0 0}.type-tabs :global(button){min-width:0;flex:1}.loading { min-height: 300px; display: flex; align-items: center; justify-content: center; gap: var(--space-3); color: var(--color-text-muted); }.chart { padding:16px; border:1px solid var(--border-primary); border-radius:var(--radius-lg); background:var(--surface-1); box-shadow:var(--shadow-md) }.card-chart{position:relative;height:680px;overflow:hidden;border-bottom:1px solid var(--border-secondary)}.grid-line{position:absolute;top:20px;bottom:40px;width:1px;background:var(--border-subtle)}.chart-card{position:absolute;z-index:2;bottom:calc(55px + var(--stack) * 69px);left:var(--x);width:60px;height:60px;padding:0;overflow:hidden;border:2px solid var(--tier);border-radius:6px;background:var(--surface-2);cursor:pointer;transform:translateX(-50%);box-shadow:0 2px 6px rgb(0 0 0/.32)}.chart-card:hover{z-index:4;transform:translateX(-50%) scale(1.08)}.chart-card img{width:100%;height:100%;object-fit:cover}.grid-line span{position:absolute;top:calc(100% + 6px);left:0;transform:translateX(-50%);color:var(--text-secondary);font:normal 10px var(--font-sans)}.chart-axis{position:absolute;left:0;right:0;text-align:center;bottom:0;color:var(--text-secondary);font-size:.68rem}.tierlist { display: grid; gap: 24px; padding:10px 24px 24px; }.tierlist article { min-width: 0; display: grid; grid-template-columns: 112px minmax(0, 1fr); overflow:hidden;border: 1px solid var(--border-primary); border-radius: var(--radius-lg); background: var(--bg-tertiary); }.tierlist article > header { min-height: 118px; display: grid; place-content: center; justify-items: center; border-right: 1px solid var(--border-subtle); background:var(--tier);color:#0b1018;text-shadow:0 1px 0 rgb(255 255 255/.3)}.tierlist article > header strong { font-size: 2rem; }.tierlist article > header span { color:#0b1018;font-size: 10px; }.tierlist article > header small{color:rgb(11 16 24/.72);font-size:8px;font-weight:700}.tierlist article > div { background:rgb(var(--on-surface-rgb)/.1);min-width: 0; display: flex;flex-wrap:wrap;align-content:flex-start;gap:16px;padding:24px; }.tierlist button { width:100px;height:100px;position:relative;min-width:0;display:block;padding:0;overflow:hidden;border:1px solid transparent;border-radius:var(--radius-lg);background:var(--surface-2);color:inherit;cursor:pointer;text-align:left}.tierlist button:hover, .tierlist button.selected { border-color: var(--color-accent); }.tierlist button img { width: 100%; height:100%;object-fit:cover; }.tierlist button > span { position:absolute;inset:auto 0 0;min-width:0;display:grid;padding:6px;background:linear-gradient(transparent,#000 20%);color:#fff; }.card-lb{position:absolute;right:3px;top:3px;background:#111;border-radius:4px;padding:2px 4px;color:white;font-size:9px}.tierlist button small{color:#ff4560}.tierlist button strong, .tierlist button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.tierlist button strong { font-size: 10px; }.tierlist button small { color:#ff1744; font-size: 11px; }.tier-info{max-width:900px;margin:26px auto 0;padding:20px;border:1px solid var(--border-primary);border-radius:var(--radius-lg);background:var(--surface-2)}.tier-info h2{margin:0 0 12px}.tier-info p{margin:4px 0;color:var(--text-secondary)}.tier-info h3{margin:18px 0 10px;font-size:.9rem}.tier-info>div{display:grid;gap:4px}.tier-info>div span{display:flex;align-items:center;gap:7px;padding:6px 10px;border:1px solid var(--border-primary);border-radius:var(--radius-md);font-size:.75rem}.tier-info i{width:14px;height:14px;border-radius:3px;background:var(--tier)}.tier-info>div small{color:var(--text-muted);font-size:.62rem}
  @media (max-width: 650px) { .lb-control{width:45%;min-width:140px}.legacy-banner{justify-content:flex-start;padding-inline:6px}.tier-content{padding:14px 4px}.chart{padding:6px}.chart-card{bottom:calc(55px + var(--stack) * 44px);width:var(--touch-target);height:var(--touch-target)}.grid-line span{font-size:8px}.type-tabs :global(button){min-width:90px;flex:0 0 auto}.tierlist article { grid-template-columns:1fr; }.tierlist article > header{min-height:52px;display:flex;align-items:center;justify-content:center;gap:10px;border-right:0;border-bottom:1px solid var(--border-subtle)}.tierlist article > header strong{font-size:1.4rem}.tierlist button{width:60px;height:60px}.tierlist {gap:16px;padding:10px 24px 24px}.tierlist article>div{gap:12px;padding:16px}.tierlist button img { height:100%; }.tierlist button>span{padding:3px}.tierlist button strong{font-size:8px}.tierlist button small{font-size:10px} }
  .card-preview { position:fixed;z-index:var(--z-overlay);width:352px;max-height:calc(100dvh - 8px);overflow:auto;padding:16px;border:1px solid var(--border-primary);border-radius:var(--radius-lg);background:var(--bg-secondary);box-shadow:var(--shadow-dropdown);pointer-events:none; }
  .tierlist-page,.tier-content,.type-tabs{min-width:0;max-width:100%}.type-tabs{overflow-x:auto}
</style>

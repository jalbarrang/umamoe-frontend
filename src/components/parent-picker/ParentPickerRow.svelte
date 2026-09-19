<script lang="ts">
  import Artwork from '@/components/Artwork.svelte';
  import SparkItem from '@/components/SparkItem.svelte';
  import IconButton from '@/components/IconButton.svelte';
  import Icon from '@/components/Icon.svelte';
  import { characterImagePath, type CharacterCatalogEntry } from '@/lib/catalog/character-catalog';
  import { scenarioName } from '@/lib/profile/profile-display';
  import { parentCharacter, parentFactors, type SelectableParent } from '@/lib/veterans/parent-picker';
  interface Props { parent: SelectableParent; characters: Map<number, CharacterCatalogEntry>; affinity?: number; onselect: () => void; onedit?: () => void; ondelete?: () => void; }
  let { parent, characters, affinity = 0, onselect, onedit, ondelete }: Props = $props();
  const character = $derived(parentCharacter(parent, characters));
  const name = $derived(parent.name || character.name);
  const characterName = $derived(character.name);
  const factors = $derived(parentFactors(parent));
  const ancestors = $derived((parent.succession_chara_array ?? []).filter(node => [10,20].includes(node.position_id)).map(node => ({ ...node, sparks: parentFactors(node) })).filter(node => node.sparks.length));
</script>

<article class="parent-row">
  <button type="button" class="select-parent" aria-label={`Select ${name}`} onclick={onselect}>
    <span class="details">
      <span class="identity"><Artwork src={character.cardId ? characterImagePath(character.cardId) : undefined} alt="" size="sm" shape="portrait"/><span class="heading"><strong>{characterName}</strong><span class="metadata">{#if parent.scenario_id && parent.share_source === 'veteran'}<small class="scenario">{scenarioName(parent.scenario_id)}</small>{/if}{#if parent.name || parent.trainerName}<small class="subtitle">{parent.name || parent.trainerName}</small>{/if}{#if parent.rarity}<span class="rarity" aria-label={`${Math.min(parent.rarity,5)} stars`}>{#each [1,2,3,4,5] as star}<span class:filled={star <= parent.rarity} aria-hidden="true"><Icon name="star" size={12}/></span>{/each}</span>{/if}</span></span>{#if affinity>0}<span class="affinity" aria-label={`Affinity ${affinity}`}><Icon name="heart" size={14}/>{affinity}</span>{/if}</span>
      {#if factors.length}<span class="sparks">{#each factors.slice(0,16) as factor}<SparkItem name={factor.name} level={factor.level} tone={factor.tone} title={`${factor.name} Lv.${factor.level}`} compact/>{/each}{#if factors.length>16}<small>+{factors.length-16}</small>{/if}</span>{/if}
      {#if ancestors.length}<span class="ancestors">{#each ancestors as node}<span class="ancestor"><span class="ancestor-heading"><span class="position">P{node.position_id/10}</span><strong title={characters.get(node.card_id)?.name}>{characters.get(node.card_id)?.name ?? `Character ${node.card_id}`}</strong></span><span class="ancestor-sparks">{#each node.sparks.slice(0,8) as factor}<SparkItem name={factor.name} level={factor.level} tone={factor.tone} title={`${factor.name} Lv.${factor.level}`} compact/>{/each}{#if node.sparks.length>8}<small>+{node.sparks.length-8}</small>{/if}</span></span>{/each}</span>{/if}
    </span>
  </button>
  {#if onedit||ondelete}<div class="actions">{#if onedit}<IconButton icon="edit" label={`Edit ${name}`} onclick={onedit}/>{/if}{#if ondelete}<IconButton icon="trash" label={`Delete ${name}`} onclick={ondelete}/>{/if}</div>{/if}
</article>

<style>
  .parent-row { display:flex; min-width:0; border:1px solid var(--border-subtle); border-radius:var(--radius-md); background:var(--surface-1); }
  .parent-row:hover { border-color:rgb(var(--accent-primary-rgb)/.5); background:rgb(var(--accent-primary-rgb)/.04); }
  .select-parent { flex:1; min-width:0; min-height:44px; padding:10px; border:0; border-radius:inherit; background:transparent; color:var(--text-primary); text-align:left; cursor:pointer; font:inherit; }
  .select-parent:focus-visible { outline:2px solid var(--accent-primary); outline-offset:-2px; }
  .details { display:grid; min-width:0; gap:8px; }
  .identity { display:flex; align-items:center; gap:8px; min-width:0; }
  .identity :global(.art) { width:34px; height:44px; border:0; background:transparent; flex:none; }
  .heading { display:grid; gap:3px; min-width:0; }
  .heading > strong { font-size:13px; line-height:1.3; overflow-wrap:anywhere; }
  .metadata { display:flex; align-items:center; flex-wrap:wrap; gap:6px; color:var(--text-muted); font-size:11px; }
  .metadata small { font-size:inherit; }.scenario { color:var(--accent-secondary); }
  .rarity { display:flex; color:var(--border-primary); }.rarity > span { display:flex; }.rarity .filled { color:var(--accent-warning); }.rarity .filled :global(svg) { fill:currentColor; }
  .affinity { display:inline-flex; align-items:center; gap:3px; margin-left:auto; flex:none; color:var(--color-pink); font-size:13px; font-weight:700; }
  .sparks,.ancestor-sparks { display:flex; flex-wrap:wrap; align-items:center; gap:3px; min-width:0; }
  .sparks small,.ancestor-sparks small { font-size:11px; color:var(--text-muted); }
  .ancestors { display:grid; gap:6px; padding-top:6px; border-top:1px solid var(--border-subtle); }
  .ancestor { display:grid; grid-template-columns:115px minmax(0,1fr); gap:6px; align-items:start; min-width:0; }
  .ancestor-heading { display:flex; align-items:center; gap:4px; min-width:0; min-height:20px; }
  .ancestor-heading strong { color:var(--text-secondary); font-size:11px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .position { flex:none; font-size:10px; font-weight:700; padding:1px 4px; border-radius:var(--radius-xs); color:var(--accent-primary); background:rgb(var(--accent-primary-rgb)/.1); }
  .ancestor:nth-child(2) .position { color:var(--color-purple); background:rgb(var(--color-purple-rgb)/.1); }
  .actions { display:flex; flex-direction:column; align-self:flex-start; padding:8px 4px 0 0; }
  @media(max-width:600px) { .select-parent { padding:8px; }.ancestor { grid-template-columns:minmax(0,1fr); gap:2px; }.details { gap:6px; } }
</style>

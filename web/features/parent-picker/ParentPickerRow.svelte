<script lang="ts">
  import Artwork from '../../ui/Artwork.svelte';
  import SparkItem from '../../ui/SparkItem.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { characterImagePath, type CharacterCatalogEntry } from '../../catalog/character-catalog';
  import { scenarioName } from '../../domain/profile/profile-display';
  import { parentCharacter, parentFactors, type SelectableParent } from '../../domain/veterans/parent-picker';
  interface Props { parent: SelectableParent; characters: Map<number, CharacterCatalogEntry>; affinity?: number; onselect: () => void; onedit?: () => void; ondelete?: () => void; }
  let { parent, characters, affinity = 0, onselect, onedit, ondelete }: Props = $props();
  const character = $derived(parentCharacter(parent, characters));
  const name = $derived(parent.name || character.name);
  const characterName = $derived(character.name);
  const factors = $derived(parentFactors(parent));
  const ancestors = $derived((parent.succession_chara_array ?? []).filter(node => [10,20].includes(node.position_id)).map(node => ({ ...node, sparks: parentFactors(node) })).filter(node => node.sparks.length));
</script>

<article class="parent-row" class:fixed-size={parent.share_source === 'veteran' || parent.share_source === 'bookmark'}>
  <button type="button" class="select-parent" aria-label={`Select ${name}`} onclick={onselect}>
    <Artwork src={character.cardId ? characterImagePath(character.cardId) : undefined} alt="" size="md" shape="portrait"/>
    <span class="details">
      <span class="heading"><strong>{characterName}</strong>{#if parent.scenario_id && parent.share_source === 'veteran'}<small class="scenario">{scenarioName(parent.scenario_id)}</small>{/if}{#if parent.name || parent.trainerName}<small class="subtitle">{parent.name || parent.trainerName}</small>{/if}{#if parent.rarity}<span class="rarity" aria-label={`${Math.min(parent.rarity,5)} stars`}>{#each [1,2,3,4,5] as star}<span class:filled={star <= parent.rarity} aria-hidden="true"><Icon name="star" size={12}/></span>{/each}</span>{/if}{#if affinity>0}<span class="affinity"><Icon name="heart" size={12}/>{affinity}</span>{/if}</span>
      {#if factors.length}<span class="sparks">{#each factors.slice(0,16) as factor}<SparkItem name={factor.name} level={factor.level} tone={factor.tone} title={`${factor.name} Lv.${factor.level}`} compact/>{/each}{#if factors.length>16}<small>+{factors.length-16}</small>{/if}</span>{/if}
      {#if ancestors.length}<span class="ancestors">{#each ancestors as node}<span class="ancestor"><span class="position">P{node.position_id/10}</span><strong title={characters.get(node.card_id)?.name}>{characters.get(node.card_id)?.name ?? `Character ${node.card_id}`}</strong>{#each node.sparks.slice(0,8) as factor}<SparkItem name={factor.name} level={factor.level} tone={factor.tone} title={`${factor.name} Lv.${factor.level}`} compact/>{/each}</span>{/each}</span>{/if}
    </span>
  </button>
  {#if onedit||ondelete}<div class="actions">{#if onedit}<IconButton icon="edit" label={`Edit ${name}`} onclick={onedit}/>{/if}{#if ondelete}<IconButton icon="trash" label={`Delete ${name}`} onclick={ondelete}/>{/if}</div>{/if}
</article>

<style>
  .parent-row { display:flex; min-width:0; border:1px solid var(--border-subtle); border-radius:var(--radius-md); overflow:hidden; background:var(--surface-1); transition:border-color .2s,background .2s; }
  .parent-row.fixed-size { height:150px; }
  .parent-row:hover { border-color:rgb(var(--accent-primary-rgb)/.3); background:rgb(var(--accent-primary-rgb)/.04); }
  .select-parent { display:flex; align-items:center; gap:10px; width:100%; min-width:0; min-height:44px; padding:8px 10px; border:0; background:transparent; color:var(--text-primary); text-align:left; cursor:pointer; font:inherit; }
  .select-parent:focus-visible { outline:2px solid var(--accent-primary); outline-offset:-2px; }
  .select-parent > :global(.art) { border-width:2px; border-radius:var(--radius-sm); background:transparent; }
  .details { display:flex; flex-direction:column; justify-content:center; flex:1; min-width:0; gap:5px; }
  .heading { display:flex; align-items:center; flex-wrap:wrap; gap:6px; }.heading strong{max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.85rem;font-weight:700}
  .heading small { color:var(--text-muted); font-size:.65rem; }.subtitle{max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:1px 6px;border:1px solid var(--border-subtle);border-radius:var(--radius-pill);background:var(--surface-2)}
  .rarity { display:flex; font-size:12px; color:var(--border-primary); }.rarity .filled{color:#ffd700}.affinity{display:inline-flex;align-items:center;gap:2px;margin-left:auto;color:var(--color-pink);font-weight:700;font-size:.72rem}
  .sparks { display:flex; flex-wrap:wrap; align-items:center; gap:3px; min-width:0; }.sparks small{font-size:.58rem;color:var(--text-disabled)}
  .details :global(.spark){gap:.2rem;padding:.2rem .45rem;border-radius:var(--radius-sm);border-color:rgb(var(--spark-rgb)/.4);background:rgb(var(--spark-rgb)/.1);font-size:.72rem;line-height:1.5}.details :global(.spark .name){max-width:72px}
  .ancestors { display:flex; flex-direction:column; gap:2px; margin-top:3px; padding-top:3px; border-top:1px solid var(--border-subtle); }
  .ancestor { display:flex; min-width:0; align-items:center; flex-wrap:wrap; gap:4px; }.position{flex:none;font-size:.55rem;font-weight:700;padding:1px 4px;border-radius:var(--radius-xs);color:var(--accent-warning);background:rgb(var(--accent-warning-rgb)/.1)}
  .ancestor>strong { max-width:80px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--text-muted); font-size:.6rem; font-weight:500; }
  .ancestor :global(.spark){padding:.075rem .3rem;font-size:.58rem;border-radius:var(--radius-xs)}.ancestor :global(.spark .name){max-width:56px}.ancestor :global(.spark .star){font-size:9px}
  .actions{display:flex;flex-direction:column;align-self:center;padding:6px 6px 6px 2px;gap:2px}
  .heading .scenario{padding:2px 6px;border-radius:var(--radius-xs);background:rgb(var(--accent-secondary-rgb)/.1);color:var(--accent-secondary);font-size:.7rem;font-weight:600;line-height:1.5}
  .rarity>span{display:flex}.rarity .filled :global(svg){fill:currentColor}
  .details :global(.spark .level){font-weight:700;line-height:1.5}.details :global(.spark .name){line-height:1.5}
  :global([data-theme='light']) .parent-row { background:#fff; border-color:var(--border-primary); box-shadow:0 1px 3px rgb(15 23 42/.08); }
  :global([data-theme='light']) .select-parent > :global(.art){background:#eef2f7;border-color:rgb(17 24 39/.16)}
  :global([data-theme='light']) .details :global(.spark--blue){--spark-rgb:var(--accent-primary-rgb);border-color:rgb(var(--spark-rgb)/.32)}
  :global([data-theme='light']) .details :global(.spark--pink){--spark-rgb:var(--color-pink-rgb);border-color:rgb(var(--spark-rgb)/.32)}
  :global([data-theme='light']) .details :global(.spark--green){--spark-rgb:var(--accent-success-rgb);--spark-color:var(--accent-success);border-color:rgb(var(--spark-rgb)/.32)}
  :global([data-theme='light']) .details :global(.spark--white){--spark-color:var(--text-secondary);background:rgb(17 24 39/.06);border-color:rgb(17 24 39/.18)}
  @media(max-width:600px){.select-parent{gap:6px;padding:6px}.select-parent > :global(.art){width:40px;height:54px}.details{gap:3px}.heading{gap:3px}.heading strong{font-size:.76rem;max-width:110px}.details :global(.spark){padding:.1rem .3rem;font-size:.58rem}.details :global(.spark .star){font-size:8px}.details :global(.spark .name){max-width:48px}.ancestor :global(.spark){padding:.05rem .2rem;font-size:.48rem}.ancestor :global(.spark .name){max-width:36px}.ancestor>strong{max-width:52px;font-size:.5rem}.actions{padding:4px 2px 4px 0}}
  @media(max-width:480px){.select-parent{gap:5px;padding:4px}.select-parent > :global(.art){width:32px;height:var(--touch-target);border-width:1px}.details{gap:2px}.heading strong{font-size:.7rem;max-width:100px}.scenario,.ancestor>strong{display:none}.details :global(.spark){padding:.05rem .2rem;font-size:.5rem;border-radius:var(--radius-xs)}.details :global(.spark .name){max-width:36px}.details :global(.spark .star){font-size:7px}.ancestor :global(.spark){font-size:.46rem}.ancestor :global(.spark .name){max-width:30px}.position{font-size:.46rem;padding:0 2px}}
  @media(max-width:600px){.rarity :global(svg){width:10px;height:10px}}
</style>

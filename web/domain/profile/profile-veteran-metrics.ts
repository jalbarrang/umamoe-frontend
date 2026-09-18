import type { ProfileVeteran } from '../../features/profile/profile-repository';
import { normalizeInheritanceRecord } from '../inheritance/inheritance-search';
import { inheritanceAffinity } from '../inheritance/inheritance-factors';
import type { VeteranAffinityEngine } from '../veterans/affinity-engine';
import { resolveVeteranFactors, veteranFactorTotals } from './profile-veterans';

export function veteranInheritanceRecord(veteran: ProfileVeteran) {
  const parents = veteran.succession_chara_array ?? [];
  const left = parents.find(parent => parent.position_id === 10);
  const right = parents.find(parent => parent.position_id === 20);
  const totals = veteranFactorTotals(veteran);
  const factors = (node: Parameters<typeof resolveVeteranFactors>[0]) => {
    const items = resolveVeteranFactors(node);
    return { blue:items.find(item => item.tone === 'blue')?.encodedId, pink:items.find(item => item.tone === 'pink')?.encodedId, green:items.find(item => item.tone === 'green')?.encodedId, white:items.filter(item => item.tone === 'white').map(item => item.encodedId) };
  };
  const main = factors(veteran), p1 = factors(left ?? {}), p2 = factors(right ?? {});
  const combined = (tone: string) => totals.filter(item => item.tone === tone).map(item => item.id * 10 + item.level);
  return normalizeInheritanceRecord({ account_id:veteran.trainer_id ?? '', trainer_name:'', inheritance:{
    inheritance_id:Number(veteran.trained_chara_id ?? veteran.id), main_parent_id:veteran.card_id ?? 0,
    parent_left_id:left?.card_id ?? 0, parent_right_id:right?.card_id ?? 0, parent_rank:veteran.rank_score ?? 0, parent_rarity:veteran.rarity ?? 0,
    affinity_score:veteran.inheritance?.affinity_score ?? undefined, scenario_id:veteran.scenario_id,
    blue_sparks:combined('blue'), pink_sparks:combined('pink'), green_sparks:combined('green'), white_sparks:combined('white'),
    main_blue_factors:main.blue, main_pink_factors:main.pink, main_green_factors:main.green, main_white_factors:main.white,
    left_blue_factors:p1.blue, left_pink_factors:p1.pink, left_green_factors:p1.green, left_white_factors:p1.white,
    right_blue_factors:p2.blue, right_pink_factors:p2.pink, right_green_factors:p2.green, right_white_factors:p2.white,
    main_win_saddles:veteran.win_saddle_id_array ?? [], left_win_saddles:left?.win_saddle_id_array ?? [], right_win_saddles:right?.win_saddle_id_array ?? [], race_results:veteran.race_results ?? []
  } })!;
}

export function profileVeteranAffinity(veteran: ProfileVeteran, engine?: VeteranAffinityEngine, groups: ReadonlyMap<number,number> = new Map(), targetId?: number) {
  const record = veteranInheritanceRecord(veteran);
  const known = (id: number) => engine?.characterIds.includes(id>=10000 ? Math.floor(id / 100) : id);
  const calculated = inheritanceAffinity(record, targetId, undefined, engine, groups);
  const mainKnown = known(record.mainParentId) && (!targetId || known(targetId));
  const p1 = mainKnown && known(record.leftParentId) ? calculated.source({owner:'left',side:'p1',level:1}) : null;
  const p2 = mainKnown && known(record.rightParentId) ? calculated.source({owner:'right',side:'p1',level:1}) : null;
  if(targetId) return {main:p1!=null && p2!=null ? calculated.total : null,p1,p2,race:p1!=null && p2!=null ? calculated.race : null,recorded:false};
  return {main:p1 != null && p2 != null ? p1 + p2 : veteran.inheritance?.affinity_score ?? null, p1, p2, race:p1 != null && p2 != null ? calculated.race : null, recorded:p1 == null || p2 == null};
}

import { setupCatalogFixtures } from '../../../tests/fixtures/catalog-setup';
setupCatalogFixtures();
import { describe, expect, it } from 'vitest';
import { decodeFactor } from '@/lib/catalog/factor-catalog';
import { inheritanceAffinity, inheritanceFactors, inheritanceFactorMatched, type InheritanceFactor } from './inheritance-factors';
import { normalizeInheritanceSearch, emptyInheritanceFilters } from './inheritance-search';
import { VeteranAffinityEngine } from '@/lib/veterans/affinity-engine';
import type { VeteranRecord } from '@/lib/veterans/generated/veteran-record';

describe('Angular factor encoding and owner display', () => {
  it('highlights Any by star range and limits main-parent Any to its matching contribution', () => {
    for (const [color, main, group] of [['blue', 'mainBlue', 0], ['pink', 'mainPink', 1], ['green', 'mainGreen', 5]] as const) {
      const filters = emptyInheritanceFilters();
      const factor: InheritanceFactor = { ...decodeFactor(1000103), group, copies: 1, mainStars: 3, sources: [{ side: 'p1', owner: 'main', level: 3 }] };
      filters[color] = [{ factorId: 0, minimumStars: 2, maximumStars: 3 }];
      expect(inheritanceFactorMatched(factor, filters)).toBe(true);
      expect(inheritanceFactorMatched({ ...factor, level: 1 }, filters)).toBe(false);
      expect(inheritanceFactorMatched({ ...factor, level: 4 }, filters)).toBe(false);
      filters[color] = [];
      filters[main] = [{ factorId: 0, minimumStars: 3, maximumStars: 3 }];
      expect(inheritanceFactorMatched({ ...factor, level: 6 }, filters)).toBe(true);
      for (const source of [{ side: 'p1', owner: 'main', level: 2 }, { side: 'p1', owner: 'left', level: 3 }, { side: 'p2', owner: 'main', level: 3 }] as const) {
        expect(inheritanceFactorMatched({ ...factor, sources: [source] }, filters)).toBe(false);
      }
    }
    const filters = emptyInheritanceFilters();
    filters.white = filters.mainWhite = [{ factorId: 0, minimumStars: 1 }];
    expect(inheritanceFactorMatched({ ...decodeFactor(2000103), group: 3, copies: 1, mainStars: 3, sources: [{ side: 'p1', owner: 'main', level: 3 }] }, filters)).toBe(false);
  });
  it('preserves nine-star totals and separates the three original contributions', () => {
    expect(decodeFactor(109)).toMatchObject({ id: 10, level: 9, name: 'Speed' });
    const record = normalizeInheritanceSearch({ items: [{ account_id: '123', trainer_name: 'Trainer', inheritance: { inheritance_id: 1, main_parent_id: 100101, parent_left_id: 100201, parent_right_id: 100301, parent_rank: 10000, parent_rarity: 10, blue_sparks: [109], main_blue_factors: 103, left_blue_factors: 103, right_blue_factors: 103 } }], total: 1, page: 1, limit: 20, total_pages: 1 }).records[0]!;
    expect(inheritanceFactors(record)).toMatchObject([{ id: 10, level: 9, copies: 3, mainStars: 3 }]);
    expect(inheritanceFactors(record, true).map(({ owner, level }) => [owner, level])).toEqual([['main', 3], ['left', 3], ['right', 3]]);
    expect(inheritanceFactors(record, false, 'left')).toMatchObject([{ owner: 'left', level: 3 }]);
  });
  it('keeps source and total affinity aligned with the planner, including explicit P2 race wins', () => {
    const record = normalizeInheritanceSearch({ items: [{ account_id: '123', trainer_name: 'Trainer', inheritance: { inheritance_id: 1, main_parent_id: 100201, parent_left_id: 100401, parent_right_id: 100501, parent_rank: 10000, parent_rarity: 10, affinity_score: 83, main_win_saddles: [1, 3], left_win_saddles: [2] } }], total: 1, page: 1, limit: 20, total_pages: 1 }).records[0]!;
    const partner = { cardId: 100301, factors: [], parents: [{ positionId: 10, cardId: 100601, factors: [] }, { positionId: 20, cardId: 100701, factors: [] }], rawSource: { win_saddle_id_array: [99] } } as unknown as VeteranRecord;
    const engine = new VeteranAffinityEngine({ chars: [1001,1002,1003,1004,1005,1006,1007], aff2: Array(49).fill(2), aff3: Array(343).fill(3) });
    const groups = new Map([[1,100],[2,100],[3,100],[99,200]]);
    const affinity = inheritanceAffinity(record, 100101, partner, engine, groups, [2]);
    expect(affinity).toMatchObject({ total: 24, base: 18, race: 6, crossRace: 3 });
    expect(affinity.detail('main')).toEqual({ total: 16, base: 8, cross: 2, race: 6 });
    expect(affinity.detail('left')).toEqual({ total: 6, base: 3, cross: 0, race: 3 });
    for (const owner of ['main', 'left', 'right'] as const) expect(affinity.source({ side: 'p1', owner, level: 3 })).toBe(affinity.detail(owner)?.total);
    const breeding = inheritanceAffinity(record, undefined, partner, engine, groups);
    expect(breeding.total).toBe(7);
    expect(breeding.detail('main')).toEqual({ total: 7, base: 4, cross: 0, race: 3 });
    expect(inheritanceAffinity(record, undefined, partner, undefined, groups).total).toBe(83);
    expect(inheritanceAffinity(record, 100101, partner, undefined, groups).total).toBeNull();
  });
  it('retains P2-only grandparent contributions when the selected Veteran has no own sparks', () => {
    const record = normalizeInheritanceSearch({ items: [{ account_id: '123', trainer_name: 'Trainer', inheritance: { inheritance_id: 1, main_parent_id: 100101, parent_left_id: 100201, parent_right_id: 100301, parent_rank: 10000, parent_rarity: 10, main_blue_factors: 103 } }], total: 1, page: 1, limit: 20, total_pages: 1 }).records[0]!;
    const partner = { factors: [], parents: [{ positionId: 10, factors: [{ id: 10, level: 2 }] }, { positionId: 20, factors: [{ id: 10, level: 1 }] }] } as unknown as VeteranRecord;
    expect(inheritanceFactors(record, false, undefined, partner)[0]).toMatchObject({ level: 6, copies: 3, mainStars: 3, sources: [{ side: 'p1', owner: 'main', level: 3 }, { side: 'p2', owner: 'left', level: 2 }, { side: 'p2', owner: 'right', level: 1 }] });
    expect(inheritanceFactors(record, false, 'main', partner)[0]).toMatchObject({ level: 3, copies: 1 });
  });
  it('highlights the Angular global star range and main-parent or preferred-white requirements', () => {
    const filters = emptyInheritanceFilters();
    filters.blue = [{ factorId: 10, minimumStars: 6, maximumStars: 9 }];
    const factor: InheritanceFactor = { ...decodeFactor(109), group: 0, copies: 3, mainStars: 3, sources: [{ side: 'p1', owner: 'main', level: 3 }] };
    expect(inheritanceFactorMatched(factor, filters)).toBe(true);
    expect(inheritanceFactorMatched({ ...factor, level: 5 }, filters)).toBe(false);
    filters.mainBlue = [{ factorId: 10, minimumStars: 3 }];
    expect(inheritanceFactorMatched({ ...factor, level: 5 }, filters)).toBe(true);
    expect(inheritanceFactorMatched({ ...factor, level: 5, sources: [{ side: 'p2', owner: 'main', level: 3 }] }, filters)).toBe(false);
    const white = { ...factor, id: 20001, group: 3 };
    filters.optionalMainWhite = [{ factorId: 20001, minimumStars: 1 }];
    expect(inheritanceFactorMatched(white, filters)).toBe(true);
    expect(inheritanceFactorMatched({ ...white, sources: [{ side: 'p1', owner: 'left', level: 3 }] }, filters)).toBe(false);
    filters.lineageWhiteIds = [20001];
    expect(inheritanceFactorMatched({ ...white, sources: [{ side: 'p1', owner: 'left', level: 3 }] }, filters)).toBe(true);
  });
});

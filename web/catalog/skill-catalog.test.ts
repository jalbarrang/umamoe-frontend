import { expect, it } from 'vitest';
import { loadSkillCatalog, normalizeSkill, resolveEncodedSkill, skillImage, skillRarity, sortEncodedSkills, type SkillCatalogEntry } from './skill-catalog';

it('keeps Angular skill ordering, inherited-unique resolution, and stable ties without changing the source', () => {
  const entries: SkillCatalogEntry[] = [
    { skill_id: 100001, name: 'Unique', rarity: 4, unique: true, icon: '' },
    { skill_id: 200001, name: 'Gold speed', rarity: 2, icon: '' },
    { skill_id: 200002, name: 'Recover stamina', rarity: 2, icon: '' },
    { skill_id: 200003, name: 'Speed down', rarity: 2, icon: '' },
    { skill_id: 200004, name: 'Other gold', rarity: 2, icon: '' },
    { skill_id: 200005, name: 'Normal speed', rarity: 1, icon: '' },
    { skill_id: 200006, name: 'Another gold speed', rarity: 2, icon: '' },
    { skill_id: 200007, name: 'Normal recovery', description: 'Restore stamina', rarity: 1, icon: '' }
  ];
  const catalog = new Map(entries.map((entry) => [entry.skill_id, entry]));
  const ids = [2000051, 2000031, 2000021, 9000013, 1000012, 2000061, 2000011, 2000041, 99999999, 2000071];
  expect(sortEncodedSkills(catalog, ids)).toEqual([1000012, 9000013, 2000061, 2000011, 2000021, 2000031, 2000041, 2000051, 2000071, 99999999]);
  expect(ids[0]).toBe(2000051);
  expect(resolveEncodedSkill(catalog, 9000013)).toMatchObject({ skill: entries[0], inherited: true, level: 3 });
});

it('normalizes legacy boolean flags and metadata-derived unique skills like Angular', async () => {
  expect(normalizeSkill({ skill_id:'1',rarity:'3',unique:'false',inherited:'false' })).toMatchObject({skill_id:1,rarity:3,unique:false,inherited:false});
  for (const entry of [{unique:'true'}, {description:'Rarity: Upgraded Unique'}, {description:'Rarity: Special',other_versions:['When inherited']}]) expect(normalizeSkill(entry).unique).toBe(true);
  expect(normalizeSkill({inherited:'true'}).inherited).toBe(true);
  const catalog = await loadSkillCatalog();
  expect(catalog.get(100011)).toMatchObject({ name:'Shooting Star',unique:true });
  expect(skillRarity(catalog.get(100011),false)).toBe('unique-main');
  expect(sortEncodedSkills(catalog,[200011,100011])).toEqual([100011,200011]);
  expect(skillImage(catalog.get(100011)?.icon)).toBe('/game-assets/skill_icons/utx_ico_skill_20013.webp');
});

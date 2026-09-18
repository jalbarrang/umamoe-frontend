import { resourceRepository } from './resource-repository';

export interface CharacterCatalogEntry {
  id: string;
  name: string;
  image: string;
  subtitle?: string;
  rarity?: number;
  release_date?: string;
  isReleased_en?: boolean;
}

let characterCatalog: Promise<Map<number, CharacterCatalogEntry>> | undefined;
export type CharacterNames = Record<string, { name: string; skins?: Record<string, string> }>;
let characterNames: Promise<CharacterNames> | undefined;

export function loadCharacterNames(): Promise<CharacterNames> {
  characterNames ??= import('../../src/data/character_names.json').then(module => module.default as CharacterNames).catch(error => { characterNames = undefined; throw error; });
  return characterNames;
}

export function loadCharacterCatalog(): Promise<Map<number, CharacterCatalogEntry>> {
  characterCatalog ??= import('../../src/data/character.json').then((module) => {
    const entries = (module.default ?? module) as CharacterCatalogEntry[];
    return new Map(entries.map((entry) => [Number(entry.id), entry]));
  });
  return characterCatalog;
}

/** Pickers use the same release flags, names and outfit IDs as Angular.
 * Keep the full bundled catalog above for displaying historical uploaded records. */
export async function loadReleasedCharacterCatalog(): Promise<CharacterCatalogEntry[]> {
  const [characters, names] = await Promise.all([
    resourceRepository.load<CharacterCatalogEntry[]>('character'),
    resourceRepository.load<CharacterNames>('character_names')
  ]);
  return characters.filter(character => character.isReleased_en === true).map(character => ({
    ...character, id: String(character.id), name: names[String(Math.floor(Number(character.id) / 100))]?.name || character.name,
    subtitle: names[String(Math.floor(Number(character.id) / 100))]?.skins?.[String(character.id).slice(-2)]
  }));
}

/** One canonical production path for the optimized character thumbnails that
 * ship with the Svelte application. The legacy catalog image field names PNG
 * assets that are not copied into the new public bundle. */
export function characterImagePath(cardId: number): string {
  return `/game-assets/character_thumbs/chara_stand_${Math.floor(cardId / 100)}_${cardId}.webp`;
}

/** Demand-loaded lookup so character data never enters the base shell chunk. */
export function loadCharacterImageCatalog(): Promise<Map<number, string>> {
  return loadCharacterCatalog().then((entries) => new Map([...entries].map(([id]) => [id, characterImagePath(id)])));
}


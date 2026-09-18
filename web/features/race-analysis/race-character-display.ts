import charactersData from '../../../src/data/character.json';
import type { RaceRunner } from '../../domain/race/race-capture-parser';

interface CharacterEntry { id: string; name: string; image: string; }
const characters = new Map((charactersData as CharacterEntry[]).map((entry) => [Number(entry.id), entry]));

export function runnerName(runner: RaceRunner): string {
  return runner.name.startsWith('Runner ') ? characters.get(runner.cardId ?? runner.charaId ?? -1)?.name ?? runner.name : runner.name;
}

export function runnerImage(runner: RaceRunner): string | undefined {
  const entry = characters.get(runner.cardId ?? runner.charaId ?? -1);
  return entry ? `/game-assets/character_thumbs/chara_stand_${Math.floor(Number(entry.id) / 100)}_${entry.id}.webp` : undefined;
}

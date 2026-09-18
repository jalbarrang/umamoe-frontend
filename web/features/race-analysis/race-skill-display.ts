import skillsData from '../../../src/data/skills.json';
import type { ParsedRaceCapture } from '../../domain/race/race-capture-parser';

interface SkillEntry { skill_id: number; name: string; icon: string; effect?: string; }
const skills = new Map((skillsData as SkillEntry[]).map((entry) => [entry.skill_id, entry]));

export function skillName(skillId: number): string {
  return skills.get(skillId)?.name ?? `Skill ${skillId}`;
}

export function skillEffect(skillId: number): string {
  return skills.get(skillId)?.effect ?? 'See skill details';
}

export function skillIcon(skillId: number): string | undefined {
  const icon = skills.get(skillId)?.icon;
  return icon ? `/game-assets/skill_icons/${icon.replace(/\.png$/i, '.webp')}` : undefined;
}

export function activatedSkills(capture: ParsedRaceCapture, runnerIndex: number) {
  return capture.events.filter((event) => event.type === 3 && event.params[0] === runnerIndex).map((event) => ({
    frame: event.frameTime.toFixed(2),
    skill: skillName(event.params[1] ?? 0),
    phase: `${Math.round(capture.frames.find((frame) => frame.time >= event.frameTime)?.horses[runnerIndex]?.distance ?? 0)}m`,
    effect: skillEffect(event.params[1] ?? 0)
  }));
}

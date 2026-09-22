import type { RaceFrame, RaceHorseFrame } from './race-capture-parser';

export interface InterpolatedRaceFrame extends RaceFrame {
  sourceIndex: number;
}

export interface ReplayBounds {
  startTime: number;
  endTime: number;
  duration: number;
  distanceMax: number;
  laneMax: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function interpolateHorse(left: RaceHorseFrame, right: RaceHorseFrame, alpha: number): RaceHorseFrame {
  const mix = (a: number, b: number) => finite(a) + (finite(b, finite(a)) - finite(a)) * alpha;
  return {
    distance: mix(left.distance, right.distance),
    lanePosition: mix(left.lanePosition, right.lanePosition),
    speed: mix(left.speed, right.speed),
    hp: mix(left.hp, right.hp),
    temptationMode: alpha < .5 ? left.temptationMode : right.temptationMode,
    blockFrontHorseIndex: alpha < .5 ? left.blockFrontHorseIndex : right.blockFrontHorseIndex
  };
}

export function raceReplayBounds(frames: RaceFrame[], explicitDistance?: number): ReplayBounds {
  const first = frames[0];
  const last = frames.at(-1);
  const startTime = finite(first?.time ?? 0);
  const endTime = Math.max(startTime, finite(last?.time ?? startTime, startTime));
  let observedDistance = 0;
  let laneMax = 0;
  for (const frame of frames) {
    for (const horse of frame.horses) {
      observedDistance = Math.max(observedDistance, finite(horse.distance));
      laneMax = Math.max(laneMax, finite(horse.lanePosition));
    }
  }
  return {
    startTime,
    endTime,
    duration: endTime - startTime,
    distanceMax: Math.max(1, finite(explicitDistance ?? 0), observedDistance),
    laneMax: Math.max(1, laneMax)
  };
}

export function raceFrameAtTime(frames: RaceFrame[], requestedTime: number): InterpolatedRaceFrame | undefined {
  if (!frames.length) return undefined;
  if (frames.length === 1 || requestedTime <= frames[0]!.time) return { ...frames[0]!, sourceIndex: 0 };
  const lastIndex = frames.length - 1;
  if (requestedTime >= frames[lastIndex]!.time) return { ...frames[lastIndex]!, sourceIndex: lastIndex };

  let low = 0;
  let high = lastIndex;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (frames[middle]!.time <= requestedTime) low = middle;
    else high = middle;
  }
  const left = frames[low]!;
  const right = frames[high]!;
  const interval = right.time - left.time;
  const alpha = interval > 0 ? clamp((requestedTime - left.time) / interval, 0, 1) : 0;
  const horseCount = Math.min(left.horses.length, right.horses.length);
  return {
    time: left.time + interval * alpha,
    horses: Array.from({ length: horseCount }, (_, index) => interpolateHorse(left.horses[index]!, right.horses[index]!, alpha)),
    sourceIndex: low
  };
}

export function replayProgress(time: number, bounds: ReplayBounds): number {
  return bounds.duration > 0 ? clamp((time - bounds.startTime) / bounds.duration, 0, 1) : 0;
}

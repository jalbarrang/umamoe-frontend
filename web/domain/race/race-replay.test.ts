import { describe, expect, it } from 'vitest';
import type { RaceFrame } from './race-capture-parser';
import { raceFrameAtTime, raceReplayBounds, replayProgress } from './race-replay';

const frames: RaceFrame[] = [
  { time: 2, horses: [{ distance: 10, lanePosition: 100, speed: 1200, hp: 900, temptationMode: 0, blockFrontHorseIndex: -1 }] },
  { time: 4, horses: [{ distance: 50, lanePosition: 300, speed: 1600, hp: 700, temptationMode: 1, blockFrontHorseIndex: 2 }] }
];

describe('race replay domain', () => {
  it('interpolates numeric horse state between sparse capture frames', () => {
    const frame = raceFrameAtTime(frames, 3);
    expect(frame).toMatchObject({ time: 3, sourceIndex: 0 });
    expect(frame?.horses[0]).toMatchObject({ distance: 30, lanePosition: 200, speed: 1400, hp: 800, temptationMode: 1 });
  });

  it('clamps playback outside the available timeline', () => {
    expect(raceFrameAtTime(frames, -10)?.time).toBe(2);
    expect(raceFrameAtTime(frames, 99)?.time).toBe(4);
  });

  it('derives stable playback, distance, and lane bounds', () => {
    const bounds = raceReplayBounds(frames, 100);
    expect(bounds).toEqual({ startTime: 2, endTime: 4, duration: 2, distanceMax: 100, laneMax: 300 });
    expect(replayProgress(3, bounds)).toBe(.5);
  });
});

import { describe, expect, it } from 'vitest';
import { formatPercentage, formatRaceTime, runningStyleName } from './race-display';

describe('shared race display semantics', () => {
  it('uses one naming contract across Race Analysis, Multi-Race, and CM Logs', () => {
    expect(runningStyleName(3)).toBe('Late Surger');
    expect(runningStyleName(3, true)).toBe('Late');
  });
  it('formats rates and race times consistently', () => {
    expect(formatPercentage(1, 4)).toBe('25.0%');
    expect(formatRaceTime(65.1234)).toBe('1:05.123');
  });
});

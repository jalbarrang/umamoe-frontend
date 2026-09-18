const fullStyleNames: Record<number, string> = { 1: 'Front Runner', 2: 'Pace Chaser', 3: 'Late Surger', 4: 'End Closer', 5: 'Runaway' };
const shortStyleNames: Record<number, string> = { 1: 'Front', 2: 'Pace', 3: 'Late', 4: 'End', 5: 'Runaway' };

export function runningStyleName(value?: number, compact = false): string {
  return (compact ? shortStyleNames : fullStyleNames)[value ?? 0] ?? (value ? `Style ${value}` : 'Unknown');
}

export function formatPercentage(value: number, total: number, digits = 1): string {
  return total > 0 ? `${(value / total * 100).toFixed(digits)}%` : '-';
}

export function formatRaceTime(value?: number, digits = 3): string {
  if (value === undefined || !Number.isFinite(value) || value <= 0) return '-';
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(digits).padStart(digits + 3, '0')}`;
}

export type ShellLayoutMode = 'mobile' | 'compact' | 'expanded';
export type PageWidth = 'medium' | 'wide';

export interface ScreenLayoutContract {
  id: ShellLayoutMode;
  label: string;
  min: number;
  max?: number;
  navigation: string;
}

export const SCREEN_LAYOUTS: readonly ScreenLayoutContract[] = [
  { id: 'mobile', label: 'Mobile', min: 0, max: 767, navigation: 'Utility header + bottom navigation' },
  { id: 'compact', label: 'Compact', min: 768, max: 1279, navigation: '64px navigation rail' },
  { id: 'expanded', label: 'Expanded', min: 1280, navigation: '240px navigation rail' }
] as const;

export const SCREEN_BREAKPOINTS = {
  compact: 768,
  expanded: 1280
} as const;

export const REVIEW_VIEWPORTS = [320, 390, 768, 1024, 1440] as const;

export const PAGE_LAYOUT = {
  contentMax: 1080,
  frameMax: 1536,
  widths: {
    medium: { contentMax: 1080, frameMax: 1536 },
    wide: { contentMax: 1440, frameMax: 1840 }
  },
  gutters: { mobile: 16, compact: 24, expanded: 32 },
  ads: {
    railWidth: 160,
    railGap: 20,
    balancedRailsMin: 1384,
    leaderboardHeight: 90,
    mobileHeight: 50
  }
} as const;

export function shellLayoutForWidth(width: number): ShellLayoutMode {
  if (width >= SCREEN_BREAKPOINTS.expanded) return 'expanded';
  if (width >= SCREEN_BREAKPOINTS.compact) return 'compact';
  return 'mobile';
}

export function formatScreenRange(layout: ScreenLayoutContract): string {
  if (layout.max === undefined) return `≥${layout.min}px`;
  if (layout.min === 0) return `≤${layout.max}px`;
  return `${layout.min}–${layout.max}px`;
}

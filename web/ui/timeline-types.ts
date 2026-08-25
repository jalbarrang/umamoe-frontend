export type TimelineEventTone = 'default' | 'support' | 'story' | 'legend' | 'campaign' | 'scenario';

export interface TimelineReward {
  id: string;
  label: string;
  amount: string | number;
  icon?: string;
}

export interface TimelinePickup {
  id: string;
  name: string;
  image: string;
  kind: 'character' | 'support';
}

export interface TimelineEventData {
  id: string;
  title: string;
  typeLabel: string;
  dateLabel: string;
  context?: string;
  image?: string;
  tone?: TimelineEventTone;
  rerun?: boolean;
  predicted?: boolean;
  rewards?: TimelineReward[];
  pickups?: TimelinePickup[];
  overflowPickups?: number;
  raceLines?: string[];
  canPlan?: boolean;
}

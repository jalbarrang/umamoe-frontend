import { describe, expect, it } from 'vitest';
import { applyGlobalRewardPrecedence } from './planner-reward-precedence';

describe('planner reward precedence', () => {
  it('keeps the Global event reward and removes its matched JP prediction', () => {
    const resource = applyGlobalRewardPrecedence({ rewards: [
      { id: 'global', label: 'Gift', event_id: 'event', currency: 'free_jewels', amount: 500, available_at: '2026-01-01', provenance: 'global_news' },
      { id: 'jp', label: 'Gift', event_id: 'event', currency: 'free_jewels', amount: 500, available_at: '2026-01-01', provenance: 'jp_news' }
    ] });
    expect(resource.rewards.map((reward) => reward.id)).toEqual(['global']);
  });
});

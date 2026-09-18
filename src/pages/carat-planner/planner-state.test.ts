import { expect, it } from 'vitest';
import { get } from 'svelte/store';
import { plannerCollection, savePlannerCollection } from './planner-state';

it('a synchronous subscriber migration remains the latest persisted and visible plan', () => {
  const original = structuredClone(get(plannerCollection));
  const next = structuredClone(original); next.plans[0]!.name = 'Before migration';
  const stop = plannerCollection.subscribe(value => {
    if (value.plans[0]?.name === 'Before migration') {
      const migrated = structuredClone(value); migrated.plans[0]!.name = 'Migrated';
      savePlannerCollection(migrated, false);
    }
  });
  try {
    savePlannerCollection(next, false);
    expect(get(plannerCollection).plans[0]!.name).toBe('Migrated');
    expect(JSON.parse(localStorage.getItem('carat-planner-plans-v1')!).plans[0].name).toBe('Migrated');
  } finally { stop(); savePlannerCollection(original, false); }
});

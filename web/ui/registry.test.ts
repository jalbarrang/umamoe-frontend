import { describe, expect, it } from 'vitest';
import { componentCount, uiRegistry } from './registry';

describe('UI component registry', () => {
  it('keeps stable, unique identifiers for every component contract', () => {
    const ids = uiRegistry.flatMap((section) => section.entries.map((entry) => entry.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(componentCount).toBe(ids.length);
  });

  it('documents states and accessibility behavior before approval', () => {
    for (const section of uiRegistry) {
      expect(section.description.length).toBeGreaterThan(20);
      for (const entry of section.entries) {
        expect(entry.states.length).toBeGreaterThan(0);
        expect(entry.accessibility.length).toBeGreaterThan(20);
      }
    }
  });
});

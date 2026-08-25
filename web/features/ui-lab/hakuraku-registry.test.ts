import { describe, expect, it } from 'vitest';
import { hakurakuComponentCount, hakurakuRegistry } from './hakuraku-registry';

describe('Hakuraku component registry', () => {
  it('keeps its port contracts unique and documented', () => {
    const ids = hakurakuRegistry.flatMap((section) => section.entries.map((entry) => entry.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(hakurakuComponentCount).toBe(ids.length);
    expect(ids).toContain('haku-chart-port');
    for (const section of hakurakuRegistry) {
      expect(section.description.length).toBeGreaterThan(20);
      for (const entry of section.entries) {
        expect(entry.states.length).toBeGreaterThan(0);
        expect(entry.accessibility.length).toBeGreaterThan(20);
      }
    }
  });
});

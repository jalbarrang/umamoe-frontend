import { expect, test } from 'vitest';
import englishImages from '@/assets/timeline-images/en/manifest.json';
import { itemIconPath } from './item-icons';
import { timelineImage } from './timeline-artwork';

test('catalogs resolve bundled artwork after source folders move', () => {
  expect(itemIconPath(43)).toContain('item_icon_00043');
  const logicalPath = Object.keys(englishImages)[0]!;
  expect(timelineImage(logicalPath, undefined, '')).toMatch(/^\/(?:src\/assets\/|app\/)/);
  expect(timelineImage('https://example.com/banner.webp', undefined, '')).toBe('https://example.com/banner.webp');
});

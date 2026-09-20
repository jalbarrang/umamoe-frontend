import { expect, test } from 'vitest';
import englishImages from '@/assets/timeline-images/en/manifest.json';
import { itemIconPath } from './item-icons';
import { timelineImage } from './timeline-artwork';

test('catalogs resolve bundled artwork after source folders move', () => {
  expect(itemIconPath(43)).toContain('item_icon_00043');
  const logicalPath = Object.keys(englishImages)[0]!;
  expect(timelineImage(logicalPath, undefined, '')).toBe('/' + englishImages[logicalPath as keyof typeof englishImages]);
  expect(timelineImage('https://example.com/banner.webp', undefined, '')).toBe('https://example.com/banner.webp');
});

test('timeline uses source artwork for unsynced banners and still prefers bundled artwork', () => {
  const source = 'https://example.com/news-banner.png';
  expect(timelineImage('assets/timeline-images/events/campaign/994.webp', 'campaign', 'news-event-campaign-994', source)).toBe(source);
  expect(timelineImage(undefined, 'campaign', 'no-local-artwork', source)).toBe(source);
  expect(timelineImage('assets/images/campaign/', 'campaign', 'campaign-1037')).toBeUndefined();
  expect(timelineImage('assets/images/campaign/', 'campaign', 'campaign-1037', source)).toBe(source);
  const bundled = Object.keys(englishImages)[0]!;
  expect(timelineImage(bundled, undefined, '', source)).toBe(timelineImage(bundled, undefined, ''));
});

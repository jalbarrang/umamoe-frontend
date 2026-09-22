import { writable } from 'svelte/store';

export interface FindSource {
  host: HTMLElement;
  count: () => number;
  text: (index: number) => string;
  reveal: (index: number) => Promise<HTMLElement | undefined>;
}
export interface FindMatch { source: FindSource; index: number }
export const findSources = writable<FindSource[]>([]);
export const findRequested = writable(0);

export function registerFindSource(source: FindSource) {
  findSources.update(sources => [...sources, source]);
  return {
    update: () => findSources.update(sources => [...sources]),
    destroy: () => findSources.update(sources => sources.filter(item => item !== source)),
  };
}

export function availableFindSources(sources: FindSource[]): FindSource[] {
  return sources.filter(source => source.count() > 0 && source.host.isConnected && source.host.getClientRects().length
    && !source.host.closest('dialog, [popover], [inert]'));
}

export function findLoaded(sources: FindSource[], query: string): FindMatch[] {
  const needle = query.trim().normalize('NFKC').toLocaleLowerCase();
  if (!needle) return [];
  const matches: FindMatch[] = [];
  for (const source of availableFindSources(sources)) {
    for (let index = 0; index < source.count(); index++) {
      if (source.text(index).normalize('NFKC').toLocaleLowerCase().includes(needle)) matches.push({ source, index });
    }
  }
  return matches;
}

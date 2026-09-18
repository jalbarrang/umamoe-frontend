import { normalizeSupportCards, type SupportCardCatalogEntry } from '../domain/supports/support-card';
import { resourceRepository } from './resource-repository';
export type { SupportCardCatalogEntry } from '../domain/supports/support-card';

export function supportCardImagePath(id: string | number): string { return `/assets/images/support_card/half/support_card_s_${id}.webp`; }

let request: Promise<readonly SupportCardCatalogEntry[]> | undefined;

/** Shared demand-loaded support index for Database and planner calculations. */
export function loadSupportCardCatalog(): Promise<readonly SupportCardCatalogEntry[]> {
  request ??= import('../../src/data/support-cards-db.json').then(module => normalizeSupportCards(module.default)).catch(error => { request = undefined; throw error; });
  return request;
}

/** Historical records retain the full bundled index; pickers use live release metadata. */
export async function loadLiveSupportCards(refresh = false): Promise<SupportCardCatalogEntry[]> {
  return resourceRepository.load('support-cards-db', refresh, normalizeSupportCards);
}

export async function readCachedSupportCards(): Promise<SupportCardCatalogEntry[] | undefined> {
  const cached = await resourceRepository.readCached<unknown>('support-cards-db');
  if (cached === undefined) return undefined;
  try { return normalizeSupportCards(cached); } catch { return undefined; }
}

export async function loadSupportCardRarities(): Promise<Record<string,number>> {
  return Object.fromEntries((await loadSupportCardCatalog()).map((card) => [card.id,card.rarity]));
}

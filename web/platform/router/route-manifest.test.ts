import { describe, expect, it } from 'vitest';
import featureManifest from '../../../contracts/features.json';
import parityLedger from '../../parity/angular-route-ledger.json';
import { appRoutes, navigationForPath, routeDefinitionForPath } from './route-manifest';

describe('Angular parity route manifest', () => {
  it('uses the versioned feature contract as its single source', () => {
    expect(appRoutes).toHaveLength(featureManifest.features.length);
    expect(appRoutes.map((route) => route.id)).toEqual(featureManifest.features.map((feature) => feature.id));
  });

  it('exposes the standalone Veterans destination alongside existing product navigation', () => {
    const navigation = navigationForPath('/database');
    expect(navigation.main.map((item) => item.id)).toEqual(['database', 'veterans', 'clubs', 'rankings', 'activity', 'tierlist', 'tools', 'timeline']);
    expect(navigation.mobileMore.map((item) => item.id)).toEqual(['veterans', 'tierlist', 'tools', 'timeline']);
    expect(navigation.main.find((item) => item.id === 'database')?.current).toBe(true);
    expect(navigation.main.some((item) => item.id === 'statistics')).toBe(false);
    expect(navigation.main.some((item) => item.id === 'lineage-planner')).toBe(false);
    expect(appRoutes.some((route) => route.source !== 'moe')).toBe(false);
  });

  it('assigns only the two approved page widths', () => {
    expect(new Set(appRoutes.map((route) => route.width))).toEqual(new Set(['normal', 'wide']));
    expect(routeDefinitionForPath('/tools')?.width).toBe('normal');
    expect(routeDefinitionForPath('/database')?.width).toBe('wide');
  });

  it('groups tools and highlights the selected Timeline tab, including history URLs', () => {
    const tools = navigationForPath('/tools/lineage-planner').main.find(item => item.id === 'tools')!;
    expect(tools.children?.map(child => child.href)).toEqual(['/tools/statistics', '/tools/lineage-planner', '/timeline?tab=carat-planner']);
    expect(tools.expanded).toBe(true);
    expect(tools.children?.filter(child => child.current).map(child => child.id)).toEqual(['lineage-planner']);
    for (const search of ['', '?tab=timeline', '?tab=carat-planner&banner=example']) {
      const timeline = navigationForPath('/timeline', search).main.find(item => item.id === 'timeline')!;
      expect(timeline.children?.filter(child => child.current).map(child => child.id)).toEqual([search.includes('carat-planner') ? 'carat-planner' : 'events']);
    }
  });

  it('tracks every product route without claiming unreviewed approval', () => {
    const tracked = parityLedger.routes.map((route) => route.path);
    for (const route of appRoutes) expect(tracked.some((path) => path === route.path || path.startsWith(`${route.path}/:`)), `${route.path} is missing from the parity ledger`).toBe(true);
    expect(parityLedger.routes.some((route) => route.status === 'approved')).toBe(false);
  });
});

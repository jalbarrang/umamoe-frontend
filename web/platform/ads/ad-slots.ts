import featureManifest from '../../../contracts/features.json';

const configuredFuseIds: Record<string, string> = {
  home_sticky_vrec_left: 'home_sticky_vrec_lhs',
  home_sticky_vrec_right: 'home_sticky_vrec_rhs',
  database_sticky_vrec_left: 'database_sticky_vrec_lhs',
  database_sticky_vrec_right: 'database_sticky_vrec_rhs',
  leaderboard_sticky_vrec_left: 'leaderboard_sticky_vrec_lhs',
  leaderboard_sticky_vrec_right: 'leaderboard_sticky_vrec_rhs',
  rankings_sticky_vrec_left: 'ranking_sticky_vrec_lhs',
  rankings_sticky_vrec_right: 'ranking_sticky_vrec_rhs',
  activity_sticky_vrec_left: 'activity_sticky_vrec_lhs',
  activity_sticky_vrec_right: 'activity_sticky_vrec_rhs',
  tierlist_sticky_vrec_left: 'tierlist_sticky_vrec_lhs',
  tierlist_sticky_vrec_right: 'tierlist_sticky_vrec_rhs',
  tools_sticky_vrec_left: 'tools_sticky_vrec_lhs',
  tools_sticky_vrec_right: 'tools_sticky_vrec_rhs',
  lineage_planner_sticky_vrec_left: 'lineageplanner_sticky_vrec_lhs',
  lineage_planner_sticky_vrec_right: 'lineageplanner_sticky_vrec_rhs',
  timeline_sticky_vrec_left: 'timeline_sticky_vrec_lhs',
  timeline_sticky_vrec_right: 'timeline_sticky_vrec_rhs'
};

export function adSurfaceForRoute(routeId: string): string | null {
  return featureManifest.features.find((feature) => feature.id === routeId)?.adSurface ?? null;
}

export function fuseIdForPlacement(placement: string): string {
  return configuredFuseIds[placement] ?? placement;
}

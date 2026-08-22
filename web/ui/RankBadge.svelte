<script lang="ts">
  import { getRankInfo, getRankInfoFromLabel, getRankInfoFromScore } from '../domain/rank';
  interface Props { label?: string; rarity?: number; score?: number; size?: 'sm' | 'md' | 'lg'; icon?: string; }
  let { label, rarity, score, size = 'md', icon }: Props = $props();
  const rank = $derived(label ? getRankInfoFromLabel(label) : score !== undefined ? getRankInfoFromScore(score) : getRankInfo(rarity ?? 1));
</script>

<span class="rank rank--{size}" class:ultra={rank.isUltra} style:--rank-color={rank.colorToken} aria-label={`Rank ${rank.label}`}>
  {#if icon}<img src={icon} alt=""/>{/if}
  {#if rank.isUltra}<b>U</b><span>{rank.label.slice(1)}</span>{:else}<span>{rank.label}</span>{/if}
</span>

<style>
  .rank { width: fit-content; min-width: 30px; height: 24px; display: inline-flex; align-items: center; justify-content: center; gap: 0; padding: 0 6px; border-left: 3px solid var(--rank-color); border-radius: var(--radius-xs); background: color-mix(in srgb, var(--rank-color) 11%, transparent); color: var(--rank-color); font-size: 12px; font-weight: 850; line-height: 1; letter-spacing: .02em; }
  .rank img { width: 18px; height: 18px; margin-right: 3px; object-fit: contain; }
  .rank b { color: var(--rank-ultra); font: inherit; }
  .rank--sm { min-width: 26px; height: 20px; padding-inline: 4px; font-size: 10px; }
  .rank--lg { min-width: 40px; height: 30px; padding-inline: 8px; font-size: 15px; }
</style>

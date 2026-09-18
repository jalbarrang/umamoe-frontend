<script lang="ts">
  import { totalStats } from '../domain/profile/profile-display';
  import StatStrip from './StatStrip.svelte';

  let { stats, label = 'Character stats' }: {
    stats: { speed?: number | null; stamina?: number | null; power?: number | null; guts?: number | null; wiz?: number | null };
    label?: string;
  } = $props();
  const values = $derived({ speed:stats.speed ?? 0, stamina:stats.stamina ?? 0, power:stats.power ?? 0, guts:stats.guts ?? 0, wiz:stats.wiz ?? 0 });
  const items = $derived([
    ...(['speed', 'stamina', 'power', 'guts', 'wiz'] as const).map((key) => {
      const id = key === 'wiz' ? 'wit' : key;
      return { id, label:id[0]!.toUpperCase() + id.slice(1), value:values[key].toLocaleString(), icon:`/assets/images/icon/stats/${id}.webp` };
    }),
    { id:'total', label:'TOT', value:totalStats(values).toLocaleString() }
  ]);
</script>

<StatStrip {items} {label} compact presentation="icons"/>

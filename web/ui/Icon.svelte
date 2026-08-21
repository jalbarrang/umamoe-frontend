<script lang="ts">
  import type { IconName } from './icon-types';

  interface Props { name: IconName; size?: number; label?: string; }
  let { name, size = 20, label }: Props = $props();

  const paths: Record<IconName, string[]> = {
    home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9 21v-7h6v7'],
    database: ['M4 6c0-2 3.6-3.5 8-3.5S20 4 20 6s-3.6 3.5-8 3.5S4 8 4 6Z', 'M4 6v6c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5V6', 'M4 12v6c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5v-6'],
    veterans: ['M8 4h8v4H8z', 'M6 8h12l-1 13H7L6 8Z', 'M9 12h6', 'M12 9v6'],
    race: ['M4 19c4-7 7-10 16-14', 'm14 3 2 2-2 2', 'M5 15h5', 'M3 19h5'],
    timeline: ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-3-6.7', 'M18 2v4h4'],
    community: ['M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M16 9a3 3 0 1 0 0-6', 'M2 21v-3c0-3 2.5-5 6-5s6 2 6 5v3', 'M15 13c4 0 7 1.8 7 5v3'],
    rankings: ['M4 20h16', 'M6 16h3v4H6z', 'M11 10h3v10h-3z', 'M16 4h3v16h-3z'],
    activity: ['M3 12h4l2-6 4 12 2-6h6'],
    tools: ['m14 6 4-4 4 4-4 4', 'M15 9 4 4L9 23l-4-4L15 9Z', 'm3 3 6 6'],
    chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
    lineage: ['M12 5v5', 'M6 14v-4h12v4', 'M3 14h6v6H3z', 'M15 14h6v6h-6z'],
    tierlist: ['M8 3h8v5a4 4 0 0 1-8 0V3Z', 'M8 5H4v2c0 3 2 5 5 5', 'M16 5h4v2c0 3-2 5-5 5', 'M12 12v5', 'M8 21h8', 'M9 17h6'],
    connect: ['M8 12h8', 'm13 8 4 4-4 4', 'M5 5a9 9 0 0 0 0 14'],
    search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm16 16 5 5'],
    sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M12 2v2', 'M12 20v2', 'm4.9 4.9 1.4 1.4', 'm17.7 17.7 1.4 1.4', 'M2 12h2', 'M20 12h2', 'm4.9 19.1 1.4-1.4', 'm17.7 6.3 1.4-1.4'],
    moon: ['M20 15a8 8 0 0 1-11-11 8.5 8.5 0 1 0 11 11Z'],
    user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 22c0-5 3-8 8-8s8 3 8 8'],
    status: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 8v4', 'M12 16h.01'],
    more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
    close: ['m5 5 14 14', 'M19 5 5 19'],
    menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
    chevron: ['m9 18 6-6-6-6'],
    upload: ['M12 16V3', 'm7 8 5-5 5 5', 'M4 15v5h16v-5'],
    check: ['m4 12 5 5L20 6'],
    warning: ['M12 3 2 7 7 11H3l7-11 2-7Z', 'M12 9v5', 'M12 18h.01'],
    info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 10v7', 'M12 7h.01'],
    refresh: ['M20 7v5h-5', 'M4 17v-5h5', 'M6 8a8 8 0 0 1 13 1l1 3', 'M18 16A8 8 0 0 1 5 15l-1-3'],
    download: ['M12 3v13', 'm7 11 5 5 5-5', 'M4 20h16'],
    filter: ['M3 5h18l-7 8v6l-4 2v-8L3 5Z'],
    sort: ['M8 6h13', 'M8 12h9', 'M8 18h5', 'm3 5 2-2 2 2', 'M5 3v16'],
    external: ['M14 4h6v6', 'M20 4 11 13', 'M19 13v7H4V5h7'],
    trash: ['M4 7h16', 'M9 7V4h6v3', 'm7 7 1 13h8l1-13', 'M10 11v5', 'M14 11v5'],
    add: ['M12 5v14', 'M5 12h14']
  };
</script>

<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden={label ? undefined : 'true'} role={label ? 'img' : undefined}>
  {#if label}<title>{label}</title>{/if}
  {#each paths[name] as path}<path d={path}></path>{/each}
</svg>

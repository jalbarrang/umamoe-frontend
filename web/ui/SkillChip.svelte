<script lang="ts">
  type SkillRarity = 'normal' | 'gold' | 'special' | 'unique-inherited' | 'unique-main';

  interface Props {
    name: string;
    icon?: string;
    level?: string | number;
    rarity?: SkillRarity;
    compact?: boolean;
  }

  let { name, icon, level, rarity = 'normal', compact = false }: Props = $props();
  let iconFailed = $state(false);
</script>

<span class="skill-chip rarity-{rarity}" class:compact title={level === undefined ? name : `${name} ${level}`}>
  {#if icon && !iconFailed}
    <span class="icon-frame"><img src={icon} alt="" loading="lazy" decoding="async" onerror={() => iconFailed = true}/></span>
  {/if}
  <span class="skill-name">{name}</span>
  {#if level !== undefined}<span class="skill-level">{level}</span>{/if}
</span>

<style>
  .skill-chip {
    --skill-border: rgb(255 255 255 / .10);
    min-height: 27px; max-width: 100%; display: inline-flex; align-items: center; gap: 5px;
    padding: 0 6px 0 0; overflow: visible; border: 1px solid var(--skill-border); border-left: 0;
    border-radius: 6px; background: rgb(255 255 255 / .055); color: rgb(255 255 255 / .76);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / .035); font-size: .74rem; font-weight: 600; line-height: 1;
    white-space: nowrap;
  }
  .icon-frame { width: 27px; min-height: inherit; align-self: stretch; display: inline-flex; align-items: center; flex: 0 0 auto; margin: -1px 0; overflow: visible; }
  img { width: 100%; height: 100%; display: block; object-fit: contain; border: 0; border-radius: 0; background: none; box-shadow: none; }
  .skill-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .skill-level { flex: 0 0 auto; margin-left: 1px; padding: 2px 4px; border-radius: 999px; background: rgb(255 255 255 / .12); color: rgb(255 255 255 / .74); font-size: .6rem; font-weight: 700; font-variant-numeric: tabular-nums; }
  .rarity-gold { --skill-border: rgb(255 193 7 / .38); background: rgb(255 170 32 / .13); color: #ffe08a; }
  .rarity-special { --skill-border: rgb(33 150 243 / .40); background: rgb(33 150 243 / .13); color: #90caf9; }
  .rarity-unique-inherited { --skill-border: rgb(186 104 200 / .42); background: linear-gradient(135deg, rgb(126 87 194 / .26), rgb(171 71 188 / .20)); color: #d7a6e3; }
  .rarity-unique-main { --skill-border: transparent; color: #ffe8a6; background: linear-gradient(rgb(34 28 14 / .90), rgb(34 28 14 / .90)) padding-box, linear-gradient(135deg, #ff8a65, #ffd166 30%, #5eead4 58%, #64b5f6 76%, #ce93d8) border-box; }
  .compact { min-height: 24px; gap: 4px; padding-right: 5px; font-size: .66rem; }
  .compact .icon-frame { width: 24px; }
  .compact .skill-level { margin-left: 0; padding: 1px 3px; font-size: .55rem; }
  :global([data-theme='light']) .skill-chip { --skill-border: rgb(17 24 39 / .16); background: rgb(17 24 39 / .045); color: rgb(17 24 39 / .78); box-shadow: inset 0 1px 0 rgb(255 255 255 / .6); }
  :global([data-theme='light']) .skill-level { background: rgb(17 24 39 / .09); color: rgb(17 24 39 / .70); }
  :global([data-theme='light']) .rarity-gold { --skill-border: rgb(180 83 9 / .36); background: rgb(245 158 11 / .13); color: #92400e; }
  :global([data-theme='light']) .rarity-special { --skill-border: rgb(37 99 235 / .34); background: rgb(37 99 235 / .10); color: #1d4ed8; }
</style>

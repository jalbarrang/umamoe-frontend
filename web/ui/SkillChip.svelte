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

<span class="skill-chip rarity-{rarity}" class:compact class:with-icon={Boolean(icon && !iconFailed)} title={level === undefined ? name : `${name} ${level}`}>
  {#if icon && !iconFailed}
    <img src={icon} alt="" loading="lazy" decoding="async" onerror={() => iconFailed = true}/>
  {/if}
  <span class="skill-body"><span class="skill-name">{name}</span>{#if level !== undefined}<span class="skill-level">{level}</span>{/if}</span>
</span>

<style>
  .skill-chip {
    --skill-border: rgb(255 255 255 / .10);
    --skill-bg: rgb(255 255 255 / .055);
    --skill-text: rgb(255 255 255 / .78);
    min-height: 27px; max-width: 100%; display: inline-flex; align-items: stretch; overflow: visible; color: var(--skill-text); font-size: .74rem; font-weight: 600; line-height: 1; white-space: nowrap;
  }
  img { width: 27px; height: 27px; display: block; flex: 0 0 auto; object-fit: contain; border: 0; border-radius: 0; background: none; box-shadow: none; }
  .skill-body { min-width: 0; min-height: 27px; display: inline-flex; align-items: center; gap: 5px; padding: 0 7px; border: 1px solid var(--skill-border); border-radius: 6px; background: var(--skill-bg); box-shadow: inset 0 1px 0 rgb(255 255 255 / .035); }
  .with-icon .skill-body { padding-left: 6px; border-left: 0; border-radius: 0 6px 6px 0; }
  .skill-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .skill-level { flex: 0 0 auto; margin-left: 1px; padding-left: 5px; border-left: 1px solid color-mix(in srgb, currentColor 24%, transparent); color: inherit; font-size: .59rem; font-weight: 700; font-variant-numeric: tabular-nums; opacity: .78; }
  .rarity-gold { --skill-border: rgb(255 193 7 / .38); --skill-bg: rgb(255 170 32 / .13); --skill-text: #ffe08a; }
  .rarity-special { --skill-border: rgb(33 150 243 / .40); --skill-bg: rgb(33 150 243 / .13); --skill-text: #90caf9; }
  .rarity-unique-inherited { --skill-border: rgb(186 104 200 / .42); --skill-bg: linear-gradient(135deg, rgb(126 87 194 / .26), rgb(171 71 188 / .20)); --skill-text: #d7a6e3; }
  .rarity-unique-main { --skill-border: transparent; --skill-text: #ffe8a6; }
  .rarity-unique-main .skill-body { background: linear-gradient(rgb(34 28 14 / .90), rgb(34 28 14 / .90)) padding-box, linear-gradient(135deg, #ff8a65, #ffd166 30%, #5eead4 58%, #64b5f6 76%, #ce93d8) border-box; }
  .compact { min-height: 24px; font-size: .66rem; }
  .compact img { width: 24px; height: 24px; }
  .compact .skill-body { min-height: 24px; gap: 4px; padding-right: 5px; }
  .compact .skill-level { margin-left: 0; padding-left: 4px; font-size: .55rem; }
  :global([data-theme='light']) .skill-chip { --skill-border: rgb(17 24 39 / .16); --skill-bg: rgb(17 24 39 / .045); --skill-text: rgb(17 24 39 / .78); }
  :global([data-theme='light']) .skill-body { box-shadow: inset 0 1px 0 rgb(255 255 255 / .6); }
  :global([data-theme='light']) .rarity-gold { --skill-border: rgb(180 83 9 / .36); --skill-bg: rgb(245 158 11 / .13); --skill-text: #92400e; }
  :global([data-theme='light']) .rarity-special { --skill-border: rgb(37 99 235 / .34); --skill-bg: rgb(37 99 235 / .10); --skill-text: #1d4ed8; }
</style>

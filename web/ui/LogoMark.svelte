<script lang="ts">interface Props { size?: number; } let { size = 36 }: Props = $props();</script>
<svg viewBox="0 0 40 40" width={size} height={size} aria-label="uma.moe">
  <defs><linearGradient id="uma-mark" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop stop-color="#78baf7"/><stop offset=".55" stop-color="#8ed39b"/><stop offset="1" stop-color="#efbc68"/></linearGradient></defs>
  <path fill="url(#uma-mark)" d="M20 2.5c9.65 0 17.5 7.85 17.5 17.5S29.65 37.5 20 37.5 2.5 29.65 2.5 20 10.35 2.5 20 2.5Z"/>
  <path fill="#0d1118" d="M10.2 12h5.1v10.2c0 2.15 1.2 3.35 3.05 3.35 1.9 0 3.1-1.2 3.1-3.35V12h5.1v10.5c0 5.05-3.25 7.8-8.2 7.8-4.9 0-8.15-2.75-8.15-7.8V12Z"/>
  <path fill="#0d1118" d="m25.4 11.4 2-4.2 2.9 4.9-4.9-.7Z"/>
</svg>

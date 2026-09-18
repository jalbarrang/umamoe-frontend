<script lang="ts">
  import '../../ui/hakuraku/hakuraku.css';
  import '../../ui/hakuraku/moe-skin.css';
  import { hakurakuComponentCount } from './hakuraku-registry';
  import HakuFoundationShowcase from './haku/HakuFoundationShowcase.svelte';
  import HakuRacePresenterShowcase from './haku/HakuRacePresenterShowcase.svelte';
  import HakuReplayShowcase from './haku/HakuReplayShowcase.svelte';
  import HakuMultiRaceShowcase from './haku/HakuMultiRaceShowcase.svelte';
  import HakuUmaLogsShowcase from './haku/HakuUmaLogsShowcase.svelte';
  import HakuVeteransShowcase from './haku/HakuVeteransShowcase.svelte';
  import HakuPagePatternsShowcase from './haku/HakuPagePatternsShowcase.svelte';
</script>

<div class="haku-catalogue" data-hakuraku-library>
  <header class="haku-catalogue-summary">
    <div>
      <h2 id="ui-lab-title">Hakuraku component catalogue</h2>
      <p><span>{hakurakuComponentCount} interface contracts</span><span>uma.moe base theme</span><span>framework-free Svelte ports</span></p>
    </div>
    <a href="https://github.com/ayaliz/hakuraku/" target="_blank" rel="noreferrer">View source ↗</a>
  </header>
  <HakuFoundationShowcase/>
  <HakuRacePresenterShowcase/>
  <HakuReplayShowcase/>
  <HakuMultiRaceShowcase/>
  <HakuUmaLogsShowcase/>
  <HakuVeteransShowcase/>
  <HakuPagePatternsShowcase/>
</div>

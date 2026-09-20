<script lang="ts">
  import { onMount } from 'svelte';
  import { fuseEnabled } from '@/services/ads/fuse-ads';

  const containers = '.publift-widget-sticky_footer-container, .publift-widget-scrolling_sticky_footer-container';
  const providerButton = '.publift-widget-sticky_footer-button, .publift-widget-scrolling_sticky_footer-button';

  onMount(() => {
    if (!fuseEnabled()) return;
    const destroyed = new WeakSet<HTMLElement>();
    const dismissed = () => document.documentElement.classList.contains('footer-ad-dismissed');
    const destroy = (container: Element) => {
      // Let Publift stop rotation/refresh and restore any page offsets before destroying the zone.
      if (!container.classList.contains('closed')) container.querySelector<HTMLElement>(providerButton)?.click();
      container.querySelectorAll<HTMLElement>('[data-fuse][id]').forEach(zone => {
        if (destroyed.has(zone) || !window.fusetag?.destroyZone) return;
        destroyed.add(zone);
        window.fusetag.destroyZone(zone.id);
      });
    };
    const sync = () => {
      document.querySelectorAll<HTMLElement>(containers).forEach(container => {
        if (dismissed()) {
          destroy(container);
          // Publift retains scroll handlers referencing this wrapper; keep its hidden DOM intact.
          return;
        }
        container.classList.add('uma-footer-ad');
        if (container.querySelector('.footer-ad-close')) return;
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'footer-ad-close';
        close.setAttribute('aria-label', 'Close footer ad');
        close.title = 'Close footer ad';
        close.textContent = '×';
        close.onclick = () => {
          // Document state survives SPA navigation, but resets on a fresh page load.
          document.documentElement.classList.add('footer-ad-dismissed');
          sync();
        };
        container.append(close);
      });
    };
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    sync();
    return () => observer.disconnect();
  });
</script>

<style>
  /* The iframe's native dimensions size the wrapper, including on provider refresh.
     Override publisher geometry, without touching the creative inside its iframe. */
  :global(.uma-footer-ad) {
    position: fixed !important;
    inset: auto auto 0 50% !important;
    width: max-content !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: translateX(-50%) !important;
    overflow: visible !important;
    border: 0 !important;
    background: var(--surface-overlay) !important;
    box-shadow: 0 0 0 1px var(--border-primary), var(--shadow-md) !important;
    z-index: var(--z-rail) !important;
    transition: none !important;
  }
  :global(.uma-footer-ad > :is(.publift-widget-sticky_footer, .publift-widget-scrolling_sticky_footer)),
  :global(.uma-footer-ad .fuse-slot-sticky),
  :global(.uma-footer-ad .fuse-slot) {
    width: max-content !important;
    height: auto !important;
    min-width: 0 !important;
    min-height: 0 !important;
    max-width: none !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    background: transparent !important;
    transform: none !important;
    transition: none !important;
  }
  :global(.uma-footer-ad iframe) { vertical-align: bottom; }
  :global(.uma-footer-ad > [class$='-container-background']),
  :global(.uma-footer-ad > [class$='-button']),
  :global(.uma-footer-ad:not(:has(iframe))),
  :global(html.footer-ad-dismissed :is(.publift-widget-sticky_footer-container, .publift-widget-scrolling_sticky_footer-container)) { display: none !important; }
  :global(.footer-ad-close) {
    position: absolute;
    right: 0;
    bottom: 100%;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-md) var(--radius-md) 0 0;
    background: var(--surface-overlay);
    color: var(--text-secondary);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
  }
  :global(.footer-ad-close:hover) { background: var(--surface-2); color: var(--text-primary); }
  @media (pointer: coarse) {
    :global(.footer-ad-close) { width: 44px; height: 44px; }
  }
</style>

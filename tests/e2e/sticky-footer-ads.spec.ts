import { expect, test } from './fixtures/test';
import { mockDatabase } from './fixtures/api';

test('footer follows creative refreshes, survives navigation, and stays closed until a fresh load', async ({ page, isMobile }) => {
  await mockDatabase(page);
  await page.route('https://cdn.fuseplatform.net/**/fuse.js', route => route.fulfill({
    contentType: 'application/javascript',
    body: `
      window.adPages = 0;
      window.adDestroyed = [];
      window.footerRefreshes = 0;
      let refresh;
      const name = 'publift-widget-scrolling_sticky_footer';
      window.injectFooter = () => {
        clearInterval(refresh);
        document.querySelector('.' + name + '-container')?.remove();
        const container = document.createElement('div');
        container.className = name + '-container';
        container.style.cssText = 'display:block;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:970px;height:126px;background:#efefef;z-index:997';
        container.innerHTML = '<div class="' + name + '-container-background" style="background:#efefef;position:absolute;inset:0"></div>' +
          '<div class="' + name + '-button" style="display:flex"><div></div><div></div></div>' +
          '<div class="' + name + '" style="width:970px;height:126px;display:flex;align-items:end;justify-content:center">' +
          '<div id="fuse-injected-scrolling_sticky_footer-1" data-fuse="scrolling_sticky_footer" class="fuse-slot-sticky"><div id="fuse-slot-scrolling_sticky_footer-1" class="fuse-slot"><div style="border:0;margin:auto;text-align:center"></div></div></div></div>';
        container.querySelector('.' + name + '-button').onclick = () => { container.classList.add('closed'); clearInterval(refresh); };
        document.body.append(container);
        // Publift's scrolling widget keeps a scroll handler which reads its wrapper.
        window.addEventListener('scroll', () => document.querySelector('.' + name).style.marginTop = '0px');
        window.refreshFooter = (width, height) => {
          const frame = document.createElement('iframe');
          frame.title = 'Test advertisement';
          frame.width = width;
          frame.height = height;
          frame.style.cssText = 'border:0;vertical-align:bottom';
          frame.srcdoc = '<body style="margin:0;background:#183342;color:white;display:grid;place-items:center;height:100vh;font:16px system-ui">Advertisement</body>';
          container.querySelector('.fuse-slot > div').replaceChildren(frame);
          container.querySelector('.fuse-slot-sticky').style.marginTop = '-36px';
          container.style.display = 'block';
          window.footerRefreshes++;
        };
        window.refreshFooter(innerWidth < 768 ? 320 : 728, 90);
        refresh = setInterval(() => window.refreshFooter(innerWidth < 768 ? 300 : 970, innerWidth < 768 ? 100 : 250), 30000);
      };
      window.fusetag = {
        pageInit() { window.adPages++; window.injectFooter(); },
        registerZone(id) { document.getElementById(id).textContent = 'Route advertisement'; },
        destroyZone(id) { window.adDestroyed.push(id); if (id.includes('scrolling_sticky_footer')) clearInterval(refresh); }
      };
    `
  }));
  await page.clock.install();
  await page.goto('/database');
  const footer = page.locator('.uma-footer-ad');
  const close = page.getByRole('button', { name: 'Close footer ad', exact: true });
  const frame = footer.locator('iframe');
  const checkGeometry = async (width: number, height: number) => {
    await expect(frame).toHaveAttribute('width', String(width));
    const ad = (await frame.boundingBox())!;
    const wrapper = (await footer.boundingBox())!;
    const button = (await close.boundingBox())!;
    expect(ad.width).toBe(width);
    expect(ad.height).toBe(height);
    expect(wrapper.width).toBe(width);
    expect(wrapper.height).toBe(height);
    expect(ad.y + ad.height).toBeCloseTo(page.viewportSize()!.height, 0);
    expect(ad.x + ad.width / 2).toBeCloseTo(page.viewportSize()!.width / 2, 0);
    expect(button.x + button.width).toBeCloseTo(ad.x + ad.width, 0);
    expect(button.y + button.height).toBeCloseTo(ad.y, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  };
  await expect(close).toBeVisible();
  await checkGeometry(isMobile ? 320 : 728, 90);
  await expect(footer.locator('[class$="-container-background"]')).toBeHidden();
  await expect(footer.locator('[class$="-button"]')).toBeHidden();
  await footer.evaluate(element => element.setAttribute('data-original-instance', 'true'));
  // Use the real client-side router so a document reload cannot accidentally pass.
  await page.locator('.veterans-action').click();
  await expect(page).toHaveURL(/\/veterans/);
  await expect(footer).toHaveAttribute('data-original-instance', 'true');
  expect(await page.evaluate(() => (window as any).adPages)).toBe(1);
  await page.clock.fastForward(30_000);
  await checkGeometry(isMobile ? 300 : 970, isMobile ? 100 : 250);
  await page.evaluate(() => (window as any).refreshFooter(innerWidth < 768 ? 320 : 728, 90));
  await checkGeometry(isMobile ? 320 : 728, 90);
  const background = await close.evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: 'Toggle theme', exact: true }).click();
  expect(await close.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(background);
  expect(await close.evaluate(element => getComputedStyle(element).backgroundColor)).toBe(await footer.evaluate(element => getComputedStyle(element).backgroundColor));
  await page.screenshot({ path: test.info().outputPath('footer-ad.png') });
  // A native button is operable from the keyboard as well as touch/pointer.
  await close.focus();
  await close.press('Enter');
  await expect(footer).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  expect(await page.evaluate(() => (window as any).adDestroyed)).toContain('fuse-injected-scrolling_sticky_footer-1');
  const refreshes = await page.evaluate(() => (window as any).footerRefreshes);
  await page.goBack();
  await expect(page).toHaveURL(/\/database/);
  await expect(page.locator('[data-ad-kind]:visible').first()).toContainText('Route advertisement');
  await page.clock.fastForward(30_000);
  expect(await page.evaluate(() => (window as any).footerRefreshes)).toBe(refreshes);
  // Late publisher injection must also stay dismissed for this document.
  await page.evaluate(() => (window as any).injectFooter());
  await expect(close).toBeHidden();
  await expect(page.locator('.publift-widget-scrolling_sticky_footer-container')).toBeHidden();
  await page.evaluate(() => window.dispatchEvent(new Event('scroll')));
  await page.reload();
  await expect(close).toBeVisible();
  expect(await page.evaluate(() => (window as any).adPages)).toBe(1);
});

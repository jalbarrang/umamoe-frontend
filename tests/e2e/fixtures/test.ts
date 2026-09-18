import { test as base, expect, type Locator } from '@playwright/test';
import { mockAdvertising } from './angular-api';
import factors from '../../../src/data/factors.json' with { type: 'json' };
export { expect } from '@playwright/test';
export type { Page, Locator } from '@playwright/test';

// CodeMirror owns selection in its editor state. Native contenteditable fill()
// can race its DOM observer; exercise the actual keyboard replace-all workflow.
export async function replaceQuery(editor: Locator, value: string): Promise<void> {
  const apple = await editor.evaluate(() => /Mac|iP(hone|ad|od)/.test(`${navigator.platform} ${navigator.userAgent}`));
  await editor.press(apple ? 'Meta+A' : 'Control+A');
  if (value) await editor.page().keyboard.insertText(value);
  else await editor.press('Backspace');
}

// Native range inputs do not support Playwright fill(). Dispatch their input event.
export async function setSliderValue(slider: Locator, value: number): Promise<void> {
  await slider.evaluate((element, next) => {
    (element as HTMLInputElement).value = String(next);
    element.dispatchEvent(new Event('input', {bubbles:true}));
  }, value);
}

export const test = base.extend<{ runtimeErrors: void; allowPageLoadFailure: boolean }>({
  allowPageLoadFailure: [false, { option: true }],
  runtimeErrors: [async ({ context, allowPageLoadFailure }, use) => {
    await mockAdvertising(context);
    await context.route('https://status.uma.moe/api/v1/endpoints/statuses', route => route.fulfill({ json: [{ name: 'API', group: 'uma.moe', results: [{ success: true }] }] }));
    // Page-specific resource/failure routes override this populated catalog baseline.
    await context.route('**/resources/manifest.json*', route => route.fulfill({json:{version:'test'}}));
    await context.route('**/resources/*/factors.json*', route => route.fulfill({json:factors}));
    // Workflows use a returning visitor; onboarding tests explicitly select the new audience.
    await context.addInitScript(() => {
      if (!/^https?:$/.test(location.protocol)) return;
      try {
        if (!localStorage.getItem('page-introduction-audience-v1')) localStorage.setItem('page-introduction-audience-v1', 'existing');
        if (!localStorage.getItem('lastSeenUpdateVersion')) localStorage.setItem('lastSeenUpdateVersion', '16');
      } catch { /* Sandboxed third-party frames do not share our visitor state. */ }
    });
    const errors: string[] = [];
    context.on('page', (page) => {
      page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
      page.on('console', (message) => {
        if (!allowPageLoadFailure && message.type() === 'error' && message.text().startsWith('Page module could not be loaded:')) errors.push(`${page.url()}: ${message.text()}`);
      });
    });
    await use();
    expect(errors, 'Uncaught browser errors, including opened tabs').toEqual([]);
  }, { auto: true }]
});

import { expect, test, type Page } from './fixtures/test';
import { mockAffinity, mockDatabase, mockVeteranProfile, profile, veteran } from './fixtures/angular-api';

const first = '123456789012', second = '222222222222';
const imported = { ...veteran, id: 'imported', member_id: null, trained_chara_id: 90001, card_id: 100101, succession_chara_array: [] };
const upload = (value: unknown, name = 'veterans.json') => ({ name, mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)) });
async function resources(page: Page) { await mockDatabase(page); await mockAffinity(page); await mockVeteranProfile(page); }
async function picker(page: Page) {
  await page.goto('/database'); await page.getByRole('button', { name: /Filters/ }).click();
  await page.getByRole('radio', { name: 'Advanced', exact: true }).click();
  await page.getByRole('button', { name: 'Pick your legacy', exact: true }).click();
  return page.getByRole('dialog', { name: 'Select Parent', exact: true });
}
async function accounts(page: Page) {
  await page.route('**/api/auth/me', route => route.fulfill({ json: { id: 'owner', display_name: 'Owner', created_at: '' } }));
  await page.route('**/api/auth/accounts', route => route.fulfill({ json: [
    { id: 1, account_id: first, trainer_name: 'First account', verification_status: 'verified' },
    { id: 2, account_id: second, trainer_name: 'Second account', verification_status: 'verified' },
    { id: 3, account_id: '333333333333', trainer_name: 'Unverified', verification_status: 'pending' }
  ] }));
  await page.route('**/api/auth/bookmarks', route => route.fulfill({ json: [] }));
  await page.route('**/api/v4/partner/saved', route => route.fulfill({ json: [] }));
}

test('guest imports persist, reject a bad batch, and are available in both Database and Lineage pickers', async ({ page }, info) => {
  await resources(page); const posted: string[] = []; page.on('request', request => { if (request.url().includes('/ingest/')) posted.push(request.url()); });
  await page.goto('/veterans');
  const lookup = page.getByRole('form', { name: 'Find a trainer’s collection', exact: true });
  const drop = page.locator('.collection-controls .drop');
  await expect(lookup).toBeVisible();
  await expect(page.getByRole('link', { name: 'Get umadump', exact: true })).toBeVisible();
  const lookupBox = (await lookup.boundingBox())!, dropBox = (await drop.boundingBox())!;
  expect(lookupBox.y + lookupBox.height).toBeLessThan(dropBox.y);
  expect(dropBox.height).toBeGreaterThanOrEqual(160);
  expect(dropBox.height).toBeLessThanOrEqual(200);
  await page.locator('.collection-controls input[type=file]').setInputFiles(upload({ veterans: [imported] }));
  await expect(page.locator('.veteran-card')).toHaveCount(1);
  await expect(page.locator('.feedback')).toContainText('Sign in to add them to your account');
  await page.locator('.collection-controls input[type=file]').setInputFiles([upload([{ ...imported, trained_chara_id: 90002 }]), upload([{ card_id: 0 }], 'broken.json')]);
  await expect(page.getByRole('alert')).toContainText('broken.json'); await expect(page.locator('.veteran-card')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.veteran-card')).toHaveCount(1);
  await page.screenshot({ path: info.outputPath('device-collection.png'), fullPage: true });
  const dialog = await picker(page); await expect(dialog.locator('.parent-row')).toHaveCount(1);
  await expect(dialog.getByRole('tab', { name: /Veterans/ }).locator('small')).toHaveText('1');
  await dialog.getByRole('tab', { name: /Manual/ }).click();
  const transfer = await page.evaluateHandle(data => { const transfer = new DataTransfer(); transfer.items.add(new File([JSON.stringify([data])], 'drop.json', { type: 'application/json' })); return transfer; }, { ...imported, trained_chara_id: 90002, card_id: 101301 });
  await dialog.locator('.picker-body').dispatchEvent('dragenter', { dataTransfer: transfer });
  await expect(dialog.locator('.drop-overlay')).toContainText('Drop here to upload');
  await dialog.locator('.picker-body').dispatchEvent('drop', { dataTransfer: transfer });
  await expect(dialog.getByRole('tab', { name: /Veterans/ })).toHaveAttribute('aria-selected', 'true');
  await expect(dialog.locator('.parent-row')).toHaveCount(2); await expect(dialog.locator('.drop-overlay')).toHaveCount(0);
  await expect(dialog.getByRole('tab', { name: /Veterans/ }).locator('small')).toHaveText('2');
  await dialog.locator('.select-parent').first().click(); await expect(page.getByRole('button', { name: 'Clear selected legacy' })).toBeVisible();
  const searches: URLSearchParams[] = [], remoteDeviceLookups: string[] = [];
  page.on('request', request => { if (request.url().includes('/search/query?')) searches.push(new URL(request.url()).searchParams); if (request.url().includes('/profile/veterans/device-')) remoteDeviceLookups.push(request.url()); });
  const query = { uql: 'owned legacy = [Special Week #device-local-trained-90001] and Main Speed >= 3' };
  await page.goto(`/database?filters=${encodeURIComponent(Buffer.from(JSON.stringify(query)).toString('base64'))}`);
  await expect.poll(() => searches.at(-1)?.get('p2_main_chara_id')).toBe('1001');
  searches.length = 0; await page.reload(); await expect.poll(() => searches.at(-1)?.get('p2_main_chara_id')).toBe('1001');
  expect(remoteDeviceLookups).toEqual([]);
  await page.goto('/tools/lineage-planner?cards=100101,0,0,0,0');
  await page.getByRole('button', { name: 'Pick Veteran for Parent 1', exact: true }).click();
  await expect(dialog.locator('.parent-row')).toHaveCount(2);
  await dialog.getByRole('button', { name: 'Select Mejiro McQueen', exact: true }).click();
  await expect(dialog).not.toBeVisible(); expect(posted).toEqual([]);
});

test('empty picker shares the Veterans upload panel and keeps export and sign-in visible', async ({ page }, info) => {
  await resources(page); const dialog = await picker(page);
  const drop = dialog.locator('.empty-upload .drop'); await expect(drop).toBeVisible();
  const target = await drop.boundingBox(), body = await dialog.locator('.picker-body').boundingBox();
  const signIn = await dialog.getByRole('link', { name: 'Sign in', exact: true }).boundingBox();
  expect(Math.abs(target!.x + target!.width / 2 - body!.x - body!.width / 2)).toBeLessThan(2);
  expect(target!.y).toBeGreaterThan(body!.y + 35); expect(signIn!.y).toBeGreaterThanOrEqual(target!.y + target!.height);
  await expect(dialog.locator('.collection-controls')).not.toBeVisible();
  await expect(dialog.getByRole('textbox', { name:'Search parents', exact:true })).toBeVisible();
  await expect(dialog.getByRole('button', { name:'Add Spark Filter' })).toBeVisible();
  await expect(dialog.getByRole('link', { name:'Get umadump', exact:true })).toHaveClass(/ui-button--primary/);
  await expect(dialog.getByRole('tab').locator('small')).toHaveText(['0','0','0','0']);
  for (const theme of ['dark','light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme=theme, theme);
    for (const width of [320,390,1200]) {
      await page.setViewportSize({width,height:844});
      await expect(dialog.getByRole('link', {name:'Sign in',exact:true})).toBeInViewport();
      await expect(dialog.getByRole('link', {name:'Get umadump',exact:true})).toBeInViewport();
      expect(await dialog.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
      const tabs = dialog.getByRole('tablist', { name:'Veteran picker sections' });
      expect(await tabs.evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
      for (const badge of await tabs.locator('small').all()) await expect(badge).toBeInViewport();
      const bodyBounds = (await dialog.locator('.picker-body').boundingBox())!, uploadBounds = (await dialog.locator('.picker-upload').boundingBox())!;
      expect(uploadBounds.y - bodyBounds.y).toBeLessThanOrEqual(24);
      const dialogBounds = (await dialog.boundingBox())!, footerBounds = (await dialog.locator('.signin-footer').boundingBox())!;
      expect(Math.abs(dialogBounds.y + dialogBounds.height - footerBounds.y - footerBounds.height)).toBeLessThanOrEqual(2);
    }
  }
  await dialog.screenshot({ path: info.outputPath('veterans-upload-panel.png') });
  const chooser = page.waitForEvent('filechooser');
  await drop.getByText('Browse files', { exact:true }).click();
  await (await chooser).setFiles(upload([imported]));
  await expect(dialog.locator('.parent-row')).toHaveCount(1);
  await expect(dialog.getByRole('tab', { name:/Veterans/ }).locator('small')).toHaveText('1');
});

test('account imports append, recover after failure, and stay bound to the selected account during a switch', async ({ page }) => {
  await resources(page); await accounts(page); await page.addInitScript(() => localStorage.setItem('auth_token', 'owner-token'));
  const collections: Record<string, unknown[]> = { [first]: [veteran], [second]: [] }, posts: string[] = [];
  for (const id of [first, second]) await page.route(`**/api/v4/user/profile/${id}`, route => route.fulfill({ json: { ...profile, veterans: collections[id] } }));
  let fail = true, release!: () => void;
  const pending = new Promise<void>(resolve => release = resolve);
  await page.route('**/ingest/veteran/append?*', async route => {
    const id = new URL(route.request().url()).searchParams.get('account_id')!; posts.push(id);
    if (fail) return route.fulfill({ status: 500, json: { error: 'Offline' } });
    await pending; collections[id] = [...collections[id]!, ...route.request().postDataJSON()];
    return route.fulfill({ json: { inserted: 1, updated: 0, deleted: 0, total: collections[id]!.length } });
  });
  await page.goto('/veterans'); await expect(page.getByRole('radio', { name: 'First account', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.locator('input[type=file]').setInputFiles(upload([imported]));
  await expect(page.getByRole('alert')).toContainText('Saved on this device'); await expect(page.locator('.veteran-card')).toHaveCount(2);
  await page.reload(); await expect(page.getByRole('button', { name: 'Retry upload' })).toBeVisible();
  await expect(page.locator('.veteran-card')).toHaveCount(2); fail = false;
  try {
    await page.getByRole('button', { name: 'Retry upload' }).click(); await expect.poll(() => posts.length).toBe(2);
    await page.getByRole('radio', { name: 'Second account', exact: true }).click(); await expect(page.locator('.veteran-card')).toHaveCount(0);
  } finally { release(); }
  await expect(page.locator('.feedback')).toContainText('added to First account');
  await expect(page.locator('.veteran-card')).toHaveCount(0); expect(posts).toEqual([first, first]); expect(collections[first]).toHaveLength(2);
  const dialog = await picker(page); await expect(dialog.getByRole('radio', { name: 'Second account', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(dialog.locator('.parent-row')).toHaveCount(0);
  await dialog.getByRole('radio', { name: 'First account', exact: true }).click(); await expect(dialog.locator('.parent-row')).toHaveCount(2);
  await expect(dialog.getByRole('radio', { name: 'Unverified' })).toHaveCount(0);
});

test('signing in keeps guest veterans and lets the user attach them to a chosen connected account', async ({ page }) => {
  await resources(page); await accounts(page); let secondRecords: unknown[] = [veteran], postedTo = '';
  await page.route(`**/api/v4/user/profile/${second}`, route => route.fulfill({ json: { ...profile, veterans: secondRecords } }));
  await page.route('**/ingest/veteran/append?*', route => { postedTo = new URL(route.request().url()).searchParams.get('account_id')!; secondRecords = [...secondRecords, ...route.request().postDataJSON()]; return route.fulfill({ json: { inserted: 1, updated: 0, deleted: 0, total: secondRecords.length } }); });
  await page.route('**/api/auth/login/google?*', route => route.fulfill({ json: { url: new URL('/signin?token=owner-token', page.url()).href } }));
  await page.goto('/veterans'); await page.locator('input[type=file]').setInputFiles(upload([imported]));
  await expect(page.locator('.veteran-card')).toHaveCount(1);
  await page.getByRole('region', { name: 'Veteran collection', exact: true }).getByRole('link', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  await expect(page).toHaveURL(url => url.pathname === '/veterans');
  expect(await page.evaluate(() => sessionStorage.getItem('auth_return_to'))).toBeNull();
  await expect(page.getByRole('region', { name: 'Add device veterans to your account', exact: true })).toContainText('1 veteran saved on this device');
  expect(postedTo).toBe('');
  await page.getByRole('radio', { name: 'Second account', exact: true }).click();
  await page.getByRole('button', { name: 'Add 1 from this device', exact: true }).click();
  await expect(page.locator('.feedback')).toContainText('added to Second account'); expect(postedTo).toBe(second);
  await expect(page.locator('.veteran-card')).toHaveCount(2);
  expect(secondRecords).toContainEqual(veteran);
  await page.getByRole('radio', { name: 'This device', exact: true }).click(); await expect(page.locator('.veteran-card')).toHaveCount(1);
  await page.reload(); await expect(page.locator('.veteran-card')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Add device veterans to your account', exact: true })).toContainText('Choose a trainer account above');
});

test('veteran drop controls and account switch fit the dialog in both themes', async ({ page }, info) => {
  await resources(page); await accounts(page); await page.addInitScript(() => localStorage.setItem('auth_token', 'owner-token'));
  const dialog = await picker(page);
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    await expect(dialog.locator('.parent-row')).toHaveCount(1);
    expect(await dialog.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize()!.width);
    const row = await dialog.locator('.parent-row').first().boundingBox(); const body = await dialog.locator('.picker-body').boundingBox();
    expect(body!.height).toBeGreaterThan(150); expect(row!.y).toBeLessThan(body!.y + body!.height);
    await dialog.screenshot({ path: info.outputPath(`veteran-picker-${theme}.png`) });
  }
});

test('an unverified profile imports locally instead of uploading to another linked account', async ({ page }) => {
  await resources(page); await accounts(page); await page.addInitScript(() => localStorage.setItem('auth_token', 'owner-token'));
  const unverified = '333333333333'; const posted: string[] = [];
  page.on('request', request => { if (request.url().includes('/ingest/')) posted.push(request.url()); });
  await page.route(`**/api/v4/user/profile/${unverified}`, route => route.fulfill({ json: { ...profile, trainer: { ...profile.trainer, account_id: unverified }, veterans: [] } }));
  await page.route(`**/api/v4/user/profile/${unverified}/visibility`, route => route.fulfill({ json: { profile_hidden: false, hidden_sections: [] } }));
  await page.goto(`/veterans/${unverified}`);
  await expect(page.getByRole('radio', { name: 'This device', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.locator('.collection-controls input[type=file]').setInputFiles(upload([imported]));
  await expect(page.locator('.feedback')).toContainText('saved on this device');
  expect(posted).toEqual([]);
  await page.getByRole('radio', { name: 'This device', exact: true }).click();
  await expect(page).toHaveURL(/\/veterans$/); await expect(page.locator('.veteran-card')).toHaveCount(1);
});

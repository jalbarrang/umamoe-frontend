import { expect, test } from './fixtures/test';

for (const width of [320,768,1280,1536]) {
  test('current component galleries fit '+width+'px in both themes', async ({page},testInfo) => {
    test.setTimeout(120_000);
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewportSize({width,height:1000});
    await page.goto('/ui');
    await expect(page.getByRole('heading',{name:'UI components',exact:true})).toBeVisible();
    for(const theme of ['Dark','Light']) {
      await page.getByRole('radio',{name:theme,exact:true}).click();
      for(const library of ['uma.moe','Hakuraku']) {
        await page.getByRole('tab',{name:library,exact:true}).click();
        const groups=await page.getByRole('navigation',{name:'Component groups'}).getByRole('button').allTextContents();
        for(let i=0;i<groups.length;i++) {
          await page.getByRole('navigation',{name:'Component groups'}).getByRole('button').nth(i).click();
          await expect(page.locator('.preview').first()).toBeVisible();
          expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
          for(const section of await page.locator('.preview').all()) {
            await section.scrollIntoViewIfNeeded();
            await expect.poll(()=>section.locator('img:visible').evaluateAll(images=>images.every(img=>(img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth>0))).toBe(true);
          }
          if(groups[i]!.startsWith('Statistics')) await page.locator('#statistics-filters').screenshot({path:testInfo.outputPath('filters-'+theme+'.png')});
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

test('gallery search, library navigation and actual dialogs work', async ({page}) => {
  await page.goto('/ui');
  await page.getByRole('searchbox',{name:'Find a component'}).fill('SkillChip');
  await expect(page.locator('.preview')).toHaveCount(1);
  await expect(page.locator('#identity')).toBeVisible();
  await page.getByRole('searchbox',{name:'Find a component'}).fill('retired component');
  await expect(page.getByText('No components match')).toBeVisible();
  await page.getByRole('button',{name:/Feedback/}).click();
  const opener=page.getByRole('button',{name:'Open dialog',exact:true});
  await opener.click();
  await expect(page.getByRole('dialog',{name:'Preview dialog',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page.getByRole('tab',{name:'Hakuraku',exact:true}).click();
  await page.getByRole('button',{name:/Statistics/}).click();
  const filters=page.locator('#statistics-filters');
  await filters.getByRole('checkbox',{name:'Class 6',exact:true}).uncheck();
  await expect(filters.getByRole('status')).toContainText('1,000,000');
  await filters.getByRole('button',{name:'Open filter dialog'}).click();
  const dialog=page.getByRole('dialog',{name:'Statistics filters'});
  await expect(dialog.getByRole('checkbox',{name:'Class 6',exact:true})).not.toBeChecked();
  await dialog.getByRole('button',{name:'Reset filters'}).click();
  await dialog.getByRole('button',{name:'Show results'}).click();
  await expect(filters.getByRole('checkbox',{name:'Class 6',exact:true})).toBeChecked();
});

test('target picker changes and clears a selected Uma', async ({page}) => {
  await page.goto('/ui#affinity-picker');
  const picker=page.locator('#affinity-picker');
  await picker.getByRole('button',{name:'Change target character',exact:true}).click();
  await page.getByRole('dialog',{name:'Select Character',exact:true}).getByRole('radio',{name:/Oguri Cap/}).click();
  await expect(picker.getByRole('button',{name:'Change target Oguri Cap',exact:true})).toBeVisible();
  await picker.getByRole('button',{name:'Clear target character',exact:true}).click();
  await expect(picker.getByRole('button',{name:'Pick target character',exact:true})).toBeVisible();
});

test('number fields share chevrons and preserve native stepping', async ({ page }) => {
  await page.goto('/ui-lab');
  const number = page.getByRole('spinbutton', { name: 'Number', exact: true });
  const increase = page.getByRole('button', { name: 'Increase Number', exact: true });
  const decrease = page.getByRole('button', { name: 'Decrease Number', exact: true });
  await number.evaluate(input => {
    for (const name of ['input', 'change']) input.addEventListener(name, () => input.setAttribute(`data-${name}-value`, (input as HTMLInputElement).value));
  });
  await increase.click();
  await expect(number).toHaveValue('0.25');
  await expect(number).toHaveAttribute('data-input-value', '0.25');
  await expect(number).toHaveAttribute('data-change-value', '0.25');
  await number.press('ArrowUp');
  await expect(number).toHaveValue('0.5');
  await number.fill('1.9');
  await increase.click();
  await expect(number).toHaveValue('2');
  await expect(increase).toBeDisabled();
  await decrease.click();
  await expect(number).toHaveValue('1.75');
  await number.fill('0');
  await expect(decrease).toBeDisabled();
  await number.fill('');
  await expect(decrease).toBeEnabled();
  await decrease.click();
  await expect(number).toHaveValue('0');
  for (const label of ['Read only number', 'Disabled number']) {
    await expect(page.getByRole('button', { name: `Increase ${label}`, exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: `Decrease ${label}`, exact: true })).toBeDisabled();
  }
  for (const theme of ['Dark', 'Light']) {
    await page.getByRole('radio', { name: theme, exact: true }).click();
    await expect(number).toHaveCSS('appearance', 'textfield');
    await expect(increase.locator('svg')).toHaveCSS('transform', 'matrix(-1, 0, 0, -1, 0, 0)');
    await expect(decrease.locator('svg')).toHaveCSS('transform', 'none');
    await page.locator('#text-field').screenshot({path:test.info().outputPath(`number-fields-${theme.toLowerCase()}.png`)});
  }
});

test('custom select and autocomplete retain keyboard behavior', async ({ page }) => {
  await page.goto('/ui-lab');

  const region = page.getByRole('combobox', { name: 'Data region', exact: true });
  await region.click();
  await expect(page.getByRole('listbox', { name: 'Data region', exact: true })).toBeVisible();
  const normalHeight=(await page.getByRole('option',{name:'Japan',exact:true}).boundingBox())!.height;
  await page.getByRole('option', { name: 'Japan' }).click();
  await expect(region).toContainText('Japan');
  const slim=page.getByRole('combobox',{name:'Data region (slim)',exact:true});
  await expect(slim).toContainText('Japan');
  await slim.click();
  expect((await page.getByRole('option',{name:'Japan',exact:true}).boundingBox())!.height).toBeLessThan(normalHeight);
  await slim.press('Home');
  await slim.press('Enter');
  await expect(slim).toContainText('Global');
  await expect(region).toContainText('Global');

  const character = page.getByRole('combobox', { name: 'Character' });
  await character.fill('Mejiro');
  await expect(page.getByRole('listbox', { name: 'Character suggestions' }).getByRole('option', { name: 'Mejiro McQueen' })).toBeVisible();
  await character.press('Enter');
  await expect(character).toHaveValue('Mejiro McQueen');
});

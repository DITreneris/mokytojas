const { test, expect } = require('@playwright/test');

test.describe('core first-run flows', () => {
  test.describe.configure({ timeout: 60000 });
  test.use({ viewport: { width: 375, height: 812 } });

  test('first-run generate and copy shows toast', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    await page.fill('#l-goal', 'Suprasti fotosintezes procesa');
    await page.fill('#l-topic', 'Fotosinteze');
    await page.selectOption('#l-duration', { label: '45 min.' });
    await page.fill('#l-question', 'Paruosk 3 veiklas ir refleksija');

    await page.click('#outputCopyCta');
    await expect(page.locator('#toastMessage')).toContainText(/nukopijuota/i);

    const text = await page.locator('#opsOutput').innerText();
    expect(text).toMatch(/UŽDUOTIS|UZDUOTIS/);
  });

  test('mobile template apply fills question and copy works', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    await page.click('#libraryToggle');
    await page.click('[data-library-apply="lesson_plan"]');

    await expect(page.locator('#l-question')).toHaveValue(/Rolė:|Role:/i);
    await expect(page.locator('#toastMessage')).toContainText(/Šablonas|Sablonas/i);

    await page.click('#outputCopyCta');
    await expect(page.locator('#toastMessage')).toContainText(/nukopijuota/i);
  });

  test('session save and restore survives reload', async ({ page }) => {
    await page.goto('/');

    await page.fill('#l-goal', 'Tikslas testui');
    await page.fill('#l-question', 'Ka daryti pirmiausia?');
    await page.click('#sessionSaveBtn');

    await expect(page.locator('#sessionList .session-item')).toHaveCount(1);
    await page.reload();

    await expect(page.locator('#sessionList .session-item')).toHaveCount(1);

    await page.fill('#l-goal', '');
    await page.locator('#sessionList .session-item').first().click();
    await expect(page.locator('#l-goal')).toHaveValue('Tikslas testui');
  });

  test('accordion stays single-open and hero link opens target section', async ({ page }) => {
    await page.goto('/');

    const libraryToggle = page.locator('#libraryToggle');
    const rulesToggle = page.locator('#rulesToggle');

    await libraryToggle.click();
    await expect(libraryToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(rulesToggle).toHaveAttribute('aria-expanded', 'false');

    await rulesToggle.click();
    await expect(rulesToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(libraryToggle).toHaveAttribute('aria-expanded', 'false');

    await page.click('.header-step[href="#library"]');
    await expect(libraryToggle).toHaveAttribute('aria-expanded', 'true');
  });

  test('keyboard arrows switch mode and class select updates output', async ({ page }) => {
    await page.goto('/');

    await page.locator('#tab-lesson').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#tab-assessment')).toHaveAttribute('aria-selected', 'true');

    await page.selectOption('#classLevelSelect', '8');
    await expect(page.locator('#classBadge')).toHaveText(/8 klas[ėe]/i);
  });

  test('keeps only last five saved sessions', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('di_ops_center_sessions');
    });
    await page.reload();

    for (let i = 1; i <= 6; i += 1) {
      await page.fill('#l-goal', `Tikslas ${i}`);
      await page.fill('#l-question', `Klausimas ${i}`);
      await page.locator('#sessionSaveBtn').dispatchEvent('click');
      await page.waitForTimeout(50);
    }

    await expect(page.locator('#sessionList .session-item')).toHaveCount(5);
    await expect(page.locator('#sessionList .session-item').first()).toContainText('PAMOKA');
    await page.locator('#sessionList .session-item').last().click();
    await expect(page.locator('#l-goal')).toHaveValue('Tikslas 2');
  });

  test('clear sessions undo expires after timeout', async ({ page }) => {
    await page.goto('/');
    await page.fill('#l-goal', 'Tikslas timeout testui');
    await page.click('#sessionSaveBtn');
    await expect(page.locator('#sessionList .session-item')).toHaveCount(1);

    page.once('dialog', (dialog) => dialog.accept());
    await page.click('#sessionClearBtn');
    await expect(page.locator('#sessionList .session-item')).toHaveCount(0);
    await expect(page.locator('#sessionClearBtn')).toContainText(/Atkurti sesijas/i);

    await page.waitForTimeout(8300);
    await expect(page.locator('#sessionClearBtn')).toContainText(/Ištrinti sesijas|Istrinti sesijas/i);
  });

  test('copy fallback uses execCommand when clipboard fails', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: () => Promise.reject(new Error('denied'))
        }
      });
      window.__copyCalled = false;
      document.execCommand = function (command) {
        window.__copyCalled = command === 'copy';
        return true;
      };
    });

    await page.goto('/');
    await page.fill('#l-topic', 'Test tema');
    await page.fill('#l-question', 'Sugeneruok trumpa plana');
    await page.click('#outputCopyCta');
    await expect(page.locator('#toastMessage')).toContainText(/nukopijuota/i);
    await expect.poll(async () => page.evaluate(() => window.__copyCalled)).toBeTruthy();
  });
});

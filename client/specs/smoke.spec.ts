import { test, expect } from '@playwright/test';

const url = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(url);
  await page.locator('.ant-btn-primary').click();
  await page.waitForSelector('.top-menu');
});

test.describe('Home', () => {
  test('should have link to Score page', async ({ page }) => {
    expect(await page.locator('text="Score"').isVisible()).toBe(true);

    const href = await page.locator('css=a >> text="Score"').getAttribute('href');
    expect(href.includes('/course/score')).toBeTruthy();
  });
});

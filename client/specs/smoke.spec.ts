import { test, expect } from '@playwright/test';

// eslint-disable-next-line turbo/no-undeclared-env-vars
const url = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(url);
  await page.locator('.ant-btn-primary').click();
  await page.waitForSelector('.profile');
});

test.describe('Home', () => {
  test('should have link to Score page', async ({ page }) => {
    const href = await page.locator('.ant-menu-title-content').filter({ hasText: 'Score' }).getAttribute('href');

    expect(href?.includes('/course/score')).toBeTruthy();
  });
});

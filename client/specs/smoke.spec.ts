import { test, expect } from '@playwright/test';

const url = process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(url);
  await page.getByRole('button', { name: /sign up with gitHub/i }).click();
  await page.waitForSelector('.page-header');
});

test.describe('Home', () => {
  test('should have link to Score page', async ({ page }) => {
    expect(await page.locator('css=a >> text="Score"').isVisible()).toBe(true);

    const href = await page.locator('css=a >> text="Score"').getAttribute('href');
    expect(href?.includes('/course/score')).toBeTruthy();
  });

  test('should navigate to Courses page and verify threshold', async ({ page }) => {
    await page.click('span[role="img"][aria-label="menu-unfold"]');

    await page.click('text=Admin Area');

    const coursesLink = page.locator('text=Courses');
    await expect(coursesLink).toBeVisible();
    await coursesLink.click();

    await page.getByRole('button', { name: /add course/i }).click();

    const certificateThreshold = page.locator('input#certificateThreshold');
    await expect(certificateThreshold).toHaveValue('70');
  });
});

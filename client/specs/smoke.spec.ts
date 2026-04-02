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
    const scoreLink = page.getByRole('link', { name: /score/i });
    await expect(scoreLink).toBeVisible();

    const href = await scoreLink.getAttribute('href');
    expect(href).toMatch(/\/course\/score/);
  });

  test('should navigate to Courses page and verify threshold', async ({ page }) => {
    const adminSider = page.getByTestId('admin-sider');
    const isCollapsed = await adminSider.locator('span[aria-label="menu-unfold"]').isVisible();

    if (isCollapsed) {
      await adminSider.locator('span[aria-label="menu-unfold"]').click();
    }

    await page.getByText('Admin Area').click();

    const coursesLink = page.getByRole('menuitem', { name: 'Courses' });
    await expect(coursesLink).toBeVisible();
    await coursesLink.click();

    await page.getByRole('button', { name: /add course/i }).click();

    const certificateThreshold = page.locator('input#certificateThreshold');
    await expect(certificateThreshold).toHaveValue('70');
  });
});

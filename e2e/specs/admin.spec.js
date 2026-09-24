import { test, expect } from '@playwright/test';
import { loginAsAdmin, ADMIN_USER } from '../helpers';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin dashboard loads with stat cards', async ({ page }) => {
    await expect(page.locator('.page-header h1, .admin-page-header h1, h1').first()).toHaveText('Dashboard');
    await expect(page.locator('.admin-stat-card').first()).toBeVisible({ timeout: 15_000 });
  });

  test('admin sidebar shows admin name', async ({ page }) => {
    await expect(page.locator('.sidebar-user-name')).toHaveText(ADMIN_USER.name);
  });

  test('users page lists seeded users', async ({ page }) => {
    await page.getByRole('link', { name: /Users/ }).click();
    await expect(page).toHaveURL(/\/admin\/users$/);
    await expect(page.locator('h1')).toHaveText('Users');
    await expect(page.getByText('Sarah Chen').first()).toBeVisible({ timeout: 15_000 });
  });

  test('moderation page loads', async ({ page }) => {
    await page.goto('/admin/moderation');
    await expect(page.locator('h1')).toHaveText('Content Moderation');
  });
});
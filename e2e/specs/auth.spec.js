import { test, expect } from '@playwright/test';
import { DEMO_USER, uniqueEmail, loginAsUser, logout } from '../helpers';

test.describe('Authentication & Sessions', () => {
  test('login page renders and lets a user sign in', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await expect(page.getByText(/sarah@example.com \/ password123/i)).toBeVisible();
  });

  test('invalid credentials show an error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('nobody@example.com');
    await page.locator('input[type="password"]').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.locator('[class*="toast"], [role="status"]').first()).toBeVisible({ timeout: 10_000 });
  });

  test('full login -> protected page -> logout round trip', async ({ page }) => {
    await loginAsUser(page);
    await expect(page.getByText('Smart Discovery')).toBeVisible();

    await logout(page);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  test('registration creates an account and signs the user in', async ({ page }) => {
    const email = uniqueEmail('e2e-user');
    await page.goto('/register');
    await page.locator('input[placeholder="Your name"]').fill('E2E Tester');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('password123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await page.waitForURL('**/matches');
    await expect(page.getByText('Smart Discovery')).toBeVisible();
    await expect(page.getByText('E2E Tester')).toBeVisible();
  });

  test('protected routes redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/feed');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('user info shown in the sidebar after login', async ({ page }) => {
    await loginAsUser(page);
    await expect(page.locator('.sidebar-user-name')).toHaveText(DEMO_USER.name);
  });
});
import { expect } from '@playwright/test';

export const DEMO_USER = {
  email: 'sarah@example.com',
  password: 'password123',
  name: 'Sarah Chen',
};

export const ADMIN_USER = {
  email: 'admin@innoconnect.dev',
  password: 'Admin@12345',
  name: 'Platform Admin',
};

export async function loginAs(page, { email, password }) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

export async function loginAsUser(page) {
  await loginAs(page, DEMO_USER);
  await page.waitForURL('**/matches');
  await expect(page.locator('h1').first()).toHaveText('Smart Discovery');
}

export async function loginAsAdmin(page) {
  await loginAs(page, ADMIN_USER);
  await page.waitForURL('**/admin');
}

export async function logout(page) {
  const logoutBtn = page.getByTitle('Logout').first();
  await logoutBtn.click();
  await page.waitForURL('**/login');
}

export function uniqueEmail(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}@test.com`;
}
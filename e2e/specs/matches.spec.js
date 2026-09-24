import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers';

test.describe('Matches / Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('discovery page loads with swipe counter and tabs', async ({ page }) => {
    await expect(page.getByText('Smart Discovery')).toBeVisible();
    await expect(page.getByText(/Swipes today:/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Discover/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Connections \(/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Recommended/ })).toBeVisible();
  });

  test('connections tab renders matches or empty state', async ({ page }) => {
    await page.getByRole('button', { name: /Connections \(/ }).click();
    const matchCard = page.locator('.match-card').first();
    const emptyState = page.locator('.empty-state').first();

    await expect(matchCard.or(emptyState)).toBeVisible();
  });

  test('swipe action is available on a profile card', async ({ page }) => {
    const profileCard = page.locator('.profile-card-enhanced').first();
    const emptyState = page.locator('.empty-state').first();

    if (await emptyState.isVisible()) {
      test.skip();
      return;
    }

    await expect(profileCard).toBeVisible();
    await expect(profileCard.getByRole('button', { name: /Skip/ })).toBeVisible();
    await expect(profileCard.getByRole('button', { name: /Connect/ })).toBeVisible();
    await expect(profileCard.getByRole('button', { name: /Super Like/ })).toBeVisible();
  });
});
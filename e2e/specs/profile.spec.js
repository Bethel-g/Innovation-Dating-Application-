import { test, expect } from '@playwright/test';
import { DEMO_USER, loginAsUser } from '../helpers';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/profile');
  });

  test('own profile shows the user name and headline', async ({ page }) => {
    await expect(page.locator('.profile-name')).toHaveText(DEMO_USER.name);
    await expect(page.locator('.profile-headline, .profile-section h2').first()).toBeVisible();
  });

  test('profile completeness meter is visible', async ({ page }) => {
    await expect(page.locator('.profile-completeness-section')).toBeVisible();
    await expect(page.locator('.progress-bar-fill')).toBeVisible();
  });

  test('editing toggles save/cancel actions', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    await expect(page.getByRole('button', { name: 'Save Changes' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('shows other user profile by navigating from search', async ({ page }) => {
    await page.goto('/search');
    await page.getByRole('button', { name: 'Search' }).click();

    const profileLink = page.locator('a[href^="/profile/"]').first();
    if ((await profileLink.count()) === 0) {
      test.skip();
      return;
    }

    await profileLink.click();
    await expect(page).toHaveURL(/\/profile\/(?!profile)[^/]+/);
    await expect(page.locator('.profile-name')).toBeVisible();
  });
});
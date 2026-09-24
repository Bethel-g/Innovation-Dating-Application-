import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers';

test.describe('Feed', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/feed');
    await expect(page.locator('.composer-card')).toBeVisible({ timeout: 15_000 });
  });

  test('feed page loads with composer, tabs and posts', async ({ page }) => {
    await expect(page.locator('#post-composer')).toBeVisible();
    await expect(page.getByRole('button', { name: /For You/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Following/ })).toBeVisible();

    const postCards = page.locator('.post-card, .feed-post, .post-item');
    if ((await postCards.count()) > 0) {
      await expect(postCards.first()).toBeVisible();
    }
  });

  test('creating a post publishes it to the feed', async ({ page }) => {
    const content = `E2E post ${Date.now()} — hello from automation`;

    await page.locator('#post-composer').fill(content);
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByText('Post shared!')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(content)).toBeVisible({ timeout: 10_000 });
  });

  test('feed tabs can be switched', async ({ page }) => {
    await page.getByRole('button', { name: /Following/ }).click();
    await page.getByRole('button', { name: /Trending/ }).click();
    await expect(page.getByRole('button', { name: /Trending/ })).toHaveClass(/active/);
  });
});
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
});

test('flow editor loads', async ({ page }) => {
  await page.goto('/');

  // Wait for the React app to load
  await page.waitForLoadState('networkidle');

  // Check if the main container is present
  const mainContainer = page.locator('body');
  await expect(mainContainer).toBeVisible();
});
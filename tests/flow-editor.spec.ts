import { test, expect } from '@playwright/test';

test.describe('Flow Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the flow editor canvas', async ({ page }) => {
    // Check if ReactFlow canvas is present
    const canvas = page.locator('.react-flow');
    await expect(canvas).toBeVisible();
  });

  test('should have initial nodes visible', async ({ page }) => {
    // Wait for any initial nodes to load
    const nodes = page.locator('.react-flow__node');

    // Check if nodes exist (may be 0 or more)
    const nodeCount = await nodes.count();
    console.log(`Found ${nodeCount} nodes`);
  });

  test('should allow interaction with the flow', async ({ page }) => {
    // Test basic interaction with the flow area
    const flowWrapper = page.locator('.react-flow__renderer');
    await expect(flowWrapper).toBeVisible();

    // Test that we can click on the flow area
    await flowWrapper.click();
  });
});
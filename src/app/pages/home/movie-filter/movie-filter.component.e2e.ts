import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Resizing', () => {
  test('should hide overflowing inview filters', async ({ page }) => {
    const lastInviewFilter = page.locator('.inview-filter:last-child');
    const width = await lastInviewFilter.evaluate((e) => {
      const errorMargin = 100;

      return e.getBoundingClientRect().left - errorMargin;
    });

    await page.setViewportSize({ width: Math.floor(width), height: 1000 });

    await expect(lastInviewFilter).toBeHidden();
  });

  test('should show show not overflowing inview filters', async ({ page }) => {
    const lastInviewFilter = page.locator('.inview-filter:last-child');
    const width = await lastInviewFilter.evaluate((e) => {
      const errorMargin = 100;

      return e.getBoundingClientRect().right + errorMargin;
    });

    await page.setViewportSize({ width: Math.floor(width), height: 1000 });

    await expect(lastInviewFilter).toBeVisible();
  });

  test('should hide all inview filters if all filters are all inview filters are hidden except one', async ({
    page,
  }) => {
    const inviewFilters = page.locator('.inview-filter');

    const width = await inviewFilters.nth(1).evaluate((e) => {
      const errorMargin = 100;

      return e.getBoundingClientRect().left - errorMargin;
    });

    await page.setViewportSize({ width: Math.floor(width), height: 1000 });

    for (let inviewFilter of await inviewFilters.all()) {
      await expect(inviewFilter).toBeHidden();
    }
  });
});

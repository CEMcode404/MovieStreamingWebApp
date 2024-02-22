import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const burgerMenuClass = '.burger-menu-wrapper';
const horizontalLinksClass = '.nav-links-container';

test.describe('Horizontal Links', () => {
  test('overflowing should set the navbar to burger menu mode and hide horizontal links', async ({
    page,
  }) => {
    const links = page.locator(horizontalLinksClass);

    await page.setViewportSize({ width: 1, height: 1000 });

    await expect(links).toBeHidden();
  });

  test('overflowing should set the navbar to burger menu mode and show burger menu', async ({
    page,
  }) => {
    const burgerMenu = page.locator(burgerMenuClass);

    await page.setViewportSize({ width: 1, height: 1000 });

    await expect(burgerMenu).toBeVisible();
  });

  test('not overflowing should set the navbar to normal mode and should hide burger menu', async ({
    page,
  }) => {
    const links = page.locator(horizontalLinksClass);
    const burgerMenu = page.locator(burgerMenuClass);
    const linksRightBorderPosition = await links.evaluate((links) =>
      Math.ceil(links.getBoundingClientRect().right)
    );

    await page.setViewportSize({
      width: linksRightBorderPosition,
      height: 1000,
    });

    await expect(burgerMenu).toBeHidden();
  });

  test('not overflowing should set the navbar to normal mode and should show horizontal links', async ({
    page,
  }) => {
    const links = page.locator(horizontalLinksClass);
    const linksRightBorderPosition = await links.evaluate((links) =>
      Math.ceil(links.getBoundingClientRect().right)
    );

    await page.setViewportSize({
      width: linksRightBorderPosition,
      height: 1000,
    });

    await expect(links).toBeVisible();
  });
});

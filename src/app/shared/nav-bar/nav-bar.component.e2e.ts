import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

const burgerMenuClass = '.burger-menu-wrapper';

test.describe('Horizontal Links', () => {
  test('overflowing should set the navbar to burger menu mode and hide horizontal links', async ({
    page,
  }) => {
    const links = page.locator('.navbar a:not(.burger-menu-nav-items)');

    await page.setViewportSize({ width: 1, height: 1000 });

    for (let link of await links.all()) await expect(link).toBeHidden();
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
    const links = page.locator('.navbar a:not(.burger-menu-nav-items)');
    const burgerMenu = page.locator(burgerMenuClass);
    const linksRightBorderPosition = await links
      .last()
      .evaluate((link) => Math.ceil(link.getBoundingClientRect().right));

    await page.setViewportSize({
      width: linksRightBorderPosition,
      height: 1000,
    });

    await expect(burgerMenu).toBeHidden();
  });

  test('not overflowing should set the navbar to normal mode and should show horizontal links', async ({
    page,
  }) => {
    const links = page.locator('.navbar a:not(.burger-menu-nav-items)');
    const linksRightBorderPosition = await links
      .last()
      .evaluate((link) => Math.ceil(link.getBoundingClientRect().right));

    await page.setViewportSize({
      width: linksRightBorderPosition,
      height: 1000,
    });

    for (let link of await links.all()) await expect(link).toBeVisible();
  });
});

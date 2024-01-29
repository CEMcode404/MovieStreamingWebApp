import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('nav links', () => {
  test('should be visible if viewport is not mobile size', async ({ page }) => {
    const navItems = page.getByRole('link');

    await page.setViewportSize({ height: 1000, width: 1000 });

    for (const navItem of await navItems.all())
      await expect(navItem).toBeInViewport();
  });

  test('should be hidden if viewport is mobile size', async ({ page }) => {
    const navItems = page.getByRole('link');

    await page.setViewportSize({ height: 1000, width: 500 });

    for (const navItem of await navItems.all())
      await expect(navItem).not.toBeInViewport();
  });

  test('click should change url', async ({ page }) => {
    const home = page.getByRole('link', { name: 'Home' });

    await home.click();

    expect(page.url().indexOf('#home')).toBeGreaterThan(-1);
  });

  test('that is active should have a class "active"', async ({ page }) => {
    const home = page.getByRole('link', { name: 'Home' });

    await home.click();

    await expect(home).toHaveClass('active');
  });
});

test.describe('burger menu button', () => {
  test('should be hidden if viewport is not mobile size', async ({ page }) => {
    const burgerMenuBttn = page.locator("[aria-label='burger-menu-bttn']");

    await page.setViewportSize({ height: 1000, width: 1000 });

    await expect(burgerMenuBttn).not.toBeVisible();
  });

  test('should be visible if viewport is mobile size', async ({ page }) => {
    const burgerMenuBttn = page.locator("[aria-label='burger-menu-bttn']");

    await page.setViewportSize({ height: 1000, width: 500 });

    await expect(burgerMenuBttn).toBeVisible();
  });

  test('onclick should open menu', async ({ page }) => {
    const burgerMenuBttn = page.locator("[aria-label='burger-menu-bttn']");
    const dropdownNavMenu = page.locator('.content');

    await page.setViewportSize({ height: 1000, width: 500 });
    await burgerMenuBttn.click();

    await expect(dropdownNavMenu).toBeVisible();
  });

  test('onClick should close menu if menu is open', async ({ page }) => {
    const burgerMenuBttn = page.locator("[aria-label='burger-menu-bttn']");
    const dropdownNavMenu = page.locator('.content');

    await page.setViewportSize({ height: 1000, width: 500 });
    await burgerMenuBttn.click();
    await burgerMenuBttn.click();
    await dropdownNavMenu.waitFor({ state: 'hidden' });

    await expect(dropdownNavMenu).not.toBeVisible();
  });
});

test.describe('dropdown menu nav links', () => {
  test('click should change url', async ({ page }) => {
    const burgerMenuBttn = page.locator("[aria-label='burger-menu-bttn']");

    await page.setViewportSize({ height: 1000, width: 500 });
    await burgerMenuBttn.click();
    await page.getByRole('link', { name: 'Home' }).click();

    expect(page.url().indexOf('#home')).toBeGreaterThan(-1);
  });

  test('that is active should have a class "active"', async ({ page }) => {
    const home = page.getByRole('link', { name: 'Home' });

    await home.click();

    await expect(home).toHaveClass('active');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Basic App Tests', () => {
  test('should load the signin page successfully', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Check if basic page elements are present
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });

    // Look for email and password inputs
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });

    console.log('✅ Signin page loaded successfully');
  });

  test('should display the correct app branding', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Look for Reserva branding
    const logoImg = page.locator('img[alt="Reserva"]');
    await expect(logoImg.first()).toBeVisible({ timeout: 10000 });

    console.log('✅ App branding is visible');
  });

  test('should attempt login and see what happens', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Fill in the form
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');

    // Take a screenshot before submitting
    await page.screenshot({ path: 'test-screenshots/before-login.png' });

    // Click submit and wait to see what happens
    await page.click('button[type="submit"]');

    // Wait a bit to see the response
    await page.waitForTimeout(5000);

    // Take a screenshot after submitting
    await page.screenshot({ path: 'test-screenshots/after-login.png' });

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);

    // Check if we see any error messages
    const errorMessages = page.locator('text=error, text=invalid, text=incorrect, [role="alert"]');
    if (await errorMessages.first().isVisible()) {
      const errorText = await errorMessages.first().textContent();
      console.log('Error message found:', errorText);
    }

    // Check if we're redirected to dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
      await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 10000 });
    } else {
      console.log('❌ Did not redirect to dashboard. Current URL:', currentUrl);
    }
  });

  test('should navigate to dashboard if already authenticated', async ({ page }) => {
    // Try to go directly to dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait and see what happens
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('Dashboard access URL:', currentUrl);

    if (currentUrl.includes('/signin')) {
      console.log('✅ Properly redirected to signin when not authenticated');
    } else if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully accessed dashboard');
    } else {
      console.log('⚠️ Unexpected redirect to:', currentUrl);
    }
  });
});
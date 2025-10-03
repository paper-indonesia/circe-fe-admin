import { test, expect } from '@playwright/test';

test.setTimeout(120000); // 2 minutes timeout

test('Check Reports page design', async ({ page }) => {
  // Navigate directly to signin page
  await page.goto('http://localhost:3001/signin', { waitUntil: 'networkidle' });

  // Wait for login form
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  // Login
  await page.fill('input[type="email"]', 'admin@reserva.app');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for navigation after login
  await page.waitForTimeout(3000);

  // Navigate to Reports page
  await page.goto('http://localhost:3001/reports');

  // Check if redirected to signin (session expired)
  await page.waitForTimeout(1000);
  if (page.url().includes('/signin')) {
    console.log('Session expired, logging in again...');
    await page.fill('input[type="email"]', 'admin@reserva.app');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.goto('http://localhost:3001/reports');
  }

  // Wait for loading spinner to disappear (liquid loader) - give more time
  await page.waitForTimeout(5000);

  // Check if data is loaded by looking for revenue card or empty state
  try {
    await page.waitForSelector('text=Total Revenue', { timeout: 10000 });
    console.log('Data loaded successfully');
  } catch (e) {
    // Check for empty state
    const hasEmptyState = await page.locator('text=No Data Available').count();
    if (hasEmptyState > 0) {
      console.log('Empty state detected - no data available');
    } else {
      console.log('Still loading or error occurred');
    }
  }

  // Take screenshot
  await page.screenshot({
    path: 'test-screenshots/reports-page-full.png',
    fullPage: true
  });

  // Also take viewport screenshot
  await page.screenshot({
    path: 'test-screenshots/reports-page-viewport.png',
    fullPage: false
  });

  console.log('Screenshots saved');
});

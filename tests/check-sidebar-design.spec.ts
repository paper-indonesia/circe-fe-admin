import { test, expect } from '@playwright/test';

test.setTimeout(120000);

test('Check New Sidebar Design', async ({ page }) => {
  // Navigate to signin page
  await page.goto('http://localhost:3001/signin', { waitUntil: 'networkidle' });

  // Login
  await page.fill('input[type="email"]', 'admin@reserva.app');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Wait for navigation
  await page.waitForTimeout(3000);

  // Navigate to dashboard
  await page.goto('http://localhost:3001/dashboard');
  await page.waitForTimeout(2000);

  // Take full screenshot
  await page.screenshot({
    path: 'test-screenshots/sidebar-new-design.png',
    fullPage: false
  });

  // Click on Reports to see active state
  await page.click('text=Reports');
  await page.waitForTimeout(1000);

  await page.screenshot({
    path: 'test-screenshots/sidebar-active-state.png',
    fullPage: false
  });

  console.log('Sidebar screenshots saved');
});

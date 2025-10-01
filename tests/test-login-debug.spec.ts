import { test, expect } from '@playwright/test';

test.describe('Login Debug Tests', () => {
  test('should capture detailed login error', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Fill in the form
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');

    // Monitor network requests
    page.on('response', response => {
      if (response.url().includes('/api/auth/signin')) {
        console.log('Login API response status:', response.status());
        response.json().then(data => {
          console.log('Login API response data:', data);
        }).catch(() => {
          console.log('Could not parse response as JSON');
        });
      }
    });

    // Click submit
    await page.click('button[type="submit"]');

    // Wait for any error messages to appear
    await page.waitForTimeout(3000);

    // Look for error messages more broadly
    const allErrorSelectors = [
      '[role="alert"]',
      '.error',
      '.alert',
      '.toast',
      'text=error',
      'text=invalid',
      'text=incorrect',
      'text=failed',
      'text=wrong',
      '[class*="error"]',
      '[class*="alert"]'
    ];

    for (const selector of allErrorSelectors) {
      const errorElement = page.locator(selector);
      if (await errorElement.isVisible()) {
        const errorText = await errorElement.textContent();
        console.log(`Found error with selector ${selector}:`, errorText);
      }
    }

    // Check if form is still visible (indicating failed login)
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.isVisible()) {
      console.log('❌ Login failed - still on signin page');
    } else {
      console.log('✅ Login successful - form no longer visible');
    }

    // Try some different credentials to see if it's a credential issue
    await page.fill('input[type="email"]', 'admin@beautyclinic.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('URL after second login attempt:', currentUrl);
  });

  test('should test if app redirects properly when authenticated', async ({ page }) => {
    // Try to manually set a session/token and see if we can access dashboard
    await page.goto('/signin');

    // Set some test localStorage data
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 'test-id',
        email: 'admin@reserva.com',
        name: 'Test Admin'
      }));
    });

    // Try to navigate to dashboard
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    console.log('Dashboard access result:', finalUrl);

    if (finalUrl.includes('/dashboard')) {
      console.log('✅ Dashboard accessible with localStorage user');
    } else {
      console.log('❌ Still redirected to signin despite localStorage user');
    }
  });
});
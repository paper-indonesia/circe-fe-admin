import { test, expect } from '@playwright/test';

test('test subscription redirect', async ({ page }) => {
  // First login
  await page.goto('http://localhost:3000/signin');

  await page.fill('input[type="email"]', 'aril@edutech.com');
  await page.fill('input[type="password"]', 'your-password'); // You'll need to use actual password
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  console.log('Current URL after login:', page.url());

  // Now try to navigate to subscription
  console.log('Navigating to /subscription/upgrade...');
  await page.goto('http://localhost:3000/subscription/upgrade');

  // Wait a bit to see where we end up
  await page.waitForTimeout(2000);

  console.log('Final URL:', page.url());
  console.log('Page title:', await page.title());

  // Take screenshot
  await page.screenshot({ path: 'subscription-test.png', fullPage: true });

  // Check if we're still on subscription page or redirected
  const currentUrl = page.url();
  if (currentUrl.includes('/signin')) {
    console.log('❌ REDIRECTED TO SIGNIN');

    // Check for auth token
    const cookies = await page.context().cookies();
    console.log('Cookies:', cookies.map(c => c.name));

    const authToken = cookies.find(c => c.name === 'auth-token');
    console.log('Auth token exists:', authToken ? 'YES' : 'NO');
  } else if (currentUrl.includes('/subscription')) {
    console.log('✅ Successfully on subscription page');
  } else {
    console.log('⚠️ Redirected to:', currentUrl);
  }
});

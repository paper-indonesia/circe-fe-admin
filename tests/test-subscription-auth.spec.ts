import { test, expect } from '@playwright/test';

test('test subscription with auth', async ({ page, context }) => {
  // First, go to signin
  await page.goto('http://localhost:3000/signin');

  // Login (use your actual credentials)
  await page.fill('input[type="email"]', 'aril@edutech.com');
  await page.fill('input[type="password"]', 'password123'); // replace with actual password
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  console.log('✅ Logged in successfully');

  // Check cookies
  const cookies = await context.cookies();
  const authToken = cookies.find(c => c.name === 'auth-token');
  console.log('Auth token exists:', authToken ? 'YES' : 'NO');
  if (authToken) {
    console.log('Auth token value:', authToken.value.substring(0, 20) + '...');
  }

  // Now try to navigate to subscription page
  console.log('\nNavigating to /subscription/upgrade...');
  await page.goto('http://localhost:3000/subscription/upgrade');

  // Wait a bit
  await page.waitForTimeout(3000);

  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);

  // Take screenshot
  await page.screenshot({ path: 'subscription-with-auth.png', fullPage: true });

  if (finalUrl.includes('/signin')) {
    console.log('❌ REDIRECTED TO SIGNIN - Auth token might be invalid or check failed');
  } else if (finalUrl.includes('/subscription')) {
    console.log('✅ Successfully stayed on subscription page');
  } else {
    console.log('⚠️ Redirected to:', finalUrl);
  }
});

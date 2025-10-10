import { test, expect } from '@playwright/test';

test('test subscription route without auth', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Navigate directly to subscription page
  console.log('Navigating to /subscription/upgrade...');

  const response = await page.goto('http://localhost:3000/subscription/upgrade');

  console.log('Response status:', response?.status());
  console.log('Response URL:', response?.url());

  // Wait a bit
  await page.waitForTimeout(2000);

  const finalUrl = page.url();
  console.log('Final URL:', finalUrl);

  // Take screenshot
  await page.screenshot({ path: 'subscription-test-noauth.png', fullPage: true });

  if (finalUrl.includes('/signin')) {
    console.log('✅ Correctly redirected to signin (no auth token)');
  } else if (finalUrl.includes('/subscription')) {
    console.log('⚠️ Stayed on subscription page (should redirect without auth)');
  } else {
    console.log('❌ Unexpected redirect to:', finalUrl);
  }
});

test('test middleware behavior', async ({ page }) => {
  // Test direct access to see middleware behavior
  console.log('\n=== Testing middleware behavior ===');

  const testUrls = [
    'http://localhost:3000/subscription/upgrade',
    'http://localhost:3000/subscription',
    'http://localhost:3000/dashboard',
  ];

  for (const url of testUrls) {
    console.log(`\nTesting: ${url}`);
    const response = await page.goto(url);
    console.log('Status:', response?.status());
    console.log('Final URL:', page.url());

    // Check if it's a redirect
    if (page.url() !== url) {
      console.log('❌ REDIRECTED FROM:', url);
      console.log('   TO:', page.url());
    } else {
      console.log('✅ No redirect (or landed on signin as expected)');
    }
  }
});

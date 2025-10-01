const { chromium } = require('playwright');

async function simpleTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Navigating to signin...');
  await page.goto('http://localhost:3001/signin');
  await page.waitForLoadState('networkidle');

  console.log('Filling credentials...');
  await page.fill('input[name="email"]', 'admin@beautyclinic.com');
  await page.fill('input[name="password"]', 'admin123');

  console.log('Clicking sign in...');
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'C:\\Users\\Aril Indra Permana\\Circe\\admin-beauty-clinic-app\\debug-screenshot.png' });

  await browser.close();
}

simpleTest().catch(console.error);
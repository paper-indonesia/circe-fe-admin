const { chromium } = require('playwright');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  try {
    // Landing page
    console.log('📸 Taking screenshot of landing page...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'screenshots/landing-new.png', 
      fullPage: true 
    });
    console.log('✅ Landing page screenshot saved!');
    
    // Sign in page
    console.log('📸 Taking screenshot of sign in page...');
    await page.goto('http://localhost:3000/jakarta/signin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.screenshot({ 
      path: 'screenshots/signin-new.png', 
      fullPage: true 
    });
    console.log('✅ Sign in page screenshot saved!');
    
    console.log('✅ All screenshots taken successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
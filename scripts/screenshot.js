const { chromium } = require('playwright');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  try {
    // Landing page
    console.log('📸 Taking screenshot of landing page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/landing-page.png', 
      fullPage: true 
    });
    
    // Sign in page
    console.log('📸 Taking screenshot of sign in page...');
    await page.goto('http://localhost:3000/jakarta/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/signin-page.png', 
      fullPage: true 
    });
    
    // Try to access dashboard
    console.log('📸 Attempting to access dashboard...');
    await page.goto('http://localhost:3000/jakarta/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Check if we're redirected to signin
    const currentUrl = page.url();
    if (currentUrl.includes('signin')) {
      console.log('⚠️ Dashboard requires authentication');
      
      // Try to fill in dummy credentials
      const emailInput = await page.$('input[type="email"], input[name="email"], input[id="email"]');
      const passwordInput = await page.$('input[type="password"], input[name="password"], input[id="password"]');
      
      if (emailInput && passwordInput) {
        await emailInput.fill('admin@beautyclinic.com');
        await passwordInput.fill('password123');
        
        // Look for sign in button
        const signInButton = await page.$('button:has-text("Sign In"), button:has-text("Sign in"), button:has-text("Login")');
        if (signInButton) {
          await signInButton.click();
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // Take dashboard screenshot regardless
    await page.screenshot({ 
      path: 'screenshots/dashboard-page.png', 
      fullPage: true 
    });
    console.log('✅ Dashboard screenshot taken');
    
    // Mobile view
    console.log('📱 Taking mobile screenshots...');
    await page.setViewportSize({ width: 375, height: 812 });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/landing-mobile.png', 
      fullPage: true 
    });
    
    await page.goto('http://localhost:3000/jakarta/signin', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ 
      path: 'screenshots/signin-mobile.png', 
      fullPage: true 
    });
    
    console.log('✅ All screenshots taken successfully!');
    console.log('📁 Screenshots saved in: screenshots/ directory');
    
  } catch (error) {
    console.error('❌ Error taking screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
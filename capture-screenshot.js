const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to walk-in page
  await page.goto('http://localhost:3001/walk-in');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'walk-in-page-before.png',
    fullPage: true 
  });
  
  // Fill in some form data to see how it looks
  await page.fill('input[id="name"]', 'John Doe');
  await page.fill('input[id="phone"]', '+62 812 3456 7890');
  
  // Click treatment dropdown
  await page.click('button:has-text("Select treatment")');
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'walk-in-treatment-dropdown.png',
    fullPage: false 
  });
  
  // Close dropdown and click staff
  await page.keyboard.press('Escape');
  await page.click('button:has-text("Select staff")');
  await page.waitForTimeout(500);
  await page.screenshot({ 
    path: 'walk-in-staff-dropdown.png',
    fullPage: false 
  });
  
  console.log('Screenshots captured successfully!');
  await browser.close();
})();
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
  
  // Take screenshot of improved design
  await page.screenshot({ 
    path: 'walk-in-improved-full.png',
    fullPage: true 
  });
  
  // Fill form and select treatment
  await page.fill('input[id="name"]', 'Sarah Johnson');
  await page.fill('input[id="phone"]', '+62 812 3456 7890');
  
  // Scroll to treatment section
  await page.evaluate(() => {
    const treatmentCard = Array.from(document.querySelectorAll('h3')).find(el => el.textContent?.includes('Select Treatment'));
    treatmentCard?.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  
  // Click on a treatment card
  await page.click('div:has-text("HydraFacial")');
  await page.waitForTimeout(500);
  
  // Screenshot treatment section
  await page.screenshot({ 
    path: 'walk-in-treatment-improved.png',
    fullPage: false 
  });
  
  // Scroll to staff section
  await page.evaluate(() => {
    const staffCard = Array.from(document.querySelectorAll('h3')).find(el => el.textContent?.includes('Select Staff Member'));
    staffCard?.scrollIntoView({ behavior: 'smooth' });
  });
  await page.waitForTimeout(1000);
  
  // Click on a staff card
  await page.click('div:has-text("Dr. Sarah")');
  await page.waitForTimeout(500);
  
  // Screenshot staff section
  await page.screenshot({ 
    path: 'walk-in-staff-improved.png',
    fullPage: false 
  });
  
  console.log('Improved screenshots captured successfully!');
  console.log('Files created:');
  console.log('- walk-in-improved-full.png');
  console.log('- walk-in-treatment-improved.png');
  console.log('- walk-in-staff-improved.png');
  
  await browser.close();
})();
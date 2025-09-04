const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to reports page
  await page.goto('http://localhost:3001/reports');
  
  // Wait for page and charts to load
  await page.waitForTimeout(5000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'reports-page-before.png',
    fullPage: true 
  });
  
  // Scroll to charts section
  await page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'reports-charts-before.png',
    fullPage: false 
  });
  
  // Change date range
  await page.click('button:has-text("Last 30 days")');
  await page.waitForTimeout(500);
  await page.click('text=Last 7 days');
  await page.waitForTimeout(2000);
  
  await page.screenshot({ 
    path: 'reports-7days.png',
    fullPage: false 
  });
  
  console.log('Reports screenshots captured successfully!');
  console.log('Files created:');
  console.log('- reports-page-before.png');
  console.log('- reports-charts-before.png');
  console.log('- reports-7days.png');
  
  await browser.close();
})();
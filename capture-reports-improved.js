const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport for desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to reports page
  await page.goto('http://localhost:3002/reports');
  
  // Wait for page and charts to fully load
  await page.waitForTimeout(3000);
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'reports-improved-full.png',
    fullPage: true 
  });
  
  // Scroll to main charts section and focus on Treatment Performance
  await page.evaluate(() => {
    const treatmentCard = Array.from(document.querySelectorAll('h3')).find(
      el => el.textContent.includes('Treatment Performance')
    );
    if (treatmentCard) {
      treatmentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'reports-treatment-chart.png',
    fullPage: false 
  });
  
  // Scroll to bottom section
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: 'reports-bottom-section.png',
    fullPage: false 
  });
  
  console.log('Improved reports screenshots captured successfully!');
  console.log('Files created:');
  console.log('- reports-improved-full.png');
  console.log('- reports-treatment-chart.png');
  console.log('- reports-bottom-section.png');
  
  await browser.close();
})();
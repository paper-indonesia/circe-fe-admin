const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Navigating to landing page...');
  await page.goto('http://localhost:3001/');
  
  // Wait for page to load
  await page.waitForTimeout(2000);
  
  // Take screenshot
  await page.screenshot({ path: 'landing-page.png', fullPage: true });
  console.log('Screenshot saved as landing-page.png');
  
  // Check if CSS is loaded
  const hasStyles = await page.evaluate(() => {
    const body = document.querySelector('body');
    const computedStyle = window.getComputedStyle(body);
    return computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
  });
  
  console.log('Has CSS styles:', hasStyles);
  
  // Check for gradient background
  const hasGradient = await page.evaluate(() => {
    const mainDiv = document.querySelector('.min-h-screen');
    if (mainDiv) {
      const classes = mainDiv.className;
      return classes.includes('bg-gradient-to-br');
    }
    return false;
  });
  
  console.log('Has gradient background:', hasGradient);
  
  // Check for cards
  const cardCount = await page.evaluate(() => {
    return document.querySelectorAll('[class*="card"]').length;
  });
  
  console.log('Number of cards found:', cardCount);
  
  // Get page HTML structure
  const htmlStructure = await page.evaluate(() => {
    const body = document.querySelector('body');
    return body ? body.innerHTML.substring(0, 500) : 'No body found';
  });
  
  console.log('HTML structure preview:', htmlStructure);
  
  // Keep browser open for inspection
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
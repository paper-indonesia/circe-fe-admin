const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Listen for console messages
  page.on('console', msg => {
    console.log('Browser console:', msg.type(), msg.text());
  });
  
  // Listen for errors
  page.on('pageerror', error => {
    console.log('Page error:', error.message);
  });
  
  console.log('Navigating to landing page...');
  
  try {
    await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
    
    // Get the page content
    const content = await page.content();
    console.log('Page content length:', content.length);
    
    // Check for error messages
    const errorText = await page.evaluate(() => {
      const body = document.body;
      return body ? body.innerText.substring(0, 500) : 'No body';
    });
    
    console.log('Page text:', errorText);
    
    // Check the actual HTML
    const html = await page.evaluate(() => {
      return document.documentElement.outerHTML.substring(0, 1000);
    });
    
    console.log('HTML preview:', html);
    
  } catch (error) {
    console.log('Navigation error:', error.message);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
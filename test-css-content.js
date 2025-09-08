const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Loading page...');
  await page.goto('http://localhost:3001/');
  await page.waitForTimeout(2000);
  
  // Get CSS link and check content
  const cssInfo = await page.evaluate(() => {
    const link = document.querySelector('link[rel="stylesheet"]');
    if (link) {
      return {
        href: link.href,
        found: true
      };
    }
    return { found: false };
  });
  
  console.log('CSS Link Info:', cssInfo);
  
  if (cssInfo.found) {
    // Fetch the CSS content
    const response = await page.evaluate(async (href) => {
      const res = await fetch(href);
      const text = await res.text();
      return {
        status: res.status,
        length: text.length,
        preview: text.substring(0, 500)
      };
    }, cssInfo.href);
    
    console.log('CSS Response:', response);
  }
  
  // Check computed styles on elements
  const styles = await page.evaluate(() => {
    const body = document.body;
    const container = document.querySelector('.container');
    const gradient = document.querySelector('.bg-gradient-to-br');
    
    return {
      body: {
        background: window.getComputedStyle(body).backgroundColor,
        color: window.getComputedStyle(body).color
      },
      container: container ? {
        margin: window.getComputedStyle(container).margin,
        padding: window.getComputedStyle(container).padding
      } : null,
      gradient: gradient ? {
        background: window.getComputedStyle(gradient).background
      } : null
    };
  });
  
  console.log('Computed Styles:', JSON.stringify(styles, null, 2));
  
  await browser.close();
})();
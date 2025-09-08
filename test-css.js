const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('Testing landing page CSS...');
  await page.goto('http://localhost:3001/');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Check if Tailwind classes are being applied
  const cssCheck = await page.evaluate(() => {
    const container = document.querySelector('.container');
    const gradientDiv = document.querySelector('.bg-gradient-to-br');
    const card = document.querySelector('.border-2.border-purple-200');
    
    const results = {
      hasContainer: !!container,
      containerStyles: container ? window.getComputedStyle(container).marginLeft : 'none',
      hasGradient: !!gradientDiv,
      gradientClasses: gradientDiv ? gradientDiv.className : 'none',
      hasCard: !!card,
      cardBorder: card ? window.getComputedStyle(card).borderColor : 'none',
      bodyBg: window.getComputedStyle(document.body).backgroundColor,
      htmlClasses: document.documentElement.className
    };
    
    return results;
  });
  
  console.log('CSS Check Results:', cssCheck);
  
  // Check if CSS file is loaded
  const stylesheets = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    const styles = Array.from(document.querySelectorAll('style'));
    return {
      linkCount: links.length,
      styleCount: styles.length,
      links: links.map(l => l.href),
      hasNextStyles: styles.some(s => s.textContent.includes('--tw-'))
    };
  });
  
  console.log('Stylesheets:', stylesheets);
  
  // Take screenshot
  await page.screenshot({ path: 'landing-css-check.png', fullPage: true });
  console.log('Screenshot saved as landing-css-check.png');
  
  await browser.close();
})();
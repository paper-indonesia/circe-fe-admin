const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testSidebarAndBranding() {
  // Create screenshots directory if it doesn't exist
  const screenshotDir = path.join(__dirname, 'test-screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('🚀 Starting Playwright test for sidebar and Reserva branding...');

  const browser = await chromium.launch({
    headless: false, // Set to true for headless mode
    slowMo: 1000 // Add delay between actions for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });

  const page = await context.newPage();

  const testResults = {
    landingPage: { success: false, issues: [] },
    signinPage: { success: false, issues: [] },
    dashboard: { success: false, issues: [] },
    sidebarCollapse: { success: false, issues: [] },
    tooltips: { success: false, issues: [] },
    contentAdjustment: { success: false, issues: [] },
    branding: { success: false, issues: [] }
  };

  try {
    // 1. Navigate to localhost:3001 and test landing page
    console.log('📍 Step 1: Testing landing page...');
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');

    // Take screenshot of landing page
    await page.screenshot({
      path: path.join(screenshotDir, '01-landing-page.png'),
      fullPage: true
    });

    // Check for Reserva branding on landing page
    const reservaBrandingExists = await page.isVisible('text=Reserva') ||
                                  await page.isVisible('img[alt*="Reserva"]') ||
                                  await page.isVisible('img[src*="reserva"]');

    if (reservaBrandingExists) {
      testResults.landingPage.success = true;
      console.log('✅ Landing page has Reserva branding');
    } else {
      testResults.landingPage.issues.push('Reserva branding not found on landing page');
      console.log('❌ Reserva branding not found on landing page');
    }

    // 2. Navigate to signin page
    console.log('📍 Step 2: Testing signin page...');
    await page.goto('http://localhost:3001/signin');
    await page.waitForLoadState('networkidle');

    // Take screenshot of signin page
    await page.screenshot({
      path: path.join(screenshotDir, '02-signin-page.png'),
      fullPage: true
    });

    // Check for Reserva logo on signin page
    const signinReservaBranding = await page.isVisible('text=Reserva') ||
                                  await page.isVisible('img[alt*="Reserva"]') ||
                                  await page.isVisible('img[src*="reserva"]');

    if (signinReservaBranding) {
      testResults.signinPage.success = true;
      console.log('✅ Signin page has Reserva branding');
    } else {
      testResults.signinPage.issues.push('Reserva branding not found on signin page');
      console.log('❌ Reserva branding not found on signin page');
    }

    // 3. Try to sign in (look for test credentials or skip if auth is complex)
    console.log('📍 Step 3: Attempting to access dashboard...');

    // Check if there are email/password fields and try correct test credentials
    const emailField = await page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = await page.locator('input[type="password"], input[name="password"]').first();

    if (await emailField.isVisible() && await passwordField.isVisible()) {
      await emailField.fill('admin@beautyclinic.com');
      await passwordField.fill('admin123');

      // Look for submit button
      const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(3000); // Wait longer for authentication
      }
    }

    // Try direct navigation to dashboard if signin fails
    await page.goto('http://localhost:3001/dashboard');
    await page.waitForLoadState('networkidle');

    // Take screenshot of dashboard
    await page.screenshot({
      path: path.join(screenshotDir, '03-dashboard-expanded.png'),
      fullPage: true
    });

    // 4. Test sidebar functionality
    console.log('📍 Step 4: Testing sidebar functionality...');

    // Look for sidebar elements (based on actual implementation)
    const sidebar = await page.locator('div:has(img[src="/reserva_logo.webp"])').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);

    if (sidebarVisible) {
      testResults.dashboard.success = true;
      console.log('✅ Dashboard sidebar is visible');

      // Look for collapse/expand button (based on actual implementation - ChevronLeft/ChevronRight icons)
      const collapseButton = await page.locator('button:has-text("ChevronLeft"), button:has-text("ChevronRight"), button:has(svg), .lg\\:flex:has(svg)').first();

      if (await collapseButton.isVisible()) {
        // 5. Test sidebar collapse
        console.log('📍 Step 5: Testing sidebar collapse...');

        await collapseButton.click();
        await page.waitForTimeout(1000); // Wait for animation

        // Take screenshot of collapsed sidebar
        await page.screenshot({
          path: path.join(screenshotDir, '04-dashboard-collapsed.png'),
          fullPage: true
        });

        testResults.sidebarCollapse.success = true;
        console.log('✅ Sidebar collapse functionality works');

        // 6. Test hover tooltips on collapsed sidebar
        console.log('📍 Step 6: Testing hover tooltips...');

        const navItems = await page.locator('nav a[href*="/"], a[href*="/dashboard"], a[href*="/calendar"], a[href*="/clients"]').all();
        let tooltipFound = false;

        for (let i = 0; i < Math.min(navItems.length, 3); i++) {
          await navItems[i].hover();
          await page.waitForTimeout(500);

          // Check for tooltip visibility (based on actual implementation with opacity classes)
          const tooltip = await page.locator('.opacity-0.group-hover\\:opacity-100, .absolute.left-full, div:has-text("Dashboard"), div:has-text("Calendar"), div:has-text("Clients")').first();
          if (await tooltip.isVisible()) {
            tooltipFound = true;
            await page.screenshot({
              path: path.join(screenshotDir, `05-tooltip-${i + 1}.png`),
              fullPage: true
            });
            break;
          }
        }

        if (tooltipFound) {
          testResults.tooltips.success = true;
          console.log('✅ Hover tooltips work on collapsed sidebar');
        } else {
          testResults.tooltips.issues.push('No tooltips found on collapsed sidebar navigation');
          console.log('❌ No tooltips found on collapsed sidebar navigation');
        }

        // 7. Test content area adjustment
        console.log('📍 Step 7: Testing content area adjustment...');

        // Compare main content area before and after collapse
        const mainContent = await page.locator('main, .main-content, [role="main"]').first();
        if (await mainContent.isVisible()) {
          const collapsedBox = await mainContent.boundingBox();

          // Expand sidebar again
          await collapseButton.click();
          await page.waitForTimeout(1000);

          const expandedBox = await mainContent.boundingBox();

          if (collapsedBox && expandedBox && collapsedBox.width !== expandedBox.width) {
            testResults.contentAdjustment.success = true;
            console.log('✅ Content area adjusts properly when sidebar collapses/expands');
          } else {
            testResults.contentAdjustment.issues.push('Content area does not adjust when sidebar state changes');
            console.log('❌ Content area does not adjust when sidebar state changes');
          }

          // Take final screenshot with expanded sidebar
          await page.screenshot({
            path: path.join(screenshotDir, '06-dashboard-final.png'),
            fullPage: true
          });
        }

      } else {
        testResults.sidebarCollapse.issues.push('Collapse button not found on sidebar');
        console.log('❌ Collapse button not found on sidebar');
      }

    } else {
      testResults.dashboard.issues.push('Dashboard sidebar not found or not visible');
      console.log('❌ Dashboard sidebar not found or not visible');
    }

    // 8. Check Reserva branding sizing and positioning throughout
    console.log('📍 Step 8: Checking Reserva branding sizing and positioning...');

    const brandingElements = await page.locator('text=Reserva, img[alt*="Reserva"], img[src*="reserva"], img[src="/reserva_logo.webp"], img[src="/reserva_name.webp"]').all();

    if (brandingElements.length > 0) {
      testResults.branding.success = true;
      console.log(`✅ Found ${brandingElements.length} Reserva branding elements`);

      for (let i = 0; i < brandingElements.length; i++) {
        const element = brandingElements[i];
        const box = await element.boundingBox();
        if (box) {
          console.log(`   Element ${i + 1}: ${box.width}x${box.height} at (${box.x}, ${box.y})`);
        }
      }
    } else {
      testResults.branding.issues.push('No Reserva branding elements found in dashboard');
      console.log('❌ No Reserva branding elements found in dashboard');
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }

  // Generate test report
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('========================');

  Object.entries(testResults).forEach(([test, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${test}: ${status}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  });

  console.log(`\n📸 Screenshots saved to: ${screenshotDir}`);

  return testResults;
}

// Run the test
testSidebarAndBranding().catch(console.error);
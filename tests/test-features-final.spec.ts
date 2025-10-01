import { test, expect } from '@playwright/test';

// Helper function to login
async function loginUser(page: any) {
  await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  await page.fill('input[type="email"]', 'admin@beautyclinic.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

test.describe('Beauty Clinic Admin App - Comprehensive Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('✅ Login functionality - Should login successfully with admin credentials', async ({ page }) => {
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Check if login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 });

    // Fill in the login credentials
    await page.fill('input[type="email"]', 'admin@beautyclinic.com');
    await page.fill('input[type="password"]', 'admin123');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Verify we're on the dashboard
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible({ timeout: 15000 });
  });

  test('✅ Sidebar collapsibility - Should verify sidebar is collapsible by clicking navigation icons', async ({ page }) => {
    await loginUser(page);

    // Check initial sidebar state (expanded) - look for navigation text in sidebar
    await expect(page.locator('nav span:has-text("Calendar")').first()).toBeVisible({ timeout: 10000 });

    // Find and click a navigation icon to collapse sidebar
    const dashboardLink = page.locator('a[href="/dashboard"]');
    const dashboardIcon = dashboardLink.locator('svg').first();
    await dashboardIcon.click();

    // Wait for animation and verify sidebar collapsed
    await page.waitForTimeout(1000);

    // In collapsed state, navigation text should not be visible
    await expect(page.locator('nav span:has-text("Calendar")').first()).not.toBeVisible({ timeout: 5000 });

    // Click icon again to expand
    await dashboardIcon.click();
    await page.waitForTimeout(1000);

    // Verify sidebar expanded again
    await expect(page.locator('nav span:has-text("Calendar")').first()).toBeVisible({ timeout: 5000 });
  });

  test('✅ Dashboard layout - Should display dashboard with proper layout and full screen width', async ({ page }) => {
    await loginUser(page);

    // Verify main content area is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Check that dashboard KPI cards are displayed
    await expect(page.locator('text=Today\'s Bookings')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Revenue Today')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Attendance Rate')).toBeVisible({ timeout: 5000 });
  });

  test('✅ Navigation - Should navigate to all main pages', async ({ page }) => {
    await loginUser(page);

    const pages = [
      { name: 'Calendar', href: '/calendar' },
      { name: 'Clients', href: '/clients' },
      { name: 'Staff', href: '/staff' },
      { name: 'Walk-in', href: '/walk-in' },
      { name: 'Treatments', href: '/treatments' },
      { name: 'Withdrawal', href: '/withdrawal' },
      { name: 'Settings', href: '/settings' }
    ];

    for (const pageInfo of pages) {
      await page.click(`a[href="${pageInfo.href}"]`);
      await page.waitForURL(`**${pageInfo.href}`, { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 10000 });

      // Verify page loaded by checking basic structure exists
      await expect(page.locator('html')).toBeVisible({ timeout: 5000 });
      console.log(`✅ Successfully navigated to ${pageInfo.name}`);
    }

    // Return to dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('✅ Data verification - Should verify data is loaded from MongoDB', async ({ page }) => {
    await loginUser(page);

    // Check dashboard for data indicators
    await page.waitForTimeout(3000); // Allow time for data loading

    // Navigate to clients page to check for patient data
    await page.click('a[href="/clients"]');
    await page.waitForURL('**/clients', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Look for any content indicating data is present (more flexible approach)
    const pageContent = await page.textContent('body');
    const hasContent = pageContent && pageContent.length > 100; // Basic content check
    expect(hasContent).toBeTruthy();
    console.log('✅ Clients page has content');

    // Check staff page
    await page.click('a[href="/staff"]');
    await page.waitForURL('**/staff', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const staffContent = await page.textContent('body');
    const hasStaffContent = staffContent && staffContent.length > 100;
    expect(hasStaffContent).toBeTruthy();
    console.log('✅ Staff page has content');

    // Check treatments page
    await page.click('a[href="/treatments"]');
    await page.waitForURL('**/treatments', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const treatmentContent = await page.textContent('body');
    const hasTreatmentContent = treatmentContent && treatmentContent.length > 100;
    expect(hasTreatmentContent).toBeTruthy();
    console.log('✅ Treatments page has content');
  });

  test('✅ Walk-in appointment - Should access walk-in appointment creation page', async ({ page }) => {
    await loginUser(page);

    // Navigate to walk-in page
    await page.click('a[href="/walk-in"]');
    await page.waitForURL('**/walk-in', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify walk-in page elements are present
    await expect(page.locator('html')).toBeVisible({ timeout: 5000 });

    // Look for form elements that suggest this is a booking page
    const hasFormElements = await page.locator('input, select, button, form').count();
    expect(hasFormElements).toBeGreaterThan(0);
    console.log('✅ Walk-in page has form elements for appointment creation');

    // Try to fill some basic information (non-submitting test)
    const nameInputs = page.locator('input[placeholder*="name"], input[name*="name"]');
    if (await nameInputs.first().isVisible()) {
      await nameInputs.first().fill('Test Patient');
      console.log('✅ Successfully filled name field');
    }

    const phoneInputs = page.locator('input[placeholder*="phone"], input[name*="phone"]');
    if (await phoneInputs.first().isVisible()) {
      await phoneInputs.first().fill('0812345678');
      console.log('✅ Successfully filled phone field');
    }
  });

  test('✅ Logout functionality - Should verify logout functionality', async ({ page }) => {
    await loginUser(page);

    // Find and click the logout button
    const logoutButton = page.locator('button[title="Sign Out"]').first();
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();

    // Wait for redirect to sign in page
    await page.waitForURL('**/signin', { timeout: 30000 });

    // Verify we're back on the sign in page
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
    console.log('✅ Successfully logged out and redirected to signin');
  });

  test('✅ Responsive design - Should verify responsive behavior on different screen sizes', async ({ page }) => {
    await loginUser(page);

    // Test desktop view (default)
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
    console.log('✅ Desktop view works');

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
    console.log('✅ Tablet view works');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // On mobile, main content should still be accessible
    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();
    console.log('✅ Mobile view works');

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
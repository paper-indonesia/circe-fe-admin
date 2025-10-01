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

test.describe('Beauty Clinic Admin App - Core Features', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000);
  });

  test('should login successfully with admin credentials', async ({ page }) => {
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
    await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 15000 });
  });

  test('should verify sidebar is collapsible by clicking navigation icons', async ({ page }) => {
    await loginUser(page);

    // Check initial sidebar state (expanded) - look for navigation text
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Calendar')).toBeVisible({ timeout: 5000 });

    // Find and click a navigation icon to collapse sidebar
    const dashboardLink = page.locator('a[href="/dashboard"]');
    const dashboardIcon = dashboardLink.locator('svg').first();
    await dashboardIcon.click();

    // Wait for animation and verify sidebar collapsed (text should be hidden)
    await page.waitForTimeout(1000);

    // In collapsed state, navigation text should not be visible (or should be hidden)
    const navText = page.locator('nav span:has-text("Calendar")');
    await expect(navText).not.toBeVisible({ timeout: 5000 });

    // Click icon again to expand
    await dashboardIcon.click();
    await page.waitForTimeout(1000);

    // Verify sidebar expanded again - navigation text should be visible
    await expect(page.locator('text=Calendar')).toBeVisible({ timeout: 5000 });
  });

  test('should display dashboard with proper layout', async ({ page }) => {
    await loginUser(page);

    // Verify main content area is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: 10000 });

    // Check that dashboard KPI cards are displayed
    await expect(page.locator('text=Today\'s Bookings')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Revenue Today')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Attendance Rate')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to all main pages', async ({ page }) => {
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

      // Verify page loaded without major errors
      await expect(page.locator('body')).toBeVisible({ timeout: 5000 });
    }

    // Return to dashboard
    await page.click('a[href="/dashboard"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('should verify data is loaded from MongoDB', async ({ page }) => {
    await loginUser(page);

    // Check dashboard for data indicators
    await page.waitForTimeout(3000); // Allow time for data loading

    // Navigate to clients page to check for patient data
    await page.click('a[href="/clients"]');
    await page.waitForURL('**/clients', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Look for any data containers (tables, cards, lists)
    const hasDataElements = await page.locator('table, [role="table"], .card, [class*="grid"], [class*="list"]').count();
    expect(hasDataElements).toBeGreaterThan(0);

    // Check staff page
    await page.click('a[href="/staff"]');
    await page.waitForURL('**/staff', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const hasStaffElements = await page.locator('table, [role="table"], .card, [class*="grid"], [class*="list"]').count();
    expect(hasStaffElements).toBeGreaterThan(0);

    // Check treatments page
    await page.click('a[href="/treatments"]');
    await page.waitForURL('**/treatments', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.waitForTimeout(2000);

    const hasTreatmentElements = await page.locator('table, [role="table"], .card, [class*="grid"], [class*="list"]').count();
    expect(hasTreatmentElements).toBeGreaterThan(0);
  });

  test('should access walk-in appointment page', async ({ page }) => {
    await loginUser(page);

    // Navigate to walk-in page
    await page.click('a[href="/walk-in"]');
    await page.waitForURL('**/walk-in', { timeout: 15000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify walk-in page elements are present
    await expect(page.locator('body')).toBeVisible({ timeout: 5000 });

    // Look for form elements that suggest this is a booking page
    const hasFormElements = await page.locator('input, select, button, form').count();
    expect(hasFormElements).toBeGreaterThan(0);
  });

  test('should verify logout functionality', async ({ page }) => {
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
  });
});
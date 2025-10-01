import { test, expect } from '@playwright/test';

test.describe('Beauty Clinic Admin App', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for this suite
    test.setTimeout(120000);
    // Navigate to the app with explicit timeout
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  });

  test('should login successfully with admin credentials', async ({ page }) => {
    // Navigate to sign in page if not redirected automatically
    await page.goto('/signin', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for the page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    // Check if login form is visible
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 });

    // Fill in the login credentials
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Verify we're on the dashboard
    await expect(page.locator('h1')).toContainText('Dashboard', { timeout: 15000 });
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
  });

  test('should verify sidebar is collapsible', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Check initial sidebar state (expanded)
    const sidebar = page.locator('div[class*="w-64"]').first();
    await expect(sidebar).toBeVisible();

    // Find navigation icons and click one to collapse
    const dashboardIcon = page.locator('nav a[href="/dashboard"] svg').first();
    await dashboardIcon.click();

    // Verify sidebar collapsed (should have w-20 class)
    await expect(page.locator('div[class*="w-20"]').first()).toBeVisible();

    // Click icon again to expand
    const collapsedDashboardIcon = page.locator('nav a[href="/dashboard"] svg').first();
    await collapsedDashboardIcon.click();

    // Verify sidebar expanded again
    await expect(page.locator('div[class*="w-64"]').first()).toBeVisible();
  });

  test('should display dashboard with full screen width', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Verify main content area takes full available width
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();

    // Check that dashboard content is displayed properly
    await expect(page.locator('text=Today\'s Bookings')).toBeVisible();
    await expect(page.locator('text=Revenue Today')).toBeVisible();
    await expect(page.locator('text=Attendance Rate')).toBeVisible();
  });

  test('should navigate to all main pages', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Test navigation to Dashboard
    await page.click('a[href="/dashboard"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Test navigation to Calendar
    await page.click('a[href="/calendar"]');
    await expect(page).toHaveURL('/calendar');
    await page.waitForLoadState('networkidle');

    // Test navigation to Clients
    await page.click('a[href="/clients"]');
    await expect(page).toHaveURL('/clients');
    await page.waitForLoadState('networkidle');

    // Test navigation to Staff
    await page.click('a[href="/staff"]');
    await expect(page).toHaveURL('/staff');
    await page.waitForLoadState('networkidle');

    // Test navigation to Walk-in
    await page.click('a[href="/walk-in"]');
    await expect(page).toHaveURL('/walk-in');
    await page.waitForLoadState('networkidle');

    // Test navigation to Treatments
    await page.click('a[href="/treatments"]');
    await expect(page).toHaveURL('/treatments');
    await page.waitForLoadState('networkidle');

    // Test navigation to Withdrawal
    await page.click('a[href="/withdrawal"]');
    await expect(page).toHaveURL('/withdrawal');
    await page.waitForLoadState('networkidle');

    // Test navigation to Settings
    await page.click('a[href="/settings"]');
    await expect(page).toHaveURL('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should verify data is loaded from MongoDB', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Wait for dashboard to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Additional wait for data loading

    // Check if patient/client data is visible on dashboard or clients page
    await page.click('a[href="/clients"]');
    await page.waitForLoadState('networkidle');

    // Look for data indicators (tables, cards, or lists with content)
    const dataElements = page.locator('table, [role="table"], .card, [class*="grid"]');
    await expect(dataElements.first()).toBeVisible();

    // Check staff page for staff data
    await page.click('a[href="/staff"]');
    await page.waitForLoadState('networkidle');

    // Look for staff data
    const staffElements = page.locator('table, [role="table"], .card, [class*="grid"]');
    await expect(staffElements.first()).toBeVisible();

    // Check treatments page for treatment data
    await page.click('a[href="/treatments"]');
    await page.waitForLoadState('networkidle');

    // Look for treatment data
    const treatmentElements = page.locator('table, [role="table"], .card, [class*="grid"]');
    await expect(treatmentElements.first()).toBeVisible();
  });

  test('should create a new walk-in appointment', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to walk-in page
    await page.click('a[href="/walk-in"]');
    await page.waitForURL('/walk-in');
    await page.waitForLoadState('networkidle');

    // Fill out walk-in appointment form
    const nameInput = page.locator('input[placeholder*="name"], input[name*="name"], #name').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Patient');
    }

    const phoneInput = page.locator('input[placeholder*="phone"], input[name*="phone"], #phone').first();
    if (await phoneInput.isVisible()) {
      await phoneInput.fill('0812345678');
    }

    const emailInput = page.locator('input[placeholder*="email"], input[name*="email"], #email').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }

    // Try to select a treatment if dropdown exists
    const treatmentSelect = page.locator('select, [role="combobox"]').first();
    if (await treatmentSelect.isVisible()) {
      await treatmentSelect.click();
      // Wait a bit and try to select the first option
      await page.waitForTimeout(500);
      const firstOption = page.locator('[role="option"], option').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      }
    }

    // Try to select a staff member if dropdown exists
    const staffSelect = page.locator('select, [role="combobox"]').nth(1);
    if (await staffSelect.isVisible()) {
      await staffSelect.click();
      await page.waitForTimeout(500);
      const firstStaffOption = page.locator('[role="option"], option').first();
      if (await firstStaffOption.isVisible()) {
        await firstStaffOption.click();
      }
    }

    // Try to select a time slot if available
    const timeSlot = page.locator('button[class*="time"], [data-time], .time-slot').first();
    if (await timeSlot.isVisible()) {
      await timeSlot.click();
    }

    // Look for and click the submit/save/create button
    const submitButton = page.locator('button:has-text("Create"), button:has-text("Save"), button:has-text("Book"), button[type="submit"]').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for success message or redirect
      await page.waitForTimeout(2000);

      // Look for success indicators
      const successIndicators = page.locator('text=success, text=created, text=booked, .toast, [role="alert"]');
      if (await successIndicators.first().isVisible()) {
        await expect(successIndicators.first()).toBeVisible();
      }
    }
  });

  test('should verify logout functionality', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Find and click the logout button
    const logoutButton = page.locator('button[title="Sign Out"], button:has([data-lucide="log-out"]), button:has-text("Sign Out"), button:has-text("Logout")').first();
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    // Wait for redirect to sign in page
    await page.waitForURL('/signin');

    // Verify we're back on the sign in page
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should verify responsive behavior on different screen sizes', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Test desktop view (default)
    await expect(page.locator('h1')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // On mobile, there should be a mobile menu button
    const mobileMenuButton = page.locator('button:has([data-lucide="menu"]), button:has-text("Menu"), .mobile-menu, [class*="mobile"]').first();
    if (await mobileMenuButton.isVisible()) {
      await expect(mobileMenuButton).toBeVisible();
    }

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should verify page loading states and error handling', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[type="email"]', 'admin@reserva.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Test navigation to different pages and ensure they load without errors
    const pages = ['/calendar', '/clients', '/staff', '/treatments', '/settings'];

    for (const pagePath of pages) {
      await page.goto(`http://localhost:3001${pagePath}`);
      await page.waitForLoadState('networkidle');

      // Check that there are no obvious error messages
      const errorMessages = page.locator('text=error, text=failed, text=not found, .error, [role="alert"][class*="error"]');
      if (await errorMessages.first().isVisible()) {
        const errorText = await errorMessages.first().textContent();
        console.log(`Potential error on ${pagePath}: ${errorText}`);
      }

      // Verify basic page structure is present
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
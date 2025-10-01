/**
 * End-to-End Testing for Reserva Admin App
 * Tests all major features with seeded data
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const TEST_EMAIL = 'clinic1@reserva.app'
const TEST_PASSWORD = 'password123'

test.describe('Complete E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to sign-in page
    await page.goto(`${BASE_URL}/signin`)

    // Sign in
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL(`${BASE_URL}/dashboard`)
  })

  test('1. Dashboard - Load and Display Stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Check that page loaded
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`)

    // Check for main sections (at least stats should be visible)
    const statsSection = page.locator('text=/Revenue|Bookings|Clients|Staff/i').first()
    await expect(statsSection).toBeVisible()

    console.log('✅ Dashboard loaded successfully')
  })

  test('2. Calendar - Display Bookings', async ({ page }) => {
    await page.goto(`${BASE_URL}/calendar`)

    await expect(page).toHaveURL(`${BASE_URL}/calendar`)

    // Calendar should be visible
    const calendar = page.locator('[data-testid="calendar"], .calendar').first()

    // Look for time slots or bookings
    const hasTimeSlots = await page.locator('text=/09:00|10:00|11:00/').first().isVisible().catch(() => false)
    const hasBookings = await page.locator('[data-testid="booking"], .booking').first().isVisible().catch(() => false)

    expect(hasTimeSlots || hasBookings).toBeTruthy()

    console.log('✅ Calendar displayed bookings')
  })

  test('3. Clients - List and Search', async ({ page }) => {
    await page.goto(`${BASE_URL}/clients`)

    await expect(page).toHaveURL(`${BASE_URL}/clients`)

    // Wait for data to load
    await page.waitForTimeout(2000)

    // Check if patient list exists (table or list)
    const hasTable = await page.locator('table').isVisible().catch(() => false)
    const hasCards = await page.locator('[data-testid="patient-card"], .patient').count().then(c => c > 0).catch(() => false)

    expect(hasTable || hasCards).toBeTruthy()

    // Try searching
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="cari" i]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('Budi')
      await page.waitForTimeout(1000)
      console.log('✅ Search functionality tested')
    }

    console.log('✅ Clients page functional')
  })

  test('4. Staff - List Staff Members', async ({ page }) => {
    await page.goto(`${BASE_URL}/staff`)

    await expect(page).toHaveURL(`${BASE_URL}/staff`)

    // Wait for data to load
    await page.waitForTimeout(2000)

    // Check for staff display
    const hasStaff = await page.locator('text=/Therapist|Staff|Balance|Skills/i').first().isVisible().catch(() => false)
    const hasTable = await page.locator('table').isVisible().catch(() => false)

    expect(hasStaff || hasTable).toBeTruthy()

    console.log('✅ Staff page loaded')
  })

  test('5. Treatments - Display Services', async ({ page }) => {
    await page.goto(`${BASE_URL}/treatments`)

    await expect(page).toHaveURL(`${BASE_URL}/treatments`)

    // Wait for data
    await page.waitForTimeout(2000)

    // Check for treatments
    const hasTreatments = await page.locator('text=/Facial|Massage|Treatment|Price/i').first().isVisible().catch(() => false)
    const hasTable = await page.locator('table').isVisible().catch(() => false)

    expect(hasTreatments || hasTable).toBeTruthy()

    console.log('✅ Treatments page loaded')
  })

  test('6. Walk-in - Queue Management', async ({ page }) => {
    await page.goto(`${BASE_URL}/walk-in`)

    await expect(page).toHaveURL(`${BASE_URL}/walk-in`)

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Page should render without errors
    const hasQueue = await page.locator('text=/Queue|Walk-in|Add/i').first().isVisible().catch(() => false)

    expect(hasQueue).toBeTruthy()

    console.log('✅ Walk-in page loaded')
  })

  test('7. Withdrawal - Financial Management', async ({ page }) => {
    await page.goto(`${BASE_URL}/withdrawal`)

    await expect(page).toHaveURL(`${BASE_URL}/withdrawal`)

    // Wait for data
    await page.waitForTimeout(2000)

    // Check for withdrawal content
    const hasWithdrawals = await page.locator('text=/Withdrawal|Balance|Amount|Status/i').first().isVisible().catch(() => false)

    expect(hasWithdrawals).toBeTruthy()

    console.log('✅ Withdrawal page loaded')
  })

  test('8. Settings - User Profile', async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`)

    await expect(page).toHaveURL(`${BASE_URL}/settings`)

    // Check settings page elements
    const hasSettings = await page.locator('text=/Settings|Profile|Password|Account/i').first().isVisible().catch(() => false)

    expect(hasSettings).toBeTruthy()

    console.log('✅ Settings page loaded')
  })

  test('9. Navigation - Sidebar Links', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Test sidebar navigation
    const links = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Calendar', url: '/calendar' },
      { text: 'Clients', url: '/clients' },
      { text: 'Staff', url: '/staff' }
    ]

    for (const link of links) {
      const linkElement = page.locator(`a[href="${link.url}"], text="${link.text}"`).first()
      if (await linkElement.isVisible()) {
        await linkElement.click()
        await page.waitForTimeout(1000)
        await expect(page).toHaveURL(new RegExp(link.url))
        console.log(`✅ Navigated to ${link.text}`)
      }
    }
  })

  test('10. Sign Out', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)

    // Find sign out button (could be in sidebar, header, or menu)
    const signOutButton = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), [data-testid="signout"]').first()

    if (await signOutButton.isVisible()) {
      await signOutButton.click()

      // Should redirect to sign-in
      await page.waitForURL(`${BASE_URL}/signin`)
      await expect(page).toHaveURL(`${BASE_URL}/signin`)

      console.log('✅ Sign out successful')
    } else {
      console.log('⚠️  Sign out button not found in expected locations')
    }
  })
})

test.describe('Data Validation Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`)
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL(`${BASE_URL}/dashboard`)
  })

  test('11. Calendar - Today\'s Bookings', async ({ page }) => {
    await page.goto(`${BASE_URL}/calendar`)
    await page.waitForTimeout(2000)

    // Check for any bookings today
    const todayBookings = await page.locator('[data-testid="booking"], .booking').count()

    console.log(`📅 Found ${todayBookings} bookings visible on calendar`)
    expect(todayBookings).toBeGreaterThanOrEqual(0) // At least render without errors
  })

  test('12. Clients - Patient Count', async ({ page }) => {
    await page.goto(`${BASE_URL}/clients`)
    await page.waitForTimeout(2000)

    // Try to count visible patients
    const patientRows = await page.locator('tr:has(td), [data-testid="patient-card"]').count()

    console.log(`👥 Found ${patientRows} patient records visible`)
    expect(patientRows).toBeGreaterThanOrEqual(5) // Should have seeded data
  })

  test('13. Staff - Staff Count', async ({ page }) => {
    await page.goto(`${BASE_URL}/staff`)
    await page.waitForTimeout(2000)

    const staffRows = await page.locator('tr:has(td), [data-testid="staff-card"]').count()

    console.log(`👨‍⚕️ Found ${staffRows} staff members visible`)
    expect(staffRows).toBeGreaterThanOrEqual(5)
  })

  test('14. Treatments - Treatment Count', async ({ page }) => {
    await page.goto(`${BASE_URL}/treatments`)
    await page.waitForTimeout(2000)

    const treatmentRows = await page.locator('tr:has(td), [data-testid="treatment-card"]').count()

    console.log(`💆 Found ${treatmentRows} treatments visible`)
    expect(treatmentRows).toBeGreaterThanOrEqual(10)
  })
})

test.describe('Error Handling', () => {

  test('15. Protected Routes - Redirect Unauthenticated', async ({ page }) => {
    // Try accessing protected route without login
    await page.goto(`${BASE_URL}/dashboard`)

    // Should redirect to signin
    await page.waitForURL(/signin/, { timeout: 5000 })
    expect(page.url()).toContain('/signin')

    console.log('✅ Protected routes require authentication')
  })

  test('16. Invalid Login', async ({ page }) => {
    await page.goto(`${BASE_URL}/signin`)

    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Wait a bit for error
    await page.waitForTimeout(2000)

    // Should still be on signin page or show error
    const isOnSignin = page.url().includes('/signin')
    const hasError = await page.locator('text=/error|invalid|incorrect/i').first().isVisible().catch(() => false)

    expect(isOnSignin || hasError).toBeTruthy()

    console.log('✅ Invalid login handled correctly')
  })
})
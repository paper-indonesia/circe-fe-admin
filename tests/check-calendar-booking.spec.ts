import { test, expect } from '@playwright/test';

test('Check Calendar New Booking Flow', async ({ page }) => {
  // Set viewport
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Navigate to signin page first
  await page.goto('http://localhost:3001/signin');
  await page.waitForTimeout(1000);

  // Sign in
  await page.fill('input[type="email"]', 'manager@beautyclinic.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign in")');
  await page.waitForTimeout(2000);

  // Navigate to calendar page
  await page.goto('http://localhost:3001/calendar');
  await page.waitForTimeout(2000);

  // Take initial screenshot
  await page.screenshot({ path: 'test-screenshots/calendar-initial.png', fullPage: true });

  // Click New Booking button
  const newBookingButton = page.locator('button:has-text("New Booking")').first();
  if (await newBookingButton.isVisible()) {
    await newBookingButton.click();
    await page.waitForTimeout(1000);

    // Take screenshot of booking dialog
    await page.screenshot({ path: 'test-screenshots/calendar-booking-dialog.png', fullPage: true });

    // Navigate through steps if dialog opened
    // Step 1: Select a treatment
    const firstTreatment = page.locator('[class*="rounded-xl border-2"]').first();
    if (await firstTreatment.isVisible()) {
      await firstTreatment.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-screenshots/calendar-step1-treatment.png', fullPage: true });

      // Click Next
      const nextButton = page.locator('button:has-text("Next")');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-screenshots/calendar-step2-staff.png', fullPage: true });

        // Select staff
        const firstStaff = page.locator('[class*="rounded-xl border-2"]').first();
        if (await firstStaff.isVisible()) {
          await firstStaff.click();
          await page.waitForTimeout(500);
          await nextButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'test-screenshots/calendar-step3-schedule.png', fullPage: true });

          // Try to select a date
          const dateButton = page.locator('[class*="aspect-square rounded-xl"]:not([disabled])').nth(15);
          if (await dateButton.isVisible()) {
            await dateButton.click();
            await page.waitForTimeout(1000);
            await page.screenshot({ path: 'test-screenshots/calendar-step3-date-selected.png', fullPage: true });

            // Select time
            const timeSlot = page.locator('button:has-text("10:00")').first();
            if (await timeSlot.isVisible()) {
              await timeSlot.click();
              await page.waitForTimeout(1000);
              await page.screenshot({ path: 'test-screenshots/calendar-step3-time-selected.png', fullPage: true });

              // Check client selection
              const clientDropdown = page.locator('[role="combobox"]').first();
              if (await clientDropdown.isVisible()) {
                await clientDropdown.click();
                await page.waitForTimeout(1000);
                await page.screenshot({ path: 'test-screenshots/calendar-step3-client-dropdown.png', fullPage: true });
              }
            }
          }
        }
      }
    }
  }

  console.log('✅ Screenshots saved to test-screenshots/');
});

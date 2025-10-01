# 🧪 Testing Tour Button - Removal Instructions

## What is this?

The **Tour Test Button** is a floating orange button in the bottom-right corner of the Dashboard that allows you to test the Guided Tour feature without going through the full signup flow.

## Location

- **Button**: Bottom-right corner of Dashboard (orange "🧪 Test Tour" button)
- **Files**:
  - `components/tour-test-button.tsx` (Component file)
  - `app/dashboard/page.tsx` (Usage)

## How to Remove After Testing

When you're done testing and ready for production, follow these simple steps:

### Step 1: Delete the Component File

```bash
rm components/tour-test-button.tsx
```

Or manually delete: `components/tour-test-button.tsx`

### Step 2: Remove Import from Dashboard

Open `app/dashboard/page.tsx` and **DELETE this line**:

```typescript
import { TourTestButton } from "@/components/tour-test-button" // 🧪 DELETE THIS LINE AFTER TESTING
```

### Step 3: Remove Component from Render

In the same file (`app/dashboard/page.tsx`), find and **DELETE these lines** near the end:

```typescript
{/* 🧪 TESTING COMPONENT - DELETE AFTER TESTING */}
<TourTestButton />
{/* 🧪 END TESTING COMPONENT */}
```

### Step 4: Done! ✅

The test button is now removed and the Guided Tour will only appear for new users who complete the onboarding wizard.

---

## Production Behavior (After Removal)

Once removed, the Guided Tour will only show when:

1. ✅ User completes signup
2. ✅ User completes onboarding wizard
3. ✅ User redirects to dashboard
4. ✅ FTUE has not been completed before
5. ✅ Tour auto-starts after 1 second

Users can:
- Skip the tour (won't show again)
- Complete the tour (confetti + won't show again)
- Tour is tracked in localStorage

---

## Re-enable Testing Later

If you need to test again later, you can temporarily:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `localStorage.removeItem('ftue-completed')`
4. Refresh the page
5. The tour will appear (if on dashboard)

---

**Note**: The test button is clearly marked with 🧪 emoji and orange color to make it obvious it's for testing only.
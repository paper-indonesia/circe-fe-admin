# Color Migration Guide

## Overview
This guide documents the migration from old color palette to the new design system colors based on `typography-preview.html`.

## Color Mapping

### Old Colors → New Colors

#### Primary/Purple Colors
```
Old: #FFD6FF → New: #FCD6F5 (Light Pink accent)
Old: #E7C6FF → New: #EDE9FE (Lightest Purple)
Old: #C8B6FF → New: #8B5CF6 (Primary Purple)
Old: #B8C0FF → New: #A78BFA (Secondary Purple)
Old: #BBD0FF → New: #C4B5FD (Light Purple)
```

#### New Additional Colors
```
Dark Purple: #6D28D9
Accent Pink: #EC4899
```

### Common Pattern Replacements

#### Gradients
```typescript
// OLD
from-[#C8B6FF] to-[#B8C0FF]
// NEW
from-[#8B5CF6] to-[#6D28D9]

// OLD
from-[#FFD6FF]/20 to-[#E7C6FF]/20
// NEW
from-[#EDE9FE] to-[#FCD6F5]/50

// OLD
from-purple-600 to-pink-600
// NEW
from-[#8B5CF6] to-[#EC4899]
```

#### Backgrounds
```typescript
// OLD
bg-[#C8B6FF]
// NEW
bg-[#8B5CF6]

// OLD
bg-[#E7C6FF]/30
// NEW
bg-[#EDE9FE]

// OLD
bg-[#FFD6FF]/30
// NEW
bg-[#FCD6F5]
```

#### Text Colors
```typescript
// OLD
text-[#C8B6FF]
text-purple-600
// NEW
text-[#8B5CF6]

// OLD
text-[#B8C0FF]
text-purple-700
// NEW
text-[#6D28D9]
```

#### Borders
```typescript
// OLD
border-[#C8B6FF]
border-purple-300
// NEW
border-[#8B5CF6]

// OLD
border-[#E7C6FF]
border-purple-200
// NEW
border-[#C4B5FD]
```

## Usage with Design System

### Import the design system
```typescript
import { COLORS, tw, typography } from '@/lib/design-system'
```

### Use predefined classes
```typescript
// Instead of inline colors
<Button className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]">

// Use design system
<Button className={tw.button.primary}>

// Or for custom needs
<div className="bg-[#8B5CF6]"> // Still OK, but prefer tw classes
```

### Examples

#### Cards
```typescript
// Highlight card with gradient
<Card className={tw.card.gradient}>

// Regular card
<Card className={tw.card.default}>
```

#### Buttons
```typescript
// Primary button
<Button className={tw.button.primary}>Save</Button>

// Accent button (with animation)
<Button className={tw.button.accent}>Upgrade Now</Button>

// Ghost button
<Button className={tw.button.ghost}>Cancel</Button>
```

#### Badges
```typescript
// Primary badge
<Badge className={tw.badge.primary}>Active</Badge>

// Accent badge
<Badge className={tw.badge.accent}>Featured</Badge>
```

#### Typography
```typescript
// Heading 1
<h1 className={`${typography.h1} ${tw.text.dark}`}>
  Welcome
</h1>

// Gradient text
<h2 className={typography.gradient}>
  Premium Features
</h2>
```

## Files Updated

### Core Pages (Already Updated)
- ✅ `app/dashboard/page.tsx`

### Pending Updates
- 🔄 `app/calendar/page.tsx`
- 🔄 `app/clients/page.tsx`
- 🔄 `app/staff/page.tsx`
- 🔄 `app/settings/page.tsx`
- 🔄 `app/subscription/manage/page.tsx`
- 🔄 `app/subscription/upgrade/page.tsx`
- 🔄 `app/products/page.tsx`
- 🔄 `app/reports/page.tsx`

### Components to Update
- 🔄 `components/ui/button.tsx`
- 🔄 `components/ui/badge.tsx`
- 🔄 `components/ui/card.tsx`
- 🔄 `components/subscription-warning-banner.tsx` (Already updated)
- 🔄 `components/onboarding-*.tsx`

## Search & Replace Commands

### For VS Code
Use Find & Replace (Ctrl+Shift+H) with Regex enabled:

1. **Purple Primary**
   ```
   Find: \[#C8B6FF\]
   Replace: [#8B5CF6]
   ```

2. **Purple Secondary**
   ```
   Find: \[#B8C0FF\]
   Replace: [#A78BFA]
   ```

3. **Light Purple**
   ```
   Find: \[#E7C6FF\]
   Replace: [#EDE9FE]
   ```

4. **Pink Light**
   ```
   Find: \[#FFD6FF\]
   Replace: [#FCD6F5]
   ```

5. **Purple text classes**
   ```
   Find: text-purple-600
   Replace: text-[#8B5CF6]
   ```

   ```
   Find: text-purple-700
   Replace: text-[#6D28D9]
   ```

6. **Purple bg classes**
   ```
   Find: bg-purple-50
   Replace: bg-[#EDE9FE]
   ```

   ```
   Find: bg-purple-100
   Replace: bg-[#EDE9FE]
   ```

## Testing Checklist

After migration, test:
- [ ] Dashboard loads correctly
- [ ] All cards display properly
- [ ] Buttons have correct colors and hover states
- [ ] Badges render with new colors
- [ ] Charts use new color palette
- [ ] Gradients display smoothly
- [ ] Text is readable (contrast check)
- [ ] Dark mode (if applicable) works
- [ ] Mobile responsive colors

## Rollback Plan

If issues occur:
1. Revert to previous commit
2. Check console for errors
3. Review COLOR_MIGRATION_GUIDE.md
4. Apply fixes incrementally

## Notes

- All hex colors should be wrapped in square brackets: `[#8B5CF6]`
- When using Tailwind classes, prefer design system utilities
- Keep consistent: don't mix old and new colors in same component
- Test in different browsers for gradient support
- Check accessibility (WCAG AA contrast ratios)

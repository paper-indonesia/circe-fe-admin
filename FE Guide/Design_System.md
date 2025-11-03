# Design System Documentation

## Overview

This guide demonstrates how to create **AI-readable design system documentation** that Claude Code can reference during implementation. A well-documented design system ensures visual consistency and accelerates development.

---

## Why Design Systems Matter for AI

AI generates better UI code when design tokens are:
- **Explicit**: "Use `#8B5CF6`" not "purple-ish color"
- **Named**: "Primary color" not "that button color"
- **Systematic**: "4px base unit, multiples of 4" not "add some space"
- **Referenced**: Link from CLAUDE.md to design system doc

---

## Design System Template

```markdown
# [Project Name] Design System

**Version**: 1.0
**Last Updated**: 2025-01-15
**Status**: Active

---

## Brand

**Product Name**: [Name]
**Tagline**: [Short tagline]
**Voice & Tone**: Professional, Helpful, Clear

---

## Color Palette

### Primary Colors

| Color | Variable | Hex | Tailwind | Usage |
|-------|----------|-----|----------|-------|
| Primary | `--primary` | `#8B5CF6` | `bg-primary` | Buttons, active states, focus rings |
| Primary Hover | `--primary-hover` | `#7C3AED` | `hover:bg-primary-hover` | Button hover states |
| Primary Light | `--primary-light` | `#F3E8FF` | `bg-primary-light` | Hover backgrounds, highlights |

### Neutral Colors

| Color | Variable | Hex | Tailwind | Usage |
|-------|----------|-----|----------|-------|
| Background | `--background` | `#F9FAFB` | `bg-background` | Page background |
| Card | `--card` | `#FFFFFF` | `bg-card` | Card backgrounds |
| Border | `--border` | `#E5E7EB` | `border-border` | Borders, dividers |
| Text Heading | `--text-heading` | `#111827` | `text-text-heading` | Headings |
| Text Body | `--text-body` | `#374151` | `text-text-body` | Body text |
| Text Muted | `--text-muted` | `#6B7280` | `text-text-muted` | Secondary text, labels |

### Semantic Colors

| Color | Variable | Hex | Tailwind | Usage |
|-------|----------|-----|----------|-------|
| Success | `--success` | `#10B981` | `text-success` | Success messages, icons |
| Warning | `--warning` | `#F59E0B` | `text-warning` | Warning messages |
| Error | `--error` | `#EF4444` | `text-error` | Error messages, destructive actions |
| Info | `--info` | `#3B82F6` | `text-info` | Info messages |

### CSS Variables (globals.css)

```css
@layer base {
  :root {
    --primary: 262.1 83.3% 57.8%;        /* Purple 500 */
    --primary-hover: 262.1 83.3% 47.8%;  /* Purple 600 */
    --primary-light: 262.1 100% 96.1%;   /* Purple 50 */

    --background: 220 14.3% 97.6%;       /* Gray 50 */
    --card: 0 0% 100%;                   /* White */
    --border: 220 13% 91%;               /* Gray 200 */

    --text-heading: 220 13% 9%;          /* Gray 900 */
    --text-body: 217 10.6% 24.5%;        /* Gray 700 */
    --text-muted: 220 8.9% 46.1%;        /* Gray 500 */

    --success: 142.1 76.2% 36.3%;        /* Green 500 */
    --warning: 37.7 92.1% 50.2%;         /* Amber 500 */
    --error: 0 84.2% 60.2%;              /* Red 500 */
    --info: 217.2 91.2% 59.8%;           /* Blue 500 */
  }
}
```

---

## Typography

### Font Families

- **Primary**: `Geist Sans` - Headings, body text
- **Monospace**: `Geist Mono` - Code, numbers

### Type Scale

| Element | Class | Size | Line Height | Weight | Usage |
|---------|-------|------|-------------|--------|-------|
| Display | `text-4xl` | 36px | 1.2 | 700 | Hero headings |
| H1 | `text-3xl` | 30px | 1.3 | 700 | Page titles |
| H2 | `text-2xl` | 24px | 1.4 | 600 | Section headings |
| H3 | `text-xl` | 20px | 1.4 | 600 | Subsection headings |
| H4 | `text-lg` | 18px | 1.5 | 600 | Card titles |
| Body Large | `text-base` | 16px | 1.5 | 400 | Large body text |
| Body | `text-sm` | 14px | 1.5 | 400 | Default body text |
| Caption | `text-xs` | 12px | 1.5 | 400 | Labels, metadata |

### Font Weights

- **Bold**: `font-bold` (700) - Page titles
- **Semibold**: `font-semibold` (600) - Headings, buttons
- **Medium**: `font-medium` (500) - Links, labels
- **Normal**: `font-normal` (400) - Body text

---

## Spacing

### Base Unit

**4px** - All spacing is a multiple of 4

### Spacing Scale

| Token | Value | Class | Usage Example |
|-------|-------|-------|---------------|
| `0` | 0px | `p-0` | Reset |
| `1` | 4px | `p-1` | Tight spacing |
| `2` | 8px | `p-2` | Icon padding |
| `3` | 12px | `p-3` | Button padding vertical |
| `4` | 16px | `p-4` | Button padding horizontal, card gap |
| `6` | 24px | `p-6` | Card padding |
| `8` | 32px | `p-8` | Section spacing |
| `12` | 48px | `p-12` | Large section spacing |
| `16` | 64px | `p-16` | Extra large spacing |

### Common Patterns

- **Card Padding**: `p-6` (24px)
- **Section Gap**: `gap-6` or `space-y-6` (24px)
- **Input Padding**: `px-3 py-2` (12px horizontal, 8px vertical)
- **Button Padding**: `px-4 py-2` (16px horizontal, 8px vertical)
- **Container Padding**: `px-4 md:px-6 lg:px-8` (responsive)

---

## Shadows

| Name | Class | Value | Usage |
|------|-------|-------|-------|
| Small | `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Cards |
| Default | `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Elevated cards |
| Medium | `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Dropdowns |
| Large | `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals |
| Extra Large | `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Overlays |

### Hover Effects

```tsx
// Card with hover shadow
<Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
```

---

## Border Radius

| Name | Class | Value | Usage |
|------|-------|-------|-------|
| Small | `rounded-sm` | 4px | Badges, tags |
| Default | `rounded` or `rounded-md` | 6px | Buttons, inputs |
| Large | `rounded-lg` | 8px | Cards |
| Extra Large | `rounded-xl` | 12px | Modals |
| Full | `rounded-full` | 9999px | Avatars, pills |

---

## Components

### Buttons

#### Variants

```tsx
<Button variant="default">Primary</Button>        // Solid primary color
<Button variant="secondary">Secondary</Button>    // Solid gray
<Button variant="outline">Outline</Button>        // Border only
<Button variant="ghost">Ghost</Button>            // Transparent, hover effect
<Button variant="destructive">Delete</Button>     // Red, for dangerous actions
<Button variant="link">Link</Button>              // Underlined text
```

#### Sizes

```tsx
<Button size="sm">Small</Button>      // 32px height, text-sm
<Button size="default">Default</Button> // 40px height, text-base
<Button size="lg">Large</Button>      // 48px height, text-lg
<Button size="icon">🔍</Button>        // 40x40px square
```

### Cards

```tsx
<Card className="p-6 bg-card border border-border rounded-lg shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg font-semibold">Title</CardTitle>
    <CardDescription className="text-sm text-muted-foreground">Description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    {/* Actions */}
  </CardFooter>
</Card>
```

### Inputs

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
    className="px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary"
  />
  <p className="text-xs text-muted-foreground">We'll never share your email.</p>
</div>
```

---

## Icons

**Library**: Lucide React (https://lucide.dev)

### Size Convention

| Size | Class | Pixels | Usage |
|------|-------|--------|-------|
| Small | `h-4 w-4` | 16px | Inline with text, button icons |
| Default | `h-5 w-5` | 20px | Button icons, navigation |
| Large | `h-6 w-6` | 24px | Headings, emphasis |
| Extra Large | `h-8 w-8` | 32px | Empty states, illustrations |

### Common Icons

```tsx
import {
  Plus,          // Add actions
  Edit,          // Edit actions
  Trash,         // Delete actions
  Search,        // Search functionality
  Filter,        // Filters
  X,             // Close dialogs
  Check,         // Success indicators
  AlertCircle,   // Error/Warning
  Info,          // Info messages
  ChevronDown,   // Dropdowns
  ChevronRight,  // Navigation, expand
} from 'lucide-react'
```

---

## Responsive Breakpoints

| Breakpoint | Min Width | Device | Usage |
|------------|-----------|--------|-------|
| `sm` | 640px | Mobile landscape | Adjust layouts |
| `md` | 768px | Tablet portrait | Show/hide elements, 2-column |
| `lg` | 1024px | Tablet landscape, Small desktop | 3-column, sidebar visible |
| `xl` | 1280px | Desktop | Full layout |
| `2xl` | 1536px | Large desktop | Extra space |

### Mobile-First Examples

```tsx
// Responsive padding
<div className="px-4 md:px-6 lg:px-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2, Desktop: 3 */}
</div>

// Show/hide
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">Responsive Heading</h1>
```

---

## Animations

**Library**: Framer Motion (optional)

### Duration

- **Fast**: 150ms - Hover states, small interactions
- **Normal**: 300ms - Modals, dropdowns, page transitions
- **Slow**: 500ms - Large animations, page loads

### Easing

```typescript
const easing = {
  easeOut: [0, 0, 0.2, 1],       // Default
  easeIn: [0.4, 0, 1, 1],        // Entrances
  easeInOut: [0.4, 0, 0.2, 1],   // Smooth
}
```

### Common Patterns

```tsx
// Modal entry
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  <Dialog />
</motion.div>

// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <Content />
</motion.div>
```

---

## Accessibility

### Color Contrast

| Element | Minimum Ratio | WCAG Level |
|---------|---------------|------------|
| Normal text | 4.5:1 | AA |
| Large text (18px+) | 3:1 | AA |
| UI components | 3:1 | AA |

### Pre-Approved Combinations

✅ **WCAG AA Compliant**:
- `text-text-heading` on `bg-background` (16.2:1)
- `text-text-body` on `bg-card` (11.4:1)
- `text-text-muted` on `bg-card` (5.1:1)
- `text-white` on `bg-primary` (7.3:1)

### Focus Indicators

**Standard**: `focus-visible:ring-2 ring-primary focus-visible:ring-offset-2`

```tsx
// Applied to all focusable elements
<button className="focus-visible:ring-2 ring-primary focus-visible:ring-offset-2">
  Button
</button>
```

---

## Using This Design System

### In CLAUDE.md

```markdown
## Design System

**Reference**: @design-references/design-system.md

**Quick Reference**:
- Primary: `bg-primary` (#8B5CF6)
- Card: `bg-card border border-border rounded-lg shadow-sm`
- Heading: `text-text-heading font-semibold`
- Body: `text-text-body`
- Spacing: 4px base (p-4 = 16px, p-6 = 24px)
```

### In Component Code

```tsx
// Good ✅ - Uses design system
<Card className="p-6 bg-card border border-border rounded-lg shadow-sm">
  <h2 className="text-lg font-semibold text-text-heading mb-4">Title</h2>
  <p className="text-sm text-text-body">Body text</p>
  <Button className="mt-4 bg-primary hover:bg-primary-hover">Action</Button>
</Card>

// Bad ❌ - Hardcoded values
<div className="p-[24px] bg-white border-[1px] border-gray-200 rounded-[8px]">
  <h2 className="text-[18px] font-[600] text-gray-900 mb-[16px]">Title</h2>
  <p className="text-[14px] text-gray-700">Body text</p>
  <button className="mt-[16px] bg-[#8B5CF6] hover:bg-[#7C3AED]">Action</button>
</div>
```

---

## Maintenance

### Updating the Design System

1. **Update CSS Variables** (globals.css)
2. **Update This Document** (design-system.md)
3. **Update CLAUDE.md** (reference quick values)
4. **Notify Team** (changelog, announcement)

### Version History

- **v1.0** (2025-01-15): Initial design system
- [Future updates here]

---

<div align="center">

**Design System Complete**

[← Back to Implementation](04_Frontend_Implementation.md) | [Next: Component Library →](Component_Library_Integration.md)

</div>

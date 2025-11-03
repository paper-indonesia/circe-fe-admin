# Phase 0: Design Research & Reference Gathering

## Overview

**Phase 0** is unique to Frontend development and happens **before** the Circe Lessons workflow. This phase involves gathering visual design references, extracting UI patterns, and documenting design systems to provide AI with concrete examples.

**Why This Matters**: AI generates better UI code when given specific visual references rather than vague descriptions like "modern design" or "clean interface."

---

## Table of Contents

1. [Design Reference Sources](#design-reference-sources)
2. [What to Capture](#what-to-capture)
3. [Prompt Templates for Design Research](#prompt-templates-for-design-research)
4. [Organizing Design References](#organizing-design-references)
5. [Extracting Design Tokens](#extracting-design-tokens)
6. [Example Design Reference Document](#example-design-reference-document)
7. [Best Practices](#best-practices)

---

## Design Reference Sources

### 1. Component Marketplaces

#### 21dev (https://21dev.app)
**Purpose**: Production-ready React/Next.js components with code

**What to Look For**:
- Dashboard layouts
- Data tables
- Form components
- Modal patterns
- Navigation structures

**How to Use**:
```
1. Browse by category (Dashboard, Admin, Forms, Tables)
2. Preview components in your use case
3. Screenshot or save design pattern
4. Copy code examples if available
5. Note component library used (Tailwind, MUI, etc.)
```

**Example Prompt**:
```
I found this table component on 21dev: [screenshot or URL]
Extract the key UI patterns:
- Column layout and spacing
- Header styling
- Row hover effects
- Action button placement
- Pagination design

Provide Tailwind utility classes to replicate this design.
```

---

#### MagicUI (https://magicui.design)
**Purpose**: Animated components with copy-paste code

**What to Look For**:
- Animated buttons and cards
- Shimmer effects
- Loading animations
- Micro-interactions

**How to Use**:
```
1. Find component in registry
2. Copy component code directly
3. Note dependencies (Framer Motion, Tailwind Variants)
4. Save animation timing values
5. Screenshot for reference
```

**Example Prompt**:
```
Install this MagicUI component into my Next.js project:
[paste component code or URL]

Adapt it to use my design system colors:
--primary: #8B5CF6
--secondary: #EC4899

Ensure it works with shadcn/ui.
```

---

### 2. Design Inspiration Platforms

#### Dribbble (https://dribbble.com)
**Purpose**: High-fidelity UI design mockups

**Search Terms**:
- "admin dashboard"
- "booking system"
- "SaaS dashboard"
- "data table UI"
- "form design"
- "modal design"

**What to Capture**:
- Overall layout and grid
- Color palettes (use eyedropper tool)
- Typography hierarchy
- Spacing and padding
- Iconography style
- Card shadows and borders

**How to Use**:
```
1. Search for your feature (e.g., "appointment dashboard")
2. Screenshot 3-5 inspiring designs
3. Save to design-references/ folder
4. Annotate screenshots with notes
5. Extract color codes with eyedropper
```

**Example Prompt**:
```
Based on this Dribbble design: [attach screenshot]

Create a component breakdown:
1. Identify all UI components (header, sidebar, cards, etc.)
2. Suggest Tailwind classes for each component
3. Propose a component hierarchy (which are reusable?)
4. List any shadcn/ui components that match this design
```

---

#### Behance (https://www.behance.net)
**Purpose**: Detailed design case studies

**What to Look For**:
- Design systems documentation
- Component libraries
- Style guides
- Interaction flows

---

### 3. Component Libraries (For Patterns)

#### shadcn/ui (https://ui.shadcn.com)
**Purpose**: Copy-paste React components (Tailwind + Radix UI)

**How to Use**:
```
1. Browse components library
2. Check "Examples" tab for real-world usage
3. Copy component code to components/ui/
4. Customize with your design tokens
```

**Example Prompt**:
```
I want to use shadcn/ui's Dialog component for my create user modal.

Customize it with:
- My brand colors (purple primary)
- Larger modal size (600px width)
- Custom close button with icon
- Form inside dialog content

Provide the complete component code.
```

---

#### Radix UI (https://www.radix-ui.com)
**Purpose**: Unstyled, accessible components

**What to Look For**:
- Accessibility patterns (ARIA attributes)
- Keyboard navigation examples
- Focus management patterns

---

### 4. Production Apps (For Inspiration)

**Examples**:
- Linear (https://linear.app) - Clean, minimal design
- Notion (https://notion.so) - Flexible layouts
- Vercel Dashboard - Modern SaaS UI
- Stripe Dashboard - Data visualization

**What to Capture**:
- Navigation patterns
- Empty states
- Loading states
- Error states
- Onboarding flows

---

## What to Capture

### Essential Information

#### 1. Screenshots
```
design-references/
  dashboard-layout/
    dribbble-example-1.png
    dribbble-example-2.png
    21dev-table-design.png
```

#### 2. Design Notes Document
```markdown
# [Feature Name] Design Reference

## Source
- URL: [link]
- Designer/Platform: [name]
- Date Saved: 2025-01-15

## Key Features
- [List main UI features to replicate]

## Color Palette
- Primary: #8B5CF6 (Purple 500)
- Secondary: #EC4899 (Pink 500)
- Background: #F9FAFB
- [etc.]

## Typography
- Headings: Geist Sans, 600 weight
- Body: Geist Sans, 400 weight
- Sizes: [list sizes]

## Spacing & Layout
- Card padding: 24px
- Section gap: 32px
- Grid: 12 columns

## Components Identified
1. Sidebar Navigation
2. Header with Search
3. KPI Cards
4. Data Table
```

#### 3. Component Code (If Available)
```
design-references/
  patterns/
    shimmer-button.tsx     # From MagicUI
    data-table-pattern.tsx # From 21dev
```

#### 4. Design Prompts (If Available)
```
design-references/
  prompts/
    hero-section-prompt.txt
    pricing-card-prompt.txt
```

---

## Prompt Templates for Design Research

### Template 1: Screenshot Analysis

```
I have this screenshot of a [feature] UI design: [attach screenshot]

Please analyze and extract:

1. **Layout Structure**:
   - Grid system (columns, rows)
   - Container widths and padding
   - Section spacing

2. **Color Palette**:
   - Primary colors (extract hex codes if visible)
   - Background colors
   - Text colors (heading, body, muted)
   - Border colors

3. **Typography**:
   - Font family (if identifiable)
   - Heading sizes and weights
   - Body text size
   - Line heights

4. **Component Breakdown**:
   - List all UI components visible
   - Suggest component hierarchy (parent/child)
   - Identify which are reusable

5. **Tailwind Utilities**:
   - Propose Tailwind classes for each major component
   - Include responsive breakpoints if needed

6. **shadcn/ui Matches**:
   - List shadcn/ui components that could be used
   - Note any that need customization

Format as a structured markdown document.
```

**Use Case**: When you have a screenshot but need to extract design system information.

---

### Template 2: Pattern Extraction

```
I found this [component name] on [21dev/MagicUI/Dribbble]: [URL or screenshot]

Please extract the implementation pattern:

1. **Core Functionality**:
   - What does this component do?
   - What are the key interactions?

2. **Visual Pattern**:
   - Layout (flex, grid, absolute positioning)
   - Spacing between elements
   - Hover/focus states

3. **Implementation Approach**:
   - Which React hooks would be needed?
   - State management requirements
   - Props interface

4. **Code Template**:
   - Provide a skeleton TypeScript component
   - Include Tailwind styling
   - Add accessibility attributes

5. **Dependencies**:
   - List required libraries (Framer Motion, Radix UI, etc.)
   - Installation commands

Output a complete, copy-paste component.
```

**Use Case**: When you want to replicate a specific component pattern.

---

### Template 3: Design System Extraction

```
I'm building a [project type] and found these design references:
- [attach 3-5 screenshots from Dribbble/Behance]

Create a comprehensive Design System document with:

1. **Color Palette**:
   - Extract primary, secondary, neutral colors
   - Provide hex codes
   - Suggest Tailwind CSS variable names

2. **Typography Scale**:
   - Define heading hierarchy (H1-H6)
   - Body text sizes
   - Font weights for each use case

3. **Spacing System**:
   - Base spacing unit (4px, 8px, etc.)
   - Common spacing values (padding, margin, gap)
   - Map to Tailwind spacing scale

4. **Component Variants**:
   - Button variants (primary, secondary, outline, ghost)
   - Card styles (default, hover, active)
   - Input states (default, focus, error)

5. **Shadows & Borders**:
   - Card shadows (sm, md, lg)
   - Border radii (sm, md, lg, full)

Format as a markdown document that can be referenced by AI during implementation.
```

**Use Case**: When starting a new project and need to create a design system from references.

---

### Template 4: Responsive Design Research

```
Analyze this dashboard design: [screenshot]

Provide a responsive design strategy:

1. **Desktop (> 1024px)**:
   - Layout: [describe]
   - Sidebar: [fixed/collapsible]
   - Grid columns: [number]

2. **Tablet (768px - 1024px)**:
   - Layout changes from desktop
   - Sidebar behavior
   - Grid columns

3. **Mobile (< 768px)**:
   - Layout changes
   - Navigation (hamburger menu?)
   - Table handling (horizontal scroll?)
   - Modal behavior (full-screen?)

4. **Tailwind Breakpoints**:
   - Provide utility classes for each breakpoint
   - Example: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

5. **Component Adaptations**:
   - Which components need mobile-specific versions?
   - Which can use responsive utilities?
```

**Use Case**: Planning responsive behavior based on desktop design.

---

## Organizing Design References

### Folder Structure

```
design-references/
├── README.md                      # Index of all references
├── design-system.md               # Extracted design system
│
├── dashboard-layout/
│   ├── design-notes.md
│   ├── dribbble-example-1.png
│   ├── dribbble-example-2.png
│   └── color-palette.png
│
├── components/
│   ├── data-table/
│   │   ├── design-notes.md
│   │   ├── 21dev-example.png
│   │   └── reference-code.tsx
│   ├── modals/
│   │   ├── design-notes.md
│   │   └── examples.png
│   └── forms/
│       ├── design-notes.md
│       └── validation-ux.png
│
├── patterns/
│   ├── shimmer-button.tsx         # From MagicUI
│   ├── animated-card.tsx          # From 21dev
│   └── loading-skeleton.tsx
│
└── prompts/
    ├── hero-section.txt
    ├── pricing-cards.txt
    └── dashboard-layout.txt
```

### Index File (design-references/README.md)

```markdown
# Design References Index

**Project**: Admin Beauty Clinic
**Created**: 2025-01-15
**Primary References**: Dribbble, 21dev, MagicUI

---

## Layout & Structure

### Dashboard Layout
- **Source**: Dribbble (dribbble.com/shots/[id])
- **Files**: dashboard-layout/dribbble-example-1.png
- **Key Features**: Sidebar nav, header with search, grid layout
- **Status**: ✅ Implemented

### Booking Calendar Layout
- **Source**: 21dev
- **Files**: components/calendar/
- **Key Features**: Month view, day slots, modal booking
- **Status**: ⏳ Pending

---

## Components

### Data Tables
- **Source**: 21dev Table Component
- **Files**: components/data-table/
- **Features**: Sorting, filtering, pagination, row actions
- **Libraries**: Tailwind Table, shadcn/ui Table
- **Status**: ✅ Implemented

### Modal Dialogs
- **Source**: shadcn/ui Dialog
- **Files**: components/modals/
- **Features**: Backdrop, close button, form inside
- **Status**: ✅ Implemented

---

## Design System

### Colors
- **Source**: Extracted from dribbble-example-1.png
- **File**: design-system.md
- **Palette**: Purple primary (#8B5CF6), Pink accent (#EC4899)

### Typography
- **Font**: Geist Sans (Next.js default)
- **Sizes**: text-sm (14px), text-base (16px), text-lg (18px)
- **File**: design-system.md

---

## Patterns

### Shimmer Button
- **Source**: MagicUI
- **File**: patterns/shimmer-button.tsx
- **Used In**: Landing page CTA

### Animated Card
- **Source**: 21dev
- **File**: patterns/animated-card.tsx
- **Used In**: Dashboard KPI cards
```

---

## Extracting Design Tokens

### Color Extraction

**Tools**:
- Browser eyedropper (DevTools)
- Figma color picker
- Online tools: Coolors.co, Adobe Color

**Process**:
```
1. Screenshot design
2. Use eyedropper on:
   - Primary CTA button
   - Secondary button
   - Background
   - Card background
   - Borders
   - Text (heading, body, muted)

3. Document in design-system.md:
   --primary: #8B5CF6
   --primary-hover: #7C3AED
   --background: #F9FAFB
   --card: #FFFFFF
   --border: #E5E7EB
```

**Prompt for AI**:
```
Convert these hex colors to Tailwind CSS variables and utility classes:

Primary: #8B5CF6
Secondary: #EC4899
Background: #F9FAFB
Card: #FFFFFF
Border: #E5E7EB
Text Heading: #111827
Text Body: #374151
Text Muted: #6B7280

Provide:
1. CSS variables in globals.css format
2. Tailwind utility class names (e.g., bg-primary, text-muted)
3. Color palette scale (50, 100, 200, ..., 900)
```

---

### Typography Extraction

**What to Note**:
- Font family (if Google Fonts: note exact name)
- Heading sizes (measure in px if possible)
- Body text size
- Line heights
- Font weights

**Prompt for AI**:
```
This design uses these typography styles: [screenshot]

Measurements:
- H1: ~36px, bold (700)
- H2: ~24px, semibold (600)
- H3: ~20px, semibold (600)
- Body: ~16px, normal (400)
- Small: ~14px, normal (400)

Provide:
1. Tailwind text size classes mapping
2. Recommended font-weight classes
3. Line height values
4. Complete typography scale config
```

---

### Spacing Extraction

**What to Measure**:
- Card padding (inside edge to content)
- Gap between cards
- Margin between sections
- Input field padding

**Prompt for AI**:
```
This design uses these spacing values: [screenshot with measurements]

Measured:
- Card padding: ~24px
- Gap between cards: ~16px
- Section spacing: ~48px
- Input padding: ~12px horizontal, ~8px vertical

Provide:
1. Tailwind spacing classes (p-6, gap-4, etc.)
2. Base spacing unit (4px or 8px?)
3. Complete spacing scale
```

---

## Example Design Reference Document

See: [design-references/dashboard-layout/design-notes.md](examples/design-notes-example.md)

```markdown
# Dashboard Layout - Design Reference

## Source
- **Platform**: Dribbble
- **URL**: https://dribbble.com/shots/[shot-id]
- **Designer**: [Designer Name]
- **Type**: Admin Dashboard / Booking System
- **Date Saved**: 2025-01-15

---

## Overview Screenshot

![Dashboard Design](./dribbble-example-1.png)

---

## Key Features to Implement

### 1. Sidebar Navigation
- **Position**: Fixed left, 240px width
- **Behavior**: Collapsible to 64px (icons only) on mobile
- **Active State**: Purple gradient background (#8B5CF6 to #7C3AED)
- **Items**: Icon + Text layout, 16px gap
- **Hover**: Slight purple tint (#F3E8FF background)

### 2. Header
- **Height**: 64px
- **Components**:
  - Logo (left)
  - Search bar (center, 400px max width)
  - Notifications icon (right)
  - User avatar with dropdown (right)
- **Background**: White (#FFFFFF)
- **Shadow**: sm (subtle bottom shadow)

### 3. Main Content Area
- **Layout**: Grid, 3 columns on desktop
- **Gap**: 24px (gap-6)
- **Padding**: 32px (p-8)
- **Background**: Gray 50 (#F9FAFB)

### 4. KPI Cards
- **Size**: Equal width in grid
- **Padding**: 24px (p-6)
- **Background**: White
- **Border**: None
- **Shadow**: sm
- **Hover**: Slight lift (shadow-md)
- **Content**:
  - Icon (top left, 40x40px, purple background circle)
  - Label (gray-600, text-sm)
  - Value (gray-900, text-2xl, font-bold)
  - Change indicator (green/red, text-xs)

---

## Color Palette

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| **Primary** | #8B5CF6 | purple-500 | Buttons, active states, icons |
| **Primary Hover** | #7C3AED | purple-600 | Button hover |
| **Primary Light** | #F3E8FF | purple-50 | Sidebar hover background |
| **Secondary** | #EC4899 | pink-500 | Accents, badges |
| **Background** | #F9FAFB | gray-50 | Page background |
| **Card** | #FFFFFF | white | Card backgrounds |
| **Border** | #E5E7EB | gray-200 | Borders, dividers |
| **Text Heading** | #111827 | gray-900 | Headings |
| **Text Body** | #374151 | gray-700 | Body text |
| **Text Muted** | #6B7280 | gray-500 | Labels, metadata |

---

## Typography

### Font Family
- **Primary**: Geist Sans (or Inter fallback)
- **Monospace**: Geist Mono (for code/numbers)

### Scale

| Element | Class | Size | Weight | Usage |
|---------|-------|------|--------|-------|
| **Page Title** | text-3xl | 30px | 700 | Main page headings |
| **Section Heading** | text-2xl | 24px | 600 | Section titles |
| **Card Title** | text-lg | 18px | 600 | Card headings |
| **Body** | text-base | 16px | 400 | Paragraph text |
| **Label** | text-sm | 14px | 500 | Form labels |
| **Caption** | text-xs | 12px | 400 | Metadata |

---

## Spacing

| Element | Value | Tailwind | Usage |
|---------|-------|----------|-------|
| **Card Padding** | 24px | p-6 | Inside cards |
| **Card Gap** | 24px | gap-6 | Between cards in grid |
| **Section Spacing** | 48px | space-y-12 | Between page sections |
| **Input Padding** | 12px / 8px | px-3 py-2 | Form inputs |
| **Button Padding** | 16px / 10px | px-4 py-2.5 | Buttons |

---

## Component Breakdown

### Component Hierarchy

```
Page (app/dashboard/page.tsx)
├── Layout (components/layout/main-layout.tsx)
│   ├── Sidebar (components/layout/sidebar.tsx)
│   │   ├── Logo
│   │   ├── Nav Items (array)
│   │   └── User Section
│   └── Header (components/layout/header.tsx)
│       ├── Search Bar
│       ├── Notifications
│       └── User Menu
├── Dashboard Container (components/dashboard/dashboard-container.tsx)
│   ├── KPI Cards Grid (components/dashboard/kpi-cards.tsx)
│   │   └── KPI Card (components/ui/kpi-card.tsx) x4
│   ├── Recent Bookings (components/dashboard/recent-bookings.tsx)
│   │   └── Data Table (components/ui/table.tsx)
│   └── Calendar Widget (components/dashboard/calendar-widget.tsx)
```

### Reusable Components (shadcn/ui)

| Component | shadcn/ui | Customization Needed |
|-----------|-----------|----------------------|
| Sidebar | ❌ Custom | Build from scratch |
| Header | ❌ Custom | Build from scratch |
| KPI Card | ✅ Card | Add icon circle, change indicator |
| Data Table | ✅ Table | Add sorting, filtering |
| Button | ✅ Button | Adjust primary color to purple |
| Input | ✅ Input | Adjust focus ring color |
| Dropdown Menu | ✅ DropdownMenu | Use for user menu |
| Avatar | ✅ Avatar | Use in header |

---

## Responsive Breakpoints

### Desktop (> 1024px)
- **Layout**: Sidebar visible (240px), 3-column grid for KPI cards
- **Nav**: Full text labels

### Tablet (768px - 1024px)
- **Layout**: Sidebar visible (240px), 2-column grid for KPI cards
- **Nav**: Full text labels

### Mobile (< 768px)
- **Layout**: Sidebar hidden (hamburger menu), 1-column grid
- **Nav**: Icon-only, overlay menu
- **Table**: Horizontal scroll

---

## Tailwind Implementation

### Sidebar

```tsx
<aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-200">
  <nav className="p-4 space-y-2">
    <a
      href="/dashboard"
      className="flex items-center gap-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white"
    >
      <HomeIcon className="h-5 w-5" />
      <span className="font-medium">Dashboard</span>
    </a>
    <a
      href="/bookings"
      className="flex items-center gap-4 px-4 py-2 rounded-lg text-gray-700 hover:bg-purple-50"
    >
      <CalendarIcon className="h-5 w-5" />
      <span className="font-medium">Bookings</span>
    </a>
  </nav>
</aside>
```

### KPI Card

```tsx
<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
  <div className="flex items-start justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
        <UsersIcon className="h-5 w-5 text-purple-600" />
      </div>
    </div>
  </div>
  <div className="mt-4">
    <p className="text-sm text-gray-600">Total Customers</p>
    <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
    <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
  </div>
</div>
```

---

## Accessibility Notes

- ✅ Sidebar nav items have `aria-current="page"` for active state
- ✅ Search input has `aria-label="Search"`
- ✅ User menu has `aria-haspopup="menu"`
- ✅ KPI cards use semantic HTML (`<article>`)

---

## Animation Notes

- **Sidebar hover**: Transition background color (150ms)
- **Card hover**: Transition shadow (200ms)
- **Modal entry**: Fade in + scale (300ms, Framer Motion)

---

## Next Steps

1. ✅ Create design-system.md with extracted tokens
2. ⏳ Build Sidebar component
3. ⏳ Build Header component
4. ⏳ Build KPI Card component
5. ⏳ Integrate shadcn/ui Table for data display
```

---

## Best Practices

### DO's ✅

1. **Collect Multiple References** - Don't rely on one design, gather 3-5 examples
2. **Extract Design Tokens** - Colors, typography, spacing as CSS variables
3. **Document Component Hierarchy** - Plan parent/child relationships
4. **Screenshot Everything** - Save high-res images with annotations
5. **Note Interactions** - Hover, focus, active states
6. **Check Accessibility** - Look for ARIA patterns in references
7. **Organize by Feature** - Group references by page/feature

### DON'Ts ❌

1. **Don't Copy Blindly** - Adapt designs to your brand
2. **Don't Ignore Responsive** - Gather mobile references too
3. **Don't Skip Component Libraries** - Check shadcn/ui first before building from scratch
4. **Don't Forget States** - Capture loading, error, empty states
5. **Don't Use Vague Descriptions** - Extract specific values (px, hex codes)
6. **Don't Lose Source Links** - Always save URL to original
7. **Don't Skip Animations** - Note timing and easing

---

## Measuring Success

You've completed Phase 0 successfully when you have:

- [ ] 3-5 high-quality design references saved
- [ ] Color palette extracted (hex codes documented)
- [ ] Typography scale defined (sizes, weights)
- [ ] Spacing system documented (Tailwind mapping)
- [ ] Component hierarchy sketched
- [ ] shadcn/ui components identified
- [ ] Responsive behavior planned
- [ ] design-system.md created
- [ ] design-references/ folder organized

**Next**: Proceed to [Phase 1: Frontend Specify](01_Frontend_Specify.md) to write the Frontend PRD using these design references.

---

## Example Prompts Recap

**Use these prompts to speed up Phase 0:**

1. **Screenshot Analysis**: "Analyze this UI screenshot and extract layout, colors, typography, and Tailwind classes"
2. **Pattern Extraction**: "Extract the implementation pattern from this component and provide skeleton code"
3. **Design System Creation**: "Create a design system document from these 5 design references"
4. **Responsive Strategy**: "Analyze this desktop design and provide responsive breakpoint strategy"
5. **Component Matching**: "List shadcn/ui components that match this design and note customizations needed"

---

<div align="center">

**Design Research Checklist Complete?**

[Next: Phase 1 - Frontend Specify →](01_Frontend_Specify.md)

</div>

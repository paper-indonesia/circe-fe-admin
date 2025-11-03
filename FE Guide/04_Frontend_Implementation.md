# Phase 4: Frontend Implementation

## Overview

This guide demonstrates how to create effective **Frontend implementation workflows** using Claude Code's memory system (CLAUDE.md) and custom slash commands tailored for UI development.

This complements [Circe Lessons Phase 4](https://github.com/paper-indonesia/circe-lessons/tree/main/04_Implementation) with Frontend-specific memory templates, execution workflows, and visual validation protocols.

---

## Table of Contents

1. [Frontend Implementation Workflow](#frontend-implementation-workflow)
2. [Part 1: Creating Frontend CLAUDE.md](#part-1-creating-frontend-claudemd)
3. [Part 2: Creating Frontend Slash Command](#part-2-creating-frontend-slash-command)
4. [Part 3: Component Patterns](#part-3-component-patterns)
5. [Part 4: Form Handling Patterns](#part-4-form-handling-patterns)
6. [Part 5: Visual Validation Workflow](#part-5-visual-validation-workflow)
7. [Examples from Admin Beauty Clinic](#examples-from-admin-beauty-clinic)
8. [Best Practices](#best-practices)

---

## Frontend Implementation Workflow

### The 3 Sub-Phases

```
🔵 Preliminary → 🟢 Execution → 🟣 Post-Execution
```

**🔵 Preliminary: Memory Setup**
- Create `CLAUDE.md` with Frontend standards
- Include design system reference
- Document component patterns

**🟢 Execution: Task Execution with Visual Validation**
- Execute tasks with UI-specific checks
- Validate visual alignment with design
- Test responsive breakpoints
- Check accessibility

**🟣 Post-Execution: Documentation & Review**
- Update component documentation
- Screenshot final components
- Review accessibility compliance

---

## Part 1: Creating Frontend CLAUDE.md

### Purpose

Frontend CLAUDE.md should include:
- Design system (colors, typography, spacing)
- Component patterns (Atomic Design)
- Styling rules (Tailwind conventions)
- Accessibility standards
- Responsive breakpoints
- Component library usage (shadcn/ui)

### Frontend CLAUDE.md Template

```markdown
# [Project Name] - Frontend Development Memory

## Project Overview

[Brief 1-2 sentence description]

**Type**: Admin Dashboard / SaaS Platform / E-commerce Site
**Primary Users**: [Admin users / End customers / Internal staff]

---

## Tech Stack

### Core Technologies
- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.4 (strict mode enabled)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui (Radix UI primitives)

### State & Data
- **Global State**: Zustand 4.x
- **Local State**: React Context
- **Forms**: React Hook Form 7.x + Zod validation
- **API Client**: Fetch API wrapper

### UI Libraries
- **Icons**: Lucide React
- **Animations**: Framer Motion 11.x
- **Charts**: Recharts (if applicable)
- **Date Picker**: React Day Picker (via shadcn/ui)

---

## Design System

### Color Palette

**CSS Variables** (from `app/globals.css`):
```css
--primary: #8B5CF6          /* Purple 500 - Primary actions, active states */
--primary-hover: #7C3AED    /* Purple 600 - Hover states */
--primary-light: #F3E8FF    /* Purple 50 - Backgrounds */
--secondary: #EC4899        /* Pink 500 - Accents, badges */
--background: #F9FAFB       /* Gray 50 - Page background */
--card: #FFFFFF             /* White - Card backgrounds */
--border: #E5E7EB           /* Gray 200 - Borders, dividers */
--text-heading: #111827     /* Gray 900 - Headings */
--text-body: #374151        /* Gray 700 - Body text */
--text-muted: #6B7280       /* Gray 500 - Labels, metadata */
--success: #10B981          /* Green 500 */
--warning: #F59E0B          /* Amber 500 */
--error: #EF4444            /* Red 500 */
```

**Tailwind Utility Mapping**:
- Primary button: `bg-primary hover:bg-primary-hover text-white`
- Card: `bg-card border border-border rounded-lg shadow-sm`
- Heading: `text-text-heading font-semibold`
- Body text: `text-text-body`
- Muted text: `text-text-muted text-sm`

### Typography

**Font Families**:
- **Headings & Body**: Geist Sans (Next.js font optimization)
- **Code**: Geist Mono

**Scale**:
| Element | Class | Size | Weight | Usage |
|---------|-------|------|--------|-------|
| Page Title | `text-3xl` | 30px | 700 | Main page heading |
| Section Heading | `text-2xl` | 24px | 600 | Section titles |
| Card Title | `text-lg` | 18px | 600 | Card headings |
| Body | `text-base` | 16px | 400 | Paragraph text |
| Label | `text-sm` | 14px | 500 | Form labels |
| Caption | `text-xs` | 12px | 400 | Metadata, timestamps |

**Line Heights**:
- Headings: `leading-tight` (1.25)
- Body: `leading-normal` (1.5)

### Spacing

**Base Unit**: 4px (Tailwind's default)

**Common Patterns**:
- Card padding: `p-6` (24px)
- Section gap: `gap-6` or `space-y-6` (24px)
- Input padding: `px-3 py-2` (12px horizontal, 8px vertical)
- Button padding: `px-4 py-2` (16px horizontal, 8px vertical)
- Page container: `px-4 md:px-6 lg:px-8` (responsive)

### Shadows

- Card: `shadow-sm` (subtle elevation)
- Dropdown: `shadow-md` (medium elevation)
- Modal: `shadow-lg` (prominent elevation)
- Hover effect: `hover:shadow-md transition-shadow`

### Border Radius

- Buttons/Inputs: `rounded-md` (6px)
- Cards: `rounded-lg` (8px)
- Modals: `rounded-xl` (12px)
- Avatar: `rounded-full` (circular)

---

## Component Patterns

### Atomic Design Hierarchy

**Atoms** (from shadcn/ui):
- `<Button>`, `<Input>`, `<Label>`, `<Badge>`, `<Avatar>`
- Location: `components/ui/[component].tsx`

**Molecules** (composite components):
- `<FormField>`, `<SearchBar>`, `<FilterDropdown>`
- Location: `components/shared/[component].tsx`

**Organisms** (complex, feature-rich):
- `<DataTable>`, `<UserForm>`, `<CreateModal>`
- Location: `components/[feature]/[component].tsx`

**Templates** (page-level layouts):
- `<DashboardLayout>`, `<AuthLayout>`
- Location: `components/layout/[layout].tsx`

**Pages** (Next.js routes):
- Server Components by default
- Location: `app/[route]/page.tsx`

### Server vs Client Components

**Server Component** (default, no "use client"):
```typescript
// app/users/page.tsx
// ✅ Can fetch data
// ✅ Can use async/await
// ❌ No hooks (useState, useEffect)
// ❌ No event handlers (onClick, onChange)
// ❌ No browser APIs

export default async function UsersPage() {
  const users = await fetchUsers() // Server-side fetch
  return <UsersContainer users={users} />
}
```

**Client Component** ("use client" directive):
```typescript
// components/users/users-container.tsx
'use client'

import { useState } from 'react'

// ✅ Can use hooks
// ✅ Can use event handlers
// ✅ Can use browser APIs
// ❌ Cannot be async

export function UsersContainer({ users }) {
  const [selectedUser, setSelectedUser] = useState(null)
  return <UserTable users={users} onSelect={setSelectedUser} />
}
```

**Rule**: Add "use client" ONLY when component uses hooks or event handlers.

### Component File Template

```typescript
'use client' // Only if needed

import { ComponentType } from '@/types/component'
import { Button } from '@/components/ui/button'

interface ComponentNameProps {
  prop1: string
  prop2?: number
  onAction: () => void
}

export function ComponentName({ prop1, prop2, onAction }: ComponentNameProps) {
  return (
    <div className="p-6 bg-card rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-text-heading">{prop1}</h2>
      <Button onClick={onAction}>Action</Button>
    </div>
  )
}
```

---

## Styling Standards

### Tailwind Utility Classes

**Always prefer Tailwind utilities over custom CSS.**

**Layout**:
- Flexbox: `flex items-center justify-between gap-4`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Container: `container mx-auto px-4 max-w-7xl`

**Spacing**:
- Padding: `p-4`, `px-6`, `py-2`
- Margin: `m-4`, `mx-auto`, `my-6`
- Gap: `gap-4`, `space-y-4`, `space-x-2`

**Typography**:
- Size: `text-sm`, `text-base`, `text-lg`, `text-xl`
- Weight: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Color: `text-text-heading`, `text-text-body`, `text-text-muted`

**Colors**:
- Background: `bg-primary`, `bg-card`, `bg-background`
- Border: `border border-border`
- Text: `text-primary`, `text-white`

### Responsive Design

**Mobile-First Approach**:
```tsx
// Base styles apply to mobile
// Add breakpoints for larger screens
<div className="p-4 md:p-6 lg:p-8">
  {/* Mobile: 16px, Tablet: 24px, Desktop: 32px */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

**Breakpoints**:
- `sm`: 640px (Tablet portrait)
- `md`: 768px (Tablet landscape)
- `lg`: 1024px (Desktop)
- `xl`: 1280px (Large desktop)
- `2xl`: 1536px (Extra large)

**Responsive Patterns**:
```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile only</div>

// Responsive text size
<h1 className="text-2xl md:text-3xl lg:text-4xl">Heading</h1>
```

---

## State Management

### Zustand (Global State)

**When to use**: Data shared across multiple routes, user session, global UI state

```typescript
// lib/store.ts
import { create } from 'zustand'

interface AppStore {
  users: User[]
  isLoading: boolean
  fetchUsers: () => Promise<void>
}

export const useAppStore = create<AppStore>((set) => ({
  users: [],
  isLoading: false,
  fetchUsers: async () => {
    set({ isLoading: true })
    const users = await usersApi.getAll()
    set({ users, isLoading: false })
  },
}))

// Usage in component
function UserList() {
  const { users, isLoading, fetchUsers } = useAppStore()
  // ...
}
```

### React Context (Feature-Specific State)

**When to use**: UI state within a feature, avoid prop drilling

```typescript
// components/users/user-provider.tsx
'use client'

import { createContext, useContext, useState } from 'react'

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  return (
    <UserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => useContext(UserContext)!
```

---

## Form Handling

### React Hook Form + Zod Pattern

**Always use this pattern for forms.**

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type FormData = z.infer<typeof formSchema>

export function UserForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

---

## UI State Handling

### Loading States

**Use skeleton screens for better UX:**

```tsx
import { Skeleton } from '@/components/ui/skeleton'

function UserTable({ isLoading, users }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  return <Table data={users} />
}
```

### Error States

```tsx
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

function ErrorDisplay({ error, onRetry }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{error.message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
      </AlertDescription>
    </Alert>
  )
}
```

### Empty States

```tsx
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

function EmptyState({ onAddClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No users yet</h3>
      <p className="text-muted-foreground mb-4">Get started by adding your first user.</p>
      <Button onClick={onAddClick}>Add User</Button>
    </div>
  )
}
```

---

## Accessibility Standards

### Mandatory Requirements

1. **Semantic HTML**:
   - Use `<button>`, `<nav>`, `<main>`, `<header>`, not `<div onClick>`
   - Use `<h1>` → `<h6>` for headings (logical hierarchy)

2. **ARIA Labels**:
   - Add `aria-label` to icon-only buttons
   - Add `aria-labelledby` to modals
   - Add `aria-describedby` for help text

3. **Keyboard Navigation**:
   - All interactive elements accessible via Tab
   - Escape closes modals/dropdowns
   - Enter submits forms
   - Arrow keys navigate lists (if custom)

4. **Focus Indicators**:
   - Use `focus-visible:ring-2 ring-primary` on all focusable elements
   - Never remove focus outlines

5. **Color Contrast**:
   - Text: 4.5:1 minimum (WCAG AA)
   - Large text: 3:1 minimum
   - Use text-text-heading, text-text-body (pre-approved)

**Example**:
```tsx
// Good ✅
<button aria-label="Close dialog" onClick={onClose}>
  <X className="h-4 w-4" />
</button>

<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

// Bad ❌
<div onClick={onClose}>
  <X className="h-4 w-4" />
</div>

<div className="navigation">...</div>
```

---

## shadcn/ui Usage

### Installation

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
# etc.
```

### Customization

**Always customize via Tailwind utilities, not inline styles:**

```tsx
// Good ✅
<Button className="bg-purple-500 hover:bg-purple-600">Custom</Button>

// Bad ❌
<Button style={{ background: '#8B5CF6' }}>Custom</Button>
```

### Common Components

- Buttons: `button.tsx`
- Forms: `form.tsx`, `input.tsx`, `label.tsx`
- Modals: `dialog.tsx`, `alert-dialog.tsx`
- Data: `table.tsx`, `card.tsx`
- Feedback: `toast.tsx`, `alert.tsx`

**Reference**: https://ui.shadcn.com/docs/components

---

## File Organization

```
app/
  [route]/
    page.tsx           # Server Component (data fetching)
    loading.tsx        # Loading UI (Suspense fallback)
    error.tsx          # Error boundary (optional)

components/
  [feature]/
    [feature]-container.tsx    # Main orchestrator (Client Component)
    [feature]-table.tsx        # Data display
    [feature]-form.tsx         # Create/Edit form
    [feature]-modal.tsx        # Modal wrapper
  ui/
    [primitive].tsx            # shadcn/ui components
  layout/
    main-layout.tsx            # App layout wrapper
    sidebar.tsx                # Navigation sidebar
  shared/
    empty-state.tsx            # Reusable empty state
    loading-skeleton.tsx       # Reusable loading UI

lib/
  api/
    [feature]-api.ts           # API client methods
  hooks/
    use-[feature].ts           # Custom hooks
  store.ts                     # Zustand global store

types/
  [feature].ts                 # TypeScript interfaces
```

---

## Important Notes

### DO's ✅

1. **Always use TypeScript strict mode** - No `any` types
2. **Always use Tailwind utilities** - Avoid custom CSS
3. **Always use shadcn/ui components** - Don't reinvent primitives
4. **Always handle all UI states** - Loading, error, empty, success
5. **Always validate forms with Zod** - Client-side validation
6. **Always use semantic HTML** - Proper tags for accessibility
7. **Always add ARIA labels** - Icon buttons need labels
8. **Always test responsive** - Mobile, tablet, desktop
9. **Always add "use client"** - When component uses hooks/events
10. **Always check accessibility** - Keyboard nav, focus, contrast

### DON'Ts ❌

1. **Don't use `any` type** - Use `unknown` if type is truly unknown
2. **Don't use inline styles** - Use Tailwind utilities
3. **Don't use `useEffect` in Server Components** - Fetch directly
4. **Don't forget "use client"** - Required for hooks, event handlers
5. **Don't ignore TypeScript errors** - Fix immediately
6. **Don't skip accessibility** - Always add labels, focus states
7. **Don't use `<div>` for buttons** - Use `<button>` or `<Button>`
8. **Don't skip loading states** - Every async operation needs UI feedback
9. **Don't forget empty states** - Every list/table needs empty UI
10. **Don't ignore mobile** - Test all breakpoints

---

## Reference Documentation

Import additional documentation when needed:

- Next.js: @docs/nextjs-app-router.md
- shadcn/ui: @docs/shadcn-ui.md
- React Hook Form: @docs/react-hook-form.md
- Zustand: @docs/zustand.md
- Tailwind: @docs/tailwind.md
- Design System: @design-references/design-system.md

---

**Last Updated**: [Date]
**Version**: 1.0
```

---

## Part 2: Creating Frontend Slash Command

### Slash Command for UI Implementation

Create `.claude/commands/implement-ui.md`:

```markdown
---
allowed-tools: Bash(npx:tsc), Bash(npm:run:lint), Read, Edit, Write, Grep
argument-hint: [checklist-file]
description: Execute Frontend tasks with UI validation
model: claude-sonnet-4-5-20250929
---

# Frontend Task Execution Protocol

**Checklist**: @$1
**Memory**: @CLAUDE.md
**Design References**: @design-references/

---

## Pre-Execution Checklist

### 1. Review Context

- [ ] Read CLAUDE.md for coding standards
- [ ] Read current task from checklist
- [ ] Check design references for visual specs
- [ ] Verify shadcn/ui components available

### 2. Check Dependencies

- [ ] Previous tasks marked complete
- [ ] Required types exist (types/[entity].ts)
- [ ] API client exists (lib/api/[entity]-api.ts)
- [ ] shadcn/ui components installed

### 3. Verify Environment

- [ ] TypeScript compilation passes: `npx tsc --noEmit`
- [ ] No ESLint errors: `npm run lint`
- [ ] Git status clean (or expected changes)

---

## Execution Rules

### Before Starting Task

**Ask user confirmation:**

> Starting Task [N]: [Task Name]
>
> This will create/modify:
> - [list files]
>
> Dependencies satisfied:
> - [✅/❌] Task [N-1] complete
> - [✅/❌] Types defined
> - [✅/❌] shadcn/ui components installed
>
> **Proceed? (Yes/No)**

---

### During Execution

#### 1. Component Creation

**File Location**:
- Follow exact path from task
- Create directories if needed: `mkdir -p components/[feature]`

**Code Style**:
- Use TypeScript strict mode (no `any`)
- Add "use client" ONLY if component uses hooks/events
- Follow Atomic Design pattern from CLAUDE.md
- Use Tailwind utility classes (no inline styles)
- Import shadcn/ui components from `@/components/ui/`

**Component Structure**:
```typescript
'use client' // Only if needed

import { /* types */ } from '@/types/[entity]'
import { /* shadcn/ui */ } from '@/components/ui/[component]'

interface [Component]Props {
  // Define props with types
}

export function [Component]({ ...props }: [Component]Props) {
  // Implementation
  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

#### 2. UI States Implementation

**ALWAYS implement all 4 states:**

- [ ] **Loading**: Skeleton or spinner
  ```tsx
  if (isLoading) return <Skeleton className="h-12 w-full" />
  ```

- [ ] **Error**: Alert with retry
  ```tsx
  if (error) return <Alert variant="destructive">...</Alert>
  ```

- [ ] **Empty**: EmptyState with CTA
  ```tsx
  if (data.length === 0) return <EmptyState onAdd={...} />
  ```

- [ ] **Success**: Main UI
  ```tsx
  return <ActualComponent data={data} />
  ```

#### 3. Design Alignment

**Reference design mockups:**
- Check `design-references/[feature]/` for screenshots
- Match colors from `globals.css` CSS variables
- Match spacing from design system in CLAUDE.md
- Match typography (Geist Sans, correct weights)
- Match layout (flex, grid, positioning)

**Validation**:
```tsx
// Good ✅ - Matches design tokens
<Card className="p-6 bg-card border border-border rounded-lg shadow-sm">

// Bad ❌ - Hardcoded values
<Card className="p-[24px] bg-white border-[1px] border-gray-200">
```

#### 4. Responsive Implementation

**Mobile-first approach:**
```tsx
// Base: Mobile, Add breakpoints for larger
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

**Test mentally on all breakpoints:**
- Mobile (< 768px): Single column, stacked layout
- Tablet (768-1024px): 2 columns or adapted layout
- Desktop (> 1024px): Full layout

#### 5. Accessibility Implementation

**Mandatory checks:**
- [ ] Semantic HTML: Use proper elements (`<button>`, `<nav>`, `<main>`)
- [ ] ARIA labels: Add to icon-only buttons
  ```tsx
  <button aria-label="Close dialog">
    <X className="h-4 w-4" />
  </button>
  ```
- [ ] Keyboard support: Tab, Enter, Escape work
- [ ] Focus indicators: `focus-visible:ring-2 ring-primary`
- [ ] Form labels: All inputs have associated `<label>`

#### 6. Validation After Each Change

**Run after every file save:**

```bash
# Type check
npx tsc --noEmit

# Fix TypeScript errors immediately
# DO NOT proceed if errors exist
```

**Run after component completion:**

```bash
# Lint check
npm run lint

# Fix warnings immediately
```

---

### Restrictions

- **NO** using `any` type - Use proper types or `unknown`
- **NO** inline styles - Use Tailwind utilities only
- **NO** custom CSS - Use existing classes from CLAUDE.md first
- **NO** skipping accessibility - Always add labels, focus states
- **NO** running `npm run dev` - Only type checking and linting
- **NO** testing unrelated files - Only validate current task files
- **NO** modifying files outside task scope

---

## Completion Protocol

### Before Marking Complete

#### 1. Visual Review

- [ ] Component matches design reference visually
- [ ] Colors match CSS variables (not hardcoded)
- [ ] Spacing matches design system (p-6, gap-4, etc.)
- [ ] Typography uses Geist Sans with correct weights
- [ ] Icons from Lucide React, correct sizes

#### 2. Responsive Review

- [ ] **Mobile** (< 768px):
  - [ ] Single column layout OR horizontal scroll
  - [ ] Touch targets ≥ 44x44px
  - [ ] Text readable (not too small)

- [ ] **Tablet** (768-1024px):
  - [ ] Adapted layout (2 columns or similar)
  - [ ] No awkward spacing

- [ ] **Desktop** (> 1024px):
  - [ ] Full layout displays correctly
  - [ ] Max-width applied if needed

#### 3. UI States Review

- [ ] **Loading**: Skeleton displays correctly
- [ ] **Error**: Error message helpful, retry button works
- [ ] **Empty**: Message clear, CTA present
- [ ] **Success**: Main UI renders correctly

#### 4. Technical Validation

- [ ] **TypeScript**: `npx tsc --noEmit` ✓ PASSING
- [ ] **ESLint**: `npm run lint` ✓ PASSING
- [ ] **No console errors**: Check DevTools (if running dev server)

#### 5. Accessibility Validation

- [ ] **Keyboard navigation**: Tab through all interactive elements
- [ ] **Focus indicators**: Visible on all focusable elements
- [ ] **ARIA labels**: All icon buttons labeled
- [ ] **Semantic HTML**: Proper element usage
- [ ] **Form labels**: All inputs have labels

---

### Ask for Confirmation

Present summary to user:

> **Task [N] completed and validated**
>
> **Files created/modified**:
> - [list files with line counts]
>
> **Validation Results**:
> - ✓ TypeScript compilation: PASSING
> - ✓ ESLint: PASSING
> - ✓ Visual alignment: Matches design reference
> - ✓ Responsive: Mobile, Tablet, Desktop tested
> - ✓ Accessibility: Keyboard + ARIA support
> - ✓ UI States: Loading, Error, Empty, Success implemented
>
> **Component Preview**:
> - Purpose: [what it does]
> - Props: [key props]
> - States: [state handling]
>
> **Confirm 'Yes' to mark complete in @$1?**

---

### Post-Confirmation

#### 1. Update Checklist

Mark task complete and add notes:

```markdown
### Task [N]: [Task Name]
- [x] **File**: `[path]`
- [x] **Description**: [description]

**Status**: ✅ Complete

**Implementation Notes**:
- Created [Component] with [features]
- Used shadcn/ui [Dialog/Table/etc]
- Added Zod validation for [fields]
- Implemented all 4 UI states
- Responsive tested on mobile/tablet/desktop
- Accessibility: Keyboard nav + ARIA labels
- Files: [list files created/modified]
```

#### 2. Update Documentation (if applicable)

- [ ] README.md: Add new component to list
- [ ] Component docs: Add usage example (if complex component)
- [ ] CHANGELOG.md: Note new feature (if significant)

---

## Current State

### Git Status
!`git status --short`

### Design System Colors (Quick Reference)
!`cat app/globals.css | grep -A 5 ":root"`

---

## Troubleshooting

### TypeScript Errors

**Error: "Cannot find module '@/components/ui/button'"**
- **Fix**: Install shadcn/ui component: `npx shadcn@latest add button`

**Error: "Property 'X' does not exist on type 'Y'"**
- **Fix**: Check types/[entity].ts - add missing property or fix prop name

**Error: "'X' is declared but never used"**
- **Fix**: Remove unused import or add `// @ts-expect-error` if intentional

### Styling Issues

**Tailwind classes not applying**:
- **Fix**: Ensure class names are complete strings (not dynamic)
- **Check**: `tailwind.config.js` includes component path

**Wrong colors displaying**:
- **Fix**: Use CSS variables from globals.css (`bg-primary`, not `bg-purple-500`)
- **Check**: globals.css has correct HSL values

### Component Not Interactive

**Buttons/forms not working**:
- **Fix**: Add "use client" directive at top of file
- **Fix**: Ensure component uses hooks or event handlers

### Form Validation Not Working

**Zod errors not displaying**:
- **Fix**: Check `resolver: zodResolver(schema)` passed to `useForm`
- **Fix**: Ensure field names in schema match form field names

### Accessibility Issues

**Focus not visible**:
- **Fix**: Add `focus-visible:ring-2 ring-primary` to focusable elements
- **Check**: Not using `outline-none` anywhere

**Screen reader not announcing**:
- **Fix**: Add `aria-label` to icon buttons
- **Fix**: Use semantic HTML (`<button>`, not `<div onClick>`)

---

## Example Execution Flow

### Task: Create User Table Component

**1. Pre-Execution**:
- ✓ Read task from checklist
- ✓ Check types/user.ts exists
- ✓ Check design-references/users/table-design.png
- ✓ Install shadcn/ui Table: `npx shadcn@latest add table`

**2. Create File**: `components/users/user-table.tsx`

**3. Implement**:
```typescript
'use client'

import { User } from '@/types/user'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Edit, Trash } from 'lucide-react'

interface UserTableProps {
  users: User[]
  isLoading: boolean
  onEdit: (user: User) => void
  onDelete: (user: User) => void
}

export function UserTable({ users, isLoading, onEdit, onDelete }: UserTableProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users yet</p>
      </div>
    )
  }

  // Success state
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.first_name} {user.last_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                aria-label={`Edit ${user.first_name} ${user.last_name}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(user)}
                aria-label={`Delete ${user.first_name} ${user.last_name}`}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

**4. Validate**:
```bash
npx tsc --noEmit  # ✓ PASSING
npm run lint      # ✓ PASSING
```

**5. Review**:
- ✓ Matches design reference
- ✓ All 4 UI states implemented
- ✓ Responsive (table scrolls on mobile)
- ✓ Accessibility (ARIA labels, semantic HTML)

**6. Confirm with user** → Mark complete

---

## Visual Validation Checklist

For each component, verify:

- [ ] Colors match `globals.css` CSS variables
- [ ] Spacing uses design system values (p-6, gap-4)
- [ ] Typography uses Geist Sans with correct weights
- [ ] Icons from Lucide React, correct sizes (h-4 w-4, h-5 w-5)
- [ ] Shadows match design system (shadow-sm, shadow-md)
- [ ] Border radius matches (rounded-lg, rounded-md)
- [ ] Layout matches design reference (flex, grid)
- [ ] Hover states defined (hover:bg-primary-hover)
- [ ] Active states defined (for navigation, tabs)
- [ ] Disabled states styled correctly

---

**End of Slash Command**
```

---

## Part 3: Component Patterns

### (Content continues with detailed component patterns like in the CLAUDE.md template above - forms, tables, modals, etc.)

---

## Part 4: Form Handling Patterns

### (Detailed React Hook Form + Zod examples)

---

## Part 5: Visual Validation Workflow

### Manual Visual Testing

1. **Compare with Design Reference**:
   - Open `design-references/[feature]/[screenshot].png`
   - Open component in browser (npm run dev)
   - Side-by-side comparison

2. **Check Responsive Breakpoints**:
   - DevTools → Toggle device toolbar
   - Test: 375px (mobile), 768px (tablet), 1280px (desktop)
   - Verify layout adapts correctly

3. **Test Interactions**:
   - Hover states (buttons, links, cards)
   - Focus states (Tab through interactive elements)
   - Loading states (trigger API call, observe skeleton)
   - Error states (force error, check display)
   - Empty states (use empty data)

### Automated Visual Testing (Optional)

```bash
# Lighthouse accessibility audit
npx lighthouse http://localhost:3000/[page] --only-categories=accessibility

# Target score: 95+
```

---

## Examples from Admin Beauty Clinic

### (Real examples from the production app)

---

## Best Practices

### DO's ✅

1. **Always Create CLAUDE.md First** - Before any coding
2. **Reference Design System in Every Component** - Use CSS variables
3. **Implement All 4 UI States** - Loading, error, empty, success
4. **Test Responsive Early** - Check all breakpoints as you build
5. **Validate Accessibility** - Keyboard, ARIA, semantic HTML
6. **Run Type Check After Each File** - `npx tsc --noEmit`
7. **Use shadcn/ui First** - Check if component exists before custom
8. **Match Design Exactly** - Colors, spacing, typography

### DON'Ts ❌

1. **Don't Skip CLAUDE.md** - Leads to inconsistent code
2. **Don't Hardcode Colors** - Use CSS variables
3. **Don't Skip Loading States** - Terrible UX
4. **Don't Ignore Mobile** - Mobile-first approach
5. **Don't Skip Accessibility** - Legal and UX requirement
6. **Don't Ignore TypeScript Errors** - Fix immediately
7. **Don't Reinvent Components** - Use shadcn/ui primitives
8. **Don't Guess Design** - Always reference screenshots

---

<div align="center">

**Frontend Implementation Ready?**

[← Back to Phase 3: Tasks](03_Frontend_Tasks.md) | [Next: Supplementary Guides →](Design_System.md)

</div>

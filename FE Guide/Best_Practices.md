# Best Practices from Admin Beauty Clinic App

## Overview

This document contains **real-world best practices and patterns** extracted from building the Admin Beauty Clinic App - a production Next.js dashboard. All examples are from actual code in this repository.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Component Patterns](#component-patterns)
3. [Form Handling](#form-handling)
4. [State Management](#state-management)
5. [API Integration](#api-integration)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Performance Optimization](#performance-optimization)
11. [Lessons Learned](#lessons-learned)

---

## Project Structure

### Actual File Organization

```
admin-beauty-clinic-app/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group (auth pages)
│   │   ├── signin/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/              # Route group (protected pages)
│   │   ├── layout.tsx            # Includes Sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── staff/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── calendar/page.tsx
│   │   └── settings/page.tsx
│   ├── api/                      # API routes
│   ├── globals.css               # Design system CSS variables
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── ui/                       # shadcn/ui (20+ components)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/                   # App layout
│   │   ├── main-layout.tsx
│   │   └── sidebar.tsx
│   ├── staff/                    # Staff feature components
│   │   ├── add-staff-form.tsx
│   │   └── edit-staff-form.tsx
│   └── shared/                   # Shared components
│       └── empty-state.tsx
│
├── lib/
│   ├── api/                      # API clients
│   ├── store.ts                  # Zustand store
│   └── utils.ts                  # Utilities (cn)
│
├── types/
│   └── *.ts                      # TypeScript interfaces
│
├── design-references/            # Design mockups & notes
│   ├── design-system.md
│   └── [feature]/
│
└── FE Guide/                     # This guide
```

**Key Patterns**:
- Route groups `(auth)`, `(dashboard)` for layout separation
- Feature-based component organization (`staff/`, `clients/`)
- Central `types/` for all TypeScript interfaces
- Design references tracked in repo

---

## Component Patterns

### Pattern 1: Server Component (Page) + Client Component (Container)

**Example**: Staff Page

```tsx
// app/staff/page.tsx (Server Component)

export default async function StaffPage() {
  // Can fetch data server-side if needed
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Staff Management</h1>
      {/* Render client component for interactivity */}
      <StaffContainer />
    </div>
  )
}
```

```tsx
// components/staff/staff-container.tsx (Client Component)

'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'

export function StaffContainer() {
  const { staff, fetchStaff } = useAppStore()
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchStaff()
  }, [])

  return (
    <div>
      <Button onClick={() => setCreateModalOpen(true)}>Add Staff</Button>
      <StaffTable staff={staff} />
      <CreateStaffModal open={isCreateModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  )
}
```

**Why**: Keeps server-side data fetching separate from client-side interactivity. Only adds "use client" where necessary.

---

### Pattern 2: Form Component with Zod Validation

**Example**: Add Staff Form (components/staff/add-staff-form.tsx)

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const staffFormSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  status: z.enum(['active', 'inactive']),
})

type StaffFormData = z.infer<typeof staffFormSchema>

interface AddStaffFormProps {
  onSubmit: (data: StaffFormData) => Promise<void>
  isLoading?: boolean
}

export function AddStaffForm({ onSubmit, isLoading }: AddStaffFormProps) {
  const form = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      position: '',
      status: 'active',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="therapist">Therapist</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Staff'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
```

**Best Practices**:
- ✅ Zod schema for validation
- ✅ Type inference from schema (`z.infer`)
- ✅ Responsive grid (1 column mobile, 2 columns desktop)
- ✅ Loading state on submit button
- ✅ Reset button for UX

---

### Pattern 3: Modal with Form

**Example**: Create Modal wrapping Form

```tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AddStaffForm } from './add-staff-form'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

interface CreateStaffModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStaffModal({ open, onOpenChange }: CreateStaffModalProps) {
  const { createStaff } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: StaffFormData) => {
    setIsLoading(true)
    try {
      await createStaff(data)
      toast.success('Staff member created successfully')
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to create staff member')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new staff member to the system.
          </DialogDescription>
        </DialogHeader>

        <AddStaffForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  )
}
```

**Best Practices**:
- ✅ Separate form logic from modal logic
- ✅ Handle loading state in modal (not form)
- ✅ Toast notifications for feedback
- ✅ Close modal on success
- ✅ Error handling with user feedback

---

## State Management

### Zustand Store Pattern

**Example**: Actual store.ts structure

```typescript
// lib/store.ts

import { create } from 'zustand'

interface AppStore {
  // Staff state
  staff: Staff[]
  staffLoading: boolean
  staffError: string | null

  // Staff actions
  fetchStaff: () => Promise<void>
  createStaff: (data: CreateStaffData) => Promise<void>
  updateStaff: (id: string, data: UpdateStaffData) => Promise<void>
  deleteStaff: (id: string) => Promise<void>

  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  // Booking state
  bookings: Booking[]
  fetchBookings: () => Promise<void>
  // ... more slices
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Staff slice
  staff: [],
  staffLoading: false,
  staffError: null,

  fetchStaff: async () => {
    set({ staffLoading: true, staffError: null })
    try {
      const response = await fetch('/api/staff')
      if (!response.ok) throw new Error('Failed to fetch staff')
      const staff = await response.json()
      set({ staff, staffLoading: false })
    } catch (error) {
      set({
        staffError: error instanceof Error ? error.message : 'Unknown error',
        staffLoading: false,
      })
    }
  },

  createStaff: async (data) => {
    const response = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create staff')
    const newStaff = await response.json()
    set({ staff: [...get().staff, newStaff] })
  },

  updateStaff: async (id, data) => {
    const response = await fetch(`/api/staff/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update staff')
    const updatedStaff = await response.json()
    set({
      staff: get().staff.map((s) => (s.id === id ? updatedStaff : s)),
    })
  },

  deleteStaff: async (id) => {
    const response = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Failed to delete staff')
    set({ staff: get().staff.filter((s) => s.id !== id) })
  },

  // UI slice
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Other slices...
}))
```

**Best Practices**:
- ✅ Organize by feature slices (staff, bookings, ui)
- ✅ Include loading and error states
- ✅ Async actions handle errors
- ✅ Optimistic updates (delete immediately, rollback on error if needed)
- ✅ Use `get()` to access current state in actions

---

## API Integration

### Pattern: Centralized Error Handling

**Example**: API client wrapper

```typescript
// lib/api/api-client.ts

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiClient = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new ApiError(
        response.status,
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`
      )
    }
    return response.json()
  },

  // ... put, delete methods
}

// lib/api/staff-api.ts

import { apiClient } from './api-client'
import { Staff, CreateStaffData } from '@/types/staff'

export const staffApi = {
  getAll: () => apiClient.get<Staff[]>('/api/staff'),
  getById: (id: string) => apiClient.get<Staff>(`/api/staff/${id}`),
  create: (data: CreateStaffData) => apiClient.post<Staff>('/api/staff', data),
  update: (id: string, data: Partial<Staff>) => apiClient.post<Staff>(`/api/staff/${id}`, data),
  delete: (id: string) => apiClient.post<void>(`/api/staff/${id}`, {}),
}
```

**Best Practices**:
- ✅ Custom ApiError class for typed errors
- ✅ Generic types for type safety
- ✅ Centralized error handling
- ✅ Feature-specific API modules
- ✅ Consistent error messages

---

## Error Handling

### Pattern: Toast Notifications

**Example**: Using Sonner toast

```tsx
import { toast } from 'sonner'

// Success
toast.success('Staff member created successfully')

// Error
toast.error('Failed to create staff member')

// Loading
const toastId = toast.loading('Creating staff member...')
// Later:
toast.dismiss(toastId)
toast.success('Created!')

// Promise-based
toast.promise(createStaff(data), {
  loading: 'Creating...',
  success: 'Staff member created!',
  error: 'Failed to create staff member',
})
```

**Setup** (app/layout.tsx):
```tsx
import { Toaster } from 'sonner'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
```

---

## Loading States

### Pattern: Skeleton Screens

**Example**: Loading skeleton for table

```tsx
import { Skeleton } from '@/components/ui/skeleton'

function StaffTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

function StaffTable({ staff, isLoading }) {
  if (isLoading) return <StaffTableSkeleton />
  if (staff.length === 0) return <EmptyState />
  return <Table data={staff} />
}
```

**Best Practices**:
- ✅ Match skeleton to actual layout
- ✅ Consistent height for no layout shift
- ✅ Show realistic number of rows (5-10)

---

## Responsive Design

### Pattern: Mobile-First Grid

**Example**: KPI Cards

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KPICard title="Total Staff" value="24" />
  <KPICard title="Active Bookings" value="156" />
  <KPICard title="Revenue" value="$12,450" />
  <KPICard title="Customers" value="892" />
</div>
```

**Breakpoints**:
- Mobile (< 640px): 1 column (stacked)
- Tablet (640-1024px): 2 columns
- Desktop (>= 1024px): 4 columns

---

## Accessibility

### Pattern: Icon Button with ARIA Label

**Example**: Edit/Delete buttons

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => onEdit(staff)}
  aria-label={`Edit ${staff.first_name} ${staff.last_name}`}
>
  <Edit className="h-4 w-4" />
</Button>

<Button
  variant="ghost"
  size="sm"
  onClick={() => onDelete(staff)}
  aria-label={`Delete ${staff.first_name} ${staff.last_name}`}
>
  <Trash className="h-4 w-4" />
</Button>
```

**Best Practices**:
- ✅ Descriptive ARIA labels (include context)
- ✅ Use semantic HTML (`<button>`, not `<div>`)
- ✅ Visible focus indicators (shadcn/ui has this)

---

## Performance Optimization

### Pattern 1: Dynamic Imports for Heavy Components

```tsx
import dynamic from 'next/dynamic'

// Calendar component is heavy, load dynamically
const BookingCalendar = dynamic(() => import('@/components/calendar/booking-calendar'), {
  loading: () => <Skeleton className="h-96 w-full" />,
  ssr: false, // Disable SSR if component uses browser APIs
})

export function CalendarPage() {
  return (
    <div>
      <h1>Bookings Calendar</h1>
      <BookingCalendar />
    </div>
  )
}
```

### Pattern 2: Optimized Images

```tsx
import Image from 'next/image'

<Image
  src={staff.avatar_url}
  alt={`${staff.first_name} ${staff.last_name}`}
  width={40}
  height={40}
  className="rounded-full"
  priority={isAboveFold} // For above-the-fold images
/>
```

---

## Lessons Learned

### 1. Server Components by Default

**Lesson**: Don't add "use client" unless needed.

**Before** (❌ Unnecessary client component):
```tsx
'use client'

export default function StaffPage() {
  return <h1>Staff</h1>
}
```

**After** (✅ Server component):
```tsx
export default function StaffPage() {
  return <h1>Staff</h1>
}
```

**Impact**: Smaller JS bundle, faster page loads.

---

### 2. Zod Validation Catches Bugs Early

**Lesson**: Define validation schema before building form.

**Example**: Caught email format errors, required fields missing during development, not production.

---

### 3. shadcn/ui Speeds Up Development

**Lesson**: Don't build custom buttons/inputs, use shadcn/ui.

**Time Saved**: ~2 days not building form components from scratch.

---

### 4. Responsive Testing Early

**Lesson**: Test mobile layout while building, not after.

**Issue Found**: Table didn't scroll on mobile, needed wrapper with `overflow-x-auto`.

**Fix**:
```tsx
<div className="overflow-x-auto">
  <Table>...</Table>
</div>
```

---

### 5. Loading States Improve UX

**Lesson**: Users need feedback during async operations.

**Before**: Button click → nothing visible → data appears (confusing)
**After**: Button click → spinner on button → data appears (clear)

```tsx
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? 'Creating...' : 'Create Staff'}
</Button>
```

---

### 6. TypeScript Strict Mode Prevents Errors

**Lesson**: Enable strict mode, fix all errors before proceeding.

**Errors Caught**:
- Undefined checks (`user?.name` instead of `user.name`)
- Type mismatches (API returns `string`, component expects `number`)

**Config**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

### 7. CSS Variables for Theming

**Lesson**: Use CSS variables, not hardcoded colors.

**Before** (❌ Hardcoded):
```tsx
<button className="bg-purple-500 hover:bg-purple-600">Button</button>
```

**After** (✅ CSS variables):
```tsx
<Button className="bg-primary hover:bg-primary-hover">Button</Button>
```

**Benefit**: Easy to change theme (update globals.css, all components update).

---

### 8. AI Generates Better Code with Examples

**Lesson**: Provide existing component as reference.

**Prompt**:
```
Create a UserForm component similar to components/staff/add-staff-form.tsx,
but for User entity (email, password, role).

Use the same pattern:
- React Hook Form + Zod
- shadcn/ui Form components
- 2-column grid on desktop
- Submit + Reset buttons
```

**Result**: Consistent pattern across all forms.

---

### 9. Git Commit Frequently

**Lesson**: Commit after each component, not end of day.

**Pattern**:
- Component done + tested → commit
- Form done → commit
- Modal done → commit

**Benefit**: Easy to revert if AI generates broken code.

---

### 10. Documentation in Repo Helps AI

**Lesson**: Keep design references, CLAUDE.md in repo.

**Files Created**:
- `design-references/design-system.md`
- `CLAUDE.md`
- `FE Guide/`

**Benefit**: AI can reference these without re-explaining every time.

---

## Quick Wins

### Wins from Using AI for Frontend

1. **shadcn/ui Component Installation**: AI suggests correct command
   ```
   "You need Table component. Run: npx shadcn@latest add table"
   ```

2. **Form Validation**: AI generates complete Zod schema from requirements

3. **Responsive Grid**: AI applies mobile-first utilities correctly

4. **ARIA Labels**: AI adds accessibility attributes without reminder

5. **Loading States**: AI includes skeleton screens automatically (if in CLAUDE.md)

---

<div align="center">

**Best Practices Guide Complete**

[← Back to Component Library](Component_Library_Integration.md) | [Back to Main Guide →](README.md)

</div>

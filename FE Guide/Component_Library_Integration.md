# Component Library Integration: shadcn/ui

## Overview

This guide covers **shadcn/ui integration best practices** for AI-assisted development. shadcn/ui is the recommended component library for this workflow because it's:
- ✅ Copy-paste (not npm package) - full control over code
- ✅ Built on Radix UI primitives - accessible by default
- ✅ Tailwind CSS - easy AI customization
- ✅ Well-documented - LLM training data rich

---

## Why shadcn/ui Works Well with AI

1. **Predictable Patterns**: Components follow consistent structure
2. **Easy Customization**: Tailwind utilities AI understands
3. **Copy-Paste Model**: Code lives in your repo, AI can read it
4. **Accessible**: ARIA attributes built-in

---

## Installation & Setup

### Initial Setup

```bash
# Initialize shadcn/ui in Next.js project
npx shadcn@latest init
```

**Configuration Prompts**:
- TypeScript: Yes
- Style: Default
- Base color: Slate (or your choice)
- CSS variables: Yes
- Tailwind config: Yes
- Import alias: @/components

**Files Created**:
```
components/ui/
lib/utils.ts              # cn() utility (Tailwind merge)
tailwind.config.js        # Extended with shadcn/ui colors
app/globals.css           # CSS variables for theming
```

---

## Adding Components

### Command

```bash
npx shadcn@latest add [component-name]
```

### Common Components

```bash
# Primitives
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add textarea
npx shadcn@latest add select

# Layout
npx shadcn@latest add card
npx shadcn@latest add separator
npx shadcn@latest add scroll-area

# Feedback
npx shadcn@latest add alert
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add progress

# Overlays
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add popover
npx shadcn@latest add dropdown-menu

# Data Display
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add avatar

# Forms
npx shadcn@latest add form
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
```

### Add All at Once

```bash
npx shadcn@latest add button input label card dialog table form toast
```

---

## Component Usage Patterns

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Plus className="h-4 w-4" /></Button>

// With icon
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add User
</Button>
```

---

### Dialog (Modal)

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create User</DialogTitle>
      <DialogDescription>Add a new user to the system</DialogDescription>
    </DialogHeader>

    {/* Form or content */}
    <UserForm onSubmit={handleSubmit} />

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button type="submit">Create</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Form (with React Hook Form)

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
})

export function UserForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
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
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>Your full name</FormDescription>
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

### Table

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

<Table>
  <TableCaption>List of users</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map((user) => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="sm">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Customization

### Method 1: Tailwind Classes (Recommended)

```tsx
// Customize via className
<Button className="bg-purple-500 hover:bg-purple-600 text-white">
  Custom Purple Button
</Button>

<Card className="border-2 border-primary shadow-lg">
  Custom Card
</Card>
```

### Method 2: Edit Component File

```tsx
// components/ui/button.tsx

// Add new variant
const buttonVariants = cva(
  "...",
  {
    variants: {
      variant: {
        default: "...",
        // Add custom variant
        purple: "bg-purple-500 text-white hover:bg-purple-600",
      },
    },
  }
)

// Usage
<Button variant="purple">Purple Button</Button>
```

### Method 3: CSS Variables (Theme-wide)

```css
/* app/globals.css */

:root {
  --primary: 262.1 83.3% 57.8%; /* Purple instead of default */
}
```

All components using `primary` color automatically update.

---

## Creating Custom Components

### When to Build Custom

- ❌ **Don't Build**: Primitive exists in shadcn/ui (Button, Input, Dialog)
- ✅ **Build Custom**: Business logic component (UserTable, BookingCalendar)
- ✅ **Build Custom**: Complex composition (DashboardHeader, StaffCard)

### Pattern: Compose from shadcn/ui

```tsx
// components/users/user-card.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface UserCardProps {
  user: User
  onEdit: () => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <Card className="p-6">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.name}</CardTitle>
          <Badge variant="secondary">{user.role}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <Button variant="outline" className="mt-4" onClick={onEdit}>
          Edit
        </Button>
      </CardContent>
    </Card>
  )
}
```

**Pattern**: Combine multiple shadcn/ui primitives (Card, Avatar, Badge, Button) into a reusable business component.

---

## Prompting AI to Use shadcn/ui

### In CLAUDE.md

```markdown
## Component Library

**Primary**: shadcn/ui (Radix UI + Tailwind)
**Installation**: `npx shadcn@latest add [component]`

**Available Components**:
- Primitives: Button, Input, Label, Textarea, Select
- Layout: Card, Separator
- Feedback: Alert, Toast, Skeleton
- Overlays: Dialog, AlertDialog, Popover
- Data: Table, Badge, Avatar
- Forms: Form (React Hook Form integration)

**Usage**: Always import from `@/components/ui/[component]`
```

### Prompts for AI

**When creating a component**:
```
Create a UserTable component using shadcn/ui Table.

Requirements:
- Use shadcn/ui Table component (@/components/ui/table)
- Columns: Name, Email, Role, Actions
- Action buttons use shadcn/ui Button (ghost variant)
- Add skeleton loading state using Skeleton component

If shadcn/ui Table is not installed, note it in the response.
```

**When creating a modal**:
```
Create a CreateUserModal using shadcn/ui Dialog.

Requirements:
- Use Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter from @/components/ui/dialog
- Contains UserForm component inside DialogContent
- Cancel and Submit buttons in DialogFooter
- Closes on successful submit

Install command if needed: npx shadcn@latest add dialog
```

---

## Common Patterns

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton'

function LoadingCard() {
  return (
    <Card className="p-6">
      <Skeleton className="h-8 w-1/2 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </Card>
  )
}
```

### Empty States

```tsx
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <Card className="p-12 text-center">
      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">No users yet</h3>
      <p className="text-muted-foreground mb-4">Get started by adding your first user.</p>
      <Button onClick={onAdd}>Add User</Button>
    </Card>
  )
}
```

### Confirmation Dialogs

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete User?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete {user.name}'s account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete} className="bg-destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Troubleshooting

### Component Not Found

**Error**: `Cannot find module '@/components/ui/button'`

**Fix**:
```bash
npx shadcn@latest add button
```

### Styling Not Applied

**Issue**: Component looks unstyled

**Check**:
1. `globals.css` imported in `app/layout.tsx`
2. `tailwind.config.js` includes `components/ui/**/*.{js,ts,jsx,tsx}`
3. CSS variables defined in `globals.css`

### TypeScript Errors

**Error**: `Type 'X' is not assignable to type 'Y'`

**Fix**: Check shadcn/ui docs for correct prop types
- Example: `<Button asChild>` required for custom trigger elements

---

## Best Practices

### DO's ✅

1. **Install Components as Needed** - Don't install all upfront
2. **Customize via Tailwind** - Use `className` prop
3. **Compose Custom Components** - Build on top of primitives
4. **Use Variants** - Use built-in variants before custom styling
5. **Reference Official Docs** - https://ui.shadcn.com/docs/components
6. **Keep Components in ui/** - Don't move shadcn/ui files

### DON'Ts ❌

1. **Don't Modify Core Files Directly** - Customize via className
2. **Don't Mix Component Libraries** - Stick to shadcn/ui
3. **Don't Use Inline Styles** - Use Tailwind utilities
4. **Don't Skip Accessibility** - shadcn/ui has ARIA built-in, keep it
5. **Don't Reinvent Primitives** - Check shadcn/ui first

---

## Resources

- **Official Docs**: https://ui.shadcn.com
- **Component Examples**: https://ui.shadcn.com/docs/components
- **Themes**: https://ui.shadcn.com/themes
- **GitHub**: https://github.com/shadcn-ui/ui

---

<div align="center">

**shadcn/ui Integration Complete**

[← Back to Design System](Design_System.md) | [Next: Best Practices →](Best_Practices.md)

</div>

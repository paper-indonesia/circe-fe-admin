# Empty State Implementation Guide

## ✅ Completed Pages

1. **Dashboard** - Welcome screen with setup guidance
2. **Reports** - No data available with action buttons

## 📦 Reusable Components

### 1. EmptyState Component (`components/ui/empty-state.tsx`)
Customizable empty state with icon, title, description, actions, and tips.

### 2. DataWrapper Component (`components/data-wrapper.tsx`)
Handles loading, empty, and data states automatically.

## 🔨 How to Add Empty State to Other Pages

### Quick Example

```tsx
import { DataWrapper } from "@/components/data-wrapper"
import { EmptyState } from "@/components/ui/empty-state"
import { Users, Calendar, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTerminology } from "@/hooks/use-terminology"

export default function YourPage() {
  const router = useRouter()
  const terminology = useTerminology()
  const { data, loading } = useYourData()

  const isEmpty = !loading && (!data || data.length === 0)

  return (
    <MainLayout>
      <DataWrapper
        isLoading={loading}
        isEmpty={isEmpty}
        emptyState={{
          icon: Users,
          title: "No Data Yet",
          description: `You haven't added any ${terminology.patient.toLowerCase()} yet.`,
          actionLabel: `Add ${terminology.patient}`,
          onAction: () => router.push('/clients/new'),
          secondaryActionLabel: "Import Data",
          onSecondaryAction: () => router.push('/import'),
          tips: [
            {
              icon: Users,
              title: "Add Manually",
              description: "Create one by one"
            },
            {
              icon: Calendar,
              title: "Import CSV",
              description: "Bulk import data"
            },
            {
              icon: Star,
              title: "Sync Integration",
              description: "Connect with other tools"
            }
          ]
        }}
      >
        {/* Your actual page content here */}
        <div>
          {data.map(item => <div key={item.id}>{item.name}</div>)}
        </div>
      </DataWrapper>
    </MainLayout>
  )
}
```

## 📋 Suggested Empty States for Each Page

### Calendar (`app/calendar/page.tsx`)
```tsx
emptyState={{
  icon: Calendar,
  title: `No ${terminology.booking} Scheduled`,
  description: `You don't have any ${terminology.booking.toLowerCase()} yet. Create your first ${terminology.booking.toLowerCase()} to start managing your schedule.`,
  actionLabel: `Create ${terminology.booking}`,
  onAction: () => setShowBookingDialog(true),
  secondaryActionLabel: "Quick Walk-in",
  onSecondaryAction: () => router.push('/walk-in'),
  tips: [
    { icon: Calendar, title: "Schedule Appointments", description: "Book future appointments" },
    { icon: UserPlus, title: "Walk-in Booking", description: "Handle immediate bookings" },
    { icon: Clock, title: "View Calendar", description: "Manage your time slots" }
  ]
}}
```

### Clients (`app/clients/page.tsx`)
```tsx
emptyState={{
  icon: Users,
  title: `No ${terminology.patient} Yet`,
  description: `Start building your ${terminology.patient.toLowerCase()} database. Add your first ${terminology.patient.toLowerCase()} to track their appointments and history.`,
  actionLabel: `Add ${terminology.patient}`,
  onAction: () => setShowAddDialog(true),
  tips: [
    { icon: UserPlus, title: `Add ${terminology.patient}`, description: "Manually add client info" },
    { icon: Calendar, title: "First Booking", description: `Create ${terminology.booking.toLowerCase()} to auto-add ${terminology.patient.toLowerCase()}` },
    { icon: Star, title: "Build Relationships", description: "Track preferences and history" }
  ]
}}
```

### Staff (`app/staff/page.tsx`)
```tsx
emptyState={{
  icon: Users,
  title: `No ${terminology.staff} Members`,
  description: `Add your ${terminology.staff.toLowerCase()} members to assign ${terminology.booking.toLowerCase()} and manage schedules.`,
  actionLabel: `Add ${terminology.staff}`,
  onAction: () => setShowAddDialog(true),
  tips: [
    { icon: UserPlus, title: `Add ${terminology.staff}`, description: "Create staff profiles" },
    { icon: Calendar, title: "Assign Bookings", description: `Assign ${terminology.booking.toLowerCase()} to ${terminology.staff.toLowerCase()}` },
    { icon: Star, title: "Track Performance", description: "Monitor staff metrics" }
  ]
}}
```

### Treatments (`app/treatments/page.tsx`)
```tsx
emptyState={{
  icon: Star,
  title: `No ${terminology.treatment} Defined`,
  description: `Create your ${terminology.treatment.toLowerCase()} to offer services to your ${terminology.patient.toLowerCase()}.`,
  actionLabel: `Add ${terminology.treatment}`,
  onAction: () => setShowAddDialog(true),
  tips: [
    { icon: Star, title: `Define ${terminology.treatment}`, description: "Set prices and duration" },
    { icon: Users, title: `Assign ${terminology.staff}`, description: `Link ${terminology.treatment.toLowerCase()} to ${terminology.staff.toLowerCase()}` },
    { icon: DollarSign, title: "Pricing Strategy", description: "Competitive pricing" }
  ]
}}
```

### Walk-in (`app/walk-in/page.tsx`)
```tsx
emptyState={{
  icon: UserPlus,
  title: "No Walk-in Bookings",
  description: `Quick booking feature for walk-in ${terminology.patient.toLowerCase()}. Handle immediate appointments without full scheduling.`,
  actionLabel: "Create Walk-in",
  onAction: () => {/* Open booking form */},
  tips: [
    { icon: UserPlus, title: "Quick Booking", description: "Fast check-in process" },
    { icon: Clock, title: "Real-time", description: "Immediate scheduling" },
    { icon: Users, title: "Queue System", description: "Manage walk-ins efficiently" }
  ]
}}
```

### Withdrawal (`app/withdrawal/page.tsx`)
```tsx
emptyState={{
  icon: Wallet,
  title: "No Withdrawals Yet",
  description: "You haven't made any withdrawal requests. Complete bookings to earn and request withdrawals.",
  actionLabel: "View Earnings",
  onAction: () => router.push('/dashboard'),
  tips: [
    { icon: DollarSign, title: "Earn Money", description: "Complete bookings first" },
    { icon: Wallet, title: "Request Withdrawal", description: "Withdraw your earnings" },
    { icon: BarChart3, title: "Track Income", description: "Monitor your revenue" }
  ]
}}
```

## 🎨 Customization Tips

1. **Icon Selection**: Choose icons that represent your page's purpose
2. **Title**: Keep it short and descriptive (2-4 words)
3. **Description**: Explain what the page does and how to get started
4. **Actions**: Primary action should be the most common task
5. **Tips**: 3 quick cards explaining features or next steps

## 🚀 Implementation Checklist

For each page:
- [ ] Import `DataWrapper` or `EmptyState`
- [ ] Import icons from `lucide-react`
- [ ] Import `useRouter` and `useTerminology`
- [ ] Check if data is empty: `const isEmpty = !loading && (!data || data.length === 0)`
- [ ] Wrap content with `DataWrapper` or add conditional render
- [ ] Customize empty state props
- [ ] Test with empty data
- [ ] Test with loading state
- [ ] Test with actual data

## 📝 Notes

- All empty states use dynamic terminology from `useTerminology()`
- Colors and styling are consistent across all pages
- Icons use gradient backgrounds (purple, pink, blue)
- Action buttons use gradient styling
- Tips cards are optional but recommended
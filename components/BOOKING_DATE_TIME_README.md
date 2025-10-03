# BookingDateTime Component

Komponen booking date & time yang compact, modern, dan production-ready dengan full responsive support.

## Features

✅ **Week Strip Calendar** - Navigasi 7 hari dengan prev/next week
✅ **Time Slots Grid** - Responsive grid 2-6 columns
✅ **Staff Availability** - Filter slots berdasarkan staff yang dipilih
✅ **URL Sync** - Sinkronisasi state dengan URL params
✅ **Loading States** - Skeleton loading untuk UX yang smooth
✅ **Empty & Error States** - Handling untuk berbagai kondisi
✅ **Accessibility** - Keyboard navigation & ARIA attributes
✅ **Debounced Fetch** - Optimized API calls dengan debounce 200ms

## Usage

```tsx
import { BookingDateTime } from "@/components/booking-date-time"

function MyBookingPage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>()

  const handleSelectDateTime = (date: string, time: string) => {
    console.log('Selected:', date, time)
    // Update your form state
  }

  const handleNext = () => {
    // Navigate to next step
    router.push('/confirm')
  }

  return (
    <BookingDateTime
      provider={{
        name: "Beauty Clinic",
        address: "123 Main St, Jakarta",
        avatarUrl: "/clinic-logo.png"
      }}
      selectedStaffId={selectedStaffId}
      onSelectDateTime={handleSelectDateTime}
      onNext={handleNext}
      isLoading={false}
      error={undefined}
    />
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `provider` | `Provider` | ✅ | Provider/clinic information |
| `selectedStaffId` | `string` | - | Currently selected staff ID for filtering slots |
| `onSelectDateTime` | `(date: string, time: string) => void` | ✅ | Callback when date & time selected |
| `onNext` | `() => void` | ✅ | Callback for Next button |
| `isLoading` | `boolean` | - | Global loading state |
| `error` | `string` | - | Error message to display |
| `className` | `string` | - | Additional CSS classes |

### Provider Type

```ts
interface Provider {
  name: string        // Provider/clinic name
  address: string     // Short address
  avatarUrl?: string  // Optional avatar URL
}
```

## States & Variants

### Loading State
```tsx
<BookingDateTime
  {...props}
  isLoading={true}
/>
```

### Error State
```tsx
<BookingDateTime
  {...props}
  error="Failed to load time slots"
/>
```

### Empty State (No Staff Selected)
```tsx
<BookingDateTime
  {...props}
  selectedStaffId={undefined}
/>
```

## Responsive Breakpoints

| Breakpoint | Week Strip | Time Slots Grid |
|------------|------------|-----------------|
| **Mobile** (< 768px) | 7 cols (compact) | 2 columns |
| **Tablet** (768px - 1024px) | 7 cols | 4 columns |
| **Desktop** (> 1024px) | 7 cols | 6 columns |

## Accessibility

- ✅ **Keyboard Navigation**: Tab through days and time slots
- ✅ **ARIA Attributes**: `aria-pressed` for selected states
- ✅ **Focus Management**: Clear focus indicators
- ✅ **Screen Reader**: Descriptive labels and aria-labels

### Keyboard Shortcuts

- `Tab` / `Shift+Tab` - Navigate between elements
- `Enter` / `Space` - Select day or time slot
- `Arrow Keys` - Navigate within grid (native browser behavior)

## URL Synchronization

The component automatically syncs selection to URL params:

```
/booking?date=2025-10-04&time=14:00
```

## Backend Integration

### API Contract

#### 1. Fetch Time Slots

**Endpoint**: `GET /api/slots`

**Query Params**:
```ts
{
  date: string        // YYYY-MM-DD
  staffId: string     // Selected staff ID
  weekStart?: string  // Optional: fetch entire week
}
```

**Response**:
```ts
{
  slots: Array<{
    time: string      // HH:mm format
    available: boolean
    soon?: boolean    // Optional: almost full indicator
  }>
}
```

**Example**:
```bash
GET /api/slots?date=2025-10-04&staffId=staff_001

Response:
{
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "09:30", "available": true },
    { "time": "10:00", "available": false },
    { "time": "10:30", "available": true, "soon": true }
  ]
}
```

#### 2. Validate Slot (Optional)

**Endpoint**: `POST /api/slots/validate`

**Body**:
```ts
{
  date: string
  time: string
  staffId: string
}
```

**Response**:
```ts
{
  available: boolean
  conflictReason?: string
}
```

### Data Fetching Example

Replace the mock data in `fetchTimeSlots`:

```tsx
const fetchTimeSlots = async (date: string) => {
  if (!selectedStaffId) {
    setSlots([])
    return
  }

  setLoadingSlots(true)

  try {
    const response = await fetch(
      `/api/slots?date=${date}&staffId=${selectedStaffId}`
    )

    if (!response.ok) throw new Error('Failed to fetch')

    const data = await response.json()
    setSlots(data.slots)
  } catch (err) {
    console.error('Failed to fetch slots:', err)
    setSlots([])
  } finally {
    setLoadingSlots(false)
  }
}
```

## Performance Optimizations

1. **Debounced Fetch** - 200ms debounce on date changes
2. **Request Cancellation** - Cleanup on unmount/week change
3. **Memoized Week Days** - Prevents unnecessary recalculations
4. **Virtual Rendering** - Ready for >150 slots (can be added if needed)
5. **Fixed Height Container** - Prevents layout shifts (min-h-[280px])

## Styling & Theming

Uses existing design tokens:

- **Primary Color**: `#C8B6FF` (from your palette)
- **Primary Hover**: `#B8A6EF`
- **Teal Accents**: For time slot selection (medical app style)
- **Consistent Spacing**: 2-4 unit increments
- **Rounded Corners**: `rounded-lg` and `rounded-xl`

## Future Enhancements

- [ ] Week-level caching with SWR/React Query
- [ ] Timezone support
- [ ] Multi-language support
- [ ] Calendar month view toggle
- [ ] Export to calendar (iCal)
- [ ] Slot duration customization

## Lighthouse Scores (Target)

- **Accessibility**: ≥ 90
- **Performance**: ≥ 90
- **Best Practices**: ≥ 90

## Testing

```tsx
// Example test cases
describe('BookingDateTime', () => {
  it('should navigate to next week', () => {})
  it('should select date and time', () => {})
  it('should sync URL params', () => {})
  it('should show loading skeleton', () => {})
  it('should handle error state', () => {})
  it('should disable past dates', () => {})
  it('should keyboard navigate slots', () => {})
})
```

## Troubleshooting

**Q: Time slots not loading?**
A: Make sure `selectedStaffId` prop is provided.

**Q: Dates are disabled?**
A: Past dates are automatically disabled. Check system date.

**Q: URL not syncing?**
A: Component uses `window.history.replaceState`. Ensure running in browser context.

**Q: Slots grid too wide on mobile?**
A: Component is responsive. Check parent container doesn't override grid.

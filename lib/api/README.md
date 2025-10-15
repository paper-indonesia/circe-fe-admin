# API Library

Centralized API integration untuk Circe Beauty Clinic Admin Dashboard.

## Structure

```
lib/api/
├── README.md                            # This file
├── walk-in.ts                           # Walk-In API functions
├── walk-in-implementation-guide.md      # Detailed integration guide
└── WALK-IN-API-QUICK-REFERENCE.md      # Quick cheat sheet
```

## Files

### 1. `walk-in.ts`

Main API functions file dengan complete TypeScript typing.

**Contains:**
- Customer Management (search, create, get)
- Services Management (get services, filter by category)
- Staff Management (get staff, filter by outlet)
- Availability Management (check slots, get grid)
- Appointments Management (create booking)
- Payment Management (process payment, create link)
- Helper functions (validation, formatting)

**Usage:**
```typescript
import { completeWalkInBooking } from '@/lib/api/walk-in'

const result = await completeWalkInBooking({...})
```

### 2. `walk-in-implementation-guide.md`

Detailed step-by-step guide untuk mengintegrasikan API ke Walk-In page.

**Includes:**
- Complete code examples
- Before/After comparisons
- Error handling
- Testing checklist
- Common issues & solutions

**Use when:**
- First time integration
- Need detailed explanation
- Troubleshooting issues

### 3. `WALK-IN-API-QUICK-REFERENCE.md`

Quick reference cheat sheet untuk developer.

**Includes:**
- Quick code snippets
- Function signatures
- Common patterns
- Full example component

**Use when:**
- Quick lookup
- Code review
- Copy-paste snippets

## Quick Start

### 1. Install dependencies

Already included in Next.js project.

### 2. Setup environment

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://circe-fastapi-backend-740443181568.europe-west1.run.app
```

### 3. Import and use

```typescript
import {
  searchCustomers,
  getServices,
  getStaff,
  getAvailableSlots,
  completeWalkInBooking,
} from '@/lib/api/walk-in'

// Search customers
const customers = await searchCustomers("john")

// Complete booking
const result = await completeWalkInBooking({
  newCustomer: {
    name: "John Doe",
    phone: "+62812345678"
  },
  service_id: "service_123",
  staff_id: "staff_456",
  outlet_id: "outlet_123",
  appointment_date: "2025-10-20",
  start_time: "14:00",
  payment_method: "cash",
  payment_type: "full",
  payment_amount: 150000
})
```

## API Flow

### Walk-In Booking Flow

```
1. Customer Selection
   ↓
   searchCustomers() OR createCustomer()
   ↓
2. Service Selection
   ↓
   getServices({ outlet_id, category })
   ↓
3. Staff Selection
   ↓
   getStaff({ outlet_id })
   ↓
4. Date & Time Selection
   ↓
   getAvailableSlots({ date, service_id, staff_id, outlet_id })
   ↓
5. Verify Availability
   ↓
   checkAvailability({ staff_id, date, start_time, end_time })
   ↓
6. Create Booking + Process Payment
   ↓
   completeWalkInBooking({ ...all data })
   ↓
7. Success ✓
```

## Authentication

All API functions automatically handle authentication using JWT tokens stored in localStorage.

```typescript
// Tokens stored after login
localStorage.setItem('access_token', token)
localStorage.setItem('refresh_token', refreshToken)

// Auto-refresh on 401 errors
// Auto-redirect to /login if refresh fails
```

## Error Handling

All functions throw errors that should be caught:

```typescript
try {
  const result = await completeWalkInBooking({...})

  if (!result.success) {
    // Business logic error
    console.error(result.error)
    return
  }

  // Success
  console.log(result.appointment)

} catch (error: any) {
  // Network/Auth errors
  if (error.message === 'Authentication failed') {
    router.push('/login')
  } else {
    toast.error(error.message)
  }
}
```

## TypeScript Support

All functions have full TypeScript support:

```typescript
import type {
  Customer,
  Service,
  Staff,
  Appointment,
  Payment,
  AvailabilitySlot,
} from '@/lib/api/walk-in'

const customer: Customer = await createCustomer({
  name: "John",
  phone: "+62812345678"
})
```

## Best Practices

### 1. Always Check Availability

```typescript
// ✅ Good
const check = await checkAvailability({...})
if (check.available) {
  const appointment = await createAppointment({...})
}

// ❌ Bad
const appointment = await createAppointment({...})
// Might fail if slot is taken
```

### 2. Use Complete Booking Function

```typescript
// ✅ Good - All-in-one, handles everything
const result = await completeWalkInBooking({...})

// ❌ Bad - Manual steps, more error-prone
const customer = await createCustomer({...})
const appointment = await createAppointment({...})
const payment = await processPayment({...})
```

### 3. Handle Loading States

```typescript
// ✅ Good
const [loading, setLoading] = useState(false)

const handleBooking = async () => {
  setLoading(true)
  try {
    await completeWalkInBooking({...})
  } finally {
    setLoading(false)  // Always cleanup
  }
}

// ❌ Bad
const handleBooking = async () => {
  setLoading(true)
  await completeWalkInBooking({...})
  setLoading(false)  // Won't run if error occurs
}
```

### 4. Validate Input

```typescript
// ✅ Good
import { validatePhoneNumber, validateEmail } from '@/lib/api/walk-in'

if (!validatePhoneNumber(phone)) {
  return showError("Invalid phone number")
}

const result = await completeWalkInBooking({...})

// ❌ Bad
const result = await completeWalkInBooking({
  newCustomer: { phone: "invalid" }  // Will fail at API
})
```

## Performance Tips

### 1. Cache Data

```typescript
// Cache services (they don't change often)
const [services, setServices] = useState<Service[]>([])

useEffect(() => {
  if (services.length === 0) {
    getServices().then(setServices)
  }
}, [])
```

### 2. Debounce Search

```typescript
// Debounce customer search
import { debounce } from 'lodash'

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchCustomers(query)
  setCustomers(results)
}, 300)

<Input onChange={(e) => debouncedSearch(e.target.value)} />
```

### 3. Parallel Requests

```typescript
// ✅ Good - Parallel
const [services, staff] = await Promise.all([
  getServices({ outlet_id }),
  getStaff({ outlet_id })
])

// ❌ Bad - Sequential
const services = await getServices({ outlet_id })
const staff = await getStaff({ outlet_id })
```

## Testing

### Unit Tests

```typescript
import { validatePhoneNumber, validateEmail } from '@/lib/api/walk-in'

describe('Validation', () => {
  test('validates phone numbers', () => {
    expect(validatePhoneNumber('+62812345678')).toBe(true)
    expect(validatePhoneNumber('08123456789')).toBe(true)
    expect(validatePhoneNumber('invalid')).toBe(false)
  })

  test('validates emails', () => {
    expect(validateEmail('test@email.com')).toBe(true)
    expect(validateEmail('invalid')).toBe(false)
  })
})
```

### Integration Tests

```typescript
// Mock API responses
jest.mock('@/lib/api/walk-in', () => ({
  completeWalkInBooking: jest.fn(() => Promise.resolve({
    success: true,
    appointment: { appointment_id: 'test_123' }
  }))
}))

test('creates booking successfully', async () => {
  const result = await completeWalkInBooking({...})
  expect(result.success).toBe(true)
  expect(result.appointment.appointment_id).toBeDefined()
})
```

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Check if user is logged in and token exists |
| "Outlet not found" | Ensure outlet_id is set from user context |
| "Service not found" | Check service_id is correct and service is active |
| "Staff not available" | Check staff working hours and time slot |
| "Slot not available" | Always call checkAvailability() before booking |

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('api_debug', 'true')

// API calls will log to console
// Check Network tab for failed requests
```

## Migration Guide

### From Local Storage to API

**Before:**
```typescript
const bookings = JSON.parse(localStorage.getItem('bookings') || '[]')
```

**After:**
```typescript
import { completeWalkInBooking } from '@/lib/api/walk-in'

const result = await completeWalkInBooking({...})
// Data persisted to backend MongoDB
```

## Roadmap

Future additions:
- [ ] Appointments management (update, cancel)
- [ ] Rescheduling API
- [ ] Recurring appointments
- [ ] Package booking
- [ ] Payment links
- [ ] Refund processing
- [ ] Customer portal APIs
- [ ] Real-time updates (WebSocket)

## Related Documentation

- [API Overview](../../documentation/00-API-Overview.md)
- [Customer API](../../documentation/09-Customer-Management.md)
- [Services API](../../documentation/07-Services-Management.md)
- [Staff API](../../documentation/06-Staff-Management.md)
- [Availability API](../../documentation/08-Availability-Management.md)
- [Appointments API](../../documentation/10-Appointments-Management.md)
- [Payment API](../../documentation/11-Payment-Management.md)

## Support

For issues or questions:
1. Check [Implementation Guide](./walk-in-implementation-guide.md)
2. Check [Quick Reference](./WALK-IN-API-QUICK-REFERENCE.md)
3. Check API documentation in `/documentation` folder
4. Review Network tab for API errors

---

**Last Updated**: 2025-10-15
**API Version**: v1
**Maintainer**: Development Team

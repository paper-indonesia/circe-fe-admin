# Walk-In API Quick Reference

Cheat sheet untuk API integration di Walk-In booking.

## Setup

```typescript
import {
  // Customer
  searchCustomers,
  createCustomer,

  // Services & Staff
  getServices,
  getStaff,

  // Availability
  getAvailableSlots,
  checkAvailability,

  // Booking
  completeWalkInBooking,

  // Helpers
  formatCurrency,
  validatePhoneNumber,
  validateEmail,
} from '@/lib/api/walk-in'
```

## 1. Search Customers

```typescript
// Real-time search
const results = await searchCustomers("john doe")

// Returns: Customer[]
[{
  customer_id: "customer_123",
  name: "John Doe",
  phone: "+62812345678",
  email: "john@email.com",
  total_appointments: 24,
  last_visit: "2025-10-10",
  ...
}]
```

## 2. Create New Customer

```typescript
const customer = await createCustomer({
  name: "Jane Smith",
  phone: "+62812345679",
  email: "jane@email.com",  // optional
  notes: "First time customer"  // optional
})

// Returns: Customer
```

## 3. Get Services

```typescript
const services = await getServices({
  category: "Facial",  // optional, or "All"
  outlet_id: "outlet_123",
  status: "active"
})

// Returns: Service[]
[{
  service_id: "service_123",
  name: "Hair Cut & Wash",
  category: "hair",
  duration_minutes: 45,
  price: 150000,
  currency: "IDR",
  ...
}]
```

## 4. Get Staff

```typescript
const staff = await getStaff({
  outlet_id: "outlet_123",
  status: "active"
})

// Returns: Staff[]
[{
  staff_id: "staff_456",
  name: "Jane Smith",
  role: "Stylist",
  rating: 4.9,
  status: "active",
  outlets: [...],
  ...
}]
```

## 5. Check Availability

```typescript
// Get available slots for a specific day
const availability = await getAvailableSlots({
  date: "2025-10-20",
  service_id: "service_123",
  outlet_id: "outlet_123",
  staff_id: "staff_456"  // optional
})

// Returns: AvailabilityGrid
{
  date: "2025-10-20",
  available_slots: [
    {
      slot_id: "slot_001",
      start_time: "09:00",
      end_time: "09:45",
      is_available: true,
      staff: {
        staff_id: "staff_456",
        staff_name: "Jane Smith",
        rating: 4.9
      },
      price: 150000
    },
    ...
  ],
  total_available_slots: 12
}
```

## 6. Verify Availability Before Booking

```typescript
const check = await checkAvailability({
  staff_id: "staff_456",
  date: "2025-10-20",
  start_time: "14:00",
  end_time: "14:45",
  service_id: "service_123"
})

// Returns: { available: boolean, reason?: string }
if (!check.available) {
  alert(check.reason)  // "Staff already has appointment at this time"
}
```

## 7. Complete Booking (All-in-One)

```typescript
const result = await completeWalkInBooking({
  // New customer
  newCustomer: {
    name: "John Doe",
    phone: "+62812345678",
    email: "john@email.com",
    notes: "Walk-in customer"
  },

  // OR existing customer
  // customer: {
  //   customer_id: "customer_123",
  //   name: "John Doe",
  //   phone: "+62812345678"
  // },

  // Booking details
  service_id: "service_123",
  staff_id: "staff_456",
  outlet_id: "outlet_123",
  appointment_date: "2025-10-20",
  start_time: "14:00",
  notes: "Customer prefers organic products",

  // Payment
  payment_method: "cash",
  payment_type: "deposit",  // or "full"
  payment_amount: 75000  // deposit 50%
})

// Returns
{
  success: true,
  customer: { customer_id, name, phone, ... },
  appointment: {
    appointment_id: "apt_123",
    appointment_number: "APT-2025-10-001",
    status: "confirmed",
    ...
  },
  payment: {
    payment_id: "pay_123",
    amount: 75000,
    status: "paid",
    ...
  }
}

// On error
{
  success: false,
  error: "Time slot not available"
}
```

## 8. Individual Booking Steps (Advanced)

If you need more control, use individual functions:

```typescript
// Step 1: Create customer
const customer = await createCustomer({
  name: "John Doe",
  phone: "+62812345678"
})

// Step 2: Check availability
const check = await checkAvailability({...})
if (!check.available) return

// Step 3: Create appointment
const appointment = await createAppointment({
  customer_id: customer.customer_id,
  service_id: "service_123",
  staff_id: "staff_456",
  outlet_id: "outlet_123",
  appointment_date: "2025-10-20",
  start_time: "14:00",
  auto_confirm: true
})

// Step 4: Process payment
const payment = await processPayment({
  appointment_id: appointment.appointment_id,
  payment_method: "cash",
  amount: 150000
})
```

## Helper Functions

```typescript
// Format currency
formatCurrency(150000)  // "Rp 150.000"

// Validate phone
validatePhoneNumber("+62812345678")  // true
validatePhoneNumber("08123456789")   // true
validatePhoneNumber("12345")         // false

// Validate email
validateEmail("test@email.com")  // true
validateEmail("invalid-email")   // false

// Calculate deposit
import { calculateDeposit } from '@/lib/api/walk-in'

calculateDeposit(150000, 'percentage', 50)  // 75000 (50%)
calculateDeposit(150000, 'fixed', 50000)    // 50000
```

## Error Handling

```typescript
try {
  const result = await completeWalkInBooking({...})

  if (!result.success) {
    toast({
      title: "Booking Failed",
      description: result.error,
      variant: "destructive"
    })
    return
  }

  // Success
  toast({
    title: "Success!",
    description: "Booking created"
  })

} catch (error: any) {
  // Network or auth errors
  if (error.message === 'Authentication failed') {
    router.push('/login')
  } else {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    })
  }
}
```

## Loading States

```typescript
const [loading, setLoading] = useState(false)

const handleBooking = async () => {
  setLoading(true)
  try {
    const result = await completeWalkInBooking({...})
    // handle success
  } catch (error) {
    // handle error
  } finally {
    setLoading(false)
  }
}
```

## Full Example Component

```typescript
'use client'

import { useState } from 'react'
import { completeWalkInBooking, getAvailableSlots } from '@/lib/api/walk-in'

export default function WalkInBooking() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceId: '',
    staffId: '',
    date: '',
    timeSlot: '',
    paymentMethod: 'cash'
  })

  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(false)

  // Load availability when date/service/staff selected
  useEffect(() => {
    if (formData.date && formData.serviceId && formData.staffId) {
      loadAvailability()
    }
  }, [formData.date, formData.serviceId, formData.staffId])

  const loadAvailability = async () => {
    const slots = await getAvailableSlots({
      date: formData.date,
      service_id: formData.serviceId,
      outlet_id: 'outlet_123',
      staff_id: formData.staffId
    })
    setAvailableSlots(slots.available_slots)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const result = await completeWalkInBooking({
        newCustomer: {
          name: formData.name,
          phone: formData.phone
        },
        service_id: formData.serviceId,
        staff_id: formData.staffId,
        outlet_id: 'outlet_123',
        appointment_date: formData.date,
        start_time: formData.timeSlot,
        payment_method: formData.paymentMethod as any,
        payment_type: 'full',
        payment_amount: 150000
      })

      if (result.success) {
        alert(`Booking created! ID: ${result.appointment.appointment_id}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Form fields... */}
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating...' : 'Create Booking'}
      </button>
    </div>
  )
}
```

## Environment Setup

```env
# .env.local
NEXT_PUBLIC_API_URL=https://circe-fastapi-backend-740443181568.europe-west1.run.app
```

## Authentication

Make sure user is logged in and token is stored:

```typescript
// Check if authenticated
const token = localStorage.getItem('access_token')
if (!token) {
  router.push('/login')
  return
}

// Get current user's outlet
const user = JSON.parse(localStorage.getItem('user') || '{}')
const outletId = user.primary_outlet_id || user.outlets?.[0]?.outlet_id
```

## API Endpoints Used

| Function | Endpoint | Method |
|----------|----------|--------|
| searchCustomers | `/api/v1/customers?search={query}` | GET |
| createCustomer | `/api/v1/customers` | POST |
| getServices | `/api/v1/services` | GET |
| getStaff | `/api/v1/staff` | GET |
| getAvailableSlots | `/api/v1/availability/slots` | GET |
| checkAvailability | `/api/v1/availability/check` | GET |
| createAppointment | `/api/v1/appointments` | POST |
| processPayment | `/api/v1/payments` | POST |

## Support

Untuk dokumentasi lengkap, lihat:
- [Walk-In Implementation Guide](./walk-in-implementation-guide.md)
- [API Documentation](../../documentation/)

---

**Happy Coding! 🚀**

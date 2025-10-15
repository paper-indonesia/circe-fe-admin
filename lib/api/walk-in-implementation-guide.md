# Walk-In API Implementation Guide

Panduan lengkap untuk mengintegrasikan Circe API ke Walk-In page.

## Overview

Walk-In booking flow menggunakan API berikut:
1. **Customer API** - Search & create customer
2. **Services API** - Get available services
3. **Staff API** - Get available staff
4. **Availability API** - Check time slots
5. **Appointments API** - Create booking
6. **Payment API** - Process payment

---

## Step-by-Step Integration

### 1. Import API Functions

```typescript
import {
  searchCustomers,
  createCustomer,
  getServices,
  getStaff,
  getAvailableSlots,
  checkAvailability,
  completeWalkInBooking,
  formatCurrency,
  validatePhoneNumber,
  validateEmail,
  type Customer,
  type Service,
  type Staff,
  type Appointment,
} from '@/lib/api/walk-in'
```

### 2. Replace Data Fetching

#### A. Customer Search (Existing Clients)

**Replace**:
```typescript
const existingClients = useMemo(() => {
  return patients.map(p => ({
    id: p.id,
    name: p.name,
    phone: p.phone,
    email: p.email || '',
  }))
}, [patients])
```

**With**:
```typescript
const [customers, setCustomers] = useState<Customer[]>([])
const [loadingCustomers, setLoadingCustomers] = useState(false)

const handleCustomerSearch = async (query: string) => {
  if (query.length < 2) {
    setCustomers([])
    return
  }

  setLoadingCustomers(true)
  try {
    const results = await searchCustomers(query)
    setCustomers(results)
  } catch (error) {
    console.error('Error searching customers:', error)
    toast({
      title: "Error",
      description: "Failed to search customers",
      variant: "destructive"
    })
  } finally {
    setLoadingCustomers(false)
  }
}

// Update search input
<Input
  placeholder="Search by name, phone, or email..."
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value)
    handleCustomerSearch(e.target.value)
  }}
  className="pl-10"
/>
```

#### B. Services/Treatments Loading

**Replace**:
```typescript
const { treatments = [], loading: treatmentsLoading } = useTreatments()
```

**With**:
```typescript
const [services, setServices] = useState<Service[]>([])
const [loadingServices, setLoadingServices] = useState(false)

// Fetch services on mount
useEffect(() => {
  const fetchServices = async () => {
    setLoadingServices(true)
    try {
      const data = await getServices({
        status: 'active',
        outlet_id: outletId, // current outlet
      })
      setServices(data)
    } catch (error) {
      console.error('Error fetching services:', error)
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive"
      })
    } finally {
      setLoadingServices(false)
    }
  }

  if (outletId) {
    fetchServices()
  }
}, [outletId])

// Filter services by category
const filteredServices = services
  .filter(s => selectedCategory === "All" || s.category === selectedCategory)
  .filter(s => s.name.toLowerCase().includes(treatmentSearchQuery.toLowerCase()))
```

#### C. Staff Loading

**Replace**:
```typescript
const { staff = [], loading: staffLoading } = useStaff()
```

**With**:
```typescript
const [staff, setStaff] = useState<Staff[]>([])
const [loadingStaff, setLoadingStaff] = useState(false)

// Fetch staff on mount
useEffect(() => {
  const fetchStaff = async () => {
    setLoadingStaff(true)
    try {
      const data = await getStaff({
        status: 'active',
        outlet_id: outletId,
      })
      setStaff(data)
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast({
        title: "Error",
        description: "Failed to load staff",
        variant: "destructive"
      })
    } finally {
      setLoadingStaff(false)
    }
  }

  if (outletId) {
    fetchStaff()
  }
}, [outletId])

// Filter available staff for selected service
const availableStaff = useMemo(() => {
  const selectedService = services.find(s => s.service_id === formData.treatmentId)
  if (!selectedService) return staff

  // Filter by qualified staff (if service has staff assignments)
  // For now, return all active staff
  return staff.filter(s => s.status === 'active')
}, [services, formData.treatmentId, staff])
```

#### D. Availability Check

**Replace**:
```typescript
const fetchAvailabilityGrid = async (serviceId: string, staffId: string, startDate: string) => {
  // ... existing code ...
  const response = await fetch(
    `/api/availability/grid?` +
    `service_id=${serviceId}&` +
    `outlet_id=${outletId}&` +
    `start_date=${startDate}&` +
    `num_days=7&` +
    `slot_interval_minutes=30`
  )
}
```

**With**:
```typescript
import { getAvailableSlots, getAvailabilityGrid } from '@/lib/api/walk-in'

const fetchAvailability = async (date: string) => {
  if (!formData.treatmentId || !formData.staffId || !outletId) return

  setLoadingAvailability(true)
  try {
    const data = await getAvailableSlots({
      date: date,
      service_id: formData.treatmentId,
      outlet_id: outletId,
      staff_id: formData.staffId,
    })

    // Transform to component format
    const slots = data.available_slots
      .filter(slot => slot.is_available)
      .map(slot => ({
        time: slot.start_time,
        available: true,
        end_time: slot.end_time,
        staff: slot.staff,
      }))

    setAvailableTimeSlots(slots)
  } catch (error) {
    console.error('Error fetching availability:', error)
    toast({
      title: "Error",
      description: "Failed to load availability",
      variant: "destructive"
    })
    setAvailableTimeSlots([])
  } finally {
    setLoadingAvailability(false)
  }
}

// Call when date, service, or staff changes
useEffect(() => {
  if (formData.bookingDate) {
    fetchAvailability(formData.bookingDate)
  }
}, [formData.treatmentId, formData.staffId, formData.bookingDate, outletId])
```

### 3. Complete Booking Flow

**Replace entire `confirmBooking` function**:

```typescript
import { completeWalkInBooking, checkAvailability } from '@/lib/api/walk-in'

const confirmBooking = async () => {
  setIsValidating(true)

  try {
    const selectedService = services.find(s => s.service_id === formData.treatmentId)
    if (!selectedService) {
      throw new Error('Service not found')
    }

    // Calculate end time
    const [hours, minutes] = formData.timeSlot.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + selectedService.duration_minutes * 60000)
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Step 1: Check availability
    const availabilityCheck = await checkAvailability({
      staff_id: formData.staffId,
      date: formData.bookingDate,
      start_time: formData.timeSlot,
      end_time: endTime,
      service_id: formData.treatmentId,
    })

    if (!availabilityCheck.available) {
      toast({
        title: "Slot Not Available",
        description: availabilityCheck.reason || "The selected time slot is no longer available.",
        variant: "destructive"
      })
      setShowConfirmDialog(false)
      setIsValidating(false)
      return
    }

    // Step 2: Complete booking with API
    const result = await completeWalkInBooking({
      // Customer
      customer: formData.existingClient && formData.existingClientId ? {
        customer_id: formData.existingClientId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      } : undefined,
      newCustomer: !formData.existingClient ? {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        notes: formData.notes,
      } : undefined,
      // Booking
      service_id: formData.treatmentId,
      staff_id: formData.staffId,
      outlet_id: outletId!,
      appointment_date: formData.bookingDate,
      start_time: formData.timeSlot,
      notes: formData.notes,
      // Payment
      payment_method: formData.paymentMethod as any,
      payment_type: formData.paymentType as 'deposit' | 'full',
      payment_amount: formData.paymentType === 'deposit' ? depositAmount : totalAmount,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to create booking')
    }

    // Success!
    const booking = {
      id: result.appointment.appointment_id,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      treatment: selectedService.name,
      staff: staff.find(s => s.staff_id === formData.staffId)?.name || "",
      timeSlot: formData.timeSlot,
      status: "waiting" as const,
      createdAt: new Date(),
      queueNumber: currentQueue,
      paymentAmount: result.payment?.amount || 0,
      paymentMethod: formData.paymentMethod,
      paymentType: formData.paymentType,
    }

    setLastBooking(booking)
    setTodayBookings([...todayBookings, booking])
    setCurrentQueue(currentQueue + 1)

    // Save to localStorage as backup
    const storageKey = `walkInBookings`
    const existingBookings = JSON.parse(localStorage.getItem(storageKey) || "[]")
    existingBookings.push(booking)
    localStorage.setItem(storageKey, JSON.stringify(existingBookings))

    toast({
      title: "Success!",
      description: "Walk-in booking created successfully",
    })

    setShowConfirmDialog(false)
    setShowSuccessDialog(true)

    // Refresh availability
    await fetchAvailability(formData.bookingDate)

    // Reset form
    resetForm()

  } catch (error: any) {
    console.error('Booking error:', error)
    toast({
      title: "Booking Failed",
      description: error.message || "Failed to create booking. Please try again.",
      variant: "destructive"
    })
  } finally {
    setIsValidating(false)
  }
}
```

### 4. Form Validation

**Update validation with helper functions**:

```typescript
import { validatePhoneNumber, validateEmail } from '@/lib/api/walk-in'

const validateForm = () => {
  const newErrors: any = {}

  if (!formData.name.trim()) {
    newErrors.name = "Name is required"
  }

  if (!formData.phone.trim()) {
    newErrors.phone = "Phone number is required"
  } else if (!validatePhoneNumber(formData.phone)) {
    newErrors.phone = "Invalid phone number format (e.g., +62812345678)"
  }

  if (formData.email && !validateEmail(formData.email)) {
    newErrors.email = "Invalid email format"
  }

  if (!formData.treatmentId) {
    newErrors.treatment = "Please select a service"
  }

  if (!formData.staffId) {
    newErrors.staff = "Please select a staff member"
  }

  if (!formData.timeSlot) {
    newErrors.timeSlot = "Please select a time slot"
  }

  if (!formData.paymentMethod) {
    newErrors.paymentMethod = "Please select a payment method"
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### 5. Currency Formatting

**Replace formatCurrency usage**:

```typescript
import { formatCurrency } from '@/lib/api/walk-in'

// In JSX
<span className="font-semibold text-primary">
  {formatCurrency(totalAmount)}
</span>

// Instead of
<span>Rp {totalAmount.toLocaleString("id-ID")}</span>
```

---

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://circe-fastapi-backend-740443181568.europe-west1.run.app
```

---

## Authentication Setup

Pastikan user sudah login dan token tersimpan di localStorage:

```typescript
// After successful login (from authentication flow)
localStorage.setItem('access_token', accessToken)
localStorage.setItem('refresh_token', refreshToken)

// Get current outlet ID from user context
const user = JSON.parse(localStorage.getItem('user') || '{}')
const outletId = user.primary_outlet_id || user.outlets?.[0]?.outlet_id
```

---

## Error Handling

```typescript
try {
  const data = await getServices()
  setServices(data)
} catch (error: any) {
  // Check error type
  if (error.message === 'Authentication failed') {
    // Redirect to login
    router.push('/login')
  } else if (error.message.includes('limit reached')) {
    // Show upgrade modal
    showUpgradeModal()
  } else {
    // General error
    toast({
      title: "Error",
      description: error.message || "Something went wrong",
      variant: "destructive"
    })
  }
}
```

---

## Testing Checklist

- [ ] Customer search works
- [ ] Can create new customer
- [ ] Services load correctly
- [ ] Staff load correctly
- [ ] Availability slots show correctly
- [ ] Can select date and time
- [ ] Availability check before booking
- [ ] Booking creates successfully
- [ ] Payment processes correctly
- [ ] Success dialog shows booking details
- [ ] Error handling works
- [ ] Token refresh works
- [ ] Loading states display properly

---

## Common Issues

### Issue: "Authentication failed"
**Solution**: Make sure access_token is stored in localStorage and user is logged in.

### Issue: "Failed to fetch services"
**Solution**: Check outlet_id is set correctly. Get from user context.

### Issue: "No available slots"
**Solution**:
1. Check staff working hours configured
2. Check service is active
3. Check date is not in the past

### Issue: "Slot not available after booking"
**Solution**: Refresh availability grid after successful booking.

---

## Next Steps

1. Replace all data fetching in `walk-in/page.tsx` dengan API calls
2. Update types untuk match API responses
3. Test complete flow end-to-end
4. Add error boundaries
5. Add loading skeletons
6. Implement retry logic for failed requests
7. Add offline support (localStorage fallback)

---

## API Documentation Reference

For complete API documentation, see:
- [Customer Management](../documentation/09-Customer-Management.md)
- [Services Management](../documentation/07-Services-Management.md)
- [Staff Management](../documentation/06-Staff-Management.md)
- [Availability Management](../documentation/08-Availability-Management.md)
- [Appointments Management](../documentation/10-Appointments-Management.md)
- [Payment Management](../documentation/11-Payment-Management.md)

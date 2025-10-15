/**
 * Walk-In API Integration
 *
 * API calls untuk Walk-In booking flow
 * Menggunakan Next.js API routes yang proxy ke Circe FastAPI Backend
 * Authentication handled via cookies (auth-token)
 */

// ==================== CUSTOMER MANAGEMENT ====================

export interface Customer {
  _id?: string
  id?: string
  customer_id?: string
  tenant_id?: string
  email: string
  first_name: string
  last_name: string
  phone: string
  date_of_birth?: string | null
  gender?: string | null
  address?: string | null
  preferences?: any
  tags?: string[]
  is_active: boolean
  email_verified: boolean
  phone_verified: boolean
  source?: string
  first_appointment_date?: string | null
  last_appointment_date?: string | null
  total_appointments: number
  total_spent: number
  loyalty_points?: number
  created_at: string
  updated_at: string
  last_login?: string | null
  profile_photo?: string
}

/**
 * Search existing customers
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const params = new URLSearchParams({
      search: query,
      size: '50',
    })

    const response = await fetch(`/api/customers?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to search customers')
    }

    const data = await response.json()
    return data.items || []
  } catch (error: any) {
    console.error('Error searching customers:', error)
    throw error
  }
}

/**
 * Get customer by ID
 */
export async function getCustomerById(customerId: string): Promise<Customer | null> {
  try {
    const response = await fetch(`/api/customers/${customerId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get customer')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting customer:', error)
    return null
  }
}

/**
 * Create new customer (walk-in registration)
 */
export async function createCustomer(customerData: {
  name: string
  phone: string
  email?: string
  date_of_birth?: string
  gender?: string
  notes?: string
}): Promise<Customer> {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...customerData,
      registration_source: 'staff_portal',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create customer')
  }

  const data = await response.json()
  return data
}

// ==================== SERVICES MANAGEMENT ====================

export interface Service {
  service_id: string
  name: string
  description: string
  category: string
  duration_minutes: number
  buffer_time_minutes: number
  price: number
  currency: string
  status: string
  image?: string
  staff_count: number
  total_bookings: number
  rating: number
}

/**
 * Get all services
 */
export async function getServices(filters?: {
  category?: string
  outlet_id?: string
  status?: string
}): Promise<Service[]> {
  try {
    const params = new URLSearchParams({
      status: filters?.status || 'active',
      size: '100',
    })

    if (filters?.category && filters.category !== 'All') {
      params.append('category', filters.category)
    }

    if (filters?.outlet_id) {
      params.append('outlet_id', filters.outlet_id)
    }

    const response = await fetch(`/api/services?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch services')
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching services:', error)
    return []
  }
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string): Promise<Service | null> {
  try {
    const response = await fetch(`/api/services/${serviceId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get service')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting service:', error)
    return null
  }
}

// ==================== STAFF MANAGEMENT ====================

export interface Staff {
  staff_id: string
  user_id: string
  name: string
  email: string
  phone: string
  role: string
  status: string
  photo?: string
  outlets: Array<{
    outlet_id: string
    outlet_name: string
    is_primary: boolean
  }>
  specializations: string[]
  rating: number
  total_appointments: number
}

/**
 * Get all staff
 */
export async function getStaff(filters?: {
  outlet_id?: string
  role?: string
  status?: string
}): Promise<Staff[]> {
  try {
    const params = new URLSearchParams({
      status: filters?.status || 'active',
      size: '100',
    })

    if (filters?.outlet_id) {
      params.append('outlet_id', filters.outlet_id)
    }

    if (filters?.role) {
      params.append('role', filters.role)
    }

    const response = await fetch(`/api/staff?${params.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch staff')
    }

    const data = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Error fetching staff:', error)
    return []
  }
}

/**
 * Get staff by ID
 */
export async function getStaffById(staffId: string): Promise<Staff | null> {
  try {
    const response = await fetch(`/api/staff/${staffId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get staff')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting staff:', error)
    return null
  }
}

// ==================== AVAILABILITY MANAGEMENT ====================

export interface AvailabilitySlot {
  slot_id: string
  start_time: string
  end_time: string
  staff: {
    staff_id: string
    staff_name: string
    photo?: string
    rating: number
  }
  is_available: boolean
  price: number
}

export interface AvailabilityGrid {
  date: string
  service_id: string
  service_name: string
  service_duration: number
  outlet_id: string
  available_slots: AvailabilitySlot[]
  total_available_slots: number
}

/**
 * Get available time slots for booking
 */
export async function getAvailableSlots(params: {
  date: string
  service_id: string
  outlet_id: string
  staff_id?: string
}): Promise<AvailabilityGrid> {
  const searchParams = new URLSearchParams({
    date: params.date,
    service_id: params.service_id,
    outlet_id: params.outlet_id,
  })

  if (params.staff_id) {
    searchParams.append('staff_id', params.staff_id)
  }

  const response = await fetch(`/api/availability/slots?${searchParams.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get available slots')
  }

  const data = await response.json()
  return data
}

/**
 * Get availability grid for calendar view (7 days)
 */
export async function getAvailabilityGrid(params: {
  service_id: string
  outlet_id: string
  staff_id?: string
  start_date: string
  num_days?: number
}): Promise<{
  start_date: string
  end_date: string
  num_days: number
  availability_grid: Record<string, AvailabilitySlot[]>
  metadata: {
    service_id: string
    service_name: string
    outlet_id: string
    outlet_name: string
    total_available_slots: number
    service_duration_minutes: number
  }
}> {
  const searchParams = new URLSearchParams({
    service_id: params.service_id,
    outlet_id: params.outlet_id,
    start_date: params.start_date,
    num_days: (params.num_days || 7).toString(),
  })

  if (params.staff_id) {
    searchParams.append('staff_id', params.staff_id)
  }

  const response = await fetch(`/api/availability/grid?${searchParams.toString()}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to get availability grid')
  }

  const data = await response.json()
  return data
}

/**
 * Check if specific time slot is available (before booking)
 */
export async function checkAvailability(params: {
  staff_id: string
  date: string
  start_time: string
  end_time: string
  service_id: string
}): Promise<{
  available: boolean
  reason?: string
  message?: string
}> {
  const searchParams = new URLSearchParams({
    staff_id: params.staff_id,
    date: params.date,
    start_time: params.start_time,
    end_time: params.end_time,
    service_id: params.service_id,
  })

  try {
    const response = await fetch(`/api/availability/check?${searchParams.toString()}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to check availability')
    }

    const data = await response.json()
    return data || { available: true }
  } catch (error: any) {
    return {
      available: false,
      reason: error.message || 'Failed to check availability',
    }
  }
}

// ==================== APPOINTMENTS MANAGEMENT ====================

export interface Appointment {
  appointment_id: string
  appointment_number: string
  customer: {
    customer_id: string
    name: string
    phone: string
    email: string
  }
  service: {
    service_id: string
    service_name: string
    duration_minutes: number
    price: number
  }
  staff: {
    staff_id: string
    staff_name: string
    photo?: string
  }
  outlet: {
    outlet_id: string
    outlet_name: string
  }
  appointment_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled' | 'no_show'
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
  total_amount: number
  notes?: string
  created_via: string
  created_at: string
}

/**
 * Create walk-in appointment
 */
export async function createAppointment(appointmentData: {
  customer_id: string
  service_id: string
  staff_id: string
  outlet_id: string
  appointment_date: string
  start_time: string
  notes?: string
  auto_confirm?: boolean
  send_notifications?: boolean
}): Promise<Appointment> {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...appointmentData,
      auto_confirm: appointmentData.auto_confirm ?? true, // Walk-in auto confirm
      send_notifications: appointmentData.send_notifications ?? true,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create appointment')
  }

  const data = await response.json()
  return data
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment | null> {
  try {
    const response = await fetch(`/api/bookings/${appointmentId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get appointment')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error getting appointment:', error)
    return null
  }
}

// ==================== PAYMENT MANAGEMENT ====================

export interface Payment {
  payment_id: string
  payment_number: string
  appointment_id: string
  amount: number
  currency: string
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'ewallet' | 'bank_transfer' | 'qris'
  payment_status: 'pending' | 'partial' | 'paid' | 'failed' | 'refunded'
  paid_at?: string
  receipt_url?: string
}

/**
 * Process payment for appointment (walk-in)
 */
export async function processPayment(paymentData: {
  appointment_id: string
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'ewallet' | 'qris'
  amount: number
  notes?: string
}): Promise<Payment> {
  const response = await fetch('/api/bookings/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to process payment')
  }

  const data = await response.json()
  return data
}

/**
 * Create payment link for online payment
 */
export async function createPaymentLink(params: {
  appointment_id: string
  payment_methods: string[]
  success_redirect_url: string
  failure_redirect_url: string
}): Promise<{
  payment_link_id: string
  payment_url: string
  qr_code_url: string
  amount: number
  expires_at: string
  status: string
}> {
  const response = await fetch('/api/payments/create-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create payment link')
  }

  const data = await response.json()
  return data
}

// ==================== WALK-IN COMPLETE FLOW ====================

/**
 * Complete walk-in booking flow
 *
 * Steps:
 * 1. Create or get existing customer
 * 2. Check availability
 * 3. Create appointment
 * 4. Process payment (optional)
 */
export async function completeWalkInBooking(data: {
  // Customer info
  customer?: {
    customer_id: string
    name: string
    phone: string
    email?: string
  }
  newCustomer?: {
    name: string
    phone: string
    email?: string
    notes?: string
  }
  // Booking info
  service_id: string
  staff_id: string
  outlet_id: string
  appointment_date: string
  start_time: string
  notes?: string
  // Payment info
  payment_method: 'cash' | 'credit_card' | 'debit_card' | 'ewallet' | 'qris'
  payment_type: 'deposit' | 'full'
  payment_amount: number
}): Promise<{
  customer: Customer
  appointment: Appointment
  payment?: Payment
  success: boolean
  error?: string
}> {
  try {
    // Step 1: Create or get customer
    let customer: Customer
    if (data.customer) {
      const existingCustomer = await getCustomerById(data.customer.customer_id)
      if (!existingCustomer) {
        throw new Error('Customer not found')
      }
      customer = existingCustomer
    } else if (data.newCustomer) {
      customer = await createCustomer(data.newCustomer)
    } else {
      throw new Error('Customer information is required')
    }

    // Step 2: Get service details for duration calculation
    const service = await getServiceById(data.service_id)
    if (!service) {
      throw new Error('Service not found')
    }

    // Calculate end time
    const [hours, minutes] = data.start_time.split(':').map(Number)
    const startDate = new Date()
    startDate.setHours(hours, minutes, 0, 0)
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000)
    const end_time = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

    // Step 3: Check availability
    const availabilityCheck = await checkAvailability({
      staff_id: data.staff_id,
      date: data.appointment_date,
      start_time: data.start_time,
      end_time: end_time,
      service_id: data.service_id,
    })

    if (!availabilityCheck.available) {
      return {
        customer,
        appointment: {} as Appointment,
        success: false,
        error: availabilityCheck.reason || 'Time slot not available',
      }
    }

    // Step 4: Create appointment
    const appointment = await createAppointment({
      customer_id: customer.customer_id,
      service_id: data.service_id,
      staff_id: data.staff_id,
      outlet_id: data.outlet_id,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      notes: data.notes,
      auto_confirm: true, // Walk-in auto confirm
      send_notifications: true,
    })

    // Step 5: Process payment (for cash/card, not for online methods)
    let payment: Payment | undefined
    if (['cash', 'credit_card', 'debit_card'].includes(data.payment_method)) {
      payment = await processPayment({
        appointment_id: appointment.appointment_id,
        payment_method: data.payment_method,
        amount: data.payment_amount,
        notes: data.payment_type === 'deposit' ? 'Deposit payment' : 'Full payment',
      })
    }

    return {
      customer,
      appointment,
      payment,
      success: true,
    }
  } catch (error: any) {
    console.error('Walk-in booking error:', error)
    return {
      customer: {} as Customer,
      appointment: {} as Appointment,
      success: false,
      error: error.message || 'Failed to complete booking',
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate deposit amount
 */
export function calculateDeposit(
  totalAmount: number,
  depositType: 'percentage' | 'fixed',
  depositValue: number
): number {
  if (depositType === 'percentage') {
    return totalAmount * (depositValue / 100)
  } else {
    return Math.min(depositValue, totalAmount)
  }
}

/**
 * Validate phone number (Indonesia format)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Indonesian phone number format: +62 or 0, followed by 9-13 digits
  const regex = /^(\+62|0)[0-9]{9,13}$/
  return regex.test(phone.replace(/\s/g, ''))
}

/**
 * Validate email
 */
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

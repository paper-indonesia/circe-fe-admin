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
 *
 * For phone number searches, strips the '+' prefix to avoid MongoDB regex errors.
 * Backend will search by phone digits (e.g., "628123456789" instead of "+628123456789")
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    // For phone number search, remove + prefix to avoid regex special character issues
    // Backend regex will match digits in phone field
    let searchQuery = query
    if (query.startsWith('+')) {
      // Strip '+' from phone number search
      searchQuery = query.slice(1) // "+628123" -> "628123"
    }

    const params = new URLSearchParams({
      search: searchQuery,
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
  // Get tenant_id from localStorage (saved during login)
  const tenantStr = typeof window !== 'undefined' ? localStorage.getItem('tenant') : null
  if (!tenantStr) {
    throw new Error('Session expired. Please login again.')
  }

  const tenant = JSON.parse(tenantStr)
  const tenantId = tenant.id || tenant._id

  if (!tenantId) {
    throw new Error('Tenant information not found. Please login again.')
  }

  // Split name into first_name and last_name
  const nameParts = customerData.name.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || firstName // Use firstName as fallback if no last name

  // Build request body with required API fields
  const requestBody: any = {
    first_name: firstName,
    last_name: lastName,
    phone: customerData.phone,
    tenant_id: tenantId,
    registration_source: 'staff_portal',
  }

  // Only include email if it's valid
  if (customerData.email && customerData.email.includes('@')) {
    requestBody.email = customerData.email
  }

  // Optional fields
  if (customerData.date_of_birth) {
    requestBody.date_of_birth = customerData.date_of_birth
  }
  if (customerData.gender) {
    requestBody.gender = customerData.gender
  }
  if (customerData.notes) {
    requestBody.notes = customerData.notes
  }

  console.log('[createCustomer] Sending request:', JSON.stringify(requestBody, null, 2))

  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[createCustomer] Error response:', error)
    throw new Error(error.error || 'Failed to create customer')
  }

  const data = await response.json()
  console.log('[createCustomer] Success:', data.customer_id || data._id || data.id)
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

export interface AppointmentService {
  service_id: string
  service_name: string
  staff_id: string
  staff_name: string
  price: number
  duration_minutes: number
  start_time: string
  end_time: string
}

export interface FeeBreakdown {
  base_amount: number
  platform_fee: number
  total_with_fee: number
  fee_rate: number
  fee_percentage: string
  subscription_plan: string
  note: string
}

export interface RescheduleInfo {
  date: string
  start_time: string
  end_time: string
}

export interface Appointment {
  id: string
  tenant_id: string
  customer_id: string
  outlet_id: string
  appointment_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  services: AppointmentService[]
  total_price: number
  fee_breakdown?: FeeBreakdown
  rescheduled_from?: RescheduleInfo
  rescheduled_to?: RescheduleInfo
  rescheduled_at?: string
  notes?: string
  created_at: string
  confirmed_at?: string
  created_by_id?: string
}

export interface AppointmentListResponse {
  items: Appointment[]
  total: number
  page: number
  size: number
  pages: number
}

/**
 * Create walk-in appointment
 * Using new API structure with services array
 */
export async function createAppointment(appointmentData: {
  customer_id: string
  service_id: string
  staff_id: string
  outlet_id: string
  appointment_date: string
  start_time: string
  notes?: string
}): Promise<Appointment> {
  // Transform to new API structure with services array
  const requestBody = {
    customer_id: appointmentData.customer_id,
    outlet_id: appointmentData.outlet_id,
    appointment_date: appointmentData.appointment_date,
    start_time: appointmentData.start_time,
    services: [
      {
        service_id: appointmentData.service_id,
        staff_id: appointmentData.staff_id
      }
    ],
    notes: appointmentData.notes || ''
  }

  console.log('[createAppointment] Sending request:', JSON.stringify(requestBody, null, 2))

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('[createAppointment] Error response:', error)
    throw new Error(error.error || 'Failed to create appointment')
  }

  const data = await response.json()
  console.log('[createAppointment] Success response:', data)
  return data
}

/**
 * List appointments with filtering and pagination
 */
export async function listAppointments(params?: {
  // Pagination
  page?: number
  size?: number
  // Date filters
  date_from?: string
  date_to?: string
  // Status filters
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  appointment_type?: 'walk_in' | 'scheduled' | 'online'
  payment_status?: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  // Entity filters
  customer_id?: string
  staff_id?: string
  outlet_id?: string
  service_id?: string
  // Sorting
  sort_by?: string
  sort_direction?: 'asc' | 'desc'
}): Promise<AppointmentListResponse> {
  try {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    const url = `/api/appointments${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    console.log('[listAppointments] Fetching:', url)

    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch appointments')
    }

    const data = await response.json()
    console.log('[listAppointments] Success, received', data.items?.length || 0, 'items')
    return data
  } catch (error: any) {
    console.error('[listAppointments] Error:', error)
    throw error
  }
}

/**
 * Get appointment by ID
 */
export async function getAppointmentById(appointmentId: string): Promise<Appointment> {
  try {
    console.log('[getAppointmentById] Fetching appointment:', appointmentId)

    const response = await fetch(`/api/appointments/${appointmentId}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get appointment')
    }

    const data = await response.json()
    console.log('[getAppointmentById] Success')
    return data
  } catch (error: any) {
    console.error('[getAppointmentById] Error:', error)
    throw error
  }
}

/**
 * Update appointment
 */
export async function updateAppointment(
  appointmentId: string,
  updates: Partial<{
    status: Appointment['status']
    payment_status: Appointment['payment_status']
    notes: string
    appointment_date: string
    start_time: string
  }>
): Promise<Appointment> {
  try {
    console.log('[updateAppointment] Updating:', appointmentId, updates)

    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update appointment')
    }

    const data = await response.json()
    console.log('[updateAppointment] Success')
    return data
  } catch (error: any) {
    console.error('[updateAppointment] Error:', error)
    throw error
  }
}

/**
 * Cancel/delete appointment
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
  try {
    console.log('[deleteAppointment] Deleting:', appointmentId)

    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete appointment')
    }

    console.log('[deleteAppointment] Success')
  } catch (error: any) {
    console.error('[deleteAppointment] Error:', error)
    throw error
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

export interface PaymentHistory {
  id: string
  amount: number
  method: 'cash' | 'credit_card' | 'debit_card' | 'ewallet' | 'bank_transfer' | 'qris'
  provider: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  recorded_by: string
  recorded_at: string
  notes?: string
  receipt_number?: string
}

export interface PendingInvoice {
  payment_link_id: string
  payment_url: string
  qr_code_url?: string
  amount: number
  expires_at: string
  status: string
}

export interface PaymentStatusResponse {
  appointment_id: string
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded'
  total_amount: number
  paid_amount: number
  remaining_balance: number
  platform_fee: number
  platform_fee_percentage: number
  payment_history: PaymentHistory[]
  pending_invoice: PendingInvoice | null
  can_complete: boolean
}

export interface RecordPaymentRequest {
  amount: number
  payment_method: 'cash' | 'pos_terminal' | 'bank_transfer'
  notes?: string
  receipt_number?: string
}

export interface RecordPaymentResponse {
  status: 'success' | 'error'
  message: string
  payment: {
    id: string
    amount: number
    method: string
    status: string
    recorded_by: string
    recorded_at: string
    receipt_number?: string
  }
  appointment: {
    payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded'
    paid_amount: number
    remaining_balance: number
  }
}

export interface CreatePaymentLinkRequest {
  send_email?: boolean
  send_whatsapp?: boolean
  send_sms?: boolean
  notes?: string
  due_date?: string
}

export interface CreatePaymentLinkResponse {
  status: 'payment_link_created'
  message: string
  invoice: {
    id: string
    invoice_number: string
    amount: number
    subtotal: number
    platform_fee: number
    platform_fee_percentage: number
    currency: string
    due_date: string
    paper_invoice_id: string
    paper_payment_url: string
    paper_pdf_url: string
  }
  payment_link: {
    url: string
    short_url: string
    expires_at: string
    sent_via: string[]
  }
  payment: {
    id: string
    status: string
    awaiting_customer_payment: boolean
  }
  next_steps: string[]
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
  const response = await fetch('/api/payments', {
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

/**
 * Get payment status for an appointment
 *
 * Retrieves complete payment status including:
 * - Current payment status and amounts
 * - Payment history with audit trail
 * - Pending invoices/payment links
 * - Completion eligibility check
 */
export async function getPaymentStatus(appointmentId: string): Promise<PaymentStatusResponse> {
  try {
    console.log('[getPaymentStatus] Fetching payment status for:', appointmentId)

    const response = await fetch(`/api/appointments/${appointmentId}/payment-status`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get payment status')
    }

    const data = await response.json()
    console.log('[getPaymentStatus] Success')
    return data
  } catch (error: any) {
    console.error('[getPaymentStatus] Error:', error)
    throw error
  }
}

/**
 * Record manual offline payment
 *
 * Records manual payments (cash, POS terminal, bank transfer) for an appointment.
 * Staff only operation with automatic audit trail.
 *
 * Business Rules:
 * - Payment method must be offline type only
 * - Amount must not exceed appointment total
 * - Immediate status: Payment marked as COMPLETED
 * - Duplicate prevention: Only one completed payment per appointment
 * - Updates appointment payment_status automatically
 */
export async function recordManualPayment(
  appointmentId: string,
  paymentData: RecordPaymentRequest
): Promise<RecordPaymentResponse> {
  try {
    console.log('[recordManualPayment] Recording payment for:', appointmentId, paymentData)

    const response = await fetch(`/api/appointments/${appointmentId}/record-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to record payment')
    }

    const data = await response.json()
    console.log('[recordManualPayment] Success:', data.appointment?.payment_status)
    return data
  } catch (error: any) {
    console.error('[recordManualPayment] Error:', error)
    throw error
  }
}

/**
 * Create Paper.id payment link for online payment
 *
 * Creates a payment link via Paper.id for remaining appointment balance.
 * Customer receives link via email/WhatsApp/SMS to pay online.
 *
 * Business Rules:
 * - Only creates link for remaining unpaid balance
 * - Cannot create multiple pending links (prevents duplicate payments)
 * - Link expires after 7 days by default (configurable via due_date)
 * - Supports multiple notification channels
 * - Includes platform fee
 * - Payment status updates via Paper.id webhook
 *
 * Flow:
 * 1. API creates invoice in Paper.id
 * 2. Generates payment link with QR code
 * 3. Sends link to customer via selected channels
 * 4. Creates pending payment record in database
 * 5. Customer pays online via Paper.id
 * 6. Webhook updates payment and appointment status
 */
export async function createPaperPaymentLink(
  appointmentId: string,
  requestData: CreatePaymentLinkRequest
): Promise<CreatePaymentLinkResponse> {
  try {
    console.log('[createPaperPaymentLink] Creating payment link for:', appointmentId, requestData)

    const response = await fetch(`/api/appointments/${appointmentId}/create-payment-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create payment link')
    }

    const data = await response.json()
    console.log('[createPaperPaymentLink] Success:', {
      invoice_id: data.invoice?.id,
      payment_url: data.payment_link?.url,
      sent_via: data.payment_link?.sent_via
    })
    return data
  } catch (error: any) {
    console.error('[createPaperPaymentLink] Error:', error)
    throw error
  }
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
  // Optional: service duration (if already known from context)
  service_duration_minutes?: number
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

    console.log('[completeWalkInBooking] Customer ready:', customer.customer_id || customer._id || customer.id)

    // Step 2: SKIP - No need to get service details or check availability
    // The new API will handle all validations on the server side
    // Price and duration are auto-populated by server to prevent manipulation

    // Step 3: Create appointment directly
    // Handle different customer ID field names (_id, id, customer_id)
    const customerId = customer.customer_id || customer._id || customer.id
    if (!customerId) {
      throw new Error('Customer ID not found')
    }

    const appointment = await createAppointment({
      customer_id: customerId,
      service_id: data.service_id,
      staff_id: data.staff_id,
      outlet_id: data.outlet_id,
      appointment_date: data.appointment_date,
      start_time: data.start_time,
      notes: data.notes,
    })

    console.log('[completeWalkInBooking] Appointment created successfully:', appointment)

    // TODO: Step 5: Process payment (SKIPPED FOR NOW - Testing appointment creation first)
    // let payment: Payment | undefined
    // if (['cash', 'credit_card', 'debit_card'].includes(data.payment_method)) {
    //   payment = await processPayment({
    //     appointment_id: appointment.appointment_id || appointment.id,
    //     payment_method: data.payment_method,
    //     amount: data.payment_amount,
    //     notes: data.payment_type === 'deposit' ? 'Deposit payment' : 'Full payment',
    //   })
    // }

    return {
      customer,
      appointment,
      // payment, // Skipped for now
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

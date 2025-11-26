export interface Patient {
  id: string
  tenantId: string
  name: string
  phone: string
  email?: string
  notes?: string
  lastVisitAt?: string
  totalVisits: number
  createdAt: string
}

export interface Staff {
  id: string
  tenant_id?: string
  tenantId?: string
  outlet_id?: string
  outletId?: string
  first_name: string
  last_name: string
  display_name?: string
  name?: string // For backward compatibility
  email: string
  phone?: string
  position: string
  role?: string // For backward compatibility
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'intern'
  employee_id?: string
  hire_date?: string
  birth_date?: string
  hourly_rate?: number
  salary?: number
  is_bookable?: boolean
  accepts_online_booking?: boolean
  max_advance_booking_days?: number
  bio?: string
  profile_image_url?: string
  avatar?: string // For backward compatibility
  instagram_handle?: string
  is_active?: boolean
  isActive?: boolean // For backward compatibility
  status?: 'active' | 'inactive' | 'terminated' | 'on_leave'
  skills?: {
    service_ids?: string[]
    specialties?: string[]
    certifications?: string[]
    years_experience?: number
  } | string[] // Support both formats
  average_rating?: number
  rating?: number // For backward compatibility
  rating_count?: number
  total_bookings?: number
  next_available_slot?: string | null
  workingHours?: string[]
  workingSchedule?: Record<string, string[]>
  workingDays?: string[]
  capacity?: number
  balance?: number
  totalEarnings?: number
  notes?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

export interface Treatment {
  id: string
  tenantId?: string
  name: string
  slug?: string
  category: string
  duration?: number
  durationMin: number
  price: number
  currency?: string
  photo?: string
  description?: string
  popularity?: number
  assignedStaff?: string[]
  staffIds?: string[] // Staff IDs from include_staff=true
  staffCount?: number // Staff count from include_staff=true
  isActive?: boolean
  status?: string
  tags?: string[]
  preparation_minutes?: number
  cleanup_minutes?: number
  max_advance_booking_days?: number
  min_advance_booking_hours?: number
  requires_staff?: boolean
  required_staff_count?: number
  allow_parallel_bookings?: boolean
  max_parallel_bookings?: number
  preparationMinutes?: number
  cleanupMinutes?: number
  maxAdvanceBookingDays?: number
  minAdvanceBookingHours?: number
  requiresStaff?: boolean
  requiredStaffCount?: number
  allowParallelBookings?: boolean
  maxParallelBookings?: number
}

export interface Booking {
  id: string
  tenantId?: string
  patientId: string
  patientName?: string
  patientPhone?: string
  patientEmail?: string
  staffId: string
  staffName?: string
  treatmentId: string
  startAt: string
  endAt: string
  status: "available" | "pending" | "confirmed" | "cancelled" | "completed" | "no-show"
  source: "walk-in" | "online"
  paymentStatus: "unpaid" | "deposit" | "paid" | "pending" | "partially_paid" | "refunded"
  payment_status?: "unpaid" | "deposit" | "paid" | "pending" | "partially_paid" | "refunded" // snake_case alias for API consistency
  notes?: string
  queueNumber?: string
  createdAt: Date | string
  // New fields from appointments API
  appointment_date?: string
  start_time?: string
  end_time?: string
  services?: any[]
  total_price?: string
  fee_breakdown?: any
  customer?: any // Customer details from lookup
}

export interface Payment {
  id: string
  tenantId: string
  bookingId: string
  method: "cash" | "qris" | "card" | "va"
  amount: number
  status: "pending" | "success" | "failed"
  paidAt?: string
  createdAt: string
}

export interface Activity {
  id: string
  tenantId: string
  type: "booking_created" | "booking_completed" | "payment_received" | "client_added" | "booking_cancelled" | "booking_updated" | "staff_added" | "staff_removed"
  description: string
  relatedId?: string
  patientId?: string
  timestamp?: string
  createdAt: string
}

export interface Availability {
  id: string
  staff_id: string
  staffId?: string // For backward compatibility
  outlet_id: string
  outletId?: string // For backward compatibility
  date: string // YYYY-MM-DD format
  start_time: string // HH:MM:SS format (API response) or HH:MM (input)
  end_time: string // HH:MM:SS format (API response) or HH:MM (input)
  availability_type: 'working_hours' | 'break' | 'blocked' | 'vacation'
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrence_end_date?: string | null // Required if recurrence_type != 'none'
  recurrence_days?: number[] | null // Days for weekly (0=Mon, 1=Tue, ..., 6=Sun)
  is_available: boolean // true for working_hours, false for break
  notes?: string
  service_ids?: string[] | null // null = all services staff is qualified for
  created_at?: string
  createdAt?: string // For backward compatibility
  updated_at?: string
  updatedAt?: string // For backward compatibility
}

export interface AvailabilityCreatePayload {
  staff_id: string
  date: string
  start_time: string
  end_time: string
  availability_type: 'working_hours' | 'break' | 'blocked' | 'vacation'
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly'
  recurrence_end_date?: string
  recurrence_days?: number[]
  is_available?: boolean
  notes?: string
  service_ids?: string[]
}

export interface AvailabilityBulkEntry {
  date: string
  start_time: string
  end_time: string
  availability_type: 'working_hours' | 'break' | 'blocked' | 'vacation'
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly'
  is_available?: boolean
  notes?: string
  service_ids?: string[]
}

export interface AvailabilityBulkPayload {
  staff_id: string
  availability_entries: AvailabilityBulkEntry[]
}

export interface AvailabilityCheckResponse {
  available: boolean
  message: string
  reason?: string | null // 'staff_not_working', 'booking_conflict', etc.
  working_hours: {
    start_time: string
    end_time: string
    breaks: Array<{
      start: string
      end: string
    }>
  }
  conflicts: Array<{
    id: string
    type: 'working_hours' | 'break' | 'blocked' | 'vacation'
    start_time: string
    end_time: string
    notes?: string
  }>
}

export interface AvailabilityRecurringResponse {
  message: string
  summary: {
    total_entries_created: number
    date_range: {
      start: string
      end: string
    }
    recurrence_pattern: {
      type: 'daily' | 'weekly' | 'monthly'
      days?: string[]
    }
    staff_id: string
    availability_type: string
    time_range: string
  }
  sample_entry: {
    id: string
    date: string
    start_time: string
    end_time: string
  }
}

// ============================================
// PACKAGE TYPES
// ============================================

export interface PackageItem {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}

export interface Package {
  id: string
  tenant_id: string
  name: string
  description?: string
  package_items: PackageItem[]
  package_price: number
  currency: string
  validity_days?: number | null
  is_active: boolean
  status: 'active' | 'inactive' | 'archived'
  outlet_ids: string[]
  // Calculated fields
  total_individual_price: number
  discount_amount: number
  discount_percentage: number
  total_purchased: number
  active_credits_count: number
  total_revenue: number
  // Metadata
  created_at: string
  updated_at: string
}

export interface PackageCreate {
  name: string
  description?: string
  package_items: Array<{
    service_id: string
    service_name?: string
    quantity: number
    unit_price?: number
  }>
  package_price: number
  currency?: string
  validity_days?: number | null
  is_active?: boolean
  status?: 'active' | 'inactive'
  outlet_ids?: string[]
}

export interface PackageUpdate {
  name?: string
  description?: string
  package_price?: number
  validity_days?: number | null
  is_active?: boolean
  status?: 'active' | 'inactive' | 'archived'
  outlet_ids?: string[]
}

export interface PackageLimits {
  packages_enabled: boolean
  max_packages: number
  current_packages: number
  remaining_packages: number
  max_package_items: number
  limit_reached: boolean
}

export interface PackageListResponse {
  items: Package[]
  total: number
  page: number
  size: number
  pages: number
}

// ============================================
// CUSTOMER PACKAGE TYPES
// ============================================

export interface CustomerCredit {
  id: string
  tenant_id: string
  customer_id: string
  customer_package_id: string
  service_id: string
  service_name: string
  allocated_credits: number
  used_credits: number
  remaining_credits: number
  expires_at: string
  is_expired: boolean
  created_at: string
}

export interface CustomerPackage {
  id: string
  tenant_id: string
  customer_id: string
  package_id: string
  outlet_id: string
  payment_method: 'manual_onspot' | 'paper_digital' | 'bank_transfer'
  payment_status: 'pending' | 'paid' | 'failed'
  amount_paid: number
  currency: string
  package_name: string
  validity_days: number
  purchased_at: string
  expires_at: string
  payment_confirmed_at?: string
  status: 'active' | 'pending_payment' | 'partially_used' | 'depleted' | 'expired'
  total_credits: number
  used_credits: number
  remaining_credits: number
  expired_credits: number
  notes?: string
  package_details?: Package
  credits_details?: CustomerCredit[]
  days_until_expiry: number
  is_expiring_soon: boolean
  created_at: string
  updated_at: string
}

export interface CustomerCreditSummary {
  total_packages: number
  active_packages: number
  total_credits: number
  used_credits: number
  remaining_credits: number
  expired_credits: number
  expiring_soon: number
}

export interface StaffPackagePurchaseCreate {
  customer_id: string
  package_id: string
  outlet_id: string
  payment_method?: 'manual_onspot' | 'paper_digital' | 'bank_transfer'
  amount_paid: number
  currency?: string
  notes?: string
}

export interface CreditRedeemRequest {
  customer_id: string
  service_id: string
  notes?: string
}

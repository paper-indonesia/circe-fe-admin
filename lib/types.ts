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
  tenantId: string
  name: string
  role: string
  skills?: string[]
  workingHours?: string[]
  rating?: number
  avatar?: string
}

export interface Treatment {
  id: string
  tenantId: string
  name: string
  category: string
  durationMin: number
  price: number
  description?: string
  popularity?: number
  assignedStaff?: string[]
}

export interface Booking {
  id: string
  tenantId: string
  patientId: string
  patientName?: string
  staffId: string
  treatmentId: string
  startAt: string
  endAt: string
  status: "available" | "pending" | "confirmed" | "cancelled" | "completed" | "no-show"
  source: "walk-in" | "online"
  paymentStatus: "unpaid" | "deposit" | "paid"
  notes?: string
  createdAt: string
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

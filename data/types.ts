export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
  lastVisitAt?: Date
  totalVisits?: number
  totalSpent?: number
  status: "new" | "active" | "vip" | "inactive"
}

export interface Staff {
  id: string
  name: string
  role: string
  skills?: string[]
  workingHours?: string[]
  rating?: number
}

export interface Treatment {
  id: string
  name: string
  category: string
  durationMin: number
  price: number
  description?: string
  popularity?: "high" | "medium" | "low"
}

export interface Booking {
  id: string
  patientId: string
  staffId: string
  treatmentId: string
  startAt: Date
  endAt: Date
  status: "available" | "pending" | "confirmed" | "cancelled" | "completed" | "no-show"
  source: "walk-in" | "online"
  paymentStatus: "unpaid" | "deposit" | "paid"
  notes?: string
}

export interface Payment {
  id: string
  bookingId: string
  method: "cash" | "qris" | "card" | "va"
  amount: number
  status: "pending" | "success" | "failed"
  paidAt?: Date
}

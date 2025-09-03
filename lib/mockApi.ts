import type { Patient, Staff, Treatment, Booking, Payment, Activity } from "./types"
import { initializeSeedData } from "./seedData"
import { addDays, format } from "date-fns"

// In-memory store
let store = initializeSeedData()

// Persistence helpers
const STORAGE_KEY = "beauty-clinic-data"

export const loadFromStorage = () => {
  if (typeof window === "undefined") return

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      store = JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load from storage:", error)
  }
}

export const saveToStorage = () => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch (error) {
    console.error("Failed to save to storage:", error)
  }
}

export const resetData = () => {
  store = initializeSeedData()
  saveToStorage()
}

// Simulate network delay
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

// Patient API
export const getPatients = async (search?: string): Promise<Patient[]> => {
  await delay()
  let patients = [...store.patients]

  if (search) {
    const searchLower = search.toLowerCase()
    patients = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.phone.includes(search) ||
        p.email?.toLowerCase().includes(searchLower),
    )
  }

  return patients.sort((a, b) => new Date(b.lastVisitAt || 0).getTime() - new Date(a.lastVisitAt || 0).getTime())
}

export const getPatient = async (id: string): Promise<Patient | null> => {
  await delay()
  return store.patients.find((p) => p.id === id) || null
}

export const createPatient = async (data: Omit<Patient, "id" | "createdAt" | "totalVisits">): Promise<Patient> => {
  await delay()

  const patient: Patient = {
    ...data,
    id: `pat_${Date.now()}`,
    totalVisits: 0,
    createdAt: new Date().toISOString(),
  }

  store.patients.push(patient)
  saveToStorage()
  return patient
}

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient | null> => {
  await delay()

  const index = store.patients.findIndex((p) => p.id === id)
  if (index === -1) return null

  store.patients[index] = { ...store.patients[index], ...data }
  saveToStorage()
  return store.patients[index]
}

export const deletePatient = async (id: string): Promise<boolean> => {
  await delay()

  const index = store.patients.findIndex((p) => p.id === id)
  if (index === -1) return false

  store.patients.splice(index, 1)
  // Also remove related bookings
  store.bookings = store.bookings.filter((b) => b.patientId !== id)
  saveToStorage()
  return true
}

// Staff API
export const getStaff = async (): Promise<Staff[]> => {
  await delay()
  return [...store.staff]
}

export const getStaffMember = async (id: string): Promise<Staff | null> => {
  await delay()
  return store.staff.find((s) => s.id === id) || null
}

// Treatment API
export const getTreatments = async (category?: string): Promise<Treatment[]> => {
  await delay()
  let treatments = [...store.treatments]

  if (category) {
    treatments = treatments.filter((t) => t.category === category)
  }

  return treatments.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
}

export const getTreatment = async (id: string): Promise<Treatment | null> => {
  await delay()
  return store.treatments.find((t) => t.id === id) || null
}

export const createTreatment = async (data: Omit<Treatment, "id">): Promise<Treatment> => {
  await delay()

  const treatment: Treatment = {
    ...data,
    id: `treat_${Date.now()}`,
  }

  store.treatments.push(treatment)
  saveToStorage()
  return treatment
}

export const updateTreatment = async (id: string, data: Partial<Treatment>): Promise<Treatment | null> => {
  await delay()

  const index = store.treatments.findIndex((t) => t.id === id)
  if (index === -1) return null

  store.treatments[index] = { ...store.treatments[index], ...data }
  saveToStorage()
  return store.treatments[index]
}

export const deleteTreatment = async (id: string): Promise<boolean> => {
  await delay()

  const index = store.treatments.findIndex((t) => t.id === id)
  if (index === -1) return false

  store.treatments.splice(index, 1)
  saveToStorage()
  return true
}

// Booking API
export interface BookingFilters {
  startDate?: string
  endDate?: string
  staffId?: string
  status?: Booking["status"]
  patientId?: string
}

export const getBookings = async (filters?: BookingFilters): Promise<Booking[]> => {
  await delay()
  let bookings = [...store.bookings]

  if (filters) {
    if (filters.startDate) {
      bookings = bookings.filter((b) => b.startAt >= filters.startDate!)
    }
    if (filters.endDate) {
      bookings = bookings.filter((b) => b.startAt <= filters.endDate!)
    }
    if (filters.staffId) {
      bookings = bookings.filter((b) => b.staffId === filters.staffId)
    }
    if (filters.status) {
      bookings = bookings.filter((b) => b.status === filters.status)
    }
    if (filters.patientId) {
      bookings = bookings.filter((b) => b.patientId === filters.patientId)
    }
  }

  return bookings.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
}

export const getBooking = async (id: string): Promise<Booking | null> => {
  await delay()
  return store.bookings.find((b) => b.id === id) || null
}

export const createBooking = async (data: Omit<Booking, "id" | "createdAt">): Promise<Booking> => {
  await delay()

  const booking: Booking = {
    ...data,
    id: `booking_${Date.now()}`,
    createdAt: new Date().toISOString(),
  }

  store.bookings.push(booking)

  // Update patient's total visits if booking is completed
  if (booking.status === "completed") {
    const patient = store.patients.find((p) => p.id === booking.patientId)
    if (patient) {
      patient.totalVisits += 1
      patient.lastVisitAt = booking.endAt
    }
  }

  // Add activity
  const patient = store.patients.find((p) => p.id === booking.patientId)
  const treatment = store.treatments.find((t) => t.id === booking.treatmentId)
  if (patient && treatment) {
    store.activities.unshift({
      id: `activity_${Date.now()}`,
      type: "booking_created",
      description: `New booking: ${patient.name} - ${treatment.name}`,
      relatedId: booking.id,
      createdAt: new Date().toISOString(),
    })
  }

  saveToStorage()
  return booking
}

export const updateBooking = async (id: string, data: Partial<Booking>): Promise<Booking | null> => {
  await delay()

  const index = store.bookings.findIndex((b) => b.id === id)
  if (index === -1) return null

  const oldBooking = store.bookings[index]
  store.bookings[index] = { ...oldBooking, ...data }

  // Update patient visits if status changed to completed
  if (data.status === "completed" && oldBooking.status !== "completed") {
    const patient = store.patients.find((p) => p.id === store.bookings[index].patientId)
    if (patient) {
      patient.totalVisits += 1
      patient.lastVisitAt = store.bookings[index].endAt
    }
  }

  saveToStorage()
  return store.bookings[index]
}

export const deleteBooking = async (id: string): Promise<boolean> => {
  await delay()

  const index = store.bookings.findIndex((b) => b.id === id)
  if (index === -1) return false

  store.bookings.splice(index, 1)
  // Also remove related payments
  store.payments = store.payments.filter((p) => p.bookingId !== id)
  saveToStorage()
  return true
}

// Booking actions
export const checkInBooking = async (id: string): Promise<Booking | null> => {
  return updateBooking(id, { status: "confirmed" })
}

export const completeBooking = async (id: string): Promise<Booking | null> => {
  const booking = await updateBooking(id, { status: "completed" })
  if (booking) {
    // Add completion activity
    const patient = store.patients.find((p) => p.id === booking.patientId)
    const treatment = store.treatments.find((t) => t.id === booking.treatmentId)
    if (patient && treatment) {
      store.activities.unshift({
        id: `activity_${Date.now()}`,
        type: "booking_completed",
        description: `${patient.name} completed ${treatment.name}`,
        relatedId: booking.id,
        createdAt: new Date().toISOString(),
      })
      saveToStorage()
    }
  }
  return booking
}

export const cancelBooking = async (id: string): Promise<Booking | null> => {
  return updateBooking(id, { status: "cancelled" })
}

export const markNoShow = async (id: string): Promise<Booking | null> => {
  return updateBooking(id, { status: "no-show" })
}

// Payment API
export const getPayments = async (bookingId?: string): Promise<Payment[]> => {
  await delay()
  let payments = [...store.payments]

  if (bookingId) {
    payments = payments.filter((p) => p.bookingId === bookingId)
  }

  return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const createPayment = async (data: Omit<Payment, "id" | "createdAt">): Promise<Payment> => {
  await delay()

  const payment: Payment = {
    ...data,
    id: `payment_${Date.now()}`,
    createdAt: new Date().toISOString(),
    paidAt: data.status === "success" ? new Date().toISOString() : undefined,
  }

  store.payments.push(payment)

  // Update booking payment status
  const booking = store.bookings.find((b) => b.id === data.bookingId)
  if (booking) {
    const treatment = store.treatments.find((t) => t.id === booking.treatmentId)
    if (treatment) {
      const totalPaid = store.payments
        .filter((p) => p.bookingId === data.bookingId && p.status === "success")
        .reduce((sum, p) => sum + p.amount, 0)

      if (totalPaid >= treatment.price) {
        booking.paymentStatus = "paid"
      } else if (totalPaid > 0) {
        booking.paymentStatus = "deposit"
      }
    }
  }

  // Add payment activity
  if (payment.status === "success") {
    store.activities.unshift({
      id: `activity_${Date.now()}`,
      type: "payment_received",
      description: `Payment received: Rp ${payment.amount.toLocaleString()}`,
      relatedId: payment.bookingId,
      createdAt: new Date().toISOString(),
    })
  }

  saveToStorage()
  return payment
}

// Activity API
export const getActivities = async (limit?: number): Promise<Activity[]> => {
  await delay()
  const activities = [...store.activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return limit ? activities.slice(0, limit) : activities
}

// Analytics API
export const getAnalytics = async (startDate?: string, endDate?: string) => {
  await delay()

  const now = new Date()
  const start = startDate ? new Date(startDate) : addDays(now, -30)
  const end = endDate ? new Date(endDate) : now

  const bookingsInRange = store.bookings.filter((b) => {
    const bookingDate = new Date(b.startAt)
    return bookingDate >= start && bookingDate <= end
  })

  const paymentsInRange = store.payments.filter((p) => {
    const paymentDate = new Date(p.createdAt)
    return paymentDate >= start && paymentDate <= end && p.status === "success"
  })

  const totalRevenue = paymentsInRange.reduce((sum, p) => sum + p.amount, 0)
  const totalBookings = bookingsInRange.length
  const completedBookings = bookingsInRange.filter((b) => b.status === "completed").length
  const noShowBookings = bookingsInRange.filter((b) => b.status === "no-show").length

  const attendanceRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0
  const noShowRate = totalBookings > 0 ? (noShowBookings / totalBookings) * 100 : 0

  // Top treatments
  const treatmentCounts = bookingsInRange.reduce(
    (acc, booking) => {
      acc[booking.treatmentId] = (acc[booking.treatmentId] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const topTreatments = Object.entries(treatmentCounts)
    .map(([treatmentId, count]) => ({
      treatment: store.treatments.find((t) => t.id === treatmentId)!,
      count,
    }))
    .filter((item) => item.treatment)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalRevenue,
    totalBookings,
    completedBookings,
    attendanceRate,
    noShowRate,
    topTreatments,
    dailyRevenue: generateDailyRevenue(start, end),
    bookingTrends: generateBookingTrends(start, end),
  }
}

const generateDailyRevenue = (start: Date, end: Date) => {
  const days = []
  const current = new Date(start)

  while (current <= end) {
    const dayStr = format(current, "yyyy-MM-dd")
    const dayPayments = store.payments.filter(
      (p) => p.status === "success" && format(new Date(p.createdAt), "yyyy-MM-dd") === dayStr,
    )
    const revenue = dayPayments.reduce((sum, p) => sum + p.amount, 0)

    days.push({
      date: dayStr,
      revenue,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
}

const generateBookingTrends = (start: Date, end: Date) => {
  const days = []
  const current = new Date(start)

  while (current <= end) {
    const dayStr = format(current, "yyyy-MM-dd")
    const dayBookings = store.bookings.filter((b) => format(new Date(b.startAt), "yyyy-MM-dd") === dayStr)

    days.push({
      date: dayStr,
      bookings: dayBookings.length,
      completed: dayBookings.filter((b) => b.status === "completed").length,
      cancelled: dayBookings.filter((b) => b.status === "cancelled").length,
      noShow: dayBookings.filter((b) => b.status === "no-show").length,
    })

    current.setDate(current.getDate() + 1)
  }

  return days
}

// Initialize storage on first load
if (typeof window !== "undefined") {
  loadFromStorage()
}

import type { Patient, Staff, Treatment, Booking, Payment, Activity } from "./types"
import { addDays, subDays, format, addHours } from "date-fns"

// Import static data
import patientsData from "../data/patients.json"
import staffData from "../data/staff.json"
import treatmentsData from "../data/treatments.json"

export const patients: Patient[] = patientsData as Patient[]
export const staff: Staff[] = staffData as Staff[]
export const treatments: Treatment[] = treatmentsData as Treatment[]

// Generate bookings for the next/previous 30 days
export const generateBookings = (): Booking[] => {
  const bookings: Booking[] = []
  const today = new Date()

  // Generate bookings for past 30 days and next 30 days
  for (let i = -30; i <= 30; i++) {
    const date = addDays(today, i)
    const numBookings = Math.floor(Math.random() * 8) + 2 // 2-10 bookings per day

    for (let j = 0; j < numBookings; j++) {
      const startHour = 9 + Math.floor(Math.random() * 9) // 9 AM to 5 PM
      const startTime = new Date(date)
      startTime.setHours(startHour, Math.floor(Math.random() * 4) * 15, 0, 0) // 15-min intervals

      const treatment = treatments[Math.floor(Math.random() * treatments.length)]
      const endTime = addHours(startTime, treatment.durationMin / 60)

      const statuses: Booking["status"][] =
        i < 0
          ? ["completed", "no-show", "cancelled"]
          : i === 0
            ? ["confirmed", "pending", "completed"]
            : ["confirmed", "pending"]

      const booking: Booking = {
        id: `booking_${format(date, "yyyyMMdd")}_${j + 1}`,
        patientId: patients[Math.floor(Math.random() * patients.length)].id,
        staffId: staff[Math.floor(Math.random() * staff.length)].id,
        treatmentId: treatment.id,
        startAt: startTime.toISOString(),
        endAt: endTime.toISOString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        source: Math.random() > 0.3 ? "online" : "walk-in",
        paymentStatus: Math.random() > 0.2 ? "paid" : Math.random() > 0.5 ? "deposit" : "unpaid",
        createdAt: subDays(startTime, Math.floor(Math.random() * 7)).toISOString(),
      }

      bookings.push(booking)
    }
  }

  return bookings
}

// Generate payments based on bookings
export const generatePayments = (bookings: Booking[]): Payment[] => {
  return bookings
    .filter((booking) => booking.paymentStatus !== "unpaid")
    .map((booking) => {
      const treatment = treatments.find((t) => t.id === booking.treatmentId)!
      const amount = booking.paymentStatus === "deposit" ? treatment.price * 0.3 : treatment.price

      return {
        id: `payment_${booking.id}`,
        bookingId: booking.id,
        method: ["cash", "qris", "card", "va"][Math.floor(Math.random() * 4)] as Payment["method"],
        amount,
        status: Math.random() > 0.05 ? "success" : ("pending" as Payment["status"]),
        paidAt: booking.status === "completed" ? booking.endAt : undefined,
        createdAt: booking.createdAt,
      }
    })
}

// Generate recent activities
export const generateActivities = (bookings: Booking[]): Activity[] => {
  const activities: Activity[] = []
  const recentBookings = bookings
    .filter((b) => new Date(b.createdAt) > subDays(new Date(), 7))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)

  recentBookings.forEach((booking, index) => {
    const patient = patients.find((p) => p.id === booking.patientId)!
    const treatment = treatments.find((t) => t.id === booking.treatmentId)!

    activities.push({
      id: `activity_${booking.id}`,
      type: booking.status === "completed" ? "booking_completed" : "booking_created",
      description:
        booking.status === "completed"
          ? `${patient.name} completed ${treatment.name}`
          : `New booking: ${patient.name} - ${treatment.name}`,
      relatedId: booking.id,
      createdAt: booking.createdAt,
    })
  })

  return activities
}

// Initialize all seed data
export const initializeSeedData = () => {
  const bookings = generateBookings()
  const payments = generatePayments(bookings)
  const activities = generateActivities(bookings)

  return {
    patients,
    staff,
    treatments,
    bookings,
    payments,
    activities,
  }
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Patient, Staff, Treatment, Booking, Activity } from "./types"
import { initializeSeedData } from "./seedData"

interface AppContextType {
  // Data
  patients: Patient[]
  staff: Staff[]
  treatments: Treatment[]
  bookings: Booking[]
  activities: Activity[]

  // Loading states
  loading: boolean

  // Actions
  addPatient: (patient: Omit<Patient, "id">) => void
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void

  addStaff: (staff: Omit<Staff, "id">) => void
  updateStaff: (id: string, updates: Partial<Staff>) => void
  deleteStaff: (id: string) => void

  addBooking: (booking: Omit<Booking, "id">) => void
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void

  addTreatment: (treatment: Omit<Treatment, "id">) => void
  updateTreatment: (id: string, updates: Partial<Treatment>) => void
  deleteTreatment: (id: string) => void

  addActivity: (activity: Omit<Activity, "id">) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const seedData = initializeSeedData()
      setPatients(seedData.patients)
      setStaff(seedData.staff)
      setTreatments(seedData.treatments)
      setBookings(seedData.bookings)
      setActivities(seedData.activities)
      setLoading(false)
    }

    loadData()
  }, []) // Empty dependency array to run only once

  // Patient actions
  const addPatient = (patientData: Omit<Patient, "id">) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
    }
    setPatients((prev) => [...prev, newPatient])
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }

  // Staff actions
  const addStaff = (staffData: Omit<Staff, "id">) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`,
    }
    setStaff((prev) => [...prev, newStaff])

    addActivity({
      type: "staff_added",
      description: `New staff member ${staffData.name} added as ${staffData.role}`,
      timestamp: new Date().toISOString(),
    })
  }

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const deleteStaff = (id: string) => {
    const staffMember = staff.find((s) => s.id === id)
    setStaff((prev) => prev.filter((s) => s.id !== id))

    if (staffMember) {
      addActivity({
        type: "staff_removed",
        description: `Staff member ${staffMember.name} removed from team`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  // Booking actions
  const addBooking = (bookingData: Omit<Booking, "id">) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Date.now().toString(),
    }
    setBookings((prev) => [...prev, newBooking])

    // Add activity
    addActivity({
      type: "booking_created",
      description: `New booking created for ${bookingData.patientName}`,
      timestamp: new Date().toISOString(),
      patientId: bookingData.patientId,
    })
  }

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))

    // Add activity for status changes
    if (updates.status) {
      const booking = bookings.find((b) => b.id === id)
      if (booking) {
        addActivity({
          type: "booking_updated",
          description: `Booking ${updates.status} for ${booking.patientName}`,
          timestamp: new Date().toISOString(),
          patientId: booking.patientId,
        })
      }
    }
  }

  const deleteBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id)
    setBookings((prev) => prev.filter((b) => b.id !== id))

    if (booking) {
      addActivity({
        type: "booking_cancelled",
        description: `Booking cancelled for ${booking.patientName}`,
        timestamp: new Date().toISOString(),
        patientId: booking.patientId,
      })
    }
  }

  // Treatment actions
  const addTreatment = (treatmentData: Omit<Treatment, "id">) => {
    const newTreatment: Treatment = {
      ...treatmentData,
      id: Date.now().toString(),
    }
    setTreatments((prev) => [...prev, newTreatment])
  }

  const updateTreatment = (id: string, updates: Partial<Treatment>) => {
    setTreatments((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }

  const deleteTreatment = (id: string) => {
    setTreatments((prev) => prev.filter((t) => t.id !== id))
  }

  // Activity actions
  const addActivity = (activityData: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const value: AppContextType = {
    patients,
    staff,
    treatments,
    bookings,
    activities,
    loading,
    addPatient,
    updatePatient,
    deletePatient,
    addStaff,
    updateStaff,
    deleteStaff,
    addBooking,
    updateBooking,
    deleteBooking,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    addActivity,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}

export const useAppContext = useApp

// Individual hooks for specific data
export const usePatients = () => {
  const { patients, loading, addPatient, updatePatient, deletePatient } = useApp()
  return { patients, loading, addPatient, updatePatient, deletePatient }
}

export const useStaff = () => {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useApp()
  return { staff, loading, addStaff, updateStaff, deleteStaff }
}

export const useTreatments = () => {
  const { treatments, loading, addTreatment, updateTreatment, deleteTreatment } = useApp()
  return { treatments, loading, addTreatment, updateTreatment, deleteTreatment }
}

export const useBookings = () => {
  const { bookings, loading, addBooking, updateBooking, deleteBooking } = useApp()
  return { bookings, loading, addBooking, updateBooking, deleteBooking }
}

export const useActivities = () => {
  const { activities, loading } = useApp()
  return { activities, loading }
}

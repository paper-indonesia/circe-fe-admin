"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Patient, Staff, Treatment, Booking, Activity } from "./types"
import { apiClient } from "./api-client"

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
  addPatient: (patient: Omit<Patient, "id">) => Promise<Patient | void>
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void

  addStaff: (staff: Omit<Staff, "id">) => Promise<void>
  updateStaff: (id: string, updates: Partial<Staff>) => void
  deleteStaff: (id: string) => void

  addBooking: (booking: Omit<Booking, "id">) => Promise<void>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>
  deleteBooking: (id: string) => Promise<void>

  addTreatment: (treatment: Omit<Treatment, "id">) => Promise<void>
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
    const loadData = async () => {
      try {
        // Fetch all data from API
        const [mongoPatients, mongoStaff, mongoTreatments, mongoBookings] = await Promise.all([
          apiClient.getPatients(),
          apiClient.getStaff(),
          apiClient.getTreatments(),
          apiClient.getBookings(),
        ])

        // Map MongoDB data to frontend format
        const patients = mongoPatients.map((p: any) => ({
          id: p._id || p.id,
          name: p.name,
          phone: p.phone,
          email: p.email || '',
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : undefined,
          notes: p.notes || '',
          lastVisit: p.lastVisitAt ? new Date(p.lastVisitAt) : new Date(),
          totalVisits: p.totalVisits || 0,
          createdAt: new Date(p.createdAt),
        }))

        const staff = mongoStaff.map((s: any) => ({
          id: s._id || s.id,
          name: s.name,
          role: s.role || 'Staff',
          email: s.email || '',
          phone: s.phone || '',
          skills: s.skills || [],
          hourlyRate: 50000,
          avatar: s.avatar || '',
          isActive: s.isActive !== false,
          workingHours: s.workingHours || [],
          rating: s.rating || 0,
          balance: s.balance || 0,
          totalEarnings: s.totalEarnings || 0,
          capacity: s.capacity || 1,
        }))

        const treatments = mongoTreatments.map((t: any) => ({
          id: t._id || t.id,
          name: t.name,
          category: t.category || 'Beauty',
          duration: t.durationMin || 60,
          price: t.price || 0,
          description: t.description || '',
          popularity: t.popularity || 0,
          assignedStaff: t.assignedStaff || [],
          isActive: t.isActive !== false,
        }))

        const bookings = mongoBookings.map((b: any) => ({
          id: b._id || b.id,
          patientId: b.patientId,
          patientName: b.patientName || patients.find(p => p.id === b.patientId)?.name || 'Unknown',
          staffId: b.staffId,
          treatmentId: b.treatmentId,
          startAt: b.startAt,
          endAt: b.endAt,
          status: b.status || 'confirmed',
          source: b.source || 'online',
          paymentStatus: b.paymentStatus || 'unpaid',
          notes: b.notes || '',
          queueNumber: b.queueNumber,
          createdAt: new Date(b.createdAt || Date.now()),
        }))

        setPatients(patients)
        setStaff(staff)
        setTreatments(treatments)
        setBookings(bookings)

      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const addPatient = async (patient: Omit<Patient, "id">) => {
    try {
      const newPatient = await apiClient.createPatient({
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        notes: patient.notes,
      })

      const mappedPatient: Patient = {
        id: newPatient._id || newPatient.id,
        name: newPatient.name,
        phone: newPatient.phone,
        email: newPatient.email || '',
        dateOfBirth: newPatient.dateOfBirth ? new Date(newPatient.dateOfBirth) : undefined,
        notes: newPatient.notes || '',
        lastVisit: new Date(),
        totalVisits: 0,
        createdAt: new Date(),
      }

      setPatients(prev => [...prev, mappedPatient])
      return mappedPatient

    } catch (error) {
      console.error('Failed to add patient:', error)
      throw error
    }
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  const addStaff = async (staff: Omit<Staff, "id">) => {
    try {
      const newStaff = await apiClient.createStaff({
        name: staff.name,
        role: staff.role,
        email: staff.email,
        skills: staff.skills,
        workingHours: staff.workingHours,
        capacity: staff.capacity,
      })

      const mappedStaff: Staff = {
        id: newStaff._id || newStaff.id,
        name: newStaff.name,
        role: newStaff.role || 'Staff',
        email: newStaff.email || '',
        phone: '',
        skills: newStaff.skills || [],
        hourlyRate: 50000,
        avatar: '',
        isActive: true,
        workingHours: newStaff.workingHours || [],
        rating: 0,
        balance: 0,
        totalEarnings: 0,
        capacity: newStaff.capacity || 1,
      }

      setStaff(prev => [...prev, mappedStaff])

    } catch (error) {
      console.error('Failed to add staff:', error)
    }
  }

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id))
  }

  const addBooking = async (booking: Omit<Booking, "id">) => {
    try {
      const newBooking = await apiClient.createBooking({
        patientId: booking.patientId,
        staffId: booking.staffId,
        treatmentId: booking.treatmentId,
        startAt: booking.startAt,
        endAt: booking.endAt,
        source: booking.source,
        notes: booking.notes,
        paymentStatus: booking.paymentStatus,
      })

      const mappedBooking: Booking = {
        id: newBooking._id || newBooking.id,
        patientId: newBooking.patientId,
        patientName: patients.find(p => p.id === newBooking.patientId)?.name || 'Unknown',
        staffId: newBooking.staffId,
        treatmentId: newBooking.treatmentId,
        startAt: newBooking.startAt,
        endAt: newBooking.endAt,
        status: 'confirmed',
        source: newBooking.source || 'online',
        paymentStatus: newBooking.paymentStatus || 'unpaid',
        notes: newBooking.notes || '',
        queueNumber: newBooking.queueNumber,
        createdAt: new Date(),
      }

      setBookings(prev => [...prev, mappedBooking])

    } catch (error) {
      console.error('Failed to add booking:', error)
      throw error
    }
  }

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      await apiClient.updateBooking(id, updates)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
    } catch (error) {
      console.error('Failed to update booking:', error)
    }
  }

  const deleteBooking = async (id: string) => {
    try {
      await apiClient.deleteBooking(id)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error('Failed to delete booking:', error)
    }
  }

  const addTreatment = async (treatment: Omit<Treatment, "id">) => {
    try {
      const newTreatment = await apiClient.createTreatment({
        name: treatment.name,
        category: treatment.category,
        durationMin: treatment.durationMin,
        price: treatment.price,
        description: treatment.description,
        assignedStaff: treatment.assignedStaff,
      })

      const mappedTreatment: Treatment = {
        id: newTreatment._id || newTreatment.id,
        name: newTreatment.name,
        category: newTreatment.category || 'Beauty',
        duration: newTreatment.durationMin || 60,
        price: newTreatment.price || 0,
        description: newTreatment.description || '',
        popularity: 0,
        assignedStaff: newTreatment.assignedStaff || [],
        isActive: true,
      }

      setTreatments(prev => [...prev, mappedTreatment])

    } catch (error) {
      console.error('Failed to add treatment:', error)
      // Re-throw error so the caller can handle it
      throw error
    }
  }

  const updateTreatment = (id: string, updates: Partial<Treatment>) => {
    setTreatments(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTreatment = (id: string) => {
    setTreatments(prev => prev.filter(t => t.id !== id))
  }

  const addActivity = (activity: Omit<Activity, "id">) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      ...activity,
      timestamp: new Date(),
    }
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]) // Keep last 50
  }

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function usePatients() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('usePatients must be used within an AppProvider')
  }
  return {
    patients: context.patients,
    loading: context.loading,
    addPatient: context.addPatient,
    updatePatient: context.updatePatient,
    deletePatient: context.deletePatient,
  }
}

export function useStaff() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useStaff must be used within an AppProvider')
  }
  return {
    staff: context.staff,
    loading: context.loading,
    addStaff: context.addStaff,
    updateStaff: context.updateStaff,
    deleteStaff: context.deleteStaff,
  }
}

export function useTreatments() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useTreatments must be used within an AppProvider')
  }
  return {
    treatments: context.treatments,
    loading: context.loading,
    addTreatment: context.addTreatment,
    updateTreatment: context.updateTreatment,
    deleteTreatment: context.deleteTreatment,
  }
}

export function useBookings() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useBookings must be used within an AppProvider')
  }
  return {
    bookings: context.bookings,
    loading: context.loading,
    addBooking: context.addBooking,
    updateBooking: context.updateBooking,
    deleteBooking: context.deleteBooking,
  }
}

export function useActivities() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useActivities must be used within an AppProvider')
  }
  return {
    activities: context.activities,
    addActivity: context.addActivity,
  }
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Patient, Staff, Treatment, Booking, Activity } from "./types"
import { apiClient } from "./api-client"
import { usePathname } from "next/navigation"

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
  addPatient: (patient: Omit<Patient, "id">) => Promise<void>
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void

  addStaff: (staff: Omit<Staff, "id">) => Promise<void>
  updateStaff: (id: string, updates: Partial<Staff>) => void
  deleteStaff: (id: string) => void

  addBooking: (booking: Omit<Booking, "id">) => Promise<void>
  updateBooking: (id: string, updates: Partial<Booking>) => void
  deleteBooking: (id: string) => void

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
  const pathname = usePathname()

  useEffect(() => {
    const loadData = async () => {
      // Get tenant from pathname
      const segments = pathname.split('/').filter(Boolean)
      const tenantSlug = segments[0] || 'default'
      
      // Map tenant slugs to IDs
      const tenantIdMap: Record<string, string> = {
        'jakarta': 'beauty-clinic-jakarta',
        'bali': 'beauty-clinic-bali',
        'surabaya': 'skin-care-surabaya',
        'default': 'beauty-clinic-jakarta' // Use Jakarta as default
      }
      
      const tenantId = tenantIdMap[tenantSlug] || 'beauty-clinic-jakarta'
      
      // Set API client tenant
      apiClient.setTenant(tenantId)
      
      try {
        // Fetch all data from MongoDB
        const [mongoPatients, mongoStaff, mongoTreatments, mongoBookings] = await Promise.all([
          apiClient.getPatients(),
          apiClient.getStaff(),
          apiClient.getTreatments(),
          apiClient.getBookings(),
        ])
        
        // Map MongoDB data to frontend format
        const patients = mongoPatients.map((p: any) => ({
          id: p._id,
          tenantId: p.tenantId,
          name: p.name,
          phone: p.phone,
          email: p.email || '',
          notes: p.notes || '',
          totalVisits: p.totalVisits || 0,
          createdAt: p.createdAt,
        }))
        
        const staff = mongoStaff.map((s: any) => ({
          id: s._id,
          tenantId: s.tenantId,
          name: s.name,
          role: s.role,
          skills: s.skills || [],
          workingHours: s.workingHours || [],
          rating: s.rating || 0,
          avatar: s.avatar || '',
        }))
        
        const treatments = mongoTreatments.map((t: any) => ({
          id: t._id,
          tenantId: t.tenantId,
          name: t.name,
          category: t.category,
          duration: t.durationMin,
          price: t.price,
          description: t.description || '',
          popularity: t.popularity || 0,
          assignedStaff: t.assignedStaff || [],
        }))
        
        const bookings = mongoBookings.map((b: any) => ({
          id: b._id,
          tenantId: b.tenantId,
          patientId: b.patientId,
          patientName: b.patientName || '',
          staffId: b.staffId,
          treatmentId: b.treatmentId,
          startAt: b.startAt,
          endAt: b.endAt,
          status: b.status,
          source: b.source,
          paymentStatus: b.paymentStatus,
          notes: b.notes || '',
          createdAt: b.createdAt,
        }))
        
        setPatients(patients)
        setStaff(staff)
        setTreatments(treatments)
        setBookings(bookings)
        
        // Generate activities from bookings
        const generatedActivities: Activity[] = bookings.map(booking => ({
          id: booking.id,
          type: booking.status === 'completed' ? 'completion' : booking.status === 'confirmed' ? 'confirmation' : 'booking',
          description: `${booking.status === 'completed' ? 'Completed' : booking.status === 'confirmed' ? 'Confirmed' : 'New'} booking for ${booking.clientName}`,
          user: booking.staffName || 'System',
          relatedId: booking.id,
          createdAt: booking.date || new Date().toISOString(),
        }))
        
        setActivities(generatedActivities)
        
      } catch (error) {
        console.error("Failed to load data from MongoDB:", error)
        // Set empty data on error
        setPatients([])
        setStaff([])
        setTreatments([])
        setBookings([])
        setActivities([])
      }
      
      setLoading(false)
    }

    loadData()
  }, [pathname]) // Reload when pathname changes

  // Patient actions
  const addPatient = async (patientData: Omit<Patient, "id">) => {
    const segments = pathname.split('/').filter(Boolean)
    const tenantSlug = segments[0] || 'default'
    
    const tenantIdMap: Record<string, string> = {
      'jakarta': 'beauty-clinic-jakarta',
      'bali': 'beauty-clinic-bali',
      'surabaya': 'skin-care-surabaya',
      'default': 'beauty-clinic-jakarta'
    }
    
    const tenantId = tenantIdMap[tenantSlug] || 'beauty-clinic-jakarta'
    
    // Set API client tenant
    apiClient.setTenant(tenantId)
    
    try {
      // Save to MongoDB
      const savedPatient = await apiClient.createPatient({
        name: patientData.name,
        phone: patientData.phone,
        email: patientData.email || '',
        notes: patientData.notes || '',
        totalVisits: patientData.totalVisits || 0
      })
      
      // Add to local state with MongoDB ID
      const newPatient: Patient = {
        ...patientData,
        id: savedPatient._id,
        tenantId,
      }
      setPatients((prev) => [...prev, newPatient])
    } catch (error) {
      console.error('Failed to add patient to MongoDB:', error)
      // Fallback: add to local state only
      const newPatient: Patient = {
        ...patientData,
        id: Date.now().toString(),
        tenantId,
      }
      setPatients((prev) => [...prev, newPatient])
    }
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deletePatient = (id: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }

  // Staff actions
  const addStaff = async (staffData: Omit<Staff, "id">) => {
    const segments = pathname.split('/').filter(Boolean)
    const tenantSlug = segments[0] || 'default'
    
    const tenantIdMap: Record<string, string> = {
      'jakarta': 'beauty-clinic-jakarta',
      'bali': 'beauty-clinic-bali',
      'surabaya': 'skin-care-surabaya',
      'default': 'beauty-clinic-jakarta'
    }
    
    const tenantId = tenantIdMap[tenantSlug] || 'beauty-clinic-jakarta'
    
    // Set API client tenant
    apiClient.setTenant(tenantId)
    
    try {
      // Save to MongoDB
      const savedStaff = await apiClient.createStaff({
        name: staffData.name,
        role: staffData.role,
        skills: staffData.skills || [],
        workingHours: staffData.workingHours || [],
        rating: staffData.rating || 0,
        avatar: staffData.avatar || '',
        isActive: true
      })
      
      // Add to local state with MongoDB ID
      const newStaff: Staff = {
        ...staffData,
        id: savedStaff._id,
        tenantId,
      }
      setStaff((prev) => [...prev, newStaff])
      
      addActivity({
        type: "staff_added",
        description: `New staff member ${staffData.name} added as ${staffData.role}`,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to add staff to MongoDB:', error)
      // Fallback: add to local state only
      const newStaff: Staff = {
        ...staffData,
        id: `staff-${Date.now()}`,
        tenantId,
      }
      setStaff((prev) => [...prev, newStaff])
    }
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
  const addBooking = async (bookingData: Omit<Booking, "id">) => {
    const segments = pathname.split('/').filter(Boolean)
    const tenantSlug = segments[0] || 'default'
    
    const tenantIdMap: Record<string, string> = {
      'jakarta': 'beauty-clinic-jakarta',
      'bali': 'beauty-clinic-bali',
      'surabaya': 'skin-care-surabaya',
      'default': 'beauty-clinic-jakarta'
    }
    
    const tenantId = tenantIdMap[tenantSlug] || 'beauty-clinic-jakarta'
    
    // Set API client tenant
    apiClient.setTenant(tenantId)
    
    try {
      // Save to MongoDB
      const savedBooking = await apiClient.createBooking({
        patientId: bookingData.patientId,
        patientName: bookingData.patientName || '',
        staffId: bookingData.staffId,
        treatmentId: bookingData.treatmentId,
        startAt: bookingData.startAt,
        endAt: bookingData.endAt,
        status: bookingData.status,
        source: bookingData.source || 'online',
        paymentStatus: bookingData.paymentStatus || 'unpaid',
        notes: bookingData.notes || ''
      })
      
      // Add to local state with MongoDB ID
      const newBooking: Booking = {
        ...bookingData,
        id: savedBooking._id,
        tenantId,
      }
      setBookings((prev) => [...prev, newBooking])
      
      // Add activity
      addActivity({
        type: "booking_created",
        description: `New booking created for ${bookingData.patientName}`,
        timestamp: new Date().toISOString(),
        patientId: bookingData.patientId,
      })
    } catch (error) {
      console.error('Failed to add booking to MongoDB:', error)
      // Fallback: add to local state only
      const newBooking: Booking = {
        ...bookingData,
        id: Date.now().toString(),
        tenantId,
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
  const addTreatment = async (treatmentData: Omit<Treatment, "id">) => {
    const segments = pathname.split('/').filter(Boolean)
    const tenantSlug = segments[0] || 'default'
    
    const tenantIdMap: Record<string, string> = {
      'jakarta': 'beauty-clinic-jakarta',
      'bali': 'beauty-clinic-bali',
      'surabaya': 'skin-care-surabaya',
      'default': 'beauty-clinic-jakarta'
    }
    
    const tenantId = tenantIdMap[tenantSlug] || 'beauty-clinic-jakarta'
    
    // Set API client tenant
    apiClient.setTenant(tenantId)
    
    try {
      // Save to MongoDB
      const savedTreatment = await apiClient.createTreatment({
        name: treatmentData.name,
        category: treatmentData.category,
        durationMin: treatmentData.duration,
        price: treatmentData.price,
        description: treatmentData.description || '',
        popularity: treatmentData.popularity || 0,
        assignedStaff: treatmentData.assignedStaff || [],
        isActive: true
      })
      
      // Add to local state with MongoDB ID
      const newTreatment: Treatment = {
        ...treatmentData,
        id: savedTreatment._id,
        tenantId,
      }
      setTreatments((prev) => [...prev, newTreatment])
    } catch (error) {
      console.error('Failed to add treatment to MongoDB:', error)
      // Fallback: add to local state only
      const newTreatment: Treatment = {
        ...treatmentData,
        id: Date.now().toString(),
        tenantId,
      }
      setTreatments((prev) => [...prev, newTreatment])
    }
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

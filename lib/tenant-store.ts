import { create } from "zustand"
import type { Patient, Staff, Treatment, Booking, Payment, Activity } from "./types"
import { apiClient } from "./api-client"

interface TenantAppState {
  currentTenantId: string | null
  
  patients: Patient[]
  staff: Staff[]
  treatments: Treatment[]
  bookings: Booking[]
  payments: Payment[]
  activities: Activity[]

  loading: boolean

  selectedDate: string
  selectedStaff: string | null
  selectedPatient: string | null
  sidebarCollapsed: boolean

  setCurrentTenant: (tenantId: string) => void
  loadData: (tenantId: string) => Promise<void>
  createPatient: (tenantId: string, data: Omit<Patient, "id" | "createdAt" | "totalVisits" | "tenantId">) => Promise<Patient>
  updatePatient: (tenantId: string, id: string, data: Partial<Patient>) => Promise<Patient | null>
  deletePatient: (tenantId: string, id: string) => Promise<boolean>
  createTreatment: (tenantId: string, data: Omit<Treatment, "id" | "tenantId">) => Promise<Treatment>
  updateTreatment: (tenantId: string, id: string, data: Partial<Treatment>) => Promise<Treatment | null>
  deleteTreatment: (tenantId: string, id: string) => Promise<boolean>
  createBooking: (tenantId: string, data: Omit<Booking, "id" | "createdAt" | "tenantId">) => Promise<Booking>
  updateBooking: (tenantId: string, id: string, data: Partial<Booking>) => Promise<Booking | null>
  deleteBooking: (tenantId: string, id: string) => Promise<boolean>
  checkInBooking: (tenantId: string, id: string) => Promise<Booking | null>
  completeBooking: (tenantId: string, id: string) => Promise<Booking | null>
  cancelBooking: (tenantId: string, id: string) => Promise<Booking | null>
  markNoShow: (tenantId: string, id: string) => Promise<Booking | null>
  createPayment: (tenantId: string, data: Omit<Payment, "id" | "createdAt" | "tenantId">) => Promise<Payment>
  setSelectedDate: (date: string) => void
  setSelectedStaff: (staffId: string | null) => void
  setSelectedPatient: (patientId: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  resetData: () => void
}

const filterByTenant = <T extends { tenantId: string }>(items: T[], tenantId: string): T[] => {
  return items.filter(item => item.tenantId === tenantId)
}

export const useTenantStore = create<TenantAppState>((set, get) => ({
  currentTenantId: null,
  
  patients: [],
  staff: [],
  treatments: [],
  bookings: [],
  payments: [],
  activities: [],

  loading: false,

  selectedDate: new Date().toISOString().split("T")[0],
  selectedStaff: null,
  selectedPatient: null,
  sidebarCollapsed: false,

  setCurrentTenant: (tenantId) => {
    set({ currentTenantId: tenantId })
  },

  loadData: async (tenantId) => {
    set({ loading: true, currentTenantId: tenantId })
    try {
      // Set tenant for API client
      apiClient.setTenant(tenantId)
      
      // Only fetch from MongoDB - no fallback
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
        lastVisit: p.lastVisitAt ? new Date(p.lastVisitAt).toISOString() : '',
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
        isActive: s.isActive,
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
        queueNumber: b.queueNumber,
        createdAt: b.createdAt,
      }))
      
      // Empty arrays for payments and activities (not in MongoDB yet)
      const payments: Payment[] = []
      const activities: Activity[] = []

      set({
        patients,
        staff,
        treatments,
        bookings,
        payments,
        activities,
        loading: false,
      })
    } catch (error) {
      console.error("Failed to load data from MongoDB:", error)
      set({ 
        patients: [],
        staff: [],
        treatments: [],
        bookings: [],
        payments: [],
        activities: [],
        loading: false 
      })
    }
  },

  createPatient: async (tenantId, data) => {
    apiClient.setTenant(tenantId)
    const newPatient = await apiClient.createPatient({ ...data })
    const patientWithTenant = { 
      id: newPatient._id,
      ...newPatient, 
      tenantId 
    }
    set((state) => ({
      patients: [...state.patients, patientWithTenant],
    }))
    return patientWithTenant
  },

  updatePatient: async (tenantId, id, data) => {
    // TODO: Implement MongoDB update
    const updatedPatient = null
    if (updatedPatient) {
      const patientWithTenant = { ...updatedPatient, tenantId }
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id && p.tenantId === tenantId ? patientWithTenant : p)),
      }))
      return patientWithTenant
    }
    return null
  },

  deletePatient: async (tenantId, id) => {
    // TODO: Implement MongoDB delete
    const success = false
    if (success) {
      set((state) => ({
        patients: state.patients.filter((p) => !(p.id === id && p.tenantId === tenantId)),
      }))
    }
    return success
  },

  createTreatment: async (tenantId, data) => {
    apiClient.setTenant(tenantId)
    const newTreatment = await apiClient.createTreatment({ ...data })
    const treatmentWithTenant = { ...newTreatment, tenantId }
    set((state) => ({
      treatments: [...state.treatments, treatmentWithTenant],
    }))
    return treatmentWithTenant
  },

  updateTreatment: async (tenantId, id, data) => {
    // TODO: Implement MongoDB update
    const updatedTreatment = null
    if (updatedTreatment) {
      const treatmentWithTenant = { ...updatedTreatment, tenantId }
      set((state) => ({
        treatments: state.treatments.map((t) => (t.id === id && t.tenantId === tenantId ? treatmentWithTenant : t)),
      }))
      return treatmentWithTenant
    }
    return null
  },

  deleteTreatment: async (tenantId, id) => {
    // TODO: Implement MongoDB delete
    const success = false
    if (success) {
      set((state) => ({
        treatments: state.treatments.filter((t) => !(t.id === id && t.tenantId === tenantId)),
      }))
    }
    return success
  },

  createBooking: async (tenantId, data) => {
    apiClient.setTenant(tenantId)
    const newBooking = await apiClient.createBooking({ ...data })
    const bookingWithTenant = { ...newBooking, tenantId }
    set((state) => ({
      bookings: [...state.bookings, bookingWithTenant],
    }))
    return bookingWithTenant
  },

  updateBooking: async (tenantId, id, data) => {
    // TODO: Implement MongoDB update
    const updatedBooking = null
    if (updatedBooking) {
      const bookingWithTenant = { ...updatedBooking, tenantId }
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id && b.tenantId === tenantId ? bookingWithTenant : b)),
      }))
      return bookingWithTenant
    }
    return null
  },

  deleteBooking: async (tenantId, id) => {
    // TODO: Implement MongoDB delete
    const success = false
    if (success) {
      set((state) => ({
        bookings: state.bookings.filter((b) => !(b.id === id && b.tenantId === tenantId)),
      }))
    }
    return success
  },

  checkInBooking: async (tenantId, id) => {
    const booking = get().bookings.find((b) => b.id === id && b.tenantId === tenantId)
    if (booking) {
      const updated = { ...booking, status: "confirmed" as const }
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id && b.tenantId === tenantId ? updated : b)),
      }))
      return updated
    }
    return null
  },

  completeBooking: async (tenantId, id) => {
    const booking = get().bookings.find((b) => b.id === id && b.tenantId === tenantId)
    if (booking) {
      const updated = { ...booking, status: "completed" as const }
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id && b.tenantId === tenantId ? updated : b)),
      }))
      return updated
    }
    return null
  },

  cancelBooking: async (tenantId, id) => {
    const booking = get().bookings.find((b) => b.id === id && b.tenantId === tenantId)
    if (booking) {
      const updated = { ...booking, status: "cancelled" as const }
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id && b.tenantId === tenantId ? updated : b)),
      }))
      return updated
    }
    return null
  },

  markNoShow: async (tenantId, id) => {
    const booking = get().bookings.find((b) => b.id === id && b.tenantId === tenantId)
    if (booking) {
      const updated = { ...booking, status: "no-show" as const }
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id && b.tenantId === tenantId ? updated : b)),
      }))
      return updated
    }
    return null
  },

  createPayment: async (tenantId, data) => {
    // TODO: Implement MongoDB payment collection
    const newPayment = { ...data, id: Date.now().toString(), tenantId }
    const paymentWithTenant = { ...newPayment, tenantId }
    set((state) => ({
      payments: [...state.payments, paymentWithTenant],
    }))
    return paymentWithTenant
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedStaff: (staffId) => set({ selectedStaff: staffId }),
  setSelectedPatient: (patientId) => set({ selectedPatient: patientId }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  resetData: () =>
    set({
      patients: [],
      staff: [],
      treatments: [],
      bookings: [],
      payments: [],
      activities: [],
      loading: false,
      selectedDate: new Date().toISOString().split("T")[0],
      selectedStaff: null,
      selectedPatient: null,
    }),
}))

export const getTenantData = <T extends { tenantId: string }>(items: T[], tenantId: string): T[] => {
  return filterByTenant(items, tenantId)
}
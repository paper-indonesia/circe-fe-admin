import { create } from "zustand"
import type { Patient, Staff, Treatment, Booking, Payment, Activity } from "./types"
import * as api from "./mockApi"

interface AppState {
  // Data
  patients: Patient[]
  staff: Staff[]
  treatments: Treatment[]
  bookings: Booking[]
  payments: Payment[]
  activities: Activity[]

  loading: boolean

  // UI state
  selectedDate: string
  selectedStaff: string | null
  selectedPatient: string | null
  sidebarCollapsed: boolean

  // Actions
  loadData: () => Promise<void>
  createPatient: (data: Omit<Patient, "id" | "createdAt" | "totalVisits">) => Promise<Patient>
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient | null>
  deletePatient: (id: string) => Promise<boolean>
  createTreatment: (data: Omit<Treatment, "id">) => Promise<Treatment>
  updateTreatment: (id: string, data: Partial<Treatment>) => Promise<Treatment | null>
  deleteTreatment: (id: string) => Promise<boolean>
  createBooking: (data: Omit<Booking, "id" | "createdAt">) => Promise<Booking>
  updateBooking: (id: string, data: Partial<Booking>) => Promise<Booking | null>
  deleteBooking: (id: string) => Promise<boolean>
  checkInBooking: (id: string) => Promise<Booking | null>
  completeBooking: (id: string) => Promise<Booking | null>
  cancelBooking: (id: string) => Promise<Booking | null>
  markNoShow: (id: string) => Promise<Booking | null>
  createPayment: (data: Omit<Payment, "id" | "createdAt">) => Promise<Payment>
  setSelectedDate: (date: string) => void
  setSelectedStaff: (staffId: string | null) => void
  setSelectedPatient: (patientId: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  resetData: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
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

  loadData: async () => {
    set({ loading: true })
    try {
      const [patients, staff, treatments, bookings, payments, activities] = await Promise.all([
        api.getPatients(),
        api.getStaff(),
        api.getTreatments(),
        api.getBookings(),
        api.getPayments(),
        api.getActivities(20),
      ])
      set({ patients, staff, treatments, bookings, payments, activities })
    } finally {
      set({ loading: false })
    }
  },

  createPatient: async (data) => {
    const patient = await api.createPatient(data)
    set((state) => ({ patients: [patient, ...state.patients] }))
    return patient
  },

  updatePatient: async (id, data) => {
    const patient = await api.updatePatient(id, data)
    if (patient) {
      set((state) => ({
        patients: state.patients.map((p) => (p.id === id ? patient : p)),
      }))
    }
    return patient
  },

  deletePatient: async (id) => {
    const success = await api.deletePatient(id)
    if (success) {
      set((state) => ({
        patients: state.patients.filter((p) => p.id !== id),
        bookings: state.bookings.filter((b) => b.patientId !== id),
      }))
    }
    return success
  },

  createTreatment: async (data) => {
    const treatment = await api.createTreatment(data)
    set((state) => ({ treatments: [treatment, ...state.treatments] }))
    return treatment
  },

  updateTreatment: async (id, data) => {
    const treatment = await api.updateTreatment(id, data)
    if (treatment) {
      set((state) => ({
        treatments: state.treatments.map((t) => (t.id === id ? treatment : t)),
      }))
    }
    return treatment
  },

  deleteTreatment: async (id) => {
    const success = await api.deleteTreatment(id)
    if (success) {
      set((state) => ({
        treatments: state.treatments.filter((t) => t.id !== id),
      }))
    }
    return success
  },

  createBooking: async (data) => {
    const booking = await api.createBooking(data)
    set((state) => ({
      bookings: [booking, ...state.bookings],
      activities: [
        {
          id: `activity_${Date.now()}`,
          type: "booking_created" as const,
          description: `New booking created`,
          relatedId: booking.id,
          createdAt: new Date().toISOString(),
        },
        ...state.activities,
      ],
    }))
    return booking
  },

  updateBooking: async (id, data) => {
    const booking = await api.updateBooking(id, data)
    if (booking) {
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
      }))
    }
    return booking
  },

  deleteBooking: async (id) => {
    const success = await api.deleteBooking(id)
    if (success) {
      set((state) => ({
        bookings: state.bookings.filter((b) => b.id !== id),
        payments: state.payments.filter((p) => p.bookingId !== id),
      }))
    }
    return success
  },

  checkInBooking: async (id) => {
    const booking = await api.checkInBooking(id)
    if (booking) {
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
      }))
    }
    return booking
  },

  completeBooking: async (id) => {
    const booking = await api.completeBooking(id)
    if (booking) {
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
        activities: [
          {
            id: `activity_${Date.now()}`,
            type: "booking_completed" as const,
            description: `Booking completed`,
            relatedId: booking.id,
            createdAt: new Date().toISOString(),
          },
          ...state.activities,
        ],
      }))
    }
    return booking
  },

  cancelBooking: async (id) => {
    const booking = await api.cancelBooking(id)
    if (booking) {
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
      }))
    }
    return booking
  },

  markNoShow: async (id) => {
    const booking = await api.markNoShow(id)
    if (booking) {
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? booking : b)),
      }))
    }
    return booking
  },

  createPayment: async (data) => {
    const payment = await api.createPayment(data)
    set((state) => ({
      payments: [payment, ...state.payments],
      activities:
        payment.status === "success"
          ? [
              {
                id: `activity_${Date.now()}`,
                type: "payment_received" as const,
                description: `Payment received: Rp ${payment.amount.toLocaleString()}`,
                relatedId: payment.bookingId,
                createdAt: new Date().toISOString(),
              },
              ...state.activities,
            ]
          : state.activities,
    }))
    return payment
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedStaff: (staffId) => set({ selectedStaff: staffId }),
  setSelectedPatient: (patientId) => set({ selectedPatient: patientId }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  resetData: () => {
    api.resetData()
    set({
      patients: [],
      staff: [],
      treatments: [],
      bookings: [],
      payments: [],
      activities: [],
    })
  },
}))

// Simple selectors
export const usePatients = () => useAppStore((state) => state.patients)
export const useStaff = () => useAppStore((state) => state.staff)
export const useTreatments = () => useAppStore((state) => state.treatments)
export const useBookings = () => useAppStore((state) => state.bookings)
export const usePayments = () => useAppStore((state) => state.payments)
export const useActivities = () => useAppStore((state) => state.activities)
export const useLoading = () => useAppStore((state) => state.loading)

// Action selectors
export const useLoadData = () => useAppStore((state) => state.loadData)
export const usePatientActions = () =>
  useAppStore((state) => ({
    createPatient: state.createPatient,
    updatePatient: state.updatePatient,
    deletePatient: state.deletePatient,
  }))
export const useTreatmentActions = () =>
  useAppStore((state) => ({
    createTreatment: state.createTreatment,
    updateTreatment: state.updateTreatment,
    deleteTreatment: state.deleteTreatment,
  }))
export const useBookingActions = () =>
  useAppStore((state) => ({
    createBooking: state.createBooking,
    updateBooking: state.updateBooking,
    deleteBooking: state.deleteBooking,
    checkInBooking: state.checkInBooking,
    completeBooking: state.completeBooking,
    cancelBooking: state.cancelBooking,
    markNoShow: state.markNoShow,
  }))
export const usePaymentActions = () =>
  useAppStore((state) => ({
    createPayment: state.createPayment,
  }))

// UI selectors
export const useUI = () =>
  useAppStore((state) => ({
    selectedDate: state.selectedDate,
    selectedStaff: state.selectedStaff,
    selectedPatient: state.selectedPatient,
    sidebarCollapsed: state.sidebarCollapsed,
    setSelectedDate: state.setSelectedDate,
    setSelectedStaff: state.setSelectedStaff,
    setSelectedPatient: state.setSelectedPatient,
    setSidebarCollapsed: state.setSidebarCollapsed,
  }))

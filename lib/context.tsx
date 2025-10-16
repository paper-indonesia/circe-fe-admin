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
  updateStaff: (id: string, updates: Partial<Staff>) => Promise<void>
  deleteStaff: (id: string) => Promise<void>

  addBooking: (booking: Omit<Booking, "id">) => Promise<void>
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<void>
  deleteBooking: (id: string, cancellationReason?: string) => Promise<void>
  rescheduleBooking: (id: string, data: { new_date: string; new_time: string; reason?: string }) => Promise<void>
  completeBooking: (id: string, completionNotes?: string) => Promise<void>
  markNoShowBooking: (id: string, reason?: string) => Promise<void>

  addTreatment: (treatment: Omit<Treatment, "id">) => Promise<void>
  updateTreatment: (id: string, updates: Partial<Treatment>) => Promise<void>
  deleteTreatment: (id: string) => Promise<void>

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
        console.log('[Context] Loading data from API...')

        // Fetch data with individual error handling
        const [mongoStaff, mongoTreatments, mongoBookings] = await Promise.all([
          apiClient.getStaff().catch(err => {
            console.warn('[Context] Failed to load staff:', err)
            return { items: [] }
          }),
          apiClient.getTreatments().catch(err => {
            console.warn('[Context] Failed to load treatments:', err)
            return { items: [] }
          }),
          apiClient.getAppointments({ size: 100 }).catch(err => {
            console.warn('[Context] Failed to load appointments:', err)
            return { items: [] }
          }),
        ])

        console.log('[Context] Raw API responses:', {
          staff: mongoStaff,
          treatments: mongoTreatments,
          bookings: mongoBookings
        })

        // Map MongoDB data to frontend format
        // Handle paginated response from API
        const staffArray = Array.isArray(mongoStaff)
          ? mongoStaff
          : (mongoStaff.items || [])

        const staff = staffArray.map((s: any) => ({
          id: s.id || s._id,
          tenant_id: s.tenant_id || s.tenantId,
          outlet_id: s.outlet_id || s.outletId,
          first_name: s.first_name || s.name?.split(' ')[0] || '',
          last_name: s.last_name || s.name?.split(' ').slice(1).join(' ') || '',
          display_name: s.display_name || s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          name: s.name || s.display_name || `${s.first_name || ''} ${s.last_name || ''}`.trim(),
          email: s.email || '',
          phone: s.phone || '',
          position: s.position || s.role || 'Staff',
          role: s.role || s.position || 'Staff',
          employment_type: s.employment_type || 'full_time',
          employee_id: s.employee_id,
          hire_date: s.hire_date,
          birth_date: s.birth_date,
          hourly_rate: s.hourly_rate || s.hourlyRate,
          salary: s.salary,
          is_bookable: s.is_bookable !== false,
          accepts_online_booking: s.accepts_online_booking !== false,
          max_advance_booking_days: s.max_advance_booking_days || 30,
          bio: s.bio,
          profile_image_url: s.profile_image_url || s.avatar,
          avatar: s.avatar || s.profile_image_url,
          instagram_handle: s.instagram_handle,
          is_active: s.is_active !== false && s.isActive !== false,
          isActive: s.isActive !== false && s.is_active !== false,
          status: s.status || 'active',
          skills: s.skills,
          average_rating: s.average_rating || s.rating,
          rating: s.rating || s.average_rating || 0,
          rating_count: s.rating_count || 0,
          total_bookings: s.total_bookings || 0,
          next_available_slot: s.next_available_slot,
          workingHours: s.workingHours || s.working_hours || [],
          workingSchedule: s.workingSchedule || s.working_schedule || {},
          workingDays: s.workingDays || s.working_days || [],
          capacity: s.capacity || 1,
          balance: s.balance || 0,
          totalEarnings: s.totalEarnings || s.total_earnings || 0,
          notes: s.notes || s.bio || '',
          created_at: s.created_at || s.createdAt,
          updated_at: s.updated_at || s.updatedAt,
        }))

        // Handle paginated response from API
        const treatmentsArray = Array.isArray(mongoTreatments)
          ? mongoTreatments
          : (mongoTreatments.items || [])

        const treatments = treatmentsArray.map((t: any) => ({
          id: t._id || t.id,
          name: t.name,
          slug: t.slug || '',
          category: t.category || 'Beauty',
          duration: t.durationMin || t.duration_minutes || t.duration || 60,
          durationMin: t.durationMin || t.duration_minutes || 60,
          price: parseFloat(t.price || t.pricing?.base_price || 0),
          currency: t.currency || t.pricing?.currency || 'USD',
          description: t.description || '',
          popularity: t.popularity || 0,
          assignedStaff: t.assignedStaff || t.assigned_staff || [],
          staffIds: t.staffIds || t.staff_ids || [], // Staff IDs from include_staff=true
          staffCount: t.staffCount || t.staff_count || 0,
          photo: t.photo || t.image_url || '',
          isActive: t.isActive !== false && t.is_active !== false,
          status: t.status || 'active',
          tags: t.tags || [],
        }))

        // Handle paginated response from API
        // Appointments API returns { items: [...], total, page, size, pages }
        const bookingsArray = Array.isArray(mongoBookings)
          ? mongoBookings
          : (mongoBookings.items || [])

        console.log('[Context] Bookings array:', bookingsArray)

        // Collect unique customer IDs for lookup
        const customerIds = [...new Set(bookingsArray.map((b: any) => b.customer_id).filter(Boolean))]
        console.log('[Context] Fetching customer details for', customerIds.length, 'customers')

        // Fetch customer details for all appointments
        const customerDetailsMap: Record<string, any> = {}
        if (customerIds.length > 0) {
          await Promise.all(
            customerIds.map(async (customerId) => {
              try {
                const response = await fetch(`/api/customers/${customerId}`)
                if (response.ok) {
                  const customerData = await response.json()
                  customerDetailsMap[customerId] = customerData
                }
              } catch (error) {
                console.warn(`[Context] Failed to fetch customer ${customerId}:`, error)
              }
            })
          )
        }

        console.log('[Context] Customer details loaded:', Object.keys(customerDetailsMap).length)
        console.log('[Context] Customer details map:', customerDetailsMap)

        const bookings = bookingsArray.map((b: any) => {
          // Get first service for backward compatibility
          const firstService = b.services && b.services.length > 0 ? b.services[0] : null

          // Lookup customer details
          const customer = customerDetailsMap[b.customer_id]
          const customerName = customer
            ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown'
            : b.customer_name || 'Unknown'

          console.log(`[Context] Booking ${b.id}: customer_id=${b.customer_id}, customer=`, customer)
          console.log(`[Context] Booking ${b.id}: customerName="${customerName}"`)

          return {
            id: b._id || b.id,
            patientId: b.patientId || b.customer_id,
            patientName: customerName, // Always use constructed customerName from lookup
            patientPhone: customer?.phone || b.customer_phone,
            patientEmail: customer?.email || b.customer_email,
            staffId: b.staffId || firstService?.staff_id || b.staff_id,
            treatmentId: b.treatmentId || firstService?.service_id || b.service_id,
            startAt: b.startAt || (b.appointment_date && b.start_time ? `${b.appointment_date}T${b.start_time}` : b.start_at),
            endAt: b.endAt || (b.appointment_date && b.end_time ? `${b.appointment_date}T${b.end_time}` : b.end_at),
            status: b.status || 'confirmed',
            source: b.source || b.appointment_type || 'online',
            paymentStatus: b.paymentStatus || b.payment_status || 'unpaid',
            notes: b.notes || '',
            queueNumber: b.queueNumber || b.queue_number,
            createdAt: new Date(b.createdAt || b.created_at || Date.now()),
            // New fields from appointments API
            appointment_date: b.appointment_date,
            start_time: b.start_time,
            end_time: b.end_time,
            services: b.services || [],
            total_price: b.total_price,
            fee_breakdown: b.fee_breakdown,
            // Customer details
            customer: customer || null,
          }
        })

        console.log('[Context] Parsed data:', {
          staff: staff.length,
          treatments: treatments.length,
          bookings: bookings.length
        })

        setPatients([]) // No patients endpoint yet
        setStaff(staff)
        setTreatments(treatments)
        setBookings(bookings)

        console.log('[Context] Data loaded successfully!')

      } catch (error) {
        console.error('[Context] Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const addPatient = async (patient: Omit<Patient, "id">) => {
    // TODO: Re-implement when patients endpoint is available
    console.warn('addPatient: Patients endpoint not available yet')
    return
  }

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id))
  }

  const addStaff = async (staff: Omit<Staff, "id">) => {
    try {
      const newStaff = await apiClient.createStaff(staff)

      const mappedStaff: Staff = {
        id: newStaff.id || newStaff._id,
        tenant_id: newStaff.tenant_id,
        outlet_id: newStaff.outlet_id,
        first_name: newStaff.first_name || staff.first_name,
        last_name: newStaff.last_name || staff.last_name,
        display_name: newStaff.display_name || `${newStaff.first_name} ${newStaff.last_name}`.trim(),
        name: `${newStaff.first_name || ''} ${newStaff.last_name || ''}`.trim(),
        email: newStaff.email,
        phone: newStaff.phone,
        position: newStaff.position,
        role: newStaff.position,
        employment_type: newStaff.employment_type,
        employee_id: newStaff.employee_id,
        hire_date: newStaff.hire_date,
        birth_date: newStaff.birth_date,
        hourly_rate: newStaff.hourly_rate,
        salary: newStaff.salary,
        is_bookable: newStaff.is_bookable,
        accepts_online_booking: newStaff.accepts_online_booking,
        max_advance_booking_days: newStaff.max_advance_booking_days,
        bio: newStaff.bio,
        profile_image_url: newStaff.profile_image_url,
        avatar: newStaff.profile_image_url,
        instagram_handle: newStaff.instagram_handle,
        is_active: newStaff.is_active,
        isActive: newStaff.is_active,
        status: newStaff.status,
        skills: newStaff.skills,
        average_rating: newStaff.average_rating,
        rating: newStaff.average_rating || 0,
        rating_count: newStaff.rating_count,
        total_bookings: newStaff.total_bookings,
        next_available_slot: newStaff.next_available_slot,
        created_at: newStaff.created_at,
        updated_at: newStaff.updated_at,
      }

      setStaff(prev => [...prev, mappedStaff])

    } catch (error) {
      console.error('Failed to add staff:', error)
      throw error
    }
  }

  const updateStaff = async (id: string, updates: Partial<Staff>) => {
    try {
      const updatedStaff = await apiClient.updateStaff(id, updates)

      const mappedStaff: Staff = {
        id: updatedStaff.id || updatedStaff._id,
        tenant_id: updatedStaff.tenant_id,
        outlet_id: updatedStaff.outlet_id,
        first_name: updatedStaff.first_name,
        last_name: updatedStaff.last_name,
        display_name: updatedStaff.display_name || `${updatedStaff.first_name} ${updatedStaff.last_name}`.trim(),
        name: `${updatedStaff.first_name || ''} ${updatedStaff.last_name || ''}`.trim(),
        email: updatedStaff.email,
        phone: updatedStaff.phone,
        position: updatedStaff.position,
        role: updatedStaff.position,
        employment_type: updatedStaff.employment_type,
        employee_id: updatedStaff.employee_id,
        hire_date: updatedStaff.hire_date,
        birth_date: updatedStaff.birth_date,
        hourly_rate: updatedStaff.hourly_rate,
        salary: updatedStaff.salary,
        is_bookable: updatedStaff.is_bookable,
        accepts_online_booking: updatedStaff.accepts_online_booking,
        max_advance_booking_days: updatedStaff.max_advance_booking_days,
        bio: updatedStaff.bio,
        profile_image_url: updatedStaff.profile_image_url,
        avatar: updatedStaff.profile_image_url,
        instagram_handle: updatedStaff.instagram_handle,
        is_active: updatedStaff.is_active,
        isActive: updatedStaff.is_active,
        status: updatedStaff.status,
        skills: updatedStaff.skills,
        average_rating: updatedStaff.average_rating,
        rating: updatedStaff.average_rating || 0,
        rating_count: updatedStaff.rating_count,
        total_bookings: updatedStaff.total_bookings,
        next_available_slot: updatedStaff.next_available_slot,
        created_at: updatedStaff.created_at,
        updated_at: updatedStaff.updated_at,
      }

      setStaff(prev => prev.map(s => s.id === id ? mappedStaff : s))
    } catch (error) {
      console.error('Failed to update staff:', error)
      throw error
    }
  }

  const deleteStaff = async (id: string) => {
    try {
      await apiClient.deleteStaff(id)
      setStaff(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Failed to delete staff:', error)
      throw error
    }
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

  const deleteBooking = async (id: string, cancellationReason?: string) => {
    try {
      await apiClient.deleteBooking(id, cancellationReason)
      setBookings(prev => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error('Failed to delete booking:', error)
      throw error
    }
  }

  const rescheduleBooking = async (id: string, data: { new_date: string; new_time: string; reason?: string }) => {
    try {
      const updatedAppointment = await apiClient.rescheduleBooking(id, data)

      // Update booking in state with new date/time
      setBookings(prev => prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            appointment_date: updatedAppointment.appointment_date,
            start_time: updatedAppointment.start_time,
            end_time: updatedAppointment.end_time,
            startAt: updatedAppointment.appointment_date && updatedAppointment.start_time
              ? `${updatedAppointment.appointment_date}T${updatedAppointment.start_time}`
              : b.startAt,
            endAt: updatedAppointment.appointment_date && updatedAppointment.end_time
              ? `${updatedAppointment.appointment_date}T${updatedAppointment.end_time}`
              : b.endAt,
            notes: updatedAppointment.notes || b.notes,
          }
        }
        return b
      }))
    } catch (error) {
      console.error('Failed to reschedule booking:', error)
      throw error
    }
  }

  const completeBooking = async (id: string, completionNotes?: string) => {
    try {
      const updatedAppointment = await apiClient.completeBooking(id, completionNotes)

      // Update booking in state with completed status
      setBookings(prev => prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            status: 'completed',
            paymentStatus: updatedAppointment.payment_status || b.paymentStatus,
            notes: updatedAppointment.notes || b.notes,
          }
        }
        return b
      }))
    } catch (error) {
      console.error('Failed to complete booking:', error)
      throw error
    }
  }

  const markNoShowBooking = async (id: string, reason?: string) => {
    try {
      const updatedAppointment = await apiClient.markNoShowBooking(id, reason)

      // Update booking in state with no-show status
      setBookings(prev => prev.map(b => {
        if (b.id === id) {
          return {
            ...b,
            status: 'no-show',
            notes: updatedAppointment.notes || b.notes,
          }
        }
        return b
      }))
    } catch (error) {
      console.error('Failed to mark booking as no-show:', error)
      throw error
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
        slug: newTreatment.slug || '',
        category: newTreatment.category || 'Beauty',
        duration: newTreatment.durationMin || newTreatment.duration_minutes || 60,
        durationMin: newTreatment.durationMin || newTreatment.duration_minutes || 60,
        price: parseFloat(newTreatment.price || newTreatment.pricing?.base_price || 0),
        currency: newTreatment.currency || newTreatment.pricing?.currency || 'USD',
        description: newTreatment.description || '',
        popularity: 0,
        assignedStaff: newTreatment.assignedStaff || newTreatment.assigned_staff || [],
        photo: newTreatment.photo || newTreatment.image_url || '',
        isActive: newTreatment.isActive !== false && newTreatment.is_active !== false,
        status: newTreatment.status || 'active',
        tags: newTreatment.tags || [],
      }

      setTreatments(prev => [...prev, mappedTreatment])

    } catch (error) {
      console.error('Failed to add treatment:', error)
      // Re-throw error so the caller can handle it
      throw error
    }
  }

  const updateTreatment = async (id: string, updates: Partial<Treatment>) => {
    try {
      const updatedTreatment = await apiClient.updateTreatment(id, updates)

      const mappedTreatment: Treatment = {
        id: updatedTreatment._id || updatedTreatment.id,
        name: updatedTreatment.name,
        slug: updatedTreatment.slug || '',
        category: updatedTreatment.category || 'Beauty',
        duration: updatedTreatment.durationMin || updatedTreatment.duration_minutes || 60,
        durationMin: updatedTreatment.durationMin || updatedTreatment.duration_minutes || 60,
        price: parseFloat(updatedTreatment.price || updatedTreatment.pricing?.base_price || 0),
        currency: updatedTreatment.currency || updatedTreatment.pricing?.currency || 'USD',
        description: updatedTreatment.description || '',
        popularity: updatedTreatment.popularity || 0,
        assignedStaff: updatedTreatment.assignedStaff || updatedTreatment.assigned_staff || [],
        photo: updatedTreatment.photo || updatedTreatment.image_url || '',
        isActive: updatedTreatment.isActive !== false && updatedTreatment.is_active !== false,
        status: updatedTreatment.status || 'active',
        tags: updatedTreatment.tags || [],
      }

      setTreatments(prev => prev.map(t => t.id === id ? mappedTreatment : t))
    } catch (error) {
      console.error('Failed to update treatment:', error)
      throw error
    }
  }

  const deleteTreatment = async (id: string) => {
    try {
      await apiClient.deleteTreatment(id)
      setTreatments(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Failed to delete treatment:', error)
      throw error
    }
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
        rescheduleBooking,
        completeBooking,
        markNoShowBooking,
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
    rescheduleBooking: context.rescheduleBooking,
    completeBooking: context.completeBooking,
    markNoShowBooking: context.markNoShowBooking,
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
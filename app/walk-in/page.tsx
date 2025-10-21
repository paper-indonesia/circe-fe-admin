"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  UserPlus, Clock, CreditCard, Banknote, Smartphone,
  Check, AlertCircle, Users, Calendar,
  ChevronRight, X, Printer, Mail, MessageSquare,
  TrendingUp, Star, Activity, Search, Sparkles, Syringe, Zap, Heart,
  Percent, DollarSign, ChevronDown, Loader2, CheckCircle2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePatients, useStaff, useTreatments, useBookings } from "@/lib/context"
import { formatCurrency, cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, startOfDay, addMonths, subMonths } from "date-fns"
import GradientLoading from "@/components/gradient-loading"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"
import { BookingDateTime } from "@/components/booking-date-time"
import { debounce } from 'lodash'

// Import API functions
import { searchCustomers, createCustomer, type Customer, completeWalkInBooking } from '@/lib/api/walk-in'

interface AvailabilitySlot {
  start_time: string
  end_time: string
  is_available: boolean
}

interface AvailabilityGrid {
  start_date: string
  end_date: string
  num_days: number
  slot_interval_minutes: number
  availability_grid: Record<string, AvailabilitySlot[]>
  metadata: {
    service_id: string
    service_name: string
    outlet_id: string
    outlet_name: string
    total_available_slots: number
    service_duration_minutes: number
  }
}

interface Booking {
  id: string
  name: string
  phone: string
  email: string
  treatment: string
  staff: string
  timeSlot: string
  status: "waiting" | "in-progress" | "completed" | "cancelled"
  createdAt: Date
  queueNumber: number
  paymentAmount: number
  paymentMethod: string
  paymentType: string
}

export default function WalkInPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { patients = [], loading: patientsLoading, addPatient } = usePatients()
  const { staff = [], loading: staffLoading } = useStaff()
  const { treatments = [], loading: treatmentsLoading } = useTreatments()
  const { bookings = [], loading: bookingsLoading, addBooking } = useBookings()

  const loading = patientsLoading || staffLoading || treatmentsLoading || bookingsLoading

  // Redirect to calendar with query params to auto-open create booking dialog
  useEffect(() => {
    router.push('/calendar?action=create&source=walk-in')
  }, [router])

  // Filter walk-in appointments from API bookings
  const walkInBookings = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return bookings.filter(b =>
      b.source === 'walk-in' &&
      b.appointment_date === today
    )
  }, [bookings])

  const [currentQueue, setCurrentQueue] = useState(1)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [lastBooking, setLastBooking] = useState<Booking | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [showClientSearch, setShowClientSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [treatmentSearchQuery, setTreatmentSearchQuery] = useState("")
  const [staffSearchQuery, setStaffSearchQuery] = useState("")
  const [treatmentPage, setTreatmentPage] = useState(1)
  const [staffPage, setStaffPage] = useState(1)
  const treatmentsPerPage = 6
  const staffPerPage = 6
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(true)
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [availabilityGrid, setAvailabilityGrid] = useState<AvailabilityGrid | null>(null)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [outletId, setOutletId] = useState<string | null>(null)

  // API Integration - Customer state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersError, setCustomersError] = useState<string | null>(null)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [customerSearchResult, setCustomerSearchResult] = useState<'not_searched' | 'found' | 'not_found'>('not_searched')
  const [customerConfirmed, setCustomerConfirmed] = useState(false)

  // Ref for auto-scroll to staff section
  const staffSectionRef = useRef<HTMLDivElement>(null)

  // Walk-in is enabled by default
  const isWalkInEnabled = true

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    treatmentId: "",
    staffId: "",
    bookingDate: format(new Date(), 'yyyy-MM-dd'), // Default to today
    timeSlot: "",
    paymentMethod: "",
    paymentType: "deposit",
    paymentValueType: "percentage", // "percentage" or "fixed"
    paymentPercentage: 50,
    paymentFixedAmount: 0,
    existingClient: false,
    existingClientId: "", // Store customer_id from API
    // Card details
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  })

  const [errors, setErrors] = useState<any>({})
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Get unique categories from treatments
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(treatments.map(t => t.category)))
    return uniqueCategories.sort()
  }, [treatments])

  // Category icon mapping
  const categoryIcons: Record<string, any> = {
    "All": Star,
    "Facial": Sparkles,
    "Medical": Heart,
    "Laser": Zap,
    "Injectable": Syringe,
    "Exfoliation": Sparkles,
  }

  // Category gradient mapping
  const categoryGradients: Record<string, { gradient: string, color: string }> = {
    "All": { gradient: "from-purple-500 to-pink-500", color: "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400" },
    "Facial": { gradient: "from-blue-500 to-cyan-500", color: "bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400" },
    "Medical": { gradient: "from-green-500 to-emerald-500", color: "bg-green-50 border-green-200 text-green-700 hover:border-green-400" },
    "Laser": { gradient: "from-orange-500 to-red-500", color: "bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-400" },
    "Injectable": { gradient: "from-pink-500 to-rose-500", color: "bg-pink-50 border-pink-200 text-pink-700 hover:border-pink-400" },
    "Exfoliation": { gradient: "from-indigo-500 to-purple-500", color: "bg-indigo-50 border-indigo-200 text-indigo-700 hover:border-indigo-400" },
  }

  // Fetch availability grid from API
  const fetchAvailabilityGrid = async (serviceId: string, staffId: string, startDate: string) => {
    if (!serviceId || !staffId || !outletId) return

    setLoadingAvailability(true)
    try {
      const response = await fetch(
        `/api/availability/grid?` +
        `service_id=${serviceId}&` +
        `staff_id=${staffId}&` +
        `outlet_id=${outletId}&` +
        `start_date=${startDate}&` +
        `num_days=7&` +
        `slot_interval_minutes=30`
      )

      if (response.ok) {
        const data: AvailabilityGrid = await response.json()
        setAvailabilityGrid(data)
      } else {
        console.error('Failed to fetch availability grid')
        setAvailabilityGrid(null)
      }
    } catch (error) {
      console.error('Error fetching availability grid:', error)
      setAvailabilityGrid(null)
    } finally {
      setLoadingAvailability(false)
    }
  }

  // Get outlet ID from current user/tenant
  useEffect(() => {
    // TODO: Get outlet ID from authenticated user context
    // For now, we'll fetch it when staff is available
    if (staff && staff.length > 0 && staff[0].outlet_id) {
      setOutletId(staff[0].outlet_id)
    }
  }, [staff])

  // Update queue number based on walkInBookings from API
  useEffect(() => {
    if (walkInBookings.length > 0) {
      // Find the highest queue number from existing walk-in bookings
      const existingQueueNumbers = walkInBookings
        .map(b => parseInt(b.queueNumber || '0'))
        .filter(n => !isNaN(n))

      if (existingQueueNumbers.length > 0) {
        const maxQueue = Math.max(...existingQueueNumbers)
        setCurrentQueue(maxQueue + 1)
      }
    }
  }, [walkInBookings])

  // API Integration - Load customers when search dialog is opened
  useEffect(() => {
    if (showClientSearch && customers.length === 0) {
      loadInitialCustomers()
    }
  }, [showClientSearch])

  // Fetch availability when service, staff, or week start changes
  useEffect(() => {
    if (formData.treatmentId && formData.staffId && outletId) {
      // Use today's date or week start, whichever is later (don't use past dates)
      const today = startOfDay(new Date())
      const weekStartDay = startOfDay(weekStart)
      const startDate = weekStartDay < today ? today : weekStartDay
      const startDateStr = format(startDate, 'yyyy-MM-dd')

      fetchAvailabilityGrid(formData.treatmentId, formData.staffId, startDateStr)
    }
  }, [formData.treatmentId, formData.staffId, weekStart, outletId])

  // API Integration - Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearchCustomers.cancel()
    }
  }, [])

  const selectedTreatment = treatments.find((t) => t.id === formData.treatmentId || t.id.toString() === formData.treatmentId)
  const selectedStaff = staff.find((s) => s.id === formData.staffId || s.id.toString() === formData.staffId)

  const totalAmount = selectedTreatment ? selectedTreatment.price : 0

  // Calculate deposit amount based on value type
  const depositAmount = useMemo(() => {
    if (!selectedTreatment) return 0
    if (formData.paymentValueType === "percentage") {
      return selectedTreatment.price * (formData.paymentPercentage / 100)
    } else {
      return Math.min(formData.paymentFixedAmount, selectedTreatment.price)
    }
  }, [selectedTreatment, formData.paymentValueType, formData.paymentPercentage, formData.paymentFixedAmount])

  // Generate week days for calendar
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i))
    }
    return days
  }, [weekStart])

  // Filter available time slots based on availability grid from API
  const availableTimeSlots = useMemo(() => {
    if (!formData.bookingDate || !formData.staffId || !availabilityGrid) {
      return []
    }

    // Get slots for the selected date from the availability grid
    const dateSlots = availabilityGrid.availability_grid[formData.bookingDate] || []

    // Transform API slots to match our format
    return dateSlots
      .filter(slot => slot.is_available)
      .map(slot => ({
        time: slot.start_time,
        available: true,
        end_time: slot.end_time
      }))
  }, [formData.bookingDate, formData.staffId, availabilityGrid])

  // Check if booking is still possible today
  const canBookToday = useMemo(() => {
    const now = new Date()
    const currentHour = now.getHours()
    // Assume operational hours are 09:00 - 17:00
    return currentHour < 17
  }, [])

  // Get available staff for selected treatment
  const availableStaff = useMemo(() => {
    if (!selectedTreatment) return staff

    // Use staffIds from treatment (from include_staff=true API)
    if (selectedTreatment.staffIds && Array.isArray(selectedTreatment.staffIds) && selectedTreatment.staffIds.length > 0) {
      console.log('[Walk-In] Using staffIds from treatment:', selectedTreatment.staffIds)

      const filtered = staff.filter(s => selectedTreatment.staffIds.includes(s.id))
      console.log(`[Walk-In] Filtered ${filtered.length} of ${staff.length} staff using staffIds`)

      return filtered
    }

    // Fallback: Old filtering logic for backwards compatibility
    const serviceId = selectedTreatment.id || selectedTreatment._id || selectedTreatment.service_id
    console.log('[Walk-In] Fallback: Filtering staff for service:', serviceId)

    const filtered = staff.filter(s => {
      // Check di skills.service_ids (API format from GET /api/v1/staff)
      if (s.skills && Array.isArray(s.skills.service_ids)) {
        return s.skills.service_ids.includes(serviceId)
      }

      // Fallback: Check di assignedStaff (old local format)
      if (selectedTreatment.assignedStaff && selectedTreatment.assignedStaff.includes(s.id)) {
        return true
      }

      return false
    })

    console.log(`[Walk-In] Filtered ${filtered.length} of ${staff.length} staff (fallback method)`)
    return filtered
  }, [selectedTreatment, staff])

  // API Integration - Replace existingClients with customers from API
  const existingClients = useMemo(() => {
    return customers.map(c => ({
      id: c._id || c.id || c.customer_id,
      name: `${c.first_name} ${c.last_name}`.trim(),
      phone: c.phone,
      email: c.email || '',
      gender: c.gender,
      lastVisit: c.last_appointment_date ? format(new Date(c.last_appointment_date), 'MMM d, yyyy') : 'New client',
      totalVisits: c.total_appointments,
      totalSpent: c.total_spent,
      loyaltyPoints: c.loyalty_points || 0,
      tags: c.tags || [],
      source: c.source,
      memberSince: c.created_at ? format(new Date(c.created_at), 'MMM yyyy') : ''
    }))
  }, [customers])

  // API Integration - Load initial customers
  const loadInitialCustomers = async () => {
    setLoadingCustomers(true)
    setCustomersError(null)
    try {
      // Load first 50 customers
      const results = await searchCustomers('')
      setCustomers(results)
    } catch (error: any) {
      console.error('Error loading customers:', error)
      setCustomersError(error.message)

      // Don't show toast for authentication errors (user will be redirected)
      if (!error.message.includes('Authentication')) {
        toast({
          title: "Error",
          description: "Failed to load customers list",
          variant: "destructive"
        })
      }
    } finally {
      setLoadingCustomers(false)
    }
  }

  // API Integration - Debounced search function
  const debouncedSearchCustomers = useMemo(
    () => debounce(async (query: string) => {
      if (query.length < 2) {
        // Load initial customers if query is empty
        loadInitialCustomers()
        return
      }

      setLoadingCustomers(true)
      setCustomersError(null)
      try {
        const results = await searchCustomers(query)
        setCustomers(results)
      } catch (error: any) {
        console.error('Error searching customers:', error)
        setCustomersError(error.message)
      } finally {
        setLoadingCustomers(false)
      }
    }, 300),
    []
  )

  // Manual search customer by phone
  const handleSearchCustomerByPhone = async () => {
    if (!formData.phone) {
      toast({
        title: "Phone Required",
        description: "Please enter phone number first",
        variant: "destructive"
      })
      return
    }

    // Validate phone format
    const phoneDigits = formData.phone.startsWith('+62')
      ? formData.phone.slice(3)
      : formData.phone

    if (phoneDigits.length < 8 || !phoneDigits.startsWith('8')) {
      toast({
        title: "Invalid Phone",
        description: "Phone must start with 8 and have at least 8 digits",
        variant: "destructive"
      })
      return
    }

    setSearchingCustomer(true)
    setCustomerSearchResult('not_searched')
    setCustomerConfirmed(false)

    try {
      const results = await searchCustomers(formData.phone)

      if (results && results.length > 0) {
        const existingCustomer = results[0]
        // Found existing customer - auto-fill data and auto-confirm
        setFormData({
          ...formData,
          name: `${existingCustomer.first_name} ${existingCustomer.last_name}`.trim(),
          email: existingCustomer.email || '',
          existingClient: true,
          existingClientId: existingCustomer._id || existingCustomer.id || existingCustomer.customer_id
        })
        setCustomerSearchResult('found')
        setCustomerConfirmed(true) // Auto-confirm for existing customers
        toast({
          title: "Customer Found!",
          description: `${existingCustomer.first_name} ${existingCustomer.last_name} - Ready to book`,
        })
      } else {
        // Not found - require confirmation
        setCustomerSearchResult('not_found')
        setCustomerConfirmed(false)
        toast({
          title: "Customer Not Found",
          description: "Please confirm to create a new customer profile",
        })
      }
    } catch (error: any) {
      console.error('[Walk-In] Customer search error:', error)
      setCustomerSearchResult('not_found')
      setCustomerConfirmed(false)
      toast({
        title: "Customer Not Found",
        description: "Please confirm to create a new customer profile",
      })
    } finally {
      setSearchingCustomer(false)
    }
  }

  const handleConfirmNewCustomer = () => {
    setCustomerConfirmed(true)
    toast({
      title: "New Customer Confirmed",
      description: "Customer will be created when booking is completed"
    })
  }

  // Payment status badge helper function
  const getPaymentStatusBadge = (paymentStatus?: string) => {
    if (!paymentStatus) {
      return (
        <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Unknown
        </Badge>
      )
    }

    switch (paymentStatus) {
      case "paid":
        return (
          <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "partially_paid":
        return (
          <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        )
      case "pending":
        return (
          <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "unpaid":
        return (
          <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unpaid
          </Badge>
        )
      case "deposit":
        return (
          <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
            <DollarSign className="h-3 w-3 mr-1" />
            Deposit
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return (
          <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
            {paymentStatus}
          </Badge>
        )
    }
  }

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    // Strict validation: must start with +628 and have 8-12 total digits after +62
    if (!formData.phone.match(/^\+628\d{7,11}$/)) {
      newErrors.phone = "Phone must start with 8 and have 8-12 digits (e.g., 81xxxxxxxxx)"
    }
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.treatmentId) newErrors.treatment = "Please select a treatment"
    if (!formData.staffId) newErrors.staff = "Please select a staff member"
    if (!formData.timeSlot) newErrors.timeSlot = "Please select a time slot"
    if (!formData.paymentMethod) newErrors.paymentMethod = "Please select a payment method"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive"
      })
      return
    }

    setShowConfirmDialog(true)
  }

  // Check availability before confirming booking
  const checkAvailability = async () => {
    if (!formData.staffId || !formData.bookingDate || !formData.timeSlot || !selectedTreatment) {
      return { available: false, reason: 'Missing required booking information' }
    }

    try {
      // Calculate end time based on treatment duration
      const [startHour, startMinute] = formData.timeSlot.split(':').map(Number)
      const startDate = new Date()
      startDate.setHours(startHour, startMinute, 0, 0)
      const endDate = new Date(startDate.getTime() + selectedTreatment.duration * 60000)
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`

      const response = await fetch(
        `/api/availability/check?` +
        `staff_id=${formData.staffId}&` +
        `date=${formData.bookingDate}&` +
        `start_time=${formData.timeSlot}&` +
        `end_time=${endTime}&` +
        `service_id=${formData.treatmentId}`
      )

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        const error = await response.json()
        return { available: false, reason: error.error || 'Failed to check availability' }
      }
    } catch (error) {
      console.error('Error checking availability:', error)
      return { available: false, reason: 'Failed to verify availability' }
    }
  }

  // API Integration - Complete booking flow using API
  const confirmBooking = async () => {
    setIsValidating(true)

    try {
      if (!outletId) {
        throw new Error('Outlet information is missing')
      }

      // Use completeWalkInBooking API function
      const result = await completeWalkInBooking({
        // Customer info
        customer: formData.existingClient && formData.existingClientId ? {
          customer_id: formData.existingClientId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        } : undefined,
        newCustomer: !formData.existingClient ? {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes,
        } : undefined,
        // Booking info
        service_id: formData.treatmentId,
        staff_id: formData.staffId,
        outlet_id: outletId,
        appointment_date: formData.bookingDate,
        start_time: formData.timeSlot,
        notes: formData.notes,
        // Payment info
        payment_method: formData.paymentMethod as any,
        payment_type: formData.paymentType as 'deposit' | 'full',
        payment_amount: formData.paymentType === 'deposit' ? depositAmount : totalAmount,
        // Service duration from context (optional, for potential future use)
        service_duration_minutes: selectedTreatment?.duration,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to create booking')
      }

      // Success! Create local booking object
      // Handle both appointment_id and id from response
      const appointmentId = result.appointment.appointment_id || result.appointment.id

      // Map the payment_status from API response
      const paymentStatus = result.payment?.status || result.appointment?.payment_status ||
        (formData.paymentType === "deposit" ? "deposit" : "paid")

      const booking: Booking = {
        id: appointmentId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        treatment: selectedTreatment?.name || "",
        staff: selectedStaff?.name || "",
        timeSlot: formData.timeSlot,
        status: "waiting",
        createdAt: new Date(),
        queueNumber: currentQueue,
        paymentAmount: result.payment?.amount || (formData.paymentType === "deposit" ? depositAmount : totalAmount),
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType
      }

      console.log('[Walk-In] Booking created:', booking)
      console.log('[Walk-In] Payment status:', paymentStatus)

      setLastBooking(booking)
      setCurrentQueue(currentQueue + 1)

      toast({
        title: "Success!",
        description: "Walk-in booking created successfully",
      })

      setShowConfirmDialog(false)
      setShowSuccessDialog(true)

      // Refresh availability
      await fetchAvailabilityGrid(formData.treatmentId, formData.staffId, formData.bookingDate)

      // Trigger context refresh by calling the loadBookings function
      // The context should automatically refresh when we close the success dialog

      // Reset form
      resetForm()

    } catch (error: any) {
      console.error('Booking error:', error)
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsValidating(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      notes: "",
      treatmentId: "",
      staffId: "",
      bookingDate: format(new Date(), 'yyyy-MM-dd'),
      timeSlot: "",
      paymentMethod: "",
      paymentType: "deposit",
      paymentValueType: "percentage",
      paymentPercentage: 50,
      paymentFixedAmount: 0,
      existingClient: false,
      existingClientId: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    })
    setErrors({})
  }

  const handlePrintReceipt = () => {
    window.print()
    toast({
      title: "Receipt Printed",
      description: "Booking receipt has been sent to printer.",
    })
  }

  // API Integration - Update handleClientSelect to save customer_id
  const handleClientSelect = (client: any) => {
    setFormData({
      ...formData,
      name: client.name,
      phone: client.phone,
      email: client.email,
      existingClient: true,
      existingClientId: client.id // Save customer_id
    })
    setShowClientSearch(false)
    setSearchQuery("")
    toast({
      title: "Client Selected",
      description: `${client.name} has been selected.`,
    })
  }

  const filteredClients = existingClients.filter(client =>
    (client.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone || '').includes(searchQuery) ||
    (client.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group clients by alphabet
  const groupedClients = useMemo(() => {
    const groups: Record<string, typeof filteredClients> = {}

    filteredClients.forEach(client => {
      const firstLetter = (client.name || '').charAt(0).toUpperCase() || '#'
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(client)
    })

    // Sort each group by name
    Object.keys(groups).forEach(letter => {
      groups[letter].sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    })

    return groups
  }, [filteredClients])

  // Toggle group expansion
  const toggleGroup = (letter: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(letter)) {
        newSet.delete(letter)
      } else {
        newSet.add(letter)
      }
      return newSet
    })
  }

  // Auto-expand all groups by default when clients change
  useEffect(() => {
    const letters = Object.keys(groupedClients)
    // Only set if expandedGroups is empty (initial load or after clear)
    if (expandedGroups.size === 0 && letters.length > 0) {
      setExpandedGroups(new Set(letters))
    }
  }, [filteredClients.length]) // Trigger when filtered clients change

  const getQueueStatus = () => {
    const waiting = walkInBookings.filter(b => b.status === "waiting").length
    const inProgress = walkInBookings.filter(b => b.status === "in-progress").length
    const completed = walkInBookings.filter(b => b.status === "completed").length

    return { waiting, inProgress, completed }
  }

  const queueStatus = getQueueStatus()

  if (loading) {
    return (
      <>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <GradientLoading />
        </div>
      </>
    )
  }

  // Check if data is completely empty (no staff or treatments to enable walk-in)
  const hasNoData = !loading && (
    (!staff || staff.length === 0) ||
    (!treatments || treatments.length === 0)
  )

  return (
    <>
      {hasNoData ? (
        <EmptyState
          icon={UserPlus}
          title="Walk-in Not Ready"
          description={`Quick booking feature for walk-in customers. Before you can use walk-in, please add staff and products first.`}
          actionLabel={`Setup Staff`}
          onAction={() => router.push('/staff')}
          secondaryActionLabel={`Add Products`}
          onSecondaryAction={() => router.push('/products')}
          tips={[
            {
              icon: UserPlus,
              title: "Quick Booking",
              description: "Fast check-in process"
            },
            {
              icon: Clock,
              title: "Real-time",
              description: "Immediate scheduling"
            },
            {
              icon: Users,
              title: "Queue System",
              description: "Manage walk-ins efficiently"
            }
          ]}
        />
      ) : (
      <div className="space-y-6">
        {/* Header with Queue Status */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Walk-in Booking</h1>
            <p className="text-muted-foreground">Create a new booking for walk-in clients</p>
          </div>

          <div className="flex gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Queue Number</p>
                    <p className="text-2xl font-bold">{currentQueue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Status</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">{queueStatus.waiting} waiting</Badge>
                      <Badge variant="default">{queueStatus.inProgress} in progress</Badge>
                      <Badge variant="outline">{queueStatus.completed} completed</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Client Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="existing"
                      checked={formData.existingClient}
                      onChange={(e) => setFormData({ ...formData, existingClient: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="existing">Existing Client</Label>
                    {formData.existingClient && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => setShowClientSearch(true)}
                      >
                        Search Client
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={errors.name ? "border-red-500" : ""}
                        required
                      />
                      {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium">
                          +62
                        </div>
                        <Input
                          id="phone"
                          placeholder="81xxxxxxxxx"
                          value={(formData.phone || '').startsWith('+62') ? (formData.phone || '').slice(3) : (formData.phone || '')}
                          onChange={(e) => {
                            const input = e.target.value.replace(/\D/g, '') // Only allow digits
                            const fullPhone = input ? `+62${input}` : ''
                            setFormData({ ...formData, phone: fullPhone })
                          }}
                          className={errors.phone ? "border-red-500" : ""}
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleSearchCustomerByPhone}
                          disabled={searchingCustomer || !formData.phone || formData.phone.length < 11}
                          className="shrink-0"
                        >
                          {searchingCustomer ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>
                              <Search className="h-4 w-4 mr-2" />
                              Search
                            </>
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter phone number and click Search to check if customer exists.
                      </p>
                      {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@email.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes / Allergies</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any special notes, allergies, or medical conditions..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold">Filter by Category</Label>
                    {/* Horizontal scroll container with fade effect */}
                    <div className="relative">
                      {/* Left fade overlay */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                      {/* Right fade overlay */}
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

                      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
                        <div className="flex gap-3 pb-2 min-w-max">
                          {/* All category first */}
                          {["All", ...categories].map((categoryName) => {
                            const Icon = categoryIcons[categoryName] || Star
                            const style = categoryGradients[categoryName] || categoryGradients["All"]
                            const isSelected = selectedCategory === categoryName
                            return (
                              <button
                                key={categoryName}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(categoryName)
                                  setTreatmentPage(1)
                                }}
                                className={cn(
                                  "relative group flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg flex-shrink-0 w-[110px]",
                                  isSelected
                                    ? `bg-gradient-to-br ${style.gradient} border-transparent text-white shadow-lg scale-105`
                                    : `${style.color} bg-white`
                                )}
                              >
                                <div className={cn(
                                  "p-2 rounded-lg transition-transform group-hover:scale-110",
                                  isSelected
                                    ? "bg-white/20"
                                    : "bg-gradient-to-br " + style.gradient + " bg-clip-padding"
                                )}>
                                  <Icon className={cn(
                                    "h-5 w-5",
                                    isSelected ? "text-white" : "text-white"
                                  )} />
                                </div>
                                <span className={cn(
                                  "text-xs font-medium text-center leading-tight",
                                  isSelected ? "text-white" : ""
                                )}>
                                  {categoryName}
                                </span>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                    <Check className="h-3 w-3 text-green-600" />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Scroll to see more categories →</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Search Product</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by product name..."
                        value={treatmentSearchQuery}
                        onChange={(e) => {
                          setTreatmentSearchQuery(e.target.value)
                          setTreatmentPage(1)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Available Products *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(() => {
                        const filteredTreatments = treatments
                          .filter(t => selectedCategory === "All" || t.category === selectedCategory)
                          .filter(t => t.name.toLowerCase().includes(treatmentSearchQuery.toLowerCase()))

                        const totalPages = Math.ceil(filteredTreatments.length / treatmentsPerPage)
                        const paginatedTreatments = filteredTreatments.slice(
                          (treatmentPage - 1) * treatmentsPerPage,
                          treatmentPage * treatmentsPerPage
                        )

                        return (
                          <>
                            {paginatedTreatments.map((treatment) => (
                        <div
                          key={treatment.id}
                          onClick={() => {
                            // Reset staff and time slot when treatment changes
                            setFormData({ ...formData, treatmentId: treatment.id, staffId: "", timeSlot: "" })

                            // Auto-scroll to staff section after short delay
                            setTimeout(() => {
                              staffSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                            }, 300)
                          }}
                          className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            formData.treatmentId === treatment.id || formData.treatmentId === treatment.id.toString()
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{treatment.name}</h4>
                              <Badge variant="secondary" className="text-xs mt-1">{treatment.category}</Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">Rp {treatment.price.toLocaleString("id-ID")}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                                <Clock className="h-3 w-3" />
                                {treatment.duration} min
                              </p>
                            </div>
                          </div>
                          {(formData.treatmentId === treatment.id || formData.treatmentId === treatment.id.toString()) && (
                            <div className="flex items-center gap-1 text-xs text-primary">
                              <Check className="h-3 w-3" />
                              Selected
                            </div>
                          )}
                        </div>
                            ))}

                            {filteredTreatments.length === 0 && (
                              <div className="col-span-2 text-center py-8 text-muted-foreground">
                                No treatments found
                              </div>
                            )}

                            {totalPages > 1 && (
                              <div className="col-span-2 flex items-center justify-center gap-2 mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTreatmentPage(p => Math.max(1, p - 1))}
                                  disabled={treatmentPage === 1}
                                >
                                  <ChevronRight className="h-4 w-4 rotate-180" />
                                </Button>
                                <span className="text-sm">
                                  Page {treatmentPage} of {totalPages}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setTreatmentPage(p => Math.min(totalPages, p + 1))}
                                  disabled={treatmentPage === totalPages}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                    {errors.treatment && <p className="text-sm text-red-500">{errors.treatment}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Staff Selection */}
              <Card ref={staffSectionRef}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Staff Member</CardTitle>
                    {selectedTreatment && availableStaff.length < staff.length && (
                      <Badge variant="default" className="text-xs">
                        Filtered: {availableStaff.length} of {staff.length} staff available for this product
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Staff</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by staff name or role..."
                        value={staffSearchQuery}
                        onChange={(e) => {
                          setStaffSearchQuery(e.target.value)
                          setStaffPage(1)
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Available Staff *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(() => {
                        const filteredStaff = availableStaff.filter(member =>
                          member.name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(staffSearchQuery.toLowerCase())
                        )

                        const totalPages = Math.ceil(filteredStaff.length / staffPerPage)
                        const paginatedStaff = filteredStaff.slice(
                          (staffPage - 1) * staffPerPage,
                          staffPage * staffPerPage
                        )

                        return (
                          <>
                            {paginatedStaff.map((member) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          // Check if staff is active, default to true if field doesn't exist
                          const isAvailable = member.isActive !== false
                          if (isAvailable) {
                            setFormData({ ...formData, staffId: member.id })
                          }
                        }}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          member.isActive === false
                            ? "opacity-60 cursor-not-allowed bg-muted/30"
                            : formData.staffId === member.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-lg font-semibold text-primary">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium">{member.name}</h4>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < Math.floor(member.rating)
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "fill-gray-200 text-gray-200"
                                      }`}
                                    />
                                  ))}
                                  <span className="text-xs ml-1">{member.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={member.isActive !== false ? "outline" : "secondary"}
                              className="text-xs"
                            >
                              {member.isActive === false ? "Inactive" : "Available"}
                            </Badge>
                            {formData.staffId === member.id && (
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <Check className="h-3 w-3" />
                                Selected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                            ))}

                            {filteredStaff.length === 0 && (
                              <div className="col-span-2 text-center py-8 text-muted-foreground">
                                No staff found
                              </div>
                            )}

                            {totalPages > 1 && (
                              <div className="col-span-2 flex items-center justify-center gap-2 mt-4">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setStaffPage(p => Math.max(1, p - 1))}
                                  disabled={staffPage === 1}
                                >
                                  <ChevronRight className="h-4 w-4 rotate-180" />
                                </Button>
                                <span className="text-sm">
                                  Page {staffPage} of {totalPages}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setStaffPage(p => Math.min(totalPages, p + 1))}
                                  disabled={staffPage === totalPages}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </>
                        )
                      })()}
                    </div>
                    {errors.staff && <p className="text-sm text-red-500">{errors.staff}</p>}
                  </div>

                  {/* Booking Date & Time - New Component */}
                  {loadingAvailability && formData.treatmentId && formData.staffId ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Loading available time slots...</p>
                      </div>
                    </div>
                  ) : formData.treatmentId && formData.staffId ? (
                    <>
                      <BookingDateTime
                        provider={{
                          name: selectedStaff?.name || "Select Staff First",
                          address: "Beauty Clinic - Jakarta",
                          avatarUrl: selectedStaff?.photoUrl
                        }}
                        selectedStaffId={formData.staffId}
                        existingBookings={walkInBookings.map(b => ({
                          bookingDate: b.appointment_date || b.startAt?.split('T')[0] || '',
                          timeSlot: b.start_time || b.startAt?.split('T')[1]?.substring(0, 5) || '',
                          staffId: b.staffId
                        }))}
                        availabilityGrid={availabilityGrid}
                        onSelectDateTime={(date, time) => {
                          setFormData({ ...formData, bookingDate: date, timeSlot: time })
                          setErrors({ ...errors, timeSlot: "" })
                        }}
                        onWeekChange={(newWeekStart) => {
                          setWeekStart(newWeekStart)
                        }}
                        isLoading={loadingAvailability}
                      />
                      {availableTimeSlots.length === 0 && formData.bookingDate && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            No available time slots for the selected date. Please choose a different date or staff member.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground text-center">
                        Please select a treatment and staff member to view available time slots
                      </p>
                    </div>
                  )}
                  {errors.timeSlot && <p className="text-sm text-red-500 mt-2">{errors.timeSlot}</p>}
                </CardContent>
              </Card>

              {/* Payment Information - Compact Design */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Method - Compact Pills */}
                  <div className="space-y-2">
                    <Label className="text-sm">Payment Method *</Label>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: "cash" })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all",
                          formData.paymentMethod === "cash"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        <Banknote className="h-4 w-4" />
                        Cash
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all",
                          formData.paymentMethod === "card"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        <CreditCard className="h-4 w-4" />
                        Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentMethod: "qris" })}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all",
                          formData.paymentMethod === "qris"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        <Smartphone className="h-4 w-4" />
                        QRIS
                      </button>
                    </div>
                    {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod}</p>}
                  </div>

                  {/* Payment Type - Compact Pills */}
                  <div className="space-y-2">
                    <Label className="text-sm">Payment Type</Label>
                    <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentType: "deposit" })}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                          formData.paymentType === "deposit"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        Deposit
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, paymentType: "full" })}
                        className={cn(
                          "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
                          formData.paymentType === "full"
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background"
                        )}
                      >
                        Full Payment
                      </button>
                    </div>
                  </div>

                  {/* Deposit Configuration - Compact */}
                  {formData.paymentType === "deposit" && (
                    <div className="space-y-3 p-3 bg-muted/30 rounded-lg border animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex gap-2 p-1 bg-background rounded-md">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentValueType: "percentage" })}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all",
                            formData.paymentValueType === "percentage"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Percent className="h-3 w-3" />
                          Percentage
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentValueType: "fixed" })}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all",
                            formData.paymentValueType === "fixed"
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <DollarSign className="h-3 w-3" />
                          Fixed
                        </button>
                      </div>

                      {formData.paymentValueType === "percentage" ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="100"
                              value={formData.paymentPercentage}
                              onChange={(e) => setFormData({
                                ...formData,
                                paymentPercentage: Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                              })}
                              className="flex-1 h-9 text-sm"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formData.paymentPercentage}% × Rp {totalAmount.toLocaleString("id-ID")} = <span className="font-semibold text-foreground">Rp {depositAmount.toLocaleString("id-ID")}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Input
                            type="number"
                            min="0"
                            max={totalAmount}
                            value={formData.paymentFixedAmount}
                            onChange={(e) => setFormData({
                              ...formData,
                              paymentFixedAmount: Math.min(totalAmount, Math.max(0, parseInt(e.target.value) || 0))
                            })}
                            placeholder="Enter amount"
                            className="h-9 text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Max: Rp {totalAmount.toLocaleString("id-ID")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Details - Show when Card is selected */}
                  {formData.paymentMethod === "card" && (
                    <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-sm">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "")
                            const formatted = value.match(/.{1,4}/g)?.join(" ") || value
                            setFormData({ ...formData, cardNumber: formatted })
                          }}
                          maxLength={19}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry" className="text-sm">Expiry (MM/YY) *</Label>
                          <Input
                            id="cardExpiry"
                            type="text"
                            inputMode="numeric"
                            placeholder="MM/YY"
                            value={formData.cardExpiry}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "")
                              let formatted = value
                              if (value.length >= 2) {
                                formatted = `${value.substring(0, 2)}/${value.substring(2, 4)}`
                              }
                              setFormData({ ...formData, cardExpiry: formatted })
                            }}
                            maxLength={5}
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardCvv" className="text-sm">CVV *</Label>
                          <Input
                            id="cardCvv"
                            type="text"
                            inputMode="numeric"
                            placeholder="123"
                            value={formData.cardCvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "")
                              setFormData({ ...formData, cardCvv: value })
                            }}
                            maxLength={4}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QRIS Note - Show when QRIS is selected */}
                  {formData.paymentMethod === "qris" && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex items-start gap-2">
                        <Smartphone className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-green-900 mb-1">
                            QRIS Payment
                          </p>
                          <p className="text-xs text-green-700">
                            QR code akan di-generate setelah booking dikonfirmasi. Scan dengan e-wallet Anda.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Note - Show when Cash is selected */}
                  {formData.paymentMethod === "cash" && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex items-start gap-2">
                        <Banknote className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 mb-1">
                            Cash Payment
                          </p>
                          <p className="text-xs text-amber-700">
                            Siapkan uang tunai sebesar {formatCurrency(formData.paymentType === "deposit" ? depositAmount : totalAmount)} untuk pembayaran.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary - Quick Info */}
            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Queue Number</p>
                    <p className="text-3xl font-bold text-primary">{currentQueue.toString().padStart(3, '0')}</p>
                  </div>

                  {formData.name && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Client</Label>
                      <p className="font-medium">{formData.name}</p>
                      {formData.phone && <p className="text-sm text-muted-foreground">{formData.phone}</p>}
                    </div>
                  )}

                  {selectedTreatment && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Product</Label>
                      <p className="font-medium">{selectedTreatment.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {selectedTreatment.duration} minutes
                      </div>
                    </div>
                  )}

                  {selectedStaff && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Staff</Label>
                      <p className="font-medium">{selectedStaff.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{selectedStaff.rating}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.bookingDate && formData.timeSlot && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Date & Time</Label>
                      <p className="font-medium">
                        {formData.bookingDate === format(new Date(), 'yyyy-MM-dd')
                          ? 'Today'
                          : format(new Date(formData.bookingDate), 'MMM d, yyyy')
                        }, {formData.timeSlot}
                      </p>
                    </div>
                  )}

                  {selectedTreatment && (
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Treatment Price</span>
                        <span className="font-medium">Rp {totalAmount.toLocaleString("id-ID")}</span>
                      </div>
                      {formData.paymentType === "deposit" && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Deposit
                            {formData.paymentValueType === "percentage"
                              ? ` (${formData.paymentPercentage}%)`
                              : " (Fixed)"}
                          </span>
                          <span className="font-medium">Rp {depositAmount.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-base border-t pt-3">
                        <span>Total {formData.paymentType === "deposit" ? "Deposit" : "Amount"}</span>
                        <span className="text-primary">
                          Rp {(formData.paymentType === "deposit" ? depositAmount : totalAmount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !formData.name ||
                      !formData.phone ||
                      !formData.treatmentId ||
                      !formData.staffId ||
                      !formData.timeSlot ||
                      !formData.paymentMethod
                    }
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Create Booking
                  </Button>
                </CardContent>
              </Card>

              {/* Today's Queue */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Today's Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {walkInBookings.slice(-3).map((booking) => (
                      <div key={booking.id} className="flex flex-col gap-2 p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">#{(booking.queueNumber || '0').toString().padStart(3, '0')}</span>
                            <div>
                              <p className="text-sm">{booking.patientName}</p>
                              <p className="text-xs text-muted-foreground">{booking.treatmentId}</p>
                            </div>
                          </div>
                          <Badge variant={
                            booking.status === "waiting" || booking.status === "pending" ? "secondary" :
                            booking.status === "confirmed" ? "default" :
                            booking.status === "completed" ? "outline" : "destructive"
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-end">
                          {getPaymentStatusBadge(booking.payment_status || booking.paymentStatus)}
                        </div>
                      </div>
                    ))}
                    {walkInBookings.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No bookings yet today</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                Please review the booking details before confirmation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 my-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Product:</span>
                <span className="text-sm font-medium">{selectedTreatment?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staff:</span>
                <span className="text-sm font-medium">{selectedStaff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date & Time:</span>
                <span className="text-sm font-medium">
                  {formData.bookingDate === format(new Date(), 'yyyy-MM-dd')
                    ? 'Today'
                    : format(new Date(formData.bookingDate), 'MMM d, yyyy')
                  }, {formData.timeSlot}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Amount to Pay:</span>
                <span className="text-primary">
                  Rp {(formData.paymentType === "deposit" ? depositAmount : totalAmount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={isValidating}>
                Cancel
              </Button>
              <Button onClick={confirmBooking} disabled={isValidating}>
                {isValidating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Booking Created Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 my-4">
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Queue Number</p>
                <p className="text-4xl font-bold text-primary">
                  #{lastBooking?.queueNumber.toString().padStart(3, '0')}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Booking ID:</span>
                  <span className="text-sm font-mono">{lastBooking?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Client:</span>
                  <span className="text-sm">{lastBooking?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date & Time:</span>
                  <span className="text-sm">
                    {formData.bookingDate === format(new Date(), 'yyyy-MM-dd')
                      ? 'Today'
                      : format(new Date(formData.bookingDate), 'MMM d, yyyy')
                    }, {lastBooking?.timeSlot}
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePrintReceipt}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessDialog(false)
                  toast({
                    title: "SMS Sent",
                    description: "Booking details sent to client.",
                  })
                }}
                className="flex-1"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send SMS
              </Button>
              <Button onClick={() => setShowSuccessDialog(false)} className="flex-1">
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Client Search Dialog - API Integration with Loading States */}
        <Dialog open={showClientSearch} onOpenChange={setShowClientSearch}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Search Existing Client
              </DialogTitle>
              <DialogDescription className="text-sm">
                Search and select a client from your database
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {/* Search Input with API integration */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    // Trigger debounced search
                    debouncedSearchCustomers(value)
                  }}
                  className="pl-10 pr-10 h-11"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => {
                      setSearchQuery("")
                      loadInitialCustomers() // Reload initial list
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Results List with Loading and Error States */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                {loadingCustomers ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p className="text-sm text-muted-foreground">Searching customers...</p>
                  </div>
                ) : customersError ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mb-3 text-red-500 opacity-50" />
                    <p className="text-sm font-medium text-red-600">{customersError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadInitialCustomers}
                      className="mt-3"
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      {searchQuery ? "No clients found matching your search" : "No clients found"}
                    </p>
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("")
                          loadInitialCustomers()
                        }}
                        className="mt-3"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.keys(groupedClients)
                      .sort()
                      .map((letter) => {
                        const isExpanded = expandedGroups.has(letter)
                        const clientCount = groupedClients[letter].length

                        return (
                          <div key={letter} className="space-y-2">
                            {/* Alphabet Header - Clickable */}
                            <button
                              onClick={() => toggleGroup(letter)}
                              className="w-full sticky top-0 bg-gradient-to-r from-primary/10 to-transparent backdrop-blur-sm z-10 py-2.5 px-3 rounded-lg border-l-4 border-primary hover:from-primary/20 transition-all duration-200 group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-bold text-primary">{letter}</h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {clientCount} {clientCount === 1 ? 'client' : 'clients'}
                                  </Badge>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    "h-5 w-5 text-primary transition-transform duration-300",
                                    isExpanded ? "rotate-180" : "rotate-0"
                                  )}
                                />
                              </div>
                            </button>

                            {/* Clients in this group - Collapsible */}
                            {isExpanded && (
                              <div className="space-y-2 pl-2 animate-in slide-in-from-top-2 fade-in duration-300">
                                {groupedClients[letter].map((client) => (
                                  <div
                                    key={client.id}
                                    onClick={() => handleClientSelect(client)}
                                    className="group p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
                                  >
                                    {/* Header: Name + Gender */}
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <h4 className="font-semibold text-base text-foreground truncate group-hover:text-primary transition-colors">
                                          {client.name}
                                        </h4>
                                        {client.gender && (
                                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                                            {client.gender === 'male' ? '👨 Male' : client.gender === 'female' ? '👩 Female' : client.gender}
                                          </Badge>
                                        )}
                                      </div>
                                      {client.source && (
                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                          {client.source === 'staff' ? '🏪 Staff Created' : client.source}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="font-mono">{client.phone}</span>
                                      </div>
                                      {client.email && (
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                                          <span className="truncate">{client.email}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-y">
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Visits</p>
                                        <p className="font-semibold text-sm">{client.totalVisits || 0}</p>
                                      </div>
                                      <div className="text-center border-x">
                                        <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
                                        <p className="font-semibold text-sm">Rp {(client.totalSpent || 0).toLocaleString("id-ID")}</p>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-xs text-muted-foreground mb-1">Points</p>
                                        <p className="font-semibold text-sm text-amber-600">⭐ {client.loyaltyPoints || 0}</p>
                                      </div>
                                    </div>

                                    {/* Tags */}
                                    {client.tags && client.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mb-3">
                                        {client.tags.map((tag, idx) => (
                                          <Badge key={idx} variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                                            #{tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}

                                    {/* Footer: Last Visit + Member Since */}
                                    <div className="flex items-center justify-between gap-2 text-xs">
                                      <span className="text-muted-foreground">
                                        {client.lastVisit === 'New client' ? (
                                          <Badge variant="default" className="text-xs">🆕 New Client</Badge>
                                        ) : (
                                          `Last visit: ${client.lastVisit}`
                                        )}
                                      </span>
                                      {client.memberSince && (
                                        <span className="text-muted-foreground">
                                          Member since {client.memberSince}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={() => setShowClientSearch(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  )
}

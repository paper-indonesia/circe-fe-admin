"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useBookings, usePatients, useStaff, useTreatments } from "@/lib/context"
import { formatCurrency, cn } from "@/lib/utils"
import { BookingDateTime } from "@/components/booking-date-time"
import PaymentStatusDisplay from "@/components/payment-status-display"
import RecordPaymentDialog from "@/components/record-payment-dialog"
import CreatePaymentLinkDialog from "@/components/create-payment-link-dialog"
import { searchCustomers, createCustomer, type Customer, completeWalkInBooking, type PaymentStatusResponse } from '@/lib/api/walk-in'
import { debounce } from 'lodash'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns"
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  List,
  Search,
  Filter,
  Plus,
  X,
  Clock,
  User,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Star,
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
  Loader2,
} from "lucide-react"
import LiquidLoading from "@/components/ui/liquid-loader"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type ViewMode = "calendar" | "table"
type DateRange = "week" | "month" | "2weeks"

export default function CalendarPage() {
  const { toast } = useToast()

  const { bookings = [], loading, updateBooking, deleteBooking, rescheduleBooking, completeBooking, markNoShowBooking } = useBookings()
  const { patients = [] } = usePatients()
  const { staff = [] } = useStaff()
  const { treatments = [] } = useTreatments()

  const [viewMode, setViewMode] = useState<ViewMode>("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dateRange, setDateRange] = useState<DateRange>("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [slideOpen, setSlideOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [tablePage, setTablePage] = useState(0)
  const itemsPerPage = 10
  const [expandedTimeSlots, setExpandedTimeSlots] = useState<Set<string>>(new Set())
  const [tempStatus, setTempStatus] = useState<string>("")

  // Cancel appointment state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [isCancelling, setIsCancelling] = useState(false)

  // Reschedule appointment state
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [rescheduleData, setRescheduleData] = useState({
    new_date: "",
    new_time: "",
    reason: ""
  })
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [rescheduleAvailabilityGrid, setRescheduleAvailabilityGrid] = useState<any>(null)
  const [loadingRescheduleAvailability, setLoadingRescheduleAvailability] = useState(false)
  const [rescheduleWeekStart, setRescheduleWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Complete appointment state
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [completionNotes, setCompletionNotes] = useState("")
  const [isCompleting, setIsCompleting] = useState(false)
  const [completePaymentStatus, setCompletePaymentStatus] = useState<PaymentStatusResponse | null>(null)

  // Record payment state
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false)
  const [paymentRefreshKey, setPaymentRefreshKey] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  // Payment link state
  const [paymentLinkDialogOpen, setPaymentLinkDialogOpen] = useState(false)

  // Fix hydration error - only render after client mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // No-show appointment state
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false)
  const [noShowReason, setNoShowReason] = useState("")
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false)

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editData, setEditData] = useState({
    appointment_date: "",
    start_time: "",
    notes: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  const [newBookingOpen, setNewBookingOpen] = useState(false)
  const [newBookingStep, setNewBookingStep] = useState(1)
  const [newBookingData, setNewBookingData] = useState<any>({
    treatmentId: "",
    patientId: "",
    staffId: "",
    date: "",
    time: "",
    paymentMethod: "cash",
    isNewClient: false,
    newClientName: "",
    newClientPhone: "",
    notes: ""
  })
  const [treatmentSearch, setTreatmentSearch] = useState("")
  const [treatmentPage, setTreatmentPage] = useState(0)
  const treatmentsPerPage = 6
  const [clientSearch, setClientSearch] = useState("")

  // Availability grid state (for booking flow)
  const [availabilityGrid, setAvailabilityGrid] = useState<any>(null)
  const [loadingNewBookingAvailability, setLoadingNewBookingAvailability] = useState(false)
  const [outletId, setOutletId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Customer API state (for booking flow)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersError, setCustomersError] = useState<string | null>(null)
  const [searchingCustomer, setSearchingCustomer] = useState(false)

  // Calculate date range based on selection
  const { startDate, endDate } = useMemo(() => {
    if (dateRange === "week") {
      return {
        startDate: startOfWeek(currentMonth),
        endDate: endOfWeek(currentMonth)
      }
    } else if (dateRange === "2weeks") {
      const start = startOfWeek(currentMonth)
      return {
        startDate: start,
        endDate: addDays(start, 13)
      }
    } else {
      return {
        startDate: startOfMonth(currentMonth),
        endDate: endOfMonth(currentMonth)
      }
    }
  }, [currentMonth, dateRange])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startDate)
    const end = endOfWeek(endDate)
    const days = []
    let day = start

    while (day <= end) {
      days.push(day)
      day = addDays(day, 1)
    }

    return days
  }, [startDate, endDate])

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking =>
      isSameDay(new Date(booking.startAt), date)
    )
  }

  // Get bookings for selected date grouped by time
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return []

    const dayBookings = getBookingsForDate(selectedDate)
    const grouped: { [key: string]: any[] } = {}

    dayBookings.forEach(booking => {
      const time = format(new Date(booking.startAt), "HH:mm")
      if (!grouped[time]) {
        grouped[time] = []
      }
      grouped[time].push(booking)
    })

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([time, bookings]) => ({ time, bookings }))
  }, [selectedDate, bookings])

  // Filtered bookings for table view
  const filteredBookings = useMemo(() => {
    let filtered = bookings

    if (statusFilter !== "all") {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(b => {
        const treatment = treatments.find(t => t.id === b.treatmentId)
        const search = searchQuery.toLowerCase()

        return (
          b.patientName?.toLowerCase().includes(search) ||
          treatment?.name?.toLowerCase().includes(search) ||
          b.id?.toLowerCase().includes(search)
        )
      })
    }

    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [bookings, statusFilter, searchQuery, patients, treatments])

  // Paginated bookings for table view
  const paginatedBookings = useMemo(() => {
    const start = tablePage * itemsPerPage
    return filteredBookings.slice(start, start + itemsPerPage)
  }, [filteredBookings, tablePage])

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)

  // Calendar statistics
  const calendarStats = useMemo(() => {
    const rangeBookings = bookings.filter(b => {
      const bookingDate = new Date(b.startAt)
      return bookingDate >= startDate && bookingDate <= endDate
    })

    const totalRevenue = rangeBookings.reduce((sum, b) => {
      const treatment = treatments.find(t => t.id === b.treatmentId)
      return sum + (treatment?.price || 0)
    }, 0)

    const confirmedCount = rangeBookings.filter(b => b.status === 'confirmed').length
    const completedCount = rangeBookings.filter(b => b.status === 'completed').length
    const cancelledCount = rangeBookings.filter(b => b.status === 'cancelled').length

    return {
      total: rangeBookings.length,
      confirmed: confirmedCount,
      completed: completedCount,
      cancelled: cancelledCount,
      revenue: totalRevenue,
    }
  }, [bookings, treatments, startDate, endDate])

  // Fetch availability grid from API
  const fetchAvailabilityGrid = async (serviceId: string, staffId: string, startDate: string) => {
    if (!serviceId || !staffId || !outletId) return

    setLoadingNewBookingAvailability(true)
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch availability')
      }

      const data = await response.json()
      console.log('[Calendar] Availability grid loaded:', data)
      setAvailabilityGrid(data)
    } catch (error: any) {
      console.error('[Calendar] Error fetching availability grid:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load availability. Please try again.",
        variant: "destructive",
      })
      setAvailabilityGrid(null)
    } finally {
      setLoadingNewBookingAvailability(false)
    }
  }

  // Get outlet ID from staff data (same as walk-in page)
  useEffect(() => {
    if (staff && staff.length > 0 && staff[0].outlet_id) {
      setOutletId(staff[0].outlet_id)
      console.log('[Calendar] Outlet ID loaded from staff:', staff[0].outlet_id)
    }
  }, [staff])

  // Trigger availability grid fetch when treatment and staff are selected
  useEffect(() => {
    if (newBookingData.treatmentId && newBookingData.staffId && outletId) {
      // Use today's date or week start, whichever is later
      const today = startOfDay(new Date())
      const weekStartDay = startOfDay(weekStart)
      const startDate = weekStartDay < today ? today : weekStartDay
      const startDateStr = format(startDate, 'yyyy-MM-dd')

      console.log('[Calendar] Fetching availability grid for:', {
        treatmentId: newBookingData.treatmentId,
        staffId: newBookingData.staffId,
        startDate: startDateStr
      })

      fetchAvailabilityGrid(newBookingData.treatmentId, newBookingData.staffId, startDateStr)
    }
  }, [newBookingData.treatmentId, newBookingData.staffId, weekStart, outletId])

  // Load initial customers
  const loadInitialCustomers = async () => {
    setLoadingCustomers(true)
    setCustomersError(null)
    try {
      // Load all customers (empty query loads all)
      const results = await searchCustomers('')
      console.log('[Calendar] Initial customers loaded:', results.length)
      setCustomers(results)
    } catch (error: any) {
      console.error('[Calendar] Error loading customers:', error)
      setCustomersError(error.message || 'Failed to load customers')
    } finally {
      setLoadingCustomers(false)
    }
  }

  // Load customers when "Existing Customer" is selected
  useEffect(() => {
    if (!newBookingData.isNewClient && newBookingOpen && customers.length === 0) {
      loadInitialCustomers()
    }
  }, [newBookingData.isNewClient, newBookingOpen])

  // Customer search with debounce (for filtering)
  const handleCustomerSearchChange = useCallback(
    debounce(async (query: string) => {
      console.log('[Calendar] Filtering customers with query:', query)
      setLoadingCustomers(true)
      setCustomersError(null)

      try {
        const results = await searchCustomers(query)
        console.log('[Calendar] Customer search results:', results.length)
        setCustomers(results)

        if (results.length === 0) {
          setCustomersError('No customers found')
        }
      } catch (error: any) {
        console.error('[Calendar] Customer search error:', error)
        setCustomersError(error.message || 'Failed to search customers')
        setCustomers([])
      } finally {
        setLoadingCustomers(false)
      }
    }, 300),
    []
  )

  const handleCustomerSearch = (query: string) => {
    setClientSearch(query)
    handleCustomerSearchChange(query)
  }

  // Manual search customer by phone (for New Customer flow)
  const handleSearchCustomerByPhone = async () => {
    if (!newBookingData.newClientPhone) {
      toast({
        title: "Phone Required",
        description: "Please enter phone number first",
        variant: "destructive"
      })
      return
    }

    // Validate phone format
    const phoneDigits = newBookingData.newClientPhone.startsWith('+62')
      ? newBookingData.newClientPhone.slice(3)
      : newBookingData.newClientPhone

    if (phoneDigits.length < 8 || !phoneDigits.startsWith('8')) {
      toast({
        title: "Invalid Phone",
        description: "Phone must start with 8 and have at least 8 digits",
        variant: "destructive"
      })
      return
    }

    setSearchingCustomer(true)
    try {
      const results = await searchCustomers(newBookingData.newClientPhone)

      if (results && results.length > 0) {
        const existingCustomer = results[0]
        // Found existing customer - auto-fill data and switch to existing
        setNewBookingData({
          ...newBookingData,
          newClientName: `${existingCustomer.first_name} ${existingCustomer.last_name}`.trim(),
          patientId: existingCustomer._id || existingCustomer.id || existingCustomer.customer_id,
          isNewClient: false // Switch to existing customer
        })
        toast({
          title: "Customer Found!",
          description: `${existingCustomer.first_name} ${existingCustomer.last_name} - Ready to book`,
        })
      } else {
        // Not found - will create new customer
        toast({
          title: "New Customer",
          description: "Phone not found. We'll create a new customer profile.",
        })
      }
    } catch (error: any) {
      console.error('[Calendar] Customer search error:', error)
      toast({
        title: "New Customer",
        description: "Phone not found. We'll create a new customer profile.",
      })
    } finally {
      setSearchingCustomer(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "no-show": return "bg-gray-100 text-gray-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const getPaymentStatusIcon = (paymentStatus?: string) => {
    if (!paymentStatus) return null

    switch (paymentStatus) {
      case "paid":
        return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case "partially_paid":
        return <Clock className="h-3 w-3 text-yellow-600" />
      case "pending":
        return <AlertCircle className="h-3 w-3 text-gray-400" />
      case "refunded":
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return null
    }
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSlideOpen(true)
  }

  const handleNewBookingFromCalendar = (date: Date) => {
    setNewBookingData({
      ...newBookingData,
      date: format(date, "yyyy-MM-dd")
    })
    setNewBookingOpen(true)
    setNewBookingStep(1)
  }

  const handleNewBookingFromButton = () => {
    setNewBookingData({
      treatmentId: "",
      patientId: "",
      staffId: "",
      date: "",
      time: "",
      paymentMethod: "cash",
      notes: ""
    })
    setNewBookingOpen(true)
    setNewBookingStep(1)
  }

  const handleDeleteBooking = async (id: string) => {
    // Open cancel dialog instead of directly deleting
    setCancelDialogOpen(true)
  }

  const handleConfirmCancellation = async () => {
    if (!selectedBooking) return

    // Validate cancellation reason
    if (!cancellationReason.trim()) {
      toast({
        title: "Cancellation reason required",
        description: "Please provide a reason for cancelling this appointment",
        variant: "destructive"
      })
      return
    }

    if (cancellationReason.length > 500) {
      toast({
        title: "Reason too long",
        description: "Cancellation reason must be 500 characters or less",
        variant: "destructive"
      })
      return
    }

    setIsCancelling(true)
    try {
      await deleteBooking(selectedBooking.id, cancellationReason)
      toast({
        title: "Appointment cancelled successfully",
        description: "The appointment has been cancelled and the time slot is now available."
      })
      setCancelDialogOpen(false)
      setDetailDialogOpen(false)
      setSelectedBooking(null)
      setCancellationReason("")
    } catch (error: any) {
      console.error('Failed to cancel appointment:', error)
      toast({
        title: "Failed to cancel appointment",
        description: error?.message || "An error occurred while cancelling the appointment",
        variant: "destructive"
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const handleOpenReschedule = async () => {
    if (!selectedBooking) return

    // Pre-fill with current appointment date and time
    setRescheduleData({
      new_date: selectedBooking.appointment_date || "",
      new_time: selectedBooking.start_time || "",
      reason: ""
    })
    setRescheduleDialogOpen(true)

    // Fetch availability grid for staff
    const staffId = selectedBooking.staffId
    const treatmentId = selectedBooking.treatmentId

    if (staffId && treatmentId && outletId) {
      setLoadingRescheduleAvailability(true)
      try {
        const startDate = format(rescheduleWeekStart, 'yyyy-MM-dd')

        const response = await fetch(
          `/api/availability/grid?` +
          `service_id=${treatmentId}&` +
          `staff_id=${staffId}&` +
          `outlet_id=${outletId}&` +
          `start_date=${startDate}&` +
          `num_days=7&` +
          `slot_interval_minutes=30`
        )

        if (response.ok) {
          const data = await response.json()
          console.log('[Reschedule] Availability grid loaded:', data)
          setRescheduleAvailabilityGrid(data)
        } else {
          console.error('[Reschedule] Failed to load availability grid')
          toast({
            title: "Warning",
            description: "Could not load availability. Please try again.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('[Reschedule] Error loading availability:', error)
        toast({
          title: "Error",
          description: "Failed to load availability. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoadingRescheduleAvailability(false)
      }
    }
  }

  // Fetch reschedule availability grid when week changes
  const fetchRescheduleAvailabilityGrid = async (newWeekStart: Date) => {
    if (!selectedBooking || !outletId) return

    const staffId = selectedBooking.staffId
    const treatmentId = selectedBooking.treatmentId

    if (!staffId || !treatmentId) return

    setLoadingRescheduleAvailability(true)
    try {
      const startDate = format(newWeekStart, 'yyyy-MM-dd')

      const response = await fetch(
        `/api/availability/grid?` +
        `service_id=${treatmentId}&` +
        `staff_id=${staffId}&` +
        `outlet_id=${outletId}&` +
        `start_date=${startDate}&` +
        `num_days=7&` +
        `slot_interval_minutes=30`
      )

      if (response.ok) {
        const data = await response.json()
        console.log('[Reschedule] Availability grid loaded for new week:', data)
        setRescheduleAvailabilityGrid(data)
      }
    } catch (error) {
      console.error('[Reschedule] Error loading availability:', error)
    } finally {
      setLoadingRescheduleAvailability(false)
    }
  }

  const handleConfirmReschedule = async () => {
    if (!selectedBooking) return

    // Validate required fields
    if (!rescheduleData.new_date || !rescheduleData.new_time) {
      toast({
        title: "Date & Time required",
        description: "Please select a date and time from the calendar",
        variant: "destructive"
      })
      return
    }

    // Validate reason length if provided
    if (rescheduleData.reason && rescheduleData.reason.length > 500) {
      toast({
        title: "Reason too long",
        description: "Reason must be 500 characters or less",
        variant: "destructive"
      })
      return
    }

    setIsRescheduling(true)
    try {
      await rescheduleBooking(selectedBooking.id, rescheduleData)
      toast({
        title: "Appointment rescheduled successfully",
        description: `New appointment time: ${rescheduleData.new_date} at ${rescheduleData.new_time}`
      })
      setRescheduleDialogOpen(false)
      setDetailDialogOpen(false)
      setSelectedBooking(null)
      setRescheduleData({ new_date: "", new_time: "", reason: "" })
    } catch (error: any) {
      console.error('Failed to reschedule appointment:', error)
      toast({
        title: "Failed to reschedule appointment",
        description: error?.message || "An error occurred while rescheduling the appointment",
        variant: "destructive"
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handleOpenDetails = (booking: any) => {
    setSelectedBooking(booking)
    setTempStatus(booking.status)
    setIsEditMode(false)
    setEditData({
      appointment_date: booking.appointment_date || "",
      start_time: booking.start_time || "",
      notes: booking.notes || ""
    })
    setDetailDialogOpen(true)
  }

  const handleEnterEditMode = () => {
    if (!selectedBooking) return
    setEditData({
      appointment_date: selectedBooking.appointment_date || "",
      start_time: selectedBooking.start_time || "",
      notes: selectedBooking.notes || ""
    })
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditData({
      appointment_date: selectedBooking?.appointment_date || "",
      start_time: selectedBooking?.start_time || "",
      notes: selectedBooking?.notes || ""
    })
  }

  const handleSaveChanges = async () => {
    if (!selectedBooking) return

    // Validate that completed or cancelled appointments cannot be rescheduled
    if (['completed', 'cancelled'].includes(selectedBooking.status)) {
      toast({
        title: "Cannot edit this appointment",
        description: "Completed or cancelled appointments cannot be modified",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      const updates: any = {}

      // Only include changed fields
      if (editData.appointment_date !== selectedBooking.appointment_date) {
        updates.appointment_date = editData.appointment_date
      }
      if (editData.start_time !== selectedBooking.start_time) {
        updates.start_time = editData.start_time
      }
      if (editData.notes !== (selectedBooking.notes || "")) {
        updates.notes = editData.notes
      }

      if (Object.keys(updates).length > 0) {
        await updateBooking(selectedBooking.id, updates)
        toast({ title: "Appointment updated successfully" })
        setIsEditMode(false)
      } else {
        toast({ title: "No changes to save" })
        setIsEditMode(false)
      }
    } catch (error: any) {
      toast({
        title: "Failed to update appointment",
        description: error.message || "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinishBooking = async () => {
    if (!selectedBooking) return

    // Open complete dialog
    setCompleteDialogOpen(true)
  }

  const handleConfirmComplete = async () => {
    if (!selectedBooking) return

    // Validate completion notes length if provided
    if (completionNotes && completionNotes.length > 1000) {
      toast({
        title: "Notes too long",
        description: "Completion notes must be 1000 characters or less",
        variant: "destructive"
      })
      return
    }

    setIsCompleting(true)
    try {
      await completeBooking(selectedBooking.id, completionNotes || undefined)
      toast({
        title: "Appointment completed successfully",
        description: "The appointment has been marked as completed"
      })
      setCompleteDialogOpen(false)
      setDetailDialogOpen(false)
      setSelectedBooking(null)
      setCompletionNotes("")
    } catch (error: any) {
      console.error('Failed to complete appointment:', error)

      // Check if error is related to payment verification
      const errorMessage = error?.message || "An error occurred while completing the appointment"
      const isPaymentError = errorMessage.toLowerCase().includes('payment') ||
                             errorMessage.toLowerCase().includes('verified')

      toast({
        title: "Failed to complete appointment",
        description: isPaymentError
          ? "Payment verification required. Please record the payment first before completing this appointment."
          : errorMessage,
        variant: "destructive",
        duration: 5000
      })

      // If payment error, suggest opening payment dialog
      if (isPaymentError && selectedBooking?.payment_status !== 'paid') {
        // Refresh payment status to show current state
        setPaymentRefreshKey((prev) => prev + 1)
      }
    } finally {
      setIsCompleting(false)
    }
  }

  const handleOpenNoShow = () => {
    if (!selectedBooking) return
    setNoShowDialogOpen(true)
  }

  const handleConfirmNoShow = async () => {
    if (!selectedBooking) return

    // Validate reason length if provided
    if (noShowReason && noShowReason.length > 500) {
      toast({
        title: "Reason too long",
        description: "Reason must be 500 characters or less",
        variant: "destructive"
      })
      return
    }

    setIsMarkingNoShow(true)
    try {
      await markNoShowBooking(selectedBooking.id, noShowReason || undefined)
      toast({
        title: "Appointment marked as no-show",
        description: "The customer did not arrive for the appointment"
      })
      setNoShowDialogOpen(false)
      setDetailDialogOpen(false)
      setSelectedBooking(null)
      setNoShowReason("")
    } catch (error: any) {
      console.error('Failed to mark appointment as no-show:', error)
      toast({
        title: "Failed to mark as no-show",
        description: error?.message || "An error occurred while marking the appointment as no-show",
        variant: "destructive"
      })
    } finally {
      setIsMarkingNoShow(false)
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedBookings.map(id => updateBooking(id, { status }))
      )
      setSelectedBookings([])
      toast({ title: `${selectedBookings.length} bookings updated` })
    } catch (error) {
      toast({ title: "Failed to update bookings", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 mt-1">Manage your bookings and schedule</p>
          </div>
          <Button
            onClick={handleNewBookingFromButton}
            className="bg-[#B8C0FF] hover:bg-[#A8B0EF] text-gray-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={cn(
                    viewMode === "calendar" && "bg-white shadow-sm"
                  )}
                >
                  <Grid3x3 className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    viewMode === "table" && "bg-white shadow-sm"
                  )}
                >
                  <List className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>

              {/* Date Range Selector */}
              {viewMode === "calendar" && (
                <div className="flex items-center gap-2">
                  <Select value={dateRange} onValueChange={(v: DateRange) => setDateRange(v)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="2weeks">2 Weeks</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentMonth(
                        dateRange === "week" ? addDays(currentMonth, -7) : subMonths(currentMonth, 1)
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium min-w-[120px] text-center">
                      {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentMonth(
                        dateRange === "week" ? addDays(currentMonth, 7) : addMonths(currentMonth, 1)
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Search & Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search bookings..."
                    className="pl-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <Card>
            <CardContent className="p-6">
              {/* Current Date Display */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Today</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {format(new Date(), "EEEE, MMMM dd, yyyy")}
                  </h2>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
                    <span className="text-gray-600">{calendarStats.confirmed} Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
                    <span className="text-gray-600">{calendarStats.completed} Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900 font-semibold">{formatCurrency(calendarStats.revenue)}</span>
                  </div>
                </div>
              </div>
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const dayBookings = getBookingsForDate(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isCurrentDay = isToday(day)

                  // Calculate day revenue
                  const dayRevenue = dayBookings.reduce((sum, b) => {
                    const treatment = treatments.find(t => t.id === b.treatmentId)
                    return sum + (treatment?.price || 0)
                  }, 0)

                  return (
                    <button
                      key={idx}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "min-h-[120px] p-3 rounded-lg border transition-all hover:shadow-lg hover:scale-[1.02] relative overflow-hidden group",
                        isCurrentMonth ? "bg-white" : "bg-gray-50",
                        isCurrentDay && "ring-2 ring-[#C8B6FF]",
                        selectedDate && isSameDay(day, selectedDate) && "bg-gradient-to-br from-[#FFD6FF]/30 to-[#E7C6FF]/30 shadow-md"
                      )}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD6FF]/0 to-[#E7C6FF]/0 group-hover:from-[#FFD6FF]/10 group-hover:to-[#E7C6FF]/10 transition-all" />

                      <div className="relative">
                        {/* Date header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-sm font-semibold",
                            isCurrentDay ? "bg-[#C8B6FF] text-white px-2.5 py-1 rounded-full" : "text-gray-700",
                            !isCurrentMonth && "text-gray-400"
                          )}>
                            {format(day, "d")}
                          </span>
                          {dayBookings.length > 0 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-white/80">
                              {dayBookings.length}
                            </Badge>
                          )}
                        </div>

                        {/* Booking Indicators */}
                        {dayBookings.length > 0 ? (
                          <div className="space-y-1.5">
                            {dayBookings.slice(0, 2).map((booking, i) => {
                              const treatment = treatments.find(t => t.id === booking.treatmentId)
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "text-xs px-2 py-1.5 rounded-md truncate shadow-sm",
                                    getStatusColor(booking.status)
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="font-semibold truncate">
                                      {format(new Date(booking.startAt), "HH:mm")}
                                    </div>
                                    {getPaymentStatusIcon((booking as any).payment_status)}
                                  </div>
                                  <div className="text-[10px] truncate opacity-90">
                                    {booking.patientName || "Unknown"}
                                  </div>
                                </div>
                              )
                            })}
                            {dayBookings.length > 2 && (
                              <div className="text-xs text-center text-gray-500 font-medium bg-gray-100 rounded py-1">
                                +{dayBookings.length - 2} more
                              </div>
                            )}

                            {/* Day Revenue */}
                            {dayRevenue > 0 && (
                              <div className="pt-1 mt-1 border-t border-gray-200">
                                <div className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {formatCurrency(dayRevenue)}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="text-xs text-gray-300">No bookings</div>
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <Card>
            <CardContent className="p-6">
              {/* Bulk Actions */}
              {selectedBookings.length > 0 && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#BBD0FF]/20 rounded-lg">
                  <span className="text-sm font-medium">{selectedBookings.length} selected</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("confirmed")}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusUpdate("completed")}
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBookings([])}
                  >
                    Clear
                  </Button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedBookings.length === filteredBookings.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBookings(filteredBookings.map(b => b.id))
                            } else {
                              setSelectedBookings([])
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Booking ID</th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Customer</th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Product</th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Date & Time</th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Staff</th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Status</th>
                      <th className="text-left text-sm font-semibold text-gray-600 py-3 px-4">Amount</th>
                      <th className="text-right text-sm font-semibold text-gray-600 py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((booking) => {
                      const customerData = booking.customer
                      const patient = customerData ? {
                        ...customerData,
                        id: customerData._id || customerData.id,
                        name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || booking.patientName || 'Unknown',
                        phone: customerData.phone || booking.patientPhone,
                        email: customerData.email || booking.patientEmail,
                      } : {
                        id: booking.patientId,
                        name: booking.patientName,
                        phone: booking.patientPhone,
                        email: booking.patientEmail,
                      }
                      const treatment = treatments.find(t => t.id === booking.treatmentId)
                      const staffMember = staff.find(s => s.id === booking.staffId)

                      return (
                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedBookings.includes(booking.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBookings([...selectedBookings, booking.id])
                                } else {
                                  setSelectedBookings(selectedBookings.filter(id => id !== booking.id))
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="py-3 px-4 text-sm font-mono text-gray-600">
                            #{booking.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center text-sm font-semibold">
                                {patient?.name?.charAt(0) || "?"}
                              </div>
                              <span className="text-sm font-medium">{patient?.name || "Unknown"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{treatment?.name || "Unknown"}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {format(new Date(booking.startAt), "MMM dd, yyyy HH:mm")}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{staffMember?.name || "Unassigned"}</td>
                          <td className="py-3 px-4">
                            <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{formatCurrency(treatment?.price || 0)}</td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetails(booking)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Showing {tablePage * itemsPerPage + 1} to {Math.min((tablePage + 1) * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTablePage(prev => Math.max(0, prev - 1))}
                      disabled={tablePage === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i
                        if (totalPages > 5) {
                          if (tablePage > 2) {
                            pageNum = tablePage - 2 + i
                          }
                          if (pageNum >= totalPages) {
                            pageNum = totalPages - 5 + i
                          }
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={tablePage === pageNum ? "default" : "outline"}
                            size="sm"
                            className={cn(
                              "w-8 h-8 p-0",
                              tablePage === pageNum && "bg-[#C8B6FF] hover:bg-[#B8A6EF]"
                            )}
                            onClick={() => setTablePage(pageNum)}
                          >
                            {pageNum + 1}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTablePage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={tablePage === totalPages - 1}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sliding Panel for Date Details */}
        <Sheet open={slideOpen} onOpenChange={setSlideOpen}>
          <SheetContent className="w-[1000px] sm:w-[1100px] max-w-[95vw] overflow-y-auto bg-gray-50">
            <SheetHeader className="border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Schedule</p>
                  <SheetTitle className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedDate && format(selectedDate, "EEE, MMMM dd")}
                  </SheetTitle>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-[#C8B6FF]">
                    {selectedDate && getBookingsForDate(selectedDate).length}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => selectedDate && handleNewBookingFromCalendar(selectedDate)}
                className="w-full bg-[#C8B6FF] hover:bg-[#B8A6EF] text-white h-11 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Booking
              </Button>
            </SheetHeader>

            <div className="mt-6 space-y-1">
              {selectedDateBookings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No bookings for this date</p>
                  <p className="text-sm text-gray-400 mt-1">Schedule a new booking to get started</p>
                </div>
              ) : (
                selectedDateBookings.map(({ time, bookings: timeBookings }) => {
                  const isExpanded = expandedTimeSlots.has(time)

                  return (
                    <div
                      key={time}
                      className="mb-4 group"
                      onMouseEnter={() => setExpandedTimeSlots(prev => new Set([...prev, time]))}
                      onMouseLeave={() => setExpandedTimeSlots(prev => {
                        const next = new Set(prev)
                        next.delete(time)
                        return next
                      })}
                    >
                      {/* Time Header - Collapsible */}
                      <div
                        className={cn(
                          "flex items-center gap-4 px-5 py-4 rounded-2xl bg-white border cursor-pointer transition-all",
                          isExpanded ? "border-[#C8B6FF] shadow-lg mb-2" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                        )}
                      >
                        {/* Time Badge */}
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD6FF]/40 to-[#E7C6FF]/40 flex-shrink-0">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{time.split(':')[0]}</div>
                            <div className="text-[10px] text-gray-500 font-medium">{time.split(':')[1]}</div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Time Slot</p>
                          <p className="text-base font-semibold text-gray-900 mt-0.5">
                            {timeBookings.length} {timeBookings.length === 1 ? 'booking' : 'bookings'}
                          </p>
                        </div>

                        {/* Preview Avatars */}
                        <div className="flex -space-x-3">
                          {timeBookings.slice(0, 3).map((booking, idx) => {
                            return (
                              <div
                                key={idx}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center border-2 border-white text-xs font-bold text-gray-700 shadow-sm"
                              >
                                {booking.patientName?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            )
                          })}
                          {timeBookings.length > 3 && (
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white text-[10px] font-bold text-gray-500 shadow-sm">
                              +{timeBookings.length - 3}
                            </div>
                          )}
                        </div>

                        <ChevronRight className={cn(
                          "h-5 w-5 text-gray-400 transition-all duration-200 flex-shrink-0",
                          isExpanded && "rotate-90 text-[#C8B6FF]"
                        )} />
                      </div>

                      {/* Expanded Bookings */}
                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          isExpanded ? "max-h-[3000px] opacity-100 mt-3" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="space-y-3 pl-3">
                          {timeBookings.map((booking, idx) => {
                            const customerData = booking.customer
                            const patient = customerData ? {
                              ...customerData,
                              id: customerData._id || customerData.id,
                              name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || booking.patientName || 'Unknown',
                              phone: customerData.phone || booking.patientPhone,
                              email: customerData.email || booking.patientEmail,
                            } : {
                              id: booking.patientId,
                              name: booking.patientName,
                              phone: booking.patientPhone,
                              email: booking.patientEmail,
                            }
                            const treatment = treatments.find(t => t.id === booking.treatmentId)
                            const staffMember = staff.find(s => s.id === booking.staffId)
                            const endTime = format(new Date(booking.endAt), "HH:mm")

                            return (
                              <div
                                key={booking.id}
                                className="relative"
                              >
                                {/* Vertical Line Connector */}
                                <div
                                  className="absolute left-[27px] top-0 w-0.5 h-full"
                                  style={{
                                    backgroundColor: booking.status === 'confirmed' ? '#10b981' :
                                                     booking.status === 'completed' ? '#3b82f6' :
                                                     booking.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                                  }}
                                />

                                <div className="flex gap-3">
                                  {/* Color Dot */}
                                  <div
                                    className="w-[14px] h-[14px] rounded-full border-[3px] border-white shadow-md flex-shrink-0 mt-4 z-10"
                                    style={{
                                      backgroundColor: booking.status === 'confirmed' ? '#10b981' :
                                                       booking.status === 'completed' ? '#3b82f6' :
                                                       booking.status === 'cancelled' ? '#ef4444' : '#f59e0b'
                                    }}
                                  />

                                  {/* Card */}
                                  <Card
                                    className="flex-1 bg-white border border-gray-100 hover:border-[#E7C6FF] cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => handleOpenDetails(booking)}
                                  >
                                    <CardContent className="p-4">
                                      {/* Header */}
                                      <div className="flex items-start gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-700 shadow">
                                          {patient?.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 truncate">
                                            {patient?.name || "Unknown"}
                                          </h4>
                                          <p className="text-xs text-gray-400 truncate">{patient?.email || "No email"}</p>
                                        </div>
                                        <Badge className={cn("text-[10px] px-2 py-0.5 font-medium", getStatusColor(booking.status))}>
                                          {booking.status}
                                        </Badge>
                                      </div>

                                      {/* Details Grid */}
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                          <Star className="h-3.5 w-3.5 text-[#C8B6FF] flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-gray-400 text-[10px]">Treatment</p>
                                            <p className="font-medium text-gray-900 truncate">{treatment?.name || "Unknown"}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <User className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-gray-400 text-[10px]">Staff</p>
                                            <p className="font-medium text-gray-900 truncate">{staffMember?.name || "Unassigned"}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <Clock className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-gray-400 text-[10px]">Duration</p>
                                            <p className="font-medium text-gray-900">{time} - {endTime}</p>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <DollarSign className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                                          <div className="min-w-0">
                                            <p className="text-gray-400 text-[10px]">Price</p>
                                            <p className="font-semibold text-gray-900">{formatCurrency(treatment?.price || 0)}</p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Notes */}
                                      {booking.notes && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          <p className="text-[10px] text-gray-400 font-medium mb-1">Notes</p>
                                          <p className="text-xs text-gray-600 line-clamp-2">{booking.notes}</p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Booking Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            {selectedBooking && (() => {
              // Use customer data directly from booking (already populated in context)
              const customerData = selectedBooking.customer
              const patient = customerData ? {
                ...customerData,
                id: customerData._id || customerData.id,
                name: `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || selectedBooking.patientName || 'Unknown',
                phone: customerData.phone || selectedBooking.patientPhone,
                email: customerData.email || selectedBooking.patientEmail,
              } : {
                id: selectedBooking.patientId,
                name: selectedBooking.patientName,
                phone: selectedBooking.patientPhone,
                email: selectedBooking.patientEmail,
              }
              const treatment = treatments.find(t => t.id === selectedBooking.treatmentId)
              const staffMember = staff.find(s => s.id === selectedBooking.staffId)

              return (
                <div className="space-y-0">
                  {/* Header */}
                  <div className="sticky top-0 bg-white z-10 pb-3 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Booking ID #{selectedBooking.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isEditMode && !['completed', 'cancelled'].includes(selectedBooking.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEnterEditMode}
                            className="h-7 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        <button
                          onClick={() => setDetailDialogOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{patient?.name || "Unknown Customer"}</h2>
                    <Select
                      value={tempStatus}
                      onValueChange={setTempStatus}
                    >
                      <SelectTrigger className="w-full h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="confirmed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Confirmed
                          </div>
                        </SelectItem>
                        <SelectItem value="completed">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            Completed
                          </div>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Cancelled
                          </div>
                        </SelectItem>
                        <SelectItem value="no-show">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            No Show
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="py-4 space-y-5">
                    {/* Patient Info Card */}
                    <div className="bg-gradient-to-br from-[#FFD6FF]/10 to-[#E7C6FF]/10 rounded-xl p-4 border border-[#FFD6FF]/30">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center text-xl font-bold text-gray-700 shadow flex-shrink-0">
                          {patient?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-500 font-semibold mb-1">PATIENT NAME</p>
                          <h3 className="text-base font-bold text-gray-900 mb-2">{patient?.name || "Unknown"}</h3>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-gray-400 text-[10px] font-semibold mb-0.5">PHONE NUMBER</p>
                              <p className="text-gray-900 font-medium">{patient?.phone || "Not provided"}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-[10px] font-semibold mb-0.5">EMAIL</p>
                              <p className="text-gray-900 font-medium truncate">{patient?.email || "Not provided"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Appointment Details - Horizontal Layout */}
                    <div className="space-y-3">
                      {/* Treatment */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Star className="h-4 w-4 text-[#C8B6FF]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Treatment</p>
                          <p className="font-bold text-gray-900 text-sm">{treatment?.name || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{treatment?.category || "N/A"}</p>
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Date & Time</p>
                          {isEditMode ? (
                            <div className="space-y-2">
                              <div>
                                <Label htmlFor="edit-date" className="text-xs">Date</Label>
                                <Input
                                  id="edit-date"
                                  type="date"
                                  value={editData.appointment_date}
                                  onChange={(e) => setEditData({ ...editData, appointment_date: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-time" className="text-xs">Start Time</Label>
                                <Input
                                  id="edit-time"
                                  type="time"
                                  value={editData.start_time}
                                  onChange={(e) => setEditData({ ...editData, start_time: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="font-bold text-gray-900 text-sm">
                                {format(new Date(selectedBooking.startAt), "EEE, MMM dd")}
                              </p>
                              <p className="text-xs text-gray-500">
                                {format(new Date(selectedBooking.startAt), "HH:mm")} - {format(new Date(selectedBooking.endAt), "HH:mm")}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Staff */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Staff</p>
                          <p className="font-bold text-gray-900 text-sm">{staffMember?.name || "Unassigned"}</p>
                          {staffMember?.email && (
                            <p className="text-xs text-gray-500">{staffMember.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* General Info Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-3 bg-[#C8B6FF] rounded-full"></div>
                        <h3 className="text-xs font-bold text-gray-900">General Info</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 font-semibold mb-1">FULL NAME</p>
                          <p className="text-gray-900 font-medium text-xs">{patient?.name || "Unknown"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 font-semibold mb-1">PHONE NUMBER</p>
                          <p className="text-gray-900 font-medium text-xs">{patient?.phone || "Not provided"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 font-semibold mb-1">EMAIL</p>
                          <p className="text-gray-900 font-medium text-xs truncate">{patient?.email || "Not provided"}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 font-semibold mb-1">PRICE</p>
                          <p className="text-gray-900 font-bold text-base">{formatCurrency(treatment?.price || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {(selectedBooking.notes || isEditMode) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-3 bg-[#C8B6FF] rounded-full"></div>
                          <h3 className="text-xs font-bold text-gray-900">Notes</h3>
                        </div>
                        {isEditMode ? (
                          <Textarea
                            value={editData.notes}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            placeholder="Add notes for this appointment..."
                            className="min-h-[80px] text-xs"
                          />
                        ) : (
                          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3">
                            <p className="text-xs text-gray-700">{selectedBooking.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="sticky bottom-0 bg-white pt-3 border-t border-gray-100 flex items-center gap-3">
                    {isEditMode ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 text-sm"
                          onClick={handleCancelEdit}
                          disabled={isSaving}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1 h-10 bg-[#C8B6FF] hover:bg-[#B8A6EF] text-white text-sm font-medium"
                          onClick={handleSaveChanges}
                          disabled={isSaving}
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm"
                          onClick={() => handleDeleteBooking(selectedBooking.id)}
                          disabled={['completed', 'cancelled'].includes(selectedBooking.status)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 text-sm"
                          onClick={handleOpenReschedule}
                          disabled={['completed', 'cancelled', 'no-show'].includes(selectedBooking.status)}
                        >
                          <Clock className="h-3.5 w-3.5 mr-2" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-10 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 text-sm"
                          onClick={handleOpenNoShow}
                          disabled={selectedBooking.status !== 'confirmed'}
                        >
                          <AlertCircle className="h-3.5 w-3.5 mr-2" />
                          No Show
                        </Button>
                        <Button
                          className="flex-1 h-10 bg-[#C8B6FF] hover:bg-[#B8A6EF] text-white text-sm font-medium"
                          onClick={handleFinishBooking}
                          disabled={['completed', 'cancelled', 'no-show'].includes(selectedBooking.status)}
                        >
                          Finish
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* New Booking Dialog */}
        <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
          <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b-2 border-gray-200 pb-5">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  Book Appointment
                </DialogTitle>
                <button onClick={() => setNewBookingOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-1 mt-4">
                {[
                  { num: 1, label: 'Treatment', icon: Star },
                  { num: 2, label: 'Staff', icon: User },
                  { num: 3, label: 'Schedule', icon: Clock },
                  { num: 4, label: 'Payment', icon: DollarSign },
                  { num: 5, label: 'Review', icon: CheckCircle }
                ].map((step, idx) => (
                  <>
                    <div key={step.num} className={cn(
                      "flex items-center gap-2 flex-1",
                      newBookingStep >= step.num ? "text-[#C8B6FF]" : "text-gray-400"
                    )}>
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-sm transition-all",
                        newBookingStep > step.num ? "bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] text-white" :
                        newBookingStep === step.num ? "bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] text-white ring-4 ring-[#FFD6FF]/50" :
                        "bg-gray-100 text-gray-400"
                      )}>
                        {newBookingStep > step.num ? <CheckCircle className="h-4 w-4" /> : step.num}
                      </div>
                      <span className="text-[10px] font-bold uppercase hidden md:block">{step.label}</span>
                    </div>
                    {idx < 4 && <div className={cn("h-0.5 w-8", newBookingStep > step.num ? "bg-[#C8B6FF]" : "bg-gray-200")} />}
                  </>
                ))}
              </div>
            </DialogHeader>

            <div className="py-6">
              {/* Step 1: Treatment Selection with Search & Pagination */}
              {newBookingStep === 1 && (() => {
                const filteredTreatments = treatments.filter(t =>
                  t.name.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
                  t.category.toLowerCase().includes(treatmentSearch.toLowerCase())
                )
                const paginatedTreatments = filteredTreatments.slice(
                  treatmentPage * treatmentsPerPage,
                  (treatmentPage + 1) * treatmentsPerPage
                )
                const totalTreatmentPages = Math.ceil(filteredTreatments.length / treatmentsPerPage)

                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Treatment</h3>

                      {/* Search */}
                      <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search treatment..."
                          value={treatmentSearch}
                          onChange={(e) => {
                            setTreatmentSearch(e.target.value)
                            setTreatmentPage(0)
                          }}
                          className="pl-9 h-11"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {paginatedTreatments.map((treatment) => (
                        <button
                          key={treatment.id}
                          onClick={() => setNewBookingData({ ...newBookingData, treatmentId: treatment.id })}
                          className={cn(
                            "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                            newBookingData.treatmentId === treatment.id
                              ? "border-[#C8B6FF] bg-[#FFD6FF]/10"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                              <Star className="h-5 w-5 text-[#C8B6FF]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 text-sm mb-1">{treatment.name}</p>
                              <p className="text-xs text-gray-500">{treatment.category}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                <span className="text-gray-600">{treatment.durationMin} min</span>
                                <span className="font-semibold text-gray-900">{formatCurrency(treatment.price)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalTreatmentPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTreatmentPage(prev => Math.max(0, prev - 1))}
                            disabled={treatmentPage === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {treatmentPage + 1} of {totalTreatmentPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setTreatmentPage(prev => Math.min(totalTreatmentPages - 1, prev + 1))}
                            disabled={treatmentPage === totalTreatmentPages - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Step 2: Staff Selection (filtered by selected treatment) */}
              {newBookingStep === 2 && (() => {
                const selectedTreatment = treatments.find(t => t.id === newBookingData.treatmentId)

                // Use staffIds from treatment (from include_staff=true API)
                let availableStaff = staff
                if (selectedTreatment?.staffIds && Array.isArray(selectedTreatment.staffIds) && selectedTreatment.staffIds.length > 0) {
                  console.log('[Calendar] Using staffIds from treatment:', selectedTreatment.staffIds)
                  availableStaff = staff.filter(s => selectedTreatment.staffIds.includes(s.id))
                  console.log(`[Calendar] Filtered ${availableStaff.length} of ${staff.length} staff using staffIds`)
                } else if (selectedTreatment?.assignedStaff) {
                  // Fallback: Use old assignedStaff field for backward compatibility
                  console.log('[Calendar] Fallback to assignedStaff:', selectedTreatment.assignedStaff)
                  availableStaff = staff.filter(s => selectedTreatment.assignedStaff.includes(s.id))
                }

                return (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Available Staff</h3>
                      <p className="text-xs text-gray-500 mb-4">
                        {availableStaff.length} staff member(s) available for {selectedTreatment?.name}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {availableStaff.map((staffMember) => (
                          <button
                            key={staffMember.id}
                            onClick={() => setNewBookingData({ ...newBookingData, staffId: staffMember.id })}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                              newBookingData.staffId === staffMember.id
                                ? "border-[#C8B6FF] bg-[#FFD6FF]/10"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center text-lg font-bold text-gray-700">
                                {staffMember.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">{staffMember.name}</p>
                                <p className="text-xs text-gray-500">{staffMember.email}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Step 3: Schedule (Date & Time) + Customer Selection */}
              {newBookingStep === 3 && (() => {
                const selectedStaff = staff.find(s => s.id === newBookingData.staffId)
                const selectedTreatment = treatments.find(t => t.id === newBookingData.treatmentId)

                // Get today's bookings from context
                const todayBookings = bookings.filter(b => {
                  const bookingDate = format(new Date(b.startAt), 'yyyy-MM-dd')
                  return bookingDate === format(new Date(), 'yyyy-MM-dd')
                })

                return (
                  <div className="space-y-6">
                    {/* Booking Date & Time - BookingDateTime Component */}
                    {loadingNewBookingAvailability && newBookingData.treatmentId && newBookingData.staffId ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-sm text-muted-foreground">Loading available time slots...</p>
                        </div>
                      </div>
                    ) : newBookingData.treatmentId && newBookingData.staffId ? (
                      <>
                        <BookingDateTime
                          provider={{
                            name: selectedStaff?.display_name || selectedStaff?.first_name || "Staff",
                            address: "Beauty Clinic",
                            avatarUrl: selectedStaff?.profile_image_url
                          }}
                          selectedStaffId={newBookingData.staffId}
                          existingBookings={todayBookings.map(b => ({
                            bookingDate: format(new Date(b.startAt), 'yyyy-MM-dd'),
                            timeSlot: format(new Date(b.startAt), 'HH:mm'),
                            staffId: b.staffId
                          }))}
                          availabilityGrid={availabilityGrid}
                          onSelectDateTime={(date, time) => {
                            setNewBookingData({ ...newBookingData, date, time })
                          }}
                          onWeekChange={(newWeekStart) => {
                            setWeekStart(newWeekStart)
                          }}
                          isLoading={loadingNewBookingAvailability}
                        />
                      </>
                    ) : (
                      <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
                        <p className="text-sm text-muted-foreground text-center">
                          Please select a treatment and staff member to view available time slots
                        </p>
                      </div>
                    )}

                    {/* Customer Selection */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                          <User className="h-4 w-4 text-[#C8B6FF]" />
                        </div>
                        Customer Information
                      </h3>

                      {/* New or Existing Customer Toggle */}
                      <div className="flex gap-3 mb-4">
                        <Button
                          type="button"
                          variant={!newBookingData.isNewClient ? "default" : "outline"}
                          onClick={() => setNewBookingData({ ...newBookingData, isNewClient: false, patientId: "", newClientName: "", newClientPhone: "" })}
                          className="flex-1"
                        >
                          Existing Customer
                        </Button>
                        <Button
                          type="button"
                          variant={newBookingData.isNewClient ? "default" : "outline"}
                          onClick={() => setNewBookingData({ ...newBookingData, isNewClient: true, patientId: "" })}
                          className="flex-1"
                        >
                          New Customer
                        </Button>
                      </div>

                      {/* Existing Customer Search */}
                      {!newBookingData.isNewClient && (
                        <div className="space-y-3">
                          <Label>Search Customer</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Filter by name or phone..."
                              value={clientSearch}
                              onChange={(e) => handleCustomerSearch(e.target.value)}
                              className="pl-10"
                            />
                          </div>

                          {/* Customer List */}
                          <div className="border rounded-lg max-h-80 overflow-y-auto">
                            {loadingCustomers ? (
                              <div className="p-4 text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Loading customers...</p>
                              </div>
                            ) : customersError ? (
                              <div className="p-4 text-center">
                                <p className="text-sm text-red-500 mb-2">{customersError}</p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={loadInitialCustomers}
                                >
                                  Retry
                                </Button>
                              </div>
                            ) : customers.length > 0 ? (
                              <div className="divide-y">
                                {customers.map((customer) => {
                                  const customerId = customer._id || customer.id || ""
                                  const isSelected = newBookingData.patientId === customerId

                                  return (
                                    <button
                                      key={customerId}
                                      type="button"
                                      onClick={() => {
                                        setNewBookingData({
                                          ...newBookingData,
                                          patientId: customerId,
                                          newClientName: `${customer.first_name} ${customer.last_name}`.trim(),
                                          newClientPhone: customer.phone
                                        })
                                      }}
                                      className={cn(
                                        "w-full p-3 text-left transition-colors relative",
                                        isSelected
                                          ? "bg-primary/10 border-l-4 border-l-primary"
                                          : "hover:bg-muted/50"
                                      )}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium truncate">{customer.first_name} {customer.last_name}</p>
                                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                                          {customer.email && (
                                            <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                                          )}
                                        </div>
                                        {isSelected && (
                                          <Badge className="bg-primary text-white shrink-0">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm mb-2">No customers found</p>
                                <p className="text-xs">Try adjusting your search</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* New Customer Form */}
                      {newBookingData.isNewClient && (
                        <div className="space-y-3">
                          <div>
                            <Label>Customer Name *</Label>
                            <Input
                              placeholder="Full name"
                              value={newBookingData.newClientName}
                              onChange={(e) => setNewBookingData({ ...newBookingData, newClientName: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Phone Number *</Label>
                            <div className="flex gap-2">
                              <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium">
                                +62
                              </div>
                              <Input
                                placeholder="8123456789"
                                value={(newBookingData.newClientPhone || '').startsWith('+62') ? (newBookingData.newClientPhone || '').slice(3) : (newBookingData.newClientPhone || '')}
                                onChange={(e) => {
                                  const input = e.target.value.replace(/\D/g, '') // Only allow digits
                                  const fullPhone = input ? `+62${input}` : ''
                                  setNewBookingData({ ...newBookingData, newClientPhone: fullPhone })
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleSearchCustomerByPhone}
                                disabled={searchingCustomer || !newBookingData.newClientPhone || newBookingData.newClientPhone.length < 11}
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
                            <p className="text-xs text-gray-500 mt-1">
                              Enter phone number and click Search to check if customer exists.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Step 4: Payment Method */}
              {newBookingStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-[#C8B6FF]" />
                      </div>
                      Select Payment Method
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'cash', label: 'Cash', icon: Banknote, iconBg: 'bg-gradient-to-br from-green-400 to-emerald-500', iconColor: 'text-white' },
                        { value: 'card', label: 'Debit/Credit Card', icon: CreditCard, iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500', iconColor: 'text-white' },
                        { value: 'transfer', label: 'Bank Transfer', icon: Building2, iconBg: 'bg-gradient-to-br from-purple-400 to-violet-500', iconColor: 'text-white' },
                        { value: 'ewallet', label: 'E-Wallet', icon: Smartphone, iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500', iconColor: 'text-white' }
                      ].map((method) => (
                        <button
                          key={method.value}
                          onClick={() => setNewBookingData({ ...newBookingData, paymentMethod: method.value })}
                          className={cn(
                            "p-5 rounded-2xl border-2 text-left transition-all hover:shadow-lg hover:scale-105",
                            newBookingData.paymentMethod === method.value
                              ? "border-[#C8B6FF] bg-gradient-to-br from-[#FFD6FF]/30 to-[#E7C6FF]/30 shadow-lg scale-105"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          )}
                          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-md", method.iconBg)}>
                              <method.icon className={cn("h-8 w-8", method.iconColor)} />
                            </div>
                            <p className="font-bold text-gray-900 text-sm">{method.label}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 font-bold mb-2 block uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Notes (Optional)</label>
                    <textarea
                      value={newBookingData.notes}
                      onChange={(e) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                      placeholder="Add any special requests or notes..."
                      className="w-full h-28 p-4 border-2 border-gray-200 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#C8B6FF] font-medium text-gray-900"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Booking Summary */}
              {newBookingStep === 5 && (() => {
                const selectedTreatment = treatments.find(t => t.id === newBookingData.treatmentId)
                const selectedStaff = staff.find(s => s.id === newBookingData.staffId)
                const selectedPatient = patients.find(p => p.id === newBookingData.patientId)

                return (
                  <div className="space-y-6">
                    {/* Confirmation Header */}
                    <div className="text-center py-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Review Your Booking</h3>
                      <p className="text-gray-600 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Please confirm all details before creating the booking</p>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gradient-to-br from-[#FFD6FF]/30 to-[#E7C6FF]/30 rounded-2xl p-6 border-2 border-[#E7C6FF] shadow-lg">
                      <div className="space-y-4">
                        {/* Treatment */}
                        <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center flex-shrink-0 shadow-md">
                            <Star className="h-7 w-7 text-[#C8B6FF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Treatment</p>
                            <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{selectedTreatment?.name}</p>
                            <p className="text-sm text-gray-700 font-semibold mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{formatCurrency(selectedTreatment?.price || 0)} • {selectedTreatment?.durationMin} minutes</p>
                          </div>
                        </div>

                        {/* Staff */}
                        <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] flex items-center justify-center flex-shrink-0 text-white font-bold text-xl shadow-md">
                            {selectedStaff?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Staff Member</p>
                            <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{selectedStaff?.name}</p>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <Clock className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Appointment</p>
                            <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                              {format(new Date(newBookingData.date), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-gray-700 font-semibold mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{newBookingData.time}</p>
                          </div>
                        </div>

                        {/* Customer */}
                        <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="h-7 w-7 text-[#C8B6FF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Customer</p>
                            {newBookingData.isNewClient ? (
                              <>
                                <p className="font-bold text-gray-900 text-lg flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                  {newBookingData.newClientName}
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold">New</Badge>
                                </p>
                                <p className="text-sm text-gray-700 font-semibold mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{newBookingData.newClientPhone}</p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-gray-900 text-lg" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{selectedPatient?.name}</p>
                                <p className="text-sm text-gray-700 font-semibold mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{selectedPatient?.phone}</p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <DollarSign className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Payment Method</p>
                            <p className="font-bold text-gray-900 text-lg capitalize" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                              {newBookingData.paymentMethod === 'ewallet' ? 'E-Wallet' : newBookingData.paymentMethod === 'card' ? 'Debit/Credit Card' : newBookingData.paymentMethod === 'transfer' ? 'Bank Transfer' : 'Cash'}
                            </p>
                          </div>
                        </div>

                        {/* Notes */}
                        {newBookingData.notes && (
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Additional Notes</p>
                            <p className="text-sm text-gray-700 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{newBookingData.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Footer Actions */}
            <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
              {newBookingStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setNewBookingStep(newBookingStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {newBookingStep < 5 ? (
                <Button
                  onClick={() => setNewBookingStep(newBookingStep + 1)}
                  disabled={
                    (newBookingStep === 1 && !newBookingData.treatmentId) ||
                    (newBookingStep === 2 && !newBookingData.staffId) ||
                    (newBookingStep === 3 && (!newBookingData.date || !newBookingData.time || (!newBookingData.patientId && !newBookingData.isNewClient) || (newBookingData.isNewClient && (!newBookingData.newClientName || !newBookingData.newClientPhone)))) ||
                    (newBookingStep === 4 && !newBookingData.paymentMethod)
                  }
                  className="flex-1 bg-gradient-to-r from-[#C8B6FF] to-[#B8A6EF] hover:from-[#B8A6EF] hover:to-[#A896DF] text-white font-bold shadow-md"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={async () => {
                    try {
                      if (!outletId) {
                        toast({ title: "Outlet not found", variant: "destructive" })
                        return
                      }

                      const treatment = treatments.find(t => t.id === newBookingData.treatmentId)
                      const selectedCustomer = customers.find(c => (c._id || c.id) === newBookingData.patientId)

                      // Prepare booking data for appointments API
                      const bookingData: any = {
                        service_id: newBookingData.treatmentId,
                        staff_id: newBookingData.staffId,
                        outlet_id: outletId,
                        appointment_date: newBookingData.date,
                        start_time: newBookingData.time,
                        notes: newBookingData.notes || '',
                        payment_method: newBookingData.paymentMethod,
                        payment_type: 'full',
                        payment_amount: treatment?.price || 0,
                      }

                      // Handle customer
                      if (newBookingData.isNewClient) {
                        bookingData.newCustomer = {
                          name: newBookingData.newClientName,
                          phone: newBookingData.newClientPhone,
                          email: '',
                        }
                      } else {
                        bookingData.customer = {
                          customer_id: selectedCustomer?._id || selectedCustomer?.id || newBookingData.patientId,
                          name: `${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim(),
                          phone: selectedCustomer?.phone || '',
                          email: selectedCustomer?.email || '',
                        }
                      }

                      console.log('[Calendar] Creating appointment:', bookingData)

                      // Use the same completeWalkInBooking function as Walk-In
                      const result = await completeWalkInBooking(bookingData)

                      if (!result.success) {
                        throw new Error(result.error || 'Failed to create appointment')
                      }

                      toast({ title: "Appointment created successfully!" })
                      setNewBookingOpen(false)
                      setNewBookingStep(1)
                      setNewBookingData({
                        treatmentId: "",
                        patientId: "",
                        staffId: "",
                        date: "",
                        time: "",
                        paymentMethod: "cash",
                        isNewClient: false,
                        newClientName: "",
                        newClientPhone: "",
                        notes: ""
                      })

                      // Reload page to refresh appointments
                      window.location.reload()
                    } catch (error: any) {
                      console.error('[Calendar] Error creating appointment:', error)
                      toast({
                        title: "Failed to create appointment",
                        description: error.message,
                        variant: "destructive"
                      })
                    }
                  }}
                  disabled={!newBookingData.paymentMethod}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Create Appointment
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Cancel Appointment Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Cancel Appointment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </p>

              <div className="space-y-2">
                <Label htmlFor="cancellation-reason" className="text-sm font-medium">
                  Cancellation Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Please provide a reason for cancelling this appointment (required, max 500 characters)"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 text-right">
                  {cancellationReason.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelDialogOpen(false)
                    setCancellationReason("")
                  }}
                  disabled={isCancelling}
                  className="flex-1"
                >
                  Keep Appointment
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmCancellation}
                  disabled={isCancelling || !cancellationReason.trim()}
                  className="flex-1"
                >
                  {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reschedule Appointment Dialog */}
        <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
          <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-blue-600">
                <Clock className="h-5 w-5" />
                Reschedule Appointment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                Choose a new date and time for this appointment. Only available time slots are shown.
              </p>

              {/* BookingDateTime Component */}
              {selectedBooking && (() => {
                const staffMember = staff.find(s => s.id === selectedBooking.staffId)
                const treatment = treatments.find(t => t.id === selectedBooking.treatmentId)

                return (
                  <div className="space-y-4">
                    {/* Staff & Service Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">
                            {staffMember?.name} - {treatment?.name}
                          </p>
                          <p className="text-xs text-blue-700">
                            Duration: {treatment?.durationMin || 60} minutes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Date & Time Selection */}
                    {loadingRescheduleAvailability ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-gray-600">Loading available time slots...</p>
                        </div>
                      </div>
                    ) : rescheduleAvailabilityGrid ? (
                      <BookingDateTime
                        provider={{
                          name: staffMember?.display_name || staffMember?.name || "Staff",
                          address: "Beauty Clinic",
                          avatarUrl: staffMember?.profile_image_url
                        }}
                        selectedStaffId={selectedBooking.staffId}
                        existingBookings={bookings.filter(b => b.id !== selectedBooking.id).map(b => ({
                          bookingDate: (b as any).appointment_date || format(new Date(b.startAt), 'yyyy-MM-dd'),
                          timeSlot: (b as any).start_time || format(new Date(b.startAt), 'HH:mm'),
                          staffId: b.staffId
                        }))}
                        availabilityGrid={rescheduleAvailabilityGrid}
                        onSelectDateTime={(date, time) => {
                          setRescheduleData({ ...rescheduleData, new_date: date, new_time: time })
                        }}
                        onWeekChange={(newWeekStart) => {
                          setRescheduleWeekStart(newWeekStart)
                          fetchRescheduleAvailabilityGrid(newWeekStart)
                        }}
                        isLoading={loadingRescheduleAvailability}
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-dashed">
                        <p className="text-sm text-gray-600 text-center">
                          No availability data loaded. Please try again.
                        </p>
                      </div>
                    )}

                    {/* Reason Field */}
                    <div className="space-y-2">
                      <Label htmlFor="reschedule-reason" className="text-sm font-medium">
                        Reason (Optional)
                      </Label>
                      <Textarea
                        id="reschedule-reason"
                        placeholder="Reason for rescheduling (optional, max 500 characters)"
                        value={rescheduleData.reason}
                        onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                        rows={3}
                        maxLength={500}
                        className="resize-none"
                      />
                      <p className="text-xs text-gray-500 text-right">
                        {rescheduleData.reason.length}/500 characters
                      </p>
                    </div>
                  </div>
                )
              })()}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRescheduleDialogOpen(false)
                    setRescheduleData({ new_date: "", new_time: "", reason: "" })
                  }}
                  disabled={isRescheduling}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleConfirmReschedule}
                  disabled={isRescheduling || !rescheduleData.new_date || !rescheduleData.new_time}
                >
                  {isRescheduling ? "Rescheduling..." : "Reschedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Complete Dialog */}
        <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Complete Appointment
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                Mark this appointment as completed.
              </p>

              {/* Only render payment status after client mount to avoid hydration errors */}
              {isMounted && selectedBooking && (
                <>
                  {/* Payment Status - Simple Badge if Already Paid */}
                  {selectedBooking.payment_status === 'paid' ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <span className="font-medium">Payment Verified:</span> This appointment has been fully paid and is ready to be completed.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      {/* Payment Status Display - Only if Not Paid */}
                      <PaymentStatusDisplay
                        key={`payment-status-${paymentRefreshKey}`}
                        appointmentId={selectedBooking.id}
                        compact={true}
                        showHistory={false}
                        onStatusLoaded={(status) => setCompletePaymentStatus(status)}
                      />

                      {/* Payment Action Buttons - Show if there's remaining balance */}
                      {completePaymentStatus && completePaymentStatus.remaining_balance > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => setRecordPaymentDialogOpen(true)}
                            disabled={isCompleting}
                          >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Add Payment
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setPaymentLinkDialogOpen(true)}
                            disabled={isCompleting}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            Send Link
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Completion Notes */}
              <div className="space-y-2">
                <Label htmlFor="completion-notes" className="text-sm font-medium">
                  Completion Notes (Optional)
                </Label>
                <Textarea
                  id="completion-notes"
                  placeholder="Add any notes about the appointment completion (optional, max 1000 characters)"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 text-right">
                  {completionNotes.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCompleteDialogOpen(false)
                    setCompletionNotes("")
                    setCompletePaymentStatus(null)
                  }}
                  disabled={isCompleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirmComplete}
                  disabled={
                    isCompleting ||
                    // Only check payment status if not already paid
                    (selectedBooking?.payment_status !== 'paid' &&
                     completePaymentStatus &&
                     !completePaymentStatus.can_complete)
                  }
                >
                  {isCompleting ? "Completing..." : "Complete Appointment"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* No-Show Dialog */}
        <Dialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Mark as No-Show
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-gray-600">
                Mark this appointment as no-show when the customer doesn't arrive.
              </p>

              {/* No-Show Reason */}
              <div className="space-y-2">
                <Label htmlFor="no-show-reason" className="text-sm font-medium">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="no-show-reason"
                  placeholder="Add reason for no-show (optional, max 500 characters)"
                  value={noShowReason}
                  onChange={(e) => setNoShowReason(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 text-right">
                  {noShowReason.length}/500 characters
                </p>
              </div>

              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-xs text-orange-800">
                  <span className="font-medium">Note:</span> This will mark the appointment as no-show and release the time slot for new bookings. The reason will be appended to the appointment notes.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setNoShowDialogOpen(false)
                    setNoShowReason("")
                  }}
                  disabled={isMarkingNoShow}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={handleConfirmNoShow}
                  disabled={isMarkingNoShow}
                >
                  {isMarkingNoShow ? "Marking..." : "Mark as No-Show"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        {selectedBooking && completePaymentStatus && (
          <RecordPaymentDialog
            open={recordPaymentDialogOpen}
            onOpenChange={setRecordPaymentDialogOpen}
            appointmentId={selectedBooking.id}
            totalAmount={completePaymentStatus.total_amount}
            paidAmount={completePaymentStatus.paid_amount}
            remainingBalance={completePaymentStatus.remaining_balance}
            onSuccess={() => {
              // Refresh payment status after successful payment
              setPaymentRefreshKey((prev) => prev + 1)
              toast({
                title: "Payment recorded successfully",
                description: "The payment has been recorded and appointment status updated."
              })
            }}
          />
        )}

        {/* Create Payment Link Dialog */}
        {selectedBooking && completePaymentStatus && (
          <CreatePaymentLinkDialog
            open={paymentLinkDialogOpen}
            onOpenChange={setPaymentLinkDialogOpen}
            appointmentId={selectedBooking.id}
            remainingBalance={completePaymentStatus.remaining_balance}
            customerEmail={selectedBooking.patientEmail}
            customerPhone={selectedBooking.patientPhone}
            onSuccess={(response) => {
              // Refresh payment status after payment link created
              setPaymentRefreshKey((prev) => prev + 1)
              toast({
                title: "Payment link created",
                description: `Payment link sent via ${response.payment_link.sent_via.join(', ')}. Customer can now pay online.`,
                duration: 5000
              })
            }}
          />
        )}
      </div>
    </MainLayout>
  )
}

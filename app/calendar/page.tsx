"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useBookings, usePatients, useStaff, useTreatments } from "@/lib/context"
import { formatCurrency, cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
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
  UserPlus,
  RefreshCw,
} from "lucide-react"
import { AddButton } from "@/components/ui/add-button"
import GradientLoading from "@/components/gradient-loading"
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
  const searchParams = useSearchParams()

  const { bookings = [], loading, updateBooking, deleteBooking, rescheduleBooking, completeBooking, markNoShowBooking, reloadBookings } = useBookings()
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

  // Payment options dialog state (after appointment created)
  const [paymentOptionsDialogOpen, setPaymentOptionsDialogOpen] = useState(false)
  const [pendingAppointment, setPendingAppointment] = useState<any>(null)

  // Fix hydration error - only render after client mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check for query params to auto-open new booking dialog
  useEffect(() => {
    if (isMounted && searchParams) {
      const action = searchParams.get('action')
      const source = searchParams.get('source')

      if (action === 'create') {
        // Auto-open new booking dialog
        setNewBookingOpen(true)

        // If coming from walk-in, could set some defaults here
        if (source === 'walk-in') {
          // Could set default values for walk-in appointments
          console.log('[Calendar] Opening create dialog from walk-in menu')
        }
      }
    }
  }, [isMounted, searchParams])

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
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false)
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
  const [staffSearch, setStaffSearch] = useState("")

  // Availability grid state (for booking flow)
  const [availabilityGrid, setAvailabilityGrid] = useState<any>(null)
  const [loadingNewBookingAvailability, setLoadingNewBookingAvailability] = useState(false)
  const [outletId, setOutletId] = useState<string | null>(null)
  const [weekStart, setWeekStart] = useState(startOfDay(new Date()))

  // Customer API state (for booking flow)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersError, setCustomersError] = useState<string | null>(null)
  const [searchingCustomer, setSearchingCustomer] = useState(false)
  const [customerSearchResult, setCustomerSearchResult] = useState<'not_searched' | 'found' | 'not_found'>('not_searched')
  const [customerConfirmed, setCustomerConfirmed] = useState(false)

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
          ((b as any).customer_name || b.patientName)?.toLowerCase().includes(search) ||
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

  // Fetch availability grid from API (real-time, no caching)
  const fetchAvailabilityGrid = async (serviceId: string, staffId: string, startDate: string) => {
    if (!serviceId || !staffId || !outletId) return

    // Get selected treatment to use its duration
    const selectedTreatment = treatments.find(t => t.id === serviceId)
    const slotInterval = selectedTreatment?.durationMin || (selectedTreatment as any)?.duration_minutes || 30

    setLoadingNewBookingAvailability(true)
    try {
      console.log('[Calendar] Fetching availability grid from API (real-time):', {
        serviceId,
        staffId,
        startDate,
        slotInterval
      })

      const response = await fetch(
        `/api/availability/grid?` +
        `service_id=${serviceId}&` +
        `staff_id=${staffId}&` +
        `outlet_id=${outletId}&` +
        `start_date=${startDate}&` +
        `num_days=7&` +
        `slot_interval_minutes=${slotInterval}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch availability')
      }

      const data = await response.json()
      console.log('[Calendar] Availability grid loaded (real-time):', data)

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

  // Reset weekStart and clear cache when service or staff changes
  useEffect(() => {
    // Reset to today when service or staff changes
    setWeekStart(startOfDay(new Date()))
    console.log('[Calendar] Service/Staff changed - Reset weekStart to today and cleared cache')
  }, [newBookingData.treatmentId, newBookingData.staffId])

  // Trigger availability grid fetch when treatment and staff are selected
  useEffect(() => {
    if (newBookingData.treatmentId && newBookingData.staffId && outletId) {
      // Use today's date or week start, whichever is later
      const today = startOfDay(new Date())
      const weekStartDay = startOfDay(weekStart)
      const startDate = weekStartDay < today ? today : weekStartDay
      const startDateStr = format(startDate, 'yyyy-MM-dd')

      console.log('[Calendar] useEffect triggered - Fetching availability grid:', {
        treatmentId: newBookingData.treatmentId,
        staffId: newBookingData.staffId,
        weekStart: format(weekStart, 'yyyy-MM-dd'),
        startDate: startDateStr,
        today: format(today, 'yyyy-MM-dd')
      })

      fetchAvailabilityGrid(newBookingData.treatmentId, newBookingData.staffId, startDateStr)
    } else {
      console.log('[Calendar] useEffect skipped - Missing data:', {
        hasTreatment: !!newBookingData.treatmentId,
        hasStaff: !!newBookingData.staffId,
        hasOutlet: !!outletId
      })
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

  // Reset customer confirmation state when phone changes, when switching tabs, or when dialog closes
  useEffect(() => {
    if (!newBookingOpen) {
      // Reset when dialog closes
      setCustomerSearchResult('not_searched')
      setCustomerConfirmed(false)
    } else {
      // Reset when phone number changes or switching to new client tab
      if (newBookingData.isNewClient) {
        setCustomerSearchResult('not_searched')
        setCustomerConfirmed(false)
      }
    }
  }, [newBookingOpen, newBookingData.newClientPhone, newBookingData.isNewClient])

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
    setCustomerSearchResult('not_searched')
    setCustomerConfirmed(false)

    try {
      const results = await searchCustomers(newBookingData.newClientPhone)

      if (results && results.length > 0) {
        const existingCustomer = results[0]
        // Found existing customer - auto-fill data, switch to existing, and mark as confirmed
        setNewBookingData({
          ...newBookingData,
          newClientName: `${existingCustomer.first_name} ${existingCustomer.last_name}`.trim(),
          patientId: existingCustomer._id || existingCustomer.id || existingCustomer.customer_id,
          isNewClient: false // Switch to existing customer
        })
        setCustomerSearchResult('found')
        setCustomerConfirmed(true) // Auto-confirm for existing customers
        toast({
          title: "Customer Found!",
          description: `${existingCustomer.first_name} ${existingCustomer.last_name} - Ready to proceed`,
        })
      } else {
        // Not found - show confirmation button
        setCustomerSearchResult('not_found')
        setCustomerConfirmed(false)
        toast({
          title: "Customer Not Found",
          description: "Please confirm to create a new customer profile",
        })
      }
    } catch (error: any) {
      console.error('[Calendar] Customer search error:', error)
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

  // Confirm creating new customer - Actually create the customer
  const handleConfirmNewCustomer = async () => {
    if (!newBookingData.newClientName || !newBookingData.newClientPhone) {
      toast({
        title: "Missing information",
        description: "Please fill in name and phone number",
        variant: "destructive"
      })
      return
    }

    setSearchingCustomer(true)
    try {
      // Create the customer via API
      const response = await createCustomer({
        name: newBookingData.newClientName,
        phone: newBookingData.newClientPhone,
        email: newBookingData.newClientEmail || '',
      })

      // Handle response - API returns customer object directly or wrapped in { customer: {...} }
      const customer = (response as any).customer || response
      const customerId = customer._id || customer.id

      if (customerId) {
        // Set the customer as selected
        setNewBookingData({
          ...newBookingData,
          patientId: customerId,
          isNewClient: false, // Switch to existing mode
        })

        // Add to customers list
        setCustomers(prev => [customer, ...prev])

        setCustomerConfirmed(true)
        setCustomerSearchResult('found')

        toast({
          title: "Customer created successfully!",
          description: `${newBookingData.newClientName} has been added to your customer list.`,
        })
      } else {
        throw new Error('Failed to create customer - no customer ID returned')
      }
    } catch (error: any) {
      console.error('[Calendar] Error creating customer:', error)
      toast({
        title: "Failed to create customer",
        description: error.message || "Please try again",
        variant: "destructive"
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
          <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="text-xs bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return (
          <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            {paymentStatus}
          </Badge>
        )
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
      // Get selected treatment to use its duration
      const selectedTreatment = treatments.find(t => t.id === treatmentId)
      const slotInterval = selectedTreatment?.durationMin || (selectedTreatment as any)?.duration_minutes || 30

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
          `slot_interval_minutes=${slotInterval}`
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

    // Get selected treatment to use its duration
    const selectedTreatment = treatments.find(t => t.id === treatmentId)
    const slotInterval = selectedTreatment?.durationMin || (selectedTreatment as any)?.duration_minutes || 30

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
        `slot_interval_minutes=${slotInterval}`
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

  // Refresh appointment data from API
  const refreshAppointmentData = async (appointmentId: string) => {
    try {
      console.log('[Calendar] Refreshing appointment data:', appointmentId)
      const response = await apiClient.getAppointmentById(appointmentId)

      if (response) {
        // Update selectedBooking with fresh data
        const updatedBooking = {
          ...selectedBooking!,
          payment_status: response.payment_status,
          paymentStatus: response.payment_status, // Keep both fields in sync
          status: response.status,
          // Update other fields as needed
        }
        setSelectedBooking(updatedBooking)
        console.log('[Calendar] Appointment data refreshed. Payment status:', response.payment_status)
        return updatedBooking
      }
    } catch (error) {
      console.error('[Calendar] Failed to refresh appointment data:', error)
      toast({
        title: "Failed to refresh data",
        description: "Please close and reopen the dialog to see updated payment status",
        variant: "destructive"
      })
    }
    return null
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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await reloadBookings()
      toast({
        title: "Refreshed successfully",
        description: "Appointment list has been updated"
      })
    } catch (error: any) {
      console.error('Failed to refresh bookings:', error)
      toast({
        title: "Failed to refresh",
        description: error.message || "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <GradientLoading />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-500 mt-1">Manage your bookings and schedule</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-gray-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <AddButton onClick={handleNewBookingFromButton}>
              New Booking
            </AddButton>
          </div>
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
                    <Banknote className="h-4 w-4 text-gray-500" />
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
                        isCurrentDay && "ring-2 ring-[#8B5CF6]",
                        selectedDate && isSameDay(day, selectedDate) && "bg-gradient-to-br from-[#FCD6F5]/30 to-[#EDE9FE]/30 shadow-md"
                      )}
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#FCD6F5]/0 to-[#EDE9FE]/0 group-hover:from-[#FCD6F5]/10 group-hover:to-[#EDE9FE]/10 transition-all" />

                      <div className="relative">
                        {/* Date header */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn(
                            "text-sm font-semibold",
                            isCurrentDay ? "bg-[#8B5CF6] text-white px-2.5 py-1 rounded-full" : "text-gray-700",
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
                                    {(booking as any).customer_name || booking.patientName || "Unknown"}
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
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#C4B5FD]/20 rounded-lg">
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
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FCD6F5]/20 to-[#EDE9FE]/20">
                      <TableHead className="w-12">
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
                      </TableHead>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBookings.map((booking) => {
                      const customerData = booking.customer
                      const patient = customerData ? {
                        ...customerData,
                        id: customerData._id || customerData.id,
                        name: (booking as any).customer_name || `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || booking.patientName || 'Unknown',
                        phone: customerData.phone || booking.patientPhone,
                        email: customerData.email || booking.patientEmail,
                      } : {
                        id: booking.patientId,
                        name: (booking as any).customer_name || booking.patientName,
                        phone: booking.patientPhone,
                        email: booking.patientEmail,
                      }
                      const treatment = treatments.find(t => t.id === booking.treatmentId)
                      const staffMember = staff.find(s => s.id === booking.staffId)

                      return (
                        <TableRow key={booking.id} className="hover:bg-[#FCD6F5]/10 transition-colors">
                          <TableCell className="py-3 px-4">
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
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm font-mono text-gray-600">
                            #{booking.id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center text-sm font-semibold">
                                {patient?.name?.charAt(0) || "?"}
                              </div>
                              <span className="text-sm font-medium">{patient?.name || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-gray-600">{treatment?.name || "Unknown"}</TableCell>
                          <TableCell className="py-3 px-4 text-sm text-gray-600">
                            {format(new Date(booking.startAt), "MMM dd, yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-gray-600">{staffMember?.name || "Unassigned"}</TableCell>
                          <TableCell className="py-3 px-4">
                            <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            {getPaymentStatusBadge((booking as any).payment_status)}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm font-medium">{formatCurrency(treatment?.price || 0)}</TableCell>
                          <TableCell className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDetails(booking)}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
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
                              tablePage === pageNum && "bg-[#8B5CF6] hover:bg-[#B8A6EF]"
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
                  <p className="text-2xl font-bold text-[#8B5CF6]">
                    {selectedDate && getBookingsForDate(selectedDate).length}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => selectedDate && handleNewBookingFromCalendar(selectedDate)}
                className="w-full bg-[#8B5CF6] hover:bg-[#B8A6EF] text-white h-11 font-medium"
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
                          isExpanded ? "border-[#8B5CF6] shadow-lg mb-2" : "border-gray-100 hover:border-gray-200 hover:shadow-md"
                        )}
                      >
                        {/* Time Badge */}
                        <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-[#FCD6F5]/40 to-[#EDE9FE]/40 flex-shrink-0">
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
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center border-2 border-white text-xs font-bold text-gray-700 shadow-sm"
                              >
                                {((booking as any).customer_name || booking.patientName)?.charAt(0)?.toUpperCase() || "?"}
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
                          isExpanded && "rotate-90 text-[#8B5CF6]"
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
                              name: (booking as any).customer_name || `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || booking.patientName || 'Unknown',
                              phone: customerData.phone || booking.patientPhone,
                              email: customerData.email || booking.patientEmail,
                            } : {
                              id: booking.patientId,
                              name: (booking as any).customer_name || booking.patientName,
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
                                    className="flex-1 bg-white border border-gray-100 hover:border-[#EDE9FE] cursor-pointer hover:shadow-lg transition-all"
                                    onClick={() => handleOpenDetails(booking)}
                                  >
                                    <CardContent className="p-4">
                                      {/* Header */}
                                      <div className="flex items-start gap-3 mb-3">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-700 shadow">
                                          {patient?.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-900 truncate">
                                            {patient?.name || "Unknown"}
                                          </h4>
                                          <p className="text-xs text-gray-400 truncate">{patient?.email || "No email"}</p>
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                          <Badge className={cn("text-[10px] px-2 py-0.5 font-medium", getStatusColor(booking.status))}>
                                            {booking.status}
                                          </Badge>
                                          {getPaymentStatusBadge((booking as any).payment_status)}
                                        </div>
                                      </div>

                                      {/* Details Grid */}
                                      <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                          <Star className="h-3.5 w-3.5 text-[#8B5CF6] flex-shrink-0" />
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
                                          <Banknote className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
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
          <DialogContent className="min-w-[960px] max-w-[1200px] w-[90vw] h-[90vh] flex flex-col overflow-hidden p-0">
            {selectedBooking && (() => {
              // Use customer data directly from booking (already populated in context)
              const customerData = selectedBooking.customer
              const patient = customerData ? {
                ...customerData,
                id: customerData._id || customerData.id,
                name: (selectedBooking as any).customer_name || `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim() || selectedBooking.patientName || 'Unknown',
                phone: customerData.phone || selectedBooking.patientPhone,
                email: customerData.email || selectedBooking.patientEmail,
              } : {
                id: selectedBooking.patientId,
                name: (selectedBooking as any).customer_name || selectedBooking.patientName,
                phone: selectedBooking.patientPhone,
                email: selectedBooking.patientEmail,
              }
              const treatment = treatments.find(t => t.id === selectedBooking.treatmentId)
              const staffMember = staff.find(s => s.id === selectedBooking.staffId)

              return (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="sticky top-0 bg-white z-10 pb-3 pt-6 px-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 font-medium">Booking ID #{selectedBooking.id?.slice(0, 8).toUpperCase() || 'N/A'}</span>
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

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    {/* Patient Info Card */}
                    <div className="bg-gradient-to-br from-[#FCD6F5]/10 to-[#EDE9FE]/10 rounded-xl p-4 border border-[#FCD6F5]/30">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center text-xl font-bold text-gray-700 shadow flex-shrink-0">
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
                        <div className="w-10 h-10 rounded-lg bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                          <Star className="h-4 w-4 text-[#8B5CF6]" />
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
                        <div className="w-1 h-3 bg-[#8B5CF6] rounded-full"></div>
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
                          <div className="w-1 h-3 bg-[#8B5CF6] rounded-full"></div>
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
                  <div className="sticky bottom-0 bg-white z-10 pt-3 pb-6 px-6 border-t border-gray-100 flex items-center gap-3">
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
                          className="flex-1 h-10 bg-[#8B5CF6] hover:bg-[#B8A6EF] text-white text-sm font-medium"
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
                          className="flex-1 h-10 bg-[#8B5CF6] hover:bg-[#B8A6EF] text-white text-sm font-medium"
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

        {/* New Booking Dialog - Modern Wide Layout */}
        <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
          <DialogContent className="max-w-[1120px] w-[90vw] min-w-[960px] h-[92vh] flex flex-col overflow-hidden bg-white p-0 gap-0 rounded-2xl shadow-2xl">
            {/* Header - Sticky */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50/40 via-purple-50/30 to-pink-50/40 backdrop-blur-sm">
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                Book appointment
              </DialogTitle>
              <button
                onClick={() => setNewBookingOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-lg hover:bg-white/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto px-7 py-6">
              {/* Top Bar: Customer, Service, Staff - 12 Column Grid */}
              <div className="grid grid-cols-12 gap-6 mb-8">
                {/* Customer Selection - 4 cols */}
                <div className="col-span-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-800">Customer</Label>
                    <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setNewBookingData({ ...newBookingData, isNewClient: false, patientId: "", newClientName: "", newClientPhone: "" })}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-md transition-all",
                          !newBookingData.isNewClient
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        Existing
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewBookingData({ ...newBookingData, isNewClient: true, patientId: "" })}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-md transition-all",
                          newBookingData.isNewClient
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        )}
                      >
                        New
                      </button>
                    </div>
                  </div>

                  {!newBookingData.isNewClient ? (
                    <div className="relative">
                      {!newBookingData.patientId ? (
                        <>
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                          <Input
                            placeholder="Search by name or phone..."
                            value={clientSearch}
                            onChange={(e) => handleCustomerSearch(e.target.value)}
                            onFocus={() => {
                              setCustomerDropdownOpen(true)
                              // Load customers when focused if not already loaded
                              if (customers.length === 0 && !loadingCustomers) {
                                loadInitialCustomers()
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on dropdown item
                              setTimeout(() => setCustomerDropdownOpen(false), 200)
                            }}
                            className="pl-10 h-11 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                          />

                          {/* Recent/Search Dropdown - Show when focused */}
                          {customerDropdownOpen && !newBookingData.patientId && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-20">
                              {loadingCustomers ? (
                                <div className="p-4 text-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                                  <p className="text-xs text-gray-500">Loading...</p>
                                </div>
                              ) : customers.length > 0 ? (
                                <div className="py-1">
                                  {/* Show label for recent vs search results */}
                                  {!clientSearch && (
                                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                      Recent Customers
                                    </div>
                                  )}
                                  {customers.slice(0, 8).map((customer) => {
                                    const customerId = customer._id || customer.id || ""
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
                                          setClientSearch("")
                                        }}
                                        className="group relative w-full px-3 py-2 hover:bg-indigo-50 transition-colors flex items-center gap-2.5 text-left"
                                      >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                          {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 truncate">
                                            {customer.first_name} {customer.last_name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate">{customer.phone}</p>
                                        </div>

                                        {/* Hover Tooltip */}
                                        <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block">
                                          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 min-w-[200px] max-w-[280px]">
                                            <div className="space-y-1.5">
                                              <div>
                                                <p className="font-semibold text-sm">{customer.first_name} {customer.last_name}</p>
                                              </div>
                                              <div className="space-y-0.5 text-gray-300">
                                                <p>📱 {customer.phone}</p>
                                                {customer.email && <p>✉️ {customer.email}</p>}
                                                {customer.address && <p>📍 {customer.address}</p>}
                                                {customer.date_of_birth && <p>🎂 {customer.date_of_birth}</p>}
                                              </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                                          </div>
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-sm text-gray-500 mb-3">No customers found</p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setNewBookingData({ ...newBookingData, isNewClient: true })
                                    }}
                                    className="text-xs"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add new customer
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (() => {
                        // Selected Customer Chip
                        const selectedCustomer = customers.find(c => (c._id || c.id) === newBookingData.patientId)
                        return selectedCustomer && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50/60 border border-indigo-200 rounded-lg">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {selectedCustomer.first_name?.charAt(0)}{selectedCustomer.last_name?.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-900 flex-1 truncate">
                              {selectedCustomer.first_name} {selectedCustomer.last_name} · <span className="text-indigo-600">{selectedCustomer.phone}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setNewBookingData({ ...newBookingData, patientId: "", newClientName: "", newClientPhone: "" })
                                setClientSearch("")
                              }}
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline flex-shrink-0"
                            >
                              Change
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {/* Name Input */}
                      <div>
                        <Input
                          placeholder="Full name *"
                          value={newBookingData.newClientName}
                          onChange={(e) => setNewBookingData({ ...newBookingData, newClientName: e.target.value })}
                          className="h-11 text-sm border-gray-300 focus:border-indigo-500"
                        />
                      </div>

                      {/* Phone Input with Search */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex items-center px-3 border border-gray-300 bg-gray-50 rounded-md text-sm font-medium text-gray-600 h-11">
                            +62
                          </div>
                          <Input
                            placeholder="81xxxxxxxxx"
                            value={(newBookingData.newClientPhone || '').startsWith('+62') ? (newBookingData.newClientPhone || '').slice(3) : (newBookingData.newClientPhone || '')}
                            onChange={(e) => {
                              const input = e.target.value.replace(/\D/g, '') // Only allow digits
                              const fullPhone = input ? `+62${input}` : ''
                              setNewBookingData({ ...newBookingData, newClientPhone: fullPhone })
                              // Reset search result when phone changes
                              if (customerSearchResult !== 'not_searched') {
                                setCustomerSearchResult('not_searched')
                                setCustomerConfirmed(false)
                              }
                            }}
                            className="flex-1 h-11 text-sm border-gray-300 focus:border-indigo-500"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSearchCustomerByPhone}
                            disabled={searchingCustomer || !newBookingData.newClientPhone || newBookingData.newClientPhone.length < 11}
                            className="h-11 px-4 text-sm flex-shrink-0"
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

                        {/* Search Result Messages */}
                        {customerSearchResult === 'found' && (
                          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-900">Customer found!</p>
                              <p className="text-xs text-green-700 mt-0.5">This phone number is already registered. Using existing customer data.</p>
                            </div>
                          </div>
                        )}
                        {customerSearchResult === 'not_found' && !customerConfirmed && (
                          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-900">Customer not found</p>
                              <p className="text-xs text-amber-700 mt-0.5 mb-2">This phone number is not registered yet.</p>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleConfirmNewCustomer}
                                disabled={searchingCustomer}
                                className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {searchingCustomer ? (
                                  <>
                                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                    Creating Customer...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="h-3 w-3 mr-1.5" />
                                    Confirm as New Customer
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                        {customerSearchResult === 'not_found' && customerConfirmed && (
                          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-900">Confirmed as new customer</p>
                              <p className="text-xs text-green-700 mt-0.5">Customer profile will be created when booking is completed.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Email Input (Optional) */}
                      <div>
                        <Input
                          type="email"
                          placeholder="Email (optional)"
                          value={newBookingData.newClientEmail || ''}
                          onChange={(e) => setNewBookingData({ ...newBookingData, newClientEmail: e.target.value })}
                          className="h-11 text-sm border-gray-300 focus:border-indigo-500"
                        />
                      </div>

                      {customerSearchResult === 'not_searched' && (
                        <p className="text-xs text-gray-500 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                          Please search phone number to verify customer
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Service Selection - 4 cols */}
                <div className="col-span-4 space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Service</Label>
                  {!newBookingData.treatmentId ? (
                    <div className="relative">
                      <Select
                        value={newBookingData.treatmentId}
                        onValueChange={(value) => setNewBookingData({ ...newBookingData, treatmentId: value, staffId: "", date: "", time: "" })}
                      >
                        <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {/* Search Input */}
                          <div className="px-2 pb-2 sticky top-0 bg-white z-10 border-b">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search services..."
                                value={treatmentSearch}
                                onChange={(e) => setTreatmentSearch(e.target.value)}
                                className="pl-9 h-9 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          {/* Filtered Results */}
                          {(() => {
                            const filtered = treatments
                              .filter(t => t.status === "active")
                              .filter(t =>
                                t.name.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
                                t.category?.toLowerCase().includes(treatmentSearch.toLowerCase())
                              )
                            return filtered.length > 0 ? (
                              filtered.map((treatment) => (
                                <SelectItem key={treatment.id} value={treatment.id} className="group relative text-sm py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <Star className="h-4 w-4 text-[#8B5CF6] flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate text-sm">{treatment.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {formatCurrency(treatment.price)} · {treatment.duration || treatment.durationMin} min
                                      </p>
                                    </div>
                                  </div>

                                  {/* Hover Tooltip */}
                                  <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block pointer-events-none">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[220px] max-w-[300px]">
                                      <div className="space-y-1.5">
                                        <div>
                                          <p className="font-semibold text-sm text-purple-300">{treatment.name}</p>
                                          {treatment.category && (
                                            <p className="text-xs text-gray-400 mt-0.5">{treatment.category}</p>
                                          )}
                                        </div>
                                        <div className="space-y-0.5 text-gray-300">
                                          <p>💰 {formatCurrency(treatment.price)}</p>
                                          <p>⏱️ {treatment.duration || treatment.durationMin} minutes</p>
                                          {treatment.description && (
                                            <p className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-700">{treatment.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      {/* CSS Arrow pointing back */}
                                      <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-6 text-center text-sm text-gray-500">
                                No services found
                              </div>
                            )
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (() => {
                    const selected = treatments.find(t => t.id === newBookingData.treatmentId)
                    return selected && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#EDE9FE]/60 border border-[#C4B5FD] rounded-lg">
                        <Star className="h-4 w-4 text-[#8B5CF6] flex-shrink-0" />
                        <span className="text-sm text-gray-900 flex-1 truncate">
                          {selected.name} · <span className="text-[#8B5CF6]">{formatCurrency(selected.price)}</span> · {selected.duration || selected.durationMin} min
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewBookingData({ ...newBookingData, treatmentId: "", staffId: "", date: "", time: "" })}
                          className="text-xs font-medium text-[#8B5CF6] hover:text-[#6D28D9] hover:underline flex-shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    )
                  })()}
                </div>

                {/* Staff Selection - 4 cols */}
                <div className="col-span-4 space-y-2">
                  <Label className="text-sm font-semibold text-gray-800">Staff</Label>
                  {!newBookingData.staffId ? (
                    <div className="relative">
                      <Select
                        value={newBookingData.staffId}
                        onValueChange={(value) => setNewBookingData({ ...newBookingData, staffId: value, date: "", time: "" })}
                        disabled={!newBookingData.treatmentId}
                      >
                        <SelectTrigger className="h-11 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50">
                          <SelectValue placeholder={!newBookingData.treatmentId ? "Select service first" : "Select staff member"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          {/* Search Input */}
                          <div className="px-2 pb-2 sticky top-0 bg-white z-10 border-b">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                placeholder="Search staff..."
                                value={staffSearch}
                                onChange={(e) => setStaffSearch(e.target.value)}
                                className="pl-9 h-9 text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                          {/* Filtered Results */}
                          {(() => {
                            const treatment = treatments.find(t => t.id === newBookingData.treatmentId)
                            let availableStaff = treatment?.staffIds?.length
                              ? staff.filter(s => treatment.staffIds.includes(s.id))
                              : staff

                            // Apply search filter
                            const filtered = availableStaff.filter(s =>
                              s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                              s.role?.toLowerCase().includes(staffSearch.toLowerCase()) ||
                              s.email?.toLowerCase().includes(staffSearch.toLowerCase())
                            )

                            return filtered.length > 0 ? (
                              filtered.map((member) => (
                                <SelectItem key={member.id} value={member.id} className="group relative text-sm py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                      {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{member.name}</p>
                                      <p className="text-xs text-gray-500 truncate">{member.role || 'Staff'}</p>
                                    </div>
                                  </div>

                                  {/* Hover Tooltip */}
                                  <div className="absolute left-full ml-2 top-0 z-50 hidden group-hover:block pointer-events-none">
                                    <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-3 min-w-[220px] max-w-[300px]">
                                      <div className="space-y-1.5">
                                        <div>
                                          <p className="font-semibold text-sm text-blue-300">{member.name}</p>
                                          <p className="text-xs text-gray-400 mt-0.5">{member.role || 'Staff'}</p>
                                        </div>
                                        <div className="space-y-0.5 text-gray-300">
                                          {member.email && <p>✉️ {member.email}</p>}
                                          {member.phone && <p>📱 {member.phone}</p>}
                                          {member.specialties && member.specialties.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-1 pt-1 border-t border-gray-700">
                                              <span className="font-medium">Specialties:</span> {member.specialties.join(', ')}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      {/* CSS Arrow pointing back */}
                                      <div className="absolute right-full top-3 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <div className="py-6 text-center text-sm text-gray-500">
                                No staff found
                              </div>
                            )
                          })()}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (() => {
                    const selectedStaff = staff.find(s => s.id === newBookingData.staffId)
                    return selectedStaff && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/60 border border-blue-200 rounded-lg">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {selectedStaff.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900 flex-1 truncate">
                          {selectedStaff.name} · <span className="text-blue-600">{selectedStaff.role || 'Staff'}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewBookingData({ ...newBookingData, staffId: "", date: "", time: "" })}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* Availability Section - Show when service and staff selected */}
              {newBookingData.treatmentId && newBookingData.staffId && (
                <div className="space-y-5">
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Select Date & Time</h3>
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      {loadingNewBookingAvailability ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-indigo-600"></div>
                            <p className="text-sm font-medium text-gray-600">Loading available time slots...</p>
                          </div>
                        </div>
                      ) : (
                        <BookingDateTime
                          provider={{
                            name: staff.find(s => s.id === newBookingData.staffId)?.display_name || staff.find(s => s.id === newBookingData.staffId)?.first_name || "Staff",
                            address: "Beauty Clinic",
                            avatarUrl: staff.find(s => s.id === newBookingData.staffId)?.profile_image_url
                          }}
                          selectedStaffId={newBookingData.staffId}
                          existingBookings={bookings.map(b => ({
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
                      )}
                    </div>
                    {newBookingData.date && newBookingData.time && (
                      <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide mb-0.5">Selected Time</p>
                          <p className="text-sm font-semibold text-indigo-900">
                            {format(new Date(newBookingData.date), 'EEEE, MMMM d, yyyy')} at {newBookingData.time}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div className="space-y-3 mt-8 pb-4">
                <Label className="text-sm font-semibold text-gray-800">Additional Notes (Optional)</Label>
                <Textarea
                  placeholder="Add any special requests or instructions..."
                  value={newBookingData.notes}
                  onChange={(e) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                  rows={3}
                  className="text-sm resize-none border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Footer - Sticky with Clear All and Book Now */}
            <div className="sticky bottom-0 z-10 border-t border-gray-200 px-7 py-5 bg-gradient-to-r from-gray-50 to-gray-100/80 backdrop-blur-sm flex items-center justify-between gap-4">
              {/* Clear All Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
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
                  setClientSearch("")
                  setCustomerSearchResult('not_searched')
                  setCustomerConfirmed(false)
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 px-4"
              >
                CLEAR ALL
              </Button>

              {/* Book Now Button */}
              <Button
                onClick={async () => {
                  setIsCreatingAppointment(true)
                  try {
                    // Validation
                    if (!newBookingData.patientId && !newBookingData.isNewClient) {
                      toast({ title: "Please select or create a customer", variant: "destructive" })
                      setIsCreatingAppointment(false)
                      return
                    }
                    if (newBookingData.isNewClient && (!newBookingData.newClientName || !newBookingData.newClientPhone)) {
                      toast({ title: "Please complete customer information", variant: "destructive" })
                      setIsCreatingAppointment(false)
                      return
                    }
                    if (!newBookingData.treatmentId) {
                      toast({ title: "Please select a service", variant: "destructive" })
                      setIsCreatingAppointment(false)
                      return
                    }
                    if (!newBookingData.staffId) {
                      toast({ title: "Please select a staff member", variant: "destructive" })
                      setIsCreatingAppointment(false)
                      return
                    }
                    if (!newBookingData.date || !newBookingData.time) {
                      toast({ title: "Please select date and time", variant: "destructive" })
                      setIsCreatingAppointment(false)
                      return
                    }
                    if (!outletId) {
                      toast({ title: "Outlet not found", variant: "destructive" })
                      setIsCreatingAppointment(false)
                      return
                    }

                    const treatment = treatments.find(t => t.id === newBookingData.treatmentId)
                    const selectedCustomer = customers.find(c => (c._id || c.id) === newBookingData.patientId)

                    // Prepare booking data for appointments API (without payment)
                    const bookingData: any = {
                      service_id: newBookingData.treatmentId,
                      staff_id: newBookingData.staffId,
                      outlet_id: outletId,
                      appointment_date: newBookingData.date,
                      start_time: newBookingData.time,
                      notes: newBookingData.notes || '',
                      // Payment will be handled separately after appointment creation
                      payment_method: 'cash', // Default value required by API
                      payment_type: 'full',
                      payment_amount: 0, // Will be updated when payment is recorded
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

                    console.log('[Calendar] Create appointment result:', result)

                    if (!result.success) {
                      throw new Error(result.error || 'Failed to create appointment')
                    }

                    // Extract appointment ID from result - try multiple possible fields
                    const appointmentId = result.appointment?.appointment_id ||
                                        result.appointment?.id ||
                                        result.appointment?._id ||
                                        result.appointment_id ||
                                        result.id ||
                                        result._id

                    console.log('[Calendar] Extracted appointment ID:', appointmentId)

                    if (!appointmentId) {
                      console.error('[Calendar] Failed to extract appointment ID from result:', result)
                      throw new Error('Failed to get appointment ID from server response')
                    }

                    toast({
                      title: "Appointment created successfully!",
                      description: "Choose payment option..."
                    })

                    // Close new booking dialog
                    setNewBookingOpen(false)

                    // Save appointment data for payment options
                    const appointmentData = {
                      id: appointmentId,
                      patientId: result.customer?.customer_id || newBookingData.patientId,
                      patientName: newBookingData.isNewClient ? newBookingData.newClientName : `${selectedCustomer?.first_name || ''} ${selectedCustomer?.last_name || ''}`.trim(),
                      patientPhone: newBookingData.isNewClient ? newBookingData.newClientPhone : selectedCustomer?.phone,
                      patientEmail: selectedCustomer?.email || '',
                      staffId: newBookingData.staffId,
                      treatmentId: newBookingData.treatmentId,
                      startAt: `${newBookingData.date}T${newBookingData.time}`,
                      endAt: `${newBookingData.date}T${newBookingData.time}`,
                      status: 'confirmed',
                      source: 'online',
                      paymentStatus: 'unpaid',
                      payment_status: 'unpaid',
                      notes: newBookingData.notes || '',
                      createdAt: new Date()
                    }

                    setPendingAppointment(appointmentData)

                    // Open payment options dialog instead of payment dialog directly
                    setPaymentOptionsDialogOpen(true)

                    // Reset booking form
                    setCustomerSearchResult('not_searched')
                    setCustomerConfirmed(false)
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
                    setClientSearch("")

                    // Reset loading state
                    setIsCreatingAppointment(false)
                  } catch (error: any) {
                    console.error('[Calendar] Error creating appointment:', error)
                    toast({
                      title: "Failed to create appointment",
                      description: error.message,
                      variant: "destructive"
                    })
                    setIsCreatingAppointment(false)
                  }
                }}
                disabled={isCreatingAppointment || (!newBookingData.patientId && !newBookingData.isNewClient) || !newBookingData.treatmentId || !newBookingData.staffId || !newBookingData.date || !newBookingData.time}
                className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5"
              >
                {isCreatingAppointment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-5 w-5" />
                    <span>BOOK NOW</span>
                  </>
                )}
              </Button>
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
                            <Banknote className="h-4 w-4 mr-2" />
                            Manual Payment
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                            onClick={() => setPaymentLinkDialogOpen(true)}
                            disabled={isCompleting}
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            Payment Digital via Paper
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

        {/* Payment Options Dialog - After Appointment Created */}
        <Dialog open={paymentOptionsDialogOpen} onOpenChange={setPaymentOptionsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Appointment Created Successfully!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-1">Booking Confirmed!</p>
                <p className="text-sm text-gray-600">Appointment has been created successfully</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Choose payment option:</p>

                {/* Pay Now Button */}
                <Button
                  onClick={() => {
                    if (pendingAppointment) {
                      // Get treatment to calculate total amount
                      const treatment = treatments.find(t => t.id === pendingAppointment.treatmentId)
                      const totalAmount = treatment?.price || 0

                      // Set selected booking
                      setSelectedBooking(pendingAppointment)

                      // Set payment status manually for new appointment
                      setCompletePaymentStatus({
                        total_amount: totalAmount,
                        paid_amount: 0,
                        remaining_balance: totalAmount,
                        payment_status: 'unpaid',
                        can_complete: false,
                        message: 'Payment must be completed before marking appointment as done.',
                        payments: []
                      })

                      // Close payment options dialog
                      setPaymentOptionsDialogOpen(false)

                      // Small delay to ensure dialog transitions smoothly
                      setTimeout(() => {
                        // Open Complete Appointment Dialog to show payment status and options
                        setCompleteDialogOpen(true)
                      }, 100)
                    }
                  }}
                  className="w-full h-auto py-4 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-md"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <span className="text-lg font-semibold">Pay Now</span>
                    </div>
                    <span className="text-xs opacity-90">Record payment immediately</span>
                  </div>
                </Button>

                {/* Pay Later Button */}
                <Button
                  onClick={async () => {
                    if (pendingAppointment) {
                      try {
                        // Add note to appointment that payment will be done later
                        const currentNotes = pendingAppointment.notes || ''
                        const payLaterNote = '\n[Payment will be processed after treatment completion]'
                        const updatedNotes = currentNotes + (currentNotes ? payLaterNote : payLaterNote.trim())

                        // Update appointment with pay later note
                        await apiClient.updateAppointment(pendingAppointment.id, {
                          notes: updatedNotes
                        })

                        toast({
                          title: "Payment scheduled for later",
                          description: "A note has been added to the appointment. Payment can be recorded after treatment."
                        })

                        setPaymentOptionsDialogOpen(false)
                        setPendingAppointment(null)

                        // Reload bookings to show updated appointment
                        await reloadBookings()
                      } catch (error: any) {
                        console.error('Failed to add pay later note:', error)
                        toast({
                          title: "Note update failed",
                          description: "Could not add payment note, but appointment is created. You can add it manually.",
                          variant: "destructive"
                        })
                        // Still close dialog even if note update fails
                        setPaymentOptionsDialogOpen(false)
                        setPendingAppointment(null)
                        await reloadBookings()
                      }
                    }
                  }}
                  variant="outline"
                  className="w-full h-auto py-4 px-6 border-2 border-gray-300 hover:bg-gray-50 shadow-sm"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span className="text-lg font-semibold text-gray-700">Pay Later</span>
                    </div>
                    <span className="text-xs text-gray-500">Record payment after treatment</span>
                  </div>
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-800">
                    <span className="font-medium">Note:</span> You can record payment now or mark it for later.
                    If you choose "Pay Later", a note will be added to the appointment.
                  </p>
                </div>
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
            onSuccess={async () => {
              // Show verifying message
              toast({
                title: "Payment recorded successfully",
                description: "Verifying payment status..."
              })

              // Refresh appointment data from API to get updated payment_status
              const updatedBooking = await refreshAppointmentData(selectedBooking.id)

              if (updatedBooking) {
                // Refresh payment status display
                setPaymentRefreshKey((prev) => prev + 1)

                // Show success message
                toast({
                  title: "Payment verified",
                  description: updatedBooking.payment_status === 'paid'
                    ? "Payment completed! You can now complete the appointment."
                    : "Payment status updated successfully",
                })
              }

              // Reload all bookings to reflect payment changes in the list
              await reloadBookings()

              // Dialog tetap terbuka, user bisa langsung klik Complete
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
    </>
  )
}

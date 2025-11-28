"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO, isValid } from "date-fns"
import GradientLoading from "@/components/gradient-loading"
import { useRouter } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { Star } from "lucide-react"
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  CalendarIcon,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  CalendarDays,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  Banknote,
  Activity,
  UserCheck,
  ShieldCheck,
  Award,
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircleIcon,
  Upload,
  FileSpreadsheet,
  CreditCard,
  FileText,
  MapPin,
  Loader2,
} from "lucide-react"
import { AddButton } from "@/components/ui/add-button"
import { ImportCustomerDialog } from "@/components/customers/import-customer-dialog"
import { SellPackageDialog } from "@/components/customers/sell-package-dialog"
import { CustomerCreditsSection } from "@/components/customers/customer-credits-section"
import { Gift } from "lucide-react"

export default function ClientsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const undoToastDismissRef = useRef<(() => void) | null>(null)

  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [statistics, setStatistics] = useState<any>(null)
  const [loadingStatistics, setLoadingStatistics] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [completionNotesSearch, setCompletionNotesSearch] = useState("")
  const [customerIdsFromCompletionNotes, setCustomerIdsFromCompletionNotes] = useState<string[]>([])
  const [isSearchingCompletionNotes, setIsSearchingCompletionNotes] = useState(false)
  const [hasSearchedCompletionNotes, setHasSearchedCompletionNotes] = useState(false) // Track if search was executed
  const [statusFilter, setStatusFilter] = useState("all")
  const [spendingFilter, setSpendingFilter] = useState("all")
  const [visitCountFilter, setVisitCountFilter] = useState("all")
  const [joinDateFrom, setJoinDateFrom] = useState<Date | undefined>()
  const [joinDateTo, setJoinDateTo] = useState<Date | undefined>()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isFromDateOpen, setIsFromDateOpen] = useState(false)
  const [isToDateOpen, setIsToDateOpen] = useState(false)

  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showSellPackageDialog, setShowSellPackageDialog] = useState(false)
  const [sellPackageCustomer, setSellPackageCustomer] = useState<any>(null)
  const [creditsRefreshTrigger, setCreditsRefreshTrigger] = useState(0)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Appointment History State
  const [showAppointmentHistory, setShowAppointmentHistory] = useState(false)
  const [appointmentHistoryCustomer, setAppointmentHistoryCustomer] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showAppointmentDetail, setShowAppointmentDetail] = useState(false)
  const [loadingAppointmentDetail, setLoadingAppointmentDetail] = useState(false)
  const [clickedAppointmentId, setClickedAppointmentId] = useState<string | null>(null)

  // Appointment Pagination & Filters
  const [appointmentPage, setAppointmentPage] = useState(1)
  const [appointmentTotalPages, setAppointmentTotalPages] = useState(0)
  const [appointmentTotal, setAppointmentTotal] = useState(0)
  const appointmentPageSize = 10
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState("all")
  const [appointmentPaymentFilter, setAppointmentPaymentFilter] = useState("all")
  const [appointmentSearchQuery, setAppointmentSearchQuery] = useState("")

  const [clientForm, setClientForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    gender: ""
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Search appointments by completion notes (triggered by button click)
  const searchByCompletionNotes = async () => {
    if (!completionNotesSearch || completionNotesSearch.length < 2) {
      toast({
        title: "Invalid search",
        description: "Please enter at least 2 characters to search",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSearchingCompletionNotes(true)
      const params = new URLSearchParams()
      params.append('status', 'completed')
      params.append('completion_notes_search', completionNotesSearch)
      params.append('size', '100') // Get more results to capture all matching customers

      const response = await fetch(`/api/appointments?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to search appointments by completion notes')
      }

      const data = await response.json()

      // Extract unique customer IDs
      const uniqueCustomerIds = [...new Set(
        (data.items || [])
          .map((appointment: any) => appointment.customer_id)
          .filter((id: string) => id) // Remove null/undefined
      )]

      setCustomerIdsFromCompletionNotes(uniqueCustomerIds)
      setHasSearchedCompletionNotes(true) // Mark that search has been executed

      if (uniqueCustomerIds.length === 0) {
        toast({
          title: "No results",
          description: "No customers found with matching completion notes",
        })
      } else {
        toast({
          title: "Search complete",
          description: `Found ${uniqueCustomerIds.length} customer(s) with matching diagnosis`,
        })
      }
    } catch (error: any) {
      console.error('Error searching by completion notes:', error)
      toast({
        title: "Error",
        description: "Failed to search by completion notes",
        variant: "destructive"
      })
    } finally {
      setIsSearchingCompletionNotes(false)
    }
  }

  // Clear completion notes search
  const clearCompletionNotesSearch = () => {
    setCompletionNotesSearch("")
    setCustomerIdsFromCompletionNotes([])
    setHasSearchedCompletionNotes(false) // Reset search flag
  }

  // Auto-reset when completion notes search input is cleared
  useEffect(() => {
    if (hasSearchedCompletionNotes && completionNotesSearch === "") {
      // User cleared the search input, reset the search state
      setCustomerIdsFromCompletionNotes([])
      setHasSearchedCompletionNotes(false)
    }
  }, [completionNotesSearch, hasSearchedCompletionNotes])

  // Fetch customers when page, search, or filters change
  useEffect(() => {
    fetchCustomers()
  }, [currentPage, debouncedSearchQuery, joinDateFrom, joinDateTo, hasSearchedCompletionNotes])

  // Fetch customer statistics on mount
  useEffect(() => {
    fetchCustomerStatistics()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      // When filtering by completion notes, we need to fetch ALL customers to find matches
      if (hasSearchedCompletionNotes) {
        // Fetch all customers with pagination loop (max 100 per request)
        let allCustomers: any[] = []
        let page = 1
        let totalPages = 1
        const size = 100 // Max size allowed by API

        // Build base params
        const baseParams: Record<string, string> = {
          sort_by: 'created_at',
          order: 'desc',
          size: size.toString()
        }

        if (debouncedSearchQuery) baseParams.search = debouncedSearchQuery
        if (joinDateFrom) baseParams.created_from = format(joinDateFrom, 'yyyy-MM-dd')
        if (joinDateTo) baseParams.created_to = format(joinDateTo, 'yyyy-MM-dd')

        // Fetch all pages
        do {
          const params = new URLSearchParams({
            ...baseParams,
            page: page.toString()
          })

          const response = await fetch(`/api/customers?${params.toString()}`)

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to fetch customers')
          }

          const data = await response.json()
          allCustomers = [...allCustomers, ...(data.items || [])]
          totalPages = data.pages || 1

          // Set total customers from first request
          if (page === 1) {
            setTotalCustomers(data.total || 0)
          }

          page++
        } while (page <= totalPages)

        setCustomers(allCustomers)
        setTotalPages(1) // No pagination when searching
      } else {
        // Normal pagination
        const params = new URLSearchParams()
        params.append('page', currentPage.toString())
        params.append('size', pageSize.toString())
        params.append('sort_by', 'created_at')
        params.append('order', 'desc')

        if (debouncedSearchQuery) {
          params.append('search', debouncedSearchQuery)
        }

        if (joinDateFrom) {
          const formattedFrom = format(joinDateFrom, 'yyyy-MM-dd')
          params.append('created_from', formattedFrom)
        }

        if (joinDateTo) {
          const formattedTo = format(joinDateTo, 'yyyy-MM-dd')
          params.append('created_to', formattedTo)
        }

        const response = await fetch(`/api/customers?${params.toString()}`)

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to fetch customers')
        }

        const data = await response.json()
        setCustomers(data.items || [])
        setTotalCustomers(data.total || 0)
        setTotalPages(data.pages || 0)
      }
    } catch (error: any) {
      console.error('Error fetching customers:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load customers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerStatistics = async () => {
    try {
      setLoadingStatistics(true)
      const response = await fetch('/api/customers/statistics/summary')

      if (!response.ok) {
        throw new Error('Failed to fetch customer statistics')
      }

      const data = await response.json()
      setStatistics(data.statistics || null)
    } catch (error: any) {
      console.error('Error fetching customer statistics:', error)
      // Don't show error toast for statistics as it's not critical
    } finally {
      setLoadingStatistics(false)
    }
  }

  const clientsWithStats = useMemo(() => {
    return customers.map((customer) => {
      // Map customer data from API to expected format
      const name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
      const totalAppointments = customer.total_appointments || 0

      // Determine status based on loyalty_points or total_appointments
      let status = "new"
      if (customer.loyalty_points > 500) status = "vip"
      else if (totalAppointments > 3) status = "active"

      return {
        id: customer.id,
        name,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone: customer.phone,
        email: customer.email,
        gender: customer.gender,
        totalVisits: totalAppointments,
        totalSpent: customer.total_spent || 0,
        completedBookings: totalAppointments,
        lastVisitFormatted: "Unknown", // Would need appointments data
        status,
        createdAt: customer.created_at,
        is_active: customer.is_active,
        email_verified: customer.email_verified,
        loyalty_points: customer.loyalty_points,
        total_spent: customer.total_spent || 0,
        preferences: customer.preferences,
        bookingHistory: [], // Would need to fetch from appointments endpoint
      }
    })
  }, [customers])

  // Client-side filtering for status and other filters not supported by API
  const filteredClients = useMemo(() => {
    return clientsWithStats.filter((client) => {
      // Filter by completion notes search
      // If search was executed but no results found, don't show any customers
      // If search was not executed, show all customers (no filter)
      // If search found results, only show matching customers
      const matchesCompletionNotes = !hasSearchedCompletionNotes
        || (hasSearchedCompletionNotes && customerIdsFromCompletionNotes.includes(client.id))

      const matchesStatus = statusFilter === "all" || client.status === statusFilter

      const matchesSpending = (() => {
        switch (spendingFilter) {
          case "low":
            return client.totalSpent < 1000000
          case "medium":
            return client.totalSpent >= 1000000 && client.totalSpent < 5000000
          case "high":
            return client.totalSpent >= 5000000
          default:
            return true
        }
      })()

      const matchesVisitCount = (() => {
        switch (visitCountFilter) {
          case "new":
            return client.totalVisits <= 1
          case "regular":
            return client.totalVisits > 1 && client.totalVisits <= 5
          case "frequent":
            return client.totalVisits > 5
          default:
            return true
        }
      })()

      return matchesCompletionNotes && matchesStatus && matchesSpending && matchesVisitCount
    })
  }, [clientsWithStats, statusFilter, spendingFilter, visitCountFilter, customerIdsFromCompletionNotes, hasSearchedCompletionNotes])

  // Reset to page 1 when search or filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchQuery, joinDateFrom, joinDateTo, hasSearchedCompletionNotes])

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return false
    // Must start with +628 and have minimum 8 digits, maximum 15 digits total (including +62)
    // This means 5-12 digits after +628 (since +628 = 4 chars, total 8-15 includes that)
    const phoneWithoutPrefix = phone.replace('+62', '')
    if (phoneWithoutPrefix.length < 6 || phoneWithoutPrefix.length > 13) return false
    return /^\+628\d{5,12}$/.test(phone)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!clientForm.first_name.trim()) {
      errors.first_name = "First name is required"
    }

    if (!clientForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!validatePhone(clientForm.phone)) {
      errors.phone = "Phone must start with 8 and have 8-15 digits (e.g., 81234567890)"
    }

    if (clientForm.email && !validateEmail(clientForm.email)) {
      errors.email = "Invalid email format"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddClient = async () => {
    // Clear previous errors
    setFormErrors({})

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form and fix the errors",
        variant: "destructive"
      })
      return
    }

    try {
      // Get tenant_id from tenant data (saved during login)
      const tenantStr = localStorage.getItem('tenant')
      if (!tenantStr) {
        throw new Error('Session expired. Please login again.')
      }

      const tenant = JSON.parse(tenantStr)
      const tenantId = tenant.id || tenant._id

      if (!tenantId) {
        throw new Error('Tenant information not found. Please login again.')
      }

      // Build request body
      let firstName = clientForm.first_name.trim()
      let lastName = clientForm.last_name.trim()

      // Smart name splitting: If last_name is empty but first_name has multiple words
      // Split: take last word as last_name, rest as first_name
      // Example: "Moch Aril" -> first_name: "Moch", last_name: "Aril"
      if (!lastName && firstName.includes(' ')) {
        const nameParts = firstName.split(' ').filter(part => part.length > 0)
        if (nameParts.length > 1) {
          lastName = nameParts[nameParts.length - 1] // Last word
          firstName = nameParts.slice(0, -1).join(' ') // All words except last
        } else {
          lastName = firstName // Single word, use as both
        }
      } else if (!lastName) {
        // If still no last name and single word, duplicate it
        lastName = firstName
      }

      const requestBody: any = {
        first_name: firstName,
        last_name: lastName,
        phone: clientForm.phone.trim(),
        tenant_id: tenantId
      }

      if (clientForm.email && clientForm.email.trim()) {
        requestBody.email = clientForm.email.trim()
      }

      if (clientForm.gender) {
        requestBody.gender = clientForm.gender
      }

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()

        // Handle validation errors from API
        if (error.error && Array.isArray(error.error)) {
          const apiErrors: Record<string, string> = {}
          error.error.forEach((err: any) => {
            if (err.loc && err.loc.length > 1) {
              const field = err.loc[1] // Get field name from loc array
              apiErrors[field] = err.msg
            }
          })
          setFormErrors(apiErrors)

          const errorMessages = error.error.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages)
        }

        throw new Error(error.error || 'Failed to add customer')
      }

      toast({ title: "Success", description: "Customer added successfully" })
      setShowAddDialog(false)
      setClientForm({ first_name: "", last_name: "", phone: "", email: "", gender: "" })
      setFormErrors({})
      fetchCustomers() // Reload customer list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add customer",
        variant: "destructive"
      })
    }
  }

  const handleEditClient = async () => {
    if (!editingClient) return

    // Clear previous errors
    setFormErrors({})

    // Validate form
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please check the form and fix the errors",
        variant: "destructive"
      })
      return
    }

    try {
      // Build request body
      let firstName = clientForm.first_name.trim()
      let lastName = clientForm.last_name.trim()

      // Smart name splitting: If last_name is empty but first_name has multiple words
      // Split: take last word as last_name, rest as first_name
      // Example: "Moch Aril" -> first_name: "Moch", last_name: "Aril"
      if (!lastName && firstName.includes(' ')) {
        const nameParts = firstName.split(' ').filter(part => part.length > 0)
        if (nameParts.length > 1) {
          lastName = nameParts[nameParts.length - 1] // Last word
          firstName = nameParts.slice(0, -1).join(' ') // All words except last
        } else {
          lastName = firstName // Single word, use as both
        }
      } else if (!lastName) {
        // If still no last name and single word, duplicate it
        lastName = firstName
      }

      const requestBody: any = {
        first_name: firstName,
        last_name: lastName,
        phone: clientForm.phone.trim()
      }

      if (clientForm.email && clientForm.email.trim()) {
        requestBody.email = clientForm.email.trim()
      }

      if (clientForm.gender) {
        requestBody.gender = clientForm.gender
      }

      const response = await fetch(`/api/customers/${editingClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()

        // Handle validation errors from API
        if (error.error && Array.isArray(error.error)) {
          const apiErrors: Record<string, string> = {}
          error.error.forEach((err: any) => {
            if (err.loc && err.loc.length > 1) {
              const field = err.loc[1]
              apiErrors[field] = err.msg
            }
          })
          setFormErrors(apiErrors)

          const errorMessages = error.error.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages)
        }

        throw new Error(error.error || 'Failed to update customer')
      }

      toast({ title: "Success", description: "Customer updated successfully" })
      setEditingClient(null)
      setShowClientDialog(false)
      setClientForm({ first_name: "", last_name: "", phone: "", email: "", gender: "" })
      setFormErrors({})
      fetchCustomers() // Reload customer list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update customer",
        variant: "destructive"
      })
    }
  }

  const handleDeleteClient = async (client: any) => {
    setClientToDelete(client)
    setShowDeleteDialog(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return

    const deletedCustomer = { ...clientToDelete }

    try {
      // Perform soft delete
      const response = await fetch(`/api/customers/${clientToDelete.id}?permanent=false`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete customer')
      }

      const data = await response.json()

      // Clear existing undo timer if any
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
      }

      // Show undo toast
      const { dismiss } = toast({
        title: "Customer deleted (soft)",
        description: "Undo within 10 seconds.",
        duration: 10000,
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUndoDelete(deletedCustomer.id)}
            className="bg-white hover:bg-gray-100"
          >
            Undo
          </Button>
        ),
      })

      undoToastDismissRef.current = dismiss

      // Set timer to finalize deletion after 10 seconds
      undoTimerRef.current = setTimeout(() => {
        undoTimerRef.current = null
        undoToastDismissRef.current = null
      }, 10000)

      setSelectedClient(null)
      setShowClientDialog(false)
      setShowDeleteDialog(false)
      setClientToDelete(null)
      fetchCustomers() // Reload customer list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive"
      })
    }
  }

  const handleUndoDelete = async (customerId: string) => {
    try {
      // Call restore API endpoint
      const response = await fetch(`/api/customers/${customerId}/restore`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore customer')
      }

      // Clear undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
        undoTimerRef.current = null
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
        undoToastDismissRef.current = null
      }

      toast({
        title: "Customer restored",
        description: "Customer has been successfully restored.",
      })

      fetchCustomers() // Reload customer list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore customer",
        variant: "destructive"
      })
    }
  }

  const openAddDialog = () => {
    setClientForm({ first_name: "", last_name: "", phone: "", email: "", gender: "" })
    setFormErrors({})
    setShowAddDialog(true)
  }

  const openEditDialog = (client: any) => {
    setClientForm({
      first_name: client.first_name || "",
      last_name: client.last_name || "",
      phone: client.phone,
      email: client.email || "",
      gender: client.gender || "",
    })
    setFormErrors({})
    setEditingClient(client)
  }

  const openClientDetails = (client: any) => {
    setSelectedClient(client)
    setShowClientDialog(true)
  }

  const handleNewBooking = (client: any) => {
    router.push(`/calendar?patient=${client.id}`)
  }

  const openAppointmentHistory = async (client: any) => {
    setAppointmentHistoryCustomer(client)
    setShowAppointmentHistory(true)
    setAppointmentPage(1)
    setAppointmentStatusFilter("all")
    setAppointmentPaymentFilter("all")
    setAppointmentSearchQuery("")
    await fetchAppointmentHistory(client.id, 1, "all", "all", "")
  }

  const fetchAppointmentHistory = async (
    customerId: string,
    page: number = appointmentPage,
    statusFilter: string = appointmentStatusFilter,
    paymentFilter: string = appointmentPaymentFilter,
    searchQuery: string = appointmentSearchQuery
  ) => {
    try {
      setLoadingAppointments(true)
      const params = new URLSearchParams()
      params.append('customer_id', customerId)
      params.append('page', page.toString())
      params.append('size', appointmentPageSize.toString())
      params.append('sort_by', 'appointment_date')
      params.append('sort_direction', 'desc')

      if (statusFilter !== "all") {
        params.append('status', statusFilter)
      }

      if (paymentFilter !== "all") {
        params.append('payment_status', paymentFilter)
      }

      const response = await fetch(`/api/appointments?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }

      const data = await response.json()
      setAppointments(data.items || [])
      setAppointmentTotal(data.total || 0)
      setAppointmentTotalPages(data.pages || 0)
    } catch (error: any) {
      console.error('Error fetching appointments:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load appointment history",
        variant: "destructive"
      })
    } finally {
      setLoadingAppointments(false)
    }
  }

  const fetchAppointmentDetail = async (appointmentId: string) => {
    try {
      setClickedAppointmentId(appointmentId)
      setLoadingAppointmentDetail(true)
      const response = await fetch(`/api/appointments/${appointmentId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch appointment details')
      }

      const data = await response.json()
      setSelectedAppointment(data)
      setShowAppointmentDetail(true)
    } catch (error: any) {
      console.error('Error fetching appointment detail:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to load appointment details",
        variant: "destructive"
      })
    } finally {
      setLoadingAppointmentDetail(false)
      setClickedAppointmentId(null)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'no_show': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'partially_paid': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'refunded': return 'bg-[#EDE9FE] text-[#6D28D9] border-[#C4B5FD]'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    clearCompletionNotesSearch()
    setStatusFilter("all")
    setSpendingFilter("all")
    setVisitCountFilter("all")
    setJoinDateFrom(undefined)
    setJoinDateTo(undefined)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (completionNotesSearch) count++
    if (statusFilter !== "all") count++
    if (spendingFilter !== "all") count++
    if (visitCountFilter !== "all") count++
    if (joinDateFrom || joinDateTo) count++
    return count
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "vip":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">VIP</Badge>
      case "active":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        )
      case "new":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            New
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Check if data is completely empty
  const hasNoData = !loading && (!customers || customers.length === 0)

  if (loading) {
    return (
      <>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <GradientLoading />
        </div>
      </>
    )
  }

  return (
    <>
      {hasNoData ? (
        <EmptyState
          icon={Users}
          title={`No Customers Yet`}
          description={`Start building your customers database. Add your first customers to track their appointments and history.`}
          actionLabel={`Add Customers`}
          onAction={openAddDialog}
          tips={[
            {
              icon: UserPlus,
              title: `Add Customers`,
              description: "Manually add client info"
            },
            {
              icon: CalendarIcon,
              title: "First Booking",
              description: `Create bookings to auto-add customers`
            },
            {
              icon: Star,
              title: "Build Relationships",
              description: "Track preferences and history"
            }
          ]}
        />
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
            <p className="text-muted-foreground">Manage your customer database and relationships</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Import from Excel
            </Button>
            <AddButton onClick={openAddDialog}>
              Add Customer
            </AddButton>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="border-pink-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Main Search Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search customers by name, phone, or email..."
                    className="pl-10 border-pink-200 focus:border-pink-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by diagnosis/completion notes..."
                      className="pl-10 border-green-200 focus:border-green-400"
                      value={completionNotesSearch}
                      onChange={(e) => setCompletionNotesSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          searchByCompletionNotes()
                        }
                      }}
                    />
                    {customerIdsFromCompletionNotes.length > 0 && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-green-600 font-medium">
                        {customerIdsFromCompletionNotes.length} found
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={searchByCompletionNotes}
                    disabled={isSearchingCompletionNotes || !completionNotesSearch || completionNotesSearch.length < 2}
                    className="bg-green-600 hover:bg-green-700 text-white shrink-0"
                  >
                    {isSearchingCompletionNotes ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                  {hasSearchedCompletionNotes && (
                    <Button
                      onClick={clearCompletionNotesSearch}
                      variant="outline"
                      className="border-red-200 hover:bg-red-50 shrink-0"
                      title="Clear search and show all customers"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Row */}
              <div className="flex items-center gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-pink-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="border-pink-200 hover:bg-pink-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                  {getActiveFiltersCount() > 0 && (
                    <Badge className="ml-2 bg-pink-500 text-white text-xs px-1.5 py-0.5">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </div>

              {showAdvancedFilters && (
                <div className="p-5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-pink-800 flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Advanced Filters
                    </h3>
                    {getActiveFiltersCount() > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="border-pink-300 text-pink-700 bg-white hover:bg-pink-100 h-8"
                      >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Spending Level</Label>
                      <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                        <SelectTrigger className="border-pink-200 bg-white hover:bg-pink-50">
                          <SelectValue placeholder="All spending" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All spending</SelectItem>
                          <SelectItem value="low">Low (&lt; Rp 1M)</SelectItem>
                          <SelectItem value="medium">Medium (Rp 1M - 5M)</SelectItem>
                          <SelectItem value="high">High (&gt; Rp 5M)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Visit Frequency</Label>
                      <Select value={visitCountFilter} onValueChange={setVisitCountFilter}>
                        <SelectTrigger className="border-pink-200 bg-white hover:bg-pink-50">
                          <SelectValue placeholder="All visits" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All visits</SelectItem>
                          <SelectItem value="new">New (≤ 1 visit)</SelectItem>
                          <SelectItem value="regular">Regular (2-5 visits)</SelectItem>
                          <SelectItem value="frequent">Frequent (&gt; 5 visits)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-pink-700 uppercase tracking-wide">Join Date Range</Label>
                      <div className="flex gap-2">
                        <Popover open={isFromDateOpen} onOpenChange={setIsFromDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex-1 justify-start text-left text-xs ${joinDateFrom ? 'border-pink-400 bg-pink-50 text-pink-800 font-medium' : 'border-pink-200 bg-white text-pink-700'} hover:bg-pink-50`}
                            >
                              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                              {joinDateFrom ? format(joinDateFrom, "MMM d, yyyy") : "From"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={joinDateFrom}
                              onSelect={(date) => {
                                setJoinDateFrom(date)
                                setIsFromDateOpen(false)
                              }}
                              disabled={(date) => date > new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover open={isToDateOpen} onOpenChange={setIsToDateOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`flex-1 justify-start text-left text-xs ${joinDateTo ? 'border-pink-400 bg-pink-50 text-pink-800 font-medium' : 'border-pink-200 bg-white text-pink-700'} hover:bg-pink-50`}
                            >
                              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
                              {joinDateTo ? format(joinDateTo, "MMM d, yyyy") : "To"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={joinDateTo}
                              onSelect={(date) => {
                                setJoinDateTo(date)
                                setIsToDateOpen(false)
                              }}
                              disabled={(date) => date > new Date() || (joinDateFrom && date < joinDateFrom)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {hasSearchedCompletionNotes
                ? `Search Results (${filteredClients.length})`
                : `All Customers (${totalCustomers})`
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ||
                statusFilter !== "all" ||
                spendingFilter !== "all" ||
                visitCountFilter !== "all" ||
                joinDateFrom ||
                joinDateTo
                  ? "No customers match your search criteria"
                  : "No customers found"}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#FCD6F5]/20 to-[#EDE9FE]/20">
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Appointments</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClients.map((client) => (
                        <TableRow key={client.id} className="hover:bg-[#FCD6F5]/10 transition-colors">
                          <TableCell className="py-4 px-2">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {client.email && !client.email.includes('@example.co')
                                  ? client.email
                                  : "No email"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-2 text-sm text-muted-foreground">{client.phone}</TableCell>
                          <TableCell className="py-4 px-2 text-sm capitalize">{client.gender || "-"}</TableCell>
                          <TableCell className="py-4 px-2 text-sm">{client.totalVisits}</TableCell>
                          <TableCell className="py-4 px-2 font-medium text-sm">Rp {(client.total_spent || 0).toLocaleString('id-ID')}</TableCell>
                          <TableCell className="py-4 px-2">{getStatusBadge(client.status)}</TableCell>
                          <TableCell className="py-4 px-2 text-sm text-muted-foreground">
                            {client.createdAt && typeof client.createdAt === "string"
                              ? (() => {
                                  try {
                                    const date = parseISO(client.createdAt)
                                    return isValid(date) ? format(date, 'dd MMM yyyy') : "-"
                                  } catch {
                                    return "-"
                                  }
                                })()
                              : "-"}
                          </TableCell>
                          <TableCell className="py-4 px-2">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" onClick={() => openClientDetails(client)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleNewBooking(client)}>
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Book
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteClient(client)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Hide pagination when filtering by completion notes */}
                {totalPages > 1 && !hasSearchedCompletionNotes && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages} • Total: {totalCustomers} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {/* Show first page */}
                        {currentPage > 3 && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              className="w-8 h-8 p-0"
                            >
                              1
                            </Button>
                            {currentPage > 4 && <span className="px-2">...</span>}
                          </>
                        )}

                        {/* Show pages around current page */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            return page === currentPage ||
                                   page === currentPage - 1 ||
                                   page === currentPage + 1 ||
                                   (page === currentPage - 2 && currentPage <= 3) ||
                                   (page === currentPage + 2 && currentPage >= totalPages - 2)
                          })
                          .map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-8 h-8 p-0"
                            >
                              {page}
                            </Button>
                          ))}

                        {/* Show last page */}
                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              className="w-8 h-8 p-0"
                            >
                              {totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>


      </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add New Customer
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {Object.keys(formErrors).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
                    <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                      {Object.entries(formErrors).map(([field, error]) => (
                        <li key={field}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    placeholder="First name"
                    value={clientForm.first_name}
                    onChange={(e) => {
                      setClientForm((prev) => ({ ...prev, first_name: e.target.value }))
                      if (formErrors.first_name) {
                        setFormErrors((prev) => ({ ...prev, first_name: "" }))
                      }
                    }}
                    className={formErrors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.first_name && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    placeholder="Last name (optional)"
                    value={clientForm.last_name}
                    onChange={(e) => {
                      setClientForm((prev) => ({ ...prev, last_name: e.target.value }))
                      if (formErrors.last_name) {
                        setFormErrors((prev) => ({ ...prev, last_name: "" }))
                      }
                    }}
                    className={formErrors.last_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {formErrors.last_name && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.last_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium">
                    +62
                  </div>
                  <Input
                    id="phone"
                    placeholder="81xxxxxxxxx"
                    maxLength={15}
                    value={clientForm.phone.startsWith('+62') ? clientForm.phone.slice(3) : clientForm.phone}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, '') // Only allow digits
                      setClientForm((prev) => ({ ...prev, phone: input ? `+62${input}` : '' }))

                      // Real-time validation (min 8, max 15 digits)
                      if (input && (input.length < 8 || input.length > 13)) {
                        setFormErrors((prev) => ({ ...prev, phone: "Phone must have 8-15 digits (e.g., 81234567890)" }))
                      } else {
                        setFormErrors((prev) => ({ ...prev, phone: "" }))
                      }
                    }}
                    className={formErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                </div>
                {formErrors.phone && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="customer@email.com (optional)"
                  value={clientForm.email}
                  onChange={(e) => {
                    setClientForm((prev) => ({ ...prev, email: e.target.value }))
                    if (formErrors.email) {
                      setFormErrors((prev) => ({ ...prev, email: "" }))
                    }
                  }}
                  className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={clientForm.gender} onValueChange={(value) => setClientForm((prev) => ({ ...prev, gender: value }))}>
                  <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select gender (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.gender && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.gender}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 font-medium mb-1">Format Guidelines:</p>
                <ul className="text-xs text-blue-700 space-y-0.5">
                  <li>• Phone: Start with 8 followed by 7-14 digits (min 8, max 15 digits total, e.g., 81234567890)</li>
                  <li>• Email: example@email.com (optional)</li>
                  <li>• Last name is optional</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddClient}
                  className="flex-1"
                  disabled={!!formErrors.phone || !!formErrors.email || !!formErrors.first_name}
                >
                  Add Customer
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Client Details Dialog */}
        <Dialog
          open={showClientDialog}
          onOpenChange={() => {
            setShowClientDialog(false)
            setSelectedClient(null)
            setEditingClient(null)
          }}
        >
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingClient ? "Edit Customer" : "Customer Details"}
              </DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6">
                {editingClient ? (
                  <div className="space-y-4">
                    {Object.keys(formErrors).length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">Please fix the following errors:</p>
                          <ul className="text-sm text-red-700 mt-1 list-disc list-inside">
                            {Object.entries(formErrors).map(([field, error]) => (
                              <li key={field}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-first-name">First Name *</Label>
                        <Input
                          id="edit-first-name"
                          value={clientForm.first_name}
                          onChange={(e) => {
                            setClientForm((prev) => ({ ...prev, first_name: e.target.value }))
                            if (formErrors.first_name) {
                              setFormErrors((prev) => ({ ...prev, first_name: "" }))
                            }
                          }}
                          className={formErrors.first_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {formErrors.first_name && (
                          <p className="text-sm text-red-600 mt-1">{formErrors.first_name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-last-name">Last Name</Label>
                        <Input
                          id="edit-last-name"
                          placeholder="Last name (optional)"
                          value={clientForm.last_name}
                          onChange={(e) => {
                            setClientForm((prev) => ({ ...prev, last_name: e.target.value }))
                            if (formErrors.last_name) {
                              setFormErrors((prev) => ({ ...prev, last_name: "" }))
                            }
                          }}
                          className={formErrors.last_name ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {formErrors.last_name && (
                          <p className="text-sm text-red-600 mt-1">{formErrors.last_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone *</Label>
                      <div className="flex gap-2">
                        <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium">
                          +62
                        </div>
                        <Input
                          id="edit-phone"
                          placeholder="81xxxxxxxxx"
                          maxLength={15}
                          value={clientForm.phone.startsWith('+62') ? clientForm.phone.slice(3) : clientForm.phone}
                          onChange={(e) => {
                            const input = e.target.value.replace(/\D/g, '') // Only allow digits
                            setClientForm((prev) => ({ ...prev, phone: input ? `+62${input}` : '' }))

                            // Real-time validation (min 8, max 15 digits)
                            if (input && (input.length < 8 || input.length > 13)) {
                              setFormErrors((prev) => ({ ...prev, phone: "Phone must have 8-15 digits (e.g., 81234567890)" }))
                            } else {
                              setFormErrors((prev) => ({ ...prev, phone: "" }))
                            }
                          }}
                          className={formErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        placeholder="customer@email.com (optional)"
                        value={clientForm.email}
                        onChange={(e) => {
                          setClientForm((prev) => ({ ...prev, email: e.target.value }))
                          if (formErrors.email) {
                            setFormErrors((prev) => ({ ...prev, email: "" }))
                          }
                        }}
                        className={formErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
                      {formErrors.email && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-gender">Gender</Label>
                      <Select value={clientForm.gender} onValueChange={(value) => setClientForm((prev) => ({ ...prev, gender: value }))}>
                        <SelectTrigger className={formErrors.gender ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select gender (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.gender && (
                        <p className="text-sm text-red-600 mt-1">{formErrors.gender}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-800 font-medium mb-1">Format Guidelines:</p>
                      <ul className="text-xs text-blue-700 space-y-0.5">
                        <li>• Phone: Start with 8 followed by 7-14 digits (min 8, max 15 digits total, e.g., 81234567890)</li>
                        <li>• Email: example@email.com (optional)</li>
                        <li>• Last name is optional</li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleEditClient}
                        className="flex-1"
                        disabled={!!formErrors.phone || !!formErrors.email || !!formErrors.first_name}
                      >
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingClient(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                        <div className="flex items-center gap-2 mt-1">{getStatusBadge(selectedClient.status)}</div>
                      </div>
                      <div className="flex gap-2">

                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Contact Information Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Information
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 bg-white/60 rounded-md p-2.5">
                            <Phone className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                              <p className="text-sm font-medium text-gray-900">{selectedClient.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 bg-white/60 rounded-md p-2.5">
                            <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                              <p className="text-sm font-medium text-gray-900 break-all" title={selectedClient.email && !selectedClient.email.includes('@example.co') ? selectedClient.email : "No email provided"}>
                                {selectedClient.email && !selectedClient.email.includes('@example.co') ? selectedClient.email : "No email provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statistics and Account Status Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Statistics Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-lg p-4">
                          <h4 className="font-semibold text-[#6D28D9] mb-3">Statistics</h4>
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between bg-white/60 rounded-md p-2">
                              <span className="text-xs text-gray-600">Total Appointments:</span>
                              <span className="font-semibold text-sm text-[#6D28D9]">{selectedClient.totalVisits}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/60 rounded-md p-2">
                              <span className="text-xs text-gray-600">Total Spent:</span>
                              <span className="font-semibold text-sm text-[#6D28D9]">
                                Rp {(selectedClient.total_spent || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white/60 rounded-md p-2">
                              <span className="text-xs text-gray-600">Member Since:</span>
                              <span className="font-semibold text-sm text-[#6D28D9]">
                                {selectedClient.createdAt && typeof selectedClient.createdAt === "string"
                                  ? (() => {
                                      try {
                                        const parsed = parseISO(selectedClient.createdAt)
                                        return isValid(parsed) ? format(parsed, "MMM yyyy") : "Unknown"
                                      } catch {
                                        return "Unknown"
                                      }
                                    })()
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Account Status Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-lg p-4">
                          <h4 className="font-semibold text-emerald-900 mb-3">Account Status</h4>
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between bg-white/60 rounded-md p-2">
                              <span className="text-xs text-gray-600">Email Verified:</span>
                              <span className={`font-semibold text-sm ${selectedClient.email_verified ? "text-emerald-700" : "text-gray-500"}`}>
                                {selectedClient.email_verified ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white/60 rounded-md p-2">
                              <span className="text-xs text-gray-600">Active:</span>
                              <span className={`font-semibold text-sm ${selectedClient.is_active ? "text-emerald-700" : "text-gray-500"}`}>
                                {selectedClient.is_active ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between bg-white/60 rounded-md p-2">
                              <span className="text-xs text-gray-600">Gender:</span>
                              <span className="font-semibold text-sm text-emerald-900 capitalize">{selectedClient.gender || "Not specified"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Credits Section */}
                    <CustomerCreditsSection
                      customerId={selectedClient.id}
                      customerName={selectedClient.name}
                      onSellPackage={() => {
                        setSellPackageCustomer(selectedClient)
                        setShowSellPackageDialog(true)
                      }}
                      refreshTrigger={creditsRefreshTrigger}
                    />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Quick Actions</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleNewBooking(selectedClient)}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          New Booking
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openAppointmentHistory(selectedClient)}>
                          <History className="h-4 w-4 mr-2" />
                          History
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setSellPackageCustomer(selectedClient)
                          setShowSellPackageDialog(true)
                        }}>
                          <Gift className="h-4 w-4 mr-2" />
                          Sell Package
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(selectedClient)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteEntityDialog
          open={showDeleteDialog && !!clientToDelete}
          onOpenChange={setShowDeleteDialog}
          entityType="Customer"
          entityName={clientToDelete?.name || ""}
          entityDetails={[
            { label: "Name", value: clientToDelete?.name || "-" },
            { label: "Phone", value: clientToDelete?.phone || "-" },
            { label: "Email", value: clientToDelete?.email || "-" },
            { label: "Total Appointments", value: clientToDelete?.totalVisits || 0 },
            { label: "Total Spent", value: `Rp ${(clientToDelete?.total_spent || 0).toLocaleString('id-ID')}` },
            { label: "Status", value: clientToDelete?.status || "active" },
          ]}
          onConfirmDelete={confirmDeleteClient}
          softDeleteImpacts={[
            "Customer will be marked as deleted and inactive",
            "Appointment history will be preserved",
            "Customer data can be restored within 10 seconds",
            "After 10 seconds, restoration requires admin intervention"
          ]}
        />

        {/* Import Customer Dialog */}
        <ImportCustomerDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImportSuccess={() => {
            fetchCustomers()
            setShowImportDialog(false)
          }}
        />

        {/* Sell Package Dialog */}
        <SellPackageDialog
          open={showSellPackageDialog}
          onOpenChange={setShowSellPackageDialog}
          customerId={sellPackageCustomer?.id || ''}
          customerName={sellPackageCustomer?.name || ''}
          onSuccess={() => {
            toast({
              title: "Package Sold",
              description: "Package has been sold successfully to the customer",
            })
            // Trigger refresh for CustomerCreditsSection
            setCreditsRefreshTrigger(prev => prev + 1)
          }}
        />

        {/* Appointment History Dialog */}
        <Dialog open={showAppointmentHistory} onOpenChange={setShowAppointmentHistory}>
          <DialogContent className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out max-w-[99vw] w-[90vw] max-h-[95vh] overflow-hidden flex flex-col p-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-[#8B5CF6]" />
                Appointment History - {appointmentHistoryCustomer?.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Total: {appointmentTotal} appointments
              </p>
            </DialogHeader>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 pb-4 border-b">
              <Select
                value={appointmentStatusFilter}
                onValueChange={(value) => {
                  setAppointmentStatusFilter(value)
                  setAppointmentPage(1)
                  if (appointmentHistoryCustomer) {
                    fetchAppointmentHistory(appointmentHistoryCustomer.id, 1, value, appointmentPaymentFilter, appointmentSearchQuery)
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={appointmentPaymentFilter}
                onValueChange={(value) => {
                  setAppointmentPaymentFilter(value)
                  setAppointmentPage(1)
                  if (appointmentHistoryCustomer) {
                    fetchAppointmentHistory(appointmentHistoryCustomer.id, 1, appointmentStatusFilter, value, appointmentSearchQuery)
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partially_paid">Partially Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>

              {(appointmentStatusFilter !== "all" || appointmentPaymentFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAppointmentStatusFilter("all")
                    setAppointmentPaymentFilter("all")
                    setAppointmentPage(1)
                    if (appointmentHistoryCustomer) {
                      fetchAppointmentHistory(appointmentHistoryCustomer.id, 1, "all", "all", "")
                    }
                  }}
                  className="ml-auto"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              {loadingAppointments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading appointments...</p>
                  </div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <CalendarDays className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <p className="text-sm text-muted-foreground">No appointments found</p>
                </div>
              ) : (
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FCD6F5]/20 to-[#EDE9FE]/20">
                      <TableHead className="w-[12%]">Date & Time</TableHead>
                      <TableHead className="w-[45%]">Services</TableHead>
                      <TableHead className="w-[10%]">Status</TableHead>
                      <TableHead className="w-[11%]">Payment</TableHead>
                      <TableHead className="text-right w-[12%]">Total</TableHead>
                      <TableHead className="text-center w-[10%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => {
                      const appointmentId = appointment._id || appointment.id
                      const isLoadingThis = clickedAppointmentId === appointmentId

                      return (
                        <TableRow
                          key={appointmentId}
                          className="hover:bg-[#FCD6F5]/10 transition-colors"
                        >
                          <TableCell className="py-3 px-3">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-sm">
                                {new Date(appointment.appointment_date).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {appointment.start_time} - {appointment.end_time}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <div className="flex flex-col gap-1">
                              {appointment.services?.map((service: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{service.service_name}</span>
                                  <span className="text-muted-foreground ml-2">
                                    ({service.duration_minutes}m)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <Badge className={`${getStatusBadgeColor(appointment.status)} border text-xs whitespace-nowrap`}>
                              {appointment.status === 'confirmed' ? 'Confirmed' :
                               appointment.status === 'completed' ? 'Completed' :
                               appointment.status === 'cancelled' ? 'Cancelled' :
                               appointment.status === 'no_show' ? 'No Show' :
                               appointment.status === 'pending' ? 'Pending' : appointment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-3">
                            <Badge className={`${getPaymentStatusBadgeColor(appointment.payment_status)} border text-xs whitespace-nowrap`}>
                              {appointment.payment_status === 'paid' ? 'Paid' :
                               appointment.payment_status === 'partially_paid' ? 'Partial' :
                               appointment.payment_status === 'pending' ? 'Pending' :
                               appointment.payment_status === 'refunded' ? 'Refunded' : appointment.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-3 text-right">
                            <span className="font-bold text-sm text-[#6D28D9] whitespace-nowrap">
                              Rp {(appointment.total_price || 0).toLocaleString('id-ID')}
                            </span>
                          </TableCell>
                          <TableCell className="py-3 px-3 text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchAppointmentDetail(appointmentId)}
                              disabled={isLoadingThis}
                              className="text-xs h-8 px-3"
                            >
                              {isLoadingThis ? (
                                <>
                                  <div className="h-3 w-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-1" />
                                  Loading
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {!loadingAppointments && appointments.length > 0 && appointmentTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Page {appointmentPage} of {appointmentTotalPages} • Showing {appointments.length} of {appointmentTotal} appointments
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = appointmentPage - 1
                      setAppointmentPage(newPage)
                      if (appointmentHistoryCustomer) {
                        fetchAppointmentHistory(appointmentHistoryCustomer.id, newPage, appointmentStatusFilter, appointmentPaymentFilter, appointmentSearchQuery)
                      }
                    }}
                    disabled={appointmentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, appointmentTotalPages) }, (_, i) => {
                      let pageNum
                      if (appointmentTotalPages <= 5) {
                        pageNum = i + 1
                      } else if (appointmentPage <= 3) {
                        pageNum = i + 1
                      } else if (appointmentPage >= appointmentTotalPages - 2) {
                        pageNum = appointmentTotalPages - 4 + i
                      } else {
                        pageNum = appointmentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={appointmentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setAppointmentPage(pageNum)
                            if (appointmentHistoryCustomer) {
                              fetchAppointmentHistory(appointmentHistoryCustomer.id, pageNum, appointmentStatusFilter, appointmentPaymentFilter, appointmentSearchQuery)
                            }
                          }}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPage = appointmentPage + 1
                      setAppointmentPage(newPage)
                      if (appointmentHistoryCustomer) {
                        fetchAppointmentHistory(appointmentHistoryCustomer.id, newPage, appointmentStatusFilter, appointmentPaymentFilter, appointmentSearchQuery)
                      }
                    }}
                    disabled={appointmentPage === appointmentTotalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Appointment Detail Dialog */}
        <Dialog open={showAppointmentDetail} onOpenChange={(open) => {
          setShowAppointmentDetail(open)
          if (!open) {
            setSelectedAppointment(null)
          }
        }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Appointment Details
              </DialogTitle>
            </DialogHeader>

            {loadingAppointmentDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading details...</p>
                </div>
              </div>
            ) : selectedAppointment && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                        <span className="font-bold text-lg">
                          {new Date(selectedAppointment.appointment_date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{selectedAppointment.start_time} - {selectedAppointment.end_time}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={`${getStatusBadgeColor(selectedAppointment.status)} border-2 font-bold text-sm px-3 py-1`}>
                        {selectedAppointment.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={`${getPaymentStatusBadgeColor(selectedAppointment.payment_status)} border-2 font-bold text-sm px-3 py-1`}>
                        {selectedAppointment.payment_status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Services Details */}
                <div>
                  <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#8B5CF6]" />
                    Services Booked
                  </h3>
                  <div className="space-y-3">
                    {selectedAppointment.services?.map((service: any, idx: number) => (
                      <div key={idx} className="border border-[#C4B5FD] rounded-lg p-4 bg-gradient-to-br from-purple-50/50 to-white">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base text-[#6D28D9]">{service.service_name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              <UserCheck className="h-3 w-3 inline mr-1" />
                              Therapist: {service.staff_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg text-[#6D28D9]">
                              Rp {(service.price || 0).toLocaleString('id-ID')}
                            </p>
                            <p className="text-xs text-muted-foreground">{service.duration_minutes} minutes</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 pt-3 border-t border-purple-100">
                          <span>
                            <Clock className="h-3 w-3 inline mr-1" />
                            {service.start_time} - {service.end_time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                {selectedAppointment.payment_details && (
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-emerald-600" />
                      Payment Information
                    </h3>
                    <div className="border border-emerald-200 rounded-lg p-4 bg-gradient-to-br from-emerald-50/50 to-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount:</span>
                        <span className="font-bold text-lg">Rp {(selectedAppointment.payment_details.total_amount || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Paid Amount:</span>
                        <span className="font-bold text-lg text-emerald-700">
                          Rp {(selectedAppointment.payment_details.paid_amount || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {selectedAppointment.payment_details.remaining_balance > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-emerald-200">
                          <span className="text-sm font-medium text-amber-700">Remaining Balance:</span>
                          <span className="font-bold text-lg text-amber-700">
                            Rp {(selectedAppointment.payment_details.remaining_balance || 0).toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}

                      {/* Payment History */}
                      {selectedAppointment.payment_details.payment_history?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                          <h4 className="font-medium text-sm mb-2">Payment History</h4>
                          <div className="space-y-2">
                            {selectedAppointment.payment_details.payment_history.map((payment: any, idx: number) => (
                              <div key={payment.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                                <div>
                                  <p className="text-sm font-medium">Rp {(payment.amount || 0).toLocaleString('id-ID')}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {payment.method.replace('_', ' ').toUpperCase()} • {payment.receipt_number}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(payment.recorded_at).toLocaleDateString('id-ID')} by {payment.recorded_by}
                                  </p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Fee Breakdown */}
                {selectedAppointment.fee_breakdown && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-2">
                    <h3 className="font-semibold text-sm mb-2">Platform Fee Breakdown</h3>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Base Amount:</span>
                      <span className="font-medium">Rp {(selectedAppointment.fee_breakdown.base_amount || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Platform Fee ({selectedAppointment.fee_breakdown.fee_percentage}):</span>
                      <span className="font-medium">Rp {(selectedAppointment.fee_breakdown.platform_fee || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-300">
                      <span className="font-medium">Total with Fee:</span>
                      <span className="font-bold">Rp {(selectedAppointment.fee_breakdown.total_with_fee || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{selectedAppointment.fee_breakdown.note}</p>
                  </div>
                )}

                {/* Reschedule Info */}
                {selectedAppointment.rescheduled_from && (
                  <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      Rescheduled Appointment
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Original:</span> {selectedAppointment.rescheduled_from.date} ({selectedAppointment.rescheduled_from.start_time} - {selectedAppointment.rescheduled_from.end_time})
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Moved to:</span> {selectedAppointment.rescheduled_to.date} ({selectedAppointment.rescheduled_to.start_time} - {selectedAppointment.rescheduled_to.end_time})
                      </p>
                      <p className="text-xs text-amber-700 mt-2">
                        Rescheduled on: {new Date(selectedAppointment.rescheduled_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Notes
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppointment.notes}</p>
                  </div>
                )}

                {/* Completion Notes */}
                {selectedAppointment?.completion_notes && selectedAppointment.completion_notes.trim() !== '' && (
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-600" />
                      Completion Notes
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppointment.completion_notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                  <p>Created: {new Date(selectedAppointment.created_at).toLocaleString('id-ID')}</p>
                  {selectedAppointment.confirmed_at && (
                    <p>Confirmed: {new Date(selectedAppointment.confirmed_at).toLocaleString('id-ID')}</p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </>
  )
}

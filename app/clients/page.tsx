"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
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
import { useToast } from "@/hooks/use-toast"
import { format, parseISO, isValid } from "date-fns"
import LiquidLoading from "@/components/ui/liquid-loader"
import { useRouter } from "next/navigation"
import { EmptyState } from "@/components/ui/empty-state"
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
} from "lucide-react"

export default function ClientsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [spendingFilter, setSpendingFilter] = useState("all")
  const [visitCountFilter, setVisitCountFilter] = useState("all")
  const [joinDateFrom, setJoinDateFrom] = useState<Date | undefined>()
  const [joinDateTo, setJoinDateTo] = useState<Date | undefined>()
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [showClientDialog, setShowClientDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

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

  // Fetch customers when page, search, or filters change
  useEffect(() => {
    fetchCustomers()
  }, [currentPage, debouncedSearchQuery, joinDateFrom, joinDateTo])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('size', pageSize.toString())

      if (debouncedSearchQuery) {
        params.append('search', debouncedSearchQuery)
      }

      if (joinDateFrom) {
        params.append('created_from', format(joinDateFrom, 'yyyy-MM-dd'))
      }

      if (joinDateTo) {
        params.append('created_to', format(joinDateTo, 'yyyy-MM-dd'))
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
        totalSpent: 0, // Not available in customer API, would need to calculate from appointments
        completedBookings: totalAppointments,
        lastVisitFormatted: "Unknown", // Would need appointments data
        status,
        createdAt: customer.created_at,
        is_active: customer.is_active,
        email_verified: customer.email_verified,
        loyalty_points: customer.loyalty_points,
        preferences: customer.preferences,
        bookingHistory: [], // Would need to fetch from appointments endpoint
      }
    })
  }, [customers])

  // Client-side filtering for status and other filters not supported by API
  const filteredClients = useMemo(() => {
    return clientsWithStats.filter((client) => {
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

      return matchesStatus && matchesSpending && matchesVisitCount
    })
  }, [clientsWithStats, statusFilter, spendingFilter, visitCountFilter])

  // Reset to page 1 when search or filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchQuery, joinDateFrom, joinDateTo])

  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    if (!phone) return false
    // Remove spaces and special characters for validation
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    // Check if it has at least 10 digits
    return /^\+?\d{10,15}$/.test(cleanPhone)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!clientForm.first_name.trim()) {
      errors.first_name = "First name is required"
    }

    if (!clientForm.phone.trim()) {
      errors.phone = "Phone number is required"
    } else if (!validatePhone(clientForm.phone)) {
      errors.phone = "Invalid phone format. Use format: +62 xxx xxxx xxxx or 08xx xxxx xxxx"
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
      // Get tenant_id from user data
      const userStr = localStorage.getItem('user')
      if (!userStr) {
        throw new Error('User not found. Please login again.')
      }

      const user = JSON.parse(userStr)
      const tenantId = user.tenant_id

      if (!tenantId) {
        throw new Error('Tenant ID not found. Please login again.')
      }

      // Build request body
      const requestBody: any = {
        first_name: clientForm.first_name.trim(),
        phone: clientForm.phone.trim(),
        tenant_id: tenantId
      }

      // Only add optional fields if they have values
      if (clientForm.last_name && clientForm.last_name.trim()) {
        requestBody.last_name = clientForm.last_name.trim()
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
      const requestBody: any = {
        first_name: clientForm.first_name.trim(),
        phone: clientForm.phone.trim()
      }

      // Only add optional fields if they have values
      if (clientForm.last_name && clientForm.last_name.trim()) {
        requestBody.last_name = clientForm.last_name.trim()
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

    try {
      const response = await fetch(`/api/customers/${clientToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete customer')
      }

      toast({ title: "Success", description: "Customer deleted successfully" })
      setSelectedClient(null)
      setShowClientDialog(false)
      setShowDeleteDialog(false)
      setClientToDelete(null)
      fetchCustomers() // Reload customer list
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete customer", variant: "destructive" })
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

  const clearAllFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setSpendingFilter("all")
    setVisitCountFilter("all")
    setJoinDateFrom(undefined)
    setJoinDateTo(undefined)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  // Check if data is completely empty
  const hasNoData = !loading && (!customers || customers.length === 0)

  return (
    <MainLayout>
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
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] hover:from-[#E7C6FF] hover:to-[#C8B6FF] text-purple-800 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="border-pink-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers by name, phone, or email..."
                      className="pl-10 border-pink-200 focus:border-pink-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 border-pink-200">
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
                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-pink-700">Spending Level</Label>
                      <Select value={spendingFilter} onValueChange={setSpendingFilter}>
                        <SelectTrigger className="border-pink-200">
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
                      <Label className="text-sm font-medium text-pink-700">Visit Frequency</Label>
                      <Select value={visitCountFilter} onValueChange={setVisitCountFilter}>
                        <SelectTrigger className="border-pink-200">
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
                      <Label className="text-sm font-medium text-pink-700">Join Date Range</Label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 justify-start text-left border-pink-200 bg-transparent"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {joinDateFrom ? format(joinDateFrom, "MMM d") : "From"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={joinDateFrom}
                              onSelect={setJoinDateFrom}
                              disabled={(date) => date > new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 justify-start text-left border-pink-200 bg-transparent"
                            >
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {joinDateTo ? format(joinDateTo, "MMM d") : "To"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={joinDateTo}
                              onSelect={setJoinDateTo}
                              disabled={(date) => date > new Date() || (joinDateFrom && date < joinDateFrom)}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {getActiveFiltersCount() > 0 && (
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="border-pink-300 text-pink-700 hover:bg-pink-100 bg-transparent"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear All Filters
                      </Button>
                    </div>
                  )}
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
              All Customers ({totalCustomers})
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
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Contact</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Gender</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Appointments</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Loyalty Points</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-2 font-medium text-sm text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-4 px-2">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-muted-foreground">{client.email || "No email"}</div>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm text-muted-foreground">{client.phone}</td>
                          <td className="py-4 px-2 text-sm capitalize">{client.gender || "-"}</td>
                          <td className="py-4 px-2 text-sm">{client.totalVisits}</td>
                          <td className="py-4 px-2 font-medium">{client.loyalty_points || 0}</td>
                          <td className="py-4 px-2">{getStatusBadge(client.status)}</td>
                          <td className="py-4 px-2">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
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
                <Input
                  id="phone"
                  placeholder="+62 812 345 6789 or 08123456789"
                  value={clientForm.phone}
                  onChange={(e) => {
                    setClientForm((prev) => ({ ...prev, phone: e.target.value }))
                    if (formErrors.phone) {
                      setFormErrors((prev) => ({ ...prev, phone: "" }))
                    }
                  }}
                  className={formErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
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
                  <li>• Phone: +62 xxx xxxx xxxx or 08xx xxxx xxxx</li>
                  <li>• Email: example@email.com (optional)</li>
                  <li>• Last name is optional</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddClient} className="flex-1">
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
                      <Input
                        id="edit-phone"
                        placeholder="+62 812 345 6789 or 08123456789"
                        value={clientForm.phone}
                        onChange={(e) => {
                          setClientForm((prev) => ({ ...prev, phone: e.target.value }))
                          if (formErrors.phone) {
                            setFormErrors((prev) => ({ ...prev, phone: "" }))
                          }
                        }}
                        className={formErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                      />
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
                        <li>• Phone: +62 xxx xxxx xxxx or 08xx xxxx xxxx</li>
                        <li>• Email: example@email.com (optional)</li>
                        <li>• Last name is optional</li>
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleEditClient} className="flex-1">
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
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(selectedClient)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClient(selectedClient)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Contact Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedClient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedClient.email || "No email provided"}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Account Status</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email Verified:</span>
                              <span className="font-medium">{selectedClient.email_verified ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Active:</span>
                              <span className="font-medium">{selectedClient.is_active ? "Yes" : "No"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gender:</span>
                              <span className="font-medium capitalize">{selectedClient.gender || "Not specified"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Statistics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Appointments:</span>
                              <span className="font-medium">{selectedClient.totalVisits}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Loyalty Points:</span>
                              <span className="font-medium">{selectedClient.loyalty_points || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Member Since:</span>
                              <span className="font-medium">
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
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Quick Actions</h4>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleNewBooking(selectedClient)} className="flex-1">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          New Booking
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(selectedClient)} className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Customer
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
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Delete Client
              </DialogTitle>
            </DialogHeader>
            {clientToDelete && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    Are you sure you want to delete this client? This action cannot be undone and will also remove:
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 ml-4">
                    <li>• All booking history ({clientToDelete.bookingHistory?.length || 0} bookings)</li>
                    <li>• Client contact information</li>
                    <li>• All associated data</li>
                  </ul>
                </div>

                <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
                  <h4 className="font-medium text-pink-800 mb-2">Client Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-pink-700">Name:</span>
                      <span className="font-medium text-pink-900">{clientToDelete.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Phone:</span>
                      <span className="font-medium text-pink-900">{clientToDelete.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Total Visits:</span>
                      <span className="font-medium text-pink-900">{clientToDelete.totalVisits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Total Spent:</span>
                      <span className="font-medium text-pink-900">
                        Rp {clientToDelete.totalSpent?.toLocaleString("id-ID") || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pink-700">Status:</span>
                      <span className="font-medium text-pink-900">{getStatusBadge(clientToDelete.status)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={confirmDeleteClient} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Yes, Delete Client
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setClientToDelete(null)
                    }}
                    className="flex-1 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </MainLayout>
  )
}

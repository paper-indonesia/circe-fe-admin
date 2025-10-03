"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useBookings, usePatients, useStaff, useTreatments } from "@/lib/context"
import { formatCurrency, cn } from "@/lib/utils"
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
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Star,
  Banknote,
  CreditCard,
  Building2,
  Smartphone,
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

  const { bookings = [], loading, updateBooking, deleteBooking } = useBookings()
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
        const patient = patients.find(p => p.id === b.patientId)
        const treatment = treatments.find(t => t.id === b.treatmentId)
        const search = searchQuery.toLowerCase()

        return (
          patient?.name?.toLowerCase().includes(search) ||
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800"
      case "completed": return "bg-blue-100 text-blue-800"
      case "cancelled": return "bg-red-100 text-red-800"
      case "no-show": return "bg-gray-100 text-gray-800"
      default: return "bg-yellow-100 text-yellow-800"
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
    try {
      await deleteBooking(id)
      toast({ title: "Booking deleted successfully" })
      setDetailDialogOpen(false)
      setSelectedBooking(null)
    } catch (error) {
      toast({ title: "Failed to delete booking", variant: "destructive" })
    }
  }

  const handleOpenDetails = (booking: any) => {
    setSelectedBooking(booking)
    setTempStatus(booking.status)
    setDetailDialogOpen(true)
  }

  const handleFinishBooking = async () => {
    if (!selectedBooking) return

    try {
      if (tempStatus !== selectedBooking.status) {
        await updateBooking(selectedBooking.id, { status: tempStatus })
        toast({ title: "Booking updated successfully" })
      }
      setDetailDialogOpen(false)
      setSelectedBooking(null)
      setTempStatus("")
    } catch (error) {
      toast({ title: "Failed to update booking", variant: "destructive" })
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
                              const patient = patients.find(p => p.id === booking.patientId)
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "text-xs px-2 py-1.5 rounded-md truncate shadow-sm",
                                    getStatusColor(booking.status)
                                  )}
                                >
                                  <div className="font-semibold truncate">
                                    {format(new Date(booking.startAt), "HH:mm")}
                                  </div>
                                  <div className="text-[10px] truncate opacity-90">
                                    {patient?.name || "Unknown"}
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
                      const patient = patients.find(p => p.id === booking.patientId)
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
                            const patient = patients.find(p => p.id === booking.patientId)
                            return (
                              <div
                                key={idx}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center border-2 border-white text-xs font-bold text-gray-700 shadow-sm"
                              >
                                {patient?.name?.charAt(0)?.toUpperCase() || "?"}
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
                            const patient = patients.find(p => p.id === booking.patientId)
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
              const patient = patients.find(p => p.id === selectedBooking.patientId)
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
                      <button
                        onClick={() => setDetailDialogOpen(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
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
                          <p className="font-bold text-gray-900 text-sm">
                            {format(new Date(selectedBooking.startAt), "EEE, MMM dd")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(selectedBooking.startAt), "HH:mm")} - {format(new Date(selectedBooking.endAt), "HH:mm")}
                          </p>
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
                    {selectedBooking.notes && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-1 h-3 bg-[#C8B6FF] rounded-full"></div>
                          <h3 className="text-xs font-bold text-gray-900">Notes</h3>
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-3">
                          <p className="text-xs text-gray-700">{selectedBooking.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="sticky bottom-0 bg-white pt-3 border-t border-gray-100 flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-10 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm"
                      onClick={() => handleDeleteBooking(selectedBooking.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete Booking
                    </Button>
                    <Button
                      className="flex-1 h-10 bg-[#C8B6FF] hover:bg-[#B8A6EF] text-white text-sm font-medium"
                      onClick={handleFinishBooking}
                    >
                      Finish
                    </Button>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>

        {/* New Booking Dialog */}
        <Dialog open={newBookingOpen} onOpenChange={setNewBookingOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
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
                const availableStaff = selectedTreatment?.assignedStaff
                  ? staff.filter(s => selectedTreatment.assignedStaff.includes(s.id))
                  : staff

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

              {/* Step 3: Schedule (Date & Time) */}
              {newBookingStep === 3 && (() => {
                const selectedStaff = staff.find(s => s.id === newBookingData.staffId)
                const workingHours = {
                  start: selectedStaff?.workingHours?.start || '09:00',
                  end: selectedStaff?.workingHours?.end || '18:00'
                }

                // Generate time slots based on staff availability
                const generateTimeSlots = () => {
                  const slots = []
                  const [startHour, startMin] = workingHours.start.split(':').map(Number)
                  const [endHour, endMin] = workingHours.end.split(':').map(Number)

                  const categories = [
                    { name: 'Morning', start: startHour, end: 12, color: 'from-amber-50 to-orange-50 border-amber-200', badge: 'bg-amber-500 text-white', textColor: 'text-amber-900' },
                    { name: 'Afternoon', start: 12, end: 17, color: 'from-sky-50 to-blue-50 border-sky-200', badge: 'bg-sky-500 text-white', textColor: 'text-sky-900' },
                    { name: 'Evening', start: 17, end: endHour + 1, color: 'from-violet-50 to-purple-50 border-violet-200', badge: 'bg-violet-500 text-white', textColor: 'text-violet-900' }
                  ]

                  return categories.map(category => {
                    const categorySlots = []
                    for (let hour = Math.max(category.start, startHour); hour < Math.min(category.end, endHour + 1); hour++) {
                      for (let min = 0; min < 60; min += 30) {
                        if (hour === startHour && min < startMin) continue
                        if (hour === endHour && min >= endMin) continue
                        categorySlots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`)
                      }
                    }
                    return { ...category, slots: categorySlots }
                  }).filter(cat => cat.slots.length > 0)
                }

                const timeCategories = generateTimeSlots()

                // Generate calendar dates for current month
                const generateCalendarDates = () => {
                  const start = startOfWeek(startOfMonth(currentMonth))
                  const end = endOfWeek(endOfMonth(currentMonth))
                  const dates = []
                  let day = start

                  while (day <= end) {
                    dates.push(day)
                    day = addDays(day, 1)
                  }
                  return dates
                }

                const calendarDates = generateCalendarDates()

                return (
                  <div className="space-y-6">
                    {/* Date Input - Quick Select */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-[#C8B6FF]" />
                        </div>
                        Select Date
                      </h3>
                      <Input
                        type="date"
                        value={newBookingData.date}
                        onChange={(e) => setNewBookingData({ ...newBookingData, date: e.target.value })}
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="h-14 border-2 text-base font-semibold"
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                      />
                    </div>

                    {/* Selected Date Display */}
                    {newBookingData.date && (
                      <div className="bg-gradient-to-r from-[#C8B6FF] to-[#B8A6EF] rounded-2xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <CalendarIcon className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">Selected Date</p>
                            <p className="text-lg font-bold">{format(new Date(newBookingData.date), 'EEEE, MMMM d, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Date Selection with Custom Calendar - Optional Visual */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                          <CalendarIcon className="h-4 w-4 text-[#C8B6FF]" />
                        </div>
                        Select Date
                      </h3>

                      {/* Month Navigation */}
                      <div className="flex items-center justify-between mb-4 px-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                          className="hover:bg-[#FFD6FF]/30 hover:text-[#C8B6FF] font-semibold"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h4 className="font-bold text-lg text-gray-900" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          {format(currentMonth, 'MMMM yyyy')}
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                          className="hover:bg-[#FFD6FF]/30 hover:text-[#C8B6FF] font-semibold"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="bg-white rounded-2xl p-5 shadow-md border-2 border-gray-100">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-3">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-600 py-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Date Grid */}
                        <div className="grid grid-cols-7 gap-2">
                          {calendarDates.map((date, idx) => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            const isSelected = newBookingData.date === dateStr
                            const isCurrentMonth = isSameMonth(date, currentMonth)
                            const isTodayDate = isToday(date)
                            const isPast = date < startOfDay(new Date())

                            return (
                              <button
                                key={idx}
                                onClick={() => {
                                  if (!isPast && isCurrentMonth) {
                                    setNewBookingData({ ...newBookingData, date: dateStr })
                                  }
                                }}
                                disabled={isPast || !isCurrentMonth}
                                className={cn(
                                  "aspect-square rounded-xl text-sm font-bold transition-all relative",
                                  "hover:shadow-md hover:scale-105",
                                  isSelected && "bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] text-white shadow-lg scale-105",
                                  !isSelected && isTodayDate && isCurrentMonth && "bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] text-gray-900 ring-2 ring-[#C8B6FF]",
                                  !isSelected && !isTodayDate && isCurrentMonth && !isPast && "bg-gray-50 hover:bg-gray-100 text-gray-900",
                                  !isCurrentMonth && "text-gray-300 cursor-not-allowed",
                                  isPast && isCurrentMonth && "text-gray-300 cursor-not-allowed opacity-40"
                                )}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                              >
                                {format(date, 'd')}
                                {isTodayDate && isCurrentMonth && !isSelected && (
                                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C8B6FF]"></div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Time Selection by Category */}
                    {newBookingData.date && (
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                            <Clock className="h-4 w-4 text-[#C8B6FF]" />
                          </div>
                          Select Time
                          <span className="text-xs font-normal text-gray-500 ml-1">({selectedStaff?.name})</span>
                        </h3>
                        <div className="space-y-3">
                          {timeCategories.map((category) => (
                            <div key={category.name} className={cn("rounded-2xl bg-gradient-to-br p-5 border-2 shadow-sm", category.color)}>
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <Badge className={cn("text-xs font-bold px-3 py-1", category.badge)}>
                                    {category.name}
                                  </Badge>
                                  <span className={cn("text-xs font-semibold", category.textColor)}>{category.slots.length} slots available</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {category.slots.map((time) => {
                                  const isSelected = newBookingData.time === time
                                  return (
                                    <button
                                      key={time}
                                      onClick={() => setNewBookingData({ ...newBookingData, time })}
                                      className={cn(
                                        "px-3 py-3 rounded-xl text-sm font-bold transition-all",
                                        isSelected
                                          ? "bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] text-white shadow-lg scale-105"
                                          : "bg-white hover:bg-gray-50 text-gray-900 hover:shadow-md hover:scale-105 border-2 border-transparent hover:border-gray-200"
                                      )}
                                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    >
                                      {time}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Customer Selection */}
                    {newBookingData.date && newBookingData.time && (
                      <div>
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                            <User className="h-4 w-4 text-[#C8B6FF]" />
                          </div>
                          Select Customer
                        </h3>

                        {/* Toggle: Existing or New Customer */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            onClick={() => setNewBookingData({ ...newBookingData, isNewClient: false, newClientName: "", newClientPhone: "" })}
                            className={cn(
                              "px-5 py-4 rounded-xl font-bold text-sm transition-all border-2",
                              !newBookingData.isNewClient
                                ? "bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] text-white shadow-lg border-transparent"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                            )}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                          >
                            Existing Customer
                          </button>
                          <button
                            onClick={() => setNewBookingData({ ...newBookingData, isNewClient: true, patientId: "" })}
                            className={cn(
                              "px-5 py-4 rounded-xl font-bold text-sm transition-all border-2",
                              newBookingData.isNewClient
                                ? "bg-gradient-to-br from-[#C8B6FF] to-[#B8A6EF] text-white shadow-lg border-transparent"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                            )}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                          >
                            New Customer
                          </button>
                        </div>

                        {/* Existing Customer - Searchable List */}
                        {!newBookingData.isNewClient && (
                          <div className="space-y-3">
                            {/* Search Input */}
                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                value={clientSearch}
                                onChange={(e) => setClientSearch(e.target.value)}
                                placeholder="Search customer by name or phone..."
                                className="h-14 pl-12 border-2 text-base font-medium"
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                              />
                            </div>

                            {/* Client List */}
                            <div className="max-h-64 overflow-y-auto space-y-2 bg-gray-50 rounded-xl p-3 border-2 border-gray-200">
                              {patients
                                .filter(p =>
                                  p.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                  p.phone?.toLowerCase().includes(clientSearch.toLowerCase())
                                )
                                .map((patient) => (
                                  <button
                                    key={patient.id}
                                    onClick={() => setNewBookingData({ ...newBookingData, patientId: patient.id })}
                                    className={cn(
                                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:shadow-md text-left",
                                      newBookingData.patientId === patient.id
                                        ? "border-[#C8B6FF] bg-gradient-to-br from-[#FFD6FF]/30 to-[#E7C6FF]/30 shadow-md"
                                        : "border-transparent bg-white hover:border-gray-200"
                                    )}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                  >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center text-base font-bold text-gray-900 shadow-sm flex-shrink-0">
                                      {patient.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-900 text-base">{patient.name}</p>
                                      <p className="text-sm text-gray-600 font-medium">{patient.phone}</p>
                                    </div>
                                    {newBookingData.patientId === patient.id && (
                                      <CheckCircle className="h-6 w-6 text-[#C8B6FF] flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                              {patients.filter(p =>
                                p.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                p.phone?.toLowerCase().includes(clientSearch.toLowerCase())
                              ).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                  <p className="font-semibold">No customers found</p>
                                  <p className="text-sm">Try a different search term</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* New Customer Form */}
                        {newBookingData.isNewClient && (
                          <div className="space-y-4 bg-white rounded-xl p-5 border-2 border-gray-200">
                            <div>
                              <label className="text-xs text-gray-600 font-bold mb-2 block uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Customer Name</label>
                              <Input
                                value={newBookingData.newClientName}
                                onChange={(e) => setNewBookingData({ ...newBookingData, newClientName: e.target.value })}
                                placeholder="Enter full name"
                                className="h-14 border-2 text-base font-semibold"
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 font-bold mb-2 block uppercase tracking-wide" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>Phone Number</label>
                              <Input
                                value={newBookingData.newClientPhone}
                                onChange={(e) => setNewBookingData({ ...newBookingData, newClientPhone: e.target.value })}
                                placeholder="Enter phone number"
                                className="h-14 border-2 text-base font-semibold"
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                      // Calculate end time based on treatment duration
                      const treatment = treatments.find(t => t.id === newBookingData.treatmentId)
                      const startDateTime = new Date(`${newBookingData.date}T${newBookingData.time}`)
                      const endDateTime = new Date(startDateTime.getTime() + (treatment?.durationMin || 60) * 60000)

                      // If new client, create patient first
                      let patientId = newBookingData.patientId
                      if (newBookingData.isNewClient) {
                        const patientResponse = await fetch('/api/patients', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: newBookingData.newClientName,
                            phone: newBookingData.newClientPhone
                          })
                        })

                        if (!patientResponse.ok) throw new Error('Failed to create new customer')
                        const newPatient = await patientResponse.json()
                        patientId = newPatient.id
                      }

                      // Create booking
                      const response = await fetch('/api/bookings', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          treatmentId: newBookingData.treatmentId,
                          patientId: patientId,
                          staffId: newBookingData.staffId,
                          startAt: startDateTime.toISOString(),
                          endAt: endDateTime.toISOString(),
                          paymentMethod: newBookingData.paymentMethod,
                          notes: newBookingData.notes,
                          status: 'pending'
                        })
                      })

                      if (!response.ok) throw new Error('Failed to create booking')

                      toast({ title: "Booking created successfully!" })
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

                      // Refresh data
                      fetchBookings()
                    } catch (error) {
                      toast({ title: "Failed to create booking", variant: "destructive" })
                    }
                  }}
                  disabled={!newBookingData.paymentMethod}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Create Booking
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

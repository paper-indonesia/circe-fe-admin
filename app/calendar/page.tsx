"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useBookings, usePatients, useStaff, useTreatments } from "@/lib/context"
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO, addHours } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Calendar,
  Plus,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Trash2,
  CheckCircle,
  X,
  UserPlus,
  Table,
  CalendarDays,
  FilterX,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

const timeSlots = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
]

const ITEMS_PER_PAGE = 10

export default function CalendarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const { bookings = [], addBooking, updateBooking, deleteBooking } = useBookings() || {}
  const { patients = [], addPatient } = usePatients() || {}
  const { staff = [] } = useStaff() || {}
  const { treatments = [] } = useTreatments() || {}

  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar")
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false)

  const [filters, setFilters] = useState({
    status: "all",
    staff: "all",
    treatment: "all",
    paymentStatus: "all",
    dateRange: "week", // week, month, custom
    customStartDate: "",
    customEndDate: "",
    searchQuery: "",
  })

  const [currentPage, setCurrentPage] = useState(1)

  const [bookingForm, setBookingForm] = useState({
    patientId: "",
    staffId: "",
    treatmentId: "",
    notes: "",
    paymentStatus: "unpaid" as const,
  })

  const [newPatientForm, setNewPatientForm] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const [showEndCalendar, setShowEndCalendar] = useState(false)

  const [statusSearch, setStatusSearch] = useState("")
  const [staffSearch, setStaffSearch] = useState("")
  const [treatmentSearch, setTreatmentSearch] = useState("")
  const [paymentSearch, setPaymentSearch] = useState("")

  useEffect(() => {}, [])

  useEffect(() => {
    const filter = searchParams.get("filter")
    const staffParam = searchParams.get("staff")
    const bookingParam = searchParams.get("booking")

    if (filter) setFilters((prev) => ({ ...prev, status: filter }))
    if (staffParam) setFilters((prev) => ({ ...prev, staff: staffParam }))
    if (bookingParam && bookings && bookings.length > 0) {
      const booking = bookings.find((b) => b?.id === bookingParam)
      if (booking) setSelectedBooking(booking)
    }
  }, [searchParams, bookings])

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filteredBookings = (bookings || []).filter((booking) => {
    if (!booking?.startAt) return false

    const bookingDate = parseISO(booking.startAt)

    // Date range filtering
    let dateMatch = false
    if (filters.dateRange === "week") {
      dateMatch = bookingDate >= weekStart && bookingDate <= endOfWeek(currentWeek, { weekStartsOn: 1 })
    } else if (filters.dateRange === "month") {
      const monthStart = new Date(currentWeek.getFullYear(), currentWeek.getMonth(), 1)
      const monthEnd = new Date(currentWeek.getFullYear(), currentWeek.getMonth() + 1, 0)
      dateMatch = bookingDate >= monthStart && bookingDate <= monthEnd
    } else if (filters.dateRange === "custom" && filters.customStartDate && filters.customEndDate) {
      const customStart = new Date(filters.customStartDate)
      const customEnd = new Date(filters.customEndDate)
      dateMatch = bookingDate >= customStart && bookingDate <= customEnd
    } else {
      dateMatch = true
    }

    // Other filters
    const statusMatch = filters.status === "all" || booking.status === filters.status
    const staffMatch = filters.staff === "all" || booking.staffId === filters.staff
    const treatmentMatch = filters.treatment === "all" || booking.treatmentId === filters.treatment
    const paymentMatch = filters.paymentStatus === "all" || booking.paymentStatus === filters.paymentStatus

    // Search query match
    let searchMatch = true
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const patient = patients.find((p) => p?.id === booking.patientId)
      const treatment = treatments.find((t) => t?.id === booking.treatmentId)
      const staffMember = staff.find((s) => s?.id === booking.staffId)

      searchMatch =
        patient?.name?.toLowerCase().includes(query) ||
        patient?.phone?.includes(query) ||
        treatment?.name?.toLowerCase().includes(query) ||
        staffMember?.name?.toLowerCase().includes(query) ||
        booking.notes?.toLowerCase().includes(query) ||
        false
    }

    return dateMatch && statusMatch && staffMatch && treatmentMatch && paymentMatch && searchMatch
  })

  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)
  const paginatedBookings = filteredBookings
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    filters.status,
    filters.staff,
    filters.treatment,
    filters.paymentStatus,
    filters.dateRange,
    filters.customStartDate,
    filters.customEndDate,
    filters.searchQuery,
  ])

  const weekBookings = filteredBookings.filter((booking) => {
    const bookingDate = parseISO(booking.startAt)
    return bookingDate >= weekStart && bookingDate <= endOfWeek(currentWeek, { weekStartsOn: 1 })
  })

  const getBookingForSlot = (date: Date, time: string) => {
    return weekBookings.find((booking) => {
      if (!booking?.startAt) return false

      const bookingDate = parseISO(booking.startAt)
      const bookingTime = format(bookingDate, "HH:mm")
      return isSameDay(bookingDate, date) && bookingTime === time
    })
  }

  const getBookingDetails = (booking: any) => {
    if (!booking) return null

    const patient = patients.find((p) => p?.id === booking.patientId)
    const treatment = treatments.find((t) => t?.id === booking.treatmentId)
    const staffMember = staff.find((s) => s?.id === booking.staffId)

    return {
      ...booking,
      patient,
      treatment,
      staff: staffMember,
    }
  }

  const handleSlotClick = (date: Date, time: string) => {
    const existingBooking = getBookingForSlot(date, time)

    if (existingBooking) {
      const bookingDetails = getBookingDetails(existingBooking)
      if (bookingDetails) {
        setSelectedBooking(bookingDetails)
      }
    } else {
      setSelectedSlot({ date, time })
      setBookingForm({
        patientId: "",
        staffId: "",
        treatmentId: "",
        notes: "",
        paymentStatus: "unpaid",
      })
      setShowBookingDialog(true)
    }
  }

  const handleCreateBooking = async () => {
    if (!selectedSlot || !bookingForm.patientId || !bookingForm.staffId || !bookingForm.treatmentId) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    if (!addBooking) {
      toast({ title: "Error", description: "Booking system not available", variant: "destructive" })
      return
    }

    try {
      const [hours, minutes] = selectedSlot.time.split(":").map(Number)
      const startAt = new Date(selectedSlot.date)
      startAt.setHours(hours, minutes, 0, 0)

      const treatment = treatments.find((t) => t?.id === bookingForm.treatmentId)
      const patient = patients.find((p) => p?.id === bookingForm.patientId)
      const endAt = addHours(startAt, (treatment?.durationMin || 60) / 60)

      addBooking({
        patientId: bookingForm.patientId,
        patientName: patient?.name || "Unknown",
        staffId: bookingForm.staffId,
        treatmentId: bookingForm.treatmentId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status: "confirmed",
        source: "online",
        paymentStatus: bookingForm.paymentStatus,
        notes: bookingForm.notes,
      })

      toast({ title: "Success", description: "Booking created successfully" })
      setShowBookingDialog(false)
      setSelectedSlot(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to create booking", variant: "destructive" })
    }
  }

  const handleBookingAction = async (bookingId: string, action: string) => {
    if (!bookingId || !updateBooking || !deleteBooking) {
      toast({ title: "Error", description: "Booking system not available", variant: "destructive" })
      return
    }

    try {
      const booking = bookings.find((b) => b?.id === bookingId)
      if (!booking) return

      switch (action) {
        case "checkin":
          updateBooking(bookingId, { status: "confirmed" })
          toast({ title: "Success", description: "Patient checked in" })
          break
        case "complete":
          updateBooking(bookingId, { status: "completed" })
          toast({ title: "Success", description: "Appointment completed" })
          break
        case "cancel":
          updateBooking(bookingId, { status: "cancelled" })
          toast({ title: "Success", description: "Appointment cancelled" })
          break
        case "delete":
          deleteBooking(bookingId)
          toast({ title: "Success", description: "Appointment deleted" })
          break
      }
      setSelectedBooking(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update appointment", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      "no-show": "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={`text-xs ${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </Badge>
    )
  }

  const handleCreateNewPatient = async () => {
    if (!newPatientForm.name || !newPatientForm.phone) {
      toast({ title: "Error", description: "Name and phone are required", variant: "destructive" })
      return
    }

    if (!addPatient) {
      toast({ title: "Error", description: "Patient system not available", variant: "destructive" })
      return
    }

    try {
      const newPatient = await addPatient({
        name: newPatientForm.name,
        phone: newPatientForm.phone,
        email: newPatientForm.email || undefined,
        notes: newPatientForm.notes || undefined,
      })

      if (newPatient?.id) {
        setBookingForm((prev) => ({ ...prev, patientId: newPatient.id }))
        toast({ title: "Success", description: "New patient created and selected" })
        setShowNewPatientDialog(false)
        setNewPatientForm({ name: "", phone: "", email: "", notes: "" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create patient", variant: "destructive" })
    }
  }

  const openNewPatientDialog = () => {
    setNewPatientForm({ name: "", phone: "", email: "", notes: "" })
    setShowNewPatientDialog(true)
  }

  const resetFilters = () => {
    setFilters({
      status: "all",
      staff: "all",
      treatment: "all",
      paymentStatus: "all",
      dateRange: "week",
      customStartDate: "",
      customEndDate: "",
      searchQuery: "",
    })
    setCurrentPage(1)
  }

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.staff !== "all" ||
    filters.treatment !== "all" ||
    filters.paymentStatus !== "all" ||
    filters.dateRange !== "week" ||
    filters.searchQuery !== ""

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">Manage appointments and schedules</p>
          </div>
          <div className="flex gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="h-8 px-3"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="h-8 px-3"
              >
                <Table className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilterDialog(true)}
              className={hasActiveFilters ? "bg-primary text-primary-foreground" : ""}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {Object.values(filters).filter((v) => v !== "all" && v !== "week" && v !== "").length}
                </Badge>
              )}
            </Button>
            <Button size="sm" onClick={() => router.push("/walk-in")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Walk-in
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search appointments, patients, treatments, or staff..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <FilterX className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}
            </h2>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addDays(currentWeek, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(new Date())}>
              Today
            </Button>
            {viewMode === "table" && (
              <div className="text-sm text-muted-foreground flex items-center">
                Showing {filteredBookings.length} appointments
              </div>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                {filters.status !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Status: {filters.status}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setFilters((prev) => ({ ...prev, status: "all" }))}
                    />
                  </Badge>
                )}
                {filters.staff !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Staff: {staff.find((s) => s?.id === filters.staff)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setFilters((prev) => ({ ...prev, staff: "all" }))}
                    />
                  </Badge>
                )}
                {filters.treatment !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Treatment: {treatments.find((t) => t?.id === filters.treatment)?.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setFilters((prev) => ({ ...prev, treatment: "all" }))}
                    />
                  </Badge>
                )}
                {filters.paymentStatus !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Payment: {filters.paymentStatus}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setFilters((prev) => ({ ...prev, paymentStatus: "all" }))}
                    />
                  </Badge>
                )}
                {filters.dateRange !== "week" && (
                  <Badge variant="secondary" className="gap-1">
                    Date: {filters.dateRange}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, dateRange: "week", customStartDate: "", customEndDate: "" }))
                      }
                    />
                  </Badge>
                )}
                {filters.searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: "{filters.searchQuery}"
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
                    />
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "calendar" ? (
          /* Calendar View */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Week View
                <Badge variant="outline" className="ml-auto">
                  {weekBookings.length} appointments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="p-2"></div>
                    {weekDays.map((day) => (
                      <div key={day.toISOString()} className="p-2 text-center font-medium text-sm">
                        <div>{format(day, "EEE")}</div>
                        <div className="text-lg font-bold">{format(day, "d")}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time slots */}
                  <div className="space-y-1">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-8 gap-2">
                        <div className="p-2 text-sm text-muted-foreground font-medium">{time}</div>
                        {weekDays.map((day) => {
                          const booking = getBookingForSlot(day, time)
                          const bookingDetails = booking ? getBookingDetails(booking) : null

                          return (
                            <div
                              key={`${time}-${day.toISOString()}`}
                              className="p-2 min-h-[60px] border border-border rounded-md hover:bg-muted/30 cursor-pointer transition-colors"
                              onClick={() => handleSlotClick(day, time)}
                            >
                              {bookingDetails && (
                                <div className="bg-primary/20 border border-primary/30 rounded p-2 text-xs h-full">
                                  <div className="font-medium truncate">
                                    {bookingDetails.patient?.name || "Unknown"}
                                  </div>
                                  <div className="text-muted-foreground truncate">
                                    {bookingDetails.treatment?.name || "Unknown"}
                                  </div>
                                  <div className="mt-1">{getStatusBadge(booking.status)}</div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Table View */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Table View
                <Badge variant="outline" className="ml-auto">
                  {filteredBookings.length} total appointments
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date & Time</th>
                      <th className="text-left p-3 font-medium">Patient</th>
                      <th className="text-left p-3 font-medium">Treatment</th>
                      <th className="text-left p-3 font-medium">Staff</th>
                      <th className="text-left p-3 font-medium">Duration</th>
                      <th className="text-left p-3 font-medium">Price</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.length > 0 ? (
                      paginatedBookings.map((booking) => {
                        const bookingDetails = getBookingDetails(booking)
                        return (
                          <tr key={booking.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <div className="font-medium">{format(parseISO(booking.startAt), "EEE, MMM d")}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(parseISO(booking.startAt), "HH:mm")}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{bookingDetails?.patient?.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {bookingDetails?.patient?.phone || "No phone"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{bookingDetails?.treatment?.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">
                                {bookingDetails?.treatment?.category || "General"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{bookingDetails?.staff?.name || "Unknown"}</div>
                              <div className="text-sm text-muted-foreground">
                                {bookingDetails?.staff?.role || "Staff"}
                              </div>
                            </td>
                            <td className="p-3 text-sm">{bookingDetails?.treatment?.durationMin || 60} min</td>
                            <td className="p-3 font-medium">
                              Rp {bookingDetails?.treatment?.price?.toLocaleString() || "0"}
                            </td>
                            <td className="p-3">{getStatusBadge(booking.status)}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    const details = getBookingDetails(booking)
                                    if (details) setSelectedBooking(details)
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                                {booking.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleBookingAction(booking.id, "checkin")}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {booking.status === "confirmed" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleBookingAction(booking.id, "complete")}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleBookingAction(booking.id, "delete")}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          {hasActiveFilters ? "No appointments match your filters" : "No appointments found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of {filteredBookings.length}{" "}
                    appointments
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
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    setSelectedSlot({ date: new Date(), time: "09:00" })
                    setBookingForm({
                      patientId: "",
                      staffId: "",
                      treatmentId: "",
                      notes: "",
                      paymentStatus: "unpaid",
                    })
                    setShowBookingDialog(true)
                  }}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedSlot && (
                <div className="text-sm text-muted-foreground">
                  {format(selectedSlot.date, "EEEE, MMMM d, yyyy")} at {selectedSlot.time}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="patient">Patient *</Label>
                <div className="flex gap-2">
                  <Select
                    value={bookingForm.patientId}
                    onValueChange={(value) => setBookingForm((prev) => ({ ...prev, patientId: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients && patients.length > 0 ? (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No patients available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openNewPatientDialog}
                    className="shrink-0 bg-transparent"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Can't find the patient? Click the + button to create a new one.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment *</Label>
                <Select
                  value={bookingForm.treatmentId}
                  onValueChange={(value) => setBookingForm((prev) => ({ ...prev, treatmentId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select treatment" />
                  </SelectTrigger>
                  <SelectContent>
                    {treatments && treatments.length > 0 ? (
                      treatments.map((treatment) => (
                        <SelectItem key={treatment.id} value={treatment.id}>
                          {treatment.name} - {treatment.durationMin}min - Rp {treatment.price.toLocaleString()}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No treatments available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff">Staff *</Label>
                <Select
                  value={bookingForm.staffId}
                  onValueChange={(value) => setBookingForm((prev) => ({ ...prev, staffId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff && staff.length > 0 ? (
                      staff.map((staffMember) => (
                        <SelectItem key={staffMember.id} value={staffMember.id}>
                          {staffMember.name} - {staffMember.role}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No staff available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Payment Status</Label>
                <Select
                  value={bookingForm.paymentStatus}
                  onValueChange={(value: any) => setBookingForm((prev) => ({ ...prev, paymentStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateBooking} className="flex-1">
                  Create Booking
                </Button>
                <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Booking Details Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedBooking.patient?.name || "Unknown Patient"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedBooking.treatment?.name || "Unknown Treatment"}
                    </p>
                  </div>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{format(parseISO(selectedBooking.startAt), "HH:mm")}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{selectedBooking.treatment?.durationMin || 60} min</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Staff:</span>
                    <p className="font-medium">{selectedBooking.staff?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price:</span>
                    <p className="font-medium">Rp {selectedBooking.treatment?.price?.toLocaleString() || "0"}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.patient?.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.patient?.email || "No email"}</span>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Notes:</p>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {selectedBooking.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleBookingAction(selectedBooking.id, "checkin")}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  {selectedBooking.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => handleBookingAction(selectedBooking.id, "complete")}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete
                    </Button>
                  )}
                  {["pending", "confirmed"].includes(selectedBooking.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingAction(selectedBooking.id, "cancel")}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleBookingAction(selectedBooking.id, "delete")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                Advanced Filters
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="border-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            filters.status === "all"
                              ? "bg-gray-400"
                              : filters.status === "pending"
                                ? "bg-yellow-400"
                                : filters.status === "confirmed"
                                  ? "bg-blue-400"
                                  : filters.status === "completed"
                                    ? "bg-green-400"
                                    : filters.status === "cancelled"
                                      ? "bg-red-400"
                                      : filters.status === "no-show"
                                        ? "bg-orange-400"
                                        : "bg-gray-400"
                          }`}
                        ></div>
                        <SelectValue placeholder="All statuses" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Search status..."
                            value={statusSearch}
                            onChange={(e) => setStatusSearch(e.target.value)}
                            className="pl-7 h-8 text-xs"
                          />
                        </div>
                      </div>
                      {[
                        { value: "all", label: "All statuses", color: "bg-gray-400" },
                        { value: "pending", label: "Pending", color: "bg-yellow-400" },
                        { value: "confirmed", label: "Confirmed", color: "bg-blue-400" },
                        { value: "completed", label: "Completed", color: "bg-green-400" },
                        { value: "cancelled", label: "Cancelled", color: "bg-red-400" },
                        { value: "no-show", label: "No Show", color: "bg-orange-400" },
                      ]
                        .filter((status) => status.label.toLowerCase().includes(statusSearch.toLowerCase()))
                        .map((status) => (
                          <SelectItem key={status.value} value={status.value} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                              {status.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Staff</Label>
                  <Select
                    value={filters.staffId}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, staffId: value }))}
                  >
                    <SelectTrigger className="border-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                        <SelectValue placeholder="All staff" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Search staff..."
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            className="pl-7 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <SelectItem value="all" className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          All staff
                        </div>
                      </SelectItem>
                      {staff &&
                        staff
                          .filter(
                            (staffMember) =>
                              staffMember.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
                              staffMember.role.toLowerCase().includes(staffSearch.toLowerCase()),
                          )
                          .map((staffMember) => (
                            <SelectItem key={staffMember.id} value={staffMember.id} className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    staffMember.role === "Senior Therapist"
                                      ? "bg-purple-500"
                                      : staffMember.role === "Therapist"
                                        ? "bg-blue-500"
                                        : staffMember.role === "Junior Therapist"
                                          ? "bg-green-500"
                                          : staffMember.role === "Receptionist"
                                            ? "bg-pink-500"
                                            : "bg-gray-500"
                                  }`}
                                ></div>
                                {staffMember.name} - {staffMember.role}
                              </div>
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Treatment</Label>
                  <Select
                    value={filters.treatmentId}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, treatmentId: value }))}
                  >
                    <SelectTrigger className="border-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                        <SelectValue placeholder="All treatments" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Search treatments..."
                            value={treatmentSearch}
                            onChange={(e) => setTreatmentSearch(e.target.value)}
                            className="pl-7 h-8 text-xs"
                          />
                        </div>
                      </div>
                      <SelectItem value="all" className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                          All treatments
                        </div>
                      </SelectItem>
                      {treatments &&
                        treatments
                          .filter(
                            (treatment) =>
                              treatment.name.toLowerCase().includes(treatmentSearch.toLowerCase()) ||
                              treatment.category.toLowerCase().includes(treatmentSearch.toLowerCase()),
                          )
                          .map((treatment) => (
                            <SelectItem key={treatment.id} value={treatment.id} className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    treatment.category === "Facial"
                                      ? "bg-pink-500"
                                      : treatment.category === "Body"
                                        ? "bg-blue-500"
                                        : treatment.category === "Hair"
                                          ? "bg-purple-500"
                                          : treatment.category === "Nail"
                                            ? "bg-red-500"
                                            : "bg-indigo-500"
                                  }`}
                                ></div>
                                {treatment.name} - {treatment.durationMin}min
                              </div>
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Payment Status</Label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentStatus: value }))}
                  >
                    <SelectTrigger className="border-2 hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            filters.paymentStatus === "all"
                              ? "bg-gray-400"
                              : filters.paymentStatus === "paid"
                                ? "bg-green-400"
                                : filters.paymentStatus === "deposit"
                                  ? "bg-yellow-400"
                                  : filters.paymentStatus === "unpaid"
                                    ? "bg-red-400"
                                    : "bg-gray-400"
                          }`}
                        ></div>
                        <SelectValue placeholder="All payment statuses" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Search payment status..."
                            value={paymentSearch}
                            onChange={(e) => setPaymentSearch(e.target.value)}
                            className="pl-7 h-8 text-xs"
                          />
                        </div>
                      </div>
                      {[
                        { value: "all", label: "All payment statuses", color: "bg-gray-400" },
                        { value: "paid", label: "Paid", color: "bg-green-400" },
                        { value: "deposit", label: "Deposit", color: "bg-yellow-400" },
                        { value: "unpaid", label: "Unpaid", color: "bg-red-400" },
                      ]
                        .filter((payment) => payment.label.toLowerCase().includes(paymentSearch.toLowerCase()))
                        .map((payment) => (
                          <SelectItem key={payment.value} value={payment.value} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${payment.color}`}></div>
                              {payment.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Date Range</Label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger className="border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week" className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        This Week
                      </SelectItem>
                      <SelectItem value="month" className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                        This Month
                      </SelectItem>
                      <SelectItem value="custom" className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                        Custom Range
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.dateRange === "custom" && (
                  <div className="space-y-3 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border-2 border-pink-200">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Custom Date Range
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Start Date</Label>
                        <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-2 hover:border-primary/50 bg-transparent"
                            >
                              <Calendar className="mr-2 h-4 w-4 text-primary" />
                              {filters.customStartDate
                                ? format(new Date(filters.customStartDate), "PPP")
                                : "Pick start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={filters.customStartDate ? new Date(filters.customStartDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setFilters((prev) => ({ ...prev, customStartDate: format(date, "yyyy-MM-dd") }))
                                  setShowStartCalendar(false)
                                }
                              }}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">End Date</Label>
                        <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-2 hover:border-primary/50 bg-transparent"
                            >
                              <Calendar className="mr-2 h-4 w-4 text-primary" />
                              {filters.customEndDate ? format(new Date(filters.customEndDate), "PPP") : "Pick end date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={filters.customEndDate ? new Date(filters.customEndDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setFilters((prev) => ({ ...prev, customEndDate: format(date, "yyyy-MM-dd") }))
                                  setShowEndCalendar(false)
                                }
                              }}
                              disabled={(date) => {
                                const startDate = filters.customStartDate
                                  ? new Date(filters.customStartDate)
                                  : new Date("1900-01-01")
                                return date < startDate || date > new Date()
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => setShowFilterDialog(false)}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={resetFilters}
                className="border-2 hover:border-primary/50 bg-transparent"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Reset All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilterDialog(false)}
                className="border-2 hover:border-primary/50"
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Patient Dialog */}
        <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New Patient
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-patient-name">Name *</Label>
                <Input
                  id="new-patient-name"
                  placeholder="Patient name"
                  value={newPatientForm.name}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-patient-phone">Phone *</Label>
                <Input
                  id="new-patient-phone"
                  placeholder="+62 812 345 6789"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-patient-email">Email</Label>
                <Input
                  id="new-patient-email"
                  type="email"
                  placeholder="patient@email.com"
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-patient-notes">Notes</Label>
                <Textarea
                  id="new-patient-notes"
                  placeholder="Additional notes about the patient..."
                  value={newPatientForm.notes}
                  onChange={(e) => setNewPatientForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateNewPatient} className="flex-1">
                  Create Patient
                </Button>
                <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}

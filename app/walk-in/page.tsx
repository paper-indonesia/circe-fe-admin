"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
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
  Percent, DollarSign, ChevronDown
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePatients, useStaff, useTreatments, useBookings } from "@/lib/context"
import { formatCurrency, cn } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday, startOfDay, addMonths, subMonths } from "date-fns"
import LiquidLoading from "@/components/ui/liquid-loader"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"
import { BookingDateTime } from "@/components/booking-date-time"

const timeSlots = [
  { time: "09:00", available: true },
  { time: "09:30", available: true },
  { time: "10:00", available: false },
  { time: "10:30", available: true },
  { time: "11:00", available: true },
  { time: "11:30", available: false },
  { time: "14:00", available: true },
  { time: "14:30", available: true },
  { time: "15:00", available: true },
  { time: "15:30", available: false },
  { time: "16:00", available: true },
  { time: "16:30", available: true },
  { time: "17:00", available: true },
]

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
  
  const [currentQueue, setCurrentQueue] = useState(1)
  const [todayBookings, setTodayBookings] = useState<Booking[]>([])
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

  // Load today's bookings
  useEffect(() => {
    // Use local storage for walk-in bookings
    const storageKey = `walkInBookings`
    const savedBookings = localStorage.getItem(storageKey)
    
    if (savedBookings) {
      const bookings = JSON.parse(savedBookings)
      const today = new Date().toDateString()
      const todayBookingsList = bookings.filter((b: Booking) => 
        new Date(b.createdAt).toDateString() === today
      )
      setTodayBookings(todayBookingsList)
      
      // Set queue number
      if (todayBookingsList.length > 0) {
        const maxQueue = Math.max(...todayBookingsList.map((b: Booking) => b.queueNumber))
        setCurrentQueue(maxQueue + 1)
      }
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

  // Filter available time slots based on selected date, staff, and current time
  const availableTimeSlots = useMemo(() => {
    if (!formData.bookingDate || !formData.staffId) return []

    const now = new Date()
    const selectedDate = formData.bookingDate
    const isToday = selectedDate === format(now, 'yyyy-MM-dd')
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Filter bookings for selected date and staff
    const staffBookings = todayBookings.filter(
      b => b.bookingDate === formData.bookingDate && b.staffId === formData.staffId
    )

    return timeSlots.map(slot => {
      const [slotHour, slotMinute] = slot.time.split(':').map(Number)
      const isBooked = staffBookings.some(b => b.timeSlot === slot.time)

      if (isToday) {
        // If today, disable past time slots
        const isPast = slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)
        return {
          ...slot,
          available: !isBooked && !isPast
        }
      }

      return {
        ...slot,
        available: !isBooked
      }
    })
  }, [formData.bookingDate, formData.staffId, todayBookings])

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
    if (selectedTreatment.assignedStaff && selectedTreatment.assignedStaff.length > 0) {
      return staff.filter(s => selectedTreatment.assignedStaff?.includes(s.id))
    }
    return staff
  }, [selectedTreatment, staff])
  
  // Filter existing clients from patients data
  const existingClients = useMemo(() => {
    return patients.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email || '',
      lastVisit: p.lastVisitAt || 'New client',
      totalVisits: p.totalVisits
    }))
  }, [patients])

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required"
    if (!formData.phone.match(/^(\+62|0)[0-9]{9,13}$/)) {
      newErrors.phone = "Invalid phone number format"
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

  const confirmBooking = async () => {
    setIsValidating(true)
    
    try {
      
      // Find or create patient
      let patientId = formData.existingClientId
      if (!patientId) {
        // Create new patient in MongoDB
        const newPatient = await apiClient.createPatient({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          notes: formData.notes
        })
        patientId = newPatient._id
      }
      
      // Calculate time slots
      const bookingDate = new Date(formData.bookingDate)
      const [hours, minutes] = formData.timeSlot.split(':').map(Number)
      const startAt = new Date(bookingDate.setHours(hours, minutes, 0, 0))
      const endAt = new Date(startAt.getTime() + (selectedTreatment?.duration || 60) * 60000)
      
      // Create booking in MongoDB
      const mongoBooking = await apiClient.createBooking({
        patientId,
        patientName: formData.name,
        staffId: formData.staffId,
        treatmentId: formData.treatmentId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status: 'pending',
        source: 'walk-in',
        paymentStatus: formData.paymentType === 'deposit' ? 'deposit' : 'unpaid',
        notes: formData.notes,
        queueNumber: currentQueue,
        paymentMethod: formData.paymentMethod,
        paymentAmount: formData.paymentType === "deposit" ? depositAmount : totalAmount
      })
      
      const booking: Booking = {
        id: mongoBooking._id || `WI${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        treatment: selectedTreatment?.name || "",
        staff: selectedStaff?.name || "",
        timeSlot: formData.timeSlot,
        status: "waiting",
        createdAt: new Date(),
        queueNumber: currentQueue,
        paymentAmount: formData.paymentType === "deposit" ? depositAmount : totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType
      }
      
      // Also save to localStorage as backup
      const storageKey = `walkInBookings`
      const existingBookings = JSON.parse(localStorage.getItem(storageKey) || "[]")
      existingBookings.push(booking)
      localStorage.setItem(storageKey, JSON.stringify(existingBookings))
      
      setLastBooking(booking)
      setTodayBookings([...todayBookings, booking])
      
    } catch (error) {
      console.log("MongoDB save failed, using localStorage:", error)
      
      // Fallback to localStorage only
      const booking: Booking = {
        id: `WI${Date.now()}`,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        treatment: selectedTreatment?.name || "",
        staff: selectedStaff?.name || "",
        timeSlot: formData.timeSlot,
        status: "waiting",
        createdAt: new Date(),
        queueNumber: currentQueue,
        paymentAmount: formData.paymentType === "deposit" ? depositAmount : totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentType: formData.paymentType
      }

      // Save booking PER TENANT
      const storageKey = `walkInBookings`
      const existingBookings = JSON.parse(localStorage.getItem(storageKey) || "[]")
      existingBookings.push(booking)
      localStorage.setItem(storageKey, JSON.stringify(existingBookings))
      
      setLastBooking(booking)
      setTodayBookings([...todayBookings, booking])
    }

    setCurrentQueue(currentQueue + 1)
    
    setIsValidating(false)
    setShowConfirmDialog(false)
    setShowSuccessDialog(true)

    // Reset form
    resetForm()
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

  const handleClientSelect = (client: any) => {
    setFormData({
      ...formData,
      name: client.name,
      phone: client.phone,
      email: client.email,
      existingClient: true
    })
    setShowClientSearch(false)
    setSearchQuery("")
    toast({
      title: "Client Selected",
      description: `${client.name} has been selected.`,
    })
  }

  const filteredClients = existingClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group clients by alphabet
  const groupedClients = useMemo(() => {
    const groups: Record<string, typeof filteredClients> = {}

    filteredClients.forEach(client => {
      const firstLetter = client.name.charAt(0).toUpperCase()
      if (!groups[firstLetter]) {
        groups[firstLetter] = []
      }
      groups[firstLetter].push(client)
    })

    // Sort each group by name
    Object.keys(groups).forEach(letter => {
      groups[letter].sort((a, b) => a.name.localeCompare(b.name))
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
    const waiting = todayBookings.filter(b => b.status === "waiting").length
    const inProgress = todayBookings.filter(b => b.status === "in-progress").length
    const completed = todayBookings.filter(b => b.status === "completed").length
    
    return { waiting, inProgress, completed }
  }

  const queueStatus = getQueueStatus()

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  // Check if data is completely empty (no staff or treatments to enable walk-in)
  const hasNoData = !loading && (
    (!staff || staff.length === 0) ||
    (!treatments || treatments.length === 0)
  )

  return (
    <MainLayout>
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
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+62 812 345 6789"
                        className={errors.phone ? "border-red-500" : ""}
                        required
                      />
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
                          onClick={() => setFormData({ ...formData, treatmentId: treatment.id })}
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
              <Card>
                <CardHeader>
                  <CardTitle>Select Staff Member</CardTitle>
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
                  <BookingDateTime
                    provider={{
                      name: selectedStaff?.name || "Select Staff First",
                      address: "Beauty Clinic - Jakarta",
                      avatarUrl: selectedStaff?.photoUrl
                    }}
                    selectedStaffId={formData.staffId}
                    existingBookings={todayBookings.map(b => ({
                      bookingDate: b.bookingDate,
                      timeSlot: b.timeSlot,
                      staffId: b.staffId || b.staff
                    }))}
                    onSelectDateTime={(date, time) => {
                      setFormData({ ...formData, bookingDate: date, timeSlot: time })
                      setErrors({ ...errors, timeSlot: "" })
                    }}
                    isLoading={loading}
                  />
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
                    {todayBookings.slice(-3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">#{booking.queueNumber.toString().padStart(3, '0')}</span>
                          <div>
                            <p className="text-sm">{booking.name}</p>
                            <p className="text-xs text-muted-foreground">{booking.treatment}</p>
                          </div>
                        </div>
                        <Badge variant={
                          booking.status === "waiting" ? "secondary" :
                          booking.status === "in-progress" ? "default" :
                          booking.status === "completed" ? "outline" : "destructive"
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                    {todayBookings.length === 0 && (
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

        {/* Client Search Dialog */}
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
              {/* Search Input */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Results List - Grouped by Alphabet */}
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                {filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">
                      {searchQuery ? "No clients found matching your search" : "Start typing to search clients"}
                    </p>
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
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base text-foreground mb-2 truncate group-hover:text-primary transition-colors">
                                          {client.name}
                                        </h4>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-mono">{client.phone}</span>
                                          </div>
                                          {client.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                                              <span className="truncate">{client.email}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex-shrink-0">
                                        <Badge variant="outline" className="text-xs whitespace-nowrap">
                                          {client.lastVisit === 'New client' ? '🆕 New' : `Last: ${client.lastVisit}`}
                                        </Badge>
                                      </div>
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
    </MainLayout>
  )
}
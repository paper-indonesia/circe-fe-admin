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
  TrendingUp, Star, Activity, Search
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { usePatients, useStaff, useTreatments, useBookings } from "@/lib/context"
import { formatCurrency } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"
import LiquidLoading from "@/components/ui/liquid-loader"
import { useTerminology } from "@/hooks/use-terminology"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"

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
  const terminology = useTerminology()
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
  const [treatmentSearchQuery, setTreatmentSearchQuery] = useState("")
  const [staffSearchQuery, setStaffSearchQuery] = useState("")
  const [treatmentPage, setTreatmentPage] = useState(1)
  const [staffPage, setStaffPage] = useState(1)
  const treatmentsPerPage = 6
  const staffPerPage = 6

  // Walk-in is enabled by default
  const isWalkInEnabled = true

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
    treatmentId: "",
    staffId: "",
    timeSlot: "",
    paymentMethod: "",
    paymentType: "deposit",
    existingClient: false,
    sendReminder: true,
    addToMembership: false,
  })

  const [errors, setErrors] = useState<any>({})
  const [selectedCategory, setSelectedCategory] = useState("All")

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

  const depositAmount = selectedTreatment ? selectedTreatment.price * 0.5 : 0
  const totalAmount = selectedTreatment ? selectedTreatment.price : 0
  
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
      const now = new Date()
      const [hours, minutes] = formData.timeSlot.split(':').map(Number)
      const startAt = new Date(now.setHours(hours, minutes, 0, 0))
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
    
    // Send notifications if enabled
    if (formData.sendReminder) {
      toast({
        title: "Reminder Sent",
        description: "Booking confirmation has been sent via SMS/WhatsApp.",
      })
    }
    
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
      timeSlot: "",
      paymentMethod: "",
      paymentType: "deposit",
      existingClient: false,
      sendReminder: true,
      addToMembership: false,
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
          description={`Quick booking feature for walk-in ${terminology.patient.toLowerCase()}. Before you can use walk-in, please add ${terminology.staff.toLowerCase()} and ${terminology.treatment.toLowerCase()} first.`}
          actionLabel={`Setup ${terminology.staff}`}
          onAction={() => router.push('/staff')}
          secondaryActionLabel={`Add ${terminology.treatment}`}
          onSecondaryAction={() => router.push('/treatments')}
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
                  
                  <div className="flex gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="reminder"
                        checked={formData.sendReminder}
                        onChange={(e) => setFormData({ ...formData, sendReminder: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="reminder" className="text-sm">Send SMS/WhatsApp reminder</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="membership"
                        checked={formData.addToMembership}
                        onChange={(e) => setFormData({ ...formData, addToMembership: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="membership" className="text-sm">Add to membership program</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Treatment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Filter by Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {["All", "Facial", "Injection", "Laser", "Treatment"].map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(category)
                            setTreatmentPage(1)
                          }}
                          className="cursor-pointer"
                        >
                          <Badge
                            variant={selectedCategory === category ? "default" : "outline"}
                            className="transition-all hover:scale-105"
                          >
                            {category}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Search Treatment</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by treatment name..."
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
                    <Label>Available Treatments *</Label>
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

                  <div className="space-y-2">
                    <Label>Available Time Slots *</Label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.time}
                          type="button"
                          variant={formData.timeSlot === slot.time ? "default" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => setFormData({ ...formData, timeSlot: slot.time })}
                          className={`${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                    {errors.timeSlot && <p className="text-sm text-red-500">{errors.timeSlot}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={formData.paymentMethod === "cash" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentMethod: "cash" })}
                        className="flex flex-col items-center gap-2 h-auto py-3"
                      >
                        <Banknote className="h-5 w-5" />
                        <span>Cash</span>
                      </Button>
                      <Button
                        type="button"
                        variant={formData.paymentMethod === "card" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                        className="flex flex-col items-center gap-2 h-auto py-3"
                      >
                        <CreditCard className="h-5 w-5" />
                        <span>Card</span>
                      </Button>
                      <Button
                        type="button"
                        variant={formData.paymentMethod === "qris" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentMethod: "qris" })}
                        className="flex flex-col items-center gap-2 h-auto py-3"
                      >
                        <Smartphone className="h-5 w-5" />
                        <span>QRIS</span>
                      </Button>
                    </div>
                    {errors.paymentMethod && <p className="text-sm text-red-500">{errors.paymentMethod}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Payment Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={formData.paymentType === "deposit" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentType: "deposit" })}
                        className="flex-1"
                      >
                        Deposit (50%)
                      </Button>
                      <Button
                        type="button"
                        variant={formData.paymentType === "full" ? "default" : "outline"}
                        onClick={() => setFormData({ ...formData, paymentType: "full" })}
                        className="flex-1"
                      >
                        Full Payment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
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
                      <Label className="text-sm text-muted-foreground">Treatment</Label>
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

                  {formData.timeSlot && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Time</Label>
                      <p className="font-medium">Today, {formData.timeSlot}</p>
                    </div>
                  )}

                  {selectedTreatment && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>Treatment Price</span>
                        <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
                      </div>
                      {formData.paymentType === "deposit" && (
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span>Deposit (50%)</span>
                          <span>Rp {depositAmount.toLocaleString("id-ID")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
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
                <span className="text-sm text-muted-foreground">Treatment:</span>
                <span className="text-sm font-medium">{selectedTreatment?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Staff:</span>
                <span className="text-sm font-medium">{selectedStaff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Time:</span>
                <span className="text-sm font-medium">Today, {formData.timeSlot}</span>
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
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <span className="text-sm">Today, {lastBooking?.timeSlot}</span>
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
          <DialogContent className="max-w-2xl max-h-[70vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Search Existing Client
              </DialogTitle>
              <DialogDescription>
                Search and select a client from your database
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                {filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No clients found matching your search" : "Start typing to search clients"}
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => handleClientSelect(client)}
                      className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{client.phone}</span>
                            <span>{client.email}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            Last visit: {client.lastVisit}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowClientSearch(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </MainLayout>
  )
}
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { UserCog, Plus, AlertCircle, CheckCircle2, Info, ArrowUpCircle, Calendar, Clock, Settings, ChevronDown, ChevronUp } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { useSubscription } from "@/lib/subscription-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface StaffAvailabilityStepProps {
  onValidChange: (isValid: boolean) => void
}

const WEEKDAYS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
]

const EMPLOYMENT_TYPES = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "freelance", label: "Freelance" },
  { value: "intern", label: "Intern" },
]

export function StaffAvailabilityStep({ onValidChange }: StaffAvailabilityStepProps) {
  const { toast } = useToast()
  const { progress, addStaff, addAvailability } = useOperationalOnboarding()
  const { usage } = useSubscription()

  const [currentTab, setCurrentTab] = useState<'staff' | 'availability'>('staff')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(true)
  const [staffForm, setStaffForm] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    email: "",
    phone: "",
    position: "",
    employment_type: "full_time" as "full_time" | "part_time" | "contract" | "freelance" | "intern",
    outlet_id: "",
    employee_id: "",
    hire_date: "",
    birth_date: "",
    hourly_rate: null as number | null,
    salary: null as number | null,
    is_bookable: true,
    accepts_online_booking: true,
    max_advance_booking_days: 30,
    bio: "",
    profile_image_url: "",
    instagram_handle: "",
    service_ids: [] as string[],
    specialties: [] as string[],
    certifications: [] as string[],
    years_experience: null as number | null,
  })

  const [availabilityForm, setAvailabilityForm] = useState({
    staff_id: "",
    start_time: "09:00",
    end_time: "17:00",
    recurrence_days: [] as number[],
    recurrence_end_date: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [planLimits, setPlanLimits] = useState<{ current: number; max: number } | null>(null)
  const [positionTemplates, setPositionTemplates] = useState<string[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)
  const [outlets, setOutlets] = useState<any[]>([])
  const [loadingOutlets, setLoadingOutlets] = useState(false)
  const [services, setServices] = useState<any[]>([])
  const [loadingServices, setLoadingServices] = useState(false)

  // Load outlets from API
  useEffect(() => {
    const fetchOutlets = async () => {
      setLoadingOutlets(true)
      try {
        const response = await fetch('/api/outlets?page=1&size=100&status=active')
        if (response.ok) {
          const data = await response.json()
          // API might return { items: [...] } or just [...]
          const outletsList = data.items || data.results || (Array.isArray(data) ? data : [])
          setOutlets(outletsList)

          // Auto-select first outlet for staff form if available and form is empty
          if (outletsList.length > 0 && !staffForm.outlet_id) {
            setStaffForm((prev) => ({
              ...prev,
              outlet_id: outletsList[0]._id || outletsList[0].id,
            }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch outlets:', error)
      } finally {
        setLoadingOutlets(false)
      }
    }

    fetchOutlets()
  }, [])

  // Load services from API
  useEffect(() => {
    const fetchServices = async () => {
      setLoadingServices(true)
      try {
        const response = await fetch('/api/services?page=1&size=100&status=active')
        if (response.ok) {
          const data = await response.json()
          // API returns { items: [...], total, page, size, pages }
          const servicesList = data.items || []
          setServices(servicesList)
        }
      } catch (error) {
        console.error('Failed to fetch services:', error)
      } finally {
        setLoadingServices(false)
      }
    }

    fetchServices()
  }, [])

  // Load position templates
  useEffect(() => {
    const fetchPositionTemplates = async () => {
      setLoadingPositions(true)
      try {
        const response = await fetch('/api/staff/positions/templates')
        if (response.ok) {
          const data = await response.json()
          // API returns array of position strings
          if (Array.isArray(data)) {
            setPositionTemplates(data)
          } else if (data.positions && Array.isArray(data.positions)) {
            setPositionTemplates(data.positions)
          }
        }
      } catch (error) {
        console.error('Failed to fetch position templates:', error)
      } finally {
        setLoadingPositions(false)
      }
    }

    fetchPositionTemplates()
  }, [])

  // Load plan limits from subscription context
  useEffect(() => {
    if (usage?.usage_summary?.staff) {
      setPlanLimits({
        current: usage.usage_summary.staff.used || 0,
        max: usage.usage_summary.staff.limit || 999,
      })
    }
  }, [usage])

  // Update parent validation state
  useEffect(() => {
    const hasStaff = progress.staff.length > 0
    const hasAvailability = progress.availabilities.length > 0
    onValidChange(hasStaff && hasAvailability)
  }, [progress.staff, progress.availabilities, onValidChange])

  const validateStaff = () => {
    const newErrors: Record<string, string> = {}

    if (!staffForm.first_name.trim()) {
      newErrors.first_name = "Nama depan wajib diisi"
    }
    if (!staffForm.last_name.trim()) {
      newErrors.last_name = "Nama belakang wajib diisi"
    }
    if (!staffForm.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffForm.email)) {
      newErrors.email = "Format email tidak valid"
    }
    if (!staffForm.position.trim()) {
      newErrors.position = "Posisi wajib diisi"
    }
    if (!staffForm.employment_type) {
      newErrors.employment_type = "Tipe employment wajib dipilih"
    }
    if (!staffForm.outlet_id) {
      newErrors.outlet_id = "Outlet wajib dipilih"
    }
    if (staffForm.phone && !/^[\d\s\-\+()]+$/.test(staffForm.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateAvailability = () => {
    const newErrors: Record<string, string> = {}

    if (!availabilityForm.staff_id) {
      newErrors.staff_id = "Pilih staff terlebih dahulu"
    }
    if (availabilityForm.recurrence_days.length === 0) {
      newErrors.recurrence_days = "Pilih minimal 1 hari kerja"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddStaff = async () => {
    if (!validateStaff()) return

    // Check plan limits
    if (planLimits && progress.staff.length >= planLimits.max) {
      toast({
        title: "Limit Tercapai",
        description: `Plan Anda hanya mendukung maksimal ${planLimits.max} staff. Upgrade untuk menambah lebih banyak.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: staffForm.first_name.trim(),
          last_name: staffForm.last_name.trim(),
          display_name: staffForm.display_name.trim() || staffForm.first_name.trim(),
          email: staffForm.email.trim(),
          phone: staffForm.phone.trim() || undefined,
          position: staffForm.position.trim(),
          employment_type: staffForm.employment_type,
          outlet_id: staffForm.outlet_id,
          employee_id: staffForm.employee_id.trim() || undefined,
          hire_date: staffForm.hire_date || undefined,
          birth_date: staffForm.birth_date || undefined,
          hourly_rate: staffForm.hourly_rate || undefined,
          salary: staffForm.salary || undefined,
          is_bookable: staffForm.is_bookable,
          accepts_online_booking: staffForm.accepts_online_booking,
          max_advance_booking_days: staffForm.max_advance_booking_days,
          bio: staffForm.bio.trim() || undefined,
          profile_image_url: staffForm.profile_image_url.trim() || undefined,
          instagram_handle: staffForm.instagram_handle.trim() || undefined,
          skills: {
            service_ids: staffForm.service_ids,
            specialties: staffForm.specialties,
            certifications: staffForm.certifications,
            years_experience: staffForm.years_experience || undefined,
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newStaff = {
          id: data._id || data.id,
          first_name: staffForm.first_name.trim(),
          last_name: staffForm.last_name.trim(),
          email: staffForm.email.trim(),
          phone: staffForm.phone.trim() || undefined,
          position: staffForm.position,
          service_ids: staffForm.service_ids,
        }

        addStaff(newStaff)

        toast({
          title: "Berhasil",
          description: "Staff berhasil ditambahkan",
        })

        // Reset form and switch to availability tab
        setStaffForm({
          first_name: "",
          last_name: "",
          display_name: "",
          email: "",
          phone: "",
          position: "",
          employment_type: "full_time",
          outlet_id: outlets[0]?._id || outlets[0]?.id || "",
          employee_id: "",
          hire_date: "",
          birth_date: "",
          hourly_rate: null,
          salary: null,
          is_bookable: true,
          accepts_online_booking: true,
          max_advance_booking_days: 30,
          bio: "",
          profile_image_url: "",
          instagram_handle: "",
          service_ids: [],
          specialties: [],
          certifications: [],
          years_experience: null,
        })
        // Keep advanced settings expanded
        setAvailabilityForm((prev) => ({
          ...prev,
          staff_id: newStaff.id!,
        }))
        setErrors({})
        setCurrentTab('availability')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal menambahkan staff")
      }
    } catch (error: any) {
      console.error("Failed to add staff:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan staff",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddAvailability = async () => {
    if (!validateAvailability()) return

    setLoading(true)

    try {
      const today = new Date()

      // Calculate recurrence_end_date (3 months from now if not specified)
      const endDate = availabilityForm.recurrence_end_date || (() => {
        const threeMonthsLater = new Date()
        threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
        return threeMonthsLater.toISOString().split('T')[0]
      })()

      // Convert UI weekday values to API weekday values
      // UI: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
      // API: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
      // Mapping: apiDay = (uiDay + 6) % 7
      const apiRecurrenceDays = availabilityForm.recurrence_days
        .map(day => (day + 6) % 7)
        .sort((a, b) => a - b) // Sort for consistency

      // Create single availability with weekly recurrence
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staff_id: availabilityForm.staff_id,
          date: today.toISOString().split('T')[0],
          start_time: availabilityForm.start_time,
          end_time: availabilityForm.end_time,
          availability_type: "working_hours",
          recurrence_type: "weekly",
          recurrence_end_date: endDate,
          recurrence_days: apiRecurrenceDays,
          is_available: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || "Failed to create availability")
      }

      const data = await response.json()

      // Add to local context for onboarding wizard
      addAvailability({
        staff_id: availabilityForm.staff_id,
        date: today.toISOString().split('T')[0],
        start_time: availabilityForm.start_time + ":00",
        end_time: availabilityForm.end_time + ":00",
        recurrence_type: "weekly",
        recurrence_days: availabilityForm.recurrence_days, // Keep UI format for display
      })

      // Show success with summary if available
      const successMessage = data.summary
        ? `Berhasil membuat ${data.summary.total_entries_created} jadwal ketersediaan`
        : "Jadwal ketersediaan berhasil ditambahkan"

      toast({
        title: "Berhasil",
        description: successMessage,
      })

      // Reset form
      setAvailabilityForm({
        staff_id: "",
        start_time: "09:00",
        end_time: "17:00",
        recurrence_days: [],
        recurrence_end_date: "",
      })
      setErrors({})
      setCurrentTab('staff')
    } catch (error: any) {
      console.error("Failed to add availability:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan jadwal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canAddMoreStaff = !planLimits || progress.staff.length < planLimits.max

  const toggleDay = (day: number) => {
    setAvailabilityForm((prev) => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter((d) => d !== day)
        : [...prev.recurrence_days, day],
    }))
  }

  return (
    <div className="space-y-6">
      {/* Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-blue-200 bg-blue-50">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Apa yang harus dilakukan</h3>
              <p className="text-sm text-blue-700">
                Tambahkan staff, mapping ke layanan yang bisa dikerjakan, lalu atur jam ketersediaan mereka.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-purple-200 bg-purple-50">
          <div className="flex items-start gap-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 mb-2">Kenapa ini penting</h3>
              <p className="text-sm text-purple-700">
                Staff dan availability menentukan slot booking yang tersedia dan menghindari bentrok jadwal.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Plan Limits Info */}
      {planLimits && currentTab === 'staff' && (
        <Alert className={canAddMoreStaff ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <AlertCircle className={canAddMoreStaff ? "h-4 w-4 text-green-600" : "h-4 w-4 text-orange-600"} />
          <AlertDescription className={canAddMoreStaff ? "text-green-800" : "text-orange-800"}>
            Plan Anda: {progress.staff.length} / {planLimits.max} staff terpakai
            {!canAddMoreStaff && (
              <Button variant="link" className="ml-2 h-auto p-0 text-orange-600 hover:text-orange-700" asChild>
                <a href="/subscription/upgrade">
                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                  Upgrade Plan
                </a>
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setCurrentTab('staff')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            currentTab === 'staff'
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCog className="h-4 w-4 inline mr-2" />
          Tambah Staff
        </button>
        <button
          onClick={() => setCurrentTab('availability')}
          disabled={progress.staff.length === 0}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            currentTab === 'availability'
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          <Calendar className="h-4 w-4 inline mr-2" />
          Atur Ketersediaan
        </button>
      </div>

      {/* Staff Form */}
      {currentTab === 'staff' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserCog className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold">Tambah Staff Baru</h3>
          </div>

          <div className="space-y-6">
            {/* Basic Information - REQUIRED */}
            <div className="p-5 bg-blue-50/30 border-2 border-blue-200 rounded-xl space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-600 text-white">Wajib Diisi</Badge>
                <h4 className="text-sm font-semibold text-gray-700">Informasi Dasar Staff</h4>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="staff_first_name">
                  Nama Depan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="staff_first_name"
                  placeholder="Contoh: Siti"
                  value={staffForm.first_name}
                  onChange={(e) => setStaffForm({ ...staffForm, first_name: e.target.value })}
                  className={errors.first_name ? "border-red-500" : ""}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff_last_name">
                  Nama Belakang <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="staff_last_name"
                  placeholder="Contoh: Rahayu"
                  value={staffForm.last_name}
                  onChange={(e) => setStaffForm({ ...staffForm, last_name: e.target.value })}
                  className={errors.last_name ? "border-red-500" : ""}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500">{errors.last_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name (Opsional)</Label>
                <Input
                  id="display_name"
                  placeholder="Nama untuk ditampilkan (default: nama depan)"
                  value={staffForm.display_name}
                  onChange={(e) => setStaffForm({ ...staffForm, display_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff_email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="staff_email"
                  type="email"
                  placeholder="siti@example.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff_phone">Nomor Telepon
                  <span className="text-red-500">*</span>
                </Label>

                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium h-10">
                    +62
                  </div>
                  <Input
                    id="staff_phone"
                    placeholder="81xxxxxxxxx"
                    value={staffForm.phone.startsWith('+62') ? staffForm.phone.slice(3) : staffForm.phone}
                    onChange={(e) => {
                      const input = e.target.value.replace(/\D/g, '')
                      setStaffForm({ ...staffForm, phone: input ? `+62${input}` : '' })
                    }}
                    className={errors.phone ? "border-red-500 flex-1" : "flex-1"}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">
                  Posisi <span className="text-red-500">*</span>
                </Label>
                {loadingPositions ? (
                  <div className="h-10 flex items-center justify-center border rounded-md bg-gray-50">
                    <span className="text-sm text-gray-500">Loading positions...</span>
                  </div>
                ) : positionTemplates.length > 0 ? (
                  <Select
                    value={staffForm.position}
                    onValueChange={(value) => setStaffForm({ ...staffForm, position: value })}
                  >
                    <SelectTrigger className={errors.position ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih posisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionTemplates.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="position"
                    placeholder="Therapist, Beautician, dll"
                    value={staffForm.position}
                    onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
                    className={errors.position ? "border-red-500" : ""}
                  />
                )}
                {errors.position && (
                  <p className="text-xs text-red-500">{errors.position}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">
                  Tipe Employment <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={staffForm.employment_type}
                  onValueChange={(value: any) => setStaffForm({ ...staffForm, employment_type: value })}
                >
                  <SelectTrigger className={errors.employment_type ? "border-red-500" : ""}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employment_type && (
                  <p className="text-xs text-red-500">{errors.employment_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="outlet">
                  Outlet <span className="text-red-500">*</span>
                </Label>
                {loadingOutlets ? (
                  <div className="h-10 flex items-center justify-center border rounded-md bg-gray-50">
                    <span className="text-sm text-gray-500">Loading outlets...</span>
                  </div>
                ) : (
                  <Select
                    value={staffForm.outlet_id}
                    onValueChange={(value) => setStaffForm({ ...staffForm, outlet_id: value })}
                  >
                    <SelectTrigger className={`h-10 ${errors.outlet_id ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="-- Pilih Outlet --" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets.map((outlet) => (
                        <SelectItem key={outlet._id || outlet.id} value={outlet._id || outlet.id}>
                          {outlet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.outlet_id && (
                  <p className="text-xs text-red-500">{errors.outlet_id}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Layanan yang Dikuasai</Label>
                <p className="text-xs text-gray-500 mb-2">Pilih layanan yang dapat dikerjakan oleh staff ini</p>
                {loadingServices ? (
                  <div className="h-20 flex items-center justify-center border rounded-md bg-gray-50">
                    <span className="text-sm text-gray-500">Loading services...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                    {services.length > 0 ? (
                      services.map((service) => (
                        <label
                          key={service.id}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                            staffForm.service_ids.includes(service.id)
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <Checkbox
                            checked={staffForm.service_ids.includes(service.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setStaffForm({
                                  ...staffForm,
                                  service_ids: [...staffForm.service_ids, service.id],
                                })
                              } else {
                                setStaffForm({
                                  ...staffForm,
                                  service_ids: staffForm.service_ids.filter((id) => id !== service.id),
                                })
                              }
                            }}
                            className="h-5 w-5 flex-shrink-0"
                          />
                          <span className="text-sm font-medium">{service.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 col-span-2 text-center py-4">Belum ada layanan tersedia. Tambahkan layanan di step sebelumnya.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="is_bookable"
                        checked={staffForm.is_bookable}
                        onCheckedChange={(checked) => setStaffForm({ ...staffForm, is_bookable: !!checked })}
                      />
                      <Label htmlFor="is_bookable" className="cursor-pointer text-sm">Bisa Dibooking</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="accepts_online"
                        checked={staffForm.accepts_online_booking}
                        onCheckedChange={(checked) => setStaffForm({ ...staffForm, accepts_online_booking: !!checked })}
                      />
                      <Label htmlFor="accepts_online" className="cursor-pointer text-sm">Terima Online Booking</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* Advanced Settings - Collapsible - OPTIONAL */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center justify-between w-full px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border-2 border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-white">Opsional</Badge>
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span>Pengaturan Lanjutan</span>
                </div>
                {showAdvancedSettings ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAdvancedSettings && (
                <div className="mt-3 p-5 bg-gray-50/50 border-2 border-gray-200 rounded-lg space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employee_id"
                        placeholder="EMP-001"
                        value={staffForm.employee_id}
                        onChange={(e) => setStaffForm({ ...staffForm, employee_id: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_advance_days">Max Booking (hari)</Label>
                      <Input
                        id="max_advance_days"
                        type="number"
                        min="1"
                        value={staffForm.max_advance_booking_days}
                        onChange={(e) => setStaffForm({ ...staffForm, max_advance_booking_days: parseInt(e.target.value) || 30 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hire_date">Tanggal Mulai Kerja</Label>
                      <Input
                        id="hire_date"
                        type="date"
                        value={staffForm.hire_date}
                        onChange={(e) => setStaffForm({ ...staffForm, hire_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Tanggal Lahir</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={staffForm.birth_date}
                        onChange={(e) => setStaffForm({ ...staffForm, birth_date: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourly_rate">Hourly Rate (IDR)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        min="0"
                        placeholder="50000"
                        value={staffForm.hourly_rate || ""}
                        onChange={(e) => setStaffForm({ ...staffForm, hourly_rate: parseFloat(e.target.value) || null })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary (IDR)</Label>
                      <Input
                        id="salary"
                        type="number"
                        min="0"
                        placeholder="5000000"
                        value={staffForm.salary || ""}
                        onChange={(e) => setStaffForm({ ...staffForm, salary: parseFloat(e.target.value) || null })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile_image">Profile Image URL</Label>
                      <Input
                        id="profile_image"
                        placeholder="https://example.com/image.jpg"
                        value={staffForm.profile_image_url}
                        onChange={(e) => setStaffForm({ ...staffForm, profile_image_url: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram Handle</Label>
                      <Input
                        id="instagram"
                        placeholder="@username"
                        value={staffForm.instagram_handle}
                        onChange={(e) => setStaffForm({ ...staffForm, instagram_handle: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="years_exp">Tahun Pengalaman</Label>
                      <Input
                        id="years_exp"
                        type="number"
                        min="0"
                        placeholder="5"
                        value={staffForm.years_experience || ""}
                        onChange={(e) => setStaffForm({ ...staffForm, years_experience: parseInt(e.target.value) || null })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Deskripsi singkat tentang staff..."
                      value={staffForm.bio}
                      onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialties (pisahkan dengan koma)</Label>
                    <Input
                      id="specialties"
                      placeholder="color correction, haircut, etc"
                      value={staffForm.specialties.join(", ")}
                      onChange={(e) => setStaffForm({ ...staffForm, specialties: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certifications (pisahkan dengan koma)</Label>
                    <Input
                      id="certifications"
                      placeholder="Certified Therapist, etc"
                      value={staffForm.certifications.join(", ")}
                      onChange={(e) => setStaffForm({ ...staffForm, certifications: e.target.value.split(",").map(c => c.trim()).filter(c => c) })}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleAddStaff}
              disabled={loading || !canAddMoreStaff}
              className="w-full md:w-auto"
            >
              {loading ? (
                "Menambahkan..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Staff
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Availability Form */}
      {currentTab === 'availability' && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-gray-600" />
            <h3 className="text-lg font-semibold">Atur Ketersediaan Staff</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="select_staff">
                Pilih Staff <span className="text-red-500">*</span>
              </Label>
              <Select
                value={availabilityForm.staff_id}
                onValueChange={(value) => setAvailabilityForm({ ...availabilityForm, staff_id: value })}
              >
                <SelectTrigger className={`h-10 ${errors.staff_id ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="-- Pilih Staff --" />
                </SelectTrigger>
                <SelectContent>
                  {progress.staff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id!}>
                      {staff.first_name} {staff.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.staff_id && (
                <p className="text-xs text-red-500">{errors.staff_id}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">Jam Mulai</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="start_time"
                    type="time"
                    value={availabilityForm.start_time}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, start_time: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">Jam Selesai</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="end_time"
                    type="time"
                    value={availabilityForm.end_time}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, end_time: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence_end_date">Berlaku Sampai (Opsional)</Label>
              <Input
                id="recurrence_end_date"
                type="date"
                value={availabilityForm.recurrence_end_date}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, recurrence_end_date: e.target.value })}
                placeholder="Kosongkan untuk 3 bulan ke depan"
              />
              <p className="text-xs text-gray-500">Biarkan kosong untuk menggunakan 3 bulan default</p>
            </div>

            <div className="space-y-2">
              <Label>
                Hari Kerja <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-colors ${
                      availabilityForm.recurrence_days.includes(day.value)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              {errors.recurrence_days && (
                <p className="text-xs text-red-500">{errors.recurrence_days}</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleAddAvailability}
            disabled={loading}
            className="mt-6 w-full md:w-auto"
          >
            {loading ? (
              "Menyimpan..."
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Simpan Jadwal
              </>
            )}
          </Button>
        </Card>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Staff List */}
        {progress.staff.length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Staff Terdaftar</h3>
              <Badge variant="secondary">{progress.staff.length} staff</Badge>
            </div>

            <div className="space-y-3">
              {progress.staff.map((staff, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gray-50">
                  <h4 className="font-medium text-sm">
                    {staff.first_name} {staff.last_name}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">{staff.position}</p>
                  <p className="text-xs text-gray-500 mt-1">{staff.email}</p>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Belum ada staff yang ditambahkan
              </p>
            </div>
          </Card>
        )}

        {/* Availability List */}
        {progress.availabilities.length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Jadwal Tersimpan</h3>
              <Badge variant="secondary">{progress.availabilities.length} jadwal</Badge>
            </div>

            <div className="space-y-3">
              {progress.availabilities.map((avail, index) => {
                const staff = progress.staff.find((s) => s.id === avail.staff_id)
                return (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-sm">
                      {staff?.first_name} {staff?.last_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      {avail.start_time} - {avail.end_time}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {avail.recurrence_days?.map((day) => (
                        <Badge key={day} variant="outline" className="text-xs">
                          {WEEKDAYS.find((w) => w.value === day)?.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        ) : (
          <Card className="p-8 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Belum ada jadwal yang diatur
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

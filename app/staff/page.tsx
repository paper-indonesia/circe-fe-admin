"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useStaff, useBookings, useTreatments } from "@/lib/context"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { apiClient, ApiError } from "@/lib/api-client"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { Users, Plus, Calendar, Star, Clock, Phone, Mail, Edit, TrendingUp, X, Search, Filter, ChevronLeft, ChevronRight, UserPlus, Trash2, Crown, CheckCircle, AlertCircle, ArrowLeft, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { format, isToday, parseISO } from "date-fns"
import GradientLoading from "@/components/gradient-loading"
import { EmptyState } from "@/components/ui/empty-state"
import { useRouter } from "next/navigation"
import { AddButton } from "@/components/ui/add-button"

export default function StaffPage() {
  const { staff, loading, addStaff, updateStaff, deleteStaff } = useStaff()
  const { bookings } = useBookings()
  const { treatments } = useTreatments()
  const { toast } = useToast()
  const router = useRouter()
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const undoToastDismissRef = useRef<(() => void) | null>(null)
  const [outlets, setOutlets] = useState<any[]>([])
  const [positionTemplates, setPositionTemplates] = useState<string[]>([])
  const [loadingPositions, setLoadingPositions] = useState(false)
  const [statistics, setStatistics] = useState<any>(null)
  const [loadingStatistics, setLoadingStatistics] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [showStaffDialog, setShowStaffDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [showAddStaffDialog, setShowAddStaffDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<any>(null)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string; details?: string }>({
    title: "",
    message: "",
    details: undefined,
  })
  const [editStaffForm, setEditStaffForm] = useState({
    name: "",
    first_name: "",
    last_name: "",
    display_name: "",
    role: "",
    position: "",
    email: "",
    phone: "",
    photo: "",
    profile_image_url: "",
    employment_type: "full_time" as "full_time" | "part_time" | "contract" | "freelance" | "intern",
    employee_id: "",
    hire_date: "",
    birth_date: "",
    hourly_rate: null as number | null,
    salary: null as number | null,
    is_bookable: true,
    accepts_online_booking: true,
    max_advance_booking_days: 30,
    bio: "",
    instagram_handle: "",
    is_active: true,
    status: "active" as "active" | "inactive" | "terminated" | "on_leave",
    skills: [] as string[],
    specialties: [] as string[],
    certifications: [] as string[],
    service_ids: [] as string[],
    years_experience: 0,
    workingSchedule: {} as Record<string, string[]>,
    workingDays: [] as string[],
    notes: "",
    assignedTreatments: [] as string[],
  })
  const [newStaffForm, setNewStaffForm] = useState(() => ({
    first_name: "",
    last_name: "",
    display_name: "",
    email: "",
    phone: "",
    position: "",
    employment_type: "full_time" as "full_time" | "part_time" | "contract" | "freelance" | "intern",
    outlet_id: "",
    employee_id: "",
    hire_date: new Date().toISOString().split('T')[0],
    birth_date: "",
    hourly_rate: null as number | null,
    salary: null as number | null,
    is_bookable: true,
    accepts_online_booking: true,
    max_advance_booking_days: 30,
    bio: "",
    profile_image_url: "",
    instagram_handle: "",
    skills: {
      service_ids: [] as string[],
      specialties: [] as string[],
      certifications: [] as string[],
      years_experience: 0,
    },
  }))
  const [skillInput, setSkillInput] = useState("")
  const [editSkillInput, setEditSkillInput] = useState("")
  const [newTimeRange, setNewTimeRange] = useState({ start: "09:00", end: "17:00" })

  // Availability Management State
  const [availabilityEntries, setAvailabilityEntries] = useState<any[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [availabilityTab, setAvailabilityTab] = useState<'working_hours' | 'break' | 'blocked' | 'vacation'>('working_hours')
  const [showAddAvailability, setShowAddAvailability] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<any>(null)
  const [availabilityForm, setAvailabilityForm] = useState(() => ({
    date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "17:00",
    availability_type: "working_hours" as "working_hours" | "break" | "blocked" | "vacation",
    recurrence_type: "none" as "none" | "daily" | "weekly" | "monthly",
    recurrence_end_date: "",
    recurrence_days: [] as number[],
    is_available: true,
    notes: "",
    service_ids: [] as string[],
  }))
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date()
    return {
      start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
      end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
    }
  })

  // Fetch outlets and position templates on mount
  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const data = await apiClient.getOutlets()
        // Handle both array and paginated response
        if (Array.isArray(data)) {
          setOutlets(data)
        } else if (data.items && Array.isArray(data.items)) {
          setOutlets(data.items)
        }
      } catch (error) {
        console.error('Failed to fetch outlets:', error)
      }
    }

    const fetchPositionTemplates = async () => {
      setLoadingPositions(true)
      try {
        const response = await fetch('/api/staff/positions/templates')
        if (response.ok) {
          const data = await response.json()
          // API returns array of position strings
          if (Array.isArray(data)) {
            setPositionTemplates(data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch position templates:', error)
      } finally {
        setLoadingPositions(false)
      }
    }

    const fetchStatistics = async () => {
      setLoadingStatistics(true)
      try {
        const response = await fetch('/api/staff/statistics')
        if (response.ok) {
          const data = await response.json()
          setStatistics(data)
        }
      } catch (error) {
        console.error('Failed to fetch staff statistics:', error)
      } finally {
        setLoadingStatistics(false)
      }
    }

    fetchOutlets()
    fetchPositionTemplates()
    fetchStatistics()
  }, [])

  // Auto-select outlet if only 1 available
  useEffect(() => {
    if (outlets.length === 1 && !newStaffForm.outlet_id) {
      setNewStaffForm(prev => ({
        ...prev,
        outlet_id: outlets[0]._id || outlets[0].id
      }))
    }
  }, [outlets, newStaffForm.outlet_id])

  // Auto-select service if only 1 available
  useEffect(() => {
    if (treatments.length === 1 && newStaffForm.skills.service_ids.length === 0) {
      setNewStaffForm(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          service_ids: [treatments[0].id]
        }
      }))
    }
  }, [treatments, newStaffForm.skills.service_ids.length])

  const filteredStaff = staff.filter((staffMember) => {
    // Handle both object and array formats for skills
    let skillsArray: string[] = []
    if (Array.isArray(staffMember.skills)) {
      skillsArray = staffMember.skills
    } else if (staffMember.skills && typeof staffMember.skills === 'object') {
      skillsArray = staffMember.skills.specialties || []
    }

    const matchesSearch =
      staffMember.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skillsArray.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesRole = roleFilter === "all" || staffMember.role === roleFilter
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && staffMember.isAvailable) ||
      (availabilityFilter === "unavailable" && !staffMember.isAvailable)

    return matchesSearch && matchesRole && matchesAvailability
  })

  const uniqueRoles = Array.from(new Set(staff.map((s) => s.role)))

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / pageSize)
  const paginatedStaff = filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getStaffPerformance = (staffId: string) => {
    const staffBookings = bookings.filter((b) => b.staffId === staffId)
    const todayBookings = staffBookings.filter((b) => isToday(parseISO(b.startAt)))
    const completedBookings = staffBookings.filter((b) => b.status === "completed")
    const totalRevenue = completedBookings.reduce((sum, booking) => {
      return sum + 500000 // Placeholder
    }, 0)

    return {
      totalBookings: staffBookings.length,
      todayBookings: todayBookings.length,
      completedBookings: completedBookings.length,
      completionRate: staffBookings.length > 0 ? (completedBookings.length / staffBookings.length) * 100 : 0,
      totalRevenue,
    }
  }

  const getTodaySchedule = (staffId: string) => {
    return bookings
      .filter((b) => b.staffId === staffId && isToday(parseISO(b.startAt)))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }

  const handleViewSchedule = async (staffMember: any) => {
    setSelectedStaff(staffMember)
    setShowScheduleDialog(true)

    // Auto-assign all staff's services to availability form
    // Handle both nested (skills.service_ids) and flat (service_ids) structure
    const staffServiceIds = staffMember.skills?.service_ids || staffMember.service_ids || []
    setAvailabilityForm(prev => ({
      ...prev,
      service_ids: staffServiceIds // Auto-select all assigned services
    }))

    // Fetch availability entries for this staff
    await fetchAvailabilityEntries(staffMember.id)
  }

  // Fetch availability entries for selected staff
  const fetchAvailabilityEntries = async (staffId: string) => {
    setAvailabilityLoading(true)
    try {
      const response = await apiClient.getAvailability({
        staff_id: staffId,
        start_date: dateRange.start,
        end_date: dateRange.end,
        availability_type: availabilityTab,
      })

      // Handle both paginated and array response
      const entries = Array.isArray(response) ? response : response.items || []
      setAvailabilityEntries(entries)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat ketersediaan",
        variant: "destructive",
      })
    } finally {
      setAvailabilityLoading(false)
    }
  }

  // Create new availability entry
  const handleCreateAvailability = async () => {
    if (!selectedStaff) return

    // Validation
    if (!availabilityForm.date || !availabilityForm.start_time || !availabilityForm.end_time) {
      toast({
        title: "Error",
        description: "Tanggal dan waktu wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Check recurrence validation
    if (availabilityForm.recurrence_type !== 'none' && !availabilityForm.recurrence_end_date) {
      toast({
        title: "Error",
        description: "Tanggal akhir pengulangan wajib diisi untuk pola berulang",
        variant: "destructive",
      })
      return
    }

    setSavingAvailability(true)
    try {
      // Get tenant_id from selectedStaff or fetch from API
      let tenantId = selectedStaff.tenant_id

      if (!tenantId) {
        // Fallback: fetch tenant info from API
        const tenantResponse = await fetch('/api/tenant/me')
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json()
          tenantId = tenantData.tenant_id
        }
      }

      if (!tenantId) {
        throw new Error("Tenant ID tidak ditemukan. Silakan login kembali.")
      }

      const payload: any = {
        tenant_id: tenantId,
        staff_id: selectedStaff.id,
        date: availabilityForm.date,
        start_time: availabilityForm.start_time,
        end_time: availabilityForm.end_time,
        availability_type: availabilityTab,
        recurrence_type: availabilityForm.recurrence_type,
        is_available: availabilityTab === 'working_hours',
        notes: availabilityForm.notes || undefined,
      }

      // Add outlet_id if available
      if (selectedStaff.outlet_id || selectedStaff.outletId) {
        payload.outlet_id = selectedStaff.outlet_id || selectedStaff.outletId
      }

      // Add recurrence data if applicable
      if (availabilityForm.recurrence_type !== 'none') {
        payload.recurrence_end_date = availabilityForm.recurrence_end_date
        if (availabilityForm.recurrence_type === 'weekly' && availabilityForm.recurrence_days.length > 0) {
          payload.recurrence_days = availabilityForm.recurrence_days
        }
      }

      // Add service_ids if specified (null = all services)
      if (availabilityForm.service_ids.length > 0) {
        payload.service_ids = availabilityForm.service_ids
      }

      await apiClient.createAvailability(payload)

      toast({
        title: "Berhasil",
        description: availabilityForm.recurrence_type !== 'none'
          ? "Ketersediaan berulang berhasil dibuat"
          : "Ketersediaan berhasil ditambahkan",
      })

      // Reset form and refresh
      setShowAddAvailability(false)
      setAvailabilityForm({
        date: new Date().toISOString().split('T')[0],
        start_time: availabilityTab === 'break' ? "12:00" : "09:00",
        end_time: availabilityTab === 'break' ? "13:00" : "17:00",
        availability_type: availabilityTab,
        recurrence_type: "none",
        recurrence_end_date: "",
        recurrence_days: [],
        is_available: availabilityTab === 'working_hours',
        notes: "",
        service_ids: [],
      })
      await fetchAvailabilityEntries(selectedStaff.id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan ketersediaan",
        variant: "destructive",
      })
    } finally {
      setSavingAvailability(false)
    }
  }

  // Update availability entry
  const handleUpdateAvailability = async () => {
    if (!editingAvailability) return

    setSavingAvailability(true)
    try {
      const updates: any = {
        start_time: availabilityForm.start_time,
        end_time: availabilityForm.end_time,
        notes: availabilityForm.notes,
      }

      if (availabilityForm.service_ids.length > 0) {
        updates.service_ids = availabilityForm.service_ids
      }

      await apiClient.updateAvailability(editingAvailability.id, updates)

      toast({
        title: "Berhasil",
        description: "Ketersediaan berhasil diperbarui",
      })

      setEditingAvailability(null)
      setShowAddAvailability(false)
      if (selectedStaff) {
        await fetchAvailabilityEntries(selectedStaff.id)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui ketersediaan",
        variant: "destructive",
      })
    } finally {
      setSavingAvailability(false)
    }
  }

  // Delete availability entry
  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Hapus ketersediaan ini?")) return

    try {
      await apiClient.deleteAvailability(id)
      toast({
        title: "Berhasil",
        description: "Ketersediaan berhasil dihapus",
      })
      if (selectedStaff) {
        await fetchAvailabilityEntries(selectedStaff.id)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus ketersediaan",
        variant: "destructive",
      })
    }
  }

  // Toggle recurrence day
  const handleRecurrenceDayToggle = (day: number) => {
    setAvailabilityForm(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day].sort()
    }))
  }

  // Open edit availability
  const handleEditAvailability = (entry: any) => {
    setEditingAvailability(entry)
    setAvailabilityForm({
      date: entry.date,
      start_time: entry.start_time.substring(0, 5), // HH:MM format
      end_time: entry.end_time.substring(0, 5),
      availability_type: entry.availability_type,
      recurrence_type: entry.recurrence_type || 'none',
      recurrence_end_date: entry.recurrence_end_date || "",
      recurrence_days: entry.recurrence_days || [],
      is_available: entry.is_available,
      notes: entry.notes || "",
      service_ids: entry.service_ids || [],
    })
    setShowAddAvailability(true)
  }

  // Watch for dialog open, tab changes, and date range changes to refresh data
  useEffect(() => {
    if (selectedStaff && showScheduleDialog) {
      fetchAvailabilityEntries(selectedStaff.id)
    }
  }, [selectedStaff, showScheduleDialog, availabilityTab, dateRange])

  const handleViewProfile = (staffMember: any) => {
    // Convert skills to array format for form
    let skillsArray: string[] = []
    let specialtiesArray: string[] = []
    let certificationsArray: string[] = []
    let serviceIdsArray: string[] = []
    let yearsExp = 0

    if (Array.isArray(staffMember.skills)) {
      skillsArray = staffMember.skills
      specialtiesArray = staffMember.skills
    } else if (staffMember.skills && typeof staffMember.skills === 'object') {
      specialtiesArray = staffMember.skills.specialties || []
      skillsArray = specialtiesArray
      certificationsArray = staffMember.skills.certifications || []
      serviceIdsArray = staffMember.skills.service_ids || []
      yearsExp = staffMember.skills.years_experience || 0
    }

    // Get assigned treatments from assignedStaff (backward compatibility)
    const assignedTreatmentIds = treatments
      .filter((treatment) => treatment.assignedStaff?.includes(staffMember.id))
      .map((treatment) => treatment.id)

    // IMPORTANT: For form, use service_ids from API as source of truth
    // This ensures Products checkboxes are checked based on actual API data
    const finalServiceIds = serviceIdsArray.length > 0 ? serviceIdsArray : assignedTreatmentIds
    const finalAssignedTreatments = serviceIdsArray.length > 0 ? serviceIdsArray : assignedTreatmentIds

    setSelectedStaff(staffMember)
    setEditStaffForm({
      name: staffMember.name || `${staffMember.first_name || ''} ${staffMember.last_name || ''}`.trim(),
      first_name: staffMember.first_name || staffMember.name?.split(' ')[0] || "",
      last_name: staffMember.last_name || staffMember.name?.split(' ').slice(1).join(' ') || "",
      display_name: staffMember.display_name || staffMember.name || "",
      role: staffMember.role || staffMember.position || "",
      position: staffMember.position || staffMember.role || "",
      email: staffMember.email || `${staffMember.name.toLowerCase().replace(" ", ".")}@beautyclinic.com`,
      phone: staffMember.phone || `+62 812 345 ${staffMember.id.slice(-4)}`,
      photo: staffMember.photo || staffMember.profile_image_url || "",
      profile_image_url: staffMember.profile_image_url || staffMember.photo || "",
      employment_type: staffMember.employment_type || staffMember.employmentType || "full_time",
      employee_id: staffMember.employee_id || staffMember.employeeId || "",
      hire_date: staffMember.hire_date || staffMember.hireDate || "",
      birth_date: staffMember.birth_date || staffMember.birthDate || "",
      hourly_rate: staffMember.hourly_rate || staffMember.hourlyRate || null,
      salary: staffMember.salary || null,
      is_bookable: staffMember.is_bookable !== undefined ? staffMember.is_bookable : staffMember.isBookable !== undefined ? staffMember.isBookable : true,
      accepts_online_booking: staffMember.accepts_online_booking !== undefined ? staffMember.accepts_online_booking : staffMember.acceptsOnlineBooking !== undefined ? staffMember.acceptsOnlineBooking : true,
      max_advance_booking_days: staffMember.max_advance_booking_days || staffMember.maxAdvanceBookingDays || 30,
      bio: staffMember.bio || "",
      instagram_handle: staffMember.instagram_handle || staffMember.instagramHandle || "",
      is_active: staffMember.is_active !== undefined ? staffMember.is_active : staffMember.isActive !== undefined ? staffMember.isActive : true,
      status: staffMember.status || "active",
      skills: skillsArray,
      specialties: specialtiesArray,
      certifications: certificationsArray,
      service_ids: finalServiceIds,
      years_experience: yearsExp,
      workingSchedule: staffMember.workingSchedule || {},
      workingDays: staffMember.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      notes: staffMember.notes || "",
      assignedTreatments: finalAssignedTreatments, // Use service_ids for form checkboxes
    })
    setIsEditMode(false)
    setShowStaffDialog(true)
  }

  const handleUpdateStaff = async () => {
    if (!editStaffForm.first_name?.trim() && !editStaffForm.name?.trim()) {
      toast({
        title: "Error",
        description: "Nama wajib diisi",
        variant: "destructive",
      })
      return
    }

    if (!editStaffForm.email?.trim()) {
      toast({
        title: "Error",
        description: "Email wajib diisi",
        variant: "destructive",
      })
      return
    }

    if (!editStaffForm.position?.trim() && !editStaffForm.role?.trim()) {
      toast({
        title: "Error",
        description: "Posisi wajib diisi",
        variant: "destructive",
      })
      return
    }

    try {
      // Build the update payload matching API structure
      const updatePayload: any = {
        first_name: editStaffForm.first_name || editStaffForm.name?.split(' ')[0] || "",
        last_name: editStaffForm.last_name || editStaffForm.name?.split(' ').slice(1).join(' ') || "",
        email: editStaffForm.email,
        phone: editStaffForm.phone,
        position: editStaffForm.position || editStaffForm.role,
        employment_type: editStaffForm.employment_type,
        is_bookable: editStaffForm.is_bookable,
        accepts_online_booking: editStaffForm.accepts_online_booking,
        max_advance_booking_days: editStaffForm.max_advance_booking_days,
        is_active: editStaffForm.is_active,
        status: editStaffForm.status,
      }

      // Add optional fields if provided
      if (editStaffForm.display_name) {
        updatePayload.display_name = editStaffForm.display_name
      }
      if (editStaffForm.employee_id) {
        updatePayload.employee_id = editStaffForm.employee_id
      }
      if (editStaffForm.hire_date) {
        updatePayload.hire_date = editStaffForm.hire_date
      }
      if (editStaffForm.birth_date) {
        updatePayload.birth_date = editStaffForm.birth_date
      }
      if (editStaffForm.hourly_rate !== null) {
        updatePayload.hourly_rate = editStaffForm.hourly_rate
      }
      if (editStaffForm.salary !== null) {
        updatePayload.salary = editStaffForm.salary
      }
      if (editStaffForm.bio) {
        updatePayload.bio = editStaffForm.bio
      }
      if (editStaffForm.profile_image_url || editStaffForm.photo) {
        updatePayload.profile_image_url = editStaffForm.profile_image_url || editStaffForm.photo
      }
      if (editStaffForm.instagram_handle) {
        updatePayload.instagram_handle = editStaffForm.instagram_handle
      }

      // Build skills object - always send if there's any skill data
      // Use service_ids (which is synced with assignedTreatments) for products
      const hasSkillsData =
        editStaffForm.specialties.length > 0 ||
        editStaffForm.skills.length > 0 ||
        editStaffForm.certifications.length > 0 ||
        editStaffForm.service_ids.length > 0 ||
        editStaffForm.assignedTreatments.length > 0 ||
        editStaffForm.years_experience > 0

      if (hasSkillsData) {
        updatePayload.skills = {
          service_ids: editStaffForm.service_ids.length > 0 ? editStaffForm.service_ids : editStaffForm.assignedTreatments || [],
          specialties: editStaffForm.specialties.length > 0 ? editStaffForm.specialties : editStaffForm.skills,
          certifications: editStaffForm.certifications || [],
          years_experience: editStaffForm.years_experience || 0,
        }
      }

      await updateStaff(selectedStaff.id, updatePayload)

      const updatedTreatments = treatments.map((treatment) => {
        const shouldBeAssigned = editStaffForm.assignedTreatments.includes(treatment.id)
        const currentlyAssigned = treatment.assignedStaff?.includes(selectedStaff.id) || false

        if (shouldBeAssigned && !currentlyAssigned) {
          // Add staff to treatment
          return {
            ...treatment,
            assignedStaff: [...(treatment.assignedStaff || []), selectedStaff.id],
          }
        } else if (!shouldBeAssigned && currentlyAssigned) {
          // Remove staff from treatment
          return {
            ...treatment,
            assignedStaff: (treatment.assignedStaff || []).filter((id) => id !== selectedStaff.id),
          }
        }
        return treatment
      })

      // Update treatments in context (you may need to add updateTreatment function)
      // For now, we'll just update the staff and the treatments will be handled separately

      setIsEditMode(false)
      setShowStaffDialog(false)

      toast({
        title: "Berhasil",
        description: "Data staff berhasil diupdate",
      })
    } catch (error: any) {
      console.error("Error updating staff:", error)

      // Check if it's an ApiError with detailed information
      if (error instanceof ApiError) {
        // Use user-friendly message if available
        const displayMessage = error.userFriendlyMessage || error.message || "Gagal mengupdate staff"

        setErrorInfo({
          title: "Gagal Mengupdate Staff",
          message: displayMessage,
          details: undefined, // Don't show technical details to end users
        })
        setShowErrorDialog(true)
        setIsEditMode(false)
        setShowStaffDialog(false)
      } else {
        // Fallback for other types of errors
        const errorMessage = error.message || "Gagal mengupdate staff"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleDeleteClick = (staffMember: any) => {
    setStaffToDelete(staffMember)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return

    const deletedStaff = { ...staffToDelete }

    try {
      await deleteStaff(staffToDelete.id)

      // Clear existing undo timer if any
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
      }

      // Show undo toast
      const { dismiss } = toast({
        title: "Staff deleted (soft)",
        description: "Undo within 10 seconds.",
        duration: 10000,
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUndoDeleteStaff(deletedStaff.id)}
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

      setShowDeleteDialog(false)
      setStaffToDelete(null)
    } catch (error: any) {
      console.error("Error deleting staff:", error)

      // Check if it's an ApiError with detailed information
      if (error instanceof ApiError) {
        // Use user-friendly message if available
        let displayMessage = error.userFriendlyMessage || error.message || "Gagal menghapus staff"

        // Add specific handling for appointment-related errors
        if (displayMessage.toLowerCase().includes("appointment") || displayMessage.toLowerCase().includes("booking")) {
          displayMessage = "Tidak dapat menghapus staff yang memiliki janji temu (appointment) yang akan datang. Silakan batalkan atau selesaikan appointment tersebut terlebih dahulu."
        }

        setErrorInfo({
          title: "Gagal Menghapus Staff",
          message: displayMessage,
          details: undefined, // Don't show technical details to end users
        })
        setShowErrorDialog(true)
        setShowDeleteDialog(false)
      } else {
        // Fallback for other types of errors
        let errorMessage = "Gagal menghapus staff"
        if (error.message?.includes("appointment") || error.message?.includes("booking")) {
          errorMessage = "Tidak dapat menghapus staff yang memiliki janji temu (appointment) yang akan datang"
        } else if (error.message) {
          errorMessage = error.message
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleUndoDeleteStaff = async (staffId: string) => {
    try {
      // Call restore API endpoint
      const response = await fetch(`/api/staff/${staffId}/restore`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore staff')
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
        title: "Staff restored",
        description: "Staff has been successfully restored.",
      })

      // Refresh staff list - the context should handle this
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore staff",
        variant: "destructive"
      })
    }
  }

  const handleAddTimeRange = (isEdit = false) => {
    const timeRange = `${newTimeRange.start}-${newTimeRange.end}`
    if (isEdit) {
      if (!editStaffForm.workingHours.includes(timeRange)) {
        setEditStaffForm((prev) => ({
          ...prev,
          workingHours: [...prev.workingHours, timeRange],
        }))
      }
    } else {
      if (!newStaffForm.workingHours.includes(timeRange)) {
        setNewStaffForm((prev) => ({
          ...prev,
          workingHours: [...prev.workingHours, timeRange],
        }))
      }
    }
    setNewTimeRange({ start: "09:00", end: "17:00" })
  }

  const handleRemoveTimeRange = (timeRange: string, isEdit = false) => {
    if (isEdit) {
      setEditStaffForm((prev) => ({
        ...prev,
        workingHours: prev.workingHours.filter((range) => range !== timeRange),
      }))
    } else {
      setNewStaffForm((prev) => ({
        ...prev,
        workingHours: prev.workingHours.filter((range) => range !== timeRange),
      }))
    }
  }

  const handleAddStaff = async () => {
    // Validation
    if (!newStaffForm.first_name || !newStaffForm.first_name.trim()) {
      toast({
        title: "Error",
        description: "Nama depan wajib diisi",
        variant: "destructive",
      })
      return
    }

    if (!newStaffForm.last_name || !newStaffForm.last_name.trim()) {
      toast({
        title: "Error",
        description: "Nama belakang wajib diisi",
        variant: "destructive",
      })
      return
    }

    if (!newStaffForm.email || !newStaffForm.email.trim()) {
      toast({
        title: "Error",
        description: "Email wajib diisi",
        variant: "destructive",
      })
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newStaffForm.email)) {
      toast({
        title: "Error",
        description: "Format email tidak valid",
        variant: "destructive",
      })
      return
    }

    if (!newStaffForm.phone || newStaffForm.phone.trim().length < 10) {
      toast({
        title: "Error",
        description: "Nomor telepon wajib diisi dengan minimal 10 karakter (contoh: +6281xxxxxxxxx atau 081xxxxxxxxx)",
        variant: "destructive",
      })
      return
    }

    if (!newStaffForm.position) {
      toast({
        title: "Error",
        description: "Posisi wajib dipilih",
        variant: "destructive",
      })
      return
    }

    if (!newStaffForm.outlet_id) {
      toast({
        title: "Error",
        description: "Outlet wajib dipilih",
        variant: "destructive",
      })
      return
    }

    if (!newStaffForm.skills.service_ids || newStaffForm.skills.service_ids.length === 0) {
      toast({
        title: "Error",
        description: "Minimal 1 layanan/produk harus dipilih",
        variant: "destructive",
      })
      return
    }

    try {
      // Map form data to API structure
      const staffPayload = {
        first_name: newStaffForm.first_name.trim(),
        last_name: newStaffForm.last_name.trim(),
        display_name: newStaffForm.display_name?.trim() || `${newStaffForm.first_name.trim()} ${newStaffForm.last_name.trim()}`,
        email: newStaffForm.email.trim(),
        phone: newStaffForm.phone.trim(),
        position: newStaffForm.position,
        employment_type: newStaffForm.employment_type,
        outlet_id: newStaffForm.outlet_id,
        employee_id: newStaffForm.employee_id || null,
        hire_date: newStaffForm.hire_date,
        birth_date: newStaffForm.birth_date || null,
        hourly_rate: newStaffForm.hourly_rate,
        salary: newStaffForm.salary,
        is_bookable: newStaffForm.is_bookable,
        accepts_online_booking: newStaffForm.accepts_online_booking,
        max_advance_booking_days: newStaffForm.max_advance_booking_days,
        bio: newStaffForm.bio || null,
        profile_image_url: newStaffForm.profile_image_url || null,
        instagram_handle: newStaffForm.instagram_handle || null,
        skills: newStaffForm.skills,
      }

      await addStaff(staffPayload)

      // Reset form
      setNewStaffForm({
        first_name: "",
        last_name: "",
        display_name: "",
        email: "",
        phone: "",
        position: "",
        employment_type: "full_time",
        outlet_id: "",
        employee_id: "",
        hire_date: new Date().toISOString().split('T')[0],
        birth_date: "",
        hourly_rate: null,
        salary: null,
        is_bookable: true,
        accepts_online_booking: true,
        max_advance_booking_days: 30,
        bio: "",
        profile_image_url: "",
        instagram_handle: "",
        skills: {
          service_ids: [],
          specialties: [],
          certifications: [],
          years_experience: 0,
        },
      })
      setShowAddStaffDialog(false)

      toast({
        title: "Berhasil",
        description: "Staff member berhasil ditambahkan",
      })
    } catch (error: any) {
      console.error('Error adding staff:', error)

      // Check if it's an ApiError with detailed information
      if (error instanceof ApiError) {
        // Use user-friendly message if available
        const displayMessage = error.userFriendlyMessage || error.message || "Gagal menambahkan staff member"

        setErrorInfo({
          title: "Gagal Menambahkan Staff",
          message: displayMessage,
          details: undefined, // Don't show technical details to end users
        })
        setShowErrorDialog(true)
        setShowAddStaffDialog(false)
      } else {
        // Fallback for other types of errors
        const errorMessage = error.message || "Gagal menambahkan staff member"
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !newStaffForm.skills.specialties.includes(skillInput.trim())) {
      setNewStaffForm((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          specialties: [...prev.skills.specialties, skillInput.trim()],
        },
      }))
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setNewStaffForm((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        specialties: prev.skills.specialties.filter((skill) => skill !== skillToRemove),
      },
    }))
  }

  const handleEditAddSkill = () => {
    if (editSkillInput.trim() && !editStaffForm.skills.includes(editSkillInput.trim())) {
      const newSkill = editSkillInput.trim()
      setEditStaffForm((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill],
        specialties: [...prev.specialties, newSkill], // Sync to specialties
      }))
      setEditSkillInput("")
    }
  }

  const handleEditRemoveSkill = (skillToRemove: string) => {
    setEditStaffForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
      specialties: prev.specialties.filter((skill) => skill !== skillToRemove), // Sync to specialties
    }))
  }

  const openStaffProfile = (staffMember: any) => {
    // Convert skills to array format for form
    let skillsArray: string[] = []
    let specialtiesArray: string[] = []
    let certificationsArray: string[] = []
    let serviceIdsArray: string[] = []
    let yearsExp = 0

    if (Array.isArray(staffMember.skills)) {
      skillsArray = staffMember.skills
      specialtiesArray = staffMember.skills
    } else if (staffMember.skills && typeof staffMember.skills === 'object') {
      specialtiesArray = staffMember.skills.specialties || []
      skillsArray = specialtiesArray
      certificationsArray = staffMember.skills.certifications || []
      serviceIdsArray = staffMember.skills.service_ids || []
      yearsExp = staffMember.skills.years_experience || 0
    }

    // Get assigned treatments from assignedStaff (backward compatibility)
    const assignedTreatmentIds = treatments
      .filter((treatment) => treatment.assignedStaff?.includes(staffMember.id))
      .map((treatment) => treatment.id)

    // IMPORTANT: For form, use service_ids from API as source of truth
    const finalServiceIds = serviceIdsArray.length > 0 ? serviceIdsArray : assignedTreatmentIds
    const finalAssignedTreatments = serviceIdsArray.length > 0 ? serviceIdsArray : assignedTreatmentIds

    setSelectedStaff(staffMember)
    setEditStaffForm({
      name: staffMember.name || `${staffMember.first_name || ''} ${staffMember.last_name || ''}`.trim(),
      first_name: staffMember.first_name || staffMember.name?.split(' ')[0] || "",
      last_name: staffMember.last_name || staffMember.name?.split(' ').slice(1).join(' ') || "",
      display_name: staffMember.display_name || staffMember.name || "",
      role: staffMember.role || staffMember.position || "",
      position: staffMember.position || staffMember.role || "",
      email: staffMember.email || "",
      phone: staffMember.phone || "",
      photo: staffMember.photo || staffMember.profile_image_url || "",
      profile_image_url: staffMember.profile_image_url || staffMember.photo || "",
      employment_type: staffMember.employment_type || staffMember.employmentType || "full_time",
      employee_id: staffMember.employee_id || staffMember.employeeId || "",
      hire_date: staffMember.hire_date || staffMember.hireDate || "",
      birth_date: staffMember.birth_date || staffMember.birthDate || "",
      hourly_rate: staffMember.hourly_rate || staffMember.hourlyRate || null,
      salary: staffMember.salary || null,
      is_bookable: staffMember.is_bookable !== undefined ? staffMember.is_bookable : staffMember.isBookable !== undefined ? staffMember.isBookable : true,
      accepts_online_booking: staffMember.accepts_online_booking !== undefined ? staffMember.accepts_online_booking : staffMember.acceptsOnlineBooking !== undefined ? staffMember.acceptsOnlineBooking : true,
      max_advance_booking_days: staffMember.max_advance_booking_days || staffMember.maxAdvanceBookingDays || 30,
      bio: staffMember.bio || "",
      instagram_handle: staffMember.instagram_handle || staffMember.instagramHandle || "",
      is_active: staffMember.is_active !== undefined ? staffMember.is_active : staffMember.isActive !== undefined ? staffMember.isActive : true,
      status: staffMember.status || "active",
      skills: skillsArray,
      specialties: specialtiesArray,
      certifications: certificationsArray,
      service_ids: finalServiceIds,
      years_experience: yearsExp,
      workingDays: staffMember.workingDays || [],
      workingSchedule: staffMember.workingSchedule || {},
      notes: staffMember.notes || "",
      assignedTreatments: finalAssignedTreatments, // Use service_ids for form checkboxes
    })
    setIsEditMode(false)
    setShowStaffDialog(true)
  }

  if (loading) {
    return (
      <>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <GradientLoading text="Loading Staff" />
        </div>
      </>
    )
  }

  // Check if data is completely empty
  const hasNoData = !loading && (!staff || staff.length === 0)

  return (
    <>
      {hasNoData ? (
        <EmptyState
          icon={Users}
          title={`No Staff Members`}
          description={`Add your staff members to assign bookings and manage schedules.`}
          actionLabel={`Add Staff`}
          onAction={() => setShowAddStaffDialog(true)}
          tips={[
            {
              icon: UserPlus,
              title: `Add Staff`,
              description: "Create staff profiles"
            },
            {
              icon: Calendar,
              title: "Assign Bookings",
              description: `Assign bookings to staff`
            },
            {
              icon: Star,
              title: "Track Performance",
              description: "Monitor staff metrics"
            }
          ]}
        />
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground">Manage your team, schedules, and performance</p>
          </div>
          <AddButton onClick={() => setShowAddStaffDialog(true)}>
            Add Staff Member
          </AddButton>
        </div>

        <Card className="border-[#EDE9FE]/30">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff by name, role, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#EDE9FE] focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 border-[#EDE9FE]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger className="w-40 border-[#EDE9FE]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg border border-[#EDE9FE]/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#FCD6F5]/20 to-[#EDE9FE]/20">
                <TableHead className="w-16">Photo</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead className="text-center">Today</TableHead>
                <TableHead className="text-center">Success Rate</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedStaff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No staff members found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStaff.map((staffMember) => {
                const performance = getStaffPerformance(staffMember.id)

                return (
                  <TableRow key={staffMember.id} className="hover:bg-[#FCD6F5]/10 transition-colors">
                    <TableCell>
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EDE9FE]">
                        <img
                          src={`/abstract-geometric-shapes.png?height=40&width=40&query=${staffMember.name} professional beauty therapist headshot portrait`}
                          alt={staffMember.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{staffMember.name}</div>
                        <div className="text-sm text-muted-foreground">{staffMember.role}</div>
                        {staffMember.rating && staffMember.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{staffMember.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No rating yet</div>
                        )}
                      </div>
                    </TableCell>
                    {/* Products Column */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(() => {
                          // Get assigned products (only active products)
                          const assignedProducts = treatments.filter((treatment) =>
                            treatment.status === "active" && treatment.assignedStaff?.includes(staffMember.id)
                          )

                          // Get service_ids from skills
                          let serviceIds: string[] = []
                          if (staffMember.skills && typeof staffMember.skills === 'object' && !Array.isArray(staffMember.skills)) {
                            serviceIds = staffMember.skills.service_ids || []
                          }

                          // Get products by service_ids if available, otherwise use assignedStaff (only active products)
                          const productsToShow = serviceIds.length > 0
                            ? treatments.filter(t => t.status === "active" && serviceIds.includes(t.id))
                            : assignedProducts

                          if (productsToShow.length === 0) {
                            return <span className="text-xs text-muted-foreground italic">-</span>
                          }

                          const maxDisplay = 2
                          const remaining = productsToShow.length - maxDisplay

                          return (
                            <>
                              {productsToShow.slice(0, maxDisplay).map((product) => (
                                <Badge
                                  key={product.id}
                                  variant="outline"
                                  className="text-xs border-[#8B5CF6] text-[#8B5CF6] bg-[#FCD6F5]/30"
                                >
                                  {product.name}
                                </Badge>
                              ))}
                              {remaining > 0 && (
                                <Badge variant="outline" className="text-xs border-[#EDE9FE] text-[#8B5CF6]">
                                  +{remaining} more
                                </Badge>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </TableCell>

                    {/* Specialties Column */}
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(() => {
                          // Get specialties
                          let specialtiesArray: string[] = []
                          if (Array.isArray(staffMember.skills)) {
                            specialtiesArray = staffMember.skills
                          } else if (staffMember.skills && typeof staffMember.skills === 'object') {
                            specialtiesArray = staffMember.skills.specialties || []
                          }

                          if (specialtiesArray.length === 0) {
                            return <span className="text-xs text-muted-foreground italic">-</span>
                          }

                          const maxDisplay = 2
                          const remaining = specialtiesArray.length - maxDisplay

                          return (
                            <>
                              {specialtiesArray.slice(0, maxDisplay).map((specialty, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs bg-[#FCD6F5]/50 text-[#6D28D9]"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                              {remaining > 0 && (
                                <Badge variant="secondary" className="text-xs bg-[#EDE9FE]/50 text-[#6D28D9]">
                                  +{remaining} more
                                </Badge>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] rounded-full">
                        <span className="text-sm font-semibold text-[#6D28D9]">{performance.todayBookings}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-8 bg-gradient-to-br from-[#EDE9FE] to-[#8B5CF6] rounded-full">
                        <span className="text-sm font-semibold text-[#6D28D9]">
                          {Math.round(performance.completionRate)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#FCD6F5]/30"
                          onClick={() => handleViewSchedule(staffMember)}
                        >
                          <Calendar className="h-4 w-4 text-[#8B5CF6]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-[#FCD6F5]/30"
                          onClick={() => openStaffProfile(staffMember)}
                        >
                          <Edit className="h-4 w-4 text-[#8B5CF6]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDeleteClick(staffMember)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              }))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#EDE9FE]/30 bg-white rounded-lg p-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length} staff members
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-[#EDE9FE] text-[#8B5CF6] hover:bg-[#FCD6F5]/30"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
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
                      className={currentPage === pageNum
                        ? "bg-gradient-to-r from-[#FCD6F5] to-[#EDE9FE] text-[#6D28D9] border-0"
                        : "border-[#EDE9FE] text-[#8B5CF6] hover:bg-[#FCD6F5]/30"
                      }
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border-[#EDE9FE] text-[#8B5CF6] hover:bg-[#FCD6F5]/30"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No staff members found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Staff Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Team Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStatistics ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-muted-foreground">Loading statistics...</div>
              </div>
            ) : statistics ? (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{statistics.total_staff || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Staff</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{statistics.active_staff || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Staff</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {statistics.average_rating && statistics.average_rating > 0
                      ? statistics.average_rating.toFixed(1)
                      : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{statistics.bookable_staff || 0}</div>
                  <div className="text-sm text-muted-foreground">Bookable Staff</div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{staff.length}</div>
                  <div className="text-sm text-muted-foreground">Total Staff</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {staff.filter(s => s.is_active).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Staff</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">N/A</div>
                  <div className="text-sm text-muted-foreground">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {staff.filter(s => s.is_bookable).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Bookable Staff</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      )}

      {/* Staff Profile Dialog */}
      <Dialog open={showStaffDialog} onOpenChange={(open) => {
        setShowStaffDialog(open)
        if (!open) {
          setShowOptionalFields(false) // Reset collapse state when closing
        }
      }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-[#8B5CF6]" />
                {isEditMode ? "Edit Staff Profile" : "Staff Profile"}
              </DialogTitle>
              {isEditMode && (
                <p className="text-sm text-muted-foreground">
                  Fields marked with * are required
                </p>
              )}
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4">
                {!isEditMode ? (
                  <>
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary/20 mx-auto mb-3">
                        <img
                          src={`/abstract-geometric-shapes.png?height=80&width=80&query=${selectedStaff.name} professional beauty therapist headshot portrait smiling`}
                          alt={selectedStaff.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-semibold">{selectedStaff.name}</h3>
                      <p className="text-muted-foreground">{selectedStaff.role}</p>
                      {selectedStaff.rating && selectedStaff.rating > 0 ? (
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{selectedStaff.rating.toFixed(1)}</span>
                          <span className="text-muted-foreground">({selectedStaff.rating_count || 0} reviews)</span>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground mt-2">No rating yet</div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm text-muted-foreground">Contact</Label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedStaff.phone || `+62 812 345 ${selectedStaff.id.slice(-4)}`}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {selectedStaff.email ||
                                `${selectedStaff.name.toLowerCase().replace(" ", ".")}@beautyclinic.com`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Specialties</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(() => {
                            // Handle both object and array formats for skills
                            let skillsArray: string[] = []
                            if (Array.isArray(selectedStaff.skills)) {
                              skillsArray = selectedStaff.skills
                            } else if (selectedStaff.skills && typeof selectedStaff.skills === 'object') {
                              skillsArray = selectedStaff.skills.specialties || []
                            }

                            return skillsArray.map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))
                          })()}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm text-muted-foreground">Products</Label>
                        <div className="space-y-2 mt-1">
                          {(() => {
                            // Get assigned products from assignedStaff (backward compatibility) - only active
                            const assignedProducts = treatments.filter((treatment) =>
                              treatment.status === "active" && treatment.assignedStaff?.includes(selectedStaff.id),
                            )

                            // Get service_ids from skills (source of truth from API)
                            let serviceIds: string[] = []
                            if (selectedStaff.skills && typeof selectedStaff.skills === 'object' && !Array.isArray(selectedStaff.skills)) {
                              serviceIds = selectedStaff.skills.service_ids || []
                            }

                            // Priority: use service_ids from API, fallback to assignedStaff - only active products
                            const productsToShow = serviceIds.length > 0
                              ? treatments.filter(t => t.status === "active" && serviceIds.includes(t.id))
                              : assignedProducts

                            if (productsToShow.length === 0) {
                              return <div className="text-sm text-muted-foreground italic">No products assigned</div>
                            }

                            return (
                              <div className="flex flex-wrap gap-1">
                                {productsToShow.map((treatment) => (
                                  <Badge
                                    key={treatment.id}
                                    variant="outline"
                                    className="text-xs border-[#8B5CF6] text-[#8B5CF6] bg-[#FCD6F5]/30"
                                  >
                                    {treatment.name}
                                  </Badge>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      </div>

                      {(() => {
                        const performance = getStaffPerformance(selectedStaff.id)
                        return (
                          <div>
                            <Label className="text-sm text-muted-foreground">Performance</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-semibold text-primary">{performance.totalBookings}</div>
                                <div className="text-xs text-muted-foreground">Total Bookings</div>
                              </div>
                              <div className="text-center p-2 bg-muted/30 rounded">
                                <div className="font-semibold text-green-600">
                                  {Math.round(performance.completionRate)}%
                                </div>
                                <div className="text-xs text-muted-foreground">Success Rate</div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-white text-[#6D28D9] hover:bg-[#FCD6F5]/30" onClick={() => {
                        // Convert skills to array format for form
                        let skillsArray: string[] = []
                        if (Array.isArray(selectedStaff.skills)) {
                          skillsArray = selectedStaff.skills
                        } else if (selectedStaff.skills && typeof selectedStaff.skills === 'object') {
                          skillsArray = selectedStaff.skills.specialties || []
                        }

                        // Extract skills data
                        let certificationsArray: string[] = []
                        let serviceIdsArray: string[] = []
                        let yearsExp = 0
                        let specialtiesArray: string[] = skillsArray

                        if (selectedStaff.skills && typeof selectedStaff.skills === 'object' && !Array.isArray(selectedStaff.skills)) {
                          certificationsArray = selectedStaff.skills.certifications || []
                          serviceIdsArray = selectedStaff.skills.service_ids || []
                          yearsExp = selectedStaff.skills.years_experience || 0
                        }

                        // Get assigned treatments from assignedStaff (backward compatibility)
                        const assignedTreatmentIds = treatments
                          .filter(t => t.assignedStaff?.includes(selectedStaff.id))
                          .map(t => t.id)

                        // IMPORTANT: For form, use service_ids from API as source of truth
                        const finalServiceIds = serviceIdsArray.length > 0 ? serviceIdsArray : assignedTreatmentIds
                        const finalAssignedTreatments = serviceIdsArray.length > 0 ? serviceIdsArray : assignedTreatmentIds

                        setEditStaffForm({
                          name: selectedStaff.name || `${selectedStaff.first_name || ''} ${selectedStaff.last_name || ''}`.trim(),
                          first_name: selectedStaff.first_name || selectedStaff.name?.split(' ')[0] || "",
                          last_name: selectedStaff.last_name || selectedStaff.name?.split(' ').slice(1).join(' ') || "",
                          display_name: selectedStaff.display_name || selectedStaff.name || "",
                          role: selectedStaff.role || selectedStaff.position || "",
                          position: selectedStaff.position || selectedStaff.role || "",
                          email: selectedStaff.email,
                          phone: selectedStaff.phone || "",
                          photo: selectedStaff.photo || selectedStaff.profile_image_url || "",
                          profile_image_url: selectedStaff.profile_image_url || selectedStaff.photo || "",
                          employment_type: selectedStaff.employment_type || selectedStaff.employmentType || "full_time",
                          employee_id: selectedStaff.employee_id || selectedStaff.employeeId || "",
                          hire_date: selectedStaff.hire_date || selectedStaff.hireDate || "",
                          birth_date: selectedStaff.birth_date || selectedStaff.birthDate || "",
                          hourly_rate: selectedStaff.hourly_rate || selectedStaff.hourlyRate || null,
                          salary: selectedStaff.salary || null,
                          is_bookable: selectedStaff.is_bookable !== undefined ? selectedStaff.is_bookable : selectedStaff.isBookable !== undefined ? selectedStaff.isBookable : true,
                          accepts_online_booking: selectedStaff.accepts_online_booking !== undefined ? selectedStaff.accepts_online_booking : selectedStaff.acceptsOnlineBooking !== undefined ? selectedStaff.acceptsOnlineBooking : true,
                          max_advance_booking_days: selectedStaff.max_advance_booking_days || selectedStaff.maxAdvanceBookingDays || 30,
                          bio: selectedStaff.bio || "",
                          instagram_handle: selectedStaff.instagram_handle || selectedStaff.instagramHandle || "",
                          is_active: selectedStaff.is_active !== undefined ? selectedStaff.is_active : selectedStaff.isActive !== undefined ? selectedStaff.isActive : true,
                          status: selectedStaff.status || "active",
                          skills: skillsArray,
                          specialties: specialtiesArray,
                          certifications: certificationsArray,
                          service_ids: finalServiceIds,
                          years_experience: yearsExp,
                          workingSchedule: selectedStaff.workingSchedule || {},
                          workingDays: selectedStaff.workingDays || [],
                          notes: selectedStaff.notes || "",
                          assignedTreatments: finalAssignedTreatments, // Use service_ids for form checkboxes
                        })
                        setIsEditMode(true)
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-white text-[#6D28D9] hover:bg-[#FCD6F5]/30"
                        onClick={() => {
                          setShowStaffDialog(false)
                          setShowScheduleDialog(true)
                        }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View Schedule
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {/* MANDATORY FIELDS SECTION */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-name" className="text-sm font-medium">
                            Name *
                          </Label>
                          <Input
                            id="edit-name"
                            value={editStaffForm.name}
                            onChange={(e) => {
                              const fullName = e.target.value
                              const nameParts = fullName.trim().split(' ')
                              setEditStaffForm((prev) => ({
                                ...prev,
                                name: fullName,
                                first_name: nameParts[0] || "",
                                last_name: nameParts.slice(1).join(' ') || "",
                                display_name: fullName
                              }))
                            }}
                            className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-role" className="text-sm font-medium">
                            Role / Posisi *
                          </Label>
                          {loadingPositions ? (
                            <div className="h-11 flex items-center justify-center border rounded-md bg-gray-50 mt-1">
                              <span className="text-sm text-gray-500">Loading positions...</span>
                            </div>
                          ) : positionTemplates.length > 0 ? (
                            <Select
                              value={editStaffForm.role}
                              onValueChange={(value) => setEditStaffForm((prev) => ({
                                ...prev,
                                role: value,
                                position: value
                              }))}
                            >
                              <SelectTrigger className="mt-1 h-11 border-[#EDE9FE] focus:border-[#8B5CF6]">
                                <SelectValue placeholder="Select a position" />
                              </SelectTrigger>
                              <SelectContent>
                                {positionTemplates.map((position) => (
                                  <SelectItem key={position} value={position}>
                                    {position}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id="edit-role"
                              value={editStaffForm.role}
                              onChange={(e) => setEditStaffForm((prev) => ({
                                ...prev,
                                role: e.target.value,
                                position: e.target.value
                              }))}
                              placeholder="e.g., Beauty Therapist, Massage Therapist"
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                              required
                            />
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {positionTemplates.length > 0 ? "Select from your tenant's position templates" : "Enter staff position (customize in Settings)"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-email" className="text-sm font-medium">
                            Email *
                          </Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editStaffForm.email}
                            onChange={(e) => setEditStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone" className="text-sm font-medium">
                            Nomor Telepon *
                          </Label>
                          <div className="flex gap-2 mt-1">
                            <div className="flex items-center px-3 py-2 border border-[#EDE9FE] bg-gray-50 rounded-md text-gray-600 font-medium">
                              +62
                            </div>
                            <Input
                              id="edit-phone"
                              type="tel"
                              value={editStaffForm.phone}
                              onChange={(e) => {
                                // Only allow numbers and limit input
                                const value = e.target.value.replace(/\D/g, '')
                                setEditStaffForm((prev) => ({ ...prev, phone: value }))
                              }}
                              placeholder="81xxxxxxxxx"
                              className="flex-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                              required
                              minLength={9}
                              maxLength={13}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Masukkan nomor tanpa +62 (contoh: 81234567890)
                          </p>
                        </div>
                      </div>

                      {outlets.length > 0 && (
                        <div>
                          <Label htmlFor="edit-outlet" className="text-sm font-medium">
                            Outlet
                          </Label>
                          <Select
                            value={editStaffForm.outlet_id || outlets[0]?.id}
                            onValueChange={(value) => setEditStaffForm((prev) => ({ ...prev, outlet_id: value }))}
                          >
                            <SelectTrigger className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]">
                              <SelectValue placeholder="Select outlet" />
                            </SelectTrigger>
                            <SelectContent>
                              {outlets.map((outlet: any) => (
                                <SelectItem key={outlet.id} value={outlet.id}>
                                  {outlet.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* COLLAPSIBLE OPTIONAL FIELDS BUTTON */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                      className="w-full justify-between border-2 border-purple-200 hover:bg-purple-50"
                    >
                      <span className="font-semibold text-purple-700">
                        {showOptionalFields ? 'Hide' : 'Show'} Optional Fields
                      </span>
                      {showOptionalFields ? (
                        <ChevronUp className="h-4 w-4 text-purple-700" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-purple-700" />
                      )}
                    </Button>

                    {/* OPTIONAL FIELDS SECTION (COLLAPSIBLE) */}
                    {showOptionalFields && (
                      <div className="space-y-4 p-4 bg-purple-50/30 border-2 border-purple-200 rounded-lg">
                        <h3 className="font-semibold text-sm text-purple-900 mb-3">Optional Information</h3>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-employment-type" className="text-sm font-medium">
                              Jenis Pekerjaan
                            </Label>
                            <Select
                              value={editStaffForm.employment_type}
                              onValueChange={(value: "full_time" | "part_time" | "contract" | "freelance" | "intern") =>
                                setEditStaffForm((prev) => ({ ...prev, employment_type: value }))
                              }
                            >
                              <SelectTrigger className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full_time">Full Time</SelectItem>
                                <SelectItem value="part_time">Part Time</SelectItem>
                                <SelectItem value="contract">Contract</SelectItem>
                                <SelectItem value="freelance">Freelance</SelectItem>
                                <SelectItem value="intern">Intern</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-employee-id" className="text-sm font-medium">
                              ID Karyawan
                            </Label>
                            <Input
                              id="edit-employee-id"
                              value={editStaffForm.employee_id}
                              onChange={(e) => setEditStaffForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                              placeholder="EMP001"
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-hire-date" className="text-sm font-medium">
                              Tanggal Mulai Kerja
                            </Label>
                            <Input
                              id="edit-hire-date"
                              type="date"
                              value={editStaffForm.hire_date}
                              onChange={(e) => setEditStaffForm((prev) => ({ ...prev, hire_date: e.target.value }))}
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-birth-date" className="text-sm font-medium">
                              Tanggal Lahir
                            </Label>
                            <Input
                              id="edit-birth-date"
                              type="date"
                              value={editStaffForm.birth_date}
                              onChange={(e) => setEditStaffForm((prev) => ({ ...prev, birth_date: e.target.value }))}
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-hourly-rate" className="text-sm font-medium">
                              Tarif Per Jam (Rp)
                            </Label>
                            <Input
                              id="edit-hourly-rate"
                              type="number"
                              min="0"
                              value={editStaffForm.hourly_rate || ""}
                              onChange={(e) => setEditStaffForm((prev) => ({ ...prev, hourly_rate: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="0"
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-salary" className="text-sm font-medium">
                              Gaji (Rp)
                            </Label>
                            <Input
                              id="edit-salary"
                              type="number"
                              min="0"
                              value={editStaffForm.salary || ""}
                              onChange={(e) => setEditStaffForm((prev) => ({ ...prev, salary: e.target.value ? parseFloat(e.target.value) : null }))}
                              placeholder="0"
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-photo" className="text-sm font-medium">
                            Photo URL
                          </Label>
                          <Input
                            id="edit-photo"
                            value={editStaffForm.photo}
                            onChange={(e) => setEditStaffForm((prev) => ({ ...prev, photo: e.target.value, profile_image_url: e.target.value }))}
                            placeholder="https://example.com/photo.jpg"
                            className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter a URL to the staff member's photo
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="edit-bio" className="text-sm font-medium">
                            Bio / Deskripsi
                          </Label>
                          <Textarea
                            id="edit-bio"
                            value={editStaffForm.bio}
                            onChange={(e) => setEditStaffForm((prev) => ({ ...prev, bio: e.target.value }))}
                            placeholder="Deskripsi singkat tentang staff member..."
                            className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-instagram" className="text-sm font-medium">
                            Instagram Handle
                          </Label>
                          <Input
                            id="edit-instagram"
                            value={editStaffForm.instagram_handle}
                            onChange={(e) => setEditStaffForm((prev) => ({ ...prev, instagram_handle: e.target.value }))}
                            placeholder="@username"
                            className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-status" className="text-sm font-medium">
                              Status
                            </Label>
                            <Select
                              value={editStaffForm.status}
                              onValueChange={(value: "active" | "inactive" | "terminated" | "on_leave") =>
                                setEditStaffForm((prev) => ({ ...prev, status: value, is_active: value === "active" }))
                              }
                            >
                              <SelectTrigger className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <div className="flex items-center space-x-2 pb-2">
                              <Checkbox
                                id="edit-is-active"
                                checked={editStaffForm.is_active}
                                onCheckedChange={(checked) =>
                                  setEditStaffForm((prev) => ({ ...prev, is_active: checked as boolean }))
                                }
                                className="border-[#EDE9FE] data-[state=checked]:bg-[#8B5CF6]"
                              />
                              <Label htmlFor="edit-is-active" className="text-sm cursor-pointer">
                                Staff Aktif
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="border border-[#EDE9FE] rounded-lg p-4 space-y-3">
                          <Label className="text-sm font-medium">Pengaturan Booking</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-is-bookable"
                              checked={editStaffForm.is_bookable}
                              onCheckedChange={(checked) =>
                                setEditStaffForm((prev) => ({ ...prev, is_bookable: checked as boolean }))
                              }
                              className="border-[#EDE9FE] data-[state=checked]:bg-[#8B5CF6]"
                            />
                            <Label htmlFor="edit-is-bookable" className="text-sm cursor-pointer">
                              Staff dapat dibooking
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-accepts-online"
                              checked={editStaffForm.accepts_online_booking}
                              onCheckedChange={(checked) =>
                                setEditStaffForm((prev) => ({ ...prev, accepts_online_booking: checked as boolean }))
                              }
                              className="border-[#EDE9FE] data-[state=checked]:bg-[#8B5CF6]"
                            />
                            <Label htmlFor="edit-accepts-online" className="text-sm cursor-pointer">
                              Terima booking online
                            </Label>
                          </div>
                          <div>
                            <Label htmlFor="edit-max-days" className="text-sm font-medium">
                              Maksimal hari booking di muka
                            </Label>
                            <Input
                              id="edit-max-days"
                              type="number"
                              min="1"
                              max="365"
                              value={editStaffForm.max_advance_booking_days}
                              onChange={(e) =>
                                setEditStaffForm((prev) => ({ ...prev, max_advance_booking_days: parseInt(e.target.value) || 30 }))
                              }
                              placeholder="30"
                              className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Skills & Specialties</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              value={editSkillInput}
                              onChange={(e) => setEditSkillInput(e.target.value)}
                              placeholder="Add a skill"
                              className="border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                              onKeyPress={(e) => e.key === "Enter" && handleEditAddSkill()}
                            />
                            <Button
                              type="button"
                              onClick={handleEditAddSkill}
                              size="sm"
                              className="bg-[#EDE9FE] hover:bg-[#8B5CF6] text-[#6D28D9]"
                            >
                              Add
                            </Button>
                          </div>
                          {editStaffForm.skills && editStaffForm.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {editStaffForm.skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="text-xs bg-[#FCD6F5] text-[#6D28D9] hover:bg-[#EDE9FE]"
                                >
                                  {skill}
                                  <button onClick={() => handleEditRemoveSkill(skill)} className="ml-1 hover:text-red-600">
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SERVICE ASSIGNMENT SECTION - Always visible as mandatory */}
                    <div className="border-t-2 border-purple-100 pt-6">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Assign Products / Services *
                        <Badge variant="destructive" className="text-xs">Wajib</Badge>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        Pilih minimal 1 layanan yang dapat dilakukan oleh staff ini
                      </p>
                      <div className="space-y-2 mt-2 max-h-60 overflow-y-auto border-2 border-[#C4B5FD] rounded-lg p-4 bg-gray-50">
                        {treatments.filter((treatment) => treatment.status === "active").map((treatment) => (
                          <div key={treatment.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-treatment-${treatment.id}`}
                              checked={editStaffForm.assignedTreatments?.includes(treatment.id) || false}
                              onCheckedChange={(checked) => {
                                setEditStaffForm((prev) => {
                                  const currentTreatments = prev.assignedTreatments || []
                                  let newTreatments: string[]

                                  if (checked) {
                                    newTreatments = [...currentTreatments, treatment.id]
                                  } else {
                                    newTreatments = currentTreatments.filter((id) => id !== treatment.id)
                                  }

                                  return {
                                    ...prev,
                                    assignedTreatments: newTreatments,
                                    service_ids: newTreatments, // Sync to service_ids
                                  }
                                })
                              }}
                              className="border-[#EDE9FE] data-[state=checked]:bg-[#8B5CF6]"
                            />
                            <Label htmlFor={`edit-treatment-${treatment.id}`} className="text-sm cursor-pointer flex-1">
                              <div className="flex items-center gap-2">
                                <span>{treatment.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {treatment.duration}min
                                </Badge>
                                <span className="text-muted-foreground text-xs">{formatCurrency(treatment.price || 0)}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsEditMode(false)}
                        className="flex-1 border-[#EDE9FE] text-[#6D28D9] hover:bg-[#FCD6F5]"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateStaff}
                        className="flex-1 bg-gradient-to-r from-[#EDE9FE] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-[#6D28D9]"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Staff Schedule Dialog - Availability Management */}
        <Dialog open={showScheduleDialog} onOpenChange={(open) => {
          setShowScheduleDialog(open)
          if (!open) {
            setShowAddAvailability(false)
            setEditingAvailability(null)
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Kelola Ketersediaan - {selectedStaff?.display_name || selectedStaff?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4">
                {/* Show list view when NOT in add/edit mode */}
                {!showAddAvailability && (
                  <>
                {/* Date Range Selector */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Dari Tanggal</Label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Sampai Tanggal</Label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const today = new Date()
                      setDateRange({
                        start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
                        end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0],
                      })
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-5"
                  >
                    Bulan Ini
                  </Button>
                </div>

                {/* Availability Type Tabs */}
                <Tabs value={availabilityTab} onValueChange={(value: any) => setAvailabilityTab(value)}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="working_hours">Jam Kerja</TabsTrigger>
                    <TabsTrigger value="break">Istirahat</TabsTrigger>
                    <TabsTrigger value="blocked">Blokir</TabsTrigger>
                    <TabsTrigger value="vacation">Cuti</TabsTrigger>
                  </TabsList>

                  {/* Tab Content - All tabs show the same structure */}
                  <TabsContent value={availabilityTab} className="space-y-4 mt-4">
                    {/* Add Button */}
                    {!showAddAvailability && (
                      <Button
                        onClick={() => {
                          setShowAddAvailability(true)
                          setEditingAvailability(null)
                          // Auto-assign all staff's services when opening add form
                          // Handle both nested (skills.service_ids) and flat (service_ids) structure
                          const staffServiceIds = selectedStaff?.skills?.service_ids || selectedStaff?.service_ids || []
                          setAvailabilityForm({
                            date: new Date().toISOString().split('T')[0],
                            start_time: availabilityTab === 'break' ? "12:00" : "09:00",
                            end_time: availabilityTab === 'break' ? "13:00" : "17:00",
                            availability_type: availabilityTab,
                            recurrence_type: "none",
                            recurrence_end_date: "",
                            recurrence_days: [],
                            is_available: availabilityTab === 'working_hours',
                            notes: "",
                            service_ids: staffServiceIds, // Auto-select all assigned services
                          })
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah {availabilityTab === 'working_hours' ? 'Jam Kerja' :
                                availabilityTab === 'break' ? 'Waktu Istirahat' :
                                availabilityTab === 'blocked' ? 'Waktu Blokir' : 'Cuti'}
                      </Button>
                    )}

                    {/* List of Availability Entries */}
                    {!showAddAvailability && (
                    <div className="space-y-2">
                      {availabilityLoading ? (
                        <div className="text-center py-8">
                          <GradientLoading text="Loading Staff" />
                        </div>
                      ) : availabilityEntries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Belum ada {
                            availabilityTab === 'working_hours' ? 'jam kerja' :
                            availabilityTab === 'break' ? 'waktu istirahat' :
                            availabilityTab === 'blocked' ? 'waktu blokir' : 'cuti'
                          } yang diatur</p>
                        </div>
                      ) : (
                        <div className="max-h-[400px] overflow-y-auto space-y-2">
                          {availabilityEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{format(new Date(entry.date), 'dd MMM yyyy')}</span>
                                  {entry.recurrence_type !== 'none' && (
                                    <Badge variant="secondary" className="text-xs">
                                      {entry.recurrence_type === 'daily' ? 'Harian' :
                                       entry.recurrence_type === 'weekly' ? 'Mingguan' :
                                       entry.recurrence_type === 'monthly' ? 'Bulanan' : ''}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                                </div>
                                {entry.notes && (
                                  <div className="text-xs text-muted-foreground mt-1">{entry.notes}</div>
                                )}
                                {entry.service_ids && entry.service_ids.length > 0 && (
                                  <div className="text-xs text-[#8B5CF6] mt-1">
                                    Layanan: {treatments.filter(t => t.status === "active" && entry.service_ids.includes(t.id)).map(t => t.name).join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditAvailability(entry)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteAvailability(entry.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    )}
                  </TabsContent>
                </Tabs>
                  </>
                )}

                {/* Add/Edit Availability Form (Outside Tabs) */}
                {showAddAvailability && (
                  <div className="border-2 border-[#C4B5FD] rounded-xl p-6 space-y-5 bg-gradient-to-br from-purple-50/50 to-pink-50/50 shadow-lg">
                    <div className="flex items-center gap-4 pb-4 border-b border-[#C4B5FD]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAddAvailability(false)
                          setEditingAvailability(null)
                        }}
                        className="hover:bg-[#EDE9FE] border-[#C4B5FD]"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali
                      </Button>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            {editingAvailability ? 'Edit' : 'Tambah'} {
                              availabilityTab === 'working_hours' ? 'Jam Kerja' :
                              availabilityTab === 'break' ? 'Waktu Istirahat' :
                              availabilityTab === 'blocked' ? 'Waktu Blokir' : 'Cuti'
                            }
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {editingAvailability ? 'Perbarui jadwal ketersediaan' : 'Buat jadwal ketersediaan baru'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tanggal *</Label>
                        <Input
                          type="date"
                          value={availabilityForm.date}
                          onChange={(e) => setAvailabilityForm(prev => ({ ...prev, date: e.target.value }))}
                          disabled={!!editingAvailability}
                        />
                      </div>
                      <div>
                        <Label>Pola Pengulangan</Label>
                        <Select
                          value={availabilityForm.recurrence_type}
                          onValueChange={(value: any) => setAvailabilityForm(prev => ({ ...prev, recurrence_type: value }))}
                          disabled={!!editingAvailability}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Tidak Berulang</SelectItem>
                            <SelectItem value="daily">Harian</SelectItem>
                            <SelectItem value="weekly">Mingguan</SelectItem>
                            <SelectItem value="monthly">Bulanan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Waktu Mulai *</Label>
                        <Input
                          type="time"
                          step="300"
                          value={availabilityForm.start_time}
                          onChange={(e) => setAvailabilityForm(prev => ({ ...prev, start_time: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Kelipatan 5 menit</p>
                      </div>
                      <div>
                        <Label>Waktu Selesai *</Label>
                        <Input
                          type="time"
                          step="300"
                          value={availabilityForm.end_time}
                          onChange={(e) => setAvailabilityForm(prev => ({ ...prev, end_time: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Kelipatan 5 menit</p>
                      </div>
                    </div>

                    {/* Recurrence End Date */}
                    {availabilityForm.recurrence_type !== 'none' && (
                      <div>
                        <Label>Tanggal Akhir Pengulangan *</Label>
                        <Input
                          type="date"
                          value={availabilityForm.recurrence_end_date}
                          onChange={(e) => setAvailabilityForm(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Wajib diisi untuk pola berulang
                        </p>
                      </div>
                    )}

                    {/* Weekly Days Selection */}
                    {availabilityForm.recurrence_type === 'weekly' && (
                      <div>
                        <Label>Hari dalam Minggu (opsional)</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant={availabilityForm.recurrence_days.includes(index) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleRecurrenceDayToggle(index)}
                              className={availabilityForm.recurrence_days.includes(index) ? "bg-purple-600" : ""}
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Kosong = semua hari dalam minggu
                        </p>
                      </div>
                    )}

                    {/* Service-Specific Availability */}
                    {availabilityTab === 'working_hours' && (() => {
                      // Filter treatments to only show services assigned to this staff (only active)
                      // Handle both nested (skills.service_ids) and flat (service_ids) structure
                      const staffServiceIds = selectedStaff?.skills?.service_ids || selectedStaff?.service_ids || []
                      const assignedTreatments = treatments.filter(t => t.status === "active" && staffServiceIds.includes(t.id))

                      return (
                        <div>
                          <Label>Layanan Staff (opsional)</Label>
                          <p className="text-xs text-muted-foreground mt-1 mb-2">
                            Hanya layanan yang sudah di-assign ke staff ini. Default: Semua layanan ter-assign.
                          </p>

                          {assignedTreatments.length === 0 ? (
                            <div className="mt-2 border-2 border-yellow-300 rounded-lg p-4 bg-yellow-50">
                              <p className="text-sm text-yellow-800">
                                ⚠️ Staff ini belum memiliki layanan yang di-assign.
                                Silakan assign layanan terlebih dahulu di tab "Layanan" saat edit staff.
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2 border-2 border-[#C4B5FD] rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
                              {/* Select All Option */}
                              <div className="flex items-center space-x-3 pb-3 border-b-2 border-[#C4B5FD] mb-3 bg-white p-3 rounded-md shadow-sm">
                                <Checkbox
                                  id="service-all"
                                  checked={availabilityForm.service_ids.length === assignedTreatments.length && assignedTreatments.length > 0}
                                  onCheckedChange={(checked) => {
                                    setAvailabilityForm(prev => ({
                                      ...prev,
                                      service_ids: checked ? assignedTreatments.map(t => t.id) : []
                                    }))
                                  }}
                                  className="border-2 border-[#8B5CF6] data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <label
                                  htmlFor="service-all"
                                  className="text-sm font-bold cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#6D28D9]"
                                >
                                  Semua Layanan Staff ({assignedTreatments.length})
                                </label>
                              </div>

                              {/* Individual Services */}
                              <div className="space-y-2">
                                {assignedTreatments.map(treatment => (
                                  <div key={treatment.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white transition-colors">
                                    <Checkbox
                                      id={`service-${treatment.id}`}
                                      checked={availabilityForm.service_ids.includes(treatment.id)}
                                      onCheckedChange={(checked) => {
                                        setAvailabilityForm(prev => ({
                                          ...prev,
                                          service_ids: checked
                                            ? [...prev.service_ids, treatment.id]
                                            : prev.service_ids.filter(id => id !== treatment.id)
                                        }))
                                      }}
                                      className="border-2 border-gray-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                    />
                                    <label
                                      htmlFor={`service-${treatment.id}`}
                                      className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900"
                                    >
                                      {treatment.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-2">
                            {assignedTreatments.length === 0
                              ? 'Staff belum memiliki layanan yang di-assign'
                              : availabilityForm.service_ids.length === 0
                              ? 'Tidak ada layanan yang dipilih (tersedia untuk semua layanan)'
                              : availabilityForm.service_ids.length === assignedTreatments.length
                              ? `Semua layanan staff dipilih (${assignedTreatments.length})`
                              : `${availabilityForm.service_ids.length} dari ${assignedTreatments.length} layanan dipilih`}
                          </p>
                        </div>
                      )
                    })()}

                    <div>
                      <Label>Catatan</Label>
                      <Textarea
                        value={availabilityForm.notes}
                        onChange={(e) => setAvailabilityForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Catatan tambahan..."
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3 pt-2 border-t border-[#C4B5FD]">
                      <Button
                        onClick={editingAvailability ? handleUpdateAvailability : handleCreateAvailability}
                        disabled={savingAvailability}
                        className="flex-1 h-12 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#EC4899] text-white shadow-lg hover:shadow-xl transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingAvailability ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            {editingAvailability ? 'Perbarui Ketersediaan' : 'Simpan Ketersediaan'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddAvailability(false)
                          setEditingAvailability(null)
                        }}
                        disabled={savingAvailability}
                        className="h-12 px-6 border-2 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-5 w-5 mr-2" />
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                {!showAddAvailability && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowScheduleDialog(false)}
                  >
                    Tutup
                  </Button>
                </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Staff Member Dialog */}
        <Dialog open={showAddStaffDialog} onOpenChange={(open) => {
          setShowAddStaffDialog(open)
          if (!open) {
            setShowOptionalFields(false) // Reset collapse state when closing
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="h-5 w-5 text-[#8B5CF6]" />
                Add New Staff Member
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Fields marked with * are required
              </p>
            </DialogHeader>
            <div className="space-y-6">
              {/* MANDATORY FIELDS SECTION */}
              <div className="space-y-4 pb-4 border-b-2 border-purple-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="first_name"
                    value={newStaffForm.first_name}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Enter first name"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="last_name"
                    value={newStaffForm.last_name}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Enter last name"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="display_name" className="text-sm font-medium">
                  Display Name
                </Label>
                <Input
                  id="display_name"
                  value={newStaffForm.display_name}
                  onChange={(e) => setNewStaffForm((prev) => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Leave empty to auto-generate from first + last name"
                  className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to auto-generate from first + last name
                </p>
              </div>

              <div>
                <Label htmlFor="position" className="text-sm font-medium">
                  Position *
                </Label>
                {loadingPositions ? (
                  <div className="h-11 flex items-center justify-center border rounded-md bg-gray-50 mt-1">
                    <span className="text-sm text-gray-500">Loading positions...</span>
                  </div>
                ) : positionTemplates.length > 0 ? (
                  <Select
                    value={newStaffForm.position}
                    onValueChange={(value) => setNewStaffForm((prev) => ({ ...prev, position: value }))}
                  >
                    <SelectTrigger className="mt-1 h-11 border-[#EDE9FE] focus:border-[#8B5CF6]">
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionTemplates.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="position"
                    value={newStaffForm.position}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Beauty Therapist, Massage Therapist, Receptionist"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    required
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {positionTemplates.length > 0 ? "Select from your tenant's position templates" : "Enter staff position (customize in Settings)"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: nama@domain.com
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Nomor Telepon *
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <div className="flex items-center px-3 py-2 border border-[#EDE9FE] bg-gray-50 rounded-md text-gray-600 font-medium">
                      +62
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={newStaffForm.phone}
                      onChange={(e) => {
                        // Only allow numbers and limit input
                        const value = e.target.value.replace(/\D/g, '')
                        setNewStaffForm((prev) => ({ ...prev, phone: value }))
                      }}
                      placeholder="81xxxxxxxxx"
                      className="flex-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                      required
                      minLength={9}
                      maxLength={13}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Masukkan nomor tanpa +62 (contoh: 81234567890)
                  </p>
                </div>
              </div>

              {outlets.length > 0 && (
                <div>
                  <Label htmlFor="outlet_id" className="text-sm font-medium">
                    Outlet *
                  </Label>
                  <Select
                    value={newStaffForm.outlet_id}
                    onValueChange={(value) => setNewStaffForm((prev) => ({ ...prev, outlet_id: value }))}
                  >
                    <SelectTrigger className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]">
                      <SelectValue placeholder="Pilih outlet" />
                    </SelectTrigger>
                    <SelectContent>
                      {outlets.map((outlet) => (
                        <SelectItem key={outlet._id || outlet.id} value={outlet._id || outlet.id}>
                          {outlet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pilih outlet tempat staff akan ditempatkan
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="employment_type" className="text-sm font-medium">
                  Jenis Pekerjaan *
                </Label>
                <Select
                  value={newStaffForm.employment_type}
                  onValueChange={(value: "full_time" | "part_time" | "contract" | "freelance" | "intern") =>
                    setNewStaffForm((prev) => ({ ...prev, employment_type: value }))
                  }
                >
                  <SelectTrigger className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>

              {/* OPTIONAL FIELDS SECTION - Collapsible */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOptionalFields(!showOptionalFields)}
                  className="w-full justify-between border-2 border-purple-200 hover:bg-purple-50"
                >
                  <span className="font-semibold text-purple-700">
                    {showOptionalFields ? 'Hide' : 'Show'} Optional Fields
                  </span>
                  {showOptionalFields ? (
                    <ChevronUp className="h-4 w-4 text-purple-700" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-purple-700" />
                  )}
                </Button>
              </div>

              {showOptionalFields && (
                <div className="space-y-4 p-4 bg-purple-50/30 border-2 border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-sm text-purple-900 mb-3">Optional Information</h3>

                  <div>
                    <Label htmlFor="employee_id" className="text-sm font-medium">
                      ID Karyawan
                    </Label>
                    <Input
                      id="employee_id"
                      value={newStaffForm.employee_id}
                      onChange={(e) => setNewStaffForm((prev) => ({ ...prev, employee_id: e.target.value }))}
                      placeholder="Contoh: EMP001"
                      className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    />
                  </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hire_date" className="text-sm font-medium">
                    Tanggal Mulai Kerja
                  </Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={newStaffForm.hire_date}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, hire_date: e.target.value }))}
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date" className="text-sm font-medium">
                    Tanggal Lahir
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={newStaffForm.birth_date}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, birth_date: e.target.value }))}
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hourly_rate" className="text-sm font-medium">
                    Tarif Per Jam (Rp)
                  </Label>
                  <Input
                    id="hourly_rate"
                    type="number"
                    min="0"
                    value={newStaffForm.hourly_rate || ""}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, hourly_rate: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="Opsional"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                </div>
                <div>
                  <Label htmlFor="salary" className="text-sm font-medium">
                    Gaji (Rp)
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    value={newStaffForm.salary || ""}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, salary: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="Opsional"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instagram_handle" className="text-sm font-medium">
                    Instagram Handle
                  </Label>
                  <Input
                    id="instagram_handle"
                    value={newStaffForm.instagram_handle}
                    onChange={(e) => setNewStaffForm((prev) => ({ ...prev, instagram_handle: e.target.value }))}
                    placeholder="@username"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                </div>
                <div>
                  <Label htmlFor="years_experience" className="text-sm font-medium">
                    Pengalaman (Tahun)
                  </Label>
                  <Input
                    id="years_experience"
                    type="number"
                    min="0"
                    value={newStaffForm.skills.years_experience}
                    onChange={(e) => setNewStaffForm((prev) => ({
                      ...prev,
                      skills: { ...prev.skills, years_experience: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="0"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profile_image_url" className="text-sm font-medium">
                  Profile Image URL
                </Label>
                <Input
                  id="profile_image_url"
                  value={newStaffForm.profile_image_url}
                  onChange={(e) => setNewStaffForm((prev) => ({ ...prev, profile_image_url: e.target.value }))}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
              </div>

              <div>
                <Label htmlFor="bio" className="text-sm font-medium">
                  Bio / Deskripsi
                </Label>
                <Textarea
                  id="bio"
                  value={newStaffForm.bio}
                  onChange={(e) => setNewStaffForm((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="Deskripsi singkat tentang staff member..."
                  className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  rows={2}
                />
              </div>

              <div className="border border-purple-300 rounded-lg p-4 space-y-3">
                <Label className="text-sm font-medium">Pengaturan Booking</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_bookable"
                    checked={newStaffForm.is_bookable}
                    onCheckedChange={(checked) =>
                      setNewStaffForm((prev) => ({ ...prev, is_bookable: checked as boolean }))
                    }
                    className="border-[#EDE9FE] data-[state=checked]:bg-[#8B5CF6]"
                  />
                  <Label htmlFor="is_bookable" className="text-sm cursor-pointer">
                    Staff dapat dibooking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accepts_online_booking"
                    checked={newStaffForm.accepts_online_booking}
                    onCheckedChange={(checked) =>
                      setNewStaffForm((prev) => ({ ...prev, accepts_online_booking: checked as boolean }))
                    }
                    className="border-[#EDE9FE] data-[state=checked]:bg-[#8B5CF6]"
                  />
                  <Label htmlFor="accepts_online_booking" className="text-sm cursor-pointer">
                    Terima booking online
                  </Label>
                </div>
                <div>
                  <Label htmlFor="max_advance_booking_days" className="text-sm font-medium">
                    Maksimal hari booking di muka
                  </Label>
                  <Input
                    id="max_advance_booking_days"
                    type="number"
                    min="1"
                    max="365"
                    value={newStaffForm.max_advance_booking_days}
                    onChange={(e) =>
                      setNewStaffForm((prev) => ({
                        ...prev,
                        max_advance_booking_days: parseInt(e.target.value) || 30,
                      }))
                    }
                    placeholder="30"
                    className="mt-1 border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Berapa hari ke depan customer bisa booking (default: 30 hari)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="skills" className="text-sm font-medium">
                  Skills & Specialties
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a specialty (e.g., Facial Treatment, Body Massage)"
                    className="border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                  />
                  <Button
                    type="button"
                    onClick={handleAddSkill}
                    size="sm"
                    className="bg-[#EDE9FE] hover:bg-[#8B5CF6] text-[#6D28D9]"
                  >
                    Add
                  </Button>
                </div>
                {newStaffForm.skills.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newStaffForm.skills.specialties.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="text-xs bg-[#FCD6F5] text-[#6D28D9] hover:bg-[#EDE9FE]"
                      >
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-red-600">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="certifications" className="text-sm font-medium">
                  Certifications
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a certification"
                    className="border-[#EDE9FE] focus:border-[#8B5CF6] focus:ring-[#8B5CF6]"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const value = skillInput.trim()
                        if (value && !newStaffForm.skills.certifications.includes(value)) {
                          setNewStaffForm((prev) => ({
                            ...prev,
                            skills: {
                              ...prev.skills,
                              certifications: [...prev.skills.certifications, value],
                            },
                          }))
                          setSkillInput("")
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const value = skillInput.trim()
                      if (value && !newStaffForm.skills.certifications.includes(value)) {
                        setNewStaffForm((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            certifications: [...prev.skills.certifications, value],
                          },
                        }))
                        setSkillInput("")
                      }
                    }}
                    size="sm"
                    className="bg-[#EDE9FE] hover:bg-[#8B5CF6] text-[#6D28D9]"
                  >
                    Add
                  </Button>
                </div>
                {newStaffForm.skills.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newStaffForm.skills.certifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant="secondary"
                        className="text-xs bg-[#E7FFE7] text-green-800 hover:bg-[#D4FFD4]"
                      >
                        {cert}
                        <button
                          onClick={() =>
                            setNewStaffForm((prev) => ({
                              ...prev,
                              skills: {
                                ...prev.skills,
                                certifications: prev.skills.certifications.filter((c) => c !== cert),
                              },
                            }))
                          }
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
                </div>
              )}

              {/* Service Assignment - Always visible as it's mandatory */}
              <div className="border-t-2 border-purple-100 pt-6">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Assign Products / Services *
                  <Badge variant="destructive" className="text-xs">Wajib</Badge>
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Pilih minimal 1 layanan yang dapat dilakukan oleh staff ini
                </p>
                <div className="mt-2 border-2 border-[#C4B5FD] rounded-lg p-4 bg-gray-50">
                  {/* Select All Option */}
                  <div className="flex items-center space-x-3 pb-3 border-b-2 border-[#C4B5FD] mb-3 bg-white p-3 rounded-md shadow-sm">
                    <Checkbox
                      id="new-service-all"
                      checked={(() => {
                        const activeTreatments = treatments.filter(t => t.status === "active")
                        return newStaffForm.skills.service_ids.length === activeTreatments.length && activeTreatments.length > 0
                      })()}
                      onCheckedChange={(checked) => {
                        const activeTreatments = treatments.filter(t => t.status === "active")
                        setNewStaffForm((prev) => ({
                          ...prev,
                          skills: {
                            ...prev.skills,
                            service_ids: checked ? activeTreatments.map(t => t.id) : []
                          }
                        }))
                      }}
                      className="border-2 border-[#8B5CF6] data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                    <label
                      htmlFor="new-service-all"
                      className="text-sm font-bold cursor-pointer leading-none text-[#6D28D9]"
                    >
                      Pilih Semua Layanan Aktif
                    </label>
                  </div>

                  {/* Individual Services */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {treatments.filter((treatment) => treatment.status === "active").map((treatment) => (
                      <div key={treatment.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-white transition-colors">
                        <Checkbox
                          id={`new-treatment-${treatment.id}`}
                          checked={newStaffForm.skills.service_ids.includes(treatment.id)}
                          onCheckedChange={(checked) => {
                            setNewStaffForm((prev) => {
                              const currentServiceIds = prev.skills.service_ids
                              if (checked) {
                                return {
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    service_ids: [...currentServiceIds, treatment.id],
                                  },
                                }
                              } else {
                                return {
                                  ...prev,
                                  skills: {
                                    ...prev.skills,
                                    service_ids: currentServiceIds.filter((id) => id !== treatment.id),
                                  },
                                }
                              }
                            })
                          }}
                          className="border-2 border-gray-400 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <Label htmlFor={`new-treatment-${treatment.id}`} className="text-sm cursor-pointer flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 font-medium">{treatment.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {treatment.duration}min
                            </Badge>
                            <span className="text-muted-foreground text-xs">{formatCurrency(treatment.price || 0)}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {newStaffForm.skills.service_ids.length === 0
                    ? 'Pilih minimal 1 layanan (wajib)'
                    : newStaffForm.skills.service_ids.length === treatments.length
                    ? 'Semua layanan dipilih'
                    : `${newStaffForm.skills.service_ids.length} layanan dipilih`}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddStaffDialog(false)}
                  className="flex-1 border-[#EDE9FE] text-[#6D28D9] hover:bg-[#FCD6F5]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddStaff}
                  className="flex-1 bg-gradient-to-r from-[#EDE9FE] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-[#6D28D9] shadow-lg"
                >
                  Add Staff Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <DeleteEntityDialog
          open={showDeleteDialog && !!staffToDelete}
          onOpenChange={setShowDeleteDialog}
          entityType="Staff"
          entityName={staffToDelete?.name || staffToDelete?.display_name || ""}
          entityDetails={[
            { label: "Name", value: staffToDelete?.name || staffToDelete?.display_name || "-" },
            { label: "Position", value: staffToDelete?.position || staffToDelete?.role || "-" },
            { label: "Phone", value: staffToDelete?.phone || "-" },
            { label: "Email", value: staffToDelete?.email || "-" },
            { label: "Status", value: staffToDelete?.status || "active" },
          ]}
          onConfirmDelete={handleConfirmDelete}
          softDeleteImpacts={[
            "Staff will be marked as TERMINATED and inactive",
            "Staff cannot be assigned to new appointments",
            "Historical appointment data will be preserved",
            "Staff data can be restored within 10 seconds"
          ]}
        />

        {/* Error Dialog */}
        <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                {errorInfo.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3 pt-2">
                <div className="text-gray-700 text-base whitespace-pre-line">
                  {errorInfo.message}
                </div>
                {(errorInfo.message.toLowerCase().includes('subscription') ||
                  errorInfo.message.toLowerCase().includes('limit') ||
                  errorInfo.message.toLowerCase().includes('upgrade') ||
                  errorInfo.message.toLowerCase().includes('batas')) && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>💡 Info:</strong> Upgrade paket langganan Anda untuk menambah batas staff dan fitur lainnya.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              {(errorInfo.message.toLowerCase().includes('staff limit') ||
                errorInfo.message.toLowerCase().includes('subscription') ||
                errorInfo.message.toLowerCase().includes('upgrade')) && (
                <Button
                  onClick={() => {
                    setShowErrorDialog(false)
                    setTimeout(() => {
                      router.push('/subscription/upgrade')
                    }, 100)
                  }}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
              <AlertDialogAction
                onClick={() => setShowErrorDialog(false)}
                className="bg-gradient-to-r from-[#EDE9FE] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-[#6D28D9]"
              >
                Mengerti
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </>
  )
}

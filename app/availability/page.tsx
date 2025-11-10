"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useStaff, useTreatments } from "@/lib/context"
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { id as localeId } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Filter,
  Plus,
  Edit,
  X,
} from "lucide-react"
import GradientLoading from "@/components/gradient-loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { MultiStaffGrid } from "@/components/availability/multi-staff-grid"
import { AddAvailabilityDialog } from "@/components/availability/add-availability-dialog"
import { EditAvailabilityDialog } from "@/components/availability/edit-availability-dialog"
import { LayoutGrid, CalendarDays, List, MoreVertical, Copy, Users as UsersGroup, FileText, Download } from "lucide-react"

type DisplayMode = "calendar" | "grid" | "list"

// Color scheme for availability types
const AVAILABILITY_COLORS = {
  working_hours: {
    bg: "bg-green-100",
    border: "border-green-500",
    text: "text-green-800",
    label: "Jam Kerja"
  },
  break: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-800",
    label: "Istirahat"
  },
  blocked: {
    bg: "bg-red-100",
    border: "border-red-500",
    text: "text-red-800",
    label: "Blokir"
  },
  vacation: {
    bg: "bg-[#EDE9FE]",
    border: "border-purple-500",
    text: "text-[#6D28D9]",
    label: "Cuti"
  }
}

export default function AvailabilityCalendarPage() {
  const { toast } = useToast()
  const { staff = [], loading: staffLoading } = useStaff()
  const { treatments = [] } = useTreatments()

  const [displayMode, setDisplayMode] = useState<DisplayMode>("calendar")
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all")
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>("all")
  const [availabilityData, setAvailabilityData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [prefilledData, setPrefilledData] = useState<{
    staffId?: string
    date?: string
    time?: string
  }>({})

  // Calculate date range for week view (always week now)
  const dateRange = useMemo(() => {
    return {
      start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(currentDate, { weekStartsOn: 1 })
    }
  }, [currentDate])

  // Generate days for display
  const displayDays = useMemo(() => {
    const days = []
    let day = dateRange.start
    while (day <= dateRange.end) {
      days.push(day)
      day = addDays(day, 1)
    }
    return days
  }, [dateRange])

  // Filtered staff based on selection
  const filteredStaff = useMemo(() => {
    if (selectedStaffFilter === "all") return staff
    return staff.filter(s => s.id === selectedStaffFilter)
  }, [staff, selectedStaffFilter])

  // Fetch availability data
  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getAvailability({
        start_date: format(dateRange.start, 'yyyy-MM-dd'),
        end_date: format(dateRange.end, 'yyyy-MM-dd'),
        staff_id: selectedStaffFilter !== "all" ? selectedStaffFilter : undefined,
        service_id: selectedServiceFilter !== "all" ? selectedServiceFilter : undefined,
      })

      let entries = Array.isArray(response) ? response : response.items || []

      // Client-side filter for service if backend doesn't support it
      if (selectedServiceFilter !== "all") {
        entries = entries.filter(entry => {
          if (!entry.service_ids || entry.service_ids.length === 0) {
            // If no service_ids, it's available for all services
            return true
          }
          return entry.service_ids.includes(selectedServiceFilter)
        })
      }
      setAvailabilityData(entries)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data ketersediaan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when date range or filters change
  useEffect(() => {
    fetchAvailability()
  }, [dateRange, selectedStaffFilter, selectedServiceFilter])

  // Helper function to split overlapping time ranges
  const splitTimeRanges = (entries: any[]) => {
    if (entries.length === 0) return []

    // Sort entries by start time
    const sorted = [...entries].sort((a, b) => a.start_time.localeCompare(b.start_time))

    // Find working_hours entries
    const workingHours = sorted.filter(e => e.availability_type === 'working_hours')
    const breaks = sorted.filter(e => e.availability_type !== 'working_hours')

    const result: any[] = []

    // For each working_hours entry
    workingHours.forEach(work => {
      const workStart = work.start_time.substring(0, 5)
      const workEnd = work.end_time.substring(0, 5)

      // Find all breaks that overlap with this working hours
      const overlappingBreaks = breaks.filter(brk => {
        const brkStart = brk.start_time.substring(0, 5)
        const brkEnd = brk.end_time.substring(0, 5)
        // Check if break overlaps with working hours
        return brkStart < workEnd && brkEnd > workStart
      }).sort((a, b) => a.start_time.localeCompare(b.start_time))

      if (overlappingBreaks.length === 0) {
        // No breaks, add the whole working hours
        result.push(work)
      } else {
        // Split working hours around breaks
        let currentStart = workStart

        overlappingBreaks.forEach(brk => {
          const brkStart = brk.start_time.substring(0, 5)
          const brkEnd = brk.end_time.substring(0, 5)

          // Add working segment before break (if any)
          if (currentStart < brkStart) {
            result.push({
              ...work,
              id: `${work.id}-split-${currentStart}`,
              start_time: currentStart + work.start_time.substring(5),
              end_time: brkStart + work.end_time.substring(5),
              _isSplit: true,
              _originalEntry: work  // Keep reference to original entry
            })
          }

          // Add the break itself
          result.push(brk)

          // Update current start to after the break
          currentStart = brkEnd
        })

        // Add remaining working segment after last break (if any)
        if (currentStart < workEnd) {
          result.push({
            ...work,
            id: `${work.id}-split-${currentStart}`,
            start_time: currentStart + work.start_time.substring(5),
            end_time: workEnd + work.end_time.substring(5),
            _isSplit: true,
            _originalEntry: work  // Keep reference to original entry
          })
        }
      }
    })

    // Add any standalone breaks/blocked/vacation that don't overlap with working hours
    breaks.forEach(brk => {
      const isOverlapping = workingHours.some(work => {
        const workStart = work.start_time.substring(0, 5)
        const workEnd = work.end_time.substring(0, 5)
        const brkStart = brk.start_time.substring(0, 5)
        const brkEnd = brk.end_time.substring(0, 5)
        return brkStart < workEnd && brkEnd > workStart
      })
      if (!isOverlapping) {
        result.push(brk)
      }
    })

    // Sort final result by start time
    return result.sort((a, b) => a.start_time.localeCompare(b.start_time))
  }

  // Get availability entries for a specific staff and date
  const getEntriesForStaffAndDate = (staffId: string, date: Date) => {
    const entries = availabilityData.filter(entry =>
      entry.staff_id === staffId &&
      isSameDay(new Date(entry.date), date)
    )
    // Apply time range splitting to remove overlaps
    return splitTimeRanges(entries)
  }

  // Navigation functions (always week view)
  const goToPrevious = () => {
    setCurrentDate(subWeeks(currentDate, 1))
  }

  const goToNext = () => {
    setCurrentDate(addWeeks(currentDate, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Open entry detail - use original entry if it's a split segment
  const handleEntryClick = (entry: any) => {
    // If this is a split segment, use the original entry for editing
    const entryToShow = entry._isSplit && entry._originalEntry ? entry._originalEntry : entry
    setSelectedEntry(entryToShow)
    setDetailDialogOpen(true)
  }

  // Delete entry
  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Hapus ketersediaan ini?")) return

    try {
      await apiClient.deleteAvailability(id)
      toast({
        title: "Berhasil",
        description: "Ketersediaan berhasil dihapus",
      })
      fetchAvailability()
      setDetailDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus ketersediaan",
        variant: "destructive",
      })
    }
  }

  // Update existing availability
  const handleUpdateAvailability = async (data: any) => {
    try {
      // Get tenant_id from selected staff
      const selectedStaff = staff.find(s => s.id === data.staff_id)
      let tenantId = selectedStaff?.tenant_id

      // If tenant_id not available from staff, fetch from API
      if (!tenantId) {
        const tenantResponse = await fetch('/api/tenant')
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json()
          tenantId = tenantData.tenant_id
        }
      }

      // Add tenant_id and outlet_id to payload
      const payload = {
        ...data,
        tenant_id: tenantId,
        // is_available: true for working_hours, false for others (break, blocked, vacation)
        is_available: data.availability_type === 'working_hours',
        // Allow overlap for break, blocked, and vacation (they can overlap with working_hours)
        allow_overlap: data.availability_type !== 'working_hours',
      }

      // Add outlet_id if available from staff
      if (selectedStaff?.outlet_id || selectedStaff?.outletId) {
        payload.outlet_id = selectedStaff.outlet_id || selectedStaff.outletId
      }

      await apiClient.updateAvailability(selectedEntry.id, payload)
      toast({
        title: "Berhasil",
        description: "Ketersediaan berhasil diperbarui",
      })
      fetchAvailability()
      setDetailDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui ketersediaan",
        variant: "destructive",
      })
      throw error
    }
  }

  // Save new availability
  const handleSaveNewAvailability = async (data: any) => {
    try {
      // Get tenant_id from selected staff
      const selectedStaff = staff.find(s => s.id === data.staff_id)
      let tenantId = selectedStaff?.tenant_id

      // If tenant_id not available from staff, fetch from API
      if (!tenantId) {
        const tenantResponse = await fetch('/api/tenant')
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json()
          tenantId = tenantData.tenant_id
        }
      }

      // Add tenant_id and outlet_id to payload
      const payload = {
        ...data,
        tenant_id: tenantId,
        // is_available: true for working_hours, false for others (break, blocked, vacation)
        is_available: data.availability_type === 'working_hours',
        // Allow overlap for break, blocked, and vacation (they can overlap with working_hours)
        allow_overlap: data.availability_type !== 'working_hours',
      }

      // Add outlet_id if available from staff
      if (selectedStaff?.outlet_id || selectedStaff?.outletId) {
        payload.outlet_id = selectedStaff.outlet_id || selectedStaff.outletId
      }

      // Debug: Log payload
      console.log('[Availability] Create payload:', JSON.stringify(payload, null, 2))

      await apiClient.createAvailability(payload)
      toast({
        title: "Berhasil",
        description: data.recurrence_type === "none"
          ? "Ketersediaan berhasil ditambahkan"
          : "Ketersediaan recurring berhasil ditambahkan",
      })
      fetchAvailability()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan ketersediaan",
        variant: "destructive",
      })
      throw error
    }
  }

  if (staffLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-screen">
          <GradientLoading />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kalender Ketersediaan</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Lihat jadwal ketersediaan seluruh staff</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Add Button */}
            <Button onClick={() => {
              setPrefilledData({}) // Reset prefilled data
              setAddDialogOpen(true)
            }} className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah
            </Button>

            {/* Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <MoreVertical className="h-4 w-4" />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Copy to next week feature will be available soon",
                  })
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Next Week
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Apply to all staff feature will be available soon",
                  })
                }}>
                  <UsersGroup className="h-4 w-4 mr-2" />
                  Apply to All Staff
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Export feature will be available soon",
                  })
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Info",
                    description: `Total ${availabilityData.length} entries in current view`,
                  })
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  View Summary
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Display Mode Toggle */}
            <Tabs value={displayMode} onValueChange={(v) => setDisplayMode(v as DisplayMode)} className="w-auto">
              <TabsList>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Kalender
                </TabsTrigger>
                <TabsTrigger value="grid" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Week/Month Toggle removed - always use week view */}

        {/* Filters and Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2 w-full lg:w-auto">
                <Button variant="outline" size="sm" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday} className="flex-1 lg:flex-none">
                  Hari Ini
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-sm lg:text-lg font-semibold ml-2 lg:ml-4 hidden lg:block">
                  {`${format(dateRange.start, 'd MMM', { locale: localeId })} - ${format(dateRange.end, 'd MMM yyyy', { locale: localeId })}`}
                </div>
              </div>

              {/* Date Display for Mobile */}
              <div className="text-sm font-semibold lg:hidden w-full text-center">
                {`${format(dateRange.start, 'd MMM', { locale: localeId })} - ${format(dateRange.end, 'd MMM yyyy', { locale: localeId })}`}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedStaffFilter} onValueChange={setSelectedStaffFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Pilih Staff" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Staff</SelectItem>
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.display_name || s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={selectedServiceFilter} onValueChange={setSelectedServiceFilter}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Pilih Layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Layanan</SelectItem>
                      {treatments.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Notes:</span>
              {Object.entries(AVAILABILITY_COLORS).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded border-2", colors.bg, colors.border)} />
                  <span className="text-sm">{colors.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        {displayMode === "calendar" ? (
          /* Calendar View */
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <GradientLoading />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Week View */}
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left font-medium text-sm w-[150px] sticky left-0 bg-muted/50 z-10">
                          Staff
                        </th>
                        {displayDays.map(day => (
                          <th key={day.toISOString()} className={cn(
                            "p-2 text-center font-medium text-sm min-w-[120px]",
                            isToday(day) && "bg-[#EDE9FE]"
                          )}>
                            <div>{format(day, 'EEE', { locale: localeId })}</div>
                            <div className="text-lg">{format(day, 'd')}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff.map(staffMember => (
                        <tr key={staffMember.id} className="border-b hover:bg-muted/20">
                          <td className="p-4 font-medium sticky left-0 bg-background border-r">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] text-sm font-medium">
                                {(staffMember.display_name || staffMember.name).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-medium">{staffMember.display_name || staffMember.name}</div>
                                <div className="text-xs text-muted-foreground">{staffMember.position || staffMember.role}</div>
                              </div>
                            </div>
                          </td>
                          {displayDays.map(day => {
                            const entries = getEntriesForStaffAndDate(staffMember.id, day)
                            return (
                              <td
                                key={day.toISOString()}
                                className={cn(
                                  "p-1 align-top relative group",
                                  isToday(day) && "bg-[#EDE9FE]"
                                )}
                              >
                                {/* Floating Add Button - Always visible on hover */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPrefilledData({
                                      staffId: staffMember.id,
                                      date: format(day, 'yyyy-MM-dd'),
                                      time: "09:00"
                                    })
                                    setAddDialogOpen(true)
                                  }}
                                  className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 shadow-lg"
                                  title="Tambah availability"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>

                                <div className="space-y-1 min-h-[80px] empty-cell-clickable relative">
                                  {/* Entries are already sorted and split by splitTimeRanges */}
                                  {entries.map((entry) => {
                                      const colors = AVAILABILITY_COLORS[entry.availability_type as keyof typeof AVAILABILITY_COLORS]

                                      return (
                                        <div
                                          key={entry.id}
                                          onClick={() => handleEntryClick(entry)}
                                          className={cn(
                                            "p-1.5 rounded border-l-3 cursor-pointer hover:opacity-80 transition-opacity",
                                            colors.bg,
                                            colors.border,
                                            colors.text
                                          )}
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="text-xs font-semibold">
                                              {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                                            </div>
                                            <Badge variant="outline" className={cn("text-[10px] px-1 py-0 whitespace-nowrap", colors.text, colors.border)}>
                                              {colors.label}
                                            </Badge>
                                          </div>
                                          {entry.capacity && entry.capacity > 1 && (
                                            <div className="flex items-center gap-1 text-[10px] mt-0.5">
                                              <Users className="h-3 w-3" />
                                              <span>{entry.current_bookings || 0}/{entry.capacity}</span>
                                            </div>
                                          )}
                                          {entry.notes && (
                                            <div className="text-xs opacity-70 truncate mt-0.5">
                                              {entry.notes}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </CardContent>
        </Card>
        ) : displayMode === "grid" ? (
          /* Multi-Staff Grid View */
          loading ? (
            <div className="flex items-center justify-center py-12">
              <GradientLoading />
            </div>
          ) : (
            <MultiStaffGrid
              staff={filteredStaff}
              date={currentDate}
              availabilityData={availabilityData}
              onEntryClick={(entry) => {
                setSelectedEntry(entry)
                setDetailDialogOpen(true)
              }}
              onAddClick={(staffId, time) => {
                setPrefilledData({
                  staffId: staffId,
                  date: format(currentDate, 'yyyy-MM-dd'),
                  time: time
                })
                setAddDialogOpen(true)
              }}
            />
          )
        ) : (
          /* List View */
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <GradientLoading />
                </div>
              ) : (
                <div className="space-y-3">
                  {availabilityData.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <List className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Tidak ada data ketersediaan untuk periode ini</p>
                    </div>
                  ) : (
                    availabilityData.map((entry) => {
                      const staffData = staff.find(s => s.id === entry.staff_id)
                      const colors = AVAILABILITY_COLORS[entry.availability_type as keyof typeof AVAILABILITY_COLORS]

                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedEntry(entry)
                            setDetailDialogOpen(true)
                          }}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={cn("w-1 h-12 rounded-full", colors.bg, colors.border)} />
                            <div>
                              <div className="font-medium">{staffData?.display_name || staffData?.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(entry.date), 'dd MMM yyyy', { locale: localeId })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <Badge className={cn(colors.bg, colors.text, "mb-1")}>
                                {colors.label}
                              </Badge>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                              </div>
                            </div>

                            {entry.capacity && entry.capacity > 1 && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{entry.current_bookings || 0}/{entry.capacity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Entry Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Detail Ketersediaan</DialogTitle>
            </DialogHeader>
            {selectedEntry && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Staff</Label>
                  <div className="text-base font-medium">
                    {staff.find(s => s.id === selectedEntry.staff_id)?.display_name ||
                     staff.find(s => s.id === selectedEntry.staff_id)?.name}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Tipe</Label>
                  <Badge className={cn(
                    "mt-1",
                    AVAILABILITY_COLORS[selectedEntry.availability_type as keyof typeof AVAILABILITY_COLORS].bg,
                    AVAILABILITY_COLORS[selectedEntry.availability_type as keyof typeof AVAILABILITY_COLORS].text
                  )}>
                    {AVAILABILITY_COLORS[selectedEntry.availability_type as keyof typeof AVAILABILITY_COLORS].label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Tanggal</Label>
                    <div className="text-base">{format(new Date(selectedEntry.date), 'dd MMMM yyyy', { locale: localeId })}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Waktu</Label>
                    <div className="text-base">
                      {selectedEntry.start_time.substring(0, 5)} - {selectedEntry.end_time.substring(0, 5)}
                    </div>
                  </div>
                </div>

                {selectedEntry.recurrence_type !== 'none' && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Pengulangan</Label>
                    <div className="text-base">
                      {selectedEntry.recurrence_type === 'daily' ? 'Harian' :
                       selectedEntry.recurrence_type === 'weekly' ? 'Mingguan' :
                       selectedEntry.recurrence_type === 'monthly' ? 'Bulanan' : '-'}
                      {selectedEntry.recurrence_end_date && ` (sampai ${format(new Date(selectedEntry.recurrence_end_date), 'dd MMM yyyy', { locale: localeId })})`}
                    </div>
                  </div>
                )}

                {selectedEntry.service_ids && selectedEntry.service_ids.length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Layanan Khusus</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {treatments.filter(t => selectedEntry.service_ids.includes(t.id)).map(t => (
                        <Badge key={t.id} variant="outline">{t.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Catatan</Label>
                    <div className="text-sm mt-1 p-2 bg-muted rounded">
                      {selectedEntry.notes}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDetailDialogOpen(false)
                      setEditDialogOpen(true)
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hapus
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Availability Dialog */}
        <AddAvailabilityDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          staff={filteredStaff}
          services={treatments}
          onSave={handleSaveNewAvailability}
          preselectedStaffId={prefilledData.staffId}
          preselectedDate={prefilledData.date}
          preselectedTime={prefilledData.time}
        />

        {/* Edit Availability Dialog */}
        <EditAvailabilityDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          entry={selectedEntry}
          staff={staff}
          services={treatments}
          onSave={handleUpdateAvailability}
        />
      </div>
    </>
  )
}

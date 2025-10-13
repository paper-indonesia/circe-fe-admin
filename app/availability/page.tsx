"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
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
import LiquidLoading from "@/components/ui/liquid-loader"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ViewMode = "week" | "month"

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
    bg: "bg-purple-100",
    border: "border-purple-500",
    text: "text-purple-800",
    label: "Cuti"
  }
}

export default function AvailabilityCalendarPage() {
  const { toast } = useToast()
  const { staff = [], loading: staffLoading } = useStaff()
  const { treatments = [] } = useTreatments()

  const [viewMode, setViewMode] = useState<ViewMode>("week")
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all")
  const [availabilityData, setAvailabilityData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<any>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }), // Monday
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      }
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      }
    }
  }, [currentDate, viewMode])

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
      })

      const entries = Array.isArray(response) ? response : response.items || []
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
  }, [dateRange, selectedStaffFilter])

  // Get availability entries for a specific staff and date
  const getEntriesForStaffAndDate = (staffId: string, date: Date) => {
    return availabilityData.filter(entry =>
      entry.staff_id === staffId &&
      isSameDay(new Date(entry.date), date)
    )
  }

  // Navigation functions
  const goToPrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(subMonths(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addMonths(currentDate, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Open entry detail
  const handleEntryClick = (entry: any) => {
    setSelectedEntry(entry)
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

  if (staffLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kalender Ketersediaan</h1>
            <p className="text-muted-foreground">Lihat jadwal ketersediaan seluruh staff</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              onClick={() => setViewMode("week")}
              className={viewMode === "week" ? "bg-purple-600" : ""}
            >
              Minggu
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              onClick={() => setViewMode("month")}
              className={viewMode === "month" ? "bg-purple-600" : ""}
            >
              Bulan
            </Button>
          </div>
        </div>

        {/* Filters and Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Hari Ini
                </Button>
                <Button variant="outline" size="sm" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-lg font-semibold ml-4">
                  {viewMode === "week" ? (
                    `${format(dateRange.start, 'd MMM', { locale: localeId })} - ${format(dateRange.end, 'd MMM yyyy', { locale: localeId })}`
                  ) : (
                    format(currentDate, 'MMMM yyyy', { locale: localeId })
                  )}
                </div>
              </div>

              {/* Staff Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedStaffFilter} onValueChange={setSelectedStaffFilter}>
                  <SelectTrigger className="w-[200px]">
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
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-muted-foreground">Legenda:</span>
              {Object.entries(AVAILABILITY_COLORS).map(([type, colors]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={cn("w-4 h-4 rounded border-2", colors.bg, colors.border)} />
                  <span className="text-sm">{colors.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LiquidLoading />
              </div>
            ) : (
              <div className="overflow-x-auto">
                {viewMode === "week" ? (
                  /* Week View */
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-4 text-left font-medium text-sm w-[150px] sticky left-0 bg-muted/50 z-10">
                          Staff
                        </th>
                        {displayDays.map(day => (
                          <th key={day.toISOString()} className={cn(
                            "p-2 text-center font-medium text-sm min-w-[120px]",
                            isToday(day) && "bg-purple-50"
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
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-medium">
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
                              <td key={day.toISOString()} className={cn(
                                "p-1 align-top",
                                isToday(day) && "bg-purple-50"
                              )}>
                                <div className="space-y-1 min-h-[80px]">
                                  {entries.map(entry => {
                                    const colors = AVAILABILITY_COLORS[entry.availability_type as keyof typeof AVAILABILITY_COLORS]
                                    return (
                                      <div
                                        key={entry.id}
                                        onClick={() => handleEntryClick(entry)}
                                        className={cn(
                                          "p-1.5 rounded border-l-2 cursor-pointer hover:opacity-80 transition-opacity",
                                          colors.bg,
                                          colors.border,
                                          colors.text
                                        )}
                                      >
                                        <div className="text-xs font-medium">
                                          {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                                        </div>
                                        {entry.notes && (
                                          <div className="text-xs opacity-70 truncate">
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
                ) : (
                  /* Month View - Simplified */
                  <div className="p-4">
                    <div className="text-center text-muted-foreground py-8">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Tampilan bulan - Pilih tampilan minggu untuk detail lebih lanjut</p>
                      <p className="text-sm mt-2">Total {availabilityData.length} entri ketersediaan</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
                      // Navigate to staff page to edit
                      window.location.href = `/staff`
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
      </div>
    </MainLayout>
  )
}

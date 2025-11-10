"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Repeat, CalendarDays, Users, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AvailabilityMode = "single" | "recurring"
type AvailabilityType = "working_hours" | "break" | "blocked" | "vacation"
type RecurrenceType = "daily" | "weekly" | "monthly"

interface AddAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: any[]
  services: any[]
  onSave: (data: any) => Promise<void>
  preselectedStaffId?: string
  preselectedDate?: string
  preselectedTime?: string
}

const AVAILABILITY_TYPE_CONFIG = {
  working_hours: {
    label: "Jam Kerja",
    icon: Clock,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  break: {
    label: "Istirahat",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  blocked: {
    label: "Blokir",
    icon: CalendarDays,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  vacation: {
    label: "Cuti",
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  }
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Min" },
  { value: 1, label: "Sen" },
  { value: 2, label: "Sel" },
  { value: 3, label: "Rab" },
  { value: 4, label: "Kam" },
  { value: 5, label: "Jum" },
  { value: 6, label: "Sab" },
]

export function AddAvailabilityDialog({
  open,
  onOpenChange,
  staff,
  services,
  onSave,
  preselectedStaffId,
  preselectedDate,
  preselectedTime
}: AddAvailabilityDialogProps) {
  const [mode, setMode] = useState<AvailabilityMode>("single")
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    staff_id: preselectedStaffId || "",
    date: preselectedDate || new Date().toISOString().split('T')[0],
    start_time: preselectedTime || "09:00",
    end_time: "17:00",
    availability_type: "working_hours" as AvailabilityType,
    notes: "",
    service_ids: [] as string[],
    is_group_service: false,
    capacity: 1,
    // Recurring fields
    recurrence_type: "weekly" as RecurrenceType,
    recurrence_days: [] as number[],
    recurrence_end_date: "",
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Get default staff
      const defaultStaffId = preselectedStaffId || ""
      const defaultStaff = staff.find(s => s.id === defaultStaffId)

      // Get staff's assigned services from skills.service_ids
      const defaultServiceIds = defaultStaff?.skills?.service_ids || []

      setFormData({
        staff_id: defaultStaffId,
        date: preselectedDate || new Date().toISOString().split('T')[0],
        start_time: preselectedTime || "09:00",
        end_time: "17:00",
        availability_type: "working_hours",
        notes: "",
        service_ids: defaultServiceIds,
        is_group_service: false,
        capacity: 1,
        recurrence_type: "weekly",
        recurrence_days: [],
        recurrence_end_date: "",
      })
      setMode("single")
    }
  }, [open, preselectedStaffId, preselectedDate, preselectedTime, staff])

  // Update service_ids when staff changes
  useEffect(() => {
    if (formData.staff_id) {
      const selectedStaff = staff.find(s => s.id === formData.staff_id)
      if (selectedStaff?.skills?.service_ids && selectedStaff.skills.service_ids.length > 0) {
        // Auto-select all staff's assigned services
        setFormData(prev => ({
          ...prev,
          service_ids: selectedStaff.skills.service_ids
        }))
      }
    }
  }, [formData.staff_id, staff])

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate required fields
      if (!formData.staff_id) {
        throw new Error("Pilih staff terlebih dahulu")
      }

      if (!formData.service_ids || formData.service_ids.length === 0) {
        throw new Error("Pilih minimal satu layanan")
      }

      if (mode === "recurring" && formData.recurrence_days.length === 0 && formData.recurrence_type === "weekly") {
        throw new Error("Pilih minimal satu hari untuk recurring weekly")
      }

      // Prepare data based on mode
      const dataToSave = {
        staff_id: formData.staff_id,
        availability_type: formData.availability_type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        notes: formData.notes,
        service_ids: formData.service_ids,
        capacity: formData.is_group_service ? formData.capacity : 1,
        is_group_service: formData.is_group_service,
        ...(mode === "single"
          ? {
              date: formData.date,
              recurrence_type: "none"
            }
          : {
              date: formData.date, // Start date for recurring
              recurrence_type: formData.recurrence_type,
              recurrence_days: formData.recurrence_type === "weekly" ? formData.recurrence_days : undefined,
              recurrence_end_date: formData.recurrence_end_date || undefined,
            }
        )
      }

      await onSave(dataToSave)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving availability:", error)
      alert(error.message || "Gagal menyimpan availability")
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day].sort()
    }))
  }

  const selectedStaff = staff.find(s => s.id === formData.staff_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Tambah Ketersediaan Baru
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Selection */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as AvailabilityMode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Single
              </TabsTrigger>
              <TabsTrigger value="recurring" className="flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Recurring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">
                Buat ketersediaan untuk tanggal tertentu saja
              </p>
            </TabsContent>

            <TabsContent value="recurring" className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">
                Buat ketersediaan berulang (harian, mingguan, atau bulanan)
              </p>
            </TabsContent>
          </Tabs>

          {/* Staff Selection */}
          <div className="space-y-2">
            <Label htmlFor="staff">Staff <span className="text-red-500">*</span></Label>
            <Select value={formData.staff_id} onValueChange={(v) => setFormData(prev => ({ ...prev, staff_id: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih staff..." />
              </SelectTrigger>
              <SelectContent>
                {staff.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.display_name || s.name} {s.role && `- ${s.role}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Availability Type */}
          <div className="space-y-2">
            <Label>Tipe Ketersediaan <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(AVAILABILITY_TYPE_CONFIG).map(([key, config]) => {
                const Icon = config.icon
                const isSelected = formData.availability_type === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, availability_type: key as AvailabilityType }))}
                    className={cn(
                      "p-3 rounded-lg border-2 transition-all text-left",
                      isSelected
                        ? `${config.bgColor} ${config.borderColor} ${config.color}`
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", isSelected ? config.color : "text-gray-400")} />
                      <span className="font-medium text-sm">{config.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                {mode === "single" ? "Tanggal" : "Tanggal Mulai"} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {mode === "recurring" && (
              <div className="space-y-2">
                <Label htmlFor="end_date">Tanggal Berakhir</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrence_end_date: e.target.value }))}
                  min={formData.date}
                />
                <p className="text-xs text-gray-500">Kosongkan untuk tanpa batas</p>
              </div>
            )}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Waktu Mulai <span className="text-red-500">*</span></Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">Waktu Selesai <span className="text-red-500">*</span></Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              />
            </div>
          </div>

          {/* Recurring Options */}
          {mode === "recurring" && (
            <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <Label htmlFor="recurrence_type">Pola Pengulangan <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.recurrence_type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, recurrence_type: v as RecurrenceType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Harian (Setiap Hari)</SelectItem>
                    <SelectItem value="weekly">Mingguan (Hari Tertentu)</SelectItem>
                    <SelectItem value="monthly">Bulanan (Tanggal yang Sama)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recurrence_type === "weekly" && (
                <div className="space-y-2">
                  <Label>Hari-hari <span className="text-red-500">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          formData.recurrence_days.includes(day.value)
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-blue-300"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {formData.recurrence_days.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      {formData.recurrence_days.length} hari dipilih
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <Label className="text-base font-semibold">
              Layanan <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600">
              {selectedStaff
                ? `Pilih layanan untuk ${selectedStaff.display_name || selectedStaff.name}`
                : "Pilih staff terlebih dahulu untuk melihat layanan yang tersedia"
              }
            </p>

            {formData.staff_id ? (
              <div className="space-y-3 mt-3">
                {(() => {
                  // Filter services based on staff's assigned service_ids in skills
                  const staffServices = selectedStaff?.skills?.service_ids || []
                  const availableServices = services.filter(s => staffServices.includes(s.id))

                  if (availableServices.length === 0) {
                    return (
                      <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                        Staff ini belum memiliki layanan yang di-assign.
                        Silakan assign layanan di halaman Staff terlebih dahulu.
                      </div>
                    )
                  }

                  return availableServices.map(service => (
                    <div
                      key={service.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                        formData.service_ids.includes(service.id)
                          ? "bg-blue-100 border-blue-500"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      )}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          service_ids: prev.service_ids.includes(service.id)
                            ? prev.service_ids.filter(id => id !== service.id)
                            : [...prev.service_ids, service.id]
                        }))
                      }}
                    >
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={formData.service_ids.includes(service.id)}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            service_ids: checked
                              ? [...prev.service_ids, service.id]
                              : prev.service_ids.filter(id => id !== service.id)
                          }))
                        }}
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`service-${service.id}`}
                        className="font-medium cursor-pointer flex-1"
                      >
                        {service.name}
                      </Label>
                      {formData.service_ids.includes(service.id) && (
                        <Badge variant="secondary" className="bg-blue-600 text-white">
                          Dipilih
                        </Badge>
                      )}
                    </div>
                  ))
                })()}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded border border-gray-200">
                Pilih staff di atas untuk melihat layanan yang tersedia
              </div>
            )}
          </div>

          {/* Group Service Option */}
          {formData.availability_type === "working_hours" && (
            <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
              <div className="flex items-center space-x-3 p-2 rounded hover:bg-green-100/50 transition-colors">
                <Checkbox
                  id="is_group_service"
                  checked={formData.is_group_service}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      is_group_service: checked as boolean,
                      capacity: checked ? 5 : 1
                    }))
                  }
                  className="h-5 w-5 border-2 border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label htmlFor="is_group_service" className="font-semibold text-base flex items-center gap-2 cursor-pointer text-green-800">
                  <Users className="h-5 w-5 text-green-600" />
                  Layanan Grup/Kelas
                </Label>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                Aktifkan untuk layanan yang bisa melayani multiple klien sekaligus
              </p>

              {formData.is_group_service && (
                <div className="ml-6 mt-3">
                  <Label htmlFor="capacity">Kapasitas Maksimal</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData(prev => ({
                          ...prev,
                          capacity: parseInt(e.target.value) || 1
                        }))
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">klien per slot</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              placeholder="Tambahkan catatan jika diperlukan..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

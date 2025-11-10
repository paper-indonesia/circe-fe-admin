"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, Users, Sparkles, CalendarDays, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type AvailabilityType = "working_hours" | "break" | "blocked" | "vacation"

interface EditAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: any
  staff: any[]
  services: any[]
  onSave: (data: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
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

export function EditAvailabilityDialog({
  open,
  onOpenChange,
  entry,
  staff,
  services,
  onSave,
  onDelete
}: EditAvailabilityDialogProps) {
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    staff_id: "",
    date: "",
    start_time: "",
    end_time: "",
    availability_type: "working_hours" as AvailabilityType,
    notes: "",
    service_ids: [] as string[],
    is_group_service: false,
    capacity: 1,
  })

  // Load entry data when dialog opens
  useEffect(() => {
    if (open && entry) {
      setFormData({
        staff_id: entry.staff_id || "",
        date: entry.date || "",
        start_time: entry.start_time?.substring(0, 5) || "09:00",
        end_time: entry.end_time?.substring(0, 5) || "17:00",
        availability_type: entry.availability_type || "working_hours",
        notes: entry.notes || "",
        service_ids: entry.service_ids || [],
        is_group_service: entry.is_group_service || false,
        capacity: entry.capacity || 1,
      })
    }
  }, [open, entry])

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

      const dataToSave = {
        staff_id: formData.staff_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        availability_type: formData.availability_type,
        notes: formData.notes,
        service_ids: formData.service_ids,
        capacity: formData.is_group_service ? formData.capacity : 1,
        is_group_service: formData.is_group_service,
        recurrence_type: entry.recurrence_type || "none",
      }

      await onSave(dataToSave)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error updating availability:", error)
      alert(error.message || "Gagal memperbarui availability")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    if (!confirm("Hapus ketersediaan ini?")) return

    try {
      setDeleting(true)
      await onDelete(entry.id)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error deleting availability:", error)
      alert(error.message || "Gagal menghapus availability")
    } finally {
      setDeleting(false)
    }
  }

  const selectedStaff = staff.find(s => s.id === formData.staff_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Edit Ketersediaan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Staff Selection (Read-only for edit) */}
          <div className="space-y-2">
            <Label htmlFor="staff">Staff <span className="text-red-500">*</span></Label>
            <Input
              value={selectedStaff?.display_name || selectedStaff?.name || ""}
              disabled
              className="bg-muted"
            />
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
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

          {/* Service Selection */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <Label className="text-base font-semibold">
              Layanan <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600">
              {selectedStaff
                ? `Pilih layanan untuk ${selectedStaff.display_name || selectedStaff.name}`
                : "Staff tidak ditemukan"
              }
            </p>

            <div className="space-y-3 mt-3">
              {(() => {
                // Filter services based on staff's assigned service_ids in skills
                const staffServices = selectedStaff?.skills?.service_ids || []
                const availableServices = services.filter(s => staffServices.includes(s.id))

                if (availableServices.length === 0) {
                  return (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                      Staff ini belum memiliki layanan yang di-assign.
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

        <DialogFooter className="flex justify-between">
          <div className="flex-1">
            {onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Menghapus..." : "Hapus"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving || deleting}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving || deleting}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

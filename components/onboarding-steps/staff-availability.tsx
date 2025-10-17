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
import { UserCog, Plus, AlertCircle, CheckCircle2, Info, ArrowUpCircle, Calendar, Clock } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"

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

export function StaffAvailabilityStep({ onValidChange }: StaffAvailabilityStepProps) {
  const { toast } = useToast()
  const { progress, addStaff, addAvailability } = useOperationalOnboarding()

  const [currentTab, setCurrentTab] = useState<'staff' | 'availability'>('staff')
  const [staffForm, setStaffForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    position: "Therapist",
    service_ids: [] as string[],
  })

  const [availabilityForm, setAvailabilityForm] = useState({
    staff_id: "",
    outlet_id: progress.outlets[0]?.id || "",
    start_time: "09:00",
    end_time: "17:00",
    recurrence_days: [] as number[],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [planLimits, setPlanLimits] = useState<{ current: number; max: number } | null>(null)

  // Load plan limits
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const [subResponse, usageResponse] = await Promise.all([
          fetch("/api/subscription"),
          fetch("/api/subscription/usage"),
        ])

        if (subResponse.ok && usageResponse.ok) {
          const subData = await subResponse.json()
          const usageData = await usageResponse.json()

          setPlanLimits({
            current: usageData.staff?.used || 0,
            max: subData.plan?.limits?.max_staff || 999,
          })
        }
      } catch (error) {
        console.error("Failed to fetch plan limits:", error)
      }
    }

    fetchLimits()
  }, [progress.staff.length])

  // Update parent validation state
  useEffect(() => {
    const hasStaff = progress.staff.length > 0
    const hasAvailability = progress.availabilities.length > 0
    onValidChange(hasStaff && hasAvailability)
  }, [progress.staff, progress.availabilities, onValidChange])

  // Update outlet_id when outlets change
  useEffect(() => {
    if (progress.outlets[0]?.id && !availabilityForm.outlet_id) {
      setAvailabilityForm((prev) => ({
        ...prev,
        outlet_id: progress.outlets[0].id!,
      }))
    }
  }, [progress.outlets, availabilityForm.outlet_id])

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
          email: staffForm.email.trim(),
          phone: staffForm.phone.trim() || undefined,
          position: staffForm.position,
          is_bookable: true,
          accepts_online_booking: true,
          is_active: true,
          status: "active",
          skills: {
            service_ids: staffForm.service_ids,
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
          email: "",
          phone: "",
          position: "Therapist",
          service_ids: [],
        })
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
      // Create availability for each selected day
      const today = new Date()
      const availabilityPromises = availabilityForm.recurrence_days.map(async (day) => {
        const response = await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            staff_id: availabilityForm.staff_id,
            outlet_id: availabilityForm.outlet_id,
            date: today.toISOString().split('T')[0],
            start_time: availabilityForm.start_time + ":00",
            end_time: availabilityForm.end_time + ":00",
            availability_type: "working_hours",
            recurrence_type: "weekly",
            recurrence_days: [day],
            is_available: true,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create availability")
        }

        return response.json()
      })

      await Promise.all(availabilityPromises)

      addAvailability({
        staff_id: availabilityForm.staff_id,
        outlet_id: availabilityForm.outlet_id,
        date: today.toISOString().split('T')[0],
        start_time: availabilityForm.start_time + ":00",
        end_time: availabilityForm.end_time + ":00",
        recurrence_type: "weekly",
        recurrence_days: availabilityForm.recurrence_days,
      })

      toast({
        title: "Berhasil",
        description: "Jadwal ketersediaan berhasil ditambahkan",
      })

      // Reset form
      setAvailabilityForm({
        staff_id: "",
        outlet_id: progress.outlets[0]?.id || "",
        start_time: "09:00",
        end_time: "17:00",
        recurrence_days: [],
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
              <Label htmlFor="staff_phone">Nomor Telepon</Label>
              <Input
                id="staff_phone"
                placeholder="+62 812 3456 7890"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Posisi</Label>
              <Input
                id="position"
                placeholder="Therapist, Beautician, dll"
                value={staffForm.position}
                onChange={(e) => setStaffForm({ ...staffForm, position: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Layanan yang Dikuasai</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50">
                {progress.products.length > 0 ? (
                  progress.products.map((product) => (
                    <label key={product.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={staffForm.service_ids.includes(product.id!)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setStaffForm({
                              ...staffForm,
                              service_ids: [...staffForm.service_ids, product.id!],
                            })
                          } else {
                            setStaffForm({
                              ...staffForm,
                              service_ids: staffForm.service_ids.filter((id) => id !== product.id),
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{product.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">Belum ada layanan tersedia</p>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddStaff}
            disabled={loading || !canAddMoreStaff}
            className="mt-6 w-full md:w-auto"
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
              <select
                id="select_staff"
                value={availabilityForm.staff_id}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, staff_id: e.target.value })}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${errors.staff_id ? "border-red-500" : ""}`}
              >
                <option value="">-- Pilih Staff --</option>
                {progress.staff.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </option>
                ))}
              </select>
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

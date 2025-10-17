"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Building2, Plus, Trash2, AlertCircle, CheckCircle2, Info, ArrowUpCircle } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"

interface OutletSetupStepProps {
  onValidChange: (isValid: boolean) => void
}

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB - Waktu Indonesia Barat" },
  { value: "Asia/Makassar", label: "WITA - Waktu Indonesia Tengah" },
  { value: "Asia/Jayapura", label: "WIT - Waktu Indonesia Timur" },
]

export function OutletSetupStep({ onValidChange }: OutletSetupStepProps) {
  const { toast } = useToast()
  const { progress, addOutlet } = useOperationalOnboarding()

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    timezone: "Asia/Jakarta",
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
            current: usageData.outlets?.used || 0,
            max: subData.plan?.limits?.max_outlets || 999,
          })
        }
      } catch (error) {
        console.error("Failed to fetch plan limits:", error)
      }
    }

    fetchLimits()
  }, [progress.outlets.length])

  // Update parent validation state
  useEffect(() => {
    onValidChange(progress.outlets.length > 0)
  }, [progress.outlets, onValidChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama outlet wajib diisi"
    }
    if (!formData.address.trim()) {
      newErrors.address = "Alamat wajib diisi"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi"
    } else if (!/^[\d\s\-\+()]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return

    // Check plan limits
    if (planLimits && progress.outlets.length >= planLimits.max) {
      toast({
        title: "Limit Tercapai",
        description: `Plan Anda hanya mendukung maksimal ${planLimits.max} outlet. Upgrade untuk menambah lebih banyak.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/outlets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          timezone: formData.timezone,
          is_active: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addOutlet({
          id: data._id || data.id,
          name: formData.name.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          timezone: formData.timezone,
        })

        toast({
          title: "Berhasil",
          description: "Outlet berhasil ditambahkan",
        })

        // Reset form
        setFormData({
          name: "",
          address: "",
          phone: "",
          timezone: "Asia/Jakarta",
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal menambahkan outlet")
      }
    } catch (error: any) {
      console.error("Failed to add outlet:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan outlet",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canAddMore = !planLimits || progress.outlets.length < planLimits.max

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
                Buat minimal 1 outlet untuk mendefinisikan lokasi layanan Anda. Outlet ini akan menjadi dasar untuk penjadwalan dan booking.
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
                Outlet menentukan lokasi, zona waktu, jam operasional, dan menjadi basis untuk perhitungan pajak serta penjadwalan staff.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Plan Limits Info */}
      {planLimits && (
        <Alert className={canAddMore ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <AlertCircle className={canAddMore ? "h-4 w-4 text-green-600" : "h-4 w-4 text-orange-600"} />
          <AlertDescription className={canAddMore ? "text-green-800" : "text-orange-800"}>
            Plan Anda: {progress.outlets.length} / {planLimits.max} outlet terpakai
            {!canAddMore && (
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

      {/* Form */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold">Tambah Outlet Baru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Outlet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Cabang Jakarta Pusat"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Nomor Telepon <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="Contoh: +62 21 1234 5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">
              Alamat <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              placeholder="Contoh: Jl. Sudirman No. 123, Jakarta Pusat"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Zona Waktu</Label>
            <select
              id="timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleAdd}
          disabled={loading || !canAddMore}
          className="mt-6 w-full md:w-auto"
        >
          {loading ? (
            "Menambahkan..."
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Outlet
            </>
          )}
        </Button>
      </Card>

      {/* Outlet List */}
      {progress.outlets.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Outlet yang Ditambahkan</h3>
            <Badge variant="secondary">{progress.outlets.length} outlet</Badge>
          </div>

          <div className="space-y-3">
            {progress.outlets.map((outlet, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{outlet.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{outlet.address}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-500">{outlet.phone}</p>
                      <Badge variant="outline" className="text-xs">
                        {TIMEZONES.find(tz => tz.value === outlet.timezone)?.label || outlet.timezone}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-8 border-2 border-dashed border-gray-300">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Belum ada outlet yang ditambahkan. Tambahkan minimal 1 outlet untuk melanjutkan.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

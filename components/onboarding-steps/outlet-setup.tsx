"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Building2, Plus, Trash2, AlertCircle, CheckCircle2, Info, ArrowUpCircle, ChevronDown } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { useSubscription } from "@/lib/subscription-context"
import { motion, AnimatePresence } from "framer-motion"

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
  const { usage } = useSubscription()

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "ID"
    },
    contact: {
      phone: "",
      email: ""
    },
    status: "active",
    settings: {
      timezone: "Asia/Jakarta"
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [planLimits, setPlanLimits] = useState<{ current: number; max: number } | null>(null)
  const [showOutletList, setShowOutletList] = useState(true)

  // Load plan limits from subscription context
  useEffect(() => {
    if (usage?.usage_summary?.outlets) {
      setPlanLimits({
        current: usage.usage_summary.outlets.used || 0,
        max: usage.usage_summary.outlets.limit || 999,
      })
    }
  }, [usage])

  // Update parent validation state
  useEffect(() => {
    const isValid = progress.outlets.length > 0
    console.log('[OutletSetup] Validation check:', {
      outletsCount: progress.outlets.length,
      isValid,
      outlets: progress.outlets
    })
    onValidChange(isValid)
  }, [progress.outlets.length, onValidChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama outlet wajib diisi"
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug wajib diisi"
    }
    if (!formData.address.street.trim()) {
      newErrors.street = "Alamat wajib diisi"
    }
    if (!formData.address.city.trim()) {
      newErrors.city = "Kota wajib diisi"
    }
    if (!formData.contact.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi"
    } else if (!/^\+?[\d\s\-()]+$/.test(formData.contact.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
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

    // Get tenant_id from localStorage
    const tenantData = localStorage.getItem('tenant')
    let tenantId = null
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData)
        tenantId = tenant.id
      } catch (e) {
        console.error('Failed to parse tenant:', e)
      }
    }

    if (!tenantId) {
      toast({
        title: "Error",
        description: "Tenant information not found. Please sign in again.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const outletData = {
        tenant_id: tenantId,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim() || formData.address.city.trim(),
          postal_code: formData.address.postal_code.trim() || "00000",
          country: formData.address.country
        },
        contact: {
          phone: formData.contact.phone.trim(),
          ...(formData.contact.email?.trim() && { email: formData.contact.email.trim() })
        },
        status: formData.status,
        settings: {
          timezone: formData.settings.timezone
        }
      }

      const response = await fetch("/api/outlets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outletData),
      })

      if (response.ok) {
        const data = await response.json()
        addOutlet({
          id: data._id || data.id,
          name: formData.name.trim(),
          address: `${formData.address.street}, ${formData.address.city}`,
          phone: formData.contact.phone.trim(),
          timezone: formData.settings.timezone,
        })

        toast({
          title: "Berhasil",
          description: "Outlet berhasil ditambahkan",
        })

        // Reset form
        setFormData({
          name: "",
          slug: "",
          address: {
            street: "",
            city: "",
            state: "",
            postal_code: "",
            country: "ID"
          },
          contact: {
            phone: "",
            email: ""
          },
          status: "active",
          settings: {
            timezone: "Asia/Jakarta"
          }
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
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Info Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-full">
        <Card className="p-5 border-blue-200 bg-blue-50 min-h-[130px] flex max-w-full">
          <div className="flex items-start gap-3 min-w-0 w-full">
            <div className="bg-blue-100 rounded-lg p-2 flex-shrink-0">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-900 mb-2 truncate">Apa yang harus dilakukan</h3>
              <p className="text-sm text-blue-700 leading-relaxed break-words">
                Buat minimal 1 outlet untuk mendefinisikan lokasi layanan Anda. Outlet ini akan menjadi dasar untuk penjadwalan dan booking.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-purple-200 bg-purple-50 min-h-[130px] flex max-w-full">
          <div className="flex items-start gap-3 min-w-0 w-full">
            <div className="bg-purple-100 rounded-lg p-2 flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-purple-900 mb-2 truncate">Kenapa ini penting</h3>
              <p className="text-sm text-purple-700 leading-relaxed break-words">
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
      <Card className="p-6 rounded-xl max-w-full overflow-x-hidden">
        <div className="flex items-center gap-3 mb-6 min-w-0">
          <Building2 className="h-6 w-6 text-gray-600 flex-shrink-0" />
          <h3 className="text-lg font-semibold truncate">Tambah Outlet Baru</h3>
        </div>

        <div className="grid grid-cols-12 gap-4 max-w-full">
          {/* Nama Outlet - 6 cols */}
          <div className="col-span-12 lg:col-span-6 space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nama Outlet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Cabang Jakarta Pusat"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value
                setFormData({
                  ...formData,
                  name: newName,
                  slug: generateSlug(newName)
                })
              }}
              className={`h-11 rounded-lg ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Slug - 6 cols (auto-generated) */}
          <div className="col-span-12 lg:col-span-6 space-y-2">
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              placeholder="cabang-jakarta-pusat"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className={`h-11 rounded-lg font-mono text-sm ${errors.slug ? "border-red-500" : ""}`}
            />
            {errors.slug ? (
              <p className="text-xs text-red-500 mt-1">{errors.slug}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">URL identifier (auto-generated)</p>
            )}
          </div>

          {/* Alamat - 12 cols (full width) */}
          <div className="col-span-12 space-y-2">
            <Label htmlFor="street" className="text-sm font-medium">
              Alamat Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              placeholder="Contoh: Jl. Sudirman No. 123"
              value={formData.address.street}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
              className={`h-11 rounded-lg ${errors.street ? "border-red-500" : ""}`}
            />
            {errors.street && (
              <p className="text-xs text-red-500 mt-1">{errors.street}</p>
            )}
          </div>

          {/* Kota - 6 cols */}
          <div className="col-span-12 lg:col-span-6 space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              Kota <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Jakarta"
              value={formData.address.city}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              className={`h-11 rounded-lg ${errors.city ? "border-red-500" : ""}`}
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          {/* Nomor Telepon - 6 cols */}
          <div className="col-span-12 lg:col-span-6 space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Nomor Telepon <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg text-gray-600 font-medium h-11">
                +62
              </div>
              <Input
                id="phone"
                placeholder="81xxxxxxxxx"
                value={formData.contact.phone.startsWith('+62') ? formData.contact.phone.slice(3) : formData.contact.phone}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, contact: { ...formData.contact, phone: input ? `+62${input}` : '' } })
                }}
                className={`h-11 rounded-lg flex-1 ${errors.phone ? "border-red-500" : ""}`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Zona Waktu - 6 cols */}
          <div className="col-span-12 lg:col-span-6 space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium">Zona Waktu</Label>
            <select
              id="timezone"
              value={formData.settings.timezone}
              onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, timezone: e.target.value } })}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      {/* Outlet List - Collapsible */}
      {progress.outlets.length > 0 && (
        <Card className="overflow-hidden rounded-xl max-w-full">
          <button
            onClick={() => setShowOutletList(!showOutletList)}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-t-xl"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Building2 className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">Outlet yang Ditambahkan</h3>
              <Badge variant="secondary" className="ml-2 flex-shrink-0">{progress.outlets.length} outlet</Badge>
            </div>
            <motion.div
              animate={{ rotate: showOutletList ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 ml-2"
            >
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {showOutletList && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden overflow-x-hidden"
              >
                <div className="px-5 pb-5 space-y-3 border-t max-w-full">
                  {progress.outlets.map((outlet, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-md transition-shadow mt-3 first:mt-3 max-w-full min-w-0"
                    >
                      <div className="bg-blue-500 rounded-lg p-2 flex-shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="font-semibold text-gray-900 truncate">{outlet.name}</h4>
                        <p className="text-sm text-gray-600 mt-1 truncate">{outlet.address}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                            <span className="font-medium flex-shrink-0">📞</span> <span className="truncate">{outlet.phone}</span>
                          </p>
                          <Badge variant="outline" className="text-xs bg-white flex-shrink-0 truncate max-w-[200px]">
                            {TIMEZONES.find(tz => tz.value === outlet.timezone)?.label || outlet.timezone}
                          </Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}

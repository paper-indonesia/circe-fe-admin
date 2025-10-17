"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Package, Plus, AlertCircle, CheckCircle2, Info, ArrowUpCircle, Clock, DollarSign } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"

interface ProductServicesStepProps {
  onValidChange: (isValid: boolean) => void
}

const DEFAULT_CATEGORIES = [
  "Perawatan Wajah",
  "Perawatan Tubuh",
  "Perawatan Rambut",
  "Spa & Massage",
  "Konsultasi",
]

export function ProductServicesStep({ onValidChange }: ProductServicesStepProps) {
  const { toast } = useToast()
  const { progress, addProduct } = useOperationalOnboarding()

  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: 60,
    price: 0,
    category: DEFAULT_CATEGORIES[0],
    description: "",
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
            current: usageData.services?.used || 0,
            max: subData.plan?.limits?.max_services || 999,
          })
        }
      } catch (error) {
        console.error("Failed to fetch plan limits:", error)
      }
    }

    fetchLimits()
  }, [progress.products.length])

  // Update parent validation state
  useEffect(() => {
    onValidChange(progress.products.length > 0)
  }, [progress.products, onValidChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama layanan wajib diisi"
    }
    if (formData.duration_minutes <= 0) {
      newErrors.duration_minutes = "Durasi harus lebih dari 0"
    }
    if (formData.price <= 0) {
      newErrors.price = "Harga harus lebih dari 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return

    // Check plan limits
    if (planLimits && progress.products.length >= planLimits.max) {
      toast({
        title: "Limit Tercapai",
        description: `Plan Anda hanya mendukung maksimal ${planLimits.max} layanan. Upgrade untuk menambah lebih banyak.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.name.trim().toLowerCase().replace(/\s+/g, '-'),
          duration_minutes: formData.duration_minutes,
          price: formData.price,
          category: formData.category,
          description: formData.description.trim() || undefined,
          currency: "IDR",
          is_active: true,
          status: "active",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addProduct({
          id: data._id || data.id,
          name: formData.name.trim(),
          duration_minutes: formData.duration_minutes,
          price: formData.price,
          category: formData.category,
          description: formData.description.trim() || undefined,
        })

        toast({
          title: "Berhasil",
          description: "Layanan berhasil ditambahkan",
        })

        // Reset form
        setFormData({
          name: "",
          duration_minutes: 60,
          price: 0,
          category: DEFAULT_CATEGORIES[0],
          description: "",
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal menambahkan layanan")
      }
    } catch (error: any) {
      console.error("Failed to add service:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan layanan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const canAddMore = !planLimits || progress.products.length < planLimits.max

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
                Tambahkan layanan atau produk yang bisa dibooking oleh customer. Minimal 1 layanan untuk memulai.
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
                Layanan menjadi item yang dijadwalkan dan ditagihkan. Data ini menentukan durasi booking dan perhitungan revenue.
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
            Plan Anda: {progress.products.length} / {planLimits.max} layanan terpakai
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
          <Package className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold">Tambah Layanan Baru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">
              Nama Layanan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Contoh: Facial Treatment Premium"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">
              Durasi (menit) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="60"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                className={`pl-10 ${errors.duration_minutes ? "border-red-500" : ""}`}
              />
            </div>
            {errors.duration_minutes && (
              <p className="text-xs text-red-500">{errors.duration_minutes}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Harga (IDR) <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                min="0"
                step="1000"
                placeholder="150000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {DEFAULT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Deskripsi (opsional)</Label>
            <Textarea
              id="description"
              placeholder="Jelaskan layanan ini secara singkat..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
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
              Tambah Layanan
            </>
          )}
        </Button>
      </Card>

      {/* Product List */}
      {progress.products.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Layanan yang Ditambahkan</h3>
            <Badge variant="secondary">{progress.products.length} layanan</Badge>
          </div>

          <div className="space-y-3">
            {progress.products.map((product, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    {product.description && (
                      <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        {product.duration_minutes} menit
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
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
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              Belum ada layanan yang ditambahkan. Tambahkan minimal 1 layanan untuk melanjutkan.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

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
import { Package, Plus, AlertCircle, CheckCircle2, Info, ArrowUpCircle, Clock, Banknote, Settings, ChevronDown, ChevronUp, Image, FileText } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { useSubscription } from "@/lib/subscription-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface ProductServicesStepProps {
  onValidChange: (isValid: boolean) => void
}

export function ProductServicesStep({ onValidChange }: ProductServicesStepProps) {
  const { toast } = useToast()
  const { progress, addProduct } = useOperationalOnboarding()
  const { usage } = useSubscription()

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    duration_minutes: 60,
    price: 0,
    currency: "IDR",
    description: "",
    image_url: "",
    preparation_minutes: 0,
    cleanup_minutes: 0,
    max_advance_booking_days: 30,
    min_advance_booking_hours: 2,
    requires_staff: true,
    required_staff_count: 1,
    allow_parallel_bookings: false,
    max_parallel_bookings: 1,
    tags: [] as string[],
    is_active: true,
    status: "active" as "active" | "inactive" | "draft",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [planLimits, setPlanLimits] = useState<{ current: number; max: number } | null>(null)
  const [categoryTemplates, setCategoryTemplates] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)

  // Load category templates
  useEffect(() => {
    const fetchCategoryTemplates = async () => {
      setLoadingCategories(true)
      try {
        const response = await fetch('/api/services/categories/templates')
        if (response.ok) {
          const data = await response.json()
          // API returns array of category strings
          if (Array.isArray(data)) {
            setCategoryTemplates(data)
          } else if (data.categories && Array.isArray(data.categories)) {
            setCategoryTemplates(data.categories)
          }
        }
      } catch (error) {
        console.error('Failed to fetch category templates:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategoryTemplates()
  }, [])

  // Load plan limits from subscription context
  useEffect(() => {
    if (usage?.usage_summary?.services) {
      setPlanLimits({
        current: usage.usage_summary.services.used || progress.products.length,
        max: usage.usage_summary.services.limit || 999,
      })
    }
  }, [usage, progress.products.length])

  // Update parent validation state
  useEffect(() => {
    onValidChange(progress.products.length > 0)
  }, [progress.products, onValidChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama layanan wajib diisi"
    }
    if (!formData.category.trim()) {
      newErrors.category = "Kategori wajib diisi"
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
          slug: formData.slug.trim() || generateSlug(formData.name),
          category: formData.category,
          description: formData.description.trim() || undefined,
          duration_minutes: formData.duration_minutes,
          preparation_minutes: formData.preparation_minutes || undefined,
          cleanup_minutes: formData.cleanup_minutes || undefined,
          max_advance_booking_days: formData.max_advance_booking_days || 30,
          min_advance_booking_hours: formData.min_advance_booking_hours || 2,
          requires_staff: formData.requires_staff,
          required_staff_count: formData.required_staff_count || 1,
          allow_parallel_bookings: formData.allow_parallel_bookings || false,
          max_parallel_bookings: formData.max_parallel_bookings || 1,
          pricing: {
            base_price: formData.price,
            currency: formData.currency || "IDR",
          },
          tags: formData.tags,
          image_url: formData.image_url || undefined,
          is_active: formData.is_active,
          status: formData.status,
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
          slug: "",
          category: "",
          duration_minutes: 60,
          price: 0,
          currency: "IDR",
          description: "",
          image_url: "",
          preparation_minutes: 0,
          cleanup_minutes: 0,
          max_advance_booking_days: 30,
          min_advance_booking_hours: 2,
          requires_staff: true,
          required_staff_count: 1,
          allow_parallel_bookings: false,
          max_parallel_bookings: 1,
          tags: [],
          is_active: true,
          status: "active",
        })
        setErrors({})
        setShowAdvancedSettings(false)
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

        <Card className="p-5 border-[#C4B5FD] bg-[#EDE9FE]">
          <div className="flex items-start gap-3">
            <div className="bg-[#EDE9FE] rounded-lg p-2">
              <CheckCircle2 className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#6D28D9] mb-2">Kenapa ini penting</h3>
              <p className="text-sm text-[#6D28D9]">
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

        <div className="space-y-6">
          {/* Essential Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              <FileText className="h-4 w-4 text-blue-600" />
              Informasi Dasar
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nama Layanan <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Contoh: Facial Treatment Premium"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    setFormData({
                      ...formData,
                      name: newName,
                      slug: generateSlug(newName)
                    })
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Kategori <span className="text-red-500">*</span>
                  </Label>
                  {loadingCategories ? (
                    <div className="h-10 flex items-center justify-center border rounded-md bg-gray-50">
                      <span className="text-sm text-gray-500">Loading categories...</span>
                    </div>
                  ) : categoryTemplates.length > 0 ? (
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={`h-10 ${errors.category ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryTemplates.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="category"
                      placeholder="contoh: facial, hair_care, nails"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`h-10 ${errors.category ? "border-red-500" : ""}`}
                    />
                  )}
                  {errors.category ? (
                    <p className="text-xs text-red-500">{errors.category}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {categoryTemplates.length > 0 ? "Pilih dari category template tenant Anda" : "Masukkan category dalam lowercase dengan underscore"}
                    </p>
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
                      max="480"
                      placeholder="60"
                      value={formData.duration_minutes}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 60
                        setFormData({ ...formData, duration_minutes: Math.min(480, Math.max(1, value)) })
                      }}
                      className={`pl-10 ${errors.duration_minutes ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.duration_minutes && (
                    <p className="text-xs text-red-500">{errors.duration_minutes}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  Harga (IDR) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="150000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className={`pl-10 ${errors.price ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Image */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
              <Image className="h-4 w-4 text-blue-600" />
              Deskripsi & Gambar
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  placeholder="Jelaskan layanan ini, manfaat, dan apa yang customer dapatkan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
                <p className="text-xs text-gray-500">Tambahkan gambar untuk membuat layanan lebih menarik</p>
              </div>
            </div>
          </div>

          {/* Status & Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: !!checked })}
                className="h-5 w-5"
              />
              <div>
                <Label htmlFor="is_active" className="cursor-pointer font-medium text-sm">
                  Layanan Aktif
                </Label>
                <p className="text-xs text-gray-500">Tersedia untuk booking</p>
              </div>
            </div>

            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Settings - Collapsible */}
          <div className="pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 uppercase tracking-wide hover:text-blue-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-blue-600" />
                Pengaturan Lanjutan
              </div>
              {showAdvancedSettings ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showAdvancedSettings && (
              <div className="mt-4 space-y-6">
                {/* Time Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-600">Pengaturan Waktu</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="preparation" className="text-xs">Persiapan (menit)</Label>
                      <Input
                        id="preparation"
                        type="number"
                        min="0"
                        max="120"
                        value={formData.preparation_minutes}
                        onChange={(e) => setFormData({ ...formData, preparation_minutes: parseInt(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="cleanup" className="text-xs">Pembersihan (menit)</Label>
                      <Input
                        id="cleanup"
                        type="number"
                        min="0"
                        max="120"
                        value={formData.cleanup_minutes}
                        onChange={(e) => setFormData({ ...formData, cleanup_minutes: parseInt(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="min_booking" className="text-xs">Min Booking (jam)</Label>
                      <Input
                        id="min_booking"
                        type="number"
                        min="0"
                        value={formData.min_advance_booking_hours}
                        onChange={(e) => setFormData({ ...formData, min_advance_booking_hours: parseInt(e.target.value) || 0 })}
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-600">Pengaturan Booking</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="max_advance" className="text-xs">Max Booking (hari)</Label>
                      <Input
                        id="max_advance"
                        type="number"
                        min="1"
                        value={formData.max_advance_booking_days}
                        onChange={(e) => setFormData({ ...formData, max_advance_booking_days: parseInt(e.target.value) || 30 })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="required_staff" className="text-xs">Staff Required</Label>
                      <Input
                        id="required_staff"
                        type="number"
                        min="0"
                        value={formData.required_staff_count}
                        onChange={(e) => setFormData({ ...formData, required_staff_count: parseInt(e.target.value) || 1 })}
                        className="h-9"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="max_parallel" className="text-xs">Max Parallel</Label>
                      <Input
                        id="max_parallel"
                        type="number"
                        min="1"
                        value={formData.max_parallel_bookings}
                        onChange={(e) => setFormData({ ...formData, max_parallel_bookings: parseInt(e.target.value) || 1 })}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requires_staff"
                        checked={formData.requires_staff}
                        onCheckedChange={(checked) => setFormData({ ...formData, requires_staff: !!checked })}
                      />
                      <Label htmlFor="requires_staff" className="cursor-pointer text-xs">Memerlukan Staff</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_parallel"
                        checked={formData.allow_parallel_bookings}
                        onCheckedChange={(checked) => setFormData({ ...formData, allow_parallel_bookings: !!checked })}
                      />
                      <Label htmlFor="allow_parallel" className="cursor-pointer text-xs">Izinkan Parallel Booking</Label>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium text-gray-600">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="luxury, popular, new (pisahkan dengan koma)"
                    value={formData.tags.join(", ")}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) })}
                    className="h-9"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button
            onClick={handleAdd}
            disabled={loading || !canAddMore}
            className="w-full md:w-auto"
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
        </div>
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

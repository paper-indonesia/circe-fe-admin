"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Users, Plus, AlertCircle, CheckCircle2, Info, ArrowUpCircle, Mail, Phone } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { useSubscription } from "@/lib/subscription-context"

interface UserManagementStepProps {
  onValidChange: (isValid: boolean) => void
}

const USER_ROLES = [
  { value: "staff", label: "Staff - Dapat mengelola booking dan customer" },
  { value: "manager", label: "Manager - Akses penuh kecuali settings tenant" },
  { value: "receptionist", label: "Receptionist - Fokus pada front desk" },
]

export function UserManagementStep({ onValidChange }: UserManagementStepProps) {
  const { toast } = useToast()
  const { progress, addUser } = useOperationalOnboarding()
  const { usage } = useSubscription()

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "staff",
    password: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [planLimits, setPlanLimits] = useState<{ current: number; max: number } | null>(null)
  const [existingUsers, setExistingUsers] = useState<any[]>([])
  const [loadingExisting, setLoadingExisting] = useState(true)

  // Load existing users
  useEffect(() => {
    const fetchExistingUsers = async () => {
      try {
        const response = await fetch("/api/users")
        if (response.ok) {
          const data = await response.json()
          setExistingUsers(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error("Failed to fetch existing users:", error)
      } finally {
        setLoadingExisting(false)
      }
    }

    fetchExistingUsers()
  }, [])

  // Load plan limits from subscription context
  useEffect(() => {
    if (usage?.usage_summary?.staff) {
      setPlanLimits({
        current: usage.usage_summary.staff.used || 0,
        max: usage.usage_summary.staff.limit || 999,
      })
    }
  }, [usage])

  // Update parent validation state
  useEffect(() => {
    // Can proceed if there's at least 1 existing user OR new users have been added
    const hasExistingUser = existingUsers.length >= 1
    const hasNewUsers = progress.users.length > 0
    onValidChange(hasExistingUser || hasNewUsers)
  }, [progress.users, existingUsers, onValidChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = "Nama depan wajib diisi"
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Nama belakang wajib diisi"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password wajib diisi"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter"
    }
    if (formData.phone && !/^[\d\s\-\+()]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor telepon tidak valid"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAdd = async () => {
    if (!validate()) return

    // Check plan limits
    if (planLimits && progress.users.length >= planLimits.max) {
      toast({
        title: "Limit Tercapai",
        description: `Plan Anda hanya mendukung maksimal ${planLimits.max} user. Upgrade untuk menambah lebih banyak.`,
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          password: formData.password,
          is_active: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        addUser({
          id: data._id || data.id,
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
        })

        toast({
          title: "Berhasil",
          description: "User berhasil ditambahkan",
        })

        // Reset form
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          role: "staff",
          password: "",
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal menambahkan user")
      }
    } catch (error: any) {
      console.error("Failed to add user:", error)
      toast({
        title: "Error",
        description: error.message || "Gagal menambahkan user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const canAddMore = !planLimits || progress.users.length < planLimits.max

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
                {existingUsers.length >= 1
                  ? "Anda sudah memiliki user. Langkah ini opsional - Anda bisa skip atau menambah user lain sesuai kebutuhan."
                  : "Tambahkan user internal sesuai kebutuhan tim Anda. Minimal 1 user untuk membantu operasional harian."
                }
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
                User dengan role yang tepat memastikan akses terkontrol, audit trail yang jelas, dan pembagian tugas yang efisien.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Existing User Alert */}
      {!loadingExisting && existingUsers.length >= 1 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium mb-1">Anda sudah memiliki {existingUsers.length} user terdaftar</p>
                <p className="text-sm">Langkah ini opsional. Klik "Lanjut" untuk skip atau tambahkan user lain jika diperlukan.</p>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Limits Info */}
      {planLimits && (
        <Alert className={canAddMore ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
          <AlertCircle className={canAddMore ? "h-4 w-4 text-green-600" : "h-4 w-4 text-orange-600"} />
          <AlertDescription className={canAddMore ? "text-green-800" : "text-orange-800"}>
            Plan Anda: {progress.users.length} / {planLimits.max} user terpakai
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
          <Users className="h-6 w-6 text-gray-600" />
          <h3 className="text-lg font-semibold">Tambah User Baru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              Nama Depan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              placeholder="Contoh: Budi"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && (
              <p className="text-xs text-red-500">{errors.first_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              Nama Belakang <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              placeholder="Contoh: Santoso"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && (
              <p className="text-xs text-red-500">{errors.last_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium h-10">
                +62
              </div>
              <Input
                id="phone"
                placeholder="81xxxxxxxxx"
                value={formData.phone.startsWith('+62') ? formData.phone.slice(3) : formData.phone}
                onChange={(e) => {
                  const input = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, phone: input ? `+62${input}` : '' })
                }}
                className={errors.phone ? "border-red-500 flex-1" : "flex-1"}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Role / Peran <span className="text-red-500">*</span>
            </Label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {USER_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
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
              Tambah User
            </>
          )}
        </Button>
      </Card>

      {/* Existing Users List */}
      {!loadingExisting && existingUsers.length > 0 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-green-900">User Terdaftar</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-700">{existingUsers.length} user</Badge>
          </div>

          <div className="space-y-3">
            {existingUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border border-green-300 rounded-lg bg-white"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-green-100 rounded-lg p-2">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs capitalize bg-green-50 border-green-300">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Newly Added Users List (during onboarding) */}
      {progress.users.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">User Baru Ditambahkan</h3>
            <Badge variant="secondary">{progress.users.length} user</Badge>
          </div>

          <div className="space-y-3">
            {progress.users.map((user, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

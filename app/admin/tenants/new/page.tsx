"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Building2, Palette, Users } from "lucide-react"
import Link from "next/link"

export default function NewTenantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    domain: "",
    primaryColor: "#8B5CF6",
    secondaryColor: "#EC4899",
    maxUsers: "100",
    maxBookings: "1000",
    logo: "",
  })

  useEffect(() => {
    // Check if user is platform admin
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/jakarta/signin")
      return
    }
    
    const userData = JSON.parse(user)
    if (userData.role !== "platform_admin") {
      router.push(`/${userData.tenantSlug || 'jakarta'}/dashboard`)
      return
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    
    // Auto-generate slug from name
    if (id === "name") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      setFormData({
        ...formData,
        name: value,
        slug: slug,
      })
    } else {
      setFormData({
        ...formData,
        [id]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = localStorage.getItem("user")
      const userData = user ? JSON.parse(user) : null

      const response = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          domain: formData.domain || undefined,
          config: {
            logo: formData.logo || undefined,
            theme: {
              primaryColor: formData.primaryColor,
              secondaryColor: formData.secondaryColor,
            },
            features: {
              maxUsers: parseInt(formData.maxUsers),
              maxBookings: parseInt(formData.maxBookings),
            },
          },
          createdBy: userData?.id || "system",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/tenants")
      } else {
        setError(data.error || "Failed to create tenant")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/tenants">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Tenant</h1>
              <p className="text-gray-600 mt-1">Add a new beauty clinic branch</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tenant Information</CardTitle>
              <CardDescription>
                Enter the details for the new tenant. The tenant will be immediately accessible after creation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tenant Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Jakarta Branch"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">URL Slug *</Label>
                      <Input
                        id="slug"
                        placeholder="e.g., jakarta"
                        value={formData.slug}
                        onChange={handleChange}
                        pattern="^[a-z0-9-]+$"
                        required
                        disabled={loading}
                      />
                      <p className="text-xs text-gray-500">
                        Will be accessible at: /{formData.slug || "slug"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Custom Domain (Optional)</Label>
                    <Input
                      id="domain"
                      placeholder="e.g., jakarta.beautyclinic.com"
                      value={formData.domain}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Theme Configuration
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={handleChange}
                          className="w-20 h-10"
                          disabled={loading}
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                          className="flex-1"
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={formData.secondaryColor}
                          onChange={handleChange}
                          className="w-20 h-10"
                          disabled={loading}
                        />
                        <Input
                          value={formData.secondaryColor}
                          onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                          className="flex-1"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL (Optional)</Label>
                    <Input
                      id="logo"
                      placeholder="https://example.com/logo.png"
                      value={formData.logo}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Resource Limits
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="maxUsers">Max Users</Label>
                      <Input
                        id="maxUsers"
                        type="number"
                        min="1"
                        value={formData.maxUsers}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxBookings">Max Bookings</Label>
                      <Input
                        id="maxBookings"
                        type="number"
                        min="1"
                        value={formData.maxBookings}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Tenant...
                      </>
                    ) : (
                      <>
                        <Building2 className="mr-2 h-4 w-4" />
                        Create Tenant
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/tenants")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
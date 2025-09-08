"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { LiquidLoading } from "@/components/ui/liquid-loader"
import { useToast } from "@/hooks/use-toast"

interface TenantData {
  id: string
  name: string
  slug: string
  isActive: boolean
  config: {
    features?: {
      maxUsers?: number
      maxBookings?: number
      walkIn?: boolean
      reporting?: boolean
      multipleLocations?: boolean
    }
    theme?: {
      primaryColor?: string
      secondaryColor?: string
    }
  }
}

export default function EditTenantPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tenant, setTenant] = useState<TenantData | null>(null)

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

    fetchTenant()
  }, [params.id, router])

  const fetchTenant = async () => {
    try {
      const response = await fetch(`/api/admin/tenants/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTenant(data.tenant)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tenant details",
          variant: "destructive"
        })
        router.push("/admin/tenants")
      }
    } catch (error) {
      console.error("Failed to fetch tenant:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching tenant",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenant) return

    setSaving(true)

    try {
      const user = localStorage.getItem("user")
      const userData = user ? JSON.parse(user) : null

      const response = await fetch(`/api/admin/tenants/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userData?.token || ""}`
        },
        body: JSON.stringify(tenant)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tenant updated successfully",
        })
        router.push("/admin/tenants")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to update tenant",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating tenant",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LiquidLoading />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Tenant not found</p>
            <Link href="/admin/tenants">
              <Button className="mt-4">Back to Tenants</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/tenants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Tenant</h1>
            <p className="text-gray-600 mt-1">Update tenant configuration and settings</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the tenant's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input
                    id="name"
                    value={tenant.name}
                    onChange={(e) => setTenant({ ...tenant, name: e.target.value })}
                    placeholder="e.g., Jakarta Branch"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={tenant.slug}
                    onChange={(e) => setTenant({ ...tenant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g., jakarta"
                    pattern="[a-z0-9-]+"
                    required
                  />
                  <p className="text-xs text-gray-500">Used in URLs: /{tenant.slug}/dashboard</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={tenant.isActive}
                  onCheckedChange={(checked) => setTenant({ ...tenant, isActive: checked })}
                />
                <Label htmlFor="active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Features & Limits</CardTitle>
              <CardDescription>Configure tenant features and usage limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Maximum Users</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={tenant.config.features?.maxUsers || 100}
                    onChange={(e) => setTenant({
                      ...tenant,
                      config: {
                        ...tenant.config,
                        features: {
                          ...tenant.config.features,
                          maxUsers: parseInt(e.target.value)
                        }
                      }
                    })}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBookings">Maximum Bookings</Label>
                  <Input
                    id="maxBookings"
                    type="number"
                    value={tenant.config.features?.maxBookings || 1000}
                    onChange={(e) => setTenant({
                      ...tenant,
                      config: {
                        ...tenant.config,
                        features: {
                          ...tenant.config.features,
                          maxBookings: parseInt(e.target.value)
                        }
                      }
                    })}
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="walkIn"
                    checked={tenant.config.features?.walkIn !== false}
                    onCheckedChange={(checked) => setTenant({
                      ...tenant,
                      config: {
                        ...tenant.config,
                        features: {
                          ...tenant.config.features,
                          walkIn: checked
                        }
                      }
                    })}
                  />
                  <Label htmlFor="walkIn">Enable Walk-in Appointments</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reporting"
                    checked={tenant.config.features?.reporting !== false}
                    onCheckedChange={(checked) => setTenant({
                      ...tenant,
                      config: {
                        ...tenant.config,
                        features: {
                          ...tenant.config.features,
                          reporting: checked
                        }
                      }
                    })}
                  />
                  <Label htmlFor="reporting">Enable Advanced Reporting</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="multipleLocations"
                    checked={tenant.config.features?.multipleLocations === true}
                    onCheckedChange={(checked) => setTenant({
                      ...tenant,
                      config: {
                        ...tenant.config,
                        features: {
                          ...tenant.config.features,
                          multipleLocations: checked
                        }
                      }
                    })}
                  />
                  <Label htmlFor="multipleLocations">Support Multiple Locations</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the tenant's color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={tenant.config.theme?.primaryColor || "#8B5CF6"}
                      onChange={(e) => setTenant({
                        ...tenant,
                        config: {
                          ...tenant.config,
                          theme: {
                            ...tenant.config.theme,
                            primaryColor: e.target.value
                          }
                        }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={tenant.config.theme?.primaryColor || "#8B5CF6"}
                      onChange={(e) => setTenant({
                        ...tenant,
                        config: {
                          ...tenant.config,
                          theme: {
                            ...tenant.config.theme,
                            primaryColor: e.target.value
                          }
                        }
                      })}
                      placeholder="#8B5CF6"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={tenant.config.theme?.secondaryColor || "#EC4899"}
                      onChange={(e) => setTenant({
                        ...tenant,
                        config: {
                          ...tenant.config,
                          theme: {
                            ...tenant.config.theme,
                            secondaryColor: e.target.value
                          }
                        }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={tenant.config.theme?.secondaryColor || "#EC4899"}
                      onChange={(e) => setTenant({
                        ...tenant,
                        config: {
                          ...tenant.config,
                          theme: {
                            ...tenant.config.theme,
                            secondaryColor: e.target.value
                          }
                        }
                      })}
                      placeholder="#EC4899"
                      pattern="^#[0-9A-Fa-f]{6}$"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Link href="/admin/tenants">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building2, Users, Calendar, Settings, ExternalLink, Trash2, Palette, MapPin, Activity, Check, X } from "lucide-react"
import Link from "next/link"
import { LiquidLoading } from "@/components/ui/liquid-loader"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  createdAt: string
}

export default function TenantsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<TenantData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<TenantData | null>(null)

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

    fetchTenants()
  }, [router])

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/admin/tenants")
      if (response.ok) {
        const data = await response.json()
        setTenants(data.tenants)
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!tenantToDelete) return

    try {
      const user = localStorage.getItem("user")
      const userData = user ? JSON.parse(user) : null
      
      const response = await fetch(`/api/admin/tenants/${tenantToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userData?.token || ""}`
        }
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Tenant "${tenantToDelete.name}" has been deleted.`,
        })
        fetchTenants()
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to delete tenant",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the tenant",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setTenantToDelete(null)
    }
  }

  const openDeleteDialog = (tenant: TenantData) => {
    setTenantToDelete(tenant)
    setDeleteDialogOpen(true)
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LiquidLoading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Management</h1>
            <p className="text-gray-600 mt-2">Manage all beauty clinic branches</p>
          </div>
          <Link href="/admin/tenants/new">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Tenant
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tenants by name or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTenants.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No tenants found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first tenant to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTenants.map((tenant) => {
              const primaryColor = tenant.config.theme?.primaryColor || "#8B5CF6"
              const secondaryColor = tenant.config.theme?.secondaryColor || "#EC4899"
              
              return (
                <Card key={tenant.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden border-2">
                  {/* Color Header */}
                  <div 
                    className="h-2"
                    style={{
                      background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                    }}
                  />
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-gray-600" />
                          <CardTitle className="text-xl">{tenant.name}</CardTitle>
                        </div>
                        <CardDescription className="mt-1 flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          /{tenant.slug}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={tenant.isActive ? "default" : "secondary"}
                        className={tenant.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {tenant.isActive ? (
                          <><Check className="w-3 h-3 mr-1" /> Active</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" /> Inactive</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Theme Preview */}
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Palette className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-600">Theme:</span>
                      <div className="flex gap-2 ml-auto">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: primaryColor }}
                          title="Primary Color"
                        />
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: secondaryColor }}
                          title="Secondary Color"
                        />
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-2 text-blue-500" />
                        <div>
                          <p className="text-xs text-gray-500">Users</p>
                          <p className="font-semibold">{tenant.config.features?.maxUsers || 100}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                        <div>
                          <p className="text-xs text-gray-500">Bookings</p>
                          <p className="font-semibold">{tenant.config.features?.maxBookings || 1000}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {tenant.config.features?.walkIn !== false && (
                          <Badge variant="outline" className="text-xs">
                            <Activity className="w-3 h-3 mr-1" />
                            Walk-in
                          </Badge>
                        )}
                        {tenant.config.features?.reporting !== false && (
                          <Badge variant="outline" className="text-xs">
                            📊 Reports
                          </Badge>
                        )}
                        {tenant.config.features?.multipleLocations && (
                          <Badge variant="outline" className="text-xs">
                            📍 Multi-location
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Created Date */}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Created: {new Date(tenant.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/tenants/${tenant.id}/edit`)}
                        className="flex-1"
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${tenant.slug}/dashboard`, '_blank')}
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(tenant)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the tenant "{tenantToDelete?.name}" and all associated data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
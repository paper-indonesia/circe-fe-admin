"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/subscription-context"
import { useToast } from "@/hooks/use-toast"
import { MainLayout } from "@/components/layout/main-layout"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Plus, Edit, Trash2, Search, Loader2, MapPin, Phone, Clock, AlertCircle, Mail, Globe, Users, Briefcase, Calendar, X, Save, Sparkles, FileText, Link2, MessageSquare, Activity, Home, MapPinned, Package, Crown } from "lucide-react"

interface BusinessHour {
  day: number
  is_open: boolean
  open_time?: string
  close_time?: string
}

interface OutletSettings {
  accepts_online_booking: boolean
  requires_appointment: boolean
  walk_ins_allowed: boolean
  advance_booking_days: number
  cancellation_hours: number
  auto_confirm_bookings: boolean
  payment_required_upfront: boolean
  timezone: string
  default_service_buffer_minutes: number
  accepts_online_payment: boolean
  accepts_cash_payment: boolean
  payment_on_arrival: boolean
}

interface OutletData {
  id: string
  tenant_id?: string
  name: string
  slug: string
  description?: string
  status: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  contact: {
    phone: string
    email?: string
    website?: string
  }
  business_hours?: BusinessHour[]
  settings?: OutletSettings
  stats?: {
    staff_count: number
    active_services_count: number
    total_appointments: number
  }
  created_at?: string
  updated_at?: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DEFAULT_BUSINESS_HOURS: BusinessHour[] = [
  { day: 0, is_open: false },
  { day: 1, is_open: true, open_time: "09:00", close_time: "18:00" },
  { day: 2, is_open: true, open_time: "09:00", close_time: "18:00" },
  { day: 3, is_open: true, open_time: "09:00", close_time: "18:00" },
  { day: 4, is_open: true, open_time: "09:00", close_time: "18:00" },
  { day: 5, is_open: true, open_time: "09:00", close_time: "18:00" },
  { day: 6, is_open: false },
]

const DEFAULT_SETTINGS: OutletSettings = {
  accepts_online_booking: true,
  requires_appointment: true,
  walk_ins_allowed: true,
  advance_booking_days: 30,
  cancellation_hours: 24,
  auto_confirm_bookings: false,
  payment_required_upfront: false,
  timezone: "Asia/Jakarta",
  default_service_buffer_minutes: 15,
  accepts_online_payment: true,
  accepts_cash_payment: true,
  payment_on_arrival: false,
}

export default function OutletManagementPage() {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const undoToastDismissRef = useRef<(() => void) | null>(null)

  // Use subscription context for usage data
  const { usage, loading: usageLoading } = useSubscription()

  const [outlets, setOutlets] = useState<OutletData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedOutlet, setSelectedOutlet] = useState<OutletData | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [subscriptionLimitError, setSubscriptionLimitError] = useState(false)
  const [tenant, setTenant] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "active",
    address: {
      street: "",
      city: "",
      state: "",
      postal_code: "",
      country: "ID"
    },
    contact: {
      phone: "",
      email: "",
      website: ""
    },
    business_hours: DEFAULT_BUSINESS_HOURS,
    settings: DEFAULT_SETTINGS
  })

  // Load tenant from localStorage
  useEffect(() => {
    const storedTenant = localStorage.getItem("tenant")
    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant))
      } catch (e) {
        console.error("Failed to parse tenant data")
      }
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin')
      } else if (!isAdmin()) {
        router.push('/dashboard')
      }
    }
  }, [authLoading, user, isAdmin, router])

  useEffect(() => {
    if (!authLoading && user && isAdmin()) {
      fetchOutlets()
      // Usage data is now loaded from subscription context
    }
  }, [authLoading, user, isAdmin, page, searchTerm])

  const fetchOutlets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
      })

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/outlets?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // Handle both paginated and non-paginated responses
        if (data.items) {
          setOutlets(data.items)
          setTotalPages(Math.ceil(data.total / 20))
        } else {
          setOutlets(data.outlets || data || [])
        }
      }
    } catch (error) {
      console.error('Error fetching outlets:', error)
      setError('Failed to load outlets')
    } finally {
      setLoading(false)
    }
  }

  const handleAddOutlet = async () => {
    try {
      setError("")
      setSubscriptionLimitError(false)

      if (!tenant?.id) {
        setError("Tenant information not found. Please sign in again.")
        return
      }

      // Add tenant_id to formData
      const outletData = {
        ...formData,
        tenant_id: tenant.id
      }

      const response = await fetch('/api/outlets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(outletData)
      })

      if (response.ok) {
        setSuccess('Outlet created successfully')
        setIsAddDialogOpen(false)
        resetForm()
        fetchOutlets()
        fetchUsage() // Refresh usage after adding outlet
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()

        // Check if it's a subscription limit error
        const errorMessage = typeof data.error === 'string' ? data.error :
                           (data.detail && typeof data.detail === 'string' ? data.detail : '')

        if (errorMessage.includes('Subscription limit reached') || errorMessage.includes('Maximum outlets allowed')) {
          setSubscriptionLimitError(true)
          setError(errorMessage)
          setIsAddDialogOpen(false)
          return
        }

        // Handle FastAPI validation errors (array of error objects)
        if (Array.isArray(data.error)) {
          const errorMessages = data.error.map((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
          setError(errorMessages)
        } else if (typeof data.error === 'string') {
          setError(data.error)
        } else if (data.detail) {
          setError(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        } else {
          setError('Failed to create outlet')
        }
      }
    } catch (error) {
      setError('Failed to create outlet')
    }
  }

  const handleUpdateOutlet = async () => {
    if (!selectedOutlet) return

    try {
      setError("")
      const response = await fetch(`/api/outlets/${selectedOutlet.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccess('Outlet updated successfully')
        setIsEditDialogOpen(false)
        setSelectedOutlet(null)
        fetchOutlets()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const data = await response.json()

        // Handle FastAPI validation errors (array of error objects)
        if (Array.isArray(data.error)) {
          const errorMessages = data.error.map((err: any) => {
            const field = err.loc?.[err.loc.length - 1] || 'field'
            return `${field}: ${err.msg}`
          }).join(', ')
          setError(errorMessages)
        } else if (typeof data.error === 'string') {
          setError(data.error)
        } else if (data.detail) {
          setError(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        } else {
          setError('Failed to update outlet')
        }
      }
    } catch (error) {
      setError('Failed to update outlet')
    }
  }

  const handleDeleteOutlet = async () => {
    if (!selectedOutlet) return

    const deletedOutlet = { ...selectedOutlet }

    try {
      setError("")
      const response = await fetch(`/api/outlets/${selectedOutlet.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Clear existing undo timer if any
        if (undoTimerRef.current) {
          clearTimeout(undoTimerRef.current)
        }
        if (undoToastDismissRef.current) {
          undoToastDismissRef.current()
        }

        // Show undo toast
        const { dismiss } = toast({
          title: "Outlet deleted (soft)",
          description: "Undo within 10 seconds.",
          duration: 10000,
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUndoDeleteOutlet(deletedOutlet.id)}
              className="bg-white hover:bg-gray-100"
            >
              Undo
            </Button>
          ),
        })

        undoToastDismissRef.current = dismiss

        // Set timer to finalize deletion after 10 seconds
        undoTimerRef.current = setTimeout(() => {
          undoTimerRef.current = null
          undoToastDismissRef.current = null
        }, 10000)

        setIsDeleteDialogOpen(false)
        setSelectedOutlet(null)
        fetchOutlets()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete outlet')
        toast({
          title: "Error",
          description: data.error || 'Failed to delete outlet',
          variant: "destructive"
        })
      }
    } catch (error) {
      setError('Failed to delete outlet')
      toast({
        title: "Error",
        description: 'Failed to delete outlet',
        variant: "destructive"
      })
    }
  }

  const handleUndoDeleteOutlet = async (outletId: string) => {
    try {
      // Call restore API endpoint
      const response = await fetch(`/api/outlets/${outletId}/restore`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore outlet')
      }

      // Clear undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
        undoTimerRef.current = null
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
        undoToastDismissRef.current = null
      }

      toast({
        title: "Outlet restored",
        description: "Outlet has been successfully restored.",
      })

      // Refresh outlets list
      fetchOutlets()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore outlet",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "active",
      address: {
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "ID"
      },
      contact: {
        phone: "",
        email: "",
        website: ""
      },
      business_hours: DEFAULT_BUSINESS_HOURS,
      settings: DEFAULT_SETTINGS
    })
  }

  const updateBusinessHour = (dayIndex: number, field: keyof BusinessHour, value: any) => {
    const newHours = [...formData.business_hours]
    newHours[dayIndex] = { ...newHours[dayIndex], [field]: value }
    setFormData({ ...formData, business_hours: newHours })
  }

  const filteredOutlets = outlets.filter(outlet =>
    outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    outlet.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getBusinessHoursDisplay = (hours?: BusinessHour[]) => {
    if (!hours || hours.length === 0) return "Not set"
    const openDays = hours.filter(h => h.is_open)
    if (openDays.length === 0) return "Closed"
    const first = openDays[0]
    return `${first.open_time || ''} - ${first.close_time || ''}`
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user || !isAdmin()) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Outlet Management</h1>
                {usage?.usage?.outlets && (
                  <Badge
                    variant={
                      usage.usage.outlets.status === 'exceeded' || usage.usage.outlets.status === 'at_limit'
                        ? "destructive"
                        : usage.usage.outlets.status === 'approaching_limit'
                        ? "warning"
                        : "default"
                    }
                    className="text-sm"
                  >
                    {usage.usage.outlets.current || 0}/{usage.usage.outlets.limit === -1 ? '∞' : usage.usage.outlets.limit} Outlets
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">Manage your business locations and outlets</p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setIsAddDialogOpen(true)
            }}
            disabled={usage?.usage?.outlets && (usage.usage.outlets.status === 'exceeded' || usage.usage.outlets.status === 'at_limit')}
            className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            Add Outlet
          </Button>
        </div>

        {/* Approaching Limit Warning */}
        {usage?.usage?.outlets && usage.usage.outlets.status === 'approaching_limit' && (
          <Alert className="bg-orange-50 border-orange-200">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-orange-900 mb-1">Outlet Limit Warning</p>
                <p className="text-orange-800">
                  You're using {usage.usage.outlets.current} of {usage.usage.outlets.limit} outlets ({usage.usage.outlets.percentage}%).
                  Consider upgrading your plan to add more outlets.
                </p>
              </div>
              <Button
                onClick={() => router.push('/subscription/upgrade')}
                variant="outline"
                className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                View Plans
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerts */}
        {subscriptionLimitError && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200">
            <Crown className="h-5 w-5 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">Subscription Limit Reached</p>
                <p className="text-amber-800">{error}</p>
                <p className="text-sm text-amber-700 mt-1">Please upgrade your subscription plan to add more outlets.</p>
              </div>
              <Button
                onClick={() => {
                  setSubscriptionLimitError(false)
                  setError("")
                  setTimeout(() => {
                    router.push('/subscription/upgrade')
                  }, 100)
                }}
                className="ml-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {error && !subscriptionLimitError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Outlets List */}
        <Card>
          <CardHeader>
            <CardTitle>Outlets</CardTitle>
            <CardDescription>View and manage all your business locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search outlets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredOutlets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No outlets found
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOutlets.map((outlet) => (
                      <TableRow key={outlet.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{outlet.name}</p>
                            <p className="text-xs text-gray-500">{outlet.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p>{outlet.address?.city}, {outlet.address?.state}</p>
                              <p className="text-gray-500 text-xs">{outlet.address?.country}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{outlet.contact?.phone}</span>
                            </div>
                            {outlet.contact?.email && (
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <Mail className="h-3 w-3" />
                                <span>{outlet.contact.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {outlet.stats ? (
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span>{outlet.stats.staff_count} staff</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-3 w-3 text-gray-400" />
                                <span>{outlet.stats.active_services_count} services</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span>{outlet.stats.total_appointments} bookings</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No stats</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={outlet.status === 'active' ? "success" : "outline"}>
                            {outlet.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOutlet(outlet)
                                setFormData({
                                  name: outlet.name,
                                  slug: outlet.slug,
                                  description: outlet.description || "",
                                  status: outlet.status,
                                  address: outlet.address,
                                  contact: outlet.contact,
                                  business_hours: outlet.business_hours || DEFAULT_BUSINESS_HOURS,
                                  settings: outlet.settings || DEFAULT_SETTINGS
                                })
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedOutlet(outlet)
                                setIsDeleteDialogOpen(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredOutlets.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Outlet Dialog */}
        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setSelectedOutlet(null)
            setError("")
          }
        }}>
          <DialogContent className="max-w-[90vw] lg:max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-6 border-b">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {isEditDialogOpen ? 'Edit Outlet' : 'Add New Outlet'}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 mt-2">
                {isEditDialogOpen ? 'Update outlet information' : 'Create a new business location'}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="basic" className="w-full flex-1 flex flex-col overflow-hidden mt-6">
              <TabsList className="grid w-full grid-cols-5 flex-shrink-0 h-14 bg-gradient-to-r from-gray-50 to-gray-100 p-1.5 gap-2 rounded-xl shadow-sm">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="address"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Address
                </TabsTrigger>
                <TabsTrigger
                  value="contact"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Contact
                </TabsTrigger>
                <TabsTrigger
                  value="hours"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Business Hours
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 text-sm font-semibold rounded-lg transition-all flex items-center gap-2"
                >
                  <Activity className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="flex-1 overflow-y-auto mt-6">
                <div className="grid grid-cols-2 gap-6 pb-4 px-2">
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="name" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      Outlet Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Downtown Spa"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="slug" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-blue-600" />
                      Slug *
                    </Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="downtown-spa"
                      className="h-12 text-base font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Unique identifier for URL</p>
                  </div>
                  <div className="space-y-3 col-span-2 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="description" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Our flagship downtown location"
                      className="min-h-[120px] resize-none text-base"
                    />
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="status" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Address */}
              <TabsContent value="address" className="flex-1 overflow-y-auto mt-6">
                <div className="grid grid-cols-2 gap-6 pb-4 px-2">
                  <div className="space-y-3 col-span-2 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="street" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      Street Address *
                    </Label>
                    <Input
                      id="street"
                      value={formData.address.street}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                      placeholder="123 Main Street"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="city" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MapPinned className="h-4 w-4 text-blue-600" />
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                      placeholder="Jakarta"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="state" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      State/Province *
                    </Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                      placeholder="DKI Jakarta"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="postal_code" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-600" />
                      Postal Code *
                    </Label>
                    <Input
                      id="postal_code"
                      value={formData.address.postal_code}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, postal_code: e.target.value } })}
                      placeholder="12345"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="country" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      Country *
                    </Label>
                    <Select value={formData.address.country} onValueChange={(value) => setFormData({ ...formData, address: { ...formData.address, country: value } })}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ID">Indonesia</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="MY">Malaysia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Contact */}
              <TabsContent value="contact" className="flex-1 overflow-y-auto mt-6">
                <div className="grid grid-cols-2 gap-6 pb-4 px-2">
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="phone" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Phone Number *
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium h-12">
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
                        className="h-12 text-base"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Primary contact number</p>
                  </div>
                  <div className="space-y-3 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="email" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.contact.email}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                      placeholder="outlet@example.com"
                      required
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-gray-500">Contact email address</p>
                  </div>
                  <div className="space-y-3 col-span-2 p-5 border-2 rounded-xl bg-white hover:border-blue-200 transition-all">
                    <Label htmlFor="website" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={formData.contact.website}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, website: e.target.value } })}
                      placeholder="https://example.com"
                      className="h-12 text-base"
                    />
                    <p className="text-xs text-gray-500">Outlet website (optional)</p>
                  </div>
                </div>
              </TabsContent>

              {/* Business Hours */}
              <TabsContent value="hours" className="flex-1 overflow-y-auto mt-6">
                <div className="space-y-4 pb-4 px-2">
                  <div className="mb-3 px-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Operating Hours
                    </h3>
                    <p className="text-sm text-gray-600">Set your outlet's weekly business hours</p>
                  </div>
                  {DAYS.map((day, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 items-center gap-4 p-5 border-2 rounded-xl bg-white hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      {/* Day Name */}
                      <div className="col-span-2 font-bold text-base text-gray-800">
                        {day}
                      </div>

                      {/* Toggle Switch */}
                      <div className="col-span-2 flex items-center gap-3">
                        <Switch
                          checked={formData.business_hours[index].is_open}
                          onCheckedChange={(checked) => updateBusinessHour(index, 'is_open', checked)}
                        />
                        <span className="text-sm font-medium text-gray-600">
                          {formData.business_hours[index].is_open ? 'Open' : 'Closed'}
                        </span>
                      </div>

                      {/* Time Inputs */}
                      {formData.business_hours[index].is_open ? (
                        <div className="col-span-8 flex items-center gap-4">
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500 mb-1 block">Opening Time</Label>
                            <Input
                              type="time"
                              value={formData.business_hours[index].open_time || "09:00"}
                              onChange={(e) => updateBusinessHour(index, 'open_time', e.target.value)}
                              className="h-11 w-full"
                            />
                          </div>
                          <div className="flex items-center justify-center pt-5">
                            <span className="text-gray-400 font-bold">→</span>
                          </div>
                          <div className="flex-1">
                            <Label className="text-xs text-gray-500 mb-1 block">Closing Time</Label>
                            <Input
                              type="time"
                              value={formData.business_hours[index].close_time || "18:00"}
                              onChange={(e) => updateBusinessHour(index, 'close_time', e.target.value)}
                              className="h-11 w-full"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="col-span-8 flex items-center">
                          <span className="text-gray-400 text-base italic">Closed all day</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Settings */}
              <TabsContent value="settings" className="flex-1 overflow-y-auto mt-6">
                <div className="space-y-6 pb-4 px-1">
                  {/* Booking Settings */}
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-blue-50 to-cyan-50">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Booking Settings
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Configure how customers can book appointments</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="online_booking" className="font-medium cursor-pointer">Accept Online Booking</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Allow customers to book online</p>
                        </div>
                        <Switch
                          id="online_booking"
                          checked={formData.settings.accepts_online_booking}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, accepts_online_booking: checked } })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="requires_appointment" className="font-medium cursor-pointer">Requires Appointment</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Must book in advance</p>
                        </div>
                        <Switch
                          id="requires_appointment"
                          checked={formData.settings.requires_appointment}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, requires_appointment: checked } })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="walk_ins" className="font-medium cursor-pointer">Walk-ins Allowed</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Accept customers without appointment</p>
                        </div>
                        <Switch
                          id="walk_ins"
                          checked={formData.settings.walk_ins_allowed}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, walk_ins_allowed: checked } })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="auto_confirm" className="font-medium cursor-pointer">Auto Confirm Bookings</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Automatically confirm without manual review</p>
                        </div>
                        <Switch
                          id="auto_confirm"
                          checked={formData.settings.auto_confirm_bookings}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, auto_confirm_bookings: checked } })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 p-3 bg-white rounded-lg border">
                          <Label htmlFor="advance_days" className="text-sm font-medium">Advance Booking Days</Label>
                          <Input
                            id="advance_days"
                            type="number"
                            min="1"
                            max="365"
                            value={formData.settings.advance_booking_days}
                            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, advance_booking_days: parseInt(e.target.value) || 30 } })}
                            className="h-9"
                          />
                          <p className="text-xs text-gray-500">How far ahead customers can book</p>
                        </div>
                        <div className="space-y-2 p-3 bg-white rounded-lg border">
                          <Label htmlFor="cancellation_hours" className="text-sm font-medium">Cancellation Hours</Label>
                          <Input
                            id="cancellation_hours"
                            type="number"
                            min="0"
                            max="168"
                            value={formData.settings.cancellation_hours}
                            onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, cancellation_hours: parseInt(e.target.value) || 24 } })}
                            className="h-9"
                          />
                          <p className="text-xs text-gray-500">Minimum hours before cancellation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Settings */}
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-green-600" />
                        Payment Settings
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Configure payment options and policies</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="online_payment" className="font-medium cursor-pointer">Accept Online Payment</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Allow digital payments</p>
                        </div>
                        <Switch
                          id="online_payment"
                          checked={formData.settings.accepts_online_payment}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, accepts_online_payment: checked } })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="cash_payment" className="font-medium cursor-pointer">Accept Cash Payment</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Accept cash at the outlet</p>
                        </div>
                        <Switch
                          id="cash_payment"
                          checked={formData.settings.accepts_cash_payment}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, accepts_cash_payment: checked } })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="payment_upfront" className="font-medium cursor-pointer">Payment Required Upfront</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Must pay when booking</p>
                        </div>
                        <Switch
                          id="payment_upfront"
                          checked={formData.settings.payment_required_upfront}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, payment_required_upfront: checked } })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <Label htmlFor="payment_arrival" className="font-medium cursor-pointer">Payment on Arrival</Label>
                          <p className="text-xs text-gray-500 mt-0.5">Pay when arriving at outlet</p>
                        </div>
                        <Switch
                          id="payment_arrival"
                          checked={formData.settings.payment_on_arrival}
                          onCheckedChange={(checked) => setFormData({ ...formData, settings: { ...formData.settings, payment_on_arrival: checked } })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* General Settings */}
                  <div className="border rounded-lg p-5 bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="mb-4">
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        General Settings
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Other outlet configurations</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2 p-3 bg-white rounded-lg border">
                        <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                        <Select value={formData.settings.timezone} onValueChange={(value) => setFormData({ ...formData, settings: { ...formData.settings, timezone: value } })}>
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Jakarta">Asia/Jakarta (WIB)</SelectItem>
                            <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                            <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">Operating timezone</p>
                      </div>
                      <div className="space-y-2 p-3 bg-white rounded-lg border">
                        <Label htmlFor="buffer_minutes" className="text-sm font-medium">Service Buffer (min)</Label>
                        <Input
                          id="buffer_minutes"
                          type="number"
                          min="0"
                          max="120"
                          value={formData.settings.default_service_buffer_minutes}
                          onChange={(e) => setFormData({ ...formData, settings: { ...formData.settings, default_service_buffer_minutes: parseInt(e.target.value) || 15 } })}
                          className="h-9"
                        />
                        <p className="text-xs text-gray-500">Break time between services</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex-shrink-0 border-t pt-6 mt-6 gap-4 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setSelectedOutlet(null)
                  setError("")
                }}
                className="h-12 px-8 text-base font-semibold border-2 hover:bg-gray-100 gap-2"
              >
                <X className="h-5 w-5" />
                Cancel
              </Button>
              <Button
                onClick={isEditDialogOpen ? handleUpdateOutlet : handleAddOutlet}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 px-10 text-base font-semibold shadow-lg hover:shadow-xl transition-all gap-2"
              >
                {isEditDialogOpen ? (
                  <>
                    <Save className="h-5 w-5" />
                    Update Outlet
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Create Outlet
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Outlet Dialog */}
        <DeleteEntityDialog
          open={isDeleteDialogOpen && !!selectedOutlet}
          onOpenChange={setIsDeleteDialogOpen}
          entityType="Outlet"
          entityName={selectedOutlet?.name || ""}
          entityDetails={[
            { label: "Name", value: selectedOutlet?.name || "-" },
            { label: "Slug", value: selectedOutlet?.slug || "-" },
            { label: "Address", value: `${selectedOutlet?.address?.street || ""}, ${selectedOutlet?.address?.city || ""}` },
            { label: "Phone", value: selectedOutlet?.contact?.phone || "-" },
            { label: "Status", value: selectedOutlet?.status || "active" },
          ]}
          onConfirmDelete={handleDeleteOutlet}
          softDeleteImpacts={[
            "Outlet will be marked as deleted and inactive",
            "Outlet will not appear in booking forms",
            "Staff and appointment data will be preserved",
            "Outlet data can be restored within 10 seconds"
          ]}
        />
      </div>
    </MainLayout>
  )
}

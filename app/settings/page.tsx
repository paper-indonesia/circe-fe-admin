"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, Shield, Save, Briefcase, Crown, Calendar, AlertCircle, Link2, FileText, Mail, Phone, Globe, Palette, Clock, Users, Tag, X, Plus, CreditCard, Eye, EyeOff, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import LiquidLoading from "@/components/ui/liquid-loader"

interface TenantInfo {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  description: string
  website?: string
  is_active: boolean
  subscription?: {
    plan: string
    status: string
    trial_ends_at?: string | null
    current_period_start: string
    current_period_end: string
  }
  settings?: {
    timezone: string
    currency: string
    language: string
    business_type: string
    booking_advance_days?: number
    cancellation_hours?: number
    theme_color?: string
    staff_position_templates?: string[]
    service_category_templates?: string[]
  }
  paper_id_config?: {
    enabled: boolean
    client_id: string
    client_secret: string
  }
  paper_id_api_key?: string | null
  paper_id_secret_key?: string | null
  client_partner_id?: string
  created_at: string
  updated_at: string
}

interface BusinessInfo {
  clinicName: string
  phoneNumber: string
  email: string
  address: string
  operatingHours: string
  website: string
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordExpiry: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { user, isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [savingTenant, setSavingTenant] = useState(false)
  const [savingPaperId, setSavingPaperId] = useState(false)
  const [showClientSecret, setShowClientSecret] = useState(false)
  const [newStaffPosition, setNewStaffPosition] = useState("")
  const [newServiceCategory, setNewServiceCategory] = useState("")

  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [tenantForm, setTenantForm] = useState<{
    name: string
    email: string
    phone: string
    description: string
    website: string
    settings: {
      timezone: string
      currency: string
      language: string
      business_type: string
      booking_advance_days: number
      cancellation_hours: number
      theme_color: string
      staff_position_templates: string[]
      service_category_templates: string[]
    }
  }>({
    name: "",
    email: "",
    phone: "",
    description: "",
    website: "",
    settings: {
      timezone: "Asia/Manila",
      currency: "PHP",
      language: "en",
      business_type: "spa",
      booking_advance_days: 30,
      cancellation_hours: 24,
      theme_color: "#3B82F6",
      staff_position_templates: [],
      service_category_templates: []
    }
  })

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    clinicName: "",
    phoneNumber: "",
    email: "",
    address: "",
    operatingHours: "09:00 - 18:00",
    website: ""
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90"
  })

  const [paperIdForm, setPaperIdForm] = useState<{
    enabled: boolean
    client_id: string
    client_secret: string
    is_production: boolean
  }>({
    enabled: false,
    client_id: "",
    client_secret: "",
    is_production: false
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load tenant info (only for tenant_admin)
        if (isAdmin()) {
          const tenantResponse = await fetch('/api/tenants/current')
          if (tenantResponse.ok) {
            const tenantData = await tenantResponse.json()
            setTenantInfo(tenantData)
            setTenantForm({
              name: tenantData.name || "",
              email: tenantData.email || "",
              phone: tenantData.phone || "",
              description: tenantData.description || "",
              website: tenantData.website || "",
              settings: {
                timezone: tenantData.settings?.timezone || "Asia/Manila",
                currency: tenantData.settings?.currency || "PHP",
                language: tenantData.settings?.language || "en",
                business_type: tenantData.settings?.business_type || "spa",
                booking_advance_days: tenantData.settings?.booking_advance_days || 30,
                cancellation_hours: tenantData.settings?.cancellation_hours || 24,
                theme_color: tenantData.settings?.theme_color || "#3B82F6",
                staff_position_templates: tenantData.settings?.staff_position_templates || [],
                service_category_templates: tenantData.settings?.service_category_templates || []
              }
            })

            // Load Paper.id configuration from dedicated endpoint
            try {
              const paperIdResponse = await fetch('/api/tenants/paper-id-config')
              if (paperIdResponse.ok) {
                const paperIdData = await paperIdResponse.json()
                setPaperIdForm({
                  enabled: paperIdData.enabled || false,
                  client_id: paperIdData.client_id || "",
                  client_secret: "", // Never returned by API for security
                  is_production: paperIdData.is_production || false
                })
              }
            } catch (error) {
              console.error('Failed to load Paper.id config:', error)
            }
          }
        }

        // Load business info from API
        const response = await fetch('/api/settings/terminology')
        if (response.ok) {
          const data = await response.json()
          setBusinessInfo({
            clinicName: data.businessName || user?.name || "",
            phoneNumber: "",
            email: user?.email || "",
            address: "",
            operatingHours: "09:00 - 18:00",
            website: ""
          })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadSettings()
    }
  }, [user, isAdmin])

  const handleSaveTenant = async () => {
    try {
      setSavingTenant(true)
      const response = await fetch('/api/tenants/current', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm)
      })

      if (response.ok) {
        const updatedData = await response.json()
        setTenantInfo(updatedData)
        toast({
          title: "Success",
          description: "Organization profile updated successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update organization profile",
        variant: "destructive"
      })
    } finally {
      setSavingTenant(false)
    }
  }

  const handleSaveBusinessInfo = async () => {
    try {
      const response = await fetch('/api/settings/terminology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessInfo.clinicName,
        })
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Business information saved successfully"
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save business information",
        variant: "destructive"
      })
    }
  }

  const handleSaveSecurity = async () => {
    try {
      // TODO: Implement API call to save security settings
      toast({
        title: "Success",
        description: "Security settings saved successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save security settings",
        variant: "destructive"
      })
    }
  }

  const handleSavePaperId = async () => {
    try {
      setSavingPaperId(true)

      // Use dedicated Paper.id configuration endpoint
      const response = await fetch('/api/tenants/paper-id-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: paperIdForm.client_id,
          client_secret: paperIdForm.client_secret,
          is_production: paperIdForm.is_production,
          enabled: paperIdForm.enabled
        })
      })

      if (response.ok) {
        const updatedData = await response.json()
        // Update form with response (client_secret won't be returned)
        setPaperIdForm(prev => ({
          ...prev,
          client_id: updatedData.client_id || prev.client_id,
          client_secret: "", // Clear for security (not returned by API)
          is_production: updatedData.is_production,
          enabled: updatedData.enabled
        }))
        toast({
          title: "Success",
          description: "Paper.id configuration saved successfully"
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save Paper.id configuration",
        variant: "destructive"
      })
    } finally {
      setSavingPaperId(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'free': return 'outline'
      case 'basic': return 'secondary'
      case 'pro': return 'default'
      case 'enterprise': return 'default'
      default: return 'outline'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success'
      case 'trialing': return 'default'
      case 'past_due': return 'destructive'
      case 'cancelled': return 'outline'
      default: return 'outline'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Organization Profile - Only for tenant_admin */}
          {isAdmin() && tenantInfo && (
            <>
              {/* Tenant Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    Organization Profile
                  </CardTitle>
                  <CardDescription>
                    Manage your organization information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tenantName" className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-blue-600" />
                          Organization Name *
                        </Label>
                        <Input
                          id="tenantName"
                          value={tenantForm.name}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Glamour Beauty Spa"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenantSlug" className="flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-gray-400" />
                          Slug (Read-only)
                        </Label>
                        <Input
                          id="tenantSlug"
                          value={tenantInfo?.slug || ""}
                          disabled
                          className="font-mono bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">
                          Cannot be changed to prevent breaking integrations
                        </p>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="tenantDescription" className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          Description
                        </Label>
                        <Textarea
                          id="tenantDescription"
                          value={tenantForm.description}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Premium beauty and wellness services"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tenantEmail" className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          Email *
                        </Label>
                        <Input
                          id="tenantEmail"
                          type="email"
                          value={tenantForm.email}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="admin@glamourspa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tenantPhone" className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-blue-600" />
                          Phone *
                        </Label>
                        <Input
                          id="tenantPhone"
                          value={tenantForm.phone}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+639171234567"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="tenantWebsite" className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-blue-600" />
                          Website
                        </Label>
                        <Input
                          id="tenantWebsite"
                          value={tenantForm.website}
                          onChange={(e) => setTenantForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://glamourspa.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={tenantForm.settings?.timezone || "Asia/Manila"}
                          onValueChange={(value) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, timezone: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asia/Manila">Asia/Manila (GMT+8)</SelectItem>
                            <SelectItem value="Asia/Jakarta">Asia/Jakarta (GMT+7)</SelectItem>
                            <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                            <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={tenantForm.settings?.currency || "PHP"}
                          onValueChange={(value) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, currency: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PHP">PHP (Philippine Peso)</SelectItem>
                            <SelectItem value="IDR">IDR (Indonesian Rupiah)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="SGD">SGD (Singapore Dollar)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={tenantForm.settings?.language || "en"}
                          onValueChange={(value) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, language: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="id">Bahasa Indonesia</SelectItem>
                            <SelectItem value="tl">Tagalog</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="businessType">Business Type</Label>
                        <Select
                          value={tenantForm.settings?.business_type || "spa"}
                          onValueChange={(value) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, business_type: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spa">Spa</SelectItem>
                            <SelectItem value="salon">Salon</SelectItem>
                            <SelectItem value="clinic">Clinic</SelectItem>
                            <SelectItem value="wellness">Wellness Center</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Booking & Cancellation Settings */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Booking & Cancellation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bookingAdvanceDays">Max Advance Booking (days)</Label>
                        <Input
                          id="bookingAdvanceDays"
                          type="number"
                          min="1"
                          max="365"
                          value={tenantForm.settings.booking_advance_days}
                          onChange={(e) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, booking_advance_days: parseInt(e.target.value) || 30 }
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">How far in advance customers can book</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cancellationHours">Cancellation Notice (hours)</Label>
                        <Input
                          id="cancellationHours"
                          type="number"
                          min="0"
                          max="168"
                          value={tenantForm.settings.cancellation_hours}
                          onChange={(e) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, cancellation_hours: parseInt(e.target.value) || 24 }
                          }))}
                        />
                        <p className="text-xs text-muted-foreground">Minimum hours before appointment for cancellation</p>
                      </div>
                    </div>
                  </div>

                  {/* Branding */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Palette className="h-4 w-4 text-blue-600" />
                      Branding
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="themeColor">Theme Color</Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="themeColor"
                          type="color"
                          value={tenantForm.settings.theme_color}
                          onChange={(e) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, theme_color: e.target.value }
                          }))}
                          className="w-20 h-11 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={tenantForm.settings.theme_color}
                          onChange={(e) => setTenantForm(prev => ({
                            ...prev,
                            settings: { ...prev.settings, theme_color: e.target.value }
                          }))}
                          placeholder="#3B82F6"
                          className="flex-1 font-mono"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Primary color for your brand (used in booking pages, emails, etc.)</p>
                    </div>
                  </div>

                  {/* Staff Position Templates */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Staff Position Templates
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Define position templates that will appear as suggestions when creating/updating staff members
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., Massage Therapist, Receptionist"
                          value={newStaffPosition}
                          onChange={(e) => setNewStaffPosition(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (newStaffPosition.trim() && !tenantForm.settings.staff_position_templates.includes(newStaffPosition.trim())) {
                                setTenantForm(prev => ({
                                  ...prev,
                                  settings: {
                                    ...prev.settings,
                                    staff_position_templates: [...prev.settings.staff_position_templates, newStaffPosition.trim()]
                                  }
                                }))
                                setNewStaffPosition("")
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            if (newStaffPosition.trim() && !tenantForm.settings.staff_position_templates.includes(newStaffPosition.trim())) {
                              setTenantForm(prev => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  staff_position_templates: [...prev.settings.staff_position_templates, newStaffPosition.trim()]
                                }
                              }))
                              setNewStaffPosition("")
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tenantForm.settings.staff_position_templates.map((position, index) => (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            {position}
                            <button
                              type="button"
                              onClick={() => {
                                setTenantForm(prev => ({
                                  ...prev,
                                  settings: {
                                    ...prev.settings,
                                    staff_position_templates: prev.settings.staff_position_templates.filter((_, i) => i !== index)
                                  }
                                }))
                              }}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {tenantForm.settings.staff_position_templates.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No position templates defined yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Service Category Templates */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Service Category Templates
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Define service categories that will appear as options when creating products/services
                    </p>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="e.g., massage, facial, hair_cut (lowercase with underscores)"
                          value={newServiceCategory}
                          onChange={(e) => setNewServiceCategory(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              const formatted = newServiceCategory.trim().toLowerCase().replace(/\s+/g, '_')
                              if (formatted && !tenantForm.settings.service_category_templates.includes(formatted)) {
                                setTenantForm(prev => ({
                                  ...prev,
                                  settings: {
                                    ...prev.settings,
                                    service_category_templates: [...prev.settings.service_category_templates, formatted]
                                  }
                                }))
                                setNewServiceCategory("")
                              }
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const formatted = newServiceCategory.trim().toLowerCase().replace(/\s+/g, '_')
                            if (formatted && !tenantForm.settings.service_category_templates.includes(formatted)) {
                              setTenantForm(prev => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  service_category_templates: [...prev.settings.service_category_templates, formatted]
                                }
                              }))
                              setNewServiceCategory("")
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tenantForm.settings.service_category_templates.map((category, index) => (
                          <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                            {category}
                            <button
                              type="button"
                              onClick={() => {
                                setTenantForm(prev => ({
                                  ...prev,
                                  settings: {
                                    ...prev.settings,
                                    service_category_templates: prev.settings.service_category_templates.filter((_, i) => i !== index)
                                  }
                                }))
                              }}
                              className="ml-2 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {tenantForm.settings.service_category_templates.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">No category templates defined yet</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button onClick={handleSaveTenant} disabled={savingTenant} size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      <Save className="h-4 w-4 mr-2" />
                      {savingTenant ? 'Saving...' : 'Save Organization Settings'}
                    </Button>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={tenantInfo.is_active ? "success" : "destructive"}>
                        {tenantInfo.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription & Billing */}
              {tenantInfo.subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-500" />
                      Subscription & Billing
                    </CardTitle>
                    <CardDescription>
                      Your current subscription plan and billing information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Plan Info */}
                        <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-600">Current Plan</span>
                            <Badge variant={getPlanBadgeColor(tenantInfo.subscription.plan)}>
                              {tenantInfo.subscription.plan.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Status</span>
                              <Badge variant={getStatusBadgeColor(tenantInfo.subscription.status)} className="text-xs">
                                {tenantInfo.subscription.status}
                              </Badge>
                            </div>
                            {tenantInfo.subscription.trial_ends_at && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Trial Ends</span>
                                <span className="font-medium">{formatDate(tenantInfo.subscription.trial_ends_at)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Billing Period */}
                        <div className="p-5 border-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-600">Billing Period</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Period Start</span>
                              <span className="font-medium">{formatDate(tenantInfo.subscription.current_period_start)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Period End</span>
                              <span className="font-medium">{formatDate(tenantInfo.subscription.current_period_end)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {tenantInfo.settings && (
                        <div className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Timezone</div>
                              <div className="text-sm font-semibold">{tenantInfo.settings.timezone}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Currency</div>
                              <div className="text-sm font-semibold">{tenantInfo.settings.currency}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Language</div>
                              <div className="text-sm font-semibold">{tenantInfo.settings.language.toUpperCase()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 mb-1">Business Type</div>
                              <div className="text-sm font-semibold capitalize">{tenantInfo.settings.business_type}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Partner ID */}
                      {tenantInfo.client_partner_id && (
                        <div className="p-4 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Paper.id Partner ID</span>
                              <p className="text-xs text-gray-500 mt-1">Payment gateway integration</p>
                            </div>
                            <code className="text-xs font-mono bg-white px-3 py-1 rounded border">
                              {tenantInfo.client_partner_id}
                            </code>
                          </div>
                        </div>
                      )}

                      {/* Timestamps */}
                      <div className="flex items-center gap-4 pt-2 text-xs text-gray-500 border-t">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Created: {formatDate(tenantInfo.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Updated: {formatDate(tenantInfo.updated_at)}</span>
                        </div>
                      </div>

                      {/* Upgrade Action */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        {tenantInfo.subscription.plan === 'free' && (
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
                            onClick={() => window.location.href = '/subscription/upgrade'}
                          >
                            <Crown className="h-5 w-5 mr-2" />
                            Upgrade to Premium
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => window.location.href = '/subscription/manage'}
                        >
                          Manage Subscription
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paper.id Payment Gateway Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Paper.id Payment Gateway
                  </CardTitle>
                  <CardDescription>
                    Configure Paper.id credentials for online payment links
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enable/Disable Toggle */}
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div>
                      <div className="font-medium text-gray-900">Enable Paper.id Integration</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Allow customers to pay via Paper.id payment links
                      </p>
                    </div>
                    <Switch
                      checked={paperIdForm.enabled}
                      onCheckedChange={(checked) => setPaperIdForm(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  {/* Configuration Status */}
                  {paperIdForm.enabled && (
                    <Alert className={paperIdForm.client_id && paperIdForm.client_secret ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
                      {paperIdForm.client_id && paperIdForm.client_secret ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            <span className="font-medium">Configured:</span> Paper.id integration is active and ready to use
                          </AlertDescription>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <AlertDescription className="text-yellow-800">
                            <span className="font-medium">Incomplete:</span> Please enter your Paper.id credentials below to enable payment links
                          </AlertDescription>
                        </>
                      )}
                    </Alert>
                  )}

                  {/* Credentials Form */}
                  {paperIdForm.enabled && (
                    <div className="space-y-4 pt-2">
                      {/* Environment Mode Toggle */}
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {paperIdForm.is_production ? (
                              <Badge className="bg-green-600 text-white">Production</Badge>
                            ) : (
                              <Badge variant="outline" className="border-orange-400 text-orange-700">Sandbox</Badge>
                            )}
                            Environment Mode
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {paperIdForm.is_production
                              ? "Using production mode - Real transactions will be processed"
                              : "Using sandbox mode - Test mode for development"}
                          </p>
                        </div>
                        <Switch
                          checked={paperIdForm.is_production}
                          onCheckedChange={(checked) => setPaperIdForm(prev => ({ ...prev, is_production: checked }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paperClientId" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-indigo-600" />
                          Client ID *
                        </Label>
                        <Input
                          id="paperClientId"
                          value={paperIdForm.client_id}
                          onChange={(e) => setPaperIdForm(prev => ({ ...prev, client_id: e.target.value }))}
                          placeholder="your-paper-id-client-id"
                          className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                          Get this from your Paper.id dashboard → Settings → API Keys
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paperClientSecret" className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-indigo-600" />
                          Client Secret *
                        </Label>
                        <div className="relative">
                          <Input
                            id="paperClientSecret"
                            type={showClientSecret ? "text" : "password"}
                            value={paperIdForm.client_secret}
                            onChange={(e) => setPaperIdForm(prev => ({ ...prev, client_secret: e.target.value }))}
                            placeholder="••••••••••••••••••••"
                            className="font-mono pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowClientSecret(!showClientSecret)}
                          >
                            {showClientSecret ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Keep this secret secure. Never share it publicly.
                        </p>
                      </div>

                      {/* Platform Fee Information */}
                      <div className="p-4 border rounded-lg bg-blue-50">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Platform Fees by Plan</h4>
                        <div className="space-y-1 text-xs text-blue-800">
                          <div className="flex justify-between">
                            <span>FREE Plan:</span>
                            <span className="font-medium">8% platform fee</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PRO Plan:</span>
                            <span className="font-medium">5% platform fee</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ENTERPRISE Plan:</span>
                            <span className="font-medium">3% platform fee</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2 italic">
                          Platform fees are automatically calculated and added to payment links
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Info Alert */}
                  {!paperIdForm.enabled && (
                    <Alert className="bg-gray-50 border-gray-200">
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                      <AlertDescription className="text-gray-700 text-sm">
                        <span className="font-medium">Paper.id Integration Disabled</span><br />
                        Enable this integration to allow customers to pay via online payment links with email, WhatsApp, and SMS notifications.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Save Button */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      onClick={handleSavePaperId}
                      disabled={savingPaperId || (paperIdForm.enabled && (!paperIdForm.client_id || !paperIdForm.client_secret))}
                      size="lg"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {savingPaperId ? 'Saving...' : 'Save Paper.id Configuration'}
                    </Button>
                    {paperIdForm.enabled && (!paperIdForm.client_id || !paperIdForm.client_secret) && (
                      <p className="text-sm text-red-600">
                        Both Client ID and Client Secret are required
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name</Label>
                  <Input
                    id="clinicName"
                    value={businessInfo.clinicName}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, clinicName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={businessInfo.phoneNumber}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={businessInfo.website}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operatingHours">Operating Hours</Label>
                  <Input
                    id="operatingHours"
                    value={businessInfo.operatingHours}
                    onChange={(e) => setBusinessInfo(prev => ({ ...prev, operatingHours: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleSaveBusinessInfo}>
                <Save className="h-4 w-4 mr-2" />
                Save Business Info
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch
                    checked={security.twoFactorAuth}
                    onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Select value={security.passwordExpiry} onValueChange={(value) => setSecurity(prev => ({ ...prev, passwordExpiry: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="180">180 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveSecurity}>
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
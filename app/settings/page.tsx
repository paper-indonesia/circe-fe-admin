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
import { Building, Shield, Save, Briefcase, Crown, Calendar, AlertCircle, Link2, FileText, Mail, Phone, Globe } from "lucide-react"
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
  }
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
      business_type: "spa"
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
              settings: tenantData.settings || {
                timezone: "Asia/Manila",
                currency: "PHP",
                language: "en",
                business_type: "spa"
              }
            })
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

                  <div className="flex items-center gap-3 pt-2">
                    <Button onClick={handleSaveTenant} disabled={savingTenant}>
                      <Save className="h-4 w-4 mr-2" />
                      {savingTenant ? 'Saving...' : 'Save Organization Info'}
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

                      {/* Action Alert */}
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">
                          To upgrade your plan or modify subscription settings, please contact support or use the subscription management endpoints.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}
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
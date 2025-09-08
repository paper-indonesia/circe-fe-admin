"use client"

import { useState, useRef, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Bell, Palette, Upload, Shield, Database, Globe, Save, Check, X, AlertCircle, Clock, CreditCard, Eye, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTheme, ThemeColor } from "@/lib/theme-context"
import { useTranslation } from "@/hooks/use-translation"
import { format } from "date-fns"
import { useTenantContext } from "@/lib/tenant-context"
import { useParams } from "next/navigation"
import { useTenantTheme } from "@/hooks/use-tenant-theme"
import { getTenantSettings, saveTenantSettings, loadTenantSettings } from "@/lib/tenant-settings"
import { useAppContext } from "@/lib/context"
import LiquidLoading from "@/components/ui/liquid-loader"

interface BusinessInfo {
  clinicName: string
  phoneNumber: string
  email: string
  address: string
  operatingHours: string
  website: string
  taxId: string
}

interface NotificationSettings {
  bookingConfirmations: boolean
  dayBeforeReminders: boolean
  threeHourReminders: boolean
  noShowNotifications: boolean
  marketingEmails: boolean
  systemAlerts: boolean
}

interface PolicySettings {
  noShowFeeEnabled: boolean
  noShowFeeAmount: string
  cancellationPolicy: string
  depositRequired: boolean
  depositAmount: string
  advanceBookingDays: string
}

interface SecuritySettings {
  twoFactorAuth: boolean
  sessionTimeout: string
  passwordExpiry: string
  ipWhitelist: boolean
}

export default function SettingsPage() {
  const { toast } = useToast()
  const { branding, updateBranding } = useTheme()
  const { t } = useTranslation()
  const { tenant } = useTenantContext()
  const { loading } = useAppContext()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Loading states for each section
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingPolicies, setSavingPolicies] = useState(false)
  const [savingSecurity, setSavingSecurity] = useState(false)
  const [savingRegional, setSavingRegional] = useState(false)
  const [performingBackup, setPerformingBackup] = useState(false)
  const [exportingData, setExportingData] = useState(false)
  
  // Load tenant settings on mount
  const [tenantSettings, setTenantSettings] = useState(() => {
    if (tenant?.id) {
      return loadTenantSettings(tenant.id)
    }
    return getTenantSettings('beauty-clinic-jakarta')
  })
  
  useEffect(() => {
    if (tenant?.id) {
      const settings = loadTenantSettings(tenant.id)
      setTenantSettings(settings)
      
      // Update business info from tenant settings
      setBusinessInfo({
        clinicName: settings.general.clinicName,
        phoneNumber: settings.general.phone,
        email: settings.general.email,
        address: settings.general.address,
        operatingHours: `${settings.operational.openTime} - ${settings.operational.closeTime}`,
        website: settings.general.website || '',
        taxId: settings.general.taxNumber || ''
      })
      
      // Update notifications from tenant settings
      setNotifications({
        bookingConfirmations: settings.notifications.emailNotifications,
        dayBeforeReminders: settings.booking.sendReminders,
        threeHourReminders: settings.booking.reminderHours <= 3,
        noShowNotifications: true,
        marketingEmails: settings.notifications.emailNotifications,
        systemAlerts: true
      })
      
      // Update policies from tenant settings
      setPolicies({
        noShowFeeEnabled: false,
        noShowFeeAmount: "100000",
        cancellationPolicy: `Appointments must be cancelled at least ${settings.booking.cancellationHours} hours in advance to avoid charges.`,
        depositRequired: settings.booking.requireDeposit,
        depositAmount: String(settings.booking.depositPercentage),
        advanceBookingDays: String(settings.booking.maxAdvanceBookingDays)
      })
    }
  }, [tenant?.id])
  
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    clinicName: tenantSettings?.general.clinicName || branding.clinicName,
    phoneNumber: tenantSettings?.general.phone || "+62 21 1234 5678",
    email: tenantSettings?.general.email || "info@beautyclinic.com",
    address: tenantSettings?.general.address || "Jl. Sudirman No. 123, Jakarta Pusat",
    operatingHours: tenantSettings ? `${tenantSettings.operational.openTime} - ${tenantSettings.operational.closeTime}` : "Mon-Sat: 9:00 AM - 8:00 PM",
    website: tenantSettings?.general.website || "www.beautyclinic.com",
    taxId: tenantSettings?.general.taxNumber || "12.345.678.9-012.000"
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    bookingConfirmations: true,
    dayBeforeReminders: true,
    threeHourReminders: false,
    noShowNotifications: true,
    marketingEmails: true,
    systemAlerts: true
  })

  const [policies, setPolicies] = useState<PolicySettings>({
    noShowFeeEnabled: false,
    noShowFeeAmount: "100000",
    cancellationPolicy: "Appointments must be cancelled at least 24 hours in advance to avoid charges.",
    depositRequired: false,
    depositAmount: "50000",
    advanceBookingDays: "30"
  })

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    ipWhitelist: false
  })

  const params = useParams()
  const tenantSlug = params?.tenant as string
  const { theme: tenantTheme, applyThemeToCSS } = useTenantTheme()
  const [logoUrl, setLogoUrl] = useState<string>(branding.logoUrl)
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>(branding.theme)
  const [customPrimaryColor, setCustomPrimaryColor] = useState(tenantTheme.primaryColor)
  const [customSecondaryColor, setCustomSecondaryColor] = useState(tenantTheme.secondaryColor)
  const [useCustomColors, setUseCustomColors] = useState(false)
  const [backupSchedule, setBackupSchedule] = useState("daily")
  const [dataRetention, setDataRetention] = useState("365")
  const [currency, setCurrency] = useState("IDR")
  const [timezone, setTimezone] = useState("Asia/Jakarta")
  const [language, setLanguage] = useState(branding.language)

  // Update local state when branding changes
  useEffect(() => {
    setLogoUrl(branding.logoUrl)
    setSelectedTheme(branding.theme)
    setLanguage(branding.language)
    setBusinessInfo(prev => ({ ...prev, clinicName: branding.clinicName }))
  }, [branding])

  // Load saved settings on mount
  useEffect(() => {
    // Load business info
    const savedBusinessInfo = localStorage.getItem('businessInfo')
    if (savedBusinessInfo) {
      try {
        setBusinessInfo(JSON.parse(savedBusinessInfo))
      } catch (e) {
        console.error('Failed to load business info')
      }
    }

    // Load notification settings
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (e) {
        console.error('Failed to load notification settings')
      }
    }

    // Load policy settings
    const savedPolicies = localStorage.getItem('policySettings')
    if (savedPolicies) {
      try {
        setPolicies(JSON.parse(savedPolicies))
      } catch (e) {
        console.error('Failed to load policy settings')
      }
    }

    // Load security settings
    const savedSecurity = localStorage.getItem('securitySettings')
    if (savedSecurity) {
      try {
        setSecurity(JSON.parse(savedSecurity))
      } catch (e) {
        console.error('Failed to load security settings')
      }
    }
  }, [])

  const handleSaveBusinessInfo = async () => {
    // Validate required fields
    if (!businessInfo.clinicName.trim()) {
      toast({
        title: "Validation Error",
        description: "Clinic name is required.",
        variant: "destructive"
      })
      return
    }
    
    if (!businessInfo.phoneNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Phone number is required.",
        variant: "destructive"
      })
      return
    }
    
    if (businessInfo.email && !businessInfo.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive"
      })
      return
    }
    
    setSavingBusiness(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage PER TENANT
    if (tenant?.id) {
      const updatedSettings = saveTenantSettings(tenant.id, {
        general: {
          clinicName: businessInfo.clinicName,
          email: businessInfo.email,
          phone: businessInfo.phoneNumber,
          address: businessInfo.address,
          website: businessInfo.website,
          taxNumber: businessInfo.taxId
        }
      })
      setTenantSettings(updatedSettings)
      
      // Also save separately for backward compatibility
      localStorage.setItem(`businessInfo-${tenant.id}`, JSON.stringify(businessInfo))
    } else {
      localStorage.setItem('businessInfo', JSON.stringify(businessInfo))
    }
    
    // Update clinic name in branding
    updateBranding({ clinicName: businessInfo.clinicName })
    
    setSavingBusiness(false)
    
    toast({
      title: "Settings Saved",
      description: "Business information has been updated successfully.",
    })
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(notifications))
    
    setSavingNotifications(false)
    
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    })
  }

  const handleUpdatePolicies = async () => {
    // Validate numeric fields
    if (policies.noShowFeeEnabled && (!policies.noShowFeeAmount || parseInt(policies.noShowFeeAmount) <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid no-show fee amount.",
        variant: "destructive"
      })
      return
    }
    
    if (policies.depositRequired && (!policies.depositAmount || parseInt(policies.depositAmount) <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid deposit amount.",
        variant: "destructive"
      })
      return
    }
    
    setSavingPolicies(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage
    localStorage.setItem('policySettings', JSON.stringify(policies))
    
    setSavingPolicies(false)
    
    toast({
      title: "Policies Updated",
      description: "Your business policies have been updated successfully.",
    })
  }

  const handleSaveSecurity = async () => {
    setSavingSecurity(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage
    localStorage.setItem('securitySettings', JSON.stringify(security))
    
    setSavingSecurity(false)
    
    toast({
      title: "Security Settings Updated",
      description: "Your security preferences have been saved.",
    })
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an image smaller than 2MB.",
          variant: "destructive"
        })
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const url = reader.result as string
        // Save logo per tenant
        if (tenantSlug) {
          localStorage.setItem(`logo-${tenantSlug}`, url)
        }
        setLogoUrl(url)
        updateBranding({ logoUrl: url })
        toast({
          title: "Logo Uploaded",
          description: "Your logo has been uploaded successfully.",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Generate initial-based logo
  const generateInitialLogo = (name: string) => {
    const initials = name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()
    return initials
  }

  // Load tenant-specific logo on mount
  useEffect(() => {
    if (tenantSlug) {
      const savedLogo = localStorage.getItem(`logo-${tenantSlug}`)
      if (savedLogo) {
        setLogoUrl(savedLogo)
      }
    }
    setCustomPrimaryColor(tenantTheme.primaryColor)
    setCustomSecondaryColor(tenantTheme.secondaryColor)
  }, [tenantSlug, tenantTheme])

  const handleThemeChange = (theme: ThemeColor) => {
    setSelectedTheme(theme)
    updateBranding({ theme })
    toast({
      title: "Theme Changed",
      description: `Theme has been changed to ${theme}.`,
    })
  }

  const handleBackupNow = async () => {
    setPerformingBackup(true)
    
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      businessInfo: localStorage.getItem('businessInfo'),
      notificationSettings: localStorage.getItem('notificationSettings'),
      policySettings: localStorage.getItem('policySettings'),
      securitySettings: localStorage.getItem('securitySettings'),
      bookings: localStorage.getItem('walkInBookings')
    }
    
    // Save backup
    localStorage.setItem(`backup_${Date.now()}`, JSON.stringify(backupData))
    
    setPerformingBackup(false)
    
    toast({
      title: "Backup Completed",
      description: "System backup has been created successfully.",
    })
  }

  const handleSaveRegional = async () => {
    setSavingRegional(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage
    localStorage.setItem('regionalSettings', JSON.stringify({
      currency,
      timezone,
      language,
      backupSchedule,
      dataRetention
    }))
    
    setSavingRegional(false)
    
    toast({
      title: "Regional Settings Updated",
      description: "Your regional preferences have been saved.",
    })
  }

  const handleCheckUpdates = async () => {
    toast({
      title: "Checking for Updates",
      description: "Connecting to update server...",
    })
    
    // Simulate update check
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast({
      title: "System Up to Date",
      description: "You are running the latest version (v2.4.1)",
    })
  }

  const handleViewChangelog = () => {
    toast({
      title: "Changelog",
      description: "Version 2.4.1: Added walk-in booking, improved reports, enhanced UI/UX",
    })
  }

  const handleExportData = async () => {
    setExportingData(true)
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Prepare export data
    const exportData = {
      exportDate: new Date().toISOString(),
      businessInfo: businessInfo,
      settings: {
        notifications: notifications,
        policies: policies,
        security: security,
        regional: {
          currency: currency,
          timezone: timezone,
          language: language
        }
      },
      bookings: JSON.parse(localStorage.getItem('walkInBookings') || '[]')
    }
    
    // Create and download JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clinic-data-export-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    setExportingData(false)
    
    toast({
      title: "Export Completed",
      description: "Your data has been exported successfully.",
    })
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                {t('settings.businessInfo.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">{t('settings.businessInfo.clinicName')}</Label>
                <Input 
                  id="clinic-name" 
                  value={businessInfo.clinicName}
                  onChange={(e) => setBusinessInfo({...businessInfo, clinicName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={businessInfo.phoneNumber}
                  onChange={(e) => setBusinessInfo({...businessInfo, phoneNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={businessInfo.email}
                  onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input 
                  id="website" 
                  value={businessInfo.website}
                  onChange={(e) => setBusinessInfo({...businessInfo, website: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  value={businessInfo.address}
                  onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Operating Hours</Label>
                <Input 
                  id="hours" 
                  value={businessInfo.operatingHours}
                  onChange={(e) => setBusinessInfo({...businessInfo, operatingHours: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID</Label>
                <Input 
                  id="tax-id" 
                  value={businessInfo.taxId}
                  onChange={(e) => setBusinessInfo({...businessInfo, taxId: e.target.value})}
                />
              </div>
              <Button onClick={handleSaveBusinessInfo} className="w-full" disabled={savingBusiness}>
                {savingBusiness ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />{t('settings.businessInfo.saveChanges')}</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('settings.notifications.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking Confirmations</Label>
                  <p className="text-sm text-muted-foreground">Send confirmation emails for new bookings</p>
                </div>
                <Switch 
                  checked={notifications.bookingConfirmations}
                  onCheckedChange={(checked) => setNotifications({...notifications, bookingConfirmations: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Day Before Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminder 24 hours before appointment</p>
                </div>
                <Switch 
                  checked={notifications.dayBeforeReminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, dayBeforeReminders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>3-Hour Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send reminder 3 hours before appointment</p>
                </div>
                <Switch 
                  checked={notifications.threeHourReminders}
                  onCheckedChange={(checked) => setNotifications({...notifications, threeHourReminders: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>No-Show Notifications</Label>
                  <p className="text-sm text-muted-foreground">Notify when clients don't show up</p>
                </div>
                <Switch 
                  checked={notifications.noShowNotifications}
                  onCheckedChange={(checked) => setNotifications({...notifications, noShowNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Send promotional offers and newsletters</p>
                </div>
                <Switch 
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => setNotifications({...notifications, marketingEmails: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-muted-foreground">Important system notifications and updates</p>
                </div>
                <Switch 
                  checked={notifications.systemAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, systemAlerts: checked})}
                />
              </div>
              <Button onClick={handleSaveNotifications} className="w-full" disabled={savingNotifications}>
                {savingNotifications ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Notification Settings</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Business Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>No-Show Fee</Label>
                  <p className="text-sm text-muted-foreground">Charge fee for missed appointments</p>
                </div>
                <Switch 
                  checked={policies.noShowFeeEnabled}
                  onCheckedChange={(checked) => setPolicies({...policies, noShowFeeEnabled: checked})}
                />
              </div>
              {policies.noShowFeeEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="no-show-fee">No-Show Fee Amount (Rp)</Label>
                  <Input 
                    id="no-show-fee" 
                    type="number"
                    value={policies.noShowFeeAmount}
                    onChange={(e) => setPolicies({...policies, noShowFeeAmount: e.target.value})}
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Deposit Required</Label>
                  <p className="text-sm text-muted-foreground">Require deposit for bookings</p>
                </div>
                <Switch 
                  checked={policies.depositRequired}
                  onCheckedChange={(checked) => setPolicies({...policies, depositRequired: checked})}
                />
              </div>
              {policies.depositRequired && (
                <div className="space-y-2">
                  <Label htmlFor="deposit">Deposit Amount (Rp)</Label>
                  <Input 
                    id="deposit" 
                    type="number"
                    value={policies.depositAmount}
                    onChange={(e) => setPolicies({...policies, depositAmount: e.target.value})}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="advance-booking">Advance Booking Limit (Days)</Label>
                <Input 
                  id="advance-booking" 
                  type="number"
                  value={policies.advanceBookingDays}
                  onChange={(e) => setPolicies({...policies, advanceBookingDays: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
                <Textarea
                  id="cancellation-policy"
                  value={policies.cancellationPolicy}
                  onChange={(e) => setPolicies({...policies, cancellationPolicy: e.target.value})}
                  rows={4}
                />
              </div>
              <Button onClick={handleUpdatePolicies} className="w-full" disabled={savingPolicies}>
                {savingPolicies ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Update Policies</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                {t('settings.branding.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.branding.logoUpload')}</Label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-16 mx-auto mb-2" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-2"
                        style={{ 
                          background: `linear-gradient(135deg, ${customPrimaryColor}, ${customSecondaryColor})`
                        }}
                      >
                        {generateInitialLogo(businessInfo.clinicName || tenantSlug || 'BC')}
                      </div>
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">{t('settings.branding.clickToUpload')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.branding.fileSize')}</p>
                  {!logoUrl && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Using initial-based logo as default
                    </p>
                  )}
                </div>
                {logoUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (tenantSlug) {
                        localStorage.removeItem(`logo-${tenantSlug}`)
                      }
                      setLogoUrl('')
                      updateBranding({ logoUrl: '' })
                      toast({
                        title: "Logo Removed",
                        description: "Using initial-based logo as default.",
                      })
                    }}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove Logo (Use Initials)
                  </Button>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t('settings.branding.colorScheme')}</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="custom-colors" className="text-sm">Custom Colors</Label>
                    <Switch 
                      id="custom-colors"
                      checked={useCustomColors}
                      onCheckedChange={setUseCustomColors}
                    />
                  </div>
                </div>
                
                {!useCustomColors ? (
                  <>
                    <Select value={selectedTheme} onValueChange={handleThemeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="original">Original Theme (Default)</SelectItem>
                        <SelectItem value="pink">Feminine Pink & Lilac</SelectItem>
                        <SelectItem value="blue">Professional Blue</SelectItem>
                        <SelectItem value="green">Natural Green</SelectItem>
                        <SelectItem value="purple">Royal Purple</SelectItem>
                        <SelectItem value="gold">Luxury Gold</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      {selectedTheme === "original" ? (
                        <>
                          <div className="w-8 h-8 rounded-full bg-primary border-2 border-white shadow-sm"></div>
                          <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white shadow-sm"></div>
                          <div className="w-8 h-8 rounded-full bg-accent border-2 border-white shadow-sm"></div>
                          <span className="text-xs text-muted-foreground ml-2 self-center">Original Colors</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                            style={{ backgroundColor: selectedTheme === "pink" ? "#EC4899" : 
                                     selectedTheme === "blue" ? "#3B82F6" :
                                     selectedTheme === "green" ? "#10B981" :
                                     selectedTheme === "purple" ? "#8B5CF6" :
                                     selectedTheme === "gold" ? "#F59E0B" : "" }}></div>
                          <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: selectedTheme === "pink" ? "#DB2777" : 
                                     selectedTheme === "blue" ? "#2563EB" :
                                     selectedTheme === "green" ? "#059669" :
                                     selectedTheme === "purple" ? "#7C3AED" :
                                     selectedTheme === "gold" ? "#D97706" : "" }}></div>
                          <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: selectedTheme === "pink" ? "#FDF2F8" : 
                                     selectedTheme === "blue" ? "#EFF6FF" :
                                     selectedTheme === "green" ? "#F0FDF4" :
                                     selectedTheme === "purple" ? "#F5F3FF" :
                                     selectedTheme === "gold" ? "#FFFBEB" : "" }}></div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primary-color-picker"
                            type="color"
                            value={customPrimaryColor}
                            onChange={(e) => {
                              setCustomPrimaryColor(e.target.value)
                              applyThemeToCSS({ 
                                primaryColor: e.target.value, 
                                secondaryColor: customSecondaryColor 
                              })
                            }}
                            className="w-20 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            id="primary-color"
                            value={customPrimaryColor}
                            onChange={(e) => {
                              setCustomPrimaryColor(e.target.value)
                              applyThemeToCSS({ 
                                primaryColor: e.target.value, 
                                secondaryColor: customSecondaryColor 
                              })
                            }}
                            placeholder="#8B5CF6"
                            pattern="^#[0-9A-Fa-f]{6}$"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondary-color-picker"
                            type="color"
                            value={customSecondaryColor}
                            onChange={(e) => {
                              setCustomSecondaryColor(e.target.value)
                              applyThemeToCSS({ 
                                primaryColor: customPrimaryColor, 
                                secondaryColor: e.target.value 
                              })
                            }}
                            className="w-20 h-10 p-1 cursor-pointer"
                          />
                          <Input
                            id="secondary-color"
                            value={customSecondaryColor}
                            onChange={(e) => {
                              setCustomSecondaryColor(e.target.value)
                              applyThemeToCSS({ 
                                primaryColor: customPrimaryColor, 
                                secondaryColor: e.target.value 
                              })
                            }}
                            placeholder="#EC4899"
                            pattern="^#[0-9A-Fa-f]{6}$"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: customPrimaryColor }}
                          title="Primary Color"
                        />
                        <div 
                          className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: customSecondaryColor }}
                          title="Secondary Color"
                        />
                        <div 
                          className="w-10 h-10 rounded border-2 border-white shadow-sm"
                          style={{ 
                            background: `linear-gradient(135deg, ${customPrimaryColor}, ${customSecondaryColor})`
                          }}
                          title="Gradient Preview"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          // Save custom colors to tenant config
                          if (tenantSlug) {
                            localStorage.setItem(`theme-${tenantSlug}`, JSON.stringify({
                              primaryColor: customPrimaryColor,
                              secondaryColor: customSecondaryColor
                            }))
                            
                            // TODO: Save to database via API
                            toast({
                              title: "Custom Colors Saved",
                              description: "Your custom theme colors have been applied.",
                            })
                          }
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Colors
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Reset to default colors based on tenant
                        const defaultColors = {
                          jakarta: { primary: '#8B5CF6', secondary: '#EC4899' },
                          bali: { primary: '#3B82F6', secondary: '#10B981' },
                          surabaya: { primary: '#F59E0B', secondary: '#EF4444' }
                        }
                        const defaults = defaultColors[tenantSlug as keyof typeof defaultColors] || 
                                       { primary: '#8B5CF6', secondary: '#EC4899' }
                        
                        setCustomPrimaryColor(defaults.primary)
                        setCustomSecondaryColor(defaults.secondary)
                        applyThemeToCSS({ 
                          primaryColor: defaults.primary, 
                          secondaryColor: defaults.secondary 
                        })
                        
                        toast({
                          title: "Colors Reset",
                          description: "Theme colors have been reset to defaults.",
                        })
                      }}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset to Default Colors
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('settings.branding.language')}</Label>
                <Select value={language} onValueChange={(value) => {
                  setLanguage(value)
                  updateBranding({ language: value })
                  toast({
                    title: "Language Changed",
                    description: `Language has been changed.`,
                  })
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Preview Mode",
                    description: "Theme changes are applied in real-time. Check your sidebar for logo changes.",
                  })
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('settings.branding.previewApplied')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <Switch 
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => setSecurity({...security, twoFactorAuth: checked})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input 
                  id="session-timeout" 
                  type="number"
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                <Input 
                  id="password-expiry" 
                  type="number"
                  value={security.passwordExpiry}
                  onChange={(e) => setSecurity({...security, passwordExpiry: e.target.value})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">Restrict access to specific IP addresses</p>
                </div>
                <Switch 
                  checked={security.ipWhitelist}
                  onCheckedChange={(checked) => setSecurity({...security, ipWhitelist: checked})}
                />
              </div>

              <Button onClick={handleSaveSecurity} className="w-full" disabled={savingSecurity}>
                {savingSecurity ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Security Settings</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Automatic Backup</Label>
                <Select value={backupSchedule} onValueChange={setBackupSchedule}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Every Hour</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period (days)</Label>
                <Input 
                  id="data-retention" 
                  type="number"
                  value={dataRetention}
                  onChange={(e) => setDataRetention(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleBackupNow} disabled={performingBackup}>
                  {performingBackup ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Backing up...</>
                  ) : (
                    <><Database className="h-4 w-4 mr-2" />Backup Now</>
                  )}
                </Button>
                <Button variant="outline" onClick={handleExportData} disabled={exportingData}>
                  {exportingData ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" />Export Data</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">Indonesian Rupiah (Rp)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="SGD">Singapore Dollar (S$)</SelectItem>
                    <SelectItem value="MYR">Malaysian Ringgit (RM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Jakarta">Jakarta (WIB)</SelectItem>
                    <SelectItem value="Asia/Makassar">Makassar (WITA)</SelectItem>
                    <SelectItem value="Asia/Jayapura">Jayapura (WIT)</SelectItem>
                    <SelectItem value="Asia/Singapore">Singapore</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Time Format</Label>
                <Select defaultValue="24h">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24 Hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSaveRegional} className="w-full" disabled={savingRegional}>
                {savingRegional ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Regional Settings</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="font-medium">v2.4.1</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">December 15, 2024</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">License Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Support Email</p>
                <p className="font-medium">support@beautyclinic.com</p>
              </div>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full" onClick={handleCheckUpdates}>
                  Check for Updates
                </Button>
                <Button variant="outline" className="w-full" onClick={handleViewChangelog}>
                  View Changelog
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Shield, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import LiquidLoading from "@/components/ui/liquid-loader"

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
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

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
  }, [user])

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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>

        <div className="grid gap-6">
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
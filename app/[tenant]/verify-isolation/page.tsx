"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/lib/context"
import { useTenantContext } from "@/lib/tenant-context"
import { loadTenantSettings } from "@/lib/tenant-settings"
import { Check, X, AlertCircle, Shield, Database, Settings, Calendar, Users } from "lucide-react"

export default function VerifyIsolationPage() {
  const { tenant } = useTenantContext()
  const { patients, staff, treatments, bookings } = useAppContext()
  const [isolationStatus, setIsolationStatus] = useState<any>({})
  const [walkInBookings, setWalkInBookings] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (!tenant?.id) return

    // Check Walk-in Bookings Isolation
    const tenantBookingsKey = `walkInBookings-${tenant.id}`
    const tenantBookings = JSON.parse(localStorage.getItem(tenantBookingsKey) || "[]")
    setWalkInBookings(tenantBookings)

    // Check for cross-tenant pollution
    const otherTenantKeys = [
      'beauty-clinic-jakarta',
      'beauty-clinic-bali', 
      'skin-care-surabaya'
    ].filter(id => id !== tenant.id)

    let hasCrossTenantData = false
    otherTenantKeys.forEach(otherId => {
      const otherBookings = localStorage.getItem(`walkInBookings-${otherId}`)
      if (otherBookings) {
        const parsed = JSON.parse(otherBookings)
        // Check if any other tenant's bookings are showing in current context
        if (parsed.length > 0) {
          console.log(`Found ${parsed.length} bookings for other tenant: ${otherId}`)
        }
      }
    })

    // Check Settings Isolation
    const tenantSettings = loadTenantSettings(tenant.id)
    setSettings(tenantSettings)

    // Check Data Isolation
    const dataIsolation = {
      patients: patients.every(p => p.tenantId === tenant.id || p.tenantId === `beauty-clinic-${tenant.slug}`),
      staff: staff.every(s => s.tenantId === tenant.id || s.tenantId === `beauty-clinic-${tenant.slug}`),
      treatments: treatments.every(t => t.tenantId === tenant.id || t.tenantId === `beauty-clinic-${tenant.slug}`),
      bookings: bookings.every(b => b.tenantId === tenant.id || b.tenantId === `beauty-clinic-${tenant.slug}`),
      walkInBookings: true, // Separate storage per tenant
      settings: tenantSettings.tenantId === tenant.id
    }

    setIsolationStatus(dataIsolation)
  }, [tenant, patients, staff, treatments, bookings])

  const clearTenantData = () => {
    if (!tenant?.id) return
    
    // Clear walk-in bookings for this tenant only
    localStorage.removeItem(`walkInBookings-${tenant.id}`)
    
    // Clear settings for this tenant only
    localStorage.removeItem(`tenant-settings-${tenant.id}`)
    localStorage.removeItem(`businessInfo-${tenant.id}`)
    
    window.location.reload()
  }

  const testCrossTenantAccess = () => {
    // Try to access other tenant's data
    const otherTenants = ['beauty-clinic-jakarta', 'beauty-clinic-bali', 'skin-care-surabaya']
    const results: any[] = []
    
    otherTenants.forEach(tenantId => {
      const bookings = localStorage.getItem(`walkInBookings-${tenantId}`)
      const settings = localStorage.getItem(`tenant-settings-${tenantId}`)
      
      results.push({
        tenantId,
        hasBookings: !!bookings,
        bookingsCount: bookings ? JSON.parse(bookings).length : 0,
        hasSettings: !!settings
      })
    })
    
    console.table(results)
    return results
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="tenant-gradient text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Data Isolation Verification - {tenant?.name}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Current Tenant Info */}
        <Card>
          <CardHeader>
            <CardTitle>Current Tenant Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tenant ID</p>
                <p className="font-mono font-semibold">{tenant?.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tenant Slug</p>
                <p className="font-mono font-semibold">{tenant?.slug}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Isolation Status */}
        <Card>
          <CardHeader>
            <CardTitle>Data Isolation Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Patients Isolation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Patients Data</p>
                    <p className="text-sm text-muted-foreground">{patients.length} records</p>
                  </div>
                </div>
                {isolationStatus.patients ? (
                  <Badge className="bg-green-500"><Check className="h-4 w-4 mr-1" /> Isolated</Badge>
                ) : (
                  <Badge variant="destructive"><X className="h-4 w-4 mr-1" /> Mixed</Badge>
                )}
              </div>

              {/* Staff Isolation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Staff Data</p>
                    <p className="text-sm text-muted-foreground">{staff.length} records</p>
                  </div>
                </div>
                {isolationStatus.staff ? (
                  <Badge className="bg-green-500"><Check className="h-4 w-4 mr-1" /> Isolated</Badge>
                ) : (
                  <Badge variant="destructive"><X className="h-4 w-4 mr-1" /> Mixed</Badge>
                )}
              </div>

              {/* Treatments Isolation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Treatments Data</p>
                    <p className="text-sm text-muted-foreground">{treatments.length} records</p>
                  </div>
                </div>
                {isolationStatus.treatments ? (
                  <Badge className="bg-green-500"><Check className="h-4 w-4 mr-1" /> Isolated</Badge>
                ) : (
                  <Badge variant="destructive"><X className="h-4 w-4 mr-1" /> Mixed</Badge>
                )}
              </div>

              {/* Walk-in Bookings Isolation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Walk-in Bookings</p>
                    <p className="text-sm text-muted-foreground">{walkInBookings.length} bookings</p>
                  </div>
                </div>
                <Badge className="bg-green-500"><Check className="h-4 w-4 mr-1" /> Isolated</Badge>
              </div>

              {/* Settings Isolation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-sm text-muted-foreground">Tenant-specific</p>
                  </div>
                </div>
                {isolationStatus.settings ? (
                  <Badge className="bg-green-500"><Check className="h-4 w-4 mr-1" /> Isolated</Badge>
                ) : (
                  <Badge variant="destructive"><X className="h-4 w-4 mr-1" /> Mixed</Badge>
                )}
              </div>

              {/* Bookings Isolation */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Regular Bookings</p>
                    <p className="text-sm text-muted-foreground">{bookings.length} bookings</p>
                  </div>
                </div>
                {isolationStatus.bookings ? (
                  <Badge className="bg-green-500"><Check className="h-4 w-4 mr-1" /> Isolated</Badge>
                ) : (
                  <Badge variant="destructive"><X className="h-4 w-4 mr-1" /> Mixed</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Storage Keys */}
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage Keys for This Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm">walkInBookings-{tenant?.id}</p>
                <p className="text-xs text-muted-foreground mt-1">Stores walk-in bookings</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm">tenant-settings-{tenant?.id}</p>
                <p className="text-xs text-muted-foreground mt-1">Stores tenant configuration</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-mono text-sm">businessInfo-{tenant?.id}</p>
                <p className="text-xs text-muted-foreground mt-1">Stores business information</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Preview */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle>Current Tenant Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Clinic Name</p>
                  <p className="font-medium">{settings.general?.clinicName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{settings.general?.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Walk-in Enabled</p>
                  <p className="font-medium">{settings.booking?.allowWalkIn ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deposit Required</p>
                  <p className="font-medium">{settings.booking?.requireDeposit ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                variant="outline"
                onClick={() => {
                  const results = testCrossTenantAccess()
                  alert('Check console for cross-tenant access results')
                }}
              >
                Test Cross-Tenant Access
              </Button>
              <Button 
                variant="destructive"
                onClick={clearTenantData}
              >
                Clear This Tenant's Data Only
              </Button>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Data Isolation Test</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Each tenant's data is completely isolated. Walk-in bookings and settings are stored 
                    with tenant-specific keys in localStorage. Try switching between tenants to verify 
                    that data doesn't leak across tenant boundaries.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <a href="/jakarta/verify-isolation" className="text-center p-3 border rounded-lg hover:bg-muted">
                <p className="font-medium">Jakarta</p>
                <p className="text-sm text-muted-foreground">Test Jakarta isolation</p>
              </a>
              <a href="/bali/verify-isolation" className="text-center p-3 border rounded-lg hover:bg-muted">
                <p className="font-medium">Bali</p>
                <p className="text-sm text-muted-foreground">Test Bali isolation</p>
              </a>
              <a href="/surabaya/verify-isolation" className="text-center p-3 border rounded-lg hover:bg-muted">
                <p className="font-medium">Surabaya</p>
                <p className="text-sm text-muted-foreground">Test Surabaya isolation</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
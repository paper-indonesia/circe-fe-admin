"use client"

import { useTenantContext } from "@/lib/tenant-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TenantDemoPage({
  params
}: {
  params: { tenant: string }
}) {
  const { tenant, isLoading } = useTenantContext()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Tenant Header with Gradient */}
        <div className="tenant-header mb-8">
          <h1 className="text-3xl font-bold">{tenant?.name || 'Default'} - Tenant Demo</h1>
          <p className="text-white/90">Tenant ID: {tenant?.id}</p>
          <p className="text-white/90">Tenant Slug: {tenant?.slug}</p>
        </div>

        {/* Color Display */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Colors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Primary Color</p>
                <div 
                  className="w-full h-24 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: tenant?.theme?.primaryColor }}
                >
                  {tenant?.theme?.primaryColor}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Secondary Color</p>
                <div 
                  className="w-full h-24 rounded-lg shadow-md flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: tenant?.theme?.secondaryColor }}
                >
                  {tenant?.theme?.secondaryColor}
                </div>
              </div>
            </div>
            
            {/* Gradient Preview */}
            <div>
              <p className="text-sm font-medium mb-2">Gradient</p>
              <div className="tenant-gradient w-full h-24 rounded-lg shadow-md"></div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Tenant Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant={tenant?.features?.walkIn ? "default" : "secondary"}>
                Walk-in: {tenant?.features?.walkIn ? "✅ Enabled" : "❌ Disabled"}
              </Badge>
              <Badge variant={tenant?.features?.reporting ? "default" : "secondary"}>
                Reporting: {tenant?.features?.reporting ? "✅ Enabled" : "❌ Disabled"}
              </Badge>
              <Badge variant={tenant?.features?.multipleLocations ? "default" : "secondary"}>
                Multiple Locations: {tenant?.features?.multipleLocations ? "✅ Enabled" : "❌ Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Button Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Themed Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                className="bg-[var(--tenant-primary)] hover:opacity-90 text-white"
              >
                Primary Button
              </Button>
              <Button 
                className="bg-[var(--tenant-secondary)] hover:opacity-90 text-white"
              >
                Secondary Button
              </Button>
              <Button variant="outline" className="border-[var(--tenant-primary)] text-[var(--tenant-primary)]">
                Outline Button
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Badge className="bg-[var(--tenant-primary)] text-white">Primary Badge</Badge>
              <Badge className="bg-[var(--tenant-secondary)] text-white">Secondary Badge</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <Card>
          <CardHeader>
            <CardTitle>Test Other Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <a href="/jakarta/demo">
                <Button variant="outline">Jakarta Tenant</Button>
              </a>
              <a href="/bali/demo">
                <Button variant="outline">Bali Tenant</Button>
              </a>
              <a href="/surabaya/demo">
                <Button variant="outline">Surabaya Tenant</Button>
              </a>
              <a href="/default/demo">
                <Button variant="outline">Default Tenant</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
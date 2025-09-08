"use client"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Database, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useTenantContext } from "@/lib/tenant-context"

export default function TestMongoPage({ params }: { params: { tenant: string } }) {
  const { tenant } = useTenantContext()
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    if (!tenant) return
    
    setLoading(true)
    const results: any = {}
    
    // Set tenant for API client
    apiClient.setTenant(tenant.id)
    
    // Test 1: Fetch Patients
    try {
      const patients = await apiClient.getPatients()
      results.patients = {
        success: true,
        count: patients.length,
        message: `Successfully fetched ${patients.length} patients for ${tenant.name}`,
        data: patients.slice(0, 3) // Show first 3
      }
    } catch (error: any) {
      results.patients = {
        success: false,
        message: `Failed to fetch patients: ${error.message}`
      }
    }
    
    // Test 2: Fetch Staff
    try {
      const staff = await apiClient.getStaff()
      results.staff = {
        success: true,
        count: staff.length,
        message: `Successfully fetched ${staff.length} staff members for ${tenant.name}`,
        data: staff.slice(0, 3)
      }
    } catch (error: any) {
      results.staff = {
        success: false,
        message: `Failed to fetch staff: ${error.message}`
      }
    }
    
    // Test 3: Fetch Treatments
    try {
      const treatments = await apiClient.getTreatments()
      results.treatments = {
        success: true,
        count: treatments.length,
        message: `Successfully fetched ${treatments.length} treatments for ${tenant.name}`,
        data: treatments.slice(0, 3)
      }
    } catch (error: any) {
      results.treatments = {
        success: false,
        message: `Failed to fetch treatments: ${error.message}`
      }
    }
    
    // Test 4: Fetch Bookings
    try {
      const bookings = await apiClient.getBookings()
      results.bookings = {
        success: true,
        count: bookings.length,
        message: `Successfully fetched ${bookings.length} bookings for ${tenant.name}`,
        data: bookings.slice(0, 3)
      }
    } catch (error: any) {
      results.bookings = {
        success: false,
        message: `Failed to fetch bookings: ${error.message}`
      }
    }
    
    // Test 5: Fetch Walk-in Bookings
    try {
      const walkInBookings = await apiClient.getWalkInBookings()
      results.walkInBookings = {
        success: true,
        count: walkInBookings.length,
        message: `Successfully fetched ${walkInBookings.length} walk-in bookings for ${tenant.name}`,
        data: walkInBookings.slice(0, 3)
      }
    } catch (error: any) {
      results.walkInBookings = {
        success: false,
        message: `Failed to fetch walk-in bookings: ${error.message}`
      }
    }
    
    setTestResults(results)
    setLoading(false)
  }
  
  useEffect(() => {
    if (tenant) {
      runTests()
    }
  }, [tenant])

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MongoDB Integration Test</h1>
            <p className="text-muted-foreground">Testing database connection for {tenant?.name}</p>
          </div>
          <Button onClick={runTests} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Database: paper-circe
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Collection: beauty_clinic
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  Tenant: {tenant?.id}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(testResults).map(([key, result]: [string, any]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                  {result.count !== undefined && (
                    <Badge variant="secondary">Count: {result.count}</Badge>
                  )}
                  {result.data && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold">Sample Data:</p>
                      <div className="space-y-1">
                        {result.data.map((item: any, idx: number) => (
                          <div key={idx} className="text-xs bg-muted p-2 rounded">
                            {item.name || item.patientName || item.treatmentName || JSON.stringify(item).slice(0, 100)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {Object.keys(testResults).length === 0 && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-2">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Click "Run Tests" to start testing MongoDB integration</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
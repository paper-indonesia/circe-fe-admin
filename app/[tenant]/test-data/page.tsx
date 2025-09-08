"use client"

import { useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/lib/context"
import { useTenantContext } from "@/lib/tenant-context"
import { usePathname } from "next/navigation"

export default function TestDataPage() {
  const pathname = usePathname()
  const { tenant } = useTenantContext()
  const { patients, staff, treatments, bookings, loading } = useAppContext()

  useEffect(() => {
    console.log("Current pathname:", pathname)
    console.log("Current tenant:", tenant)
    console.log("Patients data:", patients)
    console.log("Staff data:", staff)
    console.log("Treatments data:", treatments)
    console.log("Bookings count:", bookings?.length)
  }, [pathname, tenant, patients, staff, treatments, bookings])

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">Loading data...</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Debug - {tenant?.name || 'Unknown Tenant'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Pathname:</h3>
                <pre className="bg-gray-100 p-2 rounded">{pathname}</pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Tenant Info:</h3>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(tenant, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold">Data Count:</h3>
                <ul className="list-disc ml-5">
                  <li>Patients: {patients?.length || 0}</li>
                  <li>Staff: {staff?.length || 0}</li>
                  <li>Treatments: {treatments?.length || 0}</li>
                  <li>Bookings: {bookings?.length || 0}</li>
                </ul>
              </div>

              {patients && patients.length > 0 && (
                <div>
                  <h3 className="font-semibold">Sample Patients (first 3):</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(patients.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}

              {staff && staff.length > 0 && (
                <div>
                  <h3 className="font-semibold">Sample Staff (first 2):</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(staff.slice(0, 2), null, 2)}
                  </pre>
                </div>
              )}

              {treatments && treatments.length > 0 && (
                <div>
                  <h3 className="font-semibold">Sample Treatments (first 3):</h3>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(treatments.slice(0, 3), null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
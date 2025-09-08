"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppContext } from "@/lib/context"
import { useTenantContext } from "@/lib/tenant-context"
import { formatCurrency } from "@/lib/utils"
import { Users, UserCheck, Star, Calendar } from "lucide-react"

export default function TenantInfoPage() {
  const { tenant } = useTenantContext()
  const { patients, staff, treatments, bookings, loading } = useAppContext()

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6">Loading tenant data...</div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Tenant Header */}
        <div className="tenant-gradient p-6 rounded-lg text-white">
          <h1 className="text-3xl font-bold mb-2">{tenant?.name}</h1>
          <p className="text-white/90">Tenant ID: {tenant?.id}</p>
          <div className="flex gap-4 mt-4">
            <Badge className="bg-white/20 text-white">
              Walk-in: {tenant?.features?.walkIn ? "✅ Enabled" : "❌ Disabled"}
            </Badge>
            <Badge className="bg-white/20 text-white">
              Multiple Locations: {tenant?.features?.multipleLocations ? "✅" : "❌"}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff Members</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treatments</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{treatments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Patients List */}
        <Card>
          <CardHeader>
            <CardTitle>Patients ({patients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patients.slice(0, 5).map(patient => (
                <div key={patient.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">{patient.phone} • {patient.email}</p>
                  </div>
                  <Badge variant="secondary">
                    {patient.totalVisits} visits
                  </Badge>
                </div>
              ))}
              {patients.length === 0 && (
                <p className="text-muted-foreground">No patients found for this tenant</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members ({staff.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.map(member => (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex gap-1 mt-2">
                        {member.skills?.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {member.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{member.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {staff.length === 0 && (
                <p className="text-muted-foreground col-span-2">No staff found for this tenant</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Treatments List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Treatments ({treatments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map(treatment => (
                <div key={treatment.id} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{treatment.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{treatment.category}</p>
                  <p className="text-xs mb-2">{treatment.description}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{treatment.durationMin} min</Badge>
                    <span className="font-bold text-primary">
                      {formatCurrency(treatment.price)}
                    </span>
                  </div>
                </div>
              ))}
              {treatments.length === 0 && (
                <p className="text-muted-foreground col-span-3">No treatments found for this tenant</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Test Other Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <a href="/jakarta/tenant-info" className="p-4 border rounded-lg hover:bg-muted text-center">
                <p className="font-semibold">Jakarta</p>
                <p className="text-sm text-muted-foreground">High-end Clinic</p>
              </a>
              <a href="/bali/tenant-info" className="p-4 border rounded-lg hover:bg-muted text-center">
                <p className="font-semibold">Bali</p>
                <p className="text-sm text-muted-foreground">Resort Spa</p>
              </a>
              <a href="/surabaya/tenant-info" className="p-4 border rounded-lg hover:bg-muted text-center">
                <p className="font-semibold">Surabaya</p>
                <p className="text-sm text-muted-foreground">Medical Aesthetic</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
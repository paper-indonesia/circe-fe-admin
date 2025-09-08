import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Shield, Users, Calendar, Star, ChevronRight } from "lucide-react"
import Link from "next/link"
import connectMongoDB from "@/lib/mongodb"
import Tenant from "@/models/Tenant"

async function getTenants() {
  try {
    await connectMongoDB()
    const tenants = await Tenant.findActive()
    
    if (tenants && tenants.length > 0) {
      return tenants.map(tenant => ({
        name: tenant.name,
        slug: tenant.slug,
        color: 
          tenant.slug === 'jakarta' ? "from-purple-600 to-pink-600" :
          tenant.slug === 'bali' ? "from-blue-600 to-teal-600" :
          tenant.slug === 'surabaya' ? "from-orange-600 to-red-600" :
          "from-indigo-600 to-purple-600"
      }))
    }
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
  }
  
  return [
    { name: "Jakarta", slug: "jakarta", color: "from-purple-600 to-pink-600" },
    { name: "Bali", slug: "bali", color: "from-blue-600 to-teal-600" },
    { name: "Surabaya", slug: "surabaya", color: "from-orange-600 to-red-600" },
  ]
}

export default async function LandingPage() {
  const tenants = await getTenants()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-6 shadow-2xl">
            <Star className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Beauty Clinic</h1>
          <p className="text-xl text-gray-600">Select your access point</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Admin Access */}
          <div className="mb-8">
            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8" />
                    <div>
                      <CardTitle className="text-2xl">Platform Administrator</CardTitle>
                      <CardDescription className="text-gray-200">
                        Manage all tenants and platform settings
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/admin/login">
                    <Button variant="secondary" size="lg">
                      Admin Login
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          </div>

          {/* Tenant Access */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Branch Access</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tenants.map((tenant) => (
                <Card key={tenant.slug} className="hover:shadow-xl transition-all hover:scale-105">
                  <CardHeader className={`bg-gradient-to-r ${tenant.color} text-white`}>
                    <div className="flex items-center justify-between">
                      <Building2 className="w-8 h-8" />
                      <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded">
                        Branch
                      </span>
                    </div>
                    <CardTitle className="text-xl mt-3">{tenant.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>Staff & Client Management</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Appointment Scheduling</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2" />
                        <span>Treatment Services</span>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-2">
                      <Link href={`/${tenant.slug}/signin`} className="flex-1">
                        <Button className="w-full" variant="outline">
                          Sign In
                        </Button>
                      </Link>
                      <Link href={`/${tenant.slug}/signup`} className="flex-1">
                        <Button className={`w-full bg-gradient-to-r ${tenant.color}`}>
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact your system administrator for access credentials
                </p>
                <div className="flex justify-center gap-4 text-xs text-gray-500">
                  <span>📧 support@beautyclinic.com</span>
                  <span>📞 +62 123 456 789</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
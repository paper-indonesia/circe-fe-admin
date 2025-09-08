"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Shield, Building2, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TenantData {
  id: string
  name: string
  slug: string
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tenants, setTenants] = useState<TenantData[]>([])
  const [loadingTenants, setLoadingTenants] = useState(true)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const response = await fetch("/api/admin/tenants")
      if (response.ok) {
        const data = await response.json()
        setTenants(data.tenants)
      }
    } catch (error) {
      console.error("Failed to fetch tenants:", error)
    } finally {
      setLoadingTenants(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Store admin info in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("isAdmin", "true")
        
        // Redirect to admin dashboard
        window.location.href = "/admin/tenants"
      } else {
        setError(data.error || "Invalid admin credentials")
      }
    } catch (err) {
      console.error("Admin login error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-4 shadow-2xl">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-sm text-gray-400 mt-2">Platform Administration Access</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl text-center">Administrator Login</CardTitle>
            <CardDescription className="text-center">
              Enter your platform admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@beautyclinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Sign In as Admin
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Not an admin? Access your branch portal
                </p>
                {loadingTenants ? (
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                ) : tenants.length <= 4 ? (
                  // Show buttons directly if 4 or fewer tenants
                  <div className="flex flex-wrap gap-2 justify-center">
                    {tenants.map((tenant) => (
                      <Link key={tenant.id} href={`/${tenant.slug}/signin`}>
                        <Button variant="outline" size="sm">
                          <Building2 className="mr-2 h-4 w-4" />
                          {tenant.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                ) : (
                  // Show dropdown if more than 4 tenants
                  <div className="flex justify-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-48">
                          <Building2 className="mr-2 h-4 w-4" />
                          Select Branch
                          <ChevronRight className="ml-auto h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 max-h-64 overflow-y-auto">
                        {tenants.map((tenant) => (
                          <DropdownMenuItem key={tenant.id} asChild>
                            <Link href={`/${tenant.slug}/signin`} className="cursor-pointer">
                              <Building2 className="mr-2 h-4 w-4" />
                              {tenant.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Link href="/">
                      <Button variant="outline" size="icon" title="View all branches">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-center text-gray-500">
                🔒 Secure admin access • Platform management only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
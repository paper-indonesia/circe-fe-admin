"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, Building2, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import GradientLoading from "@/components/gradient-loading"
import { TermsModal } from "@/components/modals/TermsModal"
import { PrivacyModal } from "@/components/modals/PrivacyModal"

interface Tenant {
  id: string
  name: string
  slug: string
}

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showTenantSelection, setShowTenantSelection] = useState(false)
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<string>("")
  const [authToken, setAuthToken] = useState<string>("")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signin', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          tenant_slug: selectedTenant || null
        }),
      })

      const data = await response.json()
      console.log("Login response:", data, "Status:", response.ok)

      // Handle multi-tenant selection requirement
      if (data.requires_tenant_selection) {
        setShowTenantSelection(true)
        setAvailableTenants(data.available_tenants)
        setAuthToken(data.auth_token)
        setError("")
        return
      }

      if (response.ok && data.success) {
        // Store user info and tenant context in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("tenant", JSON.stringify(data.tenant))
        localStorage.setItem("outlets", JSON.stringify(data.outlets))
        localStorage.setItem("permissions", JSON.stringify(data.permissions))
        localStorage.setItem("access_type", data.access_type)
        if (data.subscription_id) {
          localStorage.setItem("subscription_id", data.subscription_id)
        }

        console.log("Login successful! User:", data.user, "Tenant:", data.tenant)

        console.log("Redirecting to dashboard")

        // Force page reload with redirect
        window.location.replace('/dashboard')
      } else {
        setError(data.error || "Invalid email or password")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTenantSelection = async (tenantSlug: string) => {
    setSelectedTenant(tenantSlug)
    setShowTenantSelection(false)
    setIsLoading(true)

    try {
      // Re-submit with selected tenant
      const response = await fetch('/api/auth/signin', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          tenant_slug: tenantSlug
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("tenant", JSON.stringify(data.tenant))
        localStorage.setItem("outlets", JSON.stringify(data.outlets))
        localStorage.setItem("permissions", JSON.stringify(data.permissions))
        localStorage.setItem("access_type", data.access_type)
        if (data.subscription_id) {
          localStorage.setItem("subscription_id", data.subscription_id)
        }

        console.log("Login successful with tenant:", data.tenant)
        window.location.replace('/dashboard')
      } else {
        setError(data.error || "Failed to complete login")
      }
    } catch (err) {
      console.error("Tenant selection error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getGradient = () => {
    return 'from-purple-600 to-pink-600'
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientLoading text="Loading" />
      </div>
    )
  }

  // Tenant Selection Screen
  if (showTenantSelection) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" />
            <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className={`w-full max-w-md ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
            <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95">
              <div className={`h-2 bg-gradient-to-r ${getGradient()}`} />
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center">Select Your Business</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  Choose which business you want to access
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="space-y-3">
                  {availableTenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => handleTenantSelection(tenant.slug)}
                      disabled={isLoading}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${getGradient()} group-hover:scale-110 transition-transform`}>
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                          <p className="text-sm text-gray-500">@{tenant.slug}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowTenantSelection(false)
                      setAvailableTenants([])
                      setError("")
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-md ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
          {/* Logo and Header */}
          <div className="mb-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className={`absolute inset-0 w-20 h-20 bg-gradient-to-r ${getGradient()} rounded-full blur-xl opacity-60 animate-pulse`} />
              <div className="relative">
                <img
                  src="/reserva_logo.webp"
                  alt="Reserva"
                  className="h-16 w-16 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="mb-4">
              <img
                src="/reserva_name.webp"
                alt="Reserva"
                className="h-12 mx-auto object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm">
              Complete Booking & Appointment Management Platform
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95">
            <div className={`h-2 bg-gradient-to-r ${getGradient()}`} />
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold text-center">Welcome Back!</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Sign in to manage your business
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-fadeIn">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@beautyclinic.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 border-gray-200 focus:border-purple-600 transition-all duration-300 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 pr-11 h-12 border-gray-200 focus:border-purple-600 transition-all duration-300 rounded-xl"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-600" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className={`w-full h-12 bg-gradient-to-r ${getGradient()} hover:opacity-90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/signup"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Features */}
              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Secure Login</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>SSL Protected</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>2FA Available</span>
                </div>
              </div>

              {/* Terms & Privacy */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-center text-xs text-gray-500">
                  By signing in, you agree to our{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-semibold underline underline-offset-2"
                  >
                    Terms of Service
                  </button>
                  {" "}and{" "}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-semibold underline underline-offset-2"
                  >
                    Privacy Policy
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modals */}
          <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />
          <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />

        </div>
      </div>
    </div>
  )
}
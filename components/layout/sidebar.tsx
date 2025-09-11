"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Users, Star, Settings, UserPlus, Menu, X, Sparkles, LogOut, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme-context"
import { useTranslation } from "@/hooks/use-translation"
import { useTenantContext } from "@/lib/tenant-context"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { branding } = useTheme()
  const { t } = useTranslation()
  const { tenant } = useTenantContext()
  
  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user data")
      }
    }
  }, [])
  
  // Extract tenant from pathname
  const getTenantPath = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const tenantSlug = segments[0] || 'default'
    return `/${tenantSlug}`
  }, [pathname])
  
  const navigation = [
    { name: t('sidebar.dashboard'), href: `${getTenantPath}/dashboard`, icon: Home },
    { name: t('sidebar.calendar'), href: `${getTenantPath}/calendar`, icon: Calendar },
    { name: t('sidebar.clients'), href: `${getTenantPath}/clients`, icon: Users },
    { name: t('sidebar.staff'), href: `${getTenantPath}/staff`, icon: Users },
    { name: t('sidebar.walkIn'), href: `${getTenantPath}/walk-in`, icon: UserPlus },
    { name: t('sidebar.treatments'), href: `${getTenantPath}/treatments`, icon: Star },
    { name: 'Withdrawal', href: `${getTenantPath}/withdrawal`, icon: Wallet },
    { name: t('sidebar.settings'), href: `${getTenantPath}/settings`, icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg border-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-sm border-r border-gray-100 shadow-lg transform transition-transform duration-200 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center px-6 py-6 border-b border-gray-100">
            <div className="p-2 rounded-xl bg-pastel-purple">
              {tenant?.theme?.logo ? (
                <img src={tenant.theme.logo} alt="Logo" className="h-6 w-6 object-contain filter brightness-0 invert" />
              ) : branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-6 w-6 object-contain filter brightness-0 invert" />
              ) : (
                <Sparkles className="h-6 w-6 text-white" />
              )}
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-800">
                {tenant?.name || branding.clinicName}
              </h1>
              <p className="text-xs text-gray-500">Beauty Clinic Admin</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-pastel-lavender text-gray-800 shadow-sm"
                      : "text-gray-600 hover:bg-pastel-pink/30 hover:text-gray-800",
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mr-3 transition-colors",
                    isActive ? "text-gray-700" : "text-gray-400"
                  )} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-pastel-blue flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-gray-800">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'Not logged in'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-400 transition-colors"
                onClick={async () => {
                  try {
                    // Call sign out API
                    await fetch('/api/auth/signout', { method: 'POST' })
                    
                    // Clear localStorage
                    localStorage.removeItem("user")
                    
                    // Get tenant from current path
                    const segments = pathname.split('/').filter(Boolean)
                    const tenantSlug = segments[0] || 'jakarta'
                    
                    // Force redirect with page reload to clear all state
                    window.location.href = `/${tenantSlug}/signin`
                  } catch (error) {
                    console.error('Logout error:', error)
                    // Fallback redirect
                    window.location.href = '/jakarta/signin'
                  }
                }}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
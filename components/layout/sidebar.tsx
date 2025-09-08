"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Users, Star, FileText, Settings, UserPlus, Menu, X, Sparkles, LogOut } from "lucide-react"
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
    { name: t('sidebar.treatments'), href: `${getTenantPath}/treatments`, icon: Star },
    { name: t('sidebar.reports'), href: `${getTenantPath}/reports`, icon: FileText },
    { name: t('sidebar.settings'), href: `${getTenantPath}/settings`, icon: Settings },
    { name: t('sidebar.walkIn'), href: `${getTenantPath}/walk-in`, icon: UserPlus },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-background rounded-full shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r-2 border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center px-6 py-8 border-b-2 border-sidebar-border tenant-gradient">
            <div className="text-3xl">
              {tenant?.theme?.logo ? (
                <img src={tenant.theme.logo} alt="Logo" className="h-12 w-12 object-contain rounded-lg bg-white/20 p-1" />
              ) : branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-12 w-12 object-contain rounded-lg bg-white/20 p-1" />
              ) : (
                <Sparkles className="h-8 w-8 text-white drop-shadow-lg" />
              )}
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-white drop-shadow-md">{tenant?.name || branding.clinicName}</h1>
              <p className="text-sm text-white/80 font-medium">{t('sidebar.adminDashboard')}</p>
            </div>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-md",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg scale-105"
                      : "text-sidebar-foreground hover:bg-secondary/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="mr-4 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-6 border-t-2 border-sidebar-border">
            <div className="flex items-center p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-all duration-300">
              <div className="w-10 h-10 feminine-gradient rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-semibold text-sidebar-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sidebar-foreground/70 font-medium">
                  {user?.email || 'Not logged in'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-sidebar-foreground hover:text-red-500 hover:bg-red-50"
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

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

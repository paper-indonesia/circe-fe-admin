"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Users, Star, Settings, UserPlus, Menu, X, Sparkles, LogOut, BarChart3, Clock, Power, Shield, Building, Crown, HelpCircle, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLayout } from "./main-layout"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/subscription-context"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useLayout()
  const { isAdmin } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)

  // Use subscription context instead of local state
  const { subscription } = useSubscription()

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Load user and tenant from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user")
      const storedTenant = localStorage.getItem("tenant")

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error("Failed to parse user data:", e)
          localStorage.removeItem("user") // Clear corrupted data
        }
      }

      if (storedTenant) {
        try {
          setTenant(JSON.parse(storedTenant))
        } catch (e) {
          console.error("Failed to parse tenant data:", e)
          localStorage.removeItem("tenant") // Clear corrupted data
        }
      }
    } catch (e) {
      console.error("localStorage access error:", e)
    }
  }, [])

  // Subscription data is now loaded from context - no need to fetch here

  const menuGroups = useMemo(() => {
    const groups = [
      {
        label: 'Main',
        items: [
          { name: 'Dashboard', href: '/dashboard', icon: Home },
          { name: 'Calendar', href: '/calendar', icon: Calendar },
          { name: 'Customers', href: '/clients', icon: Users },
          { name: 'Staff', href: '/staff', icon: Users },
          { name: 'Availability', href: '/availability', icon: CalendarClock },
          { name: 'Walk-in', href: '/calendar?action=create&source=walk-in', icon: UserPlus },
        ]
      },
      {
        label: 'Business',
        items: [
          { name: 'Products', href: '/products', icon: Star },
          { name: 'Reports', href: '/reports', icon: BarChart3 },
        ]
      },
      {
        label: 'System',
        items: [
          { name: 'Help Desk', href: '/help-desk', icon: HelpCircle },
          { name: 'Settings', href: '/settings', icon: Settings },
        ]
      }
    ]

    // Add admin-only menus for tenant admins (after Help Desk)
    if (isAdmin()) {
      // Insert admin menus after Help Desk (at index 1)
      groups[2].items.splice(
        1,
        0,
        {
          name: 'User Management',
          href: '/user-management',
          icon: Shield
        },
        {
          name: 'Outlet Management',
          href: '/outlet-management',
          icon: Building
        }
      )
    }

    return groups
  }, [isAdmin])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      localStorage.removeItem("user")
      localStorage.removeItem("tenant")
      localStorage.removeItem("outlets")
      localStorage.removeItem("permissions")
      localStorage.removeItem("access_type")
      window.location.href = '/signin'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/signin'
    }
  }

  // Get display name from user object
  const getDisplayName = () => {
    if (!user) return 'User'
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`
    }
    if (user.first_name) return user.first_name
    if (user.name) return user.name
    return user.email?.split('@')[0] || 'User'
  }

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return 'U'
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    }
    if (user.first_name) return user.first_name.charAt(0).toUpperCase()
    if (user.name) return user.name.charAt(0).toUpperCase()
    return 'U'
  }

  // Get role display
  const getRoleDisplay = () => {
    if (!user?.role) return ''
    const roleMap: { [key: string]: string } = {
      'super_admin': 'Super Admin',
      'tenant_admin': 'Admin',
      'outlet_manager': 'Manager',
      'staff': 'Staff'
    }
    return roleMap[user.role] || user.role
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-lg border-gray-200"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 shadow-sm",
          "lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          width: isCollapsed ? '80px' : '256px',
          overflow: 'hidden',
          transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width',
          contain: 'layout size style paint',
          minWidth: isCollapsed ? '80px' : '256px',
          maxWidth: isCollapsed ? '80px' : '256px'
        }}
      >
        <div className="flex flex-col h-full" style={{ overflow: 'hidden', position: 'relative' }}>
          {/* Logo Section */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center gap-3 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0",
              isCollapsed && "justify-center px-4"
            )}
            style={{ width: '100%', overflow: 'hidden' }}
          >
            <img
              src="/reserva_logo.webp"
              alt="Reserva"
              className="h-10 w-10 object-contain flex-shrink-0"
            />
            <div
              style={{
                width: isCollapsed ? '0px' : 'auto',
                opacity: isCollapsed ? 0 : 1,
                overflow: 'hidden',
                transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease-in-out'
              }}
            >
              <img
                src="/reserva_name.webp"
                alt="Reserva"
                className="h-7 object-contain"
                style={{ maxWidth: '100%', display: isCollapsed ? 'none' : 'block' }}
              />
            </div>
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto" style={{ overflowX: 'hidden' }}>
            {menuGroups.map((group, groupIndex) => (
              <div key={group.label}>
                {/* Group Label */}
                {!isCollapsed && (
                  <div className="px-3 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                )}

                {/* Group Items */}
                <div className="space-y-1" style={{ overflow: 'hidden' }}>
                  {group.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                          isActive
                            ? "bg-gradient-to-r from-[#FCD6F5]/30 to-[#EDE9FE]/30 text-gray-900 shadow-sm ring-1 ring-[#8B5CF6]/20"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          isCollapsed && "justify-center"
                        )}
                        style={{ overflow: 'hidden' }}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-200 flex-shrink-0",
                          isActive ? "text-[#8B5CF6]" : "text-gray-400 group-hover:text-gray-600"
                        )} />
                        <div
                          style={{
                            width: isCollapsed ? '0px' : 'auto',
                            opacity: isCollapsed ? 0 : 1,
                            overflow: 'hidden',
                            flex: 1,
                            display: isCollapsed ? 'none' : 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            transition: 'opacity 200ms ease-in-out'
                          }}
                        >
                          <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                          {/* Active indicator */}
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] flex-shrink-0" />
                          )}
                        </div>

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Section - Moved to Bottom */}
          <div className="p-4 border-t border-gray-100" style={{ overflow: 'hidden' }}>
            {/* User Info */}
            <div className={cn("flex items-center gap-3 mb-3 overflow-hidden", isCollapsed && "justify-center")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-xs font-semibold bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA] bg-clip-text text-transparent">
                  {getInitials()}
                </span>
              </div>
              <div
                style={{
                  width: isCollapsed ? '0px' : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                  overflow: 'hidden',
                  flex: 1,
                  minWidth: 0,
                  display: isCollapsed ? 'none' : 'block',
                  transition: 'opacity 200ms ease-in-out'
                }}
              >
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getDisplayName()}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {getRoleDisplay() && (
                    <span className="text-xs text-gray-500">
                      {getRoleDisplay()}
                    </span>
                  )}
                  {tenant?.name && (
                    <>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500 truncate">
                        {tenant.name}
                      </span>
                    </>
                  )}
                </div>
                {/* Subscription Plan Badge - Only for tenant_admin */}
                {isAdmin() && subscription && (
                  <div className="mt-1.5">
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      subscription.plan === 'free' && "bg-gray-100 text-gray-700",
                      subscription.plan === 'pro' && "bg-gradient-to-r from-purple-100 to-pink-100 text-[#6D28D9]",
                      subscription.plan === 'enterprise' && "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
                    )}>
                      <Crown className="h-3 w-3" />
                      <span className="capitalize">{subscription.plan} Plan</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upgrade Button - Only for tenant admins */}
            {isAdmin() && (
              <button
                onClick={() => router.push('/subscription/upgrade')}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all duration-200 shadow-md hover:shadow-lg mb-2 flex-shrink-0",
                  isCollapsed && "justify-center px-2"
                )}
                style={{ overflow: 'hidden' }}
                title="Upgrade Plan"
              >
                <Crown className="h-4 w-4 flex-shrink-0" />
                <span
                  className="text-sm font-medium whitespace-nowrap"
                  style={{
                    width: isCollapsed ? '0px' : 'auto',
                    opacity: isCollapsed ? 0 : 1,
                    overflow: 'hidden',
                    display: isCollapsed ? 'none' : 'inline-block',
                    transition: 'opacity 200ms ease-in-out'
                  }}
                >
                  Upgrade Plan
                </span>
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#A78BFA] hover:bg-[#A8B0EF] text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0",
                isCollapsed && "justify-center px-2"
              )}
              style={{ overflow: 'hidden' }}
              title="Sign Out"
            >
              <Power className="h-4 w-4 flex-shrink-0" />
              <span
                className="text-sm font-medium whitespace-nowrap"
                style={{
                  width: isCollapsed ? '0px' : 'auto',
                  opacity: isCollapsed ? 0 : 1,
                  overflow: 'hidden',
                  display: isCollapsed ? 'none' : 'inline-block',
                  transition: 'opacity 200ms ease-in-out'
                }}
              >
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </aside>

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

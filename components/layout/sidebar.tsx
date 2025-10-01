"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Users, Star, Settings, UserPlus, Menu, X, Sparkles, LogOut, Wallet, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLayout } from "./main-layout"
import { useTerminology } from "@/hooks/use-terminology"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useLayout()
  const [user, setUser] = useState<any>(null)
  const { staff, treatment, patient, booking, loading: terminologyLoading } = useTerminology()
  
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
  
  
  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard', icon: Home, tour: 'sidebar-dashboard' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, tour: 'sidebar-calendar' },
    { name: patient, href: '/clients', icon: Users, tour: 'sidebar-clients' },
    { name: staff, href: '/staff', icon: Users, tour: 'sidebar-staff' },
    { name: 'Walk-in', href: '/walk-in', icon: UserPlus, tour: 'sidebar-walkin' },
    { name: treatment, href: '/treatments', icon: Star, tour: 'sidebar-treatments' },
    { name: 'Reports', href: '/reports', icon: BarChart3, tour: 'sidebar-reports' },
    { name: 'Withdrawal', href: '/withdrawal', icon: Wallet, tour: 'sidebar-withdrawal' },
    { name: 'Settings', href: '/settings', icon: Settings, tour: 'sidebar-settings' },
  ], [patient, staff, treatment])

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
          "fixed inset-y-0 left-0 z-40 bg-white/95 backdrop-blur-sm border-r border-gray-100 shadow-lg transform transition-all duration-300 lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="relative flex items-center justify-between px-4 py-6 border-b border-gray-100">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn("flex items-center gap-3 transition-all duration-300 hover:opacity-80 cursor-pointer", isCollapsed && "justify-center")}
            >
              <img
                src="/reserva_logo.webp"
                alt="Reserva"
                className="h-10 w-10 object-contain flex-shrink-0"
              />
              {!isCollapsed && (
                <img
                  src="/reserva_name.webp"
                  alt="Reserva"
                  className="h-8 object-contain"
                />
              )}
            </button>

          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  data-tour={item.tour}
                  onClick={(e) => {
                    // On desktop, clicking icon toggles collapse
                    if (!isMobileMenuOpen && window.innerWidth >= 1024) {
                      const iconElement = e.currentTarget.querySelector('svg')
                      const clickedElement = e.target as HTMLElement

                      // Check if click was on the icon or its parent
                      if (iconElement && (iconElement === clickedElement || iconElement.contains(clickedElement))) {
                        e.preventDefault()
                        setIsCollapsed(!isCollapsed)
                        return
                      }
                    }
                    setIsMobileMenuOpen(false)
                  }}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-pastel-lavender text-gray-800 shadow-sm"
                      : "text-gray-600 hover:bg-pastel-pink/30 hover:text-gray-800",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors flex-shrink-0 cursor-pointer hover:scale-110",
                    !isCollapsed && "mr-3",
                    isActive ? "text-gray-700" : "text-gray-400"
                  )} />
                  {!isCollapsed && <span>{item.name}</span>}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            {/* User Info */}
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pastel-blue to-pastel-lavender flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-sm font-semibold text-gray-800">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'Not logged in'}
                  </p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                "w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 shadow-sm",
                isCollapsed && "h-10 w-10 mx-auto"
              )}
              onClick={async () => {
                try {
                  // Call sign out API
                  await fetch('/api/auth/signout', { method: 'POST' })

                  // Clear localStorage
                  localStorage.removeItem("user")

                  // Force redirect with page reload to clear all state
                  window.location.href = '/signin'
                } catch (error) {
                  console.error('Logout error:', error)
                  // Fallback redirect
                  window.location.href = '/signin'
                }
              }}
              title="Sign Out"
            >
              <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
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
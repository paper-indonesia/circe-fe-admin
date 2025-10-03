"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Calendar, Users, Star, Settings, UserPlus, Menu, X, Sparkles, LogOut, Wallet, BarChart3, Clock, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLayout } from "./main-layout"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useLayout()
  const [user, setUser] = useState<any>(null)
  const [sessionTime, setSessionTime] = useState({ minutes: 30, seconds: 0 })

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

  // Session timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const menuGroups = useMemo(() => [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Calendar', href: '/calendar', icon: Calendar },
        { name: 'Customers', href: '/clients', icon: Users },
        { name: 'Staff', href: '/staff', icon: Users },
        { name: 'Walk-in', href: '/walk-in', icon: UserPlus },
      ]
    },
    {
      label: 'Business',
      items: [
        { name: 'Products', href: '/treatments', icon: Star },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'Withdrawal', href: '/withdrawal', icon: Wallet },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Settings', href: '/settings', icon: Settings },
      ]
    }
  ], [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      localStorage.removeItem("user")
      window.location.href = '/signin'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/signin'
    }
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
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-100 shadow-sm transform transition-all duration-300 lg:translate-x-0 overflow-hidden",
          isCollapsed ? "w-20" : "w-64",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo Section */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "flex items-center gap-3 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer w-full",
              isCollapsed && "justify-center px-4"
            )}
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
                className="h-7 object-contain transition-opacity duration-300 overflow-hidden"
                style={{ maxWidth: '100%' }}
              />
            )}
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
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
                <div className="space-y-1">
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
                            ? "bg-gradient-to-r from-[#FFD6FF]/30 to-[#E7C6FF]/30 text-gray-900 shadow-sm ring-1 ring-[#C8B6FF]/20"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          isCollapsed && "justify-center"
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <item.icon className={cn(
                          "h-5 w-5 transition-all duration-200 flex-shrink-0",
                          isActive ? "text-[#C8B6FF]" : "text-gray-400 group-hover:text-gray-600"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.name}</span>
                            {/* Active indicator */}
                            {isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#C8B6FF]" />
                            )}
                          </>
                        )}

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
          <div className="p-4 border-t border-gray-100">
            {/* User Info */}
            <div className={cn("flex items-center gap-3 mb-3", isCollapsed && "justify-center")}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-sm font-semibold bg-gradient-to-br from-[#C8B6FF] to-[#B8C0FF] bg-clip-text text-transparent">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {sessionTime.minutes}m {sessionTime.seconds}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#B8C0FF] hover:bg-[#A8B0EF] text-gray-900 transition-all duration-200 shadow-sm hover:shadow-md",
                isCollapsed && "justify-center"
              )}
              title="Sign Out"
            >
              <Power className="h-4 w-4" />
              {!isCollapsed && <span className="text-sm font-medium">Sign Out</span>}
            </button>
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

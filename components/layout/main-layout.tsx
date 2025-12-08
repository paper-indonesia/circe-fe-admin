"use client"

import type React from "react"
import { useState, createContext, useContext, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { NavigationLoader } from "@/components/navigation-loader"
import { SubscriptionWarningBanner } from "@/components/subscription-warning-banner"
import { DowngradeWarningBanner } from "@/components/downgrade-warning-banner"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/subscription-context"

interface LayoutContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
}

const LayoutContext = createContext<LayoutContextType>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

export const useLayout = () => useContext(LayoutContext)

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, isAdmin } = useAuth()
  const { isExpiredPaidPlan } = useSubscription()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sidebarCollapsed')
        return saved === 'true'
      } catch (e) {
        console.error('localStorage access error:', e)
        return false
      }
    }
    return false
  })

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sidebarCollapsed', value.toString())
      } catch (e) {
        console.error('localStorage write error:', e)
      }
    }
  }

  return (
    <LayoutContext.Provider value={{ isCollapsed, setIsCollapsed: handleSetCollapsed }}>
      <div className="min-h-screen bg-gray-50" style={{ position: 'relative' }}>
        {/* Downgrade Warning Banner - Shows when paid plan has expired (blocking) */}
        {user && isAdmin() && isExpiredPaidPlan() && <DowngradeWarningBanner />}

        {/* Floating Subscription Warning Banner - Only for tenant_admin (non-blocking) */}
        {user && isAdmin() && !isExpiredPaidPlan() && <SubscriptionWarningBanner />}

        <Sidebar />
        <div
          className="transition-all duration-300"
          style={{
            minHeight: '100vh',
            paddingLeft: isMobile ? '0' : (isCollapsed ? '80px' : '256px'),
            transition: 'padding-left 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <main className="relative py-6 px-4 lg:px-8">
            <NavigationLoader />
            {children}
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  )
}
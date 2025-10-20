"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OperationalOnboardingWizard } from "./operational-onboarding-wizard"
import { OperationalOnboardingProvider as ContextProvider, useOperationalOnboarding } from "@/lib/operational-onboarding-context"

function OperationalOnboardingWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAdmin } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialStep, setInitialStep] = useState(1)

  // Set mounted state (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Skip if not mounted yet (SSR)
      if (!isMounted) return

      // Skip on public pages
      const publicPaths = ['/signin', '/signup', '/']
      if (publicPaths.includes(pathname)) {
        console.log('OperationalOnboardingProvider: Skipping on public page:', pathname)
        setLoading(false)
        return
      }

      // Only check onboarding on Dashboard page
      if (pathname !== '/dashboard') {
        console.log('OperationalOnboardingProvider: Skipping on non-dashboard page:', pathname)
        setLoading(false)
        setShowWizard(false)
        return
      }

      // Only check for tenant_admin
      if (!user || !isAdmin()) {
        setLoading(false)
        return
      }

      try {
        // Always check existing data to determine if wizard is needed
        // (don't rely solely on localStorage as data may have been deleted)
        const [outletsRes, usersRes, servicesRes, staffRes] = await Promise.all([
          fetch('/api/outlets?page=1&size=1'),
          fetch('/api/users?page=1&size=1'),
          fetch('/api/services?page=1&size=1'),
          fetch('/api/staff?page=1&size=1'),
        ])

        let needsOnboarding = false
        let startStep = 1

        // Check outlets (Step 1)
        if (outletsRes.ok) {
          const outletsData = await outletsRes.json()
          const hasOutlets = outletsData.items && outletsData.items.length > 0
          console.log('OperationalOnboardingProvider: Checking outlets -', { hasOutlets, count: outletsData.items?.length || 0 })

          if (!hasOutlets) {
            needsOnboarding = true
            startStep = 1
          } else {
            // Has outlets, check users (Step 2)
            if (usersRes.ok) {
              const usersData = await usersRes.json()
              const hasUsers = usersData.items && usersData.items.length > 0
              console.log('OperationalOnboardingProvider: Checking users -', { hasUsers, count: usersData.items?.length || 0 })

              if (!hasUsers) {
                needsOnboarding = true
                startStep = 2
              } else {
                // Has users, check services (Step 3)
                if (servicesRes.ok) {
                  const servicesData = await servicesRes.json()
                  const hasServices = servicesData.items && servicesData.items.length > 0
                  console.log('OperationalOnboardingProvider: Checking services -', { hasServices, count: servicesData.items?.length || 0 })

                  if (!hasServices) {
                    needsOnboarding = true
                    startStep = 3
                  } else {
                    // Has services, check staff (Step 4)
                    if (staffRes.ok) {
                      const staffData = await staffRes.json()
                      const hasStaff = staffData.items && staffData.items.length > 0
                      console.log('OperationalOnboardingProvider: Checking staff -', { hasStaff, count: staffData.items?.length || 0 })

                      if (!hasStaff) {
                        needsOnboarding = true
                        startStep = 4
                      } else {
                        // Has everything, mark as completed and no wizard needed
                        needsOnboarding = false

                        // Auto-mark as completed if all data exists in localStorage
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('operational-onboarding-completed', JSON.stringify({
                            completed: true,
                            completedAt: new Date().toISOString()
                          }))
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }

        console.log('OperationalOnboardingProvider: Final decision -', { needsOnboarding, startStep, showWizard: needsOnboarding })

        setShowWizard(needsOnboarding)
        setInitialStep(startStep)

        // Clear completion flag if onboarding is needed again
        if (needsOnboarding && typeof window !== 'undefined') {
          localStorage.removeItem('operational-onboarding-completed')
          console.log('OperationalOnboardingProvider: Cleared completion flag, onboarding needed')
        }

      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [user, isAdmin, pathname, isMounted])

  const handleComplete = () => {
    setShowWizard(false)
    // Reload to refresh all data
    window.location.reload()
  }

  if (loading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {showWizard && (
        <OperationalOnboardingWizard
          open={showWizard}
          onComplete={handleComplete}
          initialStep={initialStep}
        />
      )}
    </>
  )
}

export function OperationalOnboardingProvider({ children }: { children: React.ReactNode }) {
  return (
    <ContextProvider>
      <OperationalOnboardingWrapper>
        {children}
      </OperationalOnboardingWrapper>
    </ContextProvider>
  )
}

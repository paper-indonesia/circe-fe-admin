"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OperationalOnboardingWizard } from "./operational-onboarding-wizard"
import { OperationalOnboardingProvider as ContextProvider, useOperationalOnboarding } from "@/lib/operational-onboarding-context"

function OperationalOnboardingWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isAdmin } = useAuth()
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initialStep, setInitialStep] = useState(1)

  useEffect(() => {
    async function checkOnboardingStatus() {
      // Skip on public pages
      const publicPaths = ['/signin', '/signup', '/']
      if (publicPaths.includes(pathname)) {
        console.log('OperationalOnboardingProvider: Skipping on public page:', pathname)
        setLoading(false)
        return
      }

      // Only check for tenant_admin
      if (!user || !isAdmin()) {
        setLoading(false)
        return
      }

      try {
        // Check if operational onboarding is already marked as completed
        const onboardingResponse = await fetch('/api/settings/operational-onboarding')

        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json()

          // If already completed, no need to show wizard
          if (onboardingData.operationalOnboardingCompleted) {
            setLoading(false)
            return
          }
        }

        // Check existing data to determine if wizard is needed
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

          if (!hasOutlets) {
            needsOnboarding = true
            startStep = 1
          } else {
            // Has outlets, check users (Step 2)
            if (usersRes.ok) {
              const usersData = await usersRes.json()
              const hasUsers = usersData.items && usersData.items.length > 0

              if (!hasUsers) {
                needsOnboarding = true
                startStep = 2
              } else {
                // Has users, check services (Step 3)
                if (servicesRes.ok) {
                  const servicesData = await servicesRes.json()
                  const hasServices = servicesData.items && servicesData.items.length > 0

                  if (!hasServices) {
                    needsOnboarding = true
                    startStep = 3
                  } else {
                    // Has services, check staff (Step 4)
                    if (staffRes.ok) {
                      const staffData = await staffRes.json()
                      const hasStaff = staffData.items && staffData.items.length > 0

                      if (!hasStaff) {
                        needsOnboarding = true
                        startStep = 4
                      } else {
                        // Has everything, mark as completed and no wizard needed
                        needsOnboarding = false

                        // Auto-mark as completed if all data exists
                        await fetch('/api/settings/operational-onboarding', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            operationalOnboardingCompleted: true,
                            completedAt: new Date().toISOString()
                          })
                        })
                      }
                    }
                  }
                }
              }
            }
          }
        }

        setShowWizard(needsOnboarding)
        setInitialStep(startStep)

      } catch (error) {
        console.error('Failed to check onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [user, isAdmin, pathname])

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

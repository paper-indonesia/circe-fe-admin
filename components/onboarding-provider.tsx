"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OnboardingWizard } from "./onboarding-wizard"

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkOnboarding() {
      // Skip on public pages
      const publicPaths = ['/signin', '/signup', '/']
      if (publicPaths.includes(pathname)) {
        console.log('OnboardingProvider: Skipping on public page:', pathname)
        setLoading(false)
        return
      }

      if (!user) {
        console.log('OnboardingProvider: No user found')
        setLoading(false)
        return
      }

      console.log('OnboardingProvider: User found, checking onboarding status...', user)

      try {
        const response = await fetch('/api/settings/terminology')
        console.log('OnboardingProvider: API response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('OnboardingProvider: Settings data:', data)
          console.log('OnboardingProvider: onboardingCompleted:', data.onboardingCompleted)

          // Show onboarding if not completed
          const shouldShow = !data.onboardingCompleted
          console.log('OnboardingProvider: Should show wizard:', shouldShow)
          setShowOnboarding(shouldShow)
        }
      } catch (error) {
        console.error('OnboardingProvider: Failed to check onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboarding()
  }, [user, pathname])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    // Reload to fetch new terminology
    window.location.reload()
  }

  if (loading) {
    console.log('OnboardingProvider: Still loading...')
    return <>{children}</>
  }

  console.log('OnboardingProvider: Rendering. showOnboarding =', showOnboarding)

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingWizard
          open={showOnboarding}
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  )
}
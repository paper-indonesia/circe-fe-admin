"use client"

import type React from "react"
import { AppProvider } from "@/lib/context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/lib/theme-context"
import { OnboardingProvider } from "@/components/onboarding-provider"
import { OperationalOnboardingProvider } from "@/components/operational-onboarding-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <OnboardingProvider>
            <OperationalOnboardingProvider>
              {children}
              <Toaster />
            </OperationalOnboardingProvider>
          </OnboardingProvider>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  )
}

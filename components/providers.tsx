"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { AppProvider } from "@/lib/context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/lib/theme-context"
import { OperationalOnboardingProvider } from "@/components/operational-onboarding-provider"
import { MainLayout } from "@/components/layout/main-layout"

// Pages that should NOT have the sidebar/MainLayout
const NO_LAYOUT_PATHS = ['/signin', '/signup', '/']

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Check if current path should not have layout
  const shouldShowLayout = !NO_LAYOUT_PATHS.includes(pathname)

  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          <OperationalOnboardingProvider>
            {shouldShowLayout ? (
              <MainLayout>{children}</MainLayout>
            ) : (
              children
            )}
            <Toaster />
          </OperationalOnboardingProvider>
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  )
}

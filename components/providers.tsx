"use client"

import type React from "react"
import { AppProvider } from "@/lib/context"
import { AuthProvider } from "@/lib/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </AppProvider>
    </AuthProvider>
  )
}

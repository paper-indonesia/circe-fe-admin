"use client"

import { useEffect } from 'react'
import { useTenantTheme } from '@/hooks/use-tenant-theme'

export function TenantThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, loading } = useTenantTheme()

  useEffect(() => {
    // Apply theme colors to CSS variables when component mounts or theme changes
    const root = document.documentElement
    root.style.setProperty('--tenant-primary', theme.primaryColor)
    root.style.setProperty('--tenant-secondary', theme.secondaryColor)
    
    // Also update any primary/secondary color classes
    root.style.setProperty('--primary', theme.primaryColor)
    root.style.setProperty('--secondary', theme.secondaryColor)
  }, [theme])

  return <>{children}</>
}
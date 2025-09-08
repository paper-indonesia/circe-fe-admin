"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface TenantTheme {
  primaryColor: string
  secondaryColor: string
}

export function useTenantTheme() {
  const params = useParams()
  const [theme, setTheme] = useState<TenantTheme>({
    primaryColor: '#8B5CF6',
    secondaryColor: '#EC4899'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTenantTheme = async () => {
      const tenantSlug = params?.tenant as string
      
      if (!tenantSlug) {
        setLoading(false)
        return
      }

      try {
        // First try to get from API
        const response = await fetch(`/api/tenants/${tenantSlug}`)
        if (response.ok) {
          const data = await response.json()
          if (data.tenant?.config?.theme) {
            const newTheme = {
              primaryColor: data.tenant.config.theme.primaryColor || '#8B5CF6',
              secondaryColor: data.tenant.config.theme.secondaryColor || '#EC4899'
            }
            setTheme(newTheme)
            
            // Apply theme to CSS variables
            applyThemeToCSS(newTheme)
          }
        }
      } catch (error) {
        console.error('Failed to fetch tenant theme:', error)
        // Use default theme colors based on slug
        const defaultThemes: Record<string, TenantTheme> = {
          jakarta: { primaryColor: '#8B5CF6', secondaryColor: '#EC4899' },
          bali: { primaryColor: '#3B82F6', secondaryColor: '#10B981' },
          surabaya: { primaryColor: '#F59E0B', secondaryColor: '#EF4444' },
        }
        
        const defaultTheme = defaultThemes[tenantSlug] || {
          primaryColor: '#8B5CF6',
          secondaryColor: '#EC4899'
        }
        
        setTheme(defaultTheme)
        applyThemeToCSS(defaultTheme)
      } finally {
        setLoading(false)
      }
    }

    fetchTenantTheme()
  }, [params?.tenant])

  const applyThemeToCSS = (theme: TenantTheme) => {
    // Apply theme colors to CSS variables
    const root = document.documentElement
    root.style.setProperty('--tenant-primary', theme.primaryColor)
    root.style.setProperty('--tenant-secondary', theme.secondaryColor)
    
    // Convert hex to RGB for opacity variations
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }
    
    const primaryRgb = hexToRgb(theme.primaryColor)
    const secondaryRgb = hexToRgb(theme.secondaryColor)
    
    if (primaryRgb) {
      root.style.setProperty('--tenant-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
    }
    if (secondaryRgb) {
      root.style.setProperty('--tenant-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`)
    }
  }

  return { theme, loading, applyThemeToCSS }
}
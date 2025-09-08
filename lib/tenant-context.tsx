"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { TenantConfig, getTenantBySlug } from './tenant'
import { usePathname } from 'next/navigation'

interface TenantContextValue {
  tenant: TenantConfig | null
  isLoading: boolean
}

const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  isLoading: true,
})

export function TenantProvider({
  children,
  tenantSlug,
}: {
  children: React.ReactNode
  tenantSlug?: string
}) {
  const [tenant, setTenant] = useState<TenantConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const initTenant = () => {
      setIsLoading(true)
      
      let currentTenant: TenantConfig | null = null
      
      if (tenantSlug) {
        currentTenant = getTenantBySlug(tenantSlug)
      } else {
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length > 0) {
          currentTenant = getTenantBySlug(segments[0])
        }
      }
      
      if (!currentTenant) {
        currentTenant = {
          id: 'default',
          slug: 'default',
          name: 'Beauty Clinic',
          theme: {
            primaryColor: '#FF6B6B',
            secondaryColor: '#4ECDC4'
          },
          features: {
            walkIn: true,
            reporting: true,
            multipleLocations: false
          },
          metadata: {
            title: 'Beauty Clinic Admin',
            description: 'Admin dashboard for beauty clinic management'
          }
        }
      }
      
      setTenant(currentTenant)
      setIsLoading(false)
    }

    initTenant()
  }, [tenantSlug, pathname])

  return (
    <TenantContext.Provider value={{ tenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenantContext must be used within a TenantProvider')
  }
  return context
}
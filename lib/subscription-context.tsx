"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionData {
  plan: string
  status: string
  end_date?: string
  billing_period?: string
  features?: any
  trial_end?: string
  cancel_at_period_end?: boolean
  cancelled_at?: string
  usage?: UsageData
}

interface UsageData {
  usage_summary?: Record<string, any>
  warnings?: string[]
  current_period_start?: string
  current_period_end?: string
  approaching_limits?: string[]
  upgrade_recommended?: boolean
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  usage: UsageData | null
  loading: boolean
  refetch: () => Promise<void>
  isSubscriptionExpired: () => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscription: null,
  usage: null,
  loading: true,
  refetch: async () => {},
  isSubscriptionExpired: () => false
})

export const useSubscription = () => useContext(SubscriptionContext)

interface SubscriptionProviderProps {
  children: ReactNode
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSubscriptionData = async () => {
    // Only fetch if user is tenant_admin
    if (!user || !isAdmin()) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()

        // Set subscription data
        const subscriptionData: SubscriptionData = {
          plan: data.plan?.toLowerCase() || 'free',
          status: data.status,
          end_date: data.current_period_end,
          billing_period: data.billing_period,
          features: data.features,
          trial_end: data.trial_end,
          cancel_at_period_end: data.cancel_at_period_end,
          cancelled_at: data.cancelled_at
        }
        setSubscription(subscriptionData)

        // Set usage data from the same API response
        if (data.usage) {
          setUsage(data.usage)

          // Show warnings if any (only once on mount)
          if (data.usage.warnings && data.usage.warnings.length > 0) {
            data.usage.warnings.forEach((warning: string) => {
              toast({
                title: "Usage Warning",
                description: warning,
                variant: "destructive"
              })
            })
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch subscription data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptionData()
  }, [user])

  // Check if subscription is expired (only for paid plans - PRO/Enterprise)
  // Free plan users can continue using the app without restriction
  const isSubscriptionExpired = (): boolean => {
    if (!subscription) return false

    const plan = subscription.plan?.toLowerCase()
    const endDate = subscription.end_date

    // Free plan - no expiration check (disabled trial restriction)
    if (plan === 'free') return false

    if (!endDate) return false

    const expiryDate = new Date(endDate)
    const now = new Date()
    // Set expiry to end of day for fair comparison
    expiryDate.setHours(23, 59, 59, 999)
    now.setHours(0, 0, 0, 0)

    return expiryDate < now
  }

  const value: SubscriptionContextType = {
    subscription,
    usage,
    loading,
    refetch: fetchSubscriptionData,
    isSubscriptionExpired
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

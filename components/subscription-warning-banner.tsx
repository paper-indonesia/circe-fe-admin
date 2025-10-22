"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/subscription-context"
import { differenceInDays, format } from "date-fns"
import {
  AlertTriangle,
  X,
  Clock,
  XCircle,
  Crown,
  Calendar
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubscriptionWarningBannerProps {
  className?: string
  // Debug mode untuk testing
  debugMode?: boolean
  debugDaysUntilExpiry?: number
  debugStatus?: 'active' | 'expired' | 'cancelled'
}

export function SubscriptionWarningBanner({
  className,
  debugMode = false,
  debugDaysUntilExpiry,
  debugStatus
}: SubscriptionWarningBannerProps) {
  const router = useRouter()
  const { subscription } = useSubscription()
  const [dismissed, setDismissed] = useState(false)

  // Calculate days until expiry
  const daysUntilExpiry = debugMode && debugDaysUntilExpiry !== undefined
    ? debugDaysUntilExpiry
    : subscription?.end_date
      ? differenceInDays(new Date(subscription.end_date), new Date())
      : null

  const status = debugMode && debugStatus
    ? debugStatus
    : subscription?.status

  // Reset dismissed state when days change significantly
  useEffect(() => {
    if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
      setDismissed(false)
    }
  }, [daysUntilExpiry])

  // Don't show banner if:
  // 1. No subscription data
  // 2. User dismissed and more than 3 days left
  // 3. More than 14 days until expiry
  if (!subscription && !debugMode) return null
  if (dismissed && daysUntilExpiry !== null && daysUntilExpiry > 3) return null
  if (daysUntilExpiry === null || daysUntilExpiry > 14) return null

  // Determine severity and styling
  const getSeverity = () => {
    if (status === 'expired' || daysUntilExpiry <= 0) {
      return 'expired'
    } else if (daysUntilExpiry <= 1) {
      return 'critical'
    } else if (daysUntilExpiry <= 3) {
      return 'urgent'
    } else if (daysUntilExpiry <= 7) {
      return 'warning'
    } else {
      return 'info'
    }
  }

  const severity = getSeverity()

  const severityConfig = {
    expired: {
      variant: 'destructive' as const,
      icon: XCircle,
      bgClass: 'bg-red-50 border-red-300',
      iconColor: 'text-red-600',
      title: 'Subscription Expired',
      message: 'Your subscription has expired. Renew now to restore full access to premium features.',
      ctaText: 'Renew Now',
      ctaPrimary: true,
      dismissable: false
    },
    critical: {
      variant: 'destructive' as const,
      icon: AlertTriangle,
      bgClass: 'bg-red-50 border-red-400',
      iconColor: 'text-red-600',
      title: '⚠️ Critical: Subscription Expires Tomorrow!',
      message: `Your ${subscription?.plan || 'Professional'} plan expires tomorrow (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Renew immediately to avoid service interruption.`,
      ctaText: 'Renew Immediately',
      ctaPrimary: true,
      dismissable: false
    },
    urgent: {
      variant: 'default' as const,
      icon: AlertTriangle,
      bgClass: 'bg-orange-50 border-orange-400',
      iconColor: 'text-orange-600',
      title: 'Subscription Expiring Soon',
      message: `Your ${subscription?.plan || 'Professional'} plan expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Renew now to continue enjoying premium features.`,
      ctaText: 'Renew Subscription',
      ctaPrimary: true,
      dismissable: false
    },
    warning: {
      variant: 'default' as const,
      icon: Clock,
      bgClass: 'bg-yellow-50 border-yellow-300',
      iconColor: 'text-yellow-700',
      title: 'Subscription Renewal Reminder',
      message: `Your ${subscription?.plan || 'Professional'} plan expires in ${daysUntilExpiry} days (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Renew early to ensure uninterrupted service.`,
      ctaText: 'Renew Now',
      ctaPrimary: false,
      dismissable: true
    },
    info: {
      variant: 'default' as const,
      icon: Calendar,
      bgClass: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      title: 'Subscription Renewal Reminder',
      message: `Your ${subscription?.plan || 'Professional'} plan expires in ${daysUntilExpiry} days (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Consider renewing early.`,
      ctaText: 'View Subscription',
      ctaPrimary: false,
      dismissable: true
    }
  }

  const config = severityConfig[severity]
  const Icon = config.icon

  const handleDismiss = () => {
    setDismissed(true)
    // Store dismissal in localStorage with expiry (24 hours)
    localStorage.setItem('subscription-warning-dismissed', JSON.stringify({
      timestamp: Date.now(),
      daysLeft: daysUntilExpiry
    }))
  }

  const handleRenew = () => {
    router.push('/subscription/manage')
  }

  return (
    <div className={cn("relative", className)}>
      <Alert
        variant={config.variant}
        className={cn(
          "relative overflow-hidden border-2",
          config.bgClass,
          "shadow-md"
        )}
      >
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 opacity-5">
          <Crown className="h-32 w-32 -mr-8 -mt-8" />
        </div>

        {/* Icon */}
        <Icon className={cn("h-5 w-5", config.iconColor)} />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <AlertTitle className="text-base font-bold mb-1 flex items-center gap-2">
                {config.title}
                {severity === 'expired' && (
                  <Badge variant="destructive" className="ml-2">
                    EXPIRED
                  </Badge>
                )}
                {(severity === 'critical' || severity === 'urgent') && (
                  <Badge variant="destructive" className="ml-2">
                    {daysUntilExpiry} {daysUntilExpiry === 1 ? 'DAY' : 'DAYS'} LEFT
                  </Badge>
                )}
              </AlertTitle>
              <AlertDescription className="text-sm">
                {config.message}
              </AlertDescription>
            </div>

            {/* Dismiss Button */}
            {config.dismissable && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-4 h-6 w-6 p-0 hover:bg-gray-200"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleRenew}
              variant={config.ctaPrimary ? "default" : "outline"}
              size="sm"
              className={cn(
                config.ctaPrimary && "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              )}
            >
              {config.ctaText}
            </Button>
            <Button
              onClick={() => router.push('/subscription/upgrade')}
              variant="outline"
              size="sm"
            >
              View Plans
            </Button>
            {config.dismissable && (
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
              >
                Remind Me Tomorrow
              </Button>
            )}
          </div>
        </div>
      </Alert>

      {/* Debug Info (only in debug mode) */}
      {debugMode && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
          <div>Debug Mode: ON</div>
          <div>Days Until Expiry: {daysUntilExpiry}</div>
          <div>Status: {status}</div>
          <div>Severity: {severity}</div>
          <div>Plan: {subscription?.plan || 'N/A'}</div>
        </div>
      )}
    </div>
  )
}

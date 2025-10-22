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
}

export function SubscriptionWarningBanner({
  className
}: SubscriptionWarningBannerProps) {
  const router = useRouter()
  const { subscription } = useSubscription()
  const [dismissed, setDismissed] = useState(false)

  // Calculate days until expiry from real subscription data
  const daysUntilExpiry = subscription?.end_date
    ? differenceInDays(new Date(subscription.end_date), new Date())
    : null

  const status = subscription?.status
  const plan = subscription?.plan

  // Check if user is on Free plan
  const isFreeplan = plan?.toLowerCase() === 'free'

  // Reset dismissed state when days change significantly
  useEffect(() => {
    if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
      setDismissed(false)
    }
  }, [daysUntilExpiry])

  // Don't show banner if:
  // 1. No subscription data
  // 2. User dismissed and more than 3 days left
  // 3. More than 14 days until expiry (unless Free plan)
  if (!subscription) return null
  if (dismissed && daysUntilExpiry !== null && daysUntilExpiry > 3) return null

  // For Free plan, always show (no expiry date check)
  // For paid plans, only show if within 14 days of expiry
  if (!isFreeplan && (daysUntilExpiry === null || daysUntilExpiry > 14)) return null

  // Determine severity and styling
  const getSeverity = () => {
    // Free plan always shows as 'info' (upgrade prompt)
    if (isFreeplan) {
      return 'info'
    }

    // Paid plan severity based on expiry
    if (status === 'expired' || (daysUntilExpiry !== null && daysUntilExpiry <= 0)) {
      return 'expired'
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 1) {
      return 'critical'
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 3) {
      return 'urgent'
    } else if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
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
      title: isFreeplan ? 'Upgrade to Premium' : 'Subscription Expired',
      message: isFreeplan
        ? 'You are currently on the Free plan. Upgrade now to unlock premium features and grow your business.'
        : 'Your subscription has expired. Renew now to restore full access to premium features.',
      ctaText: isFreeplan ? 'Upgrade Now' : 'Renew Now',
      ctaPrimary: true,
      dismissable: isFreeplan
    },
    critical: {
      variant: 'destructive' as const,
      icon: AlertTriangle,
      bgClass: 'bg-red-50 border-red-400',
      iconColor: 'text-red-600',
      title: isFreeplan ? 'Upgrade to Premium' : '⚠️ Critical: Subscription Expires Tomorrow!',
      message: isFreeplan
        ? 'Unlock advanced features, unlimited appointments, and multi-outlet management. Upgrade today!'
        : `Your ${subscription?.plan || 'Professional'} plan expires tomorrow (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Renew immediately to avoid service interruption.`,
      ctaText: isFreeplan ? 'Upgrade to Pro' : 'Renew Immediately',
      ctaPrimary: true,
      dismissable: false
    },
    urgent: {
      variant: 'default' as const,
      icon: AlertTriangle,
      bgClass: 'bg-orange-50 border-orange-400',
      iconColor: 'text-orange-600',
      title: isFreeplan ? 'Upgrade Your Plan' : 'Subscription Expiring Soon',
      message: isFreeplan
        ? 'Take your clinic to the next level with premium features. Upgrade now and get 20% off your first month!'
        : `Your ${subscription?.plan || 'Professional'} plan expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'} (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Renew now to continue enjoying premium features.`,
      ctaText: isFreeplan ? 'View Plans' : 'Renew Subscription',
      ctaPrimary: true,
      dismissable: false
    },
    warning: {
      variant: 'default' as const,
      icon: Clock,
      bgClass: 'bg-yellow-50 border-yellow-300',
      iconColor: 'text-yellow-700',
      title: isFreeplan ? 'Discover Premium Features' : 'Subscription Renewal Reminder',
      message: isFreeplan
        ? 'Grow faster with unlimited appointments, advanced reports, and multi-outlet support. See what you\'re missing!'
        : `Your ${subscription?.plan || 'Professional'} plan expires in ${daysUntilExpiry} days (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Renew early to ensure uninterrupted service.`,
      ctaText: isFreeplan ? 'Explore Plans' : 'Renew Now',
      ctaPrimary: false,
      dismissable: true
    },
    info: {
      variant: 'default' as const,
      icon: Calendar,
      bgClass: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
      title: isFreeplan ? 'Ready to Grow?' : 'Subscription Renewal Reminder',
      message: isFreeplan
        ? 'See how premium features can help you manage more clients, track performance, and increase revenue.'
        : `Your ${subscription?.plan || 'Professional'} plan expires in ${daysUntilExpiry} days (${subscription?.end_date ? format(new Date(subscription.end_date), 'MMMM d, yyyy') : 'N/A'}). Consider renewing early.`,
      ctaText: isFreeplan ? 'Compare Plans' : 'View Subscription',
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
    // Free plan users go to upgrade page, paid users go to manage page
    if (isFreeplan) {
      router.push('/subscription/upgrade')
    } else {
      router.push('/subscription/manage')
    }
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

    </div>
  )
}

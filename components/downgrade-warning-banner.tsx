"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/subscription-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import {
  AlertTriangle,
  XCircle,
  ArrowDownCircle,
  Building2,
  Users,
  Calendar,
  Briefcase,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DowngradeConfirmationDialog } from "./downgrade-confirmation-dialog"

interface PlanLimits {
  max_outlets: number
  max_staff_per_outlet: number
  max_appointments_per_month: number
  max_services: number
}

interface PlanData {
  plan_type: string
  limits: PlanLimits
}

interface DowngradeWarningBannerProps {
  className?: string
}

export function DowngradeWarningBanner({
  className
}: DowngradeWarningBannerProps) {
  const router = useRouter()
  const { subscription, usage, refetch } = useSubscription()
  const { user } = useAuth()
  const { toast } = useToast()

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [currentUsage, setCurrentUsage] = useState<{
    outlets: number
    staff: number
    appointments: number
    services: number
  } | null>(null)

  // Fetch plans data for limits comparison
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription/plans')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans || [])
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      }
    }
    fetchPlans()
  }, [])

  // Fetch current usage data
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // Get outlets count
        const outletsResponse = await fetch('/api/outlets?size=1')
        if (outletsResponse.ok) {
          const outletsData = await outletsResponse.json()

          // Extract usage from subscription usage data if available
          const usageSummary = usage?.usage_summary || {}

          setCurrentUsage({
            outlets: outletsData.total || 0,
            staff: usageSummary.total_staff || 0,
            appointments: usageSummary.appointments_this_month || 0,
            services: usageSummary.total_services || 0
          })
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error)
      }
    }

    if (subscription) {
      fetchUsage()
    }
  }, [subscription, usage])

  // Check if subscription is in "stuck expired" state
  const isStuckExpired = () => {
    if (!subscription) return false

    const plan = subscription.plan?.toLowerCase()
    const endDate = subscription.end_date

    // Plan is PRO or Enterprise but has expired
    if ((plan === 'pro' || plan === 'enterprise') && endDate) {
      const expiryDate = new Date(endDate)
      const now = new Date()
      // Set both to start of day for accurate comparison
      expiryDate.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      return expiryDate < now
    }
    return false
  }

  // Don't show if not in stuck expired state
  if (!subscription || !isStuckExpired()) {
    return null
  }

  const currentPlan = subscription.plan?.toUpperCase() || 'PRO'
  const expiryDate = subscription.end_date
    ? format(new Date(subscription.end_date), 'MMMM d, yyyy')
    : null

  // Get plan limits
  const currentPlanData = plans.find(p => p.plan_type.toUpperCase() === currentPlan)
  const freePlanData = plans.find(p => p.plan_type.toUpperCase() === 'FREE')

  const currentLimits: PlanLimits = currentPlanData?.limits || {
    max_outlets: 10,
    max_staff_per_outlet: 50,
    max_appointments_per_month: 2000,
    max_services: -1
  }

  const freePlanLimits: PlanLimits = freePlanData?.limits || {
    max_outlets: 1,
    max_staff_per_outlet: 5,
    max_appointments_per_month: 100,
    max_services: 20
  }

  const formatLimit = (value: number) => {
    return value === -1 ? "Unlimited" : value.toLocaleString()
  }

  // Handle downgrade confirmation
  const handleConfirmDowngrade = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process downgrade')
      }

      toast({
        title: "Downgrade Successful",
        description: "Your subscription has been downgraded to the Free plan.",
      })

      // Refetch subscription data
      await refetch()

      // Close dialog
      setShowConfirmDialog(false)

      // Redirect to subscription page
      router.push('/subscription/manage')
    } catch (error) {
      console.error('Downgrade error:', error)
      toast({
        title: "Downgrade Failed",
        description: error instanceof Error ? error.message : "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const impactPreview = [
    { icon: Building2, label: "Outlets", from: formatLimit(currentLimits.max_outlets), to: formatLimit(freePlanLimits.max_outlets) },
    { icon: Users, label: "Staff/Outlet", from: formatLimit(currentLimits.max_staff_per_outlet), to: formatLimit(freePlanLimits.max_staff_per_outlet) },
    { icon: Calendar, label: "Appointments", from: formatLimit(currentLimits.max_appointments_per_month), to: formatLimit(freePlanLimits.max_appointments_per_month) },
    { icon: Briefcase, label: "Services", from: formatLimit(currentLimits.max_services), to: formatLimit(freePlanLimits.max_services) }
  ]

  return (
    <>
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[100]",
        className
      )}>
        {/* Overlay to block interaction */}
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[99]" />

        <Alert
          variant="destructive"
          className={cn(
            "relative z-[100] rounded-none border-x-0 border-t-0 border-b-4 border-red-600",
            "bg-gradient-to-r from-red-50 via-red-100 to-red-50",
            "shadow-2xl"
          )}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start gap-4 py-2">
              {/* Icon and Title Section */}
              <div className="flex items-start gap-3 flex-shrink-0">
                <div className="p-2 bg-red-100 rounded-full animate-pulse">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertTitle className="text-lg font-bold text-red-800 flex items-center gap-2">
                    Subscription Expired - Action Required
                    <Badge variant="destructive" className="animate-pulse">
                      EXPIRED
                    </Badge>
                  </AlertTitle>
                  <AlertDescription className="text-red-700 mt-1">
                    Your <span className="font-semibold">{currentPlan}</span> plan expired
                    {expiryDate && <> on <span className="font-semibold">{expiryDate}</span></>}.
                    Please renew or confirm downgrade to continue.
                  </AlertDescription>
                </div>
              </div>

              {/* Impact Preview - Compact horizontal view */}
              <div className="flex-1 lg:mx-4">
                <div className="flex items-center gap-1 text-xs text-red-600 mb-2 font-medium">
                  <ArrowDownCircle className="h-3 w-3" />
                  Impact of downgrade to Free:
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {impactPreview.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white/60 rounded px-2 py-1.5 text-xs"
                      >
                        <Icon className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-gray-600">{item.label}:</span>
                        <span className="font-medium text-gray-400 line-through">{item.from}</span>
                        <span className="font-bold text-red-600">{item.to}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                <Button
                  onClick={() => router.push('/subscription/manage')}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#EC4899] shadow-lg"
                  disabled={isProcessing}
                >
                  Renew {currentPlan} Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(true)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Downgrade to Free"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      </div>

      {/* Spacer to push content down */}
      <div className="h-[140px] lg:h-[100px]" />

      {/* Confirmation Dialog */}
      <DowngradeConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmDowngrade}
        currentPlan={currentPlan}
        currentLimits={currentLimits}
        freePlanLimits={freePlanLimits}
        currentUsage={currentUsage || undefined}
        expiryDate={expiryDate || undefined}
      />
    </>
  )
}

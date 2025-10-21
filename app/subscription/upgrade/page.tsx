"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Check,
  Crown,
  Zap,
  Shield,
  Star,
  ArrowLeft,
  Sparkles,
  Users,
  MapPin,
  Smartphone,
  TrendingUp,
  MessageCircle,
  Mail,
  DollarSign,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import GradientLoading from "@/components/gradient-loading"

const planIcons: Record<string, any> = {
  free: Shield,
  pro: Zap,
  enterprise: Crown,
}

const planGradients: Record<string, string> = {
  free: "from-gray-400 to-gray-500",
  pro: "from-purple-500 to-pink-500",
  enterprise: "from-amber-500 to-orange-500",
}

// Feature name mapping for display
const featureLabels: Record<string, string> = {
  max_outlets: "outlets",
  max_staff_per_outlet: "staff per outlet",
  max_customers: "customers",
  max_services: "services",
  max_appointments_per_month: "appointments/month",
  custom_branding: "Custom branding",
  api_access: "API access",
  priority_support: "Priority support",
  whatsapp_notifications: "WhatsApp notifications",
  email_notifications: "Email notifications",
  sms_notifications: "SMS notifications",
  payment_processing: "Payment processing",
  analytics_dashboard: "Advanced analytics dashboard",
  staff_app_access: "Staff app access",
  customer_portal: "Customer portal",
  online_booking: "Online booking",
  recurring_appointments: "Recurring appointments",
  loyalty_program: "Loyalty program",
  custom_domain: "Custom domain",
  webhook_integrations: "Webhook integrations",
  platform_fee_rate: "Platform fee",
}

export default function UpgradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingUpgradePlan, setPendingUpgradePlan] = useState<any>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans and current subscription in parallel
        const [plansRes, currentSubRes] = await Promise.all([
          fetch('/api/subscription/plans'),
          fetch('/api/subscription')
        ])

        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setPlans(plansData.plans || [])
          setCurrentPlan(plansData.current_plan)
        }

        if (currentSubRes.ok) {
          const subData = await currentSubRes.json()
          // Transform API response to match component expectations
          setCurrentSubscription({
            plan: subData.plan?.toLowerCase(),
            status: subData.status,
            ...subData
          })
          setCurrentPlan(subData.plan?.toLowerCase() || null)
        }
      } catch (error) {
        console.error("Failed to fetch subscription data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription plans",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const initiateUpgrade = (plan: any) => {
    const planId = plan.plan

    if (planId === "enterprise") {
      // Redirect to WhatsApp for Enterprise plan inquiry
      const whatsappUrl = "https://api.whatsapp.com/send?phone=6285213539992&text=Halo%2C%20saya%20tertarik%20untuk%20enterprise%20plan"
      window.open(whatsappUrl, '_blank')

      toast({
        title: "Opening WhatsApp",
        description: "Redirecting you to our sales team on WhatsApp...",
      })
      return
    }

    if (planId === currentPlan) {
      toast({
        title: "Already on This Plan",
        description: `You're currently on the ${planId} plan.`,
      })
      return
    }

    // Show confirmation dialog
    setPendingUpgradePlan(plan)
    setShowConfirmDialog(true)
  }

  const handleUpgrade = async () => {
    if (!pendingUpgradePlan) return

    const planId = pendingUpgradePlan.plan
    setShowConfirmDialog(false)

    setLoading(true)
    try {
      // Call upgrade API
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_plan: planId,
          billing_period: billingPeriod,
          prorate_charges: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade subscription')
      }

      // Check if payment is required
      if (data.status === 'payment_pending' && data.invoice?.paper_payment_url) {
        console.log('Payment pending, processing invoice:', data.invoice)

        // Store invoice details in localStorage for later reference
        localStorage.setItem('pending_invoice', JSON.stringify(data.invoice))
        localStorage.setItem('upgrade_details', JSON.stringify(data.upgrade_details))

        // Ensure payment URL has proper protocol
        let finalPaymentUrl = data.invoice.paper_payment_url
        console.log('Original payment URL:', finalPaymentUrl)

        if (!finalPaymentUrl.startsWith('http://') && !finalPaymentUrl.startsWith('https://')) {
          finalPaymentUrl = 'https://' + finalPaymentUrl
        }

        console.log('Final payment URL:', finalPaymentUrl)

        // Show payment dialog for user to click and open payment page
        setPaymentUrl(finalPaymentUrl)
        setShowPaymentDialog(true)
        setLoading(false)
      } else if (data.status === 'active') {
        // Upgrade successful without payment (e.g., downgrade to free)
        toast({
          title: "Success!",
          description: "Your subscription has been updated.",
        })

        // Refresh page to show updated plan
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      console.error('Upgrade error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to process upgrade. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const formatFeatures = (plan: any) => {
    const featureList: string[] = []

    if (!plan.features) return featureList

    // Process all features dynamically
    Object.entries(plan.features).forEach(([key, value]) => {
      const label = featureLabels[key] || key.replace(/_/g, ' ')

      // Handle numeric limits (max_* fields)
      if (key.startsWith('max_') && typeof value === 'number') {
        if (value >= 999999) {
          featureList.push(`Unlimited ${label}`)
        } else if (value > 0) {
          featureList.push(`Up to ${value} ${label}`)
        }
      }
      // Handle boolean features
      else if (typeof value === 'boolean') {
        if (value === true && !key.includes('enabled')) {
          featureList.push(label)
        }
      }
      // Handle platform fee rate
      else if (key === 'platform_fee_rate' && value) {
        const feePercent = (parseFloat(value as string) * 100).toFixed(0)
        featureList.push(`${feePercent}% ${label}`)
      }
    })

    return featureList
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-[60vh]">
          <GradientLoading />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-8 pb-8">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-[#C8B6FF] to-[#B8C0FF] rounded-2xl mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Click on a plan card to select it, then upgrade your account to unlock more features
            </p>

            {currentPlan && (
              <div className="mt-4">
                <Badge className="bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF] text-white capitalize">
                  Current Plan: {currentPlan}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={cn(
            "text-sm font-medium transition-colors",
            billingPeriod === "monthly" ? "text-gray-900" : "text-gray-500"
          )}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "yearly" : "monthly")}
            className={cn(
              "relative w-14 h-7 rounded-full transition-colors",
              billingPeriod === "yearly"
                ? "bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF]"
                : "bg-gray-300"
            )}
          >
            <div className={cn(
              "absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform",
              billingPeriod === "yearly" && "translate-x-7"
            )} />
          </button>
          <span className={cn(
            "text-sm font-medium transition-colors",
            billingPeriod === "yearly" ? "text-gray-900" : "text-gray-500"
          )}>
            Yearly
            {plans.some(p => p.pricing?.yearly_discount_percent > 0) && (
              <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                Save up to {Math.max(...plans.map(p => p.pricing?.yearly_discount_percent || 0)).toFixed(0)}%
              </Badge>
            )}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto items-stretch">
          {plans.map((plan) => {
            const planType = plan.plan
            const Icon = planIcons[planType] || Star
            const gradient = planGradients[planType] || "from-blue-500 to-cyan-500"
            const isCurrentPlan = currentPlan === planType
            const isPro = planType === "pro"

            const monthlyPrice = parseFloat(plan.pricing?.monthly_price || "0")
            const yearlyPrice = parseFloat(plan.pricing?.yearly_price || "0")
            const currency = plan.pricing?.currency || "IDR"
            const yearlyDiscount = plan.pricing?.yearly_discount_percent || 0

            const displayPrice = planType === "enterprise"
              ? "Custom"
              : billingPeriod === "yearly" && yearlyPrice > 0
              ? `Rp ${yearlyPrice.toLocaleString("id-ID")}`
              : monthlyPrice === 0
              ? "Free"
              : `Rp ${monthlyPrice.toLocaleString("id-ID")}`

            const features = formatFeatures(plan)

            const isSelected = selectedPlan === planType
            const isFreeAndCurrent = planType === "free" && isCurrentPlan
            const canSelect = !isCurrentPlan && !isFreeAndCurrent

            return (
              <Card
                key={planType}
                onClick={() => canSelect && setSelectedPlan(planType)}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 h-full flex flex-col",
                  canSelect && "cursor-pointer hover:shadow-xl",
                  isFreeAndCurrent && "opacity-60 cursor-not-allowed",
                  isPro && !isSelected && !isCurrentPlan && "ring-2 ring-[#C8B6FF]",
                  isCurrentPlan && !isFreeAndCurrent && "border-green-500 border-2",
                  isSelected && canSelect && "ring-4 ring-purple-500 ring-offset-2 shadow-2xl",
                  canSelect && !isSelected && "hover:scale-[1.02]"
                )}
              >
                {isSelected && canSelect && (
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1 z-10">
                    <Check className="h-3 w-3" />
                    SELECTED
                  </div>
                )}
                {isPro && !isSelected && !isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF] text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    RECOMMENDED
                  </div>
                )}
                {isFreeAndCurrent && (
                  <div className="absolute top-0 right-0 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    CURRENT PLAN
                  </div>
                )}
                {isCurrentPlan && !isFreeAndCurrent && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                    CURRENT PLAN
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={cn(
                    "mx-auto mb-4 p-3 rounded-xl bg-gradient-to-br w-fit",
                    gradient
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold capitalize">{plan.name}</CardTitle>
                  <CardDescription className="text-sm mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <div className="text-center min-h-[100px] flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">
                      {displayPrice}
                    </div>
                    {monthlyPrice > 0 && planType !== "enterprise" && (
                      <div className="text-sm text-gray-500 mt-1">
                        per {billingPeriod === "yearly" ? "year" : "month"}
                      </div>
                    )}
                    {billingPeriod === "yearly" && yearlyDiscount > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Save {yearlyDiscount}%
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-3 max-h-80 overflow-y-auto">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {isFreeAndCurrent ? (
                    <div className="text-center py-3 px-4 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">
                        You're currently on this plan
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Upgrade to unlock more features
                      </p>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      className={cn(
                        "w-full font-semibold",
                        isSelected && canSelect
                          ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                          : isPro && canSelect
                          ? "bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                          : canSelect
                          ? "bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed",
                        !canSelect && "opacity-50"
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (canSelect) {
                          setSelectedPlan(planType)
                          initiateUpgrade(plan)
                        }
                      }}
                      disabled={!canSelect || loading}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : isSelected
                        ? "✓ Selected - Click to Upgrade"
                        : planType === "enterprise"
                        ? "Contact Sales"
                        : "Select This Plan"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* FAQ or Additional Info */}
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-[#FFD6FF]/20 to-[#C8B6FF]/20 border-[#C8B6FF]/30">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need help choosing the right plan?
              </h3>
              <p className="text-gray-600 mb-4">
                Our team is here to help you find the perfect plan for your business needs.
              </p>
              <Button
                variant="outline"
                className="border-[#C8B6FF] text-[#B8C0FF] hover:bg-[#C8B6FF]/10"
                onClick={() => {
                  const whatsappUrl = "https://api.whatsapp.com/send?phone=6285213539992&text=Halo%2C%20saya%20butuh%20bantuan%20terkait%20subscription%20di%20reserva"
                  window.open(whatsappUrl, '_blank')
                }}
              >
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Link Dialog */}
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Complete Your Payment
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="bg-gradient-to-br from-[#FFD6FF]/20 to-[#C8B6FF]/20 border border-[#C8B6FF]/30 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Your upgrade request has been processed. Click the button below to complete your payment.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    window.open(paymentUrl, '_blank', 'noopener,noreferrer')
                    setShowPaymentDialog(false)
                  }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Open Payment Page
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Your subscription will be activated automatically once payment is confirmed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>I'll Pay Later</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Confirm Subscription Upgrade
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              {pendingUpgradePlan && (
                <>
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-2">You are about to upgrade to:</p>
                    <div className="bg-gradient-to-br from-[#FFD6FF]/20 to-[#C8B6FF]/20 border border-[#C8B6FF]/30 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-gray-900 capitalize">{pendingUpgradePlan.name} Plan</h3>
                      <p className="text-sm text-gray-600 mt-1">{pendingUpgradePlan.description}</p>
                      <div className="mt-3 pt-3 border-t border-[#C8B6FF]/20">
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm text-gray-600">Price:</span>
                          <span className="text-2xl font-bold text-gray-900">
                            {billingPeriod === "yearly" && parseFloat(pendingUpgradePlan.pricing?.yearly_price || "0") > 0
                              ? `Rp ${parseFloat(pendingUpgradePlan.pricing.yearly_price).toLocaleString("id-ID")}`
                              : parseFloat(pendingUpgradePlan.pricing?.monthly_price || "0") === 0
                              ? "Free"
                              : `Rp ${parseFloat(pendingUpgradePlan.pricing.monthly_price).toLocaleString("id-ID")}`}
                            <span className="text-sm font-normal text-gray-500 ml-1">
                              / {billingPeriod}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> You will be charged a prorated amount for the remaining period.
                      Your subscription will be upgraded immediately upon payment confirmation.
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Proceed to Payment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

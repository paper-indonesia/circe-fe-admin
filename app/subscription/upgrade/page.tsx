"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import LiquidLoading from "@/components/ui/liquid-loader"

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

export default function UpgradePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState<any[]>([])
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

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
          setCurrentSubscription(subData)
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

  const handleUpgrade = async (planId: string) => {
    if (planId === "enterprise") {
      toast({
        title: "Contact Sales",
        description: "Please contact our sales team for Enterprise pricing.",
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

    setLoading(true)
    try {
      // TODO: Implement actual upgrade logic
      toast({
        title: "Redirecting to payment...",
        description: "You'll be redirected to complete your subscription.",
      })

      // Here you would integrate with payment gateway
      // For now, just show a message
      setTimeout(() => {
        setLoading(false)
      }, 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process upgrade. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const formatFeatures = (features: any) => {
    const featureList: string[] = []

    if (features.max_outlets) {
      featureList.push(features.max_outlets === 999999 ? "Unlimited outlets" : `Up to ${features.max_outlets} outlet${features.max_outlets > 1 ? 's' : ''}`)
    }

    if (features.max_staff_per_outlet) {
      featureList.push(features.max_staff_per_outlet === 999999 ? "Unlimited staff" : `Up to ${features.max_staff_per_outlet} staff per outlet`)
    }

    if (features.max_customers) {
      featureList.push(features.max_customers === 999999 ? "Unlimited customers" : `Up to ${features.max_customers} customers`)
    }

    if (features.max_services) {
      featureList.push(features.max_services === 999999 ? "Unlimited services" : `Up to ${features.max_services} services`)
    }

    if (features.max_appointments_per_month) {
      featureList.push(features.max_appointments_per_month === 999999 ? "Unlimited appointments" : `${features.max_appointments_per_month} appointments/month`)
    }

    if (features.custom_branding) featureList.push("Custom branding")
    if (features.priority_support) featureList.push("Priority support")
    if (features.analytics_dashboard) featureList.push("Advanced analytics")
    if (features.whatsapp_notifications) featureList.push("WhatsApp notifications")
    if (features.sms_notifications) featureList.push("SMS notifications")
    if (features.payment_processing) featureList.push("Payment processing")
    if (features.recurring_appointments) featureList.push("Recurring appointments")
    if (features.loyalty_program) featureList.push("Loyalty program")
    if (features.api_access) featureList.push("API access")
    if (features.custom_domain) featureList.push("Custom domain")
    if (features.webhook_integrations) featureList.push("Webhook integrations")

    if (features.platform_fee_enabled && features.platform_fee_rate) {
      const feePercent = (parseFloat(features.platform_fee_rate) * 100).toFixed(0)
      featureList.push(`${feePercent}% platform fee`)
    }

    return featureList
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
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
                Save up to 17%
              </Badge>
            )}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto items-stretch">
          {plans.map((plan) => {
            const Icon = planIcons[plan.plan] || Star
            const gradient = planGradients[plan.plan] || "from-blue-500 to-cyan-500"
            const isCurrentPlan = currentPlan === plan.plan
            const isPro = plan.plan === "pro"

            const monthlyPrice = parseFloat(plan.pricing?.monthly_price || "0")
            const yearlyPrice = parseFloat(plan.pricing?.yearly_price || "0")

            const displayPrice = plan.plan === "enterprise"
              ? "Custom"
              : billingPeriod === "yearly" && yearlyPrice > 0
              ? `Rp ${yearlyPrice.toLocaleString("id-ID")}`
              : monthlyPrice === 0
              ? "Free"
              : `Rp ${monthlyPrice.toLocaleString("id-ID")}`

            const features = formatFeatures(plan.features)

            const isSelected = selectedPlan === plan.plan
            const isFreeAndCurrent = plan.plan === "free" && isCurrentPlan
            const canSelect = !isCurrentPlan && !isFreeAndCurrent

            return (
              <Card
                key={plan.plan}
                onClick={() => canSelect && setSelectedPlan(plan.plan)}
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
                    {monthlyPrice > 0 && plan.plan !== "enterprise" && (
                      <div className="text-sm text-gray-500 mt-1">
                        per {billingPeriod === "yearly" ? "year" : "month"}
                      </div>
                    )}
                    {billingPeriod === "yearly" && plan.pricing?.yearly_discount_percent > 0 && (
                      <div className="text-xs text-green-600 mt-1">
                        Save {plan.pricing.yearly_discount_percent.toFixed(0)}%
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
                          setSelectedPlan(plan.plan)
                          handleUpgrade(plan.plan)
                        }
                      }}
                      disabled={!canSelect || loading}
                    >
                      {isCurrentPlan
                        ? "Current Plan"
                        : isSelected
                        ? "✓ Selected - Click to Upgrade"
                        : plan.plan === "enterprise"
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
              <Button variant="outline" className="border-[#C8B6FF] text-[#B8C0FF] hover:bg-[#C8B6FF]/10">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

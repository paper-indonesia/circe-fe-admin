"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  ArrowLeft,
  Crown,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Settings,
  TrendingDown,
  X
} from "lucide-react"
import { format } from "date-fns"
import LiquidLoading from "@/components/ui/liquid-loader"
import { cn } from "@/lib/utils"

export default function ManageSubscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string>("")
  const [renewalLoading, setRenewalLoading] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
  const [downgradeLoading, setDowngradeLoading] = useState(false)
  const [downgradeReason, setDowngradeReason] = useState("")
  const [targetPlan, setTargetPlan] = useState("")

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          // Transform API response to match component expectations
          setSubscription({
            id: data.id,
            plan: data.plan?.toLowerCase() || 'free',
            status: data.status,
            start_date: data.current_period_start,
            end_date: data.current_period_end,
            auto_renew: !data.cancel_at_period_end, // False if cancellation scheduled
            cancel_at_period_end: data.cancel_at_period_end,
            canceled_at: data.cancelled_at,
            billing_period: data.billing_period,
            features: data.features,
            usage: data.usage,
            trial_end: data.trial_end
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to load subscription details",
            variant: "destructive"
          })
          router.push('/dashboard')
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription details",
          variant: "destructive"
        })
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [router, toast])

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.")) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast({
        title: "Subscription Cancelled",
        description: `Your subscription has been cancelled. You'll have access until ${subscription.end_date ? format(new Date(subscription.end_date), "MMM dd, yyyy") : "the end of your billing period"}.`,
      })

      // Refresh page to show cancellation status
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error('Cancellation error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePaymentMethod = () => {
    toast({
      title: "Update Payment Method",
      description: "Redirecting to payment settings...",
    })
    // TODO: Implement payment method update
  }

  const handleRenewSubscription = async () => {
    if (!subscription?.id) {
      toast({
        title: "Error",
        description: "Subscription ID not found",
        variant: "destructive"
      })
      return
    }

    setRenewalLoading(true)
    try {
      const response = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.id
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to renew subscription')
      }

      // Check if payment is required
      if (data.status === 'payment_pending' && data.invoice?.paper_payment_url) {
        console.log('Renewal payment pending, processing invoice:', data.invoice)

        // Store renewal details
        localStorage.setItem('pending_renewal_invoice', JSON.stringify(data.invoice))
        localStorage.setItem('renewal_details', JSON.stringify(data.renewal_details))

        // Ensure payment URL has proper protocol
        let finalPaymentUrl = data.invoice.paper_payment_url
        if (!finalPaymentUrl.startsWith('http://') && !finalPaymentUrl.startsWith('https://')) {
          finalPaymentUrl = 'https://' + finalPaymentUrl
        }

        // Show payment dialog
        setPaymentUrl(finalPaymentUrl)
        setShowPaymentDialog(true)
        setRenewalLoading(false)
      } else if (data.status === 'active') {
        // Renewal successful without payment
        toast({
          title: "Success!",
          description: "Your subscription has been renewed.",
        })

        // Refresh page to show updated dates
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      console.error('Renewal error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to renew subscription. Please try again.",
        variant: "destructive"
      })
      setRenewalLoading(false)
    }
  }

  const handleDowngradeSubscription = async () => {
    if (!targetPlan) {
      toast({
        title: "Error",
        description: "Please select a target plan",
        variant: "destructive"
      })
      return
    }

    setDowngradeLoading(true)
    try {
      const response = await fetch('/api/subscription/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_plan: targetPlan,
          reason: downgradeReason || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to schedule downgrade')
      }

      toast({
        title: "Downgrade Scheduled",
        description: `Your plan will be downgraded to ${targetPlan} at the end of your billing period.`,
      })

      // Close dialog and refresh page
      setShowDowngradeDialog(false)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error('Downgrade error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to schedule downgrade. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDowngradeLoading(false)
    }
  }

  const getAvailableDowngradePlans = () => {
    const currentPlan = subscription.plan.toLowerCase()
    if (currentPlan === 'enterprise') return ['pro', 'free']
    if (currentPlan === 'pro') return ['free']
    return []
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

  if (!subscription) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">No subscription found</p>
          <Button onClick={() => router.push('/subscription/upgrade')} className="mt-4">
            View Plans
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
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

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-[#C8B6FF] to-[#B8C0FF] rounded-xl">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage Subscription
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage your subscription details
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <Card className="border-2 border-[#C8B6FF] bg-gradient-to-br from-[#FFD6FF]/20 to-[#C8B6FF]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl capitalize">{subscription.plan} Plan</CardTitle>
                <CardDescription className="text-base mt-1">
                  Your current subscription plan
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF] text-white">
                {subscription.status === "active" ? "Active" : subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                <Calendar className="h-5 w-5 text-[#B8C0FF] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold text-gray-900">
                    {subscription.start_date
                      ? format(new Date(subscription.start_date), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
                <Calendar className="h-5 w-5 text-[#B8C0FF] mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    {subscription.status === "active" ? "Renewal Date" : "End Date"}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {subscription.end_date
                      ? format(new Date(subscription.end_date), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {subscription.auto_renew !== undefined && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-900">
                  {subscription.auto_renew
                    ? "Auto-renewal is enabled"
                    : "Auto-renewal is disabled"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancellation Status Banner */}
        {subscription.cancel_at_period_end && subscription.end_date && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">Subscription Cancelled</h3>
                  <p className="text-sm text-red-800 mt-1">
                    Your subscription has been cancelled and will end on{" "}
                    <span className="font-semibold">
                      {format(new Date(subscription.end_date), "MMM dd, yyyy")}
                    </span>.
                    You'll continue to have access to all features until then.
                  </p>
                  {subscription.canceled_at && (
                    <p className="text-xs text-red-700 mt-1">
                      Cancelled on {format(new Date(subscription.canceled_at), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                  )}
                  <p className="text-xs text-red-600 mt-2">
                    • Your data will be retained for 30 days after cancellation
                    <br />
                    • You can reactivate your subscription before it ends
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => {
                    // TODO: Implement reactivate subscription
                    toast({
                      title: "Reactivate Subscription",
                      description: "This feature will be implemented soon.",
                    })
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Reactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Downgrade Warning */}
        {subscription.scheduled_changes?.target_plan && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900">Scheduled Downgrade</h3>
                  <p className="text-sm text-orange-800 mt-1">
                    Your subscription will be downgraded to{" "}
                    <span className="font-semibold capitalize">{subscription.scheduled_changes.target_plan}</span> on{" "}
                    {subscription.scheduled_changes.effective_date
                      ? format(new Date(subscription.scheduled_changes.effective_date), "MMM dd, yyyy")
                      : "next billing cycle"}
                  </p>
                  {subscription.scheduled_changes.reason && (
                    <p className="text-xs text-orange-700 mt-1">
                      Reason: {subscription.scheduled_changes.reason}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  onClick={() => {
                    // TODO: Implement cancel downgrade
                    toast({
                      title: "Cancel Downgrade",
                      description: "This feature will be implemented soon.",
                    })
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Upgrade Plan</CardTitle>
                  <CardDescription>Get more features</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF] hover:from-[#B8B0EF] hover:to-[#A8A0DF] text-white"
                onClick={() => router.push('/subscription/upgrade')}
              >
                View Available Plans
              </Button>
            </CardContent>
          </Card>

          {/* Only show Renew button for paid plans (Pro/Enterprise) */}
          {subscription.plan !== "free" && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Renew Subscription</CardTitle>
                    <CardDescription>Extend your current plan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  onClick={handleRenewSubscription}
                  disabled={renewalLoading}
                >
                  {renewalLoading ? "Processing..." : "Renew Now"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Only show Downgrade button for paid plans with available lower tiers */}
          {subscription.plan !== "free" && getAvailableDowngradePlans().length > 0 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Downgrade Plan</CardTitle>
                    <CardDescription>Reduce costs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={() => setShowDowngradeDialog(true)}
                >
                  Schedule Downgrade
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                  <CardDescription>Update billing details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleUpdatePaymentMethod}
              >
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View your past invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No billing history available</p>
              <p className="text-xs mt-1">Your invoices will appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        {subscription.plan !== "free" && !subscription.cancel_at_period_end && (
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <CardTitle className="text-red-900">Danger Zone</CardTitle>
                  <CardDescription className="text-red-700">
                    Irreversible actions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-red-800">
                  Cancelling your subscription will downgrade you to the free plan at the end of your billing period.
                  You'll lose access to premium features.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={loading}
                >
                  Cancel Subscription
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Dialog for Renewal */}
        <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-green-500" />
                Complete Your Renewal Payment
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Your renewal request has been processed. Click the button below to complete your payment.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    onClick={() => {
                      window.open(paymentUrl, '_blank', 'noopener,noreferrer')
                      setShowPaymentDialog(false)
                    }}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Open Payment Page
                  </Button>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  After completing payment, your subscription will be automatically renewed.
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>I'll Pay Later</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Downgrade Dialog */}
        <AlertDialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                Schedule Plan Downgrade
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <p className="font-semibold">Important Notice:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Downgrade takes effect at your next billing cycle</li>
                        <li>No refund for the remaining period</li>
                        <li>You can cancel this downgrade before it takes effect</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="target-plan">Target Plan *</Label>
                    <Select value={targetPlan} onValueChange={setTargetPlan}>
                      <SelectTrigger id="target-plan" className="mt-1">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableDowngradePlans().map((plan) => (
                          <SelectItem key={plan} value={plan}>
                            <span className="capitalize">{plan}</span> Plan
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="downgrade-reason">Reason (Optional)</Label>
                    <Textarea
                      id="downgrade-reason"
                      placeholder="Tell us why you're downgrading (optional)"
                      value={downgradeReason}
                      onChange={(e) => setDowngradeReason(e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={downgradeLoading}>Cancel</AlertDialogCancel>
              <Button
                onClick={handleDowngradeSubscription}
                disabled={downgradeLoading || !targetPlan}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {downgradeLoading ? "Processing..." : "Schedule Downgrade"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

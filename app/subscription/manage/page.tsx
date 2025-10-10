"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Settings
} from "lucide-react"
import { format } from "date-fns"
import LiquidLoading from "@/components/ui/liquid-loader"
import { cn } from "@/lib/utils"

export default function ManageSubscriptionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
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
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to premium features.")) {
      return
    }

    setLoading(true)
    try {
      // TODO: Implement actual cancellation logic
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll have access until the end of the billing period.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
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
      <div className="space-y-6 pb-8 max-w-4xl mx-auto">
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

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
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
        {subscription.plan !== "free" && (
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
      </div>
    </MainLayout>
  )
}

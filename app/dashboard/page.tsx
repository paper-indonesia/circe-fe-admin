"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { useBookings, usePatients, useStaff, useTreatments } from "@/lib/context"
import { useAuth } from "@/lib/auth-context"
import { useSubscription } from "@/lib/subscription-context"
import { format, isToday, subDays, startOfDay, endOfDay, isWithinInterval, isSameDay, startOfWeek } from "date-fns"
import { useRouter } from "next/navigation"
import { formatCurrency, cn } from "@/lib/utils"
import GradientLoading from "@/components/gradient-loading"
import { OnboardingResumeBanner } from "@/components/onboarding-resume-banner"
import { OperationalOnboardingWizard } from "@/components/operational-onboarding-wizard"
import { OperationalOnboardingProvider as OnboardingContext, useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import {
  Calendar,
  Banknote,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  ChevronRight,
  ChevronLeft,
  Crown,
  Zap,
  Shield,
  AlertTriangle,
  BarChart3,
  XCircle,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from 'recharts'

// Color palette from typography-preview.html
const COLORS = {
  // Primary colors
  primaryPurple: '#8B5CF6',
  secondaryPurple: '#A78BFA',
  lightPurple: '#C4B5FD',
  lightestPurple: '#EDE9FE',
  darkPurple: '#6D28D9',

  // Accent colors
  accentPink: '#EC4899',
  lightPink: '#FCD6F5',

  // Neutral colors
  dark: '#1F2937',
  grayDark: '#4B5563',
  grayMedium: '#9CA3AF',
  grayLight: '#E5E7EB',
}

// Chart colors for pie/bar charts
const CHART_COLORS = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#EC4899', '#EDE9FE']

// Helper function to get usage color based on status
const getUsageColor = (status: string) => {
  switch (status) {
    case 'exceeded':
    case 'at_limit':
      return { bg: 'bg-red-100', text: 'text-red-700', progress: 'bg-red-500' }
    case 'approaching_limit':
      return { bg: 'bg-orange-100', text: 'text-orange-700', progress: 'bg-orange-500' }
    case 'unlimited':
      return { bg: 'bg-blue-100', text: 'text-blue-700', progress: 'bg-blue-500' }
    default:
      return { bg: 'bg-green-100', text: 'text-green-700', progress: 'bg-green-500' }
  }
}

// Helper function to format resource name
const formatResourceName = (key: string) => {
  const labels: Record<string, string> = {
    outlets: 'Outlets',
    staff: 'Staff',
    customers: 'Customers',
    appointments_this_month: 'Appointments',
    services: 'Services',
    products: 'Products'
  }
  return labels[key] || key.replace(/_/g, ' ')
}

function DashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { user: authUser, isAdmin } = useAuth()

  const { bookings = [], loading: bookingsLoading } = useBookings()
  const { patients = [], loading: patientsLoading } = usePatients()
  const { staff = [], loading: staffLoading } = useStaff()
  const { treatments = [], loading: treatmentsLoading } = useTreatments()

  // Use subscription context instead of local state
  const { subscription, usage, loading: subscriptionLoading } = useSubscription()

  const isLoading = bookingsLoading || patientsLoading || staffLoading || treatmentsLoading

  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [tenant, setTenant] = useState<any>(null)
  const [greeting, setGreeting] = useState("Good morning")
  const [transactionPage, setTransactionPage] = useState(0)
  const transactionsPerPage = 5
  const [showUsageDetails, setShowUsageDetails] = useState(false)

  // Load user, tenant and set greeting
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedTenant = localStorage.getItem("tenant")

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse user data")
      }
    }

    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant))
      } catch (e) {
        console.error("Failed to parse tenant data")
      }
    }

    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  // Subscription data is now loaded from context - no need to fetch here

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'Admin'
    if (user.first_name) return user.first_name
    if (user.name) return user.name
    return user.email?.split('@')[0] || 'Admin'
  }

  // Utility: Calculate percentage change
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Utility: Get change indicator styling
  const getChangeIndicator = (change: number) => {
    if (change > 0) return { icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-50' }
    if (change < 0) return { icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-50' }
    return { icon: ArrowRight, color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  // Calculate metrics
  const todaysBookings = useMemo(() =>
    bookings?.filter((booking) => isToday(new Date(booking.startAt))) || []
  , [bookings])

  // Yesterday's bookings for comparison
  const yesterdayBookings = useMemo(() => {
    const yesterday = subDays(new Date(), 1)
    return bookings?.filter((booking) =>
      isWithinInterval(new Date(booking.startAt), {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday)
      })
    ) || []
  }, [bookings])

  const completedBookings = useMemo(() =>
    todaysBookings.filter((b) => b.status === "completed")
  , [todaysBookings])

  const todaysRevenue = useMemo(() =>
    completedBookings.reduce((total, booking) => {
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      return total + (treatment?.price || 0)
    }, 0)
  , [completedBookings, treatments])

  const newCustomersToday = useMemo(() =>
    patients?.filter((p) => isToday(new Date(p.createdAt || new Date()))).length || 0
  , [patients])

  // Yesterday's metrics for comparison
  const yesterdayCompleted = useMemo(() =>
    yesterdayBookings.filter((b) => b.status === "completed")
  , [yesterdayBookings])

  const yesterdayRevenue = useMemo(() =>
    yesterdayCompleted.reduce((total, booking) => {
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      return total + (treatment?.price || 0)
    }, 0)
  , [yesterdayCompleted, treatments])

  const yesterdayNewCustomers = useMemo(() => {
    const yesterday = subDays(new Date(), 1)
    return patients?.filter((p) =>
      isWithinInterval(new Date(p.createdAt || new Date()), {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday)
      })
    ).length || 0
  }, [patients])

  // Last 7 days data for sparklines
  const last7DaysData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dayBookings = bookings?.filter((booking) =>
        isSameDay(new Date(booking.startAt), date)
      ) || []

      const dayCompleted = dayBookings.filter(b => b.status === "completed")
      const dayRevenue = dayCompleted.reduce((sum, b) => {
        const treatment = treatments?.find(t => t.id === b.treatmentId)
        return sum + (treatment?.price || 0)
      }, 0)

      const dayNewCustomers = patients?.filter((p) =>
        isSameDay(new Date(p.createdAt || new Date()), date)
      ).length || 0

      return {
        date: format(date, 'MMM d'),
        bookings: dayBookings.length,
        revenue: dayRevenue,
        newCustomers: dayNewCustomers
      }
    })
  }, [bookings, treatments, patients])

  // Weekly no-shows
  const weeklyNoShows = useMemo(() => {
    const weekStart = startOfWeek(new Date())
    return bookings?.filter((booking) =>
      booking.status === 'no_show' &&
      isWithinInterval(new Date(booking.startAt), {
        start: weekStart,
        end: new Date()
      })
    ).length || 0
  }, [bookings])

  // Pending confirmations
  const pendingConfirmations = useMemo(() =>
    bookings?.filter((booking) => booking.status === 'pending').length || 0
  , [bookings])

  // Pending payments (unpaid bookings, exclude cancelled and no-show)
  const pendingPayments = useMemo(() =>
    bookings?.filter((booking) => {
      const isUnpaid = booking.payment_status === 'unpaid' || booking.payment_status === 'pending'
      const isValidStatus = booking.status !== 'cancelled' && booking.status !== 'no_show' && booking.status !== 'no-show'
      return isUnpaid && isValidStatus
    }) || []
  , [bookings])

  const pendingPaymentsCount = pendingPayments.length

  const pendingPaymentsAmount = useMemo(() =>
    pendingPayments.reduce((total, booking) => {
      // Use total_price from appointment if available, otherwise fallback to treatment price
      if (booking.total_price) {
        return total + booking.total_price
      }
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      return total + (treatment?.price || 0)
    }, 0)
  , [pendingPayments, treatments])

  // Comparison calculations
  const bookingsChange = calculateChange(todaysBookings.length, yesterdayBookings.length)
  const revenueChange = calculateChange(todaysRevenue, yesterdayRevenue)
  const newCustomersChange = calculateChange(newCustomersToday, yesterdayNewCustomers)

  // Upcoming appointments (next 5 today)
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return todaysBookings
      .filter(b => new Date(b.startAt) > now && b.status === "confirmed")
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .slice(0, 5)
  }, [todaysBookings])

  // Top staff today
  const topStaffToday = useMemo(() => {
    const staffEarnings = staff.map(s => {
      const staffBookings = completedBookings.filter(b => b.staffId === s.id)
      const earnings = staffBookings.reduce((total, booking) => {
        const treatment = treatments?.find((t) => t.id === booking.treatmentId)
        return total + (treatment?.price || 0)
      }, 0)
      return { ...s, earnings, bookings: staffBookings.length }
    })
    return staffEarnings.sort((a, b) => b.earnings - a.earnings).slice(0, 3)
  }, [staff, completedBookings, treatments])

  // Revenue by service
  const revenueByService = useMemo(() => {
    const serviceRevenue: { [key: string]: number } = {}
    completedBookings.forEach(booking => {
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      if (treatment) {
        serviceRevenue[treatment.name] = (serviceRevenue[treatment.name] || 0) + treatment.price
      }
    })
    return Object.entries(serviceRevenue).map(([name, value]) => ({ name, value }))
  }, [completedBookings, treatments])

  // Recent transactions (all completed bookings sorted)
  const allTransactions = useMemo(() => {
    return bookings
      .filter(b => b.status === "completed")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [bookings])

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const start = transactionPage * transactionsPerPage
    return allTransactions.slice(start, start + transactionsPerPage)
  }, [allTransactions, transactionPage])

  const totalTransactionPages = Math.ceil(allTransactions.length / transactionsPerPage)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <GradientLoading text="Loading Dashboard" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {getDisplayName()}!
            </h1>
            <p className="text-gray-500 mt-1">Here's your business overview for today</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(), "MMM dd, yyyy")}
          </Button>
        </div>

        {/* Operational Onboarding Banner - Only for tenant_admin */}
        {authUser && isAdmin() && (
          <OnboardingResumeBanner onResume={() => setShowOnboarding(true)} />
        )}

        {/* Operational Onboarding Wizard */}
        {showOnboarding && (
          <OperationalOnboardingWizard
            open={showOnboarding}
            onComplete={() => {
              setShowOnboarding(false)
              window.location.reload()
            }}
          />
        )}

        {/* Subscription Card - Only for tenant_admin */}
        {subscription && user?.role === 'tenant_admin' && (
          <Card className={cn(
            "border-2 overflow-hidden transition-all duration-300",
            subscription.plan === "free"
              ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
              : "bg-gradient-to-br from-[#EDE9FE] via-[#C4B5FD]/30 to-[#A78BFA]/20 border-[#8B5CF6]"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    subscription.plan === "free"
                      ? "bg-gray-200"
                      : "bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]"
                  )}>
                    {subscription.plan === "free" ? (
                      <Shield className="h-6 w-6 text-gray-600" />
                    ) : (
                      <Crown className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900 capitalize">
                        {subscription.plan} Plan
                      </h3>
                      {subscription.plan !== "free" && (
                        <Badge className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white border-0">
                          Active
                        </Badge>
                      )}
                      {/* Usage Warning Badges */}
                      {usage && usage.usage_summary && (() => {
                        const criticalResources = Object.entries(usage.usage_summary).filter(([key, value]: [string, any]) => {
                          return value.percentage >= 100
                        })
                        const warningResources = Object.entries(usage.usage_summary).filter(([key, value]: [string, any]) => {
                          return value.percentage >= 80 && value.percentage < 100 && value.limit !== -1
                        })

                        return (
                          <>
                            {criticalResources.length > 0 && (
                              <Badge variant="destructive" className="text-xs animate-pulse">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {criticalResources.length} at limit
                              </Badge>
                            )}
                            {warningResources.length > 0 && (
                              <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {warningResources.length} near limit
                              </Badge>
                            )}
                          </>
                        )
                      })()}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {subscription.plan === "free"
                        ? "Basic features for getting started"
                        : subscription.plan === "basic"
                        ? "Essential features for growing clinics"
                        : subscription.plan === "professional"
                        ? "Advanced features for professional clinics"
                        : "Full access to all premium features"}
                    </p>
                    {subscription.end_date && subscription.plan !== "free" && (
                      <p className="text-xs text-gray-500 mt-1">
                        {subscription.status === "active" ? "Renews" : "Expires"} on {format(new Date(subscription.end_date), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Usage Toggle Button */}
                  {usage && usage.usage_summary && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                      onClick={() => setShowUsageDetails(!showUsageDetails)}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      {showUsageDetails ? "Hide Usage" : "View Usage"}
                    </Button>
                  )}

                  {subscription.plan === "free" && (
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#8B5CF6] hover:from-[#6D28D9] hover:via-[#EC4899] hover:to-[#6D28D9] text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-pulse"
                      onClick={() => router.push('/subscription/upgrade')}
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Upgrade Plan Now
                    </Button>
                  )}

                  {subscription.plan !== "free" && (
                    <Button
                      variant="outline"
                      className="border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#EDE9FE]"
                      onClick={() => router.push('/subscription/manage')}
                    >
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </div>

              {/* Collapsible Usage Details */}
              {usage && usage.usage_summary && showUsageDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-semibold text-gray-900">Usage Details</h4>
                    </div>
                    {usage.current_period_start && usage.current_period_end && (
                      <p className="text-xs text-gray-500">
                        Period: {format(new Date(usage.current_period_start), "MMM dd")} - {format(new Date(usage.current_period_end), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Object.entries(usage.usage_summary).map(([key, value]: [string, any]) => {
                      if (key === 'overage_warnings') return null

                      // Determine status based on percentage and approaching_limits
                      let status = 'normal'
                      if (value.limit === -1 || value.limit === null) {
                        status = 'unlimited'
                      } else if (value.percentage >= 100) {
                        status = 'exceeded'
                      } else if (value.percentage === 100) {
                        status = 'at_limit'
                      } else if (usage.approaching_limits?.includes(key) || value.percentage >= 80) {
                        status = 'approaching_limit'
                      }

                      const colors = getUsageColor(status)
                      const isUnlimited = status === 'unlimited'

                      return (
                        <div key={key} className={cn("p-3 rounded-lg border", colors.bg)}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">
                              {formatResourceName(key)}
                            </span>
                            {(status === 'approaching_limit' || status === 'at_limit' || status === 'exceeded') && (
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                            )}
                          </div>

                          {isUnlimited ? (
                            <div className="space-y-1">
                              <p className={cn("text-xl font-bold", colors.text)}>∞</p>
                              <p className="text-xs text-gray-600">Unlimited</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-baseline gap-1">
                                <span className={cn("text-lg font-bold", colors.text)}>
                                  {value.used?.toLocaleString() || 0}
                                </span>
                                <span className="text-xs text-gray-600">
                                  / {value.limit?.toLocaleString() || 0}
                                </span>
                              </div>
                              <Progress
                                value={Math.min(value.percentage || 0, 100)}
                                className={cn("h-1.5", colors.progress)}
                              />
                              <p className="text-xs text-gray-600">
                                {value.percentage?.toFixed(0)}% used
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Warnings and Recommendations */}
                  {(usage.upgrade_recommended || (usage.approaching_limits && usage.approaching_limits.length > 0)) && (
                    <div className="flex flex-col gap-2">
                      {/* Approaching Limits Notice */}
                      {usage.approaching_limits && usage.approaching_limits.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-yellow-900">Approaching Limits</p>
                              <p className="text-xs text-yellow-700 mt-0.5">
                                {usage.approaching_limits.map((item: string) => formatResourceName(item)).join(', ')} {usage.approaching_limits.length === 1 ? 'is' : 'are'} near capacity
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Upgrade Recommendation */}
                      {usage.upgrade_recommended && (
                        <div className="p-3 bg-[#EDE9FE] border border-[#C4B5FD] rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-2">
                              <TrendingUp className="h-4 w-4 text-[#8B5CF6] mt-0.5" />
                              <div>
                                <p className="text-xs font-medium text-[#6D28D9]">Upgrade Recommended</p>
                                <p className="text-xs text-[#8B5CF6] mt-0.5">
                                  Consider upgrading for more capacity and features
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#EC4899] text-white text-xs h-7"
                              onClick={() => router.push('/subscription/upgrade')}
                            >
                              Upgrade
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Plan Features Preview - Only show when usage is hidden */}
              {subscription.plan === "free" && !showUsageDetails && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600 mb-2">Upgrade to unlock:</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Unlimited Bookings
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Advanced Reports
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Priority Support
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Custom Branding
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{todaysBookings.length}</p>

                  {/* Comparison indicator */}
                  {(() => {
                    const indicator = getChangeIndicator(bookingsChange)
                    const ChangeIcon = indicator.icon
                    return (
                      <div className="flex items-center gap-1 mt-1">
                        <ChangeIcon className={cn("h-3 w-3", indicator.color)} />
                        <span className={cn("text-xs font-medium", indicator.color)}>
                          {Math.abs(bookingsChange).toFixed(1)}% vs yesterday
                        </span>
                      </div>
                    )
                  })()}

                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {completedBookings.length} completed
                  </p>
                </div>
                <div className="p-3 bg-[#EDE9FE] rounded-lg">
                  <Calendar className="h-6 w-6 text-[#8B5CF6]" />
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="h-[40px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7DaysData}>
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="#A78BFA"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(todaysRevenue, true)}</p>

                  {/* Comparison indicator */}
                  {(() => {
                    const indicator = getChangeIndicator(revenueChange)
                    const ChangeIcon = indicator.icon
                    return (
                      <div className="flex items-center gap-1 mt-1">
                        <ChangeIcon className={cn("h-3 w-3", indicator.color)} />
                        <span className={cn("text-xs font-medium", indicator.color)}>
                          {Math.abs(revenueChange).toFixed(1)}% vs yesterday
                        </span>
                      </div>
                    )
                  })()}

                  <p className="text-xs text-gray-500 mt-1">From {completedBookings.length} bookings</p>
                </div>
                <div className="p-3 bg-[#FCD6F5] rounded-lg">
                  <Banknote className="h-6 w-6 text-[#EC4899]" />
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="h-[40px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7DaysData}>
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(pendingPaymentsAmount, true)}</p>
                  <p className="text-xs text-orange-600 mt-1">{pendingPaymentsCount} invoice{pendingPaymentsCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-3 bg-[#C4B5FD] rounded-lg">
                  <Clock className="h-6 w-6 text-[#6D28D9]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">New Clients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{newCustomersToday}</p>

                  {/* Comparison indicator */}
                  {(() => {
                    const indicator = getChangeIndicator(newCustomersChange)
                    const ChangeIcon = indicator.icon
                    return (
                      <div className="flex items-center gap-1 mt-1">
                        <ChangeIcon className={cn("h-3 w-3", indicator.color)} />
                        <span className={cn("text-xs font-medium", indicator.color)}>
                          {Math.abs(newCustomersChange).toFixed(1)}% vs yesterday
                        </span>
                      </div>
                    )
                  })()}

                  <p className="text-xs text-[#8B5CF6] mt-1">Today</p>
                </div>
                <div className="p-3 bg-[#A78BFA]/20 rounded-lg">
                  <Users className="h-6 w-6 text-[#6D28D9]" />
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="h-[40px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={last7DaysData}>
                    <Line
                      type="monotone"
                      dataKey="newCustomers"
                      stroke="#A78BFA"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  {allTransactions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/reports')}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      View All in Reports
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No transactions yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left text-xs font-medium text-gray-500 pb-3">Date & Time</th>
                            <th className="text-left text-xs font-medium text-gray-500 pb-3">Client</th>
                            <th className="text-left text-xs font-medium text-gray-500 pb-3">Service</th>
                            <th className="text-left text-xs font-medium text-gray-500 pb-3">Staff</th>
                            <th className="text-left text-xs font-medium text-gray-500 pb-3">Type</th>
                            <th className="text-right text-xs font-medium text-gray-500 pb-3">Amount</th>
                            <th className="text-center text-xs font-medium text-gray-500 pb-3">Status</th>
                            <th className="text-center text-xs font-medium text-gray-500 pb-3">Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allTransactions.slice(0, 5).map((transaction) => {
                            // Get service info from services array (new API structure)
                            const firstService = transaction.services && transaction.services.length > 0
                              ? transaction.services[0]
                              : null

                            // Fallback to old structure
                            const treatment = treatments.find(t => t.id === transaction.treatmentId)
                            const staffMember = staff.find(s => s.id === transaction.staffId)
                            const patient = patients.find(p => p.id === transaction.patientId)

                            // Use new API data or fallback to old
                            const serviceName = firstService?.service_name || treatment?.name || "Unknown"
                            const staffName = firstService?.staff_name || staffMember?.name || "N/A"
                            const amount = transaction.total_price || treatment?.price || 0
                            const appointmentDate = transaction.appointment_date
                              ? `${transaction.appointment_date} ${transaction.start_time || ''}`
                              : transaction.createdAt

                            return (
                              <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-3 text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{format(new Date(appointmentDate), "MMM dd")}</span>
                                    {transaction.start_time && (
                                      <span className="text-xs text-gray-500">{transaction.start_time}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 text-sm font-medium text-gray-900">
                                  {patient?.name || transaction.patientName || transaction.customer?.name || 'Unknown'}
                                </td>
                                <td className="py-3 text-sm text-gray-600">
                                  <div className="flex flex-col">
                                    <span>{serviceName}</span>
                                    {firstService?.duration_minutes && (
                                      <span className="text-xs text-gray-500">{firstService.duration_minutes} min</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 text-sm text-gray-600">
                                  {staffName}
                                </td>
                                <td className="py-3 text-sm">
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {transaction.appointment_type || transaction.source || 'online'}
                                  </Badge>
                                </td>
                                <td className="py-3 text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(amount)}
                                </td>
                                <td className="py-3 text-center">
                                  <Badge
                                    variant={
                                      transaction.status === "completed" ? "default" :
                                      transaction.status === "confirmed" ? "secondary" :
                                      transaction.status === "cancelled" ? "destructive" :
                                      "outline"
                                    }
                                    className="text-xs capitalize"
                                  >
                                    {transaction.status}
                                  </Badge>
                                </td>
                                <td className="py-3 text-center">
                                  <Badge
                                    variant={
                                      transaction.payment_status === "paid" ? "default" :
                                      transaction.payment_status === "pending" || transaction.payment_status === "unpaid" ? "secondary" :
                                      "outline"
                                    }
                                    className="text-xs capitalize"
                                  >
                                    {transaction.payment_status || transaction.paymentStatus || 'unpaid'}
                                  </Badge>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Alerts */}
            {(pendingPaymentsCount > 0 || pendingConfirmations > 0 || weeklyNoShows > 0) && (
              <Card className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Quick Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pendingPaymentsCount > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg hover:bg-red-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4 text-red-700" />
                          <span className="text-sm font-medium text-red-900">{pendingPaymentsCount} Unpaid Invoice{pendingPaymentsCount > 1 ? 's' : ''}</span>
                        </div>
                        <Badge variant="destructive" className="text-xs">
                          {formatCurrency(pendingPaymentsAmount, true)}
                        </Badge>
                      </div>
                    )}

                    {pendingConfirmations > 0 && (
                      <div className="flex items-center justify-between p-3 bg-orange-100 rounded-lg hover:bg-orange-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-orange-700" />
                          <span className="text-sm font-medium text-orange-900">{pendingConfirmations} Pending Confirmation{pendingConfirmations > 1 ? 's' : ''}</span>
                        </div>
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-xs text-white">
                          Action Required
                        </Badge>
                      </div>
                    )}

                    {weeklyNoShows > 0 && (
                      <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-yellow-700" />
                          <span className="text-sm font-medium text-yellow-900">{weeklyNoShows} No-Show{weeklyNoShows > 1 ? 's' : ''} This Week</span>
                        </div>
                        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs text-white">
                          Review
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No upcoming appointments</p>
                  ) : (
                    upcomingAppointments.map((apt) => {
                      const treatment = treatments.find(t => t.id === apt.treatmentId)
                      const patient = patients.find(p => p.id === apt.patientId)
                      return (
                        <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex flex-col items-center justify-center">
                              <span className="text-xs text-blue-600 font-medium">
                                {format(new Date(apt.startAt), "HH:mm")}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {patient?.name || apt.patientName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {treatment?.name || "Product"}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {apt.status}
                          </Badge>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Staff Today */}
            <Card className="bg-gradient-to-br from-[#EDE9FE] to-[#FCD6F5]/50 border-[#8B5CF6]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#8B5CF6]" />
                  Top Staff Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStaffToday.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No data yet</p>
                  ) : (
                    topStaffToday.map((s, idx) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white font-semibold">
                            {s.name?.charAt(0) || "?"}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(s.earnings, true)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-[#8B5CF6] hover:text-[#6D28D9] hover:bg-[#EDE9FE]"
                  onClick={() => router.push('/staff')}
                >
                  View All Staff
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
  )
}

export default function DashboardPage() {
  return <DashboardContent />
}

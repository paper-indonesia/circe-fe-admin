"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useBookings, usePatients, useStaff, useTreatments } from "@/lib/context"
import { format, isToday } from "date-fns"
import { useRouter } from "next/navigation"
import { formatCurrency, cn } from "@/lib/utils"
import LiquidLoading from "@/components/ui/liquid-loader"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Copy,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  ChevronRight,
  ChevronLeft,
  Crown,
  Zap,
  Shield,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Color palette from palete.pdf
const COLORS = ['#FFD6FF', '#E7C6FF', '#C8B6FF', '#B8C0FF', '#BBD0FF']

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()

  const { bookings = [], loading: bookingsLoading } = useBookings()
  const { patients = [], loading: patientsLoading } = usePatients()
  const { staff = [], loading: staffLoading } = useStaff()
  const { treatments = [], loading: treatmentsLoading } = useTreatments()

  const isLoading = bookingsLoading || patientsLoading || staffLoading || treatmentsLoading

  const [user, setUser] = useState<any>(null)
  const [tenant, setTenant] = useState<any>(null)
  const [greeting, setGreeting] = useState("Good morning")
  const [transactionPage, setTransactionPage] = useState(0)
  const transactionsPerPage = 5
  const [subscription, setSubscription] = useState<any>(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

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

  // Fetch subscription data - only for tenant_admin
  useEffect(() => {
    const fetchSubscription = async () => {
      // Only fetch if user is tenant_admin
      if (user?.role !== 'tenant_admin') {
        setSubscriptionLoading(false)
        return
      }

      setSubscriptionLoading(true)
      try {
        const response = await fetch('/api/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
      } finally {
        setSubscriptionLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  // Get display name
  const getDisplayName = () => {
    if (!user) return 'Admin'
    if (user.first_name) return user.first_name
    if (user.name) return user.name
    return user.email?.split('@')[0] || 'Admin'
  }

  // Calculate metrics
  const todaysBookings = useMemo(() =>
    bookings?.filter((booking) => isToday(new Date(booking.startAt))) || []
  , [bookings])

  const completedBookings = useMemo(() =>
    todaysBookings.filter((b) => b.status === "completed")
  , [todaysBookings])

  const todaysRevenue = useMemo(() =>
    completedBookings.reduce((total, booking) => {
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      return total + (treatment?.price || 0)
    }, 0)
  , [completedBookings, treatments])

  const totalBalance = useMemo(() => {
    const allCompleted = bookings?.filter((b) => b.status === "completed") || []
    return allCompleted.reduce((total, booking) => {
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      return total + (treatment?.price || 0)
    }, 0)
  }, [bookings, treatments])

  const pendingPayments = useMemo(() =>
    todaysBookings.filter((b) => b.paymentStatus === "unpaid").reduce((total, booking) => {
      const treatment = treatments?.find((t) => t.id === booking.treatmentId)
      return total + (treatment?.price || 0)
    }, 0)
  , [todaysBookings, treatments])

  const newCustomersToday = useMemo(() =>
    patients?.filter((p) => isToday(new Date(p.createdAt || new Date()))).length || 0
  , [patients])

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

  const copyAccountNumber = () => {
    navigator.clipboard.writeText("1234567890")
    toast({ title: "Copied!", description: "Account number copied to clipboard" })
  }

  if (isLoading) {
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
      <div className="space-y-6 pb-8">
        {/* Greeting */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {greeting}, {getDisplayName()}!
            </h1>
            <p className="text-gray-500 mt-1">Here's your clinic overview for today</p>
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

        {/* Subscription Card - Only for tenant_admin */}
        {subscription && user?.role === 'tenant_admin' && (
          <Card className={cn(
            "border-2 overflow-hidden transition-all duration-300",
            subscription.plan === "free"
              ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
              : "bg-gradient-to-br from-[#FFD6FF]/20 via-[#E7C6FF]/20 to-[#C8B6FF]/20 border-[#C8B6FF]"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    subscription.plan === "free"
                      ? "bg-gray-200"
                      : "bg-gradient-to-br from-[#C8B6FF] to-[#B8C0FF]"
                  )}>
                    {subscription.plan === "free" ? (
                      <Shield className="h-6 w-6 text-gray-600" />
                    ) : (
                      <Crown className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900 capitalize">
                        {subscription.plan} Plan
                      </h3>
                      {subscription.plan !== "free" && (
                        <Badge className="bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF] text-white border-0">
                          Active
                        </Badge>
                      )}
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

                {subscription.plan === "free" && (
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-pulse"
                    onClick={() => router.push('/subscription/upgrade')}
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Upgrade Plan Now
                  </Button>
                )}

                {subscription.plan !== "free" && (
                  <Button
                    variant="outline"
                    className="border-[#C8B6FF] text-[#B8C0FF] hover:bg-[#C8B6FF]/10"
                    onClick={() => router.push('/subscription/manage')}
                  >
                    Manage Subscription
                  </Button>
                )}
              </div>

              {/* Plan Features Preview */}
              {subscription.plan === "free" && (
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
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{todaysBookings.length}</p>
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {completedBookings.length} completed
                  </p>
                </div>
                <div className="p-3 bg-[#BBD0FF]/30 rounded-lg">
                  <Calendar className="h-6 w-6 text-[#B8C0FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(todaysRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">From {completedBookings.length} bookings</p>
                </div>
                <div className="p-3 bg-[#E7C6FF]/30 rounded-lg">
                  <DollarSign className="h-6 w-6 text-[#C8B6FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(pendingPayments)}</p>
                  <p className="text-xs text-orange-600 mt-1">Needs collection</p>
                </div>
                <div className="p-3 bg-[#FFD6FF]/30 rounded-lg">
                  <Clock className="h-6 w-6 text-[#E7C6FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">New Clients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{newCustomersToday}</p>
                  <p className="text-xs text-purple-600 mt-1">Today</p>
                </div>
                <div className="p-3 bg-[#C8B6FF]/30 rounded-lg">
                  <Users className="h-6 w-6 text-[#B8C0FF]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Overview */}
            <Card className="border-[#C8B6FF]/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#C8B6FF]/20 rounded-lg">
                      <Wallet className="h-5 w-5 text-[#B8C0FF]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Main Business Account</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">1234567890</span>
                        <button onClick={copyAccountNumber} className="text-gray-400 hover:text-gray-600">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-[#B8C0FF] hover:bg-[#A8B0EF] text-gray-900"
                    onClick={() => router.push('/withdrawal')}
                  >
                    Withdraw
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Balance</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalBalance)}</p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push('/calendar')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      New Booking
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push('/reports')}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  {allTransactions.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {allTransactions.length} total
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allTransactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No transactions yet</p>
                  ) : (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left text-xs font-medium text-gray-500 pb-3">Date</th>
                              <th className="text-left text-xs font-medium text-gray-500 pb-3">Client</th>
                              <th className="text-left text-xs font-medium text-gray-500 pb-3">Service</th>
                              <th className="text-right text-xs font-medium text-gray-500 pb-3">Amount</th>
                              <th className="text-right text-xs font-medium text-gray-500 pb-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedTransactions.map((transaction) => {
                              const treatment = treatments.find(t => t.id === transaction.treatmentId)
                              const patient = patients.find(p => p.id === transaction.patientId)
                              return (
                                <tr key={transaction.id} className="border-b border-gray-50 hover:bg-gray-50">
                                  <td className="py-3 text-sm text-gray-600">
                                    {format(new Date(transaction.createdAt), "MMM dd")}
                                  </td>
                                  <td className="py-3 text-sm font-medium text-gray-900">
                                    {patient?.name || transaction.patientName}
                                  </td>
                                  <td className="py-3 text-sm text-gray-600">
                                    {treatment?.name || "Unknown"}
                                  </td>
                                  <td className="py-3 text-sm font-medium text-gray-900 text-right">
                                    {formatCurrency(treatment?.price || 0)}
                                  </td>
                                  <td className="py-3 text-right">
                                    <Badge variant={transaction.paymentStatus === "paid" ? "default" : "secondary"} className="text-xs">
                                      {transaction.paymentStatus}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination */}
                      {totalTransactionPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="text-sm text-gray-500">
                            Page {transactionPage + 1} of {totalTransactionPages}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTransactionPage(prev => Math.max(0, prev - 1))}
                              disabled={transactionPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTransactionPage(prev => Math.min(totalTransactionPages - 1, prev + 1))}
                              disabled={transactionPage === totalTransactionPages - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
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
            <Card className="bg-gradient-to-br from-[#FFD6FF]/20 to-[#E7C6FF]/20 border-[#C8B6FF]/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 text-[#C8B6FF]" />
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
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C8B6FF] to-[#B8C0FF] flex items-center justify-center text-white font-semibold">
                            {s.name?.charAt(0) || "?"}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(s.earnings)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3 text-[#C8B6FF] hover:text-[#B8C0FF] hover:bg-[#FFD6FF]/20"
                  onClick={() => router.push('/staff')}
                >
                  View All Staff
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Revenue by Service */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Revenue by Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                {revenueByService.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No revenue data yet</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={revenueByService}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {revenueByService.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 mt-4">
                      {revenueByService.slice(0, 5).map((service, idx) => (
                        <div key={service.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-xs text-gray-600">{service.name}</span>
                          </div>
                          <span className="text-xs font-medium text-gray-900">{formatCurrency(service.value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

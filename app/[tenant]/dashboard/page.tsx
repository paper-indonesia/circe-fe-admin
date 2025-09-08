"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { TenantThemeProvider } from "@/components/tenant-theme-provider"
import { KpiCard } from "@/components/ui/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useBookings, useActivities, usePatients, useStaff, useTreatments } from "@/lib/context"
import { format, isToday } from "date-fns"
import { useRouter, usePathname } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import LiquidLoading from "@/components/ui/liquid-loader"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  Plus,
  FileText,
  CalendarDays,
  Star,
  AlertTriangle,
  CreditCard,
  Scissors,
  UserPlus,
  MoreHorizontal,
  Phone,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Sparkles,
} from "lucide-react"

export default function DashboardPage({ params }: { params: { tenant: string } }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  
  // Get tenant from params or pathname
  const tenant = params?.tenant || pathname.split('/')[1] || 'jakarta'

  const { bookings = [], loading: bookingsLoading, updateBooking } = useBookings()
  const { activities = [], loading: activitiesLoading } = useActivities()
  const { patients = [], loading: patientsLoading } = usePatients()
  const { staff = [], loading: staffLoading } = useStaff()
  const { treatments = [], loading: treatmentsLoading } = useTreatments()
  
  const isLoading = bookingsLoading || activitiesLoading || patientsLoading || staffLoading || treatmentsLoading

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [selectedActivity, setSelectedActivity] = useState<any>(null)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [activityPage, setActivityPage] = useState(0)
  const activitiesPerPage = 5

  const todaysBookings = bookings?.filter((booking) => isToday(new Date(booking.startAt))) || []

  const completedBookings = todaysBookings.filter((b) => b.status === "completed")
  const noShowBookings = todaysBookings.filter((b) => b.status === "no-show")
  const attendanceRate =
    todaysBookings.length > 0 ? Math.round((completedBookings.length / todaysBookings.length) * 100) : 0
  const noShowRate = todaysBookings.length > 0 ? Math.round((noShowBookings.length / todaysBookings.length) * 100) : 0

  const todaysRevenue = completedBookings.reduce((total, booking) => {
    const treatment = treatments?.find((t) => t.id === booking.treatmentId)
    return total + (treatment?.price || 0)
  }, 0)

  const avgCustomerSatisfaction = 4.8
  const newCustomersToday = patients?.filter((p) => isToday(new Date(p.createdAt || new Date()))).length || 0

  // Function to enrich activity with full details
  const enrichActivity = (activity: any) => {
    if (!activity.relatedId) return activity
    
    const booking = bookings?.find(b => b.id === activity.relatedId)
    if (!booking) return activity
    
    const patient = patients?.find(p => p.id === booking.patientId)
    const staffMember = staff?.find(s => s.id === booking.staffId)
    const treatment = treatments?.find(t => t.id === booking.treatmentId)
    
    return {
      ...activity,
      booking,
      patient: patient || { name: 'Unknown Patient', phone: '-', email: '-' },
      staff: staffMember || { name: 'Unknown Staff', role: '-' },
      treatment: treatment || { name: 'Unknown Treatment', price: 0, duration: 0, durationMin: 0 }
    }
  }

  const amSchedule = todaysBookings
    .filter((booking) => new Date(booking.startAt).getHours() < 12)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  const pmSchedule = todaysBookings
    .filter((booking) => new Date(booking.startAt).getHours() >= 12)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())

  const treatmentCounts =
    bookings?.reduce(
      (acc, booking) => {
        acc[booking.treatmentId] = (acc[booking.treatmentId] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const topTreatments = Object.entries(treatmentCounts)
    .map(([treatmentId, count]) => ({
      treatment: treatments?.find((t) => t.id === treatmentId),
      count,
    }))
    .filter((item) => item.treatment)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  const staffPerformance =
    staff?.map((staffMember) => {
      const todaysAppointments = todaysBookings.filter((b) => b.staffId === staffMember.id)
      return {
        ...staffMember,
        appointments: todaysAppointments.length,
        status: todaysAppointments.length > 0 ? "available" : "available",
      }
    }) || []

  const pendingPayments = bookings?.filter((b) => b.paymentStatus === "unpaid").length || 0
  const pendingConfirmations = bookings?.filter((b) => b.status === "pending").length || 0
  const unavailableStaff = staff?.filter((s) => s.workingHours?.length === 0).length || 0

  const alerts = [
    ...(pendingPayments > 0
      ? [
          {
            id: 1,
            type: "payment" as const,
            message: `${pendingPayments} payments pending`,
            priority: "medium" as const,
            details: `${pendingPayments} customers have outstanding payments totaling ${formatCurrency(pendingPayments * 150000)}`,
            action: "View Payment Reports",
            actionUrl: `/${tenant}/reports?tab=payments`,
          },
        ]
      : []),
    ...(unavailableStaff > 0
      ? [
          {
            id: 2,
            type: "staff" as const,
            message: `${unavailableStaff} staff unavailable today`,
            priority: "low" as const,
            details: `${unavailableStaff} staff members are not scheduled for today. Consider adjusting schedules to meet demand.`,
            action: "Manage Staff Schedule",
            actionUrl: `/${tenant}/staff`,
          },
        ]
      : []),
    ...(pendingConfirmations > 0
      ? [
          {
            id: 3,
            type: "appointment" as const,
            message: `${pendingConfirmations} appointments need confirmation`,
            priority: "high" as const,
            details: `${pendingConfirmations} appointments are still pending confirmation. Contact customers to confirm their bookings.`,
            action: "View Pending Appointments",
            actionUrl: `/${tenant}/calendar?filter=pending`,
          },
        ]
      : []),
  ]

  const groupedActivities =
    activities?.reduce(
      (acc, activity) => {
        // Validate and parse the date
        const activityDate = activity.createdAt ? new Date(activity.createdAt) : new Date()
        
        // Check if date is valid
        if (isNaN(activityDate.getTime())) {
          // If invalid date, use current date as fallback
          const fallbackDate = new Date()
          let day = "Today"
          if (!acc[day]) acc[day] = []
          acc[day].push({ ...activity, createdAt: fallbackDate.toISOString() })
          return acc
        }
        
        let day = "Older"

        if (isToday(activityDate)) {
          day = "Today"
        } else if (isToday(new Date(activityDate.getTime() + 24 * 60 * 60 * 1000))) {
          day = "Yesterday"
        }

        if (!acc[day]) acc[day] = []
        acc[day].push(activity)
        return acc
      },
      {} as Record<string, typeof activities>,
    ) || {}

  const groupedActivitiesArray = Object.entries(groupedActivities).sort(([a], [b]) => {
    const order = { Today: 0, Yesterday: 1, Older: 2 }
    return (order[a as keyof typeof order] || 3) - (order[b as keyof typeof order] || 3)
  })

  const allActivities = groupedActivitiesArray.flatMap(([day, dayActivities]) =>
    dayActivities.map((activity) => ({ ...activity, day })),
  )
  const paginatedActivities = allActivities.slice(
    activityPage * activitiesPerPage,
    (activityPage + 1) * activitiesPerPage,
  )
  const totalActivityPages = Math.ceil(allActivities.length / activitiesPerPage)

  const handleBookingAction = async (bookingId: string, action: string) => {
    try {
      let updates: any = {}

      switch (action) {
        case "checkin":
          updates = { status: "confirmed" }
          toast({ title: "Success", description: "Patient checked in successfully" })
          break
        case "complete":
          updates = { status: "completed" }
          toast({ title: "Success", description: "Appointment completed successfully" })
          break
        case "cancel":
          updates = { status: "cancelled" }
          toast({ title: "Success", description: "Appointment cancelled" })
          break
        case "noshow":
          updates = { status: "no-show" }
          toast({ title: "Updated", description: "Marked as no-show" })
          break
      }

      updateBooking?.(bookingId, updates)
      setSelectedAppointment(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update appointment", variant: "destructive" })
    }
  }

  const handleKpiClick = (type: string) => {
    switch (type) {
      case "bookings":
        router.push(`/${tenant}/calendar`)
        break
      case "revenue":
        router.push(`/${tenant}/reports`)
        break
      case "attendance":
        router.push(`/${tenant}/calendar?filter=completed`)
        break
      case "satisfaction":
        router.push(`/${tenant}/reports?tab=satisfaction`)
        break
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "new-booking":
        router.push(`/${tenant}/walk-in`)
        break
      case "export-report":
        toast({ title: "Export Started", description: "Your report is being generated" })
        break
      case "view-calendar":
        router.push(`/${tenant}/calendar`)
        break
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Confirmed
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Completed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
            Cancelled
          </Badge>
        )
      case "no-show":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            No Show
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function getActivityIcon(type: string) {
    switch (type) {
      case "booking_created":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "payment_received":
        return <CreditCard className="h-4 w-4 text-green-500" />
      case "booking_completed":
        return <Scissors className="h-4 w-4 text-purple-500" />
      case "client_added":
        return <UserPlus className="h-4 w-4 text-pink-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  function getAlertIcon(type: string) {
    switch (type) {
      case "payment":
        return <CreditCard className="h-4 w-4" />
      case "staff":
        return <Users className="h-4 w-4" />
      case "appointment":
        return <Calendar className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getBookingWithDetails = (booking: any) => {
    const patient = patients?.find((p) => p.id === booking.patientId)
    const treatment = treatments?.find((t) => t.id === booking.treatmentId)
    const staffMember = staff?.find((s) => s.id === booking.staffId)

    return {
      ...booking,
      patient,
      treatment,
      staff: staffMember,
      time: format(new Date(booking.startAt), "HH:mm"),
      client: patient?.name || "Unknown Client",
      treatmentName: treatment?.name || "Unknown Treatment",
      staffName: staffMember?.name || "Unknown Staff",
    }
  }

  return (
    <TenantThemeProvider>
      <MainLayout>
      {isLoading ? (
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <LiquidLoading />
        </div>
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white border-0"
              onClick={() => handleQuickAction("new-booking")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("export-report")}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction("view-calendar")}
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div onClick={() => handleKpiClick("bookings")} className="cursor-pointer">
            <KpiCard
              title="Today's Bookings"
              value={todaysBookings.length}
              change={`${completedBookings.length} completed`}
              changeType="positive"
              icon={Calendar}
            />
          </div>
          <div onClick={() => handleKpiClick("revenue")} className="cursor-pointer">
            <KpiCard
              title="Revenue Today"
              value={formatCurrency(todaysRevenue)}
              change={`${completedBookings.length} treatments`}
              changeType="positive"
              icon={DollarSign}
            />
          </div>
          <div onClick={() => handleKpiClick("attendance")} className="cursor-pointer">
            <KpiCard
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              change={`${completedBookings.length}/${todaysBookings.length} attended`}
              changeType="positive"
              icon={UserCheck}
            />
          </div>
          <div onClick={() => handleKpiClick("satisfaction")} className="cursor-pointer">
            <KpiCard
              title="Customer Satisfaction"
              value={`${avgCustomerSatisfaction}/5`}
              change={`${newCustomersToday} new customers`}
              changeType="positive"
              icon={Heart}
            />
          </div>
        </div>

        {alerts.length > 0 && (
          <Card className="border-pink-100 bg-gradient-to-r from-pink-50/50 to-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Sparkles className="h-5 w-5" />
                Alerts & Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border cursor-pointer hover:shadow-md transition-all duration-200 ${getPriorityColor(alert.priority)}`}
                  >
                    {getAlertIcon(alert.type)}
                    <span className="text-sm font-medium">{alert.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-600 font-medium">Peak Hours</p>
                  <p className="text-2xl font-bold text-pink-700">2-4 PM</p>
                  <p className="text-xs text-pink-500">Busiest time today</p>
                </div>
                <Clock className="h-8 w-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Avg Treatment Time</p>
                  <p className="text-2xl font-bold text-purple-700">45 min</p>
                  <p className="text-xs text-purple-500">5 min faster than usual</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Repeat Customers</p>
                  <p className="text-2xl font-bold text-blue-700">78%</p>
                  <p className="text-xs text-blue-500">+5% from last week</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Revenue Goal</p>
                  <p className="text-2xl font-bold text-green-700">85%</p>
                  <p className="text-xs text-green-500">Rp 2.1M of Rp 2.5M</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ... existing schedule code ... */}
          <Card className="lg:col-span-2 border-pink-100">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Morning (AM)
                </h3>
                <div className="space-y-3">
                  {amSchedule.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No morning appointments scheduled</div>
                  ) : (
                    amSchedule.map((booking) => {
                      const bookingWithDetails = getBookingWithDetails(booking)
                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedAppointment(bookingWithDetails)}
                          className="group flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50/50 to-purple-50/50 hover:from-pink-100/50 hover:to-purple-100/50 transition-all duration-200 cursor-pointer border border-pink-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-pink-600 min-w-[50px]">
                              {bookingWithDetails.time}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{bookingWithDetails.client}</div>
                              <div className="text-sm text-muted-foreground">{bookingWithDetails.treatmentName}</div>
                              <div className="text-xs text-muted-foreground">with {bookingWithDetails.staffName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Afternoon (PM)
                </h3>
                <div className="space-y-3">
                  {pmSchedule.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No afternoon appointments scheduled</div>
                  ) : (
                    pmSchedule.map((booking) => {
                      const bookingWithDetails = getBookingWithDetails(booking)
                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedAppointment(bookingWithDetails)}
                          className="group flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-pink-50/50 to-purple-50/50 hover:from-pink-100/50 hover:to-purple-100/50 transition-all duration-200 cursor-pointer border border-pink-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-pink-600 min-w-[50px]">
                              {bookingWithDetails.time}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{bookingWithDetails.client}</div>
                              <div className="text-sm text-muted-foreground">{bookingWithDetails.treatmentName}</div>
                              <div className="text-xs text-muted-foreground">with {bookingWithDetails.staffName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(booking.status)}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            <Card className="border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-700">
                    <CheckCircle className="h-5 w-5" />
                    Recent Activity
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActivityPage(Math.max(0, activityPage - 1))}
                      disabled={activityPage === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {activityPage + 1} of {totalActivityPages}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActivityPage(Math.min(totalActivityPages - 1, activityPage + 1))}
                      disabled={activityPage >= totalActivityPages - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedActivities.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No recent activity</div>
                  ) : (
                    paginatedActivities.map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => setSelectedActivity(enrichActivity(activity))}
                        className="flex items-start gap-3 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 p-2 rounded-lg transition-all duration-200"
                        title={activity.createdAt && !isNaN(new Date(activity.createdAt).getTime()) ? format(new Date(activity.createdAt), "PPpp") : "No date available"}
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">
                            <span className="font-medium">{activity.description}</span>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{activity.createdAt && !isNaN(new Date(activity.createdAt).getTime()) ? format(new Date(activity.createdAt), "HH:mm") : "--:--"}</span>
                            <span className="text-purple-400">•</span>
                            <span>{activity.day}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ... existing code for other cards ... */}
            <Card className="border-pink-100">
              <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
                <CardTitle className="flex items-center gap-2 text-pink-700">
                  <TrendingUp className="h-5 w-5" />
                  Top Treatments This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topTreatments.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">No treatment data available</div>
                  ) : (
                    topTreatments.map((item, index) => (
                      <div key={item.treatment?.id} className="flex items-center gap-3">
                        <div className="text-xs font-medium text-muted-foreground w-4">#{index + 1}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.treatment?.name}</div>
                          <div className="w-full bg-muted rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(item.count / topTreatments[0].count) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-sm font-medium text-pink-600">{item.count}</div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Users className="h-5 w-5" />
                  Staff Performance Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {staffPerformance.map((staffMember) => (
                    <div
                      key={staffMember.id}
                      onClick={() => setSelectedStaff(staffMember)}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50 cursor-pointer hover:from-purple-100/50 hover:to-pink-100/50 transition-all duration-200 border border-purple-100"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${staffMember.status === "available" ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <div>
                          <div className="font-medium text-sm">{staffMember.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {staffMember.rating || 4.5}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-purple-600">{staffMember.appointments}</div>
                        <div className="text-xs text-muted-foreground">appointments</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ... existing modals ... */}
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </DialogTitle>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{selectedAppointment.client}</h3>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.treatmentName}</p>
                  </div>
                  {getStatusBadge(selectedAppointment.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <p className="font-medium">{selectedAppointment.time}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Staff:</span>
                    <p className="font-medium">{selectedAppointment.staffName}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.patient?.phone || "No phone"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedAppointment.patient?.email || "No email"}</span>
                  </div>
                </div>

                {selectedAppointment.patient?.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Notes:</p>
                    <p className="text-sm">{selectedAppointment.patient.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {selectedAppointment.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleBookingAction(selectedAppointment.id, "checkin")}
                      className="flex-1"
                    >
                      Check In
                    </Button>
                  )}
                  {selectedAppointment.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => handleBookingAction(selectedAppointment.id, "complete")}
                      className="flex-1"
                    >
                      Complete
                    </Button>
                  )}
                  {["pending", "confirmed"].includes(selectedAppointment.status) && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingAction(selectedAppointment.id, "cancel")}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleBookingAction(selectedAppointment.id, "noshow")}
                        className="flex-1"
                      >
                        No Show
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Activity Details Modal */}
        <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedActivity && getActivityIcon(selectedActivity.type)}
                Activity Details
              </DialogTitle>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">{selectedActivity.description}</h3>
                  <p className="text-xs text-purple-600 mt-1">
                    {format(new Date(selectedActivity.createdAt), "PPpp")}
                  </p>
                </div>

                {/* Patient Information */}
                {selectedActivity.patient && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Patient Information</h4>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">{selectedActivity.patient.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Phone:</span>
                        <span className="text-sm">{selectedActivity.patient.phone || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <span className="text-sm">{selectedActivity.patient.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Treatment Information */}
                {selectedActivity.treatment && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Treatment Details</h4>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Treatment:</span>
                        <span className="text-sm font-medium">{selectedActivity.treatment.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Duration:</span>
                        <span className="text-sm">{selectedActivity.treatment.duration || selectedActivity.treatment.durationMin || 0} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Price:</span>
                        <span className="text-sm font-medium">{formatCurrency(selectedActivity.treatment.price || 0)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Staff Information */}
                {selectedActivity.staff && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Staff Assigned</h4>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <span className="text-sm font-medium">{selectedActivity.staff.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Role:</span>
                        <span className="text-sm">{selectedActivity.staff.role || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Status */}
                {selectedActivity.booking && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Booking Status</h4>
                    <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={
                          selectedActivity.booking.status === 'completed' ? 'default' :
                          selectedActivity.booking.status === 'confirmed' ? 'secondary' :
                          selectedActivity.booking.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }>
                          {selectedActivity.booking.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Payment:</span>
                        <Badge variant={
                          selectedActivity.booking.paymentStatus === 'paid' ? 'default' :
                          selectedActivity.booking.paymentStatus === 'deposit' ? 'secondary' :
                          'outline'
                        }>
                          {selectedActivity.booking.paymentStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time:</span>
                        <span className="text-sm">
                          {selectedActivity.booking.startAt ? format(new Date(selectedActivity.booking.startAt), "HH:mm") : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (selectedActivity.relatedId) {
                        router.push(`/${tenant}/calendar?booking=${selectedActivity.relatedId}`)
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View in Calendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedActivity(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedAlert && getAlertIcon(selectedAlert.type)}
                Alert Details
              </DialogTitle>
            </DialogHeader>
            {selectedAlert && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${getPriorityColor(selectedAlert.priority)}`}>
                  <p className="font-medium text-lg">{selectedAlert.message}</p>
                  <p className="text-sm mt-2">{selectedAlert.details}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs font-medium">Priority:</span>
                    <Badge variant="outline" className="text-xs capitalize">
                      {selectedAlert.priority}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                    onClick={() => {
                      router.push(selectedAlert.actionUrl)
                      setSelectedAlert(null)
                    }}
                  >
                    {selectedAlert.action}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedAlert(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Staff Details Modal */}
        <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Staff Details
              </DialogTitle>
            </DialogHeader>
            {selectedStaff && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${selectedStaff.status === "available" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <div>
                    <h3 className="font-semibold">{selectedStaff.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedStaff.role}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedStaff.rating || 4.5} rating
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Today's Appointments:</span>
                    <p className="font-medium text-lg">{selectedStaff.appointments}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium capitalize">{selectedStaff.status}</p>
                  </div>
                </div>

                {selectedStaff.skills && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStaff.skills.map((skill: string) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    router.push(`/${tenant}/calendar?staff=${selectedStaff.id}`)
                    setSelectedStaff(null)
                  }}
                >
                  View Full Schedule
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      )}
      </MainLayout>
    </TenantThemeProvider>
  )
}

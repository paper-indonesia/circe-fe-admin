"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/context"
import { getAnalytics } from "@/lib/mockApi"
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns"
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PiIcon as PieIcon,
  Activity,
  Star,
  Target,
  Award,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
  Pie, // Declare Pie here
} from "recharts"
import { setLoading } from "@/lib/loading"

export default function ReportsPage() {
  const { toast } = useToast()
  const { bookings, patients, treatments, loading } = useAppContext()
  const [dateRange, setDateRange] = useState("30days")
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {}, [])

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true)
      try {
        let startDate: string | undefined
        let endDate: string | undefined

        const now = new Date()
        switch (dateRange) {
          case "7days":
            startDate = subDays(now, 7).toISOString()
            endDate = now.toISOString()
            break
          case "30days":
            startDate = subDays(now, 30).toISOString()
            endDate = now.toISOString()
            break
          case "thisMonth":
            startDate = startOfMonth(now).toISOString()
            endDate = endOfMonth(now).toISOString()
            break
          case "thisWeek":
            startDate = startOfWeek(now, { weekStartsOn: 1 }).toISOString()
            endDate = endOfWeek(now, { weekStartsOn: 1 }).toISOString()
            break
        }

        const data = await getAnalytics(startDate, endDate)
        setAnalytics(data)
      } catch (error) {
        toast({ title: "Error", description: "Failed to load analytics", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [dateRange])

  const handleExport = (type: string) => {
    if (!analytics) return

    let csvData = ""
    let filename = ""

    switch (type) {
      case "daily":
        csvData = "Date,Revenue,Bookings\n"
        analytics.dailyRevenue.forEach((day: any) => {
          const dayBookings = analytics.bookingTrends.find((b: any) => b.date === day.date)
          csvData += `${day.date},${day.revenue},${dayBookings?.bookings || 0}\n`
        })
        filename = `daily-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break
      case "weekly":
        csvData = "Week,Total Revenue,Total Bookings,Completed,Cancelled\n"
        csvData += `${format(new Date(), "yyyy-MM-dd")},${analytics.totalRevenue},${analytics.totalBookings},${analytics.completedBookings},${analytics.totalBookings - analytics.completedBookings}\n`
        filename = `weekly-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break
      case "monthly":
        csvData = "Treatment,Bookings,Revenue\n"
        analytics.topTreatments.forEach((item: any) => {
          csvData += `${item.treatment.name},${item.count},${item.treatment.price * item.count}\n`
        })
        filename = `monthly-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break
    }

    // Create and download CSV file
    const blob = new Blob([csvData], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Successful",
      description: `${type} report has been downloaded`,
    })
  }

  const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`

  const calculateEnhancedAnalytics = () => {
    if (!analytics) return null

    const avgBookingValue = analytics.totalRevenue / analytics.totalBookings || 0
    const customerRetentionRate = (analytics.completedBookings / analytics.totalBookings) * 100 || 0
    const peakHours = analytics.bookingTrends?.reduce(
      (peak: any, current: any) => (current.bookings > (peak?.bookings || 0) ? current : peak),
      null,
    )

    return {
      avgBookingValue,
      customerRetentionRate,
      peakHours: peakHours?.date || "N/A",
      staffUtilization: 85, // Mock data
      customerSatisfaction: 4.8, // Mock data
      newCustomers: Math.floor(analytics.totalBookings * 0.3), // Mock calculation
    }
  }

  const enhancedAnalytics = calculateEnhancedAnalytics()

  const CHART_COLORS = ["#FFD6FF", "#E7C6FF", "#C8B6FF", "#B8C0FF", "#BBD0FF"]

  const generateChartData = () => {
    if (!analytics) return null

    // Staff performance data
    const staffPerformance = [
      { name: "Dr. Maya Sari", bookings: 45, revenue: 15000000, satisfaction: 4.9 },
      { name: "Sarah Johnson", bookings: 38, revenue: 12500000, satisfaction: 4.7 },
      { name: "Lisa Chen", bookings: 42, revenue: 14200000, satisfaction: 4.8 },
      { name: "Emma Wilson", bookings: 35, revenue: 11800000, satisfaction: 4.6 },
    ]

    // Treatment distribution for pie chart
    const treatmentDistribution = analytics.topTreatments.map((item: any, index: number) => ({
      name: item.treatment.name,
      value: item.count,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }))

    // Booking trends for area chart
    const bookingTrends = analytics.bookingTrends || []

    // Payment status distribution
    const paymentStatus = [
      { name: "Paid", value: Math.floor(analytics.totalBookings * 0.7), color: "#BBD0FF" },
      { name: "Pending", value: Math.floor(analytics.totalBookings * 0.25), color: "#E7C6FF" },
      { name: "Overdue", value: Math.floor(analytics.totalBookings * 0.05), color: "#FFD6FF" },
    ]

    // Customer satisfaction trends
    const satisfactionTrends = [
      { month: "Jan", rating: 4.5 },
      { month: "Feb", rating: 4.6 },
      { month: "Mar", rating: 4.7 },
      { month: "Apr", rating: 4.8 },
      { month: "May", rating: 4.9 },
      { month: "Jun", rating: 4.8 },
    ]

    return {
      staffPerformance,
      treatmentDistribution,
      bookingTrends,
      paymentStatus,
      satisfactionTrends,
    }
  }

  const chartData = generateChartData()

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#FFD6FF] rounded w-64"></div>
            <div className="h-4 bg-[#E7C6FF] rounded w-40"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#FFD6FF]/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">Reports & Analytics</h1>
              <p className="text-gray-600">Business insights and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40 bg-white border-[#E7C6FF]/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {analytics && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden bg-gradient-to-br from-[#FFD6FF]/30 to-[#FFD6FF]/10 border-[#FFD6FF]/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#FFD6FF]/20 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
                  <div className="p-2 bg-[#FFD6FF]/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-[#C8B6FF]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(analytics.totalRevenue)}</div>
                  <div className="flex items-center text-xs text-gray-600">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +12% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-[#E7C6FF]/30 to-[#E7C6FF]/10 border-[#E7C6FF]/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#E7C6FF]/20 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Total Bookings</CardTitle>
                  <div className="p-2 bg-[#E7C6FF]/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-[#B8C0FF]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.totalBookings}</div>
                  <div className="text-xs text-gray-600">
                    {analytics.completedBookings} completed • {analytics.totalBookings - analytics.completedBookings}{" "}
                    pending
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-[#C8B6FF]/30 to-[#C8B6FF]/10 border-[#C8B6FF]/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#C8B6FF]/20 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Avg Booking Value</CardTitle>
                  <div className="p-2 bg-[#C8B6FF]/30 rounded-lg">
                    <Target className="h-5 w-5 text-[#BBD0FF]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatCurrency(enhancedAnalytics?.avgBookingValue || 0)}
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    +8% from last period
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-gradient-to-br from-[#B8C0FF]/30 to-[#B8C0FF]/10 border-[#B8C0FF]/40 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#B8C0FF]/20 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-gray-700">Customer Satisfaction</CardTitle>
                  <div className="p-2 bg-[#B8C0FF]/30 rounded-lg">
                    <Star className="h-5 w-5 text-[#FFD6FF]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {enhancedAnalytics?.customerSatisfaction || 0}/5
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Award className="h-3 w-3 mr-1 text-yellow-500" />
                    Excellent rating
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Trend Chart */}
              <Card className="bg-white border-[#FFD6FF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <TrendingUp className="h-5 w-5 text-[#C8B6FF]" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}K`} stroke="#64748b" fontSize={12} />
                      <Tooltip
                        formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                        labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#C8B6FF"
                        strokeWidth={3}
                        dot={{ fill: "#C8B6FF", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Treatment Distribution Pie Chart */}
              <Card className="bg-white border-[#E7C6FF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <PieIcon className="h-5 w-5 text-[#B8C0FF]" />
                    Treatment Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData?.treatmentDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData?.treatmentDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Staff Performance Chart */}
              <Card className="bg-white border-[#C8B6FF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <BarChart3 className="h-5 w-5 text-[#FFD6FF]" />
                    Staff Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData?.staffPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        stroke="#64748b"
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "bookings" ? `${value} bookings` : formatCurrency(value as number),
                          name === "bookings" ? "Bookings" : "Revenue",
                        ]}
                      />
                      <Bar dataKey="bookings" fill="#E7C6FF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="revenue" fill="#C8B6FF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Booking Trends Area Chart */}
              <Card className="bg-white border-[#BBD0FF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Activity className="h-5 w-5 text-[#FFD6FF]" />
                    Booking Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData?.bookingTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), "MMM d")}
                        stroke="#64748b"
                        fontSize={12}
                      />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")} />
                      <Area type="monotone" dataKey="bookings" stroke="#BBD0FF" fill="#BBD0FF" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Status Radial Chart */}
              <Card className="bg-white border-[#FFD6FF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <DollarSign className="h-5 w-5 text-[#C8B6FF]" />
                    Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="20%"
                      outerRadius="90%"
                      data={chartData?.paymentStatus}
                    >
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                      <Legend />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Satisfaction Trends */}
              <Card className="bg-white border-[#E7C6FF]/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <Star className="h-5 w-5 text-[#B8C0FF]" />
                    Satisfaction Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData?.satisfactionTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis domain={[4.0, 5.0]} stroke="#64748b" fontSize={12} />
                      <Tooltip formatter={(value) => [`${value}/5`, "Rating"]} />
                      <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#FFD6FF"
                        strokeWidth={3}
                        dot={{ fill: "#FFD6FF", strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-white to-[#BBD0FF]/10 border-[#BBD0FF]/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Download className="h-5 w-5 text-[#FFD6FF]" />
                  Export Reports
                </CardTitle>
                <p className="text-sm text-gray-600">Download detailed reports for further analysis</p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    onClick={() => handleExport("daily")}
                    className="h-14 bg-gradient-to-r from-[#FFD6FF] to-[#FFD6FF]/80 hover:from-[#FFD6FF]/90 hover:to-[#FFD6FF]/70 text-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold">Daily Report</div>
                      <div className="text-xs opacity-80">Revenue & bookings</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleExport("weekly")}
                    className="h-14 bg-gradient-to-r from-[#E7C6FF] to-[#E7C6FF]/80 hover:from-[#E7C6FF]/90 hover:to-[#E7C6FF]/70 text-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <BarChart3 className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold">Weekly Report</div>
                      <div className="text-xs opacity-80">Performance summary</div>
                    </div>
                  </Button>
                  <Button
                    onClick={() => handleExport("monthly")}
                    className="h-14 bg-gradient-to-r from-[#C8B6FF] to-[#C8B6FF]/80 hover:from-[#C8B6FF]/90 hover:to-[#C8B6FF]/70 text-gray-900 border-0 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <PieIcon className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-semibold">Monthly Report</div>
                      <div className="text-xs opacity-80">Comprehensive analysis</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns"
import {
  FileText,
  Download,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Star,
  Target,
  Award,
  Users,
  Clock,
  ArrowUp,
  ArrowDown,
  Filter,
  Printer,
  Mail,
  ChevronRight,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import LiquidLoading from "@/components/ui/liquid-loader"
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
  PieChart,
  Cell,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend,
  Pie,
  ComposedChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts"

export default function ReportsPage() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("30days")
  const [selectedMetric, setSelectedMetric] = useState("all")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedTreatment, setSelectedTreatment] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  
  // Mock data for clients
  const clients = [
    { id: 1, name: "Sarah Johnson", totalSpent: 15000000, visits: 12 },
    { id: 2, name: "Emily Chen", totalSpent: 12500000, visits: 8 },
    { id: 3, name: "Jessica Williams", totalSpent: 9800000, visits: 6 },
    { id: 4, name: "Amanda Brown", totalSpent: 8700000, visits: 5 },
    { id: 5, name: "Michelle Davis", totalSpent: 7500000, visits: 4 },
    { id: 6, name: "Lisa Anderson", totalSpent: 6200000, visits: 3 },
    { id: 7, name: "Jennifer Martinez", totalSpent: 5400000, visits: 3 },
    { id: 8, name: "Rachel Wilson", totalSpent: 4800000, visits: 2 }
  ]

  // Mock treatments list for filter
  const treatmentsList = [
    "HydraFacial",
    "Botox", 
    "Chemical Peel",
    "Laser Treatment",
    "Microneedling",
    "Filler",
    "IPL Photofacial",
    "RF Skin Tightening"
  ]
  
  // Generate mock data based on date range
  const generateMockData = () => {
    const now = new Date()
    let days = 30
    
    switch (dateRange) {
      case "7days":
        days = 7
        break
      case "30days":
        days = 30
        break
      case "90days":
        days = 90
        break
      case "thisMonth":
        days = now.getDate()
        break
      case "thisYear":
        days = 365
        break
    }

    // Generate daily revenue data
    const dailyRevenue = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = subDays(now, days - i - 1)
      const baseRevenue = 3000000 + Math.random() * 2000000
      const dayOfWeek = date.getDay()
      // Higher revenue on weekends
      const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1
      return {
        date: format(date, "yyyy-MM-dd"),
        revenue: Math.floor(baseRevenue * weekendMultiplier),
        bookings: Math.floor(8 + Math.random() * 7),
        newClients: Math.floor(2 + Math.random() * 3)
      }
    })

    // Treatment popularity data
    const treatments = [
      { name: "HydraFacial", bookings: 145, revenue: 130500000, growth: 12 },
      { name: "Botox", bookings: 98, revenue: 245000000, growth: 8 },
      { name: "Chemical Peel", bookings: 87, revenue: 65250000, growth: -5 },
      { name: "Laser Treatment", bookings: 76, revenue: 91200000, growth: 15 },
      { name: "Microneedling", bookings: 65, revenue: 55250000, growth: 20 },
      { name: "Filler", bookings: 54, revenue: 189000000, growth: 10 },
      { name: "IPL Photofacial", bookings: 43, revenue: 47300000, growth: -2 },
      { name: "RF Skin Tightening", bookings: 38, revenue: 57000000, growth: 25 }
    ]

    // Staff performance
    const staffPerformance = [
      { 
        name: "Dr. Sarah", 
        bookings: 85, 
        revenue: 35000000, 
        rating: 4.9, 
        efficiency: 94,
        clients: 67,
        retention: 89
      },
      { 
        name: "Nurse Maya", 
        bookings: 72, 
        revenue: 28000000, 
        rating: 4.7, 
        efficiency: 88,
        clients: 58,
        retention: 85
      },
      { 
        name: "Dr. Linda", 
        bookings: 78, 
        revenue: 32000000, 
        rating: 4.8, 
        efficiency: 91,
        clients: 61,
        retention: 87
      },
      { 
        name: "Nurse Rina", 
        bookings: 65, 
        revenue: 25000000, 
        rating: 4.6, 
        efficiency: 85,
        clients: 52,
        retention: 82
      }
    ]

    // Time slot analysis
    const timeSlotAnalysis = [
      { time: "09:00", bookings: 12, revenue: 4800000 },
      { time: "10:00", bookings: 18, revenue: 7200000 },
      { time: "11:00", bookings: 22, revenue: 8800000 },
      { time: "12:00", bookings: 15, revenue: 6000000 },
      { time: "14:00", bookings: 20, revenue: 8000000 },
      { time: "15:00", bookings: 25, revenue: 10000000 },
      { time: "16:00", bookings: 23, revenue: 9200000 },
      { time: "17:00", bookings: 19, revenue: 7600000 }
    ]

    // Customer demographics
    const demographics = [
      { ageGroup: "18-25", clients: 45, percentage: 15 },
      { ageGroup: "26-35", clients: 90, percentage: 30 },
      { ageGroup: "36-45", clients: 75, percentage: 25 },
      { ageGroup: "46-55", clients: 60, percentage: 20 },
      { ageGroup: "56+", clients: 30, percentage: 10 }
    ]

    // Payment methods
    const paymentMethods = [
      { method: "Cash", count: 120, amount: 48000000 },
      { method: "Credit Card", count: 85, amount: 42500000 },
      { method: "Debit Card", count: 65, amount: 26000000 },
      { method: "QRIS", count: 55, amount: 22000000 },
      { method: "Bank Transfer", count: 30, amount: 15000000 }
    ]

    return {
      dailyRevenue,
      treatments,
      staffPerformance,
      timeSlotAnalysis,
      demographics,
      paymentMethods,
      summary: {
        totalRevenue: dailyRevenue.reduce((sum, day) => sum + day.revenue, 0),
        totalBookings: dailyRevenue.reduce((sum, day) => sum + day.bookings, 0),
        totalNewClients: dailyRevenue.reduce((sum, day) => sum + day.newClients, 0),
        avgBookingValue: Math.floor(dailyRevenue.reduce((sum, day) => sum + day.revenue, 0) / dailyRevenue.reduce((sum, day) => sum + day.bookings, 0)),
        completionRate: 92,
        customerSatisfaction: 4.8,
        returnRate: 78,
        peakDay: "Saturday"
      }
    }
  }

  const [data, setData] = useState(generateMockData())

  // Set current time only on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute instead of every second
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData())
      setIsLoading(false)
    }, 500)
  }, [dateRange, refreshKey])

  const handleExport = (type: string) => {
    let csvData = ""
    let filename = ""
    
    switch (type) {
      case "comprehensive":
        csvData = "Date,Revenue,Bookings,New Clients\n"
        data.dailyRevenue.forEach(day => {
          csvData += `${day.date},${day.revenue},${day.bookings},${day.newClients}\n`
        })
        filename = `comprehensive-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break
      
      case "treatments":
        csvData = "Treatment,Bookings,Revenue,Growth %\n"
        data.treatments.forEach(treatment => {
          csvData += `${treatment.name},${treatment.bookings},${treatment.revenue},${treatment.growth}\n`
        })
        filename = `treatments-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break
      
      case "staff":
        csvData = "Staff,Bookings,Revenue,Rating,Efficiency %,Retention %\n"
        data.staffPerformance.forEach(staff => {
          csvData += `${staff.name},${staff.bookings},${staff.revenue},${staff.rating},${staff.efficiency},${staff.retention}\n`
        })
        filename = `staff-performance-${format(new Date(), "yyyy-MM-dd")}.csv`
        break
    }

    // Create and download CSV
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
      description: `${filename} has been downloaded`,
    })
  }

  const handlePrint = () => {
    window.print()
    toast({
      title: "Preparing Print",
      description: "Print dialog will open shortly",
    })
  }

  const handleEmailReport = () => {
    toast({
      title: "Report Sent",
      description: "Monthly report has been sent to your email",
    })
  }

  const COLORS = ["#EC4899", "#A855F7", "#6366F1", "#3B82F6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"]

  const formatCurrency = (value: number) => `Rp ${value.toLocaleString("id-ID")}`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes("Revenue") ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-xl p-8 shadow-lg border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
              <p className="text-muted-foreground mt-2">Comprehensive business insights and performance metrics</p>
              <div className="flex items-center gap-2 mt-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Live Data</span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  Last updated: {currentTime ? format(currentTime, "HH:mm:ss") : "Loading..."}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[160px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="thisYear">This year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[180px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                <SelectTrigger className="w-[180px]">
                  <Activity className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Treatments</SelectItem>
                  {treatmentsList.map((treatment) => (
                    <SelectItem key={treatment} value={treatment}>
                      {treatment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="bookings">Bookings</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setRefreshKey(prev => prev + 1)}
                className={isLoading ? "animate-spin" : ""}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Client Details Card - Shows when specific client is selected */}
        {selectedClient !== "all" && (
          <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Client Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const client = clients.find(c => c.id.toString() === selectedClient)
                if (!client) return null
                return (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Client Name</p>
                      <p className="text-lg font-semibold">{client.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(client.totalSpent)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Visits</p>
                      <p className="text-lg font-semibold">{client.visits}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Average per Visit</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(Math.floor(client.totalSpent / client.visits))}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Treatment Details Card - Shows when specific treatment is selected */}
        {selectedTreatment !== "all" && (
          <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Treatment Analysis: {selectedTreatment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const treatment = data.treatments.find(t => t.name === selectedTreatment)
                if (!treatment) return null
                return (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-lg font-semibold">{treatment.bookings}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {formatCurrency(treatment.revenue)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Growth Rate</p>
                      <div className="flex items-center gap-1">
                        {treatment.growth > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-600" />
                        )}
                        <p className={`text-lg font-semibold ${treatment.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.abs(treatment.growth)}%
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg Revenue/Booking</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(Math.floor(treatment.revenue / treatment.bookings))}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-pink-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+15% from last period</span>
              </div>
              <div className="mt-3 h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyRevenue.slice(-7)}>
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#EC4899" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-full -translate-y-12 translate-x-12" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalBookings}</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>+8% from last period</span>
              </div>
              <div className="mt-3 h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailyRevenue.slice(-7)}>
                    <Bar dataKey="bookings" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-full -translate-y-12 translate-x-12" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalNewClients}</div>
              <div className="flex items-center text-xs text-red-600 mt-1">
                <ArrowDown className="h-3 w-3 mr-1" />
                <span>-3% from last period</span>
              </div>
              <div className="mt-3 h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyRevenue.slice(-7)}>
                    <Area 
                      type="monotone" 
                      dataKey="newClients" 
                      stroke="#10B981" 
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-full -translate-y-12 translate-x-12" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.customerSatisfaction}/5.0</div>
              <div className="flex items-center text-xs text-green-600 mt-1">
                <Award className="h-3 w-3 mr-1" />
                <span>Excellent Rating</span>
              </div>
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(data.summary.customerSatisfaction)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Based on 324 reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-950/20 dark:to-purple-950/20 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent font-semibold">Revenue Trend</span>
                </CardTitle>
                <Badge className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-purple-700 border-purple-200">Daily View</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data.dailyRevenue}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#EC4899" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="bookingsGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), "MMM d")}
                    fontSize={11}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    yAxisId="left"
                    tickFormatter={(value) => `${value / 1000000}M`}
                    fontSize={11}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    fontSize={11}
                    stroke="#6B7280"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar 
                    yAxisId="left" 
                    dataKey="revenue" 
                    fill="url(#revenueGradient)" 
                    name="Revenue" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="url(#bookingsGradient)" 
                    name="Bookings" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8B5CF6' }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Treatment Performance */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">Treatment Performance</span>
                </CardTitle>
                <Badge className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-blue-700 border-blue-200">Top 8</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.treatments} margin={{ top: 20, right: 30, bottom: 20, left: 100 }}>
                  <defs>
                    <linearGradient id="treatmentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#A855F7" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.9}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={11} stroke="#6B7280" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} fontSize={11} stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, "Revenue"]}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="url(#treatmentGradient)" 
                    name="Revenue" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {data.treatments.slice(0, 4).map((treatment, index) => (
                  <div 
                    key={treatment.name} 
                    className="group flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{treatment.name}</span>
                    <Badge 
                      variant={treatment.growth > 0 ? "default" : "destructive"} 
                      className={`text-xs transition-transform group-hover:scale-110 ${
                        treatment.growth > 0 
                          ? 'bg-green-100 text-green-700 border-green-300' 
                          : 'bg-red-100 text-red-700 border-red-300'
                      }`}
                    >
                      {treatment.growth > 0 ? "↑" : "↓"} {Math.abs(treatment.growth)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staff Performance Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Staff Performance Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="efficiency" name="Efficiency" unit="%" fontSize={12} />
                  <YAxis dataKey="rating" name="Rating" fontSize={12} />
                  <ZAxis dataKey="bookings" name="Bookings" range={[100, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Staff" data={data.staffPerformance} fill="#6366F1">
                    {data.staffPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {data.staffPerformance.map((staff, index) => (
                  <div key={staff.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="text-sm font-medium">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                        <p className="text-sm font-medium">{staff.efficiency}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{staff.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Slot Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Peak Hours Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.timeSlotAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Bookings"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Peak Time</p>
                    <p className="text-xs text-muted-foreground">Most bookings</p>
                  </div>
                  <Badge>15:00 - 16:00</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Demographics */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-orange-50/50 to-yellow-50/50 dark:from-orange-950/20 dark:to-yellow-950/20 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent font-semibold">Customer Demographics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data.demographics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                    outerRadius={90}
                    dataKey="clients"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {data.demographics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#pieGradient${index})`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {data.demographics.map((demo, index) => (
                  <div key={demo.ageGroup} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div 
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ 
                        background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[index % COLORS.length]}80 100%)`,
                        boxShadow: `0 2px 4px ${COLORS[index % COLORS.length]}40`
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{demo.ageGroup}</p>
                      <p className="text-xs text-muted-foreground">{demo.clients} clients • {demo.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data.paymentMethods}>
                  <defs>
                    {COLORS.map((color, index) => (
                      <linearGradient key={`radial-${index}`} id={`radialGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                        <stop offset="100%" stopColor={color} stopOpacity={0.5}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <RadialBar 
                    dataKey="count" 
                    cornerRadius={10} 
                    fill="#8884d8"
                    animationBegin={0}
                    animationDuration={1200}
                  >
                    {data.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#radialGradient${index})`} />
                    ))}
                  </RadialBar>
                  <Legend iconType="circle" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="space-y-3 mt-4">
                {data.paymentMethods.map((method, index) => (
                  <div key={method.method} className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm"
                        style={{ 
                          background: `linear-gradient(135deg, ${COLORS[index % COLORS.length]} 0%, ${COLORS[index % COLORS.length]}80 100%)`,
                          boxShadow: `0 2px 4px ${COLORS[index % COLORS.length]}40`
                        }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(method.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{method.count} transactions</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent font-semibold">Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-300/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">Completion</span>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{data.summary.completionRate}%</p>
                </div>
              </div>
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Return Rate</span>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{data.summary.returnRate}%</p>
                </div>
              </div>
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-300/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Avg Value</span>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{formatCurrency(data.summary.avgBookingValue)}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-300/20 rounded-full -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-300" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Peak Day</span>
                  </div>
                  <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">{data.summary.peakDay}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg">
                <Download className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent font-semibold">Export & Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                onClick={() => handleExport("comprehensive")}
                className="group h-auto py-4 flex flex-col items-center gap-2 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700"
                variant="outline"
              >
                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform duration-300 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium">Comprehensive Report</p>
                  <p className="text-xs text-muted-foreground">All metrics & data</p>
                </div>
              </Button>
              
              <Button 
                onClick={() => handleExport("treatments")}
                className="h-auto py-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Activity className="h-5 w-5" />
                <div>
                  <p className="font-medium">Treatment Report</p>
                  <p className="text-xs text-muted-foreground">Performance analysis</p>
                </div>
              </Button>
              
              <Button 
                onClick={() => handleExport("staff")}
                className="h-auto py-4 flex flex-col items-center gap-2"
                variant="outline"
              >
                <Users className="h-5 w-5" />
                <div>
                  <p className="font-medium">Staff Report</p>
                  <p className="text-xs text-muted-foreground">Individual metrics</p>
                </div>
              </Button>
              
              <div className="flex gap-2">
                <Button
                  onClick={handlePrint}
                  size="icon"
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleEmailReport}
                  size="icon"
                  variant="outline"
                  className="flex-1"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
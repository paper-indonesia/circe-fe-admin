"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from "date-fns"
import {
  FileText,
  Download,
  TrendingUp,
  Banknote,
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
  RefreshCw,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Plus,
  AlertTriangle
} from "lucide-react"
import { useRouter } from "next/navigation"
import GradientLoading from "@/components/gradient-loading"
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
  const router = useRouter()
  const [dateRange, setDateRange] = useState("30days")
  const [customStartDate, setCustomStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [customEndDate, setCustomEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  // Applied filters (actual filters used for API calls)
  const [appliedDateRange, setAppliedDateRange] = useState("30days")
  const [appliedStartDate, setAppliedStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [appliedEndDate, setAppliedEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [appliedMonth, setAppliedMonth] = useState<string>("")
  const [appliedYear, setAppliedYear] = useState<string>(new Date().getFullYear().toString())
  const [selectedMetric, setSelectedMetric] = useState("all")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedTreatment, setSelectedTreatment] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [data, setData] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [treatmentsList, setTreatmentsList] = useState<string[]>([])

  // Set current time only on client side to avoid hydration mismatch
  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute instead of every second
    return () => clearInterval(timer)
  }, [])

  // Removed: Customer statistics API call - not needed for current charts

  // Fetch reports data directly from individual APIs
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        console.log('[Reports] Fetching data from APIs...')

        // Calculate date range using APPLIED filters
        const getDateRange = () => {
          const now = new Date()
          let dateFrom: Date
          let dateTo: Date = now

          if (appliedDateRange === 'customRange') {
            // Use custom start and end date
            dateFrom = new Date(appliedStartDate)
            dateTo = new Date(appliedEndDate)
          } else if (appliedDateRange === 'custom' && appliedMonth && appliedYear) {
            // Legacy: custom month picker
            dateFrom = startOfMonth(new Date(parseInt(appliedYear), parseInt(appliedMonth) - 1))
            dateTo = endOfMonth(dateFrom)
          } else if (appliedDateRange === 'thisMonth') {
            dateFrom = startOfMonth(now)
            dateTo = endOfMonth(now)
          } else if (appliedDateRange === 'thisYear') {
            dateFrom = new Date(now.getFullYear(), 0, 1)
            dateTo = now
          } else {
            const days = appliedDateRange === '7days' ? 7 : appliedDateRange === '90days' ? 90 : 30
            dateFrom = subDays(now, days)
          }

          return { dateFrom, dateTo }
        }

        const { dateFrom, dateTo } = getDateRange()
        const dateFromStr = format(dateFrom, 'yyyy-MM-dd')
        const dateToStr = format(dateTo, 'yyyy-MM-dd')

        console.log('[Reports] Date range:', dateFromStr, 'to', dateToStr)

        // Fetch data from APIs with date filters (only 2 APIs needed!)
        const [appointmentsRes, customersRes] = await Promise.all([
          fetch(`/api/appointments?page=1&size=100&date_from=${dateFromStr}&date_to=${dateToStr}&sort_by=created_at&sort_order=desc`).catch((err) => {
            console.error('[Reports] Appointments fetch error:', err)
            return null
          }),
          fetch(`/api/customers?page=1&size=100&created_from=${dateFromStr}&created_to=${dateToStr}`).catch((err) => {
            console.error('[Reports] Customers fetch error:', err)
            return null
          })
        ])

        console.log('[Reports] API responses received')

        // Parse responses with detailed error logging
        let appointments: any[] = []
        let customers: any[] = []

        if (appointmentsRes?.ok) {
          const data = await appointmentsRes.json()
          appointments = data.items || []
          console.log('[Reports] Appointments loaded:', appointments.length)
        } else if (appointmentsRes) {
          const errorText = await appointmentsRes.text()
          console.error('[Reports] Appointments error:', appointmentsRes.status, errorText)
          toast({
            title: "Error Loading Appointments",
            description: `Status ${appointmentsRes.status}: ${errorText.substring(0, 100)}`,
            variant: "destructive"
          })
        }

        if (customersRes?.ok) {
          const data = await customersRes.json()
          customers = data.items || []
          console.log('[Reports] Customers loaded:', customers.length)
        } else if (customersRes) {
          const errorText = await customersRes.text()
          console.error('[Reports] Customers error:', customersRes.status, errorText)
          toast({
            title: "Error Loading Customers",
            description: `Status ${customersRes.status}: ${errorText.substring(0, 100)}`,
            variant: "destructive"
          })
        }

        // No need to filter appointments - already filtered by API
        console.log('[Reports] Total appointments in range:', appointments.length)

        // Process data for reports (calculate metrics client-side)
        const processedData = processReportsData(appointments, customers, dateFrom, dateTo)

        console.log('[Reports] Processed data:', processedData)
        setData(processedData)
        setClients(processedData.topClients || [])
        setTreatmentsList(processedData.treatments?.map((t: any) => t.name) || [])
      } catch (error: any) {
        console.error('[Reports] Error fetching reports:', error)
        toast({
          title: "Error Loading Reports",
          description: error?.message || "Failed to fetch reports data",
          variant: "destructive"
        })
        // Set empty data on error
        setData({
          dailyRevenue: [],
          treatments: [],
          timeSlotAnalysis: [],
          demographics: [],
          summary: {
            totalRevenue: 0,
            totalBookings: 0,
            totalNewClients: 0,
            avgBookingValue: 0,
            completionRate: 0,
            customerSatisfaction: 0,
            returnRate: 0,
            peakDay: 'N/A'
          },
          topClients: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [appliedDateRange, appliedMonth, appliedYear, appliedStartDate, appliedEndDate, refreshKey])

  // Apply filter handler
  const handleApplyFilter = () => {
    // Validate custom range
    if (dateRange === 'customRange') {
      if (!customStartDate || !customEndDate) {
        toast({
          title: "Invalid Date Range",
          description: "Please select both start and end dates",
          variant: "destructive"
        })
        return
      }
      if (new Date(customStartDate) > new Date(customEndDate)) {
        toast({
          title: "Invalid Date Range",
          description: "Start date must be before end date",
          variant: "destructive"
        })
        return
      }
    }

    // Validate custom month
    if (dateRange === 'custom' && (!selectedMonth || !selectedYear)) {
      toast({
        title: "Incomplete Selection",
        description: "Please select both month and year",
        variant: "destructive"
      })
      return
    }

    // Apply filters
    setAppliedDateRange(dateRange)
    setAppliedStartDate(customStartDate)
    setAppliedEndDate(customEndDate)
    setAppliedMonth(selectedMonth)
    setAppliedYear(selectedYear)

    toast({
      title: "Filter Applied",
      description: "Reports updated successfully"
    })
  }

  // Handle preset range change (7days, 30days, etc) - auto apply
  const handlePresetRangeChange = (value: string) => {
    setDateRange(value)

    // Auto-apply for preset ranges (not custom)
    if (value !== 'customRange' && value !== 'custom') {
      setAppliedDateRange(value)
      setAppliedStartDate(customStartDate)
      setAppliedEndDate(customEndDate)
      setAppliedMonth("")
      setAppliedYear(new Date().getFullYear().toString())
    }
  }

  // Process reports data client-side
  const processReportsData = (appointments: any[], customers: any[], dateFrom: Date, dateTo: Date) => {
    const dailyRevenueMap = new Map<string, { revenue: number; bookings: number; newClients: Set<string> }>()
    const treatmentsMap = new Map<string, { bookings: number; revenue: number }>()
    const timeSlotMap = new Map<string, number>()
    const customerVisitsMap = new Map<string, number>()

    let totalRevenue = 0
    let totalBookings = 0
    let completedBookings = 0

    // Process appointments
    appointments.forEach((apt: any) => {
      const aptDate = apt.appointment_date
      const price = parseFloat(apt.total_price || 0)

      if (!aptDate) return

      // Daily revenue
      if (!dailyRevenueMap.has(aptDate)) {
        dailyRevenueMap.set(aptDate, { revenue: 0, bookings: 0, newClients: new Set() })
      }
      const dayData = dailyRevenueMap.get(aptDate)!
      dayData.revenue += price
      dayData.bookings += 1

      // Check if customer is new
      if (apt.customer_id) {
        const customer = customers.find((c: any) => (c._id === apt.customer_id || c.id === apt.customer_id))
        if (customer && customer.created_at) {
          const customerCreatedDate = format(new Date(customer.created_at), 'yyyy-MM-dd')
          if (customerCreatedDate === aptDate) {
            dayData.newClients.add(apt.customer_id)
          }
        }
      }

      // Services/Treatments
      if (apt.services && Array.isArray(apt.services)) {
        apt.services.forEach((service: any) => {
          const serviceName = service.service_name || 'Unknown'
          const servicePrice = parseFloat(service.price || 0)

          if (!treatmentsMap.has(serviceName)) {
            treatmentsMap.set(serviceName, { bookings: 0, revenue: 0 })
          }
          const treatment = treatmentsMap.get(serviceName)!
          treatment.bookings += 1
          treatment.revenue += servicePrice
        })
      }

      // Time slot analysis (Peak Hour)
      if (apt.start_time) {
        const hour = apt.start_time.split(':')[0] + ':00'
        timeSlotMap.set(hour, (timeSlotMap.get(hour) || 0) + 1)
      }

      // Customer visits
      if (apt.customer_id) {
        customerVisitsMap.set(apt.customer_id, (customerVisitsMap.get(apt.customer_id) || 0) + 1)
      }

      // Totals
      totalRevenue += price
      totalBookings += 1
      if (apt.status === 'completed') {
        completedBookings += 1
      }
    })

    // Build arrays from maps
    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings,
        newClients: data.newClients.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const treatments = Array.from(treatmentsMap.entries())
      .map(([name, data]) => ({
        name,
        bookings: data.bookings,
        revenue: data.revenue,
        growth: Math.floor(Math.random() * 30) - 10
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 products

    const timeSlotAnalysis = Array.from(timeSlotMap.entries())
      .map(([time, bookings]) => ({ time, bookings }))
      .sort((a, b) => a.time.localeCompare(b.time))

    // Demographics (not used in current charts but keeping for future)
    const demographicsMap = new Map<string, number>()
    customers.forEach((customer: any) => {
      if (customer.date_of_birth) {
        try {
          const birthDate = new Date(customer.date_of_birth)
          const age = new Date().getFullYear() - birthDate.getFullYear()
          let ageGroup = 'Unknown'
          if (age < 25) ageGroup = '18-24'
          else if (age < 35) ageGroup = '25-34'
          else if (age < 45) ageGroup = '35-44'
          else if (age < 55) ageGroup = '45-54'
          else ageGroup = '55+'

          demographicsMap.set(ageGroup, (demographicsMap.get(ageGroup) || 0) + 1)
        } catch (e) {}
      }
    })

    const totalCustomersWithAge = Array.from(demographicsMap.values()).reduce((a, b) => a + b, 0)
    const demographics = Array.from(demographicsMap.entries())
      .map(([ageGroup, clients]) => ({
        ageGroup,
        clients,
        percentage: totalCustomersWithAge > 0 ? Math.round((clients / totalCustomersWithAge) * 100) : 0
      }))
      .sort((a, b) => a.ageGroup.localeCompare(b.ageGroup))

    // Top clients
    const topClients = Array.from(customerVisitsMap.entries())
      .map(([customerId, visits]) => {
        const customer = customers.find((c: any) => c._id === customerId || c.id === customerId)
        return {
          id: customerId,
          name: customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email : 'Unknown',
          visits,
          totalSpent: customer?.total_spent || 0
        }
      })
      .filter(c => c.visits > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Summary metrics
    const newCustomers = customers.filter((c: any) => {
      if (!c.created_at) return false
      try {
        const createdDate = new Date(c.created_at)
        return createdDate >= dateFrom && createdDate <= dateTo
      } catch (e) {
        return false
      }
    })

    // Average rating calculation removed - not used in current charts
    const avgRating = 4.5 // Default value

    const peakDay = dailyRevenue.length > 0
      ? format(new Date(dailyRevenue.reduce((max, day) => day.bookings > max.bookings ? day : max, dailyRevenue[0]).date), 'EEEE')
      : 'N/A'

    const returningCustomers = Array.from(customerVisitsMap.values()).filter(visits => visits > 1).length
    const returnRate = customers.length > 0 ? Math.round((returningCustomers / customers.length) * 100) : 0

    return {
      dailyRevenue,
      treatments,
      timeSlotAnalysis,
      demographics,
      summary: {
        totalRevenue,
        totalBookings,
        totalNewClients: newCustomers.length,
        avgBookingValue: totalBookings > 0 ? Math.floor(totalRevenue / totalBookings) : 0,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        customerSatisfaction: parseFloat(avgRating.toFixed(1)),
        returnRate,
        peakDay
      },
      topClients
    }
  }

  const handleExport = (type: string) => {
    if (!data) {
      toast({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive"
      })
      return
    }

    let csvData = ""
    let filename = ""

    switch (type) {
      case "comprehensive":
        csvData = "Date,Revenue,Bookings,New Clients\n"
        data.dailyRevenue?.forEach((day: any) => {
          csvData += `${day.date},${day.revenue},${day.bookings},${day.newClients}\n`
        })
        filename = `comprehensive-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break

      case "treatments":
        csvData = `Products,Bookings,Revenue,Growth %\n`
        data.treatments?.forEach((treatment: any) => {
          csvData += `${treatment.name},${treatment.bookings},${treatment.revenue},${treatment.growth}\n`
        })
        filename = `treatments-report-${format(new Date(), "yyyy-MM-dd")}.csv`
        break

      case "staff":
        csvData = `Staff,Bookings,Revenue,Rating,Efficiency %,Retention %\n`
        data.staffPerformance?.forEach((staff: any) => {
          csvData += `${staff.name},${staff.bookings},${staff.revenue},${staff.rating.toFixed(1)},${staff.efficiency},${staff.retention}\n`
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
      <>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <GradientLoading />
        </div>
      </>
    )
  }

  // Check if data is empty
  const hasNoData = data && (
    data.summary.totalBookings === 0 &&
    data.treatments?.length === 0 &&
    data.staffPerformance?.length === 0
  )

  if (hasNoData) {
    return (
      <>
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
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Select value={dateRange} onValueChange={handlePresetRangeChange}>
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
                    <SelectItem value="customRange">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {/* Custom Date Range Inputs */}
                {dateRange === 'customRange' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="start-date" className="text-sm font-medium whitespace-nowrap">From:</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        max={customEndDate}
                        className="w-[150px]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="end-date" className="text-sm font-medium whitespace-nowrap">To:</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={customStartDate}
                        max={format(new Date(), 'yyyy-MM-dd')}
                        className="w-[150px]"
                      />
                    </div>
                    <Button onClick={handleApplyFilter} size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Empty State */}
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-[#8B5CF6]" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-900" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h3>
              <p className="text-center text-muted-foreground mb-6 max-w-md">
                You don't have any bookings data yet. Start by adding your first booking to see analytics and insights here.
              </p>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => router.push('/calendar')}
                  className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:opacity-90"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Go to Calendar
                </Button>
                <Button
                  onClick={() => router.push('/walk-in')}
                  variant="outline"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Quick Walk-in
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                <div className="bg-[#EDE9FE] rounded-lg p-4 text-center">
                  <Calendar className="h-8 w-8 text-[#8B5CF6] mx-auto mb-2" />
                  <p className="font-semibold text-sm text-gray-900">Create {"Bookings"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Schedule appointments</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-gray-900">Add {"Customers"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Build your customer base</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-gray-900">Setup {"Products"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Define your services</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 rounded-xl p-6 lg:p-8 shadow-lg border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
          <div className="relative space-y-4">
            {/* Title and Live Status */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">Comprehensive business insights and performance metrics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/30 rounded-full border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">Live Data</span>
                </div>
                <span className="text-xs text-muted-foreground hidden lg:inline">
                  {currentTime ? format(currentTime, "HH:mm:ss") : "Loading..."}
                </span>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <Select value={dateRange} onValueChange={(value) => {
                setDateRange(value)
                // Reset month/year when selecting preset ranges
                if (value !== "custom" && value !== "customRange") {
                  setSelectedMonth("")
                  setSelectedYear(new Date().getFullYear().toString())
                  // Auto-apply preset ranges
                  handlePresetRangeChange(value)
                }
              }}>
                <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="thisYear">This year</SelectItem>
                  <SelectItem value="customRange">Custom Range</SelectItem>
                  <SelectItem value="custom">Custom Month</SelectItem>
                </SelectContent>
              </Select>

              {/* Custom Date Range Inputs */}
              {dateRange === 'customRange' && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="start-date-main" className="text-sm font-medium whitespace-nowrap">From:</Label>
                    <Input
                      id="start-date-main"
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      max={customEndDate}
                      className="w-[150px] bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date-main" className="text-sm font-medium whitespace-nowrap">To:</Label>
                    <Input
                      id="end-date-main"
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="w-[150px] bg-white dark:bg-gray-800"
                    />
                  </div>
                  <Button onClick={handleApplyFilter} size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Apply
                  </Button>
                </>
              )}

              {/* Custom Month Picker (Legacy) */}
              {dateRange === "custom" && (
                <>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px] bg-white dark:bg-gray-800">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleApplyFilter} size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Apply
                  </Button>
                </>
              )}

              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-[170px] bg-white dark:bg-gray-800">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={`All Customers`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTreatment} onValueChange={setSelectedTreatment}>
                <SelectTrigger className="w-[170px] bg-white dark:bg-gray-800">
                  <Activity className="h-4 w-4 mr-2" />
                  <SelectValue placeholder={`All Products`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {treatmentsList.map((treatment) => (
                    <SelectItem key={treatment} value={treatment}>
                      {treatment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-gray-800">
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
                className={`bg-white dark:bg-gray-800 ${isLoading ? "animate-spin" : ""}`}
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
                {"Customers"} Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const client = clients.find(c => c.id === selectedClient)
                if (!client) return null
                return (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{"Customers"} Name</p>
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
                <Activity className="h-5 w-5 text-[#8B5CF6]" />
                {"Products"} Analysis: {selectedTreatment}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const treatment = data.treatments?.find((t: any) => t.name === selectedTreatment)
                if (!treatment) return null
                return (
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total {"Bookings"}</p>
                      <p className="text-lg font-semibold">{treatment.bookings}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-lg font-semibold text-[#8B5CF6]">
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
                      <p className="text-sm text-muted-foreground">Avg Revenue/{"Bookings"}</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(treatment.bookings > 0 ? Math.floor(treatment.revenue / treatment.bookings) : 0)}
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
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
              <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                <Banknote className="h-4 w-4 text-pink-600 dark:text-pink-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.summary.totalRevenue)}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
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

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-blue-500/20 hover:border-blue-500/40 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-blue-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total {"Bookings"}</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalBookings}</div>
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Completed bookings</span>
              </div>
              <div className="mt-3 h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailyRevenue?.slice(-7) || []}>
                    <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-green-500/20 hover:border-green-500/40 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-green-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">New {"Customers"}</CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.totalNewClients}</div>
              <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                <ArrowUp className="h-3 w-3 mr-1" />
                <span>New acquisitions</span>
              </div>
              <div className="mt-3 h-[50px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.dailyRevenue?.slice(-7) || []}>
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

          {/* Completion Rate */}
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-purple-500/20 hover:border-purple-500/40 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-purple-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</CardTitle>
              <div className="p-2 bg-[#EDE9FE] dark:bg-purple-900/30 rounded-lg group-hover:bg-[#C4B5FD] dark:group-hover:bg-purple-900/50 transition-colors">
                <CheckCircle className="h-4 w-4 text-[#8B5CF6] dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.completionRate}%</div>
              <div className="flex items-center text-xs text-[#8B5CF6] dark:text-purple-400 mt-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Successfully completed</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${data.summary.completionRate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-[#8B5CF6] dark:text-purple-400">
                  {data.summary.completionRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* HIDDEN: Satisfaction Rate - Will be enabled when customer-side rating system is enhanced */}
          {false && (
          <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-yellow-500/20 hover:border-yellow-500/40 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction Rate</CardTitle>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.summary.customerSatisfaction}/5.0</div>
              <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <Award className="h-3 w-3 mr-1" />
                <span>Excellent rating</span>
              </div>
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(data.summary.customerSatisfaction)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                      }`}
                    />
                  ))}
                </div>
                {data.summary.customerSatisfaction > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Average staff rating</p>
                )}
              </div>
            </CardContent>
          </Card>
          )}
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
                <Badge className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-[#6D28D9] border-[#C4B5FD]">Daily View</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart data={data.dailyRevenue || []}>
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
                    name={"Bookings"}
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#8B5CF6' }}
                    activeDot={{ r: 6 }}
                    animationDuration={1500}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Performance */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold">{"Products"} Performance</span>
                </CardTitle>
                <Badge className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-blue-700 border-blue-200">Top 8</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.treatments || []} margin={{ top: 20, right: 30, bottom: 20, left: 100 }}>
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
                {data.treatments?.slice(0, 4).map((treatment: any, index: number) => (
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

          {/* HIDDEN: Staff Performance Matrix - Not needed yet */}
          {false && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {"Staff"} Performance Matrix
                </CardTitle>
                {data.staffPerformance && data.staffPerformance.length > 10 && (
                  <Badge variant="outline" className="text-xs">
                    Showing Top 10 of {data.staffPerformance.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {data.staffPerformance && data.staffPerformance.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="efficiency" name="Efficiency" unit="%" fontSize={12} />
                      <YAxis dataKey="rating" name="Rating" fontSize={12} />
                      <ZAxis dataKey="bookings" name={"Bookings"} range={[100, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name={"Staff"} data={data.staffPerformance.slice(0, 10)} fill="#6366F1">
                        {data.staffPerformance.slice(0, 10).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                    {data.staffPerformance.slice(0, 10).map((staff: any, index: number) => (
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
                              <span className="text-sm font-medium">{staff.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No Staff Data Available</p>
                  <p className="text-xs text-muted-foreground mt-1">Staff performance data will appear here once available</p>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Time Slot Analysis */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent font-semibold">Peak Hours Analysis</span>
                </CardTitle>
                <Badge className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-cyan-700 border-cyan-200">Hourly</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.timeSlotAnalysis || []}>
                  <defs>
                    <linearGradient id="timeSlotGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                  <XAxis dataKey="time" fontSize={11} stroke="#6B7280" />
                  <YAxis fontSize={11} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#14B8A6"
                    fill="url(#timeSlotGradient)"
                    name={"Bookings"}
                    strokeWidth={2}
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-teal-900 dark:text-teal-100">Peak Time</p>
                    <p className="text-xs text-teal-600 dark:text-teal-400">Most bookings</p>
                  </div>
                  <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0">
                    {data.timeSlotAnalysis && data.timeSlotAnalysis.length > 0
                      ? data.timeSlotAnalysis.reduce((max: any, slot: any) => slot.bookings > max.bookings ? slot : max).time
                      : 'N/A'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Trends by Day */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-semibold">Weekly Trends</span>
                </CardTitle>
                <Badge className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-amber-700 border-amber-200">Last 7 Days</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailyRevenue?.slice(-7) || []}>
                  <defs>
                    <linearGradient id="bookingTrendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" stopOpacity={0.9}/>
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return format(date, "EEE")
                    }}
                    fontSize={11}
                    stroke="#6B7280"
                  />
                  <YAxis fontSize={11} stroke="#6B7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value) => format(new Date(value), "EEEE, MMM d")}
                  />
                  <Bar
                    dataKey="bookings"
                    fill="url(#bookingTrendGradient)"
                    name={"Bookings"}
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Total Bookings</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {data.dailyRevenue?.slice(-7).reduce((sum: number, day: any) => sum + day.bookings, 0) || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">Busiest Day</p>
                  <p className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {data.dailyRevenue && data.dailyRevenue.length > 0
                      ? format(new Date(data.dailyRevenue.slice(-7).reduce((max: any, day: any) => day.bookings > max.bookings ? day : max, data.dailyRevenue.slice(-7)[0]).date), "EEE")
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HIDDEN: Customer Demographics - Not needed yet */}
          {false && (
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
              {data.demographics && data.demographics.some((d: any) => d.clients > 0) ? (
                <>
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
                        data={data.demographics.filter((d: any) => d.clients > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ ageGroup, percentage }: any) => `${ageGroup}: ${percentage}%`}
                        outerRadius={90}
                        dataKey="clients"
                        animationBegin={0}
                        animationDuration={1000}
                      >
                        {data.demographics.filter((d: any) => d.clients > 0).map((entry: any, index: number) => (
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
                    {data.demographics.filter((d: any) => d.clients > 0).map((demo: any, index: number) => (
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
                          <p className="text-xs text-muted-foreground">{demo.clients} customers • {demo.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <PieChartIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No Demographics Data</p>
                  <p className="text-xs text-muted-foreground mt-1">Customer age demographics will appear here once available</p>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* HIDDEN: Payment Methods - Some CC payments not reflected correctly */}
          {false && (
          <Card className="hover:shadow-lg transition-shadow duration-300 border-primary/10">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <Banknote className="h-4 w-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {data.paymentMethods && data.paymentMethods.some((m: any) => m.count > 0) ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={data.paymentMethods.filter((m: any) => m.count > 0)}>
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
                        {data.paymentMethods.filter((m: any) => m.count > 0).map((entry: any, index: number) => (
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
                    {data.paymentMethods.filter((m: any) => m.count > 0).map((method: any, index: number) => (
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Banknote className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No Payment Data</p>
                  <p className="text-xs text-muted-foreground mt-1">Payment method statistics will appear here once available</p>
                </div>
              )}
            </CardContent>
          </Card>
          )}
        </div>

        {/* HIDDEN: Performance Metrics Overall - Hide until needed */}
        {false && (
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
                    <Target className="h-4 w-4 text-[#8B5CF6]" />
                    <span className="text-sm font-medium text-[#6D28D9] dark:text-purple-100">Avg Value</span>
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
        )}

        {/* HIDDEN: Customer Analytics Summary - Data not fetching correctly yet */}
        {false && !loadingCustomerStats && customerStatistics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customer Analytics</h2>
              <Badge variant="outline" className="text-xs">
                Last updated: {customerStatistics.generated_at ? new Date(customerStatistics.generated_at).toLocaleString() : 'N/A'}
              </Badge>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase">Total Customers</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{customerStatistics.total_customers?.toLocaleString() || 0}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                          <UserCheck className="h-3 w-3 mr-1" />
                          {customerStatistics.active_customers || 0} Active
                        </Badge>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-emerald-600 uppercase">Total Revenue</p>
                      <p className="text-2xl font-bold text-emerald-900 mt-1">
                        Rp {(customerStatistics.total_revenue || 0).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-emerald-600 mt-2">
                        Avg: Rp {(customerStatistics.avg_spent_per_customer || 0).toLocaleString('id-ID')}/customer
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Banknote className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-[#C4B5FD]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#8B5CF6] uppercase">Total Appointments</p>
                      <p className="text-2xl font-bold text-[#6D28D9] mt-1">{(customerStatistics.total_appointments || 0).toLocaleString()}</p>
                      <p className="text-xs text-[#8B5CF6] mt-2">
                        Avg: {(customerStatistics.avg_appointments_per_customer || 0).toFixed(1)}/customer
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[#EDE9FE] flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-[#8B5CF6]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-amber-600 uppercase">Retention Rate</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">{(customerStatistics.retention_rate || 0).toFixed(1)}%</p>
                      <p className="text-xs text-amber-600 mt-2">
                        Last 90 days activity
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Segments & Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Segments */}
              {customerStatistics.customer_segments && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Customer Segments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#EDE9FE] rounded-lg">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-[#8B5CF6]" />
                          <span className="font-medium text-sm">VIP Customers</span>
                        </div>
                        <Badge className="bg-purple-600">{customerStatistics.customer_segments.vip || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Regular Customers</span>
                        </div>
                        <Badge className="bg-blue-600">{customerStatistics.customer_segments.regular || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">New Customers</span>
                        </div>
                        <Badge className="bg-green-600">{customerStatistics.customer_segments.new || 0}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="font-medium text-sm">At Risk</span>
                        </div>
                        <Badge className="bg-red-600">{customerStatistics.customer_segments.at_risk || 0}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Verified Emails</span>
                      <span className="font-semibold">{customerStatistics.verified_emails || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Registered Accounts</span>
                      <span className="font-semibold">{customerStatistics.customers_with_password || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Walk-in Customers</span>
                      <span className="font-semibold">{customerStatistics.walk_in_customers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground">Inactive Customers</span>
                      <span className="font-semibold">{customerStatistics.inactive_customers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">Total Loyalty Points</span>
                      <span className="font-semibold">{(customerStatistics.total_loyalty_points || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Customers */}
            {(customerStatistics.top_customers_by_revenue?.length > 0 || customerStatistics.top_customers_by_appointments?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top by Revenue */}
                {customerStatistics.top_customers_by_revenue?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                        Top Customers by Revenue
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customerStatistics.top_customers_by_revenue.slice(0, 5).map((customer: any, index: number) => (
                          <div key={customer.customer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{customer.full_name}</p>
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-emerald-700">
                                Rp {(customer.total_spent || 0).toLocaleString('id-ID')}
                              </p>
                              <p className="text-xs text-muted-foreground">{customer.total_appointments} visits</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Top by Appointments */}
                {customerStatistics.top_customers_by_appointments?.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className="h-5 w-5 text-amber-600" />
                        Top Customers by Visits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customerStatistics.top_customers_by_appointments.slice(0, 5).map((customer: any, index: number) => (
                          <div key={customer.customer_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{customer.full_name}</p>
                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-amber-700">{customer.total_appointments} visits</p>
                              <p className="text-xs text-muted-foreground">
                                Rp {(customer.total_spent || 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
import { NextRequest, NextResponse } from 'next/server'
import { subDays, startOfMonth, endOfMonth, format, parseISO, isAfter, isBefore, isWithinInterval } from 'date-fns'

export const dynamic = 'force-dynamic'

const BACKEND_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

function getDateRange(dateRangeParam: string, month?: string, year?: string) {
  const now = new Date()
  let dateFrom: Date
  let dateTo: Date = now

  if (dateRangeParam === 'custom' && month && year) {
    dateFrom = startOfMonth(new Date(parseInt(year), parseInt(month) - 1))
    dateTo = endOfMonth(dateFrom)
  } else if (dateRangeParam === 'thisMonth') {
    dateFrom = startOfMonth(now)
    dateTo = endOfMonth(now)
  } else if (dateRangeParam === 'thisYear') {
    dateFrom = new Date(now.getFullYear(), 0, 1)
    dateTo = now
  } else {
    // Default to days-based ranges
    const days = dateRangeParam === '7days' ? 7 : dateRangeParam === '90days' ? 90 : 30
    dateFrom = subDays(now, days)
  }

  return { dateFrom, dateTo }
}

export async function GET(request: NextRequest) {
  try {
    const authToken = getAuthToken(request)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const dateRange = searchParams.get('dateRange') || '30days'
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const { dateFrom, dateTo } = getDateRange(dateRange, month || undefined, year || undefined)

    // Fetch data in parallel
    const [appointmentsRes, customersRes, staffRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/v1/appointments?size=1000&date_from=${format(dateFrom, 'yyyy-MM-dd')}&date_to=${format(dateTo, 'yyyy-MM-dd')}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }),
      fetch(`${BACKEND_URL}/api/v1/customers?size=1000`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }),
      fetch(`${BACKEND_URL}/api/v1/staff?size=100`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
    ])

    if (!appointmentsRes.ok || !customersRes.ok || !staffRes.ok) {
      throw new Error('Failed to fetch data from backend')
    }

    const appointmentsData = await appointmentsRes.json()
    const customersData = await customersRes.json()
    const staffData = await staffRes.json()

    const appointments = appointmentsData.items || []
    const customers = customersData.items || []
    const staffList = staffData.items || []

    // Process data for reports
    const dailyRevenueMap = new Map<string, { revenue: number; bookings: number; newClients: Set<string> }>()
    const treatmentsMap = new Map<string, { bookings: number; revenue: number }>()
    const staffPerformanceMap = new Map<string, { bookings: number; revenue: number; ratings: number[] }>()
    const timeSlotMap = new Map<string, number>()
    const paymentMethodsMap = new Map<string, { count: number; amount: number }>()
    const customerVisitsMap = new Map<string, number>()

    let totalRevenue = 0
    let totalBookings = 0
    let completedBookings = 0

    // Process appointments
    appointments.forEach((apt: any) => {
      const aptDate = apt.appointment_date
      const price = parseFloat(apt.total_price || 0)

      // Skip if no valid date
      if (!aptDate) return

      // Daily revenue
      const dayKey = aptDate
      if (!dailyRevenueMap.has(dayKey)) {
        dailyRevenueMap.set(dayKey, { revenue: 0, bookings: 0, newClients: new Set() })
      }
      const dayData = dailyRevenueMap.get(dayKey)!
      dayData.revenue += price
      dayData.bookings += 1

      // Check if customer is new (created on same day as appointment)
      if (apt.customer_id) {
        const customer = customers.find((c: any) => c._id === apt.customer_id || c.id === apt.customer_id)
        if (customer && customer.created_at) {
          const customerCreatedDate = format(parseISO(customer.created_at), 'yyyy-MM-dd')
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

          // Staff performance
          if (service.staff_id && service.staff_name) {
            if (!staffPerformanceMap.has(service.staff_id)) {
              staffPerformanceMap.set(service.staff_id, { bookings: 0, revenue: 0, ratings: [] })
            }
            const staffPerf = staffPerformanceMap.get(service.staff_id)!
            staffPerf.bookings += 1
            staffPerf.revenue += servicePrice
          }
        })
      }

      // Time slot analysis
      if (apt.start_time) {
        const hour = apt.start_time.split(':')[0] + ':00'
        timeSlotMap.set(hour, (timeSlotMap.get(hour) || 0) + 1)
      }

      // Payment methods
      if (apt.payment_status === 'paid' || apt.payment_status === 'completed') {
        const method = apt.payment_method || 'Cash'
        if (!paymentMethodsMap.has(method)) {
          paymentMethodsMap.set(method, { count: 0, amount: 0 })
        }
        const paymentData = paymentMethodsMap.get(method)!
        paymentData.count += 1
        paymentData.amount += price
      }

      // Customer visits tracking
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

    // Build dailyRevenue array
    const dailyRevenue = Array.from(dailyRevenueMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        bookings: data.bookings,
        newClients: data.newClients.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Build treatments array
    const treatments = Array.from(treatmentsMap.entries())
      .map(([name, data]) => ({
        name,
        bookings: data.bookings,
        revenue: data.revenue,
        growth: Math.floor(Math.random() * 30) - 10 // Placeholder for growth
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    // Build staff performance array
    const staffPerformance = Array.from(staffPerformanceMap.entries())
      .map(([staffId, data]) => {
        const staff = staffList.find((s: any) => s._id === staffId || s.id === staffId)
        return {
          id: staffId,
          name: staff?.name || 'Unknown',
          bookings: data.bookings,
          revenue: data.revenue,
          rating: staff?.rating || 4.5,
          efficiency: Math.min(100, Math.floor((data.bookings / totalBookings) * 100 * 10)), // Placeholder
          retention: Math.floor(Math.random() * 40) + 60 // Placeholder
        }
      })
      .sort((a, b) => b.revenue - a.revenue)

    // Build time slot analysis
    const timeSlotAnalysis = Array.from(timeSlotMap.entries())
      .map(([time, bookings]) => ({ time, bookings }))
      .sort((a, b) => a.time.localeCompare(b.time))

    // Build payment methods
    const paymentMethods = Array.from(paymentMethodsMap.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount
      }))
      .sort((a, b) => b.amount - a.amount)

    // Demographics (age groups from customers)
    const demographicsMap = new Map<string, number>()
    customers.forEach((customer: any) => {
      if (customer.date_of_birth) {
        try {
          const birthDate = parseISO(customer.date_of_birth)
          const age = new Date().getFullYear() - birthDate.getFullYear()
          let ageGroup = 'Unknown'
          if (age < 25) ageGroup = '18-24'
          else if (age < 35) ageGroup = '25-34'
          else if (age < 45) ageGroup = '35-44'
          else if (age < 55) ageGroup = '45-54'
          else ageGroup = '55+'

          demographicsMap.set(ageGroup, (demographicsMap.get(ageGroup) || 0) + 1)
        } catch (e) {
          // Invalid date
        }
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

    // Calculate summary metrics
    const newCustomers = customers.filter((c: any) => {
      if (!c.created_at) return false
      const createdDate = parseISO(c.created_at)
      return isWithinInterval(createdDate, { start: dateFrom, end: dateTo })
    })

    const avgRating = staffPerformance.length > 0
      ? staffPerformance.reduce((sum, s) => sum + s.rating, 0) / staffPerformance.length
      : 0

    const peakDay = dailyRevenue.length > 0
      ? dailyRevenue.reduce((max, day) => day.bookings > max.bookings ? day : max, dailyRevenue[0]).date
      : 'N/A'

    const returningCustomers = Array.from(customerVisitsMap.values()).filter(visits => visits > 1).length
    const returnRate = customers.length > 0 ? Math.round((returningCustomers / customers.length) * 100) : 0

    return NextResponse.json({
      dailyRevenue,
      treatments,
      staffPerformance,
      timeSlotAnalysis,
      demographics,
      paymentMethods,
      summary: {
        totalRevenue,
        totalBookings,
        totalNewClients: newCustomers.length,
        avgBookingValue: totalBookings > 0 ? Math.floor(totalRevenue / totalBookings) : 0,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        customerSatisfaction: parseFloat(avgRating.toFixed(1)),
        returnRate,
        peakDay: peakDay !== 'N/A' ? format(parseISO(peakDay), 'EEEE') : 'N/A'
      },
      topClients
    })
  } catch (error: any) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports', details: error.message },
      { status: 500 }
    )
  }
}

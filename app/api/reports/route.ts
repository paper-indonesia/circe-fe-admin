import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Treatment from '@/models/Treatment'
import Staff from '@/models/Staff'
import Patient from '@/models/Patient'
import Withdrawal from '@/models/Withdrawal'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const { searchParams } = new URL(request.url)
    const dateRange = searchParams.get('dateRange') || '30days'
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')

    await connectMongoDB()

    // Calculate date range
    const now = new Date()
    let startDate = subDays(now, 30)
    let endDate = now

    // Handle custom month/year filtering
    if (dateRange === 'custom' && monthParam && yearParam) {
      const month = parseInt(monthParam)
      const year = parseInt(yearParam)
      startDate = new Date(year, month - 1, 1)
      endDate = new Date(year, month, 0, 23, 59, 59, 999) // Last day of the month
    } else {
      switch (dateRange) {
        case '7days':
          startDate = subDays(now, 7)
          break
        case '30days':
          startDate = subDays(now, 30)
          break
        case '90days':
          startDate = subDays(now, 90)
          break
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }
    }

    // Fetch bookings
    const bookings = await Booking.find({
      ownerId: user.userId,
      startAt: { $gte: startDate, $lte: endDate }
    }).populate('treatmentId').populate('staffId').populate('patientId')

    // Fetch all treatments for user
    const treatments = await Treatment.find({ ownerId: user.userId })

    // Fetch all staff for user
    const staff = await Staff.find({ ownerId: user.userId })

    // Fetch all patients for user
    const patients = await Patient.find({ ownerId: user.userId })

    // Fetch withdrawals
    const withdrawals = await Withdrawal.find({
      ownerId: user.userId,
      createdAt: { $gte: startDate, $lte: endDate }
    })

    // Generate daily revenue data
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRevenue = []

    for (let i = 0; i < Math.min(days, 90); i++) {
      const date = subDays(endDate, days - i - 1)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.startAt)
        return bookingDate >= dayStart && bookingDate <= dayEnd && b.status === 'completed'
      })

      const dayRevenue = dayBookings.reduce((sum, b) => {
        const treatment = b.treatmentId as any
        return sum + (treatment?.price || b.paymentAmount || 0)
      }, 0)

      const newClientsCount = dayBookings.filter(b => {
        const patientFirstBooking = bookings
          .filter(booking => booking.patientId?._id?.toString() === b.patientId?._id?.toString())
          .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0]
        return patientFirstBooking?._id?.toString() === b._id?.toString()
      }).length

      dailyRevenue.push({
        date: format(date, 'yyyy-MM-dd'),
        revenue: dayRevenue,
        bookings: dayBookings.length,
        newClients: newClientsCount
      })
    }

    // Treatment performance analysis
    const treatmentPerformance = treatments.map(treatment => {
      const treatmentBookings = bookings.filter(
        b => b.treatmentId?._id?.toString() === treatment._id.toString() && b.status === 'completed'
      )
      const revenue = treatmentBookings.reduce((sum, b) => {
        const treatmentData = b.treatmentId as any
        return sum + (treatmentData?.price || b.paymentAmount || 0)
      }, 0)

      // Calculate growth (compare with previous period)
      const halfwayDate = new Date((startDate.getTime() + now.getTime()) / 2)
      const recentBookings = treatmentBookings.filter(b => new Date(b.startAt) >= halfwayDate)
      const oldBookings = treatmentBookings.filter(b => new Date(b.startAt) < halfwayDate)
      const growth = oldBookings.length > 0
        ? Math.round(((recentBookings.length - oldBookings.length) / oldBookings.length) * 100)
        : 0

      return {
        name: treatment.name,
        bookings: treatmentBookings.length,
        revenue,
        growth
      }
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 8)

    // Staff performance
    const staffPerformance = staff.map(staffMember => {
      const staffBookings = bookings.filter(
        b => b.staffId?._id?.toString() === staffMember._id.toString() && b.status === 'completed'
      )
      const revenue = staffBookings.reduce((sum, b) => {
        const treatment = b.treatmentId as any
        return sum + (treatment?.price || b.paymentAmount || 0)
      }, 0)
      const uniqueClients = new Set(staffBookings.map(b => b.patientId?._id?.toString())).size

      // Calculate retention (repeat clients)
      const clientBookings = new Map()
      staffBookings.forEach(b => {
        const patientId = b.patientId?._id?.toString()
        if (patientId) {
          clientBookings.set(patientId, (clientBookings.get(patientId) || 0) + 1)
        }
      })
      const repeatClients = Array.from(clientBookings.values()).filter(count => count > 1).length
      const retention = uniqueClients > 0 ? Math.round((repeatClients / uniqueClients) * 100) : 0

      // Calculate efficiency: completed bookings vs total bookings for this staff
      const totalStaffBookings = bookings.filter(b => b.staffId?._id?.toString() === staffMember._id.toString())
      const efficiency = totalStaffBookings.length > 0
        ? Math.round((staffBookings.length / totalStaffBookings.length) * 100)
        : 0

      return {
        name: staffMember.name,
        bookings: staffBookings.length,
        revenue,
        rating: staffMember.rating || 0, // Use actual rating from staff model
        efficiency,
        clients: uniqueClients,
        retention
      }
    }).sort((a, b) => b.bookings - a.bookings)

    // Time slot analysis
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
    const timeSlotAnalysis = timeSlots.map(time => {
      const slotBookings = bookings.filter(b => {
        const bookingTime = format(new Date(b.startAt), 'HH:mm')
        return bookingTime === time && b.status === 'completed'
      })
      const revenue = slotBookings.reduce((sum, b) => {
        const treatment = b.treatmentId as any
        return sum + (treatment?.price || b.paymentAmount || 0)
      }, 0)

      return {
        time,
        bookings: slotBookings.length,
        revenue
      }
    })

    // Payment methods (from bookings)
    const paymentMethods = [
      { method: 'Cash', bookings: bookings.filter(b => b.paymentMethod === 'cash' && b.status === 'completed') },
      { method: 'Credit Card', bookings: bookings.filter(b => b.paymentMethod === 'credit_card' && b.status === 'completed') },
      { method: 'Debit Card', bookings: bookings.filter(b => b.paymentMethod === 'debit_card' && b.status === 'completed') },
      { method: 'QRIS', bookings: bookings.filter(b => b.paymentMethod === 'qris' && b.status === 'completed') },
      { method: 'Bank Transfer', bookings: bookings.filter(b => b.paymentMethod === 'bank_transfer' && b.status === 'completed') }
    ].map(({ method, bookings: methodBookings }) => ({
      method,
      count: methodBookings.length,
      amount: methodBookings.reduce((sum, b) => {
        const treatment = b.treatmentId as any
        return sum + (treatment?.price || b.paymentAmount || 0)
      }, 0)
    }))

    // Customer demographics (age groups)
    const currentYear = new Date().getFullYear()
    const demographics = [
      { ageGroup: '18-25', min: 18, max: 25 },
      { ageGroup: '26-35', min: 26, max: 35 },
      { ageGroup: '36-45', min: 36, max: 45 },
      { ageGroup: '46-55', min: 46, max: 55 },
      { ageGroup: '56+', min: 56, max: 150 }
    ].map(({ ageGroup, min, max }) => {
      const ageClients = patients.filter(p => {
        if (!p.dateOfBirth) return false
        const age = currentYear - new Date(p.dateOfBirth).getFullYear()
        return age >= min && age <= max
      })
      return {
        ageGroup,
        clients: ageClients.length,
        percentage: patients.length > 0 ? Math.round((ageClients.length / patients.length) * 100) : 0
      }
    })

    // Calculate summary
    const completedBookings = bookings.filter(b => b.status === 'completed')
    const totalRevenue = completedBookings.reduce((sum, b) => {
      const treatment = b.treatmentId as any
      return sum + (treatment?.price || b.paymentAmount || 0)
    }, 0)
    const totalBookings = completedBookings.length
    const newClientsInRange = new Set(
      completedBookings
        .filter(b => {
          const patientBookings = bookings.filter(
            booking => booking.patientId?._id?.toString() === b.patientId?._id?.toString()
          )
          return patientBookings.length === 1
        })
        .map(b => b.patientId?._id?.toString())
    ).size

    // Calculate return rate
    const clientBookingCounts = new Map()
    completedBookings.forEach(b => {
      const patientId = b.patientId?._id?.toString()
      if (patientId) {
        clientBookingCounts.set(patientId, (clientBookingCounts.get(patientId) || 0) + 1)
      }
    })
    const returningClients = Array.from(clientBookingCounts.values()).filter(count => count > 1).length
    const returnRate = clientBookingCounts.size > 0
      ? Math.round((returningClients / clientBookingCounts.size) * 100)
      : 0

    // Find peak day
    const dayBookingCounts = new Map()
    completedBookings.forEach(b => {
      const dayOfWeek = format(new Date(b.startAt), 'EEEE')
      dayBookingCounts.set(dayOfWeek, (dayBookingCounts.get(dayOfWeek) || 0) + 1)
    })
    const peakDay = Array.from(dayBookingCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Calculate average satisfaction from staff ratings (if available)
    const avgStaffRating = staffPerformance.length > 0
      ? staffPerformance.reduce((sum, s) => sum + s.rating, 0) / staffPerformance.length
      : 0

    const summary = {
      totalRevenue,
      totalBookings,
      totalNewClients: newClientsInRange,
      avgBookingValue: totalBookings > 0 ? Math.floor(totalRevenue / totalBookings) : 0,
      completionRate: bookings.length > 0
        ? Math.round((completedBookings.length / bookings.length) * 100)
        : 0,
      customerSatisfaction: avgStaffRating > 0 ? Number(avgStaffRating.toFixed(1)) : 0,
      returnRate,
      peakDay
    }

    // Top clients
    const clientSpending = new Map()
    const clientVisits = new Map()

    completedBookings.forEach(b => {
      const patientId = b.patientId?._id?.toString()
      if (patientId) {
        const treatment = b.treatmentId as any
        const amount = treatment?.price || b.paymentAmount || 0
        clientSpending.set(patientId, (clientSpending.get(patientId) || 0) + amount)
        clientVisits.set(patientId, (clientVisits.get(patientId) || 0) + 1)
      }
    })

    const topClients = Array.from(clientSpending.entries())
      .map(([patientId, totalSpent]) => {
        const patient = patients.find(p => p._id.toString() === patientId)
        return {
          id: patientId,
          name: patient?.name || 'Unknown',
          totalSpent,
          visits: clientVisits.get(patientId) || 0
        }
      })
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    return NextResponse.json({
      dailyRevenue,
      treatments: treatmentPerformance,
      staffPerformance,
      timeSlotAnalysis,
      demographics,
      paymentMethods,
      summary,
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
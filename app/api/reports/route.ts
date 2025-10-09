import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BOOKINGS_FILE = path.join(process.cwd(), 'data', 'bookings.json')

function readBookings() {
  try {
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const bookings = readBookings()

    // Return empty reports structure
    return NextResponse.json({
      dailyRevenue: [],
      treatments: [],
      staffPerformance: [],
      timeSlotAnalysis: [],
      demographics: [],
      paymentMethods: [],
      summary: {
        totalRevenue: 0,
        totalBookings: bookings.length,
        totalNewClients: 0,
        avgBookingValue: 0,
        completionRate: 0,
        customerSatisfaction: 0,
        returnRate: 0,
        peakDay: 'N/A'
      },
      topClients: []
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}

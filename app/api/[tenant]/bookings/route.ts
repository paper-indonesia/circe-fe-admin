import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Booking from '@/models/Booking'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    
    let bookings
    if (source === 'walk-in') {
      bookings = await Booking.findWalkInsByTenant(params.tenant)
    } else {
      bookings = await Booking.findByTenant(params.tenant)
    }
    
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const body = await request.json()
    const booking = await Booking.create({
      ...body,
      tenantId: params.tenant
    })
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
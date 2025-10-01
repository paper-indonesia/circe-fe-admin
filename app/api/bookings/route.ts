import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { requireAuth, getScopedQuery } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')

    let query = getScopedQuery(user.userId)
    if (source === 'walk-in') {
      query.source = 'walk-in'
    }

    const bookings = await Booking.find(query).sort({ startAt: -1 })

    return NextResponse.json(bookings)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const body = await request.json()
    const booking = await Booking.create({
      ...body,
      ownerId: user.userId
    })
    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
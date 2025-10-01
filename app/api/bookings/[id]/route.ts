import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Booking from '@/models/Booking'
import { requireAuth, verifyOwnership } from '@/lib/auth'

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(req)
    const updates = await req.json()

    await connectMongoDB()

    // Find the booking first to verify ownership
    const booking = await Booking.findById(params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (!verifyOwnership(booking, user.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      params.id,
      {
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    )

    return NextResponse.json(updatedBooking)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/bookings/[id] - Delete booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(req)

    await connectMongoDB()

    // Find the booking first to verify ownership
    const booking = await Booking.findById(params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (!verifyOwnership(booking, user.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the booking
    await Booking.findByIdAndDelete(params.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

// GET /api/bookings/[id] - Get single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = requireAuth(req)

    await connectMongoDB()

    const booking = await Booking.findById(params.id)
      .populate('patientId')
      .populate('staffId')
      .populate('treatmentId')

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (!verifyOwnership(booking, user.userId)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(booking)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    )
  }
}
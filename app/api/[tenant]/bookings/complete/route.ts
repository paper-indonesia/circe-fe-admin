import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Booking from '@/models/Booking'
import Staff from '@/models/Staff'
import Treatment from '@/models/Treatment'

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { bookingId } = body
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Get treatment details to get the price
    const treatment = await Treatment.findById(booking.treatmentId)
    
    if (!treatment) {
      return NextResponse.json(
        { error: 'Treatment not found' },
        { status: 404 }
      )
    }

    // Calculate commission for staff (e.g., 60% of treatment price)
    const commissionRate = 0.6 // 60% commission
    const staffEarnings = treatment.price * commissionRate

    // Update booking status to completed
    booking.status = 'completed'
    booking.paymentStatus = 'paid'
    await booking.save()

    // Update staff balance and earnings
    if (booking.staffId) {
      await Staff.findByIdAndUpdate(booking.staffId, {
        $inc: {
          balance: staffEarnings,
          totalEarnings: staffEarnings
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Booking completed and payment processed',
      booking,
      staffEarnings
    })
  } catch (error) {
    console.error('Error completing booking:', error)
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    )
  }
}
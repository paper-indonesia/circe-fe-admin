import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import Booking from '@/models/Booking'

// PUT /api/[tenant]/bookings/[id] - Update booking
export async function PUT(
  req: NextRequest,
  { params }: { params: { tenant: string; id: string } }
) {
  try {
    const updates = await req.json()
    
    await connectMongoDB()
    
    // Find and update the booking
    const booking = await Booking.findByIdAndUpdate(
      params.id,
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true }
    )
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Verify tenant ID matches
    if (booking.tenantId !== params.tenant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE /api/[tenant]/bookings/[id] - Delete booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { tenant: string; id: string } }
) {
  try {
    await connectMongoDB()
    
    // Find the booking first to verify tenant
    const booking = await Booking.findById(params.id)
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Verify tenant ID matches
    if (booking.tenantId !== params.tenant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Delete the booking
    await Booking.findByIdAndDelete(params.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}

// GET /api/[tenant]/bookings/[id] - Get single booking
export async function GET(
  req: NextRequest,
  { params }: { params: { tenant: string; id: string } }
) {
  try {
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
    
    // Verify tenant ID matches
    if (booking.tenantId !== params.tenant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Get booking error:', error)
    return NextResponse.json(
      { error: 'Failed to get booking' },
      { status: 500 }
    )
  }
}
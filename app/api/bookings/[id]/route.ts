import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

const DATA_FILE = path.join(process.cwd(), 'data', 'bookings.json')

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function writeData(data: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

// PUT /api/bookings/[id] - Update booking
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await req.json()
    const bookings = readData()

    const index = bookings.findIndex((b: any) => b.id === params.id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings[index] = {
      ...bookings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    writeData(bookings)
    return NextResponse.json(bookings[index])
  } catch (error) {
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
    const bookings = readData()
    const index = bookings.findIndex((b: any) => b.id === params.id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings.splice(index, 1)
    writeData(bookings)
    return NextResponse.json({ success: true })
  } catch (error) {
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
    const bookings = readData()
    const booking = bookings.find((b: any) => b.id === params.id)

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
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

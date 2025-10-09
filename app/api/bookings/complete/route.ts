import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    const bookings = readData()

    const index = bookings.findIndex((b: any) => b.id === id)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    bookings[index] = {
      ...bookings[index],
      status: 'completed',
      completedAt: new Date().toISOString()
    }

    writeData(bookings)
    return NextResponse.json(bookings[index])
  } catch (error) {
    console.error('Error completing booking:', error)
    return NextResponse.json({ error: 'Failed to complete booking' }, { status: 500 })
  }
}

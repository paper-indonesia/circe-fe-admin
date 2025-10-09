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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')

    let bookings = readData()

    if (source === 'walk-in') {
      bookings = bookings.filter((b: any) => b.source === 'walk-in')
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const bookings = readData()

    const newBooking = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString()
    }

    bookings.push(newBooking)
    writeData(bookings)
    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

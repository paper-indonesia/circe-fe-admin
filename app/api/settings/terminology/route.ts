import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'settings.json')

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8')
    const settings = JSON.parse(data)

    // Default settings structure
    return {
      terminology: settings.terminology || {
        staff: 'Staff',
        staffSingular: 'Staff',
        treatment: 'Products',
        treatmentSingular: 'Product',
        patient: 'Customers',
        patientSingular: 'Customer',
        booking: 'Bookings',
        bookingSingular: 'Booking',
      },
      businessType: settings.businessType || 'beauty',
      businessName: settings.businessName || '',
      categories: settings.categories || [],
      customFields: settings.customFields || {
        staff: [],
        treatment: [],
        patient: [],
      },
      // Skip wizard, go straight to tour
      onboardingCompleted: true,
      ...settings
    }
  } catch {
    return {
      terminology: {
        staff: 'Staff',
        staffSingular: 'Staff',
        treatment: 'Products',
        treatmentSingular: 'Product',
        patient: 'Customers',
        patientSingular: 'Customer',
        booking: 'Bookings',
        bookingSingular: 'Booking',
      },
      businessType: 'beauty',
      businessName: '',
      categories: [],
      customFields: {
        staff: [],
        treatment: [],
        patient: [],
      },
      onboardingCompleted: true,
    }
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export async function GET(request: NextRequest) {
  try {
    const settings = readData()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      terminology: {
        staff: 'Staff',
        staffSingular: 'Staff',
        treatment: 'Products',
        treatmentSingular: 'Product',
        patient: 'Customers',
        patientSingular: 'Customer',
        booking: 'Bookings',
        bookingSingular: 'Booking',
      },
      onboardingCompleted: true
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const settings = readData()

    // Update settings with new data
    Object.assign(settings, body)

    writeData(settings)

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

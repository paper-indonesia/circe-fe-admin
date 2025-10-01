import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import connectMongoDB from '@/lib/mongodb'
import TenantSettings from '@/models/TenantSettings'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      console.error('GET /api/settings/terminology: No user authenticated')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('GET /api/settings/terminology: User authenticated:', user.userId)

    await connectMongoDB()

    let settings = await TenantSettings.findOne({ ownerId: user.userId })
    console.log('GET /api/settings/terminology: Existing settings:', settings ? 'found' : 'not found')

    // If no settings exist, create default ones
    if (!settings) {
      console.log('GET /api/settings/terminology: Creating default settings for user:', user.userId)
      settings = await TenantSettings.create({
        ownerId: user.userId,
        businessType: 'custom',
        businessName: user.name || 'My Business',
        terminology: {
          staff: 'Staff',
          staffSingular: 'Staff Member',
          treatment: 'Services',
          treatmentSingular: 'Service',
          patient: 'Clients',
          patientSingular: 'Client',
          booking: 'Bookings',
          bookingSingular: 'Booking',
        },
        categories: ['General'],
        customFields: {
          staff: [],
          treatment: [],
          patient: [],
        },
        onboardingCompleted: false,
      })
      console.log('GET /api/settings/terminology: Default settings created successfully')
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('Error fetching terminology settings:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await connectMongoDB()

    const settings = await TenantSettings.findOneAndUpdate(
      { ownerId: user.userId },
      {
        $set: {
          businessType: body.businessType,
          businessName: body.businessName,
          terminology: body.terminology,
          categories: body.categories,
          customFields: body.customFields,
          onboardingCompleted: body.onboardingCompleted,
        },
      },
      { new: true, upsert: true }
    )

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating terminology settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
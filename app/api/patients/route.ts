import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Patient from '@/models/Patient'
import { requireAuth, getScopedQuery } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const patients = await Patient.find(getScopedQuery(user.userId)).sort({ createdAt: -1 })
    return NextResponse.json(patients)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const body = await request.json()

    // First check if patient with this phone already exists for this user
    if (body.phone) {
      const existingPatient = await Patient.findOne(getScopedQuery(user.userId, {
        phone: body.phone
      }))

      if (existingPatient) {
        // Update existing patient instead of creating new one
        Object.assign(existingPatient, {
          name: body.name || existingPatient.name,
          email: body.email || existingPatient.email,
          notes: body.notes || existingPatient.notes
        })
        await existingPatient.save()
        return NextResponse.json(existingPatient, { status: 200 })
      }
    }

    // Create new patient if not exists
    const patient = await Patient.create({
      ...body,
      ownerId: user.userId
    })
    return NextResponse.json(patient, { status: 201 })
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.error('Error creating patient:', error)

    // Handle duplicate key error
    if (error.code === 11000 && error.keyPattern?.phone) {
      try {
        const user = requireAuth(request)
        // Try to find and return existing patient
        const existingPatient = await Patient.findOne(getScopedQuery(user.userId, {
          phone: body.phone
        }))
        if (existingPatient) {
          return NextResponse.json(existingPatient, { status: 200 })
        }
      } catch (findError) {
        console.error('Error finding existing patient:', findError)
      }
    }

    return NextResponse.json({
      error: 'Failed to create patient',
      message: error.message
    }, { status: 500 })
  }
}
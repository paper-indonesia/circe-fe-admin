import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Patient from '@/models/Patient'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const patients = await Patient.findByTenant(params.tenant)
    return NextResponse.json(patients)
  } catch (error) {
    console.error('Error fetching patients:', error)
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const body = await request.json()
    const patient = await Patient.create({
      ...body,
      tenantId: params.tenant
    })
    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    console.error('Error creating patient:', error)
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 })
  }
}
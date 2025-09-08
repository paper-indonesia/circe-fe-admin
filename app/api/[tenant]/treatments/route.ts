import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Treatment from '@/models/Treatment'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const treatments = await Treatment.findByTenant(params.tenant)
    return NextResponse.json(treatments)
  } catch (error) {
    console.error('Error fetching treatments:', error)
    return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const body = await request.json()
    const treatment = await Treatment.create({
      ...body,
      tenantId: params.tenant
    })
    return NextResponse.json(treatment, { status: 201 })
  } catch (error) {
    console.error('Error creating treatment:', error)
    return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 })
  }
}
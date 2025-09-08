import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Staff from '@/models/Staff'

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const staff = await Staff.findByTenant(params.tenant)
    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    await connectMongoDB()
    const body = await request.json()
    const staff = await Staff.create({
      ...body,
      tenantId: params.tenant
    })
    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
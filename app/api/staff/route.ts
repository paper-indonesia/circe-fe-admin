import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Staff from '@/models/Staff'
import { requireAuth, getScopedQuery } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const staff = await Staff.find(getScopedQuery(user.userId, { isActive: true })).sort({ rating: -1 })
    return NextResponse.json(staff)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const body = await request.json()
    const staff = await Staff.create({
      ...body,
      ownerId: user.userId
    })
    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error creating staff:', error)
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 })
  }
}
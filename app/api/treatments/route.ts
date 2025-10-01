import { NextRequest, NextResponse } from 'next/server'
import connectMongoDB from '@/lib/mongodb'
import Treatment from '@/models/Treatment'
import { requireAuth, getScopedQuery } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const treatments = await Treatment.find(getScopedQuery(user.userId, { isActive: true })).sort({ popularity: -1 })
    return NextResponse.json(treatments)
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    console.error('Error fetching treatments:', error)
    return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    await connectMongoDB()
    const body = await request.json()

    console.log('[API] Creating treatment with data:', body)

    const treatment = await Treatment.create({
      ...body,
      ownerId: user.userId
    })

    console.log('[API] Treatment created successfully:', treatment)

    return NextResponse.json(treatment, { status: 201 })
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    console.error('Error creating treatment:', error)

    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({
        error: 'A treatment with this name already exists',
        details: 'Please use a different name for this treatment'
      }, { status: 400 })
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors || {}).map((e: any) => e.message)
      return NextResponse.json({
        error: 'Validation failed',
        details: validationErrors.join(', ')
      }, { status: 400 })
    }

    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to create treatment'
    return NextResponse.json({
      error: 'Failed to create treatment',
      details: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 })
  }
}
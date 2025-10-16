import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Reschedule appointment
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const appointmentId = params.id
    const body = await req.json()

    console.log('[POST /api/appointments/[id]/reschedule] Rescheduling appointment:', appointmentId, body)

    // Validate required fields
    if (!body.new_date || typeof body.new_date !== 'string') {
      return NextResponse.json(
        { error: 'New date is required (YYYY-MM-DD format)' },
        { status: 400 }
      )
    }

    if (!body.new_time || typeof body.new_time !== 'string') {
      return NextResponse.json(
        { error: 'New time is required (HH:MM format)' },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(body.new_time)) {
      return NextResponse.json(
        { error: 'Invalid time format. Use HH:MM format (e.g., 14:30)' },
        { status: 422 }
      )
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(body.new_date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD format (e.g., 2025-01-20)' },
        { status: 422 }
      )
    }

    // Validate reason length if provided
    if (body.reason && body.reason.length > 500) {
      return NextResponse.json(
        { error: 'Reason must be 500 characters or less' },
        { status: 400 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}/reschedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_date: body.new_date,
        new_time: body.new_time,
        reason: body.reason || undefined
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[POST /api/appointments/[id]/reschedule] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to reschedule appointment' },
        { status: response.status }
      )
    }

    console.log('[POST /api/appointments/[id]/reschedule] Success')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/appointments/[id]/reschedule] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

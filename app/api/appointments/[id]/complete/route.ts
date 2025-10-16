import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Complete appointment
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

    console.log('[POST /api/appointments/[id]/complete] Completing appointment:', appointmentId, body)

    // Validate completion_notes length if provided
    if (body.completion_notes && body.completion_notes.length > 1000) {
      return NextResponse.json(
        { error: 'Completion notes must be 1000 characters or less' },
        { status: 400 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completion_notes: body.completion_notes || undefined
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[POST /api/appointments/[id]/complete] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to complete appointment' },
        { status: response.status }
      )
    }

    console.log('[POST /api/appointments/[id]/complete] Success')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/appointments/[id]/complete] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

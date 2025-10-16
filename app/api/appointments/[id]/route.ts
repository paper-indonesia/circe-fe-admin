import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get appointment details by ID
export async function GET(
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

    console.log('[GET /api/appointments/[id]] Fetching appointment:', appointmentId)

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[GET /api/appointments/[id]] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch appointment' },
        { status: response.status }
      )
    }

    console.log('[GET /api/appointments/[id]] Success')

    // Return appointment data
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update appointment (partial update)
export async function PATCH(
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

    console.log('[PATCH /api/appointments/[id]] Updating appointment:', appointmentId, body)

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}`, {
      method: 'PUT', // FastAPI uses PUT for updates
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[PATCH /api/appointments/[id]] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to update appointment' },
        { status: response.status }
      )
    }

    console.log('[PATCH /api/appointments/[id]] Success')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PATCH /api/appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update appointment (full update)
export async function PUT(
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

    console.log('[PUT /api/appointments/[id]] Updating appointment:', appointmentId, body)

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[PUT /api/appointments/[id]] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to update appointment' },
        { status: response.status }
      )
    }

    console.log('[PUT /api/appointments/[id]] Success')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[PUT /api/appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel/delete appointment
export async function DELETE(
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

    console.log('[DELETE /api/appointments/[id]] Cancelling appointment:', appointmentId, body)

    // Validate cancellation_reason
    if (!body.cancellation_reason || typeof body.cancellation_reason !== 'string') {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      )
    }

    if (body.cancellation_reason.length < 1 || body.cancellation_reason.length > 500) {
      return NextResponse.json(
        { error: 'Cancellation reason must be between 1 and 500 characters' },
        { status: 400 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancellation_reason: body.cancellation_reason
      })
    })

    if (!response.ok) {
      const data = await response.json()
      console.error('[DELETE /api/appointments/[id]] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to cancel appointment' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[DELETE /api/appointments/[id]] Success')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[DELETE /api/appointments/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

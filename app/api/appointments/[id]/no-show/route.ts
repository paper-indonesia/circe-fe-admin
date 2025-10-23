import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Mark appointment as no-show
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

    console.log('[POST /api/appointments/[id]/no-show] Marking appointment as no-show:', appointmentId, body)

    // Validate reason length if provided
    if (body.reason && body.reason.length > 500) {
      return NextResponse.json(
        { error: 'Reason must be 500 characters or less' },
        { status: 400 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}/no-show`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: body.reason || undefined
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[POST /api/appointments/[id]/no-show] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to mark appointment as no-show' },
        { status: response.status }
      )
    }

    console.log('[POST /api/appointments/[id]/no-show] Success')

    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/appointments/[id]/no-show] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Fetch payment history
export async function GET(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') || '20'
    const offset = searchParams.get('offset') || '0'
    const status = searchParams.get('status') || 'completed'
    const payment_type = searchParams.get('payment_type') // 'subscription' or 'appointment'

    // Build query params
    const queryParams = new URLSearchParams({
      limit,
      offset,
      status,
    })

    if (payment_type) {
      queryParams.append('payment_type', payment_type)
    }

    const response = await fetch(
      `${FASTAPI_URL}/api/v1/subscriptions/payments?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Failed to fetch payment history:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch payment history', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payment history:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

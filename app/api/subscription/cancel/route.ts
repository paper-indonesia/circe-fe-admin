import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

export async function POST(req: NextRequest) {
  try {
    const authToken = req.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/subscriptions/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to cancel subscription:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to cancel subscription' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Subscription cancellation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

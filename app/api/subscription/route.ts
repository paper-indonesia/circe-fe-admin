import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0 // Disable caching completely

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

export async function GET(req: NextRequest) {
  try {
    const authToken = req.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Add cache-busting query parameter
    const timestamp = Date.now()
    const response = await fetch(`${FASTAPI_URL}/api/v1/subscriptions/current?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      cache: 'no-store', // Disable fetch cache
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch subscription:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch subscription' },
        { status: response.status }
      )
    }

    // Return with anti-cache headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Subscription fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

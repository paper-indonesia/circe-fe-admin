import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get package limits for current subscription
export async function GET(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    console.log('[Package Limits API] Auth token present:', !!authToken)
    console.log('[Package Limits API] Auth token (first 50 chars):', authToken?.substring(0, 50))

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = `${FASTAPI_URL}/api/v1/packages/limits`
    console.log('[Package Limits API] Fetching from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()
    console.log('[Package Limits API] Response status:', response.status)
    console.log('[Package Limits API] Response data:', JSON.stringify(data))

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch package limits' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Package Limits API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get customer credits
export async function GET(
  req: NextRequest,
  { params }: { params: { customer_id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { customer_id } = params

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const queryParams = new URLSearchParams()

    if (searchParams.get('service_id')) {
      queryParams.append('service_id', searchParams.get('service_id')!)
    }
    if (searchParams.get('include_expired')) {
      queryParams.append('include_expired', searchParams.get('include_expired')!)
    }

    const queryString = queryParams.toString()
    const url = `${FASTAPI_URL}/api/v1/staff/customer-packages/${customer_id}/credits${queryString ? '?' + queryString : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch customer credits' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching customer credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

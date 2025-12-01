import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get customer's purchased packages (including pending)
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

    if (searchParams.get('status')) {
      queryParams.append('status', searchParams.get('status')!)
    }
    if (searchParams.get('include_expired')) {
      queryParams.append('include_expired', searchParams.get('include_expired')!)
    }

    const queryString = queryParams.toString()

    // Try to get packages from customer packages endpoint
    // This might be /customer/packages or /staff/customer-packages depending on backend
    const url = `${FASTAPI_URL}/api/v1/customer/packages?customer_id=${customer_id}${queryString ? '&' + queryString : ''}`

    console.log('[Customer Packages API] Fetching packages from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[Customer Packages API] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch customer packages' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching customer packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

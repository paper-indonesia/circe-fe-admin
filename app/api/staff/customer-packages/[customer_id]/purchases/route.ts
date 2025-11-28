import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get customer's purchased packages (staff view)
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
    const status = searchParams.get('status') || ''
    const includeDetails = searchParams.get('include_details') || 'true'

    // Build query string
    const queryParams = new URLSearchParams()
    queryParams.append('customer_id', customer_id)
    if (status) queryParams.append('status', status)
    queryParams.append('include_details', includeDetails)

    const url = `${FASTAPI_URL}/api/v1/customer/packages?${queryParams.toString()}`

    console.log('[Customer Purchases API] Fetching from:', url)

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
      console.error('[Customer Purchases API] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch customer packages' },
        { status: response.status }
      )
    }

    console.log('[Customer Purchases API] Response:', JSON.stringify(data).substring(0, 200))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching customer packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

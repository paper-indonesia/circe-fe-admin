import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.asia-southeast2.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Create new appointment
export async function POST(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Extract tenant_id from auth token (JWT)
    // JWT format: header.payload.signature
    // Payload contains user info including tenant_id
    let tenant_id: string | null = null
    try {
      const tokenParts = authToken.split('.')
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString())
        tenant_id = payload.tenant_id || payload.tenantId
      }
    } catch (err) {
      console.error('Failed to extract tenant_id from token:', err)
    }

    // If tenant_id not in token, try to get from localStorage-backed header
    if (!tenant_id) {
      tenant_id = req.headers.get('x-tenant-id')
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'Tenant ID not found. Please log in again.' },
        { status: 400 }
      )
    }

    // Add tenant_id to request body
    const requestBody = {
      ...body,
      tenant_id
    }

    console.log('Creating appointment with payload:', requestBody)

    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create appointment:', data)
      return NextResponse.json(
        { error: data.detail || data.message || 'Failed to create appointment' },
        { status: response.status }
      )
    }

    // Return the data field from the API response
    // API returns { status: "success", data: {...}, message: "..." }
    return NextResponse.json(data.data || data, { status: 201 })
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - List appointments with comprehensive filtering
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
    const searchParams = req.nextUrl.searchParams
    const params = new URLSearchParams()

    // Pagination
    if (searchParams.get('page')) params.append('page', searchParams.get('page')!)
    if (searchParams.get('size')) params.append('size', searchParams.get('size')!)

    // Date filters
    if (searchParams.get('date_from')) params.append('date_from', searchParams.get('date_from')!)
    if (searchParams.get('date_to')) params.append('date_to', searchParams.get('date_to')!)

    // Status filters
    if (searchParams.get('status')) params.append('status', searchParams.get('status')!)
    if (searchParams.get('appointment_type')) params.append('appointment_type', searchParams.get('appointment_type')!)
    if (searchParams.get('payment_status')) params.append('payment_status', searchParams.get('payment_status')!)

    // Entity filters
    if (searchParams.get('customer_id')) params.append('customer_id', searchParams.get('customer_id')!)
    if (searchParams.get('staff_id')) params.append('staff_id', searchParams.get('staff_id')!)
    if (searchParams.get('outlet_id')) params.append('outlet_id', searchParams.get('outlet_id')!)
    if (searchParams.get('service_id')) params.append('service_id', searchParams.get('service_id')!)

    // Sorting
    if (searchParams.get('sort_by')) params.append('sort_by', searchParams.get('sort_by')!)
    if (searchParams.get('sort_direction')) params.append('sort_direction', searchParams.get('sort_direction')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/appointments${queryString ? '?' + queryString : ''}`

    console.log('[GET /api/appointments] Fetching from:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[GET /api/appointments] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch appointments' },
        { status: response.status }
      )
    }

    console.log('[GET /api/appointments] Success, returned', data.items?.length || 0, 'items')

    // Return paginated response structure
    // API returns { items: [...], total: 45, page: 1, size: 20, pages: 3 }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/appointments] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

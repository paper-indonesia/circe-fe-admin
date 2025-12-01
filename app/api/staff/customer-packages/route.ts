import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - List customer packages (staff view)
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
    const queryParams = new URLSearchParams()

    if (searchParams.get('customer_id')) {
      queryParams.append('customer_id', searchParams.get('customer_id')!)
    }
    if (searchParams.get('status_filter')) {
      queryParams.append('status_filter', searchParams.get('status_filter')!)
    }
    if (searchParams.get('include_details')) {
      queryParams.append('include_details', searchParams.get('include_details')!)
    }
    if (searchParams.get('page')) {
      queryParams.append('page', searchParams.get('page')!)
    }
    if (searchParams.get('size')) {
      queryParams.append('size', searchParams.get('size')!)
    }

    const queryString = queryParams.toString()
    const url = `${FASTAPI_URL}/api/v1/staff/customer-packages${queryString ? '?' + queryString : ''}`

    console.log('[Staff Customer Packages API] Fetching from:', url)

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
      console.error('[Staff Customer Packages API] Error:', data)
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

// POST - Staff creates package purchase for customer
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
    console.log('[Staff Customer Packages API] Creating purchase:', JSON.stringify(body, null, 2))

    // Build backend payload
    const backendPayload = {
      customer_id: body.customer_id,
      package_id: body.package_id,
      outlet_id: body.outlet_id,
      payment_method: body.payment_method || 'manual_onspot',
      amount_paid: parseFloat(String(body.amount_paid)) || 0,
      currency: body.currency || 'IDR',
      notes: body.notes || undefined,
    }

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff/customer-packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create customer package purchase:', data)

      let errorMessage = 'Failed to create package purchase'
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          const errors = data.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'unknown'
            return `${field}: ${err.msg}`
          })
          errorMessage = errors.join(', ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data.detail },
        { status: response.status }
      )
    }

    // Transform backend response
    const frontendData = {
      ...data,
      id: data._id || data.id,
      amount_paid: parseFloat(data.amount_paid) || 0,
    }

    return NextResponse.json(frontendData, { status: 201 })
  } catch (error) {
    console.error('Error creating customer package purchase:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

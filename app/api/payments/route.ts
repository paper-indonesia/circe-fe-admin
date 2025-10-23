import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Process payment
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

    console.log('Processing payment with payload:', body)

    const response = await fetch(`${FASTAPI_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to process payment:', data)
      return NextResponse.json(
        { error: data.detail || data.message || 'Failed to process payment' },
        { status: response.status }
      )
    }

    // Return the data field from the API response
    // API returns { status: "success", data: {...}, message: "..." }
    return NextResponse.json(data.data || data, { status: 201 })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - List payments
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

    if (searchParams.get('appointment_id')) params.append('appointment_id', searchParams.get('appointment_id')!)
    if (searchParams.get('customer_id')) params.append('customer_id', searchParams.get('customer_id')!)
    if (searchParams.get('status')) params.append('status', searchParams.get('status')!)
    if (searchParams.get('payment_method')) params.append('payment_method', searchParams.get('payment_method')!)
    if (searchParams.get('start_date')) params.append('start_date', searchParams.get('start_date')!)
    if (searchParams.get('end_date')) params.append('end_date', searchParams.get('end_date')!)
    if (searchParams.get('page')) params.append('page', searchParams.get('page')!)
    if (searchParams.get('limit')) params.append('limit', searchParams.get('limit')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/payments${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch payments' },
        { status: response.status }
      )
    }

    // Return the data field from the API response
    return NextResponse.json(data.data || data)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

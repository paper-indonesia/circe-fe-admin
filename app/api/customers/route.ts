import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - List all customers
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

    if (searchParams.get('page')) params.append('page', searchParams.get('page')!)
    if (searchParams.get('size')) params.append('size', searchParams.get('size')!)
    if (searchParams.get('search')) params.append('search', searchParams.get('search')!)
    if (searchParams.get('tags')) params.append('tags', searchParams.get('tags')!)
    if (searchParams.get('has_password')) params.append('has_password', searchParams.get('has_password')!)
    if (searchParams.get('email_verified')) params.append('email_verified', searchParams.get('email_verified')!)
    if (searchParams.get('created_from')) params.append('created_from', searchParams.get('created_from')!)
    if (searchParams.get('created_to')) params.append('created_to', searchParams.get('created_to')!)
    if (searchParams.get('sort_by')) params.append('sort_by', searchParams.get('sort_by')!)
    if (searchParams.get('order')) params.append('order', searchParams.get('order')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/customers${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch customers' },
        { status: response.status }
      )
    }

    // Map _id to id for all customers in the response
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map((customer: any) => ({
        ...customer,
        id: customer._id || customer.id,
      }))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new customer
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

    console.log('Creating customer with payload:', body)

    const response = await fetch(`${FASTAPI_URL}/api/v1/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create customer:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to create customer' },
        { status: response.status }
      )
    }

    // Map _id to id for frontend compatibility
    if (data._id) {
      data.id = data._id
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

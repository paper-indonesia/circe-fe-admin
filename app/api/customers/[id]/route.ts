import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get single customer by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customerId = params.id

    const response = await fetch(`${FASTAPI_URL}/api/v1/customers/${customerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch customer' },
        { status: response.status }
      )
    }

    // Map _id to id for frontend compatibility
    if (data._id) {
      data.id = data._id
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update customer
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customerId = params.id
    const body = await req.json()

    console.log('Updating customer:', customerId, 'with payload:', body)

    const response = await fetch(`${FASTAPI_URL}/api/v1/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to update customer:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to update customer' },
        { status: response.status }
      )
    }

    // Map _id to id for frontend compatibility
    if (data._id) {
      data.id = data._id
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete customer
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customerId = params.id

    // Get permanent parameter from query string (default to false for soft delete)
    const searchParams = req.nextUrl.searchParams
    const permanent = searchParams.get('permanent') === 'true'

    console.log('Deleting customer:', customerId, 'permanent:', permanent)

    const response = await fetch(
      `${FASTAPI_URL}/api/v1/customers/${customerId}?permanent=${permanent}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const data = await response.json()
      console.error('Failed to delete customer:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to delete customer' },
        { status: response.status }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: permanent
        ? 'Customer permanently deleted'
        : 'Customer deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

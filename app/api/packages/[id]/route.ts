import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get package by ID
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

    const { id } = params
    const url = `${FASTAPI_URL}/api/v1/packages/${id}`

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
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch package' },
        { status: response.status }
      )
    }

    // Transform backend response
    const frontendData = {
      ...data,
      id: data._id || data.id,
      total_individual_price: parseFloat(data.total_individual_price) || 0,
      discount_amount: parseFloat(data.discount_amount) || 0,
      discount_percentage: parseFloat(data.discount_percentage) || 0,
      package_price: parseFloat(data.package_price) || 0,
      total_revenue: parseFloat(data.total_revenue) || 0,
    }

    return NextResponse.json(frontendData)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update package
export async function PATCH(
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

    const { id } = params
    const body = await req.json()

    console.log(`[Packages API] Updating package ${id}:`, JSON.stringify(body, null, 2))

    // Build update payload (only include provided fields)
    const updatePayload: any = {}

    if (body.name !== undefined) updatePayload.name = body.name
    if (body.description !== undefined) updatePayload.description = body.description
    if (body.package_price !== undefined) updatePayload.package_price = parseFloat(String(body.package_price))
    if (body.validity_days !== undefined) {
      updatePayload.validity_days = body.validity_days ? parseInt(String(body.validity_days)) : null
    }
    if (body.is_active !== undefined) updatePayload.is_active = body.is_active
    if (body.status !== undefined) updatePayload.status = body.status
    if (body.outlet_ids !== undefined) updatePayload.outlet_ids = body.outlet_ids

    const response = await fetch(`${FASTAPI_URL}/api/v1/packages/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to update package:', data)

      let errorMessage = 'Failed to update package'
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
      total_individual_price: parseFloat(data.total_individual_price) || 0,
      discount_amount: parseFloat(data.discount_amount) || 0,
      discount_percentage: parseFloat(data.discount_percentage) || 0,
      package_price: parseFloat(data.package_price) || 0,
      total_revenue: parseFloat(data.total_revenue) || 0,
    }

    return NextResponse.json(frontendData)
  } catch (error) {
    console.error('Error updating package:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Archive package (soft delete)
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

    const { id } = params

    console.log(`[Packages API] Deleting package ${id}`)

    const response = await fetch(`${FASTAPI_URL}/api/v1/packages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to delete package:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to delete package' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting package:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

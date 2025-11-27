import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - List all packages
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
    if (searchParams.get('status')) params.append('status', searchParams.get('status')!)
    if (searchParams.get('is_active')) params.append('is_active', searchParams.get('is_active')!)
    if (searchParams.get('outlet_id')) params.append('outlet_id', searchParams.get('outlet_id')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/packages${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch packages' },
        { status: response.status }
      )
    }

    // Transform backend format to frontend format
    const transformPackage = (pkg: any) => ({
      ...pkg,
      id: pkg._id || pkg.id,
      total_individual_price: parseFloat(pkg.total_individual_price) || 0,
      discount_amount: parseFloat(pkg.discount_amount) || 0,
      discount_percentage: parseFloat(pkg.discount_percentage) || 0,
      package_price: parseFloat(pkg.package_price) || 0,
      total_revenue: parseFloat(pkg.total_revenue) || 0,
    })

    // Handle different response formats
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map(transformPackage)
    } else if (Array.isArray(data)) {
      return NextResponse.json(data.map(transformPackage))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new package
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
    console.log('[Packages API] Received body:', JSON.stringify(body, null, 2))

    // Build backend payload
    const backendPayload = {
      name: body.name,
      description: body.description || '',
      package_items: body.package_items.map((item: any) => ({
        service_id: item.service_id,
        service_name: item.service_name || '',
        quantity: parseInt(String(item.quantity)) || 1,
        unit_price: parseFloat(String(item.unit_price)) || 0,
      })),
      package_price: parseFloat(String(body.package_price)) || 0,
      currency: body.currency || 'IDR',
      validity_days: body.validity_days ? parseInt(String(body.validity_days)) : null,
      is_active: body.is_active !== false,
      status: body.status || 'active',
      outlet_ids: body.outlet_ids || [],
    }

    console.log('Creating package with payload:', backendPayload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/packages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create package:', data)

      // Handle subscription limit error (402)
      if (response.status === 402) {
        return NextResponse.json(
          {
            error: data.message || 'Subscription limit reached',
            upgrade_required: data.upgrade_required || true,
            type: 'subscription_limit'
          },
          { status: 402 }
        )
      }

      // Format error message for user
      let errorMessage = 'Failed to create package'
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

    return NextResponse.json(frontendData, { status: 201 })
  } catch (error) {
    console.error('Error creating package:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

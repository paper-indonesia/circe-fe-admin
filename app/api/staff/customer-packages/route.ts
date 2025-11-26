import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
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

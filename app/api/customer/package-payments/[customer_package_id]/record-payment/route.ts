import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Record manual payment for package purchase (Staff only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ customer_package_id: string }> }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { customer_package_id } = await params
    const body = await req.json()

    console.log('[Package Payment API] Recording payment for:', customer_package_id)
    console.log('[Package Payment API] Payment data:', JSON.stringify(body, null, 2))

    // Build backend payload
    const backendPayload = {
      amount: parseFloat(String(body.amount)) || 0,
      payment_method: body.payment_method || 'cash',
      notes: body.notes || undefined,
      receipt_number: body.receipt_number || undefined,
    }

    const response = await fetch(
      `${FASTAPI_URL}/api/v1/customer-packages/${customer_package_id}/record-payment`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendPayload)
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to record package payment:', data)

      let errorMessage = 'Failed to record payment'
      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (Array.isArray(data.detail)) {
          const errors = data.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'unknown'
            return `${field}: ${err.msg}`
          })
          errorMessage = errors.join(', ')
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data.detail },
        { status: response.status }
      )
    }

    console.log('[Package Payment API] Payment recorded successfully:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error recording package payment:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

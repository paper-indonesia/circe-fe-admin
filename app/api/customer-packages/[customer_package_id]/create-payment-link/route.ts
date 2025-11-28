import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Create payment link for package purchase (Paper.id)
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

    console.log('[Create Payment Link API] Creating payment link for:', customer_package_id)
    console.log('[Create Payment Link API] Request data:', JSON.stringify(body, null, 2))

    // Build backend payload
    const backendPayload = {
      due_date: body.due_date,
      notes: body.notes || 'Online payment for package purchase',
      send_email: body.send_email ?? true,
      send_sms: body.send_sms ?? false,
      send_whatsapp: body.send_whatsapp ?? false,
    }

    const response = await fetch(
      `${FASTAPI_URL}/api/v1/customer-packages/${customer_package_id}/create-payment-link`,
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
      console.error('Failed to create payment link:', data)

      let errorMessage = 'Failed to create payment link'
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

    console.log('[Create Payment Link API] Payment link created successfully:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating payment link:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

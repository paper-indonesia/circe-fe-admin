import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

/**
 * POST - Record manual offline payment
 *
 * Endpoint: POST /api/appointments/{appointment_id}/record-payment
 *
 * Records manual offline payments (cash, POS terminal, bank transfer) made by customers.
 * Staff only endpoint with automatic audit trail.
 *
 * Business Rules:
 * - Payment method must be offline type only (cash, pos_terminal, bank_transfer)
 * - Amount must not exceed appointment total
 * - Immediate status: Payment marked as COMPLETED (no pending state)
 * - Duplicate prevention: Only one completed payment per appointment
 * - Audit trail: Records staff user who recorded payment
 *
 * Updates Appointment:
 * - payment_status: PAID (if full) or PARTIALLY_PAID
 * - paid_amount: Incremented by payment amount
 * - payment_method: Updated to recorded method
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      )
    }

    const appointmentId = params.id
    const body = await req.json()

    // Validate request body
    if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be a positive number.' },
        { status: 400 }
      )
    }

    if (!body.payment_method) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      )
    }

    const validMethods = ['cash', 'pos_terminal', 'bank_transfer']
    if (!validMethods.includes(body.payment_method)) {
      return NextResponse.json(
        { error: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate optional fields
    if (body.notes && typeof body.notes === 'string' && body.notes.length > 500) {
      return NextResponse.json(
        { error: 'Notes must be 500 characters or less' },
        { status: 400 }
      )
    }

    if (body.receipt_number && typeof body.receipt_number === 'string' && body.receipt_number.length > 100) {
      return NextResponse.json(
        { error: 'Receipt number must be 100 characters or less' },
        { status: 400 }
      )
    }

    console.log('[POST /api/appointments/[id]/record-payment] Recording payment:', {
      appointmentId,
      amount: body.amount,
      method: body.payment_method
    })

    // Call FastAPI backend to record payment
    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}/record-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: body.amount,
        payment_method: body.payment_method,
        notes: body.notes || undefined,
        receipt_number: body.receipt_number || undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[POST /api/appointments/[id]/record-payment] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to record payment' },
        { status: response.status }
      )
    }

    console.log('[POST /api/appointments/[id]/record-payment] Success:', {
      payment_id: data.payment?.id,
      payment_status: data.appointment?.payment_status,
      paid_amount: data.appointment?.paid_amount
    })

    // Return payment recording result
    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/appointments/[id]/record-payment] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

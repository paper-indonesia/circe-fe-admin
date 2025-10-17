import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

/**
 * GET - Get payment status for an appointment
 *
 * Endpoint: GET /api/appointments/{appointment_id}/payment-status
 *
 * Returns complete payment information including:
 * - Current payment status (pending/paid/partially_paid/refunded)
 * - Total amount and paid amount
 * - Remaining balance for partial payments
 * - Platform fee breakdown
 * - Complete payment history with audit trail
 * - Pending payment link details (if exists)
 * - Completion eligibility check (can_complete)
 */
export async function GET(
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

    console.log('[GET /api/appointments/[id]/payment-status] Fetching payment status for:', appointmentId)

    // Call FastAPI backend to get payment status
    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}/payment-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[GET /api/appointments/[id]/payment-status] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch payment status' },
        { status: response.status }
      )
    }

    console.log('[GET /api/appointments/[id]/payment-status] Success:', {
      appointment_id: data.appointment_id,
      payment_status: data.payment_status,
      can_complete: data.can_complete
    })

    // Return payment status data
    return NextResponse.json(data)
  } catch (error) {
    console.error('[GET /api/appointments/[id]/payment-status] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

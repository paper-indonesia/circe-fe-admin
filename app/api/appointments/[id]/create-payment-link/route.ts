import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.asia-southeast2.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

/**
 * POST - Create Paper.id payment link
 *
 * Endpoint: POST /api/appointments/{appointment_id}/create-payment-link
 *
 * Creates a Paper.id payment link for remaining appointment balance.
 * Customers receive link via email/WhatsApp/SMS for online payment.
 *
 * Business Rules:
 * - Only creates link for remaining unpaid balance
 * - Cannot create multiple pending links (prevents duplicate payments)
 * - Link expires after 7 days by default
 * - Supports multiple notification channels (email/WhatsApp/SMS)
 * - Includes platform fee (configurable percentage)
 *
 * Paper.id Flow:
 * 1. Creates invoice in Paper.id
 * 2. Generates payment link with QR code
 * 3. Sends link to customer via selected channels
 * 4. Creates pending payment record in database
 * 5. Webhook updates payment status when customer pays
 *
 * Response includes:
 * - Invoice details with Paper.id IDs
 * - Payment link URL and short URL
 * - Payment record with pending status
 * - Next steps for staff
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

    // Validate optional fields
    if (body.notes && typeof body.notes === 'string' && body.notes.length > 500) {
      return NextResponse.json(
        { error: 'Notes must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Validate due_date format if provided (ISO 8601)
    if (body.due_date && typeof body.due_date === 'string') {
      const dueDate = new Date(body.due_date)
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid due_date format. Must be ISO 8601 (e.g., "2025-12-31T23:59:59Z")' },
          { status: 400 }
        )
      }
    }

    // Validate boolean flags
    if (body.send_email !== undefined && typeof body.send_email !== 'boolean') {
      return NextResponse.json(
        { error: 'send_email must be a boolean' },
        { status: 400 }
      )
    }

    if (body.send_whatsapp !== undefined && typeof body.send_whatsapp !== 'boolean') {
      return NextResponse.json(
        { error: 'send_whatsapp must be a boolean' },
        { status: 400 }
      )
    }

    if (body.send_sms !== undefined && typeof body.send_sms !== 'boolean') {
      return NextResponse.json(
        { error: 'send_sms must be a boolean' },
        { status: 400 }
      )
    }

    console.log('[POST /api/appointments/[id]/create-payment-link] Creating payment link:', {
      appointmentId,
      send_email: body.send_email,
      send_whatsapp: body.send_whatsapp,
      send_sms: body.send_sms,
      has_notes: !!body.notes,
      has_due_date: !!body.due_date
    })

    // Call FastAPI backend to create payment link
    const response = await fetch(`${FASTAPI_URL}/api/v1/appointments/${appointmentId}/create-payment-link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        send_email: body.send_email ?? false,
        send_whatsapp: body.send_whatsapp ?? false,
        send_sms: body.send_sms ?? false,
        notes: body.notes || undefined,
        due_date: body.due_date || undefined,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('[POST /api/appointments/[id]/create-payment-link] Error:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to create payment link' },
        { status: response.status }
      )
    }

    console.log('[POST /api/appointments/[id]/create-payment-link] Success:', {
      invoice_id: data.invoice?.id,
      invoice_number: data.invoice?.invoice_number,
      paper_invoice_id: data.invoice?.paper_invoice_id,
      payment_url: data.payment_link?.url,
      short_url: data.payment_link?.short_url,
      expires_at: data.payment_link?.expires_at,
      sent_via: data.payment_link?.sent_via,
      payment_id: data.payment?.id,
      payment_status: data.payment?.status,
      awaiting_payment: data.payment?.awaiting_customer_payment
    })

    // Return payment link creation result
    return NextResponse.json(data)
  } catch (error) {
    console.error('[POST /api/appointments/[id]/create-payment-link] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

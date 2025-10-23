import { NextResponse } from 'next/server'

/**
 * GET /api/config/portal-url
 * Returns the customer portal base URL from environment variables
 * This endpoint allows the frontend to fetch the URL at runtime instead of build time
 */
export async function GET() {
  try {
    // Get the portal URL from environment variable
    // This will be read at runtime on the server, not embedded at build time
    const portalUrl = process.env.NEXT_PUBLIC_CUSTOMER_PORTAL_URL || ''

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'Customer portal URL not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: portalUrl,
      success: true
    })
  } catch (error) {
    console.error('Error fetching portal URL:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portal URL configuration' },
      { status: 500 }
    )
  }
}

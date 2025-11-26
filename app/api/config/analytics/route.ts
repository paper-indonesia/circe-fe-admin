import { NextResponse } from 'next/server'

/**
 * GET /api/config/analytics
 * Returns analytics configuration from environment variables
 * This endpoint allows the frontend to fetch the config at runtime instead of build time
 */
export async function GET() {
  try {
    const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''

    return NextResponse.json({
      ga_measurement_id: gaMeasurementId,
      google_ads_id: googleAdsId,
      success: true
    })
  } catch (error) {
    console.error('Error fetching analytics config:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics configuration' },
      { status: 500 }
    )
  }
}

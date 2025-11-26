import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/config/analytics
 * Returns analytics configuration from environment variables
 * This endpoint allows the frontend to fetch the config at runtime instead of build time
 */
export async function GET() {
  try {
    const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
    const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ''

    console.log('[Analytics API] GA Measurement ID:', gaMeasurementId ? 'SET' : 'NOT SET')
    console.log('[Analytics API] Google Ads ID:', googleAdsId ? 'SET' : 'NOT SET')

    return NextResponse.json({
      ga_measurement_id: gaMeasurementId,
      google_ads_id: googleAdsId,
      success: true
    })
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics configuration' },
      { status: 500 }
    )
  }
}

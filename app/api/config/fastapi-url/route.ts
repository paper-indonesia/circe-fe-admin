import { NextResponse } from 'next/server'

/**
 * GET /api/config/fastapi-url
 * Returns the FastAPI base URL from environment variables
 * This endpoint allows the frontend to fetch the URL at runtime instead of build time
 */
export async function GET() {
  try {
    // Get the FastAPI URL from environment variable
    // This will be read at runtime on the server, not embedded at build time
    const fastapiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || ''

    if (!fastapiUrl) {
      return NextResponse.json(
        { error: 'FastAPI URL not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: fastapiUrl,
      success: true
    })
  } catch (error) {
    console.error('Error fetching FastAPI URL:', error)
    return NextResponse.json(
      { error: 'Failed to fetch FastAPI URL configuration' },
      { status: 500 }
    )
  }
}

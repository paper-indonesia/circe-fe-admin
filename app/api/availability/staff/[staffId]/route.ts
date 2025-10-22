import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.asia-southeast2.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get complete staff schedule
export async function GET(
  req: NextRequest,
  { params }: { params: { staffId: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { staffId } = params

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const queryParams = new URLSearchParams()

    // Required params
    if (searchParams.get('start_date')) queryParams.append('start_date', searchParams.get('start_date')!)
    if (searchParams.get('end_date')) queryParams.append('end_date', searchParams.get('end_date')!)

    // Optional params
    if (searchParams.get('include_breaks')) queryParams.append('include_breaks', searchParams.get('include_breaks')!)

    if (!searchParams.get('start_date') || !searchParams.get('end_date')) {
      return NextResponse.json(
        { error: 'Missing required parameters: start_date, end_date' },
        { status: 400 }
      )
    }

    const queryString = queryParams.toString()
    const url = `${FASTAPI_URL}/api/v1/availability/staff/${staffId}?${queryString}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch staff schedule' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching staff schedule:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

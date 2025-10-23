import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Check availability for specific time slot
export async function GET(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const params = new URLSearchParams()

    // Required params
    if (searchParams.get('staff_id')) params.append('staff_id', searchParams.get('staff_id')!)
    if (searchParams.get('date')) params.append('date', searchParams.get('date')!)
    if (searchParams.get('start_time')) params.append('start_time', searchParams.get('start_time')!)
    if (searchParams.get('end_time')) params.append('end_time', searchParams.get('end_time')!)

    // Optional params
    if (searchParams.get('service_id')) params.append('service_id', searchParams.get('service_id')!)

    if (!searchParams.get('staff_id') || !searchParams.get('date') ||
        !searchParams.get('start_time') || !searchParams.get('end_time')) {
      return NextResponse.json(
        { error: 'Missing required parameters: staff_id, date, start_time, end_time' },
        { status: 400 }
      )
    }

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/availability/check?${queryString}`

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
        { error: data.detail || 'Failed to check availability' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

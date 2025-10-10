import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get customer appointments
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const customerId = params.id

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const queryParams = new URLSearchParams()

    if (searchParams.get('status')) queryParams.append('status', searchParams.get('status')!)
    if (searchParams.get('from_date')) queryParams.append('from_date', searchParams.get('from_date')!)
    if (searchParams.get('to_date')) queryParams.append('to_date', searchParams.get('to_date')!)
    if (searchParams.get('page')) queryParams.append('page', searchParams.get('page')!)
    if (searchParams.get('size')) queryParams.append('size', searchParams.get('size')!)

    const queryString = queryParams.toString()
    const url = `${FASTAPI_URL}/api/v1/customers/${customerId}/appointments${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch customer appointments' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching customer appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

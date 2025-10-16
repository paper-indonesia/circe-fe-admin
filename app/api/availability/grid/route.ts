import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

export async function GET(req: NextRequest) {
  try {
    const authToken = req.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const service_id = searchParams.get('service_id')
    const staff_id = searchParams.get('staff_id') // Optional
    const outlet_id = searchParams.get('outlet_id')
    const start_date = searchParams.get('start_date')
    const num_days = searchParams.get('num_days') || '7'
    const slot_interval_minutes = searchParams.get('slot_interval_minutes') || '30'

    if (!service_id || !outlet_id || !start_date) {
      return NextResponse.json(
        { error: 'Missing required parameters: service_id, outlet_id, start_date' },
        { status: 400 }
      )
    }

    const url = new URL(`${FASTAPI_URL}/api/v1/availability/availability-grid`)
    url.searchParams.set('service_id', service_id)
    url.searchParams.set('outlet_id', outlet_id)
    url.searchParams.set('start_date', start_date)
    url.searchParams.set('num_days', num_days)
    url.searchParams.set('slot_interval_minutes', slot_interval_minutes)
    if (staff_id) {
      url.searchParams.set('staff_id', staff_id)
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to fetch availability grid:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch availability grid' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Availability grid error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

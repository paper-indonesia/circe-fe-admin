import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - List availability entries
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

    // Pass through all availability-related params
    if (searchParams.get('start_date')) params.append('start_date', searchParams.get('start_date')!)
    if (searchParams.get('end_date')) params.append('end_date', searchParams.get('end_date')!)
    if (searchParams.get('staff_id')) params.append('staff_id', searchParams.get('staff_id')!)
    if (searchParams.get('availability_type')) params.append('availability_type', searchParams.get('availability_type')!)
    if (searchParams.get('outlet_id')) params.append('outlet_id', searchParams.get('outlet_id')!)
    if (searchParams.get('page')) params.append('page', searchParams.get('page')!)
    if (searchParams.get('size')) params.append('size', searchParams.get('size')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/availability${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch availability entries' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching availability entries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create availability entry
export async function POST(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Validate required fields
    if (!body.tenant_id) {
      return NextResponse.json(
        { error: 'Tenant ID wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.staff_id) {
      return NextResponse.json(
        { error: 'Staff ID wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.date) {
      return NextResponse.json(
        { error: 'Tanggal wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: 'Waktu mulai dan selesai wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.availability_type) {
      return NextResponse.json(
        { error: 'Tipe ketersediaan wajib diisi' },
        { status: 400 }
      )
    }

    // Validate recurrence
    if (body.recurrence_type && body.recurrence_type !== 'none' && !body.recurrence_end_date) {
      return NextResponse.json(
        { error: 'Tanggal akhir pengulangan wajib diisi untuk pola berulang' },
        { status: 400 }
      )
    }

    // Use the payload as-is from the request body
    const payload = body

    console.log('Creating availability entry with payload:', payload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/availability`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create availability entry:', data)

      let errorMessage = 'Gagal membuat ketersediaan'
      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map((err: any) => err.msg || err).join(', ')
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data.detail },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating availability entry:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update availability entry
export async function PUT(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      )
    }

    console.log(`Updating availability entry ${id} with payload:`, updateData)

    const response = await fetch(`${FASTAPI_URL}/api/v1/availability/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to update availability entry:', data)

      let errorMessage = 'Gagal mengupdate ketersediaan'
      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data.detail },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating availability entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete availability entry
export async function DELETE(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Availability ID is required' },
        { status: 400 }
      )
    }

    console.log(`Deleting availability entry ${id}`)

    const response = await fetch(`${FASTAPI_URL}/api/v1/availability/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to delete availability entry:', data)
      return NextResponse.json(
        { error: data.detail || 'Gagal menghapus ketersediaan' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting availability entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

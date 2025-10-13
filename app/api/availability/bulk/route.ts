import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Create multiple availability entries in bulk
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

    // Get tenant_id from cookie
    let tenantId: string | null = null
    const tenantData = req.cookies.get('tenant')
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData.value)
        tenantId = tenant.id
      } catch (e) {
        console.error('Failed to parse tenant cookie:', e)
      }
    }

    // If no tenant_id in cookie, fetch from /api/v1/users/me
    if (!tenantId) {
      const userResponse = await fetch(`${FASTAPI_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        if (userData.tenant_ids && userData.tenant_ids.length > 0) {
          tenantId = userData.tenant_ids[0]
        }
      }
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found. Please login again.' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.staff_id) {
      return NextResponse.json(
        { error: 'Staff ID wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.availability_entries || !Array.isArray(body.availability_entries)) {
      return NextResponse.json(
        { error: 'Availability entries wajib berupa array' },
        { status: 400 }
      )
    }

    if (body.availability_entries.length === 0) {
      return NextResponse.json(
        { error: 'Minimal satu availability entry diperlukan' },
        { status: 400 }
      )
    }

    if (body.availability_entries.length > 50) {
      return NextResponse.json(
        { error: 'Maksimal 50 entries per request' },
        { status: 400 }
      )
    }

    // Add tenant_id to the payload
    const payload = {
      ...body,
      tenant_id: tenantId
    }

    console.log('Creating bulk availability entries:', payload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/availability/bulk`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create bulk availability entries:', data)

      let errorMessage = 'Gagal membuat ketersediaan bulk'
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
    console.error('Error creating bulk availability entries:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

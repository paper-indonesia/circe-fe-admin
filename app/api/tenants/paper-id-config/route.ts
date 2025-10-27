import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// GET /api/tenants/paper-id-config
export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tenantId: string | null = null

    // Get tenant_id from cookie
    const tenantData = cookieStore.get('tenant')
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData.value)
        tenantId = tenant.id
      } catch (e) {
        console.error('Failed to parse tenant cookie:', e)
      }
    }

    // Fallback: get tenant_id from /api/v1/users/me
    if (!tenantId) {
      const userResponse = await fetch(`${FASTAPI_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      })

      if (!userResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch user info' }, { status: userResponse.status })
      }

      const userData = await userResponse.json()
      if (!userData.tenant_ids || userData.tenant_ids.length === 0) {
        return NextResponse.json({ error: 'No tenant found for user' }, { status: 404 })
      }

      tenantId = userData.tenant_ids[0]
    }

    // Get Paper.id configuration
    const response = await fetch(`${FASTAPI_URL}/api/v1/tenants/${tenantId}/paper-id-config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (response.status === 404) {
      // No configuration found - return empty config
      return NextResponse.json({
        client_id: null,
        is_production: false,
        enabled: false
      })
    }

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.detail || 'Failed to fetch Paper.id config' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Paper.id config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/tenants/paper-id-config
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tenantId: string | null = null

    // Get tenant_id from cookie
    const tenantData = cookieStore.get('tenant')
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData.value)
        tenantId = tenant.id
      } catch (e) {
        console.error('Failed to parse tenant cookie:', e)
      }
    }

    // Fallback: get tenant_id from /api/v1/users/me
    if (!tenantId) {
      const userResponse = await fetch(`${FASTAPI_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      })

      if (!userResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch user info' }, { status: userResponse.status })
      }

      const userData = await userResponse.json()
      if (!userData.tenant_ids || userData.tenant_ids.length === 0) {
        return NextResponse.json({ error: 'No tenant found for user' }, { status: 404 })
      }

      tenantId = userData.tenant_ids[0]
    }

    const body = await request.json()

    // Update Paper.id configuration
    const response = await fetch(`${FASTAPI_URL}/api/v1/tenants/${tenantId}/paper-id-config`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.detail || 'Failed to update Paper.id config' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating Paper.id config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/tenants/paper-id-config
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tenantId: string | null = null

    // Get tenant_id from cookie
    const tenantData = cookieStore.get('tenant')
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData.value)
        tenantId = tenant.id
      } catch (e) {
        console.error('Failed to parse tenant cookie:', e)
      }
    }

    // Fallback: get tenant_id from /api/v1/users/me
    if (!tenantId) {
      const userResponse = await fetch(`${FASTAPI_URL}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      })

      if (!userResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch user info' }, { status: userResponse.status })
      }

      const userData = await userResponse.json()
      if (!userData.tenant_ids || userData.tenant_ids.length === 0) {
        return NextResponse.json({ error: 'No tenant found for user' }, { status: 404 })
      }

      tenantId = userData.tenant_ids[0]
    }

    // Disable Paper.id configuration
    const response = await fetch(`${FASTAPI_URL}/api/v1/tenants/${tenantId}/paper-id-config`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok && response.status !== 204) {
      const error = await response.json()
      return NextResponse.json({ error: error.detail || 'Failed to disable Paper.id config' }, { status: response.status })
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error disabling Paper.id config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

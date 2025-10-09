import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tenantId: string | null = null

    // Try to get tenant_id from cookie first
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
      const userResponse = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
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

      tenantId = userData.tenant_ids[0] // Get first tenant
    }

    // Get full tenant details from backend
    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.detail || 'Failed to fetch tenant' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching current tenant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let tenantId: string | null = null

    // Try to get tenant_id from cookie first
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
      const userResponse = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
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

      tenantId = userData.tenant_ids[0] // Get first tenant
    }

    const body = await request.json()

    // Update tenant via backend
    const response = await fetch(`${BACKEND_URL}/api/v1/tenants/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.detail || 'Failed to update tenant' }, { status: response.status })
    }

    const data = await response.json()

    // Update tenant cookie with new data
    const cookieStore2 = await cookies()
    cookieStore2.set('tenant', JSON.stringify({
      id: data.id,
      name: data.name,
      slug: data.slug,
      logo_url: data.logo_url || null,
      theme_color: data.theme_color || null
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating current tenant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get current user's tenant information
export async function GET(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Try to get tenant_id from cookie first
    let tenantId: string | null = null
    const tenantData = req.cookies.get('tenant')
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData.value)
        tenantId = tenant.id

        return NextResponse.json({
          tenant_id: tenantId,
          tenant: tenant
        })
      } catch (e) {
        console.error('Failed to parse tenant cookie:', e)
      }
    }

    // If no tenant_id in cookie, fetch from /api/v1/users/me
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

        return NextResponse.json({
          tenant_id: tenantId,
          tenant_ids: userData.tenant_ids
        })
      }
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID not found. Please login again.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ tenant_id: tenantId })
  } catch (error) {
    console.error('Error fetching tenant info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

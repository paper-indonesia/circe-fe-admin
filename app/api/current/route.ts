import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Get current tenant information including outlet count
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

    // Fetch tenant details
    const tenantResponse = await fetch(`${FASTAPI_URL}/api/v1/tenants/${tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tenantResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch tenant details' },
        { status: tenantResponse.status }
      )
    }

    const tenant = await tenantResponse.json()

    // Fetch outlet count for this tenant
    const outletsResponse = await fetch(`${FASTAPI_URL}/api/v1/outlets?tenant_id=${tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    let outletCount = 0
    if (outletsResponse.ok) {
      const outletsData = await outletsResponse.json()
      outletCount = outletsData.items?.length || 0
    }

    return NextResponse.json({
      tenant_id: tenantId,
      tenant: tenant,
      outlet_count: outletCount,
      has_outlets: outletCount > 0,
    })
  } catch (error) {
    console.error('Error fetching current tenant info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

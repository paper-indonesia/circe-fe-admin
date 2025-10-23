import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - Fetch tenant category templates from tenant settings
export async function GET(req: NextRequest) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get tenant ID from cookie or /users/me
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

    // Fallback: get tenant_id from /api/v1/users/me
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
        { error: 'Tenant ID not found' },
        { status: 400 }
      )
    }

    // Fetch tenant details to get service_category_templates from settings
    const tenantResponse = await fetch(`${FASTAPI_URL}/api/v1/tenants/${tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!tenantResponse.ok) {
      const errorData = await tenantResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch tenant' },
        { status: tenantResponse.status }
      )
    }

    const tenantData_response = await tenantResponse.json()

    // Return service_category_templates from tenant settings
    const categories = tenantData_response.settings?.service_category_templates || []

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching category templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

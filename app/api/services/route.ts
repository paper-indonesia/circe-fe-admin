import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - List all services
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

    if (searchParams.get('page')) params.append('page', searchParams.get('page')!)
    if (searchParams.get('size')) params.append('size', searchParams.get('size')!)
    if (searchParams.get('search')) params.append('search', searchParams.get('search')!)
    if (searchParams.get('category')) params.append('category', searchParams.get('category')!)
    if (searchParams.get('is_active')) params.append('is_active', searchParams.get('is_active')!)
    if (searchParams.get('include_staff')) params.append('include_staff', searchParams.get('include_staff')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/services${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch services' },
        { status: response.status }
      )
    }

    // Transform backend format to frontend format
    const transformService = (service: any) => ({
      ...service,
      id: service._id || service.id,
      durationMin: service.duration_minutes || service.durationMin || 60,
      assignedStaff: service.assigned_staff || service.assignedStaff || [],
      staffIds: service.staff_ids || [], // Staff IDs from include_staff=true
      staffCount: service.staff_count || 0, // Staff count from include_staff=true
      photo: service.image_url || service.photo || '',
      price: service.pricing?.base_price || service.price || 0,
      currency: service.pricing?.currency || 'IDR',
      isActive: service.is_active !== false && service.isActive !== false,
      status: service.status || 'active',
      // Keep full pricing object for pricing strategy
      pricing: service.pricing || {
        base_price: service.price || 0,
        currency: service.currency || 'IDR',
        outlet_prices: {},
        promotional_price: null,
        promotional_valid_until: null,
      },
    })

    // Handle different response formats
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map(transformService)
    } else if (Array.isArray(data)) {
      return NextResponse.json(data.map(transformService))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new service
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
    console.log('[Services API] Received body:', JSON.stringify(body, null, 2))

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

    // Generate slug from name if not provided
    const slug = body.slug || generateSlug(body.name)

    // Parse duration to ensure it's a number
    let durationMinutes = 60
    if (body.durationMin) {
      durationMinutes = typeof body.durationMin === 'number' ? body.durationMin : parseInt(String(body.durationMin)) || 60
    } else if (body.duration_minutes) {
      durationMinutes = typeof body.duration_minutes === 'number' ? body.duration_minutes : parseInt(String(body.duration_minutes)) || 60
    }
    // Validate duration is within limits (max 480 minutes = 8 hours)
    if (durationMinutes > 480) {
      durationMinutes = 480
    }
    if (durationMinutes < 1) {
      durationMinutes = 60
    }

    // Build backend payload for services API
    const backendPayload = {
      tenant_id: tenantId,
      name: body.name,
      slug: slug,
      description: body.description || '',
      category: body.category,
      duration_minutes: durationMinutes,
      preparation_minutes: parseInt(String(body.preparation_minutes || 0)) || 0,
      cleanup_minutes: parseInt(String(body.cleanup_minutes || 0)) || 0,
      max_advance_booking_days: parseInt(String(body.max_advance_booking_days || 30)) || 30,
      min_advance_booking_hours: parseInt(String(body.min_advance_booking_hours || 1)) || 1,
      requires_staff: body.requires_staff !== false,
      required_staff_count: parseInt(String(body.required_staff_count || 1)) || 1,
      allow_parallel_bookings: body.allow_parallel_bookings || false,
      max_parallel_bookings: parseInt(String(body.max_parallel_bookings || 1)) || 1,
      pricing: {
        base_price: parseFloat(String(body.price || body.pricing?.base_price || 0)) || 0,
        currency: body.currency || body.pricing?.currency || 'IDR',
        outlet_prices: body.pricing?.outlet_prices || {},
        promotional_price: body.pricing?.promotional_price ? parseFloat(String(body.pricing.promotional_price)) : undefined,
        promotional_valid_until: body.pricing?.promotional_valid_until || undefined,
      },
      tags: body.tags || [],
      image_url: body.photo || body.image_url || '',
      is_active: body.isActive !== false && body.is_active !== false,
      status: body.status || 'active',
    }

    console.log('Creating service with transformed payload:', backendPayload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create service:', data)

      // Format error message for user
      let errorMessage = 'Failed to create service'
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          const errors = data.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'unknown'
            return `${field}: ${err.msg}`
          })
          errorMessage = errors.join(', ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data.detail },
        { status: response.status }
      )
    }

    // Transform backend response back to frontend format
    const frontendData = {
      ...data,
      id: data._id || data.id,
      durationMin: data.duration_minutes || data.durationMin,
      assignedStaff: data.assigned_staff || data.assignedStaff || [],
      photo: data.image_url || data.photo || '',
      price: data.pricing?.base_price || data.price || 0,
      currency: data.pricing?.currency || 'IDR',
      isActive: data.is_active !== false,
      status: data.status || 'active',
      // Keep full pricing object
      pricing: data.pricing || {
        base_price: data.price || 0,
        currency: data.currency || 'IDR',
        outlet_prices: {},
        promotional_price: null,
        promotional_valid_until: null,
      },
    }

    return NextResponse.json(frontendData, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update service
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
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Transform frontend field names to backend field names
    const backendPayload: any = {}
    if (updateData.name !== undefined) backendPayload.name = updateData.name
    if (updateData.slug !== undefined) backendPayload.slug = updateData.slug
    if (updateData.description !== undefined) backendPayload.description = updateData.description
    if (updateData.category !== undefined) backendPayload.category = updateData.category

    // Parse duration with validation
    if (updateData.durationMin !== undefined || updateData.duration_minutes !== undefined) {
      let duration = updateData.durationMin || updateData.duration_minutes
      duration = typeof duration === 'number' ? duration : parseInt(String(duration)) || 60
      // Max 480 minutes (8 hours)
      if (duration > 480) duration = 480
      if (duration < 1) duration = 60
      backendPayload.duration_minutes = duration
    }

    if (updateData.preparation_minutes !== undefined) {
      backendPayload.preparation_minutes = parseInt(String(updateData.preparation_minutes)) || 0
    }
    if (updateData.cleanup_minutes !== undefined) {
      backendPayload.cleanup_minutes = parseInt(String(updateData.cleanup_minutes)) || 0
    }
    if (updateData.max_advance_booking_days !== undefined) {
      backendPayload.max_advance_booking_days = parseInt(String(updateData.max_advance_booking_days)) || 30
    }
    if (updateData.min_advance_booking_hours !== undefined) {
      backendPayload.min_advance_booking_hours = parseInt(String(updateData.min_advance_booking_hours)) || 1
    }
    if (updateData.requires_staff !== undefined) {
      backendPayload.requires_staff = updateData.requires_staff
    }
    if (updateData.required_staff_count !== undefined) {
      backendPayload.required_staff_count = parseInt(String(updateData.required_staff_count)) || 1
    }
    if (updateData.allow_parallel_bookings !== undefined) {
      backendPayload.allow_parallel_bookings = updateData.allow_parallel_bookings
    }
    if (updateData.max_parallel_bookings !== undefined) {
      backendPayload.max_parallel_bookings = parseInt(String(updateData.max_parallel_bookings)) || 1
    }
    if (updateData.tags !== undefined) {
      backendPayload.tags = updateData.tags
    }
    if (updateData.status !== undefined) {
      backendPayload.status = updateData.status
    }

    if (updateData.photo !== undefined || updateData.image_url !== undefined) {
      backendPayload.image_url = updateData.photo || updateData.image_url
    }
    if (updateData.assignedStaff !== undefined) backendPayload.assigned_staff = updateData.assignedStaff
    if (updateData.isActive !== undefined || updateData.is_active !== undefined) {
      backendPayload.is_active = updateData.isActive !== undefined ? updateData.isActive : updateData.is_active
    }

    // Handle pricing
    if (updateData.price !== undefined || updateData.currency !== undefined || updateData.pricing !== undefined) {
      backendPayload.pricing = {
        base_price: updateData.price !== undefined
          ? parseFloat(String(updateData.price)) || 0
          : updateData.pricing?.base_price !== undefined
            ? parseFloat(String(updateData.pricing.base_price)) || 0
            : 0,
        currency: updateData.currency || updateData.pricing?.currency || 'IDR',
        outlet_prices: updateData.pricing?.outlet_prices || {},
        promotional_price: updateData.pricing?.promotional_price ? parseFloat(String(updateData.pricing.promotional_price)) : undefined,
        promotional_valid_until: updateData.pricing?.promotional_valid_until || undefined,
      }
    }

    console.log(`Updating service ${id} with payload:`, backendPayload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/services/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to update service:', data)

      let errorMessage = 'Failed to update service'
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          const errors = data.detail.map((err: any) => {
            const field = err.loc ? err.loc.join('.') : 'unknown'
            return `${field}: ${err.msg}`
          })
          errorMessage = errors.join(', ')
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail
        }
      }

      return NextResponse.json(
        { error: errorMessage, details: data.detail },
        { status: response.status }
      )
    }

    // Transform backend response back to frontend format
    const frontendData = {
      ...data,
      id: data._id || data.id,
      durationMin: data.duration_minutes || data.durationMin,
      assignedStaff: data.assigned_staff || data.assignedStaff || [],
      photo: data.image_url || data.photo || '',
      price: data.pricing?.base_price || data.price || 0,
      currency: data.pricing?.currency || 'IDR',
      isActive: data.is_active !== false,
      status: data.status || 'active',
      // Keep full pricing object
      pricing: data.pricing || {
        base_price: data.price || 0,
        currency: data.currency || 'IDR',
        outlet_prices: {},
        promotional_price: null,
        promotional_valid_until: null,
      },
    }

    return NextResponse.json(frontendData)
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete service
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
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    console.log(`Deleting service ${id}`)

    const response = await fetch(`${FASTAPI_URL}/api/v1/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to delete service:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to delete service' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

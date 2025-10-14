import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://circe-fastapi-backend-740443181568.europe-west1.run.app'

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET /api/staff/[id] - Get single staff member
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

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff/${params.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Failed to fetch staff member' },
        { status: response.status }
      )
    }

    // Transform backend format to frontend format
    const transformedData = {
      ...data,
      id: data._id || data.id,
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: data.role || data.position,
      avatar: data.avatar || data.profile_image_url,
      isActive: data.isActive !== undefined ? data.isActive : data.is_active !== false,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/staff/[id] - Update staff member
export async function PUT(
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

    const updateData = await req.json()

    // Transform frontend format to backend format
    const backendPayload: any = {}

    // Handle name fields
    if (updateData.first_name !== undefined) {
      backendPayload.first_name = updateData.first_name
    }
    if (updateData.last_name !== undefined) {
      backendPayload.last_name = updateData.last_name
    }
    if (updateData.name && !updateData.first_name) {
      const nameParts = updateData.name.trim().split(' ')
      backendPayload.first_name = nameParts[0] || ''
      backendPayload.last_name = nameParts.slice(1).join(' ') || backendPayload.first_name
    }

    // Map other fields
    if (updateData.display_name !== undefined || updateData.displayName !== undefined) {
      backendPayload.display_name = updateData.display_name || updateData.displayName
    }
    if (updateData.email !== undefined) {
      backendPayload.email = updateData.email
    }
    if (updateData.phone !== undefined) {
      backendPayload.phone = updateData.phone.trim ? updateData.phone.trim() : updateData.phone
    }
    if (updateData.position !== undefined || updateData.role !== undefined) {
      backendPayload.position = updateData.position || updateData.role
    }
    if (updateData.employment_type !== undefined || updateData.employmentType !== undefined) {
      backendPayload.employment_type = updateData.employment_type || updateData.employmentType
    }
    if (updateData.outlet_id !== undefined || updateData.outletId !== undefined) {
      backendPayload.outlet_id = updateData.outlet_id || updateData.outletId
    }
    if (updateData.status !== undefined) {
      backendPayload.status = updateData.status
    }
    if (updateData.is_active !== undefined || updateData.isActive !== undefined) {
      backendPayload.is_active = updateData.is_active !== undefined ? updateData.is_active : updateData.isActive
    }

    console.log(`Updating staff member ${params.id} with payload:`, backendPayload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to update staff member:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to update staff member' },
        { status: response.status }
      )
    }

    // Transform response
    const transformedData = {
      ...data,
      id: data._id || data.id,
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: data.role || data.position,
      avatar: data.avatar || data.profile_image_url,
      isActive: data.isActive !== undefined ? data.isActive : data.is_active !== false,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error updating staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/staff/[id] - Delete staff member (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = getAuthToken(req)

    if (!authToken) {
      console.error('DELETE: No auth token found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const staffId = params.id
    console.log(`[DELETE] Attempting to delete staff member: ${staffId}`)
    console.log(`[DELETE] FastAPI URL: ${FASTAPI_URL}/api/v1/staff/${staffId}`)

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`[DELETE] Response status: ${response.status} ${response.statusText}`)

    // FastAPI returns 204 No Content on successful delete
    if (response.status === 204) {
      console.log('[DELETE] Success - 204 No Content received')
      return new NextResponse(null, { status: 204 })
    }

    // If not 204, try to parse JSON response
    let data: any = {}
    try {
      data = await response.json()
      console.log('[DELETE] Response data:', JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error('[DELETE] Failed to parse response JSON:', parseError)
    }

    if (!response.ok) {
      console.error('[DELETE] Failed to delete staff member. Status:', response.status)
      console.error('[DELETE] Error data:', data)

      // Handle error messages in Indonesian
      let errorMessage = 'Gagal menghapus staff member'
      if (data.detail) {
        if (typeof data.detail === 'string') {
          console.log('[DELETE] Error detail:', data.detail)
          // Check for specific error cases
          if (data.detail.includes('appointment') || data.detail.includes('booking')) {
            errorMessage = 'Tidak dapat menghapus staff yang memiliki janji temu (appointment) yang akan datang'
          } else {
            errorMessage = data.detail
          }
        } else if (Array.isArray(data.detail)) {
          console.log('[DELETE] Validation errors:', data.detail)
          errorMessage = JSON.stringify(data.detail)
        }
      }

      return NextResponse.json(
        { error: errorMessage, detail: data.detail, status: response.status },
        { status: response.status }
      )
    }

    console.log('[DELETE] Success - Returning data')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[DELETE] Exception occurred:', error)
    console.error('[DELETE] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// GET - List all staff members
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
    if (searchParams.get('role')) params.append('role', searchParams.get('role')!)
    if (searchParams.get('is_active')) params.append('is_active', searchParams.get('is_active')!)
    if (searchParams.get('outlet_id')) params.append('outlet_id', searchParams.get('outlet_id')!)

    const queryString = params.toString()
    const url = `${FASTAPI_URL}/api/v1/staff${queryString ? '?' + queryString : ''}`

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
        { error: data.detail || 'Failed to fetch staff members' },
        { status: response.status }
      )
    }

    // Transform backend format to frontend format
    // Pass through all fields for context.tsx to handle with backward compatibility
    const transformStaff = (staff: any) => ({
      ...staff,
      id: staff._id || staff.id,
      // Add computed fields for backward compatibility
      name: staff.name || `${staff.first_name || ''} ${staff.last_name || ''}`.trim(),
      role: staff.role || staff.position || 'Staff',
      avatar: staff.avatar || staff.profile_image_url,
      isActive: staff.isActive !== undefined ? staff.isActive : staff.is_active !== false,
    })

    // Map _id to id for all staff in the response
    if (data.items && Array.isArray(data.items)) {
      data.items = data.items.map(transformStaff)
    } else if (Array.isArray(data)) {
      // Handle case where API returns array directly
      return NextResponse.json(data.map(transformStaff))
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching staff members:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new staff member
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
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.phone || body.phone.trim().length < 10) {
      return NextResponse.json(
        { error: 'Nomor telepon wajib diisi dengan minimal 10 karakter (contoh: +6281xxxxxxxxx atau 081xxxxxxxxx)' },
        { status: 400 }
      )
    }

    // Handle both old (name) and new (first_name/last_name) field formats
    const hasName = body.name && body.name.trim().length > 0
    const hasFirstName = body.first_name && body.first_name.trim().length > 0

    if (!hasName && !hasFirstName) {
      return NextResponse.json(
        { error: 'Nama lengkap wajib diisi' },
        { status: 400 }
      )
    }

    if (!body.position && !body.role) {
      return NextResponse.json(
        { error: 'Posisi wajib diisi' },
        { status: 400 }
      )
    }

    // Transform frontend format to backend format
    // Handle name splitting - support both old (name) and new (first_name/last_name) formats
    let firstName = body.first_name || ''
    let lastName = body.last_name || ''

    if (!firstName && body.name) {
      const nameParts = body.name.trim().split(' ')
      firstName = nameParts[0] || ''
      lastName = nameParts.slice(1).join(' ') || firstName
    }

    // Build skills structure for API - support both object and array formats
    let skillsPayload: any = null
    if (body.skills) {
      if (typeof body.skills === 'object' && !Array.isArray(body.skills)) {
        // Already in object format
        skillsPayload = body.skills
      } else if (Array.isArray(body.skills)) {
        // Convert array to object format
        skillsPayload = {
          service_ids: body.serviceIds || body.service_ids || [],
          specialties: body.skills,
          certifications: body.certifications || [],
          years_experience: body.yearsExperience || body.years_experience || 0,
        }
      }
    }

    // Build backend payload with all new fields
    const backendPayload: any = {
      tenant_id: tenantId,
      first_name: firstName,
      last_name: lastName,
      email: body.email,
      phone: body.phone.trim(),
      position: body.position || body.role || 'Staff',
      employment_type: body.employment_type || body.employmentType || 'full_time',
      outlet_id: body.outlet_id || body.outletId,
    }

    // Add optional fields if provided
    if (body.display_name || body.displayName) {
      backendPayload.display_name = body.display_name || body.displayName
    }
    if (body.employee_id || body.employeeId) {
      backendPayload.employee_id = body.employee_id || body.employeeId
    }
    if (body.hire_date || body.hireDate) {
      backendPayload.hire_date = body.hire_date || body.hireDate
    } else {
      backendPayload.hire_date = new Date().toISOString().split('T')[0]
    }
    if (body.birth_date || body.birthDate) {
      backendPayload.birth_date = body.birth_date || body.birthDate
    }
    if (body.hourly_rate !== undefined || body.hourlyRate !== undefined) {
      backendPayload.hourly_rate = body.hourly_rate || body.hourlyRate
    }
    if (body.salary !== undefined) {
      backendPayload.salary = body.salary
    }
    if (body.bio) {
      backendPayload.bio = body.bio
    }
    if (body.profile_image_url || body.profileImageUrl || body.avatar) {
      backendPayload.profile_image_url = body.profile_image_url || body.profileImageUrl || body.avatar
    }
    if (body.instagram_handle || body.instagramHandle) {
      backendPayload.instagram_handle = body.instagram_handle || body.instagramHandle
    }
    if (skillsPayload) {
      backendPayload.skills = skillsPayload
    }

    // Booking settings
    if (body.is_bookable !== undefined || body.isBookable !== undefined) {
      backendPayload.is_bookable = body.is_bookable !== undefined ? body.is_bookable : body.isBookable
    }
    if (body.accepts_online_booking !== undefined || body.acceptsOnlineBooking !== undefined) {
      backendPayload.accepts_online_booking = body.accepts_online_booking !== undefined
        ? body.accepts_online_booking
        : body.acceptsOnlineBooking
    }
    if (body.max_advance_booking_days !== undefined || body.maxAdvanceBookingDays !== undefined) {
      backendPayload.max_advance_booking_days = body.max_advance_booking_days || body.maxAdvanceBookingDays
    }

    // Status
    if (body.status) {
      backendPayload.status = body.status
    }
    if (body.is_active !== undefined || body.isActive !== undefined) {
      backendPayload.is_active = body.is_active !== undefined ? body.is_active : body.isActive
    }

    // Commission (maintain backward compatibility)
    if (body.commissionRate || body.commission_rate || body.commission) {
      backendPayload.commission = typeof body.commission === 'object'
        ? body.commission
        : {
            base_commission_rate: body.commissionRate || body.commission_rate || 0.15,
          }
    }

    console.log('Creating staff member with transformed payload:', backendPayload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload)
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to create staff member:', data)

      // Format error message for user in Indonesian
      let errorMessage = 'Gagal membuat staff member'
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          // Validation errors - translate to Indonesian
          const errors = data.detail.map((err: any) => {
            const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown'
            let fieldName = field

            // Translate field names to Indonesian
            const fieldTranslations: Record<string, string> = {
              'phone': 'Nomor Telepon',
              'email': 'Email',
              'first_name': 'Nama Depan',
              'last_name': 'Nama Belakang',
              'display_name': 'Nama Tampilan',
              'position': 'Posisi',
              'employment_type': 'Jenis Pekerjaan',
              'employee_id': 'ID Karyawan',
              'outlet_id': 'Outlet',
              'tenant_id': 'Tenant',
              'hire_date': 'Tanggal Mulai Kerja',
              'birth_date': 'Tanggal Lahir',
              'hourly_rate': 'Tarif Per Jam',
              'salary': 'Gaji',
              'bio': 'Bio',
              'profile_image_url': 'Foto Profil',
              'instagram_handle': 'Instagram',
              'commission': 'Komisi',
              'skills': 'Keahlian',
              'status': 'Status',
              'is_active': 'Status Aktif',
              'is_bookable': 'Dapat Dibooking',
              'accepts_online_booking': 'Terima Booking Online',
              'max_advance_booking_days': 'Maks Hari Booking Advance',
            }
            fieldName = fieldTranslations[field] || field

            let errorMsg = err.msg
            // Translate common error messages
            if (errorMsg.includes('String should have at least')) {
              const match = errorMsg.match(/at least (\d+)/)
              const minLength = match ? match[1] : '10'
              errorMsg = `harus memiliki minimal ${minLength} karakter`
            } else if (errorMsg.includes('Field required')) {
              errorMsg = 'wajib diisi'
            } else if (errorMsg.includes('Input should be a valid')) {
              errorMsg = 'format tidak valid'
            }

            return `${fieldName} ${errorMsg}`
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

    // Map _id to id for frontend compatibility
    if (data._id) {
      data.id = data._id
    }

    // Transform backend response back to frontend format
    const frontendData = {
      ...data,
      id: data._id || data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: data.position || data.role,
    }

    return NextResponse.json(frontendData, { status: 201 })
  } catch (error) {
    console.error('Error creating staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update staff member
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
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }

    // Transform frontend format to backend format for update
    const backendPayload: any = {}

    // Handle name fields - support both old (name) and new (first_name/last_name) formats
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

    // Map frontend fields to backend fields
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
    if (updateData.employee_id !== undefined || updateData.employeeId !== undefined) {
      backendPayload.employee_id = updateData.employee_id || updateData.employeeId
    }
    if (updateData.hire_date !== undefined || updateData.hireDate !== undefined) {
      backendPayload.hire_date = updateData.hire_date || updateData.hireDate
    }
    if (updateData.birth_date !== undefined || updateData.birthDate !== undefined) {
      backendPayload.birth_date = updateData.birth_date || updateData.birthDate
    }
    if (updateData.hourly_rate !== undefined || updateData.hourlyRate !== undefined) {
      backendPayload.hourly_rate = updateData.hourly_rate || updateData.hourlyRate
    }
    if (updateData.salary !== undefined) {
      backendPayload.salary = updateData.salary
    }
    if (updateData.bio !== undefined) {
      backendPayload.bio = updateData.bio
    }
    if (updateData.profile_image_url !== undefined || updateData.profileImageUrl !== undefined || updateData.avatar !== undefined) {
      backendPayload.profile_image_url = updateData.profile_image_url || updateData.profileImageUrl || updateData.avatar
    }
    if (updateData.instagram_handle !== undefined || updateData.instagramHandle !== undefined) {
      backendPayload.instagram_handle = updateData.instagram_handle || updateData.instagramHandle
    }

    // Skills transformation
    if (updateData.skills !== undefined) {
      if (typeof updateData.skills === 'object' && !Array.isArray(updateData.skills)) {
        backendPayload.skills = updateData.skills
      } else if (Array.isArray(updateData.skills)) {
        backendPayload.skills = {
          service_ids: updateData.serviceIds || updateData.service_ids || [],
          specialties: updateData.skills,
          certifications: updateData.certifications || [],
          years_experience: updateData.yearsExperience || updateData.years_experience || 0,
        }
      }
    }

    // Booking settings
    if (updateData.is_bookable !== undefined || updateData.isBookable !== undefined) {
      backendPayload.is_bookable = updateData.is_bookable !== undefined ? updateData.is_bookable : updateData.isBookable
    }
    if (updateData.accepts_online_booking !== undefined || updateData.acceptsOnlineBooking !== undefined) {
      backendPayload.accepts_online_booking = updateData.accepts_online_booking !== undefined
        ? updateData.accepts_online_booking
        : updateData.acceptsOnlineBooking
    }
    if (updateData.max_advance_booking_days !== undefined || updateData.maxAdvanceBookingDays !== undefined) {
      backendPayload.max_advance_booking_days = updateData.max_advance_booking_days || updateData.maxAdvanceBookingDays
    }

    // Status
    if (updateData.status !== undefined) {
      backendPayload.status = updateData.status
    }
    if (updateData.is_active !== undefined || updateData.isActive !== undefined) {
      backendPayload.is_active = updateData.is_active !== undefined ? updateData.is_active : updateData.isActive
    }

    // Commission
    if (updateData.commission !== undefined || updateData.commissionRate !== undefined || updateData.commission_rate !== undefined) {
      backendPayload.commission = typeof updateData.commission === 'object'
        ? updateData.commission
        : {
            base_commission_rate: updateData.commissionRate || updateData.commission_rate || 0.15,
          }
    }

    // Outlet
    if (updateData.outlet_id !== undefined || updateData.outletId !== undefined) {
      backendPayload.outlet_id = updateData.outlet_id || updateData.outletId
    }

    console.log(`Updating staff member ${id} with transformed payload:`, backendPayload)

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff/${id}`, {
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

      // Format error message for user in Indonesian (same as POST)
      let errorMessage = 'Gagal mengupdate staff member'
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

    // Transform backend response back to frontend format
    const frontendData = {
      ...data,
      id: data._id || data.id,
      name: data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      role: data.role || data.position,
      avatar: data.avatar || data.profile_image_url,
      isActive: data.isActive !== undefined ? data.isActive : data.is_active !== false,
    }

    return NextResponse.json(frontendData)
  } catch (error) {
    console.error('Error updating staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete staff member
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
        { error: 'Staff ID is required' },
        { status: 400 }
      )
    }

    console.log(`Deleting staff member ${id}`)

    const response = await fetch(`${FASTAPI_URL}/api/v1/staff/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Failed to delete staff member:', data)
      return NextResponse.json(
        { error: data.detail || 'Failed to delete staff member' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting staff member:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

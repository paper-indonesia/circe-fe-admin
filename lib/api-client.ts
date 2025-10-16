// API Client for MongoDB Integration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export class ApiError extends Error {
  details?: string
  statusCode?: number
  userFriendlyMessage?: string

  constructor(message: string, details?: string, statusCode?: number, userFriendlyMessage?: string) {
    super(message)
    this.name = 'ApiError'
    this.details = details
    this.statusCode = statusCode
    this.userFriendlyMessage = userFriendlyMessage
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Remove /api prefix if already present
    const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Handle different error formats
      let errorMessage = `API Error: ${response.statusText}`
      let errorDetails: string | undefined = undefined
      let userFriendlyMessage: string | undefined = undefined

      if (errorData.error) {
        errorMessage = typeof errorData.error === 'string'
          ? errorData.error
          : JSON.stringify(errorData.error)
      }

      if (errorData.details) {
        errorDetails = typeof errorData.details === 'string'
          ? errorData.details
          : JSON.stringify(errorData.details, null, 2)
      }

      // Handle FastAPI validation errors
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail
        } else if (Array.isArray(errorData.detail)) {
          // Format validation errors in user-friendly way
          errorMessage = "Validation Error"
          const fieldErrors: string[] = []

          errorData.detail.forEach((err: any) => {
            const fieldName = err.loc?.[err.loc.length - 1] || 'field'

            // Map field names to Indonesian
            const fieldTranslations: Record<string, string> = {
              'employment_type': 'Jenis Pekerjaan',
              'email': 'Email',
              'phone': 'Nomor Telepon',
              'name': 'Nama',
              'first_name': 'Nama Depan',
              'last_name': 'Nama Belakang',
              'position': 'Posisi',
              'outlet_id': 'Outlet',
              'birth_date': 'Tanggal Lahir',
              'hire_date': 'Tanggal Masuk',
            }

            const friendlyField = fieldTranslations[fieldName] ||
              fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

            // Translate common error messages to Indonesian
            let friendlyMsg = err.msg
            if (err.msg.includes("Input should be")) {
              const expected = err.ctx?.expected || ''
              friendlyMsg = `Harus berupa salah satu dari: ${expected}`
            } else if (err.msg.includes("field required")) {
              friendlyMsg = "Wajib diisi"
            } else if (err.msg.includes("invalid")) {
              friendlyMsg = "Format tidak valid"
            }

            fieldErrors.push(`${friendlyField}: ${friendlyMsg}`)
          })

          errorDetails = fieldErrors.join('\n')
          userFriendlyMessage = fieldErrors.length === 1
            ? fieldErrors[0]
            : `Terdapat ${fieldErrors.length} kesalahan pada form:\n${fieldErrors.join('\n')}`
        } else if (typeof errorData.detail === 'object') {
          errorMessage = errorData.detail.error || errorMessage
          errorDetails = errorData.detail.details || JSON.stringify(errorData.detail, null, 2)
        }
      }

      // Create user-friendly message for common errors
      if (!userFriendlyMessage) {
        if (errorMessage.toLowerCase().includes('staff limit reached')) {
          userFriendlyMessage = 'Anda telah mencapai batas maksimal staff untuk outlet ini. Silakan upgrade paket langganan Anda untuk menambah lebih banyak staff.'
        } else if (errorMessage.toLowerCase().includes('unauthorized')) {
          userFriendlyMessage = 'Sesi Anda telah berakhir. Silakan login kembali.'
        } else if (errorMessage.toLowerCase().includes('not found')) {
          userFriendlyMessage = 'Data tidak ditemukan.'
        } else {
          userFriendlyMessage = errorMessage
        }
      }

      throw new ApiError(errorMessage, errorDetails, response.status, userFriendlyMessage)
    }

    // Handle 204 No Content responses (e.g., successful DELETE operations)
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Generic method for any endpoint
  async call<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, options)
  }

  // Staff endpoints
  async getStaff() {
    return this.request<any[]>('/staff')
  }

  async createStaff(data: any) {
    return this.request<any>('/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateStaff(id: string, data: any) {
    return this.request<any>('/staff', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteStaff(id: string) {
    return this.request<any>(`/staff/${id}`, {
      method: 'DELETE',
    })
  }

  // Service endpoints (formerly treatments/products)
  async getTreatments(includeStaff: boolean = true) {
    const query = includeStaff ? '?include_staff=true' : ''
    return this.request<any[]>(`/services${query}`)
  }

  async createTreatment(data: any) {
    return this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTreatment(id: string, data: any) {
    return this.request<any>('/services', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    })
  }

  async deleteTreatment(id: string) {
    return this.request<any>(`/services?id=${id}`, {
      method: 'DELETE',
    })
  }

  // Booking endpoints
  async getBookings(source?: 'walk-in' | 'online') {
    const query = source ? `?source=${source}` : ''
    return this.request<any[]>(`/bookings${query}`)
  }

  async createBooking(data: any) {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBooking(id: string, updates: any) {
    return this.request<any>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteBooking(id: string) {
    return this.request<any>(`/bookings/${id}`, {
      method: 'DELETE',
    })
  }

  async getWalkInBookings() {
    return this.getBookings('walk-in')
  }

  // Outlet endpoints
  async getOutlets() {
    return this.request<any[]>('/outlets')
  }

  // Availability endpoints
  async getAvailability(params?: {
    start_date?: string
    end_date?: string
    staff_id?: string
    availability_type?: 'working_hours' | 'break' | 'blocked' | 'vacation'
    outlet_id?: string
    page?: number
    size?: number
  }) {
    const query = new URLSearchParams()
    if (params?.start_date) query.append('start_date', params.start_date)
    if (params?.end_date) query.append('end_date', params.end_date)
    if (params?.staff_id) query.append('staff_id', params.staff_id)
    if (params?.availability_type) query.append('availability_type', params.availability_type)
    if (params?.outlet_id) query.append('outlet_id', params.outlet_id)
    if (params?.page) query.append('page', params.page.toString())
    if (params?.size) query.append('size', params.size.toString())

    const queryString = query.toString()
    return this.request<any>(`/api/availability${queryString ? `?${queryString}` : ''}`)
  }

  async createAvailability(data: any) {
    return this.request<any>('/api/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async checkAvailability(params: {
    staff_id: string
    date: string
    start_time: string
    end_time: string
    service_id?: string
  }) {
    const query = new URLSearchParams()
    query.append('staff_id', params.staff_id)
    query.append('date', params.date)
    query.append('start_time', params.start_time)
    query.append('end_time', params.end_time)
    if (params.service_id) query.append('service_id', params.service_id)

    return this.request<any>(`/api/availability/check?${query.toString()}`)
  }

  async getAvailabilityById(id: string) {
    return this.request<any>(`/api/availability/${id}`)
  }

  async updateAvailability(id: string, data: any) {
    return this.request<any>(`/api/availability/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAvailability(id: string) {
    return this.request<any>(`/api/availability/${id}`, {
      method: 'DELETE',
    })
  }

  async createBulkAvailability(data: any) {
    return this.request<any>('/api/availability/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getStaffSchedule(staffId: string, params: {
    start_date: string
    end_date: string
    include_breaks?: boolean
  }) {
    const query = new URLSearchParams()
    query.append('start_date', params.start_date)
    query.append('end_date', params.end_date)
    if (params.include_breaks !== undefined) {
      query.append('include_breaks', params.include_breaks.toString())
    }

    return this.request<any[]>(`/api/availability/staff/${staffId}?${query.toString()}`)
  }
}

export const apiClient = new ApiClient()
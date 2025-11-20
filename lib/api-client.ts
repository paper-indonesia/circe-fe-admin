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

    // Handle 401 Unauthorized - Auto logout and redirect
    if (response.status === 401) {
      this.handleUnauthorized()
      throw new ApiError(
        'Session expired',
        'Your session has expired. Please log in again.',
        401,
        'Sesi Anda telah berakhir. Silakan login kembali.'
      )
    }

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

  /**
   * Handle 401 Unauthorized error
   * - Clear auth data
   * - Redirect to login
   */
  private handleUnauthorized(): void {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('tenant')
      localStorage.removeItem('operational-onboarding-progress')

      // Store current path for redirect after login
      const currentPath = window.location.pathname
      if (currentPath !== '/signin' && currentPath !== '/signup') {
        sessionStorage.setItem('redirectAfterLogin', currentPath)
      }

      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/signin'
      }, 1500)
    }
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

  // Appointment endpoints (formerly bookings)
  async getAppointments(params?: {
    page?: number
    size?: number
    date_from?: string
    date_to?: string
    status?: string
    appointment_type?: 'walk_in' | 'scheduled' | 'online'
    payment_status?: string
    customer_id?: string
    staff_id?: string
    outlet_id?: string
    service_id?: string
    sort_by?: string
    sort_direction?: 'asc' | 'desc'
  }) {
    const query = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value.toString())
        }
      })
    }
    const queryString = query.toString()
    return this.request<any>(`/appointments${queryString ? `?${queryString}` : ''}`)
  }

  async getAppointmentById(id: string) {
    return this.request<any>(`/appointments/${id}`)
  }

  async createAppointment(data: any) {
    return this.request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAppointment(id: string, updates: any) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteAppointment(id: string, cancellationReason?: string) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'DELETE',
      body: cancellationReason ? JSON.stringify({ cancellation_reason: cancellationReason }) : undefined,
    })
  }

  async rescheduleAppointment(id: string, data: { new_date: string; new_time: string; reason?: string }) {
    return this.request<any>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async completeAppointment(id: string, completionNotes?: string) {
    return this.request<any>(`/appointments/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ completion_notes: completionNotes || undefined }),
    })
  }

  async markNoShow(id: string, reason?: string) {
    return this.request<any>(`/appointments/${id}/no-show`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || undefined }),
    })
  }

  // Legacy aliases for backwards compatibility
  async getBookings(source?: 'walk-in' | 'online') {
    return this.getAppointments({
      appointment_type: source,
      size: 100 // Get more items for compatibility
    })
  }

  async createBooking(data: any) {
    return this.createAppointment(data)
  }

  async updateBooking(id: string, updates: any) {
    return this.updateAppointment(id, updates)
  }

  async deleteBooking(id: string, cancellationReason?: string) {
    return this.deleteAppointment(id, cancellationReason)
  }

  async rescheduleBooking(id: string, data: { new_date: string; new_time: string; reason?: string }) {
    return this.rescheduleAppointment(id, data)
  }

  async completeBooking(id: string, completionNotes?: string) {
    return this.completeAppointment(id, completionNotes)
  }

  async markNoShowBooking(id: string, reason?: string) {
    return this.markNoShow(id, reason)
  }

  async getWalkInBookings() {
    return this.getAppointments({ appointment_type: 'walk_in', size: 100 })
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

  async bulkDeleteAvailability(ids: string[]) {
    return this.request<any>('/api/availability/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
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
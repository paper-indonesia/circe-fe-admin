// API Client for MongoDB Integration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export interface ApiResponse<T> {
  data?: T
  error?: string
}

class ApiClient {
  private tenantId: string = ''

  setTenant(tenantId: string) {
    this.tenantId = tenantId
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `/api/${this.tenantId}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Patient endpoints
  async getPatients() {
    return this.request<any[]>('/patients')
  }

  async createPatient(data: any) {
    return this.request<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    })
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

  // Treatment endpoints
  async getTreatments() {
    return this.request<any[]>('/treatments')
  }

  async createTreatment(data: any) {
    return this.request<any>('/treatments', {
      method: 'POST',
      body: JSON.stringify(data),
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
}

export const apiClient = new ApiClient()
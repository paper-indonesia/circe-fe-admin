import { NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customers } = body

    if (!customers || !Array.isArray(customers)) {
      return NextResponse.json(
        { detail: 'Invalid request: customers array is required' },
        { status: 400 }
      )
    }

    if (customers.length === 0) {
      return NextResponse.json(
        { detail: 'No customers to import' },
        { status: 400 }
      )
    }

    if (customers.length > 1000) {
      return NextResponse.json(
        { detail: 'Maximum 1000 customers per import' },
        { status: 400 }
      )
    }

    // Import customers one by one (or implement bulk endpoint in backend)
    let imported = 0
    let failed = 0
    const errors: string[] = []

    for (const customer of customers) {
      try {
        await apiClient.post('/customers', customer)
        imported++
      } catch (error: any) {
        failed++
        errors.push(`${customer.first_name} ${customer.last_name}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      imported_count: imported,
      failed_count: failed,
      errors: errors.slice(0, 10) // Return first 10 errors only
    })
  } catch (error: any) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { detail: error.message || 'Failed to import customers' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

// Get auth token from cookies
function getAuthToken(req: NextRequest) {
  return req.cookies.get('auth-token')?.value
}

// POST - Bulk delete availability entries
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
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs array is required and must not be empty' },
        { status: 400 }
      )
    }

    console.log(`Bulk deleting ${ids.length} availability entries:`, ids)

    // Delete entries in parallel for better performance
    const deletePromises = ids.map(async (id) => {
      try {
        const response = await fetch(`${FASTAPI_URL}/api/v1/availability/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          return {
            id,
            success: false,
            error: errorData.detail || 'Failed to delete'
          }
        }

        return { id, success: true }
      } catch (error) {
        console.error(`Error deleting availability ${id}:`, error)
        return {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    const results = await Promise.all(deletePromises)

    const successCount = results.filter(r => r.success).length
    const failedCount = results.filter(r => !r.success).length
    const failed = results.filter(r => !r.success)

    console.log(`Bulk delete completed: ${successCount} succeeded, ${failedCount} failed`)

    return NextResponse.json({
      message: `Successfully deleted ${successCount} out of ${ids.length} entries`,
      total: ids.length,
      succeeded: successCount,
      failed: failedCount,
      failedEntries: failed,
      results
    })
  } catch (error) {
    console.error('Error in bulk delete:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

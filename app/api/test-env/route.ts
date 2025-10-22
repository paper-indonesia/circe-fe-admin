import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      FASTAPI_URL: {
        exists: !!process.env.NEXT_PUBLIC_FASTAPI_URL,
        value: process.env.NEXT_PUBLIC_FASTAPI_URL || 'NOT SET'
      },
      usingDummyData: true,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(envCheck, { status: 200 })
  } catch (error: any) {
    console.error('Test environment check error:', error)
    return NextResponse.json(
      {
        error: 'Failed to check environment',
        details: error.message
      },
      { status: 500 }
    )
  }
}

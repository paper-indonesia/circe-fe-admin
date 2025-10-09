import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json()

    // For now, just return success without creating user
    // Will use FastAPI for real auth
    return NextResponse.json({
      success: true,
      message: 'Signup successful. Please sign in.'
    }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

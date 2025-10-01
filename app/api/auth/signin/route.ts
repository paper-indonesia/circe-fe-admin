import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword, createToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Log environment variable status
    console.log('🔍 Environment Check:', {
      NODE_ENV: process.env.NODE_ENV,
      MONGO_URI_exists: !!process.env.MONGO_URI,
      MONGO_URI_length: process.env.MONGO_URI?.length,
      MONGO_URI_masked: process.env.MONGO_URI ?
        process.env.MONGO_URI.replace(/mongodb(\+srv)?:\/\/[^@]+@/, 'mongodb$1://***:***@') :
        'NOT SET',
      JWT_SECRET_exists: !!process.env.JWT_SECRET
    })

    const { email, password } = await req.json()

    console.log('Sign in attempt for:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Find user by email
    const user = await User.findByEmail(email)

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('Verifying password for user:', user.email)
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      console.log('Password verification failed')
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('Password verified successfully')

    // Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
    })

    // Set cookie on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
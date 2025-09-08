import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/models/User'
import { verifyPassword, createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    console.log('Admin login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Find admin user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    })
    
    if (!user) {
      console.log('Admin user not found for email:', email)
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Check if user is platform admin
    if (user.role !== 'platform_admin') {
      console.log('User is not platform admin:', user.role)
      return NextResponse.json(
        { error: 'Access denied. Platform admin only.' },
        { status: 403 }
      )
    }

    // Verify password
    console.log('Verifying password for admin:', user.email)
    const isValid = await verifyPassword(password, user.password)
    
    if (!isValid) {
      console.log('Password verification failed for admin')
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }
    
    console.log('Admin password verified successfully')

    // Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      tenantId: user.tenantId || 'admin',
      role: user.role,
      name: user.name,
    })

    // Set cookie
    const cookieStore = cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: true,
      },
    })
  } catch (error) {
    console.error('Admin sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
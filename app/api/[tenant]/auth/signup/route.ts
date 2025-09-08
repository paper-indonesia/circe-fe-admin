import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/models/User'
import Tenant from '@/models/Tenant'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Get tenant information
    const tenantDoc = await Tenant.findOne({ slug: params.tenant })
    if (!tenantDoc) {
      return NextResponse.json(
        { error: 'Invalid tenant' },
        { status: 404 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase(), 
      tenantId: tenantDoc._id.toString(),
      isActive: true 
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered for this tenant' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      tenantId: tenantDoc._id.toString(),
      role: 'user', // Default role for new users
      isActive: true,
    })

    await user.save()

    // Create JWT token
    const token = createToken({
      userId: user._id.toString(),
      email: user.email,
      tenantId: tenantDoc._id.toString(),
      role: user.role,
      name: user.name,
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenantDoc._id.toString(),
        tenantName: tenantDoc.name,
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
    console.error('Sign up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

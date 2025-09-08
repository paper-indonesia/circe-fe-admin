import { NextRequest, NextResponse } from 'next/server'
import { connectMongoDB } from '@/lib/mongodb'
import User from '@/models/User'
import Tenant from '@/models/Tenant'
import { verifyPassword, createToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(
  req: NextRequest,
  { params }: { params: { tenant: string } }
) {
  try {
    const { email, password } = await req.json()
    
    console.log('Sign in attempt for:', email, 'in tenant:', params.tenant)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    await connectMongoDB()

    // Get tenant information
    const tenantDoc = await Tenant.findBySlug(params.tenant)
    
    // If tenant not found in DB, try to find user by email first
    let user
    let tenantId
    
    if (tenantDoc) {
      tenantId = tenantDoc._id.toString()
      user = await User.findByEmailAndTenant(email, tenantId)
    } else {
      // Fallback: find user by email only and get their tenant
      user = await User.findOne({ email: email.toLowerCase(), isActive: true })
      if (user) {
        tenantId = user.tenantId
      }
    }
    
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
      tenantId: tenantId || user.tenantId,
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

    // Get tenant name
    const tenantName = tenantDoc?.name || params.tenant.charAt(0).toUpperCase() + params.tenant.slice(1)

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenantId || user.tenantId,
        tenantName: tenantName,
        tenantSlug: params.tenant,
      },
    })
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
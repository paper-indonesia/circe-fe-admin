import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL 

export async function POST(req: NextRequest) {
  try {
    const { email, password, tenant_slug } = await req.json()

    console.log('Sign in attempt for:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Call FastAPI login endpoint
    const loginResponse = await fetch(`${FASTAPI_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        tenant_slug: tenant_slug || null
      })
    })

    const data = await loginResponse.json()

    if (!loginResponse.ok) {
      console.log('Login failed:', data)
      return NextResponse.json(
        { error: data.detail || 'Invalid email or password' },
        { status: loginResponse.status }
      )
    }

    // Check if multi-tenant response (requires tenant selection)
    if (data.requires_tenant_selection) {
      return NextResponse.json({
        success: false,
        requires_tenant_selection: true,
        available_tenants: data.available_tenants,
        auth_token: data.auth_token,
        message: data.message
      })
    }

    // Direct login success - LoginResponse
    console.log('Login successful for user:', data.user)

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: data.user,
      tenant: data.tenant,
      outlets: data.outlets,
      access_type: data.access_type,
      permissions: data.permissions,
      subscription_status: data.subscription_status,
      subscription_id: data.subscription_id
    })

    // Set JWT token in httpOnly cookie
    response.cookies.set('auth-token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in || 1800, // Use token expiration from API
      path: '/',
    })

    // Store refresh token if provided
    if (data.refresh_token) {
      response.cookies.set('refresh-token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days for refresh token
        path: '/',
      })
    }

    // Store tenant info in cookie for API routes
    if (data.tenant) {
      response.cookies.set('tenant', JSON.stringify(data.tenant), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
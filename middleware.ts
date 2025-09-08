import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTenantFromHost, getTenantFromPath } from './lib/tenant-dynamic'
import { getUserFromCookies } from './lib/auth'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const host = request.headers.get('host') || ''
  const pathname = url.pathname

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const isApiRoute = pathname.startsWith('/api')
  const isAdminRoute = pathname.startsWith('/admin')

  // Skip middleware for API and Admin routes
  if (isApiRoute || isAdminRoute) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  // Get tenant from path - any first segment is considered a potential tenant
  let tenantSlug = firstSegment || 'default'
  
  // Don't process if already has tenant in path
  const isAlreadyTenantPath = !!firstSegment

  // Check authentication for protected routes
  const publicPaths = ['/signin', '/signup', '/forgot-password', '/admin/login']
  const isPublicPath = publicPaths.some(path => pathname.includes(path))
  
  // Skip auth check for public paths and root
  if (!isPublicPath && pathname !== '/') {
    const cookies = request.cookies.getAll()
    const authToken = cookies.find(c => c.name === 'auth-token')
    
    // Simple check - just verify token exists
    if (!authToken) {
      console.log('No auth token found, redirecting to signin from:', pathname)
      const signinUrl = url.clone()
      signinUrl.pathname = `/${tenantSlug || 'jakarta'}/signin`
      return NextResponse.redirect(signinUrl)
    }
    
  }

  // Pass through - Next.js will handle the routing
  const response = NextResponse.next()
  
  // Add tenant info to headers if available
  if (tenantSlug) {
    response.headers.set('x-tenant-slug', tenantSlug)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|tenants/).*)',
  ],
}
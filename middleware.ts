import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromCookies } from './lib/auth'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // LEGACY REDIRECT: Remove tenant from URL path
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  // Check if first segment looks like a tenant slug (old URL pattern)
  // Redirect /:tenant/path to /path
  if (firstSegment && !pathname.startsWith('/api')) {
    // Common tenant slugs to redirect
    const possibleTenants = ['default', 'jakarta', 'bandung', 'surabaya', 'bali', 'medan']

    if (possibleTenants.includes(firstSegment) ||
        (firstSegment.length < 20 && !['signin', 'signup', 'dashboard', 'calendar', 'clients', 'staff', 'products',
           'walk-in', 'withdrawal', 'reports', 'settings', 'user-management', 'outlet-management', 'subscription',
            'terms', 'privacy', 'help-desk','availability'].includes(firstSegment))) {

      // Build new path without tenant
      const newPath = '/' + segments.slice(1).join('/')
      const redirectUrl = url.clone()
      redirectUrl.pathname = newPath || '/'

      console.log(`Redirecting from ${pathname} to ${redirectUrl.pathname}`)
      return NextResponse.redirect(redirectUrl, { status: 301 })
    }
  }

  // LEGACY API REDIRECT: /api/:tenant/* to /api/*
  if (pathname.startsWith('/api/')) {
    const apiSegments = pathname.replace('/api/', '').split('/')
    const firstApiSegment = apiSegments[0]

    // Check if it looks like a tenant in API path
    const possibleTenants = ['default', 'jakarta', 'bandung', 'surabaya', 'bali', 'medan']
    if (possibleTenants.includes(firstApiSegment)) {
      const newApiPath = '/api/' + apiSegments.slice(1).join('/')
      const redirectUrl = url.clone()
      redirectUrl.pathname = newApiPath

      console.log(`API Redirect from ${pathname} to ${redirectUrl.pathname}`)
      return NextResponse.redirect(redirectUrl, { status: 301 })
    }
  }

  const isApiRoute = pathname.startsWith('/api')
  const isAdminRoute = pathname.startsWith('/admin')

  // Skip auth check for API routes
  if (isApiRoute) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  const publicPaths = ['/signin', '/signup', '/forgot-password', '/terms',
                       '/privacy']
  const isPublicPath = publicPaths.some(path => pathname.includes(path))

  // Skip auth check for public paths and root
  if (!isPublicPath && pathname !== '/') {
    const cookies = request.cookies.getAll()
    const authToken = cookies.find(c => c.name === 'auth-token')

    // Debug logging for user-management and subscription routes
    if (pathname === '/user-management' || pathname.startsWith('/subscription')) {
      console.log(`[Middleware] ${pathname} - cookies:`, cookies.map(c => c.name))
      console.log(`[Middleware] ${pathname} - auth token found:`, authToken ? 'YES' : 'NO')
    }

    // Simple check - just verify token exists
    if (!authToken) {
      console.log('No auth token found, redirecting to signin from:', pathname)
      const signinUrl = url.clone()
      signinUrl.pathname = '/signin'
      return NextResponse.redirect(signinUrl)
    }
  }

  // Pass through - Next.js will handle the routing
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
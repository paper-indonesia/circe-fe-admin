import { TenantConfig } from './tenant'

export interface Session {
  userId?: string
  tenantId: string
  userEmail?: string
  userName?: string
  role?: 'admin' | 'staff' | 'viewer'
  permissions?: string[]
}

const SESSION_COOKIE_NAME = 'beauty-clinic-session'

export async function getSession(): Promise<Session | null> {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers')
    try {
      const cookieStore = await cookies()
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
      
      if (!sessionCookie) {
        return null
      }
      
      const session = JSON.parse(sessionCookie.value) as Session
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }
  return null
}

export async function setSession(session: Session): Promise<void> {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers')
    try {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    } catch (error) {
      console.error('Error setting session:', error)
    }
  }
}

export async function clearSession(): Promise<void> {
  if (typeof window === 'undefined') {
    const { cookies } = await import('next/headers')
    try {
      const cookieStore = await cookies()
      cookieStore.delete(SESSION_COOKIE_NAME)
    } catch (error) {
      console.error('Error clearing session:', error)
    }
  }
}

export async function validateTenantAccess(
  session: Session | null,
  requiredTenantId: string
): Promise<boolean> {
  if (!session) {
    return false
  }
  
  if (session.role === 'admin') {
    return true
  }
  
  return session.tenantId === requiredTenantId
}

export async function createMockSession(tenantId: string): Promise<Session> {
  return {
    userId: 'mock-user-' + Math.random().toString(36).substring(7),
    tenantId,
    userEmail: 'admin@' + tenantId + '.com',
    userName: 'Admin User',
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
  }
}
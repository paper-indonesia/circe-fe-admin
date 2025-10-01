import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { NextRequest, NextResponse } from 'next/server'
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const TOKEN_NAME = 'auth-token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface JWTPayload {
  userId: string
  email: string
  name: string
}

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

// JWT token management
export const createToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  })
}

export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Cookie management for API routes
export const setAuthCookie = (res: NextResponse, token: string) => {
  setCookie(TOKEN_NAME, token, {
    req: res as any,
    res,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  })
}

export const getAuthCookie = (req: NextRequest): string | undefined => {
  const cookie = getCookie(TOKEN_NAME, { req })
  return cookie as string | undefined
}

// Verify authentication from request
export const verifyAuth = async (req: NextRequest): Promise<JWTPayload | null> => {
  try {
    // Try to get token from cookie first
    const tokenFromCookie = req.cookies.get('auth-token')?.value

    if (tokenFromCookie) {
      const payload = verifyToken(tokenFromCookie)
      if (payload) {
        console.log('verifyAuth: Token verified from cookie, userId:', payload.userId)
        return payload
      }
    }

    // Try Authorization header as fallback
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      if (payload) {
        console.log('verifyAuth: Token verified from header, userId:', payload.userId)
        return payload
      }
    }

    console.log('verifyAuth: No valid token found')
    return null
  } catch (error) {
    console.error('verifyAuth error:', error)
    return null
  }
}

export const removeAuthCookie = (res: NextResponse) => {
  deleteCookie(TOKEN_NAME, {
    req: res as any,
    res,
    path: '/',
  })
}

// Get user from request
export const getUserFromRequest = (req: NextRequest): JWTPayload | null => {
  const token = getAuthCookie(req)
  if (!token) return null
  return verifyToken(token)
}

// Middleware helper to get user from cookies
export const getUserFromCookies = (cookies: RequestCookie[]): JWTPayload | null => {
  const authCookie = cookies.find(cookie => cookie.name === TOKEN_NAME)
  if (!authCookie?.value) return null
  return verifyToken(authCookie.value)
}


// Helper for API routes to get current user for data scoping
export const requireAuth = (req: NextRequest): JWTPayload => {
  const user = getUserFromRequest(req)
  if (!user) {
    throw new Error('Unauthorized: No valid authentication token')
  }
  return user
}

// Helper to create scoped query for user's data
export const getScopedQuery = (userId: string, additionalFilters: Record<string, any> = {}) => {
  return {
    ownerId: userId,
    ...additionalFilters
  }
}

// Helper to verify ownership before operations
export const verifyOwnership = (document: any, userId: string): boolean => {
  return document?.ownerId === userId || document?.userId === userId
}
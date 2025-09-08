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
  tenantId: string
  role: string
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

// Check if user has required role
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole)
}

// Check if user is platform admin
export const isPlatformAdmin = (userRole: string): boolean => {
  return userRole === 'platform_admin'
}
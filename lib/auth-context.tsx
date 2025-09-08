"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  tenantName?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signin: (email: string, password: string, tenant: string) => Promise<void>
  signup: (name: string, email: string, password: string, tenant: string) => Promise<void>
  signout: () => void
  isPlatformAdmin: () => boolean
  canAccessTenant: (tenantSlug: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const signin = async (email: string, password: string, tenant: string) => {
    const response = await fetch(`/api/${tenant}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to sign in')
    }

    const data = await response.json()
    setUser(data.user)
    localStorage.setItem('user', JSON.stringify(data.user))

    // Redirect based on role
    if (data.user.role === 'platform_admin') {
      router.push('/admin/tenants')
    } else {
      router.push(`/${tenant}/dashboard`)
    }
  }

  const signup = async (name: string, email: string, password: string, tenant: string) => {
    const response = await fetch(`/api/${tenant}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to sign up')
    }

    const data = await response.json()
    setUser(data.user)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push(`/${tenant}/dashboard`)
  }

  const signout = () => {
    setUser(null)
    localStorage.removeItem('user')
    
    // Get current tenant from pathname
    const segments = pathname.split('/').filter(Boolean)
    const tenant = segments[0] || 'jakarta'
    
    router.push(`/${tenant}/signin`)
  }

  const isPlatformAdmin = () => {
    return user?.role === 'platform_admin'
  }

  const canAccessTenant = (tenantSlug: string) => {
    if (!user) return false
    if (isPlatformAdmin()) return true
    
    // In a real app, you'd check if user.tenantId matches the tenant's ID
    // For now, we'll use a simple check
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signin,
        signup,
        signout,
        isPlatformAdmin,
        canAccessTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
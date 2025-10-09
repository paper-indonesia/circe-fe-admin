"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  id: string
  email: string
  name?: string
  first_name?: string
  last_name?: string
  role?: string
  access_type?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signin: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  signout: () => void
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Load user from localStorage on mount
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (error) {
          console.error('Failed to parse stored user:', error)
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('localStorage not available:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const signin = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
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

    // Merge user data with access_type from response
    const userData = {
      ...data.user,
      name: data.user?.name || `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim(),
      access_type: data.access_type || data.user?.access_type,
      role: data.user?.role
    }

    console.log('User data after signin:', userData)

    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))

    // Save tenant data to localStorage for API operations
    if (data.tenant) {
      localStorage.setItem('tenant', JSON.stringify(data.tenant))
    }

    // Always redirect to dashboard
    router.push('/dashboard')
  }

  const signup = async (name: string, email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
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

    // Use window.location for hard reload to ensure all providers re-initialize
    window.location.href = '/dashboard'
  }

  const signout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('tenant')
    router.push('/signin')
  }

  const isAdmin = () => {
    const role = user?.role?.toLowerCase()
    const accessType = user?.access_type?.toLowerCase()
    return role === 'tenant_admin' || accessType === 'tenant_admin'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signin,
        signup,
        signout,
        isAdmin,
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
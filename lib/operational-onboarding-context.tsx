"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface OutletData {
  id?: string
  name: string
  address: string
  phone: string
  timezone?: string
}

interface UserData {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: string
}

interface ProductData {
  id?: string
  name: string
  duration_minutes: number
  price: number
  category: string
  description?: string
}

interface StaffData {
  id?: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  position: string
  service_ids?: string[]
}

interface AvailabilityData {
  staff_id: string
  outlet_id: string
  date: string
  start_time: string
  end_time: string
  recurrence_type?: string
  recurrence_days?: number[]
}

interface OnboardingProgress {
  outlets: OutletData[]
  users: UserData[]
  products: ProductData[]
  staff: StaffData[]
  availabilities: AvailabilityData[]
  currentStep: number
  isCompleted: boolean
}

interface OnboardingContextType {
  progress: OnboardingProgress
  addOutlet: (outlet: OutletData) => void
  addUser: (user: UserData) => void
  addProduct: (product: ProductData) => void
  addStaff: (staff: StaffData) => void
  addAvailability: (availability: AvailabilityData) => void
  setCurrentStep: (step: number) => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => void
  loadProgress: () => Promise<void>
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const STORAGE_KEY = "operational-onboarding-progress"
const COMPLETION_KEY = "operational-onboarding-completed"

export function OperationalOnboardingProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)
  const [progress, setProgress] = useState<OnboardingProgress>({
    outlets: [],
    users: [],
    products: [],
    staff: [],
    availabilities: [],
    currentStep: 1,
    isCompleted: false,
  })

  // Set mounted state (client-side only)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load progress from localStorage on mount (client-side only)
  useEffect(() => {
    if (!isMounted) return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setProgress(parsed)
      }
    } catch (error) {
      console.error("Failed to load onboarding progress:", error)
    }
  }, [isMounted])

  // Save progress to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (!isMounted) return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch (error) {
      console.error("Failed to save onboarding progress:", error)
    }
  }, [progress, isMounted])

  const addOutlet = (outlet: OutletData) => {
    console.log('[Context] addOutlet called:', outlet)
    setProgress((prev) => {
      const newOutlets = [...prev.outlets, outlet]
      console.log('[Context] Updated outlets:', {
        previousCount: prev.outlets.length,
        newCount: newOutlets.length,
        outlets: newOutlets
      })
      return {
        ...prev,
        outlets: newOutlets,
      }
    })
  }

  const addUser = (user: UserData) => {
    setProgress((prev) => ({
      ...prev,
      users: [...prev.users, user],
    }))
  }

  const addProduct = (product: ProductData) => {
    setProgress((prev) => ({
      ...prev,
      products: [...prev.products, product],
    }))
  }

  const addStaff = (staff: StaffData) => {
    setProgress((prev) => ({
      ...prev,
      staff: [...prev.staff, staff],
    }))
  }

  const addAvailability = (availability: AvailabilityData) => {
    setProgress((prev) => ({
      ...prev,
      availabilities: [...prev.availabilities, availability],
    }))
  }

  const setCurrentStep = (step: number) => {
    setProgress((prev) => ({
      ...prev,
      currentStep: step,
    }))
  }

  const completeOnboarding = async () => {
    // Skip if not mounted (SSR)
    if (typeof window === 'undefined') return

    try {
      // Mark operational onboarding as complete in localStorage
      localStorage.setItem(COMPLETION_KEY, JSON.stringify({
        completed: true,
        completedAt: new Date().toISOString()
      }))

      setProgress((prev) => ({
        ...prev,
        isCompleted: true,
      }))

      localStorage.removeItem(STORAGE_KEY) // Clear temporary progress
    } catch (error) {
      console.error("Failed to complete onboarding:", error)
      throw error
    }
  }

  const resetOnboarding = () => {
    setProgress({
      outlets: [],
      users: [],
      products: [],
      staff: [],
      availabilities: [],
      currentStep: 1,
      isCompleted: false,
    })

    // Skip localStorage if not mounted (SSR)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(COMPLETION_KEY)
      } catch (error) {
        console.error("Failed to reset onboarding in localStorage:", error)
      }
    }
  }

  const loadProgress = async () => {
    // Skip if not mounted (SSR)
    if (typeof window === 'undefined') return

    try {
      // Check completion status from localStorage
      const completionData = localStorage.getItem(COMPLETION_KEY)
      if (completionData) {
        const parsed = JSON.parse(completionData)
        if (parsed.completed) {
          setProgress((prev) => ({
            ...prev,
            isCompleted: true,
          }))
        }
      }
    } catch (error) {
      console.error("Failed to load onboarding status:", error)
    }
  }

  return (
    <OnboardingContext.Provider
      value={{
        progress,
        addOutlet,
        addUser,
        addProduct,
        addStaff,
        addAvailability,
        setCurrentStep,
        completeOnboarding,
        resetOnboarding,
        loadProgress,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOperationalOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOperationalOnboarding must be used within OperationalOnboardingProvider")
  }
  return context
}

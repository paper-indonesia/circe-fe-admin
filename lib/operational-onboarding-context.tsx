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

export function OperationalOnboardingProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<OnboardingProgress>({
    outlets: [],
    users: [],
    products: [],
    staff: [],
    availabilities: [],
    currentStep: 1,
    isCompleted: false,
  })

  // Load progress from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProgress(parsed)
      } catch (error) {
        console.error("Failed to load onboarding progress:", error)
      }
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  const addOutlet = (outlet: OutletData) => {
    setProgress((prev) => ({
      ...prev,
      outlets: [...prev.outlets, outlet],
    }))
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
    try {
      // Mark operational onboarding as complete
      const response = await fetch("/api/settings/operational-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operationalOnboardingCompleted: true,
          completedAt: new Date().toISOString()
        }),
      })

      if (response.ok) {
        setProgress((prev) => ({
          ...prev,
          isCompleted: true,
        }))
        localStorage.removeItem(STORAGE_KEY) // Clear temporary progress
      } else {
        throw new Error("Failed to save onboarding completion status")
      }
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
    localStorage.removeItem(STORAGE_KEY)
  }

  const loadProgress = async () => {
    try {
      const response = await fetch("/api/settings/operational-onboarding")
      if (response.ok) {
        const data = await response.json()
        if (data.operationalOnboardingCompleted) {
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

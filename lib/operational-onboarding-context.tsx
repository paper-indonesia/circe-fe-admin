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
  date: string
  start_time: string
  end_time: string
  recurrence_type?: string
  recurrence_days?: number[]
}

interface TemplateData {
  id: string
  name: string
  description?: string
  is_default?: boolean
  is_selected?: boolean
}

interface OnboardingProgress {
  outlets: OutletData[]
  users: UserData[]
  products: ProductData[]
  staff: StaffData[]
  availabilities: AvailabilityData[]
  staffPositionTemplates: TemplateData[]
  serviceCategoryTemplates: TemplateData[]
  currentStep: number
  isCompleted: boolean
  isDismissed: boolean // New: Track if user dismissed the wizard
}

interface OnboardingContextType {
  progress: OnboardingProgress
  addOutlet: (outlet: OutletData) => void
  addUser: (user: UserData) => void
  addProduct: (product: ProductData) => void
  addStaff: (staff: StaffData) => void
  addAvailability: (availability: AvailabilityData) => void
  setStaffPositionTemplates: (templates: TemplateData[]) => void
  setServiceCategoryTemplates: (templates: TemplateData[]) => void
  setCurrentStep: (step: number) => void
  completeOnboarding: () => Promise<void>
  resetOnboarding: () => void
  loadProgress: () => Promise<void>
  dismissWizard: () => void // New: Dismiss the wizard temporarily
  resumeWizard: () => void // New: Resume the wizard
  getIncompleteSteps: () => { step: number; name: string }[] // New: Get list of incomplete steps
  hasCompletedStep: (step: number) => Promise<boolean> // New: Check if a step is completed
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
    staffPositionTemplates: [],
    serviceCategoryTemplates: [],
    currentStep: 1,
    isCompleted: false,
    isDismissed: false,
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

  const setStaffPositionTemplates = (templates: TemplateData[]) => {
    setProgress((prev) => ({
      ...prev,
      staffPositionTemplates: templates,
    }))
  }

  const setServiceCategoryTemplates = (templates: TemplateData[]) => {
    setProgress((prev) => ({
      ...prev,
      serviceCategoryTemplates: templates,
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
      // Step 1: Check if outlets exist using /api/outlets?page=1&size=1
      const outletsCheckResponse = await fetch('/api/outlets?page=1&size=1')
      let hasOutlets = false

      if (outletsCheckResponse.ok) {
        const outletsData = await outletsCheckResponse.json()
        hasOutlets = outletsData.items && outletsData.items.length > 0
      }

      // Step 2: Only if no outlets exist, get tenant_id and update templates
      if (!hasOutlets) {
        console.log('[Onboarding] User has NO outlets, updating tenant templates...')

        // Get tenant_id from /api/current
        const currentResponse = await fetch('/api/current')
        let tenantId: string | null = null

        if (currentResponse.ok) {
          const currentData = await currentResponse.json()
          tenantId = currentData.tenant_id
        }

        if (tenantId) {
          // Prepare tenant update payload
          const updatePayload: any = {}

          // Add staff position templates if selected
          if (progress.staffPositionTemplates && progress.staffPositionTemplates.length > 0) {
            updatePayload.settings = {
              ...updatePayload.settings,
              staff_position_templates: progress.staffPositionTemplates.map(t => t.name)
            }
          }

          // Add service category templates if selected
          if (progress.serviceCategoryTemplates && progress.serviceCategoryTemplates.length > 0) {
            updatePayload.settings = {
              ...updatePayload.settings,
              service_category_templates: progress.serviceCategoryTemplates.map(t => t.name)
            }
          }

          // Only send update if there are templates to update
          if (updatePayload.settings && Object.keys(updatePayload.settings).length > 0) {
            const updateResponse = await fetch(`/api/tenants/${tenantId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updatePayload),
            })

            if (!updateResponse.ok) {
              console.error('[Onboarding] Failed to update tenant templates:', await updateResponse.text())
              // Don't throw - allow onboarding to complete even if template update fails
            } else {
              console.log('[Onboarding] Tenant templates updated successfully')
            }
          }
        }
      } else {
        console.log('[Onboarding] User already has outlets, SKIPPING template update')
      }

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
      staffPositionTemplates: [],
      serviceCategoryTemplates: [],
      currentStep: 1,
      isCompleted: false,
      isDismissed: false,
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

  const dismissWizard = () => {
    setProgress((prev) => ({
      ...prev,
      isDismissed: true,
    }))
  }

  const resumeWizard = () => {
    setProgress((prev) => ({
      ...prev,
      isDismissed: false,
    }))
  }

  const getIncompleteSteps = () => {
    const steps: { step: number; name: string }[] = []

    // Check each step completion based on actual database data
    // This is async, so we'll need to handle it differently
    // For now, return based on progress state

    return steps
  }

  const hasCompletedStep = async (step: number): Promise<boolean> => {
    try {
      switch (step) {
        case 1: // Outlets
          const outletsRes = await fetch('/api/outlets?page=1&size=1')
          if (outletsRes.ok) {
            const data = await outletsRes.json()
            return data.items && data.items.length > 0
          }
          return false

        case 2: // Products/Services
          const servicesRes = await fetch('/api/services?page=1&size=1')
          if (servicesRes.ok) {
            const data = await servicesRes.json()
            return data.items && data.items.length > 0
          }
          return false

        case 3: // Staff
          const staffRes = await fetch('/api/staff?page=1&size=1')
          if (staffRes.ok) {
            const data = await staffRes.json()
            return data.items && data.items.length > 0
          }
          return false

        default:
          return false
      }
    } catch (error) {
      console.error(`Failed to check step ${step} completion:`, error)
      return false
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
        setStaffPositionTemplates,
        setServiceCategoryTemplates,
        setCurrentStep,
        completeOnboarding,
        resetOnboarding,
        loadProgress,
        dismissWizard,
        resumeWizard,
        getIncompleteSteps,
        hasCompletedStep,
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

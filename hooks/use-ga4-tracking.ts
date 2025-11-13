import { useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import {
  trackPageView,
  trackFormStart,
  trackFieldInteraction,
  trackValidationError,
  trackFormSubmitAttempt,
  trackBusinessTypeSelect,
  trackContinueClick,
  trackBackClick,
  trackCheckboxToggle,
  trackCreateBusinessAccount,
  trackExitSignUp,
  setUserId
} from '@/lib/analytics'

interface UseGA4TrackingOptions {
  registrationStep?: number
  formName?: string
}

export function useGA4Tracking(options?: UseGA4TrackingOptions) {
  const pathname = usePathname()
  const formStartTracked = useRef(false)
  const { registrationStep, formName } = options || {}

  // Track page view with registration step
  useEffect(() => {
    if (pathname === '/signup' && registrationStep) {
      trackPageView({
        page_path: pathname,
        page_title: `Signup - Step ${registrationStep}`,
        registration_step: registrationStep
      })
    }
  }, [pathname, registrationStep])

  // Track form start (fire once on first field focus)
  const handleFormStart = useCallback(() => {
    if (!formStartTracked.current && formName) {
      trackFormStart(formName, registrationStep)
      formStartTracked.current = true
    }
  }, [formName, registrationStep])

  // Reset form start tracking when step changes
  useEffect(() => {
    formStartTracked.current = false
  }, [registrationStep])

  // Track field interaction
  const handleFieldFocus = useCallback((fieldName: string) => {
    handleFormStart()
  }, [handleFormStart])

  const handleFieldBlur = useCallback((fieldName: string) => {
    if (formName) {
      trackFieldInteraction(formName, fieldName, registrationStep)
    }
  }, [formName, registrationStep])

  // Track validation error
  const handleValidationError = useCallback((fieldName: string, errorMessage: string) => {
    if (formName) {
      trackValidationError(formName, fieldName, errorMessage, registrationStep)
    }
  }, [formName, registrationStep])

  // Track form submit attempt
  const handleFormSubmit = useCallback(() => {
    if (formName) {
      trackFormSubmitAttempt(formName, registrationStep)
    }
  }, [formName, registrationStep])

  // Track business type selection
  const handleBusinessTypeSelect = useCallback((businessType: string) => {
    trackBusinessTypeSelect(businessType)
  }, [])

  // Track continue click
  const handleContinueClick = useCallback(() => {
    if (registrationStep) {
      trackContinueClick(registrationStep)
    }
  }, [registrationStep])

  // Track back click
  const handleBackClick = useCallback(() => {
    if (registrationStep) {
      trackBackClick(registrationStep)
    }
  }, [registrationStep])

  // Track checkbox toggle
  const handleCheckboxToggle = useCallback((
    checkboxName: 'terms_of_service' | 'privacy_policy',
    checkboxState: boolean
  ) => {
    trackCheckboxToggle(checkboxName, checkboxState, registrationStep)
  }, [registrationStep])

  // Track signup completion
  const handleSignupComplete = useCallback((
    businessType: string,
    userEmail: string,
    userId?: string
  ) => {
    trackCreateBusinessAccount(businessType, userEmail, userId)

    if (userId) {
      setUserId(userId)
    }
  }, [])

  // Track exit/abandonment
  useEffect(() => {
    if (pathname === '/signup' && registrationStep) {
      const handleBeforeUnload = () => {
        trackExitSignUp(registrationStep, formName)
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [pathname, registrationStep, formName])

  return {
    handleFormStart,
    handleFieldFocus,
    handleFieldBlur,
    handleValidationError,
    handleFormSubmit,
    handleBusinessTypeSelect,
    handleContinueClick,
    handleBackClick,
    handleCheckboxToggle,
    handleSignupComplete
  }
}

// Hook for dashboard page after signup
export function useSignupSuccessTracking() {
  const pathname = usePathname()
  const tracked = useRef(false)

  useEffect(() => {
    if (pathname === '/dashboard' && !tracked.current) {
      // Check if this is right after signup (you might want to use a URL param or state)
      const isFromSignup = sessionStorage.getItem('just_signed_up')

      if (isFromSignup) {
        trackPageView({
          page_path: pathname,
          page_title: 'Dashboard - Signup Success'
        })

        // Clear the flag
        sessionStorage.removeItem('just_signed_up')
        tracked.current = true
      }
    }
  }, [pathname])
}

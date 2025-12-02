// Google Analytics 4 Event Tracking Utility
// Based on MyReserva GA4 Tracking Specification

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
    __ANALYTICS_CONFIG__?: {
      ga_measurement_id: string
      google_ads_id: string
      google_ads_signup_conversion_label: string
    }
  }
}

// Get analytics config from environment or cached config
const getAnalyticsConfig = () => {
  if (typeof window !== 'undefined') {
    // First check if config is already cached
    if (window.__ANALYTICS_CONFIG__) {
      return window.__ANALYTICS_CONFIG__
    }

    // Fallback to NEXT_PUBLIC_ env vars (available at build time)
    return {
      ga_measurement_id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
      google_ads_id: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '',
      google_ads_signup_conversion_label: process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL || ''
    }
  }
  return {
    ga_measurement_id: '',
    google_ads_id: '',
    google_ads_signup_conversion_label: ''
  }
}

// Set analytics config (called by GoogleAnalytics component after fetching from API)
export const setAnalyticsConfig = (config: {
  ga_measurement_id: string
  google_ads_id: string
  google_ads_signup_conversion_label: string
}) => {
  if (typeof window !== 'undefined') {
    window.__ANALYTICS_CONFIG__ = config
    console.log('[Analytics] Config cached:',
      config.ga_measurement_id ? 'GA SET' : 'GA NOT SET',
      config.google_ads_id ? 'ADS SET' : 'ADS NOT SET',
      config.google_ads_signup_conversion_label ? 'CONVERSION LABEL SET' : 'CONVERSION LABEL NOT SET'
    )
  }
}

// Initialize gtag lazily to avoid hydration issues
const initGtag = () => {
  if (typeof window !== 'undefined' && !window.gtag) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
  }
}

// Helper function to send events to GA4
export const trackEvent = (eventName: string, params?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initGtag()
    if (window.gtag) {
      window.gtag('event', eventName, params)
      console.log('[GA4 Event]', eventName, params) // Debug logging
    }
  }
}

// Set user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    initGtag()
    if (window.gtag) {
      window.gtag('set', 'user_properties', properties)
      console.log('[GA4 User Properties]', properties)
    }
  }
}

// Set user ID
export const setUserId = (userId: string) => {
  if (typeof window !== 'undefined') {
    initGtag()
    if (window.gtag) {
      window.gtag('set', 'user_id', userId)
      console.log('[GA4 User ID]', userId)
    }
  }
}

// ============================================
// PAGE VIEW TRACKING
// ============================================

interface PageViewParams {
  page_title?: string
  page_location?: string
  page_path?: string
  registration_step?: number
}

export const trackPageView = (params?: PageViewParams) => {
  trackEvent('page_view', params)
}

// ============================================
// CLICK EVENTS
// ============================================

// Navigation click
export const trackNavClick = (buttonText: string) => {
  trackEvent('nav_click', {
    button_text: buttonText.toLowerCase().replace(/\s+/g, '_'),
    button_location: 'header'
  })
}

// Hero CTA click
export const trackHeroCTAClick = () => {
  trackEvent('hero_cta_click', {
    button_text: 'mulai_gratis',
    button_location: 'hero'
  })
}

// Demo click
export const trackDemoClick = () => {
  trackEvent('demo_click', {
    button_text: 'lihat_demo',
    button_location: 'hero'
  })
}

// Login click
export const trackLoginClick = () => {
  trackEvent('login_click', {
    button_text: 'login',
    button_location: 'header'
  })
}

// Business type selection
export const trackBusinessTypeSelect = (businessType: string) => {
  trackEvent('business_type_select', {
    form_name: 'business_info',
    form_field: 'business_type',
    business_type: businessType
  })

  // Set as user property
  setUserProperties({ business_type: businessType })
}

// Continue click
export const trackContinueClick = (registrationStep: number) => {
  trackEvent('continue_click', {
    registration_step: registrationStep
  })
}

// Back click
export const trackBackClick = (registrationStep: number) => {
  trackEvent('back_click', {
    registration_step: registrationStep
  })
}

// Checkbox toggle
export const trackCheckboxToggle = (
  checkboxName: 'terms_of_service' | 'privacy_policy',
  checkboxState: boolean,
  registrationStep: number = 3
) => {
  trackEvent('checkbox_toggle', {
    checkbox_name: checkboxName,
    checkbox_state: checkboxState ? 'checked' : 'unchecked',
    registration_step: registrationStep
  })
}

// Legal link click
export const trackLegalLinkClick = (linkText: string, linkUrl: string) => {
  trackEvent('legal_link_click', {
    link_text: linkText,
    link_url: linkUrl
  })
}

// ============================================
// FORM TRACKING
// ============================================

// Form start
export const trackFormStart = (formName: string, registrationStep?: number) => {
  trackEvent('form_start', {
    form_name: formName,
    registration_step: registrationStep
  })
}

// Field interaction
export const trackFieldInteraction = (
  formName: string,
  formField: string,
  registrationStep?: number
) => {
  trackEvent('field_interaction', {
    form_name: formName,
    form_field: formField,
    registration_step: registrationStep
  })
}

// Form submit attempt
export const trackFormSubmitAttempt = (formName: string, registrationStep?: number) => {
  trackEvent('form_submit_attempt', {
    form_name: formName,
    registration_step: registrationStep
  })
}

// Validation error
export const trackValidationError = (
  formName: string,
  formField: string,
  errorMessage: string,
  registrationStep?: number
) => {
  trackEvent('validation_error', {
    form_name: formName,
    form_field: formField,
    error_message: errorMessage,
    registration_step: registrationStep
  })
}

// ============================================
// CONVERSION EVENTS
// ============================================

// Google Ads Conversion Tracking for Sign-up
export const trackGoogleAdsSignupConversion = (callback?: () => void) => {
  if (typeof window !== 'undefined') {
    initGtag()
    const config = getAnalyticsConfig()

    if (window.gtag && config.google_ads_id && config.google_ads_signup_conversion_label) {
      const conversionCallback = () => {
        console.log('[Google Ads] Signup conversion tracked')
        if (callback) {
          callback()
        }
      }

      // Build the full conversion ID: AW-XXXXXX/CONVERSION_LABEL
      const conversionId = `${config.google_ads_id}/${config.google_ads_signup_conversion_label}`

      window.gtag('event', 'conversion', {
        'send_to': conversionId,
        'event_callback': conversionCallback
      })

      console.log('[Google Ads Conversion]', conversionId)
    } else if (callback) {
      // If gtag is not available or missing config, still call the callback
      if (!config.google_ads_id) {
        console.warn('[Google Ads] No Google Ads ID configured')
      }
      if (!config.google_ads_signup_conversion_label) {
        console.warn('[Google Ads] No Signup Conversion Label configured')
      }
      callback()
    }
  } else if (callback) {
    callback()
  }
}

// Create business account (final conversion)
export const trackCreateBusinessAccount = (
  businessType: string,
  userEmail: string,
  userId?: string
) => {
  // Track Google Ads conversion for signup
  trackGoogleAdsSignupConversion()

  // Track custom event
  trackEvent('create_business_account', {
    registration_step: 3,
    business_type: businessType,
    user_email_domain: userEmail.split('@')[1] // Only domain, not full email
  })

  // Track GA4 recommended sign_up event
  trackEvent('sign_up', {
    method: 'website',
    business_type: businessType
  })

  // Set user properties
  setUserProperties({
    business_type: businessType,
    signup_method: 'website'
  })

  // Set user ID if available
  if (userId) {
    setUserId(userId)
  }
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

// Scroll depth
export const trackScrollDepth = (percentage: 25 | 50 | 75 | 100) => {
  trackEvent('scroll_depth', {
    percentage: percentage
  })
}

// Time on page
export const trackTimeOnPage = (timeThreshold: 10 | 30 | 60) => {
  trackEvent('time_on_page', {
    time_threshold: timeThreshold
  })
}

// Exit sign up
export const trackExitSignUp = (
  registrationStep: number,
  lastFieldCompleted?: string,
  businessType?: string
) => {
  trackEvent('exit_sign_up', {
    registration_step: registrationStep,
    last_field_completed: lastFieldCompleted,
    business_type: businessType
  })
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get UTM parameters from URL
export const getUTMParameters = () => {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
    gclid: params.get('gclid') || undefined
  }
}

// Set traffic source on initial page load
export const setTrafficSource = () => {
  const utmParams = getUTMParameters()

  if (utmParams.utm_source || utmParams.gclid) {
    const trafficSource = `${utmParams.utm_source || 'google'} / ${utmParams.utm_medium || 'cpc'} / ${utmParams.utm_campaign || 'unknown'}`

    setUserProperties({
      traffic_source: trafficSource,
      campaign: utmParams.utm_campaign
    })
  }
}

"use client"

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { setTrafficSource } from '@/lib/analytics'

interface AnalyticsConfig {
  ga_measurement_id: string
  google_ads_id: string
}

export function GoogleAnalytics() {
  const [config, setConfig] = useState<AnalyticsConfig | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Fetch analytics config from API (runtime)
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config/analytics')
        if (response.ok) {
          const data = await response.json()
          if (data.ga_measurement_id) {
            setConfig(data)
          }
        }
      } catch (error) {
        console.error('Failed to fetch analytics config:', error)
      }
    }

    fetchConfig()
  }, [])

  // Set traffic source on mount
  useEffect(() => {
    setTrafficSource()
  }, [])

  // Initialize gtag when script loads
  const handleScriptLoad = () => {
    if (config && typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments)
      }
      window.gtag = gtag

      gtag('js', new Date())
      gtag('config', config.ga_measurement_id, {
        page_path: window.location.pathname,
        send_page_view: true
      })

      if (config.google_ads_id) {
        gtag('config', config.google_ads_id)
      }

      setIsLoaded(true)
      console.log('[Analytics] Google Analytics initialized:', config.ga_measurement_id)
      if (config.google_ads_id) {
        console.log('[Analytics] Google Ads initialized:', config.google_ads_id)
      }
    }
  }

  // Don't render scripts if no config yet
  if (!config?.ga_measurement_id) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${config.ga_measurement_id}`}
        onLoad={handleScriptLoad}
      />
    </>
  )
}

// Add gtag types to window
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

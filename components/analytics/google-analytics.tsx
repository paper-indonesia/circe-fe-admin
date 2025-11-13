"use client"

import { useEffect } from 'react'
import Script from 'next/script'
import { setTrafficSource } from '@/lib/analytics'

export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

  // Set traffic source on mount
  useEffect(() => {
    setTrafficSource()
  }, [])

  // Don't load GA if no measurement ID is set
  if (!measurementId) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: true
            });
            ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
          `,
        }}
      />
    </>
  )
}

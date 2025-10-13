"use client"

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PageLoader } from './ui/page-loader'

export function NavigationLoader() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Loading')

  useEffect(() => {
    // Show loader when pathname changes
    setIsLoading(true)

    // Set appropriate loading text based on route
    if (pathname.includes('/dashboard')) {
      setLoadingText('Loading Dashboard')
    } else if (pathname.includes('/calendar')) {
      setLoadingText('Loading Calendar')
    } else if (pathname.includes('/clients')) {
      setLoadingText('Loading Clients')
    } else if (pathname.includes('/staff')) {
      setLoadingText('Loading Staff')
    } else if (pathname.includes('/products')) {
      setLoadingText('Loading Products')
    } else if (pathname.includes('/walk-in')) {
      setLoadingText('Loading Walk-in')
    } else if (pathname.includes('/reports')) {
      setLoadingText('Loading Reports')
    } else if (pathname.includes('/withdrawal')) {
      setLoadingText('Loading Withdrawal')
    } else if (pathname.includes('/settings')) {
      setLoadingText('Loading Settings')
    } else {
      setLoadingText('Loading')
    }

    // Hide loader after a short delay to allow page to render
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname])

  if (!isLoading) return null

  return <PageLoader text={loadingText} />
}
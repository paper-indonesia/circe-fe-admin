"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { GuidedTour } from "./guided-tour"
import { usePathname } from "next/navigation"

export function FTUEProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [showTour, setShowTour] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkFTUE() {
      if (!user) {
        setLoading(false)
        return
      }

      // Only show on dashboard after onboarding is complete
      if (pathname !== '/dashboard') {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/settings/terminology')
        if (response.ok) {
          const data = await response.json()

          // Show tour if onboarding is completed but FTUE not done yet
          const ftueCompleted = localStorage.getItem('ftue-completed')

          if (data.onboardingCompleted && !ftueCompleted) {
            // Small delay to let dashboard render
            setTimeout(() => {
              setShowTour(true)
            }, 1000)
          }
        }
      } catch (error) {
        console.error('Failed to check FTUE status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkFTUE()
  }, [user, pathname])

  const handleCompleteTour = () => {
    localStorage.setItem('ftue-completed', 'true')
    setShowTour(false)
  }

  const handleSkipTour = () => {
    localStorage.setItem('ftue-completed', 'true')
    setShowTour(false)
  }

  // Define tour steps
  const tourSteps = [
    {
      target: '[data-tour="sidebar-dashboard"]',
      title: "Welcome to Your Dashboard! 🎉",
      description: "This is your command center. Here you'll see an overview of your bookings, revenue, and key metrics at a glance.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-calendar"]',
      title: "Calendar & Scheduling 📅",
      description: "Manage all your bookings here. View appointments in calendar or list mode, create new bookings, and track your schedule.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-clients"]',
      title: "Your Customers 👥",
      description: "Manage your customer database. Add new customers, view their history, and track their preferences.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-staff"]',
      title: "Manage Your Staff 👨‍💼",
      description: "Add and manage your staff members. Set their schedules, assign services, and track their performance.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-treatments"]',
      title: "Your Products ⭐",
      description: "Create and manage your products and services. Set prices, durations, and assign them to your staff.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-walkin"]',
      title: "Walk-in Bookings 🚶",
      description: "Quick booking feature for walk-in customers. Perfect for handling last-minute appointments without going through the full booking flow.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-reports"]',
      title: "Reports & Analytics 📊",
      description: "View detailed reports about your business performance. Track revenue, popular products, and staff performance.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-withdrawal"]',
      title: "Manage Your Earnings 💰",
      description: "Track your earnings and request withdrawals. Monitor your revenue and manage your finances all in one place.",
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-settings"]',
      title: "Settings & Preferences ⚙️",
      description: "Customize your workspace. Update business information, manage notifications, security settings, and configure your preferences.",
      position: "right" as const,
      highlight: true
    },
  ]

  if (loading) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {showTour && (
        <GuidedTour
          steps={tourSteps}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTour}
        />
      )}
    </>
  )
}
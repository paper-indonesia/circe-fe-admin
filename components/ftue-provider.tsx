"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useTerminology } from "@/hooks/use-terminology"
import { GuidedTour } from "./guided-tour"
import { usePathname } from "next/navigation"

export function FTUEProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const terminology = useTerminology()
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

  // Define tour steps with dynamic terminology
  const tourSteps = [
    {
      target: '[data-tour="sidebar-dashboard"]',
      title: "Welcome to Your Dashboard! 🎉",
      description: `This is your command center. Here you'll see an overview of your ${terminology.booking.toLowerCase()}, revenue, and key metrics at a glance.`,
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-calendar"]',
      title: "Calendar & Scheduling 📅",
      description: `Manage all your ${terminology.booking.toLowerCase()} here. View appointments in calendar or list mode, create new bookings, and track your schedule.`,
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-clients"]',
      title: `Your ${terminology.patient} 👥`,
      description: `Manage your ${terminology.patient.toLowerCase()} database. Add new ${terminology.patient.toLowerCase()}, view their history, and track their preferences.`,
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-staff"]',
      title: `Manage Your ${terminology.staff} 👨‍💼`,
      description: `Add and manage your ${terminology.staff.toLowerCase()}. Set their schedules, assign services, and track their performance.`,
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-treatments"]',
      title: `Your ${terminology.treatment} ⭐`,
      description: `Create and manage your ${terminology.treatment.toLowerCase()}. Set prices, durations, and assign them to your ${terminology.staff.toLowerCase()}.`,
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-walkin"]',
      title: "Walk-in Bookings 🚶",
      description: `Quick booking feature for walk-in ${terminology.patient.toLowerCase()}. Perfect for handling last-minute appointments without going through the full booking flow.`,
      position: "right" as const,
      highlight: true
    },
    {
      target: '[data-tour="sidebar-reports"]',
      title: "Reports & Analytics 📊",
      description: `View detailed reports about your business performance. Track revenue, popular ${terminology.treatment.toLowerCase()}, and ${terminology.staff.toLowerCase()} performance.`,
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
      title: "Settings & Customization ⚙️",
      description: "Customize your workspace. Update business information, change terminology, manage categories, and configure your preferences.",
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
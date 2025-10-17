"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Rocket, ChevronRight } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"

interface OnboardingResumeBannerProps {
  onResume: () => void
}

export function OnboardingResumeBanner({ onResume }: OnboardingResumeBannerProps) {
  const { progress } = useOperationalOnboarding()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only check localStorage progress for incomplete items
    const savedProgress = localStorage.getItem('operational-onboarding-progress')

    let hasIncompleteProgress = false

    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress)
        // Show banner only if there's partial progress but not completed
        hasIncompleteProgress =
          !parsed.isCompleted &&
          parsed.currentStep > 1 && // Started but not on first step
          parsed.currentStep <= 4
      } catch (error) {
        console.error('Failed to parse onboarding progress:', error)
      }
    }

    const notCompleted = !progress.isCompleted

    // Check if user dismissed the banner
    const isDismissed = sessionStorage.getItem('onboarding-banner-dismissed') === 'true'

    setShow(hasIncompleteProgress && notCompleted && !isDismissed && !dismissed)
  }, [progress, dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('onboarding-banner-dismissed', 'true')
  }

  const handleResume = () => {
    onResume()
  }

  const calculateProgress = () => {
    let completed = 0
    const total = 4

    if (progress.outlets.length > 0) completed++
    if (progress.users.length > 0) completed++
    if (progress.products.length > 0) completed++
    if (progress.staff.length > 0 && progress.availabilities.length > 0) completed++

    return (completed / total) * 100
  }

  const getProgressMessage = () => {
    if (progress.currentStep === 1 && progress.outlets.length === 0) {
      return "Mulai dengan menambahkan outlet pertama Anda"
    }
    if (progress.currentStep === 2 && progress.users.length === 0) {
      return "Lanjutkan dengan menambahkan user internal"
    }
    if (progress.currentStep === 3 && progress.products.length === 0) {
      return "Tambahkan layanan yang bisa dibooking"
    }
    if (progress.currentStep === 4) {
      return "Hampir selesai! Atur staff dan ketersediaan"
    }
    return "Lanjutkan setup untuk mulai terima booking"
  }

  if (!show) return null

  const progressPercent = calculateProgress()

  return (
    <Alert className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="bg-blue-100 rounded-lg p-2 mt-0.5">
            <Rocket className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Setup Belum Selesai</h3>
              <span className="text-sm text-gray-600">{Math.round(progressPercent)}% selesai</span>
            </div>
            <Progress value={progressPercent} className="h-2 mb-3" />
            <AlertDescription className="text-sm text-gray-700 mb-3">
              {getProgressMessage()}
            </AlertDescription>
            <Button
              onClick={handleResume}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Lanjutkan Setup
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  )
}

"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"

interface SetupIncompleteBannerProps {
  /** Show on specific feature pages like Calendar, Walk-in */
  showOn?: "calendar" | "walk-in" | "all"
}

export function SetupIncompleteBanner({ showOn = "all" }: SetupIncompleteBannerProps) {
  const { hasCompletedStep, resumeWizard } = useOperationalOnboarding()
  const [incompleteSteps, setIncompleteSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    async function checkCompletion() {
      try {
        const [hasOutlet, hasProduct, hasStaff] = await Promise.all([
          hasCompletedStep(1),
          hasCompletedStep(2),
          hasCompletedStep(3),
        ])

        const incomplete: string[] = []
        if (!hasOutlet) incomplete.push("Outlet")
        if (!hasProduct) incomplete.push("Products")
        if (!hasStaff) incomplete.push("Staff")

        setIncompleteSteps(incomplete)
      } catch (error) {
        console.error("Failed to check setup completion:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkCompletion()
  }, [hasCompletedStep])

  const handleCompleteSetup = () => {
    resumeWizard()
    // Reload to show wizard
    window.location.href = "/dashboard"
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Store dismissal in sessionStorage (only for current session)
    sessionStorage.setItem("setup-banner-dismissed", "true")
  }

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem("setup-banner-dismissed")
    if (dismissed === "true") {
      setIsDismissed(true)
    }
  }, [])

  // Don't show if loading, dismissed, or all steps are complete
  if (isLoading || isDismissed || incompleteSteps.length === 0) {
    return null
  }

  // Build dynamic message
  const stepText = incompleteSteps.join(" and ")
  const message = `Complete your setup (${stepText}) to start booking`

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-yellow-800">
            {message}
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            You need to complete the initial setup to use booking features in Calendar or Walk-in.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={handleCompleteSetup}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Complete Setup
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-yellow-600 hover:bg-yellow-100"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ChevronRight, Building2, Package, Users } from "lucide-react"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"

interface SetupStep {
  id: number
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  completed: boolean
}

export function DashboardSetupCard() {
  const { hasCompletedStep, resumeWizard, progress } = useOperationalOnboarding()
  const [steps, setSteps] = useState<SetupStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    async function checkSteps() {
      try {
        const [hasOutlet, hasProduct, hasStaff] = await Promise.all([
          hasCompletedStep(1),
          hasCompletedStep(2),
          hasCompletedStep(3),
        ])

        const setupSteps: SetupStep[] = [
          {
            id: 1,
            name: "Create Outlet",
            description: "Add your business location",
            icon: Building2,
            completed: hasOutlet,
          },
          {
            id: 2,
            name: "Add Products/Services",
            description: "List your bookable services",
            icon: Package,
            completed: hasProduct,
          },
          {
            id: 3,
            name: "Setup Staff",
            description: "Add staff and availability",
            icon: Users,
            completed: hasStaff,
          },
        ]

        setSteps(setupSteps)
        setIsComplete(hasOutlet && hasProduct && hasStaff)
      } catch (error) {
        console.error("Failed to check setup steps:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSteps()
  }, [hasCompletedStep])

  const handleContinueSetup = () => {
    resumeWizard()
    // Trigger reload to show wizard
    window.location.reload()
  }

  // Hide card if setup is complete or dismissed
  if (isLoading || isComplete || progress.isDismissed) {
    return null
  }

  const completedCount = steps.filter(s => s.completed).length
  const totalCount = steps.length
  const progressPercentage = (completedCount / totalCount) * 100

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          Complete Your Setup
        </CardTitle>
        <CardDescription>
          {completedCount} of {totalCount} steps completed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-600">
            {progressPercentage === 100 ? "All done!" : `${Math.round(progressPercentage)}% complete`}
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  step.completed ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <Icon className={`h-4 w-4 flex-shrink-0 ${step.completed ? "text-green-600" : "text-gray-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${step.completed ? "text-green-900" : "text-gray-900"}`}>
                    {step.name}
                  </p>
                  <p className={`text-xs ${step.completed ? "text-green-700" : "text-gray-600"}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <Button
          onClick={handleContinueSetup}
          className="w-full gap-2"
          size="lg"
        >
          Continue Setup
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubscriptionWarningBanner } from "./subscription-warning-banner"
import {
  Bug,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  AlertTriangle,
  XCircle,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface TestScenario {
  id: string
  name: string
  description: string
  daysUntilExpiry: number
  status: 'active' | 'expired' | 'cancelled'
  icon: any
  color: string
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'expired',
    name: 'EXPIRED',
    description: 'Subscription has already expired',
    daysUntilExpiry: -1,
    status: 'expired',
    icon: XCircle,
    color: 'bg-red-100 border-red-300 text-red-700'
  },
  {
    id: 'critical-1day',
    name: 'CRITICAL: 1 Day Left',
    description: 'Expires tomorrow - most urgent',
    daysUntilExpiry: 1,
    status: 'active',
    icon: AlertTriangle,
    color: 'bg-red-100 border-red-300 text-red-700'
  },
  {
    id: 'urgent-3days',
    name: 'URGENT: 3 Days Left',
    description: 'Very urgent warning',
    daysUntilExpiry: 3,
    status: 'active',
    icon: AlertTriangle,
    color: 'bg-orange-100 border-orange-300 text-orange-700'
  },
  {
    id: 'warning-7days',
    name: 'WARNING: 7 Days Left',
    description: 'Standard warning period',
    daysUntilExpiry: 7,
    status: 'active',
    icon: Clock,
    color: 'bg-yellow-100 border-yellow-300 text-yellow-700'
  },
  {
    id: 'info-14days',
    name: 'INFO: 14 Days Left',
    description: 'Early reminder, dismissable',
    daysUntilExpiry: 14,
    status: 'active',
    icon: Calendar,
    color: 'bg-blue-100 border-blue-300 text-blue-700'
  },
  {
    id: 'no-warning',
    name: 'NO WARNING',
    description: 'More than 14 days left',
    daysUntilExpiry: 30,
    status: 'active',
    icon: Eye,
    color: 'bg-green-100 border-green-300 text-green-700'
  }
]

export function SubscriptionWarningDebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  const handleTestScenario = (scenario: TestScenario) => {
    setSelectedScenario(scenario)
    setShowBanner(true)

    // Auto-hide panel after selection
    setTimeout(() => {
      setIsOpen(false)
    }, 300)
  }

  const handleReset = () => {
    setSelectedScenario(null)
    setShowBanner(false)
  }

  return (
    <>
      {/* Floating Debug Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "rounded-full h-14 w-14 shadow-2xl",
            "bg-gradient-to-r from-purple-600 to-pink-600",
            "hover:from-purple-700 hover:to-pink-700",
            "transition-all duration-300",
            isOpen ? "rotate-180" : ""
          )}
        >
          {isOpen ? <EyeOff className="h-6 w-6" /> : <Bug className="h-6 w-6" />}
        </Button>
      </div>

      {/* Debug Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 w-96 z-50 shadow-2xl border-2 border-purple-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bug className="h-5 w-5" />
                  Subscription Warning Tester
                </CardTitle>
                <CardDescription>
                  Test all warning scenarios
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-yellow-100">
                DEBUG MODE
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {TEST_SCENARIOS.map((scenario) => {
                const Icon = scenario.icon
                const isActive = selectedScenario?.id === scenario.id

                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleTestScenario(scenario)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg border-2 transition-all",
                      "hover:shadow-md hover:scale-[1.02]",
                      scenario.color,
                      isActive && "ring-2 ring-purple-500 ring-offset-2"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm flex items-center gap-2">
                          {scenario.name}
                          {isActive && (
                            <Badge variant="secondary" className="text-xs">
                              ACTIVE
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs mt-1 opacity-75">
                          {scenario.description}
                        </div>
                        <div className="text-xs mt-1 font-mono opacity-60">
                          Days: {scenario.daysUntilExpiry} | Status: {scenario.status}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Reset Button */}
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Real Data
            </Button>

            {/* Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xs text-blue-700">
                <div className="font-bold mb-1">💡 Testing Instructions:</div>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Click any scenario to test warning display</li>
                  <li>Banner shows at top of dashboard</li>
                  <li>Try dismissing warnings (if allowed)</li>
                  <li>Check responsive design on mobile</li>
                  <li>Reset to see real subscription data</li>
                </ul>
              </div>
            </div>

            {/* Warning */}
            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
              <div className="text-xs text-yellow-700 font-bold">
                ⚠️ Remember to remove this panel before production!
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Display Test Banner */}
      {showBanner && selectedScenario && (
        <div className="fixed top-4 left-4 right-4 z-40 max-w-4xl mx-auto">
          <SubscriptionWarningBanner
            debugMode={true}
            debugDaysUntilExpiry={selectedScenario.daysUntilExpiry}
            debugStatus={selectedScenario.status}
          />
        </div>
      )}
    </>
  )
}

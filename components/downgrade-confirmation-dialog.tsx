"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertTriangle, ArrowDown, Building2, Users, Calendar, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanLimits {
  max_outlets: number
  max_staff_per_outlet: number
  max_appointments_per_month: number
  max_services: number
}

interface CurrentUsage {
  outlets: number
  staff: number
  appointments: number
  services: number
}

interface DowngradeConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  currentPlan: string
  currentLimits: PlanLimits
  freePlanLimits: PlanLimits
  currentUsage?: CurrentUsage
  expiryDate?: string
}

export function DowngradeConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  currentPlan,
  currentLimits,
  freePlanLimits,
  currentUsage,
  expiryDate
}: DowngradeConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  const formatLimit = (value: number) => {
    return value === -1 ? "Unlimited" : value.toLocaleString()
  }

  const getImpactLevel = (current: number, newLimit: number): "safe" | "warning" | "danger" => {
    if (newLimit === -1) return "safe"
    if (current <= newLimit) return "safe"
    if (current <= newLimit * 1.5) return "warning"
    return "danger"
  }

  const impactItems = [
    {
      icon: Building2,
      label: "Outlets",
      current: formatLimit(currentLimits.max_outlets),
      new: formatLimit(freePlanLimits.max_outlets),
      usage: currentUsage?.outlets,
      impact: currentUsage ? getImpactLevel(currentUsage.outlets, freePlanLimits.max_outlets) : "safe"
    },
    {
      icon: Users,
      label: "Staff per Outlet",
      current: formatLimit(currentLimits.max_staff_per_outlet),
      new: formatLimit(freePlanLimits.max_staff_per_outlet),
      usage: currentUsage?.staff,
      impact: currentUsage ? getImpactLevel(currentUsage.staff, freePlanLimits.max_staff_per_outlet) : "safe"
    },
    {
      icon: Calendar,
      label: "Appointments/Month",
      current: formatLimit(currentLimits.max_appointments_per_month),
      new: formatLimit(freePlanLimits.max_appointments_per_month),
      usage: currentUsage?.appointments,
      impact: currentUsage ? getImpactLevel(currentUsage.appointments, freePlanLimits.max_appointments_per_month) : "safe"
    },
    {
      icon: Briefcase,
      label: "Services",
      current: formatLimit(currentLimits.max_services),
      new: formatLimit(freePlanLimits.max_services),
      usage: currentUsage?.services,
      impact: currentUsage ? getImpactLevel(currentUsage.services, freePlanLimits.max_services) : "safe"
    }
  ]

  const hasExceedingLimits = impactItems.some(item => item.impact === "danger")

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Downgrade to Free Plan
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Your <Badge variant="secondary" className="mx-1">{currentPlan}</Badge> plan
                {expiryDate && <> expired on <span className="font-medium">{expiryDate}</span></>}.
                You will be downgraded to the Free plan with the following limitations:
              </p>

              {/* Impact Table */}
              <div className="rounded-lg border bg-gray-50 overflow-hidden">
                <div className="grid grid-cols-4 gap-2 p-3 bg-gray-100 text-xs font-medium text-gray-600 border-b">
                  <div>Feature</div>
                  <div className="text-center">{currentPlan}</div>
                  <div className="text-center">Free</div>
                  <div className="text-center">Your Usage</div>
                </div>
                {impactItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={index}
                      className={cn(
                        "grid grid-cols-4 gap-2 p-3 text-sm items-center",
                        index !== impactItems.length - 1 && "border-b",
                        item.impact === "danger" && "bg-red-50",
                        item.impact === "warning" && "bg-yellow-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{item.label}</span>
                      </div>
                      <div className="text-center font-medium text-gray-600">{item.current}</div>
                      <div className="text-center flex items-center justify-center gap-1">
                        <ArrowDown className="h-3 w-3 text-red-500" />
                        <span className="font-medium text-red-600">{item.new}</span>
                      </div>
                      <div className={cn(
                        "text-center font-medium",
                        item.impact === "danger" && "text-red-600",
                        item.impact === "warning" && "text-yellow-600",
                        item.impact === "safe" && "text-green-600"
                      )}>
                        {item.usage !== undefined ? item.usage.toLocaleString() : "-"}
                        {item.impact === "danger" && item.usage !== undefined && (
                          <span className="text-xs ml-1">(exceeds)</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Warning Messages */}
              {hasExceedingLimits && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Some resources exceed Free plan limits:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-red-600">
                        {currentUsage && currentUsage.outlets > freePlanLimits.max_outlets && freePlanLimits.max_outlets !== -1 && (
                          <li>Only 1 outlet will remain active (oldest outlet kept). Other outlets will be deactivated.</li>
                        )}
                        {currentUsage && currentUsage.staff > freePlanLimits.max_staff_per_outlet && freePlanLimits.max_staff_per_outlet !== -1 && (
                          <li>Staff beyond {freePlanLimits.max_staff_per_outlet} per outlet will lose access.</li>
                        )}
                        {currentUsage && currentUsage.services > freePlanLimits.max_services && freePlanLimits.max_services !== -1 && (
                          <li>Services beyond {freePlanLimits.max_services} will be hidden.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> Your data will be retained for 30 days.
                  You can upgrade anytime to restore full access.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Downgrade"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

"use client"

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
import { Progress } from "@/components/ui/progress"
import {
  Loader2,
  AlertTriangle,
  ArrowDown,
  Building2,
  Users,
  Calendar,
  Briefcase,
  CheckCircle2,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanLimits {
  max_outlets: number
  max_staff_per_outlet: number
  max_appointments_per_month: number
  max_services: number
}

interface DowngradeProgress {
  isProcessing: boolean
  currentStep: string
  totalSteps: number
  completedSteps: number
  deletedItems: { type: string; count: number }[]
}

interface DowngradeConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  currentPlan: string
  currentLimits: PlanLimits
  freePlanLimits: PlanLimits
  resourceCounts: { outlets: number; services: number; staff: number } | null
  resourcesToDelete: { outlets: number; services: number; staff: number }
  progress: DowngradeProgress
}

export function DowngradeConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  currentPlan,
  currentLimits,
  freePlanLimits,
  resourceCounts,
  resourcesToDelete,
  progress
}: DowngradeConfirmDialogProps) {

  const formatLimit = (value: number) => {
    return value === -1 ? "Unlimited" : value.toLocaleString()
  }

  const hasResourcesToDelete = resourcesToDelete.outlets > 0 || resourcesToDelete.services > 0 || resourcesToDelete.staff > 0

  const impactItems = [
    {
      icon: Building2,
      label: "Outlets",
      current: formatLimit(currentLimits.max_outlets),
      new: formatLimit(freePlanLimits.max_outlets),
      usage: resourceCounts?.outlets || 0,
      toDelete: resourcesToDelete.outlets
    },
    {
      icon: Users,
      label: "Staff",
      current: formatLimit(currentLimits.max_staff_per_outlet),
      new: formatLimit(freePlanLimits.max_staff_per_outlet),
      usage: resourceCounts?.staff || 0,
      toDelete: resourcesToDelete.staff
    },
    {
      icon: Calendar,
      label: "Appointments/Bulan",
      current: formatLimit(currentLimits.max_appointments_per_month),
      new: formatLimit(freePlanLimits.max_appointments_per_month),
      usage: null,
      toDelete: 0
    },
    {
      icon: Briefcase,
      label: "Services",
      current: formatLimit(currentLimits.max_services),
      new: formatLimit(freePlanLimits.max_services),
      usage: resourceCounts?.services || 0,
      toDelete: resourcesToDelete.services
    }
  ]

  // Show progress view while processing
  if (progress.isProcessing) {
    const progressPercent = progress.totalSteps > 0
      ? (progress.completedSteps / progress.totalSteps) * 100
      : 0

    return (
      <AlertDialog open={open} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
              Memproses Downgrade...
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 pt-4">
                <Progress value={progressPercent} className="h-2" />

                <div className="text-center">
                  <p className="text-sm text-gray-600">{progress.currentStep}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {progress.completedSteps} / {progress.totalSteps} langkah selesai
                  </p>
                </div>

                {progress.deletedItems.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">Telah dihapus:</p>
                    <ul className="space-y-1">
                      {progress.deletedItems.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          {item.count} {item.type}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Konfirmasi Downgrade ke Free Plan
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Anda akan downgrade dari <Badge variant="secondary" className="mx-1">{currentPlan}</Badge>
                ke <Badge variant="outline" className="mx-1">FREE</Badge> plan dengan batasan berikut:
              </p>

              {/* Impact Table */}
              <div className="rounded-lg border bg-gray-50 overflow-hidden">
                <div className="grid grid-cols-4 gap-2 p-3 bg-gray-100 text-xs font-medium text-gray-600 border-b">
                  <div>Fitur</div>
                  <div className="text-center">{currentPlan}</div>
                  <div className="text-center">Free</div>
                  <div className="text-center">Milik Anda</div>
                </div>
                {impactItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={index}
                      className={cn(
                        "grid grid-cols-4 gap-2 p-3 text-sm items-center",
                        index !== impactItems.length - 1 && "border-b",
                        item.toDelete > 0 && "bg-red-50"
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
                        item.toDelete > 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {item.usage !== null ? item.usage.toLocaleString() : "-"}
                        {item.toDelete > 0 && (
                          <span className="text-xs block">({item.toDelete} dihapus)</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Warning if resources will be deleted */}
              {hasResourcesToDelete && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <div className="flex gap-2">
                    <Trash2 className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-700">
                      <p className="font-medium">Data berikut akan dihapus permanen:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-red-600">
                        {resourcesToDelete.outlets > 0 && (
                          <li>
                            <span className="font-semibold">{resourcesToDelete.outlets} outlet</span> akan dihapus
                            (outlet pertama dipertahankan)
                          </li>
                        )}
                        {resourcesToDelete.staff > 0 && (
                          <li>
                            <span className="font-semibold">{resourcesToDelete.staff} staff</span> akan dihapus
                            (hanya {freePlanLimits.max_staff_per_outlet} pertama dipertahankan)
                          </li>
                        )}
                        {resourcesToDelete.services > 0 && (
                          <li>
                            <span className="font-semibold">{resourcesToDelete.services} service</span> akan dihapus
                            (hanya {freePlanLimits.max_services} pertama dipertahankan)
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-700">
                  <span className="font-medium">Perhatian:</span> Tindakan ini tidak dapat dibatalkan.
                  Pastikan Anda sudah backup data penting sebelum melanjutkan.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {hasResourcesToDelete ? (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus & Downgrade
              </>
            ) : (
              "Konfirmasi Downgrade"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

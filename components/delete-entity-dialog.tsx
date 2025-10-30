"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Info, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface EntityDetail {
  label: string
  value: string | number | null | undefined
}

interface BlockerInfo {
  type: string
  message: string
  details?: string[]
}

interface DeleteEntityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: string // e.g., "Customer", "Staff", "Product", "Outlet"
  entityName: string // Display name of the entity being deleted
  entityDetails: EntityDetail[] // Details to show in the card
  onConfirmDelete: () => Promise<void>
  blocker?: BlockerInfo | null // Optional blocker that prevents deletion
  softDeleteImpacts?: string[] // Custom impacts for soft delete
}

const DEFAULT_SOFT_DELETE_IMPACTS = [
  "Entity will be marked as deleted and inactive",
  "Historical data will be preserved for audit purposes",
  "Data can be restored if needed"
]

export function DeleteEntityDialog({
  open,
  onOpenChange,
  entityType,
  entityName,
  entityDetails,
  onConfirmDelete,
  blocker,
  softDeleteImpacts = DEFAULT_SOFT_DELETE_IMPACTS
}: DeleteEntityDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmChecked, setConfirmChecked] = useState(false)

  // Reset checkbox when dialog opens/closes
  useEffect(() => {
    if (open) {
      setConfirmChecked(false)
      setIsDeleting(false)
    }
  }, [open])

  const handleDelete = async () => {
    if (!confirmChecked || blocker) return

    setIsDeleting(true)
    try {
      await onConfirmDelete()
      onOpenChange(false)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full sm:max-w-[520px] max-h-[85vh] p-0 gap-0 overflow-hidden">
        <div className="flex flex-col max-h-[85vh]">
          {/* Sticky Header - Danger Theme */}
          <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-700 px-5 py-3.5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2.5 text-white text-lg">
                <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
                Delete {entityType}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4">
            {/* Blocker Alert (if any) */}
            {blocker && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold text-sm">{blocker.message}</p>
                  {blocker.details && blocker.details.length > 0 && (
                    <ul className="text-xs space-y-1 mt-2">
                      {blocker.details.map((detail, index) => (
                        <li key={index}>• {detail}</li>
                      ))}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Better Alternative Suggestion for Products */}
            {entityType === "Product" && (
              <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-300">
                <Info className="h-4 w-4 text-green-700" />
                <AlertDescription>
                  <p className="font-semibold text-sm text-green-900 mb-1">💡 Better Alternative</p>
                  <p className="text-xs text-green-800">
                    Consider changing status to <strong>Inactive</strong> instead of deleting.
                    This keeps the product available for future use while hiding it from current bookings.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Soft Delete Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
              <div className="flex items-start gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 font-medium">
                  This {entityType.toLowerCase()} will be soft deleted (can be restored).
                </p>
              </div>
              <ul className="text-xs text-blue-700 space-y-1 ml-6">
                {softDeleteImpacts.map((impact, index) => (
                  <li key={index}>• {impact}</li>
                ))}
              </ul>
            </div>

            {/* Entity Details Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-1.5">
                <Trash2 className="h-4 w-4 text-gray-600" />
                {entityType} Details
              </h4>
              <div className="space-y-2">
                {entityDetails.map((detail, index) => (
                  <div key={index} className="flex justify-between py-1.5 border-b border-gray-200 last:border-0">
                    <span className="text-xs font-medium text-gray-600">{detail.label}:</span>
                    <span className="text-xs text-gray-900 font-semibold break-words text-right ml-2">
                      {detail.value || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation Checkbox */}
            {!blocker && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    id="confirm-delete"
                    checked={confirmChecked}
                    onCheckedChange={(checked) => setConfirmChecked(checked === true)}
                    disabled={isDeleting}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <label
                    htmlFor="confirm-delete"
                    className="text-xs font-medium text-amber-900 cursor-pointer select-none"
                  >
                    I understand this will soft delete{" "}
                    <span className="font-bold">{entityName}</span>. Undo available for 10 seconds.
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Footer */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-5 py-3">
            <div className="flex gap-2.5 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isDeleting}
                size="sm"
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={!confirmChecked || isDeleting || !!blocker}
                size="sm"
                className={cn(
                  blocker
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                )}
              >
                {isDeleting ? (
                  <>
                    <div className="h-3.5 w-3.5 mr-1.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete {entityType}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

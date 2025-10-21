"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronRight, ChevronLeft, Building2, Users, Package, Calendar, Briefcase, Layers } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { OutletSetupStep } from "./onboarding-steps/outlet-setup"
import { ProductServicesStep } from "./onboarding-steps/product-services"
import { StaffAvailabilityStep } from "./onboarding-steps/staff-availability"

interface OperationalOnboardingWizardProps {
  open: boolean
  onComplete: () => void
  initialStep?: number
}

const STEPS = [
  {
    number: 1,
    title: "Outlet Management",
    description: "Buat minimal 1 outlet untuk lokasi layanan Anda",
    icon: Building2,
    component: OutletSetupStep,
  },
  {
    number: 2,
    title: "Products / Services",
    description: "Tambahkan layanan yang bisa dibooking",
    icon: Package,
    component: ProductServicesStep,
  },
  {
    number: 3,
    title: "Staff + Availability",
    description: "Atur staff dan jam ketersediaan mereka",
    icon: Calendar,
    component: StaffAvailabilityStep,
  },
]

export function OperationalOnboardingWizard({ open, onComplete, initialStep = 1 }: OperationalOnboardingWizardProps) {
  const { toast } = useToast()
  const { progress, setCurrentStep, completeOnboarding, resetOnboarding } = useOperationalOnboarding()
  const [loading, setLoading] = useState(false)
  const [canProceed, setCanProceed] = useState(false)

  // Debug: Log canProceed changes
  useEffect(() => {
    console.log('[Wizard] canProceed changed:', canProceed, 'currentStep:', progress.currentStep)
  }, [canProceed, progress.currentStep])

  // Set initial step ONCE when component mounts
  useEffect(() => {
    if (initialStep && initialStep !== progress.currentStep) {
      console.log('[Wizard] Setting initial step:', initialStep)
      setCurrentStep(initialStep)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStep])

  // Stable validation callback - this is the ONLY way to update canProceed
  const handleValidChange = useCallback((isValid: boolean) => {
    console.log('[Wizard] onValidChange called:', isValid)
    setCanProceed(isValid)
  }, [])

  const currentStepData = STEPS[progress.currentStep - 1]
  const CurrentStepComponent = currentStepData?.component

  // Debug: Log render state
  console.log('[Wizard] Rendering with:', {
    canProceed,
    currentStep: progress.currentStep,
    outletsCount: progress.outlets.length,
    usersCount: progress.users.length,
    productsCount: progress.products.length,
    staffCount: progress.staff.length,
    loading,
    lanjutButtonDisabled: !canProceed,
    backButtonDisabled: loading,
    shouldShowBackButton: progress.currentStep > 1
  })

  const handleNext = async () => {
    if (progress.currentStep < STEPS.length) {
      console.log('[Wizard] Moving to next step from', progress.currentStep, 'to', progress.currentStep + 1)
      setLoading(true)
      setCurrentStep(progress.currentStep + 1)
      // Don't reset canProceed - let the next step component handle validation
      // Use requestAnimationFrame to ensure smooth transition
      await new Promise(resolve => requestAnimationFrame(() => {
        setTimeout(resolve, 50)
      }))
      setLoading(false)
    }
  }

  const handleBack = async () => {
    if (progress.currentStep > 1) {
      console.log('[Wizard] Moving to previous step from', progress.currentStep, 'to', progress.currentStep - 1)
      setLoading(true)
      setCurrentStep(progress.currentStep - 1)
      // Don't reset canProceed - let the step component handle validation
      // Use requestAnimationFrame to ensure smooth transition
      await new Promise(resolve => requestAnimationFrame(() => {
        setTimeout(resolve, 50)
      }))
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      await completeOnboarding()
      toast({
        title: "Onboarding Selesai",
        description: "Setup awal berhasil, Anda siap melakukan booking",
      })
      onComplete()
    } catch (error) {
      console.error("Failed to complete onboarding:", error)
      toast({
        title: "Error",
        description: "Gagal menyelesaikan onboarding. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if we're on the final step
  const isFinalStep = progress.currentStep === STEPS.length

  const handleClearAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua progress onboarding? Tindakan ini tidak dapat dibatalkan.")) {
      resetOnboarding()
      toast({
        title: "Progress Dihapus",
        description: "Semua data onboarding telah dihapus",
      })
    }
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  const pageTransition = {
    duration: 0.2,
    ease: "easeInOut"
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[1120px] max-h-[90vh] p-0 gap-0 border-0 rounded-2xl shadow-2xl overflow-hidden overflow-x-hidden">
        <div className="flex flex-col h-full max-h-[90vh] overflow-x-hidden">
        {/* Header with Progress */}
        <div className="flex-shrink-0 bg-white border-b px-6 py-5 rounded-t-2xl overflow-x-hidden">
          <div className="flex items-start justify-between gap-6 mb-4 max-w-full">
            {/* Left: Title + Subtitle */}
            <div className="flex-shrink-0 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                Setup Awal Sistem
              </h2>
              <p className="text-sm text-gray-600 mt-1 truncate">Lengkapi {STEPS.length} langkah berikut agar siap melakukan booking</p>
            </div>

            {/* Center: Stepper (one line on desktop) */}
            <div className="flex-1 flex items-center justify-center min-w-0 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-max">
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  const isActive = progress.currentStep === step.number
                  const isCompleted = progress.currentStep > step.number

                  return (
                    <div key={step.number} className="flex items-center">
                      {/* Step Circle */}
                      <div className="flex flex-col items-center group cursor-default">
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                          isActive
                            ? "bg-blue-500 text-white ring-4 ring-blue-100"
                            : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}>
                          {isCompleted ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <span className="text-sm font-bold">{step.number}</span>
                          )}
                        </div>
                        <p className={`text-xs font-medium mt-1 whitespace-nowrap ${
                          isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                        }`}>
                          {step.title}
                        </p>
                      </div>

                      {/* Connector Line */}
                      {index < STEPS.length - 1 && (
                        <div className={`w-12 h-0.5 mx-2 transition-colors ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right: Badge */}
            <div className="flex-shrink-0">
              <Badge variant="secondary" className="text-xs px-3 py-1.5 whitespace-nowrap">
                Langkah {progress.currentStep} dari {STEPS.length}
              </Badge>
            </div>
          </div>
        </div>

        {/* Content - Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pt-6 pb-8 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={progress.currentStep}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
              className="max-w-full overflow-x-hidden"
            >
              {CurrentStepComponent && (
                <CurrentStepComponent onValidChange={handleValidChange} />
              )}

              {/* Final Step Message */}
              {isFinalStep && canProceed && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 p-5 border-2 border-blue-200 bg-blue-50 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Check className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-2">Hampir Selesai!</h4>
                      <p className="text-sm text-blue-700">
                        Anda juga dapat menambahkan / mengedit staff, produk, dan jadwal pada menu Reserva dibagian kiri.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 bg-white border-t px-6 py-4 rounded-b-2xl">
          <div className="flex items-center justify-between">
            {/* Left: Clear All or Back */}
            <div className="flex items-center gap-3">
              {progress.currentStep === 1 && (progress.outlets.length > 0 || progress.users.length > 0 || progress.products.length > 0 || progress.staff.length > 0) ? (
                <Button
                  variant="ghost"
                  onClick={handleClearAll}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear All
                </Button>
              ) : progress.currentStep > 1 ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    console.log('[Wizard] Back button clicked! loading:', loading)
                    handleBack()
                  }}
                  disabled={loading}
                  className="gap-2"
                  data-loading={loading}
                  data-current-step={progress.currentStep}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"
                    />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                  {loading ? "Loading..." : "Kembali"}
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              {progress.currentStep < STEPS.length ? (
                <Button
                  onClick={() => {
                    console.log('[Wizard] Button clicked! canProceed:', canProceed)
                    handleNext()
                  }}
                  disabled={!canProceed || loading}
                  className="h-12 px-8 gap-2"
                  data-can-proceed={canProceed}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Loading...
                    </>
                  ) : (
                    <>
                      Lanjut
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed || loading}
                  className="h-12 px-8 gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Selesai
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

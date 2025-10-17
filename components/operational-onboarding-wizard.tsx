"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronRight, ChevronLeft, Building2, Users, Package, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useOperationalOnboarding } from "@/lib/operational-onboarding-context"
import { OutletSetupStep } from "./onboarding-steps/outlet-setup"
import { UserManagementStep } from "./onboarding-steps/user-management"
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
    title: "User Management",
    description: "Tambahkan user internal sesuai kebutuhan",
    icon: Users,
    component: UserManagementStep,
  },
  {
    number: 3,
    title: "Products / Services",
    description: "Tambahkan layanan yang bisa dibooking",
    icon: Package,
    component: ProductServicesStep,
  },
  {
    number: 4,
    title: "Staff + Availability",
    description: "Atur staff dan jam ketersediaan mereka",
    icon: Calendar,
    component: StaffAvailabilityStep,
  },
]

export function OperationalOnboardingWizard({ open, onComplete, initialStep = 1 }: OperationalOnboardingWizardProps) {
  const { toast } = useToast()
  const { progress, setCurrentStep, completeOnboarding } = useOperationalOnboarding()
  const [loading, setLoading] = useState(false)
  const [canProceed, setCanProceed] = useState(false)

  // Set initial step when component mounts
  useEffect(() => {
    if (initialStep && initialStep !== progress.currentStep) {
      setCurrentStep(initialStep)
    }
  }, [initialStep, setCurrentStep])

  const currentStepData = STEPS[progress.currentStep - 1]
  const CurrentStepComponent = currentStepData?.component

  const handleNext = () => {
    if (progress.currentStep < STEPS.length) {
      setCurrentStep(progress.currentStep + 1)
      setCanProceed(false)
    }
  }

  const handleBack = () => {
    if (progress.currentStep > 1) {
      setCurrentStep(progress.currentStep - 1)
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

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  // Check if current step requirements are met
  useEffect(() => {
    switch (progress.currentStep) {
      case 1:
        setCanProceed(progress.outlets.length > 0)
        break
      case 2:
        setCanProceed(progress.users.length > 0)
        break
      case 3:
        setCanProceed(progress.products.length > 0)
        break
      case 4:
        setCanProceed(progress.staff.length > 0 && progress.availabilities.length > 0)
        break
      default:
        setCanProceed(false)
    }
  }, [progress])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 gap-0 border-0">
        {/* Header with Progress */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Setup Awal Sistem
              </h2>
              <p className="text-sm text-gray-600 mt-1">Lengkapi 4 langkah berikut agar siap melakukan booking</p>
            </div>
            <Badge variant="secondary" className="text-xs px-3 py-1">
              Langkah {progress.currentStep} dari {STEPS.length}
            </Badge>
          </div>

          {/* Progress Steps */}
          <div className="flex gap-4">
            {STEPS.map((step) => {
              const Icon = step.icon
              const isActive = progress.currentStep === step.number
              const isCompleted = progress.currentStep > step.number

              return (
                <div key={step.number} className="flex-1">
                  <div className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-50"
                      : isCompleted
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isActive
                        ? "bg-blue-500 text-white"
                        : isCompleted
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-gray-600"
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isActive ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600"
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{step.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 240px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={progress.currentStep}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {CurrentStepComponent && (
                <CurrentStepComponent onValidChange={setCanProceed} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-white border-t px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              {progress.currentStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={loading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {progress.currentStep < STEPS.length ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="h-12 px-8 gap-2"
                >
                  Lanjut
                  <ChevronRight className="h-4 w-4" />
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
      </DialogContent>
    </Dialog>
  )
}

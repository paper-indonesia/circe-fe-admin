"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Sparkles, Check } from "lucide-react"
import confetti from "canvas-confetti"

interface TourStep {
  target: string
  title: string
  description: string
  position: "top" | "bottom" | "left" | "right"
  highlight?: boolean
}

interface GuidedTourProps {
  steps: TourStep[]
  onComplete: () => void
  onSkip: () => void
}

export function GuidedTour({ steps, onComplete, onSkip }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    const element = document.querySelector(steps[currentStep]?.target) as HTMLElement
    if (element) {
      setTargetElement(element)

      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" })

      // Calculate tooltip position
      const rect = element.getBoundingClientRect()
      const position = steps[currentStep].position

      let top = 0
      let left = 0

      switch (position) {
        case "bottom":
          top = rect.bottom + window.scrollY + 20
          left = rect.left + window.scrollX + rect.width / 2
          break
        case "top":
          top = rect.top + window.scrollY - 20
          left = rect.left + window.scrollX + rect.width / 2
          break
        case "left":
          top = rect.top + window.scrollY + rect.height / 2
          left = rect.left + window.scrollX - 20
          break
        case "right":
          top = rect.top + window.scrollY + rect.height / 2
          left = rect.right + window.scrollX + 20
          break
      }

      setTooltipPosition({ top, left })

      // Add highlight with better visibility
      if (steps[currentStep].highlight) {
        element.style.position = "relative"
        element.style.zIndex = "10001"
        element.style.backgroundColor = "white"
        element.style.boxShadow = "0 0 0 4px rgba(168, 85, 247, 0.6), 0 0 0 99999px rgba(0, 0, 0, 0.75)"
        element.style.borderRadius = "12px"
        element.style.transition = "all 0.3s ease"
      }
    }

    return () => {
      if (targetElement) {
        targetElement.style.position = ""
        targetElement.style.zIndex = ""
        targetElement.style.backgroundColor = ""
        targetElement.style.boxShadow = ""
        targetElement.style.transition = ""
      }
    }
  }, [currentStep, steps, targetElement])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#A855F7', '#EC4899', '#3B82F6']
    })

    onComplete()
  }

  const handleSkip = () => {
    if (targetElement) {
      targetElement.style.position = ""
      targetElement.style.zIndex = ""
      targetElement.style.backgroundColor = ""
      targetElement.style.boxShadow = ""
      targetElement.style.transition = ""
    }
    onSkip()
  }

  const getTooltipStyle = () => {
    const position = steps[currentStep].position
    let transform = ""

    switch (position) {
      case "bottom":
        transform = "translateX(-50%)"
        break
      case "top":
        transform = "translateX(-50%) translateY(-100%)"
        break
      case "left":
        transform = "translateX(-100%) translateY(-50%)"
        break
      case "right":
        transform = "translateY(-50%)"
        break
    }

    return {
      top: `${tooltipPosition.top}px`,
      left: `${tooltipPosition.left}px`,
      transform
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] pointer-events-none">
        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="absolute w-96 bg-white rounded-2xl shadow-2xl p-6 border-2 border-purple-300 pointer-events-auto"
          style={getTooltipStyle()}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium text-purple-600">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {steps[currentStep].description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-2 pt-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= currentStep
                      ? "bg-gradient-to-r from-purple-500 to-pink-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip Tour
              </Button>

              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 gap-1"
                >
                  {currentStep < steps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Complete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Arrow indicator */}
          <div
            className={`absolute w-0 h-0 border-8 ${
              steps[currentStep].position === "bottom"
                ? "border-transparent border-b-white -top-4 left-1/2 -translate-x-1/2"
                : steps[currentStep].position === "top"
                ? "border-transparent border-t-white -bottom-4 left-1/2 -translate-x-1/2"
                : steps[currentStep].position === "left"
                ? "border-transparent border-l-white -right-4 top-1/2 -translate-y-1/2"
                : "border-transparent border-r-white -left-4 top-1/2 -translate-y-1/2"
            }`}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
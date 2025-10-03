"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { industryTemplates, type IndustryTemplate } from "@/lib/industry-templates"
import { useToast } from "@/hooks/use-toast"
import { Check, ChevronRight, ChevronLeft, Sparkles, X, Plus, Rocket } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface OnboardingWizardProps {
  open: boolean
  onComplete: () => void
}

export function OnboardingWizard({ open, onComplete }: OnboardingWizardProps) {
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [customTerminology, setCustomTerminology] = useState({
    staff: "",
    treatment: "",
    patient: "",
    booking: "",
  })
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [categoryInput, setCategoryInput] = useState("")
  const [loading, setLoading] = useState(false)

  // Load business name from localStorage (set during signup)
  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.name) {
          setBusinessName(user.name)
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error)
      }
    }
  }, [])

  const handleTemplateSelect = (template: IndustryTemplate) => {
    setSelectedTemplate(template)
    setCustomTerminology({
      staff: "Staff",
      treatment: "Products",
      patient: "Customers",
      booking: "Bookings",
    })
    setCustomCategories([...template.categories])
  }

  const handleAddCategory = () => {
    if (categoryInput.trim() && !customCategories.includes(categoryInput.trim())) {
      setCustomCategories([...customCategories, categoryInput.trim()])
      setCategoryInput("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setCustomCategories(customCategories.filter((c) => c !== category))
  }

  const handleComplete = async () => {
    if (!selectedTemplate || !businessName.trim()) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/settings/terminology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType: selectedTemplate.businessType,
          businessName: businessName.trim(),
          terminology: {
            staff: customTerminology.staff,
            staffSingular: customTerminology.staff.replace(/s$/, ""),
            treatment: customTerminology.treatment,
            treatmentSingular: customTerminology.treatment.replace(/s$/, ""),
            patient: customTerminology.patient,
            patientSingular: customTerminology.patient.replace(/s$/, ""),
            booking: customTerminology.booking,
            bookingSingular: customTerminology.booking.replace(/s$/, ""),
          },
          categories: customCategories,
          customFields: {
            staff: [],
            treatment: [],
            patient: [],
          },
          onboardingCompleted: true,
        }),
      })

      if (response.ok) {
        toast({
          title: "🎉 Welcome aboard!",
          description: "Your workspace is ready to go!",
        })
        onComplete()
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
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

  const totalSteps = 3

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 gap-0 border-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        {/* Header with Progress */}
        <div className="relative bg-white/80 backdrop-blur-md border-b border-purple-100 px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Welcome to Reserva!
              </h2>
              <p className="text-sm text-gray-600 mt-1">Let's set up your workspace in just a few steps</p>
            </div>
            <Badge variant="secondary" className="text-xs px-3 py-1">
              Step {step} of {totalSteps}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                  initial={{ width: 0 }}
                  animate={{ width: step >= s ? '100%' : '0%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Business Type Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">What type of business do you run?</h3>
                  <p className="text-sm text-gray-600">Choose the option that best describes your business</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {industryTemplates.map((template) => (
                    <motion.div
                      key={template.businessType}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTemplateSelect(template)}
                      className={`relative cursor-pointer rounded-2xl p-6 border-2 transition-all ${
                        selectedTemplate?.businessType === template.businessType
                          ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-200"
                          : "border-gray-200 bg-white hover:border-purple-300 hover:shadow-md"
                      }`}
                    >
                      {selectedTemplate?.businessType === template.businessType && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-1"
                        >
                          <Check className="h-4 w-4 text-white" />
                        </motion.div>
                      )}

                      <div className="text-4xl mb-3 text-center">{template.icon}</div>
                      <h4 className="font-semibold text-center text-gray-900 mb-1">{template.label}</h4>
                      <p className="text-xs text-gray-500 text-center line-clamp-2">{template.description}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Your Business: {businessName}</p>
                      <p className="text-xs text-blue-700">This was set during signup. You can change it later in Settings.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Customize Terminology */}
            {step === 2 && selectedTemplate && (
              <motion.div
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Customize Your Terminology</h3>
                  <p className="text-sm text-gray-600">
                    We've pre-filled these based on <strong>{selectedTemplate.label}</strong>. Feel free to adjust them!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">What do you call your team members?</Label>
                    <Input
                      placeholder="e.g., Teachers, Trainers, Consultants"
                      value={customTerminology.staff}
                      onChange={(e) => setCustomTerminology({ ...customTerminology, staff: e.target.value })}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">💡 Use plural form (e.g., "Teachers")</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">What services do you provide?</Label>
                    <Input
                      placeholder="e.g., Subjects, Programs, Services"
                      value={customTerminology.treatment}
                      onChange={(e) => setCustomTerminology({ ...customTerminology, treatment: e.target.value })}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">💡 Use plural form (e.g., "Subjects")</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Who are your customers?</Label>
                    <Input
                      placeholder="e.g., Students, Members, Clients"
                      value={customTerminology.patient}
                      onChange={(e) => setCustomTerminology({ ...customTerminology, patient: e.target.value })}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">💡 Use plural form (e.g., "Students")</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">What do you call your reservations?</Label>
                    <Input
                      placeholder="e.g., Classes, Sessions, Appointments"
                      value={customTerminology.booking}
                      onChange={(e) => setCustomTerminology({ ...customTerminology, booking: e.target.value })}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-500">💡 Use plural form (e.g., "Classes")</p>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-900">
                    <strong>Preview:</strong> Your {customTerminology.patient.toLowerCase()} can book {customTerminology.booking.toLowerCase()} with your {customTerminology.staff.toLowerCase()} for various {customTerminology.treatment.toLowerCase()}.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Categories & Complete */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Your Service Categories</h3>
                  <p className="text-sm text-gray-600">
                    Add categories for your {customTerminology.treatment.toLowerCase()}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Mathematics, Premium Service, Weight Training"
                      value={categoryInput}
                      onChange={(e) => setCategoryInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                      className="h-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    />
                    <Button
                      type="button"
                      onClick={handleAddCategory}
                      className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {customCategories.length > 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Your Categories ({customCategories.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {customCategories.map((category) => (
                          <motion.div
                            key={category}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Badge
                              variant="secondary"
                              className="text-sm px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 border-0"
                            >
                              {category}
                              <button
                                onClick={() => handleRemoveCategory(category)}
                                className="ml-2 hover:text-red-600 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                      <p className="text-sm text-gray-500">No categories added yet. Add your first category above!</p>
                    </div>
                  )}
                </div>

                {/* Review Summary */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Your Setup Summary</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Business</p>
                      <p className="font-medium text-gray-900">{businessName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Type</p>
                      <p className="font-medium text-gray-900">{selectedTemplate?.label}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Team</p>
                      <p className="font-medium text-gray-900">{customTerminology.staff}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Services</p>
                      <p className="font-medium text-gray-900">{customTerminology.treatment}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Customers</p>
                      <p className="font-medium text-gray-900">{customTerminology.patient}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Reservations</p>
                      <p className="font-medium text-gray-900">{customTerminology.booking}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-2">Categories ({customCategories.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {customCategories.map((cat) => (
                        <Badge key={cat} variant="outline" className="bg-white">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="bg-white/80 backdrop-blur-md border-t border-purple-100 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              {step > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {step < totalSteps ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!selectedTemplate || !businessName.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 gap-2"
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={loading || customCategories.length === 0}
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Launch My Workspace
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
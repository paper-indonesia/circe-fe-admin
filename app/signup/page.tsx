"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock, User, Building2, Phone, Globe, FileText, Sparkles, CheckCircle, ChevronRight, ChevronLeft, Rocket, Shield, GraduationCap, Briefcase, Dumbbell, Heart, Scissors, Waves, Settings2, Check, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import GradientLoading from "@/components/gradient-loading"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { TermsModal } from "@/components/modals/TermsModal"
import { PrivacyModal } from "@/components/modals/PrivacyModal"
import { getBusinessTypeTemplates } from "@/lib/business-type-templates"

const BUSINESS_TYPES = [
  {
    value: "beauty_salon",
    label: "Beauty Salon",
    icon: Sparkles,
    gradient: "from-pink-500 via-rose-500 to-pink-600",
    description: "Salon kecantikan"
  },
  {
    value: "hair_salon",
    label: "Hair Salon",
    icon: Scissors,
    gradient: "from-fuchsia-500 via-pink-500 to-fuchsia-600",
    description: "Salon rambut"
  },
  {
    value: "spa",
    label: "Spa & Massage",
    icon: Waves,
    gradient: "from-teal-500 via-cyan-500 to-teal-600",
    description: "Spa & pijat"
  },
  {
    value: "nail_salon",
    label: "Nail Salon",
    icon: Sparkles,
    gradient: "from-purple-500 via-indigo-500 to-purple-600",
    description: "Salon kuku & nail art"
  },
  {
    value: "barber_shop",
    label: "Barber Shop",
    icon: Scissors,
    gradient: "from-orange-500 via-amber-500 to-orange-600",
    description: "Pangkas rambut pria"
  },
  {
    value: "medical_spa",
    label: "Medical Spa",
    icon: Heart,
    gradient: "from-green-500 via-emerald-500 to-green-600",
    description: "Klinik kecantikan"
  },
  {
    value: "aesthetic_clinic",
    label: "Aesthetic Clinic",
    icon: Heart,
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    description: "Klinik estetika"
  },
  {
    value: "wellness_center",
    label: "Wellness Center",
    icon: Dumbbell,
    gradient: "from-emerald-500 via-green-500 to-emerald-600",
    description: "Pusat kesehatan"
  },
  {
    value: "makeup_studio",
    label: "Makeup Studio",
    icon: Sparkles,
    gradient: "from-rose-500 via-pink-500 to-rose-600",
    description: "Studio makeup"
  },
  {
    value: "tattoo_studio",
    label: "Tattoo & Piercing",
    icon: Briefcase,
    gradient: "from-gray-700 via-slate-700 to-gray-800",
    description: "Studio tattoo & piercing"
  },
  {
    value: "other",
    label: "Other",
    icon: Settings2,
    gradient: "from-gray-500 via-slate-500 to-gray-600",
    description: "Tipe bisnis lainnya"
  },
]

const STEPS = [
  { id: 1, title: "Business Info", description: "Tell us about your business" },
  { id: 2, title: "Admin Account", description: "Create your admin account" },
  { id: 3, title: "Review & Confirm", description: "Review and accept terms" },
]

export default function SignUpPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Business Information
    business_name: "",
    business_email: "",
    business_phone: "",
    business_type: "",
    description: "",
    website: "",
    preferred_slug: "",
    // Admin Information
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_password: "",
    confirmPassword: "",
    // Agreements
    terms_accepted: false,
    privacy_accepted: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsError, setTermsError] = useState(false)
  const [privacyError, setPrivacyError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return ""
    if (!email.includes('@')) {
      return "Email harus mengandung simbol @"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return "Format email tidak valid (contoh: nama@domain.com)"
    }
    return ""
  }

  const validateWebsite = (url: string): string => {
    if (!url) return "" // Optional field
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/
    if (!urlRegex.test(url)) {
      return "URL tidak valid (contoh: https://domain.com)"
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return "URL harus dimulai dengan http:// atau https://"
    }
    return ""
  }

  const validatePhone = (phone: string): string => {
    if (!phone) return ""
    // Remove +62 prefix for validation
    const phoneNumber = phone.startsWith('+62') ? phone.slice(3) : phone
    if (phoneNumber.length < 9 || phoneNumber.length > 13) {
      return "Nomor telepon harus 9-13 digit"
    }
    if (!/^\d+$/.test(phoneNumber)) {
      return "Nomor telepon hanya boleh berisi angka"
    }
    if (!phoneNumber.startsWith('8')) {
      return "Nomor telepon harus dimulai dengan 8 (contoh: 81234567890)"
    }
    return ""
  }

  const validateName = (name: string, fieldName: string): string => {
    if (!name) return ""
    if (name.length < 2) {
      return `${fieldName} minimal 2 karakter`
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return `${fieldName} hanya boleh berisi huruf`
    }
    return ""
  }

  const validatePassword = (password: string): string => {
    if (!password) return ""
    if (password.length < 8) {
      return "Password minimal 8 karakter"
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      return "Password harus mengandung huruf besar, huruf kecil, dan angka"
    }
    return ""
  }

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) return ""
    if (password !== confirmPassword) {
      return "Password tidak cocok"
    }
    return ""
  }

  const validateField = (fieldId: string, value: string) => {
    let error = ""

    switch (fieldId) {
      case 'business_email':
      case 'admin_email':
        error = validateEmail(value)
        break
      case 'website':
        error = validateWebsite(value)
        break
      case 'business_phone':
        error = validatePhone(value)
        break
      case 'business_name':
        error = validateName(value, "Nama bisnis")
        break
      case 'admin_first_name':
        error = validateName(value, "Nama depan")
        break
      case 'admin_last_name':
        error = validateName(value, "Nama belakang")
        break
      case 'admin_password':
        error = validatePassword(value)
        break
      case 'confirmPassword':
        error = validateConfirmPassword(formData.admin_password, value)
        break
      default:
        break
    }

    setFieldErrors(prev => ({
      ...prev,
      [fieldId]: error
    }))

    return error
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target
    setFormData({
      ...formData,
      [id]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
    setError("")

    // Clear field error when typing
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({
        ...prev,
        [id]: ""
      }))
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    validateField(id, value)
  }

  const handleSelectChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
    setError("")
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({
      ...formData,
      [field]: checked,
    })
    setError("")
    // Clear specific error when checkbox is checked
    if (field === 'terms_accepted' && checked) {
      setTermsError(false)
    }
    if (field === 'privacy_accepted' && checked) {
      setPrivacyError(false)
    }
  }

  const validateStep = (step: number): boolean => {
    setError("")
    let hasError = false

    if (step === 1) {
      // Clear TnC errors when leaving step 3
      setTermsError(false)
      setPrivacyError(false)

      // Validate all step 1 fields
      const fields = ['business_name', 'business_email', 'business_phone', 'website']
      fields.forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData] as string)
        if (error) hasError = true
      })

      // Check required fields
      if (!formData.business_name.trim()) {
        setError("Nama bisnis wajib diisi")
        return false
      }
      if (!formData.business_email.trim()) {
        setError("Email bisnis wajib diisi")
        return false
      }
      if (!formData.business_phone.trim()) {
        setError("Nomor telepon bisnis wajib diisi")
        return false
      }
      if (!formData.business_type) {
        setError("Pilih tipe bisnis terlebih dahulu")
        return false
      }

      // Check for validation errors
      if (hasError || fieldErrors.business_email || fieldErrors.business_phone || fieldErrors.website || fieldErrors.business_name) {
        setError("Mohon perbaiki kesalahan pada form sebelum melanjutkan")
        return false
      }

      return true
    }

    if (step === 2) {
      // Clear TnC errors when leaving step 3
      setTermsError(false)
      setPrivacyError(false)

      // Validate all step 2 fields
      const fields = ['admin_first_name', 'admin_last_name', 'admin_email', 'admin_password', 'confirmPassword']
      fields.forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData] as string)
        if (error) hasError = true
      })

      // Check required fields
      if (!formData.admin_first_name.trim()) {
        setError("Nama depan wajib diisi")
        return false
      }
      if (!formData.admin_last_name.trim()) {
        setError("Nama belakang wajib diisi")
        return false
      }
      if (!formData.admin_email.trim()) {
        setError("Email admin wajib diisi")
        return false
      }
      if (!formData.admin_password) {
        setError("Password wajib diisi")
        return false
      }
      if (!formData.confirmPassword) {
        setError("Konfirmasi password wajib diisi")
        return false
      }

      // Check for validation errors
      if (hasError || Object.values(fieldErrors).some(err => err !== "")) {
        setError("Mohon perbaiki kesalahan pada form sebelum melanjutkan")
        return false
      }

      return true
    }

    if (step === 3) {
      // Validate Terms & Privacy
      if (!formData.terms_accepted) {
        setTermsError(true)
        hasError = true
      }
      if (!formData.privacy_accepted) {
        setPrivacyError(true)
        hasError = true
      }
      if (hasError) {
        setError("Anda harus menyetujui Terms of Service dan Privacy Policy untuk melanjutkan")
        return false
      }
      return true
    }

    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setCurrentStep(currentStep - 1)
    setError("")
    setTermsError(false)
    setPrivacyError(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Call local API proxy which forwards to FastAPI backend
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          business_name: formData.business_name,
          business_email: formData.business_email,
          business_phone: formData.business_phone,
          business_type: formData.business_type,
          description: formData.description || undefined,
          website: formData.website || undefined,
          admin_first_name: formData.admin_first_name,
          admin_last_name: formData.admin_last_name,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          preferred_slug: formData.preferred_slug || undefined,
          terms_accepted: formData.terms_accepted,
          privacy_accepted: formData.privacy_accepted,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store business type and tenant info for first login setup
        if (typeof window !== 'undefined') {
          localStorage.setItem('pending_template_setup', JSON.stringify({
            business_type: formData.business_type,
            tenant_id: data.tenant_id,
            email: formData.business_email,
            timestamp: new Date().toISOString()
          }))
        }

        setSuccess(data.message || "Registration successful! Redirecting to sign in...")

        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          router.push('/signin?registered=true')
        }, 2000)
      } else {
        // Handle API errors
        if (data.detail) {
          if (typeof data.detail === 'string') {
            setError(data.detail)
          } else if (Array.isArray(data.detail)) {
            setError(data.detail.map((err: any) => err.msg).join(', '))
          } else {
            setError(JSON.stringify(data.detail))
          }
        } else {
          setError(data.message || 'Registration failed. Please try again.')
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GradientLoading />
      </div>
    )
  }

  const getSelectedBusinessType = () => {
    return BUSINESS_TYPES.find(type => type.value === formData.business_type)
  }

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-float" style={{ animationDelay: '4s' }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className={`w-full max-w-4xl ${mounted ? 'animate-fadeIn' : 'opacity-0'}`}>
          {/* Logo and Header */}
          <div className="mb-8 text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full blur-xl opacity-60 animate-pulse" />
              <div className="relative">
                <img
                  src="/reserva_logo.webp"
                  alt="Reserva"
                  className="h-16 w-16 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            <div className="mb-4">
              <img
                src="/reserva_name.webp"
                alt="Reserva"
                className="h-12 mx-auto object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm">
              Complete Booking & Appointment Management Platform
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between max-w-3xl mx-auto px-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center flex-1 relative">
                    {/* Step Circle */}
                    <motion.div
                      initial={false}
                      animate={{
                        scale: currentStep === step.id ? 1 : 0.9,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative z-10"
                    >
                      <div className={`relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] shadow-lg shadow-purple-500/50'
                          : currentStep === step.id
                          ? 'bg-white border-2 border-purple-600 shadow-lg shadow-purple-300/50'
                          : 'bg-white/50 border-2 border-gray-200'
                      }`}>
                        {currentStep > step.id ? (
                          <Check className="h-6 w-6 text-white" strokeWidth={3} />
                        ) : (
                          <span className={`font-bold text-lg ${
                            currentStep === step.id ? 'text-[#8B5CF6]' : 'text-gray-400'
                          }`}>
                            {step.id}
                          </span>
                        )}
                      </div>

                      {/* Active Ring */}
                      {currentStep === step.id && (
                        <motion.div
                          layoutId="activeStep"
                          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] opacity-20"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>

                    {/* Step Label */}
                    <div className="mt-3 text-center hidden md:block">
                      <motion.p
                        animate={{
                          scale: currentStep === step.id ? 1 : 0.95,
                        }}
                        className={`text-sm font-semibold mb-0.5 ${
                          currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {step.title}
                      </motion.p>
                      <p className="text-xs text-gray-400 max-w-[140px]">{step.description}</p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 h-1 bg-gray-200 mx-3 rounded-full relative overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{
                          width: currentStep > step.id ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sign Up Card */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95">
            <div className="h-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]" />
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {STEPS[currentStep - 1].title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-1">
                    {STEPS[currentStep - 1].description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs px-3 py-1">
                  Step {currentStep} of {STEPS.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="animate-fadeIn">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="animate-fadeIn bg-green-50 border-green-200 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <AnimatePresence mode="wait">
                  {/* Step 1: Business Information */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Business Type Selection */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-semibold text-gray-900">Select Your Business Type</Label>
                          <p className="text-sm text-gray-500 mt-1">Choose the category that best describes your business</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {BUSINESS_TYPES.map((type) => {
                            const IconComponent = type.icon
                            const isSelected = formData.business_type === type.value

                            return (
                              <motion.button
                                key={type.value}
                                type="button"
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelectChange('business_type', type.value)}
                                className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                                  isSelected
                                    ? 'border-transparent bg-white shadow-xl shadow-purple-200/50'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                                }`}
                              >
                                {/* Gradient Background for Selected */}
                                {isSelected && (
                                  <motion.div
                                    layoutId="selectedBusiness"
                                    className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-10 rounded-2xl`}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                  />
                                )}

                                {/* Icon Container */}
                                <div className={`relative mb-3 flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                                  isSelected
                                    ? `bg-gradient-to-br ${type.gradient}`
                                    : 'bg-gray-100 group-hover:bg-gray-200'
                                }`}>
                                  <IconComponent
                                    className={`h-6 w-6 transition-colors ${
                                      isSelected ? 'text-white' : 'text-gray-600'
                                    }`}
                                    strokeWidth={2}
                                  />
                                </div>

                                {/* Label */}
                                <div className="relative">
                                  <p className={`text-sm font-semibold mb-1 transition-colors ${
                                    isSelected ? 'text-gray-900' : 'text-gray-700 group-hover:text-gray-900'
                                  }`}>
                                    {type.label}
                                  </p>
                                  <p className="text-xs text-gray-500 leading-tight">
                                    {type.description}
                                  </p>
                                </div>

                                {/* Check Badge */}
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                    className={`absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br ${type.gradient} rounded-full flex items-center justify-center shadow-lg`}
                                  >
                                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                                  </motion.div>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="business_name">Business Name *</Label>
                          <Input
                            id="business_name"
                            type="text"
                            placeholder="Your Business Name"
                            value={formData.business_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`h-11 ${fieldErrors.business_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            disabled={isLoading}
                          />
                          {fieldErrors.business_name && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.business_name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business_email">Business Email *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="business_email"
                              type="email"
                              placeholder="contact@business.com"
                              value={formData.business_email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 h-11 ${fieldErrors.business_email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {fieldErrors.business_email && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.business_email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="business_phone">Business Phone *</Label>
                          <div className="flex gap-2">
                            <div className="flex items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-600 font-medium h-11">
                              +62
                            </div>
                            <div className="flex-1">
                              <Input
                                id="business_phone"
                                type="tel"
                                placeholder="81xxxxxxxxx"
                                value={formData.business_phone.startsWith('+62') ? formData.business_phone.slice(3) : formData.business_phone}
                                onChange={(e) => {
                                  const input = e.target.value.replace(/\D/g, '')
                                  setFormData({
                                    ...formData,
                                    business_phone: input ? `+62${input}` : ''
                                  })
                                  // Clear error when typing
                                  if (fieldErrors.business_phone) {
                                    setFieldErrors(prev => ({
                                      ...prev,
                                      business_phone: ""
                                    }))
                                  }
                                }}
                                onBlur={(e) => {
                                  validateField('business_phone', formData.business_phone)
                                }}
                                className={`h-11 ${fieldErrors.business_phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                          {fieldErrors.business_phone && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.business_phone}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website (Optional)</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="website"
                              type="url"
                              placeholder="https://yourbusiness.com"
                              value={formData.website}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 h-11 ${fieldErrors.website ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {fieldErrors.website && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.website}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="description">Business Description (Optional)</Label>
                          <Textarea
                            id="description"
                            placeholder="Tell us about your business..."
                            value={formData.description}
                            onChange={handleChange}
                            className="min-h-[80px] resize-none"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Admin Account */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin_first_name">First Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="admin_first_name"
                              type="text"
                              placeholder="John"
                              value={formData.admin_first_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 h-11 ${fieldErrors.admin_first_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {fieldErrors.admin_first_name && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.admin_first_name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="admin_last_name">Last Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="admin_last_name"
                              type="text"
                              placeholder="Doe"
                              value={formData.admin_last_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 h-11 ${fieldErrors.admin_last_name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {fieldErrors.admin_last_name && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.admin_last_name}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="admin_email">Email Address *</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="admin_email"
                              type="email"
                              placeholder="admin@business.com"
                              value={formData.admin_email}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 h-11 ${fieldErrors.admin_email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                          </div>
                          {fieldErrors.admin_email ? (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.admin_email}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">This will be your login email</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="admin_password">Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="admin_password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a strong password"
                              value={formData.admin_password}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 pr-10 h-11 ${fieldErrors.admin_password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {fieldErrors.admin_password ? (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.admin_password}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">Min. 8 chars with uppercase, lowercase, and number</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              className={`pl-10 pr-10 h-11 ${fieldErrors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                              disabled={isLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              tabIndex={-1}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {fieldErrors.confirmPassword && (
                            <p className="text-sm text-red-600 flex items-center gap-1 animate-fadeIn">
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              {fieldErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Password Requirements Card */}
                      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 mb-3">Password Requirements</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {[
                                { label: 'At least 8 characters', check: formData.admin_password.length >= 8 },
                                { label: 'Uppercase letter (A-Z)', check: /[A-Z]/.test(formData.admin_password) },
                                { label: 'Lowercase letter (a-z)', check: /[a-z]/.test(formData.admin_password) },
                                { label: 'Number (0-9)', check: /\d/.test(formData.admin_password) },
                              ].map((req, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center gap-2"
                                >
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                    req.check
                                      ? 'bg-green-500 scale-100'
                                      : 'bg-gray-200 scale-90'
                                  }`}>
                                    {req.check && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                      >
                                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                      </motion.div>
                                    )}
                                  </div>
                                  <span className={`text-xs transition-colors ${
                                    req.check ? 'text-green-700 font-medium' : 'text-gray-600'
                                  }`}>
                                    {req.label}
                                  </span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review & Confirm */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      variants={pageVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Summary Card */}
                      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white text-lg">Registration Summary</h3>
                              <p className="text-sm text-white/80">Review your information before submitting</p>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                          {/* Business Section */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                <Building2 className="h-5 w-5 text-[#8B5CF6] mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Business Name</p>
                                  <p className="font-semibold text-gray-900">{formData.business_name}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                {(() => {
                                  const selectedType = getSelectedBusinessType()
                                  const IconComponent = selectedType?.icon
                                  return (
                                    <>
                                      {IconComponent && <IconComponent className="h-5 w-5 text-[#8B5CF6] mt-0.5" />}
                                      <div>
                                        <p className="text-xs text-gray-500 mb-1">Business Type</p>
                                        <p className="font-semibold text-gray-900">{selectedType?.label}</p>
                                      </div>
                                    </>
                                  )
                                })()}
                              </div>

                              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                <Mail className="h-5 w-5 text-[#8B5CF6] mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Business Email</p>
                                  <p className="font-semibold text-gray-900 break-all">{formData.business_email}</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                                <Phone className="h-5 w-5 text-[#8B5CF6] mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                                  <p className="font-semibold text-gray-900">{formData.business_phone}</p>
                                </div>
                              </div>

                              {formData.website && (
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 md:col-span-2">
                                  <Globe className="h-5 w-5 text-[#8B5CF6] mt-0.5" />
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Website</p>
                                    <p className="font-semibold text-gray-900 break-all">{formData.website}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Admin Section */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Administrator Account</h4>
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] flex items-center justify-center flex-shrink-0">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Full Name & Email</p>
                                <p className="font-semibold text-gray-900 mb-1">
                                  {formData.admin_first_name} {formData.admin_last_name}
                                </p>
                                <p className="text-sm text-gray-600 break-all">{formData.admin_email}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Privacy */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Legal Agreements</h4>

                        <div>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className={`relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                              termsError
                                ? 'border-red-300 bg-red-50/50 shadow-sm shadow-red-100'
                                : formData.terms_accepted
                                ? 'border-[#C4B5FD] bg-[#EDE9FE]/50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex-shrink-0 pt-0.5">
                              <Checkbox
                                id="terms_accepted"
                                checked={formData.terms_accepted}
                                onCheckedChange={(checked) => handleCheckboxChange('terms_accepted', checked as boolean)}
                                disabled={isLoading}
                                className={`w-5 h-5 border-2 ${
                                  termsError
                                    ? 'border-red-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600'
                                    : 'border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600'
                                }`}
                              />
                            </div>
                            <Label htmlFor="terms_accepted" className="text-sm text-gray-700 cursor-pointer leading-relaxed flex-1">
                              I have read and agree to the{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setShowTermsModal(true)
                                }}
                                className="text-[#8B5CF6] hover:text-[#6D28D9] font-semibold underline underline-offset-2"
                              >
                                Terms of Service
                              </button>
                            </Label>
                            {formData.terms_accepted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.div>
                          {termsError && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-600 font-medium mt-2 ml-1 flex items-center gap-1"
                            >
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              Please accept the Terms of Service to continue
                            </motion.p>
                          )}
                        </div>

                        <div>
                          <motion.div
                            whileHover={{ x: 2 }}
                            className={`relative flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-200 ${
                              privacyError
                                ? 'border-red-300 bg-red-50/50 shadow-sm shadow-red-100'
                                : formData.privacy_accepted
                                ? 'border-[#C4B5FD] bg-[#EDE9FE]/50'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <div className="flex-shrink-0 pt-0.5">
                              <Checkbox
                                id="privacy_accepted"
                                checked={formData.privacy_accepted}
                                onCheckedChange={(checked) => handleCheckboxChange('privacy_accepted', checked as boolean)}
                                disabled={isLoading}
                                className={`w-5 h-5 border-2 ${
                                  privacyError
                                    ? 'border-red-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600'
                                    : 'border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600'
                                }`}
                              />
                            </div>
                            <Label htmlFor="privacy_accepted" className="text-sm text-gray-700 cursor-pointer leading-relaxed flex-1">
                              I have read and agree to the{" "}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setShowPrivacyModal(true)
                                }}
                                className="text-[#8B5CF6] hover:text-[#6D28D9] font-semibold underline underline-offset-2"
                              >
                                Privacy Policy
                              </button>
                            </Label>
                            {formData.privacy_accepted && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </motion.div>
                          {privacyError && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-sm text-red-600 font-medium mt-2 ml-1 flex items-center gap-1"
                            >
                              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                              Please accept the Privacy Policy to continue
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                  {currentStep > 1 ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={isLoading}
                        className="gap-2 h-12 px-6 border-gray-300 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Back</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    {currentStep < STEPS.length ? (
                      <Button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading}
                        className="gap-2 h-12 px-8 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#EC4899] text-white shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <span>Continue</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isLoading}
                          className="gap-2 h-12 px-8 bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-purple-600 hover:from-[#6D28D9] hover:via-[#EC4899] hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 bg-[length:200%_100%] hover:bg-right"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>Creating account...</span>
                            </>
                          ) : (
                            <>
                              <Rocket className="h-5 w-5" />
                              <span>Create Business Account</span>
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-[#8B5CF6] hover:text-[#6D28D9] font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Modals */}
          <TermsModal open={showTermsModal} onOpenChange={setShowTermsModal} />
          <PrivacyModal open={showPrivacyModal} onOpenChange={setShowPrivacyModal} />

        </div>
      </div>
    </div>
  )
}
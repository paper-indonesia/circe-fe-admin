"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { useSubscription } from "@/lib/subscription-context"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import {
  XCircle,
  AlertTriangle,
  ArrowDownCircle,
  Building2,
  Users,
  Calendar,
  Briefcase,
  Loader2,
  Sparkles,
  CheckCircle2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DowngradeConfirmDialog } from "./downgrade-confirm-dialog"

interface PlanLimits {
  max_outlets: number
  max_staff_per_outlet: number
  max_appointments_per_month: number
  max_services: number
}

interface PlanData {
  plan_type: string
  limits: PlanLimits
}

interface ResourceCounts {
  outlets: number
  services: number
  staff: number
}

interface DowngradeProgress {
  isProcessing: boolean
  currentStep: string
  totalSteps: number
  completedSteps: number
  deletedItems: { type: string; count: number }[]
}

export function ExpiredSubscriptionBanner() {
  const router = useRouter()
  const { subscription, usage, refetch } = useSubscription()
  const { user } = useAuth()
  const { toast } = useToast()

  const [mounted, setMounted] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [resourceCounts, setResourceCounts] = useState<ResourceCounts | null>(null)
  const [outlets, setOutlets] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [downgradeProgress, setDowngradeProgress] = useState<DowngradeProgress>({
    isProcessing: false,
    currentStep: '',
    totalSteps: 0,
    completedSteps: 0,
    deletedItems: []
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch plans data
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscription/plans')
        if (response.ok) {
          const data = await response.json()
          setPlans(data.plans || [])
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error)
      }
    }
    fetchPlans()
  }, [])

  // Fetch current resources (outlets, services, staff)
  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Fetch outlets (sorted by created_at ascending - oldest first)
        const outletsRes = await fetch('/api/outlets?size=100&sort_by=created_at&sort_order=asc')
        let outletsData: any[] = []
        if (outletsRes.ok) {
          const data = await outletsRes.json()
          outletsData = data.items || []
          setOutlets(outletsData)
        }

        // Fetch services
        const servicesRes = await fetch('/api/services?size=100')
        let servicesData: any[] = []
        if (servicesRes.ok) {
          const data = await servicesRes.json()
          servicesData = data.items || []
          setServices(servicesData)
        }

        // Fetch staff (sorted by created_at ascending - oldest first)
        const staffRes = await fetch('/api/staff?size=100&sort_by=created_at&sort_order=asc')
        let staffData: any[] = []
        if (staffRes.ok) {
          const data = await staffRes.json()
          staffData = data.items || []
          setStaffList(staffData)
        }

        setResourceCounts({
          outlets: outletsData.length,
          services: servicesData.length,
          staff: staffData.length
        })
      } catch (error) {
        console.error('Failed to fetch resources:', error)
      }
    }

    if (subscription) {
      fetchResources()
    }
  }, [subscription])

  // Check subscription status
  const getSubscriptionState = useCallback(() => {
    if (!subscription) return null

    const plan = subscription.plan?.toLowerCase()
    const endDate = subscription.end_date
    const trialEnd = subscription.trial_end

    if (!endDate) return null

    const expiryDate = new Date(endDate)
    const now = new Date()
    expiryDate.setHours(23, 59, 59, 999)
    now.setHours(0, 0, 0, 0)

    const isExpired = expiryDate < now

    if (!isExpired) return null

    // Free plan with expired trial
    // DISABLED: Free plan users can continue using the app without trial restriction
    // Uncomment below to enable trial expiration for free plan
    /*
    if (plan === 'free') {
      return {
        type: 'free_trial_expired' as const,
        plan: 'FREE',
        expiryDate: format(expiryDate, 'dd MMMM yyyy')
      }
    }
    */

    // Paid plan expired
    if (plan === 'pro' || plan === 'enterprise') {
      return {
        type: 'paid_expired' as const,
        plan: plan.toUpperCase(),
        expiryDate: format(expiryDate, 'dd MMMM yyyy')
      }
    }

    return null
  }, [subscription])

  const subscriptionState = getSubscriptionState()

  // Get plan limits
  const freePlanLimits: PlanLimits = plans.find(p => p.plan_type?.toUpperCase() === 'FREE')?.limits || {
    max_outlets: 1,
    max_staff_per_outlet: 5,
    max_appointments_per_month: 100,
    max_services: 20
  }

  const currentPlanLimits: PlanLimits = plans.find(p =>
    p.plan_type?.toUpperCase() === subscriptionState?.plan
  )?.limits || {
    max_outlets: 10,
    max_staff_per_outlet: 50,
    max_appointments_per_month: 2000,
    max_services: -1
  }

  // Calculate what needs to be deleted
  const getResourcesToDelete = useCallback(() => {
    if (!resourceCounts) return { outlets: 0, services: 0, staff: 0 }

    return {
      outlets: Math.max(0, resourceCounts.outlets - freePlanLimits.max_outlets),
      services: freePlanLimits.max_services === -1 ? 0 : Math.max(0, resourceCounts.services - freePlanLimits.max_services),
      staff: Math.max(0, resourceCounts.staff - freePlanLimits.max_staff_per_outlet)
    }
  }, [resourceCounts, freePlanLimits])

  const resourcesToDelete = getResourcesToDelete()

  // Handle downgrade with resource cleanup
  const handleConfirmDowngrade = async () => {
    setDowngradeProgress({
      isProcessing: true,
      currentStep: 'Memulai proses downgrade...',
      totalSteps: resourcesToDelete.outlets + resourcesToDelete.services + resourcesToDelete.staff + 1,
      completedSteps: 0,
      deletedItems: []
    })

    try {
      let completedSteps = 0
      const deletedItems: { type: string; count: number }[] = []

      // 1. Delete excess outlets (keep only the first/oldest one for FREE plan limit of 1)
      if (resourcesToDelete.outlets > 0 && outlets.length > freePlanLimits.max_outlets) {
        setDowngradeProgress(prev => ({
          ...prev,
          currentStep: `Menghapus outlet berlebih (0/${resourcesToDelete.outlets})...`
        }))

        // Keep first N outlets based on free plan limit, delete the rest
        // For FREE plan: max_outlets = 1, so keep outlets[0], delete outlets[1] onwards
        const outletsToDelete = outlets.slice(freePlanLimits.max_outlets)
        let deletedOutlets = 0

        for (const outlet of outletsToDelete) {
          try {
            const res = await fetch(`/api/outlets/${outlet.id || outlet._id}`, {
              method: 'DELETE'
            })
            if (res.ok) {
              deletedOutlets++
              completedSteps++
              setDowngradeProgress(prev => ({
                ...prev,
                currentStep: `Menghapus outlet berlebih (${deletedOutlets}/${resourcesToDelete.outlets})...`,
                completedSteps
              }))
            }
          } catch (e) {
            console.error('Failed to delete outlet:', e)
          }
        }

        if (deletedOutlets > 0) {
          deletedItems.push({ type: 'Outlet', count: deletedOutlets })
        }
      }

      // 2. Delete excess services (keep first 20)
      if (resourcesToDelete.services > 0 && services.length > freePlanLimits.max_services) {
        setDowngradeProgress(prev => ({
          ...prev,
          currentStep: `Menghapus service berlebih (0/${resourcesToDelete.services})...`
        }))

        const servicesToDelete = services.slice(freePlanLimits.max_services)
        let deletedServices = 0

        for (const service of servicesToDelete) {
          try {
            const res = await fetch(`/api/services?id=${service.id || service._id}`, {
              method: 'DELETE'
            })
            if (res.ok) {
              deletedServices++
              completedSteps++
              setDowngradeProgress(prev => ({
                ...prev,
                currentStep: `Menghapus service berlebih (${deletedServices}/${resourcesToDelete.services})...`,
                completedSteps
              }))
            }
          } catch (e) {
            console.error('Failed to delete service:', e)
          }
        }

        if (deletedServices > 0) {
          deletedItems.push({ type: 'Service', count: deletedServices })
        }
      }

      // 3. Delete excess staff (keep first 5 for FREE plan)
      if (resourcesToDelete.staff > 0 && staffList.length > freePlanLimits.max_staff_per_outlet) {
        setDowngradeProgress(prev => ({
          ...prev,
          currentStep: `Menghapus staff berlebih (0/${resourcesToDelete.staff})...`
        }))

        const staffToDelete = staffList.slice(freePlanLimits.max_staff_per_outlet)
        let deletedStaff = 0

        for (const staff of staffToDelete) {
          try {
            const res = await fetch(`/api/staff/${staff.id || staff._id}`, {
              method: 'DELETE'
            })
            if (res.ok) {
              deletedStaff++
              completedSteps++
              setDowngradeProgress(prev => ({
                ...prev,
                currentStep: `Menghapus staff berlebih (${deletedStaff}/${resourcesToDelete.staff})...`,
                completedSteps
              }))
            }
          } catch (e) {
            console.error('Failed to delete staff:', e)
          }
        }

        if (deletedStaff > 0) {
          deletedItems.push({ type: 'Staff', count: deletedStaff })
        }
      }

      // 4. Call cancel subscription API
      setDowngradeProgress(prev => ({
        ...prev,
        currentStep: 'Memproses downgrade subscription...',
        deletedItems
      }))

      const cancelRes = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!cancelRes.ok) {
        const error = await cancelRes.json()
        throw new Error(error.error || 'Gagal memproses downgrade')
      }

      completedSteps++
      setDowngradeProgress(prev => ({
        ...prev,
        currentStep: 'Downgrade berhasil!',
        completedSteps,
        deletedItems
      }))

      toast({
        title: "Downgrade Berhasil",
        description: "Subscription Anda telah diubah ke Free Plan.",
      })

      // Refetch and redirect
      await refetch()
      setShowConfirmDialog(false)

      setTimeout(() => {
        window.location.href = '/subscription/manage'
      }, 1500)

    } catch (error) {
      console.error('Downgrade error:', error)
      toast({
        title: "Downgrade Gagal",
        description: error instanceof Error ? error.message : "Silakan coba lagi atau hubungi support.",
        variant: "destructive"
      })
      setDowngradeProgress(prev => ({
        ...prev,
        isProcessing: false,
        currentStep: ''
      }))
    }
  }

  // Don't render if no expired state
  if (!subscriptionState || !mounted) return null

  const formatLimit = (value: number) => value === -1 ? "Unlimited" : value.toLocaleString()

  // FREE TRIAL EXPIRED - Show warning with options to upgrade or continue with limits
  if (subscriptionState.type === 'free_trial_expired') {
    // Check if already on upgrade page - don't show blocking modal
    const isOnUpgradePage = typeof window !== 'undefined' &&
      (window.location.pathname === '/subscription/upgrade' ||
       window.location.pathname === '/subscription/manage')

    if (isOnUpgradePage) {
      return null
    }

    const handleUpgradeClick = () => {
      window.location.href = '/subscription/upgrade'
    }

    const handleContinueWithFree = async () => {
      // Need to cleanup resources to match FREE plan limits
      setDowngradeProgress({
        isProcessing: true,
        currentStep: 'Menyesuaikan data dengan limit Free Plan...',
        totalSteps: resourcesToDelete.outlets + resourcesToDelete.services + resourcesToDelete.staff + 1,
        completedSteps: 0,
        deletedItems: []
      })

      try {
        let completedSteps = 0
        const deletedItems: { type: string; count: number }[] = []

        // 1. Delete excess outlets (keep only 1)
        if (resourcesToDelete.outlets > 0 && outlets.length > freePlanLimits.max_outlets) {
          const outletsToDelete = outlets.slice(freePlanLimits.max_outlets)
          let deletedOutlets = 0

          for (const outlet of outletsToDelete) {
            try {
              const res = await fetch(`/api/outlets/${outlet.id || outlet._id}`, { method: 'DELETE' })
              if (res.ok) {
                deletedOutlets++
                completedSteps++
                setDowngradeProgress(prev => ({
                  ...prev,
                  currentStep: `Menghapus outlet berlebih (${deletedOutlets}/${resourcesToDelete.outlets})...`,
                  completedSteps
                }))
              }
            } catch (e) {
              console.error('Failed to delete outlet:', e)
            }
          }
          if (deletedOutlets > 0) deletedItems.push({ type: 'Outlet', count: deletedOutlets })
        }

        // 2. Delete excess services (keep only 20)
        if (resourcesToDelete.services > 0 && services.length > freePlanLimits.max_services) {
          const servicesToDelete = services.slice(freePlanLimits.max_services)
          let deletedServices = 0

          for (const service of servicesToDelete) {
            try {
              const res = await fetch(`/api/services?id=${service.id || service._id}`, { method: 'DELETE' })
              if (res.ok) {
                deletedServices++
                completedSteps++
                setDowngradeProgress(prev => ({
                  ...prev,
                  currentStep: `Menghapus service berlebih (${deletedServices}/${resourcesToDelete.services})...`,
                  completedSteps
                }))
              }
            } catch (e) {
              console.error('Failed to delete service:', e)
            }
          }
          if (deletedServices > 0) deletedItems.push({ type: 'Service', count: deletedServices })
        }

        // 3. Delete excess staff (keep only 5 per outlet)
        if (resourcesToDelete.staff > 0 && staffList.length > freePlanLimits.max_staff_per_outlet) {
          const staffToDelete = staffList.slice(freePlanLimits.max_staff_per_outlet)
          let deletedStaff = 0

          for (const staff of staffToDelete) {
            try {
              const res = await fetch(`/api/staff/${staff.id || staff._id}`, { method: 'DELETE' })
              if (res.ok) {
                deletedStaff++
                completedSteps++
                setDowngradeProgress(prev => ({
                  ...prev,
                  currentStep: `Menghapus staff berlebih (${deletedStaff}/${resourcesToDelete.staff})...`,
                  completedSteps
                }))
              }
            } catch (e) {
              console.error('Failed to delete staff:', e)
            }
          }
          if (deletedStaff > 0) deletedItems.push({ type: 'Staff', count: deletedStaff })
        }

        setDowngradeProgress(prev => ({
          ...prev,
          currentStep: 'Selesai!',
          completedSteps: prev.totalSteps,
          deletedItems
        }))

        toast({
          title: "Penyesuaian Selesai",
          description: "Data telah disesuaikan dengan limit Free Plan.",
        })

        await refetch()

        setTimeout(() => {
          window.location.reload()
        }, 1500)

      } catch (error) {
        console.error('Cleanup error:', error)
        toast({
          title: "Gagal",
          description: "Terjadi kesalahan saat menyesuaikan data.",
          variant: "destructive"
        })
        setDowngradeProgress(prev => ({ ...prev, isProcessing: false }))
      }
    }

    // Check if there are resources to delete
    const hasExcessResources = resourcesToDelete.outlets > 0 || resourcesToDelete.services > 0 || resourcesToDelete.staff > 0

    // Show progress dialog if processing
    if (downgradeProgress.isProcessing) {
      const progressPercent = downgradeProgress.totalSteps > 0
        ? (downgradeProgress.completedSteps / downgradeProgress.totalSteps) * 100
        : 0

      const progressContent = (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
              <h3 className="text-lg font-semibold">Memproses...</h3>
            </div>
            <Progress value={progressPercent} className="h-2 mb-4" />
            <p className="text-sm text-gray-600">{downgradeProgress.currentStep}</p>
            {downgradeProgress.deletedItems.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-2">Telah dihapus:</p>
                <ul className="space-y-1">
                  {downgradeProgress.deletedItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {item.count} {item.type}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )
      return createPortal(progressContent, document.body)
    }

    const bannerContent = (
      <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Masa Trial Telah Berakhir
          </h2>

          <p className="text-gray-600 mb-6">
            Masa trial gratis Anda berakhir pada <span className="font-semibold">{subscriptionState.expiryDate}</span>.
            Upgrade sekarang untuk melanjutkan menggunakan semua fitur.
          </p>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-purple-700 font-medium mb-2">
              <Sparkles className="h-5 w-5" />
              <span>Upgrade ke PRO untuk mendapatkan:</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Hingga 10 outlet</li>
              <li>50 staff per outlet</li>
              <li>2.000 appointment/bulan</li>
              <li>Unlimited services</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleUpgradeClick}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#EC4899] text-white py-6 text-lg"
            >
              Upgrade Sekarang
            </Button>

            {hasExcessResources ? (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-3">
                  Atau lanjutkan dengan Free Plan (beberapa data akan dihapus):
                </p>
                <div className="bg-red-50 rounded-lg p-3 mb-3 text-left">
                  <ul className="text-xs text-red-600 space-y-1">
                    {resourcesToDelete.outlets > 0 && (
                      <li>• {resourcesToDelete.outlets} outlet akan dihapus (max 1)</li>
                    )}
                    {resourcesToDelete.services > 0 && (
                      <li>• {resourcesToDelete.services} service akan dihapus (max 20)</li>
                    )}
                    {resourcesToDelete.staff > 0 && (
                      <li>• {resourcesToDelete.staff} staff akan dihapus (max 5)</li>
                    )}
                  </ul>
                </div>
                <Button
                  variant="outline"
                  onClick={handleContinueWithFree}
                  className="w-full text-gray-600"
                >
                  Lanjutkan dengan Free Plan
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => window.location.reload()}
                className="w-full text-gray-500"
              >
                Lanjutkan dengan Free Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    )

    return createPortal(bannerContent, document.body)
  }

  // PAID PLAN EXPIRED - Can renew or downgrade
  const impactPreview = [
    {
      icon: Building2,
      label: "Outlets",
      from: formatLimit(currentPlanLimits.max_outlets),
      to: formatLimit(freePlanLimits.max_outlets),
      willDelete: resourcesToDelete.outlets
    },
    {
      icon: Users,
      label: "Staff/Outlet",
      from: formatLimit(currentPlanLimits.max_staff_per_outlet),
      to: formatLimit(freePlanLimits.max_staff_per_outlet),
      willDelete: 0
    },
    {
      icon: Calendar,
      label: "Appt/Bulan",
      from: formatLimit(currentPlanLimits.max_appointments_per_month),
      to: formatLimit(freePlanLimits.max_appointments_per_month),
      willDelete: 0
    },
    {
      icon: Briefcase,
      label: "Services",
      from: formatLimit(currentPlanLimits.max_services),
      to: formatLimit(freePlanLimits.max_services),
      willDelete: resourcesToDelete.services
    }
  ]

  // Check if on subscription page - don't block
  const isOnSubscriptionPage = typeof window !== 'undefined' &&
    (window.location.pathname.includes('/subscription'))

  const handleRenewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    window.location.href = '/subscription/manage'
  }

  const handleDowngradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirmDialog(true)
  }

  const bannerContent = (
    <>
      {/* Overlay for blocking - separate from banner, hide when dialog is open */}
      {!showConfirmDialog && !isOnSubscriptionPage && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px]"
          style={{ zIndex: 9998 }}
        />
      )}

      {/* Banner */}
      <div
        className="fixed top-0 left-0 right-0"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-b-4 border-red-600 shadow-2xl px-4 py-4">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full animate-pulse flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-red-800">
                      Subscription Expired - Action Required
                    </h3>
                    <Badge variant="destructive" className="animate-pulse text-xs">
                      EXPIRED
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700 mt-0.5">
                    <span className="font-semibold">{subscriptionState.plan}</span> plan Anda berakhir pada{' '}
                    <span className="font-semibold">{subscriptionState.expiryDate}</span>.
                    Silakan perpanjang atau downgrade ke Free.
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 flex-shrink-0 sm:ml-4" style={{ position: 'relative', zIndex: 10000 }}>
                <button
                  type="button"
                  onClick={handleRenewClick}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#6D28D9] hover:to-[#EC4899] text-white shadow-lg cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  Renew {subscriptionState.plan} Plan
                </button>
                <button
                  type="button"
                  onClick={handleDowngradeClick}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 bg-white cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  Downgrade to Free
                </button>
              </div>
            </div>

            {/* Impact Preview */}
            <div className="border-t border-red-200 pt-3">
              <div className="flex items-center gap-2 text-xs text-red-600 mb-2 font-medium">
                <ArrowDownCircle className="h-3.5 w-3.5" />
                <span>Impact jika downgrade ke Free Plan:</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {impactPreview.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 border",
                        item.willDelete > 0
                          ? "bg-red-50 border-red-200"
                          : "bg-white/80 border-red-100"
                      )}
                    >
                      <Icon className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-500">{item.label}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-gray-400 line-through">{item.from}</span>
                          <span className="text-xs text-red-400">→</span>
                          <span className="text-sm font-bold text-red-600">{item.to}</span>
                        </div>
                        {item.willDelete > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            {item.willDelete} akan dihapus
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {createPortal(bannerContent, document.body)}

      {/* Spacer */}
      <div className="h-[180px] sm:h-[160px]" />

      {/* Confirmation Dialog */}
      <DowngradeConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmDowngrade}
        currentPlan={subscriptionState.plan}
        currentLimits={currentPlanLimits}
        freePlanLimits={freePlanLimits}
        resourceCounts={resourceCounts}
        resourcesToDelete={resourcesToDelete}
        progress={downgradeProgress}
      />
    </>
  )
}

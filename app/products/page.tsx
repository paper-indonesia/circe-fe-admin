"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/context"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { Plus, Clock, Edit, Trash2, Scissors, ChevronLeft, ChevronRight, Search, Users, Star, Banknote, AlertCircle, Settings, Image, FileText, ChevronDown, ChevronUp, Sparkles, TrendingDown, Building2, Tag, Lock, Crown } from "lucide-react"
import GradientLoading from "@/components/gradient-loading"
import { EmptyState } from "@/components/ui/empty-state"
import { AddButton } from "@/components/ui/add-button"
import { PricingStrategySection } from "@/components/pricing-strategy-section"
import { useSubscription } from "@/lib/subscription-context"
import { useRouter } from "next/navigation"

export default function TreatmentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const undoToastDismissRef = useRef<(() => void) | null>(null)

  const {
    treatments = [],
    bookings = [],
    staff = [],
    loading,
    addTreatment,
    updateTreatment,
    deleteTreatment,
  } = useAppContext()

  const { subscription } = useSubscription()

  // Service limits by plan
  const SERVICE_LIMITS: Record<string, number> = {
    free: 10,
    pro: 50,
    enterprise: 999999, // effectively unlimited
  }

  const currentPlan = subscription?.plan?.toLowerCase() || 'free'
  const serviceLimit = SERVICE_LIMITS[currentPlan] || SERVICE_LIMITS.free
  const currentServiceCount = treatments.length
  const canAddService = currentServiceCount < serviceLimit
  const isAtLimit = currentServiceCount >= serviceLimit

  // Generate unique slug from name with timestamp
  const generateUniqueSlug = (name: string): string => {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen

    // Add timestamp to ensure uniqueness
    const timestamp = Date.now()
    return `${baseSlug}-${timestamp}`
  }

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<any>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [staffFilter, setStaffFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [popularityFilter, setPopularityFilter] = useState("all")
  const [staffAssignSearchQuery, setStaffAssignSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [categoryTemplates, setCategoryTemplates] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [outlets, setOutlets] = useState<Array<{ id: string; name: string }>>([])
  const [loadingOutlets, setLoadingOutlets] = useState(false)
  const pageSize = 10

  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    slug: "",
    category: "",
    durationMin: 60,
    price: 0,
    currency: "IDR",
    photo: "",
    description: "",
    preparationMinutes: 0,
    cleanupMinutes: 0,
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 1,
    requiresStaff: true,
    requiredStaffCount: 1,
    allowParallelBookings: false,
    maxParallelBookings: 1,
    tags: [] as string[],
    isActive: true,
    status: "active" as "active" | "inactive" | "archived",
    // Pricing fields
    outletPrices: {} as Record<string, number>,
    promotionalPrice: null as number | null,
    promotionalValidUntil: null as string | null,
  })

  useEffect(() => {
    const fetchCategoryTemplates = async () => {
      setLoadingCategories(true)
      try {
        const response = await fetch('/api/services/categories/templates')
        if (response.ok) {
          const data = await response.json()
          // API returns array of category strings
          if (Array.isArray(data)) {
            setCategoryTemplates(data)
          } else if (data.categories && Array.isArray(data.categories)) {
            setCategoryTemplates(data.categories)
          }
        }
      } catch (error) {
        console.error('Failed to fetch category templates:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategoryTemplates()
  }, [])

  useEffect(() => {
    const fetchOutlets = async () => {
      setLoadingOutlets(true)
      try {
        const response = await fetch('/api/outlets')
        if (response.ok) {
          const data = await response.json()
          // Map outlets to simple format for pricing component
          const outletsData = (data.items || data || []).map((outlet: any) => ({
            id: outlet.id || outlet._id,
            name: outlet.name
          }))
          setOutlets(outletsData)
        }
      } catch (error) {
        console.error('Failed to fetch outlets:', error)
      } finally {
        setLoadingOutlets(false)
      }
    }

    fetchOutlets()
  }, [])

  const treatmentsWithStats = useMemo(() => {
    return treatments.map((treatment) => {
      const treatmentBookings = bookings.filter((b) => b.treatmentId === treatment.id)
      const completedBookings = treatmentBookings.filter((b) => b.status === "completed")

      let popularity = "low"
      if (treatmentBookings.length > 20) popularity = "high"
      else if (treatmentBookings.length > 10) popularity = "medium"

      return {
        ...treatment,
        bookingCount: treatmentBookings.length,
        completedCount: completedBookings.length,
        popularity,
      }
    })
  }, [treatments, bookings])

  const filteredTreatments = useMemo(() => {
    return treatmentsWithStats.filter((treatment) => {
      const matchesCategory = categoryFilter === "all" || treatment.category === categoryFilter
      const matchesSearch =
        searchQuery === "" ||
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "all" || treatment.status === statusFilter
      const matchesPopularity = popularityFilter === "all" || treatment.popularity === popularityFilter

      return matchesCategory && matchesSearch && matchesStatus && matchesPopularity
    })
  }, [treatmentsWithStats, categoryFilter, searchQuery, statusFilter, popularityFilter])

  const totalPages = Math.ceil(filteredTreatments.length / pageSize)
  const paginatedTreatments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredTreatments.slice(startIndex, startIndex + pageSize)
  }, [filteredTreatments, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, searchQuery, statusFilter, popularityFilter])

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(treatments.map((t) => t.category))]
    return uniqueCategories.sort()
  }, [treatments])

  const handleAddTreatment = async () => {
    console.log("[v0] handleAddTreatment called with form:", treatmentForm)

    // Prevent double submission
    if (isSubmitting) return

    if (!treatmentForm.name || !treatmentForm.category || treatmentForm.price <= 0) {
      console.log("[v0] Validation failed:", {
        name: treatmentForm.name,
        category: treatmentForm.category,
        price: treatmentForm.price,
      })
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    // Validate character limits
    if (treatmentForm.name.length > 100) {
      toast({ title: "Error", description: "Product name must not exceed 100 characters", variant: "destructive" })
      return
    }

    if (treatmentForm.description.length > 1000) {
      toast({ title: "Error", description: "Description must not exceed 1000 characters", variant: "destructive" })
      return
    }

    console.log("[v0] Validation passed, calling API...")

    setIsSubmitting(true)
    try {
      // Generate unique slug if not provided
      const uniqueSlug = treatmentForm.slug || generateUniqueSlug(treatmentForm.name)

      // Call API directly using POST /api/v1/services
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: treatmentForm.name,
          slug: uniqueSlug,
          category: treatmentForm.category,
          description: treatmentForm.description || undefined,
          duration_minutes: treatmentForm.durationMin,
          preparation_minutes: treatmentForm.preparationMinutes || undefined,
          cleanup_minutes: treatmentForm.cleanupMinutes || undefined,
          max_advance_booking_days: treatmentForm.maxAdvanceBookingDays || 30,
          min_advance_booking_hours: treatmentForm.minAdvanceBookingHours || 1,
          requires_staff: treatmentForm.requiresStaff,
          required_staff_count: treatmentForm.requiredStaffCount || 1,
          allow_parallel_bookings: treatmentForm.allowParallelBookings || false,
          max_parallel_bookings: treatmentForm.maxParallelBookings || 1,
          pricing: {
            base_price: treatmentForm.price,
            currency: treatmentForm.currency || "IDR",
            outlet_prices: treatmentForm.outletPrices || {},
            promotional_price: treatmentForm.promotionalPrice || undefined,
            promotional_valid_until: treatmentForm.promotionalValidUntil || undefined,
          },
          tags: treatmentForm.tags,
          image_url: treatmentForm.photo || undefined,
          is_active: treatmentForm.isActive,
          status: treatmentForm.status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || "Failed to add product")
      }

      const data = await response.json()
      console.log("[v0] Product added successfully:", data)

      toast({ title: "Success", description: "Product added successfully" })
      setShowAddDialog(false)
      resetForm()

      // Reload page to fetch updated product list
      window.location.reload()
    } catch (error: any) {
      console.log("[v0] Error adding treatment:", error)
      toast({ title: "Error", description: error.message || "Failed to add product", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTreatment = async () => {
    // Prevent double submission
    if (isSubmitting) return

    if (!editingTreatment || !treatmentForm.name || !treatmentForm.category || treatmentForm.price <= 0) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    // Validate character limits
    if (treatmentForm.name.length > 100) {
      toast({ title: "Error", description: "Product name must not exceed 100 characters", variant: "destructive" })
      return
    }

    if (treatmentForm.description.length > 1000) {
      toast({ title: "Error", description: "Description must not exceed 1000 characters", variant: "destructive" })
      return
    }

    setIsSubmitting(true)
    try {
      // Generate new unique slug if name changed and slug is empty
      let slugToUse = treatmentForm.slug
      if (!slugToUse && treatmentForm.name !== editingTreatment.name) {
        slugToUse = generateUniqueSlug(treatmentForm.name)
      }

      const response = await fetch('/api/services', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTreatment.id,
          name: treatmentForm.name,
          slug: slugToUse || undefined,
          category: treatmentForm.category,
          description: treatmentForm.description || undefined,
          duration_minutes: treatmentForm.durationMin,
          preparation_minutes: treatmentForm.preparationMinutes || undefined,
          cleanup_minutes: treatmentForm.cleanupMinutes || undefined,
          max_advance_booking_days: treatmentForm.maxAdvanceBookingDays || 30,
          min_advance_booking_hours: treatmentForm.minAdvanceBookingHours || 1,
          requires_staff: treatmentForm.requiresStaff,
          required_staff_count: treatmentForm.requiredStaffCount || 1,
          allow_parallel_bookings: treatmentForm.allowParallelBookings || false,
          max_parallel_bookings: treatmentForm.maxParallelBookings || 1,
          pricing: {
            base_price: treatmentForm.price,
            currency: treatmentForm.currency || "IDR",
            outlet_prices: treatmentForm.outletPrices || {},
            promotional_price: treatmentForm.promotionalPrice || undefined,
            promotional_valid_until: treatmentForm.promotionalValidUntil || undefined,
          },
          tags: treatmentForm.tags,
          image_url: treatmentForm.photo || undefined,
          is_active: treatmentForm.isActive,
          status: treatmentForm.status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || "Failed to update product")
      }

      const data = await response.json()

      toast({ title: "Success", description: "Product updated successfully" })
      setEditingTreatment(null)
      resetForm()

      // Reload page to fetch updated product list
      window.location.reload()
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update product", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTreatment = (treatment: any) => {
    setProductToDelete(treatment)
    setShowDeleteDialog(true)
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return

    const deletedProduct = { ...productToDelete }

    try {
      await deleteTreatment(productToDelete.id)

      // Clear existing undo timer if any
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
      }

      // Show undo toast
      const { dismiss } = toast({
        title: "Product deleted (soft)",
        description: "Undo within 10 seconds.",
        duration: 10000,
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUndoDeleteProduct(deletedProduct.id)}
            className="bg-white hover:bg-gray-100"
          >
            Undo
          </Button>
        ),
      })

      undoToastDismissRef.current = dismiss

      // Set timer to finalize deletion after 10 seconds
      undoTimerRef.current = setTimeout(() => {
        undoTimerRef.current = null
        undoToastDismissRef.current = null
      }, 10000)

      setShowDeleteDialog(false)
      setProductToDelete(null)
    } catch (error: any) {
      let errorMessage = "Failed to delete product"
      if (error.message) {
        errorMessage = error.message
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    }
  }

  const handleUndoDeleteProduct = async (productId: string) => {
    try {
      // Call restore API endpoint
      const response = await fetch(`/api/treatments/${productId}/restore`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore product')
      }

      // Clear undo timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
        undoTimerRef.current = null
      }
      if (undoToastDismissRef.current) {
        undoToastDismissRef.current()
        undoToastDismissRef.current = null
      }

      toast({
        title: "Product restored",
        description: "Product has been successfully restored.",
      })

      // Refresh products list
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore product",
        variant: "destructive"
      })
    }
  }

  const openAddDialog = () => {
    console.log("[v0] Add Treatment button clicked")

    // Check service limit
    if (!canAddService) {
      toast({
        title: "Service Limit Reached",
        description: `Your ${currentPlan.toUpperCase()} plan allows up to ${serviceLimit} services. Please upgrade to add more.`,
        variant: "destructive",
      })
      return
    }

    resetForm()
    setShowAddDialog(true)
    console.log("[v0] Dialog should be open, showAddDialog:", true)
  }

  const openEditDialog = (treatment: any) => {
    console.log('[DEBUG] openEditDialog - Raw treatment data:', treatment)
    console.log('[DEBUG] allow_parallel_bookings:', treatment.allow_parallel_bookings)
    console.log('[DEBUG] max_parallel_bookings:', treatment.max_parallel_bookings)

    const formData = {
      name: treatment.name,
      slug: treatment.slug || "",
      category: treatment.category,
      durationMin: treatment.durationMin ?? treatment.duration_minutes ?? 60,
      price: treatment.price ?? treatment.pricing?.base_price ?? 0,
      currency: treatment.currency || treatment.pricing?.currency || "IDR",
      photo: treatment.photo || treatment.image_url || "",
      description: treatment.description || "",
      preparationMinutes: treatment.preparation_minutes ?? treatment.preparationMinutes ?? 0,
      cleanupMinutes: treatment.cleanup_minutes ?? treatment.cleanupMinutes ?? 0,
      maxAdvanceBookingDays: treatment.max_advance_booking_days ?? treatment.maxAdvanceBookingDays ?? 30,
      minAdvanceBookingHours: treatment.min_advance_booking_hours ?? treatment.minAdvanceBookingHours ?? 1,
      requiresStaff: treatment.requires_staff !== undefined ? treatment.requires_staff : treatment.requiresStaff !== false,
      requiredStaffCount: treatment.required_staff_count ?? treatment.requiredStaffCount ?? 1,
      allowParallelBookings: treatment.allow_parallel_bookings ?? treatment.allowParallelBookings ?? false,
      maxParallelBookings: treatment.max_parallel_bookings ?? treatment.maxParallelBookings ?? 1,
      tags: treatment.tags || [],
      isActive: treatment.is_active !== false && treatment.isActive !== false,
      status: treatment.status || "active",
      // Pricing strategy fields
      outletPrices: treatment.pricing?.outlet_prices || {},
      promotionalPrice: treatment.pricing?.promotional_price || null,
      promotionalValidUntil: treatment.pricing?.promotional_valid_until || null,
    }

    console.log('[DEBUG] Mapped form data:', formData)
    console.log('[DEBUG] allowParallelBookings:', formData.allowParallelBookings)
    console.log('[DEBUG] maxParallelBookings:', formData.maxParallelBookings)

    setTreatmentForm(formData)
    setEditingTreatment(treatment)
  }

  const resetForm = () => {
    setTreatmentForm({
      name: "",
      slug: "",
      category: "",
      durationMin: 60,
      price: 0,
      currency: "IDR",
      photo: "",
      description: "",
      preparationMinutes: 0,
      cleanupMinutes: 0,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 1,
      requiresStaff: true,
      requiredStaffCount: 1,
      allowParallelBookings: false,
      maxParallelBookings: 1,
      tags: [],
      isActive: true,
      status: "active",
      // Reset pricing fields
      outletPrices: {},
      promotionalPrice: null,
      promotionalValidUntil: null,
    })
  }

  // Helper function to check if promotional price is active
  const isPromotionalActive = (treatment: any) => {
    if (!treatment.pricing?.promotional_price || !treatment.pricing?.promotional_valid_until) {
      return false
    }
    return new Date(treatment.pricing.promotional_valid_until) > new Date()
  }

  // Helper function to get pricing info for display
  const getPricingInfo = (treatment: any) => {
    const basePrice = treatment.price ?? treatment.pricing?.base_price ?? 0
    const hasOutletPricing = treatment.pricing?.outlet_prices && Object.keys(treatment.pricing.outlet_prices).length > 0
    const promotionalPrice = treatment.pricing?.promotional_price
    const isPromoActive = isPromotionalActive(treatment)

    return {
      basePrice,
      hasOutletPricing,
      promotionalPrice,
      isPromoActive,
      displayPrice: isPromoActive ? promotionalPrice : basePrice
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case "archived":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function getPopularityBadge(popularity: string) {
    switch (popularity) {
      case "high":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Demand</Badge>
      case "medium":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{popularity}</Badge>
    }
  }

  const averagePrice =
    treatments.length > 0 ? Math.round(treatments.reduce((sum, t) => sum + t.price, 0) / treatments.length) : 0

  const averageDuration =
    treatments.length > 0 ? Math.round(treatments.reduce((sum, t) => sum + t.durationMin, 0) / treatments.length) : 0

  if (loading) {
    return (
      <>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <GradientLoading />
        </div>
      </>
    )
  }

  // Check if data is completely empty
  const hasNoData = !loading && (!treatments || treatments.length === 0)

  return (
    <>
      {hasNoData ? (
        <EmptyState
          icon={Star}
          title={`No Products Defined`}
          description={`Create your products to offer services to your customers.`}
          actionLabel={`Add Products`}
          onAction={openAddDialog}
          tips={[
            {
              icon: Star,
              title: `Define Products`,
              description: "Set prices and duration"
            },
            {
              icon: Users,
              title: `Assign Staff`,
              description: `Link products to staff`
            },
            {
              icon: Banknote,
              title: "Pricing Strategy",
              description: "Competitive pricing"
            }
          ]}
        />
      ) : (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products & Services</h1>
            <p className="text-muted-foreground">Manage your product catalog and service offerings</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Usage Indicator */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`font-medium ${isAtLimit ? 'text-red-600' : 'text-muted-foreground'}`}>
                {currentServiceCount}/{serviceLimit === 999999 ? '∞' : serviceLimit}
              </span>
              <Badge variant={isAtLimit ? "destructive" : "secondary"} className="text-xs">
                {currentPlan.toUpperCase()}
              </Badge>
            </div>
            {isAtLimit ? (
              <Button
                onClick={() => router.push('/subscription/manage')}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] hover:from-[#7C3AED] hover:to-[#DB2777] text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            ) : (
              <AddButton onClick={openAddDialog}>
                Add Product
              </AddButton>
            )}
          </div>
        </div>

        {/* Limit Warning Banner */}
        {isAtLimit && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Lock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-800">Service Limit Reached</h4>
                <p className="text-sm text-amber-700">
                  You've reached the maximum of {serviceLimit} services on your {currentPlan.toUpperCase()} plan.
                  {currentPlan === 'free' && ' Upgrade to PRO for up to 50 services.'}
                  {currentPlan === 'pro' && ' Upgrade to ENTERPRISE for unlimited services.'}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/subscription/manage')}
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </div>
          </div>
        )}

        {/* Approaching Limit Warning */}
        {!isAtLimit && currentServiceCount >= serviceLimit * 0.8 && serviceLimit !== 999999 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <AlertCircle className="h-4 w-4" />
              <span>
                You're approaching your service limit ({currentServiceCount}/{serviceLimit}).
                <button
                  onClick={() => router.push('/subscription/manage')}
                  className="ml-1 font-medium underline hover:no-underline"
                >
                  Consider upgrading
                </button>
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={popularityFilter} onValueChange={setPopularityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All popularity</SelectItem>
              <SelectItem value="high">High Demand</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading treatments...</div>
        ) : filteredTreatments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {categoryFilter !== "all" || searchQuery || staffFilter !== "all" || statusFilter !== "all" || popularityFilter !== "all"
              ? "No products found matching your filters"
              : "No products found"}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-[#FCD6F5]/20 to-[#EDE9FE]/20">
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Duration & Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Popularity</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTreatments.map((treatment, index) => (
                      <TableRow
                        key={treatment.id}
                        className="hover:bg-[#FCD6F5]/10 transition-colors"
                      >
                        <TableCell className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center">
                              {treatment.image_url ? (
                                <img
                                  src={treatment.image_url}
                                  alt={treatment.name}
                                  className="w-12 h-12 object-cover"
                                />
                              ) : (
                                <Star className="h-6 w-6 text-[#8B5CF6]" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{treatment.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {treatment.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] text-white border-0"
                          >
                            {treatment.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-4">
                          {(() => {
                            const pricingInfo = getPricingInfo(treatment)
                            return (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  {treatment.durationMin} min
                                </div>
                                <div className="flex items-center gap-2">
                                  {pricingInfo.isPromoActive ? (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm line-through text-gray-400">
                                          Rp {pricingInfo.basePrice.toLocaleString("id-ID")}
                                        </span>
                                        <span className="font-bold text-orange-600">
                                          Rp {pricingInfo.promotionalPrice.toLocaleString("id-ID")}
                                        </span>
                                      </div>
                                      <Badge className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-1.5 py-0">
                                        <Sparkles className="h-3 w-3 mr-0.5" />
                                        SALE
                                      </Badge>
                                    </>
                                  ) : (
                                    <span className="font-semibold text-[#8B5CF6]">
                                      Rp {pricingInfo.basePrice.toLocaleString("id-ID")}
                                    </span>
                                  )}
                                </div>
                                {/* Pricing indicators */}
                                <div className="flex items-center gap-1.5 mt-1">
                                  {pricingInfo.hasOutletPricing && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-purple-300 text-purple-700">
                                      <Building2 className="h-2.5 w-2.5 mr-0.5" />
                                      {Object.keys(treatment.pricing?.outlet_prices || {}).length} outlets
                                    </Badge>
                                  )}
                                  {treatment.pricing?.promotional_price && !pricingInfo.isPromoActive && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-gray-300 text-gray-500">
                                      Promo expired
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )
                          })()}
                        </TableCell>
                        <TableCell className="p-4">{getStatusBadge(treatment.status || "active")}</TableCell>
                        <TableCell className="p-4">{getPopularityBadge(treatment.popularity)}</TableCell>
                        <TableCell className="p-4">
                          <div className="text-sm">
                            <div className="font-medium">{treatment.bookingCount} total</div>
                            <div className="text-gray-500">{treatment.completedCount} completed</div>
                          </div>
                        </TableCell>
                        <TableCell className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(treatment)}
                              className="hover:bg-[#EDE9FE]/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteTreatment(treatment)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredTreatments.length)} of {filteredTreatments.length}{" "}
                  products
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{treatments.length}</div>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">Rp {averagePrice.toLocaleString("id-ID")}</div>
              <p className="text-sm text-muted-foreground">Average Price</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{averageDuration} min</div>
              <p className="text-sm text-muted-foreground">Average Duration</p>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Dialog is outside conditional to always be in DOM */}
      <Dialog
        open={showAddDialog || !!editingTreatment}
        onOpenChange={() => {
          setShowAddDialog(false)
          setEditingTreatment(null)
          setStaffAssignSearchQuery("")
          setShowAdvancedSettings(false)
          resetForm()
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE]">
                <Star className="h-5 w-5 text-gray-800" />
              </div>
              {editingTreatment ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Essential Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <FileText className="h-4 w-4 text-[#8B5CF6]" />
                Essential Information
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Facial Treatment, Hair Spa, Manicure"
                    value={treatmentForm.name}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 100) {
                        setTreatmentForm((prev) => ({ ...prev, name: value }))
                      }
                    }}
                    className="h-11"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">
                    {treatmentForm.name.length}/100 characters
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    {loadingCategories ? (
                      <div className="h-11 flex items-center justify-center border rounded-md bg-gray-50">
                        <span className="text-sm text-gray-500">Loading categories...</span>
                      </div>
                    ) : categoryTemplates.length > 0 ? (
                      <Select
                        value={treatmentForm.category}
                        onValueChange={(value) => setTreatmentForm((prev) => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryTemplates.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="category"
                        placeholder="e.g., facial, hair_care, nails"
                        value={treatmentForm.category}
                        onChange={(e) => setTreatmentForm((prev) => ({ ...prev, category: e.target.value }))}
                        className="h-11"
                      />
                    )}
                    <p className="text-xs text-gray-500">
                      {categoryTemplates.length > 0 ? "Select from your tenant's category templates" : "Enter category in lowercase with underscores"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Duration (minutes) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        max="480"
                        placeholder="60"
                        value={treatmentForm.durationMin}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 60
                          setTreatmentForm((prev) => ({ ...prev, durationMin: Math.min(480, Math.max(1, value)) }))
                        }}
                        className="h-11 pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price (IDR) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="100000"
                      value={treatmentForm.price}
                      onChange={(e) => setTreatmentForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="h-11 pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Enter the base price for this service</p>
                </div>
              </div>
            </div>

            {/* Description & Image */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <Image className="h-4 w-4 text-[#8B5CF6]" />
                Description & Image
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this service includes, its benefits, and what customers can expect..."
                    value={treatmentForm.description}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value.length <= 1000) {
                        setTreatmentForm((prev) => ({ ...prev, description: value }))
                      }
                    }}
                    rows={3}
                    className="resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">
                    {treatmentForm.description.length}/1000 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo" className="text-sm font-medium">Image URL</Label>
                  <Input
                    id="photo"
                    placeholder="https://example.com/image.jpg"
                    value={treatmentForm.photo}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, photo: e.target.value }))}
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Add an image to make your product more attractive</p>
                </div>
              </div>
            </div>

            {/* Status & Active Toggle */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                <Settings className="h-4 w-4 text-[#8B5CF6]" />
                Status & Availability
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Product Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={treatmentForm.status}
                    onValueChange={(value: any) => {
                      setTreatmentForm((prev) => ({
                        ...prev,
                        status: value,
                        // Auto-sync isActive based on status
                        isActive: value === "active"
                      }))
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Active - Available for booking</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                          <span>Inactive - Hidden from booking</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                          <span>Archived - Discontinued product</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {treatmentForm.status === "active" && "Product is visible and can be booked by customers"}
                    {treatmentForm.status === "inactive" && "Product is hidden and cannot be booked (use for temporary unavailability)"}
                    {treatmentForm.status === "archived" && "Product is archived and no longer offered"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Strategy Section */}
            <div className="pt-4 border-t">
              <PricingStrategySection
                basePrice={treatmentForm.price}
                currency={treatmentForm.currency}
                outletPrices={treatmentForm.outletPrices}
                promotionalPrice={treatmentForm.promotionalPrice}
                promotionalValidUntil={treatmentForm.promotionalValidUntil}
                onOutletPricesChange={(outletPrices) => {
                  setTreatmentForm((prev) => ({ ...prev, outletPrices }))
                }}
                onPromotionalPriceChange={(price, validUntil) => {
                  setTreatmentForm((prev) => ({
                    ...prev,
                    promotionalPrice: price,
                    promotionalValidUntil: validUntil
                  }))
                }}
                availableOutlets={outlets}
              />
            </div>

            {/* Advanced Settings - Collapsible */}
            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 uppercase tracking-wide hover:text-[#8B5CF6] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#8B5CF6]" />
                  Advanced Settings
                </div>
                {showAdvancedSettings ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showAdvancedSettings && (
                <div className="mt-4 space-y-6 animate-in slide-in-from-top-2">
                  {/* Time Settings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-600">Time Settings</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="preparation" className="text-xs">Preparation (min)</Label>
                        <Input
                          id="preparation"
                          type="number"
                          min="0"
                          max="120"
                          value={treatmentForm.preparationMinutes}
                          onChange={(e) => setTreatmentForm((prev) => ({ ...prev, preparationMinutes: parseInt(e.target.value) || 0 }))}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="cleanup" className="text-xs">Cleanup (min)</Label>
                        <Input
                          id="cleanup"
                          type="number"
                          min="0"
                          max="120"
                          value={treatmentForm.cleanupMinutes}
                          onChange={(e) => setTreatmentForm((prev) => ({ ...prev, cleanupMinutes: parseInt(e.target.value) || 0 }))}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="minBookingHours" className="text-xs">Min Advance (hrs)</Label>
                        <Input
                          id="minBookingHours"
                          type="number"
                          min="0"
                          value={treatmentForm.minAdvanceBookingHours}
                          onChange={(e) => setTreatmentForm((prev) => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) || 0 }))}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Settings */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-600">Booking Settings</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="maxAdvanceDays" className="text-xs">Max Advance (days)</Label>
                        <Input
                          id="maxAdvanceDays"
                          type="number"
                          min="1"
                          value={treatmentForm.maxAdvanceBookingDays}
                          onChange={(e) => setTreatmentForm((prev) => ({ ...prev, maxAdvanceBookingDays: parseInt(e.target.value) || 30 }))}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="requiredStaffCount" className="text-xs">Staff Required</Label>
                        <Input
                          id="requiredStaffCount"
                          type="number"
                          min="0"
                          value={treatmentForm.requiredStaffCount}
                          onChange={(e) => setTreatmentForm((prev) => ({ ...prev, requiredStaffCount: parseInt(e.target.value) || 1 }))}
                          className="h-9"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="maxParallelBookings" className="text-xs">Max Parallel Capacity</Label>
                        <Input
                          id="maxParallelBookings"
                          type="number"
                          min="1"
                          value={treatmentForm.maxParallelBookings}
                          onChange={(e) => setTreatmentForm((prev) => ({ ...prev, maxParallelBookings: parseInt(e.target.value) || 1 }))}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiresStaff"
                          checked={treatmentForm.requiresStaff}
                          onCheckedChange={(checked) => setTreatmentForm((prev) => ({ ...prev, requiresStaff: !!checked }))}
                        />
                        <Label htmlFor="requiresStaff" className="cursor-pointer text-xs">Requires Staff</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allowParallel"
                          checked={treatmentForm.allowParallelBookings}
                          onCheckedChange={(checked) => setTreatmentForm((prev) => ({ ...prev, allowParallelBookings: !!checked }))}
                        />
                        <Label htmlFor="allowParallel" className="cursor-pointer text-xs">Allow Parallel Bookings</Label>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium text-gray-600">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="luxury, popular, new (comma-separated)"
                      value={treatmentForm.tags.join(", ")}
                      onChange={(e) => setTreatmentForm((prev) => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) }))}
                      className="h-9"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                onClick={editingTreatment ? handleEditTreatment : handleAddTreatment}
                size="lg"
                disabled={isSubmitting}
                className="flex-1 h-11 bg-gradient-to-r from-[#FCD6F5] to-[#EDE9FE] text-gray-800 hover:from-[#EDE9FE] hover:to-[#8B5CF6] border-0 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingTreatment ? "Update Product" : "Add Product"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-8"
                disabled={isSubmitting}
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingTreatment(null)
                  setShowAdvancedSettings(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteEntityDialog
        open={showDeleteDialog && !!productToDelete}
        onOpenChange={setShowDeleteDialog}
        entityType="Product"
        entityName={productToDelete?.name || ""}
        entityDetails={[
          { label: "Name", value: productToDelete?.name || "-" },
          { label: "Category", value: productToDelete?.category || "-" },
          { label: "Price", value: productToDelete?.price ? `IDR ${productToDelete.price}` : "-" },
          { label: "Duration", value: `${productToDelete?.durationMin || 0} minutes` },
          { label: "Status", value: productToDelete?.status || "active" },
        ]}
        onConfirmDelete={confirmDeleteProduct}
        softDeleteImpacts={[
          "Product will be marked as deleted and inactive",
          "Product will not appear in booking forms",
          "Existing bookings with this product will remain unchanged",
          "Historical booking data will be preserved",
          "Product data can be restored within 10 seconds"
        ]}
      />
    </>
  )
}

"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAppContext } from "@/lib/context"
import { Plus, Clock, Edit, Trash2, Scissors, ChevronLeft, ChevronRight, Search, Users, Star, DollarSign, AlertCircle } from "lucide-react"
import LiquidLoading from "@/components/ui/liquid-loader"
import { EmptyState } from "@/components/ui/empty-state"

export default function TreatmentsPage() {
  const { toast } = useToast()

  const {
    treatments = [],
    bookings = [],
    staff = [],
    loading,
    addTreatment,
    updateTreatment,
    deleteTreatment,
  } = useAppContext()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [staffFilter, setStaffFilter] = useState("all")
  const [staffAssignSearchQuery, setStaffAssignSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    slug: "",
    category: "",
    durationMin: 60,
    price: 0,
    currency: "USD",
    photo: "",
    description: "",
    assignedStaff: [] as string[], // Staff IDs who can perform this treatment
    preparationMinutes: 0,
    cleanupMinutes: 0,
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    requiresStaff: true,
    requiredStaffCount: 1,
    allowParallelBookings: false,
    maxParallelBookings: 1,
    tags: [] as string[],
    isActive: true,
    status: "active" as "active" | "inactive" | "draft",
  })

  useEffect(() => {}, [])

  const treatmentsWithStats = useMemo(() => {
    return treatments.map((treatment) => {
      const treatmentBookings = bookings.filter((b) => b.treatmentId === treatment.id)
      const completedBookings = treatmentBookings.filter((b) => b.status === "completed")

      let popularity = "low"
      if (treatmentBookings.length > 20) popularity = "high"
      else if (treatmentBookings.length > 10) popularity = "medium"

      const assignedStaffMembers = staff.filter((s) => treatment.assignedStaff?.includes(s.id) || false)

      return {
        ...treatment,
        bookingCount: treatmentBookings.length,
        completedCount: completedBookings.length,
        popularity,
        assignedStaffMembers,
      }
    })
  }, [treatments, bookings, staff])

  const filteredTreatments = useMemo(() => {
    return treatmentsWithStats.filter((treatment) => {
      const matchesCategory = categoryFilter === "all" || treatment.category === categoryFilter
      const matchesSearch =
        searchQuery === "" ||
        treatment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        treatment.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStaff = staffFilter === "all" || treatment.assignedStaffMembers.some((s) => s.id === staffFilter)

      return matchesCategory && matchesSearch && matchesStaff
    })
  }, [treatmentsWithStats, categoryFilter, searchQuery, staffFilter])

  const totalPages = Math.ceil(filteredTreatments.length / pageSize)
  const paginatedTreatments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredTreatments.slice(startIndex, startIndex + pageSize)
  }, [filteredTreatments, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, searchQuery, staffFilter])

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(treatments.map((t) => t.category))]
    return uniqueCategories.sort()
  }, [treatments])

  const handleAddTreatment = async () => {
    console.log("[v0] handleAddTreatment called with form:", treatmentForm)

    if (!treatmentForm.name || !treatmentForm.category || treatmentForm.price <= 0) {
      console.log("[v0] Validation failed:", {
        name: treatmentForm.name,
        category: treatmentForm.category,
        price: treatmentForm.price,
      })
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    console.log("[v0] Validation passed, calling addTreatment...")

    try {
      await addTreatment({
        name: treatmentForm.name,
        slug: treatmentForm.slug,
        category: treatmentForm.category,
        durationMin: treatmentForm.durationMin,
        price: treatmentForm.price,
        currency: treatmentForm.currency,
        photo: treatmentForm.photo,
        description: treatmentForm.description,
        assignedStaff: treatmentForm.assignedStaff,
        preparation_minutes: treatmentForm.preparationMinutes,
        cleanup_minutes: treatmentForm.cleanupMinutes,
        max_advance_booking_days: treatmentForm.maxAdvanceBookingDays,
        min_advance_booking_hours: treatmentForm.minAdvanceBookingHours,
        requires_staff: treatmentForm.requiresStaff,
        required_staff_count: treatmentForm.requiredStaffCount,
        allow_parallel_bookings: treatmentForm.allowParallelBookings,
        max_parallel_bookings: treatmentForm.maxParallelBookings,
        tags: treatmentForm.tags,
        is_active: treatmentForm.isActive,
        status: treatmentForm.status,
      })

      console.log("[v0] Product added successfully")
      toast({ title: "Success", description: "Product added successfully" })
      setShowAddDialog(false)
      resetForm()
    } catch (error: any) {
      console.log("[v0] Error adding treatment:", error)

      // Extract error message from API response
      let errorMessage = "Failed to add product"
      if (error.message) {
        errorMessage = error.message
      }

      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    }
  }

  const handleEditTreatment = async () => {
    if (!editingTreatment || !treatmentForm.name || !treatmentForm.category || treatmentForm.price <= 0) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    try {
      await updateTreatment(editingTreatment.id, {
        name: treatmentForm.name,
        slug: treatmentForm.slug,
        category: treatmentForm.category,
        durationMin: treatmentForm.durationMin,
        price: treatmentForm.price,
        currency: treatmentForm.currency,
        photo: treatmentForm.photo,
        description: treatmentForm.description,
        assignedStaff: treatmentForm.assignedStaff,
        preparation_minutes: treatmentForm.preparationMinutes,
        cleanup_minutes: treatmentForm.cleanupMinutes,
        max_advance_booking_days: treatmentForm.maxAdvanceBookingDays,
        min_advance_booking_hours: treatmentForm.minAdvanceBookingHours,
        requires_staff: treatmentForm.requiresStaff,
        required_staff_count: treatmentForm.requiredStaffCount,
        allow_parallel_bookings: treatmentForm.allowParallelBookings,
        max_parallel_bookings: treatmentForm.maxParallelBookings,
        tags: treatmentForm.tags,
        is_active: treatmentForm.isActive,
        status: treatmentForm.status,
      })

      toast({ title: "Success", description: "Product updated successfully" })
      setEditingTreatment(null)
      resetForm()
    } catch (error: any) {
      let errorMessage = "Failed to update product"
      if (error.message) {
        errorMessage = error.message
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    }
  }

  const handleDeleteTreatment = async (treatmentId: string) => {
    const treatmentBookings = bookings.filter((b) => b.treatmentId === treatmentId)

    if (treatmentBookings.length > 0) {
      if (
        !confirm(
          `This product has ${treatmentBookings.length} associated bookings. Are you sure you want to delete it?`,
        )
      ) {
        return
      }
    }

    try {
      await deleteTreatment(treatmentId)
      toast({ title: "Success", description: "Product deleted successfully" })
    } catch (error: any) {
      let errorMessage = "Failed to delete product"
      if (error.message) {
        errorMessage = error.message
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" })
    }
  }

  const openAddDialog = () => {
    console.log("[v0] Add Treatment button clicked")
    resetForm()
    setShowAddDialog(true)
    console.log("[v0] Dialog should be open, showAddDialog:", true)
  }

  const openEditDialog = (treatment: any) => {
    setTreatmentForm({
      name: treatment.name,
      slug: treatment.slug || "",
      category: treatment.category,
      durationMin: treatment.durationMin,
      price: treatment.price,
      currency: treatment.currency || "USD",
      photo: treatment.photo || "",
      description: treatment.description || "",
      assignedStaff: treatment.assignedStaff || [],
      preparationMinutes: treatment.preparation_minutes || treatment.preparationMinutes || 0,
      cleanupMinutes: treatment.cleanup_minutes || treatment.cleanupMinutes || 0,
      maxAdvanceBookingDays: treatment.max_advance_booking_days || treatment.maxAdvanceBookingDays || 30,
      minAdvanceBookingHours: treatment.min_advance_booking_hours || treatment.minAdvanceBookingHours || 2,
      requiresStaff: treatment.requires_staff !== undefined ? treatment.requires_staff : treatment.requiresStaff !== false,
      requiredStaffCount: treatment.required_staff_count || treatment.requiredStaffCount || 1,
      allowParallelBookings: treatment.allow_parallel_bookings || treatment.allowParallelBookings || false,
      maxParallelBookings: treatment.max_parallel_bookings || treatment.maxParallelBookings || 1,
      tags: treatment.tags || [],
      isActive: treatment.is_active !== false && treatment.isActive !== false,
      status: treatment.status || "active",
    })
    setEditingTreatment(treatment)
  }

  const resetForm = () => {
    setTreatmentForm({
      name: "",
      slug: "",
      category: "",
      durationMin: 60,
      price: 0,
      currency: "USD",
      photo: "",
      description: "",
      assignedStaff: [],
      preparationMinutes: 0,
      cleanupMinutes: 0,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      requiresStaff: true,
      requiredStaffCount: 1,
      allowParallelBookings: false,
      maxParallelBookings: 1,
      tags: [],
      isActive: true,
      status: "active",
    })
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
      <MainLayout>
        <div className="flex min-h-[600px] w-full items-center justify-center">
          <LiquidLoading />
        </div>
      </MainLayout>
    )
  }

  // Check if data is completely empty
  const hasNoData = !loading && (!treatments || treatments.length === 0)

  return (
    <MainLayout>
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
              icon: DollarSign,
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
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] text-gray-800 hover:from-[#E7C6FF] hover:to-[#C8B6FF] border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

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
            <SelectTrigger className="w-48">
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

          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {staff.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading treatments...</div>
        ) : filteredTreatments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {categoryFilter !== "all" || searchQuery || staffFilter !== "all"
              ? "No products found matching your filters"
              : "No products found"}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF]">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-800">Product</th>
                      <th className="text-left p-4 font-semibold text-gray-800">Category</th>
                      <th className="text-left p-4 font-semibold text-gray-800">Duration & Price</th>
                      <th className="text-left p-4 font-semibold text-gray-800">Assigned Staff</th>
                      <th className="text-left p-4 font-semibold text-gray-800">Popularity</th>
                      <th className="text-left p-4 font-semibold text-gray-800">Bookings</th>
                      <th className="text-right p-4 font-semibold text-gray-800">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTreatments.map((treatment, index) => (
                      <tr
                        key={treatment.id}
                        className={`border-b hover:bg-gradient-to-r hover:from-[#FFD6FF]/10 hover:to-[#E7C6FF]/10 transition-colors ${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"}`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center">
                              <img
                                src={`/abstract-geometric-shapes.png?key=yhwjw&height=48&width=48&query=${encodeURIComponent(`${treatment.name} beauty treatment icon`)}`}
                                alt={treatment.name}
                                className="w-8 h-8 object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{treatment.name}</div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {treatment.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant="secondary"
                            className="bg-gradient-to-r from-[#C8B6FF] to-[#B8C0FF] text-gray-800 border-0"
                          >
                            {treatment.category}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {treatment.durationMin} min
                            </div>
                            <div className="font-semibold text-[#C8B6FF]">
                              Rp {treatment.price.toLocaleString("id-ID")}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {treatment.assignedStaffMembers.length > 0 ? (
                              <>
                                <div className="flex -space-x-2">
                                  {treatment.assignedStaffMembers.slice(0, 3).map((staffMember) => (
                                    <div
                                      key={staffMember.id}
                                      className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex items-center justify-center"
                                      title={staffMember.name}
                                    >
                                      <img
                                        src={`/abstract-geometric-shapes.png?key=kymfx&height=32&width=32&query=${encodeURIComponent(`${staffMember.name} professional portrait`)}`}
                                        alt={staffMember.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ))}
                                </div>
                                {treatment.assignedStaffMembers.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{treatment.assignedStaffMembers.length - 3} more
                                  </span>
                                )}
                                <div className="text-xs text-gray-600">
                                  {treatment.assignedStaffMembers
                                    .slice(0, 2)
                                    .map((s) => s.name)
                                    .join(", ")}
                                  {treatment.assignedStaffMembers.length > 2 && "..."}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No staff assigned</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{getPopularityBadge(treatment.popularity)}</td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div className="font-medium">{treatment.bookingCount} total</div>
                            <div className="text-gray-500">{treatment.completedCount} completed</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(treatment)}
                              className="hover:bg-[#E7C6FF]/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                              onClick={() => handleDeleteTreatment(treatment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          resetForm()
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              {editingTreatment ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3 text-base">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cappuccino, Facial Treatment, Yoga Class"
                    value={treatmentForm.name}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    placeholder="e.g., Beverage, Beauty, Fitness, Food"
                    value={treatmentForm.category}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, category: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Enter any category for your business</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL-friendly)</Label>
                  <Input
                    id="slug"
                    placeholder="auto-generated if empty"
                    value={treatmentForm.slug}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, slug: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to auto-generate</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={treatmentForm.status}
                    onValueChange={(value: any) => setTreatmentForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Duration & Time Settings */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-base">Time Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (min) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="480"
                    value={treatmentForm.durationMin}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 60
                      setTreatmentForm((prev) => ({ ...prev, durationMin: Math.min(480, Math.max(1, value)) }))
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preparation">Preparation (min)</Label>
                  <Input
                    id="preparation"
                    type="number"
                    min="0"
                    max="120"
                    value={treatmentForm.preparationMinutes}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, preparationMinutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cleanup">Cleanup (min)</Label>
                  <Input
                    id="cleanup"
                    type="number"
                    min="0"
                    max="120"
                    value={treatmentForm.cleanupMinutes}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, cleanupMinutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minBookingHours">Min Advance (hours)</Label>
                  <Input
                    id="minBookingHours"
                    type="number"
                    min="0"
                    value={treatmentForm.minAdvanceBookingHours}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, minAdvanceBookingHours: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-base">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={treatmentForm.price}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={treatmentForm.currency}
                    onValueChange={(value) => setTreatmentForm((prev) => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="IDR">IDR</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Booking Settings */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-base">Booking Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxAdvanceDays">Max Advance Booking (days)</Label>
                  <Input
                    id="maxAdvanceDays"
                    type="number"
                    min="1"
                    value={treatmentForm.maxAdvanceBookingDays}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, maxAdvanceBookingDays: parseInt(e.target.value) || 30 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredStaffCount">Required Staff Count</Label>
                  <Input
                    id="requiredStaffCount"
                    type="number"
                    min="0"
                    value={treatmentForm.requiredStaffCount}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, requiredStaffCount: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParallelBookings">Max Parallel Bookings</Label>
                  <Input
                    id="maxParallelBookings"
                    type="number"
                    min="1"
                    value={treatmentForm.maxParallelBookings}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, maxParallelBookings: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresStaff"
                    checked={treatmentForm.requiresStaff}
                    onCheckedChange={(checked) => setTreatmentForm((prev) => ({ ...prev, requiresStaff: !!checked }))}
                  />
                  <Label htmlFor="requiresStaff" className="cursor-pointer text-sm">Requires Staff</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowParallel"
                    checked={treatmentForm.allowParallelBookings}
                    onCheckedChange={(checked) => setTreatmentForm((prev) => ({ ...prev, allowParallelBookings: !!checked }))}
                  />
                  <Label htmlFor="allowParallel" className="cursor-pointer text-sm">Allow Parallel Bookings</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={treatmentForm.isActive}
                    onCheckedChange={(checked) => setTreatmentForm((prev) => ({ ...prev, isActive: !!checked }))}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer text-sm">Is Active</Label>
                </div>
              </div>
            </div>

            {/* Description & Image */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-base">Description & Media</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product/service..."
                    value={treatmentForm.description}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo">Image URL</Label>
                    <Input
                      id="photo"
                      placeholder="https://example.com/image.jpg"
                      value={treatmentForm.photo}
                      onChange={(e) => setTreatmentForm((prev) => ({ ...prev, photo: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="luxury, popular, new"
                      value={treatmentForm.tags.join(", ")}
                      onChange={(e) => setTreatmentForm((prev) => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(t => t) }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">Assign Staff Members (Optional)</h3>
                <Badge variant="secondary" className="text-xs">
                  {treatmentForm.assignedStaff.length} selected
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Select staff members who can provide this service (leave empty if not applicable)</p>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff by name or role..."
                  value={staffAssignSearchQuery}
                  onChange={(e) => setStaffAssignSearchQuery(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400"
                />
              </div>

              <div className="max-h-60 overflow-y-auto border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                {staff
                  .filter(
                    (s) =>
                      s.name.toLowerCase().includes(staffAssignSearchQuery.toLowerCase()) ||
                      s.role.toLowerCase().includes(staffAssignSearchQuery.toLowerCase()),
                  )
                  .map((staffMember) => (
                    <div key={staffMember.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-background/80 transition-colors border border-transparent hover:border-primary/20">
                      <Checkbox
                        id={`staff-${staffMember.id}`}
                        checked={treatmentForm.assignedStaff.includes(staffMember.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTreatmentForm((prev) => ({
                              ...prev,
                              assignedStaff: [...prev.assignedStaff, staffMember.id],
                            }))
                          } else {
                            setTreatmentForm((prev) => ({
                              ...prev,
                              assignedStaff: prev.assignedStaff.filter((id) => id !== staffMember.id),
                            }))
                          }
                        }}
                      />
                      <Label htmlFor={`staff-${staffMember.id}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{staffMember.name}</div>
                            <div className="text-xs text-muted-foreground">{staffMember.role}</div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {staffMember.role}
                          </Badge>
                        </div>
                      </Label>
                    </div>
                  ))}
                {staff.filter(
                  (s) =>
                    s.name.toLowerCase().includes(staffAssignSearchQuery.toLowerCase()) ||
                    s.role.toLowerCase().includes(staffAssignSearchQuery.toLowerCase()),
                ).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No staff found matching your search</p>
                  </div>
                )}
              </div>

              {treatmentForm.assignedStaff.length === 0 && treatmentForm.requiresStaff && (
                <p className="text-sm text-yellow-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  No staff assigned. This product requires staff but none selected.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t mt-6">
              <Button
                onClick={editingTreatment ? handleEditTreatment : handleAddTreatment}
                size="lg"
                className="flex-1 bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] text-gray-800 hover:from-[#E7C6FF] hover:to-[#C8B6FF] border-0"
              >
                {editingTreatment ? "Update Product" : "Add Product"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingTreatment(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

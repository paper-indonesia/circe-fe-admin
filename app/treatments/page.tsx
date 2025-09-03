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
import { Plus, Clock, Edit, Trash2, Scissors, ChevronLeft, ChevronRight, Search, Users } from "lucide-react"

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
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [treatmentForm, setTreatmentForm] = useState({
    name: "",
    category: "",
    durationMin: 60,
    price: 0,
    description: "",
    assignedStaff: [] as string[], // Staff IDs who can perform this treatment
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
        category: treatmentForm.category,
        durationMin: treatmentForm.durationMin,
        price: treatmentForm.price,
        description: treatmentForm.description,
        assignedStaff: treatmentForm.assignedStaff,
      })

      console.log("[v0] Treatment added successfully")
      toast({ title: "Success", description: "Treatment added successfully" })
      setShowAddDialog(false)
      resetForm()
    } catch (error) {
      console.log("[v0] Error adding treatment:", error)
      toast({ title: "Error", description: "Failed to add treatment", variant: "destructive" })
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
        category: treatmentForm.category,
        durationMin: treatmentForm.durationMin,
        price: treatmentForm.price,
        description: treatmentForm.description,
        assignedStaff: treatmentForm.assignedStaff,
      })

      toast({ title: "Success", description: "Treatment updated successfully" })
      setEditingTreatment(null)
      resetForm()
    } catch (error) {
      toast({ title: "Error", description: "Failed to update treatment", variant: "destructive" })
    }
  }

  const handleDeleteTreatment = async (treatmentId: string) => {
    const treatmentBookings = bookings.filter((b) => b.treatmentId === treatmentId)

    if (treatmentBookings.length > 0) {
      if (
        !confirm(
          `This treatment has ${treatmentBookings.length} associated bookings. Are you sure you want to delete it?`,
        )
      ) {
        return
      }
    }

    try {
      await deleteTreatment(treatmentId)
      toast({ title: "Success", description: "Treatment deleted successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete treatment", variant: "destructive" })
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
      category: treatment.category,
      durationMin: treatment.durationMin,
      price: treatment.price,
      description: treatment.description || "",
      assignedStaff: treatment.assignedStaff || [],
    })
    setEditingTreatment(treatment)
  }

  const resetForm = () => {
    setTreatmentForm({
      name: "",
      category: "",
      durationMin: 60,
      price: 0,
      description: "",
      assignedStaff: [],
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Treatment Management</h1>
            <p className="text-muted-foreground">Manage your treatment offerings and staff assignments</p>
          </div>
          <Button
            onClick={openAddDialog}
            className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] text-gray-800 hover:from-[#E7C6FF] hover:to-[#C8B6FF] border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Treatment
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search treatments..."
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
              ? "No treatments found matching your filters"
              : "No treatments found"}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF]">
                    <tr>
                      <th className="text-left p-4 font-semibold text-gray-800">Treatment</th>
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
                  treatments
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
              <p className="text-sm text-muted-foreground">Total Treatments</p>
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

        <Dialog
          open={showAddDialog || !!editingTreatment}
          onOpenChange={() => {
            setShowAddDialog(false)
            setEditingTreatment(null)
            resetForm()
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scissors className="h-5 w-5" />
                {editingTreatment ? "Edit Treatment" : "Add New Treatment"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Treatment Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., HydraFacial"
                    value={treatmentForm.name}
                    onChange={(e) => setTreatmentForm((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={treatmentForm.category}
                    onValueChange={(value) => setTreatmentForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facial">Facial</SelectItem>
                      <SelectItem value="Injectable">Injectable</SelectItem>
                      <SelectItem value="Laser">Laser</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="Exfoliation">Exfoliation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="240"
                    step="15"
                    value={treatmentForm.durationMin}
                    onChange={(e) =>
                      setTreatmentForm((prev) => ({ ...prev, durationMin: Number.parseInt(e.target.value) || 60 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="50000"
                    value={treatmentForm.price}
                    onChange={(e) =>
                      setTreatmentForm((prev) => ({ ...prev, price: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the treatment..."
                  value={treatmentForm.description}
                  onChange={(e) => setTreatmentForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Assign Staff Members
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50/30">
                  {staff.map((staffMember) => (
                    <div
                      key={staffMember.id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/80 border border-transparent hover:border-[#E7C6FF]/30 transition-all"
                    >
                      <Checkbox
                        id={`staff-${staffMember.id}`}
                        checked={treatmentForm.assignedStaff.includes(staffMember.id)}
                        onCheckedChange={(checked) => {
                          console.log("[v0] Staff assignment changed:", staffMember.name, checked)
                          setTreatmentForm((prev) => {
                            const newAssignedStaff = checked
                              ? [...prev.assignedStaff, staffMember.id]
                              : prev.assignedStaff.filter((id) => id !== staffMember.id)
                            console.log("[v0] New assigned staff:", newAssignedStaff)
                            return {
                              ...prev,
                              assignedStaff: newAssignedStaff,
                            }
                          })
                        }}
                        className="data-[state=checked]:bg-[#C8B6FF] data-[state=checked]:border-[#C8B6FF]"
                      />
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => {
                          const isChecked = treatmentForm.assignedStaff.includes(staffMember.id)
                          const checkbox = document.getElementById(`staff-${staffMember.id}`) as HTMLButtonElement
                          if (checkbox) checkbox.click()
                        }}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF] flex-shrink-0">
                          <img
                            src={`/abstract-geometric-shapes.png?key=staff&height=40&width=40&query=${encodeURIComponent(`${staffMember.name} professional portrait`)}`}
                            alt={staffMember.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
                          <div className="text-xs text-gray-500">{staffMember.role}</div>
                          {staffMember.skills && staffMember.skills.length > 0 && (
                            <div className="text-xs text-[#C8B6FF] mt-1">
                              {staffMember.skills.slice(0, 2).join(", ")}
                              {staffMember.skills.length > 2 && "..."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {treatmentForm.assignedStaff.length > 0 && (
                  <div className="bg-gradient-to-r from-[#FFD6FF]/20 to-[#E7C6FF]/20 rounded-lg p-3 border border-[#E7C6FF]/30">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Selected Staff ({treatmentForm.assignedStaff.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {treatmentForm.assignedStaff.map((staffId) => {
                        const staffMember = staff.find((s) => s.id === staffId)
                        return staffMember ? (
                          <div
                            key={staffId}
                            className="flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-[#E7C6FF]/50"
                          >
                            <div className="w-5 h-5 rounded-full overflow-hidden bg-gradient-to-br from-[#FFD6FF] to-[#E7C6FF]">
                              <img
                                src={`/abstract-geometric-shapes.png?key=staff&height=20&width=20&query=${encodeURIComponent(`${staffMember.name} portrait`)}`}
                                alt={staffMember.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">{staffMember.name}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={editingTreatment ? handleEditTreatment : handleAddTreatment}
                  className="flex-1 bg-gradient-to-r from-[#FFD6FF] to-[#E7C6FF] text-gray-800 hover:from-[#E7C6FF] hover:to-[#C8B6FF] border-0"
                >
                  {editingTreatment ? "Update Treatment" : "Add Treatment"}
                </Button>
                <Button
                  variant="outline"
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
      </div>
    </MainLayout>
  )
}

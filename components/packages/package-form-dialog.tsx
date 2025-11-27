"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Gift, Plus, Trash2, Search, AlertCircle, Percent, Calculator, Building2 } from "lucide-react"
import type { Package, Treatment } from "@/lib/types"

interface Outlet {
  id: string
  _id?: string
  name: string
  is_active?: boolean
}

interface PackageFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  package?: Package | null
  services: Treatment[]
  outlets: Outlet[]
  maxItems: number
  onSubmit: (data: any) => Promise<void>
  isSubmitting: boolean
}

interface PackageItem {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
}

export function PackageFormDialog({
  open,
  onOpenChange,
  package: editingPackage,
  services,
  outlets,
  maxItems,
  onSubmit,
  isSubmitting
}: PackageFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    package_price: 0,
    validity_days: null as number | null,
    is_active: true,
    status: "active" as "active" | "inactive",
    outlet_ids: [] as string[],
  })

  const [packageItems, setPackageItems] = useState<PackageItem[]>([])
  const [serviceSearchQuery, setServiceSearchQuery] = useState("")
  const [showServiceSelector, setShowServiceSelector] = useState(false)

  // Reset form when dialog opens/closes or editing package changes
  useEffect(() => {
    if (open) {
      if (editingPackage) {
        setFormData({
          name: editingPackage.name,
          description: editingPackage.description || "",
          package_price: editingPackage.package_price,
          validity_days: editingPackage.validity_days || null,
          is_active: editingPackage.is_active,
          status: editingPackage.status === "archived" ? "inactive" : editingPackage.status,
          outlet_ids: editingPackage.outlet_ids || [],
        })
        const items = (editingPackage.package_items || []).map(item => ({
          service_id: item.service_id,
          service_name: item.service_name,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
        }))
        console.log('[PackageForm] Loaded package items:', items)
        console.log('[PackageForm] Package total_individual_price:', editingPackage.total_individual_price)
        setPackageItems(items)
      } else {
        // For new package, select all outlets by default
        const allOutletIds = outlets.map(o => o.id || o._id).filter(Boolean) as string[]
        setFormData({
          name: "",
          description: "",
          package_price: 0,
          validity_days: null,
          is_active: true,
          status: "active",
          outlet_ids: allOutletIds,
        })
        setPackageItems([])
      }
      setServiceSearchQuery("")
      setShowServiceSelector(false)
    }
  }, [open, editingPackage, outlets])

  // Calculate totals
  const totalIndividualPrice = useMemo(() => {
    return packageItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  }, [packageItems])

  const discountAmount = useMemo(() => {
    return Math.max(0, totalIndividualPrice - formData.package_price)
  }, [totalIndividualPrice, formData.package_price])

  const discountPercentage = useMemo(() => {
    if (totalIndividualPrice === 0) return 0
    return Math.round((discountAmount / totalIndividualPrice) * 100)
  }, [discountAmount, totalIndividualPrice])

  // Filter services for selector
  const filteredServices = useMemo(() => {
    // Ensure services is an array
    const servicesList = Array.isArray(services) ? services : []
    const activeServices = servicesList.filter(s => s.status === "active" || s.isActive)
    if (!serviceSearchQuery) return activeServices

    return activeServices.filter(s =>
      s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
      s.category?.toLowerCase().includes(serviceSearchQuery.toLowerCase())
    )
  }, [services, serviceSearchQuery])

  const handleAddService = (service: Treatment) => {
    if (packageItems.length >= maxItems) {
      return
    }

    const existingIndex = packageItems.findIndex(item => item.service_id === service.id)

    if (existingIndex >= 0) {
      // Increment quantity if service already exists
      const newItems = [...packageItems]
      newItems[existingIndex].quantity += 1
      setPackageItems(newItems)
    } else {
      // Add new service
      setPackageItems([...packageItems, {
        service_id: service.id,
        service_name: service.name,
        quantity: 1,
        unit_price: service.price,
      }])
    }

    setShowServiceSelector(false)
    setServiceSearchQuery("")
  }

  const handleRemoveService = (index: number) => {
    setPackageItems(packageItems.filter((_, i) => i !== index))
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...packageItems]
    newItems[index].quantity = Math.max(1, quantity)
    setPackageItems(newItems)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return
    }

    if (packageItems.length === 0) {
      return
    }

    if (formData.package_price <= 0) {
      return
    }

    // Validate validity_days: must be null (no expiry) or >= 7 days
    if (formData.validity_days !== null && formData.validity_days > 0 && formData.validity_days < 7) {
      return
    }

    const submitData = {
      ...formData,
      package_items: packageItems,
    }

    await onSubmit(submitData)
  }

  const canAddMoreServices = packageItems.length < maxItems

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE]">
              <Gift className="h-5 w-5 text-gray-800" />
            </div>
            {editingPackage ? "Edit Package" : "Create New Package"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Package Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Bridal Package, Monthly Glow Package"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this package includes and its benefits..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                maxLength={500}
              />
            </div>
          </div>

          {/* Services Selection */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Services in Package <span className="text-red-500">*</span>
              </Label>
              <Badge variant="outline">
                {packageItems.length}/{maxItems} services
              </Badge>
            </div>

            {/* Selected Services List */}
            {packageItems.length > 0 && (
              <div className="space-y-2">
                {packageItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.service_name}</div>
                      <div className="text-sm text-gray-500">
                        Rp {item.unit_price.toLocaleString("id-ID")} each
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>

                      <div className="w-24 text-right font-medium">
                        Rp {(item.unit_price * item.quantity).toLocaleString("id-ID")}
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveService(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Service Button/Selector */}
            {canAddMoreServices ? (
              showServiceSelector ? (
                <div className="border rounded-lg p-3 space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredServices.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No services found
                      </div>
                    ) : (
                      filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-50 text-left"
                          onClick={() => handleAddService(service)}
                        >
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-xs text-gray-500">{service.category}</div>
                          </div>
                          <div className="text-sm font-medium text-[#8B5CF6]">
                            Rp {service.price.toLocaleString("id-ID")}
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setShowServiceSelector(false)
                      setServiceSearchQuery("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => setShowServiceSelector(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              )
            ) : (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                Maximum {maxItems} services per package (subscription limit)
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-base font-semibold">
              <Calculator className="h-5 w-5 text-[#8B5CF6]" />
              Pricing
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Individual Total:</span>
                <span className="font-medium">Rp {totalIndividualPrice.toLocaleString("id-ID")}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="package_price">
                  Package Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <Input
                    id="package_price"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.package_price}
                    onChange={(e) => setFormData({ ...formData, package_price: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                  />
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Percent className="h-4 w-4" />
                    Customer Savings:
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-green-600">
                      Rp {discountAmount.toLocaleString("id-ID")}
                    </span>
                    <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
                      {discountPercentage}% off
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Validity & Status */}
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validity_days">Validity Period (days)</Label>
                <Input
                  id="validity_days"
                  type="number"
                  min="7"
                  placeholder="Leave empty for no expiry"
                  value={formData.validity_days || ""}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : null
                    setFormData({
                      ...formData,
                      validity_days: value
                    })
                  }}
                  className={formData.validity_days !== null && formData.validity_days < 7 ? "border-red-500 focus:ring-red-500" : ""}
                />
                {formData.validity_days !== null && formData.validity_days > 0 && formData.validity_days < 7 ? (
                  <p className="text-xs text-red-500">
                    Minimum validity period is 7 days
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Minimum 7 days, or leave empty for no expiry
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") => setFormData({
                    ...formData,
                    status: value,
                    is_active: value === "active"
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-500" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Outlets Selection */}
          {outlets.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#8B5CF6]" />
                  <Label className="text-base font-semibold">Available at Outlets</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const allIds = outlets.map(o => o.id || o._id).filter(Boolean) as string[]
                      setFormData({ ...formData, outlet_ids: allIds })
                    }}
                    className="text-xs h-7"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, outlet_ids: [] })}
                    className="text-xs h-7"
                  >
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {outlets.map((outlet) => {
                  const outletId = outlet.id || outlet._id || ''
                  const isSelected = formData.outlet_ids.includes(outletId)
                  return (
                    <div
                      key={outletId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-[#8B5CF6] bg-[#EDE9FE]/30'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        const newOutletIds = isSelected
                          ? formData.outlet_ids.filter(id => id !== outletId)
                          : [...formData.outlet_ids, outletId]
                        setFormData({ ...formData, outlet_ids: newOutletIds })
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const newOutletIds = checked
                            ? [...formData.outlet_ids, outletId]
                            : formData.outlet_ids.filter(id => id !== outletId)
                          setFormData({ ...formData, outlet_ids: newOutletIds })
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{outlet.name}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {formData.outlet_ids.length === 0 && (
                <p className="text-xs text-orange-600">
                  Please select at least one outlet
                </p>
              )}

              <p className="text-xs text-gray-500">
                {formData.outlet_ids.length} of {outlets.length} outlets selected
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <Button
              onClick={handleSubmit}
              size="lg"
              disabled={isSubmitting || !formData.name.trim() || packageItems.length === 0 || formData.package_price <= 0 || (formData.validity_days !== null && formData.validity_days > 0 && formData.validity_days < 7)}
              className="flex-1 h-11 bg-gradient-to-r from-[#FCD6F5] to-[#EDE9FE] text-gray-800 hover:from-[#EDE9FE] hover:to-[#8B5CF6] border-0 font-semibold disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : editingPackage ? "Update Package" : "Create Package"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-11 px-8"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

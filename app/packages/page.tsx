"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { DeleteEntityDialog } from "@/components/delete-entity-dialog"
import { Package, Clock, Edit, Trash2, ChevronLeft, ChevronRight, Search, AlertCircle, Gift, Percent, ShoppingBag, TrendingUp, Loader2, ShoppingCart, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import GradientLoading from "@/components/gradient-loading"
import { EmptyState } from "@/components/ui/empty-state"
import { AddButton } from "@/components/ui/add-button"
import { apiClient } from "@/lib/api-client"
import { PackageFormDialog } from "@/components/packages/package-form-dialog"
import type { Package as PackageType, PackageLimits, Treatment } from "@/lib/types"

export default function PackagesPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [packages, setPackages] = useState<PackageType[]>([])
  const [packageLimits, setPackageLimits] = useState<PackageLimits | null>(null)
  const [services, setServices] = useState<Treatment[]>([])
  const [outlets, setOutlets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingLimits, setLoadingLimits] = useState(true)

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<PackageType | null>(null)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isNavigatingToUpgrade, setIsNavigatingToUpgrade] = useState(false)
  const pageSize = 10

  // Quick Sell states
  const [showSellDialog, setShowSellDialog] = useState(false)
  const [selectedPackageToSell, setSelectedPackageToSell] = useState<PackageType | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [sellFormData, setSellFormData] = useState({
    outlet_id: "",
    payment_method: "manual_onspot" as "manual_onspot" | "paper_digital" | "bank_transfer",
    amount_paid: 0,
    notes: "",
  })
  const [isSelling, setIsSelling] = useState(false)

  // Fetch packages
  const fetchPackages = async () => {
    setLoading(true)
    try {
      const data = await apiClient.getPackages({ size: 100 })
      const packagesList = data.items || data || []
      setPackages(packagesList)
    } catch (error: any) {
      console.error('Error fetching packages:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch packages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch package limits
  const fetchPackageLimits = async () => {
    console.log('[Packages] Fetching package limits...')
    setLoadingLimits(true)
    try {
      const data = await apiClient.getPackageLimits()
      console.log('[Packages] Package limits response:', JSON.stringify(data))

      // Validate response - max_packages should be > 0 for valid subscription
      if (data && typeof data.limit_reached === 'boolean' && data.max_packages > 0) {
        setPackageLimits(data)
      } else if (data && data.max_packages === 0) {
        // Backend returned 0 max packages - this might be a backend bug
        // For now, allow adding packages and let backend validate on create
        console.warn('[Packages] Backend returned max_packages=0, allowing package creation')
        setPackageLimits(null)
      } else {
        console.warn('[Packages] Package limits API returned unexpected format:', data)
        setPackageLimits(null)
      }
    } catch (error: any) {
      console.error('[Packages] Error fetching package limits:', error)
      // On error, allow adding packages (don't block user due to API error)
      setPackageLimits(null)
    } finally {
      setLoadingLimits(false)
    }
  }

  // Fetch services for the form
  const fetchServices = async () => {
    try {
      const data = await apiClient.getTreatments(false)
      // Handle both array and { items: [...] } response formats
      const servicesList = Array.isArray(data) ? data : (data?.items || [])
      setServices(servicesList)
    } catch (error: any) {
      console.error('Error fetching services:', error)
      setServices([])
    }
  }

  // Fetch outlets for the form
  const fetchOutlets = async () => {
    try {
      const data = await apiClient.getOutlets()
      // Handle both array and { items: [...] } response formats
      const outletsList = Array.isArray(data) ? data : (data?.items || [])
      // Transform outlets to ensure id field exists
      const transformedOutlets = outletsList.map((outlet: any) => ({
        ...outlet,
        id: outlet.id || outlet._id,
      }))
      setOutlets(transformedOutlets)
    } catch (error: any) {
      console.error('Error fetching outlets:', error)
      setOutlets([])
    }
  }

  useEffect(() => {
    console.log('[Packages] Initializing - fetching data...')
    fetchPackages()
    fetchPackageLimits()
    fetchServices()
    fetchOutlets()
  }, [])

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesStatus = statusFilter === "all" || pkg.status === statusFilter
      const matchesSearch =
        searchQuery === "" ||
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesStatus && matchesSearch
    })
  }, [packages, statusFilter, searchQuery])

  const totalPages = Math.ceil(filteredPackages.length / pageSize)
  const paginatedPackages = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredPackages.slice(startIndex, startIndex + pageSize)
  }, [filteredPackages, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery])

  const handleCreatePackage = async (data: any) => {
    setIsSubmitting(true)
    try {
      await apiClient.createPackage(data)
      toast({ title: "Success", description: "Package created successfully" })
      setShowFormDialog(false)
      fetchPackages()
      fetchPackageLimits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.userFriendlyMessage || error.message || "Failed to create package",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePackage = async (data: any) => {
    if (!editingPackage) return

    setIsSubmitting(true)
    try {
      await apiClient.updatePackage(editingPackage.id, data)
      toast({ title: "Success", description: "Package updated successfully" })
      setEditingPackage(null)
      fetchPackages()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.userFriendlyMessage || error.message || "Failed to update package",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeletePackage = (pkg: PackageType) => {
    setPackageToDelete(pkg)
    setShowDeleteDialog(true)
  }

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return

    try {
      await apiClient.deletePackage(packageToDelete.id)
      toast({ title: "Success", description: "Package archived successfully" })
      setShowDeleteDialog(false)
      setPackageToDelete(null)
      fetchPackages()
      fetchPackageLimits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.userFriendlyMessage || error.message || "Failed to delete package",
        variant: "destructive"
      })
    }
  }

  const openAddDialog = () => {
    // Only block if we have valid limits data AND limit is actually reached
    if (packageLimits && packageLimits.limit_reached === true) {
      toast({
        title: "Limit Reached",
        description: `You have reached the maximum number of packages (${packageLimits.current_packages}/${packageLimits.max_packages}) for your subscription plan. Please upgrade to add more packages.`,
        variant: "destructive"
      })
      return
    }
    setEditingPackage(null)
    setShowFormDialog(true)
  }

  const openEditDialog = (pkg: PackageType) => {
    setEditingPackage(pkg)
    setShowFormDialog(true)
  }

  // Helper to check if email is placeholder/fake (for display purposes)
  const isPlaceholderEmail = (email?: string) => {
    if (!email) return true
    return email.endsWith('@example.co') || email.endsWith('@example.com')
  }

  // Helper to check if customer should be excluded from search results
  const shouldExcludeCustomer = (customer: any) => {
    const email = customer.email
    if (!email) return false // Keep customers without email
    return email.endsWith('@example.co') || email.endsWith('@example.com')
  }

  // Quick Sell functions
  const fetchCustomers = async (search?: string) => {
    setLoadingCustomers(true)
    try {
      const params = new URLSearchParams()
      params.append('size', '50') // Fetch more to filter locally

      const searchTerm = search?.trim() || ''
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`/api/customers?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      const data = await response.json()
      let customersList = data.items || data || []

      // Filter out customers with placeholder emails (@example.co, @example.com)
      // These might be pulled in if search term partially matches "example"
      customersList = customersList.filter((customer: any) => {
        return !shouldExcludeCustomer(customer)
      })

      setCustomers(customersList)
    } catch (error: any) {
      console.error('Error fetching customers:', error)
      setCustomers([])
    } finally {
      setLoadingCustomers(false)
    }
  }

  const openSellDialog = (pkg: PackageType) => {
    setSelectedPackageToSell(pkg)
    setSelectedCustomer(null)
    setCustomerSearchQuery("")
    setCustomers([]) // Reset customers list
    setSellFormData({
      outlet_id: outlets.length === 1 ? (outlets[0].id || outlets[0]._id) : "",
      payment_method: "manual_onspot",
      amount_paid: pkg.package_price,
      notes: "",
    })
    setShowSellDialog(true)
  }

  const handleSellPackage = async () => {
    if (!selectedPackageToSell || !selectedCustomer) return

    setIsSelling(true)
    try {
      const response = await fetch('/api/staff/customer-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          package_id: selectedPackageToSell.id,
          outlet_id: sellFormData.outlet_id,
          payment_method: sellFormData.payment_method,
          amount_paid: sellFormData.amount_paid,
          currency: 'IDR',
          notes: sellFormData.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sell package')
      }

      toast({
        title: "Package Sold!",
        description: `${selectedPackageToSell.name} has been sold to ${selectedCustomer.name}`,
      })

      setShowSellDialog(false)
      setSelectedPackageToSell(null)
      setSelectedCustomer(null)
      fetchPackages()
      fetchPackageLimits()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sell package",
        variant: "destructive"
      })
    } finally {
      setIsSelling(false)
    }
  }

  // Debounced customer search
  useEffect(() => {
    if (!showSellDialog) return

    const timer = setTimeout(() => {
      fetchCustomers(customerSearchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [customerSearchQuery])

  // Fetch customers when dialog opens
  useEffect(() => {
    if (showSellDialog) {
      fetchCustomers()
    }
  }, [showSellDialog])

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

  // Calculate stats
  const totalPackages = packages.length
  const activePackages = packages.filter(p => p.status === 'active').length
  const totalRevenue = packages.reduce((sum, p) => sum + (p.total_revenue || 0), 0)
  const avgDiscount = packages.length > 0
    ? Math.round(packages.reduce((sum, p) => sum + (p.discount_percentage || 0), 0) / packages.length)
    : 0

  if (loading) {
    return (
      <div className="flex min-h-[600px] w-full items-center justify-center">
        <GradientLoading />
      </div>
    )
  }

  const hasNoData = !loading && packages.length === 0

  return (
    <>
      {hasNoData ? (
        <EmptyState
          icon={Gift}
          title="No Packages Created"
          description="Create service packages to offer bundled treatments at discounted prices."
          actionLabel="Add Package"
          onAction={openAddDialog}
          tips={[
            {
              icon: Gift,
              title: "Bundle Services",
              description: "Combine multiple services"
            },
            {
              icon: Percent,
              title: "Offer Discounts",
              description: "Set package pricing"
            },
            {
              icon: ShoppingBag,
              title: "Increase Sales",
              description: "Boost customer value"
            }
          ]}
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Packages</h1>
              <p className="text-muted-foreground">Create and manage service bundles with special pricing</p>
            </div>
            <AddButton onClick={openAddDialog} disabled={packageLimits?.limit_reached}>
              Add Package
            </AddButton>
          </div>

          {/* Subscription Limit Banner */}
          {packageLimits && (
            <Card className={packageLimits.limit_reached ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {packageLimits.limit_reached ? (
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    ) : (
                      <Package className="h-5 w-5 text-blue-600" />
                    )}
                    <span className={packageLimits.limit_reached ? "text-orange-800" : "text-blue-800"}>
                      {packageLimits.limit_reached
                        ? `Package limit reached (${packageLimits.current_packages}/${packageLimits.max_packages})`
                        : `${packageLimits.current_packages} of ${packageLimits.max_packages} packages used (${packageLimits.remaining_packages} remaining)`
                      }
                    </span>
                  </div>
                  {packageLimits.limit_reached && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                      disabled={isNavigatingToUpgrade}
                      onClick={() => {
                        setIsNavigatingToUpgrade(true)
                        router.push('/subscription/upgrade')
                      }}
                    >
                      {isNavigatingToUpgrade ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Upgrade Plan'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {statusFilter !== "all" || searchQuery
                ? "No packages found matching your filters"
                : "No packages found"}
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-[#FCD6F5]/20 to-[#EDE9FE]/20">
                        <TableHead>Package</TableHead>
                        <TableHead>Services</TableHead>
                        <TableHead>Pricing</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPackages.map((pkg) => (
                        <TableRow
                          key={pkg.id}
                          className="hover:bg-[#FCD6F5]/10 transition-colors"
                        >
                          <TableCell className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center">
                                <Gift className="h-6 w-6 text-[#8B5CF6]" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{pkg.name}</div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                  {pkg.description || "No description"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="space-y-1">
                              {(pkg.package_items || []).slice(0, 2).map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="text-gray-600">{item.quantity}x</span>{" "}
                                  <span className="text-gray-900">{item.service_name}</span>
                                </div>
                              ))}
                              {(pkg.package_items || []).length > 2 && (
                                <div className="text-sm text-gray-500">
                                  +{(pkg.package_items || []).length - 2} more services
                                </div>
                              )}
                              {(!pkg.package_items || pkg.package_items.length === 0) && (
                                <div className="text-sm text-gray-400">No services</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm line-through text-gray-400">
                                  Rp {pkg.total_individual_price.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div className="font-semibold text-[#8B5CF6]">
                                Rp {pkg.package_price.toLocaleString("id-ID")}
                              </div>
                              {pkg.discount_percentage > 0 && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                  Save {pkg.discount_percentage.toFixed(0)}%
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {pkg.validity_days ? `${pkg.validity_days} days` : "No expiry"}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">{getStatusBadge(pkg.status)}</TableCell>
                          <TableCell className="p-4">
                            <div className="text-sm">
                              <div className="font-medium">{pkg.total_purchased || 0} sold</div>
                              {(pkg.total_revenue || 0) > 0 && (
                                <div className="text-gray-500">
                                  Rp {pkg.total_revenue.toLocaleString("id-ID")}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-4">
                            <div className="flex justify-end gap-2">
                              {pkg.status === 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openSellDialog(pkg)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Sell
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(pkg)}
                                className="hover:bg-[#EDE9FE]/20"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                                onClick={() => handleDeletePackage(pkg)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredPackages.length)} of {filteredPackages.length}{" "}
                    packages
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

          {/* Summary Stats - Hidden for now
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{totalPackages}</div>
                <p className="text-sm text-muted-foreground">Total Packages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{activePackages}</div>
                <p className="text-sm text-muted-foreground">Active Packages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{avgDiscount}%</div>
                <p className="text-sm text-muted-foreground">Avg. Discount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">Rp {totalRevenue.toLocaleString("id-ID")}</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
          </div>
          */}
        </div>
      )}

      {/* Package Form Dialog */}
      <PackageFormDialog
        open={showFormDialog || !!editingPackage}
        onOpenChange={(open) => {
          if (!open) {
            setShowFormDialog(false)
            setEditingPackage(null)
          }
        }}
        package={editingPackage}
        services={services}
        outlets={outlets}
        maxItems={packageLimits?.max_package_items || 10}
        onSubmit={editingPackage ? handleUpdatePackage : handleCreatePackage}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEntityDialog
        open={showDeleteDialog && !!packageToDelete}
        onOpenChange={setShowDeleteDialog}
        entityType="Package"
        entityName={packageToDelete?.name || ""}
        entityDetails={[
          { label: "Name", value: packageToDelete?.name || "-" },
          { label: "Price", value: packageToDelete?.package_price ? `Rp ${packageToDelete.package_price.toLocaleString("id-ID")}` : "-" },
          { label: "Services", value: `${packageToDelete?.package_items?.length || 0} services` },
          { label: "Status", value: packageToDelete?.status || "active" },
        ]}
        onConfirmDelete={confirmDeletePackage}
        softDeleteImpacts={[
          "Package will be marked as archived",
          "Package will not appear in purchase options",
          "Existing customer credits will remain valid",
          "Historical sales data will be preserved"
        ]}
      />

      {/* Quick Sell Dialog */}
      <Dialog open={showSellDialog} onOpenChange={setShowSellDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Sell Package
            </DialogTitle>
            <DialogDescription>
              Sell <span className="font-semibold text-foreground">{selectedPackageToSell?.name}</span> to a customer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Package Info */}
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#FCD6F5] to-[#EDE9FE] flex items-center justify-center">
                  <Gift className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="font-semibold">{selectedPackageToSell?.name}</p>
                  <p className="text-sm text-purple-700">
                    Rp {selectedPackageToSell?.package_price.toLocaleString('id-ID')} • {selectedPackageToSell?.package_items?.length || 0} services
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <Label>Select Customer *</Label>
              {selectedCustomer ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedCustomer.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {selectedCustomer.phone && <span>{selectedCustomer.phone}</span>}
                        {selectedCustomer.phone && !isPlaceholderEmail(selectedCustomer.email) && <span>•</span>}
                        {!isPlaceholderEmail(selectedCustomer.email) && <span>{selectedCustomer.email}</span>}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search customers by name, phone, or email..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {loadingCustomers ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        No customers found
                      </div>
                    ) : (
                      customers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left border-b last:border-b-0"
                          onClick={() => setSelectedCustomer(customer)}
                        >
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{customer.name}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              {customer.phone && <span>{customer.phone}</span>}
                              {customer.phone && !isPlaceholderEmail(customer.email) && <span>•</span>}
                              {!isPlaceholderEmail(customer.email) && <span className="truncate">{customer.email}</span>}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Outlet Selection */}
            {outlets.length > 1 && (
              <div className="space-y-2">
                <Label>Outlet *</Label>
                <Select
                  value={sellFormData.outlet_id}
                  onValueChange={(value) => setSellFormData({ ...sellFormData, outlet_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outlet" />
                  </SelectTrigger>
                  <SelectContent>
                    {outlets.map((outlet) => (
                      <SelectItem key={outlet.id || outlet._id} value={outlet.id || outlet._id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={sellFormData.payment_method}
                onValueChange={(value: "manual_onspot" | "paper_digital" | "bank_transfer") =>
                  setSellFormData({ ...sellFormData, payment_method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_onspot">Cash / On-spot Payment</SelectItem>
                  <SelectItem value="paper_digital">Paper / Digital Transfer</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>Amount Paid (IDR) *</Label>
              <Input
                type="number"
                min={0}
                value={sellFormData.amount_paid}
                onChange={(e) => setSellFormData({ ...sellFormData, amount_paid: parseFloat(e.target.value) || 0 })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={sellFormData.notes}
                onChange={(e) => setSellFormData({ ...sellFormData, notes: e.target.value })}
                placeholder="Add any notes..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSellDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSellPackage}
                disabled={isSelling || !selectedCustomer || !sellFormData.outlet_id || sellFormData.amount_paid <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSelling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sell Package
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

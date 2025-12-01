"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Gift, Loader2, Package, CreditCard, Building2, AlertCircle, CheckCircle } from "lucide-react"
import type { Package as PackageType } from "@/lib/types"

interface Outlet {
  id: string
  _id?: string
  name: string
  is_active?: boolean
}

interface SellPackageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  customerName: string
  onSuccess: () => void
}

export function SellPackageDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  onSuccess
}: SellPackageDialogProps) {
  const [packages, setPackages] = useState<PackageType[]>([])
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    package_id: "",
    outlet_id: "",
    payment_method: "manual_onspot" as "manual_onspot" | "paper_digital" | "bank_transfer",
    amount_paid: 0,
    notes: "",
  })

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        package_id: "",
        outlet_id: "",
        payment_method: "manual_onspot",
        amount_paid: 0,
        notes: "",
      })
      setError(null)
      setSuccess(false)
      fetchPackagesAndOutlets()
    }
  }, [open])

  // Update amount when package is selected
  useEffect(() => {
    if (formData.package_id) {
      const selectedPackage = packages.find(p => p.id === formData.package_id)
      if (selectedPackage) {
        setFormData(prev => ({ ...prev, amount_paid: selectedPackage.package_price }))
      }
    }
  }, [formData.package_id, packages])

  const fetchPackagesAndOutlets = async () => {
    setLoading(true)
    try {
      // Fetch packages and outlets in parallel
      const [packagesRes, outletsRes] = await Promise.all([
        fetch('/api/packages?status=active&is_active=true'),
        fetch('/api/outlets')
      ])

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        const packagesList = packagesData.items || packagesData || []
        setPackages(packagesList.filter((p: PackageType) => p.is_active && p.status === 'active'))
      }

      if (outletsRes.ok) {
        const outletsData = await outletsRes.json()
        const outletsList = outletsData.items || outletsData || []
        setOutlets(outletsList.filter((o: Outlet) => o.is_active !== false))

        // Auto-select first outlet if only one
        if (outletsList.length === 1) {
          setFormData(prev => ({ ...prev, outlet_id: outletsList[0].id || outletsList[0]._id }))
        }
      }
    } catch (err) {
      console.error('Error fetching packages/outlets:', err)
      setError('Failed to load packages and outlets')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!formData.package_id) {
      setError('Please select a package')
      return
    }
    if (!formData.outlet_id) {
      setError('Please select an outlet')
      return
    }
    if (formData.amount_paid <= 0) {
      setError('Amount paid must be greater than 0')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/staff/customer-packages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: customerId,
          package_id: formData.package_id,
          outlet_id: formData.outlet_id,
          payment_method: formData.payment_method,
          amount_paid: formData.amount_paid,
          currency: 'IDR',
          notes: formData.notes || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sell package')
      }

      // If payment method is not cash, store as pending in localStorage
      if (formData.payment_method !== 'manual_onspot') {
        const pendingPackage = {
          id: data.id || data._id,
          package_name: selectedPackage?.name || 'Package',
          package_price: selectedPackage?.package_price || formData.amount_paid,
          amount_paid: formData.amount_paid,
          payment_method: formData.payment_method,
          payment_status: 'pending',
          status: 'pending_payment',
          purchased_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          total_credits: selectedPackage?.package_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0,
        }

        // Get existing pending packages
        const existingPending = localStorage.getItem(`pending_packages_${customerId}`)
        let pendingList = []
        if (existingPending) {
          try {
            pendingList = JSON.parse(existingPending)
          } catch {}
        }
        pendingList.push(pendingPackage)
        localStorage.setItem(`pending_packages_${customerId}`, JSON.stringify(pendingList))
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
      }, 1500)
    } catch (err: any) {
      console.error('Error selling package:', err)
      setError(err.message || 'Failed to sell package')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedPackage = packages.find(p => p.id === formData.package_id)

  const paymentMethodLabels = {
    manual_onspot: 'Cash / On-spot Payment',
    paper_digital: 'Paper / Digital Transfer',
    bank_transfer: 'Bank Transfer',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#8B5CF6]" />
            Sell Package to Customer
          </DialogTitle>
          <DialogDescription>
            Selling package to <span className="font-semibold text-foreground">{customerName}</span>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-lg">Package Sold Successfully!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Credits have been added to the customer's account
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Package Selection */}
            <div className="space-y-2">
              <Label htmlFor="package">Package *</Label>
              <Select
                value={formData.package_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, package_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {packages.length === 0 ? (
                    <div className="py-4 px-2 text-center text-sm text-muted-foreground">
                      No active packages available
                    </div>
                  ) : (
                    packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>{pkg.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            Rp {pkg.package_price.toLocaleString('id-ID')}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Package Details Preview */}
            {selectedPackage && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 space-y-2">
                <h4 className="font-medium text-purple-900">{selectedPackage.name}</h4>
                {selectedPackage.description && (
                  <p className="text-sm text-purple-700">{selectedPackage.description}</p>
                )}
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="bg-white">
                    {selectedPackage.package_items?.length || 0} services
                  </Badge>
                  {selectedPackage.validity_days && (
                    <Badge variant="outline" className="bg-white">
                      Valid for {selectedPackage.validity_days} days
                    </Badge>
                  )}
                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                    {Math.round(selectedPackage.discount_percentage || 0)}% savings
                  </Badge>
                </div>
                <div className="pt-2 border-t border-purple-200">
                  <p className="text-xs text-purple-600">Services included:</p>
                  <ul className="mt-1 space-y-1">
                    {(selectedPackage.package_items || []).map((item, idx) => (
                      <li key={idx} className="text-xs text-purple-800 flex justify-between">
                        <span>{item.service_name} x{item.quantity}</span>
                        <span className="text-purple-600">
                          Rp {(item.unit_price * item.quantity).toLocaleString('id-ID')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Outlet Selection */}
            <div className="space-y-2">
              <Label htmlFor="outlet">Outlet *</Label>
              <Select
                value={formData.outlet_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, outlet_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outlet" />
                </SelectTrigger>
                <SelectContent>
                  {outlets.map((outlet) => (
                    <SelectItem key={outlet.id || outlet._id} value={outlet.id || outlet._id || ''}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <span>{outlet.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value: "manual_onspot" | "paper_digital" | "bank_transfer") =>
                  setFormData(prev => ({ ...prev, payment_method: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual_onspot">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Cash / On-spot Payment</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="paper_digital">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Paper / Digital Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount Paid */}
            <div className="space-y-2">
              <Label htmlFor="amount_paid">Amount Paid (IDR) *</Label>
              <Input
                id="amount_paid"
                type="number"
                min={0}
                value={formData.amount_paid}
                onChange={(e) => setFormData(prev => ({ ...prev, amount_paid: parseFloat(e.target.value) || 0 }))}
                placeholder="Enter amount paid"
              />
              {selectedPackage && formData.amount_paid !== selectedPackage.package_price && (
                <p className="text-xs text-amber-600">
                  Note: Package price is Rp {selectedPackage.package_price.toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this purchase..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !formData.package_id || !formData.outlet_id}
                className="bg-[#8B5CF6] hover:bg-[#7C3AED]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Sell Package
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

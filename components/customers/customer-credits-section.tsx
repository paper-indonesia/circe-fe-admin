"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Gift,
  Loader2,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
  CreditCard,
  Banknote,
  Send,
  ExternalLink,
  Mail,
  MessageSquare,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { format, parseISO, differenceInDays, isValid } from "date-fns"
import type { CustomerPackage, CustomerCredit, CustomerCreditSummary } from "@/lib/types"

interface PendingPackage {
  id: string
  package_name: string
  package_price?: number
  amount_paid: string | number
  payment_method: string
  payment_status: string
  status: string
  purchased_at: string
  total_credits: number
  currency?: string
  paper_payment_url?: string | null
}

interface CustomerCreditsSectionProps {
  customerId: string
  customerName: string
  onSellPackage: () => void
  refreshTrigger?: number
}

export function CustomerCreditsSection({
  customerId,
  customerName,
  onSellPackage,
  refreshTrigger
}: CustomerCreditsSectionProps) {
  const { toast } = useToast()
  const [summary, setSummary] = useState<CustomerCreditSummary | null>(null)
  const [credits, setCredits] = useState<CustomerCredit[]>([])
  const [pendingPackages, setPendingPackages] = useState<PendingPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPackages, setExpandedPackages] = useState<Set<string>>(new Set())
  const [isCreditsExpanded, setIsCreditsExpanded] = useState(false)

  // Confirm payment dialog state (for bank_transfer)
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState(false)
  const [selectedPendingPackage, setSelectedPendingPackage] = useState<PendingPackage | null>(null)
  const [confirmingPayment, setConfirmingPayment] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [receiptNumber, setReceiptNumber] = useState<string>('')

  // Send invoice dialog state (for paper_digital)
  const [sendInvoiceDialog, setSendInvoiceDialog] = useState(false)
  const [selectedInvoicePackage, setSelectedInvoicePackage] = useState<PendingPackage | null>(null)
  const [sendingInvoice, setSendingInvoice] = useState(false)
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>('')
  const [invoiceNotes, setInvoiceNotes] = useState<string>('')
  const [sendEmail, setSendEmail] = useState(true)
  const [sendWhatsapp, setSendWhatsapp] = useState(false)

  useEffect(() => {
    if (customerId) {
      fetchCredits()
    }
  }, [customerId, refreshTrigger])

  const fetchCredits = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch summary, credits, and pending packages in parallel
      const [summaryRes, creditsRes, pendingRes] = await Promise.all([
        fetch(`/api/staff/customer-packages/${customerId}/summary`),
        fetch(`/api/staff/customer-packages/${customerId}/credits?include_expired=false`),
        fetch(`/api/staff/customer-packages?customer_id=${customerId}&status_filter=pending_payment`)
      ])

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json()
        setSummary(summaryData)
      }

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json()
        // Handle both array response and items property
        const creditsList = Array.isArray(creditsData) ? creditsData : (creditsData.items || [])
        setCredits(creditsList)
      }

      // Fetch pending packages from API
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json()
        const pendingList = Array.isArray(pendingData) ? pendingData : (pendingData.items || [])
        // Filter only packages with payment_status = 'pending' (not 'paid')
        const trulyPendingPackages = pendingList.filter(
          (pkg: PendingPackage) => pkg.payment_status === 'pending' && pkg.status === 'pending_payment'
        )
        console.log('[CustomerCredits] Pending packages from API:', trulyPendingPackages)
        setPendingPackages(trulyPendingPackages)
      } else {
        console.log('[CustomerCredits] Failed to fetch pending packages')
        setPendingPackages([])
      }
    } catch (err) {
      console.error('Error fetching customer credits:', err)
      setError('Failed to load credit information')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedPendingPackage) return

    setConfirmingPayment(true)
    try {
      const amountToConfirm = paymentAmount || getAmountPaid(selectedPendingPackage)
      const originalPaymentMethod = selectedPendingPackage.payment_method || 'bank_transfer'
      // Map pay_on_visit to cash for API compatibility
      const apiPaymentMethod = originalPaymentMethod === 'pay_on_visit' ? 'cash' : originalPaymentMethod
      const notesText = originalPaymentMethod === 'pay_on_visit'
        ? 'Pay on visit payment confirmed by staff'
        : 'Bank transfer payment confirmed by staff'

      const response = await fetch(
        `/api/customer/package-payments/${selectedPendingPackage.id}/record-payment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountToConfirm,
            payment_method: apiPaymentMethod,
            receipt_number: receiptNumber || undefined,
            notes: notesText,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm payment')
      }

      toast({
        title: "Payment Confirmed!",
        description: `Package credits have been activated for ${customerName}`,
      })

      setConfirmPaymentDialog(false)
      setSelectedPendingPackage(null)
      setPaymentAmount(0)
      setReceiptNumber('')

      // Refresh data
      await fetchCredits()
    } catch (err: any) {
      console.error('Error confirming payment:', err)
      toast({
        title: "Failed to confirm payment",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setConfirmingPayment(false)
    }
  }

  const getAmountPaid = (pkg: PendingPackage): number => {
    if (typeof pkg.amount_paid === 'string') {
      return parseFloat(pkg.amount_paid) || 0
    }
    return pkg.amount_paid || 0
  }

  const openConfirmPaymentDialog = (pkg: PendingPackage) => {
    setSelectedPendingPackage(pkg)
    // Use amount_paid from API as the payment amount (package_price may not exist)
    const amountPaid = getAmountPaid(pkg)
    setPaymentAmount(amountPaid)
    setConfirmPaymentDialog(true)
  }

  const openSendInvoiceDialog = (pkg: PendingPackage) => {
    setSelectedInvoicePackage(pkg)
    // Set default due date to 7 days from now
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)
    setInvoiceDueDate(format(dueDate, 'yyyy-MM-dd'))
    setInvoiceNotes('Online payment for package purchase')
    setSendEmail(true)
    setSendWhatsapp(false)
    setSendInvoiceDialog(true)
  }

  const handleSendInvoice = async () => {
    if (!selectedInvoicePackage) return

    setSendingInvoice(true)
    try {
      const response = await fetch(
        `/api/customer-packages/${selectedInvoicePackage.id}/create-payment-link`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            due_date: invoiceDueDate,
            notes: invoiceNotes,
            send_email: sendEmail,
            send_sms: false,
            send_whatsapp: sendWhatsapp,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link')
      }

      toast({
        title: "Invoice Sent!",
        description: `Payment link has been sent to ${customerName}`,
      })

      setSendInvoiceDialog(false)
      setSelectedInvoicePackage(null)

      // Refresh data to show updated invoice URL
      await fetchCredits()
    } catch (err: any) {
      console.error('Error sending invoice:', err)
      toast({
        title: "Failed to send invoice",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSendingInvoice(false)
    }
  }

  const togglePackageExpanded = (packageId: string) => {
    setExpandedPackages(prev => {
      const newSet = new Set(prev)
      if (newSet.has(packageId)) {
        newSet.delete(packageId)
      } else {
        newSet.add(packageId)
      }
      return newSet
    })
  }

  // Aggregate credits by service_name (combine same services across all packages)
  const aggregatedCredits = credits.reduce((acc, credit) => {
    const serviceName = credit.service_name
    if (!acc[serviceName]) {
      acc[serviceName] = {
        service_name: serviceName,
        total_credits: 0,
        remaining_credits: 0,
        used_credits: 0,
        earliest_expiry: null as string | null,
        has_no_expiry: false,
        is_any_expired: false,
        sources: [] as CustomerCredit[],
      }
    }

    acc[serviceName].total_credits += credit.total_credits ?? credit.allocated_credits ?? 0
    acc[serviceName].remaining_credits += credit.remaining_credits
    acc[serviceName].used_credits += credit.used_credits
    acc[serviceName].sources.push(credit)

    // Track expiry - if any credit has no expiry, mark it
    if (!credit.expires_at) {
      acc[serviceName].has_no_expiry = true
    } else if (!acc[serviceName].has_no_expiry) {
      // Only track earliest expiry if we don't have a no-expiry credit
      if (!acc[serviceName].earliest_expiry || credit.expires_at < acc[serviceName].earliest_expiry) {
        acc[serviceName].earliest_expiry = credit.expires_at
      }
    }

    // Track if any credit is expired
    if (credit.is_expired) {
      acc[serviceName].is_any_expired = true
    }

    return acc
  }, {} as Record<string, {
    service_name: string
    total_credits: number
    remaining_credits: number
    used_credits: number
    earliest_expiry: string | null
    has_no_expiry: boolean
    is_any_expired: boolean
    sources: CustomerCredit[]
  }>)

  // Convert to array for rendering
  const aggregatedCreditsList = Object.values(aggregatedCredits)

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'No expiry'
    try {
      const date = parseISO(dateStr)
      if (!isValid(date)) return 'N/A'
      return format(date, 'dd MMM yyyy')
    } catch {
      return 'N/A'
    }
  }

  const getDaysUntilExpiry = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return null
    try {
      const expiryDate = parseISO(expiresAt)
      if (!isValid(expiryDate)) return null
      return differenceInDays(expiryDate, new Date())
    } catch {
      return null
    }
  }

  const getExpiryBadge = (expiresAt: string | null | undefined, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>
    }

    // No expiry date means no expiration
    if (!expiresAt) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">No expiry</Badge>
    }

    const daysLeft = getDaysUntilExpiry(expiresAt)
    if (daysLeft === null) return null

    if (daysLeft <= 7) {
      return <Badge variant="destructive" className="text-xs">Expires in {daysLeft} days</Badge>
    } else if (daysLeft <= 30) {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">Expires in {daysLeft} days</Badge>
    }

    return <Badge variant="secondary" className="text-xs">Valid until {formatDate(expiresAt)}</Badge>
  }

  // Helper to get total credits (backend uses total_credits, type uses allocated_credits)
  const getTotalCredits = (credit: any) => {
    return credit.total_credits ?? credit.allocated_credits ?? 0
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-lg p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-[#8B5CF6]" />
          <span className="ml-2 text-sm text-muted-foreground">Loading credits...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-[#6D28D9] flex items-center gap-2">
          <Gift className="h-4 w-4" />
          Package Credits
        </h4>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchCredits}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            onClick={onSellPackage}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
          >
            <Gift className="h-4 w-4 mr-1" />
            Sell Package
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Active Packages</p>
            <p className="text-lg font-bold text-[#6D28D9]">{summary.active_packages}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Total Credits</p>
            <p className="text-lg font-bold text-[#6D28D9]">{summary.total_credits}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Remaining</p>
            <p className="text-lg font-bold text-green-600">{summary.remaining_credits}</p>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">Used</p>
            <p className="text-lg font-bold text-gray-600">{summary.used_credits}</p>
          </div>
        </div>
      )}

      {/* Pending Packages Section */}
      {pendingPackages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending Payment ({pendingPackages.length})
          </p>
          {pendingPackages.map((pkg) => {
            // bank_transfer and pay_on_visit can be manually confirmed by staff
            // paper_digital is confirmed via webhook from Paper.id
            const canManualConfirm = pkg.payment_method === 'bank_transfer' || pkg.payment_method === 'pay_on_visit'
            const isPaperDigital = pkg.payment_method === 'paper_digital'

            return (
              <div
                key={pkg.id}
                className="bg-amber-50 border border-amber-200 rounded-lg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-amber-900">{pkg.package_name}</p>
                      <p className="text-xs text-amber-700">
                        Rp {getAmountPaid(pkg).toLocaleString('id-ID')} • {pkg.payment_method?.replace('_', ' ')} • {pkg.total_credits} credit(s)
                      </p>
                      {isPaperDigital && (
                        <p className="text-xs text-amber-600 mt-1">
                          {pkg.paper_payment_url
                            ? 'Invoice sent - waiting for customer payment'
                            : 'Send invoice to customer via Paper.id'}
                        </p>
                      )}
                    </div>
                  </div>
                  {canManualConfirm ? (
                    <Button
                      size="sm"
                      onClick={() => openConfirmPaymentDialog(pkg)}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <Banknote className="h-4 w-4 mr-1" />
                      Confirm Payment
                    </Button>
                  ) : isPaperDigital ? (
                    <div className="flex items-center gap-2">
                      {pkg.paper_payment_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(pkg.paper_payment_url!, '_blank')}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Invoice
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openSendInvoiceDialog(pkg)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send Invoice
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                      <Clock className="h-3 w-3 mr-1" />
                      Awaiting Payment
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Credits List - Aggregated by Service Name with Collapsible */}
      {credits.length === 0 && pendingPackages.length === 0 ? (
        <div className="text-center py-6 bg-white/40 rounded-lg">
          <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-muted-foreground">No active package credits</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click "Sell Package" to add credits for this customer
          </p>
        </div>
      ) : aggregatedCreditsList.length > 0 ? (
        <Collapsible open={isCreditsExpanded} onOpenChange={setIsCreditsExpanded}>
          <CollapsibleTrigger asChild>
            <div className="bg-white rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Package className="h-4 w-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">Active Credits</span>
                    <p className="text-xs text-muted-foreground">
                      {aggregatedCreditsList.length} service(s) • {summary?.remaining_credits || 0} credits remaining
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono">
                    {summary?.remaining_credits || 0} / {summary?.total_credits || 0}
                  </Badge>
                  {isCreditsExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              {aggregatedCreditsList.map((aggregated) => {
                const hasExpiringSoon = !aggregated.has_no_expiry && aggregated.earliest_expiry && (() => {
                  const days = getDaysUntilExpiry(aggregated.earliest_expiry)
                  return days !== null && days <= 30 && !aggregated.is_any_expired
                })()

                return (
                  <div
                    key={aggregated.service_name}
                    className="bg-white rounded-lg p-3 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{aggregated.service_name}</span>
                          {aggregated.has_no_expiry ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">No expiry</Badge>
                          ) : hasExpiringSoon ? (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          ) : aggregated.is_any_expired ? (
                            <Badge variant="destructive" className="text-xs">Some Expired</Badge>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {aggregated.is_any_expired ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : aggregated.remaining_credits === 0 ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-500" />
                          )}
                          <span className={`font-bold ${
                            aggregated.is_any_expired && aggregated.remaining_credits === 0 ? 'text-red-500' :
                            aggregated.remaining_credits === 0 ? 'text-gray-400' :
                            'text-[#6D28D9]'
                          }`}>
                            {aggregated.remaining_credits}/{aggregated.total_credits}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {aggregated.used_credits} used
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          aggregated.is_any_expired && aggregated.remaining_credits === 0 ? 'bg-red-400' :
                          aggregated.remaining_credits === 0 ? 'bg-gray-300' :
                          'bg-[#8B5CF6]'
                        }`}
                        style={{
                          width: `${aggregated.total_credits > 0 ? (aggregated.remaining_credits / aggregated.total_credits) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : null}

      {/* Confirm Payment Dialog */}
      <Dialog open={confirmPaymentDialog} onOpenChange={setConfirmPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-amber-600" />
              Confirm Package Payment
            </DialogTitle>
            <DialogDescription>
              Confirm payment received for this package to activate credits
            </DialogDescription>
          </DialogHeader>

          {selectedPendingPackage && (
            <div className="space-y-4 py-2">
              {/* Package Info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="font-medium">{selectedPendingPackage.package_name}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: Rp {getAmountPaid(selectedPendingPackage).toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment Method: {selectedPendingPackage.payment_method === 'pay_on_visit' ? 'Pay on Visit' : 'Bank Transfer'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Credits: {selectedPendingPackage.total_credits}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  {selectedPendingPackage.payment_method === 'pay_on_visit'
                    ? 'Confirm that the customer has paid on their visit. Credits will be activated immediately after confirmation.'
                    : 'Confirm that you have received the bank transfer payment from the customer. Credits will be activated immediately after confirmation.'}
                </p>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount Received (IDR)</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount"
                />
              </div>

              {/* Receipt Number Input */}
              <div className="space-y-2">
                <Label htmlFor="receipt-number">Receipt Number (Optional)</Label>
                <Input
                  id="receipt-number"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="e.g., RCP-2025-001"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmPaymentDialog(false)
                    setSelectedPendingPackage(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmPayment}
                  disabled={confirmingPayment || paymentAmount <= 0}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {confirmingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Invoice Dialog (Paper.id) */}
      <Dialog open={sendInvoiceDialog} onOpenChange={setSendInvoiceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-600" />
              Send Payment Invoice
            </DialogTitle>
            <DialogDescription>
              Send payment invoice to customer via Paper.id
            </DialogDescription>
          </DialogHeader>

          {selectedInvoicePackage && (
            <div className="space-y-4 py-2">
              {/* Package Info */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="font-medium">{selectedInvoicePackage.package_name}</p>
                <p className="text-sm text-muted-foreground">
                  Amount: Rp {getAmountPaid(selectedInvoicePackage).toLocaleString('id-ID')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Credits: {selectedInvoicePackage.total_credits}
                </p>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={invoiceDueDate}
                  onChange={(e) => setInvoiceDueDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="invoice-notes">Notes (Optional)</Label>
                <Input
                  id="invoice-notes"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Notes for the invoice"
                />
              </div>

              {/* Delivery Methods */}
              <div className="space-y-3">
                <Label>Send Invoice Via</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-email"
                      checked={sendEmail}
                      onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                    />
                    <label
                      htmlFor="send-email"
                      className="text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="send-whatsapp"
                      checked={sendWhatsapp}
                      onCheckedChange={(checked) => setSendWhatsapp(checked as boolean)}
                    />
                    <label
                      htmlFor="send-whatsapp"
                      className="text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  An invoice will be created and sent to the customer.
                  Payment will be confirmed automatically when customer completes payment.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSendInvoiceDialog(false)
                    setSelectedInvoicePackage(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendInvoice}
                  disabled={sendingInvoice || !invoiceDueDate || (!sendEmail && !sendWhatsapp)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sendingInvoice ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

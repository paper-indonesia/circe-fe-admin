"use client"

import { useEffect, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Banknote,
  CreditCard,
  User,
  Calendar,
  Receipt,
  ExternalLink,
  XCircle
} from "lucide-react"
import { getPaymentStatus, type PaymentStatusResponse, formatCurrency } from "@/lib/api/walk-in"
import { format } from "date-fns"

interface PaymentStatusDisplayProps {
  appointmentId: string
  compact?: boolean
  showHistory?: boolean
  onStatusLoaded?: (status: PaymentStatusResponse) => void
}

export default function PaymentStatusDisplay({
  appointmentId,
  compact = false,
  showHistory = true,
  onStatusLoaded
}: PaymentStatusDisplayProps) {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const isMountedRef = useRef(true)

  // Fix hydration - only render after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Reset mounted flag
    isMountedRef.current = true

    // Reset states when appointmentId changes
    setPaymentStatus(null)
    setLoading(true)
    setError(null)

    async function fetchPaymentStatus() {
      try {
        if (!isMountedRef.current) return
        if (!appointmentId) return

        console.log('[PaymentStatusDisplay] Fetching payment status for:', appointmentId)

        const data = await getPaymentStatus(appointmentId)

        // Only update state if component is still mounted
        if (!isMountedRef.current) return

        console.log('[PaymentStatusDisplay] Payment status loaded:', data.payment_status)
        setPaymentStatus(data)
        onStatusLoaded?.(data)
      } catch (err: any) {
        console.error('[PaymentStatusDisplay] Failed to fetch payment status:', err)

        // Only update state if component is still mounted
        if (!isMountedRef.current) return

        setError(err.message || 'Failed to load payment status')
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    if (appointmentId) {
      // Small delay to debounce rapid changes
      const timeoutId = setTimeout(() => {
        fetchPaymentStatus()
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        isMountedRef.current = false
      }
    } else {
      setLoading(false)
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]) // Only depend on appointmentId to prevent infinite loops

  // Payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case 'partially_paid':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Partially Paid
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'refunded':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        )
    }
  }

  // Payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />
      case 'qris':
      case 'ewallet':
        return <CreditCard className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  // Loading state - only show after mounted to avoid hydration mismatch
  if (!isMounted || loading) {
    return (
      <Card className={compact ? "border-0 shadow-none" : ""}>
        <CardHeader className={compact ? "p-0 pb-2" : ""}>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className={compact ? "p-0" : ""}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // No data
  if (!paymentStatus) {
    return null
  }

  // Compact view (for dialogs/modals)
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Payment Status Summary */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Payment Status</span>
          {getPaymentStatusBadge(paymentStatus.payment_status)}
        </div>

        {/* Amount Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-600 text-xs mb-1">Total Amount</div>
              <div className="font-bold text-gray-900">{formatCurrency(paymentStatus.total_amount)}</div>
            </div>
            <div>
              <div className="text-gray-600 text-xs mb-1">Paid Amount</div>
              <div className="font-bold text-green-700">{formatCurrency(paymentStatus.paid_amount)}</div>
            </div>
            {paymentStatus.remaining_balance > 0 && (
              <div className="col-span-2">
                <div className="text-gray-600 text-xs mb-1">Remaining Balance</div>
                <div className="font-bold text-red-700">{formatCurrency(paymentStatus.remaining_balance)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Status */}
        {!paymentStatus.can_complete && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Payment must be completed before marking appointment as done.
              {paymentStatus.remaining_balance > 0 && (
                <span className="block mt-1 font-medium">
                  Outstanding: {formatCurrency(paymentStatus.remaining_balance)}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {paymentStatus.can_complete && paymentStatus.payment_status === 'paid' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-xs text-green-800">
              Payment completed. Ready to mark as done.
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Invoice Link */}
        {paymentStatus.pending_invoice && (
          <Alert className="bg-blue-50 border-blue-200">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs">
              <div className="font-medium text-blue-900 mb-1">Pending Payment Link</div>
              <div className="text-blue-700">
                Amount: {formatCurrency(paymentStatus.pending_invoice.amount)}
              </div>
              {paymentStatus.pending_invoice.expires_at && (
                <div className="text-blue-600 text-xs mt-1">
                  Expires: {format(new Date(paymentStatus.pending_invoice.expires_at), 'PPp')}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // Full view (for detail pages)
  return (
    <div className="space-y-4">
      {/* Payment Status Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Status</span>
            {getPaymentStatusBadge(paymentStatus.payment_status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Amount</div>
              <div className="text-xl font-bold text-blue-900">{formatCurrency(paymentStatus.total_amount)}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Paid Amount</div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(paymentStatus.paid_amount)}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Remaining</div>
              <div className="text-xl font-bold text-red-700">{formatCurrency(paymentStatus.remaining_balance)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {showHistory && paymentStatus.payment_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentStatus.payment_history.map((payment, index) => (
                <div
                  key={payment.id || index}
                  className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getPaymentMethodIcon(payment.method)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                      <Badge
                        variant={payment.status === 'completed' ? 'default' : 'secondary'}
                        className={
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{payment.method.replace('_', ' ')}</div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {payment.recorded_by}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(payment.recorded_at), 'PPp')}
                      </div>
                      {payment.receipt_number && (
                        <div className="flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          {payment.receipt_number}
                        </div>
                      )}
                    </div>
                    {payment.notes && (
                      <div className="mt-2 text-sm text-gray-600 italic">{payment.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Payment Link */}
      {paymentStatus.pending_invoice && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              Pending Payment Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="font-semibold">{formatCurrency(paymentStatus.pending_invoice.amount)}</span>
              </div>
              {paymentStatus.pending_invoice.expires_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expires At</span>
                  <span className="text-sm">
                    {format(new Date(paymentStatus.pending_invoice.expires_at), 'PPp')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="outline">{paymentStatus.pending_invoice.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Eligibility Alert */}
      {!paymentStatus.can_complete && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This appointment cannot be completed yet. Payment must be fully settled before marking as complete.
            {paymentStatus.remaining_balance > 0 && (
              <span className="block mt-2 font-medium">
                Outstanding Balance: {formatCurrency(paymentStatus.remaining_balance)}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

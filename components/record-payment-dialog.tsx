"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Banknote, AlertCircle, CreditCard,  Building2 } from "lucide-react"
import { recordManualPayment, formatCurrency, type RecordPaymentRequest } from "@/lib/api/walk-in"

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  totalAmount: number
  paidAmount: number
  remainingBalance: number
  onSuccess?: () => void
}

export default function RecordPaymentDialog({
  open,
  onOpenChange,
  appointmentId,
  totalAmount,
  paidAmount,
  remainingBalance,
  onSuccess
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'pos_terminal' | 'bank_transfer'>('cash')
  const [notes, setNotes] = useState("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration - only render after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setAmount(remainingBalance > 0 ? remainingBalance.toString() : "")
      setPaymentMethod('cash')
      setNotes("")
      setReceiptNumber("")
      setError(null)
      setSuccess(false)
      setIsVerifying(false)
    }
  }, [open, remainingBalance])

  // Payment method options with icons
  const paymentMethods = [
    {
      value: 'cash' as const,
      label: 'Cash',
      icon: Banknote,
      description: 'Cash payment at location'
    },
    {
      value: 'pos_terminal' as const,
      label: 'POS Terminal',
      icon: CreditCard,
      description: 'Credit/debit card via POS'
    },
    {
      value: 'bank_transfer' as const,
      label: 'Bank Transfer',
      icon: Building2,
      description: 'Direct bank transfer'
    }
  ]

  const selectedMethod = paymentMethods.find(m => m.value === paymentMethod)

  // Validation
  const validateAmount = (value: string): string | null => {
    const numValue = parseFloat(value)

    if (!value || isNaN(numValue)) {
      return "Amount is required"
    }

    if (numValue <= 0) {
      return "Amount must be greater than 0"
    }

    if (numValue > remainingBalance) {
      return `Amount cannot exceed remaining balance (${formatCurrency(remainingBalance)})`
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const amountError = validateAmount(amount)
    if (amountError) {
      setError(amountError)
      return
    }

    if (notes && notes.length > 500) {
      setError("Notes must be 500 characters or less")
      return
    }

    if (receiptNumber && receiptNumber.length > 100) {
      setError("Receipt number must be 100 characters or less")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const paymentData: RecordPaymentRequest = {
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        notes: notes || undefined,
        receipt_number: receiptNumber || undefined,
      }

      const response = await recordManualPayment(appointmentId, paymentData)

      if (response.status === 'success') {
        setSuccess(true)
        setIsSubmitting(false)

        // Show verifying state and call onSuccess for payment verification
        setIsVerifying(true)

        if (onSuccess) {
          await onSuccess()
        }

        // Close dialog after verification complete
        onOpenChange(false)
      } else {
        setError(response.message || 'Failed to record payment')
        setIsSubmitting(false)
      }
    } catch (err: any) {
      console.error('Failed to record payment:', err)
      setError(err.message || 'Failed to record payment')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Banknote className="h-5 w-5" />
            Record Payment
          </DialogTitle>
        </DialogHeader>

        {/* Success/Verifying State */}
        {success ? (
          <div className="py-8 text-center">
            {isVerifying ? (
              <>
                <div className="h-16 w-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment...</h3>
                <p className="text-gray-600">Please wait while we verify your payment status.</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Recorded!</h3>
                <p className="text-gray-600">Payment has been recorded successfully.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 text-xs mb-1">Total Amount</div>
                  <div className="font-bold text-gray-900">{formatCurrency(totalAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs mb-1">Paid Amount</div>
                  <div className="font-bold text-green-700">{formatCurrency(paidAmount)}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs mb-1">Remaining Balance</div>
                  <div className="font-bold text-red-700">{formatCurrency(remainingBalance)}</div>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-1">
                Payment Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={remainingBalance}
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter payment amount"
                  className="pl-10"
                  disabled={isSubmitting}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Maximum: {formatCurrency(remainingBalance)}
              </p>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-sm font-medium flex items-center gap-1">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value: any) => setPaymentMethod(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{method.label}</div>
                            <div className="text-xs text-gray-500">{method.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Receipt Number */}
            <div className="space-y-2">
              <Label htmlFor="receipt-number" className="text-sm font-medium">
                Receipt Number (Optional)
              </Label>
              <Input
                id="receipt-number"
                type="text"
                maxLength={100}
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="e.g., RCPT-2025-001"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                {receiptNumber.length}/100 characters
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Payment Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this payment..."
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 text-right">
                {notes.length}/500 characters
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-xs">
                <span className="font-medium">Note:</span> Payment will be marked as COMPLETED immediately and will update the appointment payment status.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

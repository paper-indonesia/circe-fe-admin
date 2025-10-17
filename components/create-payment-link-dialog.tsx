"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Link2,
  AlertCircle,
  Mail,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Copy,
  Calendar
} from "lucide-react"
import {
  createPaperPaymentLink,
  formatCurrency,
  type CreatePaymentLinkRequest,
  type CreatePaymentLinkResponse
} from "@/lib/api/walk-in"
import { format } from "date-fns"

interface CreatePaymentLinkDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointmentId: string
  remainingBalance: number
  customerEmail?: string
  customerPhone?: string
  onSuccess?: (response: CreatePaymentLinkResponse) => void
}

export default function CreatePaymentLinkDialog({
  open,
  onOpenChange,
  appointmentId,
  remainingBalance,
  customerEmail,
  customerPhone,
  onSuccess
}: CreatePaymentLinkDialogProps) {
  const [sendEmail, setSendEmail] = useState(false)
  const [sendWhatsapp, setSendWhatsapp] = useState(false)
  const [sendSms, setSendSms] = useState(false)
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [paymentLinkResponse, setPaymentLinkResponse] = useState<CreatePaymentLinkResponse | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  // Fix hydration - only render after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      // Default to WhatsApp if phone available, email if email available
      setSendEmail(!!customerEmail)
      setSendWhatsapp(!!customerPhone)
      setSendSms(false)
      setNotes("")
      setDueDate("")
      setError(null)
      setSuccess(false)
      setPaymentLinkResponse(null)
      setCopiedUrl(false)
    }
  }, [open, customerEmail, customerPhone])

  // Notification channel options
  const notificationChannels = [
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      description: 'Send link via email',
      enabled: !!customerEmail,
      disabledReason: 'Customer email not available',
      checked: sendEmail,
      onChange: setSendEmail
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: MessageSquare,
      description: 'Send link via WhatsApp',
      enabled: !!customerPhone,
      disabledReason: 'Customer phone not available',
      checked: sendWhatsapp,
      onChange: setSendWhatsapp
    },
    {
      id: 'sms',
      label: 'SMS',
      icon: Smartphone,
      description: 'Send link via SMS',
      enabled: !!customerPhone,
      disabledReason: 'Customer phone not available',
      checked: sendSms,
      onChange: setSendSms
    }
  ]

  // Validation
  const validateForm = (): string | null => {
    // At least one notification channel must be selected
    if (!sendEmail && !sendWhatsapp && !sendSms) {
      return "Please select at least one notification channel"
    }

    // Validate notes length
    if (notes && notes.length > 500) {
      return "Notes must be 500 characters or less"
    }

    // Validate due date if provided
    if (dueDate) {
      const selectedDate = new Date(dueDate)
      const now = new Date()
      if (selectedDate <= now) {
        return "Due date must be in the future"
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const requestData: CreatePaymentLinkRequest = {
        send_email: sendEmail,
        send_whatsapp: sendWhatsapp,
        send_sms: sendSms,
        notes: notes || undefined,
        due_date: dueDate || undefined,
      }

      const response = await createPaperPaymentLink(appointmentId, requestData)

      setSuccess(true)
      setPaymentLinkResponse(response)
      onSuccess?.(response)

      // Don't auto-close - let user see the payment link and copy it
    } catch (err: any) {
      console.error('Failed to create payment link:', err)
      setError(err.message || 'Failed to create payment link')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopyUrl = async () => {
    if (paymentLinkResponse?.payment_link?.short_url) {
      try {
        await navigator.clipboard.writeText(paymentLinkResponse.payment_link.short_url)
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
      } catch (err) {
        console.error('Failed to copy URL:', err)
      }
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-600">
            <Link2 className="h-5 w-5" />
            Create Payment Link
          </DialogTitle>
        </DialogHeader>

        {/* Success State */}
        {success && paymentLinkResponse ? (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Link Created!</h3>
              <p className="text-gray-600">The payment link has been sent to the customer.</p>
            </div>

            {/* Payment Link Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Invoice Number</span>
                <span className="font-mono text-sm font-bold text-gray-900">
                  {paymentLinkResponse.invoice.invoice_number}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Amount</span>
                <span className="font-bold text-lg text-blue-900">
                  {formatCurrency(paymentLinkResponse.invoice.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Expires At</span>
                <span className="text-sm text-gray-600">
                  {format(new Date(paymentLinkResponse.payment_link.expires_at), 'PPp')}
                </span>
              </div>

              {paymentLinkResponse.payment_link.sent_via.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Sent Via</span>
                  <div className="flex gap-2">
                    {paymentLinkResponse.payment_link.sent_via.map((channel) => (
                      <span
                        key={channel}
                        className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full capitalize"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Link URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Payment Link</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentLinkResponse.payment_link.short_url || paymentLinkResponse.payment_link.url}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyUrl}
                  className={copiedUrl ? "bg-green-50 border-green-200" : ""}
                >
                  {copiedUrl ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(paymentLinkResponse.payment_link.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this link with the customer for online payment
              </p>
            </div>

            {/* Next Steps */}
            {paymentLinkResponse.next_steps && paymentLinkResponse.next_steps.length > 0 && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-xs">
                  <div className="font-medium mb-1">Next Steps:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {paymentLinkResponse.next_steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Close Button */}
            <Button
              type="button"
              onClick={handleClose}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {/* Amount Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-gray-600 text-sm mb-1">Amount to Pay</div>
                <div className="font-bold text-2xl text-gray-900">{formatCurrency(remainingBalance)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Payment link will be created for this amount
                </div>
              </div>
            </div>

            {/* Notification Channels */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Send Payment Link Via</Label>
              {notificationChannels.map((channel) => {
                const Icon = channel.icon
                return (
                  <div
                    key={channel.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      channel.enabled
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                    }`}
                  >
                    <Checkbox
                      id={channel.id}
                      checked={channel.checked}
                      onCheckedChange={(checked) => channel.onChange(!!checked)}
                      disabled={!channel.enabled || isSubmitting}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={channel.id}
                        className="flex items-center gap-2 font-medium text-sm cursor-pointer"
                      >
                        <Icon className="h-4 w-4" />
                        {channel.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        {channel.enabled ? channel.description : channel.disabledReason}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Due Date (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="due-date" className="text-sm font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due Date (Optional)
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-gray-500">
                Default: 7 days from now. Set a custom expiry date for the payment link.
              </p>
            </div>

            {/* Notes (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for the customer (e.g., payment instructions, special offers)..."
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
                <span className="font-medium">Note:</span> Customer will receive a payment link via selected channels.
                Payment status will update automatically when customer completes the payment.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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
                {isSubmitting ? "Creating Link..." : "Create Payment Link"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
